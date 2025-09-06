import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';

// Add any specific polyfills needed for older browsers
// For example, for IE11 support:
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    let el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}