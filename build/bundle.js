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


module.exports = {
	"Game": engine.Game,
	"Loader": sprite.Loader,
	"Sprite": sprite.Sprite
}


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

},{}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL21haW4uanMiLCJzcmMvc3ByaXRlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Iod2luZG93KSB7XG4gICAgICAgIHRoaXMuU0VDT05EID0gMTAwMC4wO1xuICAgICAgICB0aGlzLlRJQ0sgPSAxMDAwLjAgLyA2MC4wOyAvLyBJbiBtc1xuICAgICAgICB0aGlzLkRFQlVHID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmtleXNQcmVzc2VkID0ge307XG4gICAgICAgIHRoaXMubW91c2VQb3NYID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1kgPSAwO1xuICAgICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5sYXN0U2VjID0gMDsgLy8gVGltZXN0YW1wIGluIG1zIHdoZW4gd2UgbGFzdCBkaWQgMTAwMG1zIG9mIGZyYW1lc1xuICAgICAgICB0aGlzLmxhc3RUaWNrID0gMDsgLy8gVGltZXN0YW1wIGluIG1zIHdoZW4gd2UgbGFzdCBkaWQgb25lIFRJQ0tcbiAgICAgICAgdGhpcy5sYXN0RnBzID0gMDsgLy8gRnJhbWVzL3NlY29uZHNcbiAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjID0gMDsgLy8gRnJhbWVzIHNpbmNlIGxhc3Qgc2VjdGhpc1xuXG4gICAgICAgIHRoaXMud2luZG93ID0gd2luZG93O1xuICAgICAgICB0aGlzLmRvY3VtZW50ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQ7XG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNjcmVlblwiKTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5zcHJpdGVzID0gW107XG4gICAgfVxuXG4gICAga2V5RG93bihlKXtcbiAgICAgICAgdGhpcy5rZXlzUHJlc3NlZFtlLmtleV0gPSB0cnVlO1xuICAgIH1cblxuICAgIGtleVVwKGUpe1xuICAgICAgICBkZWxldGUgdGhpcy5rZXlzUHJlc3NlZFtlLmtleV07XG4gICAgfSAgICBcblxuICAgIG1vdXNlTW92ZShlKSB7XG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1ggPSBlLmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIHRoaXMubW91c2VQb3NZID0gZS5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgfVxuXG4gICAgbW91c2VEb3duKGUpIHtcbiAgICAgICAgdGhpcy5tb3VzZVByZXNzZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIG1vdXNlVXAoZSkge1xuICAgICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBmcmFtZShub3cpe1xuICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0VGljayA9IG5vdyAtIHRoaXMubGFzdFRpY2s7XG5cbiAgICAgICAgaWYgKHRpbWVTaW5jZUxhc3RUaWNrID49IHRoaXMuVElDSykge1xuICAgICAgICAgICAgdGhpcy5sYXN0VGljaysrO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjKys7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWx0YVNlY3MgPSBub3cgLyAxMDAwLjA7XG4gICAgICAgIGlmIChkZWx0YVNlY3MgPj0gdGhpcy5sYXN0U2VjICsgMSApIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFNlYyA9IGRlbHRhU2VjcztcbiAgICAgICAgICAgIHRoaXMubGFzdEZwcyA9IHRoaXMuZnJhbWVzTGFzdFNlYztcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYyA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoKXtcbiAgICAgICAgY29uc3Qgc3BlZWQgPSAxMDtcblxuICAgICAgICAvLyBXQVNEIHNwcml0ZSBtb3ZlXG4gICAgICAgIGlmKHRoaXMua2V5c1ByZXNzZWRbJ2QnXSA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICB0aGlzLnNwcml0ZXMuZm9yRWFjaCgoc3ByaXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnggKz0gc3BlZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLmtleXNQcmVzc2VkWydhJ10gPT09IHRydWUpe1xuICAgICAgICAgICAgdGhpcy5zcHJpdGVzLmZvckVhY2goKHNwcml0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHNwcml0ZS54IC09IHNwZWVkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5rZXlzUHJlc3NlZFsncyddID09PSB0cnVlKXtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlcy5mb3JFYWNoKChzcHJpdGUpID0+IHtcbiAgICAgICAgICAgICAgICBzcHJpdGUueSArPSBzcGVlZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMua2V5c1ByZXNzZWRbJ3cnXSA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICB0aGlzLnNwcml0ZXMuZm9yRWFjaCgoc3ByaXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnkgLT0gc3BlZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vdXNlIG1vdmVcbiAgICAgICAgaWYodGhpcy5tb3VzZVByZXNzZWQgPT09IHRydWUpe1xuICAgICAgICAgICAgdGhpcy5zcHJpdGVzLmZvckVhY2goc3ByaXRlID0+IHtcbiAgICAgICAgICAgICAgICBzcHJpdGUueCA9IHRoaXMubW91c2VQb3NYO1xuICAgICAgICAgICAgICAgIHNwcml0ZS55ID0gdGhpcy5tb3VzZVBvc1k7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgY2xlYXIoKXtcbiAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBkcmF3RGVidWdJbmZvKCl7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY29uc3QgY2FuID0gdGhpcy5jYW52YXM7XG5cbiAgICAgICAgLy8gRnJhbWUgYW5kIHRpbWluZyBpbmZvXG4gICAgICAgIGNvbnN0IERFQlVHX1NJWkUgPSAxNjsgLy9weFxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgY3R4LmZvbnQgPSBgJHtERUJVR19TSVpFfXB4IHNhbnMtc2VyaWZgO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcblxuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0VGlja31gLnNwbGl0KCcuJylbMF0sIGNhbi53aWR0aCwgREVCVUdfU0laRSk7XG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RTZWN9YC5zcGxpdCgnLicpWzBdLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAyKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdEZwc31gLnNsaWNlKDAsIDUpLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAzKTtcblxuICAgICAgICAvLyBNb3VzZVxuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5tb3VzZVBvc1h9LCAke3RoaXMubW91c2VQb3NZfWAsIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDQpO1xuICAgICAgICBpZiAodGhpcy5tb3VzZVByZXNzZWQpIHtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCgnQ2xpY2shJywgY2FuLndpZHRoLCBERUJVR19TSVpFICogNSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBLZXlib2FyZFxuICAgICAgICBjdHguZmlsbFRleHQoYCR7T2JqZWN0LmtleXModGhpcy5rZXlzUHJlc3NlZCl9YCwgY2FuLndpZHRoLCBERUJVR19TSVpFICogNik7XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuXG4gICAgICAgIGlmKHRoaXMuREVCVUcpe1xuICAgICAgICAgICAgdGhpcy5kcmF3RGVidWdJbmZvKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNwcml0ZXMuZm9yRWFjaCgoc3ByaXRlKSA9PiB7XG4gICAgICAgICAgICBzcHJpdGUuZHJhdyh0aGlzLmNvbnRleHQpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwiR2FtZVwiOiBHYW1lXG59IiwiY29uc3QgZW5naW5lID0gcmVxdWlyZSgnLi9lbmdpbmUnKTtcbmNvbnN0IHNwcml0ZSA9IHJlcXVpcmUoJy4vc3ByaXRlJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiR2FtZVwiOiBlbmdpbmUuR2FtZSxcblx0XCJMb2FkZXJcIjogc3ByaXRlLkxvYWRlcixcblx0XCJTcHJpdGVcIjogc3ByaXRlLlNwcml0ZVxufVxuXG4iLCJjbGFzcyBMb2FkZXIge1xuXHQvLyBMb2FkIGEgc3ByaXRlIHNoZWV0IG9uY2UuXG5cdGNvbnN0cnVjdG9yKHNyYywgbG9hZGVkQ2FsbGJhY2spe1xuXHRcdHRoaXMuc2hlZXQgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLnNoZWV0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBsb2FkZWRDYWxsYmFjaywgZmFsc2UpO1xuXHRcdHRoaXMuc2hlZXQuc3JjID0gc3JjO1xuXHR9XG59XG5cblxuY2xhc3MgU3ByaXRlIHtcblx0Ly8gc2xpY2UgYSBzcHJpdGUgZnJvbSBhIHNoZWV0XG5cdGNvbnN0cnVjdG9yKHNoZWV0LCBjdHgsIHN4LCBzeSwgc3csIHNoKXtcblx0XHR0aGlzLnNoZWV0ID0gc2hlZXQ7XG5cdFx0dGhpcy5zeCA9IHN4O1xuXHRcdHRoaXMuc3kgPSBzeTtcblx0XHR0aGlzLnN3ID0gc3c7XG5cdFx0dGhpcy5zaCA9IHNoO1xuXHRcdHRoaXMueCA9IDA7XG5cdFx0dGhpcy55ID0gMDtcblx0XHR0aGlzLmN0eCA9IGN0eDtcblx0fVxuXG5cdGRyYXcoKXtcblx0XHR0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5zaGVldCwgdGhpcy5zeCwgdGhpcy5zeSwgdGhpcy5zdywgdGhpcy5zaCwgXG5cdFx0XHRcdFx0ICB0aGlzLngsIHRoaXMueSwgdGhpcy5zdywgdGhpcy5zaCk7XG5cdH1cbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcIkxvYWRlclwiOiBMb2FkZXIsXG5cdFwiU3ByaXRlXCI6IFNwcml0ZVxufTtcbiJdfQ==
