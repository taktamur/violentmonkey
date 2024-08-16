// ==UserScript==
// @name         実験
// @namespace    taktamur
// @version      1.0
// @description  実験用
// @author       taktamur
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

function test() {
  console.dir(GM_getValue("test"));
}
GM_registerMenuCommand("test", test);
