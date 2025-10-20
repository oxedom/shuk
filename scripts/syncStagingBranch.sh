#!/bin/bash

# sync staging branch to production

# Start SSH agent and add key (will prompt for passphrase once)
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

git checkout main
git pull origin main

git checkout main-staging
git pull origin main-staging

git merge main

git push origin main-staging

git checkout main

# Kill SSH agent when done
ssh-agent -k

