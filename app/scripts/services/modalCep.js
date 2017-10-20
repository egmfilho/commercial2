/*
 * @Author: egmfilho
 * @Date:   2017-08-09 08:39:25
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 14:05:03
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalCep', ['$rootScope', 'Constants', function($rootScope, constants) {


			function show() {
				var controller = function(providerCep, Cep, providerDistrict, District, providerCity, City) {
					var scope = this;

					this._showCloseButton = true;

					this.filters = new Cep();
					this.result = new Array();

					this.searchDistrict = function(e, query) {
						var options = {
							limit: 10
						};

						e && e.stopPropagation();

						providerDistrict.getByName(query, options).then(function(success) {
							scope.queryDistrictResult = success.data.map(function(d) { return new District(d) });
						}, function(error) {
							constants.debug && console.log(error);
						});
					};

					this.searchCity = function(e, query) {
						var options = {
							limit: 10
						};

						e && e.stopPropagation();

						providerCity.getByName(query, options).then(function(success) {
							scope.queryCityResult = success.data.map(function(c) { return new City(c) });
						}, function(error) {
							constants.debug && console.log(error);
						});
					};

					this.search = function() {
						$rootScope.loading.load();
						scope.result = new Array();
						this.selected = null;
						var options = {
								getUF: true,
								getCity: true,
								getDistrict: true,
								limit: 200
							}, filters = {
								cep_code: scope.filters.cep_code,
								public_place: scope.filters.public_place,
								district_id: scope.filters.district.district_id,
								city_id: scope.filters.city.city_id,
								uf_id: scope.filters.uf_id
							};
						providerCep.get(filters, options).then(function(success) {
							scope.result = success.data.map(function(c) {
								return new Cep(c);
							});
							$rootScope.loading.unload();
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Aviso', error.data.status.description);
						});
					};

					this.select = function(c) {
						this.selected = new Cep(c);
					};

					this.clear = function() {
						scope.filters = new Cep();
					};

					this.orderBy = {
						property: 'public_place',
						inverse: false
					};

					this.isOrderedBy = function(propertyName) {
						return scope.orderBy.property === propertyName;
					};

					this.sort = function(propertyName) {
						scope.orderBy.inverse = (scope.orderBy.property === propertyName) ? !scope.orderBy.inverse : false;
						scope.orderBy.property = propertyName;
					};

					(function(vm) {
						vm.searchDistrict();
						vm.searchCity();
					}(this));
				};

				controller.$inject = [ 'ProviderCep', 'Cep', 'ProviderDistrict', 'District', 'ProviderCity', 'City' ];

				return $rootScope.customDialog().showTemplate('Buscar CEP', './partials/modalCep.html', controller, {
					width: 800,
					zIndex: 2,
					hasBackdrop: true
				});
			}

			return {
				show: show
			};

		}]);

})();