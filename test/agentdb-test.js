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
var agents = require("./agents.json");
var groups = require("./groups.json");
var sources = require("./sources.json");

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
    },
    
    "lookup" : {
        "returns unknowns if not found": function () {
            var r = agentdb.lookup(this.nonesuch.agent);
            assert.isObject(r);
            assert.equals(r.group, "Unknown");
            assert.equals(r.source, "Unknown");
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
