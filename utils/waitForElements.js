// A utility function for userscripts that detects and handles AJAXed content.

const FOUND_ATTR = 'data-userscript-alreadyFound';
const SELECTOR_REGEX = () => RegExp('(?<select>[^\\[]+)(?:\\[(?<attrs>[^\\[]+)\\])?$', 'gi');

const safeEval = value => {
    try {
        const evaled = eval(value);
        return typeof evaled === 'string' ? evaled : value;
    } catch (e) {
        return String(value);
    }
};

const parseAttrs = attrs => attrs ? attrs.split(',').map(attr => {
    const [name, value] = attr.split('=');
    return [name, value ? String(safeEval(value)) : undefined];
}) : [];

const getAttrChecker = attrs => target => parseAttrs(attrs).every(([name, value]) => value === undefined
    ? target.hasAttribute(name) : target.getAttribute(name) === value);

const getTargetNodes = (selector, waitForAll = true) => {
    const getTargetNodesRec = sel => {
        if (typeof sel === 'function') {
            const targets = sel(document) || [];
            return targets.length > 0 ? [...targets] : [false];
        }
        if (typeof sel === 'string') {
            const { select, attrs } = (SELECTOR_REGEX().exec(sel) || {}).groups || {};
            const targets = ((select && [...document.querySelectorAll(select)]) || []).filter(getAttrChecker(attrs));;
            return targets.length > 0 ? [...targets] : [false];
        }
        if (Array.isArray(sel)) {
            return sel.flatMap(s => getTargetNodesRec(s));
        }
        return [false];
    };
    const targets = getTargetNodesRec(selector);
    return (!waitForAll || targets.every(t => t)) && targets.flatMap(t => t).filter(t => t);
};

const waitForKeyElements = (
    selectorOrFunction,         // A selector string, a list of selector strings, or a function.
    callback,                   // The callback function; Takes a dom element and a selector string as parameters. If it returns true, the element will be processed again.
    {
        waitOnce,               // Whether to stop after the first elements are found.
        interval,               // The time (ms) to wait between iterations.
        maxIntervals,           // The max number of intervals to run (negative number for unlimited).
        waitForAll = true,      // If a list of selectors is passed, all must retrieve one or more elements before running the callback 
    }
) => {
    waitOnce = waitOnce === undefined ? true : waitOnce;
    interval = interval === undefined ? 300 : interval;
    maxIntervals = maxIntervals === undefined ? -1 : maxIntervals;
    waitForAll = waitForAll === undefined ? true : waitForAll;

    const targetNodes = getTargetNodes(selectorOrFunction, waitForAll);
    const targetsFound = !targetNodes ? false : targetNodes
        .map(async t => !t.getAttribute(FOUND_ATTR) && (!!(await callback(t)) || !!t.setAttribute(FOUND_ATTR, true)))
        .every(t => !t);
 
    if (maxIntervals !== 0 && !(targetsFound && waitOnce)) {
        setTimeout(() => waitForKeyElements(selectorOrFunction, callback, {
            waitOnce,
            interval,
            maxIntervals: maxIntervals - 1,
            interval
        }));
    }
};
