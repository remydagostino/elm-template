module Tests.Component.Counter where

import ElmTest.Test as Test
import ElmTest.Assertion exposing (assert, assertEqual)
import Component.Counter as Counter

testSuite =
  Test.suite "Counter"
    [ incrementModel
    , decrementModel
    ]


incrementModel =
  Test.test "Incrementing the model"
    <| assertEqual 2 (Counter.update Counter.Increment 1)


decrementModel =
  Test.test "Decrementing the model"
    <| assertEqual 0 (Counter.update Counter.Decrement 1)
