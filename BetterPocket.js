// ==UserScript==
// @name         BetterPocket
// @namespace    https://getpocket.com/
// @version      0.1
// @description  Link directly to external site
// @author       You
// @match        https://getpocket.com/*
// @icon         https://www.google.com/s2/favicons?domain=getpocket.com
// @grant        none
// ==/UserScript==

let running = false;

function fixLinks() {
    if (!running) {
        running = true;
        var results = document.getElementsByClassName("publisher");

        // replace each saved item and change the link to the external url
        for (var i=0; i<results.length; i++) {
            var elem = results[i];
            elem.classList.remove("publisher");

            var link = elem.href.replace("?utm_source=pocket_mylist", "?").replace("&utm_source=pocket_mylist", "&").replace("?&", "?");
            var target = elem.parentElement.parentElement.firstElementChild.firstElementChild;
            if (target) {
                elem.parentElement.parentElement.firstElementChild.firstElementChild.href = link;
            } else {
                console.log('failed to find target for link ' + link);
            }
        }

        running = false;
    }
}

(function() {
    'use strict';
    setInterval(fixLinks, 500);
})();
