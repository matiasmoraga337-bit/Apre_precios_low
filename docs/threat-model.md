# Modelo de amenazas

Alcance actual: aplicacion local con catalogo publico, cuentas, seguimiento, alertas y sincronizadores externos.

## Activos

- Contrasenas y sesiones de usuarios.
- Correos electronicos y preferencias.
- Seguimientos y reglas de alerta.
- Historial de precios.
- Credenciales SMTP y `DATABASE_URL`.
- Integridad de precios importados.

## Fronteras de confianza

- Navegador hacia rutas API.
- Aplicacion hacia PostgreSQL.
- Aplicacion hacia Steam y futuras tiendas.
- Aplicacion hacia SMTP/Mailpit.
- GitHub Actions hacia servicios de CI.

## Amenazas y controles

| Amenaza | Riesgo | Controles actuales | Pendiente |
| --- | --- | --- | --- |
| Robo de contrasena | Acceso a cuentas | bcrypt, minimo 12 caracteres, rate limit | Recuperacion con monitoreo y MFA futuro |
| Robo de sesion | Suplantacion | Cookie `httpOnly`, `sameSite`, hash del token, expiracion | Rotacion de sesion tras cambios sensibles |
| Acceso cruzado | Exposicion de datos | Consultas filtradas por `userId` | Tests completos de todos los recursos |
| Inyeccion | Compromiso de datos | Prisma y validacion de entradas | Auditoria continua de dependencias |
| Spam de alertas | Coste o abuso SMTP | Entrega unica por snapshot, preferencias | Limites globales por usuario |
| Respuesta externa maliciosa | Datos corruptos o XSS | Validacion de Steam, escape en correo, React escaping | Contratos por tienda |
| Denegacion de servicio | Indisponibilidad | Timeouts, pausas, paginacion, rate limit auth | Rate limit publico distribuido |
| SSRF | Acceso a red interna | URLs externas construidas desde allowlist fija | Revisar cada nueva integracion |
| Secreto expuesto | Toma de servicios | `.env` ignorado, `.env.example`, audit CI | Secret scanning en CI |
| Perdida de datos | Perdida de historial | Migraciones reproducibles | Backups y restauracion probada |

## Decisiones

- Nunca aceptar URLs arbitrarias para consultar tiendas.
- No guardar tokens de sesion en `localStorage`.
- No enviar correos si el usuario desactivo la preferencia.
- No registrar contrasenas, tokens ni contenido completo de solicitudes.
- No automatizar scraping de una tienda sin fuente autorizada.
- Tratar toda respuesta externa como no confiable hasta validarla.

## Revisión

Este documento debe actualizarse cuando se agregue una tienda, un canal de notificacion, un rol administrativo o una nueva categoria de datos personales.
