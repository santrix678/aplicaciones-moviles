from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_cors import CORS
from sqlalchemy.orm import joinedload
from werkzeug.security import generate_password_hash, check_password_hash

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

class Usuario(db.Model):

    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default='cliente')

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'username': self.username,
            'rol': self.rol
        }


class Orden(db.Model):

    id = db.Column(db.Integer, primary_key=True)

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

    foto_prenda = db.Column(
        db.Text,
        nullable=True
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey('usuarios.id'),
        nullable=True
    )

    usuario = db.relationship(
        'Usuario',
        backref=db.backref('ordenes', lazy=True)
    )


# ==========================================================
# AUTENTICACIÓN POR TOKEN
# ==========================================================

def obtener_usuario_token():
    autorizacion = request.headers.get('Authorization', '').strip()

    if not autorizacion.startswith('Bearer '):
        return None

    token = autorizacion[7:].strip()

    if not token.startswith('santrix-'):
        return None

    partes = token.split('-', 3)

    if len(partes) != 4:
        return None

    try:
        usuario_id = int(partes[1])
    except (TypeError, ValueError):
        return None

    usuario = db.session.get(Usuario, usuario_id)

    if usuario is None:
        return None

    token_esperado = (
        f'santrix-{usuario.id}-'
        f'{usuario.username}-{usuario.rol}'
    )

    if token != token_esperado:
        return None

    return usuario


def exigir_usuario():
    usuario = obtener_usuario_token()

    if usuario is None:
        return None, (
            jsonify({
                'status': 'error',
                'mensaje': 'Sesión no válida o no autenticada.'
            }),
            401
        )

    return usuario, None


def exigir_administrador():
    usuario, error = exigir_usuario()

    if error:
        return None, error

    if usuario.rol != 'administrador':
        return None, (
            jsonify({
                'status': 'error',
                'mensaje': 'Acceso exclusivo para el administrador.'
            }),
            403
        )

    return usuario, None


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

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():

    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    datos = request.get_json() or {}
    username = str(datos.get('username', '')).strip()
    password = str(datos.get('password', '')).strip()

    if not username or not password:
        return jsonify({
            'status': 'error',
            'mensaje': 'Usuario y contraseña son obligatorios.'
        }), 400

    usuario = Usuario.query.filter_by(username=username).first()

    if usuario is None or not check_password_hash(usuario.password, password):
        print(f'[LOGIN] Acceso rechazado para usuario: {username}')
        return jsonify({
            'status': 'error',
            'mensaje': 'Usuario o contraseña incorrectos.'
        }), 401

    token = f'santrix-{usuario.id}-{usuario.username}-{usuario.rol}'

    print(f'[LOGIN] Usuario autenticado: {usuario.username} | Rol: {usuario.rol}')

    return jsonify({
        'status': 'ok',
        'token': token,
        'usuario': usuario.username,
        'usuario_id': usuario.id,
        'nombre': usuario.nombre,
        'rol': usuario.rol,
        'mensaje': 'Inicio de sesión correcto.'
    }), 200


# ==========================================================
# REGISTRO DE CLIENTES
# ==========================================================

@app.route('/api/registro', methods=['POST', 'OPTIONS'])
def registro():

    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    datos = request.get_json() or {}
    nombre = str(datos.get('nombre', '')).strip()
    username = str(datos.get('username', '')).strip()
    password = str(datos.get('password', '')).strip()

    if not nombre or not username or not password:
        return jsonify({
            'status': 'error',
            'mensaje': 'Nombre, usuario y contraseña son obligatorios.'
        }), 400

    if len(nombre) < 3:
        return jsonify({
            'status': 'error',
            'mensaje': 'El nombre debe tener mínimo 3 caracteres.'
        }), 400

    if len(username) < 3:
        return jsonify({
            'status': 'error',
            'mensaje': 'El usuario debe tener mínimo 3 caracteres.'
        }), 400

    if len(password) < 4:
        return jsonify({
            'status': 'error',
            'mensaje': 'La contraseña debe tener mínimo 4 caracteres.'
        }), 400

    existente = Usuario.query.filter_by(username=username).first()

    if existente:
        return jsonify({
            'status': 'error',
            'mensaje': 'Ese nombre de usuario ya existe.'
        }), 409

    nuevo_usuario = Usuario(
        nombre=nombre,
        username=username,
        password=generate_password_hash(password),
        rol='cliente'
    )

    db.session.add(nuevo_usuario)
    db.session.commit()

    print(f'[REGISTRO] Cliente creado: {nuevo_usuario.username}')

    return jsonify({
        'status': 'ok',
        'mensaje': 'Cuenta creada correctamente.',
        'usuario': nuevo_usuario.to_dict()
    }), 201


