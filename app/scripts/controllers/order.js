/*
* @Author: egmfilho
* @Date:   2017-05-25 17:59:28
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-29 13:59:22
*/
'use strict';

angular.module('commercial2.controllers')
	.controller('OrderCtrl', OrderCtrl);

OrderCtrl.$inject = [ '$scope', '$timeout', '$q', '$mdToast', 'Constants', 'ProviderPerson', 'Person' ];

function OrderCtrl($scope, $timeout, $q, $mdToast, constants, providerPerson, Person) {

	var self = this;

	self.getPersonByCode = getPersonByCode;

	// ******************************
	// Methods declaration
	// ******************************

	function getPersonByCode(code) {
		if (!code) return;

		providerPerson.getByCode(code, 'Cliente').then(function(success) {
			console.log(new Person(success.data));
		}, function(error) {			
			if (constants.debug) console.log(error);
		});
	}


	// list of `state` value/display objects
	self.states        = loadAll();
	self.selectedItem  = null;
	self.searchText    = null;
	self.querySearch   = querySearch;

	self.toast         = toast;

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

	function toast(message) {
		$mdToast.show(
			$mdToast.simple()
				.textContent(message)
				.position('bottom right')
				.hideDelay(3000)
		);
	}

	function editItemMenu($mdMenu, event) {
		$mdMenu.open(event);
	}
}