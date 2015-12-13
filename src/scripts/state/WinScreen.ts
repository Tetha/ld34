module Ld34.State {
  export class WinScreen extends Phaser.State {
    create() {
      this.add.text(100, 100, "Victory! You ate all humans");
    }
  }
}
