// A utility function for replacing text in a string based on a map of replacements
// (e.g. { a: 'b', c: ['d', 'e'] } would replace 'b' with 'a' and 'd' and 'e' with 'c')

const invertMap = map => {
    const invertedMap = {};
    for (const [key, vals] of Object.entries(map)) for (const val of (Array.isArray(vals) ? vals : [vals])) invertedMap[val] = key;
    return invertedMap;
};

const replaceWithMap = (str, map) => {
    const invertedMap = invertMap(map);
    return str.replace(new RegExp(Object.keys(invertedMap).join('|'), 'g'), m => invertedMap[m]);
};
