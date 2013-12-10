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
var HashTable = require("../lib/hash.js").HashTable;
var agentdb = require("../lib/samplx-agentdb.js");
var util = require("util");

/** Lower limit of hash table size to check. */
var LOWER = 1021;
/** Upper limit of hash table size to check. */
var UPPER = 65535;
/** display more output. */
var verbose = false;

/**
 *  sieve of Eratosthenes to get prime numbers.
 *
 *  @param limit
 */
function sieve(limit) {
    var sieve = Array(limit);
    var n, j, k;
    var last = Math.floor(Math.sqrt(limit));
    for (n=2; n < limit; n++) {
        sieve[n] = true;
    }
    for (n=2; n <= last;) {
        for (j= n+n; j < limit; j += n) {
            sieve[j] = false;
        }
        for (var j=1; j < last; j++) {
            k = n+j;
            if (sieve[k]) {
                n = k;
                break;
            }
        }
    }
    var primes = [];
    for (n=2; n < limit; n++) {
        if (sieve[n]) {
            primes.push(n);
        }
    }
    return primes;
}

/**
 *  Fill the hash table with the agents.
 *
 *  @param size of hash table.
 *  @rtype Array hash table history.
 */
function fill(size) {
    var hash = new HashTable(size);
    agents.forEach(function (agent) {
        if (agent.status < 2) {
            var obj = { a: agent.agent, x: agentdb.getX(agent.groupId, agent.sourceId) };
            hash.add('a', obj);
        }
    });
    return hash.getHistory();
}

/**
 *  Write the hash table history to the console.
 *
 *  @param history Array.
 *  @param size of the hash table.
 *  @param depth fit estimate.
 */
function dumpHistory(history, size, depth) {
    console.log("Hash table history, size="+size+", average depth="+depth);
    for (var n=0; n < history.length; n++) {
        console.log("  Depth=" + n + ", count=" + history[n] + ", percent=" + (history[n] / size));
    }
    console.log("");
}

/**
 *  find the average search depth. Include the null entries for cost.
 *
 *  @param history of hash table.
 *  @rtype Number.
 */
function getDepth(history) {
    var total= history[0];
    for (var n=1; n < history.length; n++) {
        total = total + (n * n * history[n]);
    }
    var result = total / agents.length;
//    console.log("total=" + total+", result=" + result);
    return result;
}

/**
 *  tune-hash table main function.
 */
function main() {
    verbose && console.log("Finding primes to " + UPPER);
    var primes = sieve(UPPER);
    verbose && console.log("Done.");
    var bestSize, bestDepth;
    primes.forEach(function (size) {
        if (size > LOWER) {
            var history = fill(size);
            var depth = getDepth(history);
            if (verbose) {
                dumpHistory(history, size, depth);
            }
            if (!bestSize || (depth < bestDepth)) {
                bestSize = size;
                bestDepth = depth;
            }
        }
    });
    console.log("Best size  =" + bestSize);
    var history = fill(bestSize);
    dumpHistory(history, bestSize, bestDepth);
}

main();

