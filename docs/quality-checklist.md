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
