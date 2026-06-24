const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: { preload, create, update }
};

let player;
let cursors;
let bullets;
let enemies;
let lastFired = 0;

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet(
    "skelly",
    "YOUR_RAW_GITHUB_URL",
    {
      frameWidth: 64,   // adjust if needed
      frameHeight: 64
    }
  );

  // simple bullet (circle)
  this.load.image(
    "bullet",
    "https://labs.phaser.io/assets/particles/red.png"
  );
}

function create() {
  // PLAYER (use frame 0)
  player = this.physics.add.sprite(400, 300, "skelly", 0);
  player.setScale(1.5);
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();

  bullets = this.physics.add.group();
  enemies = this.physics.add.group();

  // spawn enemies
  this.time.addEvent({
    delay: 1000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  });

  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
  this.physics.add.overlap(player, enemies, playerHit, null, this);
}

function update(time) {
  player.setVelocity(0);

  if (cursors.left.isDown) player.setVelocityX(-200);
  if (cursors.right.isDown) player.setVelocityX(200);
  if (cursors.up.isDown) player.setVelocityY(-200);
  if (cursors.down.isDown) player.setVelocityY(200);

  // auto fire toward mouse
  if (time > lastFired) {
    shootBullet.call(this);
    lastFired = time + 250;
  }

  // enemies chase player
  enemies.children.iterate(enemy => {
    if (!enemy) return;
    this.physics.moveToObject(enemy, player, 50);
  });
}

function shootBullet() {
  const bullet = bullets.create(player.x, player.y, "bullet");

  const pointer = this.input.activePointer;

  this.physics.moveTo(bullet, pointer.x, pointer.y, 300);

  bullet.setScale(0.5);
  bullet.setCollideWorldBounds(true);
  bullet.body.onWorldBounds = true;

  bullet.body.world.on("worldbounds", body => {
    if (body.gameObject === bullet) bullet.destroy();
  });
}

function spawnEnemy() {
  const x = Phaser.Math.Between(0, 800);
  const y = Phaser.Math.Between(0, 600);

  // random frame from spritesheet
  const frame = Phaser.Math.Between(0, 10);

  const enemy = enemies.create(x, y, "skelly", frame);
  enemy.setTint(0xffaaaa);
}

function hitEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();
}

function playerHit(player, enemy) {
  console.log("ouch");
}
