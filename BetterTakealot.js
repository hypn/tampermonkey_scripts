// ==UserScript==
// @name         BetterTakealot
// @namespace    https://www.takealot.com/
// @version      0.9
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
        var results = document.querySelectorAll(".listings-container > .grid-x > .cell");

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

    // hide items with too low of a star rating
    window.removeLessThanFourStars = function() {
        var i=0;

        // find all of the search results
        var results = document.querySelectorAll(".listings-container > .grid-x > .cell");

        for (i=0; i<results.length; i++) {
          var elem = results[i];
          var stars = elem.getElementsByClassName("rating-module_rating-wrapper_3Cogb")[0] ? parseFloat(elem.getElementsByClassName("rating-module_rating-wrapper_3Cogb")[0].innerText.split("(")[0]) : 0;
          var reviews = elem.getElementsByClassName("rating-module_review-count_3g6zO")[0] ? parseInt(elem.getElementsByClassName("rating-module_review-count_3g6zO")[0].innerText.replace(' (', '').replace(')', '')) : 0;

          // ignore star rating of items with too few reviews
          if ((stars != 0) && ((stars < 4) || (reviews < 3))) {
            elem.parentElement.removeChild(elem);
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

    function makeRoundServalButton(sku) {
        var roundButton = document.createElement("button");
        roundButton.classList.add("button");
        roundButton.classList.add("ghost");
        roundButton.classList.add("wish");
        roundButton.classList.add("expanded");
        roundButton.classList.add("icon-only");
        roundButton.classList.add("add-to-wishlist-button-module_wishlist-button_1oKrg");
        roundButton.innerHTML = '<a href="https://www.servaltracker.com/products/' + sku + '/" target="_blank"><img src="https://www.google.com/s2/favicons?domain=servaltracker.com"></a>';
        return roundButton;
    }

    // attempts to find the sku for the current product page
    function findSku() {
        var i;
        var temp;
        var sku = false;
        let possibleSku = "";
        var anchors = document.getElementsByTagName("a");

        // use poduct's "reviews" link
        temp = document.getElementsByClassName('reviews');
        if (temp.length > 0) {
            temp = document.getElementsByClassName('reviews')[0].firstChild
            if (temp.length > 0) {
                possibleSku = temp.href.split('PLID')[1].split("?")[0].split('#')[0];
                if ((possibleSku.length > 2) && (possibleSku.length < 18)) {
                    sku = "PLID" + possibleSku;
                }
            }
        }

        if (!sku) {
            for (i=0; i<anchors.length; i++) {
                temp = anchors[i];

                if (!sku && (temp.href.indexOf('returnTo') == -1) && (temp.href.indexOf('PLID') > -1) && (temp.href.indexOf('#') > -1)) {
                    possibleSku = temp.href.split('PLID')[1].split("?")[0].split('#')[0];
                    if ((possibleSku.length > 2) && (possibleSku.length < 18)) {
                        sku = "PLID" + possibleSku;
                    }
                }

                if (!sku && (temp.href.indexOf('returnTo') == -1) && (temp.href.indexOf('PL') > -1) && (temp.href.indexOf('/description') > -1)) {
                    let parts = temp.href.replace('/description', '').replace('/product-information', '').split('/');
                    possibleSku = parts[parts.length - 1].split("?")[0];
                    if ((possibleSku.indexOf('PL') === 0) && (possibleSku.length < 18)) {
                        sku = parts[parts.length - 1];
                    }
                }
            }
        }

        // if user is not logged in? or product doesn't have "Product Info" "Description" tabs?
        if (!sku) {
            for (i=0; i<anchors.length; i++) {
                temp = anchors[i];

                if ((temp.href.indexOf('login?returnTo=') > -1) && ((temp.href.indexOf('/PL') > -1) || (temp.href.indexOf('%2FPL') > -1))) {
                    let parts = temp.href.replace('/description', '').replace('/product-information', '').split('/');
                    parts = parts[parts.length - 1].split('%2F');
                    possibleSku = parts[parts.length - 1].split("?")[0];
                    if ((possibleSku.indexOf('PL') === 0) && (possibleSku.length < 18)) {
                        sku = parts[parts.length - 1];
                    }
                }
            }
        }

        // new layout changes for single product page? :/
        if (!sku) {
            temp = document.querySelectorAll('[data-react-link="true"]')[0];
            let parts = temp.href.replace('/description', '').replace('/product-information', '').split('/');
            let possibleSku = parts[parts.length - 1].split("?")[0];
            if ((possibleSku.indexOf('PL') === 0) && (possibleSku.length < 18)) {
                sku = parts[parts.length - 1];
            }
        }

        return sku;
    }

    // main loop to handle dynamic page updates,
    var interval = setInterval(function() {
        // inject search results / categories links
        var topRightNav = document.getElementsByClassName("searchSortOrder_searchDrop")[0]
        var mostReviewsLink = (document.getElementsByClassName("mostReviews").length > 0);

        // add "Most Reviews" and "Cheaper Than" links (if not already on the page)
        if (topRightNav && !mostReviewsLink) {
            // container
            var myLabel = document.createElement("label");
            var myDiv = document.createElement("div");
            myDiv.className = "label-text"
            var mySpan = document.createElement("span");

            // "most reviews"
            var mostReviews = document.createElement("a");
            mostReviews.href = "javascript:window.sortByMostReviews()";
            mostReviews.classList.add("mostReviews");
            var myStrong = document.createElement("strong");
            myStrong.innerText = "Most Reviews"
            mostReviews.appendChild(myStrong);

            var moreThan4Stars = document.createElement("a");
            moreThan4Stars.href = "javascript:window.removeLessThanFourStars()";
            moreThan4Stars.classList.add("moreThan4Stars");
            var myStrong2 = document.createElement("strong");
            myStrong2.innerText = ">4 Stars"
            moreThan4Stars.appendChild(myStrong2);

            // "cheaper than"
            var cheaperThan = document.createElement("a");
            cheaperThan.href = "javascript:window.cheaperThan()";
            cheaperThan.classList.add("cheaperThan");
            cheaperThan.innerText = "Cheaper than"

            // inject them
            mySpan.appendChild(cheaperThan);
            mySpan.innerHTML += "&nbsp;&nbsp;|&nbsp;&nbsp;";
            mySpan.appendChild(moreThan4Stars);
            mySpan.innerHTML += "&nbsp;&nbsp;|&nbsp;&nbsp;";
            mySpan.appendChild(mostReviews);
            mySpan.innerHTML += "&nbsp;&nbsp;|";
            myDiv.appendChild(mySpan);
            myLabel.appendChild(myDiv);
            topRightNav.prepend(myLabel);
        }

        // add ServalTracker button(s) to the page
        var productPage = (document.getElementsByClassName("pdp").length > 0);
        var variantProductPage = (document.getElementsByClassName("buybox-actions-module_variants-actions-container_lgTZH").length > 0);
        var sku = false;

        if (productPage && !document.getElementById("serval-button")) {
            sku = findSku();
            if (sku) {
                var singleProductButtons = document.getElementsByClassName("buybox-actions");
                var servalButton = makeServalButton(sku);
                servalButton.style.paddingRight = "18%"; // try and line up the serval icon with the wishlist heart icon:
                singleProductButtons[singleProductButtons.length-1].appendChild(servalButton);
            }

        } else if (variantProductPage && !document.getElementById("serval-button")) {
            sku = findSku();
            if (sku) {
                var destination = document.getElementsByClassName("buybox-actions")[0].firstChild;
                var servalVariantButton = makeServalButton(sku);
                servalVariantButton.id = "serval-variant-button";
                destination.appendChild(servalVariantButton);
            }

        } else {
            // add Serval button to search/category/deals pages
            addProductsFromAnchor(function(product, sku) {
                var wishlistPage = (document.getElementsByClassName("detail-module_wishlist-wrapper_3alXg").length > 0);
                var cartPage = (document.getElementsByClassName("cart").length > 0);
                var isListView = product.parentElement.classList.contains("listing-card");
                var isGridView = product.parentElement.classList.contains("product-card");
                var isHomeOrSpecialPage = (isGridView && (product.parentElement.childElementCount === 4));

                if (product.getAttribute("has-serval") !== "true") {
                    var destination = "";
                    var servalButton = false;

                    if (isHomeOrSpecialPage) {
                        // home page and promotional pages are missing the "wishlist" div for our round button
                        var wishlistDiv = document.createElement("div");
                        wishlistDiv.classList.add("product-card-module_wishlist-action_3PyVy");
                        servalButton = makeRoundServalButton(sku);
                        wishlistDiv.appendChild(servalButton);
                        product.parentElement.appendChild(wishlistDiv);

                    } else if (isGridView) {
                        servalButton = makeRoundServalButton(sku);
                        product.parentElement.childNodes[2].appendChild(servalButton);
                    } else if (wishlistPage) {
                        servalButton = makeServalButton(sku);
                        destination = product.parentElement.lastChild.lastChild.lastChild.lastChild;
                        destination.appendChild(servalButton);

                    } else if (cartPage) {
                        var button = document.createElement("button");
                        button.classList.add("button");
                        button.classList.add("clear");
                        button.id = "serval-button"
                        button.innerHTML = '<img src="https://www.google.com/s2/favicons?domain=servaltracker.com">&nbsp;Serval Tracker';
                        button.addEventListener("click", function() {
                            window.open("https://www.servaltracker.com/products/" + sku + "/", "_blank")
                        });
                        product.parentElement.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.appendChild(button);

                    } else if (isListView) {
                        servalButton = makeServalButton(sku);
                        product.parentElement.childNodes[1].childNodes[2].children[1].appendChild(servalButton);
                    }

                    product.setAttribute("has-serval", "true");
                }
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
