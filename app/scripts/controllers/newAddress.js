/*
* @Author: egmfilho
* @Date:   2017-06-08 09:24:23
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-20 09:55:39
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('NewAddressCtrl', NewAddressCtrl);

	NewAddressCtrl.$inject = [ 
		'$rootScope',
		'$scope', 
		'$http',
		'Address', 
		'ProviderDistrict', 
		'District', 
		'ProviderCity', 
		'City', 
		'Constants' 
	];

	function NewAddressCtrl($rootScope, $scope, $http, Address, providerDistrict, District, providerCity, City, constants) {

		var self = this;

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


		$scope.$on('viewContentLoaded', function() {
			constants.debug && console.log('loaded');
			searchDistrict();
			searchCity();
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
				self.queryCity = success.data.data.city_name;
				self.newAddress.city_id = success.data.data.city_id;
				self.newAddress.uf_id = success.data.data.uf_id;
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		function clear() {
			self.data = new Address();
			constants.debug && console.log('clear');
		}

		function submit() {
			constants.debug && console.log(self.newAddress);
			$scope.$emit('newAddress');
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