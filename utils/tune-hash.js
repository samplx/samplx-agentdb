#!/usr/bin/env node
/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4 fileencoding=utf-8 : */
/*
 *     Copyright 2013, 2014 James Burlingame
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
var agents = require("../data/agents.json");
var HashTable = require("../lib/hash.js").HashTable;
var agentdb = require("../lib/samplx-agentdb.js");
var util = require("util");

/** Lower limit of hash table size to check. */
var LOWER = 37;
/** Upper limit of hash table size to check. */
var UPPER = 8192;

/** display more output. */
var verbose = false;

/**
 *  sieve of Eratosthenes to get prime numbers.
 *
 *  @param limit
 */
function getPrimes(limit) {
    var sieve = new Array(limit);
    var n, j, k;
    var last = Math.floor(Math.sqrt(limit));
    for (n=2; n < limit; n++) {
        sieve[n] = true;
    }
    for (n=2; n <= last;) {
        for (j= n+n; j < limit; j += n) {
            sieve[j] = false;
        }
        for (j=1; j < last; j++) {
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
 *  @param seed for hash table.
 *  @param multiplier of hash table.
 *  @rtype Array hash table history.
 */
function fill(size, seed, multiplier) {
    var hash = new HashTable(size, seed, multiplier);
    var x = agentdb.getX(1, 1); // dummy data Unknown, Unknown
    agents.forEach(function (agent) {
        if (agent.status < 2) {
            var obj = { "a": agent.agent, "x": x };
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

function varySize(low, high, seed, multiplier, primes) {
    var bestSize, bestDepth;
    primes.forEach(function (size) {
        if ((size > low) && (size < high)) {
            var history = fill(size, seed, multiplier);
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
    console.log("Best { size: " + bestSize + ", seed: " + seed + ", multiplier: " + multiplier + " }");
    var history = fill(bestSize, seed, multiplier);
    dumpHistory(history, bestSize, bestDepth);
    return bestSize;
}

function varySeed(low, high, size, multiplier) {
    var bestSeed, bestDepth;
    var history;
    for (var seed= low; seed <= high; seed++) {
        history = fill(size, seed, multiplier);
        var depth = getDepth(history);
        if (verbose) {
            dumpHistory(history, size, depth);
        }
        if (!bestSeed || (depth < bestDepth)) {
            bestSeed = seed;
            bestDepth = depth;
        }
    }
    console.log("Best { size: " + size + ", seed: " + bestSeed + ", multiplier: " + multiplier + " }");
    history = fill(size, bestSeed, multiplier);
    dumpHistory(history, size, bestDepth);
    return bestSeed;
}

function varyMultiplier(low, high, size, seed) {
    var bestMult, bestDepth;
    var history;
    for (var m= low; m <= high; m++) {
        history = fill(size, seed, m);
        var depth = getDepth(history);
        if (verbose) {
            dumpHistory(history, size, depth);
        }
        if (!bestMult || (depth < bestDepth)) {
            bestMult = m;
            bestDepth = depth;
        }
    }
    console.log("Best { size: " + size + ", seed: " + seed + ", multiplier: " + bestMult + " }");
    history = fill(size, seed, bestMult);
    dumpHistory(history, size, bestDepth);
    return bestMult;
}

/**
 *  tune-hash table main function.
 */
function main() {
    if (verbose) { console.log("Finding primes to " + UPPER); }
    var primes = getPrimes(UPPER);
    if (verbose) { console.log("Done."); }
    
    var bestSize = varySize(LOWER, UPPER, 5381, 33, primes);
    var bestSeed = varySeed(0, 8192, bestSize, 33);
    var bestMult = varyMultiplier(2, 256, bestSize, bestSeed);
    bestSize = varySize(LOWER, UPPER, bestSeed, bestMult, primes);
}

main();

