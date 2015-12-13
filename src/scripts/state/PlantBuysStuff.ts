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

    evoPointDisplay : Phaser.BitmapText;

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

      this.setupSpriteOnce(this.leafShop, 100, leafCost);
      this.setupSpriteOnce(this.rockDrillerShop, 200, drillCost);
      this.setupSpriteOnce(this.manEaterShop, 300, manEaterCost, true);

      this.add.button(600, 500, 'endTurnButton', this.endTurn, this);
      this.evoPointDisplay = this.add.text(600, 50, "EvoPoints: " + this.game.evoPoints);

      this.onEvoPointChange();
    }

    endTurn() {
      this.game.processResources();
      this.onEvoPointChange();
      this.game.moveSoldiers();
      this.game.spawnSoldiers();
      this.updateAll();
    }

    onEvoPointChange() {
      this.enableOrDisableShopSprite(this.leafShop, leafCost);
      this.enableOrDisableShopSprite(this.rockDrillerShop, drillCost);
      this.enableOrDisableShopSprite(this.manEaterShop, manEaterCost);
      this.evoPointDisplay.text = "EvoPoints: " + this.game.evoPoints;
    }

    updateAll() {
      this.game.iterateFields((r, c, v) => { this.updateSprite(r, c); });
    }

    updateSprite(row: number, col: number) {
      var rowArray = this.gridSprites[row];
      if (rowArray == undefined) return;
      this.gridSprites[row][col].loadTexture(this.game.getField(row, col));
    }

    setupSpriteOnce(sprite: Phaser.Sprite, y:number, cost:number, checkManEater = false) {
        sprite.inputEnabled = true;
        sprite.input.enableDrag(true);
        sprite.events.onDragStart.add(this.highlightFieldsCloseToPlants, this);
        sprite.events.onDragStop.add((sprite, pointer) => {
          var r = Math.floor(pointer.y / 50);
          var c = Math.floor(pointer.x / 50);
          if (  0 <= r && r < 10
             && 0 <= c && c < 10 
             && this.game.evoPoints >= cost
             && this.game.isPlainsCloseToPlant(r, c)) {
            this.game.evoPoints -= cost;
            this.game.setField(r, c, sprite.key);
            this.onEvoPointChange();
            if (checkManEater) {
              // TODO: maybe ask the player which combat to resolve? meh.
              this.game.attackFromManEater(r, c);
              this.updateSprite(r-1, c);
              this.updateSprite(r+1, c);
              this.updateSprite(r, c-1);
              this.updateSprite(r, c+1);
            }
            this.updateSprite(r, c);
          }
        });
        sprite.events.onDragStop.add(this.resetHighlights, this);
        sprite.events.onDragStop.add(() => {
          sprite.x = 600;
          sprite.y = y;
        });
    }

    enableOrDisableShopSprite(sprite:Phaser.Sprite, cost:number) {
      if (this.game.evoPoints >= cost) {
        sprite.inputEnabled = true;
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
