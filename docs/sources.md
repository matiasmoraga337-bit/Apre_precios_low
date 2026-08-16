# Fuentes de precios

## Steam

- Endpoint usado: `https://store.steampowered.com/api/appdetails`.
- Consulta regional: `cc=cl`.
- Datos usados: App ID, titulo, genero, precio inicial, precio final y descuento.
- Integracion actual: `src/integrations/steam/steam-adapter.ts`.
- Las respuestas externas se validan y se consulta con timeout.

## Eneba

- La pagina publica depende de JavaScript para mostrar el catalogo.
- No se encontro una API publica documentada en las rutas de API consultadas.
- La respuesta publica no basta para afirmar que un precio incluye todos los cargos o condiciones de una oferta.
- No se implementara scraping automatico mientras no exista una API autorizada o permiso claro para usar esos datos.
- Siguiente accion: contactar a Eneba o investigar un programa oficial de afiliados/API antes de crear `EnebaAdapter`.

## Regla de integracion

Cada tienda debe implementar `StoreAdapter` y entregar una oferta normalizada en CLP. La logica de productos, historial, alertas y usuarios no debe conocer el formato de la tienda.
