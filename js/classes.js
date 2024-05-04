class Freddy extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/freddy.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 275;
    }
}


class Fruit extends PIXI.Graphics {
    constructor(x=0, y=0){
        super();
        this.beginFill(0x000000);
        this.drawCircle(0, 0, 10);
        this.endFill();
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.isAlive = true;
    }

    move() {
        this.y += this.speed;
    }
}

class PowerUp extends Fruit {
    constructor(x=0, y=0) {
        super();
        this.beginFill(0xFF0000);
        this.drawCircle(0, 0, 10);
        this.endFill();
        this.powerups = ['magnet', 'immune', 'speed']; // Assuming these are classes or values defined elsewhere
        this.power = this.selectRandomPower();
    }
    
    selectRandomPower() {
        const randomIndex = Math.floor(Math.random() * this.powerups.length);
        return this.powerups[randomIndex];
    } 
}


// class Bee extends PIXI.Graphics {

// }