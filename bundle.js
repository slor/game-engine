(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Game {
    constructor(window) {
        this.SECOND = 1000.0;
        this.TICK = 1000.0 / 60.0; // In ms
        this.DEBUG = true;

        this.keysPressed = {};
        this.mousePosX = 0;
        this.mousePosY = 0;
        this.mousePressed = false;
        
        this.lastSec = 0; // Timestamp in ms when we last did 1000ms of frames
        this.lastTick = 0; // Timestamp in ms when we last did one TICK
        this.lastFps = 0; // Frames/seconds
        this.framesLastSec = 0; // Frames since last secthis

        this.window = window;
        this.document = this.window.document;
        this.canvas = this.document.getElementById("screen");
        this.context = this.canvas.getContext('2d');
        this.sprites = [];
    }

    keyDown(e){
        this.keysPressed[e.key] = true;
    }

    keyUp(e){
        delete this.keysPressed[e.key];
    }    

    mouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosX = e.clientX - rect.left;
        this.mousePosY = e.clientY - rect.top;
    }

    mouseDown(e) {
        this.mousePressed = true;
    }

    mouseUp(e) {
        this.mousePressed = false;
    }
    
    frame(now){
        const timeSinceLastTick = now - this.lastTick;

        if (timeSinceLastTick >= this.TICK) {
            this.lastTick++;
            this.framesLastSec++;
            this.update();
            this.draw();
        }

        const deltaSecs = now / 1000.0;
        if (deltaSecs >= this.lastSec + 1 ) {
            this.lastSec = deltaSecs;
            this.lastFps = this.framesLastSec;
            this.framesLastSec = 0;
        }
    }

    update(){
        const speed = 10;

        // WASD sprite move
        if(this.keysPressed['d'] === true){
            this.sprites.forEach((sprite) => {
                sprite.x += speed;
            });
        }
        if(this.keysPressed['a'] === true){
            this.sprites.forEach((sprite) => {
                sprite.x -= speed;
            });
        }
        if(this.keysPressed['s'] === true){
            this.sprites.forEach((sprite) => {
                sprite.y += speed;
            });
        }
        if(this.keysPressed['w'] === true){
            this.sprites.forEach((sprite) => {
                sprite.y -= speed;
            });
        }

        // Mouse move
        if(this.mousePressed === true){
            this.sprites.forEach(sprite => {
                sprite.x = this.mousePosX;
                sprite.y = this.mousePosY;
            });
        }

    }

    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawDebugInfo(){
        const ctx = this.context;
        const can = this.canvas;

        // Frame and timing info
        const DEBUG_SIZE = 16; //px
        ctx.fillStyle = 'black';
        ctx.font = `${DEBUG_SIZE}px sans-serif`;
        ctx.textAlign = 'right';

        ctx.fillText(`${this.lastTick}`.split('.')[0], can.width, DEBUG_SIZE);
        ctx.fillText(`${this.lastSec}`.split('.')[0], can.width, DEBUG_SIZE * 2);
        ctx.fillText(`${this.lastFps}`.slice(0, 5), can.width, DEBUG_SIZE * 3);

        // Mouse
        ctx.fillText(`${this.mousePosX}, ${this.mousePosY}`, can.width, DEBUG_SIZE * 4);
        if (this.mousePressed) {
            ctx.fillText('Click!', can.width, DEBUG_SIZE * 5);
        }

        // Keyboard
        ctx.fillText(`${Object.keys(this.keysPressed)}`, can.width, DEBUG_SIZE * 6);
    }

    draw() {
        this.clear();

        if(this.DEBUG){
            this.drawDebugInfo();
        }

        this.sprites.forEach((sprite) => {
            sprite.draw(this.context);
        });
    }
}

module.exports = {
    "Game": Game
}
},{}],2:[function(require,module,exports){
const engine = require('./engine');
const sprite = require('./sprite');

game = new engine.Game(window);
loader = new sprite.Loader('http://localhost:8000/resources/richtor.bmp', function (){
    const ctx = document.getElementById('screen').getContext('2d');
    game.sprites.push(new sprite.Sprite(loader.sheet, ctx, 0, 0, 28, 57));
}); 

function loop(now){
    window.requestAnimationFrame(loop);

    game.frame(now);
}

window.addEventListener('keydown', function(e) {
    e = e || window.event;
    game.keyDown(e);
    e.preventDefault();
});
window.addEventListener('keyup', function(e) {
    e = e || window.event;
    game.keyUp(e);
    e.preventDefault();
});
window.addEventListener('mousemove', function(e) {
    e = e || window.event;
    game.mouseMove(e);
    e.preventDefault();
});
window.addEventListener('mousedown', function(e) {
    e = e || window.event;
    game.mouseDown(e);
    e.preventDefault();
});
window.addEventListener('mouseup', function(e) {
    e = e || window.event;
    game.mouseUp(e);
    e.preventDefault();
});

window.requestAnimationFrame(loop);
},{"./engine":1,"./sprite":3}],3:[function(require,module,exports){
class Loader {
	// Load a sprite sheet once.
	constructor(src, loadedCallback){
		this.sheet = new Image();
		this.sheet.addEventListener('load', loadedCallback, false);
		this.sheet.src = src;
	}
}


class Sprite {
	// slice a sprite from a sheet
	constructor(sheet, ctx, sx, sy, sw, sh){
		this.sheet = sheet;
		this.sx = sx;
		this.sy = sy;
		this.sw = sw;
		this.sh = sh;
		this.x = 0;
		this.y = 0;
		this.ctx = ctx;
	}

	draw(){
		this.ctx.drawImage(this.sheet, this.sx, this.sy, this.sw, this.sh, 
					  this.x, this.y, this.sw, this.sh);
	}
}

module.exports = {
	"Loader": Loader,
	"Sprite": Sprite
};
},{}]},{},[2]);
