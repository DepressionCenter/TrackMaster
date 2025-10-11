![Depression Center Logo](https://github.com/DepressionCenter/.github/blob/main/images/EFDCLogo_375w.png "depressioncenter.org")

# TrackMaster Integrations - Qualtrics

## Description
This integration allows sending survey responses from Qualtrics to TrackMaster. Due to security restrictions for API access in Michigan Medicine's environment, and for consistency with other integrations, the data is transferred via email and processed by Power Automate.

![Send-to-TrackMaster-Workflow.png](https://github.com/DepressionCenter/TrackMaster/blob/main/Integrations/Qualtrics/Send-to-TrackMaster-Workflow.png?raw=true "Send to TrackMaster Workflow - Overview")

![TrackMaster-Forms-and-Surveys-Integrations-Example.png](https://github.com/DepressionCenter/TrackMaster/blob/main/Integrations/Qualtrics/TrackMaster-Forms-and-Surveys-Integrations-Example.png?raw=true "TrackMaster Forms and Surveys Qualtrics Integration Example")


## Quick Start Guide
+ In your Qualtics survey, create a new Workflow and name it "Send to TrackMaster".
+ Edit the workflow, and add a Code task.
+ Copy and paste the contents of [TrackMaster-Survey-Response-Formatter-for-Qualtrics-Script-Task.js](https://github.com/DepressionCenter/TrackMaster/blob/main/Integrations/Qualtrics/TrackMaster-Survey-Response-Formatter-for-Qualtrics-Script-Task.js) into the Code task, and fill out the details per the instructions in the script, and click Save.
+ Add an Email task, and configure it per the instructions in [TrackMaster-Email-Template-for-Qualtrics-Email-Task.md](https://github.com/DepressionCenter/TrackMaster/blob/main/Integrations/Qualtrics/TrackMaster-Email-Template-for-Qualtrics-Email-Task.md).
+ Save the workflow.
+ To test it, fill out and submit the survey.
  + Check that the email shows in your TrackMaster automation mailbox.
  + Within 5-15 minutes, the form should appear in TrackMaster under Engagement -> Forms and Surveys.


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