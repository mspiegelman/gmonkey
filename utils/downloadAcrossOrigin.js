// A utility function for downloading url based files across origins

const downloadAcrossOrigin = ({
    url,                    // URL of the file to download as a string
    headers = {},           // Headers to send with the XHR
    callback,               // Function to call once download has started
    filename,               // Name of the file to be saved
    showProgress = false,   // Whether or not to show progress in console
}) => {
    if (!GM_xmlhttpRequest) {
        return console.error('You must have the GM_xmlhttpRequest @grant in you user script');
    }

    GM_xmlhttpRequest({
        method: "GET",
        url,
        headers,
        responseType: 'blob',
        onload: e => {
            const anchor = Object.assign(document.createElement("a"), {
                href: window.URL.createObjectURL(e.response),
                download: filename || 'download.mp4',
                hidden: true,
                onclick: e => e.stopPropagation()
            });
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            callback && callback(e);
            setTimeout(() => window.URL.revokeObjectURL(anchor.href), 250);
        },
        onerror: e => console.log('Error: ', e),
        onprogress: showProgress ? ({ total, done }) => {
            console.log('Progress: ', `${Math.round((done / total) * 10000) / 100}%`);
        } : () => {},
    });
};