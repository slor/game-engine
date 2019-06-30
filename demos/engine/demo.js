import * as ge from '../../src/main.js';

window.GE_DEBUG = true;

let game = new ge.Game(window, 10, true);


const loader = new ge.Loader('http://localhost:8000/demos/engine/static/10340.png', function (){
    const idle = new ge.Animation(loader.sheet, game.context, 
        [[15, 10, 21, 45],
         [49, 10, 21, 45],
         [85, 10, 21, 45],
         [49, 10, 21, 45]], 'idle', true
    );

    const duck = new ge.Animation(loader.sheet, game.context,
        [[149, 10, 22, 45],
         [180, 10, 23, 45],
         [213, 10, 23, 45]], 'duck'
    );

    const stand = new ge.Animation(loader.sheet, game.context,
        [[180, 10, 23, 45],
         [149, 10, 22, 45]], 'stand'
    );

    const walk = new ge.Animation(loader.sheet, game.context,
        [[272, 10, 26, 45],
         [307, 10, 24, 45],
         [340, 10, 16, 45],
         [368, 10, 18, 45],
         [395, 10, 26, 45],
         [430, 10, 19, 45],
         [459, 10, 16, 45],
         [485, 10, 20, 45]
         ], 'walk', true
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

    const cueWalk = (entity) => {
        entity.state = 'WALK';
        entity.nextAnimation.push(walk);
    }

    let richter = new ge.Entity(20, 20)
    .registerState('IDLE', function(entity, world){
        if(world.keysPressed['ArrowDown'] === true){
            cueDuck(entity);
        } else if (world.keysPressed['ArrowRight'] === true){
            cueWalk(entity);
        }
    }, true)
    .registerState('DUCK', function(entity, world){
        if(world.keysPressed['ArrowDown'] !== true){
            cueStand(entity);
        }
    })
    .registerState('STAND', function(entity, world){
        if(this.animation.finished === true){
            cueIdle(entity);
        } else if (world.keysPressed['ArrowDown'] === true){
            cueDuck(entity);
        }
    })
    .registerState('WALK', function(entity, world){
        if (world.keysPressed['ArrowRight'] !== true){
            cueIdle(entity);
        }
    }, true);

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
