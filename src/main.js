import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';
import './style.css';

// Wait for fonts to load before starting the game
const config = {
  type: Phaser.AUTO,
  parent: 'screen',
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainScene]
};

// Load Google Font
window.WebFontConfig = {
  google: {
    families: ['Press Start 2P']
  },
  active: function() {
    // Start game when font is loaded
    new Phaser.Game(config);
  }
};

(function() {
  const wf = document.createElement('script');
  wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.type = 'text/javascript';
  wf.async = true;
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
})();
