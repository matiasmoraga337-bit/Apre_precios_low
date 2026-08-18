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

## Xbox

- La documentacion publica consultada se enfoca en servicios GDK, commerce y partners.
- No se encontro un endpoint publico de catalogo y precio regional para una aplicacion independiente.
- Decision: no crear `XboxAdapter` aun. Investigar acceso oficial para partners si el proyecto obtiene una relacion comercial.

## Epic Games Store

- La documentacion publica consultada se enfoca en publicacion y herramientas para publishers.
- No se encontro un endpoint publico documentado para consultar precios regionales de terceros.
- Decision: no automatizar llamadas internas del storefront ni scraping. Requiere API autorizada o acuerdo de datos.

## Ubisoft

- No se encontro una documentacion publica de catalogo/precios comparable con el endpoint de Steam.
- El storefront puede depender de sesiones, region, disponibilidad y protecciones anti-abuso.
- Decision: dejar `UbisoftAdapter` bloqueado hasta obtener una fuente autorizada.

## Matriz de viabilidad

| Tienda | Fuente publica verificada | CLP regional | Decision |
| --- | --- | --- | --- |
| Steam | Endpoint de detalles de tienda | Si | Implementada |
| Eneba | No encontrada | No confirmable | Bloqueada |
| Xbox | Servicios orientados a partners/GDK | No confirmable | Bloqueada |
| Epic Games | Herramientas orientadas a publishers | No confirmable | Bloqueada |
| Ubisoft | No encontrada | No confirmable | Bloqueada |
