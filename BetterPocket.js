// ==UserScript==
// @name         BetterPocket
// @namespace    https://getpocket.com/
// @version      0.1
// @description  Link directly to external site
// @author       HypnZA
// @match        https://getpocket.com/*
// @icon         https://www.google.com/s2/favicons?domain=getpocket.com
// @grant        none
// ==/UserScript==

let running = false;

function fixLinks() {
    if (!running) {
        running = true;

        var results = document.getElementsByClassName("list")
        // replace each saved item and change the link to the external url
        for (var i=0; i<results.length; i++) {
            var elem = results[i];
            if (elem.getElementsByTagName("a").length == 3) {
                var link = elem.getElementsByTagName("a")[2].getAttribute("href");
                if (link != "") {
                    link = link.replace("?utm_source=pocket_saves", "?").replace("&utm_source=pocket_saves", "");
                    var temp;
                    temp = elem.getElementsByTagName("a")[0];
                    temp.setAttribute("href", link)
                    temp = elem.getElementsByTagName("a")[1];
                    temp.setAttribute("href", link)
                }
            }
        }

        document.querySelectorAll('[data-cy="Favorite"]').forEach(favorite => favorite.remove());
        document.querySelectorAll('[data-cy="Tag"]').forEach(favorite => favorite.remove());
        document.querySelectorAll('[data-cy="Share"]').forEach(favorite => favorite.remove());
        document.querySelectorAll('[data-cy="Archive"]').forEach(favorite => favorite.remove());
        // footer-actions

        running = false;
    }
}

(function() {
    'use strict';
    setInterval(fixLinks, 500);
})();
