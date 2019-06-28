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
        const world = {
            'time': this.lastTick,
            'keysPressed': this.keysPressed
        }
        
        this.entities.forEach(entity => {
            entity.update(world);
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

        // Keyboard
        ctx.fillText(`${Object.keys(this.keysPressed)}`, can.width, DEBUG_SIZE * 5);


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

		this.state;
		this.animations = {};
		this.animation;
		this.time;
	}

	registerAnimation(state, sprites, frameSpeed, loop=false){
		this.animations[state] = new Animation(sprites, frameSpeed, loop);

		return this;
	}

	update(world){
		this.time = world.time;

		let stateChange = false;

		switch(this.state){
			case 'IDLE':
				if(world.keysPressed['ArrowDown'] === true){
					this.state = 'DUCK';
					stateChange = true;
				}
				break;
			case 'DUCK':
				if(world.keysPressed['ArrowDown'] !== true){
					this.state = 'IDLE';
					stateChange = true;
				}
				break;
			default:
				this.state = 'IDLE';
				stateChange = true;
		}

		this.animation = this.animations[this.state];
		this.animation.x = this.x;
		this.animation.y = this.y;
		if(stateChange === true){
			this.animation.rewind(this.time);
		} else {
			this.animation.advance(this.time);
		}
	}

	draw(){
		this.animation.draw();
	}
}

class Animation{
	constructor(sprites, frameSpeed, loop){
		this.sprites = sprites;
		this.index = 0;
		this.nextSpriteTime;
		this.loop = loop;

		this.frameSpeed = frameSpeed;
		this.time;
		this.x;
		this.y;
	}

	get sprite(){
		return this.sprites[this.index];
	}

	draw(){
		let sprite = this.sprite;
		sprite.draw(this.x, this.y, 10);
	}

	rewind(time){
		this.time = time;
		this.index = 0;
		this.nextSpriteTime = this.time + this.frameSpeed;
	}

