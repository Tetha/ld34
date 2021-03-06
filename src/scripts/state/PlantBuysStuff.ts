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
    endTurnButton : Phaser.Button;
    texts : Phaser.Sprite[];
    
    gridSprites : Phaser.Sprite[][];

    evoPointDisplay : Phaser.BitmapText;
    soldierDisplay : Phaser.BitmapText;

    create() {
      this.createSprites();
    }

    createSprites() {
      this.gridSprites = [[], [], [], [], [], [], [], [], [], []];
      this.game.iterateFields((r, c, v) => {
        var sprite:Phaser.Sprite = this.add.sprite(50*c, 50*r, v);
        this.gridSprites[r][c] = sprite;
      });

      this.leafShop = this.add.sprite(525, 100, 'leaf');
      this.rockDrillerShop = this.add.sprite(525, 200, 'rockDriller');
      this.manEaterShop = this.add.sprite(525, 300, 'manEater');

      this.texts = [];

      this.setupSpriteOnce(this.leafShop, 100, leafCost,
        "Leaf: Doesn't do much in itself,\n"
       +"except allow you to spread further");
      this.setupSpriteOnce(this.rockDrillerShop, 200, drillCost,
        "Drill: Produces Evo-Points next\n"
       +"to a rock");
      this.setupSpriteOnce(this.manEaterShop, 300, manEaterCost, 
        "Man-Eater: Destroys soldiers next to\n"
       +"itself and locks down towns next\n"
       +"to itself",
        true);

      this.endTurnButton = this.add.button(525, 450, 'endTurnButton', this.endTurn, this);
      this.evoPointDisplay = this.add.text(525, 25, "EvoPoints: " + this.game.evoPoints, {
        'font' : '14pt Arial'
      });
      this.texts.unshift(this.evoPointDisplay);
      this.soldierDisplay = this.add.text(525, 50, "Soldiers deployed: " + (this.game.totalSoldiers - this.game.soldiersOnHand) + " / " + this.game.totalSoldiers + "max", {
        'font' : '14pt Arial'
      });
      this.texts.unshift(this.soldierDisplay);

      this.onEvoPointChange();
    }

    endTurn() {
      this.game.processResources();
      this.onEvoPointChange();
      var res1 = this.game.moveSoldiers();
      var res2 = this.game.spawnSoldiers();
      if (res1 == 'loss' || res2 == 'loss') {
        this.removeSidebar();
        this.add.text(525, 100, "You lost!\nYour plant got\nburned down :(");
        this.add.button(525, 200, 'restartButton', this.gotoPregame, this);
      }
      this.updateSoldierText();
      this.updateAll();
    }

    updateSoldierText() {
      this.soldierDisplay.text = "Soldiers deployed:\n" + (this.game.totalSoldiers - this.game.soldiersOnHand) + " / " + this.game.totalSoldiers + "max";
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
      var sprite = rowArray[col];
      if (sprite == undefined) return;
      sprite.loadTexture(this.game.getField(row, col));
    }

    setupSpriteOnce(sprite: Phaser.Sprite, y:number, cost:number, description: string, checkManEater = false) {
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
              var victory = this.game.attackFromManEater(r, c);
              if (victory == 'victory') {
                this.removeSidebar();
                this.add.text(525, 100, "You won!\nYou ate all humans!");
                this.add.button(525, 200, 'restartButton', this.gotoPregame, this);
              }
              this.updateSprite(r-1, c);
              this.updateSprite(r+1, c);
              this.updateSprite(r, c-1);
              this.updateSprite(r, c+1);
              this.updateSoldierText();
            }
            this.updateSprite(r, c);
          }
        });
        sprite.events.onDragStop.add(this.resetHighlights, this);
        sprite.events.onDragStop.add(() => {
          sprite.x = 525;
          sprite.y = y;
        });
        this.texts.unshift(this.add.text(575, y, "Cost: " + cost));
        this.texts.unshift(this.add.text(525, y + 50, description, {
          'font' : '12pt Arial'
        }));
    }

    removeSidebar() {
      this.leafShop.inputEnabled = false;
      this.rockDrillerShop.inputEnabled = false;
      this.manEaterShop.inputEnabled = false;
      this.endTurnButton.inputEnabled = false;

      this.leafShop.kill();
      this.rockDrillerShop.kill();
      this.manEaterShop.kill();
      this.endTurnButton.kill();
      for (var text of this.texts) text.kill();
    }

    gotoPregame() {
      this.game.state.start('pregame');
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
