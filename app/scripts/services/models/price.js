/*
* @Author: egmfilho
* @Date:   2017-06-06 14:13:57
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-08 16:30:01
*/

(function() {

	'use strict';

	/* Tabela de precos */
	angular.module('commercial2.services')
		.factory('PriceERP', [function() {

			var _priceERP = {
				price_id: null,
				price_code: null,
				price_name: null
			};

			function PriceERP(priceERP) {
				angular.extend(this, _priceERP);

				if (priceERP) {
					angular.extend(this, priceERP);
				}
			}

			return PriceERP;

		}]);

	/* Vinculo do usuario com a tabela de precos */
	angular.module('commercial2.services')
		.factory('UserPrice', ['PriceERP', function(PriceERP) {

			var _userPrice = {
				user_price_id: null,
				user_id: null,
				price_id: null,
				user_price_date: null,
				price_erp: new PriceERP()
			};

			function UserPrice(userPrice) {
				angular.extend(this, _userPrice);

				if (userPrice) {
					angular.extend(this, userPrice, {
						user_price_date: new Date(userPrice.user_price_date),
						price_erp: new PriceERP(userPrice.price_erp)
					});
				}
			}

			return UserPrice;

		}]);

	/* Preco do produto */
	angular.module('commercial2.services')
		.factory('Price', [function() {

			var _price = {
				product_id: null,
				price_id: null,
				company_id: null,
				price_value: null,
				price_date: null
			};

			function Price(price) {
				angular.extend(this, _price);

				if (price) {
					angular.extend(this, price, {
						price_date: new Date(price.price_date)
					});
				}
			}

			return Price;

		}]);

}());