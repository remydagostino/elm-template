module App where

import Component.Counter as Counter
import Html exposing (div, h1, button, text)
import StartApp.Simple

main =
  StartApp.Simple.start
    { model = model
    , view = view
    , update = Counter.update
    }

model = 0

view address model =
  div [ ]
    [ paddedSection <| welcomeMessage
    , paddedSection <| Counter.view address model
    ]

paddedSection child =
  div [ ] [child]

welcomeMessage =
  div [ ]
    [ h1 [ ] [text "Build something with Elm."] ]
