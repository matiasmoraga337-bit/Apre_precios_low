# Operacion local

## Salud

Consulta:

```text
http://localhost:3000/api/health
```

Respuesta saludable:

```json
{"database":"ok","status":"ok"}
```

La ruta no devuelve credenciales, mensajes internos ni informacion de usuarios.

## Backup

Con PostgreSQL levantado:

```bash
npm run db:backup
```

El archivo se guarda en `backups/`, que no se versiona.

## Restauracion

La restauracion reemplaza los datos actuales. Haz una copia previa y verifica el archivo antes de ejecutarla:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupPath "backups\apre_precios_20260816_120000.dump"
```

Despues aplica migraciones y verifica la aplicacion:

```bash
npm run db:migrate:deploy
npm run test:e2e
```

## Programacion

El backup y `sync:scheduled` pueden registrarse como tareas separadas en el Programador de tareas de Windows. No guardes los dumps en Git ni los compartas sin protegerlos: pueden contener correos, seguimientos y alertas.
