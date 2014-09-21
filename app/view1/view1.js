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
function Sudoku(number){
	this.seed = [
		[9,6,7,1,8,4,3,2,5],
		[3,5,1,9,7,2,4,6,8],
		[4,2,8,6,5,3,1,9,7],
		[1,4,5,2,6,8,9,7,3],
		[8,7,3,4,9,1,6,5,2],
		[2,9,6,5,3,7,8,4,1],
		[7,8,4,3,2,9,5,1,6],
		[5,3,9,7,1,6,2,8,4],
		[6,1,2,8,4,5,7,3,9],
	]

	this.puzzle = this.scramble(number);
}

Sudoku.prototype.scramble = function(number){
	var result = _.flatten(this.seed);
	result = this.swapTrans(result, number)
	return result;
}


//takes an array and returns a random array of non-repeating numbers
Sudoku.prototype.randomArray = function(array, length){
	var copy = array.slice();
	var result = [];
	for(var i = 0; i < length; i++){
		var random = Math.floor(Math.random()*copy.length);
		result.push(copy[random]);
		copy.splice(random, 1);
	}
	return result;
};

//return 2 random numbers between 1-9 for number swapping
Sudoku.prototype.random9 = function(){
	var arr = [1,2,3,4,5,6,7,8,9];
	return this.randomArray(arr, 2);
}

//return 2 random numbers between 0-2 for row block or column block swapping 
Sudoku.prototype.random3 = function(){
	var arr = [0,1,2];
	return this.randomArray(arr, 2);
}

//return 2 random numbers wihin 0-2, 3-5, 6-8 for row or column swapping
Sudoku.prototype.random2in3 = function(){
	var arr = [0,1,2];
	var rand = Math.floor(Math,random()*3)*3
	return _.map(this.randomArray(arr, 2), function(ele){
		return ele + rand;
	});
}

Sudoku.prototype.swapRows = function(){

}

Sudoku.prototype.swapColumns = function(){

}

//swap numbers within the array n times
Sudoku.prototype.swapTrans = function(array,n){

	if(n<=0){
		return array;
	}
	else{
		var randoms = this.random9();
		var num1 = randoms[0];
		var num2 = randoms[1];
		_.each(array, function(num){
			if (n === num1){
				n = num2;
			}
			else if (n ===num2){
				n = num1;
			}
		});
		return this.swapTrans(array, n-1)
	}
}

function Cell(number, sudokuNum){

	//mine sweeper mechanics
	this.number = number;
	this.sensor = 0;
	this.position = "middle";
	this.mine = false;
	this.reveal = false;
	this.appearance = '';
	this.flagged = false;
	this.nextTo=[];

	//minesweeper displays

	this.cellClass = '';
	this.textClass = '';

	//sudoku mechanics
	this.sudokuNum = sudokuNum;
	this.sudokuGuess = '';
}

Cell.prototype.setMine = function(){
	this.mine = true;
}

