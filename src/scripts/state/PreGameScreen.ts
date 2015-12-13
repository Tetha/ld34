module Ld34.State {
  export class PreGameScreen extends Phaser.State {
    button : Ld34.Widgets.LabelButton;

    create() {
      this.add.text(200, 0, "Terror Plant from outer Space", {
        'font' : '24pt Arial',
        'fill' : 'red'
      });
      this.add.button(600, 50, 'easyButton', this.startEasyGame, this);
      this.add.button(700, 50, 'hardButton', this.startHardGame, this);

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
      this.add.sprite(700, 300, 'manEater');

      this.add.text(50, 410, "Place Rock Drillers to get resources from rocks");

      this.add.sprite(700, 350, 'leaf');
      this.add.sprite(700, 400, 'rockDriller');
      this.add.sprite(750, 400, 'rock');

      this.add.text(50, 475, "And place man-eating plants to eat soldiers");

      this.add.sprite(700, 450, 'sapling');
      this.add.sprite(750, 500, 'soldier');

      this.add.text(0, 570, "Special Thanks to TaoPhoenix, for a lot of design advice + testing",
                    { 'font' : '14pt Arial' });

    }


    startEasyGame() { 
      this.game.setToEasy();
      this.startGame();
    }

    startHardGame() {
      this.game.setToHard();
      this.startGame();
    }

    startGame() {
      this.game.initGame();
      this.game.state.start('ingame.plantPlacesSapling');
    }
  }
}
