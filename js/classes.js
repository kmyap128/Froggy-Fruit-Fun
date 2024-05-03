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

}


class Bee extends PIXI.Graphics {

}