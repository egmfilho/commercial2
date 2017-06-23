/*
* @Author: egmfilho
* @Date:   2017-06-22 13:23:08
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-23 16:59:27
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
					save: save,
					edit: edit
				}

				// ******************************
				// Methods declaration
				// ******************************

				function getById(id, options) {
					return provider.get({
						action: 'get'
					}, {
						order_id: id,
						get_order_company: options && options.getCompany,
						get_company_address: options && options.getCompanyAddress,
						get_order_user: options && options.getUser,
						get_order_client: options && options.getCustomer,
						get_person_address: options && options.getCustomer,
						get_order_seller: options && options.getSeller,
						get_order_items: options && options.getItems,
						get_order_items_product: options && options.getItems,
						get_product_unit: options && options.getItems,
						get_order_payments: options && options.getPayments,
						get_order_payments_modality: options && options.getPayments,
						get_order_term: options && options.getTerm,
						get_order_address_delivery: options && options.getDeliveryAddress
					}).$promise;
				}

				function getByCode(code, options) {
					return provider.get({
						action: 'get'
					}, {
						order_code: code,
						get_order_company: options && options.getCompany,
						get_company_address: options && options.getCompanyAddress,
						get_order_user: options && options.getUser,
						get_order_client: options && options.getCustomer,
						get_person_address: options && options.getCustomer,
						get_order_seller: options && options.getSeller,
						get_order_items: options && options.getItems,
						get_order_items_product: options && options.getItems,
						get_product_unit: options && options.getItems,
						get_order_payments: options && options.getPayments,
						get_order_payments_modality: options && options.getPayments,
						get_order_term: options && options.getTerm,
						get_order_address_delivery: options && options.getDeliveryAddress
					}).$promise;
				}

				function getAll(options) {
					return provider.query({
						action: 'getList'
					}, {
						limit: options && options.limit,
						get_order_company: options && options.getCompany,
						get_company_address: options && options.getCompanyAddress,
						get_order_user: options && options.getUser,
						get_order_client: options && options.getCustomer,
						get_person_address: options && options.getCustomer,
						get_order_seller: options && options.getSeller,
						get_order_items: options && options.getItems,
						get_order_items_product: options && options.getItems,
						get_product_unit: options && options.getItems,
						get_order_payments: options && options.getPayments,
						get_order_payments_modality: options && options.getPayments,
						get_order_term: options && options.getTerm,
						get_order_address_delivery: options && options.getDeliveryAddress
					}).$promise;
				}

				function save(order) {
					return provider.save({
						action: 'insert'
					}, order).$promise;
				}

				function edit(order) {
					return provider.save({
						action: 'edit'
					}, order).$promise;
				}

			}];

		}]);

}());