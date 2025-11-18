import Phaser from 'phaser';
import { GAME_CONFIG, FAUCET_URL, COLORS } from '../config.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });

    // Game state variables
    this.gameStarted = false;
    this.gameOver = false;
    this.score = 0;
    this.postingScore = false;
    this.isMuted = false;
  }

  preload() {
    // Load game assets
    this.load.spritesheet('doggie', 'assets/doggie.png', {
      frameWidth: 24,
      frameHeight: 24
    });
    this.load.spritesheet('clouds', 'assets/clouds.png', {
      frameWidth: 128,
      frameHeight: 64
    });
    this.load.image('tower', 'assets/tower.png');
    this.load.image('fence', 'assets/fence.png');

    // Load audio
    this.load.audio('flap', 'assets/flap.wav');
    this.load.audio('score', 'assets/score.wav');
    this.load.audio('hurt', 'assets/hurt.wav');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create background
    this.bg = this.add.graphics();
    this.bg.fillStyle(COLORS.SKY_BLUE, 1);
    this.bg.fillRect(0, 0, width, height);

    // Create credits text
    this.credits = this.add.text(width / 2, 10, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#fff',
      align: 'center'
    }).setOrigin(0.5, 0);

    // Create groups
    this.clouds = this.physics.add.group();
    this.towers = this.physics.add.group();
    this.invs = this.physics.add.group();

    // Create player (doggie)
    this.doggie = this.physics.add.sprite(width / 4, height / 2, 'doggie');
    this.doggie.setOrigin(0.5, 0.5);
    this.doggie.setScale(2);
    this.doggie.setCollideWorldBounds(true);

    // Create doggie animation
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('doggie', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    // Create fence
    this.fence = this.add.tileSprite(0, height - 32, width, 32, 'fence');
    this.fence.setOrigin(0, 0);
    this.fence.setScale(2);

    // Create text elements
    this.scoreText = this.add.text(width / 2, height / 5, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '32px',
      color: '#fff',
      stroke: '#de9542',
      strokeThickness: 12,
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.instText = this.add.text(width / 2, height - height / 4, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#fff',
      stroke: '#466d85',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.highScoreText = this.add.text(width / 2, height / 3, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#fff',
      stroke: '#466d85',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.postScoreText = this.add.text(width / 2, height / 2, 'CLAIM\nCORGICOINS!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#fff',
      stroke: '#309830',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5);
    this.postScoreText.setVisible(false);
    this.postScoreText.setInteractive();
    this.postScoreText.on('pointerdown', () => this.postScore());

    // Create sounds
    this.flapSnd = this.sound.add('flap');
    this.scoreSnd = this.sound.add('score');
    this.hurtSnd = this.sound.add('hurt');

    // Setup input
    this.input.keyboard.on('keydown-SPACE', () => this.flap());
    this.input.keyboard.on('keydown-V', () => this.toggleMute());
    this.input.on('pointerdown', () => this.flap());

    // Setup collisions
    this.physics.add.overlap(this.doggie, this.towers, () => this.setGameOver(), null, this);
    this.physics.add.overlap(this.doggie, this.invs, this.addScore, null, this);

    // Start cloud spawning
    this.time.addEvent({
      delay: Phaser.Math.Between(500, 4000),
      callback: () => this.spawnCloud(),
      loop: true
    });

    this.reset();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.sound.mute = this.isMuted;
  }

  reset() {
    this.gameStarted = false;
    this.gameOver = false;
    this.score = 0;
    this.postingScore = false;

    this.credits.setVisible(true);
    this.scoreText.setText('CORGI\nFLOP');
    this.instText.setText('TOUCH TO\nFLAP WINGS\n\nV for Mute');
    this.highScoreText.setVisible(false);
    this.postScoreText.setVisible(false);

    this.doggie.setVelocity(0, 0);
    this.doggie.setAngularVelocity(0);
    this.doggie.setAngle(0);
    this.doggie.setPosition(this.cameras.main.width / 4, this.cameras.main.height / 2);
    this.doggie.setGravityY(0);
    this.doggie.play('fly');

    this.towers.clear(true, true);
    this.invs.clear(true, true);

    if (this.towersTimer) {
      this.towersTimer.remove();
    }
  }

  start() {
    this.credits.setVisible(false);
    this.doggie.setGravityY(GAME_CONFIG.GRAVITY);

    // Start spawning towers
    this.towersTimer = this.time.addEvent({
      delay: 1000 / GAME_CONFIG.SPAWN_RATE,
      callback: () => this.spawnTowers(),
      callbackScope: this,
      loop: true,
      startAt: 2000
    });

    this.scoreText.setText(this.score);
    this.instText.setVisible(false);
    this.gameStarted = true;
  }

  flap() {
    if (!this.gameStarted) {
      this.start();
    }

    if (!this.gameOver) {
      this.doggie.setVelocityY(-GAME_CONFIG.FLAP);
      this.flapSnd.play();
    }
  }

  spawnCloud() {
    const { width, height } = this.cameras.main;
    const cloudY = Math.random() * height / 2;
    const cloudFrame = Math.floor(4 * Math.random());
    const cloudScale = 2 + 2 * Math.random();

    const cloud = this.clouds.create(width, cloudY, 'clouds', cloudFrame);
    cloud.setOrigin(0, 0);
    cloud.setScale(cloudScale);
    cloud.setAlpha(2 / cloudScale);
    cloud.setVelocityX(-GAME_CONFIG.SPEED / cloudScale);
    cloud.body.allowGravity = false;
  }

  getOpening() {
    return GAME_CONFIG.OPENING + 60 * ((this.score > 50 ? 50 : 50 - this.score) / 50);
  }

  spawnTower(towerY, flipped = false) {
    const { width } = this.cameras.main;
    const opening = this.getOpening();

    const tower = this.towers.create(
      width,
      towerY + (flipped ? -opening : opening) / 2,
      'tower'
    );

    tower.setScale(2, flipped ? -2 : 2);
    tower.setVelocityX(-GAME_CONFIG.SPEED);
    tower.body.allowGravity = false;

    if (flipped) {
      tower.body.setOffset(0, -tower.body.height);
    }

    return tower;
  }

  spawnTowers() {
    const { width, height } = this.cameras.main;
    const opening = this.getOpening();
    const towerY = ((height - 16 - opening / 2) / 2) +
                   (Math.random() > 0.5 ? -1 : 1) * Math.random() * height / 6;

    // Bottom tower
    const botTower = this.spawnTower(towerY);
    // Top tower (flipped)
    const topTower = this.spawnTower(towerY, true);

    // Add invisible scoring trigger
    const inv = this.invs.create(topTower.x + topTower.width, 0);
    inv.displayWidth = 2;
    inv.displayHeight = height;
    inv.setVelocityX(-GAME_CONFIG.SPEED);
    inv.body.allowGravity = false;
    inv.setAlpha(0);
  }

  addScore(doggie, inv) {
    inv.destroy();
    this.score += 1;
    this.scoreText.setText(this.score);
    this.scoreSnd.play();
  }

  setGameOver() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.instText.setText('TOUCH CORGI\nTO TRY AGAIN');
    this.instText.setVisible(true);

    // Update high score
    let hiscore = localStorage.getItem('hiscore') || 0;
    hiscore = Math.max(parseInt(hiscore, 10), this.score);
    localStorage.setItem('hiscore', hiscore);

    this.highScoreText.setText('HIGH SCORE\n' + hiscore);
    this.highScoreText.setVisible(true);

    if (this.score > 0) {
      this.postScoreText.setVisible(true);
    }

    // Stop all towers
    this.towers.children.entries.forEach(tower => {
      tower.setVelocityX(0);
    });
    this.invs.children.entries.forEach(inv => {
      inv.setVelocityX(0);
    });

    // Stop spawning towers
    if (this.towersTimer) {
      this.towersTimer.remove();
    }

    this.hurtSnd.play();

    // Setup reset on click
    this.input.once('pointerdown', () => {
      if (!this.postScoreText.getBounds().contains(this.input.x, this.input.y)) {
        this.reset();
      }
    });
  }

  async postScore() {
    if (this.postingScore) return;

    this.postScoreText.setText('...');
    this.postingScore = true;

    try {
      const response = await fetch(`${FAUCET_URL}/flop/index?coins=${this.score}`);
      const data = await response.json();

      if (data.status === 'error') {
        this.postScoreText.setText(data.message + '!');
      } else if (data.data && data.data.key) {
        window.location.href = `${FAUCET_URL}/flop/redeem/${data.data.key}`;
      }
    } catch (error) {
      this.postScoreText.setText('ERROR!');
      console.error('Error posting score:', error);
    }
  }

  update() {
    const { width, height } = this.cameras.main;

    if (this.gameStarted) {
      // Angle the doggie based on velocity
      const dvy = GAME_CONFIG.FLAP + this.doggie.body.velocity.y;
      let angle = (90 * dvy / GAME_CONFIG.FLAP) - 180;

      if (angle < -30) angle = -30;

      if (this.gameOver || angle > 90 || angle < -90) {
        this.doggie.setAngle(90);
        this.doggie.anims.stop();
        this.doggie.setFrame(3);
      } else {
        this.doggie.setAngle(angle);
        if (!this.doggie.anims.isPlaying) {
          this.doggie.play('fly');
        }
      }

      // Game over animations
      if (this.gameOver) {
        if (this.doggie.scale < 4) {
          this.doggie.setScale(this.doggie.scale * 1.02);
        }

        const t = this.time.now / 100;
        this.highScoreText.setScale(1 + 0.1 * Math.sin(t), 1 + 0.1 * Math.cos(t));
        this.postScoreText.setAngle(Math.random() * 5 * Math.cos(t));
      } else {
        // Check ground collision
        if (this.doggie.y >= height - 32) {
          this.setGameOver();
        }
      }

      // Remove offscreen towers
      this.towers.children.entries.forEach(tower => {
        if (tower.x + tower.width < 0) {
          tower.destroy();
        }
      });
    } else {
      // Idle animation
      this.doggie.y = (height / 2) + 8 * Math.cos(this.time.now / 200);
    }

    if (!this.gameStarted || this.gameOver) {
      const t = this.time.now / 100;
      this.instText.setScale(1 + 0.1 * Math.sin(t), 1 + 0.1 * Math.cos(t));
    }

    // Shake score text
    const t = this.time.now / 100;
    this.scoreText.setScale(1 + 0.1 * Math.cos(t), 1 + 0.1 * Math.sin(t));

    // Remove offscreen clouds
    this.clouds.children.entries.forEach(cloud => {
      if (cloud.x + cloud.width < 0) {
        cloud.destroy();
      }
    });

    // Scroll fence
    if (!this.gameOver) {
      this.fence.tilePositionX += GAME_CONFIG.SPEED * 0.016 / 2;
    }
  }
}
