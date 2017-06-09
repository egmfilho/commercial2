/*
* @Author: egmfilho
* @Date:   2017-06-08 16:16:04
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-09 10:44:08
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Stock', [function() {

			var _stock = {
				company_id: null,
				product_id: null,
				product_stock: 0, // inicializa com 0 pois pode vir null do servidor
				product_stock_date: null
			};

			function Stock(stock) {
				angular.extend(this, _stock);

				if (stock) {
					angular.extend(this, stock, {
						product_stock_date: stock.product_stock_date ? new Date(stock.product_stock_date) : null
					});
				}
			}

			return Stock;

		}]);

	angular.module('commercial2.services')
		.factory('Product', ['Price', 'Unit', 'Stock', function(Price, Unit, Stock) {

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
				price: new Price(),
				stock: new Stock()
			};

			function Product(product) {
				angular.extend(this, _product);

				if (product) {
					angular.extend(this, product, {
						product_date: new Date(product.product_date),
						price: new Price(product.price),
						unit: new Unit(product.unit),
						stock: new Stock(product.stock),
					});
				}
			}

			return Product;

		}]);

}());