module Ld34.Widgets {

  export class LabelButton extends Phaser.Button {
    label : Phaser.Text;
    constructor(game, x, y, callback?, callbackContext?) {
      super(game, x, y, callback, callbackContext);
      this.anchor.setTo(0.5, 0.5);

      this.label = new Phaser.Text(game, 0, 0, "Label", {
        'font' : '10px Arial',
        'fill' : 'black'
      });
      this.label.anchor.setTo(0.5, 0.5);
      this.addChild(this.label);
      this.setText("Flumm");
    }

    setText(label:string) {
      this.label.setText(label);
    }
  }
}
