import * as ge from '../../src/main.js';

window.GE_DEBUG = true;

let game = new ge.Game(window, 12, true);


const loader = new ge.Loader('http://localhost:8000/demos/engine/static/10340.png', function (){
    const idle = new ge.Animation(loader.sheet, game.context, 
        [[15, 11, 21, 44]], 'idle', true
    );

    const duck = new ge.Animation(loader.sheet, game.context,
        [[149, 18, 21, 36],
         [180, 25, 22, 29],
         [213, 27, 22, 27]], 'duck'
    );

    const stand = new ge.Animation(loader.sheet, game.context,
        [[180, 25, 22, 29],
         [149, 18, 21, 36]], 'stand'
    );

    const attack = new ge.Animation(loader.sheet, game.context,
        [[8, 181, 31, 42],
         [50, 181, 42, 43],
         [103, 181, 44, 42],
         [160, 180, 39, 43],
         [216, 184, 39, 39],
         [268, 184, 65, 39],
         [349, 184, 33, 39]], 'attack'
    );

    const walk = new ge.Animation(loader.sheet, game.context,
        [[180, 25, 22, 29],
         [149, 18, 21, 36],
         [272, 12, 25, 42],
         [308, 11, 22, 43],
         [340, 10, 15, 44],
         [368, 11, 17, 43],
         [395, 12, 25, 42],
         [430, 11, 18, 43],
         [459, 10, 15, 44],
         [485, 11, 19, 43]], 'walk', true
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

    const cueAttack = (entity) => {
        entity.state = 'ATTACK';
        entity.nextAnimation.push(attack);
    }

    let richter = new ge.Entity(20, 20)
    .registerState('IDLE', function(entity, world){
        if(world.keysPressed['ArrowDown'] === true){
            cueDuck(entity);
        } else if (world.keysPressed['ArrowRight'] === true){
            cueWalk(entity);
        } else if (world.keysPressed[' '] === true) {
            cueAttack(entity);
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
    }, true)
    .registerState('ATTACK', function(entity, world){
        if(this.animation.finished === true){
            cueIdle(entity);
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
