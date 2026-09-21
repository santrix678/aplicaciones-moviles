from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_cors import CORS
from sqlalchemy.orm import joinedload
import time
import threading


app = Flask(__name__)


# ==========================================================
# CONFIGURACIÓN CORS
# ==========================================================

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)


# ==========================================================
# CONFIGURACIÓN DE BASE DE DATOS
# ==========================================================

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lavanderia.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

db = SQLAlchemy(app)


# ==========================================================
# CONFIGURACIÓN DE CACHÉ
# ==========================================================

app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 30

cache = Cache(app)


# ==========================================================
# MODELOS
# ==========================================================

class Cliente(db.Model):
    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(
        db.String(100),
        nullable=False
    )

    ordenes = db.relationship(
        'Orden',
        backref='cliente',
        lazy=True
    )


class Orden(db.Model):
    id = db.Column(
        db.Integer,
        primary_key=True
    )

    servicio = db.Column(
        db.String(100),
        nullable=False
    )

    direccion = db.Column(
        db.String(200),
        nullable=True
    )

    # Ubicación opcional
    latitud = db.Column(
        db.Float,
        nullable=True
    )

    longitud = db.Column(
        db.Float,
        nullable=True
    )

    # Fotografía opcional
    foto_prenda = db.Column(
        db.Text,
        nullable=True
    )

    cliente_id = db.Column(
        db.Integer,
        db.ForeignKey('cliente.id'),
        nullable=False
    )


# ==========================================================
# TAREA ASÍNCRONA
# ==========================================================

def tarea_pesada_async(orden_id, direccion):

    print(
        f"\n[WORKER ASÍNCRONO] "
        f"Procesando notificación para Orden #{orden_id} "
        f"(Dirección: {direccion})..."
    )

    time.sleep(3)

    print(
        f"[WORKER ASÍNCRONO] "
        f"Tarea completada: Notificación enviada "
        f"al motorizado de Santrix para la Orden "
        f"#{orden_id}.\n"
    )


# ==========================================================
# LOGIN
# ==========================================================

@app.route(
    '/api/login',
    methods=['POST', 'OPTIONS']
)
def login():

    if request.method == 'OPTIONS':
        return jsonify({
            'status': 'ok'
        }), 200

    return jsonify({
        "status": "Authenticated",
        "token": "santrix-token-ejemplo",
        "usuario": "Santiago"
    }), 200


# ==========================================================
# CONSULTAR ÓRDENES - READ
# OPTIMIZACIÓN:
# - joinedload reduce consultas adicionales
# - cache conserva el resultado durante 30 segundos
# ==========================================================

@app.route(
    '/api/ordenes',
    methods=['GET']
)
@cache.cached(timeout=30)
def get_ordenes_optimizadas():

    print(
        "[CACHE] Consultando órdenes directamente "
        "desde la base de datos."
    )

    ordenes = Orden.query.options(
        joinedload(Orden.cliente)
    ).all()

    resultado = [
        {
            "id": o.id,
            "servicio": o.servicio,
            "direccion": o.direccion,
            "latitud": o.latitud,
            "longitud": o.longitud,
            "tiene_foto": bool(o.foto_prenda),
            "cliente": o.cliente.nombre
        }
        for o in ordenes
    ]

    return jsonify(resultado), 200


# ==========================================================
# CREAR NUEVA ORDEN - CREATE
# ==========================================================

@app.route(
    '/api/pedidos',
    methods=['POST', 'OPTIONS']
)
@app.route(
    '/api/nueva-orden',
    methods=['POST', 'OPTIONS']
)
def crear_orden_async():

    if request.method == 'OPTIONS':
        return jsonify({
            'status': 'ok'
        }), 200

    datos = request.get_json() or {}

    direccion_nom = str(
        datos.get(
            'direccion',
            'Recogida local'
        )
    ).strip()

    if not direccion_nom:
        direccion_nom = 'Recogida local'

    # Ubicación enviada desde Capacitor Geolocation
    lat = datos.get('latitud')
    lng = datos.get('longitud')

    # Fotografía enviada desde Capacitor Camera
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

    # Limpiar caché porque los datos cambiaron
    cache.delete_memoized(
        get_ordenes_optimizadas
    )

    print(
        f"[DATABASE] Orden #{nueva_orden.id} "
        f"guardada correctamente."
    )

    print(
        "[CACHE] Caché de órdenes invalidado."
    )

    print(
        f"[UBICACIÓN] Latitud: {lat} | "
        f"Longitud: {lng}"
    )

    if foto:
        print(
            "[CÁMARA] Fotografía recibida correctamente."
        )
    else:
        print(
            "[CÁMARA] Orden registrada sin fotografía."
        )

    hilo_worker = threading.Thread(
        target=tarea_pesada_async,
        args=(
            nueva_orden.id,
            direccion_nom
        )
    )

    hilo_worker.start()

    return jsonify({
        "status": "success",
        "id": nueva_orden.id,
        "mensaje":
            f"¡Orden #{nueva_orden.id} "
            f"registrada exitosamente en Santrix!",
        "datos": {
            "direccion": direccion_nom,
            "latitud": lat,
            "longitud": lng,
            "foto_recibida": bool(foto)
        }
    }), 201


