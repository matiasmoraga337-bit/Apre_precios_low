$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

$backupDirectory = Join-Path $projectRoot "backups"
New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $backupDirectory "apre_precios_$timestamp.dump"

& docker exec apre-precios-postgres pg_dump -U apre -d apre_precios -Fc -f "/tmp/apre_precios_$timestamp.dump"
if ($LASTEXITCODE -ne 0) { throw "PostgreSQL backup failed" }

& docker cp "apre-precios-postgres:/tmp/apre_precios_$timestamp.dump" $backupPath
if ($LASTEXITCODE -ne 0) { throw "Could not copy PostgreSQL backup" }

& docker exec apre-precios-postgres rm "/tmp/apre_precios_$timestamp.dump"
Write-Host "Backup created at $backupPath"
