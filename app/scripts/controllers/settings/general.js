/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-07-25 14:03:54
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-05 11:46:10
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
				commissionTypeId: null,
				davStatus: null,
				davType: null,
				deadline: null,
				deliveryType: null,
				messageId: null,
				operationId: null,
				operationOEId: null,
				scheduleDelivery: null,
				status: null,
				systemId: null,
				systemName: null,
				type: null,
				userId: null,
				userName: null
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
			},
			services: {
				syncQuantityBilled: null,
				syncQuantityExported: null,
				syncTimeBilled: null,
				syncTimeExported: null
			}
		};

		function convertConfigToInternalData(config) {
			self.internal = {
				order: {
					commissionTypeId: config.order? config.order.commission_type_id : null,
					davStatus: config.order ? config.order.dav_status : null,
					davType: config.order ? config.order.dav_type : null,
					deadline: config.order ? config.order.deadline : null,
					deliveryType: config.order ? config.order.delivery_type : null,
					messageId: config.order ? config.order.message_id : null,
					operationId: config.order ? config.order.operation_id : null,
					operationOEId: config.order ? config.order.operation_oe_id : null,
					scheduleDelivery: config.order ? config.order.schedule_delivery : null,
					status: config.order ? config.order.status : null,
					systemId: config.order ? config.order.system_id : null,
					systemName: config.order ? config.order.system_name : null,
					type: config.order ? config.order.type : null,
					userId: config.order ? config.order.user_id : null,
					userName: config.order ? config.order.user_name : null
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
				},
				services: {
					syncQuantityBilled: config.services ? config.services.sync_quantity_billed : null,
					syncQuantityExported: config.services ? config.services.sync_quantity_exported : null,
					syncTimeBilled: config.services ? config.services.sync_time_billed : null,
					syncTimeExported: config.services ? config.services.sync_time_exported : null
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

		function post(data) {
			$rootScope.writeLog('Editing config');
			$rootScope.loading.load();
			$http({
				method: 'POST',
				url: Globals.api.get().address + 'config.php?action=edit',
				data: {
					data: data
				}
			}).then(function(success) {
				$rootScope.writeLog('New config values sent');
				$rootScope.writeLog(JSON.stringify(data));
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Sucesso', 'Dados atualizados!');
			}, function(error) {
				$rootScope.writeLog('Error while trying to edit config values!');
				$rootScope.writeLog(JSON.stringify(error));
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		};

		this.postOrder = function() {
			post([
				{
					config_category: 'order',
					config_name: 'commission_type_id',
					config_value: self.internal.order.commissionTypeId
				}, {
					config_category: 'order',
					config_name: 'dav_status',
					config_value: self.internal.order.davStatus
				}, {
					config_category: 'order',
					config_name: 'davType',
					config_value: self.internal.order.davType
				}, {
					config_category: 'order',
					config_name: 'deadline',
					config_value: self.internal.order.deadline
				}, {
					config_category: 'order',
					config_name: 'delivery_type',
					config_value: self.internal.order.deliveryType
				}, {
					config_category: 'order',
					config_name: 'message_id',
					config_value: self.internal.order.messageId
				}, {
					config_category: 'order',
					config_name: 'operation_id',
					config_value: self.internal.order.operationId
				}, {
					config_category: 'order',
					config_name: 'operation_oe_id',
					config_value: self.internal.order.operationOEId
				}, {
					config_category: 'order',
					config_name: 'schedule_delivery',
					config_value: self.internal.order.scheduleDelivery
				}, {
					config_category: 'order',
					config_name: 'system_id',
					config_value: self.internal.order.systemId
				}, {
					config_category: 'order',
					config_name: 'system_name',
					config_value: self.internal.order.systemName
				}, {
					config_category: 'order',
					config_name: 'type',
					config_value: self.internal.order.type
				}, {
					config_category: 'order',
					config_name: 'user_id',
					config_value: self.internal.order.userId
				}, {
					config_category: 'order',
					config_name: 'user_name',
					config_value: self.internal.order.userName
				}
			]);
		};

		this.postCategory = function() {
			post([
				{
					config_category: 'person_category',
					config_name: 'client_category',
					config_value: self.internal.personCategory.customerId
				}, {
					config_category: 'person_category',
					config_name: 'seller_category',
					config_value: self.internal.personCategory.sellerId
				}
			]);
		};

		this.postPrice = function() {
			post([
				{
					config_category: 'price',
					config_name: 'default_price',
					config_value: self.internal.price.defaultId
				}
			]);
		};

		this.postProductTypes = function() {
			post([
				{
					config_category: 'product_code',
					config_name: 'product_code_ean_id',
					config_value: self.internal.productCodes.eanId
				},
				{
					config_category: 'product_code',
					config_name: 'product_code_main_id',
					config_value: self.internal.productCodes.mainId
				},
				{
					config_category: 'product_code',
					config_name: 'product_code_provider_id',
					config_value: self.internal.productCodes.providerId
				}
			]);
		}

		this.postEmail = function() {
			post([
				{
					config_category: 'contact_mail',
					config_name: 'contact_mail_type_id',
					config_value: self.internal.mail.typeId
				}
			]);
		};

		this.postServices = function() {
			post([
				{
					config_category: 'services',
					config_name: 'sync_quantity_billed',
					config_value: self.internal.services.syncQuantityBilled
				}, {
					config_category: 'services',
					config_name: 'sync_quantity_exported',
					config_value: self.internal.services.syncQuantityExported
				}, {
					config_category: 'services',
					config_name: 'sync_time_billed',
					config_value: self.internal.services.syncTimeBilled
				}, {
					config_category: 'services',
					config_name: 'sync_time_exported',
					config_value: self.internal.services.syncTimeExported
				}
			]);
		}

	}

})();