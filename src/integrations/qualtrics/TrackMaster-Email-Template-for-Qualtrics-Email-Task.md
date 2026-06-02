![Depression Center Logo](https://github.com/DepressionCenter/.github/blob/main/images/EFDCLogo_375w.png "depressioncenter.org")

# TrackMaster Integrations - Qualtrics - Email Template for Qualtrics Email Task

## Description
Email template to use when creating a workflow in Qualtrics to send survey data to TrackMaster. This task should be added after the code task.

![Send-to-TrackMaster-Workflow-Email-Task.png](https://github.com/DepressionCenter/TrackMaster/blob/main/Integrations/Qualtrics/Send-to-TrackMaster-Workflow-Email-Task.png?raw=true "Send to TrackMaster Workflow - Email Task")

![Send-to-TrackMaster-Workflow-Email-Task-Details.png](https://github.com/DepressionCenter/TrackMaster/blob/main/Integrations/Qualtrics/Send-to-TrackMaster-Workflow-Email-Task-Details.png?raw=true "Send to TrackMaster Workflow - Email Task Details")


## Quick Start Guide
+ You should have already completed the previous steps for creating a workflow in your Qualtrics survey, and added a Script task.
+ Add an Email task.
+ Enter your TrackMaster automation mailbox address in the To box.
+ If your TrackMaster Power Automate flow is configured to accept emails from a specific email address, enter that in the From box.
+ The subject must start with: [TrackMaster]
  + Example: [TrackMaster] Mobile Data Expert Network (MDEN) Registration
+ In the email body, insert the output from the code task.
+ In the email body, switch to Code View, and wrap the code task variable inside <code> </code> tags.
  + Example:
  ```html
  <code>~{ch://OCAC_ZGseKMzXf8ZEOuK/result}</code>
  ```
+ Under options, check Include Response Report and Show Full Question Text. This will be used in the description or notes in TrackMaster.
+ Set Expiration to Never.
+ Save


## Documentation

### Detailed Instructions
+ Detailed setup and use instructions are available in the TrackMaster section of the EFDC knowledge base at: https://michmed.org/trackmaster


## Additional Resources
+ Companion knowledge base articles: [TrackMaster Documentation](https://michmed.org/trackmaster).


## About the Team
The Mobile Technologies Core provides investigators across the University of Michigan the support and guidance needed to utilize mobile technologies and digital mental health measures in their studies. Experienced faculty and staff offer hands-on consultative services to researchers throughout the University – regardless of specialty or research focus.



## Contact
To get in touch, contact the individual developers in the check-in history.

If you need assistance identifying a contact person, email the EFDC's Mobile Technologies Core at: efdc-mobiletech@umich.edu.



## Credits
#### Contributors:
+ Eisenberg Family Depression Center [(@DepressionCenter)](https://github.com/DepressionCenter/)
+ Gabriel Mongefranco [(@gabrielmongefranco)](https://github.com/gabrielmongefranco)


#### This work is based in part on the following projects, libraries and/or studies:
+ Qualtrics survey workflows


## License
### Copyright Notice
Copyright © 2025 The Regents of the University of Michigan


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

Copyright © 2025 The Regents of the University of Michigan