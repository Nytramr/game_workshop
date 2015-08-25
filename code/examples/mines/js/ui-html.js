
// init DOM elements
var htmlGame = (function () {
  var gameLogic = game();

  //When a input changes, the game resets
  var inputs = document.getElementsByClassName('input-number');

  [].forEach.call(inputs, function(elem){
    //Init variables
    gameLogic[utils.camelize(elem.name)] = Number(elem.value);

    //listen to the change event
    elem.addEventListener('change', function(ev){
      gameLogic[utils.camelize(ev.target.name)] = Number(ev.target.value);
    });
  });

  //board
  var board = document.getElementById('board');

  function addRemoveElements (parent, newAmmount, className) {
    // Add or remove depending of the amount of rows
    var common = Math.min(newAmmount, parent.childElementCount);

    if (newAmmount > common) {
      //adding rows
      for (var i = common; i < newAmmount; i++) {
        var child = document.createElement('div');
        child.classList.add(className);
        parent.appendChild(child);
      }
    } else {
      //Remove
      for (var i = parent.childElementCount - 1; i >= common; i--) {
        parent.removeChild(parent.childNodes[i]);
      }
    }
  }

  function compareRow (row, index) {
    for (var j = 0; j < row.length; j++) {
      //id
      if (!board.children[index].children[j].id){
        board.children[index].children[j].id = 'r'+index+'c'+j; 
      }
      //class
      if (!board.children[index].children[j].classList.contains(row[j].status)) {
        board.children[index].children[j].className = "spot " + row[j].status;
        board.children[index].children[j].textContent = row[j].label || "";
      }
    }
  }

  gameLogic.render = function (data) {
    //Render as html
    
    //Comparing rows
    addRemoveElements(board, data.length, 'row');

    //spots
    for (var i = data.length - 1; i >= 0 ; i--) {
      addRemoveElements(board.children[i], data[i].length, 'spot');
      compareRow(data[i], i);
    }
  };

  document.getElementById('initgame').addEventListener('click', function (ev) {
    gameLogic.init();
  });
  //Prevent context menu
  board.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  //mouse control
  // I did it with mouse down and up to control wich button is pressed
  var elementId = "";
  board.addEventListener('mousedown', function (e) {
    e.preventDefault();
    elementId = e.target.id;
  });

  board.addEventListener('mouseup', function (e) {
    if (elementId === e.target.id) {
      if (e.target.classList.contains('spot')) {
        e.preventDefault();
        var idParts = /r(\d+)c(\d+)/.exec(e.target.id);
        if (e.button === 0) {
          if (e.shiftKey) {
            gameLogic.clickZone(idParts[1], idParts[2]);
          } else {
            gameLogic.click(idParts[1], idParts[2]);
          }
        } else if (e.button === 2) {
          gameLogic.rightClick(idParts[1], idParts[2]);
        }
      }
    }
    elementId = "";
  });
})();
