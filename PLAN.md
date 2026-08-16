# Radar de ofertas de videojuegos

Plan vivo para construir una aplicacion local que detecte ofertas historicas de videojuegos digitales para Chile.

## Como usar este documento

- Marcar una tarea como `[x]` cuando este terminada y verificada.
- Mantener las tareas pendientes en `[ ]`.
- Agregar decisiones importantes en `Decisiones registradas`.
- Actualizar `Ultima actualizacion` despues de cada bloque relevante.
- No marcar una tarea por el solo hecho de haber escrito codigo: debe tener una verificacion asociada.

## Objetivo del MVP

Construir una aplicacion web local que permita:

- Consultar videojuegos digitales disponibles para Chile.
- Mostrar precios en pesos chilenos.
- Guardar el historial de precios.
- Detectar el minimo historico por producto y tienda.
- Crear cuentas de usuario.
- Seguir videojuegos.
- Configurar alertas por correo.
- Comenzar con datos simulados y luego integrar Steam.

## Fuera del MVP

- Integracion simultanea con todas las tiendas.
- Aplicacion movil nativa.
- Telegram.
- Enlaces de afiliado y monetizacion.
- Compra directa desde la aplicacion.
- Recomendaciones basadas en inteligencia artificial.

## Decisiones tecnicas iniciales

| Area | Decision inicial | Motivo |
| --- | --- | --- |
| Tipo de aplicacion | Monolito modular | Menor complejidad y buena base para aprender |
| Frontend y backend | Next.js + TypeScript | Permite aprender ambas partes en un solo proyecto |
| Base de datos | PostgreSQL | Modelo relacional adecuado para productos, tiendas y precios |
| Desarrollo local | Aplicacion local y servicios con Docker cuando corresponda | Sin coste de despliegue durante el aprendizaje |
| Primera fuente real | Steam | Separa la logica del producto de la complejidad de muchas tiendas |
| Datos iniciales | Datos simulados | Permiten validar la aplicacion antes de depender de una tienda externa |
| Moneda | CLP como moneda de presentacion | Enfoque en usuarios de Chile |
| Notificaciones iniciales | Correo con Mailpit local | Permite probar sin pagar ni enviar correos reales |
| Notificaciones futuras | Telegram | Se agregara como otro canal independiente |
| Diseno | Tema gaming oscuro, animaciones moderadas | Refuerza el objetivo sin perjudicar la legibilidad |
| Version movil futura | PWA antes que aplicacion nativa | Reutiliza el trabajo web y reduce el coste inicial |

## Criterio para el minimo historico

El sistema debe diferenciar, cuando sea posible:

- Precio actual.
- Minimo historico.
- Fecha del minimo historico.
- Tienda donde se registro.
- Moneda original.
- Precio convertido a CLP.
- Tipo de descuento.
- Edicion o version del videojuego.
- Disponibilidad.
- Condiciones especiales, cupones o requisitos.

No se debe afirmar que un precio es el minimo historico si no se conoce la calidad y antiguedad de los datos disponibles.

## Fases de desarrollo

### Fase 0: Definicion y viabilidad

- [ ] Definir nombre provisional y descripcion corta.
- [ ] Definir usuario objetivo y casos de uso principales.
- [ ] Definir que significa "oferta" para el MVP.
- [ ] Definir si el precio mostrado incluye impuestos cuando la fuente lo informe.
- [ ] Investigar disponibilidad de datos de Steam.
- [ ] Investigar disponibilidad de datos de Eneba.
- [ ] Registrar restricciones de uso de cada fuente.
- [ ] Definir identificacion de productos y ediciones.
- [ ] Crear wireframes de inicio, catalogo, detalle y perfil.
- [ ] Registrar decisiones tecnicas y de producto.

**Verificacion:** existe un documento de requisitos y una ficha de viabilidad para cada fuente prioritaria.

### Fase 1: Base del proyecto

- [ ] Inicializar Git.
- [ ] Crear el proyecto Next.js con TypeScript.
- [ ] Confirmar gestor de paquetes y fijar su version.
- [ ] Configurar lint, formato y typecheck.
- [ ] Crear `.gitignore`.
- [ ] Crear `.env.example` sin secretos.
- [ ] Definir estructura modular inicial.
- [ ] Configurar PostgreSQL local.
- [ ] Configurar migraciones de base de datos.
- [ ] Documentar como ejecutar el proyecto localmente.

**Verificacion:** instalacion limpia, lint, typecheck y aplicacion local funcionando.

