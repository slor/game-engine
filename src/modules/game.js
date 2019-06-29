class Game {
    constructor(window) {
        // Time inits.
        this.SECOND_MS = 1000.0;
        this.TICK_MS = Math.floor(this.SECOND_MS / 60.0)
        
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
        this.nowSec;
        this.tickSizeMs;
        this.tickSumMs = 0;
        this.tickCount = 0;

        this.DEBUG = true;
        this.debugState = {
            font: '16px courier',
            fontFillStyle: 'black',
            textAlign:'right',
            rowHeight: 16,
            tickSizeBuckets: {},
            tickSizeBucketNames: []
        }
    }

    keyDown(e){
        this.keysPressed[e.key] = true;
    }

    keyUp(e){
        delete this.keysPressed[e.key];
    }    
    
    frame(now){
        this.tickSizeMs = Math.floor(now) - this.nowMs || 0;
        this.nowMs = Math.floor(now);
        this.nowSec = Math.floor(this.nowMs / this.SECOND_MS);
        this.tickCount++;
        this.tickSumMs += this.tickSizeMs;

        this.update();
        this.draw();
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
        this.context.fillText(msg, this.SCREEN_WIDTH, this.debugState.rowHeight * row);
    }

    drawDebugInfo(){
        this.context.fillStyle = this.debugState.fillStyle;
        this.context.font = this.debugState.font;
        this.context.textAlign = this.debugState.textAlign;
        
        // Capture the distribution of tick sizes in ms.
        if(this.debugState.tickSizeBuckets[this.tickSizeMs]){
            this.debugState.tickSizeBuckets[this.tickSizeMs] += 1;
        } else {
            this.debugState.tickSizeBuckets[this.tickSizeMs] = 1;
            this.debugState.tickSizeBucketNames.push(this.tickSizeMs);
        }

        let row = 1;
        let mean = Math.floor(this.tickSumMs / this.tickCount);
        
        this.drawDebugRow(`Ticks: ${this.nowMs}`, row++);
        this.drawDebugRow(`Tick length: ${this.tickSizeMs}ms`, row++);
        this.drawDebugRow('', row++);
        this.drawDebugRow('Tick length distribution', row++);
        this.drawDebugRow('------------------------', row++);
        this.debugState.tickSizeBucketNames.sort().forEach((name) => {
            const count = this.debugState.tickSizeBuckets[name];

            this.drawDebugRow(`${name}ms...${count}`, row++);
        });
        this.drawDebugRow('', row++);
        this.drawDebugRow(`Tick stats`, row++);
        this.drawDebugRow(`----------`, row++);
        this.drawDebugRow(`Count: ${this.tickCount}`, row++);
        this.drawDebugRow(`Sum: ${this.tickSumMs}ms`, row++);
        this.drawDebugRow(`Mean: ${mean}ms`, row++);
        
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


export { Game };