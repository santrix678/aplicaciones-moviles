# 🧺 LAVANDERÍA SANTRIX - Sistema Móvil e Integración Backend

Proyecto académico desarrollado para la asignatura **Desarrollo de Aplicaciones Móviles** de la **Universidad Estatal Amazónica (UEA)**.

Lavandería Santrix es una aplicación móvil híbrida desarrollada con **Ionic + Angular**, conectada a un backend desarrollado con **Flask (Python)** y una base de datos **SQLite**.

El sistema permite gestionar usuarios y órdenes de lavandería, utilizando autenticación, autorización por roles, operaciones CRUD, cámara, geolocalización, procesamiento asíncrono, optimización de consultas y almacenamiento en caché.

---

## 🚀 Descripción del proyecto

La aplicación permite gestionar el proceso de solicitud y administración de servicios de lavandería desde un dispositivo móvil.

El sistema implementa una arquitectura cliente-servidor:

```text
Aplicación móvil Ionic/Angular
            │
            │ HTTP / API REST
            ▼
      Backend Flask
            │
            ▼
       SQLAlchemy
            │
            ▼
         SQLite
```

---

## 🛠️ Tecnologías utilizadas

### Frontend

- Ionic Framework
- Angular
- Angular Standalone Components
- TypeScript
- HTML
- SCSS
- Capacitor

### Backend

- Python
- Flask
- Flask-SQLAlchemy
- Flask-Caching
- Flask-CORS
- Werkzeug
- Threading

### Base de datos

- SQLite
- SQLAlchemy ORM

---

# 👥 Usuarios y roles

La aplicación maneja dos roles principales:

## 👤 Cliente

El cliente puede:

- Crear una cuenta.
- Iniciar sesión.
- Registrar una orden.
- Tomar una fotografía de la prenda.
- Obtener su ubicación GPS.
- Registrar la dirección de recogida.
- Consultar información disponible según sus permisos.

## 👨‍💼 Administrador

El administrador puede:

- Iniciar sesión.
- Consultar las órdenes.
- Editar órdenes.
- Eliminar órdenes.
- Consultar el reporte financiero.
- Administrar información del sistema.

---

# 🔐 Autenticación y autorización

El backend implementa autenticación mediante token.

Al iniciar sesión correctamente, el servidor genera un token relacionado con:

- ID del usuario.
- Nombre de usuario.
- Rol.

La aplicación almacena el token y lo envía en las solicitudes protegidas mediante:

```text
Authorization: Bearer <token>
```

El backend valida el token antes de permitir el acceso.

También se implementa autorización basada en roles para restringir determinadas operaciones al administrador.

---

# 📦 CRUD de órdenes

El sistema implementa las cuatro operaciones principales de gestión de información.

## CREATE

Registro de nuevas órdenes de lavandería.

## READ

Consulta de las órdenes almacenadas.

## UPDATE

Actualización de información de una orden.

## DELETE

Eliminación de órdenes con confirmación previa.

Las operaciones protegidas requieren autenticación y los permisos correspondientes.

---

# 📷 Cámara

La aplicación utiliza las funcionalidades nativas del dispositivo para obtener una fotografía de la prenda.

La fotografía puede asociarse a una orden y enviarse al backend junto con la demás información.

---

# 📍 Geolocalización

La aplicación permite obtener las coordenadas GPS del dispositivo.

Se utilizan datos como:

```text
Latitud
Longitud
Dirección de recogida
```

La aplicación puede obtener una dirección relacionada con la ubicación y también permite trabajar con la dirección de recogida correspondiente.

---

# 🌐 API REST

El backend Flask proporciona servicios API para la comunicación con la aplicación móvil.

Entre los endpoints implementados se encuentran rutas para:

```text
POST    /api/login
POST    /api/registro
GET     /api/ordenes
POST    /api/pedidos
PUT     /api/ordenes/<id>
DELETE  /api/ordenes/<id>
GET     /api/reporte-lavanderia
```

Los endpoints protegidos utilizan autenticación mediante token.

---

# ⚡ Optimizaciones e implementaciones clave

## 1. Optimización del problema N+1

Se utiliza **Eager Loading** mediante `joinedload` para reducir consultas repetitivas relacionadas con las entidades del sistema.

Esto permite recuperar información relacionada utilizando consultas optimizadas.

---

## 2. Procesamiento asíncrono

El backend utiliza el módulo:

```python
threading
```

para ejecutar determinadas tareas en segundo plano.

Por ejemplo, después de registrar una orden puede ejecutarse una tarea simulada de notificación sin bloquear la respuesta principal enviada a la aplicación móvil.

Esto mejora la experiencia del usuario evitando que determinadas tareas retrasen innecesariamente la respuesta del servidor.

---

## 3. Cache-Aside

El proyecto implementa almacenamiento temporal utilizando:

```text
Flask-Caching
SimpleCache
```

Se utiliza una estrategia **Cache-Aside** para reducir consultas repetitivas.

El reporte financiero utiliza un TTL de aproximadamente:

```text
30 segundos
```

