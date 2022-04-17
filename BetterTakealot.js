// ==UserScript==
// @name         BetterTakealot
// @namespace    https://www.takealot.com/
// @version      0.4
// @description  Adds some new features to takealot.com
// @author       Hypn
// @match        https://www.takealot.com/*
// @icon         https://www.google.com/s2/favicons?domain=takealot.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // add a "sort by most reviews" button which re-orders items currently on the page (does NOT perform a new search!)
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

    // prompts for an amount then performs the current search/results adding a price filter
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

    // helper function to extract product items and skus from a page (cart or wishlist)
    function addProductsFromAnchor(fn) {
        // takes a function to run against each found product
        // eg: how to add a button to the page for the product
        var products = document.getElementsByClassName("product-anchor");
        for (var i=0; i<products.length; i++) {
            var parts = products[i].href.split("/");
            var sku = parts[parts.length-1];

            if (sku && (sku.indexOf("PL") === 0)) {
                try {
                    fn(products[i], sku);
                } catch (e) {
                    // console.log("Error trying to inject Serval link for: ", products[i], e);
                }
            }
        }
    }

    // makes a grey Serval button for use on the product + wishlist pages
    function makeServalButton(sku) {
        var button = document.createElement("a");
        button.id = "serval-button"
        button.target = "_blank";
        button.href = "https://www.servaltracker.com/products/" + sku + "/";
        button.innerHTML = '<img src="https://www.google.com/s2/favicons?domain=servaltracker.com">&nbsp;Serval Tracker';
        button.classList.add("button");
        button.classList.add("shade-gray");
        button.style.width = "100%";
        button.style.marginTop = "8px";
        return button;
    }

    // attempts to find the sku for the current product page
    function findSku() {
        var sku = false;
        var anchors = document.getElementsByTagName("a");
        for (var i=0; i<anchors.length; i++) {
            var temp = anchors[i];

            if ((temp.href.indexOf('returnTo') == -1) && (temp.href.indexOf('PL') > -1) && (temp.href.indexOf('/description') > -1)) {
                let parts = temp.href.replace('/description', '').replace('/product-information', '').split('/');
                let possibleSku = parts[parts.length - 1].split("?")[0];
                if ((possibleSku.indexOf('PL') === 0) && (possibleSku.length < 18)) {
                    sku = parts[parts.length - 1];
                }
            }
        }
        return sku;
    }

    // main loop to handle dynamic page updates,
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

        // determine serval button states (including which page the user's on)
        var serval = document.getElementById("serval-button");
        var variantProductPage = (document.getElementsByClassName("buybox-actions-module_variants-actions-container_lgTZH").length > 0);
        var wishlistPage = (document.getElementsByClassName("detail-module_wishlist-wrapper_3alXg").length > 0);
        var cartPage = (document.getElementsByClassName("cart").length > 0);

        // inject Serval Tracker button on the Product page (which has a "wish" action button on it)
        var sku = false;
        var buttons = document.getElementsByClassName("action-wish")[0];
        if (buttons && !serval) {
            sku = findSku();
            if (sku) {
                var servalButton = makeServalButton(sku);
                // try and line up the serval icon with the wishlist heart icon:
                servalButton.style.paddingRight = "18%"
                buttons.appendChild(servalButton);
            }
        } else {
          // variable-size item (eg: clothing)?
          if (variantProductPage && !document.getElementById("serval-variant-button")) {
            sku = findSku();
            if (sku) {
                var destination = document.getElementsByClassName("buybox-actions")[0].firstChild;
                var servalVariantButton = makeServalButton(sku);
                servalVariantButton.id = "serval-variant-button";
                destination.appendChild(servalVariantButton);
            }
          }
        }

        // inject Serval Tracker button on the Wishlist page
        if (wishlistPage && !serval) {
            addProductsFromAnchor(function(product, sku) {
                var servalButton = makeServalButton(sku);
                var destination = product.parentElement.lastChild.lastChild.lastChild.lastChild;
                destination.appendChild(servalButton);
            });
        }

        // inject Serval Tracker text link on the Cart page
        if (cartPage && !serval) {
            addProductsFromAnchor(function(product, sku) {
                var button = document.createElement("button");
                button.classList.add("button");
                button.classList.add("clear");
                button.id = "serval-button"
                button.innerHTML = '<img src="https://www.google.com/s2/favicons?domain=servaltracker.com">&nbsp;Serval Tracker';
                button.addEventListener("click", function() {
                    window.open("https://www.servaltracker.com/products/" + sku + "/", "_blank")
                });
                product.parentElement.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.appendChild(button);
            });
        }
    }, 1000)

    // hide sponsored items
    var sponsoredInterval = setInterval(function() {
        var sponsored = document.querySelectorAll('[data-ref="sponsored-ad-text"]');
        for (var j=0; j<sponsored.length; j++) {
            var sponsoredElem = sponsored[j].parentElement.parentElement.parentElement.parentElement.parentElement;
            if (sponsoredElem) {
                sponsoredElem.style.transition = "opacity 200ms ease-in-out";
                sponsoredElem.style.opacity = "20%";
            }
        }
    }, 1000)
})();
