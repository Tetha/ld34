module Ld34.State {
  var numTowns = 4;
  var startRow = 8;
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
        if (r != startRow) {
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
      var r = Math.floor(pointer.y / 50);
      var c = Math.floor(pointer.x / 50);
      if (r != startRow) {
        sprite.x = 600;
        sprite.y = 300;
      } else {
        this.game.setField(r, c, 'sapling');
        var rOffset:number = -2;
        var cOffset:number;
        if ((Math.random() - 0.5) > 0) {
          cOffset = 1;
        } else {
          cOffset = -1;
        }
        this.game.setField(r + rOffset, c + cOffset, 'rock');
        this.game.setField(r + 2*rOffset, c - cOffset, 'rock');

        for (var i : number = 0; i < numTowns; i++) {
          var tc:number;
          do {
            tc = Math.floor(Math.random() * 10);
          } while(tc == 0 || tc == 9
                  || tc == c
                  || this.game.getField(0, tc) != 'plains');
          this.game.setField(0, tc, 'town');
        }
        this.game.spawnSoldiers();

        this.game.state.start('ingame.plantBuys');
      }
    }
  }
}
