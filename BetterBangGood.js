// ==UserScript==
// @name         BetterBangGood
// @namespace    https://www.banggood.com/
// @version      0.1
// @description  Improves BangGood.com
// @author       Hypn
// @match        https://www.banggood.com/*
// @icon         https://www.google.com/s2/favicons?domain=banggood.com
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	setInterval(function() {
		// hide "first time buyer" popup/nagscreen
		var nag = document.getElementsByClassName("modal-newbie");
		if (nag.length > 0) {
			document.getElementsByClassName("modal-newbie")[0].style.display = "none";
		}

		// prevent header from sticking to the top of the page when scrolling
		var body = document.getElementsByTagName("body");
		if (body.length > 0) {
			body[0].classList.remove("fixedHeader");
		}

		// hide promotion bar at the top of the site
		var topItem = document.getElementsByClassName("top-item");
		if (topItem.length > 0) {
			topItem[0].style.display = "none";
		}
	}, 100)
})();
