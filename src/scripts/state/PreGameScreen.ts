module Ld34.State {
  export class PreGameScreen extends Phaser.State {
    button : Ld34.Widgets.LabelButton;

    create() {
      this.add.button(600, 50, 'startButton', this.startGame, this);
    }

    startGame() {
      this.game.initGame();
      this.game.state.start('ingame.plantPlacesSapling');
    }
  }
}
