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
      if (this.game.evoPoints >= leafCost) {
        this.leafShop.inputEnabled = true;
        this.leafShop.input.enableDrag(true);
        this.leafShop.events.onDragStart.add(this.highlightFieldsCloseToPlants, this);
        this.leafShop.events.onDragStop.add(this.resetHighlights, this);
        this.leafShop.events.onDragStop.add(() => {
          this.leafShop.x = 600;
          this.leafShop.y = 100;
        });
      } else {
        this.leafShop.tint = disableTint;
      }

      this.rockDrillerShop = this.add.sprite(600, 200, 'rockDriller');
      if (this.game.evoPoints >= drillCost) {
        this.rockDrillerShop.inputEnabled = true;
        this.rockDrillerShop.input.enableDrag(true);
        this.rockDrillerShop.events.onDragStart.add(this.highlightFieldsCloseToPlants, this);
        this.rockDrillerShop.events.onDragStop.add(this.resetHighlights, this);
        this.rockDrillerShop.events.onDragStop.add(() => {
          this.rockDrillerShop.x = 600;
          this.rockDrillerShop.y = 200;
        });
      } else {
        this.rockDrillerShop.tint = disableTint;
      }

      this.manEaterShop = this.add.sprite(600, 300, 'manEater');
      if (this.game.evoPoints >= manEaterCost) {
        this.manEaterShop.inputEnabled = true;
        this.manEaterShop.input.enableDrag(true);
        this.manEaterShop.events.onDragStart.add(this.highlightFieldsCloseToPlants, this);
        this.manEaterShop.events.onDragStop.add(this.resetHighlights, this);
        this.manEaterShop.events.onDragStop.add(() => {
          this.manEaterShop.x = 600;
          this.manEaterShop.y = 300;
        });
      } else {
        this.manEaterShop.tint = disableTint;
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
