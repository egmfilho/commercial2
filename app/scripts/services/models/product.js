/*
* @Author: egmfilho
* @Date:   2017-06-08 16:16:04
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-08 17:03:10
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Product', ['Price', 'Unit', function(Price, Unit) {

			var _product = {
				product_id: null,
				product_group_id: null,
				unity_id: null,
				icms_id: null,
				ncm_id: null,
				company_id: null,
				product_code: null,
				product_ean: null,
				product_name: null,
				product_classification: null,
				product_active: null,
				product_aliquot_second_pass: null,
				product_cfop: null,
				product_date: null,
				unit: new Unit(),
				price: new Price()
			};

			function Product(product) {
				angular.extend(this, _product);

				if (product) {
					angular.extend(this, product, {
						product_date: new Date(product.product_date)
					});
				}
			}

			return Product;

		}]);

}());