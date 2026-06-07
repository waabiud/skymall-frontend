#!/bin/bash
echo "Building and deploying..."
npm run deploy
git push origin master
echo "Done! Live at https://waabiud.github.io/skymall-frontend"
