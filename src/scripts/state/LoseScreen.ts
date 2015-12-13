module Ld34.State {
  export class LoseScreen extends Phaser.State {
    create() {
      this.add.text(100, 100, "You lose, your sapling got burned down!");
    }
  }
}
