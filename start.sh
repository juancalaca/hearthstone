#!/bin/bash

export PORT=5100

cd ~/www/hearthstone
./bin/hearthstone stop || true
./bin/hearthstone start
