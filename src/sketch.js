const assets = {
  background: "https://i.imgur.com/9m07MT8.jpeg",
  leaves: [
    "https://i.imgur.com/hnPorWf.png",
    "https://i.imgur.com/SxAwOSz.png",
    "https://i.imgur.com/g9KBUR1.png"
  ]
}

const gameObjects = {
  leaves: [],
  assets: {
    background: undefined,
    leaves: []
  }
}

function preload() {
  for (let asset of assets.leaves) {
    loadImage(asset, (img) => gameObjects.assets.leaves.push(img))
  }
  
  loadImage(assets.background, (img) => {gameObjects.assets.background = img})
}

function setup() {
  createCanvas(innerWidth, innerHeight, WEBGL);
  background("black");
  
  for (let i = 0; i < 500; i++) {
    gameObjects.leaves.push(new Leaf())
  }
}

function draw() {
  background("black");
  image(gameObjects.assets.background, -innerWidth / 2, -innerHeight / 2, innerWidth, innerHeight, 0, 0, gameObjects.assets.background.width, gameObjects.assets.background.height, COVER)
  
  for (let leaf of gameObjects.leaves) {
    leaf.update()
    leaf.render()
  }
}

class Leaf {
  constructor() {
    this.isDead = true
    setTimeout(() => this.spawn(), 4000 * random(4))
  }
  
  spawn() {
    this.isDead = false
    this.leafAsset = gameObjects.assets.leaves[floor(random(gameObjects.assets.leaves.length))]
    this.velocity = createVector(5, 5, 5)
    
    this.pos = createVector(random(-innerWidth/2, innerWidth/2), random(-innerHeight/2, innerHeight/2))
    this.impulse = createVector(random(-1,1), random(-1,1), 0)
    this.rotation = this.impulse.copy()
  }
  
  update() {
    if(this.isDead) return
    
    this.pos.z = 0
    
    //add impulse
    if(mouseIsPressed) {
      const mousePos = createVector(mouseX - innerWidth / 2, mouseY - innerHeight / 2)
      const distance = mousePos.dist(this.pos)
      
      if(distance < 400) {
        this.pos.z = 0
        
        const mouseDir = mousePos.sub(this.pos)
        mouseDir.z = 0
        mouseDir.rotate(90)
        
        this.impulse.add(mouseDir.setMag(-map(distance, 400, 0, 0, 0.3, true)))
        this.rotation.add(this.impulse)
       }
    }
    
    //add movement
    this.pos.add(this.impulse.cross(this.velocity))
    
    //friction
    this.impulse.x = lerp(this.impulse.x, 0, 0.05)
    this.impulse.y = lerp(this.impulse.y, 0, 0.05)
    
    //rotation
    this.rotation.z = lerp(this.rotation.z, 0, 0.03)
    this.rotation.x = lerp(this.rotation.x, 0, 0.03)
    this.rotation.y = lerp(this.rotation.y, 0, 0.03)
    
    if(this.pos.x < -innerWidth/2 - 20 || this.pos.y < -innerHeight/2 - 50 || this.pos.x > innerWidth + 20 || this.pos.y > innerHeight + 50) {
      if(!this.isDead) setTimeout(() => this.spawn(), 4000 * random(4))
      this.isDead = true
    }
  }
  
  render() {
    if(this.isDead) return
    
    push();
    noStroke()
    translate(this.pos.x, this.pos.y, 10)
    rotateZ(this.rotation.z);
    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    texture(this.leafAsset)
    plane(20, 50, 8);
    pop()
    //translate(0, 0)
   // image(this.leafAsset, this.pos.x, this.pos.y, 20, 50) 
  }
}

function windowResized() {
  resizeCanvas(innerWidth, innerHeight)
}