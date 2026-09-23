from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_cors import CORS
from sqlalchemy.orm import joinedload
import time
import threading


# ==========================================================
# APLICACIÓN FLASK
# ==========================================================

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

# Permite recibir fotografías en Base64
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

db = SQLAlchemy(app)


# ==========================================================
# CONFIGURACIÓN DE CACHÉ
# ==========================================================

app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 30

cache = Cache(app)

# Clave utilizada por el reporte financiero
CLAVE_CACHE_REPORTE = 'reporte_financiero_santrix'


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

    latitud = db.Column(
        db.Float,
        nullable=True
    )

    longitud = db.Column(
        db.Float,
        nullable=True
    )

    # La fotografía se guarda en formato Base64
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
# FUNCIÓN PARA INVALIDAR CACHÉ
# ==========================================================

def invalidar_cache():

    # Eliminar caché de las órdenes
    cache.delete_memoized(
        get_ordenes_optimizadas
    )

    # Eliminar caché del reporte financiero
    cache.delete(
        CLAVE_CACHE_REPORTE
    )

    # Como /api/ordenes usa @cache.cached,
    # limpiamos también el caché general.
    cache.clear()

    print(
        "[CACHE] Caché invalidado correctamente."
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

    # Simulación de tarea pesada
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

    datos = request.get_json() or {}

    username = str(datos.get('username', '')).strip()
    password = str(datos.get('password', '')).strip()

    if not username or not password:
        return jsonify({
            "status": "error",
            "mensaje": "Usuario y contraseña son obligatorios."
        }), 400

    USUARIO_CORRECTO = "santrix"
    CLAVE_CORRECTA = "12345"

    if username != USUARIO_CORRECTO or password != CLAVE_CORRECTA:
        print(f"[LOGIN] Acceso rechazado para usuario: {username}")
        return jsonify({
            "status": "error",
            "mensaje": "Usuario o contraseña incorrectos."
        }), 401

    print(f"[LOGIN] Usuario autenticado correctamente: {username}")

    return jsonify({
        "status": "Authenticated",
        "token": "santrix-token-ejemplo",
        "usuario": username,
        "mensaje": "Inicio de sesión correcto."
    }), 200


# ==========================================================
# CONSULTAR ÓRDENES - READ
# OPTIMIZACIÓN N+1 + CACHÉ
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

    # joinedload evita el problema N+1
    ordenes = Orden.query.options(
        joinedload(Orden.cliente)
    ).all()

    resultado = [

        {
            "id": orden.id,

            "servicio":
                orden.servicio,

            "direccion":
                orden.direccion,

            "latitud":
                orden.latitud,

            "longitud":
                orden.longitud,

            # IMPORTANTE:
            # Enviamos la fotografía completa a Ionic
            "foto_prenda":
                orden.foto_prenda,

            # Indicador adicional
            "tiene_foto":
                bool(orden.foto_prenda),

            "cliente": (
                orden.cliente.nombre
                if orden.cliente
                else "Sin cliente"
            )
        }

        for orden in ordenes
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

        direccion_nom = (
            'Recogida local'
        )

    servicio = str(
        datos.get(
            'servicio',
            'Lavado Express de Prenda'
        )
    ).strip()

    if not servicio:

        servicio = (
            'Lavado Express de Prenda'
        )

    lat = datos.get(
        'latitud'
    )

    lng = datos.get(
        'longitud'
    )

    # Fotografía enviada desde Ionic
    foto = datos.get(
        'foto_prenda'
    )

    nueva_orden = Orden(

        servicio=servicio,

        direccion=direccion_nom,

        latitud=lat,

        longitud=lng,

        foto_prenda=foto,

        cliente_id=1
    )

    db.session.add(
        nueva_orden
    )

    db.session.commit()

    # Los datos cambiaron
    invalidar_cache()

    print(
        f"[DATABASE] Orden #{nueva_orden.id} "
        f"guardada correctamente."
    )

    print(
        f"[UBICACIÓN] Latitud: {lat} | "
        f"Longitud: {lng}"
    )

    if foto:

        print(
            "[CÁMARA] Fotografía recibida "
            "correctamente."
        )

    else:

        print(
            "[CÁMARA] Orden registrada "
            "sin fotografía."
        )

    # ======================================================
    # PROCESAMIENTO ASÍNCRONO
    # ======================================================

    hilo_worker = threading.Thread(

        target=tarea_pesada_async,

        args=(
            nueva_orden.id,
            direccion_nom
        ),

        daemon=True
    )

    hilo_worker.start()

    return jsonify({

        "status":
            "success",

        "id":
            nueva_orden.id,

        "mensaje":
            f"¡Orden #{nueva_orden.id} "
            f"registrada exitosamente en Santrix!",

        "datos": {

            "direccion":
                direccion_nom,

            "servicio":
                servicio,

            "latitud":
                lat,

            "longitud":
                lng,

            "foto_recibida":
                bool(foto)
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
            "mensaje":
                "La orden no existe."
        }), 404

    datos = request.get_json() or {}

    if not datos:

        return jsonify({
            "status": "error",
            "mensaje":
                "No se enviaron datos para actualizar."
        }), 400


    # ======================================================
    # ACTUALIZAR SERVICIO
    # ======================================================

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


    # ======================================================
    # ACTUALIZAR DIRECCIÓN
    # ======================================================

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


    # ======================================================
    # ACTUALIZAR UBICACIÓN
    # ======================================================

    if 'latitud' in datos:

        orden.latitud = (
            datos['latitud']
        )

    if 'longitud' in datos:

        orden.longitud = (
            datos['longitud']
        )


    # ======================================================
    # ACTUALIZAR FOTOGRAFÍA
    # ======================================================

    if 'foto_prenda' in datos:

        orden.foto_prenda = (
            datos['foto_prenda']
        )


    db.session.commit()

    invalidar_cache()

    print(
        f"[DATABASE] Orden #{orden.id} "
        f"actualizada correctamente."
    )

    return jsonify({

        "status":
            "success",

        "mensaje":
            f"Orden #{orden.id} "
            f"actualizada correctamente.",

        "orden": {

            "id":
                orden.id,

            "servicio":
                orden.servicio,

            "direccion":
                orden.direccion,

            "latitud":
                orden.latitud,

            "longitud":
                orden.longitud,

            "foto_prenda":
                orden.foto_prenda,

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
            "mensaje":
                "La orden no existe."
        }), 404

    db.session.delete(
        orden
    )

    db.session.commit()

    invalidar_cache()

    print(
        f"[DATABASE] Orden #{orden_id} "
        f"eliminada correctamente."
    )

    return jsonify({

        "status":
            "success",

        "mensaje":
            f"Orden #{orden_id} "
            f"eliminada correctamente."

    }), 200


# ==========================================================
# REPORTE FINANCIERO
# ESTRATEGIA CACHE-ASIDE MANUAL
# ==========================================================

@app.route(
    '/api/reporte-lavanderia',
    methods=['GET']
)
def reporte_lavanderia():

    # ======================================================
    # PASO 1 - BUSCAR EN CACHÉ
    # ======================================================

    reporte_cache = cache.get(
        CLAVE_CACHE_REPORTE
    )

    if reporte_cache is not None:

        print(
            "[CACHE HIT] "
            "Reporte financiero obtenido desde caché."
        )

        return jsonify({

            "status":
                "success",

            "reporte":
                reporte_cache,

            "cache": {

                "estrategia":
                    "Cache-Aside",

                "duracion_segundos":
                    30,

                "origen":
                    "cache"
            }

        }), 200


    # ======================================================
    # PASO 2 - CACHE MISS
    # ======================================================

    print(
        "[CACHE MISS] "
        "Generando reporte financiero "
        "desde la base de datos."
    )

    # Simulación de consulta pesada
    time.sleep(2)


    # ======================================================
    # CONSULTAR BASE DE DATOS
    # ======================================================

    ordenes = Orden.query.all()

    total_ordenes = len(
        ordenes
    )

    precio_por_orden = 5.00

    ingresos_estimados = (
        total_ordenes
        * precio_por_orden
    )


    # ======================================================
    # CONTAR ÓRDENES CON FOTOGRAFÍA
    # ======================================================

    ordenes_con_foto = sum(

        1

        for orden in ordenes

        if orden.foto_prenda
    )


    # ======================================================
    # CONTAR ÓRDENES CON UBICACIÓN
    # ======================================================

    ordenes_con_ubicacion = sum(

        1

        for orden in ordenes

        if (
            orden.latitud is not None
            and
            orden.longitud is not None
        )
    )


    # ======================================================
    # CONSTRUIR REPORTE
    # ======================================================

    reporte = {

        "total_ordenes":
            total_ordenes,

        "precio_por_orden":
            precio_por_orden,

        "ingresos_estimados":
            ingresos_estimados,

        "ordenes_con_foto":
            ordenes_con_foto,

        "ordenes_con_ubicacion":
            ordenes_con_ubicacion
    }


    # ======================================================
    # PASO 3 - GUARDAR EN CACHÉ
    # ======================================================

    cache.set(

        CLAVE_CACHE_REPORTE,

        reporte,

        timeout=30
    )

    print(
        "[CACHE SET] "
        "Reporte financiero guardado "
        "en caché durante 30 segundos."
    )


    # ======================================================
    # RESPUESTA
    # ======================================================

    return jsonify({

        "status":
            "success",

        "reporte":
            reporte,

        "cache": {

            "estrategia":
                "Cache-Aside",

            "duracion_segundos":
                30,

            "origen":
                "base_de_datos"
        }

    }), 200


# ==========================================================
# INICIAR SERVIDOR
# ==========================================================

if __name__ == '__main__':

    with app.app_context():

        db.create_all()

        # Crear cliente inicial si todavía no existe
        if Cliente.query.count() == 0:

            c1 = Cliente(
                nombre="Santiago Ríos"
            )

            db.session.add(
                c1
            )

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