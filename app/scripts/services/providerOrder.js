/*
* @Author: egmfilho
* @Date:   2017-06-22 13:23:08
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-22 13:40:09
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderOrder', ['Constants', function(constants) {

			var url = constants.api + 'order.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getById: getById,
					getByCode: getByCode,
					getAll: getAll,
					save: save
				}

				// ******************************
				// Methods declaration
				// ******************************

				function getById(id, options) {
					return provider.get({
						action: 'get'
					}, {
						order_id: id,
						get_order_seller: true,
						get_order_items: true,
						get_order_items_product: true,
						get_order_client: true,
						get_order_payments: true,
						get_order_payments_modality: true
					}).$promise;
				}

				function getByCode(code, options) {
					return provider.get({
						action: 'get'
					}, {
						order_code: code,
						get_order_seller: true,
						get_order_items: true,
						get_order_items_product: true,
						get_order_client: true,
						get_order_payments: true,
						get_order_payments_modality: true
					}).$promise;
				}

				function getAll(options) {
					return provider.query({
						action: 'getList'
					}, {
						limit: options && options.limit,
						get_order_seller: options && options.getSeller,
						get_order_items: options && options.getItems,
						get_order_items_product: options && options.getItems,
						get_order_client: options && options.getCustomer,
						get_order_payments: options && options.getPayment,
						get_order_payments_modality: options && options.getPayment
					}).$promise;
				}

				function save(order) {
					return provider.save({
						action: 'insert'
					}, order).$promise;
				}

			}];

		}]);

}());