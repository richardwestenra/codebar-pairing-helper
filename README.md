# codebar pairing helper

Add extra functionality to the codebar planner admin area, to help with pairing students and coaches.

The plugin should allow organisers to reorder students with a drag and drop interface, and edit their intended topics. Info is saved to localStorage.

## Development

Bookmarklets are generated with [MrColes's Bookmarklet Creator](https://github.com/mrcoles/bookmarklet). To generate new ones, update the config in dev/server.js and run `npm run build`.

There are no local dependencies, but you'll need to run a local server at port 3000 to serve the JS file. I recommend installing [browser-sync](https://browsersync.io/) globally with `npm install browser-sync -g`, then you can just run `browser-sync start -s -f '**/*'` to start the local server. To save remembering it, I've mapped this command to `npm start` in packages.json.

## Contributing

Contributions are welcome. Please abide by standard OSS/GitHub protocols and refer to the [codebar code of conduct](http://codebar.io/code-of-conduct).

## Credit

Built by Richard Westenra under an MIT license.
