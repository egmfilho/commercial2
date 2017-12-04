/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-22 13:23:08
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-04 15:52:11
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderOrder', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'order.php?action=:action';

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getById: getById,
					getByCode: getByCode,
					getAll: getAll,
					sync: sync,
					save: save,
					edit: edit,
					unlock: unlock,
					remove: remove,
					exportDAV: exportDAV,
					saveAndExportDAV: saveAndExportDAV,
					editAndExportDAV: editAndExportDAV,
					exportOrder: exportOrder,
					saveAndExportOrder: saveAndExportOrder,
					editAndExportOrder: editAndExportOrder
				};

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
						get_person_attributes: options && options.getCustomerAttributes,
						get_person_address: options && options.getCustomer,
						get_person_credit: options && options.getCustomer,
						get_person_credit_limit: options && options.getCreditLimit,
						get_person_contact: options && options.getContacts,
						contact_type_id: options && options.contactType,
						get_order_seller: options && options.getSeller,
						get_order_items: options && options.getItems,
						get_order_items_product: options && options.getItems,
						get_product_unit: options && options.getItems,
						get_order_payments: options && options.getPayments,
						get_order_payments_modality: options && options.getPayments,
						get_order_term: options && options.getTerm,
						get_order_address_delivery: options && options.getDeliveryAddress,
						get_product_price: options && options.getProductPrice,
						get_product_stock: options && options.getProductStock
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
						get_person_attributes: options && options.getCustomerAttributes,
						get_person_address: options && options.getCustomer,
						get_person_credit: options && options.getCustomer,
						get_person_credit_limit: options && options.getCreditLimit,
						get_person_contact: options && options.getContacts,
						contact_type_id: options && options.contactType,
						get_order_seller: options && options.getSeller,
						get_order_items: options && options.getItems,
						get_order_items_product: options && options.getItems,
						get_product_unit: options && options.getItems,
						get_order_payments: options && options.getPayments,
						get_order_payments_modality: options && options.getPayments,
						get_order_term: options && options.getTerm,
						get_order_address_delivery: options && options.getDeliveryAddress,
						get_product_price: options && options.getProductPrice,
						get_product_stock: options && options.getProductStock
					}).$promise;
				}

				function getAll(options) {
					return provider.query({
						action: 'getList'
					}, {
						limit: options && options.limit,
						order_company_id: options && options.company_id,
						start_date: options && options.start_date,
						end_date: options && options.end_date,
						order_seller_id: options && options.order_seller_id,
						get_order_company: options && options.getCompany,
						get_company_address: options && options.getCompanyAddress,
						get_order_user: options && options.getUser,
						get_order_client: options && options.getCustomer,
						get_person_address: options && options.getPersonAddress,
						get_person_credit: options && options.getPersonCredit,
						get_person_contact: options && options.getContacts,
						contact_type_id: options && options.contactType,
						get_order_seller: options && options.getSeller,
						get_order_items: options && options.getItems,
						get_order_items_product: options && options.getItems,
						get_product_unit: options && options.getItems,
						get_order_payments: options && options.getPayments,
						get_order_payments_modality: options && options.getPayments,
						get_order_term: options && options.getTerm,
						get_order_address_delivery: options && options.getDeliveryAddress,
						get_product_price: options && options.getProductPrice,
						get_product_stock: options && options.getProductStock
					}).$promise;
				}

				function sync(options) {
					return provider.query({
						action: 'synchronize'
					}, {
						order_company_id: options && options.company_id,
						start_date: options && options.start_date,
						end_date: options && options.end_date,
						order_seller_id: options && options.order_seller_id
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

				function unlock(id) {
					return provider.save({
						action: 'unlock'
					}, {
						order_id: id
					}).$promise;
				}

				function remove(id) {
					return provider.save({
						action: 'del'
					}, {
						order_id: id
					}).$promise;
				}

				function exportDAV(id) {
					return provider.save({
						action: 'exportDav'
					}, {
						order_id: id
					}).$promise;
				}

				function saveAndExportDAV(order) {
					return provider.save({
						action: 'insertExportDav'
					}, order).$promise;
				}

				function editAndExportDAV(order) {
					return provider.save({
						action: 'editExportDav'
					}, order).$promise;
				}

				function exportOrder(id) {
					return provider.save({
						action: 'exportOrder'
					}, {
						order_id: id
					}).$promise;
				}

				function saveAndExportOrder(order) {
					return provider.save({
						action: 'insertExportOrder'
					}, order).$promise;
				}

				function editAndExportOrder(order) {
					return provider.save({
						action: 'editExportOrder'
					}, order).$promise;
				}

			}];

		}]);

})();