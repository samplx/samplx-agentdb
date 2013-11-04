#!/usr/bin/env node
/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4 fileencoding=utf-8 : */
/*
 *     Copyright 2013 James Burlingame
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */

// enable JavaScript strict mode.
//"use strict";

// import modules
var util = require('util');
var http = require('http');
var url = require('url');
var querystring = require('querystring');

// load database object
var db = require("./database.js");

// set to enable debug logging.
var debug = false;

// singleton object for agent database.
var agentdb = {
    // implementation version.
    VERSION : '0.3.0',
    
    // current author.
    MAINTAINER : 'jb@samplx.org',
    
    // where to find more information.
    HOME_PAGE : 'http://samplx.org/samplx-agentdb',
    
    // where to report a bug, request an enhancement.
    ISSUES_URL : 'http://github.com/samplx/samplx-agentdb/issues',

    // where to report unknown user-agents.
    UNKNOWN_URL : 'http://alscan.info/report-unknowns.php',
    
    lookup : function(agent) {
        debug && console.error("samplx-agentdb::lookup('" + agent + "')");
//        console.dir(db);
        var group, source;
        
        if (typeof agent == 'string') {
//            console.log('agent is string.');
            for (var n=0; n < db.length; n++) {
//                console.log('check pattern[' + n + ']');
                if (util.isRegExp(db[n].pattern)) {
                    // console.log('Found RegExp pattern[' + n + ']= ' + db[n].pattern);
                    if (db[n].pattern.test(agent)) {
                        group = db[n].group || 'unclassified';
                        source = db[n].source || 'unclassified';
                        debug && console.error("samplx-agentdb::lookup('" + agent + "')= { group: '" + group + "', source: '" + source + "' }");
                        return { group: group, source: source };
                    }
                } else if (typeof db[n].pattern == 'string') {
                    // console.log('Found String pattern[' + n + ']= ' + db[n].pattern);
                    if (db[n].pattern == agent) {
                        group = db[n].group || 'unclassified';
                        source = db[n].source || 'unclassified';
                        debug && console.error("samplx-agentdb::lookup('" + agent + "')= { group: '" + group + "', source: '" + source + "' }");
                        return { group: group, source: source };
                    }
                } else {
                    debug && console.error("samplx-agentdb::lookup: Unrecognized pattern-type: index=" + n);
                }
            }
        }
        return { group: 'unknown', source: 'unknown' };
    },
    
    // report a list of unkown user-agents.
    reportUnknowns : function(unknowns, reportingUrl) {
//        console.log("reportUnknown");
        if (util.isArray(unknowns) && (unknowns.length > 0)) {
            var parsedUrl = url.parse(reportingUrl || agentdb.UNKNOWN_URL);
//            console.dir(parsedUrl);
            var postData = querystring.stringify({ agents: unknowns.join("\n")});
//            console.dir(postData);
            var options = {
                    host : parsedUrl.hostname,
                    hostname : parsedUrl.hostname,
                    port : parsedUrl.port || 80,
                    path : parsedUrl.pathname,
                    method : 'POST',
                    headers : {
                            'content-type' : 'application/x-www-form-urlencoded',
                            'content-length' : postData.length
                    },
                    agent : false
                };
//            console.dir(options);
            var req = http.request(options, function(res) {
                debug && console.error('samplx-agentdb::reportUnknowns');
                debug && console.error('STATUS: ' + res.statusCode);
                debug && console.error('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    debug && console.error('samplx-agentdb::reportUnknowns: BODY: ' + chunk);
                });
                
                res.on('end', function () {
                    debug && console.error('samplx-agentdb::reportUnknowns: end of request.');
                });
            });
//            console.log("req created: " + util.inspect(req, { depth: null }));

            req.on('error', function(e) {
                debug && console.error('samplx-agentdb::reportUnknowns: Error on request: ' + e.message);
                throw e;
            });
//            console.log("writing POST data.");
            req.write(postData);
            req.end();
//            console.log("ending request: " + util.inspect(req, { depth: null }));
        }
    },
    
    // merge additional database entires.
    merge : function(entries, after) {
        if (util.isArray(entries)) {
            if (after) {
                db = db.concat(entries);
            } else {
                db = entries.concat(db);
            }
        } else if (after) {
            db.push(entries);
        } else {
            db.unshift(entries);
        }
    },
};

// define module as agentdb singleton.
exports = module.exports = agentdb;

