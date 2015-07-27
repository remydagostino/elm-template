## WIP!

- [x] Development build
- [ ] Postcss plugins
- [x] Automatic rebuild in dev mode
- [ ] Production build
- [ ] Refactor /server/build to colocate rebulid/dev/production builds
- [ ] Elm test runner integration
- [ ] Heroku deployment
- [ ] Https support
- [ ] Instrumentation using [Prometheus]

---

A starting point for building production-ready [Elm] applications. Ultimately I
would like to use [elm-reactor] from start to end for building applications in
Elm however it looks like we won't get there for a while yet.


Goals
------

- Convient development workflow with a server that automatically rebuilds and
serves assets
- Generate compressed assets for production that are served in a way that feels
fast to users
- Provide a flexible http server that is easy to repurpose for different assets
and different requirements.
- Straightforward test setup for elm code
- Easy deployment to a variety of platforms
- Integration with modern instrumentation tools


Getting Started
-----------------

In development, run `npm install` to install the project's node dependencies.
Then `npm run-script start-dev` to start the development server. Test your
production build with `npm run-script start-prod`.

`./server` contains the source for a nodejs http server. When the server starts
it cleans the build and rebuilds all frontend code and assets. During
development the sever will rebuild assets as they are requested and only if they
have changed. Built assets are stored in a `./_build` folder in the project
root.

`./frontend/assets` are copied verbatim into `./_build/static` and are served
under `assets/*`. It is left to you to perform sprite-sheeting and other
optimizations if you need them.

`./frontend/css/modules` is the css for all the rest of your site. All css is
processed using [autoprefixer] as well as [postcss-import] and [postcss-assets].
These files are served from `styles/*`. The default autoprefixer configuration
is used but you can obviously change this in the server code. If you are going
to be using stylesheets heavilly in your project you might want to consider
using a few more postcss plugins.

`./frontend/css/core` contains "above the fold" styles for your app. This should
only ever contain the minimal amount of css necessary to make your application
not look horrible while it loads. Only the `core.css` file will be processed.
Assets that need to be loaded before the page is loaded should be in this folder
also. The css is processed with the same toolchain used for your other modules
but you should inline any assets you are using here.

`./frontend/elm` is where your Elm code goes. Fill it up! You probably shouldn't
use `Native` bindings in a frontend app, but I consider it possible that you
might need to. An example is provided to show how native bindings work.
`main.elm` is the entrypoint to your app. The compiled elm code is minified in
production.

`./frontend/js` - all your regular JS goes here. Most importantly this is where
you call into your elm code to start the app. Browserify is used to bundle your
javascript code and is configured to start with `main.js`. Remember that if you
want to use Elm ports you will need to add those functions to the global window
object.


Wishlist
--------

This structure is missing a few things that I consider fairly critical. They are
non-trivial to implement however.

- Dead code elimination. Elm outputs a lot of unused code.
- Js bundling. Large apps need this so that they can avoid sending down huge
piles of code for unused features.
- A better approach to CSS. Either an ability for elm components to load their
own CSS or a nice library for doing styles inline.
- Server side rendering. For faster initial page rendering and for exposing your
website to robots.
- Some debugging tools would be nice in development mode. A debug toolbar
that allowed you to pause and inspect the state of the application would be
great but I want to be careful not to duplicate the efforts of the elm-reactor
folks.
- Integration with continuous delivery and automated testing frameworks


Disclaimer
----------

To my best ability I have tried to follow the 12 factor app guidelines and to
make sensible decisions around security and performance however I am not an
expert in any of those things. Please make sure you have the authority to
evaluate this project structure for yourself before using it in production.

[Prometheus]: http://prometheus.io/
[Elm]: http://elm-lang.org/
[elm-reactor]: https://github.com/elm-lang/elm-reactor
[autoprefixer]: https://github.com/postcss/autoprefixer
[postcss-import]: https://github.com/postcss/postcss-import
[postcss-assets]: https://github.com/borodean/postcss-assets
