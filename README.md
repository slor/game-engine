# game-engine

## Setup

Tested on macOS 10.14.

```
brew install node
npm install
npm install -g watchify
```


## Running in debug

```
python -m SimpleHTTPServer

# then, in another terminal:
watchify ./src/main.js -o ./build/bundle.js --standalone ge --live --debug
```

Then go to http://localhost:8000/demos/engine/ 

