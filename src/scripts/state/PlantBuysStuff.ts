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
      this.rockDrillerShop = this.add.sprite(600, 200, 'rockDriller');
      this.manEaterShop = this.add.sprite(600, 300, 'manEater');
      this.resetAllShopSprites();

      this.add.button(600, 500, 'endTurnButton', this.endTurn, this);
    }

    endTurn() {
      this.game.processResources();
      this.resetAllShopSprites();
    }

    resetAllShopSprites() {
      this.enableOrDisableShopSprite(this.leafShop, 100, leafCost);
      this.enableOrDisableShopSprite(this.rockDrillerShop, 200, drillCost);
      this.enableOrDisableShopSprite(this.manEaterShop, 300, manEaterCost);
    }

    updateSprite(row: number, col: number) {
      this.gridSprites[row][col].loadTexture(this.game.getField(row, col));
    }

    enableOrDisableShopSprite(sprite:Phaser.Sprite, y:number, cost:number) {
      if (this.game.evoPoints >= cost) {
        sprite.inputEnabled = true;
        sprite.input.enableDrag(true);
        sprite.events.onDragStart.add(this.highlightFieldsCloseToPlants, this);
        sprite.events.onDragStop.add((sprite, pointer) => {
          var r = Math.floor(pointer.y / 50);
          var c = Math.floor(pointer.x / 50);
          if (0 <= r && r < 10 && 0 <= c && c < 10 && this.game.evoPoints >= cost) {
            this.game.evoPoints -= cost;
            this.game.setField(r, c, sprite.key);
            this.resetAllShopSprites();
            this.updateSprite(r, c);
          }
        });
        sprite.events.onDragStop.add(this.resetHighlights, this);
        sprite.events.onDragStop.add(() => {
          sprite.x = 600;
          sprite.y = y;
        });
        sprite.tint = enableTint;
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
