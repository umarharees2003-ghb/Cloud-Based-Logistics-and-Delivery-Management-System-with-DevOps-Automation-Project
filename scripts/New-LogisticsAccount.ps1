param(
  [string]$AdminEmail,
  [string]$Email = "logistics.local@routeflow.test",
  [string]$Name = "Local Logistics Manager"
)
$ErrorActionPreference = "Stop"
Push-Location (Split-Path -Parent $PSScriptRoot)
$keys = @("ADMIN_EMAIL", "ADMIN_PASSWORD", "LOGISTICS_NAME", "LOGISTICS_EMAIL", "LOGISTICS_PASSWORD")
$previous = @{}
foreach ($key in $keys) { $previous[$key] = [Environment]::GetEnvironmentVariable($key, "Process") }
try {
  if (-not $AdminEmail) { $AdminEmail = Read-Host "Existing administrator email" }
  $adminSecret = Read-Host "Existing administrator password" -AsSecureString
  $staffSecret = Read-Host "New Logistics Manager password (8+ characters)" -AsSecureString
  $confirmSecret = Read-Host "Confirm new Logistics Manager password" -AsSecureString
  $staffPassword = [System.Net.NetworkCredential]::new("", $staffSecret).Password
  if ($staffPassword -cne [System.Net.NetworkCredential]::new("", $confirmSecret).Password) { throw "Confirm password: Passwords do not match. No account was created." }
  $env:ADMIN_EMAIL = $AdminEmail
  $env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $adminSecret).Password
  $env:LOGISTICS_EMAIL = $Email
  $env:LOGISTICS_NAME = $Name
  $env:LOGISTICS_PASSWORD = $staffPassword
  docker compose exec -T -e ADMIN_EMAIL -e ADMIN_PASSWORD -e LOGISTICS_EMAIL -e LOGISTICS_NAME -e LOGISTICS_PASSWORD backend npm run provision:logistics
  if ($LASTEXITCODE -ne 0) { throw "Account was not provisioned. Resolve the error above and try again; existing accounts are never overwritten." }
} finally {
  foreach ($key in $keys) { [Environment]::SetEnvironmentVariable($key, $previous[$key], "Process") }
  $staffPassword = $null
  $adminSecret = $null
  $staffSecret = $null
  $confirmSecret = $null
  Pop-Location
}
