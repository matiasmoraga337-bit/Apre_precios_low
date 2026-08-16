$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

if (-not $env:DATABASE_URL) {
  throw "DATABASE_URL no esta configurada. Copia .env.example a .env y completa la configuracion local."
}

function Invoke-Npm {
  param([string[]]$Arguments)
  & npm.cmd @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "npm command failed: npm $($Arguments -join ' ')"
  }
}

Write-Host "Starting local services..."
& docker compose up -d postgres mailpit
if ($LASTEXITCODE -ne 0) { throw "Docker Compose could not start the services" }

$healthy = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  $health = (& docker inspect --format='{{.State.Health.Status}}' apre-precios-postgres 2>$null).Trim()
  if ($health -eq "healthy") {
    $healthy = $true
    break
  }
  Start-Sleep -Seconds 2
}
if (-not $healthy) { throw "PostgreSQL did not become healthy in time" }

Write-Host "Applying migrations..."
Invoke-Npm @("run", "db:migrate:deploy")

Write-Host "Synchronizing Steam..."
Invoke-Npm @("run", "sync:steam")

Write-Host "Cleaning expired authentication data..."
Invoke-Npm @("run", "cleanup:auth")

Write-Host "Scheduled synchronization completed."
