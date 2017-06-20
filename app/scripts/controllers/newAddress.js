/*
* @Author: egmfilho
* @Date:   2017-06-08 09:24:23
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-20 13:52:24
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('NewAddressCtrl', NewAddressCtrl);

	NewAddressCtrl.$inject = [ 
		'$rootScope',
		'$scope', 
		'$http',
		'ProviderAddress',
		'Address', 
		'ProviderDistrict', 
		'District', 
		'ProviderCity', 
		'City', 
		'Globals',
		'Constants' 
	];

	function NewAddressCtrl($rootScope, $scope, $http, providerAddress, Address, providerDistrict, District, providerCity, City, Globals, constants) {

		var self = this, _personId = null;

		self.types               = [ 'AV', 'EST', 'PC', 'RUA', 'ROD' ];
		
		self.newAddress          = new Address();

		self.getCep              = getCep;
		self.queryDistrict       = null;
		self.queryDistrictResult = [ ];
		self.queryCity           = null;
		self.queryCityResult     = [ ];

		self.clear 	             = clear;
		self.submit              = submit;
		self.updateSearch        = updateSearch;
		self.icmsChanged         = icmsChanged;

		$scope.$on('orderViewLoaded', function() {
			constants.debug && console.log('new address controller loaded!');
			clear();
			searchDistrict();
			searchCity();
		});

		$scope.$on('customerAdded', function(event, args) {
			_personId = args.person_id;
			self.newAddress.person_id = _personId;
		});

		$scope.$watch(function() {
			return self.queryDistrict;
		}, function(newValue, oldValue) {
			if (newValue)
				searchDistrict();
		});

		$scope.$watch(function() {
			return self.queryCity;
		}, function(newValue, oldValue) {
			if (newValue)
				searchCity();
		});

		$scope.testinho = function() {
			console.log('mudou');
		};

		// ******************************
		// Methods declaration
		// ******************************

		function getCep(cep) {
			if (!cep) return;

			$rootScope.loading.load();
			$http({
				method: 'POST',
				url: constants.api + 'cep.php?action=get',
				data: { 
					cep_code: cep
				}
			}).then(function(success) {
				self.newAddress.person_address_type = success.data.data.public_place_type;
				self.newAddress.person_address_public_place = success.data.data.public_place;
				self.queryDistrict = success.data.data.district_name;
				self.newAddress.district_id = success.data.data.district_id;
				self.newAddress.district = new District({
					district_id: success.data.data.district_id, 
					district_name: success.data.data.district_name
				});
				self.queryCity = success.data.data.city_name;
				self.newAddress.city_id = success.data.data.city_id;
				self.newAddress.city = new City({ 
					city_id: success.data.data.city_id, 
					city_name: success.data.data.city_name
				});
				self.newAddress.uf_id = success.data.data.uf_id;
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		function clear() {
			self.newAddress = new Address();
			self.newAddress.person_id = _personId;
			self.newAddress.contacts = [
				{ contact_type_id: Globals.get('contactTypes')['phone'], contact_value: null, label: 'Telefone' },
				{ contact_type_id: Globals.get('contactTypes')['mobile'], contact_value: null, label: 'Celular' },
				{ contact_type_id: Globals.get('contactTypes')['mail'], contact_value: null, label: 'Email' },
				{ contact_type_id: Globals.get('contactTypes')['others'], contact_value: null, label: 'Outro' }
			];
		}

		function submit() {
			$rootScope.loading.load();
			providerAddress.save(self.newAddress).then(function(success) {
				self.newAddress.person_address_code = success.data.address_code;
				$scope.$emit('newAddress', self.newAddress);				
				clear();
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		function updateSearch(e) {
			e.stopPropagation();
		}

		function searchDistrict() {
			var options = {
				limit: 10
			};

			providerDistrict.getByName(self.queryDistrict, options).then(function(success) {
				self.queryDistrictResult = success.data.map(function(d) { return new District(d) });
			}, function(error) {
				constants.debug && console.log(error);
			});
		}

		function searchCity() {
			var options = {
				limit: 10
			};

			providerCity.getByName(self.queryCity, options).then(function(success) {
				self.queryCityResult = success.data.map(function(c) { return new City(c) });
			}, function(error) {
				constants.debug && console.log(error);
			});
		}

		function icmsChanged() {
			if (self.newAddress.icms_type == 2) {
				self.newAddress.person_address_ie = 'ISENTO';
			} else {
				if (self.newAddress.person_address_ie == 'ISENTO')
					self.newAddress.person_address_ie = null;
			}
		}

	}

}());