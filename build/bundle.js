(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ge = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Game {
    constructor(window) {
        this.SECOND = 1000.0;
        this.TICK = 1000.0 / 60.0; // In ms
        this.DEBUG = true;
        this.SMOOTH = false;

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
        this.entities = [];

        this.context.imageSmoothingEnabled = this.SMOOTH;
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
        // const speed = 10;

        // // WASD entity move
        // if(this.keysPressed['d'] === true){
        //     this.entities.forEach((entity) => {
        //         entity.x += speed;
        //     });
        // }
        // if(this.keysPressed['a'] === true){
        //     this.entities.forEach((entity) => {
        //         entity.x -= speed;
        //     });
        // }
        // if(this.keysPressed['s'] === true){
        //     this.entities.forEach((entity) => {
        //         entity.y += speed;
        //     });
        // }
        // if(this.keysPressed['w'] === true){
        //     this.entities.forEach((entity) => {
        //         entity.y -= speed;
        //     });
        // }

        // // Mouse move
        // if(this.mousePressed === true){
        //     this.entities.forEach(entity => {
        //         entity.x = this.mousePosX;
        //         entity.y = this.mousePosY;
        //     });
        // }

        this.entities.forEach(entity => {
            entity.update(this.lastTick);
        });
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
        ctx.fillText(`${this.framesLastSec}`, can.width, DEBUG_SIZE * 2);
        ctx.fillText(`${this.lastSec}`.split('.')[0], can.width, DEBUG_SIZE * 3);
        ctx.fillText(`${this.lastFps}`.slice(0, 5), can.width, DEBUG_SIZE * 4);


        // Mouse
        ctx.fillText(`${this.mousePosX}, ${this.mousePosY}`, can.width, DEBUG_SIZE * 5);
        if (this.mousePressed) {
            ctx.fillText('Click!', can.width, DEBUG_SIZE * 6);
        }

        // Keyboard
        ctx.fillText(`${Object.keys(this.keysPressed)}`, can.width, DEBUG_SIZE * 7);


    }

    draw() {
        this.clear();

        if(this.DEBUG){
            this.drawDebugInfo();
        }

        this.entities.forEach((entity) => {
            entity.draw(this.context);
        });
    }
}

module.exports = {
    "Game": Game
}
},{}],2:[function(require,module,exports){
class Entity{
	constructor(x, y, sprites){
		this.x = x;
		this.y = y;
		this.sprites = sprites;

		this.nextSpriteTime = null;
		this.nextSprite = null;
		this.speed = 1000 / 60 * 1;
		this.loop = 0;
	}

	update(time){
		if(this.nextSprite === null){
			this.nextSprite = 0;
			this.nextSpriteTime = time + this.speed;
			this.loop = 1;
			return
		}

		if(time > this.nextSpriteTime){
			// bounce back and forth through the sprites
			if(this.nextSprite + this.loop === this.sprites.length){
				this.loop = this.loop * -1;
			} else if (this.nextSprite + this.loop < 0){
				this.loop = this.loop * -1;
			}

			this.nextSprite = this.nextSprite + this.loop;
			this.nextSpriteTime = this.nextSpriteTime + this.speed;
		}
	}

	draw(){
		// Pick what to draw and draw here
		this.sprites[this.nextSprite].draw(this.x, this.y, 10);
	}
}

module.exports = {
	"Entity": Entity
}
},{}],3:[function(require,module,exports){
const engine = require('./engine');
const sprite = require('./sprite');
const entity = require('./entity');


module.exports = {
	"Game": engine.Game,
	"Loader": sprite.Loader,
	"Sprite": sprite.Sprite,
	"Entity": entity.Entity
}


},{"./engine":1,"./entity":2,"./sprite":4}],4:[function(require,module,exports){
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
		this.ctx = ctx;
	}

	draw(x, y, scale=1){
		this.ctx.drawImage(this.sheet, this.sx, this.sy, this.sw, this.sh, x, y, scale * this.sw, scale * this.sh, );
	}
}


