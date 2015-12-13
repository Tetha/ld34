/// <reference path="definitions/phaser.comments.d.ts"/>

module Ld34 {
  export class PlantGame extends Phaser.Game {
    playingFields : String[][];
    evoPoints : number;
    soldiersOnHand : number;

    evoPointsPerDrill : number = 2.5;
    constructor() {
      super({
        width: 800,
        height: 600,
        transparent: false,
        enableDebug: true
      });

    
      this.state.add('boot', State.Boot);
      this.state.add('preload', State.Preload);
      this.state.add('ingame.plantPlacesSapling', State.PlantPlacesSapling);
      this.state.add('ingame.plantBuys', State.PlantBuysStuff);

      this.state.start('boot');
    }

    initGame() {
      this.evoPoints = 4;
      this.soldiersOnHand = 3;

      this.playingFields = [];
      for (var row:number = 0; row < 10; row++) {
          var elements:Array<String> = [];
          for (var col:number = 0; col < 10; col++) {
              elements.unshift('plains');
          }
          this.playingFields.unshift(elements);
      }
    }

    getField(row: number, col: number): String {
      var rowArray = this.playingFields[row];
      if (rowArray == undefined) return undefined;
      return rowArray[col];
    }

    setField(row: number, col: number, value:String) {
      this.playingFields[row][col] = value;
    }

    isPlant(row: number, col: number):boolean {
      var foo : String[] = this.playingFields[row];
      if (foo == undefined) return false;
      var fieldValue:String = this.playingFields[row][col];
      return fieldValue == 'leaf' || fieldValue == 'manEater' || fieldValue == 'rockDriller' || fieldValue == 'sapling';
    }

    isPlainsCloseToPlant(row:number, col:number):boolean {
      return this.playingFields[row][col] == 'plains'
              && (this.isPlant(row-1, col)
                  || this.isPlant(row+1, col)
                  || this.isPlant(row, col-1)
                  || this.isPlant(row, col+1));
    }

    hasNeighbour(row: number, col:number, fieldType: String) {
      if (this.getField(row-1, col) == fieldType) return true;
      if (this.getField(row+1, col) == fieldType) return true;
      if (this.getField(row, col-1) == fieldType) return true;
      if (this.getField(row, col+1) == fieldType) return true;
    }

    spawnSoldiers() {
      // TODO 2: try to not spawn in front of rocks

      var possibleLocations = [];
      for (var c: number = 1; c < 9; c++) {
        if (this.getField(0, c) == 'town') {
          if (c > 1 && this.getField(0, c-1) == 'plains') {
            if (!this.hasNeighbour(0, c-1, 'manEater')) {
              possibleLocations.unshift({ row: 0, col: c-1 });
            }
          }

          if (c < 8 && this.getField(0, c+1) == 'plains') {
            if (!this.hasNeighbour(0, c+1, 'manEater')) {
              possibleLocations.unshift({ row: 0, col: c+1 });
            }
          }

          if (this.getField(1, c) == 'plains') {
            if (!this.hasNeighbour(1, c, 'manEater')) {
              possibleLocations.unshift({ row: 1, col: c });
            }
          }
        }
      }

      while (this.soldiersOnHand > 0 && possibleLocations.length > 0) {
        var sr:number, sc :number, idx:number;
        do {
          idx = Math.floor(Math.random()*possibleLocations.length);
          sr = possibleLocations[idx].row;
          sc = possibleLocations[idx].col;
        } while(this.getField(sr, sc) != 'plains');
        possibleLocations.splice(idx, idx);
        this.setField(sr, sc, 'soldier');
        this.attackFromSoldier(sr, sc);
        this.soldiersOnHand--;
      }
    }

