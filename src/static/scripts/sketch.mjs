// deno-lint-ignore-file no-window
import { Manager } from "./manager.mjs";

const manager = new Manager();
let layer;

window.preload = () => {
  //Crawl assets
  for (const [key, value] of Object.entries(manager.assets)) {
    if (Array.isArray(value)) {
      for (const asset of value) {
        loadImage(asset, (img) => {
          if (!manager.gameObjects.assets[key]) {
            manager.gameObjects.assets[key] = [];
          }

          manager.gameObjects.assets[key].push(img);
        });
      }
    } else if (typeof value === "object") {
      for (const [subKey, subValue] of Object.entries(value)) {
        loadImage(subValue, (img) => {
          if (!manager.gameObjects.assets[key]) {
            manager.gameObjects.assets[key] = {};
          }

          manager.gameObjects.assets[key][subKey] = img;
        });
      }
    } else {
      loadImage(value, (img) => {
        manager.gameObjects.assets[key] = img;
      });
    }
  }
};

window.setup = () => {
  //console.log("Setup");
  createCanvas(innerWidth, innerHeight, WEBGL);
  layer = createFramebuffer();
  background("black");
  loadFont("/fonts/Figtree/static/Figtree-Bold.ttf", (font) => {
    textFont(font);
  });

  manager.init();
};

window.draw = () => {
  noStroke();
  manager.update();

  layer.begin();
  background("black");
  manager.draw();
  layer.end();

  texture(layer);
  plane(width, height);
};

window.keyPressed = () => {
  if (keyCode === 32) {
    manager.player.lockView();
  }
};

window.windowResized = () => {
  //Update canvas size
  resizeCanvas(innerWidth, innerHeight);
  manager.background.windowResized();
};
