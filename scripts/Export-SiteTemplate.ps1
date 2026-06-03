# This file is part of TrackMaster
# Export-SiteTemplate.ps1: Exports TrackMaster SharePoint site structure to a deployment template
# Author(s): Gabriel Mongefranco; Victoria Bennett; Conni Harrigan; et. all.
# Created: 2026-06-02
# Last Modified: 2026-06-03
# Summary: Connects interactively to SharePoint Online and exports Lists, Fields, Content Types, Custom Content Types (including the renamed 'Tags' taxonomy field), and Calculated Columns. Strips data rows, user permissions, JSON formatting strings, and search settings from the output.
# Notes: Run manually. Do not execute via automation. Requires PnP.PowerShell v1.12.0. See README file for documentation and full license information.
#
# Copyright © 2023-2026 The Regents of the University of Michigan
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License along
# with this program. If not, see https://www.gnu.org/licenses/.

#Requires -Modules PnP.PowerShell
param(
    [string]$SiteUrl = "https://umhealth.sharepoint.com/sites/DepressionCenter-TrackMaster"
)

$ErrorActionPreference = 'Stop'
$RepoRoot   = Resolve-Path (Join-Path $PSScriptRoot '..')
$OutputFile = Join-Path $RepoRoot 'deployment\trackmaster-template.xml'

Import-Module PnP.PowerShell -ErrorAction Stop

Write-Host -ForegroundColor Yellow '=== Export-SiteTemplate.ps1 ==='
Write-Host "Output: $OutputFile"
Write-Host ''

$null = New-Item -ItemType Directory -Force (Split-Path $OutputFile)

Write-Host -ForegroundColor Green '*** LOGIN REQUIRED ***'
Write-Host -ForegroundColor Yellow 'Please login to your SharePoint site in the popup window...'
Connect-PnPOnline -Interactive -Url $SiteUrl
Write-Host -ForegroundColor Yellow 'Connected.'

Write-Host -ForegroundColor Yellow 'Exporting site template...'

Get-PnPSiteTemplate `
    -IncludeSiteCollectionTermGroup `
    -ExcludeHandlers AuditSettings,SiteSecurity,Tenant,WebApiPermissions,Files,Pages,PageContents,SearchSettings `
    -TemplateDisplayName 'TrackMaster - Center Membership Tracking Tool' `
    -Force `
    -Out $OutputFile

Write-Host -ForegroundColor Yellow 'Removing sensitive info...'
(Get-Content $OutputFile) -replace 'Owner\=\"i\:.+\.f\|membership\|.+\@+.*umich\.edu\"', '' |
    Select-String -Pattern '\|membership\|' -NotMatch |
    Set-Content $OutputFile

Write-Host -ForegroundColor Yellow 'Stripping JSON formatting strings...'

$content = Get-Content -Path $OutputFile -Raw -Encoding UTF8

# Strip column-level JSON formatting (CustomFormatter attribute on <Field> elements)
$content = $content -replace '\s+CustomFormatter="[^"]*"', ''

# Strip JSLink (legacy view formatting references)
$content = $content -replace '\s+JSLink="[^"]*(?:clienttemplates|sp\.ui\.form)[^"]*"', ''

# Strip view-level <Formats> elements (may span multiple lines)
$content = [regex]::Replace(
    $content,
    '<Formats>.*?</Formats>',
    '',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

$content | Set-Content -Path $OutputFile -Encoding UTF8 -NoNewline

Disconnect-PnPOnline
Write-Host -ForegroundColor Yellow 'Disconnected.'
Write-Host -ForegroundColor Green "Done. Template written to: $OutputFile"