	advance(time){
		this.time = time;

		if(this.time > this.nextSpriteTime){
			this.index++;

			if(this.loop === true){
				this.index = this.index % this.sprites.length;
			} else if(this.index === this.sprites.length) {
				this.index--;
			}

			this.nextSpriteTime = this.nextSpriteTime + this.frameSpeed;
		}
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL2VudGl0eS9pbmRleC5qcyIsInNyYy9tYWluLmpzIiwic3JjL3Nwcml0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3Rvcih3aW5kb3cpIHtcbiAgICAgICAgdGhpcy5TRUNPTkQgPSAxMDAwLjA7XG4gICAgICAgIHRoaXMuVElDSyA9IDEwMDAuMCAvIDYwLjA7IC8vIEluIG1zXG4gICAgICAgIHRoaXMuREVCVUcgPSB0cnVlO1xuICAgICAgICB0aGlzLlNNT09USCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMua2V5c1ByZXNzZWQgPSB7fTtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1ggPSAwO1xuICAgICAgICB0aGlzLm1vdXNlUG9zWSA9IDA7XG4gICAgICAgIHRoaXMubW91c2VQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmxhc3RTZWMgPSAwOyAvLyBUaW1lc3RhbXAgaW4gbXMgd2hlbiB3ZSBsYXN0IGRpZCAxMDAwbXMgb2YgZnJhbWVzXG4gICAgICAgIHRoaXMubGFzdFRpY2sgPSAwOyAvLyBUaW1lc3RhbXAgaW4gbXMgd2hlbiB3ZSBsYXN0IGRpZCBvbmUgVElDS1xuICAgICAgICB0aGlzLmxhc3RGcHMgPSAwOyAvLyBGcmFtZXMvc2Vjb25kc1xuICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMgPSAwOyAvLyBGcmFtZXMgc2luY2UgbGFzdCBzZWN0aGlzXG5cbiAgICAgICAgdGhpcy53aW5kb3cgPSB3aW5kb3c7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQgPSB0aGlzLndpbmRvdy5kb2N1bWVudDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSB0aGlzLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2NyZWVuXCIpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmVudGl0aWVzID0gW107XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IHRoaXMuU01PT1RIO1xuICAgIH1cblxuICAgIGtleURvd24oZSl7XG4gICAgICAgIHRoaXMua2V5c1ByZXNzZWRbZS5rZXldID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBrZXlVcChlKXtcbiAgICAgICAgZGVsZXRlIHRoaXMua2V5c1ByZXNzZWRbZS5rZXldO1xuICAgIH0gICAgXG4gICAgXG4gICAgZnJhbWUobm93KXtcbiAgICAgICAgY29uc3QgdGltZVNpbmNlTGFzdFRpY2sgPSBub3cgLSB0aGlzLmxhc3RUaWNrO1xuXG4gICAgICAgIGlmICh0aW1lU2luY2VMYXN0VGljayA+PSB0aGlzLlRJQ0spIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFRpY2srKztcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYysrO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVsdGFTZWNzID0gbm93IC8gMTAwMC4wO1xuICAgICAgICBpZiAoZGVsdGFTZWNzID49IHRoaXMubGFzdFNlYyArIDEgKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RTZWMgPSBkZWx0YVNlY3M7XG4gICAgICAgICAgICB0aGlzLmxhc3RGcHMgPSB0aGlzLmZyYW1lc0xhc3RTZWM7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMgPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKCl7XG4gICAgICAgIGNvbnN0IHdvcmxkID0ge1xuICAgICAgICAgICAgJ3RpbWUnOiB0aGlzLmxhc3RUaWNrLFxuICAgICAgICAgICAgJ2tleXNQcmVzc2VkJzogdGhpcy5rZXlzUHJlc3NlZFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZW50aXR5ID0+IHtcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUod29ybGQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIGRyYXdEZWJ1Z0luZm8oKXtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjb25zdCBjYW4gPSB0aGlzLmNhbnZhcztcblxuICAgICAgICAvLyBGcmFtZSBhbmQgdGltaW5nIGluZm9cbiAgICAgICAgY29uc3QgREVCVUdfU0laRSA9IDE2OyAvL3B4XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICBjdHguZm9udCA9IGAke0RFQlVHX1NJWkV9cHggc2Fucy1zZXJpZmA7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuXG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RUaWNrfWAuc3BsaXQoJy4nKVswXSwgY2FuLndpZHRoLCBERUJVR19TSVpFKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMuZnJhbWVzTGFzdFNlY31gLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAyKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdFNlY31gLnNwbGl0KCcuJylbMF0sIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDMpO1xuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0RnBzfWAuc2xpY2UoMCwgNSksIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDQpO1xuXG4gICAgICAgIC8vIEtleWJvYXJkXG4gICAgICAgIGN0eC5maWxsVGV4dChgJHtPYmplY3Qua2V5cyh0aGlzLmtleXNQcmVzc2VkKX1gLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiA1KTtcblxuXG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuXG4gICAgICAgIGlmKHRoaXMuREVCVUcpe1xuICAgICAgICAgICAgdGhpcy5kcmF3RGVidWdJbmZvKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgZW50aXR5LmRyYXcodGhpcy5jb250ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkdhbWVcIjogR2FtZVxufSIsImNsYXNzIEVudGl0eXtcblx0Y29uc3RydWN0b3IoeCwgeSl7XG5cdFx0dGhpcy54ID0geDtcblx0XHR0aGlzLnkgPSB5O1xuXG5cdFx0dGhpcy5zdGF0ZTtcblx0XHR0aGlzLmFuaW1hdGlvbnMgPSB7fTtcblx0XHR0aGlzLmFuaW1hdGlvbjtcblx0XHR0aGlzLnRpbWU7XG5cdH1cblxuXHRyZWdpc3RlckFuaW1hdGlvbihzdGF0ZSwgc3ByaXRlcywgZnJhbWVTcGVlZCwgbG9vcD1mYWxzZSl7XG5cdFx0dGhpcy5hbmltYXRpb25zW3N0YXRlXSA9IG5ldyBBbmltYXRpb24oc3ByaXRlcywgZnJhbWVTcGVlZCwgbG9vcCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHVwZGF0ZSh3b3JsZCl7XG5cdFx0dGhpcy50aW1lID0gd29ybGQudGltZTtcblxuXHRcdGxldCBzdGF0ZUNoYW5nZSA9IGZhbHNlO1xuXG5cdFx0c3dpdGNoKHRoaXMuc3RhdGUpe1xuXHRcdFx0Y2FzZSAnSURMRSc6XG5cdFx0XHRcdGlmKHdvcmxkLmtleXNQcmVzc2VkWydBcnJvd0Rvd24nXSA9PT0gdHJ1ZSl7XG5cdFx0XHRcdFx0dGhpcy5zdGF0ZSA9ICdEVUNLJztcblx0XHRcdFx0XHRzdGF0ZUNoYW5nZSA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdEVUNLJzpcblx0XHRcdFx0aWYod29ybGQua2V5c1ByZXNzZWRbJ0Fycm93RG93biddICE9PSB0cnVlKXtcblx0XHRcdFx0XHR0aGlzLnN0YXRlID0gJ0lETEUnO1xuXHRcdFx0XHRcdHN0YXRlQ2hhbmdlID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAnSURMRSc7XG5cdFx0XHRcdHN0YXRlQ2hhbmdlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLmFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLnN0YXRlXTtcblx0XHR0aGlzLmFuaW1hdGlvbi54ID0gdGhpcy54O1xuXHRcdHRoaXMuYW5pbWF0aW9uLnkgPSB0aGlzLnk7XG5cdFx0aWYoc3RhdGVDaGFuZ2UgPT09IHRydWUpe1xuXHRcdFx0dGhpcy5hbmltYXRpb24ucmV3aW5kKHRoaXMudGltZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYW5pbWF0aW9uLmFkdmFuY2UodGhpcy50aW1lKTtcblx0XHR9XG5cdH1cblxuXHRkcmF3KCl7XG5cdFx0dGhpcy5hbmltYXRpb24uZHJhdygpO1xuXHR9XG59XG5cbmNsYXNzIEFuaW1hdGlvbntcblx0Y29uc3RydWN0b3Ioc3ByaXRlcywgZnJhbWVTcGVlZCwgbG9vcCl7XG5cdFx0dGhpcy5zcHJpdGVzID0gc3ByaXRlcztcblx0XHR0aGlzLmluZGV4ID0gMDtcblx0XHR0aGlzLm5leHRTcHJpdGVUaW1lO1xuXHRcdHRoaXMubG9vcCA9IGxvb3A7XG5cblx0XHR0aGlzLmZyYW1lU3BlZWQgPSBmcmFtZVNwZWVkO1xuXHRcdHRoaXMudGltZTtcblx0XHR0aGlzLng7XG5cdFx0dGhpcy55O1xuXHR9XG5cblx0Z2V0IHNwcml0ZSgpe1xuXHRcdHJldHVybiB0aGlzLnNwcml0ZXNbdGhpcy5pbmRleF07XG5cdH1cblxuXHRkcmF3KCl7XG5cdFx0bGV0IHNwcml0ZSA9IHRoaXMuc3ByaXRlO1xuXHRcdHNwcml0ZS5kcmF3KHRoaXMueCwgdGhpcy55LCAxMCk7XG5cdH1cblxuXHRyZXdpbmQodGltZSl7XG5cdFx0dGhpcy50aW1lID0gdGltZTtcblx0XHR0aGlzLmluZGV4ID0gMDtcblx0XHR0aGlzLm5leHRTcHJpdGVUaW1lID0gdGhpcy50aW1lICsgdGhpcy5mcmFtZVNwZWVkO1xuXHR9XG5cblx0YWR2YW5jZSh0aW1lKXtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXG5cdFx0aWYodGhpcy50aW1lID4gdGhpcy5uZXh0U3ByaXRlVGltZSl7XG5cdFx0XHR0aGlzLmluZGV4Kys7XG5cblx0XHRcdGlmKHRoaXMubG9vcCA9PT0gdHJ1ZSl7XG5cdFx0XHRcdHRoaXMuaW5kZXggPSB0aGlzLmluZGV4ICUgdGhpcy5zcHJpdGVzLmxlbmd0aDtcblx0XHRcdH0gZWxzZSBpZih0aGlzLmluZGV4ID09PSB0aGlzLnNwcml0ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMuaW5kZXgtLTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5uZXh0U3ByaXRlVGltZSA9IHRoaXMubmV4dFNwcml0ZVRpbWUgKyB0aGlzLmZyYW1lU3BlZWQ7XG5cdFx0fVxuXHR9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiRW50aXR5XCI6IEVudGl0eVxufSIsImNvbnN0IGVuZ2luZSA9IHJlcXVpcmUoJy4vZW5naW5lJyk7XG5jb25zdCBzcHJpdGUgPSByZXF1aXJlKCcuL3Nwcml0ZScpO1xuY29uc3QgZW50aXR5ID0gcmVxdWlyZSgnLi9lbnRpdHknKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJHYW1lXCI6IGVuZ2luZS5HYW1lLFxuXHRcIkxvYWRlclwiOiBzcHJpdGUuTG9hZGVyLFxuXHRcIlNwcml0ZVwiOiBzcHJpdGUuU3ByaXRlLFxuXHRcIkVudGl0eVwiOiBlbnRpdHkuRW50aXR5XG59XG5cbiIsImNsYXNzIExvYWRlciB7XG5cdC8vIExvYWQgYSBzcHJpdGUgc2hlZXQgb25jZS5cblx0Y29uc3RydWN0b3Ioc3JjLCBsb2FkZWRDYWxsYmFjayl7XG5cdFx0dGhpcy5zaGVldCA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuc2hlZXQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGxvYWRlZENhbGxiYWNrLCBmYWxzZSk7XG5cdFx0dGhpcy5zaGVldC5zcmMgPSBzcmM7XG5cdH1cbn1cblxuXG5jbGFzcyBTcHJpdGUge1xuXHQvLyBzbGljZSBhIHNwcml0ZSBmcm9tIGEgc2hlZXRcblx0Y29uc3RydWN0b3Ioc2hlZXQsIGN0eCwgc3gsIHN5LCBzdywgc2gpe1xuXHRcdHRoaXMuc2hlZXQgPSBzaGVldDtcblx0XHR0aGlzLnN4ID0gc3g7XG5cdFx0dGhpcy5zeSA9IHN5O1xuXHRcdHRoaXMuc3cgPSBzdztcblx0XHR0aGlzLnNoID0gc2g7XG5cdFx0dGhpcy5jdHggPSBjdHg7XG5cdH1cblxuXHRkcmF3KHgsIHksIHNjYWxlPTEpe1xuXHRcdHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLnNoZWV0LCB0aGlzLnN4LCB0aGlzLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCB4LCB5LCBzY2FsZSAqIHRoaXMuc3csIHNjYWxlICogdGhpcy5zaCwgKTtcblx0fVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcIkxvYWRlclwiOiBMb2FkZXIsXG5cdFwiU3ByaXRlXCI6IFNwcml0ZVxufTtcbiJdfQ==
