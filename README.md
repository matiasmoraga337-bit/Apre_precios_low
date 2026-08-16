# Apre precios low

Aplicacion web en desarrollo para consultar ofertas historicas de videojuegos digitales en Chile.

El proyecto se encuentra en la etapa inicial de aprendizaje y utiliza Next.js, TypeScript y PostgreSQL como base prevista.

## Requisitos

- Node.js 22 o superior.
- npm 11 o superior.
- Docker, cuando se agregue la base de datos local.

## Instalacion

```bash
npm ci
```

## Comandos disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run lint      # Ejecuta ESLint
npm run typecheck # Comprueba los tipos de TypeScript
npm test          # Ejecuta Vitest
npm run build     # Crea el build de produccion
```

## Estado actual

- Proyecto Next.js inicializado.
- TypeScript, ESLint, Vitest y Tailwind configurados.
- Workflow de GitHub Actions para lint, typecheck, tests y build.
- Aun no existe base de datos ni logica de precios.

Consulta [`PLAN.md`](./PLAN.md) para conocer las fases, decisiones y tareas pendientes.

## Desarrollo

Inicia el servidor local:

```bash
npm run dev
```

Luego abre [http://localhost:3000](http://localhost:3000).

## Verificaciones

Los cambios enviados a `main` o a un pull request ejecutan automaticamente el workflow de CI en GitHub Actions.

No se deben subir archivos `.env`, claves, tokens ni credenciales.