# ==========================================================
# ACTUALIZAR ORDEN - UPDATE
# ==========================================================

@app.route(
    '/api/ordenes/<int:orden_id>',
    methods=['PUT', 'OPTIONS']
)
def actualizar_orden(orden_id):

    if request.method == 'OPTIONS':
        return jsonify({
            'status': 'ok'
        }), 200

    orden = db.session.get(
        Orden,
        orden_id
    )

    if orden is None:
        return jsonify({
            "status": "error",
            "mensaje": "La orden no existe."
        }), 404

    datos = request.get_json() or {}

    if not datos:
        return jsonify({
            "status": "error",
            "mensaje":
                "No se enviaron datos para actualizar."
        }), 400

    if 'servicio' in datos:

        servicio = str(
            datos['servicio']
        ).strip()

        if not servicio:
            return jsonify({
                "status": "error",
                "mensaje":
                    "El servicio no puede estar vacío."
            }), 400

        orden.servicio = servicio

    if 'direccion' in datos:

        direccion = str(
            datos['direccion']
        ).strip()

        if not direccion:
            return jsonify({
                "status": "error",
                "mensaje":
                    "La dirección no puede estar vacía."
            }), 400

        orden.direccion = direccion

    if 'latitud' in datos:
        orden.latitud = datos['latitud']

    if 'longitud' in datos:
        orden.longitud = datos['longitud']

    if 'foto_prenda' in datos:
        orden.foto_prenda = datos['foto_prenda']

    db.session.commit()

    # Limpiar caché porque los datos cambiaron
    cache.delete_memoized(
        get_ordenes_optimizadas
    )

    print(
        f"[DATABASE] Orden #{orden.id} "
        f"actualizada correctamente."
    )

    print(
        "[CACHE] Caché de órdenes invalidado."
    )

    return jsonify({
        "status": "success",
        "mensaje":
            f"Orden #{orden.id} actualizada correctamente.",
        "orden": {
            "id": orden.id,
            "servicio": orden.servicio,
            "direccion": orden.direccion,
            "latitud": orden.latitud,
            "longitud": orden.longitud,
            "tiene_foto":
                bool(orden.foto_prenda)
        }
    }), 200


# ==========================================================
# ELIMINAR ORDEN - DELETE
# ==========================================================

@app.route(
    '/api/ordenes/<int:orden_id>',
    methods=['DELETE', 'OPTIONS']
)
def eliminar_orden(orden_id):

    if request.method == 'OPTIONS':
        return jsonify({
            'status': 'ok'
        }), 200

    orden = db.session.get(
        Orden,
        orden_id
    )

    if orden is None:
        return jsonify({
            "status": "error",
            "mensaje": "La orden no existe."
        }), 404

    db.session.delete(orden)
    db.session.commit()

    # Limpiar caché porque los datos cambiaron
    cache.delete_memoized(
        get_ordenes_optimizadas
    )

    print(
        f"[DATABASE] Orden #{orden_id} "
        f"eliminada correctamente."
    )

    print(
        "[CACHE] Caché de órdenes invalidado."
    )

    return jsonify({
        "status": "success",
        "mensaje":
            f"Orden #{orden_id} eliminada correctamente."
    }), 200


# ==========================================================
# INICIAR SERVIDOR
# ==========================================================

if __name__ == '__main__':

    with app.app_context():

        db.create_all()

        if Cliente.query.count() == 0:

            c1 = Cliente(
                nombre="Santiago Ríos"
            )

            db.session.add(c1)
            db.session.commit()

            print(
                "[DATABASE] Base de datos "
                "inicializada correctamente."
            )

    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
