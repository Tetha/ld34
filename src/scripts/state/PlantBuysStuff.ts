module Ld34.State {
  export class PlantBuysStuff extends Phaser.State {
    saplingSprite : Phaser.Sprite;
    gridSprites : Phaser.Sprite[][];

    create() {
      this.createSprites();
    }

    createSprites() {
      this.gridSprites = [[], [], [], [], [], [], [], [], [], []];
      this.game.iterateFields((r, c, v) => {
        var sprite:Phaser.Sprite = this.add.sprite(50*c, 50*r, v);
        this.gridSprites[r][c] = sprite;
      });
    }
  }
}
