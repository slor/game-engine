console.debug("Loaded index.js");

function draw() {
    const canvas = document.getElementById("screen");
    let ctx = canvas.getContext("2d");

    // rects
    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.fillRect(30, 30, 20, 20);

    ctx.fillStyle = 'rgb(0,255,0)';
    ctx.fillRect(60, 30, 20, 20);

    ctx.fillStyle = 'rgb(0,0,255)';
    ctx.fillRect(90, 30, 20, 20);

    ctx.strokeStyle = 'yellow';
    ctx.strokeRect(30, 60, 20, 20);

    ctx.strokeStyle = 'pink';
    ctx.strokeRect(60, 60, 20, 20);

    ctx.strokeStyle = 'cyan';
    ctx.strokeRect(90, 60, 20, 20);

    // paths
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(200, 100);
    ctx.lineTo(100, 200);
    ctx.lineTo(100, 100);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(100, 100, 20, 0, Math.PI * 2, false);
    ctx.stroke();

    // Path2D
    let circle = new Path2D();
    circle.arc(200, 200, 45, 0, Math.PI / 2);
    ctx.stroke(circle);

    let svg = new Path2D('M10 15 h 80 v 80 h -80 Z');
    ctx.stroke(svg);


}