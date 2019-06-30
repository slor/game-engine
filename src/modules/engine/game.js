class Game {
    constructor(window, ticksPerSecond) {
        // Time inits.
        this.TICKS_PER_SECOND = ticksPerSecond;
        this.SECOND_MS = 1000.0;
        
        this.TICK_MS = Math.floor(this.SECOND_MS / this.TICKS_PER_SECOND);
        
        
        // Context and cavas inits.
        const canvas = window.document.getElementById("screen");
        this.context = canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.SCREEN_WIDTH = canvas.width;
        this.SCREEN_HEIGHT = canvas.height;
        
        // Game state inits.
        this.entities = [];
        this.keysPressed = {};
        this.nowMs;
        this.frameSizeMs;
        this.frameSumMs = 0;
        this.frameCount = 0;
        this.frameSizeMean = 0;
        
        this.lastTickAtMs = 0;
        this.tickSumMs = 0;
        this.tickCount = 0;
        this.tickSizeMean = 0;

        const debugCanvas = window.document.getElementById("debug");
        this.debugState = {
            font: '12px courier',
            fontFillStyle: 'black',
            textAlign:'right',
            rowHeight: 16,
            context: debugCanvas.getContext('2d'),  
            SCREEN_WIDTH: debugCanvas.width,
            SCREEN_HEIGHT: debugCanvas.height,
            frameSizeBuckets: {},
            frameSizeBucketNames: [],
            tickSizeBuckets: {},
            tickSizeBucketNames: []
        }
        this.debugState.context.imageSmoothingEnabled = false;
    }

    keyDown(e){
        this.keysPressed[e.key] = true;
    }

    keyUp(e){
        delete this.keysPressed[e.key];
    }    
    
    frame(now){
        this.frameSizeMs = Math.floor(now) - this.nowMs || 0;
        this.nowMs = Math.floor(now);
        this.frameCount++;
        this.frameSumMs += this.frameSizeMs;

        // Capture the distribution of frame sizes in ms.
        if(this.debugState.frameSizeBuckets[this.frameSizeMs]){
            this.debugState.frameSizeBuckets[this.frameSizeMs] += 1;
        } else {
            this.debugState.frameSizeBuckets[this.frameSizeMs] = 1;
            this.debugState.frameSizeBucketNames.push(this.frameSizeMs);
        }   

        this.frameSizeMean = Math.floor(this.frameSumMs / this.frameCount);
        let delta = this.nowMs - this.lastTickAtMs;
    
        if(window.GE_DEBUG){
            this.drawDebugInfo();
        }

        if(delta >= this.TICK_MS){
            this.tickSizeMs = Math.floor(now) - this.lastTickAtMs;
            this.lastTickAtMs = this.nowMs;
            this.tickCount++;
            this.tickSumMs += this.tickSizeMs;
            this.tickSizeMean =  Math.floor(this.tickSumMs / this.tickCount);

            // Capture the distribution of tick sizes in ms.
            if(this.debugState.tickSizeBuckets[this.tickSizeMs]){
                this.debugState.tickSizeBuckets[this.tickSizeMs] += 1;
            } else {
                this.debugState.tickSizeBuckets[this.tickSizeMs] = 1;
                this.debugState.tickSizeBucketNames.push(this.tickSizeMs);
            }

            this.update();    
            this.draw();
        }
    }

    update(){
        const world = {
            'time': this.nowMs,
            'keysPressed': this.keysPressed
        }
        
        this.entities.forEach(entity => {
            entity.update(world);
        });
    }

    clear(){
        this.context.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
    }

    // Draw a single row of debug info in
    // the next available row.
    drawDebugRow(msg, row){
        this.debugState.context.fillText(msg, this.debugState.SCREEN_WIDTH, this.debugState.rowHeight * row);
    }

    drawDebugInfo(){
        this.debugState.context.clearRect(0, 0, this.debugState.SCREEN_WIDTH, this.debugState.SCREEN_HEIGHT);
        this.debugState.context.fillStyle = this.debugState.fillStyle;
        this.debugState.context.font = this.debugState.font;
        this.debugState.context.textAlign = this.debugState.textAlign;
        
        let row = 1;
        this.drawDebugRow(`Target: ${this.TICKS_PER_SECOND} ticks per second`, row++);
        this.drawDebugRow('', row++);
        this.drawDebugRow(`Time: ${this.nowMs}`, row++);
        this.drawDebugRow(`Frames: ${this.frameCount}`, row++);
        this.drawDebugRow(`Frame length: ${this.frameSizeMs}ms`, row++);
        this.drawDebugRow(`Avg. frame length: ${this.frameSizeMean}ms`, row++);

        this.drawDebugRow('', row++);
        this.drawDebugRow('Frame length distribution', row++);
        this.drawDebugRow('-------------------------', row++);
        this.debugState.frameSizeBucketNames.sort().forEach((name) => {
            const count = this.debugState.frameSizeBuckets[name];

            this.drawDebugRow(`${name}ms...${count}`, row++);
        });

        this.drawDebugRow(``, row++);
        this.drawDebugRow(`Ticks: ${this.tickCount}`, row++);
        this.drawDebugRow(`Tick length: ${this.tickSizeMs}ms`, row++);
        this.drawDebugRow(`Avg. tick length: ${this.tickSizeMean}ms`, row++);

        this.drawDebugRow('', row++);
        this.drawDebugRow('Tick length distribution', row++);
        this.drawDebugRow('------------------------', row++);
        this.debugState.tickSizeBucketNames.sort().forEach((name) => {
            const count = this.debugState.tickSizeBuckets[name];

            this.drawDebugRow(`${name}ms...${count}`, row++);
        });

        this.drawDebugRow('', row++);
    }

    draw() {
        this.clear();

        this.entities.forEach((entity) => {
            entity.draw(this.context);
        });
    }
}


export { Game };