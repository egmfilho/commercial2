/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-08 16:35:38
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 14:02:28
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderProduct', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'product.php?action=:action';

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getByCode: getByCode,
					getByName: getByName,
					getByFilter: getByFilter,
					getInfoStock: getInfoStock
				};

				// ******************************
				// Methods declaration
				// ******************************

				function getByCode(code, companyId, userPriceId, options) {
					return provider.get({
						action: 'get'
					}, {
						product_code: code,
						company_id: companyId,
						price_id: userPriceId,
						get_product_unit: options && options.getUnit,
						get_product_price: options && options.getPrice,
						get_product_stock: options && options.getStock
					}).$promise;
				}

				function getByName(name, companyId, userPriceId, options) {
					return provider.query({
						action: 'getList'
					}, {
						product_name: name,
						company_id: companyId,
						price_id: userPriceId,
						limit: options && options.limit,
						get_product_unit: options && options.getUnit,
						get_product_price: options && options.getPrice,
						get_product_stock: options && options.getStock,
						product_active: options && options.getActiveOnly
					}).$promise;
				}

				function getByFilter(filter, companyId, userPriceId, options) {
					return provider.query({
						action: 'getList'
					}, {
						product_name: filter && filter.name,
						product_active: filter && filter.active,
						company_id: companyId,
						price_id: userPriceId,
						limit: options && options.limit,
						get_product_unit: options && options.getUnit,
						get_product_price: options && options.getPrice,
						get_product_stock: options && options.getStock
					}).$promise;
				}

				function getInfoStock(data) {
					return provider.query({
						action: 'getInfoStock'
					}, {
						product_id: data.product_id
						/*product_name: filter && filter.name,
						product_active: filter && filter.active,
						company_id: companyId,
						price_id: userPriceId,
						limit: options && options.limit,
						get_product_unit: options && options.getUnit,
						get_product_price: options && options.getPrice,
						get_product_stock: options && options.getStock*/
					}).$promise;
				}

			}];
		}]);
})();

