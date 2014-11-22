var appFilters = angular.module("Warehouse.Filters", []);

appFilters.filter("moneyFormat", function() {

	return function (input) {	
			return angular.isNumber(input) ? "$" + (input/100).toFixed(2) : "";		
	}	
});