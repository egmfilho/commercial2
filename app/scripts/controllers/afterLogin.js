/*
* @Author: egmfilho
* @Date:   2017-06-19 08:59:02
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-21 13:28:06
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('AfterLoginCtrl', AfterLogin);

	AfterLogin.$inject = [ '$rootScope', '$scope', '$location', '$http', '$q', '$timeout', 'Globals', 'Cookies', 'Constants' ];

	function AfterLogin($rootScope, $scope, $location, $http, $q, $timeout, Globals, Cookies, constants) {

		$scope.$on('$viewContentLoaded', function() {
			$rootScope.loading.load();
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
				Globals.set('contactTypes', success.data.data.person_address_contact_type);
				Globals.set('personCategories', { 
					seller: success.data.data.person_category.seller_category,
					customer: success.data.data.person_category.client_category
				});
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

	}

}());