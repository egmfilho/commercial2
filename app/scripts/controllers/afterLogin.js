/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-19 08:59:02
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-04 13:48:22
 */

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('AfterLoginCtrl', AfterLogin);

	AfterLogin.$inject = [ '$rootScope', '$scope', '$location', '$http', '$q', '$timeout', 'Globals', 'Cookies', 'Constants' ];

	function AfterLogin($rootScope, $scope, $location, $http, $q, $timeout, Globals, Cookies, constants) {

		var api = Globals.api.get();
		$rootScope.apiName = api.name;
		if (constants.isElectron) {
			require('electron').remote.getCurrentWindow().setTitle('Commercial - Gestor de Vendas | API: ' + api.name);
		}

		$scope.$on('$viewContentLoaded', function() {
			$rootScope.loading.load();

			setConstants();
			
			loadCredentials().then(function(success) {
				$q.all([
					loadConfig()
				]).then(function(success) {
					$timeout(function() {
						$rootScope.loading.unload();
						$location.path('/');
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

			$rootScope.writeLog('Requiring server configurations');
			$http({
				method: 'GET',
				url: Globals.api.get().address + 'config.php?action=getList'
			}).then(function(success) {

				Globals.set('person-categories', { 
					seller: success.data.data.person_category.seller_category,
					customer: success.data.data.person_category.client_category
				});

				// Globals.set('api', success.data.data.api);
				Globals.set('contact-types', success.data.data.person_address_contact_type);
				Globals.set('logo', (function() {
					var temp = {};
					angular.forEach(success.data.data.company, function(value, key) {
						temp[key] = {
							company_logo: value.logo.company_logo
						};
					});
					return temp;
				})());
				Globals.set('print-message', success.data.data.order);
				Globals.set('default-price-table', success.data.data.price.default_price);
				Globals.set('debit-day-limit', success.data.data.credit_limit.debit_day_limit);
				Globals.set('credit-limit', success.data.data.credit_limit.authorized_modality_id);
				Globals.set('mail-contact-id', success.data.data.contact_mail.contact_mail_type_id);
				Globals.set('default-customer', {
					name: success.data.data.default_customer.default_customer_name,
					code: success.data.data.default_customer.default_customer_code
				});

				var st = {};
				angular.forEach(success.data.data.company, function(value, key) {
					st[key] = value.taxation.has_st == 'Y';
				});

				Globals.set('st', st);
				
				deferred.resolve();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.writeLog('Falha ao receber as configuracoes do servidor.');
				$rootScope.writeLog(JSON.stringify(error));
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
			Globals.set('server-host', Globals.api.get().address);

			Globals.set('default-person-type', 'F');
			Globals.set('default-icms-type', { code: 2, value: 'ISENTO' });
			Globals.set('elective-icms-type', { code: 9 });

			Globals.set('public-place-types', [ 'AV', 'EST', 'PC', 'R', 'RUA', 'ROD' ]);

			Globals.set('obsFlag', '\n\nObs. de Entrega: ');

			Globals.set('order-origin-id', {
				'desktop': 1001,
				'smartphone': 1002
			});

			Globals.set('order-status-labels', {
				'1001': 'Aberto',
				'1002': 'Exportado',
				'1003': 'Faturado'
			});

			Globals.set('order-status-colors', {
				'1001': '#4caf50',
				'1002': '#2196f3',
				'1003': '#f99f57'
			});

			Globals.set('order-export-type-colors', {
				'open': '#4caf50',
				'order': '#f99f57',
				'dav': '#2196f3'
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

})();