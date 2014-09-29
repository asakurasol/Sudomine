angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View1Ctrl2'
  });
}])

.controller('View1Ctrl2', ['$scope', function($scope) {
	$scope.game = new Game(18,60);
	$scope.cursorValue = '';

	$scope.newGame = function(){
		$scope.game = new Game(18,60);	
	};
	$scope.reveal = function(cell) {
		if($scope.game.sweeper){
		    $scope.game.first(cell);
		    $scope.game.reveal(cell.number);
		}
		else{
			//there is an error here
			if(Boolean($scope.cursorValue))
				{
					$scope.game.setValue(cell, $scope.cursorValue);
				}

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
			$scope.game.pullup = '';
		}
		else{
			$scope.game.sweeper = true;		
			$scope.game.pullup = 'pullup';	
		}
	}

	$scope.getValue = function(value){
		$scope.cursorValue = value;
		console.log($scope.cursorValue);
	}
}])



