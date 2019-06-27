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
            entity.update(this.lastTick, this.keysPressed);
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
	constructor(x, y){
		this.x = x;
		this.y = y;

		this.state = null;
		this.animations = {};
		this.time = null;
	}

	registerAnimation(state, sprites, frameSpeed){
		this.animations[state] = new Animation(sprites, frameSpeed);
	}

	update(time, keys){
		this.time = time;

		if(keys['ArrowDown'] === true){
            this.state = 'DUCK';
        } else {
        	this.state = 'IDLE';
        }
        
	}

	draw(){
		this.animations[this.state].sprite(this.time).draw(this.x, this.y, 10);
	}
}

class Animation{
	constructor(sprites, frameSpeed, loop=0){
		this.sprites = sprites;
		this.frameSpeed = frameSpeed;
		this.nextSpriteTime = null;
		this.nextSprite = null;
		this.loop = loop;
	}

	sprite(time){
		if(this.nextSprite === null){
			this.nextSprite = 0;
			this.nextSpriteTime = time + this.frameSpeed;
		}

		if(time > this.nextSpriteTime){
			// bounce back and forth through the sprites
			if(this.nextSprite + this.loop === this.sprites.length){
				this.loop = this.loop * -1;
			} else if (this.nextSprite + this.loop < 0){
				this.loop = this.loop * -1;
			}

			this.nextSprite = this.nextSprite + this.loop;
			this.nextSpriteTime = this.nextSpriteTime + this.frameSpeed;
		}

		return this.sprites[this.nextSprite];
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL2VudGl0eS9pbmRleC5qcyIsInNyYy9tYWluLmpzIiwic3JjL3Nwcml0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3Rvcih3aW5kb3cpIHtcbiAgICAgICAgdGhpcy5TRUNPTkQgPSAxMDAwLjA7XG4gICAgICAgIHRoaXMuVElDSyA9IDEwMDAuMCAvIDYwLjA7IC8vIEluIG1zXG4gICAgICAgIHRoaXMuREVCVUcgPSB0cnVlO1xuICAgICAgICB0aGlzLlNNT09USCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMua2V5c1ByZXNzZWQgPSB7fTtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1ggPSAwO1xuICAgICAgICB0aGlzLm1vdXNlUG9zWSA9IDA7XG4gICAgICAgIHRoaXMubW91c2VQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmxhc3RTZWMgPSAwOyAvLyBUaW1lc3RhbXAgaW4gbXMgd2hlbiB3ZSBsYXN0IGRpZCAxMDAwbXMgb2YgZnJhbWVzXG4gICAgICAgIHRoaXMubGFzdFRpY2sgPSAwOyAvLyBUaW1lc3RhbXAgaW4gbXMgd2hlbiB3ZSBsYXN0IGRpZCBvbmUgVElDS1xuICAgICAgICB0aGlzLmxhc3RGcHMgPSAwOyAvLyBGcmFtZXMvc2Vjb25kc1xuICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMgPSAwOyAvLyBGcmFtZXMgc2luY2UgbGFzdCBzZWN0aGlzXG5cbiAgICAgICAgdGhpcy53aW5kb3cgPSB3aW5kb3c7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQgPSB0aGlzLndpbmRvdy5kb2N1bWVudDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSB0aGlzLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2NyZWVuXCIpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmVudGl0aWVzID0gW107XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IHRoaXMuU01PT1RIO1xuICAgIH1cblxuICAgIGtleURvd24oZSl7XG4gICAgICAgIHRoaXMua2V5c1ByZXNzZWRbZS5rZXldID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBrZXlVcChlKXtcbiAgICAgICAgZGVsZXRlIHRoaXMua2V5c1ByZXNzZWRbZS5rZXldO1xuICAgIH0gICAgXG5cbiAgICBtb3VzZU1vdmUoZSkge1xuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMubW91c2VQb3NYID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICB0aGlzLm1vdXNlUG9zWSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgIH1cblxuICAgIG1vdXNlRG93bihlKSB7XG4gICAgICAgIHRoaXMubW91c2VQcmVzc2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBtb3VzZVVwKGUpIHtcbiAgICAgICAgdGhpcy5tb3VzZVByZXNzZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgZnJhbWUobm93KXtcbiAgICAgICAgY29uc3QgdGltZVNpbmNlTGFzdFRpY2sgPSBub3cgLSB0aGlzLmxhc3RUaWNrO1xuXG4gICAgICAgIGlmICh0aW1lU2luY2VMYXN0VGljayA+PSB0aGlzLlRJQ0spIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFRpY2srKztcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYysrO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVsdGFTZWNzID0gbm93IC8gMTAwMC4wO1xuICAgICAgICBpZiAoZGVsdGFTZWNzID49IHRoaXMubGFzdFNlYyArIDEgKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RTZWMgPSBkZWx0YVNlY3M7XG4gICAgICAgICAgICB0aGlzLmxhc3RGcHMgPSB0aGlzLmZyYW1lc0xhc3RTZWM7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMgPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKCl7XG4gICAgICAgIC8vIGNvbnN0IHNwZWVkID0gMTA7XG5cbiAgICAgICAgLy8gLy8gV0FTRCBlbnRpdHkgbW92ZVxuXG4gICAgICAgIC8vIGlmKHRoaXMua2V5c1ByZXNzZWRbJ3MnXSA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGVudGl0eS55ICs9IHNwZWVkO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gaWYodGhpcy5rZXlzUHJlc3NlZFsndyddID09PSB0cnVlKXtcbiAgICAgICAgLy8gICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZW50aXR5LnkgLT0gc3BlZWQ7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIC8vIE1vdXNlIG1vdmVcbiAgICAgICAgLy8gaWYodGhpcy5tb3VzZVByZXNzZWQgPT09IHRydWUpe1xuICAgICAgICAvLyAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGVudGl0eSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZW50aXR5LnggPSB0aGlzLm1vdXNlUG9zWDtcbiAgICAgICAgLy8gICAgICAgICBlbnRpdHkueSA9IHRoaXMubW91c2VQb3NZO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZW50aXR5ID0+IHtcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUodGhpcy5sYXN0VGljaywgdGhpcy5rZXlzUHJlc3NlZCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsZWFyKCl7XG4gICAgICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgZHJhd0RlYnVnSW5mbygpe1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNvbnN0IGNhbiA9IHRoaXMuY2FudmFzO1xuXG4gICAgICAgIC8vIEZyYW1lIGFuZCB0aW1pbmcgaW5mb1xuICAgICAgICBjb25zdCBERUJVR19TSVpFID0gMTY7IC8vcHhcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgICAgIGN0eC5mb250ID0gYCR7REVCVUdfU0laRX1weCBzYW5zLXNlcmlmYDtcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9ICdyaWdodCc7XG5cbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdFRpY2t9YC5zcGxpdCgnLicpWzBdLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUpO1xuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5mcmFtZXNMYXN0U2VjfWAsIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDIpO1xuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0U2VjfWAuc3BsaXQoJy4nKVswXSwgY2FuLndpZHRoLCBERUJVR19TSVpFICogMyk7XG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RGcHN9YC5zbGljZSgwLCA1KSwgY2FuLndpZHRoLCBERUJVR19TSVpFICogNCk7XG5cblxuICAgICAgICAvLyBNb3VzZVxuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5tb3VzZVBvc1h9LCAke3RoaXMubW91c2VQb3NZfWAsIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDUpO1xuICAgICAgICBpZiAodGhpcy5tb3VzZVByZXNzZWQpIHtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCgnQ2xpY2shJywgY2FuLndpZHRoLCBERUJVR19TSVpFICogNik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBLZXlib2FyZFxuICAgICAgICBjdHguZmlsbFRleHQoYCR7T2JqZWN0LmtleXModGhpcy5rZXlzUHJlc3NlZCl9YCwgY2FuLndpZHRoLCBERUJVR19TSVpFICogNyk7XG5cblxuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcblxuICAgICAgICBpZih0aGlzLkRFQlVHKXtcbiAgICAgICAgICAgIHRoaXMuZHJhd0RlYnVnSW5mbygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgIGVudGl0eS5kcmF3KHRoaXMuY29udGV4dCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJHYW1lXCI6IEdhbWVcbn0iLCJjbGFzcyBFbnRpdHl7XG5cdGNvbnN0cnVjdG9yKHgsIHkpe1xuXHRcdHRoaXMueCA9IHg7XG5cdFx0dGhpcy55ID0geTtcblxuXHRcdHRoaXMuc3RhdGUgPSBudWxsO1xuXHRcdHRoaXMuYW5pbWF0aW9ucyA9IHt9O1xuXHRcdHRoaXMudGltZSA9IG51bGw7XG5cdH1cblxuXHRyZWdpc3RlckFuaW1hdGlvbihzdGF0ZSwgc3ByaXRlcywgZnJhbWVTcGVlZCl7XG5cdFx0dGhpcy5hbmltYXRpb25zW3N0YXRlXSA9IG5ldyBBbmltYXRpb24oc3ByaXRlcywgZnJhbWVTcGVlZCk7XG5cdH1cblxuXHR1cGRhdGUodGltZSwga2V5cyl7XG5cdFx0dGhpcy50aW1lID0gdGltZTtcblxuXHRcdGlmKGtleXNbJ0Fycm93RG93biddID09PSB0cnVlKXtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnRFVDSyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIFx0dGhpcy5zdGF0ZSA9ICdJRExFJztcbiAgICAgICAgfVxuICAgICAgICBcblx0fVxuXG5cdGRyYXcoKXtcblx0XHR0aGlzLmFuaW1hdGlvbnNbdGhpcy5zdGF0ZV0uc3ByaXRlKHRoaXMudGltZSkuZHJhdyh0aGlzLngsIHRoaXMueSwgMTApO1xuXHR9XG59XG5cbmNsYXNzIEFuaW1hdGlvbntcblx0Y29uc3RydWN0b3Ioc3ByaXRlcywgZnJhbWVTcGVlZCwgbG9vcD0wKXtcblx0XHR0aGlzLnNwcml0ZXMgPSBzcHJpdGVzO1xuXHRcdHRoaXMuZnJhbWVTcGVlZCA9IGZyYW1lU3BlZWQ7XG5cdFx0dGhpcy5uZXh0U3ByaXRlVGltZSA9IG51bGw7XG5cdFx0dGhpcy5uZXh0U3ByaXRlID0gbnVsbDtcblx0XHR0aGlzLmxvb3AgPSBsb29wO1xuXHR9XG5cblx0c3ByaXRlKHRpbWUpe1xuXHRcdGlmKHRoaXMubmV4dFNwcml0ZSA9PT0gbnVsbCl7XG5cdFx0XHR0aGlzLm5leHRTcHJpdGUgPSAwO1xuXHRcdFx0dGhpcy5uZXh0U3ByaXRlVGltZSA9IHRpbWUgKyB0aGlzLmZyYW1lU3BlZWQ7XG5cdFx0fVxuXG5cdFx0aWYodGltZSA+IHRoaXMubmV4dFNwcml0ZVRpbWUpe1xuXHRcdFx0Ly8gYm91bmNlIGJhY2sgYW5kIGZvcnRoIHRocm91Z2ggdGhlIHNwcml0ZXNcblx0XHRcdGlmKHRoaXMubmV4dFNwcml0ZSArIHRoaXMubG9vcCA9PT0gdGhpcy5zcHJpdGVzLmxlbmd0aCl7XG5cdFx0XHRcdHRoaXMubG9vcCA9IHRoaXMubG9vcCAqIC0xO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLm5leHRTcHJpdGUgKyB0aGlzLmxvb3AgPCAwKXtcblx0XHRcdFx0dGhpcy5sb29wID0gdGhpcy5sb29wICogLTE7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMubmV4dFNwcml0ZSA9IHRoaXMubmV4dFNwcml0ZSArIHRoaXMubG9vcDtcblx0XHRcdHRoaXMubmV4dFNwcml0ZVRpbWUgPSB0aGlzLm5leHRTcHJpdGVUaW1lICsgdGhpcy5mcmFtZVNwZWVkO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnNwcml0ZXNbdGhpcy5uZXh0U3ByaXRlXTtcblx0fVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcIkVudGl0eVwiOiBFbnRpdHlcbn0iLCJjb25zdCBlbmdpbmUgPSByZXF1aXJlKCcuL2VuZ2luZScpO1xuY29uc3Qgc3ByaXRlID0gcmVxdWlyZSgnLi9zcHJpdGUnKTtcbmNvbnN0IGVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiR2FtZVwiOiBlbmdpbmUuR2FtZSxcblx0XCJMb2FkZXJcIjogc3ByaXRlLkxvYWRlcixcblx0XCJTcHJpdGVcIjogc3ByaXRlLlNwcml0ZSxcblx0XCJFbnRpdHlcIjogZW50aXR5LkVudGl0eVxufVxuXG4iLCJjbGFzcyBMb2FkZXIge1xuXHQvLyBMb2FkIGEgc3ByaXRlIHNoZWV0IG9uY2UuXG5cdGNvbnN0cnVjdG9yKHNyYywgbG9hZGVkQ2FsbGJhY2spe1xuXHRcdHRoaXMuc2hlZXQgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLnNoZWV0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBsb2FkZWRDYWxsYmFjaywgZmFsc2UpO1xuXHRcdHRoaXMuc2hlZXQuc3JjID0gc3JjO1xuXHR9XG59XG5cblxuY2xhc3MgU3ByaXRlIHtcblx0Ly8gc2xpY2UgYSBzcHJpdGUgZnJvbSBhIHNoZWV0XG5cdGNvbnN0cnVjdG9yKHNoZWV0LCBjdHgsIHN4LCBzeSwgc3csIHNoKXtcblx0XHR0aGlzLnNoZWV0ID0gc2hlZXQ7XG5cdFx0dGhpcy5zeCA9IHN4O1xuXHRcdHRoaXMuc3kgPSBzeTtcblx0XHR0aGlzLnN3ID0gc3c7XG5cdFx0dGhpcy5zaCA9IHNoO1xuXHRcdHRoaXMuY3R4ID0gY3R4O1xuXHR9XG5cblx0ZHJhdyh4LCB5LCBzY2FsZT0xKXtcblx0XHR0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5zaGVldCwgdGhpcy5zeCwgdGhpcy5zeSwgdGhpcy5zdywgdGhpcy5zaCwgeCwgeSwgc2NhbGUgKiB0aGlzLnN3LCBzY2FsZSAqIHRoaXMuc2gsICk7XG5cdH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJMb2FkZXJcIjogTG9hZGVyLFxuXHRcIlNwcml0ZVwiOiBTcHJpdGVcbn07XG4iXX0=
