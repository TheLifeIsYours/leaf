// deno-lint-ignore-file no-window
import { Manager } from "./manager.mjs";

window.manager = new Manager();

window.preload = () => {
  //Crawl assets
  for (const [key, value] of Object.entries(window.manager.assets)) {
    console.log(key, value);
    if (Array.isArray(value)) {
      for (const asset of value) {
        loadImage(asset, (img) => {
          if (!window.manager.gameObjects.assets[key]) {
            window.manager.gameObjects.assets[key] = [];
          }

          window.manager.gameObjects.assets[key].push(img);
        });
      }
    } else {
      loadImage(value, (img) => {
        window.manager.gameObjects.assets[key] = img;
      });
    }
  }
};

window.setup = () => {
  //console.log("Setup");
  createCanvas(width, height, WEBGL);
  background("black");
  loadFont("/fonts/Figtree/static/Figtree-Bold.ttf", (font) => {
    textFont(font);
  });

  window.manager.init();
};

window.draw = () => {
  background("black");
  image(
    window.manager.gameObjects.assets.background,
    -width / 2,
    -height / 2,
    width,
    height,
    0,
    0,
    window.manager.gameObjects.assets.background.width,
    window.manager.gameObjects.assets.background.height,
    COVER
  );

  window.manager.update();
};

window.windowResized = () => {
  //Update canvas size
  resizeCanvas(width, height);
};
