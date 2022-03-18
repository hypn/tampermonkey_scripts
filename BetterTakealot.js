// ==UserScript==
// @name         BetterTakealot
// @namespace    https://www.takealot.com/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.takealot.com/*
// @icon         https://www.google.com/s2/favicons?domain=takealot.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.sortByMostReviews = function() {
        var i=0;

        // find all of the search results
        var results = document.getElementsByClassName("small-3");

        // sort them by number of reviews
        var array = [];
        for (i=0; i<results.length; i++) {
            var elem = results[i];
            array.push({
                elem: elem,
                reviews: elem.getElementsByClassName("rating-module_review-count_3g6zO")[0] ? parseInt(elem.getElementsByClassName("rating-module_review-count_3g6zO")[0].innerText.replace(' (', '').replace(')', '')) : 0
            });
        }
        var sorted = array.sort(function(a, b) {
            return (a.reviews > b.reviews) ? 1 : ((b.reviews > a.reviews) ? -1 : 0)
        }).reverse();

        // find the partent container
        var parent = sorted[0].elem.parentElement;

        // remove all of the results
        for (i=0; i<sorted.length; i++) {
            if (parent) {
                parent.removeChild(sorted[i].elem)
            }
        }

        // remove excess "related" rows
        while (parent.childElementCount > 1) {
            parent.removeChild(parent.lastChild);
        }

        // add the results back
        for (i=0; i<sorted.length; i++) {
            if (parent) {
                parent.appendChild(sorted[i].elem);
            }
        }

        // force images to reload
        window.scrollBy(1,1);
        window.scrollBy(-1,-1);
    }

    var attempts = 0;
    var interval = setInterval(function() {
        // inject "Most Reviews" link
        var elem = document.getElementsByClassName("searchSortOrder_searchDrop")[0]
        if (elem) {
            var myLabel = document.createElement("label");
            myLabel.onclick = window.sortByMostReviews
            var myDiv = document.createElement("div");
            myDiv.className = "label-text"
            var mySpan = document.createElement("span");
            var myA = document.createElement("a");
            var myStrong = document.createElement("strong");
            myStrong.innerText = "Most Reviews"

            myA.appendChild(myStrong);
            mySpan.appendChild(myA);
            mySpan.innerHTML += "&nbsp;&nbsp;|";
            myDiv.appendChild(mySpan);
            myLabel.appendChild(myDiv);

            elem.prepend(myLabel);
            clearInterval(interval);
            return;
        }

        // inject Serval Tracker button
        var buttons = document.getElementsByClassName("action-wish")[0];
        var serval = document.getElementById("serval-button");
        if (buttons && !serval) {

          // find the sku
          let sku = false;
          var anchors = document.getElementsByTagName("a");
          for (var i=0; i<anchors.length; i++) {
              var temp = anchors[i];

              if (temp.innerText.indexOf('Reviews') > -1) {
                  let parts = temp.href.split('/');
                  let possibleSku = parts[parts.length - 1];
                  if (possibleSku.indexOf('PL') === 0) {
                      sku = parts[parts.length - 1];
                  }
              }
          }

          if (sku) {
              buttons.innerHTML = buttons.innerHTML + '<br /><a id="serval-button" href="https://www.servaltracker.com/products/' + sku + '/" class="button shade-gray" target="_blank" style="width: 100%">ServalTracker &gt;</a>';
          }
        }

        // stop trying to inject stuff
        attempts++;
        if (attempts > 15) {
            clearInterval(interval);
        }
    }, 1000);

})();