Cuando se realizan operaciones que modifican información relevante, la caché puede invalidarse para evitar entregar información desactualizada.

---

# 📊 Reporte financiero

La aplicación incorpora un reporte financiero accesible según los permisos del usuario.

El reporte permite visualizar información como:

- Total de órdenes.
- Precio por orden.
- Ingresos estimados.
- Órdenes con fotografía.
- Órdenes con ubicación.
- Tiempo de respuesta.
- Estado o estrategia de caché.

Esto permite demostrar tanto la consulta de información como la optimización del backend.

---

# 🗄️ Base de datos

El proyecto utiliza **SQLite** como base de datos.

La gestión de la información se realiza mediante **SQLAlchemy ORM**.

El sistema maneja entidades relacionadas con usuarios y órdenes, utilizando:

- Claves primarias.
- Relaciones.
- Claves foráneas.
- Restricciones.
- Asociación de órdenes con usuarios.

---

# ⚠️ Manejo de errores y validaciones

La aplicación incorpora validaciones tanto en el frontend como en el backend.

Entre ellas:

- Validación de usuario y contraseña.
- Validación de formularios.
- Comprobación de sesión.
- Validación del token.
- Control de permisos.
- Comprobación de ubicación.
- Manejo de errores HTTP.
- Mensajes informativos para el usuario.

El backend utiliza códigos HTTP como:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

según el resultado de las operaciones.

---

# 📂 Estructura general

```text
aplicaciones-moviles/
│
├── src/
│   └── app/
│       ├── pages/
│       │   ├── login/
│       │   └── registro/
│       │
│       ├── services/
│       │   ├── auth.ts
│       │   └── lavanderia.ts
│       │
│       ├── tab1/
│       ├── tab2/
│       ├── tab3/
│       └── tabs/
│
├── instance/
│   └── lavanderia.db
│
├── app.py
├── angular.json
├── capacitor.config.ts
├── ionic.config.json
├── package.json
└── README.md
```

---

# ⚙️ Instalación

## Clonar repositorio

```bash
git clone https://github.com/santrix678/aplicaciones-moviles.git
```

Entrar al proyecto:

```bash
cd aplicaciones-moviles
```

Instalar las dependencias:

```bash
npm install
```

---

# 🐍 Backend Flask

Crear un entorno virtual:

```bash
python -m venv .venv
```

En Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar las principales dependencias:

```bash
pip install flask flask-sqlalchemy flask-cors flask-caching werkzeug
```

Ejecutar el backend:

```bash
python app.py
```

El servidor utiliza el puerto:

```text
5001
```

---

# 📱 Compilar aplicación Android

Generar la aplicación web:

```bash
ionic build
```

Sincronizar con Capacitor:

```bash
npx cap sync android
```

Ejecutar en un dispositivo Android:

```bash
npx cap run android
```

---

# 🌐 Comunicación móvil-backend

Durante las pruebas en un dispositivo físico, el celular y la computadora deben poder comunicarse a través de la red utilizada para el desarrollo.

La aplicación utiliza la dirección del servidor Flask configurada en los servicios correspondientes.

Ejemplo utilizado durante el desarrollo:

```text
http://192.168.100.83:5001/api
```

> La dirección IP puede cambiar dependiendo de la red donde se ejecute el proyecto.

---

# 🧪 Pruebas realizadas

Durante el desarrollo se comprobaron:

- ✅ Registro de usuarios.
- ✅ Inicio de sesión.
- ✅ Autenticación mediante token.
- ✅ Roles cliente y administrador.
- ✅ Creación de órdenes.
- ✅ Consulta de órdenes.
- ✅ Actualización de órdenes.
- ✅ Eliminación de órdenes.
- ✅ Captura de fotografías.
- ✅ Geolocalización.
- ✅ Dirección de recogida.
- ✅ Comunicación móvil-backend.
- ✅ Persistencia en SQLite.
- ✅ Reporte financiero.
- ✅ Optimización de consultas.
- ✅ Cache-Aside.
- ✅ Procesamiento asíncrono.
- ✅ Ejecución en dispositivo Android físico.

---

# 🎯 Objetivo

Desarrollar una aplicación móvil funcional integrada con un backend y una base de datos, aplicando conceptos de:

```text
Aplicaciones móviles
        ↓
API REST
        ↓
Autenticación y autorización
        ↓
CRUD
        ↓
Base de datos
        ↓
Cámara y geolocalización
        ↓
Optimización
        ↓
Caché
        ↓
Procesamiento asíncrono
        ↓
Reportes
```

---

# 👨‍💻 Datos del autor

**Carrera:** Tecnologías de la Información  
**Asignatura:** Desarrollo de Aplicaciones Móviles  
**Institución:** Universidad Estatal Amazónica (UEA)  
**Proyecto:** Lavandería Santrix  
**Año:** 2026

---

# 🔗 Repositorio

Repositorio del proyecto:

https://github.com/santrix678/aplicaciones-moviles

---

## 🧺 Lavandería Santrix

Sistema móvil para la gestión de órdenes de lavandería mediante Ionic, Angular, Flask y SQLite.