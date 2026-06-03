// This file is part of TrackMaster
// TrackMaster-People-Search-Box.js: People search box webpart
// Author(s): Gabriel Mongefranco; Victoria Bennett; Conni Harrigan; et. all.
// Summary: Script to the People search box webpart, for use inside a Modern Script Editor webpart.
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
    var siteUrl = typeof _spPageContextInfo !== 'undefined' ? _spPageContextInfo.webAbsoluteUrl : location.origin;
    var peopleListName = 'People';

    // 1. Inject Styles safely
    var css = `
        #simplePeopleSearchContainer { width: 98%; max-width: 380px; background: #fafbfc; border: 1px solid #ececec; border-radius: 9px; box-shadow: 0 2px 12px #ddd; padding: 2px 24px 24px 24px; margin: 1px auto; font-family: sans-serif; }
        #simplePeopleSearchContainer label { font-weight: bold; }
        .autocomplete-wrapper { position: relative; width: 100%; margin-top: 4px; margin-bottom: 2px; }
        #simplePeopleSearchBox { width: 100%; padding: 6px 8px; font-size: 1.1em; border-radius: 5px; border: 1px solid #bbb; box-sizing: border-box; }
        .custom-autocomplete-list { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #bbb; border-top: none; border-radius: 0 0 5px 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 350px; overflow-y: auto; z-index: 99999; margin: 0; padding: 0; list-style: none; display: none; }
        .custom-autocomplete-list li { padding: 8px 14px 8px 11px; border-bottom: 1px solid #eff4fc; cursor: pointer; white-space: normal; }
        .custom-autocomplete-list li:hover { background-color: #e8f4fd !important; }
        .custom-autocomplete-list li.auto-bg-alt { background-color: #f3f8fc; }
        .auto-person-label .line1 { font-weight: 600; color: #175ba5; font-size: 1.07em; }
        .auto-person-label .uniq-name { color: #666; font-size: 0.97em; font-weight: 400; }
        .auto-person-label .line2 { color: #444; font-size: 0.96em; margin-top: 3px; font-style: italic; }
        .auto-person-label .department { color: #2481ce; font-weight: 500; }
    `;
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // 2. Find the container and inject the Search box UI
    var appContainer = document.getElementById('people-search-app');
    
    // Safety check: if the div isn't there, stop the script.
    if (!appContainer) {
        console.error("People Search Error: Could not find the <div id='people-search-app'></div> container.");
        return; 
    }

    appContainer.innerHTML = `
        <div id="simplePeopleSearchContainer">
            <label for="simplePeopleSearchBox">🔍 Search for People:</label>
            <div class="autocomplete-wrapper">
                <input type="text" id="simplePeopleSearchBox" placeholder="Name, uniqname, email, dept..." autocomplete="off" />
                <ul id="custom-autocomplete-list" class="custom-autocomplete-list"></ul>
            </div>
        </div>
    `;

    // 3. Core Application Logic (100% Native JS)
    var input = document.getElementById("simplePeopleSearchBox");
    var list = document.getElementById("custom-autocomplete-list");
    var debounceTimer;

    function fetchContactsNative(query, callback) {
        var esc = encodeURIComponent(query.replace("'", "''"));
        var filter = "substringof('" + esc + "',Title) or substringof('" + esc + "',UniqName) or substringof('" + esc + "',Department) or substringof('" + esc + "',Company) or substringof('" + esc + "',SchoolAffiliation) or substringof('" + esc + "',PreferredEmail) or substringof('" + esc + "',AdditionalEmail1) or substringof('" + esc + "',AdditionalEmail2)";
        var requestUrl = siteUrl + "/_api/web/lists/getbytitle('" + peopleListName + "')/items?$filter=" + filter + "&$top=15&$select=Id,Title,UniqName,ContactType,Email,PreferredEmail,JobTitle,Department,SchoolAffiliation,Company,AdditionalEmail1,AdditionalEmail2,ProfilePictureURL,CenterMember,Active";

        fetch(requestUrl, {
            method: "GET",
            headers: { "Accept": "application/json;odata=verbose" },
            credentials: "same-origin"
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            callback(data.d && data.d.results ? data.d.results : []);
        })
        .catch(function(error) {
            console.error("Search Error:", error);
            callback([]);
        });
    }

    function renderList(results) {
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
            var dept = person.SchoolAffiliation === '' ? person.Company : person.SchoolAffiliation;

            li.innerHTML = 
                '<div class="auto-person-label">' +
                    '<div class="line1">' + (person.Title || '') + ' <span class="uniq-name">(' + (person.UniqName || '') + ')</span></div>' +
                    '<div class="line2">' + jt + ' &mdash; <span class="department">' + (person.Department || '') + '</span></div>' +
                    '<div class="line2"><span class="department">' + (dept || '') + '</span></div>' +
                '</div>';

            // Navigate on click
            li.addEventListener("click", function() {
                window.location.href = siteUrl + "/SitePages/AllEngagementHistory.aspx?PeopleID=" + encodeURIComponent(person.Id) + '#results';
            });

            list.appendChild(li);
        });
        list.style.display = "block";
    }

    // Handle typing
    input.addEventListener("input", function() {
        var term = this.value;
        clearTimeout(debounceTimer);

        if (term.length < 3) {
            list.style.display = "none";
            return;
        }

        debounceTimer = setTimeout(function() {
            fetchContactsNative(term, function(results) {
                renderList(results);
            });
        }, 300);
    });

    // Close the dropdown if the user clicks anywhere outside of it
    document.addEventListener("click", function(e) {
        if (e.target !== input && !list.contains(e.target)) {
            list.style.display = "none";
        }
    });

})();