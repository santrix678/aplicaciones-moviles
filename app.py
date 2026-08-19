from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_cors import CORS
import time
import threading  # Para tareas asíncronas en segundo plano

app = Flask(__name__)
# Permitir peticiones CORS desde cualquier origen para evitar bloqueos con Ionic
CORS(app)

# 1. Configuración de la Base de Datos (SQLite local)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lavanderia.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 2. Configuración de Flask-Caching (Estrategia Cache-Aside)
app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 30  # TTL de 30 segundos
cache = Cache(app)


# --- MODELOS (Eager Loading aplicado para optimizar consultas) ---
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    ordenes = db.relationship('Orden', backref='cliente', lazy=True)


class Orden(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    servicio = db.Column(db.String(100), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)


# --- FUNCIÓN ASÍNCRONA (Worker en segundo plano) ---
def tarea_pesada_async(orden_id, servicio):
    """Simula un worker procesando el envío de una notificación o PDF en segundo plano"""
    print(f"\n[WORKER ASÍNCRONO] Iniciando procesamiento para la orden #{orden_id} ({servicio})...")
    time.sleep(5)  # Simula proceso pesado de 5 segundos
    print(f"[WORKER ASÍNCRONO] Tarea completada: Notificación enviada al cliente para la orden #{orden_id}.\n")


# --- RUTAS DE LA API ---

# 1. Autenticación Optimizada
@app.route('/api/login', methods=['POST'])
def login():
    datos = request.get_json() or {}
    username = datos.get('username', 'Usuario')
    return jsonify({
        "status": "Authenticated",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.santrix-token-ejemplo",
        "usuario": username
    }), 200


# 2. Solución al problema N+1 usando Eager Loading ('joinedload')
@app.route('/api/ordenes', methods=['GET'])
def get_ordenes_optimizadas():
    start_time = time.time()
    
    # SOLUCIÓN N+1: Carga órdenes y clientes en un solo JOIN SQL
    ordenes = Orden.query.options(db.joinedload(Orden.cliente)).all()
    
    resultado = [{
        "id": o.id,
        "servicio": o.servicio,
        "cliente": o.cliente.nombre
    } for o in ordenes]
    
    duracion = time.time() - start_time
    print(f"[LOG SQL] Consulta optimizada ejecutada en {duracion:.5f} segundos (1 solo JOIN).")
    return jsonify(resultado), 200


# 3. Cache-Aside Strategy (Reporte Costoso)
@app.route('/api/reporte-lavanderia', methods=['GET'])
@cache.cached(timeout=30)  # Almacena en memoria RAM por 30 segundos
def get_reporte_pesado():
    print("\n[CACHE MISS] Generando reporte pesado desde la base de datos (demora 3s)...")
    time.sleep(3) 
    return jsonify({
        "status": "success",
        "datos": "Reporte financiero mensual de Lavandería Santrix.",
        "nota": "La primera carga tarda 3s. Las siguientes respuestas son instantáneas (0ms) desde caché."
    }), 200


# 4. Creación de Orden con Tarea Asíncrona
@app.route('/api/nueva-orden', methods=['POST'])
def crear_orden_async():
    datos = request.get_json() or {}
    servicio_nom = datos.get('servicio', 'Servicio General')
    cliente_id = datos.get('cliente_id', 1)

    # 1. Almacenar en Base de Datos
    nueva_orden = Orden(servicio=servicio_nom, cliente_id=cliente_id)
    db.session.add(nueva_orden)
    db.session.commit()

    # 2. Delegar la tarea pesada al hilo secundario
    hilo_worker = threading.Thread(target=tarea_pesada_async, args=(nueva_orden.id, servicio_nom))
    hilo_worker.start()

    # 3. Responder de inmediato al cliente sin esperar los 5 segundos
    return jsonify({
        "status": "Orden recibida",
        "id": nueva_orden.id,
        "mensaje": f"La orden #{nueva_orden.id} se creó. Notificación en proceso en segundo plano."
    }), 202


# --- INICIALIZACIÓN Y CONFIGURACIÓN DEL HOST ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Insertar datos iniciales si la base de datos está vacía
        if Cliente.query.count() == 0:
            c1 = Cliente(nombre="Juan Pérez (Edredones)")
            c2 = Cliente(nombre="María Carmen (Ropa de Cama)")
            db.session.add_all([c1, c2])
            db.session.commit()
            
            o1 = Orden(servicio="Lavado de Edredón 2 Plazas", cliente_id=c1.id)
            o2 = Orden(servicio="Lavado Seco - Terno", cliente_id=c2.id)
            db.session.add_all([o1, o2])
            db.session.commit()
            print("[DATABASE] Base de datos 'lavanderia.db' inicializada con éxito.")

    # CORRECCIÓN CLAVE: host='0.0.0.0' soluciona el error ERR_CONNECTION_REFUSED
    app.run(host='0.0.0.0', port=5000, debug=True)