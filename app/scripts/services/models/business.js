/*
* @Author: egmfilho
* @Date:   2017-06-06 14:07:56
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 14:13:17
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('BusinessERP', [function() {

			var _businessERP = {
				business_id: '',
				business_code: '',
				business_name: '',
				business_cnpj: '',
				business_phone: ''	
			};

			function BusinessERP(businessERP) {
				angular.extend(this, _businessERP);

				if (businessERP) {
					angular.extend(this, businessERP);				
				}
			}

			return BusinessERP;

		}]);

	angular.module('commercial2.services')
		.factory('UserBusiness', ['BusinessERP', function(BusinessERP) {

			var _userBusiness = {
				user_business: '',
				user_id: '',
				business_id: '',
				user_business_date: '',
				business_erp: new BusinessERP()
			};

			function UserBusiness(userBusiness) {
				angular.extend(this, _userBusiness);

				if (userBusiness) {
					angular.extend(this, userBusiness, {
						user_business_date: new Date(userBusiness.user_business_date)
					});
				}
			}

			return UserBusiness;

		}]);

}());