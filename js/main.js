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
let gameScene;
let gameState;
let startScene;
let instructions;
let background, freddy, scoreLabel, collectedSound, fruitInterval, timeSinceLastFruit, lastFruitCreationTime ;
let gameOverScene;

let fruits = [];
let powerups = [];
let bees = [];
let score = 0;
let level = 0;
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
        // Start Scene
        let buttonStyle = new PIXI.TextStyle({
            fill: 0xFF0000,
            fontSize: 48,
            fontFamily: "Verdana"
        })

        let startButton = new PIXI.Text("Start");
        startButton.style = buttonStyle;
        startButton.x = 800;
        startButton.y = sceneHeight - 100;
        startButton.interactive = true;
        startButton.buttonMode = true;
        startButton.on("pointerup", startGame);
        startButton.on("pointerover", e => e.target.alpha = 0.5);
        startButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
        startScene.addChild(startButton);

        // Game Scene
        let textStyle = new PIXI.TextStyle({
            fill: 0x000000,
            fontSize: 24,
            fontFamily: "Verdana",
        })
        scoreLabel = new PIXI.Text();
        scoreLabel.style = textStyle;
        scoreLabel.x = 5;
        scoreLabel.y = 5;
        gameScene.addChild(scoreLabel);
        increaseScoreBy(0);

        // Game Over Scene
        let gameOverText = new PIXI.Text("Game Over! The Blueberr-bees stole your fruits!");
        textStyle = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 64,
            fontFamily: "Verdana",
        })
        gameOverText.style = textStyle;
        gameOverText.x = 100;
        gameOverText.y = sceneHeight/2 - 160;
        gameOverScene.addChild(gameOverText);

        let playAgainButton = new PIXI.Text("Play Again");
        playAgainButton.style = buttonStyle;
        playAgainButton.x = 150;
        playAgainButton.y = sceneHeight - 100;
        playAgainButton.interactive = true;
        playAgainButton.buttonMode = true;
        playAgainButton.on("pointerup",startGame); // startGame is a function reference
        playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
        playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
        gameOverScene.addChild(playAgainButton);
    }

    instructions = new PIXI.Sprite(
        PIXI.Texture.from("images/instructions.png")
    );
    // Set the background to cover the entire scene
    instructions.width = sceneWidth;
    instructions.height = sceneHeight;
    // Add the background as the first child of the stage
    startScene.addChildAt(instructions, 0); // Add at index 0 to make it the background
    instructions.visible = true;

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
    collectedSound = new Howl({
        src: ['sounds/collect.mp3']
    })
    window.addEventListener("keydown", moveFreddy);
    app.ticker.add(gameLoop);
}

function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    increaseScoreBy(0);
    freddy.x = 500;
    freddy.y = 515;
    lastFruitCreationTime = performance.now();
    loadGame();
}


function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseScoreBy(value){
    score -= value;
    scoreLabel.text = `Score: ${score}`;
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

function loadGame() {
    paused = false;
}

function gameLoop() {
    if(paused) {
        return;
    }

    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    fruitInterval = 2 - (level/10);

    let timeSinceLastFruit = (performance.now() - lastFruitCreationTime) / 1000;
    if (timeSinceLastFruit >= fruitInterval) { // Create fruit every 2 seconds
        createFruit();
        lastFruitCreationTime = performance.now(); // Update timestamp
    }

    for(let f of fruits) {
        if(f.isAlive){
            f.move()
        if(f.y <= freddy.y && f.y >= freddy.y - 20 )
            if(f.x <= freddy.x + 50 && f.x >= freddy.x - 50){
                gameScene.removeChild(f);
                f.isAlive = false;
                collectedSound.play();
                increaseScoreBy(1);
                if(score % 10 == 0) {
                    level += 1;
                }
        }
        if(f.y == sceneHeight){
            f.isAlive = false;
            gameScene.removeChild(f);
            decreaseScoreBy(1);
            if(score == 0){
                end();
            }
        }
        }
    }
}

function createFruit() {
    let fruit = new Fruit() 
    fruit.x = Math.random() * (sceneWidth - 50) + 25;
    fruits.push(fruit);
    gameScene.addChild(fruit);
}

function end() {
    paused = true;

    fruits.forEach(f => gameScene.removeChild(f));
    fruits = [];

    gameOverScene.visible = true;
    gameScene.visible = false;
}