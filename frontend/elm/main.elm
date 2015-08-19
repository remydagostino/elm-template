module App where

import Html exposing (div, h1, button, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import StartApp

main =
  StartApp.start { model = model, view = view, update = update }

model = 0

view address model =
  div [ ]
    [ paddedSection <| welcomeMessage
    , paddedSection <| counterView address model
    ]

paddedSection child =
  div [ ] [child]

welcomeMessage =
  div [ ]
    [ h1 [ ] [text "Build something with Elm."] ]

counterView address model =
  let
    counterButton action =
      button
        [ onClick address action ]
        [ text <| counterText action ]
  in
    div []
      [ counterButton Increment
      , div [] [ text (toString model) ]
      , counterButton Decrement
      ]

counterText action =
  case action of
    Increment -> "+"
    Decrement -> "-"

type Action = Increment | Decrement

update action model =
  case action of
    Increment -> model + 1
    Decrement -> model - 1
