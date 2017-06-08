/*
* @Author: egmfilho
* @Date:   2017-06-06 14:07:56
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-08 16:29:45
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('CompanyERP', [function() {

			var _companyERP = {
				company_id: null,
				company_code: null,
				company_name: null,
				company_cnpj: null,
				company_phone: null	
			};

			function CompanyERP(companyERP) {
				angular.extend(this, _companyERP);

				if (companyERP) {
					angular.extend(this, companyERP);				
				}
			}

			return CompanyERP;

		}]);

	angular.module('commercial2.services')
		.factory('UserCompany', ['CompanyERP', function(CompanyERP) {

			var _userCompany = {
				user_company: null,
				user_id: null,
				company_id: null,
				user_company_date: null,
				company_erp: new CompanyERP()
			};

			function UserCompany(userCompany) {
				angular.extend(this, _userCompany);

				if (userCompany) {
					angular.extend(this, userCompany, {
						user_company_date: new Date(userCompany.user_company_date)
					});
				}
			}

			return UserCompany;

		}]);

}());