module.exports = {
	"Loader": Loader,
	"Sprite": Sprite
};

},{}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL2VudGl0eS9pbmRleC5qcyIsInNyYy9tYWluLmpzIiwic3JjL3Nwcml0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKHdpbmRvdykge1xuICAgICAgICB0aGlzLlNFQ09ORCA9IDEwMDAuMDtcbiAgICAgICAgdGhpcy5USUNLID0gMTAwMC4wIC8gNjAuMDsgLy8gSW4gbXNcbiAgICAgICAgdGhpcy5ERUJVRyA9IHRydWU7XG4gICAgICAgIHRoaXMuU01PT1RIID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5rZXlzUHJlc3NlZCA9IHt9O1xuICAgICAgICB0aGlzLm1vdXNlUG9zWCA9IDA7XG4gICAgICAgIHRoaXMubW91c2VQb3NZID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubGFzdFNlYyA9IDA7IC8vIFRpbWVzdGFtcCBpbiBtcyB3aGVuIHdlIGxhc3QgZGlkIDEwMDBtcyBvZiBmcmFtZXNcbiAgICAgICAgdGhpcy5sYXN0VGljayA9IDA7IC8vIFRpbWVzdGFtcCBpbiBtcyB3aGVuIHdlIGxhc3QgZGlkIG9uZSBUSUNLXG4gICAgICAgIHRoaXMubGFzdEZwcyA9IDA7IC8vIEZyYW1lcy9zZWNvbmRzXG4gICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYyA9IDA7IC8vIEZyYW1lcyBzaW5jZSBsYXN0IHNlY3RoaXNcblxuICAgICAgICB0aGlzLndpbmRvdyA9IHdpbmRvdztcbiAgICAgICAgdGhpcy5kb2N1bWVudCA9IHRoaXMud2luZG93LmRvY3VtZW50O1xuICAgICAgICB0aGlzLmNhbnZhcyA9IHRoaXMuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY3JlZW5cIik7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gdGhpcy5TTU9PVEg7XG4gICAgfVxuXG4gICAga2V5RG93bihlKXtcbiAgICAgICAgdGhpcy5rZXlzUHJlc3NlZFtlLmtleV0gPSB0cnVlO1xuICAgIH1cblxuICAgIGtleVVwKGUpe1xuICAgICAgICBkZWxldGUgdGhpcy5rZXlzUHJlc3NlZFtlLmtleV07XG4gICAgfSAgICBcblxuICAgIG1vdXNlTW92ZShlKSB7XG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1ggPSBlLmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIHRoaXMubW91c2VQb3NZID0gZS5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgfVxuXG4gICAgbW91c2VEb3duKGUpIHtcbiAgICAgICAgdGhpcy5tb3VzZVByZXNzZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIG1vdXNlVXAoZSkge1xuICAgICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBmcmFtZShub3cpe1xuICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0VGljayA9IG5vdyAtIHRoaXMubGFzdFRpY2s7XG5cbiAgICAgICAgaWYgKHRpbWVTaW5jZUxhc3RUaWNrID49IHRoaXMuVElDSykge1xuICAgICAgICAgICAgdGhpcy5sYXN0VGljaysrO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjKys7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWx0YVNlY3MgPSBub3cgLyAxMDAwLjA7XG4gICAgICAgIGlmIChkZWx0YVNlY3MgPj0gdGhpcy5sYXN0U2VjICsgMSApIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFNlYyA9IGRlbHRhU2VjcztcbiAgICAgICAgICAgIHRoaXMubGFzdEZwcyA9IHRoaXMuZnJhbWVzTGFzdFNlYztcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYyA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoKXtcbiAgICAgICAgLy8gY29uc3Qgc3BlZWQgPSAxMDtcblxuICAgICAgICAvLyAvLyBXQVNEIGVudGl0eSBtb3ZlXG4gICAgICAgIC8vIGlmKHRoaXMua2V5c1ByZXNzZWRbJ2QnXSA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGVudGl0eS54ICs9IHNwZWVkO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gaWYodGhpcy5rZXlzUHJlc3NlZFsnYSddID09PSB0cnVlKXtcbiAgICAgICAgLy8gICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZW50aXR5LnggLT0gc3BlZWQ7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBpZih0aGlzLmtleXNQcmVzc2VkWydzJ10gPT09IHRydWUpe1xuICAgICAgICAvLyAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBlbnRpdHkueSArPSBzcGVlZDtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIGlmKHRoaXMua2V5c1ByZXNzZWRbJ3cnXSA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGVudGl0eS55IC09IHNwZWVkO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyAvLyBNb3VzZSBtb3ZlXG4gICAgICAgIC8vIGlmKHRoaXMubW91c2VQcmVzc2VkID09PSB0cnVlKXtcbiAgICAgICAgLy8gICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChlbnRpdHkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGVudGl0eS54ID0gdGhpcy5tb3VzZVBvc1g7XG4gICAgICAgIC8vICAgICAgICAgZW50aXR5LnkgPSB0aGlzLm1vdXNlUG9zWTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGVudGl0eSA9PiB7XG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKHRoaXMubGFzdFRpY2spO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIGRyYXdEZWJ1Z0luZm8oKXtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjb25zdCBjYW4gPSB0aGlzLmNhbnZhcztcblxuICAgICAgICAvLyBGcmFtZSBhbmQgdGltaW5nIGluZm9cbiAgICAgICAgY29uc3QgREVCVUdfU0laRSA9IDE2OyAvL3B4XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICBjdHguZm9udCA9IGAke0RFQlVHX1NJWkV9cHggc2Fucy1zZXJpZmA7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuXG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RUaWNrfWAuc3BsaXQoJy4nKVswXSwgY2FuLndpZHRoLCBERUJVR19TSVpFKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMuZnJhbWVzTGFzdFNlY31gLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAyKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdFNlY31gLnNwbGl0KCcuJylbMF0sIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDMpO1xuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0RnBzfWAuc2xpY2UoMCwgNSksIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDQpO1xuXG5cbiAgICAgICAgLy8gTW91c2VcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubW91c2VQb3NYfSwgJHt0aGlzLm1vdXNlUG9zWX1gLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiA1KTtcbiAgICAgICAgaWYgKHRoaXMubW91c2VQcmVzc2VkKSB7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQoJ0NsaWNrIScsIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gS2V5Ym9hcmRcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke09iamVjdC5rZXlzKHRoaXMua2V5c1ByZXNzZWQpfWAsIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDcpO1xuXG5cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG5cbiAgICAgICAgaWYodGhpcy5ERUJVRyl7XG4gICAgICAgICAgICB0aGlzLmRyYXdEZWJ1Z0luZm8oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICBlbnRpdHkuZHJhdyh0aGlzLmNvbnRleHQpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwiR2FtZVwiOiBHYW1lXG59IiwiY2xhc3MgRW50aXR5e1xuXHRjb25zdHJ1Y3Rvcih4LCB5LCBzcHJpdGVzKXtcblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cdFx0dGhpcy5zcHJpdGVzID0gc3ByaXRlcztcblxuXHRcdHRoaXMubmV4dFNwcml0ZVRpbWUgPSBudWxsO1xuXHRcdHRoaXMubmV4dFNwcml0ZSA9IG51bGw7XG5cdFx0dGhpcy5zcGVlZCA9IDEwMDAgLyA2MCAqIDE7XG5cdFx0dGhpcy5sb29wID0gMDtcblx0fVxuXG5cdHVwZGF0ZSh0aW1lKXtcblx0XHRpZih0aGlzLm5leHRTcHJpdGUgPT09IG51bGwpe1xuXHRcdFx0dGhpcy5uZXh0U3ByaXRlID0gMDtcblx0XHRcdHRoaXMubmV4dFNwcml0ZVRpbWUgPSB0aW1lICsgdGhpcy5zcGVlZDtcblx0XHRcdHRoaXMubG9vcCA9IDE7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRpZih0aW1lID4gdGhpcy5uZXh0U3ByaXRlVGltZSl7XG5cdFx0XHQvLyBib3VuY2UgYmFjayBhbmQgZm9ydGggdGhyb3VnaCB0aGUgc3ByaXRlc1xuXHRcdFx0aWYodGhpcy5uZXh0U3ByaXRlICsgdGhpcy5sb29wID09PSB0aGlzLnNwcml0ZXMubGVuZ3RoKXtcblx0XHRcdFx0dGhpcy5sb29wID0gdGhpcy5sb29wICogLTE7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMubmV4dFNwcml0ZSArIHRoaXMubG9vcCA8IDApe1xuXHRcdFx0XHR0aGlzLmxvb3AgPSB0aGlzLmxvb3AgKiAtMTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5uZXh0U3ByaXRlID0gdGhpcy5uZXh0U3ByaXRlICsgdGhpcy5sb29wO1xuXHRcdFx0dGhpcy5uZXh0U3ByaXRlVGltZSA9IHRoaXMubmV4dFNwcml0ZVRpbWUgKyB0aGlzLnNwZWVkO1xuXHRcdH1cblx0fVxuXG5cdGRyYXcoKXtcblx0XHQvLyBQaWNrIHdoYXQgdG8gZHJhdyBhbmQgZHJhdyBoZXJlXG5cdFx0dGhpcy5zcHJpdGVzW3RoaXMubmV4dFNwcml0ZV0uZHJhdyh0aGlzLngsIHRoaXMueSwgMTApO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcIkVudGl0eVwiOiBFbnRpdHlcbn0iLCJjb25zdCBlbmdpbmUgPSByZXF1aXJlKCcuL2VuZ2luZScpO1xuY29uc3Qgc3ByaXRlID0gcmVxdWlyZSgnLi9zcHJpdGUnKTtcbmNvbnN0IGVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiR2FtZVwiOiBlbmdpbmUuR2FtZSxcblx0XCJMb2FkZXJcIjogc3ByaXRlLkxvYWRlcixcblx0XCJTcHJpdGVcIjogc3ByaXRlLlNwcml0ZSxcblx0XCJFbnRpdHlcIjogZW50aXR5LkVudGl0eVxufVxuXG4iLCJjbGFzcyBMb2FkZXIge1xuXHQvLyBMb2FkIGEgc3ByaXRlIHNoZWV0IG9uY2UuXG5cdGNvbnN0cnVjdG9yKHNyYywgbG9hZGVkQ2FsbGJhY2spe1xuXHRcdHRoaXMuc2hlZXQgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLnNoZWV0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBsb2FkZWRDYWxsYmFjaywgZmFsc2UpO1xuXHRcdHRoaXMuc2hlZXQuc3JjID0gc3JjO1xuXHR9XG59XG5cblxuY2xhc3MgU3ByaXRlIHtcblx0Ly8gc2xpY2UgYSBzcHJpdGUgZnJvbSBhIHNoZWV0XG5cdGNvbnN0cnVjdG9yKHNoZWV0LCBjdHgsIHN4LCBzeSwgc3csIHNoKXtcblx0XHR0aGlzLnNoZWV0ID0gc2hlZXQ7XG5cdFx0dGhpcy5zeCA9IHN4O1xuXHRcdHRoaXMuc3kgPSBzeTtcblx0XHR0aGlzLnN3ID0gc3c7XG5cdFx0dGhpcy5zaCA9IHNoO1xuXHRcdHRoaXMuY3R4ID0gY3R4O1xuXHR9XG5cblx0ZHJhdyh4LCB5LCBzY2FsZT0xKXtcblx0XHR0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5zaGVldCwgdGhpcy5zeCwgdGhpcy5zeSwgdGhpcy5zdywgdGhpcy5zaCwgeCwgeSwgc2NhbGUgKiB0aGlzLnN3LCBzY2FsZSAqIHRoaXMuc2gsICk7XG5cdH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJMb2FkZXJcIjogTG9hZGVyLFxuXHRcIlNwcml0ZVwiOiBTcHJpdGVcbn07XG4iXX0=
