module Ld34.State {
  export class LoseScreen extends Phaser.State {
    create() {
      this.add.text(100, 100, "You lose, your sapling got burned down!");
      this.add.button(600, 150, 'restartButton', this.gotoPregame, this);
    }

    gotoPregame() {
      console.log("wat");
      this.game.state.start('pregame');
    }
  }
}
