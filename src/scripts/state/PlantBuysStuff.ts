module Ld34.State {
  var disableTint = 0x961717;
  var enableTint = 0xffffff;
  var leafCost = 1;
  var drillCost = 3;
  var manEaterCost = 5;

  export class PlantBuysStuff extends Phaser.State {
    leafShop : Phaser.Sprite;
    rockDrillerShop : Phaser.Sprite;
    manEaterShop : Phaser.Sprite;
    
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

      this.leafShop = this.add.sprite(600, 100, 'leaf');
      this.enableOrDisableShopSprite(this.leafShop, 100, leafCost);

      this.rockDrillerShop = this.add.sprite(600, 200, 'rockDriller');
      this.enableOrDisableShopSprite(this.rockDrillerShop, 200, drillCost);

      this.manEaterShop = this.add.sprite(600, 300, 'manEater');
      this.enableOrDisableShopSprite(this.manEaterShop, 300, manEaterCost);
    }

    enableOrDisableShopSprite(sprite:Phaser.Sprite, y:number, cost:number) {
      if (this.game.evoPoints >= cost) {
        sprite.inputEnabled = true;
        sprite.input.enableDrag(true);
        sprite.events.onDragStart.add(this.highlightFieldsCloseToPlants, this);
        sprite.events.onDragStop.add(this.resetHighlights, this);
        sprite.events.onDragStop.add(() => {
          sprite.x = 600;
          sprite.y = y;
        });
      } else {
        sprite.inputEnabled = false;
        sprite.tint = disableTint;
      }
    }
    highlightFieldsCloseToPlants() {
      this.game.iterateFields((r, c, v) => {
        if (!this.game.isPlainsCloseToPlant(r, c)) {
          this.gridSprites[r][c].tint = disableTint;
        }
      });
    }

    resetHighlights() {
      this.game.iterateFields((r, c, v) => {
        this.gridSprites[r][c].tint = enableTint;
      });
    }
  }
}