function Game(size,mines){
	var self = this;
	//create the puzzle for sudoku
	this.sudoku = new Sudoku(3);
	console.log(this.puzzle);

	//generate a cell to fill up the board
	var cells = [].fill.call({ length: size*size },'');
	for(var i = 0; i < cells.length; i++){
		cells[i]= new Cell(i, this.sudoku.puzzle[i]);
	};

	//randomly generate the mine locations
	var mineLocations = this.generateMines(size*size, mines);

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

	//output the board for mine sweepers
	this.size = size;
	this.board = board;
	this.mines = mines;
	this.flags = mines;
	this.status = 'o_o';
	this.sweeper = true;
	this.first = _.once(self.firstClick);
	this.controls = [1,2,3,4,5,6,7,8,9];
	this.lives = [1,2,3];
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
		if(!cell.mine) {
			cell.textClass = self.updateSensorClass(cell.sensor);
		};
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

Game.prototype.updateSensorClass = function(n){
	if(n == '1'){
		return 'one';
	}
	else if (n=='2'){
		return 'two'
	}
	else if (n=='3'){
		return 'three'
	}
	else if (n=='4'){
		return 'four'
	}
	else if (n=='5'){
		return 'five'
	}
	else if (n=='6'){
		return 'six'
	}
	else if (n=='7'){
		return '7'
	}
	else if (n=='8'){
		return '8'
	}
	else {
		return '';
	};
	

}
Game.prototype.updateAppearance = function(isMine, sensor){
	if(isMine){
		return ''
	}
	else if (sensor == 0){
		return '.'
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
			ele.cellClass = 'revealed';
			if (ele.mine){
				self.gameover();
			};
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

Game.prototype.firstClick = function(cell){
	var left;
	var self = this;

	var refresh = function(){
		var cells = _.flatten(self.board);
		_.each(cells, function(cell){
			cell.sensor = self.updateSensor(cell.nextTo, cells);
			if(!cell.mine) {
				cell.textClass = self.updateSensorClass(cell.sensor);
			};
			cell.appearance = self.updateAppearance(cell.mine, cell.sensor);
		})
	};

	var moveMine = function(cell){
		console.log("moved a mine");
		cell.mine = false;
		self.placeMine(cell.nextTo);
	}

	console.log('first click');

	if(cell.number < 40){
		left = true
	}
	else {
		left = false;
	};

	if(!cell.mine && cell.sensor === 0){
		console.log("no movement needed");
		return '';
	}
	else if(!cell.mine && cell.sensor !== 0){
		console.log('not mine, but sensor');
		_.each(cell.nextTo, function(n){
			var cell = self.find(n);
			if(cell.mine){
				moveMine(cell);
			}
		})
		refresh();
	}
	else if(cell.mine && cell.sensor !== 0){
		console.log('mine and sensor')
		moveMine(cell);
		_.each(cell.nextTo, function(n){
			var cell = self.find(n);
			if(cell.mine){
				moveMine(cell);
			}
		})
		refresh();
	}
	else if(cell.mine){
		console.log('just a mine');
		moveMine(cell);
		refresh();
	}
}


//go down an array and place a mine on the first non-mine cell
//return true if mine is placed, return false if not
Game.prototype.placeMine = function(array){
	var self = this;
	var rand = function(){
		return Math.floor(Math.random()*81);
	}
	var recurse = function(){
		var cell = self.find(rand());
		if(cell.mine || _.contains(array,cell.number)){
			return recurse();
		}
		else{
			cell.mine = true;
			cell.textClass = '';
			console.log("moved a mine to " + cell.number);
			return cell.number;			
		}
	}
	return recurse();
}

Game.prototype.revealTarget = function(cell){
	this.find(cell).reveal = true;
	this.find(cell).cellClass = 'revealed';
};

Game.prototype.flag = function(cell){
	var self = this;
	var ele = self.find(cell);
	if(ele.reveal || self.flags <= 0){
	}
	else if (ele.flagged){
		ele.flagged = false;
		self.flags++;
		ele.appearance = self.updateAppearance(ele.mine, ele.sensor);
	}
	else{
		ele.flagged = true;
		self.flags--;
		ele.appearance = '';
	}
}

Game.prototype.checkFlag = function(cell){
	var self = this;
	var ele = self.find(cell);
	var flags = 0;
	var sensorMatchFlag = true;
	var flagMatchMine = true;

	_.each(ele.nextTo, function(cell){
		var neighbor = self.find(cell);
		if(neighbor.mine && !neighbor.flagged){
			flagMatchMine = false;
		};
		if(neighbor.flagged){
			flags++;
		}
	})

	if(!(flags === ele.sensor)){
		sensorMatchFlag = false;
	}

	if (!sensorMatchFlag || !ele.reveal){		
	}
	else if (!flagMatchMine){
		this.gameover();
	}
	else{
		_.each(ele.nextTo, function(cell){
			var neighbor = self.find(cell);
			if(!neighbor.flagged)
				{
					self.reveal(neighbor.number);
				}
		})
	}
};

Game.prototype.gameover = function(){
	console.log("Game over!");
	var self = this;
	var array = _.flatten(self.board);
	_.each(array, function(element){
		if(element.mine && !element.flagged){
			self.revealTarget(element.number);
		}
	})
	this.status = "x_X";
};

Game.prototype.checkForWin = function(){
	if(this.status==="x_X"){
		console.log("game is already over");
		return;
	}
	var self = this;
	var array = _.flatten(self.board);
	var revealed = 0;
	revealed = _.reduce(array, function(result, element){
		if(element.reveal){
			return ++result;
		}
		return result;
	},revealed);
	if(revealed === array.length-self.mines){
		this.status = "^_^";
	}
}

Game.prototype.setValue = function(cell,value){
	if(cell.sudokuNum === value){
		cell.sudokuGuess = value;
		if(cell.mine && !cell.flagged){
			this.flag(cell.number);
		}
		else if(cell.mine && cell.flagged){
		}
		else{
			this.revealTarget(cell.number)
		}
	}
	else{
		this.lives.splice(0,1);
		if(this.lives.length === 0){
			this.gameover();
		}
	};
}

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope) {
	$scope.game = new Game(9,15);
	$scope.cursorValue = '';

	$scope.newGame = function(){
		$scope.game = new Game(9,15);	
	};
	$scope.reveal = function(cell) {
		if($scope.game.sweeper){
		    $scope.game.first(cell);
		    $scope.game.reveal(cell.number);
		}
		else{
			console.log('this gets called');
			$scope.game.setValue(cell, $scope.cursorValue);
			$scope.cursorValue = '';
		}
		$scope.game.checkForWin();
	};
	$scope.doubleClick = function(cell) {
		if($scope.game.sweeper){
			$scope.game.checkFlag(cell.number);
		    $scope.game.checkForWin();
		}
		else{

		}
	};
	$scope.rightClick = function(cell) {
		if($scope.game.sweeper){
			console.log('right clicked');
			$scope.game.flag(cell.number);
			$scope.flags = $scope.game.flags;
		}
		else {

		}
	};
	$scope.switch = function(){
		if($scope.game.sweeper){
			$scope.game.sweeper = false;
		}
		else{
			$scope.game.sweeper = true;			
		}
	}

	$scope.getValue = function(value){
		$scope.cursorValue = value;
		console.log($scope.cursorValue);
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




