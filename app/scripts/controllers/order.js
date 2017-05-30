/*
* @Author: egmfilho
* @Date:   2017-05-25 17:59:28
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 17:46:41
*/
'use strict';

angular.module('commercial2.controllers')
	.controller('OrderCtrl', OrderCtrl);

OrderCtrl.$inject = [ '$rootScope', '$scope', '$timeout', '$q', '$mdPanel', 'Constants', 'ProviderPerson', 'Person' ];

function OrderCtrl($rootScope, $scope, $timeout, $q, $mdPanel, constants, providerPerson, Person) {

	var self = this;

	self.getPersonByCode = getPersonByCode;
	self.getPersonByName = getPersonByName;
	self.showDialog      = showDialog;

	// ******************************
	// Methods declaration
	// ******************************

	function getPersonByCode(code, type) {
		if (!code) return;

		providerPerson.getByCode(code, 'Cliente').then(function(success) {
			console.log(new Person(success.data));
		}, function(error) {			
			if (constants.debug) console.log(error);
		});
	}

	function getPersonByName(name, type) {
		if (!name || !type) return;

		var deferred = $q.defer();
		providerPerson.getByName(name, type, 10).then(function(success) {
			var array = [ ];
			angular.forEach(success.data, function(item) {
				array.push(new Person(item));
			});
			deferred.resolve(array);
		}, function(error) {
			if (constants.debug) console.log(error);
			deferred.reject();
		});

		return deferred.promise;
	}

	function showDialog() {
		var position = $mdPanel.newPanelPosition().absolute().center(),
			config = {
				attatchTo: angular.element(document.body),
				controller: ['mdPanelRef', function(mdPanelRef) {
					this.closeDialog = function() {
						if (mdPanelRef) mdPanelRef.close();
					}
				}],
				controllerAs: 'ctrl',
				templateUrl: './partials/modalNewPerson.html',
				panelClass: 'custom-dialog',
				hasBackdrop: true,
				position: position,
				trapFocus: true,
				zIndex: 150,
				clickOutsideToClose: true,
				escapeToClose: true,
				focusOnOpen: true
			};

		$mdPanel.open(config).then(function(result) {
			console.log(result);
		});
	}

/****************************************************************************************/

	// list of `state` value/display objects
	self.states        = loadAll();
	self.selectedItem  = null;
	self.searchText    = null;
	self.querySearch   = querySearch;

	self.toast         = $rootScope.toast;

	self.editItemMenu  = editItemMenu;

	// ******************************
	// Internal methods
	// ******************************

	/**
	 * Search for states... use $timeout to simulate
	 * remote dataservice call.
	 */
	function querySearch (query) {
		var results = query ? self.states.filter( createFilterFor(query) ) : self.states;
		var deferred = $q.defer();
		$timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
		return deferred.promise;
	}

	/**
	 * Build `states` list of key/value pairs
	 */
	function loadAll() {
		var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
			Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
			Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
			Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
			North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
			South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
			Wisconsin, Wyoming';

		return allStates.split(/, +/g).map( function (state) {
			return {
				value: state.toLowerCase(),
				display: state,
				code: (Math.random() * 1000 + 1000).toFixed()
			};
		});
	}

	/**
	 * Create filter function for a query string
	 */
	function createFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);

		return function filterFn(state) {
			return (state.value.indexOf(lowercaseQuery) === 0);
		};

	}

	function editItemMenu($mdMenu, event) {
		$mdMenu.open(event);
	}
}