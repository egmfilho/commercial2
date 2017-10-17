/*
* @Author: egmfilho
* @Date:   2017-06-08 16:16:04
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-07 17:40:25
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Stock', [function() {

			function Stock(stock) {
				this.company_id         = null;
				this.product_id         = null;
				this.product_stock      = 0; // inicializa com 0 pois pode vir null do servidor
				this.product_stock_date = null;

				if (stock) {
					Object.assign(this, stock, {
						product_stock_date: stock.product_stock_date ? new Date(stock.product_stock_date) : null
					});
				}
			}

			return Stock;

		}]);

	angular.module('commercial2.services')
		.factory('Product', ['Price', 'Unit', 'Stock', 'Globals', function(Price, Unit, Stock, Globals) {

			function Product(product) {
				this.product_id                 = null;
				this.product_group_id           = null;
				this.unit_id                    = null;
				this.icms_id                    = null;
				this.ncm_id                     = null;
				this.company_id                 = null;
				this.product_code               = null;
				this.product_ean                = null;
				this.product_name               = null;
				this.product_max_discount       = 0;
				this.product_classification     = null;
				this.product_active             = null;
				this.product_billing_aliquot    = null;
				this.product_duplicated_aliquot = null;
				this.product_cfop               = null;
				this.product_date               = null;
				this.product_prices             = new Array();
				this.unit                       = new Unit();
				this.stock                      = new Stock();

				if (product) {
					Object.assign(this, product, {
						product_date: product.product_date && new Date(product.product_date),
						product_prices: product.product_prices ? product.product_prices.map(function(p) { return new Price(p) }) : new Array(),
						unit: new Unit(product.unit),
						stock: new Stock(product.stock)
					});
				}
			}

			Product.prototype = {
				getDefaultPriceTable: function() {
					return this.product_prices.find(function(p) {
						return p.price_id == Globals.get('default-price-table');
					});
				}
			}

			return Product;

		}]);

})();