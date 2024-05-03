"use strict";
const app = new PIXI.Application({
    width: 1000,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const MOVE_SPEED = 20;

app.loader
  .add([
    "images/background.png",
    "images/freddy.png"
    ]);
app.loader.onProgress.add(e => console.log(`progress=${e.progress}`));
app.loader.onComplete.add(setup);
app.loader.load();



// game variables
let stage;
let background;
let gameScene;
let gameState;
let startScene;
let freddy,scoreLabel;
let gameOverScene;

let fruits = [];
let powerups = [];
let bees = [];
let score = 0;
let paused = true;


function setup() {
    stage = app.stage;

    // start scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // game scene
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // game over scene
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    createButtonsAndLabels();

    function createButtonsAndLabels() {
        let buttonStyle = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 48,
            fontFamily: "Verdana"
        })
        let instructionLabel1 = new PIXI.Text("1. Use Left and Right Arrow Keys to move left and right.");
        instructionLabel1.style = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 20,
            fontFamily: "Verdana",
            stroke: 0xFF0000,
        })
        startScene.addChild(instructionLabel1);

        let instructionLabel2 = new PIXI.Text("2. Collect as many fruits as you can while avoiding the bees.")
        instructionLabel2.style = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 20,
            fontFamily: "Verdana",
            stroke: 0xFF0000,
        })
        instructionLabel2.y = 20;
        startScene.addChild(instructionLabel2);

        let instructionLabel3 = new PIXI.Text("3. Collect glowing fruit for powerups.")
        instructionLabel3.style = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 20,
            fontFamily: "Verdana",
            stroke: 0xFF0000,
        })
        instructionLabel3.y = 40;
        startScene.addChild(instructionLabel3);

        let startButton = new PIXI.Text("Start");
        startButton.style = buttonStyle;
        startButton.x = 80;
        startButton.y = sceneHeight - 100;
        startButton.interactive = true;
        startButton.buttonMode = true;
        startButton.on("pointerup", startGame);
        startButton.on("pointerover", e => e.target.alpha = 0.7);
        startButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
        startScene.addChild(startButton);
    }


    background = new PIXI.Sprite(
        PIXI.Texture.from("images/background.png")
    );
    // Set the background to cover the entire scene
    background.width = sceneWidth;
    background.height = sceneHeight;
    // Add the background as the first child of the stage
    gameScene.addChildAt(background, 0); // Add at index 0 to make it the background
    background.visible = true;

    // Create the Freddy sprite and make it visible
    freddy = new Freddy(); // Assuming you have a class or function to create Freddy
    freddy.visible = true; // Make sure Freddy is visible
    gameScene.addChild(freddy);
    // Position Freddy
    freddy.x = 500;
    freddy.y = 515;
    window.addEventListener("keydown", moveFreddy);
}

function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
}


function moveFreddy(event) {
    if (gameScene.visible == true) {
        switch(event.keyCode) {
            case 37:
                if(freddy.x > 0){
                    freddy.x -= MOVE_SPEED;
                    break;
                }
            case 39:
                if(freddy.x < 1000){
                    freddy.x += MOVE_SPEED;
                    break;
                }
        }
    }
}