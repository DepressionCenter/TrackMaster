# This file is part of TrackMaster
# ExportTrackMasterSiteTemplate.ps1: Exports TrackMaster SharePoint site structure to a deployment template (old version)
# Author(s): Gabriel Mongefranco; Victoria Bennett; Conni Harrigan; et. all.
# Created: 2026-06-02
# Last Modified: 2026-06-03
# Summary: Connects interactively to SharePoint Online and exports Lists, Fields, Content Types, Custom Content Types (including the renamed 'Tags' taxonomy field), and Calculated Columns. Strips data rows, user permissions, JSON formatting strings, and search settings from the output. This script uses version 1.1x of PnP.PowerShell.
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


# Set the working directory and inputs
$SiteURL = "https://umhealth.sharepoint.com/sites/DepressionCenter-TrackMaster"
$WorkingDirectory = "c:\tmp\TrackMaster-Site-Template"
$TemplateXMLFile = "TrackMaster-SharePointSiteTemplate.xml"
$TemplateMarkdownFile = "README.md"

# Ensure you have PnP.PowerShell v1.x (v2.x does not work as of September 2023)
Import-Module PnP.PowerShell


Clear-Host
Write-host -f Yellow " === Export TrackMaster Site Template Script === "

# Delete previous files and create directory structure
New-Item -ItemType Directory -Force $WorkingDirectory
cd $WorkingDirectory
Get-ChildItem -Path $WorkingDirectory -Include *.* -File -Recurse | foreach { $_.Delete()}
New-Item -Path $WorkingDirectory -Name $TemplateXMLFile -ItemType "file" -Value "" -Force
New-Item -Path $WorkingDirectory -Name $TemplateMarkdownFile -ItemType "file" -Value "" -Force
New-Item -ItemType Directory -Force $WorkingDirectory\Lists
Get-ChildItem -Path $WorkingDirectory\Lists -Include *.* -File -Recurse | foreach { $_.Delete()}

# TrackMaster site URL, without a leading slash
Write-host -f Green "*** LOGIN REQUIRED ***"
Write-host -f Yellow "Please login to your SharePoint site in the popup window..."
Connect-PnPOnline -Interactive -Url $SiteURL
Write-host -f Yellow "Connected."

# Export site to XML format
Write-host -f Yellow "Exporting site..."
Get-PnPSiteTemplate -IncludeSiteCollectionTermGroup  -IncludeAllPages -IncludeSearchConfiguration -ExcludeHandlers AuditSettings,SiteSecurity,Tenant,WebApiPermissions,Files,Pages,PageContents -PersistBrandingFiles -TemplateDisplayName "TrackMaster - Center Membership Tracking Tool" -Force -Out $WorkingDirectory\$TemplateXMLFile

# Remove sensitive info
Write-host -f Yellow "Removing sensitive info from XML file..."
(Get-Content $WorkingDirectory\$TemplateXMLFile) -replace 'Owner\=\"i\:.+\.f\|membership\|.+\@+.*umich\.edu\"','' | Select-String -pattern '\|membership\|' -NotMatch | Set-Content $WorkingDirectory\$TemplateXMLFile

# Export site to Markdown format (for documentation)
Write-host -f Yellow "Converting XML export to Markdown format..."
Convert-PnPSiteTemplateToMarkdown -Force -TemplatePath $WorkingDirectory\$TemplateXMLFile -Out $WorkingDirectory\$TemplateMarkdownFile

