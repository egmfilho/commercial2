/*
* @Author: egmfilho
* @Date:   2017-06-08 16:35:38
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-09 10:26:23
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderProduct', ['Constants', function(constants) {

			var url = constants.api + 'product.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getByCode: getByCode,
					getByName: getByName
				}

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
						limit: options && options.limit,
						get_product_unit: true,
						get_product_price: true
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
					}).$promise;
				}

			}];
		}]);
}());

