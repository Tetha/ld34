module Ld34.State {
  export class PreGameScreen extends Phaser.State {
    button : Ld34.Widgets.LabelButton;

    create() {
      this.add.button(600, 50, 'startButton', this.startGame, this);
      this.add.text(50, 75, "You are a strange alien plant.\n");
      this.add.text(50, 150, "Your goal is to place a man-eating\n"
                          + "monster-plant next to each town!");

      this.add.sprite(650, 150, 'town');
      this.add.sprite(700, 150, 'manEater');

      this.add.text(50, 250, "To do so, place leafs around to cover space,\n"
                           + "since you can only place plants next\n"
                           + "to existing plants");

      this.add.sprite(700, 200, 'leaf');
      this.add.sprite(700, 250, 'leaf');
      this.add.sprite(700, 300, 'sapling');

      this.add.text(50, 410, "Place Rock Drillers to get resources from rocks");

      this.add.sprite(700, 350, 'leaf');
      this.add.sprite(700, 400, 'rockDriller');
      this.add.sprite(750, 400, 'rock');

      this.add.text(50, 475, "And place man-eating soldiers to eat soldiers");

      this.add.sprite(700, 450, 'manEater');
      this.add.sprite(750, 500, 'soldier');

      this.add.text(0, 570, "Special Thanks to TaoPhoenix, for a lot of design advice + testing",
                    { 'font' : '14pt Arial' });

    }

    startGame() {
      this.game.initGame();
      this.game.state.start('ingame.plantPlacesSapling');
    }
  }
}
