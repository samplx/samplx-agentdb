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
var buster = require("buster");
var assert = buster.assert;
var refute = buster.refute;
var agentdb = require("../lib/samplx-agentdb.js");
var agents = require("../data/agents.json");
var groups = require("../data/groups.json");
var sources = require("../data/sources.json");

buster.testCase("agentdb", {
    setUp: function () {
        this.nonesuch = {
            "id": 0,
            "agent" : "This agent does not exit.",
            "description": "",
            "status": 0,
            "group": "Unknown",
            "groupId": 1,
            "source": "Unknown",
            "sourceId": 1,
            "timesReported": 0,
            "created": "never",
            "modified": "never"
        };
    },

    "lookupHash": {
        "returns null if not found": function () {
            var r = agentdb.lookupHash(this.nonesuch.agent);
            assert.same(r, null);
        },

        "non-string returns null": function () {
            var r = agentdb.lookupHash(12);
            assert.same(r, null);
            r = agentdb.lookupHash(undefined);
            assert.same(r, null);
            r = agentdb.lookupHash(null);
            assert.same(r, null);
        },
        
        "empty string returns null": function () {
            var r = agentdb.lookupHash('');
            assert.same(r, null);
        },
        
        "finds agents with status < 2": function () {
            agents.forEach(function (agent) {
                if (agent.status < 2) {
                    var r = agentdb.lookupHash(agent.agent);
                    assert.isObject(r);
                    assert.equals(r.group, agent.group);
                    assert.equals(r.source, agent.source);
                    assert.equals(r.group, groups[agent.groupId]);
                    assert.equals(r.source, sources[agent.sourceId]);
                }
            });
        },
    },

    "lookupPattern": {
        "returns null if not found": function () {
            var r = agentdb.lookupPattern(this.nonesuch.agent);
            assert.same(r, null);
        },

        "non-string returns null": function () {
            var r = agentdb.lookupPattern(12);
            assert.same(r, null);
            r = agentdb.lookupPattern(undefined);
            assert.same(r, null);
            r = agentdb.lookupPattern(null);
            assert.same(r, null);
        },
        
        "empty string returns null": function () {
            var r = agentdb.lookupPattern('');
            assert.same(r, null);
        },
        
        "finds agents with status == 2": function () {
            var found = false;
            agents.forEach(function (agent) {
                if (agent.status == 2) {
                    found = true;
                    var r = agentdb.lookupPattern(agent.agent);
                    assert.isObject(r);
                    assert.equals(r.group, agent.group);
                    assert.equals(r.source, agent.source);
                    assert.equals(r.group, groups[agent.groupId]);
                    assert.equals(r.source, sources[agent.sourceId]);
                }
            });
            if (!found) {
                // if we do not have any with status=2, dummy assert
                refute(found);
            }
        },
        
        "find Wget/1.0" : function () {
            var r = agentdb.lookupPattern('Wget/1.0');
            assert.isObject(r);
            assert.equals(r.group, 'Download');
            assert.equals(r.source, 'gnu.org');
        },
        
        "find Opera": function () {
            var r = agentdb.lookupPattern('Opera/9.80 (Windows NT 6.1; U; ru) Presto/2.8.131 Version/11.10');
            assert.isObject(r);
            assert.equals(r.group, 'Browser');
            assert.equals(r.source, 'Opera');
        },
        
    },
    
    "lookup" : {
        "returns unknowns if not found": function () {
            var r = agentdb.lookup(this.nonesuch.agent);
            assert.isObject(r);
            assert.equals(r.group, "Unknown");
            assert.equals(r.source, "Unknown");
        },

        "returns None on empty string": function () {
            var r = agentdb.lookup('');
            assert.isObject(r);
            assert.equals(r.group, "None");
            assert.equals(r.source, "None");
        },
        
        "returns None on non-string": function () {
            var r = agentdb.lookup(undefined);
            assert.isObject(r);
            assert.equals(r.group, "None");
            assert.equals(r.source, "None");
            r = agentdb.lookup(null);
            assert.isObject(r);
            assert.equals(r.group, "None");
            assert.equals(r.source, "None");
            r = agentdb.lookup(42);
            assert.isObject(r);
            assert.equals(r.group, "None");
            assert.equals(r.source, "None");
        },
                
        "finds known agents" : function () {
            agents.forEach(function (agent) {
                if (agent.status < 3) {
                    var r = agentdb.lookup(agent.agent);
                    assert.isObject(r);
                    assert.equals(r.group, agent.group);
                    assert.equals(r.source, agent.source);
                    assert.equals(r.group, groups[agent.groupId]);
                    assert.equals(r.source, sources[agent.sourceId]);
                }
            });
        },
    },
});
