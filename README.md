# game-engine

## Setup

Tested on macOS 10.14.

```
brew install node
```

## Testing

### Unit tests

```
npm test
```

## Running

```
browserify ./src/main.js -o ./build/bundle.js --standalone ge

python -m SimpleHTTPServer
```

Then go to http://localhost:8000/demos/engine/ 

