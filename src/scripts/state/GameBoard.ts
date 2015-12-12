module Ld34.State {
  export class GameBoard extends Phaser.State {
    grid:Array<Array<Phaser.Sprite>>;
    create() {
      this.grid = [];
      for (var row:number = 0; row < 10; row++) {
          var elements:Array<Phaser.Sprite> = [];
          for (var col:number = 0; col < 10; col++) {
              var sprite:Phaser.Sprite = this.add.sprite(50*row, 50*col, 'plains');
              sprite.inputEnabled = true;
              sprite.events.onInputUp.add(this.clickHandler(sprite));
              elements.unshift(sprite);
          }
          this.grid.unshift(elements);
      }
    }

    clickHandler(tile) {
      return function() {
        var current:String = tile.key;
        if (current == 'leaf') {
          tile.loadTexture('manEater');
        } else if (current == 'manEater') {
          tile.loadTexture('plains');
        } else if (current == 'plains') {
          tile.loadTexture('rock');
        } else if (current == 'rock') {
          tile.loadTexture('rockDriller';
        } else if (current == 'rockDriller') {
          tile.loadTexture('sapling');
        } else if (current == 'sapling') {
          tile.loadTexture('soldier');
        } else if (current == 'soldier') {
          tile.loadTexture('town');
        } else if (current == 'town') {
          tile.loadTexture('leaf');
        }
      }
    }
  }
}
