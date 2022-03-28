// ==UserScript==
// @name         BetterTakealot
// @namespace    https://www.takealot.com/
// @version      0.2
// @description  Adds some new features to takealot.com
// @author       Hypn
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

        // find the parent container
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

    window.cheaperThan = function() {
      var amount = prompt("Find items cheaper than (and including)? (amount in rands)");
      if (amount > '') {
        if (isNaN(parseInt(amount))) {
          alert("Invalid amount - enter only numbers");
        } else {
          var url = new URL(window.location.href);
          var search_params = url.searchParams;
          search_params.set('filter', 'Price:*-' + parseInt(amount).toString());
          url.search = search_params.toString();
          window.location.href = url.toString();
        }
      }
    }

    var attempts = 0;
    var interval = setInterval(function() {
        // inject search results / categories links
        var elem = document.getElementsByClassName("searchSortOrder_searchDrop")[0]
        if (elem) {
            // container
            var myLabel = document.createElement("label");
            var myDiv = document.createElement("div");
            myDiv.className = "label-text"
            var mySpan = document.createElement("span");

            // "most reviews"
            var mostReviews = document.createElement("a");
            mostReviews.href = "javascript:window.sortByMostReviews()";
            var myStrong = document.createElement("strong");
            myStrong.innerText = "Most Reviews"
            mostReviews.appendChild(myStrong);

            // "cheaper than"
            var cheaperThan = document.createElement("a");
            cheaperThan.href = "javascript:window.cheaperThan()";
            cheaperThan.innerText = "Cheaper than"

            // inject them
            mySpan.appendChild(cheaperThan);
            mySpan.innerHTML += "&nbsp;&nbsp;|&nbsp;&nbsp;";
            mySpan.appendChild(mostReviews);
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
            var sku = false;
            var anchors = document.getElementsByTagName("a");
            for (var i=0; i<anchors.length; i++) {
                var temp = anchors[i];

                if ((temp.href.indexOf('returnTo') == -1) && (temp.href.indexOf('PL') > -1) && (temp.href.indexOf('/description') > -1)) {
                    let parts = temp.href.replace('/description', '').replace('/product-information', '').split('/');
                    let possibleSku = parts[parts.length - 1];
                    if ((possibleSku.indexOf('PL') === 0) && (possibleSku.length < 18)) {
                        sku = parts[parts.length - 1];
                    }
                }
            }

            if (sku) {
                var servalLink = document.createElement("a");
                servalLink.id = "serval-button"
                servalLink.target = "_blank";
                servalLink.href = "https://www.servaltracker.com/products/" + sku + "/";
                servalLink.innerHTML = 'Serval Tracker &gt;';
                servalLink.classList.add("button");
                servalLink.classList.add("shade-gray");
                servalLink.style.width = "100%";
                servalLink.style.marginTop = "8px";
                buttons.appendChild(servalLink);
            }
        }

        // stop trying to inject stuff
        attempts++;
        if (attempts > 15) {
            clearInterval(interval);
        }
    }, 1000);

    setInterval(function() {
        var sponsered = document.querySelectorAll('[data-ref="sponsored-ad-text"]');
        for (var i=0; i<sponsered.length; i++) {
            var elem = sponsered[i].parentElement.parentElement.parentElement.parentElement.parentElement;
            if (elem) {
                elem.style.opacity = "20%"
            }
        }
    }, 1500)
})();