### Fase 2: Modelo de datos y datos simulados

- [ ] Crear entidad de usuario.
- [ ] Crear entidad de tienda.
- [ ] Crear entidad de producto.
- [ ] Crear entidad de oferta.
- [ ] Crear entidad de registro historico de precio.
- [ ] Crear entidad de producto seguido.
- [ ] Crear datos simulados reproducibles.
- [ ] Implementar normalizacion de precios.
- [ ] Implementar calculo de minimo historico.
- [ ] Hacer el proceso de actualizacion idempotente.
- [ ] Agregar paginacion y ordenamiento.

**Verificacion:** los mismos datos procesados dos veces no generan duplicados incorrectos y el minimo historico es correcto.

### Fase 3: Catalogo y diseno visual

- [ ] Crear layout general.
- [ ] Crear navegacion principal.
- [ ] Crear pagina de inicio.
- [ ] Crear catalogo con filtros.
- [ ] Crear tarjetas de videojuegos.
- [ ] Crear indicadores de minimo historico.
- [ ] Crear estados de carga, error y sin resultados.
- [ ] Crear pagina de detalle.
- [ ] Crear grafico historico.
- [ ] Implementar animaciones moderadas.
- [ ] Respetar `prefers-reduced-motion`.
- [ ] Probar responsive en movil y escritorio.
- [ ] Revisar contraste y navegacion con teclado.

**Verificacion:** flujo de consulta completo con datos simulados y auditoria basica de accesibilidad.

### Fase 4: Integracion con Steam

- [ ] Documentar el contrato interno de un adaptador de tienda.
- [ ] Implementar `SteamAdapter`.
- [ ] Validar toda respuesta externa.
- [ ] Normalizar titulos, identificadores, ediciones y precios.
- [ ] Manejar timeouts, errores y limites de consulta.
- [ ] Guardar la fecha de cada consulta.
- [ ] Evitar duplicados por producto y tienda.
- [ ] Detectar productos no disponibles.
- [ ] Ejecutar una actualizacion manual.
- [ ] Ejecutar una actualizacion programada.

**Verificacion:** se pueden importar productos reales sin romper el catalogo ni mezclar ediciones distintas.

### Fase 5: Cuentas y permisos

- [ ] Crear registro.
- [ ] Crear inicio y cierre de sesion.
- [ ] Crear recuperacion de contrasena.
- [ ] Aplicar hash seguro de contrasenas.
- [ ] Proteger sesiones con cookies seguras.
- [ ] Validar entradas en el servidor.
- [ ] Aplicar rate limiting a autenticacion.
- [ ] Crear pagina de perfil.
- [ ] Verificar que cada usuario solo acceda a sus propios datos.
- [ ] Crear opcion de eliminacion de cuenta.

**Verificacion:** pruebas de autenticacion, autorizacion, validacion y acceso indebido.

### Fase 6: Seguimiento y alertas por correo

- [ ] Permitir seguir y dejar de seguir videojuegos.
- [ ] Permitir definir un precio objetivo.
- [ ] Permitir configurar porcentaje de descuento.
- [ ] Crear proceso de evaluacion de alertas.
- [ ] Evitar alertas duplicadas.
- [ ] Registrar historial de notificaciones.
- [ ] Integrar Mailpit local.
- [ ] Crear plantillas de correo.
- [ ] Permitir desactivar notificaciones.

**Verificacion:** una alerta se genera una sola vez por evento y se puede simular de principio a fin.

### Fase 7: Nuevas fuentes

- [ ] Implementar investigacion tecnica de Eneba.
- [ ] Implementar `EnebaAdapter` si la fuente es viable.
- [ ] Investigar Xbox.
- [ ] Investigar Epic Games.
- [ ] Investigar Ubisoft.
- [ ] Agregar cada tienda mediante un adaptador independiente.
- [ ] Crear pruebas de contrato para cada adaptador.

**Verificacion:** una tienda nueva no requiere modificar la logica central de productos, historial o alertas.

### Fase 8: Seguridad y calidad

- [ ] Crear modelo de amenazas basico.
- [ ] Validar entradas en cada frontera del sistema.
- [ ] Usar consultas parametrizadas u ORM seguro.
- [ ] Configurar headers de seguridad.
- [ ] Restringir dominios externos permitidos.
- [ ] Aplicar timeouts y limites a integraciones externas.
- [ ] Revisar logs para no exponer secretos ni datos personales.
- [ ] Ejecutar auditoria de dependencias.
- [ ] Crear pruebas unitarias del dominio.
- [ ] Crear pruebas de integracion de API y base de datos.
- [ ] Crear pruebas end-to-end de los flujos principales.
- [ ] Crear pruebas de accesibilidad.
- [ ] Revisar rendimiento basico.

