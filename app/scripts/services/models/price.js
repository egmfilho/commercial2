/*
* @Author: egmfilho
* @Date:   2017-06-06 14:13:57
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 17:25:59
*/

(function() {

	'use strict';

	/* Tabela de precos */
	angular.module('commercial2.services')
		.factory('PriceERP', [function() {

			function PriceERP(priceERP) {
				this.price_id   = null;
				this.price_code = null;
				this.price_name = null;

				if (priceERP) {
					Object.assign(this, priceERP);
				}
			}

			return PriceERP;

		}]);

	/* Vinculo do usuario com a tabela de precos */
	angular.module('commercial2.services')
		.factory('UserPrice', [function() {

			function UserPrice(userPrice) {
				this.user_price_id   = null;
				this.user_id         = null;
				this.price_id        = null;
				this.user_price_date = null;
				this.user_price_main = 'N';
				this.price_name      = null;

				if (userPrice) {
					Object.assign(this, userPrice, {
						user_price_date: new Date(userPrice.user_price_date),
					});
				}
			}

			return UserPrice;

		}]);

	/* Preco do produto */
	angular.module('commercial2.services')
		.factory('Price', ['PriceERP', function(PriceERP) {

			function Price(price) {
				this.product_id     = null;
				this.price_id       = null;
				this.company_id     = null;
				this.price_value    = null;
				this.price_date     = null;
				this.price_erp       = new PriceERP();

				if (price) {
					Object.assign(this, price, {
						price_date: price.price_date ? new Date(price.price_date) : null,
						price_erp: new PriceERP(price.price_erp)
					});
				}
			}

			return Price;

		}]);

})();