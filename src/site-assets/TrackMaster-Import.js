// This file is part of TrackMaster
// TrackMaster-Import.js: Site import script (JavaScript version)
// Author(s): Gabriel Mongefranco; Victoria Bennett; Conni Harrigan; et. all.
// Created: 2026-06-03
// Summary: Script to facilitate importing of site metadata and structure, for use when deploying TrackMaster on an existing site. This is intended to be run from the browser console, and will consume a JSON file containing the imported data.
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
        '.tm-site-url{font-size:12px;color:#605e5c;margin:0 0 12px;}',
        '.tm-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border:1px solid;',
        'border-radius:2px;font-size:14px;cursor:pointer;font-family:inherit;',
        'transition:background .1s,border-color .1s;}',
        '.tm-btn:focus{outline:2px solid #0078d4;outline-offset:2px;}',
        '.tm-btn:disabled{opacity:.5;cursor:not-allowed;}',
        '.tm-btn-primary{background:#0078d4;border-color:#0078d4;color:#fff;}',
        '.tm-btn-primary:hover:not(:disabled){background:#005a9e;border-color:#005a9e;}',
        '.tm-section-heading{font-size:17px;font-weight:600;color:#323130;margin:0 0 12px;}',
        '.tm-phase{background:#fff;border:1px solid #c8c6c4;border-radius:4px;',
        'padding:16px;margin-bottom:16px;}',
        '.tm-file-drop{border:2px dashed #c8c6c4;border-radius:4px;padding:24px 16px;',
        'text-align:center;cursor:pointer;color:#605e5c;background:#faf9f8;',
        'transition:border-color .2s,background .2s;user-select:none;}',
        '.tm-file-drop:hover,.tm-file-drop.tm-dragover{border-color:#0078d4;background:#e8f3fb;color:#0078d4;}',
        '.tm-file-drop-icon{font-size:28px;display:block;margin-bottom:8px;}',
        '.tm-options{margin-bottom:12px;}',
        '.tm-options label{display:block;margin-bottom:8px;cursor:pointer;user-select:none;}',
        '.tm-options input[type=checkbox]{margin-right:8px;cursor:pointer;}',
        '.tm-summary-table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px;}',
        '.tm-summary-table th{text-align:left;padding:6px 10px;background:#f3f2f1;',
        'font-weight:600;border-bottom:2px solid #c8c6c4;}',
        '.tm-summary-table td{padding:5px 10px;border-bottom:1px solid #edebe9;vertical-align:top;}',
        '.tm-summary-table td:first-child{color:#605e5c;}',
        '.tm-summary-table tr:last-child td{border-bottom:none;}',
        '.tm-log{font-size:13px;}',
        '.tm-log-entry{display:flex;gap:8px;padding:3px 0;border-bottom:1px solid #f3f2f1;',
        'word-break:break-word;}',
        '.tm-log-entry:last-child{border-bottom:none;}',
        '.tm-log-badge{font-size:11px;font-weight:700;flex-shrink:0;width:46px;padding-top:1px;}',
        '.tm-log-ok .tm-log-badge{color:#107c41;}',
        '.tm-log-skip .tm-log-badge{color:#605e5c;}',
        '.tm-log-warn .tm-log-badge{color:#d83b01;}',
        '.tm-log-error .tm-log-badge{color:#a4262c;}',
        '.tm-log-info .tm-log-badge{color:#0078d4;}',
        '.tm-log-phase .tm-log-badge{color:#005a9e;font-size:12px;}',
        '.tm-log-phase .tm-log-text{font-weight:600;color:#005a9e;}',
        '.tm-log-scroll{max-height:420px;overflow-y:auto;padding-right:2px;}',
        '.tm-error-log{background:#fdf3f4;border:1px solid #f1a7a7;border-radius:4px;',
        'padding:12px;font-size:12px;font-family:monospace;max-height:200px;',
        'overflow-y:auto;white-space:pre-wrap;word-break:break-all;}',
        '.tm-advisor{background:#fff8e1;border:1px solid #f0d45c;border-radius:4px;',
        'padding:10px 14px;font-size:13px;color:#605e5c;margin-bottom:12px;}',
        '.tm-advisor ul{margin:6px 0 0 18px;padding:0;}',
        '.tm-advisor li{margin-bottom:4px;}',
        '.tm-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;',
        'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}'
    ].join('');

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ─── State ────────────────────────────────────────────────────────────────
    var _importData = null;
    var _baseUrl = '';
    var _errors = [];
    var _reqDigest = null;
    var _reqDigestExpiry = 0;

    // ─── System fields to skip when creating columns ──────────────────────────
    var SYSTEM_FIELDS = new Set([
        'ID', 'Title', 'Author', 'Editor', 'Created', 'Modified', 'Attachments',
        'ContentType', 'ContentTypeId', 'FileRef', 'FileLeafRef', 'FileDirRef',
        'FSObjType', 'CheckoutUser', 'UniqueId', 'ProgId', '_ModerationStatus',
        '_Level', 'TaxKeyword', 'TaxCatchAll', 'TaxCatchAllLabel', 'Counter'
    ]);
    var LOOKUP_TYPES = new Set(['Lookup', 'LookupMulti']);
    var TAXONOMY_TYPES = new Set(['TaxonomyFieldType', 'TaxonomyFieldTypeMulti']);

    // ─── Utilities ───────────────────────────────────────────────────────────

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
            throw new Error('HTTP ' + res.status + ' — ' + url.split('?')[0] + '\n' + txt.substring(0, 300));
        }
        return res.json();
    }

    async function spPost(url, body, digest) {
        var res = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-Type': 'application/json;odata=nometadata',
                'X-RequestDigest': digest
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            var txt = '';
            try { txt = await res.text(); } catch (e2) { /* ignore */ }
            throw new Error('HTTP ' + res.status + ' — ' + url.split('?')[0] + ': ' + txt.substring(0, 300));
        }
        if (res.status === 204) { return {}; }
        return res.json().catch(function () { return {}; });
    }

    async function spMerge(url, body, digest) {
        var res = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-Type': 'application/json;odata=nometadata',
                'X-RequestDigest': digest,
                'X-HTTP-Method': 'MERGE',
                'If-Match': '*'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            var txt = '';
            try { txt = await res.text(); } catch (e2) { /* ignore */ }
            throw new Error('HTTP ' + res.status + ' MERGE — ' + url.split('?')[0] + ': ' + txt.substring(0, 300));
        }
        return {};
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

    async function getRequestDigest(targetUrl) {
        var now = Date.now();
        if (_reqDigest && now < _reqDigestExpiry) { return _reqDigest; }
        var res = await fetch(targetUrl + '/_api/contextinfo', {
            method: 'POST',
            headers: { 'Accept': 'application/json;odata=nometadata', 'Content-Length': '0' },
            credentials: 'include'
        });
        var d = await res.json();
        _reqDigest = d.FormDigestValue;
        _reqDigestExpiry = now + 25 * 60 * 1000;
        return _reqDigest;
    }

    async function checkAdminPermissions(targetUrl) {
        try {
            var p = await spFetch(targetUrl + '/_api/web/effectivebasePermissions');
            var low = (parseInt(p.Low, 10) || 0) >>> 0;
            return (low & 0x80000000) !== 0;
        } catch (e) { return false; }
    }

    function htmlEsc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function xmlEsc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function isAlreadyExists(msg) {
        var m = String(msg || '').toLowerCase();
        return m.indexOf('already exists') > -1 || m.indexOf('duplicate') > -1 || m.indexOf('already been added') > -1;
    }

    function rewriteNavUrl(url, sourceUrl, targetUrl) {
        if (!url) { return url; }
        if (url.indexOf(sourceUrl) === 0) { return targetUrl + url.substring(sourceUrl.length); }
        var srcPath = '';
        var tgtPath = '';
        try { srcPath = new URL(sourceUrl).pathname.replace(/\/$/, ''); } catch (e) { /* ignore */ }
        try { tgtPath = new URL(targetUrl).pathname.replace(/\/$/, ''); } catch (e) { /* ignore */ }
        if (srcPath && tgtPath && url.indexOf(srcPath) === 0) { return tgtPath + url.substring(srcPath.length); }
        return url;
    }

    function base64ToArrayBuffer(base64) {
        var binary = window.atob(base64);
        var len = binary.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) { bytes[i] = binary.charCodeAt(i); }
        return bytes.buffer;
    }

    function extractFormulaFieldRefs(formula) {
        var refs = [];
        var re = /\[([^\]]+)\]/g;
        var m;
        while ((m = re.exec(formula)) !== null) {
            if (refs.indexOf(m[1]) === -1) { refs.push(m[1]); }
        }
        return refs;
    }

    // ─── Import Log ───────────────────────────────────────────────────────────

    function tmLog(msg, status) {
        var logEl = document.getElementById('tm-import-log');
        if (!logEl) { return; }
        var st = status || 'info';
        var badge;
        if (st === 'ok') { badge = 'OK'; }
        else if (st === 'skip') { badge = 'SKIP'; }
        else if (st === 'warn') { badge = 'WARN'; }
        else if (st === 'error') { badge = 'ERROR'; }
        else if (st === 'phase') { badge = ''; }
        else { badge = ''; }
        var div = document.createElement('div');
        div.className = 'tm-log-entry tm-log-' + st;
        div.innerHTML = '<span class="tm-log-badge" aria-hidden="true">' + htmlEsc(badge) + '</span>' +
            '<span class="tm-log-text">' + htmlEsc(msg) + '</span>';
        logEl.appendChild(div);
        logEl.scrollTop = logEl.scrollHeight;
    }

    function logError(msg) {
        _errors.push(msg);
        var el = document.getElementById('tm-error-log');
        if (el) { el.textContent += msg + '\n'; }
        var sect = document.getElementById('tm-errors-section');
        if (sect) { sect.removeAttribute('hidden'); }
    }

    // ─── Field XML Builder ────────────────────────────────────────────────────

    function buildFieldXml(col, resolvedLookupGuid) {
        var t = col.type || 'Text';

        if (TAXONOMY_TYPES.has(t)) { return null; }

        var attrs = [
            'Type="' + xmlEsc(t) + '"',
            'Name="' + xmlEsc(col.internalName) + '"',
            'DisplayName="' + xmlEsc(col.title) + '"',
            'StaticName="' + xmlEsc(col.internalName) + '"',
            'Required="' + (col.required ? 'TRUE' : 'FALSE') + '"'
        ];

        if (col.description) { attrs.push('Description="' + xmlEsc(col.description) + '"'); }
        if (col.indexed) { attrs.push('Indexed="TRUE"'); }
        if (col.enforceUnique) { attrs.push('EnforceUniqueValues="TRUE"'); attrs.push('Indexed="TRUE"'); }

        var inner = '';

        if (t === 'Text') {
            var maxLen = (col.maxLength && col.maxLength !== 255) ? col.maxLength : 255;
            if (maxLen !== 255) { attrs.push('MaxLength="' + maxLen + '"'); }

        } else if (t === 'Note') {
            attrs.push('RichText="FALSE"');
            attrs.push('UnlimitedLengthInDocumentLibrary="FALSE"');
            attrs.push('NumLines="6"');

        } else if (t === 'Currency') {
            attrs.push('LCID="1033"');

        } else if (t === 'DateTime') {
            var fmt = 'DateOnly';
            if (col.schemaXml && col.schemaXml.indexOf('Format="DateTime"') > -1) { fmt = 'DateTime'; }
            attrs.push('Format="' + fmt + '"');

        } else if (t === 'Boolean') {
            var dv = String(col.defaultValue || '');
            if (dv === '1' || dv.toLowerCase() === 'true' || dv.toLowerCase() === 'yes') {
                inner += '<Default>1</Default>';
            } else if (dv === '0' || dv.toLowerCase() === 'false' || dv.toLowerCase() === 'no') {
                inner += '<Default>0</Default>';
            }

        } else if (t === 'Choice') {
            attrs.push('Format="Dropdown"');
            if (col.choices && col.choices.length > 0) {
                inner += '<CHOICES>';
                col.choices.forEach(function (c) { inner += '<CHOICE>' + xmlEsc(c) + '</CHOICE>'; });
                inner += '</CHOICES>';
            }
            if (col.defaultValue) { inner += '<Default>' + xmlEsc(col.defaultValue) + '</Default>'; }

        } else if (t === 'MultiChoice') {
            attrs.push('FillInChoice="FALSE"');
            if (col.choices && col.choices.length > 0) {
                inner += '<CHOICES>';
                col.choices.forEach(function (c) { inner += '<CHOICE>' + xmlEsc(c) + '</CHOICE>'; });
                inner += '</CHOICES>';
            }

        } else if (t === 'Lookup') {
            var lg = resolvedLookupGuid || '';
            if (!lg) { return null; }
            attrs.push('List="' + xmlEsc(lg) + '"');
            attrs.push('ShowField="' + xmlEsc(col.lookupField || 'Title') + '"');
            attrs.push('UnlimitedLengthInDocumentLibrary="FALSE"');

        } else if (t === 'LookupMulti') {
            var lgm = resolvedLookupGuid || '';
            if (!lgm) { return null; }
            attrs.push('List="' + xmlEsc(lgm) + '"');
            attrs.push('ShowField="' + xmlEsc(col.lookupField || 'Title') + '"');
            attrs.push('Mult="TRUE"');
            attrs.push('Sortable="FALSE"');

        } else if (t === 'User') {
            attrs.push('List="UserInfo"');
            attrs.push('ShowField="ImnName"');
            attrs.push('UserSelectionMode="0"');

        } else if (t === 'UserMulti') {
            attrs.push('List="UserInfo"');
            attrs.push('Mult="TRUE"');
            attrs.push('ShowField="ImnName"');
            attrs.push('UserSelectionMode="0"');

        } else if (t === 'URL') {
            attrs.push('Format="Hyperlink"');

        } else if (t === 'Calculated') {
            if (!col.formula) { return null; }
            inner += '<Formula>' + xmlEsc(col.formula) + '</Formula>';
            var refs = extractFormulaFieldRefs(col.formula);
            if (refs.length > 0) {
                inner += '<FieldRefs>';
                refs.forEach(function (r) { inner += '<FieldRef Name="' + xmlEsc(r) + '"/>'; });
                inner += '</FieldRefs>';
            }
            var resultType = 'Text';
            if (col.schemaXml) {
                var rtMatch = col.schemaXml.match(/ResultType="([^"]+)"/);
                if (rtMatch) { resultType = rtMatch[1]; }
            }
            attrs.push('ResultType="' + xmlEsc(resultType) + '"');
        }

        if (inner) {
            return '<Field ' + attrs.join(' ') + '>' + inner + '</Field>';
        }
        return '<Field ' + attrs.join(' ') + '/>';
    }

    // ─── Lookup GUID resolver ─────────────────────────────────────────────────

    async function resolveLookupGuid(listTitle, baseUrl) {
        if (!listTitle) { return ''; }
        var title = listTitle.replace(/'/g, "''");
        try {
            var d = await spFetch(baseUrl + "/_api/web/lists?$filter=Title eq '" + encodeURIComponent(title) + "'&$select=Id");
            if (d.value && d.value.length > 0) { return d.value[0].Id; }
        } catch (e) { /* ignore */ }
        return '';
    }

    // ─── Folder + File Helpers ────────────────────────────────────────────────

    async function ensureFolder(baseUrl, serverRelPath, digest) {
        var res = await fetch(baseUrl + '/_api/web/folders', {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-Type': 'application/json;odata=nometadata',
                'X-RequestDigest': digest
            },
            credentials: 'include',
            body: JSON.stringify({ ServerRelativeUrl: serverRelPath })
        });
        if (!res.ok && res.status !== 400 && res.status !== 409) {
            var txt = '';
            try { txt = await res.text(); } catch (e2) { /* ignore */ }
            throw new Error('HTTP ' + res.status + ' creating folder: ' + txt.substring(0, 200));
        }
    }

    async function uploadFile(baseUrl, serverRelFolderPath, fileName, arrayBuffer, digest) {
        var url = baseUrl + "/_api/web/GetFolderByServerRelativeUrl('" +
            encodeURIComponent(serverRelFolderPath) + "')/Files/add(url='" +
            encodeURIComponent(fileName) + "',overwrite=true)";
        var res = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'X-RequestDigest': digest
            },
            credentials: 'include',
            body: arrayBuffer
        });
        if (!res.ok) {
            var txt = '';
            try { txt = await res.text(); } catch (e2) { /* ignore */ }
            throw new Error('HTTP ' + res.status + ' uploading ' + fileName + ': ' + txt.substring(0, 200));
        }
    }

    // ─── Import Phase Functions ───────────────────────────────────────────────

    async function importSiteSettings(site, baseUrl, digest, dryRun) {
        tmLog('Setting site title and description', 'phase');
        if (!site || !site.title) { tmLog('  SKIP — no site data', 'skip'); return; }
        if (dryRun) { tmLog('  [dry run] PATCH site: ' + site.title, 'info'); return; }
        try {
            await spMerge(baseUrl + '/_api/web', { Title: site.title, Description: site.description || '' }, digest);
            tmLog('  Site title set: ' + site.title, 'ok');
        } catch (e) {
            tmLog('  WARN: ' + e.message, 'warn');
        }
        if (site.logo) {
            try {
                await spMerge(baseUrl + '/_api/web', { SiteLogoUrl: site.logo }, digest);
                tmLog('  Site logo URL set', 'ok');
            } catch (e) {
                tmLog('  WARN: logo — ' + e.message, 'warn');
            }
        }
    }

    async function importTaxonomy(termStore, baseUrl, digest, dryRun) {
        tmLog('Creating taxonomy groups, sets, and terms', 'phase');
        var groups = (termStore && termStore.groups) ? termStore.groups : [];
        if (groups.length === 0) { tmLog('  No site-scoped term groups to import', 'skip'); return; }

        var isAdmin = await checkAdminPermissions(baseUrl).catch(function () { return false; });
        if (!isAdmin) {
            tmLog('  ADVISORY: Not a site collection admin — taxonomy creation skipped.', 'warn');
            tmLog('  Please create term groups manually in Term Store Management.', 'warn');
            return;
        }

        var siteD = await spFetch(baseUrl + '/_api/site?$select=Id').catch(function () { return {}; });
        var siteId = siteD.Id || '';
        if (!siteId) { tmLog('  ERROR: Could not get site collection ID', 'error'); return; }

        var termBase = baseUrl + '/_api/v2.1/sites/' + siteId + '/termStore';

        for (var gi = 0; gi < groups.length; gi++) {
            var grp = groups[gi];
            if (dryRun) { tmLog('  [dry run] CREATE group: ' + grp.name, 'info'); continue; }
            try {
                var createdGrp = await spPost(termBase + '/groups', {
                    displayName: grp.name,
                    description: grp.description || '',
                    scope: 'siteCollection'
                }, digest);
                tmLog('  Created group: ' + grp.name, 'ok');

                var sets = grp.sets || [];
                for (var si = 0; si < sets.length; si++) {
                    var st = sets[si];
                    try {
                        var createdSet = await spPost(termBase + '/sets', {
                            localizedNames: [{ name: st.name, languageTag: 'en-US' }],
                            description: st.description || '',
                            parentGroup: { id: createdGrp.id }
                        }, digest);
                        tmLog('    Created set: ' + st.name, 'ok');

                        var terms = st.terms || [];
                        for (var ti = 0; ti < terms.length; ti++) {
                            var term = terms[ti];
                            try {
                                await spPost(termBase + '/sets/' + createdSet.id + '/terms', {
                                    labels: [{ name: term.name, languageTag: 'en-US', isDefault: true }],
                                    descriptions: term.description ? [{ description: term.description, languageTag: 'en-US' }] : []
                                }, digest);
                            } catch (e3) {
                                tmLog('    WARN: term ' + term.name + ' — ' + e3.message, 'warn');
                            }
                        }
                    } catch (e2) {
                        tmLog('    ERROR: set ' + st.name + ' — ' + e2.message, 'error');
                        logError('Term set ' + st.name + ': ' + e2.message);
                    }
                }
            } catch (e) {
                tmLog('  ERROR: group ' + grp.name + ' — ' + e.message, 'error');
                logError('Term group ' + grp.name + ': ' + e.message);
            }
        }
    }

    async function importSiteColumns(siteColumns, baseUrl, digest, skipExisting, dryRun) {
        tmLog('Creating site-scoped columns', 'phase');
        if (!siteColumns || siteColumns.length === 0) { tmLog('  No site columns to import', 'skip'); return; }
        for (var i = 0; i < siteColumns.length; i++) {
            var col = siteColumns[i];
            if (SYSTEM_FIELDS.has(col.internalName)) { continue; }
            if (TAXONOMY_TYPES.has(col.type)) {
                tmLog('  ADVISORY: ' + col.internalName + ' (taxonomy) — create manually', 'warn');
                continue;
            }
            var xml = buildFieldXml(col, null);
            if (!xml) { tmLog('  SKIP: ' + col.internalName + ' — unsupported type ' + col.type, 'skip'); continue; }
            if (dryRun) { tmLog('  [dry run] ADD site column: ' + col.internalName, 'info'); continue; }
            try {
                await spPost(baseUrl + '/_api/web/fields/addFieldAsXml',
                    { parameters: { SchemaXml: xml, AddToDefaultView: false } }, digest);
                tmLog('  Added site column: ' + col.internalName, 'ok');
            } catch (e) {
                if (skipExisting && isAlreadyExists(e.message)) {
                    tmLog('  SKIP (exists): ' + col.internalName, 'skip');
                } else {
                    tmLog('  ERROR: ' + col.internalName + ' — ' + e.message, 'error');
                    logError('Site column ' + col.internalName + ': ' + e.message);
                }
            }
        }
    }

    async function importLists(lists, baseUrl, digest, skipExisting, dryRun, listGuidMap) {
        tmLog('Creating lists and libraries', 'phase');
        var existD = await spFetch(baseUrl + '/_api/web/lists?$select=Id,Title');
        var existMap = {};
        (existD.value || []).forEach(function (l) { existMap[l.Title.toLowerCase()] = l.Id; });

        for (var i = 0; i < lists.length; i++) {
            var lst = lists[i];
            var key = (lst.title || '').toLowerCase();
            if (existMap[key]) {
                listGuidMap[lst.title] = existMap[key];
                if (skipExisting) { tmLog('  SKIP (exists): ' + lst.title, 'skip'); continue; }
            }
            if (dryRun) { tmLog('  [dry run] CREATE: ' + lst.title + ' (template ' + lst.baseTemplate + ')', 'info'); continue; }
            try {
                var payload = { Title: lst.title, Description: lst.description || '', BaseTemplate: lst.baseTemplate || 100 };
                var created = await spPost(baseUrl + '/_api/web/lists', payload, digest);
                var newId = (created && (created.Id || (created.d && created.d.Id))) || '';
                listGuidMap[lst.title] = newId;
                if (lst.settings && newId) {
                    try {
                        await spMerge(baseUrl + "/_api/web/lists(guid'" + newId + "')", {
                            EnableVersioning: !!lst.settings.enableVersioning,
                            EnableModeration: !!lst.settings.enableModeration
                        }, digest);
                    } catch (e2) { /* non-fatal */ }
                }
                tmLog('  Created: ' + lst.title, 'ok');
            } catch (e) {
                tmLog('  ERROR: ' + lst.title + ' — ' + e.message, 'error');
                logError('List ' + lst.title + ': ' + e.message);
            }
        }
    }

    async function importAutomationFlows(flows, baseUrl, digest, skipExisting, dryRun) {
        if (!flows || flows.length === 0) { return; }
        tmLog('Populating Automations List items', 'phase');

        var listNames = ['Automations List', 'AutomationFlows', 'Automation Flows'];
        var listUrl = '';
        for (var ni = 0; ni < listNames.length; ni++) {
            try {
                var checkD = await spFetch(baseUrl + "/_api/web/lists/getbytitle('" + encodeURIComponent(listNames[ni]) + "')?$select=Id");
                if (checkD.Id) { listUrl = baseUrl + "/_api/web/lists/getbytitle('" + encodeURIComponent(listNames[ni]) + "')/items"; break; }
            } catch (e) { /* try next */ }
        }
        if (!listUrl) { tmLog('  SKIP — Automations List not found (will be created later)', 'skip'); return; }

        for (var i = 0; i < flows.length; i++) {
            var flow = flows[i];
            if (dryRun) { tmLog('  [dry run] ADD flow: ' + flow.title, 'info'); continue; }
            try {
                var item = { Title: flow.title, Description: flow.description || '' };
                if (flow.flowId) { item.FlowID = flow.flowId; }
                if (flow.flowUrl) { item.FlowURL = flow.flowUrl; }
                if (flow.flowType) { item.FlowType = flow.flowType; }
                if (flow.automationSystem) { item.AutomationSystem = flow.automationSystem; }
                if (flow.code) { item.Code = flow.code; }
                await spPost(listUrl, item, digest);
                tmLog('  Added flow: ' + flow.title, 'ok');
            } catch (e) {
                tmLog('  ERROR: ' + flow.title + ' — ' + e.message, 'error');
                logError('Flow item ' + flow.title + ': ' + e.message);
            }
        }
    }

    async function importColumnsNonLookup(lists, baseUrl, digest, skipExisting, dryRun, listGuidMap) {
        tmLog('Adding columns (non-lookup, non-taxonomy)', 'phase');
        for (var i = 0; i < lists.length; i++) {
            var lst = lists[i];
            var listGuid = listGuidMap[lst.title];
            if (!listGuid && !dryRun) { continue; }

            var cols = (lst.columns || []).filter(function (c) {
                return !SYSTEM_FIELDS.has(c.internalName) && !LOOKUP_TYPES.has(c.type) && !TAXONOMY_TYPES.has(c.type);
            });
            if (cols.length === 0) { continue; }

            for (var j = 0; j < cols.length; j++) {
                var col = cols[j];
                var xml = buildFieldXml(col, null);
                if (!xml) {
                    tmLog('  ADVISORY: ' + lst.title + '.' + col.internalName + ' (' + col.type + ') — create manually', 'warn');
                    continue;
                }
                if (dryRun) { tmLog('  [dry run] ADD: ' + lst.title + '.' + col.internalName, 'info'); continue; }
                try {
                    await spPost(
                        baseUrl + "/_api/web/lists(guid'" + listGuid + "')/fields/addFieldAsXml",
                        { parameters: { SchemaXml: xml, AddToDefaultView: false } },
                        digest
                    );
                    tmLog('  Added: ' + lst.title + '.' + col.internalName, 'ok');
                } catch (e) {
                    if (skipExisting && isAlreadyExists(e.message)) {
                        tmLog('  SKIP (exists): ' + lst.title + '.' + col.internalName, 'skip');
                    } else {
                        tmLog('  ERROR: ' + lst.title + '.' + col.internalName + ' — ' + e.message, 'error');
                        logError('Field ' + lst.title + '.' + col.internalName + ': ' + e.message);
                    }
                }
            }
        }
    }

    async function importColumnsLookup(lists, baseUrl, digest, skipExisting, dryRun, listGuidMap) {
        tmLog('Adding lookup columns', 'phase');
        for (var i = 0; i < lists.length; i++) {
            var lst = lists[i];
            var listGuid = listGuidMap[lst.title];
            if (!listGuid && !dryRun) { continue; }

            var cols = (lst.columns || []).filter(function (c) { return LOOKUP_TYPES.has(c.type); });
            if (cols.length === 0) { continue; }

            for (var j = 0; j < cols.length; j++) {
                var col = cols[j];
                if (dryRun) { tmLog('  [dry run] ADD lookup: ' + lst.title + '.' + col.internalName, 'info'); continue; }
                var targetGuid = await resolveLookupGuid(col.lookupListTitle, baseUrl);
                if (!targetGuid) {
                    tmLog('  WARN: ' + lst.title + '.' + col.internalName + ' — lookup list "' + col.lookupListTitle + '" not found', 'warn');
                    continue;
                }
                var xml = buildFieldXml(col, targetGuid);
                if (!xml) { tmLog('  SKIP: ' + lst.title + '.' + col.internalName + ' — could not build XML', 'skip'); continue; }
                try {
                    await spPost(
                        baseUrl + "/_api/web/lists(guid'" + listGuid + "')/fields/addFieldAsXml",
                        { parameters: { SchemaXml: xml, AddToDefaultView: false } },
                        digest
                    );
                    tmLog('  Added lookup: ' + lst.title + '.' + col.internalName, 'ok');
                } catch (e) {
                    if (skipExisting && isAlreadyExists(e.message)) {
                        tmLog('  SKIP (exists): ' + lst.title + '.' + col.internalName, 'skip');
                    } else {
                        tmLog('  ERROR: ' + lst.title + '.' + col.internalName + ' — ' + e.message, 'error');
                        logError('Lookup field ' + lst.title + '.' + col.internalName + ': ' + e.message);
                    }
                }
            }
        }
    }

    async function importViews(lists, baseUrl, digest, skipExisting, dryRun, listGuidMap) {
        tmLog('Creating and updating views', 'phase');
        for (var i = 0; i < lists.length; i++) {
            var lst = lists[i];
            var listGuid = listGuidMap[lst.title];
            if (!listGuid && !dryRun) { continue; }

            var views = (lst.views || []).filter(function (v) { return !v.hidden; });
            if (views.length === 0) { continue; }

            var existViews = {};
            if (!dryRun) {
                try {
                    var evD = await spFetch(baseUrl + "/_api/web/lists(guid'" + listGuid + "')/views?$select=Id,Title,DefaultView");
                    (evD.value || []).forEach(function (v) { existViews[v.Title.toLowerCase()] = v.Id; });
                } catch (e) {
                    tmLog('  ERROR: could not fetch existing views for ' + lst.title, 'error');
                    continue;
                }
            }

            for (var vi = 0; vi < views.length; vi++) {
                var view = views[vi];
                var vf = Array.isArray(view.viewFields) ? view.viewFields : [];
                var vKey = (view.title || '').toLowerCase();

                if (dryRun) { tmLog('  [dry run] VIEW: ' + lst.title + '/' + view.title, 'info'); continue; }

                var existId = existViews[vKey];
                if (existId) {
                    // Update existing view
                    try {
                        var vBase = baseUrl + "/_api/web/lists(guid'" + listGuid + "')/views(guid'" + existId + "')";
                        await spMerge(vBase, { ViewQuery: view.viewQuery || '', RowLimit: view.rowLimit || 30, Paged: !!view.paged }, digest);
                        // Reset and re-add view fields
                        await spPost(vBase + '/ViewFields/removeAllViewFields', {}, digest);
                        for (var fi = 0; fi < vf.length; fi++) {
                            try {
                                await spPost(vBase + '/ViewFields/addViewField(\'' + vf[fi] + '\')', {}, digest);
                            } catch (e3) { /* field may not exist yet, skip */ }
                        }
                        tmLog('  Updated view: ' + lst.title + '/' + view.title, 'ok');
                    } catch (e) {
                        tmLog('  WARN: update view ' + lst.title + '/' + view.title + ' — ' + e.message, 'warn');
                    }
                } else {
                    // Create new view
                    try {
                        var payload = {
                            Title: view.title,
                            PersonalView: false,
                            ViewQuery: view.viewQuery || '',
                            RowLimit: view.rowLimit || 30,
                            Paged: !!view.paged,
                            ViewFields: { ViewFields: vf }
                        };
                        await spPost(baseUrl + "/_api/web/lists(guid'" + listGuid + "')/views", payload, digest);
                        tmLog('  Created view: ' + lst.title + '/' + view.title, 'ok');
                    } catch (e) {
                        tmLog('  ERROR: create view ' + lst.title + '/' + view.title + ' — ' + e.message, 'error');
                        logError('View ' + lst.title + '/' + view.title + ': ' + e.message);
                    }
                }
            }

            // Set the correct default view
            var defaultView = views.filter(function (v) { return v.defaultView; })[0];
            if (defaultView) {
                var dvKey = (defaultView.title || '').toLowerCase();
                var dvId = existViews[dvKey];
                if (!dvId) {
                    // Try to find newly created view
                    try {
                        var allVD = await spFetch(baseUrl + "/_api/web/lists(guid'" + listGuid + "')/views?$select=Id,Title");
                        (allVD.value || []).forEach(function (v) {
                            if (v.Title.toLowerCase() === dvKey) { dvId = v.Id; }
                        });
                    } catch (e) { /* skip */ }
                }
                if (dvId) {
                    try {
                        await spMerge(
                            baseUrl + "/_api/web/lists(guid'" + listGuid + "')/views(guid'" + dvId + "')",
                            { DefaultView: true }, digest
                        );
                    } catch (e) { /* non-fatal */ }
                }
            }
        }
    }

    async function importFormatters(lists, baseUrl, digest, dryRun, listGuidMap) {
        tmLog('Applying custom formatters', 'phase');
        var count = 0;
        for (var i = 0; i < lists.length; i++) {
            var lst = lists[i];
            var listGuid = listGuidMap[lst.title];
            if (!listGuid && !dryRun) { continue; }

            // Column formatters
            var cols = (lst.columns || []).filter(function (c) { return !!c.customFormatter; });
            for (var ci = 0; ci < cols.length; ci++) {
                var col = cols[ci];
                if (dryRun) { tmLog('  [dry run] FORMAT col: ' + lst.title + '.' + col.internalName, 'info'); count++; continue; }
                try {
                    await spMerge(
                        baseUrl + "/_api/web/lists(guid'" + listGuid + "')/fields/getByInternalNameOrTitle('" + col.internalName + "')",
                        { CustomFormatter: col.customFormatter },
                        digest
                    );
                    count++;
                } catch (e) {
                    tmLog('  WARN: format col ' + lst.title + '.' + col.internalName + ' — ' + e.message, 'warn');
                }
            }

            // View formatters — look up view GUID by title first
            var views = (lst.views || []).filter(function (v) { return !!v.customFormatter; });
            if (views.length === 0) { continue; }

            var allViewsD;
            try {
                allViewsD = await spFetch(baseUrl + "/_api/web/lists(guid'" + listGuid + "')/views?$select=Id,Title");
            } catch (e) { continue; }
            var viewMap = {};
            (allViewsD.value || []).forEach(function (v) { viewMap[v.Title.toLowerCase()] = v.Id; });

            for (var vi = 0; vi < views.length; vi++) {
                var view = views[vi];
                var vId = viewMap[(view.title || '').toLowerCase()];
                if (!vId) { continue; }
                if (dryRun) { tmLog('  [dry run] FORMAT view: ' + lst.title + '/' + view.title, 'info'); count++; continue; }
                try {
                    await spMerge(
                        baseUrl + "/_api/web/lists(guid'" + listGuid + "')/views(guid'" + vId + "')",
                        { CustomFormatter: view.customFormatter },
                        digest
                    );
                    count++;
                } catch (e) {
                    tmLog('  WARN: format view ' + lst.title + '/' + view.title + ' — ' + e.message, 'warn');
                }
            }
        }
        tmLog('Applied ' + count + ' formatters', 'ok');
    }

    async function importFoldersAndFiles(lists, baseUrl, digest, dryRun, listGuidMap) {
        tmLog('Creating folders and uploading files', 'phase');
        var siteRelPath = getSiteRelativePath();

        for (var i = 0; i < lists.length; i++) {
            var lst = lists[i];
            var isDocLib = (lst.baseTemplate === 101 || lst.baseType === 1);
            if (!isDocLib) { continue; }

            var listGuid = listGuidMap[lst.title];
            var libRoot = siteRelPath + '/' + lst.title;

            if (!dryRun && listGuid) {
                try {
                    var libD = await spFetch(baseUrl + "/_api/web/lists(guid'" + listGuid + "')?$select=RootFolder/ServerRelativeUrl&$expand=RootFolder");
                    if (libD.RootFolder && libD.RootFolder.ServerRelativeUrl) {
                        libRoot = libD.RootFolder.ServerRelativeUrl;
                    }
                } catch (e) { /* use estimated path */ }
            }

            // Create top-level folders
            var folders = lst.folders || [];
            for (var fi = 0; fi < folders.length; fi++) {
                var folder = folders[fi];
                var fp = libRoot + '/' + folder.name;
                if (dryRun) { tmLog('  [dry run] CREATE folder: ' + lst.title + '/' + folder.name, 'info'); continue; }
                try {
                    await ensureFolder(baseUrl, fp, digest);
                    tmLog('  Created folder: ' + lst.title + '/' + folder.name, 'ok');
                } catch (e) {
                    tmLog('  ERROR: folder ' + folder.name + ' — ' + e.message, 'error');
                }
            }

            // Upload files (only Documents library has files in the export)
            var files = lst.files || [];
            if (files.length === 0) { continue; }

            // Ensure subfolder structure
            var subPaths = [
                libRoot + '/TrackMaster Resources',
                libRoot + '/TrackMaster Resources/Data Import Templates'
            ];
            for (var sp = 0; sp < subPaths.length; sp++) {
                if (dryRun) { tmLog('  [dry run] ENSURE: ' + subPaths[sp], 'info'); continue; }
                try { await ensureFolder(baseUrl, subPaths[sp], digest); } catch (e) { /* may exist */ }
            }

            for (var fli = 0; fli < files.length; fli++) {
                var file = files[fli];
                var targetFolder = libRoot + '/TrackMaster Resources/Data Import Templates';
                if (dryRun) { tmLog('  [dry run] UPLOAD: ' + file.name, 'info'); continue; }
                try {
                    var buf = base64ToArrayBuffer(file.contentBase64);
                    await uploadFile(baseUrl, targetFolder, file.name, buf, digest);
                    tmLog('  Uploaded: ' + file.name, 'ok');
                } catch (e) {
                    tmLog('  ERROR: upload ' + file.name + ' — ' + e.message, 'error');
                    logError('File upload ' + file.name + ': ' + e.message);
                }
            }
        }
    }

    async function importNavigation(navigation, baseUrl, digest, dryRun, sourceUrl) {
        tmLog('Creating navigation nodes', 'phase');
        var ql = (navigation && navigation.quickLaunch) ? navigation.quickLaunch : [];
        var tn = (navigation && navigation.topNav) ? navigation.topNav : [];
        var targetUrl = getBaseUrl();

        async function addNode(apiPath, node) {
            var url = rewriteNavUrl(node.url, sourceUrl, targetUrl);
            if (dryRun) { tmLog('  [dry run] NAV: ' + node.title, 'info'); return null; }
            try {
                var created = await spPost(baseUrl + apiPath, { Title: node.title, Url: url, IsDocLib: false }, digest);
                return created;
            } catch (e) {
                tmLog('  WARN: nav node ' + node.title + ' — ' + e.message, 'warn');
                return null;
            }
        }

        for (var qi = 0; qi < ql.length; qi++) {
            var node = ql[qi];
            var created = await addNode('/_api/web/navigation/quicklaunch', node);
            if (created && created.Id && node.children && node.children.length > 0) {
                for (var ci = 0; ci < node.children.length; ci++) {
                    var child = node.children[ci];
                    var childUrl = rewriteNavUrl(child.url, sourceUrl, targetUrl);
                    if (!dryRun) {
                        try {
                            await spPost(
                                baseUrl + '/_api/web/navigation/quicklaunch(' + created.Id + ')/children',
                                { Title: child.title, Url: childUrl, IsDocLib: false }, digest
                            );
                        } catch (e) { tmLog('  WARN: child nav ' + child.title + ' — ' + e.message, 'warn'); }
                    }
                }
            }
        }
        if (ql.length > 0 && !dryRun) { tmLog('  Added ' + ql.length + ' quick launch nodes', 'ok'); }

        for (var ti = 0; ti < tn.length; ti++) {
            await addNode('/_api/web/navigation/toplinkbar', tn[ti]);
        }
        if (tn.length > 0 && !dryRun) { tmLog('  Added ' + tn.length + ' top nav nodes', 'ok'); }

        if (!dryRun) {
            tmLog('  ADVISORY: Navigation URLs rewritten from source site. Review external links manually.', 'warn');
        }
    }

    // ─── Main Import Pipeline ─────────────────────────────────────────────────

    async function runImport() {
        var data = _importData;
        if (!data) { return; }

        document.getElementById('tm-btn-import').disabled = true;
        document.getElementById('tm-phase-progress').removeAttribute('hidden');
        _errors = [];
        _baseUrl = getBaseUrl();

        var skipExisting = !!document.getElementById('tm-opt-skip-existing').checked;
        var dryRun = !!document.getElementById('tm-opt-dry-run').checked;

        if (dryRun) { tmLog('DRY RUN MODE — no changes will be made', 'warn'); }

        // Refresh digest (or mock for dry run)
        var digest = '';
        if (!dryRun) {
            try {
                digest = await getRequestDigest(_baseUrl);
            } catch (e) {
                tmLog('ERROR: Could not get request digest — check you are logged in', 'error');
                logError('Request digest: ' + e.message);
                document.getElementById('tm-btn-import').disabled = false;
                return;
            }
        }

        var listGuidMap = {};
        var sourceUrl = (data._meta && data._meta.sourceUrl) ? data._meta.sourceUrl : '';

        try { await importSiteSettings(data.site, _baseUrl, digest, dryRun); } catch (e) { logError('Site settings: ' + e.message); }

        // Refresh digest between long phases
        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importTaxonomy(data.termStore, _baseUrl, digest, dryRun); } catch (e) { logError('Taxonomy: ' + e.message); }

        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importSiteColumns(data.siteColumns, _baseUrl, digest, skipExisting, dryRun); } catch (e) { logError('Site columns: ' + e.message); }

        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importLists(data.lists, _baseUrl, digest, skipExisting, dryRun, listGuidMap); } catch (e) { logError('Lists: ' + e.message); }

        // Populate Automations List after it's created
        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importAutomationFlows(data.automationFlows, _baseUrl, digest, skipExisting, dryRun); } catch (e) { logError('Automation flows: ' + e.message); }

        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importColumnsNonLookup(data.lists, _baseUrl, digest, skipExisting, dryRun, listGuidMap); } catch (e) { logError('Non-lookup columns: ' + e.message); }

        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importColumnsLookup(data.lists, _baseUrl, digest, skipExisting, dryRun, listGuidMap); } catch (e) { logError('Lookup columns: ' + e.message); }

        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importViews(data.lists, _baseUrl, digest, skipExisting, dryRun, listGuidMap); } catch (e) { logError('Views: ' + e.message); }

        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importFormatters(data.lists, _baseUrl, digest, dryRun, listGuidMap); } catch (e) { logError('Formatters: ' + e.message); }

        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importFoldersAndFiles(data.lists, _baseUrl, digest, dryRun, listGuidMap); } catch (e) { logError('Folders/files: ' + e.message); }

        if (!dryRun) { try { digest = await getRequestDigest(_baseUrl); } catch (e) { /* ignore */ } }
        try { await importNavigation(data.navigation, _baseUrl, digest, dryRun, sourceUrl); } catch (e) { logError('Navigation: ' + e.message); }

        var summary = dryRun ? 'Dry run complete.' : 'Import complete.';
        if (_errors.length > 0) { summary += ' ' + _errors.length + ' error(s) — see Errors section below.'; }
        tmLog(summary, _errors.length > 0 ? 'warn' : 'ok');

        // Focus the completion message for screen readers
        var logEl = document.getElementById('tm-import-log');
        if (logEl) { logEl.focus(); }

        document.getElementById('tm-btn-import').disabled = false;
    }

    // ─── File Loading and Preview ─────────────────────────────────────────────

    function validateExportJson(data) {
        if (!data || !data._meta || !data.lists) {
            throw new Error('File does not appear to be a valid TrackMaster Export JSON (missing _meta or lists).');
        }
        if (data._meta.tool !== 'TrackMaster-Export') {
            throw new Error('Unexpected tool field: ' + data._meta.tool + '. Expected TrackMaster-Export.');
        }
    }

    function loadJsonFile(file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var data = JSON.parse(e.target.result);
                validateExportJson(data);
                _importData = data;
                renderPreview(data);
                document.getElementById('tm-phase-preview').removeAttribute('hidden');
                document.getElementById('tm-phase-options').removeAttribute('hidden');
                document.getElementById('tm-btn-import').disabled = false;
                document.getElementById('tm-phase-preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (err) {
                logError('Invalid file: ' + err.message);
                document.getElementById('tm-errors-section').removeAttribute('hidden');
            }
        };
        reader.readAsText(file);
    }

    function renderPreview(data) {
        var lists = data.lists || [];
        var docLibs = lists.filter(function (l) { return l.baseTemplate === 101 || l.baseType === 1; });
        var generic = lists.filter(function (l) { return l.baseTemplate !== 101 && l.baseType !== 1; });
        var totalCols = 0;
        var totalViews = 0;
        var totalFmt = 0;
        var totalFiles = 0;
        lists.forEach(function (l) {
            totalCols += l.columns ? l.columns.length : 0;
            totalViews += l.views ? l.views.length : 0;
            totalFiles += l.files ? l.files.length : 0;
            (l.columns || []).forEach(function (c) { if (c.customFormatter) { totalFmt++; } });
            (l.views || []).forEach(function (v) { if (v.customFormatter) { totalFmt++; } });
        });
        var groups = (data.termStore && data.termStore.groups) ? data.termStore.groups : [];
        var rows = [
            ['Exported from', (data._meta && data._meta.sourceUrl) ? data._meta.sourceUrl : ''],
            ['Exported at', (data._meta && data._meta.exportedAt) ? data._meta.exportedAt : ''],
            ['Site title to create', (data.site && data.site.title) ? data.site.title : ''],
            ['Lists (total)', lists.length],
            ['  Generic lists', generic.length],
            ['  Document libraries', docLibs.length],
            ['Total columns', totalCols],
            ['Total views', totalViews],
            ['Custom formatters', totalFmt],
            ['Files to upload (.xlsx)', totalFiles],
            ['Term groups', groups.length],
            ['Automation flows', (data.automationFlows || []).length]
        ];
        var tableHtml = '<table class="tm-summary-table" role="table">' +
            '<caption class="tm-sr-only">Import preview summary</caption>' +
            '<thead><tr><th scope="col">Item</th><th scope="col">Value</th></tr></thead><tbody>';
        rows.forEach(function (r) {
            tableHtml += '<tr><td>' + htmlEsc(String(r[0])) + '</td><td>' + htmlEsc(String(r[1])) + '</td></tr>';
        });
        tableHtml += '</tbody></table>';

        // Taxonomy advisory
        var taxAdvisory = '';
        var hasTaxCols = false;
        lists.forEach(function (l) {
            (l.columns || []).forEach(function (c) { if (TAXONOMY_TYPES.has(c.type)) { hasTaxCols = true; } });
        });

        var advisoryItems = [];
        advisoryItems.push('Permissions are NOT imported — configure manually after import.');
        advisoryItems.push('Power Automate flows: live flows cannot be recreated from here. ' +
            'Automations List will be populated with titles and code for reference. ' +
            'See scripts/Sync-PowerPlatformSolution.ps1 for full flow export when available.');
        if (hasTaxCols) {
            advisoryItems.push('Taxonomy columns (TaxonomyFieldType) must be created manually and bound to term sets after import.');
        }
        advisoryItems.push('Navigation URLs will be rewritten from source site path to target site path. Review external links manually.');
        advisoryItems.push('Site logo URL will be copied but the image file must be uploaded to SiteAssets separately.');

        var advisoryHtml = '<strong>Advisories:</strong><ul>';
        advisoryItems.forEach(function (item) { advisoryHtml += '<li>' + htmlEsc(item) + '</li>'; });
        advisoryHtml += '</ul>';

        var previewEl = document.getElementById('tm-preview-content');
        if (previewEl) { previewEl.innerHTML = tableHtml; }
        var advisorEl = document.getElementById('tm-advisor-box');
        if (advisorEl) { advisorEl.innerHTML = advisoryHtml; }
    }

    // ─── DOM Construction ─────────────────────────────────────────────────────

    function renderApp(root) {
        var baseUrl = getBaseUrl();
        root.innerHTML =
            '<div class="tm-app">' +
            '<h1 class="tm-title">TrackMaster Import</h1>' +
            '<p class="tm-subtitle">Recreates TrackMaster configuration on this SharePoint site from a JSON export file created by TrackMaster-Export.js.</p>' +

            '<section class="tm-phase" aria-labelledby="ph1-hd">' +
            '<h2 class="tm-section-heading" id="ph1-hd">Step 1: Select Export File</h2>' +
            '<p class="tm-site-url">Importing to: <strong>' + htmlEsc(baseUrl) + '</strong></p>' +
            '<label for="tm-file-input">' +
            '<div class="tm-file-drop" id="tm-file-drop" role="button" tabindex="0"' +
            ' aria-label="Drop TrackMaster JSON export file here or click to browse">' +
            '<span class="tm-file-drop-icon" aria-hidden="true">&#128196;</span>' +
            'Drop export JSON here, or click to browse' +
            '</div>' +
            '</label>' +
            '<input type="file" id="tm-file-input" accept=".json" aria-label="Select JSON export file"' +
            ' style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;">' +
            '</section>' +

            '<section class="tm-phase" id="tm-phase-preview" hidden aria-labelledby="ph2-hd">' +
            '<h2 class="tm-section-heading" id="ph2-hd">Step 2: Preview</h2>' +
            '<div id="tm-preview-content"></div>' +
            '<div class="tm-advisor" id="tm-advisor-box" role="note"></div>' +
            '</section>' +

            '<section class="tm-phase" id="tm-phase-options" hidden aria-labelledby="ph3-hd">' +
            '<h2 class="tm-section-heading" id="ph3-hd">Step 3: Options</h2>' +
            '<div class="tm-options">' +
            '<label><input type="checkbox" id="tm-opt-skip-existing" checked> Skip items that already exist (by title)</label>' +
            '<label><input type="checkbox" id="tm-opt-dry-run"> Dry run — preview only, no changes will be made</label>' +
            '</div>' +
            '<button type="button" class="tm-btn tm-btn-primary" id="tm-btn-import" disabled>Start Import</button>' +
            '</section>' +

            '<section class="tm-phase" id="tm-phase-progress" hidden aria-labelledby="ph4-hd">' +
            '<h2 class="tm-section-heading" id="ph4-hd">Step 4: Progress</h2>' +
            '<div id="tm-import-log" class="tm-log tm-log-scroll" role="log"' +
            ' aria-live="polite" aria-label="Import progress log" tabindex="-1"></div>' +
            '</section>' +

            '<section id="tm-errors-section" hidden aria-labelledby="tm-err-hd">' +
            '<h2 class="tm-section-heading" id="tm-err-hd" style="color:#a4262c">Errors</h2>' +
            '<div id="tm-error-log" role="alert" aria-live="assertive" class="tm-error-log"></div>' +
            '</section>' +
            '</div>';

        // Event wiring
        var fileInput = document.getElementById('tm-file-input');
        var fileDrop = document.getElementById('tm-file-drop');

        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) { loadJsonFile(this.files[0]); }
        });
        fileDrop.addEventListener('click', function () { fileInput.click(); });
        fileDrop.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
        });
        fileDrop.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.classList.add('tm-dragover');
        });
        fileDrop.addEventListener('dragleave', function () {
            this.classList.remove('tm-dragover');
        });
        fileDrop.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('tm-dragover');
            var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) { loadJsonFile(file); }
        });

        document.getElementById('tm-btn-import').addEventListener('click', function () {
            runImport().catch(function (err) { logError('Fatal: ' + (err.message || String(err))); });
        });
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    var root = document.getElementById('tm-import-app');
    if (root) {
        renderApp(root);
    }

})();
