const bookmarklet = require('bookmarklet');

const script = `if (window.location.protocol === "http:") {
  if (confirm("Scripts are likely blocked because this page is served over HTTP. Change the protocol to HTTPS?")) {
    window.location.href = window.location.href.replace('http:','https:');
  }
} else {
  console.log("Let's pair!");
}`;

const makeBookmarklet = (domain) => bookmarklet.convert(
  script,
  {
    style: [
      `${domain}/dist/pair.css`
    ],
    script: [
      `${domain}/dist/sortable.min.js`,
      `${domain}/dist/pair.js`
    ]
  }
);

const live = makeBookmarklet('https://richardwestenra.com/codebar-pairing-helper');
const local = makeBookmarklet('http://localhost:3000');

console.log('=== Live bookmarklet ===');
console.log(live);
console.log('=== Local bookmarklet ===');
console.log(local);
