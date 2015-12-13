module Ld34.State {
  export class Preload extends Phaser.State {
    private preloadBar:Phaser.Sprite;

    preload() {
      this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
      this.load.setPreloadSprite(this.preloadBar);

      this.game.load.image('leaf',        'assets/images/leaf.png');
      this.game.load.image('manEater',    'assets/images/man_eater.png');
      this.game.load.image('plains',      'assets/images/plains.png');
      this.game.load.image('rock',        'assets/images/rock.png');
      this.game.load.image('rockDriller', 'assets/images/rock_driller.png');
      this.game.load.image('sapling',     'assets/images/sapling.png');
      this.game.load.image('soldier',     'assets/images/soldier.png');
      this.game.load.image('town',        'assets/images/town.png');

      this.game.load.image('endTurnButton','assets/images/end_turn_button.png');
      this.game.load.image('startButton',  'assets/images/start_button.png');
      this.game.load.image('restartButton','assets/images/restart_button.png');
    }

    create() {
      this.game.state.start('pregame');
    }
  }
}
