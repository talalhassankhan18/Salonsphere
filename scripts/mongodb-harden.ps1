# Run ONCE as Administrator:
#   powershell -ExecutionPolicy Bypass -File .\scripts\mongodb-harden.ps1
#
# Why: this dev machine has ~8 GB RAM. mongod was OOM-killed twice on
# 2026-09-14 while Next.js (Turbopack dev + `next build`) was running.
# By default WiredTiger reserves 50% of (RAM - 1 GB) ≈ 3.3 GB here.
#
# What it does (both reversible):
#   1. Service recovery: restart MongoDB automatically if it stops unexpectedly.
#   2. Cap WiredTiger cache at 0.5 GB in mongod.cfg (backup written alongside).
#   3. Restart the service so the cap takes effect.

$ErrorActionPreference = "Stop"

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host "Re-launching elevated..." -ForegroundColor Yellow
  Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
  exit
}

$svc = "MongoDB"
$cfg = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg"
$cacheGB = 0.5

# --- 1. auto-restart on failure -------------------------------------------
sc.exe failure $svc reset= 86400 actions= restart/5000/restart/10000/restart/30000 | Out-Null
sc.exe failureflag $svc 1 | Out-Null
Write-Host "[1/3] Service recovery set: restart after 5s / 10s / 30s" -ForegroundColor Green

# --- 2. cap WiredTiger cache ----------------------------------------------
$text = Get-Content -LiteralPath $cfg -Raw
if ($text -match "cacheSizeGB") {
  Write-Host "[2/3] cacheSizeGB already present in mongod.cfg - leaving as is" -ForegroundColor Yellow
} else {
  Copy-Item -LiteralPath $cfg -Destination "$cfg.bak-$(Get-Date -Format yyyyMMdd-HHmmss)"
  $block = "  wiredTiger:`r`n    engineConfig:`r`n      cacheSizeGB: $cacheGB`r`n"
  # insert right after the `storage:` block's dbPath line
  $new = $text -replace "(?m)^(\s*dbPath:.*\r?\n)", "`$1$block"
  if ($new -eq $text) { throw "Could not find 'dbPath:' under 'storage:' in $cfg" }
  Set-Content -LiteralPath $cfg -Value $new -Encoding ASCII -NoNewline
  Write-Host "[2/3] WiredTiger cache capped at $cacheGB GB (backup saved next to mongod.cfg)" -ForegroundColor Green
}

# --- 3. restart ------------------------------------------------------------
Restart-Service -Name $svc -Force
Start-Sleep -Seconds 4
$state = (Get-Service $svc).Status
Write-Host "[3/3] MongoDB service: $state" -ForegroundColor $(if ($state -eq "Running") { "Green" } else { "Red" })
if ($state -ne "Running") { throw "MongoDB did not come back - restore the .bak file and re-check mongod.cfg" }
