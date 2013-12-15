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
"use strict";

// import modules
var http = require('http');
var querystring = require('querystring');
var url = require('url');
var util = require('util');

// set to enable debug logging.
var debug = false;

/**
 *  Singleton object for agent database.
 */
var agentdb = {
    /** Default URL used to send feedback. */
    FEEDBACK_URL : 'http://alscan.info/agents/feedback',

    /** mask on source/group value to extract Group id. */
    GROUP_MASK : 0x1F,
    
    /** shift on source/group value to extract Source id. */
    SOURCE_SHIFT : 5,
    
    /** mask on source/group value to extract Source id. */
    SOURCE_MASK : 0xFFFF,
    
    /** Agent database. */
    database : undefined,

    /**
     *  Initialize the database.
     */
    _initDatabase : function () {
        this.database = require('./database-min.js');
        var HashTable = require('./hash.js').HashTable;
        var size = this.database.HASH_TABLE_SIZE;
        var seed = this.database.HASH_TABLE_SEED;
        var multiplier = this.database.HASH_TABLE_MULTIPLIER;
        this.database.hash = new HashTable(size, seed, multiplier);
        this.database.hash.table = this.database.table;
    },
    
    /**
     *  return Group name.
     *
     *  @param x source/group value.
     *  @rtype String.
     */
    getGroup : function(x) {
        var groupId = x & this.GROUP_MASK;
        if (groupId >= this.database.groups.length) {
            return "Unknown";
        }
        return this.database.groups[groupId];
    },
    
    /**
     *  return Source name.
     *
     *  @param x source/group value.
     *  @rtype String.
     */
    getSource : function (x) {
        var sourceId = (x >>> this.SOURCE_SHIFT) & this.SOURCE_MASK;
        if (sourceId >= this.database.sources.length) {
            debug && console.error("getSource: x=" + x + ", sourceId=" + sourceId);
            return "Unknown";
        }
        return this.database.sources[sourceId];
    },
    
    /**
     *  return source/group value from groupId and sourceId.
     *
     *  @param groupId
     *  @param sourceId
     *  @rtype Number
     */
    getX : function (groupId, sourceId) {
        return (sourceId << this.SOURCE_SHIFT) + groupId;
    },
    
    /**
     *  Lookup an agent using the hash table.
     *
     *  @param agent string.
     *  @rtype null|object
     */
    lookupHash : function(agent) {
        if (!this.database) {
            this._initDatabase();
        }
        if (typeof agent != 'string') {
            debug && console.error("samplx-agentdb::lookupHash: non-string argument.");
            return null;
        }
        var r = this.database.hash.lookup(agent, 'a');
        if (r === null) {
            debug && console.error("samplx-agentdb::lookupHash: not found.");
            return null;
        }
        return { "group" : this.getGroup(r.x), "source" : this.getSource(r.x) };
    },
    
    lookupPattern : function(agent) {
        if (!this.database) {
            this._initDatabase();
        }
        if (typeof agent != 'string') {
            debug && console.error("samplx-agentdb::lookupPattern: non-string argument.");
            return null;
        }
        for (var n=0, length= this.database.patterns.length; n < length; n++) {
            if (this.database.patterns[n].p.test(agent)) {
                return { "group"  : this.getGroup(this.database.patterns[n].x),
                         "source" : this.getSource(this.database.patterns[n].x) };
            }
        }
        debug && console.error("samplx-agentdb::lookupPattern: not found.");
        return null;
    },
    
    lookup : function(agent) {
        debug && console.error("samplx-agentdb::lookup('" + agent + "')");
        var r = this.lookupHash(agent);
        if (r === null) {
            r = this.lookupPattern(agent);
        }
        if (r === null) {
            if ((typeof agent != 'string') || (agent === '')) {
                return { "group" : "None", "source" : "None" };
            } else {
                return { "group" : "Unknown", "source" : "Unknown" };
            }
        }
        debug && console.error("samplx-agentdb::lookup: found result=" + util.inspect(r));
        return r;
    },
    
    /**
     *  Report a list of user-agents for feedback.
     *
     *  @param agents array of user-agent strings to send.
     *  @param reportingUrl where to report.
     */
    sendFeedback : function(agents, reportingUrl) {
        if (util.isArray(agents) && (agents.length > 0)) {
            var parsedUrl = url.parse(reportingUrl || agentdb.FEEDBACK_URL);
            var postData = querystring.stringify({ agents: agents.join("\n")});
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
            var req = http.request(options, function(res) {
                debug && console.error('samplx-agentdb::sendFeedback');
                debug && console.error('STATUS: ' + res.statusCode);
                debug && console.error('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    debug && console.error('samplx-agentdb::sendFeedback: BODY: ' + chunk);
                });
                
                res.on('end', function () {
                    debug && console.error('samplx-agentdb::sendFeedback: end of request.');
                });
            });

            req.on('error', function(e) {
                debug && console.error('samplx-agentdb::sendFeedback: Error on request: ' + e.message);
                throw e;
            });
            req.write(postData);
            req.end();
        }
    },
};

/** Define module as agentdb singleton. */
exports = module.exports = agentdb;

