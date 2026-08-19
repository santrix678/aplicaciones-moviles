# 🧺 LAVANDERIA-SANTRIX - Sistema Móvil e Integración Backend

Proyecto desarrollado para las actividades prácticas y talleres de las **Semanas 9 y 10** en la **Universidad Estatal Amazónica (UEA)**.

---

## 🚀 Descripción del Proyecto
Aplicación móvil híbrida desarrollada en **Ionic + Angular** conectada a un servidor backend en **Flask (Python)** para la gestión y seguimiento de órdenes de lavandería en tiempo real.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend**: Ionic Framework, Angular (Standalone Components), TypeScript.
* **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-Caching, Flask-CORS.
* **Base de Datos**: SQLite (`lavanderia.db`).

---

## ⚡ Optimizaciones e Implementaciones Clave

1. **Autenticación Directa**: Simulación y validación de tokens de usuario (`/api/login`).
2. **Solución al Problema N+1 (Eager Loading)**: Optimización de consultas SQL mediante `joinedload` en la entidad `Orden` para cargar clientes y órdenes en una sola consulta JOIN.
3. **Procesamiento Asíncrono (Worker)**: Uso del módulo `threading` en Flask para enviar tareas pesadas (notificaciones) a segundo plano en 5 segundos sin congelar la interfaz de usuario.
4. **Caché (Cache-Aside)**: Implementación de `Flask-Caching` (`SimpleCache`) con TTL de 30 segundos en reportes financieros.

---

## 👤 Datos del Autor
* **Carrera**: Tecnologías de la Información
* **Asignatura**: Desarrollo de Aplicaciones Móviles
* **Fecha**: Agosto 2026