from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_cors import CORS
from sqlalchemy.orm import joinedload
import time
import threading

app = Flask(__name__)

# Habilitar CORS para todas las rutas y orígenes
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuración SQLite local
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lavanderia.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Permite hasta 16MB

db = SQLAlchemy(app)

# Cache-Aside
app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 30
cache = Cache(app)

# Modelos
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    ordenes = db.relationship('Orden', backref='cliente', lazy=True)

class Orden(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    servicio = db.Column(db.String(100), nullable=False)
    direccion = db.Column(db.String(200), nullable=True)
    latitud = db.Column(db.Float, nullable=True)
    longitud = db.Column(db.Float, nullable=True)
    foto_prenda = db.Column(db.Text, nullable=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)

def tarea_pesada_async(orden_id, direccion):
    print(f"\n[WORKER ASÍNCRONO] Procesando notificación para Orden #{orden_id} (Dirección: {direccion})...")
    time.sleep(3)
    print(f"[WORKER ASÍNCRONO] Tarea completada: Notificación enviada al motorizado de Santrix para la Orden #{orden_id}.\n")

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    return jsonify({
        "status": "Authenticated", 
        "token": "santrix-token-ejemplo", 
        "usuario": "Santiago"
    }), 200

@app.route('/api/ordenes', methods=['GET'])
def get_ordenes_optimizadas():
    ordenes = Orden.query.options(joinedload(Orden.cliente)).all()
    resultado = [
        {
            "id": o.id, 
            "servicio": o.servicio, 
            "direccion": o.direccion, 
            "cliente": o.cliente.nombre
        } for o in ordenes
    ]
    return jsonify(resultado), 200

@app.route('/api/pedidos', methods=['POST', 'OPTIONS'])
@app.route('/api/nueva-orden', methods=['POST', 'OPTIONS'])
def crear_orden_async():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    datos = request.get_json() or {}
    
    direccion_nom = datos.get('direccion', 'Recogida local')
    lat = datos.get('latitud')
    lng = datos.get('longitud')
    foto = datos.get('foto_prenda')

    nueva_orden = Orden(
        servicio="Lavado Express de Prenda",
        direccion=direccion_nom,
        latitud=lat,
        longitud=lng,
        foto_prenda=foto,
        cliente_id=1
    )
    db.session.add(nueva_orden)
    db.session.commit()

    hilo_worker = threading.Thread(target=tarea_pesada_async, args=(nueva_orden.id, direccion_nom))
    hilo_worker.start()

    return jsonify({
        "status": "success",
        "id": nueva_orden.id,
        "mensaje": f"¡Orden #{nueva_orden.id} registrada exitosamente en Santrix!"
    }), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if Cliente.query.count() == 0:
            c1 = Cliente(nombre="Santiago Ríos")
            db.session.add(c1)
            db.session.commit()
            print("[DATABASE] Base de datos inicializada correctamente.")

    # Servidor activo escudriñando peticiones remotas en el puerto 5001
    app.run(host='0.0.0.0', port=5001, debug=True)