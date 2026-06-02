<#
.SYNOPSIS
    Exports and unpacks a Power Platform solution for Git version control.
.DESCRIPTION
    Uses Power Platform CLI (pac) to export an unmanaged solution zip from your
    environment, then unpacks it into power-platform/TrackMasterSolution/ so that
    flow JSON, triggers, actions, and solution manifests are tracked as human-readable
    text files.
.NOTES
    Run manually. Requires Power Platform CLI: https://aka.ms/PowerAppsCLI
    Usage: .\Sync-PowerPlatformSolution.ps1
#>

$ErrorActionPreference = 'Stop'
$RepoRoot       = Resolve-Path (Join-Path $PSScriptRoot '..')
$SolutionFolder = Join-Path $RepoRoot 'power-platform\TrackMasterSolution'
$StagingDir     = Join-Path $env:TEMP 'TM-SolutionExport'

Write-Host -ForegroundColor Yellow '=== Sync-PowerPlatformSolution.ps1 ==='
Write-Host ''

# Verify pac CLI is available
if (-not (Get-Command pac -ErrorAction SilentlyContinue)) {
    Write-Host -ForegroundColor Red 'ERROR: Power Platform CLI (pac) not found.'
    Write-Host 'Install from: https://aka.ms/PowerAppsCLI'
    exit 1
}

# Prompt for environment and solution
$EnvironmentUrl = Read-Host 'Enter your Power Platform Environment URL (e.g., https://org.crm.dynamics.com)'
$SolutionName   = Read-Host 'Enter the solution name (e.g., TrackMasterEFDCSolution)'

# Authenticate
Write-Host -ForegroundColor Yellow "Authenticating with: $EnvironmentUrl"
pac auth create --url $EnvironmentUrl

# Stage export
Write-Host -ForegroundColor Yellow "Staging directory: $StagingDir"
$null = New-Item -ItemType Directory -Force $StagingDir

$ZipFile = Join-Path $StagingDir "$SolutionName.zip"

# Export unmanaged solution
Write-Host -ForegroundColor Yellow "Exporting unmanaged solution '$SolutionName'..."
pac solution export `
    --path $StagingDir `
    --name $SolutionName `
    --managed false

if (-not (Test-Path -LiteralPath $ZipFile)) {
    Write-Host -ForegroundColor Red "ERROR: Export succeeded but zip not found at: $ZipFile"
    Write-Host 'Check the solution name matches exactly (case-sensitive).'
    exit 1
}

# Unpack into repo
Write-Host -ForegroundColor Yellow "Unpacking to: $SolutionFolder"
$null = New-Item -ItemType Directory -Force $SolutionFolder
pac solution unpack `
    --zipfile $ZipFile `
    --folder $SolutionFolder `
    --processCanvasApps

# Clean up staging
Write-Host -ForegroundColor Yellow 'Cleaning up staging directory...'
Remove-Item -Recurse -Force $StagingDir

Write-Host ''
Write-Host -ForegroundColor Green "Done. Solution unpacked to: $SolutionFolder"
Write-Host -ForegroundColor Green 'Stage and commit power-platform/ to track flow changes in Git.'
