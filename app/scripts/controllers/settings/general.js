/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-07-25 14:03:54
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-27 10:52:39
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.General', General);

	General.$inject = [ '$rootScope', '$scope', '$q', '$http', 'Globals', 'Constants' ];

	function General($rootScope, $scope, $q, $http, Globals, constants) {

		var self = this;

		this.internal = {
			order: {
				systemId: null,
				systemName: null,
				userId: null,
				userName: null,
				operationId: null,
			},
			personCategory: {
				customerId: null,
				sellerId: null
			},
			price: {
				defaultId: null,
			},
			productCodes: {
				eanId: null,
				mainId: null,
				providerId: null
			},
			mail: {
				typeId: null
			}
		};

		function convertConfigToInternalData(config) {
			self.internal = {
				order: {
					systemId: config.order ? config.order.system_id : null,
					systemName: config.order ? config.order.system_name : null,
					userId: config.order ? config.order.user_id : null,
					userName: config.order ? config.order.user_name : null,
					operationId: config.order ? config.order.operation_id : null,
				},
				personCategory: {
					customerId: config.person_category ? config.person_category.client_category : null,
					sellerId: config.person_category ? config.person_category.seller_category : null
				},
				price: {
					defaultId: config.price ? config.price.default_price : null,
				},
				productCodes: {
					eanId: config.product_code ? config.product_code.product_code_ean_id : null,
					mainId: config.product_code ? config.product_code.product_code_main_id : null,
					providerId: config.product_code ? config.product_code.product_code_provider_id : null
				},
				mail: {
					typeId: config.contact_mail ? config.contact_mail.contact_mail_type_id : null
				}
			};			
		}

		function getConfig() {
			return $http({
				method: 'GET',
				url: Globals.api.get().address + 'config.php?action=getList'
			});
		}

		$rootScope.loading.load();
		$q.all([
			getConfig()
		]).then(function(success) {
			var config = success[0].data.data;

			convertConfigToInternalData(config);

			$rootScope.loading.unload();
		}, function(error) {
			$rootScope.loading.unload();
			$rootScope.customDialog().showMessage('Erro', 'Erro ao receber as informações');
			angular.forEach(error, function(e) {
				$rootScope.writeLog(JSON.stringify(e));
			});
		});

		this.postSystem = function() {

		};

		this.postUser = function() {

		};

		this.postCategory = function() {

		};

		this.postPrice = function() {

		};

		this.postProductTypes = function() {

		}

		this.postEmail = function() {

		};

	}

})();