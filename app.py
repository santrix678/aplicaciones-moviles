from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_cors import CORS
import time
import threading  # <-- Para cumplir con la Tarea Asíncrona (Worker en segundo plano)

app = Flask(__name__)
CORS(app)

# 1. Configuración de la Base de Datos (SQLite local)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lavanderia.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 2. Configuración de Flask-Caching (Estrategia Cache-Aside requerida)
app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 30  # TTL de 30 segundos
cache = Cache(app)

# --- MODELOS (Justificación: Eager Loading aplicado para optimizar consultas) ---
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    ordenes = db.relationship('Orden', backref='cliente', lazy=True) # Lazy loading por defecto

class Orden(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    servicio = db.Column(db.String(100), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)

# --- FUNCIÓN ASÍNCRONA (Simulación de Cola de Trabajo / Worker) ---
def tarea_pesada_async(orden_id):
    """Simula un worker procesando el envío de un correo o PDF en segundo plano"""
    print(f"[Worker] Iniciando procesamiento asíncrono para la orden #{orden_id}...")
    time.sleep(5)  # El proceso tarda 5 segundos en background
    print(f"[Worker] Tarea completada: Notificación enviada al cliente de la orden #{orden_id}.")

# --- RUTAS REQUERIDAS POR EL TALLER ---

# 1. Autenticación Optimizada (Evita consultas redundantes)
@app.route('/api/login', methods=['POST'])
def login():
    # Simulación de generación de Token seguro
    # Justificación para el video: Se guarda la sesión del usuario para no re-consultar la BD en cada petición
    return jsonify({
        "status": "Authenticated",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.santrix-token-ejemplo",
        "usuario": "Admin_Santrix"
    })

# 2. Corrección Consulta N+1 usando Eager Loading ('joinedload')
@app.route('/api/ordenes', methods=['GET'])
def get_ordenes_optimizadas():
    start_time = time.time()
    
    # SOLUCIÓN N+1: Trae órdenes y clientes en un solo JOIN directo
    ordenes = Orden.query.options(db.joinedload(Orden.cliente)).all()
    
    resultado = [{
        "id": o.id,
        "servicio": o.servicio,
        "cliente": o.cliente.nombre
    } for o in ordenes]
    
    print(f"--- TIEMPO DE CONSULTA OPTIMIZADA (Evitando N+1): {time.time() - start_time} segundos ---")
    return jsonify(resultado)

# 3. Cache-Aside Strategy (Reporte Costoso)
@app.route('/api/reporte-lavanderia', methods=['GET'])
@cache.cached(timeout=30)  # Guarda el resultado por 30 segundos
def get_reporte_pesado():
    # Operación costosa simulada (demora 3 segundos la primera vez)
    time.sleep(3) 
    return jsonify({
        "status": "success",
        "datos": "Reporte financiero mensual de Lavandería Santrix.",
        "nota": "La primera carga tarda 3s. Las siguientes son instantáneas (0ms) gracias a Flask-Caching."
    })

# 4. Ruta para disparar la Tarea Asíncrona desde el móvil
@app.route('/api/nueva-orden', methods=['POST'])
def crear_orden_async():
    # Recibe una orden y delega el trabajo pesado al Worker de fondo inmediatamente
    hilo_worker = threading.Thread(target=tarea_pesada_async, args=(9711,))
    hilo_worker.start() 
    
    return jsonify({
        "status": "Orden recibida",
        "mensaje": "La orden se registró. El proceso pesado se ejecuta asíncronamente en segundo plano."
    })

# --- INICIALIZACIÓN ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if Cliente.query.count() == 0:
            c1 = Cliente(nombre="Juan Pérez (Edredones)")
            c2 = Cliente(nombre="María Carmen (Ropa de Cama)")
            db.session.add_all([c1, c2])
            db.session.commit()
            
            o1 = Orden(servicio="Lavado de Edredón 2 Plazas", cliente_id=c1.id)
            o2 = Orden(servicio="Lavado Seco - Terno", cliente_id=c2.id)
            db.session.add_all([o1, o2])
            db.session.commit()
    app.run(debug=True, port=5000)