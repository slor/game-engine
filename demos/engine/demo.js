import * as ge from '../../src/main.js';

window.GE_DEBUG = true;

let game = new ge.Game(window, 20, true);


const loader = new ge.Loader('http://localhost:8000/demos/engine/static/10340.png', function (){
    const idle = new ge.Animation(loader.sheet, game.context, 
        [[15, 11, 21, 44],
         [49, 11, 21, 44],
         [85, 11, 21, 44],
         [49, 11, 21, 44]], 'idle', true
    );

    const duck = new ge.Animation(loader.sheet, game.context,
        [[149, 11, 21, 44],
         [180, 11, 21, 44],
         [213, 11, 21, 44]], 'duck'
    );

    const stand = new ge.Animation(loader.sheet, game.context,
        [[180, 11, 21, 44],
         [149, 11, 21, 44]], 'stand'
    );

    const cueDuck = (entity) => {
            entity.state = 'DUCK';
            entity.nextAnimation.push(duck);
    };

    const cueIdle = (entity) => {
            entity.state = 'IDLE';
            entity.nextAnimation.push(idle);
    };

    const cueStand = (entity) => {
            entity.state = 'STAND';
            entity.nextAnimation.push(stand);
    };

    let richter = new ge.Entity(20, 20)
    .registerState('IDLE', function(entity, world){
        entity.animation = idle;
        if(world.keysPressed['ArrowDown'] === true){
            cueDuck(entity);
        }
    }, true)
    .registerState('DUCK', function(entity, world){
        entity.animation = duck;
        if(world.keysPressed['ArrowDown'] !== true){
            cueStand(entity);
        }
    })
    .registerState('STAND', function(entity, world){
        entity.animation = stand;
        if(this.animation.finished === true){
            cueIdle(entity);
        } else if (world.keysPressed['ArrowDown'] === true){
            cueDuck(entity);
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
