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

// user agent database
var database = [
    // Blazer
    { pattern: new RegExp(/Mozilla\/.*MSIE.*PalmSource.*Blazer/), group: 'phone', source: 'palm' },
    // Bolt
    { pattern: new RegExp(/Mozilla\/.*BOLT\//), group: 'phone', source: 'nokia' },
    // Doris
    { pattern: new RegExp(/Doris.*Symbian/), group: 'phone', source: 'nokia' },
    // Dorothy
    { pattern: new RegExp(/Mozilla\/.*Dorothy/), group: 'phone', source: 'dorothy' },
    // Fennec
    { pattern: new RegExp(/Mozilla\/.*Fennec\//), group: 'phone', source: 'fennec' },
    // Go Browser
    { pattern: new RegExp(/GoBrowser\//), group: 'phone', source: '3g' },
    // IE Mobile
    { pattern: new RegExp(/Mozilla\/.*; MSIE.*IEMobile/), group: 'mobile', source: 'ie' },
    { pattern: new RegExp(/Mozilla\/.*; MSIE.*Windows CE/), group: 'mobile', source: 'ie' },
    { pattern: new RegExp(/Mozilla\/.*; MSIE.*Tablet PC/), group: 'tablet', source: 'ie' },
    // Iris
    { pattern: new RegExp(/Mozilla\/.*Iris\//), group: 'phone', source: 'torch' },
    // Maemo
    { pattern: new RegExp(/Mozilla\/.*Maemo Browser/), group: 'mobile', source: 'maemo' },
    // MIB -- Motorola Internet Browser
    { pattern: new RegExp(/MOT-.*MIDP-/), group: 'phone', source: 'motorola' },
    { pattern: new RegExp(/BlackBerry.*MIDP-/), group: 'phone', source: 'motorola' },
    // Minimo
    { pattern: new RegExp(/Mozilla\/.*Minimo\//), group: 'phone', source: 'minimo' },
    // NetFront
    { pattern: new RegExp(/NetFront\//), group: 'phone', source: 'netfront' },
    // Opera Mini
    { pattern: new RegExp(/Opera\/.*Opera Mini\//), group: 'mobile', source: 'opera' },
    // Opera Mobile
    { pattern: new RegExp(/Opera\/.*Opera Mobi\//), group: 'mobile', source: 'opera' },
    // SEMC-Browser
    { pattern: new RegExp(/SonyEricsson.*SEMC-Browser/), group: 'mobile', source: 'semc' },
    // Skyfire
    { pattern: new RegExp(/Mozilla\/.*Skyfire\//), group: 'mobile', source: 'skyfire' },
    // TeaShark
    { pattern: new RegExp(/Mozilla\/.*TeaShark\//), group: 'mobile', source: 'teashark' },
    // Teleca-Obigo
    { pattern: new RegExp(/Mozilla\/.*Teleca/), group: 'mobile', source: 'teleca' },
    // uZard Web
    { pattern: new RegExp(/Mozilla\/.*uZardWeb\//), group: 'mobile', source: 'logicplant' },
    // SeaMonkey -- must be before FireFox
    { pattern: new RegExp(/Mozilla\/.*SeaMonkey\//), group: 'browser', source: 'seamonkey' },
    // FireFox
    { pattern: new RegExp(/Mozilla\/.*Gecko\/.* Firefox\//), group: 'browser', source: 'firefox' },
    { pattern: new RegExp(/Mozilla\/.*Gecko\/.* Firebird\//), group: 'browser', source: 'firefox' },
    { pattern: new RegExp(/Mozilla\/.*Gecko\/.* Phoenix\//), group: 'browser', source: 'firefox' },
    // Netscape
    { pattern: new RegExp(/Mozilla\/.*Gecko\/.* Netscape.*/), group: 'desktop', source: 'netscape' },
    // Konqueror
    { pattern: new RegExp(/Mozilla\/.*Konqueror\//), group: 'browser', source: 'konqueror' },
    // Opera
    { pattern: new RegExp(/Opera\//), group: 'browser', source: 'opera' },
    // Acoo Browser -- must be before IE
    { pattern: new RegExp(/Mozilla\/.*Acoo Browser/), group: 'browser', source: 'acoobrowser.com' },
    // America Online Browser -- must be before IE
    { pattern: new RegExp(/Mozilla\/.*America Online Browser/), group: 'browser', source: 'aol' },
    // Internet Explorer
    { pattern: new RegExp(/Mozilla\/.*; MSIE/), group: 'browser', source: 'ie' },
    // BlackBerry -- must be before Safari
    { pattern: new RegExp(/Mozilla\/.*BlackBerry.*KHTML, like Gecko.*Mobile Safari\//), group: 'mobile', source: 'blackberry' },
    // Android Webkit
    { pattern: new RegExp(/Mozilla\/.*Android.*KHTML, like Gecko.*Mobile Safari\//), group: 'mobile', source: 'android' },
    // iPad Chrome
    { pattern: new RegExp(/Mozilla\/.*ipad.*KHTML, like Gecko.*Chrome\//), group: 'tablet', source: 'chrome' },
    // Mobile Chrome
    { pattern: new RegExp(/Mozilla\/.*KHTML, like Gecko.*Chrome\//), group: 'mobile', source: 'chrome' },
    // Nacscape -- must be before Safari
    { pattern: new RegExp(/Mozilla\/.*Navscape\//), group: 'mobile', source: 'navscape.com' },
    // Safari -- must be after Chrome
    { pattern: new RegExp(/Mozilla\/.*iPad.*Safari\//), group: 'tablet', source: 'safari' },
    { pattern: new RegExp(/Mozilla\/.*iPhone.*Safari\//), group: 'phone', source: 'safari' },
    { pattern: new RegExp(/Mozilla\/.*Android.*Safari\//), group: 'mobile', source: 'safari' },
    { pattern: new RegExp(/Mozilla\/.*\(KHTML, like Gecko\).*Safari\//), group: 'browser', source: 'safari' },
    // Thunderbird
    { pattern: new RegExp(/Mozilla\/.*Thunderbird\//), group: 'browser', source: 'thunderbird' },
    // Offline Explorer
    { pattern: new RegExp(/Offline Explorer\//), group: 'download', source: 'metaproducts' },
    { pattern: new RegExp(/Web Downloader\//), group: 'download', source: 'metaproducts' },
    // WebCopier
    { pattern: new RegExp(/WebCopier v/), group: 'download', source: 'maximumsoft' },
    // Wget
    { pattern: new RegExp(/Wget\//), group: 'download', source: 'gnu.org' },
    // Curl
    { pattern: new RegExp(/curl\//), group: 'download', source: 'curl.haxx.se' },
    // W3C Validator
    { pattern: new RegExp(/W3C_Validator\//), group: 'checker', source: 'w3c' },
    // W3C Checklink
    { pattern: new RegExp(/W3C-checklink\//), group: 'checker', source: 'w3c' },
    // Xenu Link Sleuth
    { pattern: new RegExp(/Xenu Link Sleuth/), group: 'checker', source: 'tilman-hausherr' },
    // WordPress
    { pattern: new RegExp(/WordPress\//), group: 'download', source: 'wordpress' },
    // Lynx
    { pattern: new RegExp(/Lynx\//), group: 'browser', source: 'lynx' },
    // Amaya
    { pattern: new RegExp(/amaya\//), group: 'browser', source: 'w3c' },
    // Cocoal.icio.us
    { pattern: new RegExp(/Cocoal\.icio\.us\//), group: 'browser', source: 'scifihifi.com' },
    // iTunes
    { pattern: new RegExp(/iTunes\//), group: 'browser', source: 'apple' },
    { pattern: new RegExp(/Mozilla\/.* \(compatible; WebCapture/), group: 'download', source: 'adobe' },
    // MS Windows Media Player
    { pattern: new RegExp(/Windows-Media-Player\//), group: 'browser', source: 'microsoft' },
    // ABrowse
    { pattern: new RegExp(/Mozilla\/.*ABrowse/), group: 'browser', source: 'abrowse' },
    // Googlebot
    { pattern: new RegExp(/Googlebot\/.*\(+http:\/\/www\.google\.com\/bot\.html\)/), group: 'bot', source: 'google' },
//    { pattern: new RegExp(//), group: '', source: '' },
    // empty
    { pattern: '', group: 'none', source: 'none' },
    { pattern: '-', group: 'none', source: 'none' },
];

exports = module.exports = database;

