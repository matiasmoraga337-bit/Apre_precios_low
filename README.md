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
npm run test:e2e  # Ejecuta pruebas con Chromium
npm run build     # Crea el build de produccion
npm run db:up     # Inicia PostgreSQL con Docker
npm run db:generate # Genera Prisma Client
npm run db:migrate  # Crea y aplica migraciones durante el desarrollo
npm run db:seed   # Inserta datos simulados
npm run db:down   # Detiene PostgreSQL
npm run sync:steam -- 1145350 # Sincroniza una app de Steam usando su App ID
npm run cleanup:auth # Elimina sesiones y tokens expirados
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

El comando usa `STEAM_APP_IDS` desde `.env` si no recibe IDs por argumentos. En el Programador de tareas usa `npm.cmd` como programa, `run sync:steam` como argumentos y la carpeta del proyecto como directorio de inicio.

Para ejecutar todo el ciclo programado manualmente:

```bash
npm run sync:scheduled
```

Este comando levanta los servicios, espera PostgreSQL, aplica migraciones, sincroniza Steam y limpia sesiones expiradas. En el Programador de tareas usa `npm.cmd` como programa, `run sync:scheduled` como argumentos y la carpeta del proyecto como directorio de inicio.

La cuenta de usuario se prueba en [http://localhost:3000/account](http://localhost:3000/account). Las sesiones usan cookies `httpOnly`; no se guardan tokens de autenticacion en `localStorage`.

En el detalle de cada videojuego puedes iniciar sesion, seguirlo y guardar una alerta por precio objetivo o porcentaje de descuento. Las alertas se evalúan despues de cada sincronizacion.

El envio local ya esta preparado con Mailpit. Abre [http://localhost:8025](http://localhost:8025) para revisar los correos de prueba. No se envia ningun correo real mientras se usa esta configuracion.

La recuperacion de contrasena se inicia desde `Olvide mi contrasena` en la pantalla de cuenta. El enlace se almacena de forma hasheada, dura una hora y cierra las sesiones anteriores al completarse.

La cuenta se puede eliminar desde `/account` confirmando la contrasena. La eliminacion usa cascada para borrar sesiones, seguimientos, alertas y tokens asociados.

Consulta [`PLAN.md`](./PLAN.md) para conocer las fases, decisiones y tareas pendientes.
Las decisiones sobre fuentes externas estan documentadas en [`docs/sources.md`](./docs/sources.md).
La seguridad y la calidad se revisan con [`docs/threat-model.md`](./docs/threat-model.md) y [`docs/quality-checklist.md`](./docs/quality-checklist.md).
La aplicacion incluye manifest y service worker para instalarse como PWA desde un navegador compatible.

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
