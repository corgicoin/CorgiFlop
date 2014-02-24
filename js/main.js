var $j = jQuery;

var DEBUG = false;
var SPEED = 180;
var GRAVITY = 18;
var FLAP = 420;
var SPAWN_RATE = 1 / 1.2;
var OPENING = 144;
var faucet = "http://givemecorgicoins.com";

$j(document).ready(function() {
    WebFontConfig = {
        google: { families: [ 'Press+Start+2P::latin' ] },
        active: main
    };
    (function() {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
          '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    })(); 
});


function main() {

	var state = {
	    preload: preload,
	    create: create,
	    update: update,
	    render: render
	};

var parent = document.querySelector('#screen');

var game = new Phaser.Game(
    0,
    0,
    Phaser.CANVAS,
    parent,
    state,
    false,
    false
);


function showScores() {
    if (leaderboard) {
        leaderboard.show({ best: true });
    }
}

function kikThis() {
}

function postScore() {
    if ( postingScore ) {
	    return;
    }
    postScoreText.setText('...');
    postingScore = true;
	$j.getJSON(faucet + "/flop/index?coins=" + score, function(d) {
		var key = d.body.data.key;
		if (key) {
			window.location.href = faucet + "/flop/redeem/" + key;
		}
	});
}

function preload() {
    var assets = {
        spritesheet: {
            doggie: ['assets/doggie.png', 24, 24],
            clouds: ['assets/clouds.png', 128, 64]
        },
        image: {
            tower: ['assets/tower.png'],
            fence: ['assets/fence.png']
        },
        audio: {
            flap: ['assets/flap.wav'],
            score: ['assets/score.wav'],
            hurt: ['assets/hurt.wav']
        }
    };
    Object.keys(assets).forEach(function(type) {
        Object.keys(assets[type]).forEach(function(id) {
            game.load[type].apply(game.load, [id].concat(assets[type][id]));
        });
    });
}

var gameStarted,
    gameOver,
    score,
    bg,
    credits,
    clouds,
    towers,
    invs,
    doggie,
    fence,
    scoreText,
    instText,
    highScoreText,
    kikThisText,
    kikThisClickArea,
    postScoreClickArea,
    postingScore,
    leaderboard,
    flapSnd,
    scoreSnd,
    hurtSnd,
    towersTimer,
    cloudsTimer,
    sbPress,
    is_muted;

function create() {
    // Set world dimensions
    var screenWidth = parent.clientWidth > window.innerWidth ? window.innerWidth : parent.clientWidth;
    var screenHeight = parent.clientHeight > window.innerHeight ? window.innerHeight : parent.clientHeight;
    is_muted = false;
    game.world.width = screenWidth;
    game.world.height = screenHeight;
    // Draw bg
    bg = game.add.graphics(0, 0);
    bg.beginFill(0xCCEEFF, 1);
    bg.drawRect(0, 0, game.world.width, game.world.height);
    bg.endFill();
    // Credits 'yo
    credits = game.add.text(
        game.world.width / 2,
        10,
        '',
        {
            font: '8px "Press Start 2P"',
            fill: '#fff',
            align: 'center'
        }
    );
    credits.anchor.x = 0.5;
    // Add clouds group
    clouds = game.add.group();
    // Add towers
    towers = game.add.group();
    // Add invisible thingies
    invs = game.add.group();
    // Add doggie
    doggie = game.add.sprite(0, 0, 'doggie');
    doggie.anchor.setTo(0.5, 0.5);
    doggie.animations.add('fly', [0, 1, 2, 3], 10, true);
    doggie.inputEnabled = true;
    doggie.body.collideWorldBounds = true;
    doggie.body.gravity.y = GRAVITY;
    // Add fence
    fence = game.add.tileSprite(0, game.world.height - 32, game.world.width, 32, 'fence');
    fence.tileScale.setTo(2, 2);
    // Add score text
    scoreText = game.add.text(
        game.world.width / 2,
        game.world.height / 5,
        "",
        {
            font: '32px "Press Start 2P"',
            fill: '#fff',
            stroke: '#de9542',
            strokeThickness: 12,
            align: 'center'
        }
    );
    scoreText.anchor.setTo(0.5, 0.5);
    // Add instructions text
    instText = game.add.text(
        game.world.width / 2,
        game.world.height - game.world.height / 4,
        "",
        {
            font: '16px "Press Start 2P"',
            fill: '#fff',
            stroke: '#466d85',
            strokeThickness: 8,
            align: 'center'
        }
    );
    instText.anchor.setTo(0.5, 0.5);
    // Add game over text
    highScoreText = game.add.text(
        game.world.width / 2,
        game.world.height / 3,
        "",
        {
            font: '24px "Press Start 2P"',
            fill: '#fff',
            stroke: '#466d85',
            strokeThickness: 8,
            align: 'center'
        }
    );
    highScoreText.anchor.setTo(0.5, 0.5);
    
    postScoreText = game.add.text(
        game.world.width / 2,
        game.world.height / 2,
        "",
        {
            font: '20px "Press Start 2P"',
            fill: '#fff',
            stroke: '#309830',
            strokeThickness: 8,
            align: 'center'
        }
    );
    postScoreText.setText("CLAIM\nCORGICOINS!");
    postScoreText.anchor.setTo(0.5, 0.5);
    postScoreText.renderable = false;
    
    postScoreClickArea = new Phaser.Rectangle(0, postScoreText.y - postScoreText.height / 2, game.world.width, postScoreText.height*2);
    
    // Add kik this text (hidden until game is over)
    kikThisText = game.add.text(
        3 * game.world.width / 4,
        game.world.height / 2,
        "",
        {
            font: '20px "Press Start 2P"',
            fill: '#fff',	
            stroke: '#466d85',
            strokeThickness: 8,
            align: 'center'
        }
    );
    kikThisText.setText("KIK\nTHIS!");
    kikThisText.anchor.setTo(0.5, 0.5);
    kikThisText.renderable = false;
    kikThisClickArea = new Phaser.Rectangle(kikThisText.x - kikThisText.width / 2, kikThisText.y - kikThisText.height / 2, kikThisText.width, kikThisText.height);
    
    // Add sounds
    flapSnd = game.add.audio('flap');
    scoreSnd = game.add.audio('score');
    hurtSnd = game.add.audio('hurt');
    // Add controls

	// map flaps        
    sbPress = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    game.input.onDown.add(flap);

	// map mute
    mutePress = game.input.keyboard.addKey(Phaser.Keyboard.V);
    mutePress.onDown.add(mute_toggle);
    
    // Start clouds timer
    cloudsTimer = new Phaser.Timer(game);
    cloudsTimer.onEvent.add(spawnCloud);
    cloudsTimer.start();
    cloudsTimer.add(Math.random());
    // RESET!
    reset();
}

function mute_toggle() {
	if (is_muted) {
		game.sound.mute = false;	
		is_muted = false;
	} else {
		game.sound.mute = true;	
		is_muted = true;
	}
}

function reset() {

    doggie.events.onInputDown.removeAll();
    sbPress.onDown.removeAll();

	// map spacebar 
    sbPress.onDown.add(flap);
    
    gameStarted = false;
    gameOver = false;
    score = 0;
    credits.renderable = true;
    scoreText.setText("CORGI\nFLOP");
    instText.setText("TOUCH TO\nFLAP WINGS\n\nV for Mute");
    highScoreText.renderable = false;
    postScoreText.renderable = false;
    kikThisText.renderable = false;
    doggie.body.allowGravity = false;
    doggie.angle = 0;
    doggie.reset(game.world.width / 4, game.world.height / 2);
    doggie.scale.setTo(2, 2);
    doggie.animations.play('fly');
    towers.removeAll();
    invs.removeAll();
}

function start() {
    credits.renderable = false;
    doggie.body.allowGravity = true;
    // SPAWN FINGERS!
    towersTimer = new Phaser.Timer(game);
    towersTimer.onEvent.add(spawnTowers);
    towersTimer.start();
    towersTimer.add(2);
    // Show score
    scoreText.setText(score);
    instText.renderable = false;
    // START!
    gameStarted = true;
}

function flap() {
    if (!gameStarted) {
        start();
    }
    if (!gameOver) {
        doggie.body.velocity.y = -FLAP;
        flapSnd.play();
    } else {
        // Check if the touch event is within our text for posting a score
        if (postScoreClickArea && Phaser.Rectangle.contains(postScoreClickArea, game.input.x, game.input.y)) {
            postScore();
        }
    }
}

function spawnCloud() {
    cloudsTimer.stop();

    var cloudY = Math.random() * game.height / 2;
    var cloud = clouds.create(
        game.width,
        cloudY,
        'clouds',
        Math.floor(4 * Math.random())
    );
    var cloudScale = 2 + 2 * Math.random();
    cloud.alpha = 2 / cloudScale;
    cloud.scale.setTo(cloudScale, cloudScale);
    cloud.body.allowGravity = false;
    cloud.body.velocity.x = -SPEED / cloudScale;
    cloud.anchor.y = 0;

    cloudsTimer.start();
    cloudsTimer.add(4 * Math.random());
}

function o() {
    return OPENING + 60 * ((score > 50 ? 50 : 50 - score) / 50);
}

function spawnTower(towerY, flipped) {
    var tower = towers.create(
        game.width,
        towerY + (flipped ? -o() : o()) / 2,
        'tower'
    );
    tower.body.allowGravity = false;

    // Flip tower! *GASP*
    tower.scale.setTo(2, flipped ? -2 : 2);
    tower.body.offset.y = flipped ? -tower.body.height * 2 : 0;

    // Move to the left
    tower.body.velocity.x = -SPEED;

    return tower;
}

function spawnTowers() {
    towersTimer.stop();

    var towerY = ((game.height - 16 - o() / 2) / 2) + (Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height / 6;
    // Bottom tower
    var botTower = spawnTower(towerY);
    // Top tower (flipped)
    var topTower = spawnTower(towerY, true);

    // Add invisible thingy
    var inv = invs.create(topTower.x + topTower.width, 0);
    inv.width = 2;
    inv.height = game.world.height;
    inv.body.allowGravity = false;
    inv.body.velocity.x = -SPEED;

    towersTimer.start();
    towersTimer.add(1 / SPAWN_RATE);
}

function addScore(_, inv) {
    invs.remove(inv);
    score += 1;
    scoreText.setText(score);
    scoreSnd.play();
}

function setGameOver() {
    gameOver = true;
    instText.setText("TOUCH CORGI\nTO TRY AGAIN");
    instText.renderable = true;
    var hiscore = window.localStorage.getItem('hiscore');
    hiscore = hiscore ? hiscore : score;
    hiscore = score > parseInt(hiscore, 10) ? score : hiscore;
    window.localStorage.setItem('hiscore', hiscore);
    highScoreText.setText("HIGH SCORE\n" + hiscore);
    highScoreText.renderable = true;
    
	if (score > 0) {
	    postScoreText.renderable = true;
	}    
    
    // Stop all towers
    towers.forEachAlive(function(tower) {
        tower.body.velocity.x = 0;
    });
    invs.forEach(function(inv) {
        inv.body.velocity.x = 0;
    });
    // Stop spawning towers
    towersTimer.stop();

    // resets
    sbPress.onDown.addOnce(reset);
    doggie.events.onInputDown.addOnce(reset);
    
    hurtSnd.play();
}

function update() {
    if (gameStarted) {
        // Make doggie dive
        var dvy = FLAP + doggie.body.velocity.y;
        doggie.angle = (90 * dvy / FLAP) - 180;
        if (doggie.angle < -30) {
            doggie.angle = -30;
        }
        if (
            gameOver ||
            doggie.angle > 90 ||
            doggie.angle < -90
        ) {
            doggie.angle = 90;
            doggie.animations.stop();
            doggie.frame = 3;
        } else {
            doggie.animations.play('fly');
        }
        // doggie is DEAD!
        if (gameOver) {
            if (doggie.scale.x < 4) {
                doggie.scale.setTo(
                    doggie.scale.x * 1.2,
                    doggie.scale.y * 1.2
                );
            }
            highScoreText.scale.setTo(
                1 + 0.1 * Math.sin(game.time.now / 100),
                1 + 0.1 * Math.cos(game.time.now / 100)
            );
            postScoreText.angle = Math.random() * 5 * Math.cos(game.time.now / 100);
            kikThisText.angle = Math.random() * 5 * Math.sin(game.time.now / 100);
        } else {
            // Check game over
            game.physics.overlap(doggie, towers, setGameOver);
            if (!gameOver && doggie.body.bottom >= game.world.bounds.bottom) {
                setGameOver();
            }
            // Add score
            game.physics.overlap(doggie, invs, addScore);
        }
        // Remove offscreen towers
        towers.forEachAlive(function(tower) {
            if (tower.x + tower.width < game.world.bounds.left) {
                tower.kill();
            }
        });
        // Update tower timer
        towersTimer.update();
    } else {
        doggie.y = (game.world.height / 2) + 8 * Math.cos(game.time.now / 200);
    }
    if (!gameStarted || gameOver) {
        // Shake instructions text
        instText.scale.setTo(
            1 + 0.1 * Math.sin(game.time.now / 100),
            1 + 0.1 * Math.cos(game.time.now / 100)
        );
    }
    // Shake score text
    scoreText.scale.setTo(
        1 + 0.1 * Math.cos(game.time.now / 100),
        1 + 0.1 * Math.sin(game.time.now / 100)
    );
    // Update clouds timer
    cloudsTimer.update();
    // Remove offscreen clouds
    clouds.forEachAlive(function(cloud) {
        if (cloud.x + cloud.width < game.world.bounds.left) {
            cloud.kill();
        }
    });
    // Scroll fence
    if (!gameOver) {
        fence.tilePosition.x -= game.time.physicsElapsed * SPEED / 2;
    }
}

function render() {
    if (DEBUG) {
        game.debug.renderSpriteBody(doggie);
        towers.forEachAlive(function(tower) {
            game.debug.renderSpriteBody(tower);
        });
        invs.forEach(function(inv) {
            game.debug.renderSpriteBody(inv);
        });
    }
}

};
