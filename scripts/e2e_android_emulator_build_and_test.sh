#!/bin/bash

echo "List installed system images"
sdkmanager --list_installed | grep system-images |grep x86_64
yarn workspace react-native-legal-bare-example e2e:android
TEST_STATUS=$?
echo "Test run completed with status $TEST_STATUS"
exit $TEST_STATUS
