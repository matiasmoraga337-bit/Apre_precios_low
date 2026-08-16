# Checklist de calidad

## Antes de cada commit funcional

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Antes de integrar cambios de interfaz

- Navegacion completa con teclado.
- Foco visible.
- Contraste suficiente.
- Enlace para saltar navegacion.
- Formularios con labels asociados.
- Estados de error anunciados.
- Vista usable a 200% de zoom.
- Movimiento reducido respetado.
- Vista movil y escritorio.

## Antes de publicar

- `npm audit --audit-level=high`
- `npm run test:e2e`
- Migraciones verificadas con `npm run db:migrate:deploy`.
- No existen secretos en el diff.
- Logs sin datos personales innecesarios.
- Backups y restauracion probados.

## Rendimiento actual

- El catalogo publico usa cache de 60 segundos y permite stale-while-revalidate durante 5 minutos.
- Las respuestas del catalogo incluyen `Server-Timing` para observar la duracion de la consulta.
- Las rutas de cuenta, alertas y autenticacion no usan cache publico.
