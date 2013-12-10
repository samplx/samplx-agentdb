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
var agents = require("./agents.json");
var agentdb = require("../lib/samplx-agentdb.js");
var groups = require("./groups.json");
var sources = require("./sources.json");
var util = require("util");

/** flag to enable debug messages. */
var debug = false;

/** add INSERT statements for missing user-agents. */
var createMissing = false;

/** Array of missing user-agents. */
var notfound = [];

/**
 *  quote a string for MySQL insert statement.
 *
 *  @param s
 *  @rtype String
 */
function quote(s) {
    // FIXME
    return s;
}

/**
 *  create an INSERT statement to add a user-agent.
 *  This is normally not needed since the agents.json file comes from
 *  the database to which the data would be inserted.
 */
function addInsert(agent) {
/*
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `userAgent` VARCHAR(255) NOT NULL,
    `agentGroup_id` INT UNSIGNED NOT NULL DEFAULT '1',
    `agentSource_id` INT UNSIGNED NOT NULL DEFAULT '1',
    `timesReported` INT UNSIGNED NOT NULL DEFAULT '1',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT '0',
    `description` TEXT,
    `created` DATETIME NULL,
    `modified` DATETIME NULL,
*/
    console.log("INSERT INTO `Agents` VALUES (NULL, '" + 
                quote(agent.agent) + "', '" +
                agent.groupId + "', '" +
                agent.sourceId + 
                "', '0', '0', '', NOW(), NOW());");
}

/**
 *  check-status main function.
 */
function main() {
    agents.forEach(function (agent) {
        var status = 0;
        var r = agentdb.lookupPattern(agent.agent);
        if (r != null) {
            if ((r.group == agent.group) && (r.source == agent.source)) {
                status = 2;
            } else {    // pattern did not match, need to use exact match (hash)
                status = 1;
            }
        }
        if (status == 0) {
            r = agentdb.lookupHash(agent.agent);
            if (r != null) {
                if ((r.group != agent.group) || (r.source != agent.source)) {
                    debug && console.error("ERROR: lookup did not match: " + agent.agent);
                    debug && console.error("  lookup.group=" + r.group+", expected="+agent.group+", lookup.source=" + r.source + ", expected="+agent.source);
                } else {
                    status = 1;
                }
            }
        }
        if (status == 0) {
            if ((agent.status < 3) && ((agent.group != "Unknown") || (agent.source != "Unknown"))) {
                debug && console.error("ERROR: missing:" + agent.agent);
                notfound.push(agent);
            }
        }
        if ((status != 0) && (status != agent.status)) {
            console.log("UPDATE `Agents` SET status='" + status + "' WHERE `id`='" + agent.id + "';");
        }
    });
    
    if (notfound.length > 0) {
        console.error("Warning: user-agents were not found: " + notfound.length);
        if (createMissing) {
            notfound.forEach(function (agent) {
                addInsert(agent);
            });
        }
    }
}

main();

