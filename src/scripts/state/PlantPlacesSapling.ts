module Ld34.State {
  export class PlantPlacesSapling extends Phaser.State {
    saplingSprite : Phaser.Sprite;
    gridSprites : Phaser.Sprite[][];

    create() {
      this.createSprites();
    }

    createSprites() {
      this.gridSprites = [[], [], [], [], [], [], [], [], [], []];
      this.game.iterateFields((r, c, v) => {
        var sprite:Phaser.Sprite = this.add.sprite(50*c, 50*r, v);
        if (r != 7) {
          sprite.tint = 0x961717;
	}
        this.gridSprites[r][c] = sprite;
      });

      this.saplingSprite = this.add.sprite(600, 300, 'sapling');
      this.saplingSprite.inputEnabled = true;
      this.saplingSprite.input.enableDrag(true);

      this.saplingSprite.events.onDragStop.add(this.dragStop, this);
    }


    dragStop(sprite, pointer) {
      console.log(pointer);
      var r = Math.floor(pointer.y / 50);
      var c = Math.floor(pointer.x / 50);
      if (r != 7) {
        sprite.x = 600;
        sprite.y = 300;
      } else {
        this.game.setField(r, c, 'sapling');
        this.game.state.start('ingame.plantBuys');
      }
    }
  }
}
