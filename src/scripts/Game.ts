/// <reference path="definitions/phaser.comments.d.ts"/>

module Ld34 {
  export class PlantGame extends Phaser.Game {
    playingFields : String[][];
    evoPoints : number;

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
      return this.playingFields[row][col];
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
