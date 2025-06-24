#!/bin/bash

yarn workspace react-native-legal-bare-example android:release
TEST_STATUS=$?
echo "Build completed with status $TEST_STATUS"
exit $TEST_STATUS
