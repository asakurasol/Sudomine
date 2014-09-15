if (!Array.prototype.fill) {
  Array.prototype.fill = function(value) {

    // Steps 1-2.
    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    var O = Object(this);

    // Steps 3-5.
    var len = O.length >>> 0;

    // Steps 6-7.
    var start = arguments[1];
    var relativeStart = start >> 0;

    // Step 8.
    var k = relativeStart < 0 ?
      Math.max(len + relativeStart, 0) :
      Math.min(relativeStart, len);

    // Steps 9-10.
    var end = arguments[2];
    var relativeEnd = end === undefined ?
      len : end >> 0;

    // Step 11.
    var final = relativeEnd < 0 ?
      Math.max(len + relativeEnd, 0) :
      Math.min(relativeEnd, len);

    // Step 12.
    while (k < final) {
      O[k] = value;
      k++;
    }

    // Step 13.
    return O;
  };
}

function Cell(number){
	this.number = number;
	this.sensor = 0;
	this.position = "middle";
	this.mine = false;
	this.revealed = false;
	this.appearance = '';
	this.flagged = false;
	this.nextTo=[];
}

Cell.prototype.setMine = function(){
	this.mine = true;
}

function Game(size){

	//generate a cell to fill up the board
	var cells = [].fill.call({ length: size*size },'');
	for(var i = 0; i < cells.length; i++){
		cells[i]= new Cell(i);
	};

	//randomly generate the mine locations
	var mineLocations = this.generateMines(size*size, 10);

	_.each(mineLocations, function(location){
		cells[location].setMine();
	})

	//update position of the cells in the game board
	this.updateProps(cells,size);

	//split cells by columns for easy rendering later
	var counter = 0;
	var board = [];
	for(var i = 0; i < size; i++){
		var column = [];
		for(var j = 0; j<size;j++){
			column.push(cells[counter]);
			counter++
		}
		board.push(column);
	};

	//output the board
	this.size = size;
	this.board = board;
} 

Game.prototype.generateMines = function(boardsize, mines){
	var cells = boardsize * boardsize;
	var result = [];
	var getRandom = function(array){
		var result = Math.floor(Math.random()*boardsize);
		if(_.contains(array, result)){
			return getRandom(array);
		}
		else {
			return result;
		}
	}
	for(var i = 0; i < mines; i++){
		result.push(getRandom(result));
	}
	return result;
}

Game.prototype.updateProps = function(array, size){
	var self = this;
	var assignPosition = function(i, size){
		//corner cases
		if(i == 0){
			return "top-left"
		}
		else if (i == array.length-1){
			return "bot-right"
		}
		else if(i == size-1){
			return "bot-left"
		}
		else if(i == array.length-size){
			return "top-right"
		}
		else if(i<size){
			return "left"
		}
		else if(i>array.length-size){
			return "right"
		}
		else if(i%size ==0){
			return "top"
		}
		else if((i+1)%size ==0){
			return "bot"
		}
		else{
			return "middle"
		}
	}

	_.each(array, function(cell){
		cell.position = assignPosition(cell.number, size);
		cell.nextTo = self.updateNextTo(cell.position, cell.number, size);
		cell.sensor = self.updateSensor(cell.nextTo, array);
		cell.appearance = self.updateAppearance(cell.mine, cell.sensor);
	})
	return array;
};

Game.prototype.updateNextTo = function(type, index, size){
	var top = index -1
	var bot = index + 1
	var left = index - size;
	var right = index + size;
	var top_left = index - size - 1;
	var top_right = index + size - 1;
	var bot_left = index - size + 1;
	var bot_right = index + size + 1;

	if(type === "top-left"){
		return [right, bot_right, bot]
	}
	else if(type === "bot-right"){
		return [top, left, top_left]
	}
	else if (type === "bot-left"){
		return [top, right, top_right]
	}
	else if (type === "top-right"){
		return [bot, left, bot_left]
	}
	else if (type === "top"){
		return [left, right, bot, bot_left, bot_right]
	}
	else if (type === "bot"){
		return [left, right, top, top_left, top_right]
	}
	else if (type === "left"){
		return [top, bot, right, bot_right, top_right]
	}
	else if (type === "right"){
		return [top, bot, left, bot_left, top_left]
	}

	else {
		return [top, bot, left, right, top_right, top_left, bot_left, bot_right]
	}
}
Game.prototype.updateSensor = function(nextTo, array){
	var result = 0;
	return _.reduce(nextTo, function(result, index){
		if(array[index].mine){
			return ++result;
		}
		return result
	}, result)
}
Game.prototype.updateAppearance = function(isMine, sensor){
	if(isMine){
		return 'X'
	}
	else if (sensor == 0){
		return '-'
	}
	else {
		return sensor;
	}
}

Game.prototype.find = function(index){
	var array = Math.floor(index / this.size);
	var element = index%this.size;
	return this.board[array][element];
}

Game.prototype.reveal = function(cell){
	var revealed = []
	var self = this;
	var recurse = function(cell){
			revealed.push(cell);
			var ele = self.find(cell);
		if(!ele.flagged){
			ele.reveal = true;

			if (ele.sensor == 0 && !ele.mine){
				_.each(ele.nextTo, function(cell){
					if(!_.contains(revealed, cell))
						{
							recurse(cell);
						}
				})
			}
		}
	};
	recurse(cell);
}

Game.prototype.flag = function(cell){
	var self = this;
	var ele = self.find(cell);
	if(ele.reveal){
	}
	else if (ele.flagged){
		ele.flagged = false;
		ele.appearance = self.updateAppearance(ele.mine, ele.sensor);
	}
	else{
		ele.flagged = true;
		ele.appearance = 'F'
	}
}

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope) {
	$scope.game = new Game(9);
	$scope.board = $scope.game.board;
	$scope.test = function(cell) {
		console.log("single")
	    $scope.game.reveal(cell.number);
	}
	$scope.doubleClick = function(cell) {
		console.log("double")
	};
	$scope.rightClick = function(cell) {
		console.log("right")
		$scope.game.flag(cell.number);
	};
	$scope.myFunct = function(keyEvent, cell) {
	  console.log(keyEvent);
	  if (keyEvent.which === 32)
	    console.log(cell);
	}
}])

.directive('sglclick', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
          var fn = $parse(attr['sglclick']);
          var delay = 200, clicks = 0, timer = null;
          element.on('click', function (event) {
            clicks++;  //count clicks
            if(clicks === 1) {
              timer = setTimeout(function() {
                scope.$apply(function () {
                    fn(scope, { $event: event });
                }); 
                clicks = 0;             //after action performed, reset counter
              }, delay);
              } else {
                clearTimeout(timer);    //prevent single-click action
                clicks = 0;             //after action performed, reset counter
              }
          });
        }
    };
}])

.directive('rightclick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.rightclick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});
/*
.directive('ngSpace', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 32) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngSpace);
                });

                event.preventDefault();
            }
        });
    };
});*/



