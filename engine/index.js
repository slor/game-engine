// A toy game engine.

Game = {
    SECOND: 1000.0,
    TICK: 1000.0 / 60.0, // In ms
    DEBUG: true,
    KEY_MAP: {
        "8": "backspace",
        "9": "tab",
        "13": "enter",
        "16": "shift",
        "17": "ctrl",
        "18": "alt",
        "19": "pause_break",
        "20": "caps_lock",
        "27": "escape",
        "32": "space",
        "33": "page_up",
        "34": "page_down",
        "35": "end",
        "36": "home",
        "37": "left_arrow",
        "38": "up_arrow",
        "39": "right_arrow",
        "40": "down_arrow",
        "45": "insert",
        "46": "delete",
        "48": "0",
        "49": "1",
        "50": "2",
        "51": "3",
        "52": "4",
        "53": "5",
        "54": "6",
        "55": "7",
        "56": "8",
        "57": "9",
        "59": "semicolon",
        "61": "equal",
        "65": "a",
        "66": "b",
        "67": "c",
        "68": "d",
        "69": "e",
        "70": "f",
        "71": "g",
        "72": "h",
        "73": "i",
        "74": "j",
        "75": "k",
        "76": "l",
        "77": "m",
        "78": "n",
        "79": "o",
        "80": "p",
        "81": "q",
        "82": "r",
        "83": "s",
        "84": "t",
        "85": "u",
        "86": "v",
        "87": "w",
        "88": "x",
        "89": "y",
        "90": "z",
        "91": "left_window_key",
        "92": "right_window_key",
        "93": "select_key",
        "96": "numpad_0",
        "97": "numpad_1",
        "98": "numpad_2",
        "99": "numpad_3",
        "100": "numpad_4",
        "101": "numpad_5",
        "102": "numpad_6",
        "103": "numpad_7",
        "104": "numpad_8",
        "105": "numpad_9",
        "106": "multiply",
        "107": "add",
        "109": "subtract",
        "110": "decimal_point",
        "111": "divide",
        "112": "f1",
        "113": "f2",
        "114": "f3",
        "115": "f4",
        "116": "f5",
        "117": "f6",
        "118": "f7",
        "119": "f8",
        "120": "f9",
        "121": "f10",
        "122": "f11",
        "123": "f12",
        "144": "num_lock",
        "145": "scroll_lock",
        "173": "minus",
        "186": "semi_colon",
        "187": "equal_sign",
        "188": "comma",
        "189": "dash",
        "190": "period",
        "191": "forward_slash",
        "192": "grave_accent",
        "219": "open_bracket",
        "220": "back_slash",
        "221": "close_bracket",
        "222": "single_quote"
    },
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
    Game.keysPressed[Game.KEY_MAP[e.keyCode]] = true;
    e.preventDefault();
});

Game.document.addEventListener('keyup', e => {
    e = e || window.event;
    delete Game.keysPressed[Game.KEY_MAP[e.keyCode]];
    e.preventDefault();
});

Game.canvas.addEventListener('mousemove', e => {
    e = e || window.event;
    Game.mousePosX = e.clientX;
    Game.mousePosY = e.clientY;
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
