import { Game } from '../../src/engine/index.js';
import { Loader } from '../../src/sprite/index.js';
import { Entity, Animation } from '../../src/entity/index.js';


let game = new Game(window);

const loader = new Loader('http://localhost:8000/resources/10340.png', function (){
    const idle = new Animation(loader.sheet, game.context, 
        [[15, 11, 21, 44],
         [49, 11, 21, 44],
         [85, 11, 21, 44]], 10, true
    );

    const duck = new Animation(loader.sheet, game.context,
        [[149, 11, 21, 44],
         [180, 11, 21, 44],
         [213, 11, 21, 44]], 5
    );

    let richter = new Entity(20, 20)
    .registerState('IDLE', function(entity, world){
        entity.animation = idle;
        if(world.keysPressed['ArrowDown'] === true){
            entity.state = 'DUCK';
            entity.nextAnimation.push(duck);
        }
    }, true)
    .registerState('DUCK', function(entity, world){
        entity.animation = duck;
        if(world.keysPressed['ArrowDown'] !== true){
            entity.state = 'IDLE';
            entity.nextAnimation.push(idle);
        }
    });

    game.entities.push(richter);

}); 

function loop(now){
    window.requestAnimationFrame(loop);

    game.frame(now);
}

window.addEventListener('keydown', function(e) {
    e = e || window.event;
    game.keyDown(e);
});
window.addEventListener('keyup', function(e) {
    e = e || window.event;
    game.keyUp(e);
});

window.requestAnimationFrame(loop);
