module App where

import Html exposing (div, h1, button, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import StartApp

main =
  StartApp.start { model = model, view = view, update = update }

model = 0

view address model =
  div [class "main"]
    [ paddedSection <| welcomeMessage
    , paddedSection <| counterView address model
    ]

paddedSection child =
  div [class "main__padded"] [child]

welcomeMessage =
  div [class "welcomeMessage"]
    [ div [class "welcomeMessage__elmLogo"] [ ]
    , h1 [class "h1"] [text "Build great things with Elm."]
    ]

counterView address model =
  div []
    [ button [ onClick address Decrement ] [ text "-" ]
    , div [] [ text (toString model) ]
    , button [ onClick address Increment ] [ text "+" ]
    ]

type Action = Increment | Decrement

update action model =
  case action of
    Increment -> model + 1
    Decrement -> model - 1
