/* TrackMaster Survey Response Formatter for Qualtrics Script Task */
/* Author(s): Gabriel Mongefranco, Eisenberg Family Depression Center, University of Michigan
/* License: Licensed under the GNU Public License version 3 (GPL v3) or later. */
/* Copyright: Copyright © 2025 The Regents of the University of Michigan */
/*                                                               */
/* Summary: Formats common survey data as JSON, using a pre-defined schema */
/*          for the TrackMaster Membership Tracking System.*/
/*          (see: https://michmed.org/trackmaster) */
/* Usage:   In Qualtrics, edit your survey, and go to Workflows. Add a new workflow triggered on survey response. */
/*          Add a Survey Response task. */
/*          Add a Script task, and copy and paste this entire file in it. */
/*          Go to the EDIT VARIABLES HERE section in the code inside your script task. */
/*          Fill out the Form Title. This should be a descriptive title, like an email subject. */
/*          Fill out the Form Type and Program. The values must match TrackMaster exactly. */
/*          Replace the example entries with the values from your Qualtrics survey. */
/*          If a value does not apply, leave it blank (but keep the double quotes: ""). */
/*          Add an Email task and follow the steps in the email task template, located in this same repository. */
/*          Test it by filling out and submitting the form. */
/*          The email in the TrackMaster automation mailbox will contain encoded text (a long alpha-numeric string). This is normal. */
/*          The form data should land in the Forms and Surveys list in TrackMaster within 5-15 minutes. */
/* Website: https://depressioncenter.org/ */
/* Code: https://github.com/DepressionCenter */
/* Documentation: https://michmed.org/efdc-kb */
/*                                                               */
function codeTask() {
	/* Begin Data Cleaning Functions */
	function cleanEmail(emailAddress) {
		let tmpAddress = emailAddress.toString().replace("''","").trim().toLowerCase();
		if(!tmpAddress.includes("@") && tmpAddress!="") {
			tmpAddress = tmpAddress.trim() + "@umich.edu";
		}
		if(tmpAddress.includes("+")) {
			tmpAddress = tmpAddress.split("+").shift().toString().trim() + "@" + tmpAddress.split("@").pop().toString().trim();
		}
		if(tmpAddress=="na" || tmpAddress=="n/a" || tmpAddress=="na.") {
			tmpAddress = "";
		}
		return tmpAddress.toString();
    }
	
	function cleanUniqName(emailAddress) {
		let tmpAddress = cleanEmail(emailAddress.toString());
		if(tmpAddress.endsWith("umich.edu")) {
			tmpAddress = tmpAddress.replace('@med.umich.edu','').replace('@umich.edu','').trim().toLowerCase()
		}
		if(tmpAddress=="na" || tmpAddress=="n/a" || tmpAddress=="na.") {
			tmpAddress = "";
		}
		return tmpAddress.toString();
	}
	
	function cleanText(textToClean) {
		return textToClean.toString().replace("''","").replace('""','').trim().toString();
	}
	/* End Data Cleaning Functions */

	/* Required Variables */
	var surveyData = {};
	
	
	/* ******************* */
	/* EDIT VARIABLES HERE */
	/* ******************* */
	
	// Prepare survey data in JSON format
	surveyData = {
		SurveyData: {
			FormTitle: "Mobile Data Expert Network (MDEN) Registration",
			FormType: "Join Group Request", // Must match TrackMaster
			SubmissionDate: "${rm://Field/EndDate}",
			Submitter: {
				UniqName: cleanUniqName("${q://QID17/ChoiceTextEntryValue}"),
				Email: cleanEmail("${q://QID4/ChoiceTextEntryValue}"),
				FullName: cleanText("${q://QID1/ChoiceTextEntryValue}"),
				JobTitle: cleanText("${q://QID16/ChoiceTextEntryValue}"),
				Department: cleanText(""),
				School: cleanText(""),
				Company: cleanText("University of Michigan")
			},
			PI: {
				UniqName: cleanUniqName("${q://QID3/ChoiceTextEntryValue}"),
				Email: cleanEmail("${q://QID3/ChoiceTextEntryValue}"),
				FullName: cleanText(""),
				JobTitle: cleanText(""),
				Department: cleanText(""),
				School: cleanText(""),
				Company: cleanText("University of Michigan")
			},
			Team: [
				// When asking for information about additional team members, format as follows:
				// { UniqName: cleanUniqName(""), ... },
				// { UniqName: cleanUniqName(""), ... },
				// ...
			],
			Program: "Mobile Data Expert Network (MDEN)", // Must match program name in TrackMaster. If empty, defaults to Research Support.
			Source: "Qualtrics", // Free text. Could be Website, Qualtrics, campaign name, or a specific URL.
			Details: "Join MDEN form submission.", // Free text.
			Tags: ["Mobile Technologies", "MDEN"] // Tags to apply in TrackMaster. Format: ["tag1", "tag2", "tag3"...]
		}
	};
	
	// The following converts the JSON payload to a Base 64 encoded string, so it doesn't get garbled during transit.
	return {"result": Buffer.from(unescape(encodeURIComponent(JSON.stringify(surveyData)))).toString('base64')};
}

