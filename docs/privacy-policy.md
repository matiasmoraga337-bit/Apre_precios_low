# Politica de privacidad

Plantilla inicial para el proyecto de aprendizaje. Debe ser revisada y adaptada por un profesional antes de publicar la aplicacion para usuarios reales en Chile.

## Datos que se recopilan

- Correo electronico para crear la cuenta y enviar alertas solicitadas.
- Contrasena almacenada unicamente como hash seguro.
- Seguimientos, reglas de alerta y preferencias de correo.
- Sesiones tecnicas necesarias para mantener el inicio de sesion.
- Historial de precios de productos y tiendas.

No se recopilan datos de pago ni se realizan compras desde esta aplicacion.

## Uso de los datos

Los datos se usan para:

- Autenticar al usuario.
- Guardar sus videojuegos seguidos.
- Evaluar y enviar alertas solicitadas.
- Mantener el historial de precios.
- Proteger la aplicacion contra abuso.

## Comparticion

No se venden datos personales. El correo puede enviarse al proveedor SMTP configurado para entregar alertas. En desarrollo local se usa Mailpit y los correos no salen a Internet.

Las consultas de precios se realizan a las tiendas correspondientes y no deben incluir datos personales del usuario.

## Retencion y eliminacion

El usuario puede eliminar su cuenta desde `/account`. La eliminacion borra sesiones, seguimientos, alertas y tokens asociados mediante las relaciones de la base de datos.

Las sesiones y tokens expirados se eliminan con `npm run cleanup:auth`.

## Seguridad

Se usan contrasenas hasheadas, cookies `httpOnly`, validacion de entradas, rate limiting y consultas parametrizadas. Ningun sistema garantiza seguridad absoluta; los controles deben revisarse antes de produccion.

## Contacto

Durante el aprendizaje, el contacto del proyecto debe configurarse mediante una direccion controlada por su responsable.

Ultima actualizacion: 2026-08-16.
