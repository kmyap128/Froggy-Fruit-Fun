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
    "images/freddy.png",
    "images/fruit.png",
    "images/powerup.png",
    "images/bee.png"
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
let background, freddy, targetX, scoreLabel, gameMusic, collectedSound, buzzSound, powerupStart, powerupEnd, fruitInterval, timeSinceLastFruit, lastFruitCreationTime, powerupStartTime, powerupTimer, fruitCount;
let gameOverScene, gameOverSound;

let collectibles = [];
let score = 0;
let level = 0;
let paused = true;

// setup the game app
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
        let gameOverText = new PIXI.Text("Game Over!");
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
    targetX = freddy.x;
    window.addEventListener("keydown", moveFreddy);

    // initialize sounds
    collectedSound = new Howl({
        src: ['sounds/collect.mp3']
    })

    buzzSound = new Howl({
        src: ['sounds/buzz.mp3']
    })

    powerupStart = new Howl({
        src: ['sounds/start-powerup.mp3']
    })

    powerupEnd = new Howl({
        src: ['sounds/end-powerup.mp3']
    })

    gameOverSound = new Howl({
        src: ['sounds/game-over.mp3']
    })
    window.addEventListener("keydown", moveFreddy);
    app.ticker.add(gameLoop);
}

// start the game and initialize vars
function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    increaseScoreBy(0);
    freddy.x = 500;
    freddy.y = 515;
    lastFruitCreationTime = performance.now();
    fruitCount = 0;
    // background music initialized here so that the music restarts when the game restarts
    gameMusic = new Audio("sounds/background-music.mp3");
    gameMusic.loop = true;
    gameMusic.play();
    loadGame();
}

// increase the score
function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

// decrease the score
function decreaseScoreBy(value){
    score -= value;
    scoreLabel.text = `Score: ${score}`;
}

// takes user key input from arrow keys to change freddy's position
function moveFreddy(event) {
    if (gameScene.visible == true) {
        switch(event.keyCode) {
            case 37:
                if(freddy.x > 0){
                    targetX = Math.max(0, freddy.x - MOVE_SPEED);
                    break;
                }
            case 39:
                if(freddy.x < 1000){
                    targetX = Math.min(1000, freddy.x + MOVE_SPEED);
                    break;
                }
        }
    }
}

// smoothly updates freddy's position
function updateX() {
    if (freddy.x !== targetX) {
        let distance = targetX - freddy.x;
        let movement = Math.sign(distance) * Math.min(Math.abs(distance), MOVE_SPEED);
        freddy.x += movement;
    }
}

// load and start the gameplay
function loadGame() {
    paused = false;
}

// loops gameplay until the game ends
function gameLoop() {
    if(paused) {
        return;
    }

    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    updateX();

    fruitInterval = 2 - (level/10);

    // create new fruits/powerups/bees at interval
    let timeSinceLastFruit = (performance.now() - lastFruitCreationTime) / 1000;
    if (timeSinceLastFruit >= fruitInterval) { // Create fruit every 2 seconds
        if (fruitCount % 5 == 0 && fruitCount != 0) {
            createBee();
            lastFruitCreationTime = performance.now();
            fruitCount += 1;
        }
        else if(fruitCount == 12){
            createPowerup();
            lastFruitCreationTime = performance.now();
            fruitCount = 0;
        }
        else{
            createFruit();
            lastFruitCreationTime = performance.now(); // Update timestamp
            fruitCount += 1;
        }
    }

    // loop through fruits to check for interaction
    for(let c of collectibles) {
        if(c.isAlive){
            c.move()
            if(c.y <= freddy.y && c.y >= freddy.y - 20 )
                if(c.x <= freddy.x + 50 && c.x >= freddy.x - 50){
                    gameScene.removeChild(c);
                    if(c.type == 'fruit'){
                        c.isAlive = false;
                        collectedSound.play();
                        increaseScoreBy(1);
                        if(score % 10 == 0) {
                            level += 2;
                        }
                    }
                    else if(c.type == 'powerup'){
                        powerupStart.play();
                        powerupStartTime = performance.now();
                        c.activated = true;
                    }
                    else if(c.type == 'bee'){
                        end();
                    }
            }
            if(c.y == sceneHeight){
                c.isAlive = false;
                gameScene.removeChild(c);
                if(c.type == 'fruit'){
                    decreaseScoreBy(1);
                    if(score <= 0){
                        end();
                    }
                }
            }
            if(c.type == 'powerup') {
                if(c.activated == true && (performance.now() - powerupStartTime)/1000 >= 10){
                    powerupEnd.play();
                    c.isAlive = false;
                    c.activated = false;
                }
            }
        }
    }
    collectibles = collectibles.filter(c => c.isAlive);
}

function createFruit() {
    let fruit = new Fruit(); 
    fruit.x = Math.random() * (sceneWidth - 50) + 25;
    collectibles.push(fruit);
    gameScene.addChild(fruit);
}

function createPowerup(){
    let powerup = new PowerUp();
    powerup.x = Math.random() * (sceneWidth - 50) + 25;
    collectibles.push(powerup);
    gameScene.addChild(powerup);
}

function createBee(){
    let bee = new Bee();
    bee.x = Math.random() * (sceneWidth - 50) + 25;
    collectibles.push(bee);
    gameScene.addChild(bee);
    buzzSound.play();
}

function end() {
    paused = true;
    gameOverSound.play();

    collectibles.forEach(c => gameScene.removeChild(c));
    collectibles = [];

    gameMusic.pause();

    gameOverScene.visible = true;
    gameScene.visible = false;
}