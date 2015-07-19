// This file demonstrates how to use native bindings in your app.
// You should probably not use this stuff. Use ports instead.
//
// Native modules will not be included automatically. If you need to use them
// then add `"native-modules": true` to the elm-package.json

Elm.Native.Example = {};

Elm.Native.Example.make = function(localRuntime) {
  localRuntime.Native = localRuntime.Native || {};
  localRuntime.Native.Example = localRuntime.Native.Example || {};

  function add(a, b) {
    return a + b;
  }

  // Functions that you use here can be imported and referenced in an elm
  // program
  return localRuntime.Native.Example.values = {
    add: add
  };
};

// To expose these functions in an elm program you must import the native file
// and annotate the types.
//
//    import Native.Example
//
//    add : Float -> Float -> Float
//    add a b =
//      Native.Example.add
//
// Now the `add` function can be used within elm