# Get all non-hidden lists
# Code was modified from https://www.sharepointdiary.com/2017/02/sharepoint-online-get-all-list-fields-using-powershell.html
Write-host -f Yellow "Getting lists separately to format in pretty-looking files."
$ListFields = @()
Try {
	
    #Get All lists from the site - Exclude Hidden
    $Lists = Get-PnPList -Includes SchemaXml | Where {$_.Hidden -eq $false}
     
    ForEach($List in $Lists)
    {
        Write-host -f Yellow "Processing List:"$List.Title
		
		$ListDirPath = ([Management.Automation.WildcardPattern]::Escape($WorkingDirectory + "\Lists\" + $List.Title))
		New-Item -ItemType Directory -Force $ListDirPath
		$ViewDirPath = ([Management.Automation.WildcardPattern]::Escape($WorkingDirectory + "\Lists\" + $List.Title + "\Views"))
		New-Item -ItemType Directory -Force $ViewDirPath
         
        #Get All Fields from the List
		$ListFields = @()
        $Fields = Get-PnPField -List $List | Where {$_.Hidden -eq $false}		
        ForEach($Field in $Fields)
        {
            $ListFields += [PSCustomObject][ordered]@{
				ID           = $Field.ID
                ColumnDisplayName   = $Field.Title
                ColumnInternalName = $Field.InternalName                
                Required     = $Field.Required
                ColumnTye = $Field.TypeAsString
				Description = $Field.Description
				Format = $Field.Format
				MaxLength = $Field.MaxLength
				EnforceUniqueValues = $Field.EnforceUniqueValues
				Indexed = $Field.EnforceUniqueValues
				ValidationFormula = $Field.ValidationFormula
				DefaultValue = $Field.DefaultValue
				DefaultFormula = $Field.DefaultFormula
				CustomFormatter = $Field.CustomFormatter
			}
		}
		
		
		
		Write-host -f Yellow "Exporting List: "$List.Title
		
		#Export whole list to XML
		$List.SchemaXml | Out-File -Force ($ListDirPath + "\" + [Management.Automation.WildcardPattern]::Escape($List.Title) + ".xml")
		
		#Export columns to CSV
		$ListFields | Export-Csv -Path ($ListDirPath + "\" + [Management.Automation.WildcardPattern]::Escape($List.Title) + ".csv") -NoTypeInformation
		
		#Export columns to HTML
		(($ListFields | ConvertTo-Html) -replace '\<td\>\{','<td><code>{') -replace '\}\<\/td\>','}</code>\</td>' | Out-File -Force ($ListDirPath + "\" + [Management.Automation.WildcardPattern]::Escape($List.Title) + ".html")
		
		
		#Get All Views from the List
		$ListViews = Get-PnPView -List $List | Where {$_.Hidden -eq $false}
		
		#Export view settings and columns
		ForEach($CurrentView in $ListViews)
		{
			Write-host -f Yellow "Exporting List Views: "$List.Title" / "$CurrentView.Title
			
			#Export whole view to XML
			$CurrentView.ListViewXml | Out-File -Force ($ViewDirPath + "\" + [Management.Automation.WildcardPattern]::Escape($CurrentView.Title) + ".xml")
			
			#Get view properties
			$ListFields = @()
			
			ForEach ($val in $CurrentView.psobject.Properties.Name)
			{
				$ListFields += [PSCustomObject][ordered]@{
					PropertyName = ($val)
					PropertyValue = $CurrentView.psobject.Properties.Item($val).Value
				}
			}
			$ListFields += [PSCustomObject][ordered]@{
				PropertyName = "ViewFields"
				PropertyValue = (((([xml]$CurrentView.ListViewXML).View.ViewFields.FieldRef | ConvertTo-Csv) -join ', ') -replace '#TYPE System.Xml.XmlElement, ','')
			}
			
			
			#Export view properties to csv
			$ListFields | Export-Csv -Path ($ViewDirPath + "\" + [Management.Automation.WildcardPattern]::Escape($CurrentView.Title) + ".csv") -NoTypeInformation
			
			#Export view properties to HTML
			(($ListFields | ConvertTo-Html) -replace '\>\{','><code>{') -replace '\}\<\/','}</code>\</' | Out-File -Force ($ViewDirPath + "\" + [Management.Automation.WildcardPattern]::Escape($CurrentView.Title) + ".html")
		}
		
		
		Clear-Variable ListFields
		Clear-Variable ListViews
    }
    
}
Catch {
    write-host "Error: $($_.Exception.Message)" -foregroundcolor Red
}



Disconnect-PnPOnline
Write-host -f Yellow "Disconnected."

Write-host -f Yellow "Done."
	