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