    moveSoldiers() {
      /*
<TaoPhoenix> so 1. 
<TaoPhoenix> that towns thing back row only, you know now why, best protection
<TaoPhoenix> and neither of the last two farthest edge rows
<TaoPhoenix> and NOT opposite the sapling
<TaoPhoenix> (because then I risk just slamming at you)
<TaoPhoenix> (it risk me wiping you out)
<TaoPhoenix> 2. 
<TaoPhoenix> move to auto attack if possible
<TaoPhoenix> it's an easy check to make
<TaoPhoenix> 3. if you can't auto combat on your turn, make sure I can't maneater and nuke you if possible
<TaoPhoenix> 4. if the computer is stuck, *do not move a man back*
<TaoPhoenix> 5
<TaoPhoenix> if possible do not spawn in front of a rock if you have choices
<TaoPhoenix> so in our game if you have choices spawn on the b file and not the c file with the rock
<TaoPhoenix> because you get a logjam
<TaoPhoenix> do you get that?
      */
      var moved:boolean = false;

      for(var soldier of this.findSoldiers()) {
        // if all else fails: charge!
        if (this.getField(soldier.row+1, soldier.col) == 'plains') {
          this.setField(soldier.row, soldier.col, 'plains');
          this.setField(soldier.row+1, soldier.col, 'soldier');
          this.attackFromSoldier(soldier.row+1, soldier.col);
        }
      }
    }

    attackFromManEater(row: number, col: number) {
      var nearbySoldiers = [];

      if (this.getField(row-1, col) == 'soldier') {
        nearbySoldiers.unshift({ row: row-1, col: col });
      }

      if (this.getField(row+1, col) == 'soldier') {
        nearbySoldiers.unshift({ row: row+1, col: col });
      }

      if (this.getField(row, col-1) == 'soldier') {
        nearbySoldiers.unshift({ row: row, col: col-1 });
      }

      if (this.getField(row, col+1) == 'soldier') {
        nearbySoldiers.unshift({ row: row, col: col+1 });
      }

      if (nearbySoldiers.length == 0) return;

      var idx = Math.floor(Math.random()*nearbySoldiers.length);
      var killedSoldier = nearbySoldiers[idx];
      this.soldiersOnHand++;
      this.setField(killedSoldier.row, killedSoldier.col, 'plains');
      this.setField(row, col, 'plains');
    }

    attackFromSoldier(row: number, col: number) {
      var searchPlant:boolean = false;
      var killed:boolean = false;
      if (!killed && this.isPlant(row-1, col)) {
        searchPlant = true;
        if (this.getField(row-1, col) == 'manEater') {
          killed = true;
        }
        this.setField(row-1, col, 'plains');
      }
      if (!killed && this.isPlant(row+1, col)) {
        searchPlant = true;
        if (this.getField(row+1, col) == 'manEater') {
          killed = true;
        }
        this.setField(row+1, col, 'plains');
      }
      if (!killed && this.isPlant(row, col-1)) {
        searchPlant = true;
        if (this.getField(row, col-1) == 'manEater') {
          killed = true;
        }
        this.setField(row, col-1, 'plains');
      }
      if (!killed && this.isPlant(row, col+1)) {
        searchPlant = true;
        if (this.getField(row, col+1) == 'manEater') {
          killed = true;
        }
        this.setField(row, col+1, 'plains');
      }
      if (killed) {
        this.setField(row, col, 'plains');
        this.soldiersOnHand++;
      }
    }

    findSoldiers() {
      var soldiers = [];
      this.iterateFields((r, c, v) => {
        if (v == 'soldier') {
          soldiers.unshift({ row: r, col: c});
        }
      });
      return soldiers;
    }

    processResources() {
      this.iterateFields((r,c,v) => {
        if (v == 'rockDriller') {
          if (this.getField(r-1, c) == 'rock') {
            this.evoPoints += this.evoPointsPerDrill;
          } else if (this.getField(r+1, c) == 'rock') {
            this.evoPoints += this.evoPointsPerDrill;
          } else if (this.getField(r, c-1) == 'rock') {
            this.evoPoints += this.evoPointsPerDrill;
          } else if (this.getField(r, c+1) == 'rock') {
            this.evoPoints += this.evoPointsPerDrill;
          }
        }
      });
    }

    iterateFields(callback : (row: number, col:number, state:String) => void) {
      for (var row:number = 0; row < 10; row++) {
        for (var col:number = 0; col < 10; col++) {
            callback(row,col, this.playingFields[row][col]);
        }
      }
    }
  }
}
