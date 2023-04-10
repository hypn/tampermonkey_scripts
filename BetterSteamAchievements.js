// ==UserScript==
// @name         BetterSteamAchievements
// @namespace    https://steamcommunity.com/
// @version      0.1
// @description  Adds a link to sort steam achievements in reverse date order
// @author       Hypn
// @match        https://steamcommunity.com/*
// @icon         https://www.google.com/s2/favicons?domain=steamcommunity.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.getDateValue = function(dateStr) {

      var reformatted = dateStr.replace("Unlocked ", "").replace(" @ ", "|").replaceAll("\t", "").replaceAll("\n", "");

      // add year if not present
      if (dateStr.indexOf(",") == -1) {
        var thisYear = new Date().getFullYear();
        reformatted = reformatted.replace("|", ", " + thisYear + "|")
      }

      var d = reformatted.split("|")[0];
      var t = reformatted.split("|")[1];

      // make sure hours are double digits
      if (t.split(":")[0].length != 2) {
        t = "0" + t;
      }

      if (t.indexOf("pm") > 0) {
        t = "PM" + t;
      } else {
        t = "AM" + t;
      }

      return new Date(d).getTime() + "" + t
    }

    // add a "sort by most reviews" button which re-orders items currently on the page (does NOT perform a new search!)
    window.sortByMostRecent = function() {
        var i=0;

        // find all of the search results
        var results = document.querySelectorAll(".achieveUnlockTime");

        // sort them by number of reviews
        var array = [];
        for (i=0; i<results.length; i++) {
            var elem = results[i];
            array.push({
                title: elem.parentElement.parentElement.querySelector('.achieveTxt').textContent.split("\n")[1].replaceAll("\t", ""),
                elem: elem.parentElement.parentElement,
                value: window.getDateValue(elem.textContent)
            });
        }

        var sorted = array.sort(function(a, b) {
            return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0)
        }).reverse();


        // find the parent container
        var parent = array[0].elem.parentElement

        // remove all of the results
        for (i=0; i<sorted.length; i++) {
            if (parent) {
                parent.removeChild(sorted[i].elem)
            }
        }

        // get the first remaining element
        var before = parent.firstChild;

        // add the results back
        for (i=0; i<sorted.length; i++) {
            if (parent) {
                parent.insertBefore(sorted[i].elem, before);
            }
        }

        // remove the "button" (which will end up half way down the page), causing it to be re-added at the top
        document.getElementsByClassName("btnSortByMostRecent")[0].remove();
    }

    // a button (link) to trigger the re-sorting
    window.addMostRecentSortButton = function() {
      // what to put it above
      var container = document.querySelector('#personalAchieve')

      var btnSortByMostRecent = document.createElement("a");
      btnSortByMostRecent.href = "javascript:window.sortByMostRecent()";
      btnSortByMostRecent.innerHTML = "Most Recent<br /><br />";
      btnSortByMostRecent.style.paddingLeft = "90%";
      btnSortByMostRecent.classList.add("btnSortByMostRecent");

      container.insertBefore(btnSortByMostRecent, container.firstChild)
    }

    // main loop to add the button
    var interval = setInterval(function() {
        var mostRecentLink = (document.getElementsByClassName("btnSortByMostRecent").length > 0);

        if (!mostRecentLink) {
          window.addMostRecentSortButton();
        }
    }, 1000)

})();
