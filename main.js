const engine = require('./engine');
const sprite = require('./sprite');

game = new engine.Game(window);
loader = new sprite.Loader('http://localhost:8000/resources/richtor.bmp', function (){
    const ctx = document.getElementById('screen').getContext('2d');
    game.sprites.push(new sprite.Sprite(loader.sheet, ctx, 0, 0, 28, 57));
}); 

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