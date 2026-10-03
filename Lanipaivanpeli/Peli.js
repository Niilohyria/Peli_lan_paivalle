let player;
let cursors;
let shootKey;
let bullets;
let birds;
let fireGroup;
let nos;
let score = 0;
let scoreText;

let gameOver = false;
let lastShotTime = 0;
let shootCooldown = 3000;

const backgroundsound = new Audio('assets/themesong.mp3');
backgroundsound.volume = 0.5;

const cannon_shoot = new Audio('assets/cannon_fire.mp3');
cannon_shoot.volume = 0.6;

const blown_up = new Audio('assets/cannon_death.mp3');
const hot = new Audio('assets/fire.mp3');
hot.volume = 0.5;

const poultry = new Audio('assets/pekingduck.mp3');
poultry.volume = 0.6;
const sound = new Audio('assets/quack.mp3');
const hurts = new Audio('assets/burnt_to_a_crisp.mp3');
hurts.volume = 0.5;

const try_again = new Audio('assets/you_lost.mp3');
const steps = new Audio('assets/footsteps.mp3');
const ambience = new Audio('assets/ducks.mp3');

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/gamebackground.jpg');

  
  this.load.spritesheet('player', 'assets/player.png', {
    frameWidth: 103,
    frameHeight: 176,
    
});

    this.load.image('bullet', 'assets/cannonball.png');
this.load.image('duck', 'assets/duck.png');
this.load.image('duckdown', 'assets/duckdown.png');

this.load.image('duck2', 'assets/duck2.png');
this.load.image('duck2down', 'assets/duck2down.png');

    this.load.image('fire', 'assets/fire.png');
    this.load.image('no', 'assets/NO.png');
}

function create() {
     this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
	
            frameRate: 10,
		
            repeat: -1
        });
		

        this.anims.create({
            key: 'right',
		
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 4 }),
		
            frameRate: 10,

            repeat: -1
        });
this.anims.create({
    key: 'duck_fly',
    frames: [
        { key: 'duck' },
        { key: 'duckdown' }
    ],
    frameRate: 2,
    repeat: -1
});

this.anims.create({
    key: 'duck2_fly',
    frames: [
        { key: 'duck2' },
        { key: 'duck2down' }
    ],
    frameRate: 2,
    repeat: -1
});






    this.add.image(400, 300, 'background').setScale(3);

    cursors = this.input.keyboard.createCursorKeys();
    shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

player = this.physics.add.sprite(300, 500, 'player');
player.setCollideWorldBounds(true);
player.setOrigin(0.5, 0.5);


player.body.setSize(45, 165);   
player.body.setOffset(20, 10); 

    bullets = this.physics.add.group();
    birds = this.physics.add.group();
    fireGroup = this.physics.add.group();
   this.nos = this.physics.add.staticGroup();
    this.nos.create(700, 515, 'no').setScale(0.6).refreshBody();
    this.nos.create(100, 515, 'no').setScale(0.6).refreshBody();
    scoreText = this.add.text(10, 10, "Score: 0", {
        fontSize: '24px',
        fill: '#fff'
    });

    this.physics.add.overlap(bullets, birds, hitBird, null, this);
    this.physics.add.overlap(player, fireGroup, hitPlayer, null, this);
    this.physics.add.overlap(player, this.nos, hitPlayerno, null, this);

    this.time.addEvent({
        delay: 1300,
        loop: true,
        callback: spawnBird,
        callbackScope: this
    });
}

function update() {
      if (gameOver) {
        player.setVelocityX(0);
        player.anims.stop();
        return; 
    }
if (cursors.left.isDown) {
    steps.play();
    player.setVelocityX(-220);
  
     player.anims.play('left', true);
}
else if (cursors.right.isDown) {
    steps.play();
    player.setVelocityX(220);
 
     player.anims.play('right', true);
}
  else {
    player.setVelocityX(0);
    player.anims.stop();
    player.setFrame(2);
    steps.pause();
}

    if (Phaser.Input.Keyboard.JustDown(shootKey)) {
        shootBullet.call(this);
    }
}

function shootBullet() {
    const now = this.time.now;
    if (now - lastShotTime < shootCooldown) return;

    cannon_shoot.play();
    lastShotTime = now;

    let bullet = bullets.create(player.x -10, player.y - 50, 'bullet');
    bullet.setVelocityY(-400);
    bullet.setScale(0.2);
    bullet.body.setSize(150, 130); 
    bullet.body.setOffset(80, 50);

    this.time.delayedCall(3000, () => {
        if (bullet.active) bullet.destroy();
    });
}

function spawnBird() {
    let fromLeft = Phaser.Math.Between(0, 1);
    let y = Phaser.Math.Between(120, 200);

    if (!gameOver) {
        backgroundsound.play();
        ambience.play();
        sound.play();
    } else {
        backgroundsound.pause();
        ambience.pause();
    }

let bird = birds.create(fromLeft ? -50 : 850, y, birds);
bird.setScale(0.2);
bird.anims.play(fromLeft ? 'duck_fly' : 'duck2_fly');

bird.body.setSize(421, 365);
bird.body.setOffset(170, 10);


if (fromLeft) {
    bird.anims.play('duck_fly', true);
} else {
    bird.anims.play('duck2_fly', true);
}


    let speed = 600;
    bird.setVelocityX(fromLeft ? speed : -speed);

    this.time.delayedCall(
        Phaser.Math.Between(250, 1150),
        () => dropFire.call(this, bird)
    );
}

function dropFire(bird) {
    if (gameOver || !bird.active) return;

    let fire = fireGroup.create(bird.x, bird.y, 'fire');
    hot.play();

    fire.setScale(0.3);
    fire.body.setSize(250, 470); 
    fire.body.setOffset(130, 20);
    fire.setVelocityY(80);

    this.time.delayedCall(15500, () => {
        if (fire.active) fire.destroy();
    });
}

function hitBird(bullet, bird) {
    bullet.destroy();
    bird.destroy();
    blown_up.play();
    poultry.play();
    score++;
    scoreText.setText("Score: " + score);
}

function hitPlayer(player, fire) {

    steps.pause();
    hurts.play();
    try_again.play();

    if (gameOver) return;
    gameOver = true;

    fire.destroy();
    this.physics.pause();

    player.setTint(0xff0000);

  this.add.text(20, 250, "MY FRIEND, YOUR SKILLS ARE TERRIBLE", {
        fontSize: '37px',
        fill: '#00f7ff'
    });
}
function hitPlayerno(player, nos) {


    steps.pause();
    hurts.play();
    try_again.play();

    if (gameOver) return;
    gameOver = true;

    this.physics.pause();

    player.setTint(0xff0000);

    this.add.text(20, 250, "MY FRIEND, YOUR SKILLS ARE TERRIBLE", {
        fontSize: '37px',
        fill: '#00f7ff'
    });
}