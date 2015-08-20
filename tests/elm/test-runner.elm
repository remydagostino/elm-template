import Tests.Component.Counter
import ElmTest.Test as Test
import ElmTest.Runner.Element exposing (runDisplay)

tests =
  Test.suite "All tests"
    [ Tests.Component.Counter.testSuite ]

main = runDisplay tests
