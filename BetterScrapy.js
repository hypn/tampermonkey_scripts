// ==UserScript==
// @name         BetterScrapy
// @namespace    https://scrapy.co.za/
// @version      0.2
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
        }
    }

    window.sortByBiggestDiscount = function() {
        // find all elements
        let elements = document.getElementsByClassName("col-lg-3 col-md-4 col-sm-6 mb-grid-gutter");

        if (elements.length) {
            var parent = elements[0].parentElement;

            // sort them by price
            var array = [];
            for (var i = elements.length - 1; i >= 0; i--) {
                var elem = elements[i];

                // let discount = elem.getElementsByClassName("daily-discount") || ;

                let dailyDiscount = elem.getElementsByClassName("daily-discount");
                let averageDiscount = elem.getElementsByClassName("average-discount");

                let discount = "0";
                if (averageDiscount.length > 0) {
                  discount = averageDiscount[0].textContent.replace(/\s/g,'')
                }
                if (dailyDiscount.length > 0) {
                  discount = dailyDiscount[0].textContent.split(":")[1].replace(/\s/g,'')
                }

                if (discount && (discount[0] == '-')) {
                  discount = discount.replace("-", "").replace("%", "");
                } else {
                  discount = 0;
                }

                array.push({
                    elem: elem,
                    value: parseFloat(discount)
                });
                parent.removeChild(elem);
            }

            var sorted = array.sort(function(a, b) {
                return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0)
            }).reverse();
            console.log(sorted);

            // add the results back
            for (var i = 0; i < sorted.length; i++) {
                if (parent) {
                    parent.appendChild(sorted[i].elem);
                }
            }
        }
    }

    let running = false;

    function doStuff() {
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

            // make names into links and disable truncation
            Array.from(document.getElementsByClassName("product-title mb-2 fs-base")).forEach(elem => {
              let name = elem.textContent;
              let link = elem.parentElement.parentElement.getElementsByTagName("a")[0].href;
              elem.innerHTML = '<a href="' + link + '">' + name + '</a>';
            });

            // add "sort" link(s)
            let topBar = document.getElementsByClassName("bg-light shadow-lg rounded-3 p-4 mt-n5 mb-4")[0];
            if (topBar) {
                if (!document.getElementById("hypnSort1")) {
                    var lowestPrice = document.createElement("a");
                    lowestPrice.id = "hypnSort1";
                    lowestPrice.href = "javascript:window.sortByLowestPrice()";
                    var lowestPriceText = document.createElement("strong");
                    lowestPriceText.innerText = "Lowest Price"
                    lowestPrice.appendChild(lowestPriceText);
                    topBar.appendChild(lowestPrice);

                    var spacer1 = document.createElement("span");
                    spacer1.innerText = "  |  "
                    topBar.appendChild(spacer1);

                    var biggestDiscount = document.createElement("a");
                    biggestDiscount.id = "hypnSort2";
                    biggestDiscount.href = "javascript:window.sortByBiggestDiscount()";
                    var biggestDiscountText = document.createElement("strong");
                    biggestDiscountText.innerText = "Biggest Discount"
                    biggestDiscount.appendChild(biggestDiscountText);
                    topBar.appendChild(biggestDiscount);
                }
            }

            running = false;
        }
    }

    setInterval(doStuff, 1000);
})();
