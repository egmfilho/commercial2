/*
* @Author: egmfilho
* @Date:   2017-06-19 08:59:02
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-18 08:28:43
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('AfterLoginCtrl', AfterLogin);

	AfterLogin.$inject = [ '$rootScope', '$scope', '$location', '$http', '$q', '$timeout', 'Globals', 'Cookies', 'Constants' ];

	function AfterLogin($rootScope, $scope, $location, $http, $q, $timeout, Globals, Cookies, constants) {

		$scope.$on('$viewContentLoaded', function() {
			$rootScope.loading.load();

			setConstants();
			
			loadCredentials().then(function(success) {
				$q.all([
					loadConfig()
				]).then(function(success) {
					$timeout(function() {
						$rootScope.loading.unload();
						$location.path('home');
					}, 1000);
				}, function(error) {
					$rootScope.loading.unload();
				});
			}, function(error) { 
				$rootScope.loading.unload();
			});
		});

		function loadConfig() {
			var deferred = $q.defer();

			$http({
				method: 'GET',
				url: constants.api + 'config.php?action=getList'
			}).then(function(success) {
				Globals.set('person-categories', { 
					seller: success.data.data.person_category.seller_category,
					customer: success.data.data.person_category.client_category
				});

				Globals.set('api', success.data.data.api);
				Globals.set('contact-types', success.data.data.person_address_contact_type);
				Globals.set('logo', success.data.data.logo);
				Globals.set('print-message', success.data.data.order);
				Globals.set('default-price-table', success.data.data.price.default_price);
				
				deferred.resolve();
			}, function(error) {
				constants.debug && console.log(error);
				deferred.reject();
			});

			return deferred.promise;
		}

		function loadCredentials() {
			var deferred = $q.defer();

			Cookies.get(constants['cookie']).then(function(success) {
				var u = JSON.parse(window.atob(success));
				Globals.set('user', u);
				Globals.set('session-token', u.user_id + ':' + u.user_current_session.user_session_value);
				Globals.set('user-companies-raw', u.user_company);
				Globals.set('user-prices-raw', u.user_price);
				Globals.set('user-max-discount', u.user_max_discount || 0);
				deferred.resolve();
			}, function(error) {
				deferred.reject();
			});

			return deferred.promise;
		}

		function setConstants() {
			Globals.set('server-host', constants.api);

			Globals.set('default-person-type', 'F');

			Globals.set('default-customer', {
				'name': 'CONSUMIDOR',
				'code': 3354
			});

			Globals.set('order-status-labels', {
				'1001': 'Aberto',
				'1002': 'Exportado',
				'1003': 'Faturado'
			});

			Globals.set('order-status-colors', {
				'1001': 'mediumseagreen',
				'1002': 'orange',
				'1003': 'tomato'
			});

			Globals.set('order-status-values', {
				'open': 1001,
				'exported': 1002,
				'billed': 1003
			});

			Globals.set('modalities', {
				'credit-card': { type: 'A', code: null },
				'check': { type: 'C', code: null },
				'credit': { type: 'D', code: '000011'}
			});
		}

	}

}());