# ==========================================================
# CONSULTAR ÓRDENES - READ
# ADMIN: TODAS | CLIENTE: SOLO LAS SUYAS
# ==========================================================

@app.route('/api/ordenes', methods=['GET', 'OPTIONS'])
def get_ordenes_optimizadas():

    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    usuario, error = exigir_usuario()

    if error:
        return error

    consulta = Orden.query.options(
        joinedload(Orden.usuario)
    )

    if usuario.rol == 'cliente':
        consulta = consulta.filter(
            Orden.usuario_id == usuario.id
        )

    ordenes = consulta.order_by(
        Orden.id.desc()
    ).all()

    resultado = []

    for orden in ordenes:
        resultado.append({
            'id': orden.id,
            'servicio': orden.servicio,
            'direccion': orden.direccion,
            'latitud': orden.latitud,
            'longitud': orden.longitud,
            'foto_prenda': orden.foto_prenda,
            'tiene_foto': bool(orden.foto_prenda),
            'usuario_id': orden.usuario_id,
            'cliente': (
                orden.usuario.nombre
                if orden.usuario
                else 'Orden anterior'
            )
        })

    return jsonify(resultado), 200


# ==========================================================
# CREAR NUEVA ORDEN - CREATE
# ==========================================================

@app.route('/api/pedidos', methods=['POST', 'OPTIONS'])
@app.route('/api/nueva-orden', methods=['POST', 'OPTIONS'])
def crear_orden_async():

    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    usuario, error = exigir_usuario()

    if error:
        return error

    datos = request.get_json() or {}

    direccion_nom = str(
        datos.get('direccion', 'Recogida local')
    ).strip() or 'Recogida local'

    servicio = str(
        datos.get(
            'servicio',
            'Lavado Express de Prenda'
        )
    ).strip() or 'Lavado Express de Prenda'

    lat = datos.get('latitud')
    lng = datos.get('longitud')
    foto = datos.get('foto_prenda')

    nueva_orden = Orden(
        servicio=servicio,
        direccion=direccion_nom,
        latitud=lat,
        longitud=lng,
        foto_prenda=foto,
        usuario_id=usuario.id
    )

    db.session.add(nueva_orden)
    db.session.commit()

    invalidar_cache()

    print(
        f"[DATABASE] Orden #{nueva_orden.id} "
        f"creada por {usuario.username}."
    )

    hilo_worker = threading.Thread(
        target=tarea_pesada_async,
        args=(nueva_orden.id, direccion_nom),
        daemon=True
    )
    hilo_worker.start()

    return jsonify({
        'status': 'success',
        'id': nueva_orden.id,
        'mensaje': (
            f'¡Orden #{nueva_orden.id} '
            f'registrada exitosamente en Santrix!'
        ),
        'datos': {
            'direccion': direccion_nom,
            'servicio': servicio,
            'latitud': lat,
            'longitud': lng,
            'foto_recibida': bool(foto),
            'usuario_id': usuario.id
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

    usuario, error = exigir_administrador()

    if error:
        return error


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

    usuario, error = exigir_administrador()

    if error:
        return error


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

    usuario, error = exigir_administrador()

    if error:
        return error

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
# MIGRACIÓN SIMPLE PARA LA BASE EXISTENTE
# ==========================================================

def preparar_base_datos():

    db.create_all()

    columnas = db.session.execute(
        db.text("PRAGMA table_info('orden')")
    ).fetchall()

    nombres_columnas = {
        columna[1]
        for columna in columnas
    }

    if 'usuario_id' not in nombres_columnas:

        db.session.execute(
            db.text(
                'ALTER TABLE orden '
                'ADD COLUMN usuario_id INTEGER'
            )
        )

        db.session.commit()

        print(
            '[DATABASE] Columna usuario_id agregada a orden.'
        )


# ==========================================================
# INICIAR SERVIDOR
# ==========================================================

if __name__ == '__main__':

    with app.app_context():

        preparar_base_datos()

        administrador = Usuario.query.filter_by(
            username='santrix'
        ).first()

        if administrador is None:

            administrador = Usuario(
                nombre='Administrador Santrix',
                username='santrix',
                password=generate_password_hash('12345'),
                rol='administrador'
            )

            db.session.add(administrador)
            db.session.commit()

            print('[DATABASE] Administrador creado.')

        else:

            print('[DATABASE] Administrador existente.')

    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
