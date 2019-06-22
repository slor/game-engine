// A toy game engine.

Game = {
    SECOND: 1000.0,
    TICK: 1000.0 / 60.0, // In ms
    DEBUG: true,
    keysPressed: {},
    mousePosX: 0,
    mousePosY: 0,
    mousePressed: false,
    document: document,
    canvas: document.getElementById("screen"),
    context: null,
    lastSec: 0, // Timestamp in ms when we last did 1000ms of frames
    lastTick: 0, // Timestamp in ms when we last did one TICK
    lastFps: 0, // Frames/seconds
    framesLastSec: 0, // Frames since last second
};

Game.document.addEventListener('keydown', e => {
    e = e || window.event;
    // Game.keysPressed[Game.KEY_MAP[e.keyCode]] = true;
    Game.keysPressed[e.key] = true;
    // console.debug(e);
    e.preventDefault();
});

Game.document.addEventListener('keyup', e => {
    e = e || window.event;
    delete Game.keysPressed[e.key];
    e.preventDefault();
});

Game.canvas.addEventListener('mousemove', e => {
    e = e || window.event;

    let rect = Game.canvas.getBoundingClientRect();

    Game.mousePosX = e.clientX - rect.left;
    Game.mousePosY = e.clientY - rect.top;
    e.preventDefault();
});

Game.canvas.addEventListener('mousedown', e => {
    e = e || window.event;
    Game.mousePressed = true;
});

Game.canvas.addEventListener('mouseup', e => {
    e = e || window.event;
    Game.mousePressed = false;
});

Game.context = Game.canvas.getContext("2d");

;(function () {
    function main(now){
        window.requestAnimationFrame(main)

        const timeSinceLastTick = now - Game.lastTick;

        if (timeSinceLastTick >= Game.TICK) {
            Game.lastTick++;
            Game.framesLastSec++;
            update();
            draw();
        }

        const deltaSecs = now / 1000.0;
        if (deltaSecs >= Game.lastSec + 1 ) {
            Game.lastSec = deltaSecs;
            Game.lastFps = Game.framesLastSec;
            Game.framesLastSec = 0;
        }
    }

    function update(){
        if(Game.DEBUG){
            updateDebugInfo();
        }
    }

    function updateDebugInfo(){}

    function clear() {
        Game.context.clearRect(0, 0,Game.canvas.width,Game.canvas.height);
    }

    function drawDebugInfo(){
        const ctx = Game.context;
        const can = Game.canvas;

        // Frame and timing info
        const DEBUG_SIZE = 16; //px
        ctx.fillStyle = 'black';
        ctx.font = `${DEBUG_SIZE}px sans-serif`;
        ctx.textAlign = 'right';

        ctx.fillText(`${Game.lastTick}`.split('.')[0], can.width, DEBUG_SIZE);
        ctx.fillText(`${Game.lastSec}`.split('.')[0], can.width, DEBUG_SIZE * 2);
        ctx.fillText(`${Game.lastFps}`.slice(0, 5), can.width, DEBUG_SIZE * 3);

        // Mouse
        ctx.fillText(`${Game.mousePosX}, ${Game.mousePosY}`, can.width, DEBUG_SIZE * 4);
        if (Game.mousePressed) {
            ctx.fillText('Click!', can.width, DEBUG_SIZE * 5);
        }

        // Keyboard
        ctx.fillText(`${Object.keys(Game.keysPressed)}`, can.width, DEBUG_SIZE * 6);
    }

    function draw() {
        clear();

        if(Game.DEBUG){
            drawDebugInfo();
        }
    }

    window.requestAnimationFrame(main)
})();
