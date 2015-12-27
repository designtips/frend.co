(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Frtabs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

// Move Array prototype to NodeList (allows for Array methods on NodeLists)
// https://gist.github.com/paulirish/12fb951a8b893a454b32 (#gistcomment-1487315)
;
Object.defineProperty(exports, "__esModule", {
	value: true
});
Object.setPrototypeOf(NodeList.prototype, Array.prototype);

/**
 * @param {string} selector The selector to match for tab components
 * @param {object} options Object containing configuration overrides
 */
var Frtabs = function Frtabs() {
	var selector = arguments.length <= 0 || arguments[0] === undefined ? '.js-fr-tabs' : arguments[0];

	var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	var _ref$tablistSelector = _ref.tablistSelector;
	var tablistSelector = _ref$tablistSelector === undefined ? '.fr-tabs__tablist' : _ref$tablistSelector;
	var _ref$activeTabClass = _ref.activeTabClass;
	var activeTabClass = _ref$activeTabClass === undefined ? 'fr-tabs__tab--is-active' : _ref$activeTabClass;
	var _ref$tabpanelSelector = _ref.tabpanelSelector;
	var tabpanelSelector = _ref$tabpanelSelector === undefined ? '.fr-tabs__panel' : _ref$tabpanelSelector;
	var _ref$activePanelClass = _ref.activePanelClass;
	var activePanelClass = _ref$activePanelClass === undefined ? 'fr-tabs__panel--is-active' : _ref$activePanelClass;
	var _ref$tabsReadyClass = _ref.tabsReadyClass;
	var tabsReadyClass = _ref$tabsReadyClass === undefined ? 'has-fr-tabs' : _ref$tabsReadyClass;

	// CONSTANTS
	var doc = document;
	var docEl = doc.documentElement;

	// SUPPORTS
	if (!'querySelector' in document || !'addEventListener' in window || !docEl.classList) return;

	// SETUP
	// set tab element NodeLists
	var tabContainers = doc.querySelectorAll(selector);
	var tabLists = doc.querySelectorAll(tablistSelector);
	var tabListItems = doc.querySelectorAll(tablistSelector + ' li');
	var tabs = doc.querySelectorAll(tablistSelector + ' a');
	var tabpanels = doc.querySelectorAll(tabpanelSelector);

	// UTILS
	// closest: http://clubmate.fi/jquerys-closest-function-and-pure-javascript-alternatives/
	function _closest(el, fn) {
		return el && (fn(el) ? el : _closest(el.parentNode, fn));
	}

	// PRIVATE METHODS
	// a11y
	function _addA11y() {
		// add role="tablist" to ul
		tabLists.forEach(function (tabList) {
			tabList.setAttribute('role', 'tablist');
		});

		// add role="presentation" to li
		tabListItems.forEach(function (tabItem) {
			tabItem.setAttribute('role', 'presentation');
		});

		// add role="tab" and aria-controls to anchor
		tabs.forEach(function (tab) {
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-controls', tab.hash.substring(1));
		});

		// add role="tabpanel" to section
		tabpanels.forEach(function (tabpanel) {
			tabpanel.setAttribute('role', 'tabpanel');
			// make first child of tabpanel focusable if available
			if (tabpanel.children) {
				tabpanel.children[0].setAttribute('tabindex', 0);
			}
		});
	}

	function _removeA11y() {
		// remove role="tablist" from ul
		tabLists.forEach(function (tabList) {
			tabList.removeAttribute('role');
		});

		// remove role="presentation" from li
		tabListItems.forEach(function (tabItem) {
			tabItem.removeAttribute('role');
		});

		// remove role="tab" and aria-controls from anchor
		tabs.forEach(function (tab) {
			tab.removeAttribute('role');
			tab.removeAttribute('aria-controls');
		});

		// remove role="tabpanel" from section
		tabpanels.forEach(function (tabpanel) {
			tabpanel.removeAttribute('role');
			// remove first child focusability if present
			if (tabpanel.children) {
				tabpanel.children[0].removeAttribute('tabindex');
			}
		});
	}

	// events
	function _eventTabClick(e) {
		_showTab(e.target, true);
		e.preventDefault(); // look into remove id/settimeout/reinstate id as an alternative to preventDefault
	}

	function _eventTabKeydown(e) {
		// collect tab targets, and their parents' prev/next
		var currentTab = e.target;
		var previousTabItem = e.target.parentNode.previousElementSibling;
		var nextTabItem = e.target.parentNode.nextElementSibling;
		var newTabItem = undefined;

		// catch left and right arrow key events
		switch (e.keyCode) {
			case 37:
				newTabItem = previousTabItem;
				break;
			case 39:
				newTabItem = nextTabItem;
				break;
			default:
				newTabItem = false;
				break;
		}

		// if new next/prev tab available, show it by passing tab anchor to _showTab method
		if (newTabItem) {
			_showTab(newTabItem.querySelector('[role="tab"]'), true);
		}
	}

	// actions
	function _showTab(target, giveFocus) {
		// get context of tab container and its children
		var thisContainer = _closest(target, function (el) {
			return el.classList.contains(selector.substring(1));
		});
		var siblingTabs = thisContainer.querySelectorAll(tablistSelector + ' a');
		var siblingTabpanels = thisContainer.querySelectorAll(tabpanelSelector);

		// set inactives
		siblingTabs.forEach(function (tab) {
			tab.setAttribute('tabindex', -1);
		});
		siblingTabpanels.forEach(function (tabpanel) {
			tabpanel.setAttribute('aria-hidden', 'true');
		});

		// set actives and focus
		target.setAttribute('tabindex', 0);
		if (giveFocus) target.focus();
		doc.getElementById(target.getAttribute('aria-controls')).removeAttribute('aria-hidden');
	}

	// bindings
	function _bindTabsEvents() {
		// bind all tab click and keydown events
		tabs.forEach(function (tab) {
			tab.addEventListener('click', _eventTabClick);
			tab.addEventListener('keydown', _eventTabKeydown);
		});
	}

	function _unbindTabsEvents() {
		// unbind all tab click and keydown events
		tabs.forEach(function (tab) {
			tab.removeEventListener('click', _eventTabClick);
			tab.removeEventListener('keydown', _eventTabKeydown);
		});
	}

	// PUBLIC METHODS
	function destroy() {
		_removeA11y();
		_unbindTabsEvents();
		docEl.classList.remove(tabsReadyClass);
	}

	// INIT
	function _init() {
		if (tabContainers.length) {
			_addA11y();
			_bindTabsEvents();
			// set all first tabs active on init
			tabContainers.forEach(function (tabContainer) {
				_showTab(tabContainer.querySelector(tablistSelector + ' a'), false);
			});
			docEl.classList.add(tabsReadyClass);
		}
	}
	_init();

	// REVEAL API
	return {
		destroy: destroy
	};
};

// module exports
exports.default = Frtabs;
module.exports = exports['default'];

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfY29tcG9uZW50cy90YWJzL3RhYnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUFZLENBQUM7Ozs7QUFJYixNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQzs7Ozs7O0FBQUMsQUFNM0QsSUFBSSxNQUFNLEdBQUcsU0FBVCxNQUFNLEdBTUQ7S0FOYyxRQUFRLHlEQUFHLGFBQWE7O2tFQU0xQyxFQUFFOztpQ0FMTCxlQUFlO0tBQUUsZUFBZSx3Q0FBRyxtQkFBbUI7Z0NBQ3RELGNBQWM7S0FBRSxjQUFjLHVDQUFHLHlCQUF5QjtrQ0FDMUQsZ0JBQWdCO0tBQUUsZ0JBQWdCLHlDQUFHLGlCQUFpQjtrQ0FDdEQsZ0JBQWdCO0tBQUUsZ0JBQWdCLHlDQUFHLDJCQUEyQjtnQ0FDaEUsY0FBYztLQUFFLGNBQWMsdUNBQUcsYUFBYTs7O0FBSy9DLEtBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQztBQUNyQixLQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsZUFBZTs7O0FBQUMsQUFJbEMsS0FBSSxDQUFDLGVBQWUsSUFBSSxRQUFRLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLE9BQU87Ozs7QUFBQSxBQUs5RixLQUFJLGFBQWEsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsS0FBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JELEtBQUksWUFBWSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDakUsS0FBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN4RCxLQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUM7Ozs7QUFBQyxBQUt2RCxVQUFTLFFBQVEsQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQzFCLFNBQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUEsQUFBQyxDQUFDO0VBQ3pEOzs7O0FBQUEsQUFLRCxVQUFTLFFBQVEsR0FBSTs7QUFFcEIsVUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUM3QixVQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztHQUN4QyxDQUFDOzs7QUFBQyxBQUdILGNBQVksQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDakMsVUFBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7R0FDN0MsQ0FBQzs7O0FBQUMsQUFHSCxNQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ3JCLE1BQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLE1BQUcsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDekQsQ0FBQzs7O0FBQUMsQUFHSCxXQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUSxFQUFLO0FBQy9CLFdBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQzs7QUFBQyxBQUUxQyxPQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDdEIsWUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pEO0dBQ0QsQ0FBQyxDQUFDO0VBRUg7O0FBRUQsVUFBUyxXQUFXLEdBQUk7O0FBRXZCLFVBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDN0IsVUFBTyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNoQyxDQUFDOzs7QUFBQyxBQUdILGNBQVksQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDakMsVUFBTyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNoQyxDQUFDOzs7QUFBQyxBQUdILE1BQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDckIsTUFBRyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QixNQUFHLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0dBQ3JDLENBQUM7OztBQUFDLEFBR0gsV0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUMvQixXQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQzs7QUFBQyxBQUVqQyxPQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDdEIsWUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDakQ7R0FDRCxDQUFDLENBQUM7RUFDSDs7O0FBQUEsQUFJRCxVQUFTLGNBQWMsQ0FBRSxDQUFDLEVBQUU7QUFDM0IsVUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDekIsR0FBQyxDQUFDLGNBQWMsRUFBRTtBQUFDLEVBQ25COztBQUVELFVBQVMsZ0JBQWdCLENBQUUsQ0FBQyxFQUFFOztBQUU3QixNQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzFCLE1BQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDO0FBQ2pFLE1BQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDO0FBQ3pELE1BQUksVUFBVSxZQUFBOzs7QUFBQyxBQUdmLFVBQVEsQ0FBQyxDQUFDLE9BQU87QUFDaEIsUUFBSyxFQUFFO0FBQ04sY0FBVSxHQUFHLGVBQWUsQ0FBQztBQUM3QixVQUFNO0FBQUEsQUFDUCxRQUFLLEVBQUU7QUFDTixjQUFVLEdBQUcsV0FBVyxDQUFDO0FBQ3pCLFVBQU07QUFBQSxBQUNQO0FBQ0MsY0FBVSxHQUFHLEtBQUssQ0FBQTtBQUNsQixVQUFNO0FBQUE7OztBQUNQLEFBR0QsTUFBSSxVQUFVLEVBQUU7QUFDZixXQUFRLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUN6RDtFQUNEOzs7QUFBQSxBQUlELFVBQVMsUUFBUSxDQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUU7O0FBRXJDLE1BQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBQyxFQUFFLEVBQUs7QUFDNUMsVUFBTyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDcEQsQ0FBQyxDQUFDO0FBQ0gsTUFBSSxXQUFXLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN6RSxNQUFJLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQzs7O0FBQUMsQUFHeEUsYUFBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUM1QixNQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ2pDLENBQUMsQ0FBQztBQUNILGtCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUN0QyxXQUFRLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztHQUM3QyxDQUFDOzs7QUFBQyxBQUdILFFBQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE1BQUksU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM5QixLQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDeEY7OztBQUFBLEFBSUQsVUFBUyxlQUFlLEdBQUk7O0FBRTNCLE1BQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDckIsTUFBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztBQUM5QyxNQUFHLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUM7R0FDbEQsQ0FBQyxDQUFDO0VBQ0g7O0FBRUQsVUFBUyxpQkFBaUIsR0FBSTs7QUFFN0IsTUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUNyQixNQUFHLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ2pELE1BQUcsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztHQUNyRCxDQUFDLENBQUM7RUFDSDs7O0FBQUEsQUFJRCxVQUFTLE9BQU8sR0FBSTtBQUNuQixhQUFXLEVBQUUsQ0FBQztBQUNkLG1CQUFpQixFQUFFLENBQUM7QUFDcEIsT0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7RUFDdkM7OztBQUFBLEFBSUQsVUFBUyxLQUFLLEdBQUk7QUFDakIsTUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFO0FBQ3pCLFdBQVEsRUFBRSxDQUFDO0FBQ1gsa0JBQWUsRUFBRTs7QUFBQyxBQUVsQixnQkFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFlBQVksRUFBSztBQUN2QyxZQUFRLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEUsQ0FBQyxDQUFDO0FBQ0gsUUFBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDcEM7RUFDRDtBQUNELE1BQUssRUFBRTs7O0FBQUMsQUFJUixRQUFPO0FBQ04sU0FBTyxFQUFQLE9BQU87RUFDUCxDQUFBO0NBRUQ7OztBQUFBLGtCQUljLE1BQU0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIEFycmF5IHByb3RvdHlwZSB0byBOb2RlTGlzdCAoYWxsb3dzIGZvciBBcnJheSBtZXRob2RzIG9uIE5vZGVMaXN0cylcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC8xMmZiOTUxYThiODkzYTQ1NGIzMiAoI2dpc3Rjb21tZW50LTE0ODczMTUpXG5PYmplY3Quc2V0UHJvdG90eXBlT2YoTm9kZUxpc3QucHJvdG90eXBlLCBBcnJheS5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgdG8gbWF0Y2ggZm9yIHRhYiBjb21wb25lbnRzXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBPYmplY3QgY29udGFpbmluZyBjb25maWd1cmF0aW9uIG92ZXJyaWRlc1xuICovXG5sZXQgRnJ0YWJzID0gZnVuY3Rpb24gKHNlbGVjdG9yID0gJy5qcy1mci10YWJzJywge1xuXHRcdHRhYmxpc3RTZWxlY3RvcjogdGFibGlzdFNlbGVjdG9yID0gJy5mci10YWJzX190YWJsaXN0Jyxcblx0XHRhY3RpdmVUYWJDbGFzczogYWN0aXZlVGFiQ2xhc3MgPSAnZnItdGFic19fdGFiLS1pcy1hY3RpdmUnLFxuXHRcdHRhYnBhbmVsU2VsZWN0b3I6IHRhYnBhbmVsU2VsZWN0b3IgPSAnLmZyLXRhYnNfX3BhbmVsJyxcblx0XHRhY3RpdmVQYW5lbENsYXNzOiBhY3RpdmVQYW5lbENsYXNzID0gJ2ZyLXRhYnNfX3BhbmVsLS1pcy1hY3RpdmUnLFxuXHRcdHRhYnNSZWFkeUNsYXNzOiB0YWJzUmVhZHlDbGFzcyA9ICdoYXMtZnItdGFicydcblx0fSA9IHt9KSB7XG5cblxuXHQvLyBDT05TVEFOVFNcblx0Y29uc3QgZG9jID0gZG9jdW1lbnQ7XG5cdGNvbnN0IGRvY0VsID0gZG9jLmRvY3VtZW50RWxlbWVudDtcblxuXG5cdC8vIFNVUFBPUlRTXG5cdGlmICghJ3F1ZXJ5U2VsZWN0b3InIGluIGRvY3VtZW50IHx8ICEnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93IHx8ICFkb2NFbC5jbGFzc0xpc3QpIHJldHVybjtcblxuXG5cdC8vIFNFVFVQXG5cdC8vIHNldCB0YWIgZWxlbWVudCBOb2RlTGlzdHNcblx0bGV0IHRhYkNvbnRhaW5lcnMgPSBkb2MucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cdGxldCB0YWJMaXN0cyA9IGRvYy5xdWVyeVNlbGVjdG9yQWxsKHRhYmxpc3RTZWxlY3Rvcik7XG5cdGxldCB0YWJMaXN0SXRlbXMgPSBkb2MucXVlcnlTZWxlY3RvckFsbCh0YWJsaXN0U2VsZWN0b3IgKyAnIGxpJyk7XG5cdGxldCB0YWJzID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwodGFibGlzdFNlbGVjdG9yICsgJyBhJyk7XG5cdGxldCB0YWJwYW5lbHMgPSBkb2MucXVlcnlTZWxlY3RvckFsbCh0YWJwYW5lbFNlbGVjdG9yKTtcblxuXG5cdC8vIFVUSUxTXG5cdC8vIGNsb3Nlc3Q6IGh0dHA6Ly9jbHVibWF0ZS5maS9qcXVlcnlzLWNsb3Nlc3QtZnVuY3Rpb24tYW5kLXB1cmUtamF2YXNjcmlwdC1hbHRlcm5hdGl2ZXMvXG5cdGZ1bmN0aW9uIF9jbG9zZXN0IChlbCwgZm4pIHtcblx0XHRyZXR1cm4gZWwgJiYgKGZuKGVsKSA/IGVsIDogX2Nsb3Nlc3QoZWwucGFyZW50Tm9kZSwgZm4pKTtcblx0fVxuXG5cblx0Ly8gUFJJVkFURSBNRVRIT0RTXG5cdC8vIGExMXlcblx0ZnVuY3Rpb24gX2FkZEExMXkgKCkge1xuXHRcdC8vIGFkZCByb2xlPVwidGFibGlzdFwiIHRvIHVsXG5cdFx0dGFiTGlzdHMuZm9yRWFjaCgodGFiTGlzdCkgPT4ge1xuXHRcdFx0dGFiTGlzdC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAndGFibGlzdCcpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gYWRkIHJvbGU9XCJwcmVzZW50YXRpb25cIiB0byBsaVxuXHRcdHRhYkxpc3RJdGVtcy5mb3JFYWNoKCh0YWJJdGVtKSA9PiB7XG5cdFx0XHR0YWJJdGVtLnNldEF0dHJpYnV0ZSgncm9sZScsICdwcmVzZW50YXRpb24nKTtcblx0XHR9KTtcblx0XHRcblx0XHQvLyBhZGQgcm9sZT1cInRhYlwiIGFuZCBhcmlhLWNvbnRyb2xzIHRvIGFuY2hvclxuXHRcdHRhYnMuZm9yRWFjaCgodGFiKSA9PiB7XG5cdFx0XHR0YWIuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3RhYicpO1xuXHRcdFx0dGFiLnNldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycsIHRhYi5oYXNoLnN1YnN0cmluZygxKSk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0Ly8gYWRkIHJvbGU9XCJ0YWJwYW5lbFwiIHRvIHNlY3Rpb25cblx0XHR0YWJwYW5lbHMuZm9yRWFjaCgodGFicGFuZWwpID0+IHtcblx0XHRcdHRhYnBhbmVsLnNldEF0dHJpYnV0ZSgncm9sZScsICd0YWJwYW5lbCcpO1xuXHRcdFx0Ly8gbWFrZSBmaXJzdCBjaGlsZCBvZiB0YWJwYW5lbCBmb2N1c2FibGUgaWYgYXZhaWxhYmxlXG5cdFx0XHRpZiAodGFicGFuZWwuY2hpbGRyZW4pIHtcblx0XHRcdFx0dGFicGFuZWwuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBfcmVtb3ZlQTExeSAoKSB7XG5cdFx0Ly8gcmVtb3ZlIHJvbGU9XCJ0YWJsaXN0XCIgZnJvbSB1bFxuXHRcdHRhYkxpc3RzLmZvckVhY2goKHRhYkxpc3QpID0+IHtcblx0XHRcdHRhYkxpc3QucmVtb3ZlQXR0cmlidXRlKCdyb2xlJyk7XG5cdFx0fSk7XG5cblx0XHQvLyByZW1vdmUgcm9sZT1cInByZXNlbnRhdGlvblwiIGZyb20gbGlcblx0XHR0YWJMaXN0SXRlbXMuZm9yRWFjaCgodGFiSXRlbSkgPT4ge1xuXHRcdFx0dGFiSXRlbS5yZW1vdmVBdHRyaWJ1dGUoJ3JvbGUnKTtcblx0XHR9KTtcblx0XHRcblx0XHQvLyByZW1vdmUgcm9sZT1cInRhYlwiIGFuZCBhcmlhLWNvbnRyb2xzIGZyb20gYW5jaG9yXG5cdFx0dGFicy5mb3JFYWNoKCh0YWIpID0+IHtcblx0XHRcdHRhYi5yZW1vdmVBdHRyaWJ1dGUoJ3JvbGUnKTtcblx0XHRcdHRhYi5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKTtcblx0XHR9KTtcblx0XHRcblx0XHQvLyByZW1vdmUgcm9sZT1cInRhYnBhbmVsXCIgZnJvbSBzZWN0aW9uXG5cdFx0dGFicGFuZWxzLmZvckVhY2goKHRhYnBhbmVsKSA9PiB7XG5cdFx0XHR0YWJwYW5lbC5yZW1vdmVBdHRyaWJ1dGUoJ3JvbGUnKTtcblx0XHRcdC8vIHJlbW92ZSBmaXJzdCBjaGlsZCBmb2N1c2FiaWxpdHkgaWYgcHJlc2VudFxuXHRcdFx0aWYgKHRhYnBhbmVsLmNoaWxkcmVuKSB7XG5cdFx0XHRcdHRhYnBhbmVsLmNoaWxkcmVuWzBdLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cblx0Ly8gZXZlbnRzXG5cdGZ1bmN0aW9uIF9ldmVudFRhYkNsaWNrIChlKSB7XG5cdFx0X3Nob3dUYWIoZS50YXJnZXQsIHRydWUpO1xuXHRcdGUucHJldmVudERlZmF1bHQoKTsgLy8gbG9vayBpbnRvIHJlbW92ZSBpZC9zZXR0aW1lb3V0L3JlaW5zdGF0ZSBpZCBhcyBhbiBhbHRlcm5hdGl2ZSB0byBwcmV2ZW50RGVmYXVsdFxuXHR9XG5cblx0ZnVuY3Rpb24gX2V2ZW50VGFiS2V5ZG93biAoZSkge1xuXHRcdC8vIGNvbGxlY3QgdGFiIHRhcmdldHMsIGFuZCB0aGVpciBwYXJlbnRzJyBwcmV2L25leHRcblx0XHRsZXQgY3VycmVudFRhYiA9IGUudGFyZ2V0O1xuXHRcdGxldCBwcmV2aW91c1RhYkl0ZW0gPSBlLnRhcmdldC5wYXJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG5cdFx0bGV0IG5leHRUYWJJdGVtID0gZS50YXJnZXQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmc7XG5cdFx0bGV0IG5ld1RhYkl0ZW07XG5cblx0XHQvLyBjYXRjaCBsZWZ0IGFuZCByaWdodCBhcnJvdyBrZXkgZXZlbnRzXG5cdFx0c3dpdGNoIChlLmtleUNvZGUpIHtcblx0XHRcdGNhc2UgMzc6XG5cdFx0XHRcdG5ld1RhYkl0ZW0gPSBwcmV2aW91c1RhYkl0ZW07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAzOTpcblx0XHRcdFx0bmV3VGFiSXRlbSA9IG5leHRUYWJJdGVtO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdG5ld1RhYkl0ZW0gPSBmYWxzZVxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHQvLyBpZiBuZXcgbmV4dC9wcmV2IHRhYiBhdmFpbGFibGUsIHNob3cgaXQgYnkgcGFzc2luZyB0YWIgYW5jaG9yIHRvIF9zaG93VGFiIG1ldGhvZFxuXHRcdGlmIChuZXdUYWJJdGVtKSB7XG5cdFx0XHRfc2hvd1RhYihuZXdUYWJJdGVtLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwidGFiXCJdJyksIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cblx0Ly8gYWN0aW9uc1xuXHRmdW5jdGlvbiBfc2hvd1RhYiAodGFyZ2V0LCBnaXZlRm9jdXMpIHtcblx0XHQvLyBnZXQgY29udGV4dCBvZiB0YWIgY29udGFpbmVyIGFuZCBpdHMgY2hpbGRyZW5cblx0XHRsZXQgdGhpc0NvbnRhaW5lciA9IF9jbG9zZXN0KHRhcmdldCwgKGVsKSA9PiB7XG5cdFx0XHRyZXR1cm4gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKHNlbGVjdG9yLnN1YnN0cmluZygxKSk7XG5cdFx0fSk7XG5cdFx0bGV0IHNpYmxpbmdUYWJzID0gdGhpc0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHRhYmxpc3RTZWxlY3RvciArICcgYScpO1xuXHRcdGxldCBzaWJsaW5nVGFicGFuZWxzID0gdGhpc0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHRhYnBhbmVsU2VsZWN0b3IpO1xuXG5cdFx0Ly8gc2V0IGluYWN0aXZlc1xuXHRcdHNpYmxpbmdUYWJzLmZvckVhY2goKHRhYikgPT4ge1xuXHRcdFx0dGFiLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAtMSk7XG5cdFx0fSk7XG5cdFx0c2libGluZ1RhYnBhbmVscy5mb3JFYWNoKCh0YWJwYW5lbCkgPT4ge1xuXHRcdFx0dGFicGFuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0Ly8gc2V0IGFjdGl2ZXMgYW5kIGZvY3VzXG5cdFx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAwKTtcblx0XHRpZiAoZ2l2ZUZvY3VzKSB0YXJnZXQuZm9jdXMoKTtcblx0XHRkb2MuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG5cdH1cblxuXG5cdC8vIGJpbmRpbmdzXG5cdGZ1bmN0aW9uIF9iaW5kVGFic0V2ZW50cyAoKSB7XG5cdFx0Ly8gYmluZCBhbGwgdGFiIGNsaWNrIGFuZCBrZXlkb3duIGV2ZW50c1xuXHRcdHRhYnMuZm9yRWFjaCgodGFiKSA9PiB7XG5cdFx0XHR0YWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfZXZlbnRUYWJDbGljayk7XG5cdFx0XHR0YWIuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9ldmVudFRhYktleWRvd24pO1xuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gX3VuYmluZFRhYnNFdmVudHMgKCkge1xuXHRcdC8vIHVuYmluZCBhbGwgdGFiIGNsaWNrIGFuZCBrZXlkb3duIGV2ZW50c1xuXHRcdHRhYnMuZm9yRWFjaCgodGFiKSA9PiB7XG5cdFx0XHR0YWIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfZXZlbnRUYWJDbGljayk7XG5cdFx0XHR0YWIucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9ldmVudFRhYktleWRvd24pO1xuXHRcdH0pO1xuXHR9XG5cblxuXHQvLyBQVUJMSUMgTUVUSE9EU1xuXHRmdW5jdGlvbiBkZXN0cm95ICgpIHtcblx0XHRfcmVtb3ZlQTExeSgpO1xuXHRcdF91bmJpbmRUYWJzRXZlbnRzKCk7XG5cdFx0ZG9jRWwuY2xhc3NMaXN0LnJlbW92ZSh0YWJzUmVhZHlDbGFzcyk7XG5cdH1cblxuXG5cdC8vIElOSVRcblx0ZnVuY3Rpb24gX2luaXQgKCkge1xuXHRcdGlmICh0YWJDb250YWluZXJzLmxlbmd0aCkge1xuXHRcdFx0X2FkZEExMXkoKTtcblx0XHRcdF9iaW5kVGFic0V2ZW50cygpO1xuXHRcdFx0Ly8gc2V0IGFsbCBmaXJzdCB0YWJzIGFjdGl2ZSBvbiBpbml0XG5cdFx0XHR0YWJDb250YWluZXJzLmZvckVhY2goKHRhYkNvbnRhaW5lcikgPT4ge1xuXHRcdFx0XHRfc2hvd1RhYih0YWJDb250YWluZXIucXVlcnlTZWxlY3Rvcih0YWJsaXN0U2VsZWN0b3IgKyAnIGEnKSwgZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0XHRkb2NFbC5jbGFzc0xpc3QuYWRkKHRhYnNSZWFkeUNsYXNzKTtcblx0XHR9XG5cdH1cblx0X2luaXQoKTtcblxuXG5cdC8vIFJFVkVBTCBBUElcblx0cmV0dXJuIHtcblx0XHRkZXN0cm95XG5cdH1cblxufVxuXG5cbi8vIG1vZHVsZSBleHBvcnRzXG5leHBvcnQgZGVmYXVsdCBGcnRhYnM7XG4iXX0=
