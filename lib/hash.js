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
var util = require('util');

/**
 *  @ctor HashTable constructor.
 *  @param size of table.
 *  @param seed starting offset.
 *  @param multiplier for hash code.
 */
function HashTable(size, seed, multiplier) {
    if (isNaN(size) || (size <= 0)) {
        throw RangeError('size must be a positive integer.');
    }
    this.size = Math.floor(size);
    if (seed && !isNaN(seed)) {
        this.seed = Math.floor(seed);
    } else {
        this.seed = 5381;
    }
    if (multiplier && !isNaN(multiplier)) {
        this.multiplier = Math.floor(multiplier);
    } else {
        this.multiplier = 33;
    }
    this.table = [];
}

/**
 *  Computer hash value.
 *
 *  @param s string.
 *  @rtype Number.
 */
HashTable.prototype.hash = function (s) {
    var value = this.seed;
    
    for (var n=0, length= s.length; n < length; n++) {
        value = ((value * this.multiplier) ^ s.charCodeAt(n)) >>> 0;
    }
//    console.error("hash('" + s + "')=" + value);
    return value % this.size ;
}

/**
 *  add an entry to the hash table.
 *
 *  @param key
 *  @param obj
 */
HashTable.prototype.add = function (key, obj) {
    var s;
    if (!(key in obj)) {
        throw RangeError('key is not present in obj');
    }
    s = obj[key].toString();
    var n = this.hash(s);
    var entry;
    if (this.table.length < n) {
        this.table[n] = obj;
    } else {
        entry = this.table[n];
        if (!entry) {
            this.table[n] = obj;
        } else if (util.isArray(entry)) {
            entry[entry.length] = obj;
        } else {
            this.table[n] = [ entry, obj ];
        }
    }
}

/**
 *  Lookup an entry.
 *
 *  @param value
 *  @param key
 *  @rtype object
 */
HashTable.prototype.lookup = function (value, key) {
    var n = this.hash(value);
    var entry = this.table[n];

    if (util.isArray(entry)) {
        for (var i=0; i < entry.length; i++) {
            if ((key in entry[i]) && (value == entry[i][key])) {
                return entry[i];
            }
        }
    } else if (entry && (key in entry) && (value == entry[key])) {
        return entry;
    }
    return null;
}

/**
 *  Generate a depth history of the hash table.
 *
 *  @rtype Array
 */
HashTable.prototype.getHistory = function () {
    var h = [];
    var depth;
    for (var n=0; n < this.table.length; n++) {
        if (!this.table[n]) {
            depth = 0;
        } else if (util.isArray(this.table[n])) {
            depth = this.table[n].length;
        } else {
            depth = 1;
        }
        if (h[depth]) {
            h[depth]++;
        } else {
            h[depth] = 1;
        }
    }
    for (var n=0; n < h.length; n++) {
        if (h[n] === undefined) {
            h[n] = 0;
        }
    }
    return h;
}

exports.HashTable = HashTable;

