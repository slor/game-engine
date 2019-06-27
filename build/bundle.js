(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ge = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        this.entities = [];
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

        // WASD entity move
        if(this.keysPressed['d'] === true){
            this.entities.forEach((entity) => {
                entity.x += speed;
            });
        }
        if(this.keysPressed['a'] === true){
            this.entities.forEach((entity) => {
                entity.x -= speed;
            });
        }
        if(this.keysPressed['s'] === true){
            this.entities.forEach((entity) => {
                entity.y += speed;
            });
        }
        if(this.keysPressed['w'] === true){
            this.entities.forEach((entity) => {
                entity.y -= speed;
            });
        }

        // Mouse move
        if(this.mousePressed === true){
            this.entities.forEach(entity => {
                entity.x = this.mousePosX;
                entity.y = this.mousePosY;
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
	constructor(x, y, sprite){
		this.x = x;
		this.y = y;
		this.sprite = sprite;
	}

	update(){

	}

	draw(context){
		this.sprite.draw(this.x, this.y);
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

	draw(x, y){
		this.ctx.drawImage(this.sheet, this.sx, this.sy, this.sw, this.sh, 
					  x, y, this.sw, this.sh);
	}
}


module.exports = {
	"Loader": Loader,
	"Sprite": Sprite
};

},{}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL2VudGl0eS9pbmRleC5qcyIsInNyYy9tYWluLmpzIiwic3JjL3Nwcml0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Iod2luZG93KSB7XG4gICAgICAgIHRoaXMuU0VDT05EID0gMTAwMC4wO1xuICAgICAgICB0aGlzLlRJQ0sgPSAxMDAwLjAgLyA2MC4wOyAvLyBJbiBtc1xuICAgICAgICB0aGlzLkRFQlVHID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmtleXNQcmVzc2VkID0ge307XG4gICAgICAgIHRoaXMubW91c2VQb3NYID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1kgPSAwO1xuICAgICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5sYXN0U2VjID0gMDsgLy8gVGltZXN0YW1wIGluIG1zIHdoZW4gd2UgbGFzdCBkaWQgMTAwMG1zIG9mIGZyYW1lc1xuICAgICAgICB0aGlzLmxhc3RUaWNrID0gMDsgLy8gVGltZXN0YW1wIGluIG1zIHdoZW4gd2UgbGFzdCBkaWQgb25lIFRJQ0tcbiAgICAgICAgdGhpcy5sYXN0RnBzID0gMDsgLy8gRnJhbWVzL3NlY29uZHNcbiAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjID0gMDsgLy8gRnJhbWVzIHNpbmNlIGxhc3Qgc2VjdGhpc1xuXG4gICAgICAgIHRoaXMud2luZG93ID0gd2luZG93O1xuICAgICAgICB0aGlzLmRvY3VtZW50ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQ7XG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNjcmVlblwiKTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IFtdO1xuICAgIH1cblxuICAgIGtleURvd24oZSl7XG4gICAgICAgIHRoaXMua2V5c1ByZXNzZWRbZS5rZXldID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBrZXlVcChlKXtcbiAgICAgICAgZGVsZXRlIHRoaXMua2V5c1ByZXNzZWRbZS5rZXldO1xuICAgIH0gICAgXG5cbiAgICBtb3VzZU1vdmUoZSkge1xuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMubW91c2VQb3NYID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICB0aGlzLm1vdXNlUG9zWSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgIH1cblxuICAgIG1vdXNlRG93bihlKSB7XG4gICAgICAgIHRoaXMubW91c2VQcmVzc2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBtb3VzZVVwKGUpIHtcbiAgICAgICAgdGhpcy5tb3VzZVByZXNzZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgZnJhbWUobm93KXtcbiAgICAgICAgY29uc3QgdGltZVNpbmNlTGFzdFRpY2sgPSBub3cgLSB0aGlzLmxhc3RUaWNrO1xuXG4gICAgICAgIGlmICh0aW1lU2luY2VMYXN0VGljayA+PSB0aGlzLlRJQ0spIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFRpY2srKztcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYysrO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVsdGFTZWNzID0gbm93IC8gMTAwMC4wO1xuICAgICAgICBpZiAoZGVsdGFTZWNzID49IHRoaXMubGFzdFNlYyArIDEgKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RTZWMgPSBkZWx0YVNlY3M7XG4gICAgICAgICAgICB0aGlzLmxhc3RGcHMgPSB0aGlzLmZyYW1lc0xhc3RTZWM7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMgPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKCl7XG4gICAgICAgIGNvbnN0IHNwZWVkID0gMTA7XG5cbiAgICAgICAgLy8gV0FTRCBlbnRpdHkgbW92ZVxuICAgICAgICBpZih0aGlzLmtleXNQcmVzc2VkWydkJ10gPT09IHRydWUpe1xuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICBlbnRpdHkueCArPSBzcGVlZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMua2V5c1ByZXNzZWRbJ2EnXSA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGVudGl0eS54IC09IHNwZWVkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5rZXlzUHJlc3NlZFsncyddID09PSB0cnVlKXtcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgZW50aXR5LnkgKz0gc3BlZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLmtleXNQcmVzc2VkWyd3J10gPT09IHRydWUpe1xuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICBlbnRpdHkueSAtPSBzcGVlZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTW91c2UgbW92ZVxuICAgICAgICBpZih0aGlzLm1vdXNlUHJlc3NlZCA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZW50aXR5ID0+IHtcbiAgICAgICAgICAgICAgICBlbnRpdHkueCA9IHRoaXMubW91c2VQb3NYO1xuICAgICAgICAgICAgICAgIGVudGl0eS55ID0gdGhpcy5tb3VzZVBvc1k7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgY2xlYXIoKXtcbiAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBkcmF3RGVidWdJbmZvKCl7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY29uc3QgY2FuID0gdGhpcy5jYW52YXM7XG5cbiAgICAgICAgLy8gRnJhbWUgYW5kIHRpbWluZyBpbmZvXG4gICAgICAgIGNvbnN0IERFQlVHX1NJWkUgPSAxNjsgLy9weFxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgY3R4LmZvbnQgPSBgJHtERUJVR19TSVpFfXB4IHNhbnMtc2VyaWZgO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcblxuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0VGlja31gLnNwbGl0KCcuJylbMF0sIGNhbi53aWR0aCwgREVCVUdfU0laRSk7XG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RTZWN9YC5zcGxpdCgnLicpWzBdLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAyKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdEZwc31gLnNsaWNlKDAsIDUpLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAzKTtcblxuICAgICAgICAvLyBNb3VzZVxuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5tb3VzZVBvc1h9LCAke3RoaXMubW91c2VQb3NZfWAsIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDQpO1xuICAgICAgICBpZiAodGhpcy5tb3VzZVByZXNzZWQpIHtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCgnQ2xpY2shJywgY2FuLndpZHRoLCBERUJVR19TSVpFICogNSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBLZXlib2FyZFxuICAgICAgICBjdHguZmlsbFRleHQoYCR7T2JqZWN0LmtleXModGhpcy5rZXlzUHJlc3NlZCl9YCwgY2FuLndpZHRoLCBERUJVR19TSVpFICogNik7XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuXG4gICAgICAgIGlmKHRoaXMuREVCVUcpe1xuICAgICAgICAgICAgdGhpcy5kcmF3RGVidWdJbmZvKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgZW50aXR5LmRyYXcodGhpcy5jb250ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkdhbWVcIjogR2FtZVxufSIsImNsYXNzIEVudGl0eXtcblx0Y29uc3RydWN0b3IoeCwgeSwgc3ByaXRlKXtcblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cdFx0dGhpcy5zcHJpdGUgPSBzcHJpdGU7XG5cdH1cblxuXHR1cGRhdGUoKXtcblxuXHR9XG5cblx0ZHJhdyhjb250ZXh0KXtcblx0XHR0aGlzLnNwcml0ZS5kcmF3KHRoaXMueCwgdGhpcy55KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJFbnRpdHlcIjogRW50aXR5XG59IiwiY29uc3QgZW5naW5lID0gcmVxdWlyZSgnLi9lbmdpbmUnKTtcbmNvbnN0IHNwcml0ZSA9IHJlcXVpcmUoJy4vc3ByaXRlJyk7XG5jb25zdCBlbnRpdHkgPSByZXF1aXJlKCcuL2VudGl0eScpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcIkdhbWVcIjogZW5naW5lLkdhbWUsXG5cdFwiTG9hZGVyXCI6IHNwcml0ZS5Mb2FkZXIsXG5cdFwiU3ByaXRlXCI6IHNwcml0ZS5TcHJpdGUsXG5cdFwiRW50aXR5XCI6IGVudGl0eS5FbnRpdHlcbn1cblxuIiwiY2xhc3MgTG9hZGVyIHtcblx0Ly8gTG9hZCBhIHNwcml0ZSBzaGVldCBvbmNlLlxuXHRjb25zdHJ1Y3RvcihzcmMsIGxvYWRlZENhbGxiYWNrKXtcblx0XHR0aGlzLnNoZWV0ID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5zaGVldC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgbG9hZGVkQ2FsbGJhY2ssIGZhbHNlKTtcblx0XHR0aGlzLnNoZWV0LnNyYyA9IHNyYztcblx0fVxufVxuXG5cbmNsYXNzIFNwcml0ZSB7XG5cdC8vIHNsaWNlIGEgc3ByaXRlIGZyb20gYSBzaGVldFxuXHRjb25zdHJ1Y3RvcihzaGVldCwgY3R4LCBzeCwgc3ksIHN3LCBzaCl7XG5cdFx0dGhpcy5zaGVldCA9IHNoZWV0O1xuXHRcdHRoaXMuc3ggPSBzeDtcblx0XHR0aGlzLnN5ID0gc3k7XG5cdFx0dGhpcy5zdyA9IHN3O1xuXHRcdHRoaXMuc2ggPSBzaDtcblx0XHR0aGlzLmN0eCA9IGN0eDtcblx0fVxuXG5cdGRyYXcoeCwgeSl7XG5cdFx0dGhpcy5jdHguZHJhd0ltYWdlKHRoaXMuc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIFxuXHRcdFx0XHRcdCAgeCwgeSwgdGhpcy5zdywgdGhpcy5zaCk7XG5cdH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJMb2FkZXJcIjogTG9hZGVyLFxuXHRcIlNwcml0ZVwiOiBTcHJpdGVcbn07XG4iXX0=
