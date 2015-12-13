/// <reference path="definitions/phaser.comments.d.ts"/>

module Ld34 {
  export interface pos {
    col :number,
    row: number
  };
  export class PlantGame extends Phaser.Game {
    playingFields : String[][];
    evoPoints : number;
    reinforcmentCounter : number;

    totalSoldiers : number;
    soldiersOnHand : number;

    saplingPos : pos;

    difficulty = {
      evoPointsPerDrill : 2.5,
      reinformentsAfterEvoPoints : 20
    }

    easyDifficulty = {
      evoPointsPerDrill : 3,
      reinformentsAfterEvoPoints : 36
    }

    hardDifficulty = {
      evoPointsPerDrill : 2.5,
      reinformentsAfterEvoPoints : 20
    }

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
      this.state.add('pregame', State.PreGameScreen);
      this.state.add('loss', State.LoseScreen);
      this.state.add('victory', State.WinScreen);

      this.state.start('boot');
    }
    
    setToEasy() {
      this.difficulty = this.easyDifficulty;
    }

    setToHard() {
      this.difficulty = this.hardDifficulty;
    }

    initGame() {
      this.evoPoints = 4;
      this.reinforcmentCounter = 0;
      this.totalSoldiers = 4;
      this.soldiersOnHand = this.totalSoldiers;

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

    setSaplingPos(row: number, col: number) {
      this.saplingPos = { row: row, col: col };
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
      return false;
    }

    spawnSoldiers() {
      // TODO 2: try to not spawn in front of rocks

      var possibleLocations = [];
      for (var c: number = 1; c < 9; c++) {
        if (this.getField(0, c) == 'town') {
          if (this.hasNeighbour(0, c, 'manEater')) {
            continue; // town disabled
          }
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

      var outerIterations = 0;
      while (this.soldiersOnHand > 0 && possibleLocations.length > 0 && outerIterations < 10) {
        var sr:number, sc :number, idx:number;
        outerIterations += 1;
        var innerIterations = 0;
        do {
          idx = Math.floor(Math.random()*possibleLocations.length);
          sr = possibleLocations[idx].row;
          sc = possibleLocations[idx].col;
          innerIterations++;
        } while(this.getField(sr, sc) != 'plains' && innerIterations < 10);
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
        if (soldier.row == 8) {
          if (soldier.col < this.saplingPos.col
              && this.getField(soldier.row, soldier.col+1) == 'plains') {
            this.setField(soldier.row, soldier.col, 'plains');
            this.setField(soldier.row, soldier.col+1, 'soldier');
            this.attackFromSoldier(soldier.row, soldier.col+1);
          } else if (this.getField(soldier.row, soldier.col-1) == 'plains') {
            this.setField(soldier.row, soldier.col, 'plains');
            this.setField(soldier.row, soldier.col-1, 'soldier');
            this.attackFromSoldier(soldier.row, soldier.col-1);
          }
        } else {
          var allNeighbours = [];
          allNeighbours.unshift({ row: soldier.row+1, col: soldier.col, weight: 1 });
          allNeighbours.unshift({ row: soldier.row+1, col: soldier.col-1, weight: 1 });
          allNeighbours.unshift({ row: soldier.row+1, col: soldier.col+1, weight: 1 });
          allNeighbours.unshift({ row: soldier.row-1, col: soldier.col, weight: 0 });
          allNeighbours.unshift({ row: soldier.row-1, col: soldier.col+1, weight: 0 });
          allNeighbours.unshift({ row: soldier.row, col: soldier.col + 1, weight: 0 });
          allNeighbours.unshift({ row: soldier.row-1, col: soldier.col-1, weight: 0 });
          allNeighbours.unshift({ row: soldier.row, col: soldier.col - 1, weight: 0 });

          var possibleNeighbours = [];
          var bestWeight = 0;
          for (var neighbour of allNeighbours) {
            if (this.getField(neighbour.row, neighbour.col) != 'plains') continue;
            if ((this.hasNeighbour(neighbour.row, neighbour.col, 'leaf')
                || this.hasNeighbour(neighbour.row, neighbour.col, 'rockDrill')
                || this.hasNeighbour(neighbour.row, neighbour.col, 'sapling'))
                && !this.hasNeighbour(neighbour.row, neighbour.col, 'manEater')) {
              neighbour.weight = 100;
            } else if (this.hasNeighbour(neighbour.row, neighbour.col, 'manEater')) {
              neighbour.weight = 10;
            } else {
              if (neighbour.row == soldier.row -1) {
                neighbour.weight = -999;
              } else {
                var sanity = Math.random();
                if (sanity > 0.5) {
                  if (neighbour.col < soldier.col && this.saplingPos.col > soldier.col) {
                    neighbour.weight = -999;
                  } else if (neighbour.col > soldier.col && this.saplingPos.col < soldier.col) {
                    neighbour.weight = -999;
                  }
                }
              }
            }
            if (bestWeight < neighbour.weight) bestWeight = neighbour.weight;
            possibleNeighbours.unshift(neighbour);
          }

          var bestNeighbours = [];
          for (var neighbour of possibleNeighbours) {
            if (neighbour.weight == bestWeight) {
              bestNeighbours.unshift(neighbour);
            }
          }

          if (bestNeighbours.length != 0) {
            var move = bestNeighbours[Math.floor(Math.random()*bestNeighbours.length)];
            this.setField(soldier.row, soldier.col, 'plains');
            this.setField(move.row, move.col, 'soldier');
            this.attackFromSoldier(move.row, move.col);
          }
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

      if (nearbySoldiers.length == 0) {
        var siegedTowns : number = 0;
        var freeTowns : number = 0;
        for (var c: number = 0; c < 10; c++) {
          if (this.getField(0, c) == 'town') {
            if (this.hasNeighbour(0, c, 'manEater')) {
              siegedTowns ++;
            } else {
              freeTowns ++;
            }
          }
        }
        if (freeTowns == 0) {
          this.state.start('victory');
        }
        return;
      }

      var idx = Math.floor(Math.random()*nearbySoldiers.length);
      var killedSoldier = nearbySoldiers[idx];
      this.soldiersOnHand++;
      this.setField(killedSoldier.row, killedSoldier.col, 'plains');
      this.setField(row, col, 'plains');
    }

    attackFromSoldier(row: number, col: number) {
      var searchPlant:boolean = false;
      var killed:boolean = false;
      if (this.hasNeighbour(row, col, 'sapling')) {
        this.state.start('loss');
      }

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
            this.evoPoints += this.difficulty.evoPointsPerDrill;
            this.reinforcmentCounter += this.difficulty.evoPointsPerDrill;
          } else if (this.getField(r+1, c) == 'rock') {
            this.evoPoints += this.difficulty.evoPointsPerDrill;
            this.reinforcmentCounter += this.difficulty.evoPointsPerDrill;
          } else if (this.getField(r, c-1) == 'rock') {
            this.evoPoints += this.difficulty.evoPointsPerDrill;
            this.reinforcmentCounter += this.difficulty.evoPointsPerDrill;
          } else if (this.getField(r, c+1) == 'rock') {
            this.evoPoints += this.difficulty.evoPointsPerDrill;
            this.reinforcmentCounter += this.difficulty.evoPointsPerDrill;
          }
        }
      });
      while (this.reinforcmentCounter > this.difficulty.reinformentsAfterEvoPoints) {
        this.soldiersOnHand++;
        this.totalSoldiers++;
        this.reinforcmentCounter -= this.difficulty.reinformentsAfterEvoPoints;
      }
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
