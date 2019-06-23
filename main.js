const g = require('./engine');

game = new g.Game(window);

            
function loop(now){
    window.requestAnimationFrame(loop);

    game.frame(now);
}

window.addEventListener('keydown', function(e) {
    e = e || window.event;
    game.keyDown(e);
    e.preventDefault();
});
window.addEventListener('keyup', function(e) {
    e = e || window.event;
    game.keyUp(e);
    e.preventDefault();
});
window.addEventListener('mousemove', function(e) {
    e = e || window.event;
    game.mouseMove(e);
    e.preventDefault();
});
window.addEventListener('mousedown', function(e) {
    e = e || window.event;
    game.mouseDown(e);
    e.preventDefault();
});
window.addEventListener('mouseup', function(e) {
    e = e || window.event;
    game.mouseUp(e);
    e.preventDefault();
});

window.requestAnimationFrame(loop);