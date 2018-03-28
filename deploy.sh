#!/bin/bash

export PORT=5100
export MIX_ENV=prod
export GIT_PATH=/home/hearthstone/src/hearthstone

mix deps.get
(cd assets && npm install)
(cd assets && ./node_modules/brunch/bin/brunch b -p)
mix phx.digest
mix release --env=prod

mkdir -p ~/www
mkdir -p ~/old

NOW=`date +%s`
if [ -d ~/www/hearthstone ]; then
	echo mv ~/www/hearthstone ~/old/$NOW
	mv ~/www/hearthstone ~/old/$NOW
fi

mkdir -p ~/www/hearthstone
REL_TAR=~/src/hearthstone/_build/prod/rel/memory/releases/0.0.1/hearthstone.tar.gz
(cd ~/www/hearthstone && tar xzvf $REL_TAR)

crontab - <<CRONTAB
@reboot bash /home/hearthstone/src/hearthstone/start.sh
CRONTAB

#. start.sh
