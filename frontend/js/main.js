window.onload = function() {
  try {
    window.Elm.fullscreen(window.Elm.App, {});
  }
  catch (err) {
    window.console.error(err);
  }
};
