// A utility function for userscripts that detects and handles AJAXed content.

const FOUND_ATTR = 'data-userscript-alreadyFound';

const getTargetNodes = selector => {
  if (selector === undefined) return [];
  if (typeof selector === 'function') return (selector() || []).map(n => [selector.name, n]);
  if (typeof selector === 'string') return [...document.querySelectorAll(selector)].map(n => [selector, n]);
  if (selector.every(s => document.querySelectorAll(s).length > 0)) return selector.flatMap(s => [...document.querySelectorAll(s)].map(n => [s, n]));
  return [];
};

const waitForKeyElements = (
  selectorOrFunction, // A selector string, a list of selector strings, or a function.
  callback,			// The callback function; Takes a dom element and a selector string as parameters. If it returns true, the element will be processed again.
  waitOnce,			// Whether to stop after the first elements are found.
  interval,			// The time (ms) to wait between iterations.
  maxIntervals,		// The max number of intervals to run (negative number for unlimited).
) => {
  waitOnce = waitOnce === undefined ? true : waitOnce;
  interval = interval === undefined ? 300 : interval;
  maxIntervals = maxIntervals === undefined ? -1 : maxIntervals;

  const targetNodes = getTargetNodes(selectorOrFunction);
 
  if (targetsFound = targetNodes.length > 0) {
    targetNodes.forEach(([selector, node]) => {
      if (!node.getAttribute(FOUND_ATTR)) {
        targetsFound = callback(node, selector) ? false : !node.setAttribute(FOUND_ATTR, true);
      }
    });
  }
 
  if (maxIntervals !== 0 && !(targetsFound && waitOnce)) {
    setTimeout(() => waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals - 1), interval);
  }
};
