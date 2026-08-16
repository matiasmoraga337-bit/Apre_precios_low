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
npm run db:up     # Inicia PostgreSQL con Docker
npm run db:generate # Genera Prisma Client
npm run db:migrate  # Crea y aplica migraciones durante el desarrollo
npm run db:seed   # Inserta datos simulados
npm run db:down   # Detiene PostgreSQL
npm run sync:steam -- 1145350 # Sincroniza una app de Steam usando su App ID
```

## Estado actual

- Proyecto Next.js inicializado.
- TypeScript, ESLint, Vitest y Tailwind configurados.
- Workflow de GitHub Actions para lint, typecheck, tests y build.
- PostgreSQL local, Prisma, migracion inicial y seed configurados.
- El catalogo y el detalle consultan PostgreSQL; los datos simulados se mantienen como seed reproducible.
- La sincronizacion de Steam es manual por ahora y consulta precios regionales con `cc=cl`. Puedes pasar varias App IDs; el proceso espera un segundo entre consultas y continua aunque una app falle:

```bash
npm run sync:steam -- 1145350 2379780
```

Para automatizarlo durante el desarrollo local, puedes registrar ese comando en el Programador de tareas de Windows. La sincronizacion programada en un entorno publicado se implementara despues de definir la infraestructura de produccion.

Consulta [`PLAN.md`](./PLAN.md) para conocer las fases, decisiones y tareas pendientes.

## Desarrollo

Inicia el servidor local:

```bash
npm run dev
```

Luego abre [http://localhost:3000](http://localhost:3000).

Para preparar la base de datos local por primera vez:

```bash
Copy-Item .env.example .env
npm run db:up
npm run db:migrate
npm run db:seed
```

## Verificaciones

Los cambios enviados a `main` o a un pull request ejecutan automaticamente el workflow de CI en GitHub Actions.

No se deben subir archivos `.env`, claves, tokens ni credenciales.
