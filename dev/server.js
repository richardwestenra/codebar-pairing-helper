const bookmarklet = require('bookmarklet');

const script = `if (window.location.protocol === "https:") {
  alert("Scripts are likely blocked because this page is served over HTTPS. Try changing the protocol to HTTP?")
} else {
  console.log("Let's pair!");
}`;

const makeBookmarklet = (domain) => bookmarklet.convert(
  script,
  {
    style: [
      `http://${domain}/dist/pair.css`
    ],
    script: [
      `http://${domain}/dist/sortable.min.js`,
      `http://${domain}/dist/pair.js`
    ]
  }
);

const live = makeBookmarklet('richardwestenra.com/codebar-pairing-helper');
const local = makeBookmarklet('localhost:3000');

console.log('=== Live bookmarklet ===');
console.log(live);
console.log('=== Local bookmarklet ===');
console.log(local);
