/*
* @Author: egmfilho
* @Date:   2017-06-06 14:13:57
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 14:19:38
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('PriceERP', [function() {

			var _priceERP = {
				price_id: '',
				price_code: '',
				price_name: ''
			};

			function PriceERP(priceERP) {
				angular.extend(this, _priceERP);

				if (priceERP) {
					angular.extend(this, priceERP);
				}
			}

			return PriceERP;

		}]);

	angular.module('commercial2.services')
		.factory('UserPrice', ['PriceERP', function(PriceERP) {

			var _userPrice = {
				user_price_id: '',
				user_id: '',
				price_id: '',
				user_price_date: '',
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

}());