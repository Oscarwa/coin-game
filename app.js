var mainState = {
  // Load images and sounds.
  preload: function() {
    game.load.image('player', 'assets/player.png');
    game.load.image('wallV', 'assets/wallVertical.png');
    game.load.image('wallH', 'assets/wallHorizontal.png');

    game.load.image('coin', 'assets/coin.png');
    game.load.image('enemy', 'assets/enemy.png');

    game.load.audio('jump', ['assets/jump.ogg', 'assets/jump.mp3']);
    game.load.audio('coin', ['assets/coin.ogg', 'assets/coin.mp3']);
    game.load.audio('dead', ['assets/dead.ogg', 'assets/dead.mp3']);

  },
  // Create objects, sprites, and event listeners
  create: function() {
    game.stage.backgroundColor = '#3498DB';
    game.physics.startSystem(Phaser.Physics.Arcade);
    game.renderer.renderSession.roundPixels = true;

    this.player = game.add.sprite(250, 170, 'player');
    this.player.anchor.setTo(0.5);

    game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = 500;

    this.cursor = game.input.keyboard.createCursorKeys();

    this.walls = game.add.group();
    this.walls.enableBody = true;

    game.add.sprite(0,0, 'wallV', 0, this.walls);
    game.add.sprite(480,0, 'wallV', 0, this.walls);

    game.add.sprite(0, 0, 'wallH', 0, this.walls);
    game.add.sprite(300, 0, 'wallH', 0, this.walls);

    game.add.sprite(0, 320, 'wallH', 0, this.walls);
    game.add.sprite(300, 320, 'wallH', 0, this.walls);

    game.add.sprite(-100, 160, 'wallH', 0, this.walls);
    game.add.sprite(400, 160, 'wallH', 0, this.walls);

    var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
    middleTop.scale.setTo(1.5, 1);
    var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
    middleBottom.scale.setTo(1.5, 1);
    this.walls.setAll('body.immovable', true);

    this.coin = game.add.sprite(60, 140, 'coin');
    game.physics.arcade.enable(this.coin);
    this.coin.anchor.setTo(0.5);

    this.score = 0;
    this.scoreLabel = game.add.text(30, 30, 'SCORE: 0', {font: '18px Courier New', fill: '#FFFFFF'});

    this.enemies = game.add.group();
    this.enemies.enableBody = true;
    this.enemies.createMultiple(10, 'enemy');

    game.time.events.loop(2200, this.addEnemy, this);

    this.jumpSound = game.add.audio('jump');
    this.coinSound = game.add.audio('coin');
    this.deadSound = game.add.audio('dead');
  },
  // 60 times per second.
  // game logic, input, physics, collision handling.
  update: function() {
    game.physics.arcade.collide(this.player, this.walls);
    game.physics.arcade.collide(this.enemies, this.walls);
    game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
    game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
    this.movePlayer();
    if(!this.player.inWorld) {
      this.playerDie();
    }
  },

  addEnemy: function() {
    var enemy = this.enemies.getFirstDead();
    if(!enemy) return;

    enemy.anchor.setTo(0.5);
    enemy.reset(game.width / 2, 0);
    enemy.body.gravity.y = 500;

    enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
    enemy.body.bounce.x = true;
    enemy.outOfBoundsKill = true;

  },

  takeCoin: function() {
    this.updateCoinPosition();
    this.score += 5;
    this.scoreLabel.text = 'SCORE: ' + this.score;
    this.coinSound.play();
  },

  updateCoinPosition: function() {
    var coinPositions = [
      {x: 140, y: 60},
      {x: 360, y: 60},
      {x: 60, y: 140},
      {x: 440, y: 140},
      {x: 130, y: 300},
      {x: 370, y: 300}
    ];
    for(var i = 0; i < coinPositions.length; i++) {
      if(this.coin.x === coinPositions[i].x) {
        coinPositions.splice(i, 1);
      }
    }
    var newPos = game.rnd.pick(coinPositions);
    this.coin.reset(newPos.x, newPos.y);
  },

  playerDie: function() {
    game.state.start('main');
    this.deadSound.play();
  },

  movePlayer: function() {
    if(this.cursor.left.isDown) {
      this.player.body.velocity.x = -200;
    }
    else if(this.cursor.right.isDown) {
      this.player.body.velocity.x = 200;
    }
    else {
      this.player.body.velocity.x = 0;
    }

    if(this.cursor.up.isDown && this.player.body.touching.down) {
      this.player.body.velocity.y = -320;
      this.jumpSound.play();
    }
  }
};

var game = new Phaser.Game(500, 340, Phaser.AUTO, 'game');
game.state.add('main', mainState);

game.state.start('main');
