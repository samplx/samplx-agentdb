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
var hash = require("../lib/hash.js");

buster.testCase("hash", {
    setUp: function () {
        this.h = new hash.HashTable(3);
        this.agents = 
            [
             { "agent": "123spider-Bot (Version: 1.02&#44; powered by www.123spider.de", "group": "checker", "source": "unknown" }, 
             { "agent": "192.comAgent", "group": "bot", "source": "unknown" }, 
             { "agent": "1st ZipCommander (Net) - http://www.zipcommander.com/", "group": "bot", "source": "unknown" }, 
             { "agent": "2Bone_LinkChecker/1.0 libwww-perl/5.64", "group": "checker", "source": "unknown" }, 
             { "agent": "360Spider", "group": "bot", "source": "360spider" }, 
             { "agent": "4anything.com LinkChecker v2.0", "group": "bot", "source": "unknown" }, 
             { "agent": "8484 Boston Project v 1.0", "group": "unwanted", "source": "unknown" }, 
             { "agent": "A1 Keyword Research/1.0.2 (+http://www.micro-sys.dk/products/keyword-research/) miggibot/2007.03.27", "group": "checker", "source": "unknown" }, 
             { "agent": "A1 Sitemap Generator/1.0 (+http://www.micro-sys.dk/products/sitemap-generator/) miggibot/2006.01.24", "group": "bot", "source": "unknown" }, 
             { "agent": "aardvark-crawler", "group": "bot", "source": "unknown" }
            ];
    },

    "add": {
        "add an agent": function () {
            this.h.add("agent", this.agents[0]);
            
            var count = 0;
            for (var n=0; n < this.h.size; n++) {
                if (this.h.table[n]) {
                    count++;
                }
            }
            assert.equals(count, 1);
        },

    },

    "lookup": {
        "empty return null": function () {
            var r = this.h.lookup("agent", this.agents[0]);
            assert.same(r, null);
        },

        "throws if key not in object": function () {
            assert.exception(function () {
                this.h.lookup("nonesuch", this.agents[0]);
            });
        },
        
        "returns object added": function () {
            var n;
            for (n = 0; n < this.agents.length; n++) {
                this.h.add("agent", this.agents[n]);
            }
            
            var r;
            for (n = 0; n < this.agents.length; n++) {
                r = this.h.lookup(this.agents[n]["agent"], "agent");
                assert.same(r, this.agents[n]);
            }
        },
    }
});
