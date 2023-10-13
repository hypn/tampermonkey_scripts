// ==UserScript==
// @name         BetterScrapy
// @namespace    https://scrapy.co.za/
// @version      0.1
// @description  Link directly to external sites, and sort by lowest price
// @author       HypnZA
// @match        https://scrapy.co.za/*
// @icon         https://www.google.com/s2/favicons?domain=scrapy.co.za/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.sortByLowestPrice = function() {
        // find all elements
        let elements = document.getElementsByClassName("col-lg-3 col-md-4 col-sm-6 mb-grid-gutter");

        if (elements.length) {
            let parent = elements[0].parentElement;
            console.log("Deleting " + elements.length + " elements...");

            // sort them by price
            var array = [];
            for (var i = elements.length - 1; i >= 0; i--) {
                var elem = elements[i];
                array.push({
                    elem: elem,
                    value: parseFloat(elem.getElementsByClassName("fs-base")[1].textContent.replaceAll("R", "").replaceAll("&nbsp;", "").replace(",", ".").replace(/\s/g,'') || 0)
                });
                parent.removeChild(elem);
            }

            var sorted = array.sort(function(a, b) {
                return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0)
            });

            // add the results back
            for (var i = 0; i < sorted.length; i++) {
                if (parent) {
                    parent.appendChild(sorted[i].elem);
                }
            }

            // // force images to reload
            // window.scrollBy(1,1);
            // window.scrollBy(-1,-1);
        }
    }

    let running = false;

    function fixLinks() {
        if (!running) {
            running = true;

            // fix item links and disable modals
            let items = document.getElementsByClassName("text-center shop-product-details");
            let links = document.getElementsByClassName("btn shop-product-details");
            for (var i = 0; i < items.length; i++) {
                let item = items[i];
                item.href = links[i].href;
                item.removeAttribute("data-bs-toggle");
            }

            let topBar = document.getElementsByClassName("bg-light shadow-lg rounded-3 p-4 mt-n5 mb-4")[0];
            if (topBar) {
                if (!document.getElementById("hypnSort1")) {
                    var lowestPrice = document.createElement("a");
                    lowestPrice.id = "hypnSort1";
                    lowestPrice.href = "javascript:window.sortByLowestPrice()";
                    //lowestPrice.classList.add("lowestPrice");

                    var myStrong = document.createElement("strong");
                    myStrong.innerText = "Lowest Price"
                    lowestPrice.appendChild(myStrong);

                    topBar.appendChild(lowestPrice);
                }
            }

            running = false;
        }
    }

    setInterval(fixLinks, 1000);
})();