**Verificacion:** no quedan vulnerabilidades criticas o altas sin evaluar y los flujos principales tienen pruebas automatizadas.

### Fase 9: Futuro

- [ ] Integrar Telegram.
- [ ] Convertir la web en PWA.
- [ ] Evaluar aplicacion movil nativa.
- [ ] Evaluar enlaces de afiliado.
- [ ] Definir politica de privacidad y terminos.
- [ ] Evaluar despliegue publico.
- [ ] Configurar backups y observabilidad.
- [ ] Analizar nuevas formas de monetizacion.

## Estrategia de pruebas

### Unitarias

- Conversion de monedas.
- Calculo del minimo historico.
- Deteccion de cambios de precio.
- Normalizacion de productos.
- Evaluacion de reglas de alerta.

### Integracion

- Persistencia de productos y precios.
- Importacion de una tienda.
- Autenticacion.
- Permisos por usuario.
- Creacion y envio de alertas.

### End-to-end

- Registrar usuario.
- Iniciar sesion.
- Buscar un videojuego.
- Ver el historial.
- Seguir un videojuego.
- Configurar una alerta.
- Recibir un correo de prueba.

### Seguridad

- Entradas invalidas.
- Intentos repetidos de login.
- Acceso a recursos de otro usuario.
- Inyeccion en filtros y busquedas.
- XSS en nombres o datos externos.
- Respuestas externas malformadas.
- Timeouts y fallos de tiendas.

## Convencion de commits

Usar mensajes en formato Conventional Commits:

```text
<tipo>: <descripcion corta>
```

Tipos recomendados:

- `feat`: nueva funcionalidad.
- `fix`: correccion de un error.
- `test`: pruebas.
- `docs`: documentacion.
- `refactor`: reorganizacion sin cambio funcional.
- `chore`: configuracion o mantenimiento.
- `security`: mejora de seguridad.

Cada commit debe contener un cambio logico pequeno, pasar las verificaciones disponibles y no incluir secretos.

## Commits sugeridos

1. `docs: add project development plan`
2. `chore: initialize Next.js TypeScript project`
3. `chore: configure lint formatting and typecheck`
4. `chore: add local database configuration`
5. `feat: add initial price domain model`
6. `feat: seed simulated game prices`
7. `feat: calculate historical low prices`
8. `feat: add deals catalog with filters`
9. `feat: add game price history view`
10. `test: cover historical price calculations`
11. `feat: add Steam store adapter`
12. `feat: add user authentication`
13. `feat: add followed games`
14. `feat: add email price alerts`
15. `security: harden authentication and external integrations`
16. `test: add end to end deal tracking flow`
17. `docs: document local development and data sources`

No es necesario crear todos estos commits de una vez. Cada uno debe corresponder a una unidad terminada y verificable.

## Definition of Done

Una tarea se considera terminada cuando:

- [ ] La funcionalidad cumple su objetivo.
- [ ] Los casos de error principales fueron considerados.
- [ ] Existe prueba cuando la logica lo requiere.
- [ ] Se ejecutaron lint y typecheck.
- [ ] No se agregaron secretos.
- [ ] La interfaz funciona con teclado cuando corresponde.
- [ ] Se actualizo este documento.
- [ ] El commit contiene solamente el cambio relacionado.

## Decisiones registradas

- El proyecto comienza con videojuegos digitales.
- El mercado objetivo inicial es Chile.
- La moneda de presentacion es CLP.
- El desarrollo sera local durante el aprendizaje.
- Se comenzara con datos simulados y luego Steam.
- Las alertas iniciales seran por correo.
- Telegram y movil quedan preparados para etapas posteriores.
- La estetica sera gaming oscura con animaciones moderadas.
- La monetizacion no forma parte del MVP.

## Pendientes para la siguiente sesion

- [ ] Confirmar el nombre provisional del proyecto.
- [ ] Confirmar si Docker esta disponible en el equipo.
- [ ] Elegir el gestor de paquetes despues de crear el proyecto.
- [ ] Crear wireframes iniciales.
- [ ] Investigar las fuentes de datos antes de automatizar consultas.

## Estado

- Fase actual: Fase 0, definicion y viabilidad.
- Ultima actualizacion: 2026-08-15.
- Estado general: plan definido, proyecto aun no inicializado.
