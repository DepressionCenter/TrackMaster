<!--
This file is part of TrackMaster
README.md - Main documentation file for the TrackMaster application.
Author(s): Author(s): Gabriel Mongefranco; Victoria Bennett; Conni Harrigan; et. all.
Created: 2023
Last Modified: 2026-06-03
Summary: TrackMaster is a membership tracking tool and CRM for research centers and institutes at the University of Michigan.
Notes: See README file for documentation and full license information.

Copyright © 2026 The Regents of the University of Michigan

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.

-->
![Depression Center Logo](https://github.com/DepressionCenter/.github/blob/main/images/EFDCLogo_375w.png "depressioncenter.org")

# TrackMaster™

## Description
Welcome to the TrackMaster Membership Management Tool™. TrackMaster is a membership tracking tool and CRM for research centers and institutes at the University of Michigan. This SharePoint-based solution allows research centers and institutes at the University of Michigan to track membership activities, run reports on publications, and automate some membership-related activities such as sending newsletters. This repository contains all the code for the project, along with basic instructions. For complete documentation, visit the Eisenberg Family Depression Center's knowledge base at: https://michmed.org/efdc-kb



## Quick Start Guide

### Prerequisites
Before deploying or administering TrackMaster, ensure you have the following:

**Microsoft 365 Environment**
- A Microsoft 365 subscription through your employer that includes SharePoint Online
- A SharePoint Online site to which you have Site Collection Administrator rights
- Power Platform environment access (required for Power Automate flows)

**Local Tooling**
- [PowerShell 7](https://aka.ms/powershell) — required for all scripts in this repository
- [PnP.PowerShell](https://pnp.github.io/powershell/) — used for SharePoint site export and deployment
- [Power Platform CLI (`pac`)](https://aka.ms/PowerAppsCLI) — used for Power Automate solution export and version control

### Installation

1. **Install PowerShell 7** — download and run the MSI installer from [https://aka.ms/powershell](https://aka.ms/powershell). Open all subsequent terminal sessions using `pwsh.exe`, not `powershell.exe`.

2. **Install PnP.PowerShell** — open PowerShell 7 as Administrator and run:
   ```powershell
   Install-Module PnP.PowerShell -RequiredVersion 1.12.0 -Scope AllUsers -AllowClobber
   ```
   <sub>Version 1.12.0 is required. PnP.PowerShell v2+ requires an Entra ID app registration, which is not available in most corporate environments.</sub>

3. **Install Power Platform CLI** — download and run the MSI installer from [https://aka.ms/PowerAppsCLI](https://aka.ms/PowerAppsCLI).

4. **Set PowerShell execution policy** — in PowerShell 7 as Administrator:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

5. **Clone this repository** and navigate to the project root:
   ```powershell
   git clone https://github.com/DepressionCenter/TrackMaster.git
   cd TrackMaster
   ```

### Launching TrackMaster
TrackMaster is a SharePoint Online application — no local server or build step is required. Simply navigate to your SharePoint site in a web browser.

**Eisenberg Family Depression Center staff** should use:
[https://umhealth.sharepoint.com/sites/DepressionCenter-TrackMaster](https://umhealth.sharepoint.com/sites/DepressionCenter-TrackMaster)



## Documentation
View the documentation at the [Depression Center Knowledge Base](https://teamdynamix.umich.edu/TDClient/210/DepressionCenter/KB/?CategoryID=846).


## Additional Resources
None.



## About the Team
The tool was developed by a cohort team of 5 members from the [ITS 2023 internship](https://its.umich.edu/internship/cohorts).



## Contact
To get in touch, contact the individual developers in the check-in history or email trackmaster@umich.edu.

If you need assistance identifying a contact person, email the EFDC's Mobile Technologies Core at: efdc-mobiletech@umich.edu.



## Credits
### Authors:
+ [Gabriel Mongefranco](https://gabriel.mongefranco.com) [(@gabrielmongefranco)](https://github.com/gabrielmongefranco)
+ Conni Harrigan
+ Victoria Bennett

#### Contributors:
+ Eisenberg Family Depression Center [(@DepressionCenter)](https://github.com/DepressionCenter/)
+ ITS Summer Internship 2023 and 2024 cohorts


A huge thank you to the ITS Summer Internship teams who created TrackMaster for the Eisenberg Family Depression Center! The project teams include:

***ITS Summer Internship 2023 Project Cohort:*** 
+ Amit Nyamagoudar - anyamag@umich.edu
+ Avinash Singh - singhav@umich.edu
+ Nivethaa Srijayanthi Ravichandran - nivethaa@umich.edu
+ Reed McAlpin - rmcalpin@umich.edu
+ Taha Abbas - tahaa@umich.edu

***ITS Summer Internship 2024 Project Cohort:*** 
+ Mohammad Arjamand Ali - mohamma@umich.edu
+ Atharva Mandar Kulkarni - atharvak@umich.edu
+ Zhanfeng Charlie Zheng - zfzheng@umich.edu
+ Sandeep Dwarkaprasad Jala - jsandeep@umich.edu

***Project sponsors:***
+ Conni Harrigan
+ [Gabriel Mongefranco](https://gabriel.mongefranco.com) [(@gabrielmongefranco)](https://github.com/gabrielmongefranco)
+ Victoria Bennett



#### This work is based in part on the following projects, libraries and/or studies:
+ [DataLaVista](https://code.depressioncenter.org/datalavista) - DataLaVista™ is a lightweight, client-side reporting and dashboard toolkit. It brings the full power of SQL directly to your browser, allowing you to build high-performance visualizations without the need for expensive server-side licenses or complex backend infrastructure.
+ [Modern Script Editor](https://github.com/pnp/sp-dev-fx-webparts/tree/main/samples/react-script-editor) - The PnP/SPFX delivery vehicle used to deploy this "Unit" into modern SharePoint environments.
+ [Microsoft SharePoint REST API](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service) - The primary data uplink for retrieving SharePoint List items and Document Library metadata.
+ [Sitenalyzer](https://github.com/DepressionCenter/Sitenalyzer) - Sitenalyzer helps you extract a data dictionary and security information from your SharePoint sites.


## License
### Copyright Notice
Copyright © 2023-2026 The Regents of the University of Michigan


### Software and Library License
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/gpl-3.0-standalone.html>.


### Documentation License
Permission is granted to copy, distribute and/or modify this document 
under the terms of the GNU Free Documentation License, Version 1.3 
or any later version published by the Free Software Foundation; 
with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts. 
You should have received a copy of the license included in the section entitled "GNU 
Free Documentation License". If not, see <https://www.gnu.org/licenses/fdl-1.3-standalone.html>



## Citation
If you find this repository, code or paper useful for your research, please cite it.

----

Copyright © 2023-2026 The Regents of the University of Michigan
