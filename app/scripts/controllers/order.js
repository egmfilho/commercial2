/*
* @Author: egmfilho
* @Date:   2017-05-25 17:59:28
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-02 13:09:00
*/
(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('OrderCtrl', OrderCtrl);

	OrderCtrl.$inject = [ '$rootScope', '$scope', '$timeout', '$q', '$mdPanel', 'Constants', 'ProviderPerson', 'Person', 'Print' ];

	function OrderCtrl($rootScope, $scope, $timeout, $q, $mdPanel, constants, providerPerson, Person, Print) {

		var self = this;

		self.getPersonByCode = getPersonByCode;
		self.getPersonByName = getPersonByName;	
		self.editItemMenu    = editItemMenu;
		self.showDialog      = showDialog;
		self.scrollTo        = scrollTo;
		self.savePDF 		 = Print.savePDF;

		// ******************************
		// Methods declaration
		// ******************************

		/**
		* Pesquisa pessoa pelo codigo.
		* @param {string} code - O codigo da pessoa.
		* @param {string} type - Tipo ('Cliente' ou 'Vendedor').
		*/
		function getPersonByCode(code, type) {
			if (!code) return;

			providerPerson.getByCode(code, 'Cliente').then(function(success) {
				console.log(new Person(success.data));
			}, function(error) {			
				if (constants.debug) console.log(error);
			});
		}

		/**
		* Pesquisa pessoa pelo nome.
		* @param {string} name - O nome da pessoa.
		* @param {string} type - Tipo ('Cliente' ou 'Vendedor').
		*/
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

		function editItemMenu($mdMenu, event) {
			$mdMenu.open(event);
		}

		function showDialog() {

			var dialog = $rootScope.customDialog();

			dialog.showTemplate('Template', './partials/modalNewPerson.html', ['Person', 'mdPanelRef', function(Person, mdPanelRef) {
				this.customer = new Person();

				this.teste = function() {
					alert('Tell me your secrets...');
				};

				this.positiveButton = {
					label: 'Texas',
					action: function() {
						mdPanelRef.close();
					}
				};
			}]);
		}

		/**
		* Pesquisa pessoa pelo nome.
		* @param {(string|element)} selector - O elemento para qual o scroll vai rolar.
		*/
		function scrollTo(selector) {
			var container = jQuery('#order'),
				target    = jQuery(selector)[0].offsetTop;

			container.animate({
				scrollTop: target - 5
			});
		}
	}
}());