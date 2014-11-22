var appControllers = angular.module("Warehouse.Controllers", []);

appControllers.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.transformResponse = function (data) {
		//desperate measure :/
		var parsedData = data.split("\n");
        //remove empty row 		
		parsedData.pop();
		//parse new-line json to object
		var result = "[";
		var i = 0;

		parsedData.forEach(function (item) {
			result = result + item;
			if (i < parsedData.length - 1) {
				result = result + ",";
			}
			i++;
		});

		result = result + "]";
		
		//hack to skip parsing JSON on html response (find a better way to do this, it's not acceptable...)
		if (data[0] === '<') {
			return data;
        } else {
			//convert to json object
			var returnVal = JSON.parse(result);
			return returnVal;
		}
		
    };
}]);


//products controller
appControllers.controller("productsCtrl", function ($scope, $http) {
	
	//cg-busy properties
    $scope.delay = 0;
    $scope.minDuration = 0;
    $scope.message = 'Please Wait...';
    $scope.backdrop = true;
    $scope.promise = null;
    $scope.templateUrl = '/partials/custom-template.html';
    //product catalog properties
    $scope.products = [];
    $scope.productsCache = [];
	$scope.sortBy = "id";
	$scope.skipFirst = 0; 	

	$scope.getNextProducts = function() {
		//check if products are cached
		if ($scope.productsCache.length > 0) {
			//load pre-fetched products
			$scope.products = $scope.products.concat($scope.productsCache);
			$scope.productsCache = []; //clean cache to fill in later async request 
		} else {
			//check if there are no products (first load)
			if ($scope.products.length == 0) {
				//first load
				$scope.promise = $http({method: "GET",
	 					url: "/api/products?limit=20&sort=" + $scope.sortBy + "&skip=" + $scope.skipFirst
	 			}).success(function (data) {
	 				//check if query returned rows
	 				if (data.length > 0) {
	 					$scope.products = data;
	 					//push in sponsored link.
	 					$scope.products.push({"id":"z-sponsor","size":12,"price":1000000000,"face":"/ad/?r=" + Math.floor(Math.random()*1000)});
	 					//$scope.skipFirst = $scope.skipFirst + 20;
	 				}
				});
	 		}
		}

		//get next 20 products for cache, silently load
        $scope.skipFirst = $scope.skipFirst + 20;
		$http({method: "GET",
	 					url: "/api/products?limit=20&sort=" + $scope.sortBy + "&skip=" + $scope.skipFirst
	 	}).success(function (data) {
	 		//check if query returned rows
	 		if (data.length > 0) {
	 			//push in sponsored link.
	 			data.push({"id":"z-sponsor","size":12,"price":1000000000,"face":"/ad/?r=" + Math.floor(Math.random()*1000)});
	 			//set next 10 products in cache
	 			$scope.productsCache = data;
	 		}
	 	});	
	}

	$scope.sortProducts = function() {

		//sorting code changed to use API.
		//reset list of products
        $scope.products = [];
        
        //reset products cache
        $scope.productsCache = [];
        
        //reset skip variable
        $scope.skipFirst = 0;
        
        //call for next products
        $scope.getNextProducts();
        
	}

	//first load
	$scope.getNextProducts();

});