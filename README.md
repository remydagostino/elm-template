## WIP!

- [x] Development build
- [x] Automatic rebuild in dev mode
- [x] Production build
- [x] Refactor /server/build to colocate rebulid/dev/production builds
- [x] Elm test runner integration
- [x] Fix: invalidate cache if build fails
- [ ] Use watchify for incremental JS compiling
- [x] Push Elm compile errors into browser window
- [ ] Find a nice way to handle and display elm warnings
- [ ] Javascript test runner
- [ ] Test deployment to Heroku
- [ ] Instrumentation using [Prometheus]
- [ ] Yeoman generator

---

![Elm Seed](https://github.com/remydagostino/elm-seed/blob/master/ElmSeedBanner.png)

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
Then `npm run-script start-dev` to start the development server. Open your web
browser to http://localhost:3000 to see the beginnings of your elm app. Test
your production build with `npm run-script start-prod`. While the development
build is running, access the elm tests by navigating to http://localhost:3000/tests.elm.

`./server` contains the source for a nodejs http server. When the server starts
it cleans the build and rebuilds all frontend code and assets. During
development the sever will rebuild assets as they are requested and only if they
have changed. Built assets are stored in a `./_build` folder in the project
root.

`./frontend/assets` are copied verbatim into `./_build/static` and are served
under `assets/*`. It is left to you to perform sprite-sheeting and other
optimizations if you need them.

`./frontend/elm` is where your Elm code goes. Fill it up! `main.elm` is the
entry-point to your app. The compiled elm code is minified in production.

`./frontend/js` - all your regular JS goes here. Most importantly this is where
you call into your elm code to start the app. Browserify is used to bundle your
javascript code and is configured to start with `main.js`.

`./tests/elm` is the place where you put all your frontend elm tests. It is
suggested that you create a directory structure inside `Test` which mirrors the
structure of `./frontend/elm` for all the modules you want to test. The test
runner will be built and served when navigating to `/elm-tests.html`. Depending
on your needs, you may need to replace the test runner provided by [Elm-Test]
with something more flexible.


Wishlist
--------

This structure is missing a few things that I consider fairly critical. They are
non-trivial to implement however.

- Dead code elimination. Elm outputs a lot of unused code.
- Js bundling. Large apps need this so that they can avoid sending down huge
piles of code for unused features.
- Server side rendering. For faster initial page rendering and for exposing your
website to robots.
- Some debugging tools would be nice in development mode. A debug toolbar
that allowed you to pause and inspect the state of the application would be
great but I want to be careful not to duplicate the efforts of the elm-reactor
folks.
- Integration with continuous delivery and automated testing frameworks
- Better testing. At least a nicer web test runner, preferably a test runner
that runs in the console and watches files.


Disclaimer
----------

To my best ability I have tried to follow the 12 factor app guidelines and to
make sensible decisions around security and performance however I am not an
expert in any of those things. Please make sure you have the authority to
evaluate this project structure for yourself before using it in production.

[Prometheus]: http://prometheus.io/
[Elm]: http://elm-lang.org/
[elm-reactor]: https://github.com/elm-lang/elm-reactor
[Elm-Test]: http://package.elm-lang.org/packages/deadfoxygrandpa/Elm-Test/1.0.4
