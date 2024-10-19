// A utility function for downloading url based files across origins

const downloadAcrossOrigin = (
  url,      // URL of the file to download as a string
  callback, // Function to call once download has started
) => {
  const ajax = new XMLHttpRequest();
  ajax.open("GET", url, true);
  ajax.responseType = 'blob';
  ajax.onload = e => {
    const anchor = Object.assign(document.createElement("a"), {
      href: window.URL.createObjectURL(e.target.response),
      download: url.split("/").pop().split("?")[0],
      hidden: true,
      onclick: e => e.stopPropagation()
    });
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    callback && callback();
    setTimeout(() => window.URL.revokeObjectURL(anchor.href), 250);
  };
  setTimeout(() => ajax.send(), 0);
};
