from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
import time

app = Flask(__name__)

# 1. Configuración de la Base de Datos (Simulada o MySQL)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lavanderia.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 2. Configuración de Flask-Caching (Usa memoria local para el taller)
app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 60  # Almacena los datos por 60 segundos
cache = Cache(app)

# --- MODELOS DE EJEMPLO (Lavandería) ---
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    # Relación con las órdenes de lavado
    ordenes = db.relationship('Orden', backref='cliente', lazy=True)

class Orden(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    servicio = db.Column(db.String(100), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)

# --- RUTAS REQUERIDAS EN EL TALLER ---

# Ruta 1: Optimización de Consultas N+1 usando 'joinedload'
@app.route('/api/ordenes-optimizadas', methods=['GET'])
def get_ordenes_optimizadas():
    # Evita el problema N+1 cargando los clientes en una sola consulta conjunta
    start_time = time.time()
    
    # Aquí se aplica la optimización con un join cargado previamente
    ordenes = Orden.query.options(db.joinedload(Orden.cliente)).all()
    
    resultado = [{
        "id": o.id,
        "servicio": o.servicio,
        "cliente": o.cliente.nombre
    } for o in ordenes]
    
    print(f"Tiempo de ejecución sin caché: {time.time() - start_time} segundos")
    return jsonify(resultado)

# Ruta 2: Implementación de Sistema de Caché con Flask-Caching
@app.route('/api/reporte-lavanderia', methods=['GET'])
@cache.cached(timeout=30)  # Guarda el resultado en caché por 30 segundos
def get_reporte_pesado():
    # Simulamos una consulta muy pesada o un reporte complejo de la lavandería
    time.sleep(3) 
    
    reporte = {
        "status": "success",
        "datos": "Reporte de órdenes del mes generado correctamente.",
        "nota": "La primera carga tarda 3 segundos, las siguientes son instantáneas gracias a la caché."
    }
    return jsonify(reporte)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crea las tablas si no existen
    app.run(debug=True, port=5000)