import './style.css';
import img0 from '/halloween/00_cherry.png?url';
import img1 from '/halloween/01_strawberry.png?url';
import img2 from '/halloween/02_grape.png?url';
import img3 from '/halloween/03_gyool.png?url';
import img4 from '/halloween/04_orange.png?url';
import img5 from '/halloween/05_apple.png?url';
import img6 from '/halloween/06_pear.png?url';
import img7 from '/halloween/07_peach.png?url';
import img8 from '/halloween/08_pineapple.png?url';
import img9 from '/halloween/09_melon.png?url';
import img10 from '/halloween/10_watermelon.png?url';
import { Bodies, Body, Engine, Events, Render, Runner, World } from 'matter-js';
import { FRUITS_HLW } from './fruits';

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = 600;
const WALL_WIDTH = 20;
const WALL_HEIGHT = 600;
const TOP_LINE_Y = 100;

const matterContainer = document.getElementById('matter-container');

const engine = Engine.create();
const render = Render.create({
  engine,
  element: matterContainer,
  options: {
    wireframes: false,
    background: '#f7f4c8',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

const world = engine.world;

const leftWall = Bodies.rectangle(WALL_WIDTH*0.5, WALL_HEIGHT*.5, WALL_WIDTH, WALL_HEIGHT, {
  isStatic: true,
  render: { fillStyle: '#e6b143' },
});

const rightWall = Bodies.rectangle(SCREEN_WIDTH-WALL_WIDTH*.5, WALL_HEIGHT*.5, WALL_WIDTH, WALL_HEIGHT, {
  isStatic: true,
  render: { fillStyle: '#e6b143' },
});

const ground = Bodies.rectangle(SCREEN_WIDTH*.5, WALL_HEIGHT - 30, SCREEN_WIDTH, 60, {
  isStatic: true,
  render: { fillStyle: '#e6b143' },
});

const topLine = Bodies.rectangle(SCREEN_WIDTH*0.5, TOP_LINE_Y, SCREEN_WIDTH, 2, {
  name: 'topLine',
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#e6b143" },
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
const UPPER_BOUND = 4;
function addFruit() {
  const index = Math.floor(Math.random() * UPPER_BOUND);
  const fruit = FRUITS_HLW[index];

  const body = Bodies.circle(SCREEN_WIDTH*0.5, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeyup = (event) => {
  switch (event.code) {
    case 'KeyA':
    case 'KeyD':
      clearInterval(interval);
      interval = null;
    break;
  }
}

window.ontouchstart = (event) => {
  if (disableAction) {
    return;
  }

  if ((event.touches[0].clientX - currentFruit.radius > 30) && (event.touches[0].clientX + currentFruit.radius < SCREEN_WIDTH - WALL_WIDTH)) {
    Body.setPosition(currentBody, { x: event.touches[0].clientX, y: currentBody.position.y });
  }
  if (event.touches[0].clientX - currentFruit.radius <= 30) {
    Body.setPosition(currentBody, { x: 30 + currentFruit.radius, y: currentBody.position.y });
  }
  
  if (event.touches[0].clientX + currentFruit.radius >= SCREEN_WIDTH) {
    Body.setPosition(currentBody, { x: SCREEN_WIDTH - currentFruit.radius, y: currentBody.position.y });
  }
    
}

window.ontouchmove = (event) => {
  if (disableAction) {
    return;
  }
  if ((event.touches[0].clientX - currentFruit.radius > 30) && (event.touches[0].clientX + currentFruit.radius < SCREEN_WIDTH - WALL_WIDTH)) {
    Body.setPosition(currentBody, { x: event.touches[0].clientX, y: currentBody.position.y });
  }
}

window.ontouchend = (event) => {
  if (disableAction) {
    return;
  }

  currentBody.isSleeping = false;
  disableAction = true;

  setTimeout(() => {
    addFruit();
    disableAction = false;
  }, 1000);

}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case 'KeyA':
      if (interval) {
        return;
      }
      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
        Body.setPosition(currentBody, { x: currentBody.position.x - 1, y: currentBody.position.y });
      }, 5);
    break;
    case 'KeyD':
      if (interval) {
        return;
      }
      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < SCREEN_WIDTH - WALL_WIDTH)
        Body.setPosition(currentBody, { x: currentBody.position.x + 1, y: currentBody.position.y });
      }, 5);
    break;
    case 'KeyS':
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);

      break;
  }
}

Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index == collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index == FRUITS_HLW.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS_HLW[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` },
          },  
          index: index + 1,
        }
      );
      
      World.add(world, newBody);
    }

    if (!disableAction && (collision.bodyA.name === 'topLine' || collision.bodyB.name === 'topLine')) {
      alert('Game Over');
    }
  });
});

addFruit();