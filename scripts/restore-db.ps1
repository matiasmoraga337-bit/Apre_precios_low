param([Parameter(Mandatory = $true)][string]$BackupPath)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $BackupPath)) { throw "Backup file not found: $BackupPath" }
& docker cp $BackupPath apre-precios-postgres:/tmp/restore.dump
if ($LASTEXITCODE -ne 0) { throw "Could not copy backup to PostgreSQL container" }

& docker exec apre-precios-postgres pg_restore -U apre -d apre_precios --clean --if-exists /tmp/restore.dump
if ($LASTEXITCODE -ne 0) { throw "PostgreSQL restore failed" }
& docker exec apre-precios-postgres rm /tmp/restore.dump
Write-Host "Backup restored from $BackupPath"
