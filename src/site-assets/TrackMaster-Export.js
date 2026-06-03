// This file is part of TrackMaster
// TrackMaster-Export.js: Site export script (JavaScript version)
// Author(s): Gabriel Mongefranco; Victoria Bennett; Conni Harrigan; et. all.
// Created: 2026-06-03
// Summary: Script to facilitate exporting of site metadata and structure, for use when deploying TrackMaster on an existing site. This is intended to be run from the browser console, and will produce a JSON file containing the exported data.
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
    'use strict';

    // ─── CSS ──────────────────────────────────────────────────────────────────
    var css = [
        '.tm-app{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
        'font-size:14px;color:#323130;line-height:1.5;max-width:820px;}',
        '.tm-title{font-size:22px;font-weight:700;color:#005a9e;margin:0 0 6px;}',
        '.tm-subtitle{color:#605e5c;margin:0 0 16px;font-size:13px;}',
        '.tm-card{background:#fff;border:1px solid #c8c6c4;border-radius:4px;padding:16px;margin-bottom:16px;}',
        '.tm-site-url{font-size:12px;color:#605e5c;margin:0 0 12px;}',
        '.tm-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border:1px solid;',
        'border-radius:2px;font-size:14px;cursor:pointer;font-family:inherit;',
        'transition:background .1s,border-color .1s;}',
        '.tm-btn:focus{outline:2px solid #0078d4;outline-offset:2px;}',
        '.tm-btn:disabled{opacity:.5;cursor:not-allowed;}',
        '.tm-btn-primary{background:#0078d4;border-color:#0078d4;color:#fff;}',
        '.tm-btn-primary:hover:not(:disabled){background:#005a9e;border-color:#005a9e;}',
        '.tm-btn-success{background:#107c41;border-color:#107c41;color:#fff;}',
        '.tm-btn-success:hover:not(:disabled){background:#0b5a2e;border-color:#0b5a2e;}',
        '.tm-btn-sm{padding:4px 10px;font-size:12px;}',
        '.tm-section{margin-top:20px;}',
        '.tm-section-heading{font-size:17px;font-weight:600;color:#323130;margin:0 0 12px;}',
        '.tm-steps{list-style:none;margin:0;padding:0;}',
        '.tm-step{display:flex;align-items:center;gap:10px;padding:8px 0;',
        'border-bottom:1px solid #f3f2f1;}',
        '.tm-step-icon{width:20px;text-align:center;flex-shrink:0;font-size:14px;}',
        '.tm-step-label{flex:1;}',
        '.tm-step-count{font-size:12px;color:#0078d4;font-weight:600;white-space:nowrap;}',
        '.tm-step--pending .tm-step-icon{color:#c8c6c4;}',
        '.tm-step--running .tm-step-icon{color:#0078d4;}',
        '.tm-step--done .tm-step-icon{color:#107c41;}',
        '.tm-step--error .tm-step-icon{color:#a4262c;}',
        '.tm-spinner{display:inline-block;width:13px;height:13px;',
        'border:2px solid #c8c6c4;border-top-color:#0078d4;border-radius:50%;',
        'animation:tm-spin .8s linear infinite;}',
        '@keyframes tm-spin{to{transform:rotate(360deg);}}',
        '.tm-summary-table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px;}',
        '.tm-summary-table th{text-align:left;padding:6px 10px;background:#f3f2f1;',
        'font-weight:600;border-bottom:2px solid #c8c6c4;}',
        '.tm-summary-table td{padding:5px 10px;border-bottom:1px solid #edebe9;vertical-align:top;}',
        '.tm-summary-table td:first-child{color:#605e5c;}',
        '.tm-summary-table tr:last-child td{border-bottom:none;}',
        '.tm-error-log{background:#fdf3f4;border:1px solid #f1a7a7;border-radius:4px;',
        'padding:12px;font-size:12px;font-family:monospace;max-height:200px;',
        'overflow-y:auto;white-space:pre-wrap;word-break:break-all;}',
        '.tm-flow-list{display:flex;flex-direction:column;gap:8px;}',
        '.tm-flow-item{background:#f3f2f1;border-radius:4px;padding:10px 14px;',
        'display:flex;flex-wrap:wrap;align-items:center;gap:8px;}',
        '.tm-flow-title{font-weight:600;flex:1;min-width:180px;}',
        '.tm-flow-desc{color:#605e5c;font-size:12px;flex:0 0 100%;}',
        '.tm-flow-meta{color:#0078d4;font-size:11px;font-family:monospace;flex:0 0 100%;}',
        '.tm-advisor{background:#fff8e1;border:1px solid #f0d45c;border-radius:4px;',
        'padding:10px 14px;font-size:13px;color:#605e5c;margin-bottom:12px;}',
        '.tm-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;',
        'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}'
    ].join('');

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ─── State ────────────────────────────────────────────────────────────────
    var _baseUrl = '';
    var _exportData = null;
    var _errors = [];
    var _steps = [];
    var _reqDigest = null;
    var _reqDigestExpiry = 0;

    // ─── Skip-field set (mirrors Sitenalyzer) ────────────────────────────────
    var SKIP_FIELDS = new Set([
        '_ColorTag', '_ComplianceFlags', '_ComplianceTag', '_ComplianceTagUserId',
        '_ComplianceTagWrittenTime', '_IsRecord', '_LabelAppliedBy', '_LabelSetting',
        '_Level', '_ModerationComments', '_ModerationStatus', '_SysFlow', '_SysProfile',
        '_SysVersion', '_UIVersionString', 'AccessPolicy', 'AppAuthor', 'AppEditor',
        'CheckedOutUser', 'CheckedOutUserId', 'CheckoutUser', 'CheckoutUserId',
        'ColorTag', 'ComplianceAssetId', 'ContentType', 'ContentVersion',
        'Created_x0020_Date', 'DocIcon', 'Edit', 'FSObjType', 'FolderChildCount',
        'GUID', 'HTML_x0020_File_x0020_Type', 'ImageTags', 'InstanceID',
        'IsCheckedoutToLocal', 'IsCurrentVersion', 'ItemChildCount',
        'Last_x0020_Modified', 'MediaServiceImageTags', 'MediaServiceLocation',
        'MetaInfo', 'NoExecute', 'OData__SysFlow', 'OData__SysProfile', 'OData__SysVersion',
        'Order', 'OriginatorId', 'ParentLeafName', 'ParentUniqueId',
        'ParentVersionString', 'ProgId', 'ScopeId', 'SortBehavior',
        'SourceNameConvertedDocument', 'SourceNameConvertedDocumentId',
        'SyncClientId', 'TemplateUrl', 'UIVersionString', 'UniqueId',
        'WorkflowInstanceID', 'WorkflowVersion', 'xd_ProgID', 'xd_Signature'
    ]);

    // ─── Utilities (adapted from Sitenalyzer) ────────────────────────────────

    async function spFetch(url, retries) {
        if (typeof retries === 'undefined') { retries = 5; }
        var headers = { 'Accept': 'application/json;odata=nometadata' };
        var res = await fetch(url, { headers: headers, credentials: 'include' });
        if (res.status === 429 && retries > 0) {
            var after = res.headers.get('Retry-After');
            var wait = after ? parseInt(after, 10) : 10;
            if (wait < 2) { wait = 2; }
            await new Promise(function (r) { setTimeout(r, wait * 1000); });
            return spFetch(url, retries - 1);
        }
        if (!res.ok) {
            var txt = await res.text().catch(function () { return ''; });
            throw new Error('HTTP ' + res.status + ' — ' + url + '\n' + txt.substring(0, 300));
        }
        return res.json();
    }

    function getBaseUrl() {
        if (window._spPageContextInfo && window._spPageContextInfo.webAbsoluteUrl) {
            return window._spPageContextInfo.webAbsoluteUrl.replace(/\/$/, '');
        }
        var path = window.location.pathname;
        if (path.indexOf('/sites/') > -1) {
            var parts = path.split('/');
            var idx = parts.indexOf('sites');
            return window.location.origin + '/' + parts.slice(1, idx + 2).join('/');
        }
        return window.location.origin;
    }

    function getSiteRelativePath() {
        if (window._spPageContextInfo && window._spPageContextInfo.webServerRelativeUrl) {
            return String(window._spPageContextInfo.webServerRelativeUrl).replace(/\/$/, '');
        }
        return getBaseUrl().replace(window.location.origin, '');
    }

    async function getLoggedInUser(targetUrl) {
        try {
            var d = await spFetch(targetUrl + '/_api/web/currentUser?$select=Title,Email,LoginName');
            return { name: d.Title || '', email: d.Email || '', loginName: d.LoginName || '' };
        } catch (e) { return null; }
    }

    async function checkAdminPermissions(targetUrl) {
        try {
            var p = await spFetch(targetUrl + '/_api/web/effectivebasePermissions');
            var low = (parseInt(p.Low, 10) || 0) >>> 0;
            return (low & 0x80000000) !== 0;
        } catch (e) { return false; }
    }

    function cleanGuid(s) {
        return String(s || '').toLowerCase().replace(/[{} ]/g, '');
    }

    function htmlEsc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─── Step Tracker ─────────────────────────────────────────────────────────

    function addStep(id, label) {
        _steps.push({ id: id, label: label, status: 'pending', count: '' });
        renderSteps();
    }

    function setStep(id, status, count) {
        for (var i = 0; i < _steps.length; i++) {
            if (_steps[i].id === id) {
                _steps[i].status = status;
                _steps[i].count = count || '';
                break;
            }
        }
        renderSteps();
    }

    function renderSteps() {
        var el = document.getElementById('tm-steps-list');
        if (!el) { return; }
        var html = '<ul class="tm-steps" role="list">';
        _steps.forEach(function (step) {
            var sc = 'tm-step--' + (step.status || 'pending');
            var icon;
            if (step.status === 'running') {
                icon = '<span class="tm-spinner" role="img" aria-label="Loading"></span>';
            } else if (step.status === 'done') {
                icon = '<span aria-hidden="true">&#10003;</span>';
            } else if (step.status === 'error') {
                icon = '<span aria-hidden="true">&#10007;</span>';
            } else {
                icon = '<span aria-hidden="true">&#9675;</span>';
            }
            html += '<li class="tm-step ' + sc + '">' +
                '<span class="tm-step-icon">' + icon + '</span>' +
                '<span class="tm-step-label">' + htmlEsc(step.label) + '</span>' +
                '<span class="tm-step-count">' + htmlEsc(step.count) + '</span>' +
                '</li>';
        });
        html += '</ul>';
        el.innerHTML = html;
    }

    function logError(msg) {
        _errors.push(msg);
        var el = document.getElementById('tm-error-log');
        if (el) { el.textContent += msg + '\n'; }
    }

    // ─── Export Utilities ─────────────────────────────────────────────────────

    function shouldIncludeList(lst) {
        if (lst.BaseTemplate !== 101 && lst.BaseType !== 1) { return true; }
        var title = lst.Title || '';
        if (title === 'Documents') { return true; }
        if (title.length >= 9 && title.slice(-9) === 'Documents') { return false; }
        return true;
    }

    function parseViewFieldsXml(xml) {
        var refs = [];
        var re = /<FieldRef[^>]+Name="([^"]+)"/g;
        var m;
        while ((m = re.exec(xml || '')) !== null) { refs.push(m[1]); }
        return refs;
    }

    function normalizeField(f, listIdMap) {
        var choices = [];
        if (f.Choices && f.Choices.results) { choices = f.Choices.results; }
        else if (Array.isArray(f.Choices)) { choices = f.Choices; }

        var lookupListTitle = '';
        if (f.LookupList) {
            var guid = cleanGuid(f.LookupList);
            lookupListTitle = (listIdMap && listIdMap[guid]) || '';
        }

        var fmt = '';
        if (f.CustomFormatter) {
            fmt = typeof f.CustomFormatter === 'string' ? f.CustomFormatter : JSON.stringify(f.CustomFormatter);
        }

        return {
            fieldId: f.Id || '',
            internalName: f.InternalName || '',
            title: f.Title || '',
            type: f.TypeAsString || '',
            description: f.Description || '',
            required: !!f.Required,
            indexed: !!f.Indexed,
            enforceUnique: !!f.EnforceUniqueValues,
            defaultValue: f.DefaultValue || '',
            maxLength: (f.MaxLength !== null && f.MaxLength !== undefined) ? f.MaxLength : null,
            choices: choices,
            lookupListTitle: lookupListTitle,
            lookupField: f.LookupField || '',
            formula: f.Formula || '',
            schemaXml: f.SchemaXml || '',
            customFormatter: fmt
        };
    }

    function arrayBufferToBase64(buffer) {
        var bytes = new Uint8Array(buffer);
        var binary = '';
        var chunk = 8192;
        for (var i = 0; i < bytes.length; i += chunk) {
            var slice = bytes.subarray(i, i + chunk);
            binary += String.fromCharCode.apply(null, slice);
        }
        return window.btoa(binary);
    }

    function downloadJson(data) {
        var json = JSON.stringify(data, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        var now = new Date();
        var ds = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0');
        a.href = url;
        a.download = 'TrackMaster-Export-' + ds + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function downloadTextFile(text, filename) {
        var blob = new Blob([text || ''], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ─── Export Phase Functions ───────────────────────────────────────────────

    async function fetchSiteMetadata(baseUrl) {
        var d = await spFetch(baseUrl + '/_api/web?$select=Title,Description,SiteLogoUrl,Url,Id');
        return {
            title: d.Title || '',
            description: d.Description || '',
            logo: d.SiteLogoUrl || '',
            url: d.Url || baseUrl,
            id: d.Id || ''
        };
    }

    async function fetchNavigation(baseUrl) {
        var ql = [];
        var tn = [];
        try {
            var qlD = await spFetch(baseUrl + '/_api/web/navigation/quicklaunch?$expand=Children&$select=Title,Url,Children');
            ql = (qlD.value || []).map(function (n) {
                return {
                    title: n.Title || '',
                    url: n.Url || '',
                    children: (n.Children || []).map(function (c) {
                        return { title: c.Title || '', url: c.Url || '' };
                    })
                };
            });
        } catch (e) { logError('Quick launch: ' + e.message); }
        try {
            var tnD = await spFetch(baseUrl + '/_api/web/navigation/toplinkbar?$expand=Children&$select=Title,Url,Children');
            tn = (tnD.value || []).map(function (n) {
                return {
                    title: n.Title || '',
                    url: n.Url || '',
                    children: (n.Children || []).map(function (c) {
                        return { title: c.Title || '', url: c.Url || '' };
                    })
                };
            });
        } catch (e) { logError('Top nav: ' + e.message); }
        return { quickLaunch: ql, topNav: tn };
    }

    async function fetchRegionalSettings(baseUrl) {
        try {
            var s = await spFetch(baseUrl + '/_api/web/regionalSettings?$select=LocaleId,FirstDayOfWeek');
            var tz = await spFetch(baseUrl + '/_api/web/regionalSettings/timeZone?$select=Id,Description');
            return {
                localeId: s.LocaleId || 1033,
                firstDayOfWeek: s.FirstDayOfWeek || 0,
                timeZoneId: tz.Id || 0,
                timeZoneDescription: tz.Description || ''
            };
        } catch (e) {
            logError('Regional settings: ' + e.message);
            return { localeId: 1033, firstDayOfWeek: 0, timeZoneId: 0, timeZoneDescription: '' };
        }
    }

    async function fetchTaxonomy(baseUrl) {
        try {
            var siteD = await spFetch(baseUrl + '/_api/site?$select=Id');
            var siteId = siteD.Id || '';
            if (!siteId) { return { groups: [] }; }

            var termBase = baseUrl + '/_api/v2.1/sites/' + siteId + '/termStore';
            var groupsD = await spFetch(termBase + '/groups');
            var scGroups = (groupsD.value || []).filter(function (g) { return g.scope === 'siteCollection'; });

            var groups = [];
            for (var gi = 0; gi < scGroups.length; gi++) {
                var grp = scGroups[gi];
                var grpObj = { name: grp.displayName || '', id: grp.id || '', description: grp.description || '', sets: [] };
                var setsD = await spFetch(termBase + '/groups/' + grp.id + '/sets');
                var sets = setsD.value || [];
                for (var si = 0; si < sets.length; si++) {
                    var set = sets[si];
                    var setName = (set.localizedNames && set.localizedNames[0]) ? set.localizedNames[0].name : '';
                    var setObj = { name: setName, id: set.id || '', description: set.description || '', terms: [] };
                    var termsD = await spFetch(termBase + '/sets/' + set.id + '/terms');
                    setObj.terms = (termsD.value || []).map(function (t) {
                        var lbl = '';
                        if (t.labels && t.labels.length > 0) {
                            var found = null;
                            t.labels.forEach(function (l) { if (l.isDefault) { found = l; } });
                            lbl = found ? found.name : t.labels[0].name;
                        }
                        return {
                            name: lbl,
                            id: t.id || '',
                            description: (t.descriptions && t.descriptions[0]) ? t.descriptions[0].description : ''
                        };
                    });
                    grpObj.sets.push(setObj);
                }
                groups.push(grpObj);
            }
            return { groups: groups };
        } catch (e) {
            logError('Taxonomy: ' + e.message);
            return { groups: [] };
        }
    }

    async function fetchSiteColumns(baseUrl) {
        try {
            var sel = 'Id,InternalName,Title,TypeAsString,Description,Required,MaxLength,Choices,' +
                'LookupField,LookupList,DefaultValue,Formula,Indexed,CustomFormatter,SchemaXml,Group,Hidden';
            var flt = "(Hidden eq false and Group ne '_Hidden' and TypeAsString ne 'Computed' and TypeAsString ne 'ContentTypeId')";
            var d = await spFetch(baseUrl + '/_api/web/fields?$select=' + sel + '&$filter=' + encodeURIComponent(flt));
            return (d.value || []).filter(function (f) {
                if (!f.Group || f.Group === '_Hidden') { return false; }
                if (f.InternalName.charAt(0) === '_') { return false; }
                if (SKIP_FIELDS.has(f.InternalName)) { return false; }
                return true;
            }).map(function (f) { return normalizeField(f, {}); });
        } catch (e) {
            logError('Site columns: ' + e.message);
            return [];
        }
    }

    async function fetchFields(baseUrl, listGuid, isDocLib, listIdMap) {
        var flt = "(Hidden eq false and TypeAsString ne 'Computed' and startswith(InternalName,'_') eq false" +
            " and (TypeAsString ne 'LookupMulti' or (TypeAsString eq 'LookupMulti' and ReadOnlyField eq false and IsDependentLookup eq false)))" +
            " or InternalName eq 'Editor' or InternalName eq 'Author' or InternalName eq 'Created'" +
            " or InternalName eq 'Modified' or InternalName eq 'ID' or InternalName eq 'Title' or InternalName eq 'TaxKeyword'";
        var sel = 'Id,InternalName,Title,TypeAsString,Description,Required,MaxLength,Choices,' +
            'LookupField,LookupList,IsHidden,Hidden,ReadOnlyField,IsDependentLookup,DefaultValue,' +
            'Formula,Indexed,CustomFormatter,SchemaXml,EnforceUniqueValues,AllowMultipleValues';
        var url = baseUrl + "/_api/web/lists(guid'" + listGuid + "')/fields?$select=" + sel + '&$filter=' + encodeURIComponent(flt);
        var d = await spFetch(url);
        var fields = (d.value || []).filter(function (f) {
            if (SKIP_FIELDS.has(f.InternalName)) { return false; }
            if (SKIP_FIELDS.has(f.Title)) { return false; }
            if (f.InternalName.indexOf('_x003a_') > -1) { return false; }
            if (f.IsDependentLookup) { return false; }
            return true;
        });

        // Build map for mandatory-field fallbacks
        var allMap = {};
        fields.forEach(function (f) { allMap[f.InternalName] = f; });

        var mandatory = ['ID', 'Title', 'Created', 'Modified', 'Author', 'Editor'];
        mandatory.forEach(function (name) {
            if (!allMap[name]) {
                var t = 'Text';
                if (name === 'ID') { t = 'Counter'; }
                else if (name === 'Author' || name === 'Editor') { t = 'User'; }
                else if (name === 'Created' || name === 'Modified') { t = 'DateTime'; }
                fields.push({ InternalName: name, Title: name, TypeAsString: t });
            }
        });

        if (isDocLib) {
            ['FileRef', 'FileLeafRef', 'FileDirRef'].forEach(function (name) {
                if (!allMap[name]) {
                    fields.push(allMap[name] || { InternalName: name, Title: name, TypeAsString: 'Text' });
                }
            });
        }

        return fields.map(function (f) { return normalizeField(f, listIdMap); });
    }

    async function fetchViews(baseUrl, listGuid) {
        var sel = 'Id,Title,DefaultView,Hidden,PersonalView,ViewQuery,RowLimit,Paged,ViewType,CustomFormatter,ListViewXml';
        var url = baseUrl + "/_api/web/lists(guid'" + listGuid + "')/views?$expand=ViewFields&$select=" + sel;
        var d = await spFetch(url);
        return (d.value || [])
            .filter(function (v) { return !v.Hidden && !v.PersonalView; })
            .map(function (v) {
                var vf = [];
                if (v.ViewFields && v.ViewFields.SchemaXml) {
                    vf = parseViewFieldsXml(v.ViewFields.SchemaXml);
                } else if (v.ViewFields && Array.isArray(v.ViewFields.Items)) {
                    vf = v.ViewFields.Items;
                }
                var fmt = '';
                if (v.CustomFormatter) {
                    fmt = typeof v.CustomFormatter === 'string' ? v.CustomFormatter : JSON.stringify(v.CustomFormatter);
                }
                return {
                    id: v.Id || '',
                    title: v.Title || '',
                    defaultView: !!v.DefaultView,
                    hidden: !!v.Hidden,
                    viewQuery: v.ViewQuery || '',
                    viewFields: vf,
                    rowLimit: v.RowLimit || 30,
                    paged: !!v.Paged,
                    viewType: v.ViewType || '',
                    customFormatter: fmt,
                    listViewXml: v.ListViewXml || ''
                };
            });
    }

    async function fetchFolders(baseUrl, listGuid) {
        var url = baseUrl + "/_api/web/lists(guid'" + listGuid + "')/RootFolder/Folders?$select=Name,UniqueId,ItemCount,ServerRelativeUrl";
        var d = await spFetch(url);
        return (d.value || [])
            .filter(function (f) { return f.Name !== 'Forms'; })
            .map(function (f) {
                return { name: f.Name || '', serverRelativeUrl: f.ServerRelativeUrl || '', itemCount: f.ItemCount || 0 };
            });
    }

    async function fetchDocLibFiles(baseUrl, siteRelPath) {
        var result = [];
        var templatePath = siteRelPath + '/Documents/TrackMaster Resources/Data Import Templates';
        var filesUrl = baseUrl + "/_api/web/GetFolderByServerRelativeUrl('" +
            encodeURIComponent(templatePath) + "')/Files?$select=Name,ServerRelativeUrl,Length";
        var filesD;
        try {
            filesD = await spFetch(filesUrl);
        } catch (e) {
            return result; // Folder may not exist yet
        }
        var files = (filesD.value || []).filter(function (f) {
            var n = String(f.Name || '').toLowerCase();
            return n.length > 5 && n.slice(-5) === '.xlsx';
        });
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            try {
                var fileRes = await fetch(
                    baseUrl + "/_api/web/GetFileByServerRelativeUrl('" + encodeURIComponent(file.ServerRelativeUrl) + "')/$value",
                    { credentials: 'include' }
                );
                if (fileRes.ok) {
                    var buf = await fileRes.arrayBuffer();
                    result.push({
                        path: 'TrackMaster Resources/Data Import Templates/' + file.Name,
                        name: file.Name,
                        contentBase64: arrayBufferToBase64(buf)
                    });
                }
            } catch (e2) {
                logError('File download failed: ' + file.Name + ' — ' + e2.message);
            }
        }
        return result;
    }

    async function fetchAutomationFlows(baseUrl) {
        var names = ['Automations List', 'AutomationFlows', 'Automation Flows'];
        for (var i = 0; i < names.length; i++) {
            try {
                var url = baseUrl + "/_api/web/lists/getbytitle('" + encodeURIComponent(names[i]) +
                    "')/items?$select=Title,Description,FlowID,FlowURL,FlowType,AutomationSystem,Code&$top=5000";
                var d = await spFetch(url);
                if (d.value) {
                    return d.value.map(function (item) {
                        return {
                            title: item.Title || '',
                            description: item.Description || '',
                            flowId: item.FlowID || '',
                            flowUrl: item.FlowURL || '',
                            flowType: item.FlowType || '',
                            automationSystem: item.AutomationSystem || '',
                            code: item.Code || ''
                        };
                    });
                }
            } catch (e) { /* try next name */ }
        }
        return [];
    }

    async function fetchListsAndRelated(baseUrl) {
        var listFlt = '(Hidden eq false and IsApplicationList eq false' +
            ' and BaseTemplate ne 115 and BaseTemplate ne 121 and BaseTemplate ne 330 and BaseTemplate ne 544)';
        var listSel = 'Id,Title,Description,BaseTemplate,BaseType,Hidden,IsApplicationList,' +
            'EntityTypeName,HasUniqueRoleAssignments,EnableVersioning,EnableModeration,ItemCount';

        var listsD = await spFetch(baseUrl + '/_api/web/lists?$select=' + listSel + '&$filter=' + encodeURIComponent(listFlt));
        var allLists = (listsD.value || []).filter(shouldIncludeList);
        setStep('lists', 'done', allLists.length + ' lists');

        var listIdMap = {};
        allLists.forEach(function (l) { listIdMap[cleanGuid(l.Id)] = l.Title; });

        var siteRelPath = getSiteRelativePath();
        var result = [];
        var totalFields = 0;
        var totalViews = 0;
        var totalFolders = 0;
        var totalFiles = 0;

        for (var i = 0; i < allLists.length; i++) {
            var lst = allLists[i];
            var isDocLib = (lst.BaseTemplate === 101 || lst.BaseType === 1);
            var entry = {
                title: lst.Title,
                description: lst.Description || '',
                baseTemplate: lst.BaseTemplate,
                baseType: lst.BaseType,
                settings: {
                    enableVersioning: !!lst.EnableVersioning,
                    enableModeration: !!lst.EnableModeration,
                    hasUniqueRoleAssignments: !!lst.HasUniqueRoleAssignments
                },
                columns: [],
                views: [],
                folders: [],
                files: []
            };

            try {
                entry.columns = await fetchFields(baseUrl, lst.Id, isDocLib, listIdMap);
                totalFields += entry.columns.length;
            } catch (e) {
                logError('Fields [' + lst.Title + ']: ' + e.message);
            }

            try {
                entry.views = await fetchViews(baseUrl, lst.Id);
                totalViews += entry.views.length;
            } catch (e) {
                logError('Views [' + lst.Title + ']: ' + e.message);
            }

            if (isDocLib) {
                try {
                    entry.folders = await fetchFolders(baseUrl, lst.Id);
                    totalFolders += entry.folders.length;
                } catch (e) {
                    logError('Folders [' + lst.Title + ']: ' + e.message);
                }

                if (lst.Title === 'Documents') {
                    try {
                        entry.files = await fetchDocLibFiles(baseUrl, siteRelPath);
                        totalFiles += entry.files.length;
                    } catch (e) {
                        logError('Files [Documents]: ' + e.message);
                    }
                }
            }

            result.push(entry);

            // Periodic progress update
            if ((i + 1) % 5 === 0 || i === allLists.length - 1) {
                setStep('structure', 'running',
                    (i + 1) + '/' + allLists.length + ' — ' + totalFields + ' fields, ' + totalViews + ' views');
            }
        }

        setStep('structure', 'done',
            allLists.length + ' lists, ' + totalFields + ' fields, ' + totalViews + ' views, ' +
            totalFolders + ' folders' + (totalFiles > 0 ? ', ' + totalFiles + ' files' : ''));

        return result;
    }

    // ─── Main Export Pipeline ─────────────────────────────────────────────────

    async function runExport() {
        var exportBtn = document.getElementById('tm-btn-export');
        if (exportBtn) { exportBtn.disabled = true; }
        _errors = [];
        _steps = [];
        _exportData = null;
        _baseUrl = getBaseUrl();

        addStep('site', 'Site metadata');
        addStep('nav', 'Navigation (quick launch, top bar)');
        addStep('region', 'Regional settings');
        addStep('user', 'Current user');
        addStep('tax', 'Term store (site-scoped groups, sets, terms)');
        addStep('siteCol', 'Site-scoped columns');
        addStep('lists', 'Discovering lists and libraries');
        addStep('structure', 'Fields, views, folders, and files per list');
        addStep('flows', 'Automation flows (Automations List items)');
        addStep('build', 'Assembling export package');

        document.getElementById('tm-progress-section').removeAttribute('hidden');

        var result = {
            _meta: {
                version: '1.0',
                tool: 'TrackMaster-Export',
                exportedAt: new Date().toISOString(),
                exportedBy: {},
                sourceUrl: _baseUrl
            },
            site: {},
            navigation: { quickLaunch: [], topNav: [] },
            termStore: { groups: [] },
            siteColumns: [],
            lists: [],
            automationFlows: []
        };

        setStep('site', 'running', '');
        try {
            result.site = await fetchSiteMetadata(_baseUrl);
            setStep('site', 'done', result.site.title);
        } catch (e) {
            setStep('site', 'error', '');
            logError('Site metadata: ' + e.message);
        }

        setStep('nav', 'running', '');
        try {
            result.navigation = await fetchNavigation(_baseUrl);
            var nc = result.navigation.quickLaunch.length + result.navigation.topNav.length;
            setStep('nav', 'done', nc + ' nodes');
        } catch (e) {
            setStep('nav', 'error', '');
            logError('Navigation: ' + e.message);
        }

        setStep('region', 'running', '');
        try {
            result.site.regionalSettings = await fetchRegionalSettings(_baseUrl);
            setStep('region', 'done', result.site.regionalSettings.timeZoneDescription || '');
        } catch (e) {
            setStep('region', 'error', '');
            logError('Regional settings: ' + e.message);
        }

        setStep('user', 'running', '');
        try {
            var user = await getLoggedInUser(_baseUrl);
            result._meta.exportedBy = user || {};
            setStep('user', 'done', (user && user.name) ? user.name : '');
        } catch (e) {
            setStep('user', 'error', '');
            logError('User: ' + e.message);
        }

        setStep('tax', 'running', '');
        try {
            result.termStore = await fetchTaxonomy(_baseUrl);
            var gc = result.termStore.groups ? result.termStore.groups.length : 0;
            setStep('tax', 'done', gc + ' groups');
        } catch (e) {
            setStep('tax', 'error', '');
            logError('Taxonomy: ' + e.message);
        }

        setStep('siteCol', 'running', '');
        try {
            result.siteColumns = await fetchSiteColumns(_baseUrl);
            setStep('siteCol', 'done', result.siteColumns.length + ' columns');
        } catch (e) {
            setStep('siteCol', 'error', '');
            logError('Site columns: ' + e.message);
        }

        setStep('lists', 'running', '');
        setStep('structure', 'running', '');
        try {
            result.lists = await fetchListsAndRelated(_baseUrl);
        } catch (e) {
            setStep('lists', 'error', '');
            setStep('structure', 'error', '');
            logError('Lists: ' + e.message);
        }

        setStep('flows', 'running', '');
        try {
            result.automationFlows = await fetchAutomationFlows(_baseUrl);
            setStep('flows', 'done', result.automationFlows.length + ' flows');
        } catch (e) {
            setStep('flows', 'error', '');
            logError('Automation flows: ' + e.message);
        }

        setStep('build', 'running', '');
        _exportData = result;
        setStep('build', 'done', '');

        // Reveal summary and download button
        renderPreview(result);
        document.getElementById('tm-summary-section').removeAttribute('hidden');
        var dlBtn = document.getElementById('tm-btn-download');
        if (dlBtn) { dlBtn.removeAttribute('hidden'); dlBtn.focus(); }

        // Reveal flow code section
        if (result.automationFlows && result.automationFlows.length > 0) {
            renderFlowCodeSection(result.automationFlows);
            document.getElementById('tm-flows-section').removeAttribute('hidden');
        }

        // Reveal error section
        if (_errors.length > 0) {
            document.getElementById('tm-errors-section').removeAttribute('hidden');
        }

        if (exportBtn) { exportBtn.disabled = false; }
    }

    // ─── UI Renderers ─────────────────────────────────────────────────────────

    function renderPreview(data) {
        var lists = data.lists || [];
        var docLibs = lists.filter(function (l) { return l.baseTemplate === 101 || l.baseType === 1; });
        var generic = lists.filter(function (l) { return l.baseTemplate !== 101 && l.baseType !== 1; });
        var totalCols = 0;
        var totalViews = 0;
        var totalFmt = 0;
        var totalFolders = 0;
        var totalFiles = 0;
        lists.forEach(function (l) {
            totalCols += l.columns ? l.columns.length : 0;
            totalViews += l.views ? l.views.length : 0;
            totalFolders += l.folders ? l.folders.length : 0;
            totalFiles += l.files ? l.files.length : 0;
            (l.columns || []).forEach(function (c) { if (c.customFormatter) { totalFmt++; } });
            (l.views || []).forEach(function (v) { if (v.customFormatter) { totalFmt++; } });
        });
        var groups = (data.termStore && data.termStore.groups) ? data.termStore.groups : [];
        var setCount = 0;
        var termCount = 0;
        groups.forEach(function (g) {
            setCount += g.sets ? g.sets.length : 0;
            (g.sets || []).forEach(function (s) { termCount += s.terms ? s.terms.length : 0; });
        });
        var rows = [
            ['Lists (total)', lists.length],
            ['  Generic lists', generic.length],
            ['  Document libraries', docLibs.length],
            ['Total columns', totalCols],
            ['Total views', totalViews],
            ['Custom formatters', totalFmt],
            ['Folders', totalFolders],
            ['Files included (.xlsx)', totalFiles],
            ['Site-scoped columns', (data.siteColumns || []).length],
            ['Term groups', groups.length],
            ['Term sets', setCount],
            ['Terms', termCount],
            ['Automation flows', (data.automationFlows || []).length],
            ['Exported at', data._meta ? data._meta.exportedAt : ''],
            ['Exported by', data._meta && data._meta.exportedBy ? (data._meta.exportedBy.name || '') : ''],
            ['Source site', data._meta ? data._meta.sourceUrl : '']
        ];
        var html = '<table class="tm-summary-table" role="table">' +
            '<caption class="tm-sr-only">Export summary statistics</caption>' +
            '<thead><tr><th scope="col">Item</th><th scope="col">Value</th></tr></thead>' +
            '<tbody>';
        rows.forEach(function (row) {
            html += '<tr><td>' + htmlEsc(String(row[0])) + '</td><td>' + htmlEsc(String(row[1])) + '</td></tr>';
        });
        html += '</tbody></table>';
        var el = document.getElementById('tm-summary');
        if (el) { el.innerHTML = html; }
    }

    function renderFlowCodeSection(flows) {
        var el = document.getElementById('tm-flows-list');
        if (!el) { return; }
        var html = '<div class="tm-advisor">Save each downloaded file to ' +
            '<code>src/power-platform/flows/</code> in the TrackMaster repository ' +
            'so the flow code is version-controlled and searchable.</div>' +
            '<div class="tm-flow-list">';
        for (var i = 0; i < flows.length; i++) {
            var f = flows[i];
            var safeTitle = htmlEsc(f.title || 'Flow ' + (i + 1));
            html += '<div class="tm-flow-item">' +
                '<span class="tm-flow-title">' + safeTitle + '</span>' +
                (f.description ? '<span class="tm-flow-desc">' + htmlEsc(f.description) + '</span>' : '') +
                (f.flowId ? '<span class="tm-flow-meta">ID: ' + htmlEsc(f.flowId) + '</span>' : '') +
                '<button type="button" class="tm-btn tm-btn-sm tm-btn-primary"' +
                ' data-action="download-flow" data-flow-index="' + i + '"' +
                ' aria-label="Download source code for ' + safeTitle + '">Download .js</button>' +
                '</div>';
        }
        html += '</div>';
        el.innerHTML = html;
    }

    // ─── Event Handling ───────────────────────────────────────────────────────

    function handleClick(e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) { return; }
        var action = btn.getAttribute('data-action');
        if (action === 'export') {
            runExport().catch(function (err) { logError('Fatal: ' + (err.message || String(err))); });
        } else if (action === 'download-json') {
            if (_exportData) { downloadJson(_exportData); }
        } else if (action === 'download-flow') {
            var idx = parseInt(btn.getAttribute('data-flow-index'), 10);
            if (_exportData && _exportData.automationFlows && _exportData.automationFlows[idx]) {
                var flow = _exportData.automationFlows[idx];
                var fname = (flow.title || ('flow-' + idx)).replace(/[^a-z0-9_\-]/gi, '_') + '.js';
                downloadTextFile(flow.code || '', fname);
            }
        }
    }

    // ─── DOM Construction ─────────────────────────────────────────────────────

    function renderApp(root) {
        var baseUrl = getBaseUrl();
        root.innerHTML =
            '<div class="tm-app">' +
            '<h1 class="tm-title">TrackMaster Export</h1>' +
            '<p class="tm-subtitle">Exports all site configuration (lists, columns, views, formatters, taxonomy, navigation, and automation flow code) as a JSON file.</p>' +
            '<div class="tm-card">' +
            '<p class="tm-site-url">Running on: <strong>' + htmlEsc(baseUrl) + '</strong></p>' +
            '<button type="button" class="tm-btn tm-btn-primary" data-action="export" id="tm-btn-export">' +
            'Export Site Configuration' +
            '</button>' +
            '</div>' +
            '<section id="tm-progress-section" class="tm-section" hidden aria-labelledby="tm-prog-hd">' +
            '<h2 class="tm-section-heading" id="tm-prog-hd">Export Progress</h2>' +
            '<div id="tm-steps-list" role="status" aria-live="polite" aria-label="Export progress"></div>' +
            '</section>' +
            '<section id="tm-summary-section" class="tm-section" hidden aria-labelledby="tm-sum-hd">' +
            '<h2 class="tm-section-heading" id="tm-sum-hd">Export Summary</h2>' +
            '<div id="tm-summary"></div>' +
            '<button type="button" class="tm-btn tm-btn-success" data-action="download-json" id="tm-btn-download" hidden>' +
            'Download Export JSON' +
            '</button>' +
            '</section>' +
            '<section id="tm-flows-section" class="tm-section" hidden aria-labelledby="tm-flows-hd">' +
            '<h2 class="tm-section-heading" id="tm-flows-hd">Automation Flow Source Code</h2>' +
            '<div id="tm-flows-list"></div>' +
            '</section>' +
            '<section id="tm-errors-section" class="tm-section" hidden aria-labelledby="tm-err-hd">' +
            '<h2 class="tm-section-heading" id="tm-err-hd" style="color:#a4262c">Errors / Warnings</h2>' +
            '<div id="tm-error-log" role="alert" aria-live="assertive" class="tm-error-log"></div>' +
            '</section>' +
            '</div>';

        root.addEventListener('click', handleClick);
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    var root = document.getElementById('tm-export-app');
    if (root) {
        renderApp(root);
    }

})();
