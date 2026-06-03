// This file is part of TrackMaster
// TrackMaster-People-Search-Full-Page.js: People search page webpart
// Author(s): Gabriel Mongefranco; Victoria Bennett; Conni Harrigan; et. all.
// Summary: Script to the People search page webpart, for use inside a Modern Script Editor webpart.
// Notes: See README file for documentation and full license information.
// 
// Copyright © 2023-2026 The Regents of the University of Michigan
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along
// with this program. If not, see https://www.gnu.org/licenses/.

(function () {
    // Wait for page context, fallback to origin if missing
    var siteUrl = typeof _spPageContextInfo !== 'undefined' ? _spPageContextInfo.webAbsoluteUrl : location.origin;
    
    var peopleListName = 'People';
    var engagementListName = 'Consultations';
    var eventListName = 'Event Summary';
    var programsListName = 'Program Participant Tracking';
    var emailsListName = 'Email Tracker';

    // 1. INJECT STYLES (Combined Full App + Native Autocomplete styles)
    var css = `
        #peopleSearchContainer { max-width: 540px; background: #fafbfc; border: 1px solid #ececec; border-radius: 9px; box-shadow: 0 2px 12px #ddd; padding: 24px; margin: 22px auto; font-family: "Segoe UI", Arial, sans-serif; }
        #peopleSearchContainer label { font-weight: bold; }
        
        /* Native Autocomplete Wrapper Styles */
        .autocomplete-wrapper { position: relative; width: 100%; }
        #peopleSearchBox { width: 100%; padding: 8px 10px; font-size: 1.3em; border-radius: 5px; border: 1px solid #bbb; margin-top: 6px; margin-bottom: 10px; box-sizing: border-box; }
        .custom-autocomplete-list { position: absolute; top: calc(100% - 10px); left: 0; right: 0; background: #fff; border: 1px solid #bbb; border-top: none; border-radius: 0 0 5px 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 350px; overflow-y: auto; z-index: 99999; margin: 0; padding: 0; list-style: none; display: none; }
        .custom-autocomplete-list li { padding: 8px 14px 8px 11px; border-bottom: 1px solid #eff4fc; cursor: pointer; white-space: normal; background-color: #ffffff; }
        .custom-autocomplete-list li:hover { background-color: #e8f4fd !important; }
        .custom-autocomplete-list li.auto-bg-alt { background-color: #f3f8fc; }
        
        .auto-person-label .line1 { font-weight: 600; color: #175ba5; font-size: 1.07em; }
        .auto-person-label .uniq-name { color: #666; font-size: 0.97em; font-weight: 400; }
        .auto-person-label .line2 { color: #444; font-size: 0.96em; margin-top: 3px; font-style: italic; }
        .auto-person-label .department { color: #2481ce; font-weight: 500; }

        #personDetails { margin-top: 21px; border-top: 1px solid #eee; padding-top: 17px; background: #f3faff; border-radius: 7px; font-size: 1.04em; box-shadow: 0 1px 5px #eef; display: none; animation: fadeIn .5s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .person-detail-row { margin: 7px 0; }
        .field-label { font-weight: 500; color: #2086d7; }
        
        /* Related lists */
        .related-list-section { background: #f7fbff; border-radius: 8px; box-shadow: 0 2px 12px #e5ecf7; margin: 35px 0 20px 0; padding: 20px; display: none; animation: fadeIn .5s; }
        .related-list-section h3 { margin-top: 0; margin-bottom: 15px; color: #16588f; }
        .related-list-section h2 { margin-top: 0; margin-bottom: 15px; color: #16588f; font-size: 1.5em; }
        .list-table { width: 100%; border-collapse: collapse; font-size: 0.99em; }
        .list-table th { background: #e5ecf7; color: #16588f; border-bottom: 2px solid #dde6f3; padding: 7px; text-align: left; }
        .list-table td { padding: 7px; border-bottom: 1px solid #f0f4fa; }
        .list-table tr:nth-child(even) { background: #f1f6fc; }
        
        /* Contact Card Styles */
        .profile-contact-card { display: flex; align-items: flex-start; padding: 24px 18px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 18px rgba(30,80,140,.10); gap: 22px; margin-bottom: 16px; min-height: 140px; }
        .profile-photo-wrap { width: 102px; min-width: 102px; display: flex; align-items: flex-start; justify-content: center; }
        .profile-photo { width: 92px; height: 92px; object-fit: cover; border-radius: 50%; border: 3px solid #2186d7; background: #f0f4fa; box-shadow: 0 3px 12px #eaf1fa; }
        .profile-photo.initials-circle { display: flex; align-items: center; justify-content: center; background-color: #cdd9ec; color: #175ba5; font-size: 2.4em; font-weight: bold; text-transform: uppercase; overflow: hidden; }
        .profile-card-details { flex: 1; display: flex; flex-wrap: wrap; gap: 0 42px; }
        .profile-card-main { flex: 1 1 210px; min-width: 220px; }
        .profile-card-meta { flex: 1 1 130px; min-width: 140px; }
        .profile-card-details h2 { margin-top: 0; font-size: 1.22em; margin-bottom: 7px; font-weight: 700; color: #2186d7; line-height: 1.28; }
        .profile-card-details .person-detail-row { margin-bottom: 8px; line-height: 1.5; font-size: 1.04em; }
        .profile-card-links { margin-top: 10px; font-size: 0.98em; }
        .profile-card-links a { color: #15639c; text-decoration: none; margin-right: 12px; transition: color 0.2s; }
        .profile-card-links a:hover { color: #00579f; text-decoration: underline; }
        .profile-card-links a.disabled, .profile-card-links a[href="#"] { pointer-events: none; color: #bbb !important; text-decoration: none !important; cursor: default; }
        .profile-card-inactive { color: #a40000; font-weight: 600; font-size: 0.94em; margin-left: 8px; }

        @media (max-width: 600px) {
            .profile-contact-card { flex-direction: column; align-items: center; }
            .profile-card-details { flex-direction: column; gap:10px 0; }
            .profile-card-main, .profile-card-meta { min-width:0; }
            .profile-photo-wrap { margin-bottom: 6px; }
        }
    `;
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // 2. BUILD THE UI
    var appContainer = document.getElementById('people-search-app-full');
    if (!appContainer) {
        console.error("Error: Could not find the <div id='people-search-app-full'></div> container.");
        return; 
    }

    appContainer.innerHTML = `
        <div><a name="search" id="search"></a></div>
        <div id="peopleSearchContainer">
            <label for="peopleSearchBox">🔍 Search for People:</label>
            <div class="autocomplete-wrapper">
                <input type="text" id="peopleSearchBox" placeholder="Name, uniqname, email, dept., school or company..." autocomplete="off" />
                <ul id="custom-autocomplete-list" class="custom-autocomplete-list"></ul>
            </div>
        </div>
        <div><a name="results" id="results"></a></div>
        <div id="searchResultsSection">
            <div id="personDetailsSection" class="related-list-item">
                <div id="personDetails"></div>
            </div>
            <div id="engagementHistorySection" class="related-list-section">
                <h2>Consultations</h2>
                <table id="engagementHistoryTable" class="list-table"></table>
            </div>
            <div id="eventAttendanceSection" class="related-list-section">
                <h2>Events</h2>
                <table id="eventAttendanceTable" class="list-table"></table>
            </div>
            <div id="programsSection" class="related-list-section">
                <h2>Programs</h2>
                <table id="programsTable" class="list-table"></table>
            </div>
            <div id="emailsSection" class="related-list-section">
                <h2>Emails</h2>
                <table id="emailsTable" class="list-table"></table>
            </div>
        </div>
    `;

    // 3. UTILITY FUNCTIONS
    function getUrlParameter(name) {
        name = name.trim();
        var params = new URLSearchParams(window.location.search);
        var options = [name, name.toUpperCase(), name.toLowerCase()];
        for (var i = 0; i < options.length; i++) {
            if (params.has(options[i])) return params.get(options[i]).trim();
        }
        return null;
    }

    function makeLink(url, text) {
        var safeUrl = url && url.trim() && url.trim() !== '#' ? url.trim() : '';
        if (!safeUrl || safeUrl === '#') {
            return `<a class="disabled" tabindex="-1" aria-disabled="true">${text}</a>`;
        }
        return `<a href="${safeUrl}" target="_blank">${text}</a>`;
    }

    function renderInitialsCircle(label, size) {
        let initials = label.split(' ').filter(part => part && part.length > 0).map(part => part[0].toUpperCase()).join('').substring(0,2);
        return `<div class="profile-photo initials-circle" style="width:${size}px;height:${size}px;">${initials}</div>`;
    }

    function getSharePointPhotoUrl(teamsAccount) {
        var account = "";
        if (teamsAccount && typeof teamsAccount === 'string') account = teamsAccount;
        else if (teamsAccount && teamsAccount.EMail) account = teamsAccount.EMail;
        if (account) return siteUrl + "/_layouts/15/userphoto.aspx?size=M&accountname=" + encodeURIComponent(account);
        return null;
    }

    function getProfilePhotoHTML(person, label, nameSize = 92) {
        if (person.ProfilePictureURL && person.ProfilePictureURL.trim() !== '' && person.ProfilePictureURL.trim().toLowerCase() !== 'null' && person.ProfilePictureURL.trim().toLowerCase().startsWith('https')) {
            return `<img class="profile-photo" src="${person.ProfilePictureURL.trim()}" alt="${label}" width="${nameSize}" height="${nameSize}" onerror="this.onerror=null;this.replaceWith(renderInitialsCircle('${label}',${nameSize}))" />`;
        }
        var spUrl = person.TeamsAccount ? getSharePointPhotoUrl(person.TeamsAccount) : null;
        if (spUrl) {
            return `<img class="profile-photo" src="${spUrl}" alt="${label}" width="${nameSize}" height="${nameSize}" onerror="this.onerror=null;this.replaceWith(renderInitialsCircle('${label}',${nameSize}))" />`;
        }
        return renderInitialsCircle(label, nameSize);
    }

    function renderTable(tableId, columns, items) {
        var tableEl = document.getElementById(tableId);
        var thead = '<tr>' + columns.map(c => c.label.includes('Date') ? `<th style="min-width:80px;">${c.label}</th>` : `<th>${c.label}</th>`).join('') + '</tr>';
        var rows = items.map(item => {
            return '<tr>' + columns.map(c => {
                let val = typeof c.render === 'function' ? c.render(item) : (item[c.key] || '');
                return '<td>' + val + '</td>';
            }).join('') + '</tr>';
        }).join('');
        tableEl.innerHTML = '<thead>' + thead + '</thead><tbody>' + rows + '</tbody>';
    }

    function getMultiLookupString(field, id) {
        return field + '/Id eq ' + id;
    }

    // NATIVE FETCH WRAPPER
    function fetchSPData(url, callback, errorCallback) {
        fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json;odata=verbose" },
            credentials: "same-origin"
        })
        .then(response => response.json())
        .then(data => {
            if (data.d && data.d.results) callback(data.d.results);
            else if (data.d) callback(data.d); // Single item fallback
            else callback([]);
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            if(errorCallback) errorCallback();
            else callback([]);
        });
    }

    // 4. DISPLAY FUNCTIONS
    function showDetails(person) {
        var label = person.Title || person.UniqName || '';
        var photoHTML = getProfilePhotoHTML(person, label);
        var centerCheck = (person.CenterMember === '1') ? '<span style="color:#2078D7; font-size:1.15em;" title="Center Member">&#x2714;</span>&nbsp;' : '';
        var inactiveTag = (!person.Active || (person.Active+"").toLowerCase() === "false") ? '<span class="profile-card-inactive">[INACTIVE]</span>' : '';
        var hideJobRank = false;
        var ct = (person.ContactType || '').toLowerCase();
        if (ct.startsWith('peer') || ct.includes('community') || ct.includes('vendor') || ct.includes('student') || ct.includes('m staff')) {
            hideJobRank = true;
        }

        var websiteUrl = (person.Website && person.Website.Url && person.Website.Url.trim().toLowerCase().startsWith('http')) ? person.Website.Url.trim() : '#';
        var depProfileUrl = (person.DepressionCenterProfile && person.DepressionCenterProfile.Url && person.DepressionCenterProfile.Url.trim().toLowerCase().startsWith('http')) ? person.DepressionCenterProfile.Url.trim() : null;
        var extProfileUrl = (person.ExternalProfile && person.ExternalProfile.Url && person.ExternalProfile.Url.trim().toLowerCase().startsWith('http')) ? person.ExternalProfile.Url.trim() : null;
        
        var hasUniqName = person.UniqName && !person.UniqName.includes('@');
        var mCommunityUrl = hasUniqName ? 'https://mcommunity.umich.edu/person/' + person.UniqName : null;
        var profileUrl = depProfileUrl || extProfileUrl || mCommunityUrl || '#';
        var expertsUrl = (person.MREID && person.MREID.trim()!='') 
            ? (person.MREID.trim().toLowerCase().startsWith('http') ? person.MREID.trim() : 'https://experts.umich.edu/' + person.MREID.trim()) 
            : (hasUniqName && person.Title ? 'https://experts.umich.edu/search?by=text&type=user&v=' + encodeURIComponent(person.Title.trim()) : '#');

        var html = `
          <div class="profile-contact-card">
            <div class="profile-photo-wrap">${photoHTML}</div>
            <div class="profile-card-details">
              <div class="profile-card-main">
                <h2>
                  <a href="${siteUrl}/Lists/People/DispForm.aspx?ID=${person.Id}" target="_blank" class="field-label">${person.Title || '--'}</a>
                  ${centerCheck} ${inactiveTag}
                </h2>
                <div class="person-detail-row"><span class="field-label">Job Title:</span> ${person.JobTitle || '--'}</div>
                ${hideJobRank ? '' : `<div class="person-detail-row"><span class="field-label">Job Rank:</span> ${person.Job_x0020_Rank || '--'}</div>`}
                <div class="person-detail-row"><span class="field-label">Department:</span> ${person.Department || '--'}</div>
                <div class="person-detail-row"><span class="field-label">School:</span> ${person.SchoolAffiliation || '--'}</div>
                <div class="person-detail-row"><span class="field-label">Company:</span> ${person.Company || '--'}</div>
              </div>
              <div class="profile-card-meta">
                <div class="person-detail-row"><span class="field-label">Contact Type:</span> ${person.ContactType || '--'}</div>
                <div class="person-detail-row"><span class="field-label">UniqName:</span> ${person.UniqName || '--'}</div>
                <div class="person-detail-row"><span class="field-label">Email:</span> <a href="mailto:${(person.Email||'').trim()}">${person.Email || '--'}</a></div>
                <div class="profile-card-links">
                  <span class="field-label">Links:</span>
                  ${makeLink(websiteUrl, 'Website')}
                  ${makeLink(profileUrl, 'Profile')}
                  ${makeLink(expertsUrl, 'Michigan Experts')}
                </div>
              </div>
            </div>
          </div>
        `;
        var pd = document.getElementById("personDetails");
        pd.innerHTML = html;
        pd.style.display = "block";
    }

    function loadEngagementHistory(personId) {
        const columns = [
            { key: 'Date', label: 'Consultation Date', render: i => i.Date ? i.Date.split('T')[0] : '--' },
            { key: 'ServicesReceived', label: 'Consultation Type', render: i => `<a href="${siteUrl}/Lists/Engagement%20History/DispForm.aspx?ID=${i.Id}" target="_blank" class="field-label">${i.ServicesReceived && i.ServicesReceived.Title ? i.ServicesReceived.Title : '--'}</a>` },
            { key: 'PI', label: 'Project PI', render: i => i.PI ? i.PI.Title : '' },
            { key: 'Recipient', label: 'Attendees', render: i => i.Recipient && i.Recipient.results ? i.Recipient.results.map(r => r.Title).join(', ') : '' },
            { key: 'hiddenProgram', label: 'Program', render: i => i.ServicesReceived && i.ServicesReceived.hiddenProgram ? i.ServicesReceived.hiddenProgram : '--' },
            { key: 'hiddenProvidedBy', label: 'Team', render: i => i.ServicesReceived && i.ServicesReceived.hiddenProvidedBy ? i.ServicesReceived.hiddenProvidedBy : '--' }
        ];
        document.getElementById("engagementHistorySection").style.display = "block";
        document.getElementById("engagementHistoryTable").innerHTML = '<tr><td>Loading...</td></tr>';
        
        var filter = `PI/Id eq ${personId} or Recipient/Id eq ${personId}`;
        var url = siteUrl + "/_api/web/lists/getbytitle('" + engagementListName + "')/items?$filter=" + encodeURIComponent(filter) + "&$select=Id,Title,Date,PI/Id,PI/Title,Recipient/Id,Recipient/Title,ServicesReceived/Title,ServicesReceived/Id,ServicesReceived/hiddenProgram,ServicesReceived/hiddenProvidedBy&$expand=PI,Recipient,ServicesReceived&$orderBy=Date%20desc";
        
        fetchSPData(url, function(items) {
            if(items.length === 0) document.getElementById("engagementHistoryTable").innerHTML = '<tr><td colspan="' + columns.length + '"><i>No records found</i></td></tr>';
            else renderTable("engagementHistoryTable", columns, items);
        }, function() { document.getElementById("engagementHistoryTable").innerHTML = '<tr><td colspan="' + columns.length + '"><i>Error loading records</i></td></tr>'; });
    }

    function loadEventAttendance(personId) {
        const columns = [
            { key: 'EventDate', label: 'Event Date', render: i => i.EventDate ? i.EventDate.split('T')[0] : '--' },
            { key: 'Title', label: 'Event Title', render: i => `<a href="${siteUrl}/Lists/Event%20Attendance/DispForm.aspx?ID=${i.Id}" target="_blank" class="field-label">${i.Title || '--'}</a>` },
            { key: 'Program', label: 'Program', render: i => i.Program && i.Program.Title ? i.Program.Title : '' },
            { key: 'Registrants', label: 'Registrant?', render: i => (i.Registrants && i.Registrants.results && i.Registrants.results.some(r => r.Id === personId)) ? '✔️' : '' },
            { key: 'Attendees0', label: 'Attendee?', render: i => (i.Attendees0 && i.Attendees0.results && i.Attendees0.results.some(r => r.Id === personId)) ? '✔️' : '' },
            { key: 'Speakers', label: 'Speaker?', render: i => (i.Speakers && i.Speakers.results && i.Speakers.results.some(r => r.Id === personId)) ? '✔️' : '' },
            { key: 'Vendors', label: 'Vendor?', render: i => (i.Vendors && i.Vendors.results && i.Vendors.results.some(r => r.Id === personId)) ? '✔️' : '' }
        ];
        document.getElementById("eventAttendanceSection").style.display = "block";
        document.getElementById("eventAttendanceTable").innerHTML = '<tr><td>Loading...</td></tr>';

        var filter = [getMultiLookupString("Registrants", personId), getMultiLookupString("Attendees0", personId), getMultiLookupString("Speakers", personId), getMultiLookupString("Vendors", personId)].join(" or ");
        var url = siteUrl + "/_api/web/lists/getbytitle('" + eventListName + "')/items?$filter=" + encodeURIComponent(filter) + "&$select=Id,Title,EventDate,Program/Id,Program/Title,Registrants/Id,Registrants/Title,Attendees0/Id,Attendees0/Title,Speakers/Id,Speakers/Title,Vendors/Id,Vendors/Title&$expand=Program,Registrants,Attendees0,Speakers,Vendors&$orderBy=EventDate%20desc";
        
        fetchSPData(url, function(items) {
            if(items.length === 0) document.getElementById("eventAttendanceTable").innerHTML = '<tr><td colspan="' + columns.length + '"><i>No records found</i></td></tr>';
            else renderTable("eventAttendanceTable", columns, items);
        }, function() { document.getElementById("eventAttendanceTable").innerHTML = '<tr><td colspan="' + columns.length + '"><i>Error loading records</i></td></tr>'; });
    }

    function loadPrograms(personId) {
        const columns = [
            { key: 'ApplicationDate', label: 'Application Date', render: i => i.ApplicationDate ? i.ApplicationDate.split('T')[0] : '--' },
            { key: 'ProgramCycle', label: 'Program Cycle', render: i => `<a href="${siteUrl}/Lists/ProgramParticipantTracking/DispForm.aspx?ID=${i.Id}" target="_blank" class="field-label">${i.ProgramCycle && i.ProgramCycle.Title ? i.ProgramCycle.Title : '--'}</a>` },
            { key: 'ApprovalStatus', label: 'Approval Status' },
            { key: 'TotalAwardAmount', label: 'Awarded', render: i => '$' + (isNaN(Number(i.TotalAwardAmount)) ? '0' : Number(i.TotalAwardAmount).toLocaleString()) },
            { key: 'TotalExpenseAmount', label: 'Spent', render: i => '$' + (isNaN(Number(i.TotalExpenseAmount)) ? '0' : Number(i.TotalExpenseAmount).toLocaleString()) },
            { key: 'TotalBalanceAmount', label: 'Balance', render: i => '$' + (isNaN(Number(i.TotalBalanceAmount)) ? '0' : Number(i.TotalBalanceAmount).toLocaleString()) }
        ];
        document.getElementById("programsSection").style.display = "block";
        document.getElementById("programsTable").innerHTML = '<tr><td>Loading...</td></tr>';

        var filter = [getMultiLookupString("Participant", personId), getMultiLookupString("PrimaryContact", personId)].join(" or ");
        var url = siteUrl + "/_api/web/lists/getbytitle('" + programsListName + "')/items?$filter=" + encodeURIComponent(filter) + "&$select=Id,Title,ApplicationDate,ApprovalStatus,TotalAwardAmount,TotalExpenseAmount,TotalBalanceAmount,ProgramCycle/Id,ProgramCycle/Title&$expand=ProgramCycle&$orderBy=ApplicationDate%20desc";
        
        fetchSPData(url, function(items) {
            if(items.length === 0) document.getElementById("programsTable").innerHTML = '<tr><td colspan="' + columns.length + '"><i>No records found</i></td></tr>';
            else renderTable("programsTable", columns, items);
        }, function() { document.getElementById("programsTable").innerHTML = '<tr><td colspan="' + columns.length + '"><i>Error loading records</i></td></tr>'; });
    }

    function loadEmails(personId) {
        const columns = [
            { key: 'DateSent', label: 'Date Sent', render: i => i.DateSent ? i.DateSent.split('T')[0] : '--' },
            { key: 'Title', label: 'Email Subject', render: i => `<a href="${siteUrl}/Lists/EmailTracker/DispForm.aspx?ID=${i.Id}" target="_blank" class="field-label">${i.Title || '--'}</a>` },
            { key: 'Program', label: 'Program', render: i => i.Program && i.Program.Title ? i.Program.Title : '' },
            { key: 'Team', label: 'Team', render: i => i.Team && i.Team.Title ? i.Team.Title : '' }
        ];
        document.getElementById("emailsSection").style.display = "block";
        document.getElementById("emailsTable").innerHTML = '<tr><td>Loading...</td></tr>';

        var filter = getMultiLookupString("EmailRecipientsPeople", personId);
        var url = siteUrl + "/_api/web/lists/getbytitle('" + emailsListName + "')/items?$filter=" + encodeURIComponent(filter) + "&$select=Id,Title,DateSent,Team/Id,Team/Title,Program/Id,Program/Title,EmailRecipientsPeople/Id&$expand=Program,Team,EmailRecipientsPeople&$orderBy=DateSent%20desc";
        
        fetchSPData(url, function(items) {
            if(items.length === 0) document.getElementById("emailsTable").innerHTML = '<tr><td colspan="' + columns.length + '"><i>No records found</i></td></tr>';
            else renderTable("emailsTable", columns, items);
        }, function() { document.getElementById("emailsTable").innerHTML = '<tr><td colspan="' + columns.length + '"><i>Error loading records</i></td></tr>'; });
    }


    // 5. MASTER SELECTION FUNCTION
    function selectPerson(person, scrollTargetId) {
        document.getElementById("peopleSearchBox").value = person.Title;
        showDetails(person);
        loadEngagementHistory(person.Id);
        loadEventAttendance(person.Id);
        loadPrograms(person.Id);
        loadEmails(person.Id);
        
        setTimeout(function() {
            var anchor = document.getElementById(scrollTargetId);
            if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }


    // 6. NATIVE AUTOCOMPLETE LOGIC
    var input = document.getElementById("peopleSearchBox");
    var list = document.getElementById("custom-autocomplete-list");
    var debounceTimer;

    input.addEventListener("input", function() {
        var term = this.value;
        clearTimeout(debounceTimer);

        if (term.length < 3) {
            list.style.display = "none";
            return;
        }

        debounceTimer = setTimeout(function() {
            var esc = encodeURIComponent(term.replace("'", "''"));
            var filter = "substringof('" + esc + "',Title) or substringof('" + esc + "',UniqName) or substringof('" + esc + "',Department) or substringof('" + esc + "',Company) or substringof('" + esc + "',SchoolAffiliation) or substringof('" + esc + "',PreferredEmail) or substringof('" + esc + "',AdditionalEmail1) or substringof('" + esc + "',AdditionalEmail2)";
            var url = siteUrl + "/_api/web/lists/getbytitle('" + peopleListName + "')/items?$filter=" + filter + "&$top=10&$select=Id,Title,UniqName,ContactType,Email,PreferredEmail,JobTitle,Job_x0020_Rank,Department,SchoolAffiliation,Company,AdditionalEmail1,AdditionalEmail2,CenterMember,Active,ProfilePictureURL,Website,MREID,DepressionCenterProfile,ExternalProfile,TeamsAccount/EMail&$expand=TeamsAccount";
            
            fetchSPData(url, function(results) {
                list.innerHTML = "";
                if (results.length === 0) {
                    list.style.display = "none";
                    return;
                }

                results.forEach(function(person, idx) {
                    var li = document.createElement("li");
                    li.className = idx % 2 ? "auto-bg-alt" : "";

                    var jt = (person.JobTitle || '').split(',')[0].trim();
                    jt = jt.length > 40 ? jt.substring(0, 40) + "..." : jt;
                    var dept = (person.SchoolAffiliation === '') ? person.Company : person.SchoolAffiliation;

                    li.innerHTML = 
                        '<div class="auto-person-label">' +
                            '<div class="line1">' + (person.Title || '') + ' <span class="uniq-name">(' + (person.UniqName || '') + ')</span></div>' +
                            '<div class="line2">' + jt + ' &mdash; <span class="department">' + (person.Department || '') + '</span></div>' +
                            '<div class="line2"><span class="department">' + (dept || '') + '</span></div>' +
                        '</div>';

                    li.addEventListener("click", function() {
                        list.style.display = "none";
                        selectPerson(person, 'search');
                    });

                    list.appendChild(li);
                });
                list.style.display = "block";
            });
        }, 300);
    });

    document.addEventListener("click", function(e) {
        if (e.target !== input && !list.contains(e.target)) list.style.display = "none";
    });


    // 7. AUTO-LOAD LOGIC ON MOUNT
    function tryAutoLoadPersonById() {
        var personIdParam = getUrlParameter('PeopleID');
        if (personIdParam && !isNaN(personIdParam)) {
            var url = siteUrl + "/_api/web/lists/getbytitle('" + peopleListName + "')/items(" + personIdParam + ")?$select=Id,Title,UniqName,ContactType,Email,PreferredEmail,JobTitle,Job_x0020_Rank,Department,SchoolAffiliation,Company,AdditionalEmail1,AdditionalEmail2,CenterMember,Active,ProfilePictureURL,Website,MREID,DepressionCenterProfile,ExternalProfile,TeamsAccount/EMail&$expand=TeamsAccount";
            
            fetchSPData(url, function(person) {
                if (person && person.Title) {
                    selectPerson(person, 'results'); // Scroll to results instead of search bar
                } else {
                    document.getElementById("personDetails").innerHTML = "<span style='color:red;font-weight:bold;'>No person found for ID " + personIdParam + ".</span>";
                    document.getElementById("personDetails").style.display = "block";
                }
            }, function() {
                document.getElementById("personDetails").innerHTML = "<span style='color:red;font-weight:bold;'>Error loading person ID " + personIdParam + ".</span>";
                document.getElementById("personDetails").style.display = "block";
            });
        }
    }

    // Initialize Auto-load
    tryAutoLoadPersonById();

})();