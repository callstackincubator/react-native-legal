#!/bin/bash

yarn workspace react-native-legal-bare-example e2e:android
TEST_STATUS=$?
echo "Test run completed with status $TEST_STATUS"
exit $TEST_STATUS
