// deno-lint-ignore-file no-window
import { Manager } from "./manager.mjs";

const manager = new Manager();

window.preload = () => {
  //Crawl assets
  for (const [key, value] of Object.entries(manager.assets)) {
    console.log(key, value);
    if (Array.isArray(value)) {
      for (const asset of value) {
        loadImage(asset, (img) => {
          if (!manager.gameObjects.assets[key]) {
            manager.gameObjects.assets[key] = [];
          }

          manager.gameObjects.assets[key].push(img);
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
  background("black");
  loadFont("/fonts/Figtree/static/Figtree-Bold.ttf", (font) => {
    textFont(font);
  });

  manager.init();
};

window.draw = () => {
  background("black");
  image(
    manager.gameObjects.assets.background,
    -width / 2,
    -height / 2,
    width,
    height,
    0,
    0,
    manager.gameObjects.assets.background.width,
    manager.gameObjects.assets.background.height,
    COVER
  );

  manager.update();
};

window.windowResized = () => {
  //Update canvas size
  resizeCanvas(innerWidth, innerHeight);
};
