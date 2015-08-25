var states = {
  0: "normal",
  1: "bomb",
  2: "flag",
  3: "pressed"
};

var spot = function () {
  var self = {};
  var state = 0;
  var text = '""';

  self.toData = function () {
    return {status: states[state],label:text};
  };

  self.change = function () {
    switch (state) {
      case 0:
        state = 2;
        break;
      case 2:
        state = 0;
        break;
    }
  };

  self.setPress = function (bombs) {
    if (state != 0) {
      return false;
    }
    if (self.isBomb) {
      state = 1;
    } else {
      state = 3;
      text = bombs;
    }
  }

  self.isPressed = function () {
    return state === 3;
  }

  self.isFlag = function () {
    return state === 2;
  }

  return self;
};

var game = function () {
  var self = {};

  var logicBoard = null;

  self.init = function (boardHeight, boardWidth, amountOfMines) {
    logicBoard = {
      h: self.boardHeight,
      w: self.boardWidth,
      field: []
    };
    var i, j;
    for (i = 0; i < logicBoard.h; i++) {
      var row = [];
      for (j = 0; j < logicBoard.w; j++) {
        row.push(spot(self));
      }
      logicBoard.field.push(row);
    }

    var bombs = self.amountOfMines;

    while (bombs) {
      var posX = Math.floor(Math.random()*logicBoard.w);
      var posY = Math.floor(Math.random()*logicBoard.h);
      if (posX < logicBoard.w && posY < logicBoard.h) {
        if (!logicBoard.field[posY][posX].isBomb) {
          logicBoard.field[posY][posX].isBomb = true;
          bombs = bombs - 1;
        }
      }
    }

    self.render(self.toData());
  };

  function around (x, y, callback) {
    var promise = {};
    for (i = Math.max(+x-1, 0); i < Math.min(logicBoard.w, +x+2); i++) {
      for (j = Math.max(+y-1, 0); j < Math.min(logicBoard.h, +y+2); j++) {
        var result = callback(logicBoard.field[j][i], i, j);
        if (result === false) {
          return;
        }
      }
    }
  }

  function bombsAround (x, y) {
    var count = 0;
    
    around(x, y, function(spt){
      count += spt.isBomb ? 1 : 0;
    });
    
    return count;
  }

  function flagsAround (x, y) {
    var count = 0;

    around(x, y, function(spt){
      count += spt.isFlag() ? 1 : 0;
    });

    return count;
  }


  var max = 0;
  function pressSequenceRec (x , y, spotVisited, num) {
    /*num = num || 0;
    num += 1;
    if (num > max) {
      console.log(num);
      max = num;
    }*/
    //Check bounds
    if (x < 0 || y < 0 || x >= logicBoard.w || y >= logicBoard.h) {
      return undefined;
    }
    var spt = logicBoard.field[y][x];
    if (spt.isBomb || spotVisited.indexOf(spt) >= 0){
      console.log(spt.isBomb);
      return undefined;
    }
    spotVisited.push(spt);

    var ba = bombsAround(x, y);
    spt.setPress(ba);
    if (ba === 0) {
      //If it hasn't bombs around, continue
      pressSequence(x, +y-1, spotVisited, num);
      pressSequence(x, +y+1, spotVisited, num);
      pressSequence(+x-1, y, spotVisited, num);
      pressSequence(+x+1, y, spotVisited, num);
      pressSequence(+x-1, +y-1, spotVisited, num);
      pressSequence(+x+1, +y+1, spotVisited, num);
      pressSequence(+x-1, +y+1, spotVisited, num);
      pressSequence(+x+1, +y-1, spotVisited, num);
    }
  }

  function pressSequence (spotToVisit) {
    /*num = num || 0;
    num += 1;
    if (num > max) {
      console.log(num);
      max = num;
    }*/
    //Check bounds

    while (spotToVisit.length) {
      // var current = /(\d+)\-(\d+)/.exec(spotToVisit.pop());
      var current = spotToVisit.pop();
      var x = current[0];
      var y = current[1];

      if (x < 0 || y < 0 || x >= logicBoard.w || y >= logicBoard.h) {
        continue;
      }

      var spt = logicBoard.field[y][x];

      if (spt.isBomb || spt.isPressed()){
        continue;
      }

      var ba = bombsAround(x, y);
      spt.setPress(ba);
      if (ba === 0) {
        //If it hasn't bombs around, continue
        spotToVisit.push([x, +y-1]);
        spotToVisit.push([x, +y+1]);
        spotToVisit.push([+x-1, y]);
        spotToVisit.push([+x+1, y]);
        spotToVisit.push([+x-1, +y-1]);
        spotToVisit.push([+x+1, +y+1]);
        spotToVisit.push([+x-1, +y+1]);
        spotToVisit.push([+x+1, +y-1]);
      }
    }
  }

  function pressAll () {
    var i, j;
    for (i = 0; i < logicBoard.h; i++) {
      for (j = 0; j < logicBoard.w; j++) {
        logicBoard.field[i][j].setPress(bombsAround(j,i));
      }
    }
  }

  self.toData = function () {
    var result = [], i, j;
    for (i = 0; i < logicBoard.h; i++) {
      var row = [];
      for (j = 0; j < logicBoard.w; j++) {
        row.push(logicBoard.field[i][j].toData());
      }
      result.push(row);
    }
    return result;
  };

  self.clickZone = function (y, x) {
    var spotPressed = logicBoard.field[y][x];
    if (spotPressed.isPressed()) {
      var ba = bombsAround(x, y);
      var fa = flagsAround(x, y);
      if (ba === fa) {
        var spotToVisit = [];
        around(x, y, function (spt, i, j) {
          if (!spt.isFlag()){
            if (!spt.isBomb){
              //pressSequence([[i, j]]);
              spotToVisit.push([i, j]);
            } else {
              //GameOver
              console.log('GameOver');
              pressAll();
              return false;
            }
          }
        });
        pressSequence(spotToVisit);
        self.render(self.toData());
      }
    }
  };

  self.click = function (y, x) {
    var spotPressed = logicBoard.field[y][x];
    if (!spotPressed.isBomb){
      pressSequence([[x, y]]);
    } else {
      //GameOver
      console.log('GameOver');
      pressAll();
    }
    self.render(self.toData());
  };

  self.rightClick = function (y, x) {
    logicBoard.field[y][x].change();
    self.render(self.toData());
  };

  return self;
};
