/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-06-06 14:07:56
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 17:24:49
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('CompanyERP', [function() {

			function CompanyERP(companyERP) {
				this.company_id    = null;
				this.company_code  = null;
				this.company_name  = null;
				this.company_cnpj  = null;
				this.company_phone = null;	

				if (companyERP) {
					Object.assign(this, companyERP);				
				}
			}

			return CompanyERP;

		}]);

	angular.module('commercial2.services')
		.factory('UserCompany', ['CompanyERP', function(CompanyERP) {

			function UserCompany(userCompany) {
				this.user_company      = null;
				this.user_company_main = null;
				this.user_id           = null;
				this.company_id        = null;
				this.user_company_date = null;
				this.company_erp       = new CompanyERP();

				if (userCompany) {
					Object.assign(this, userCompany, {
						user_company_date: new Date(userCompany.user_company_date)
					});
				}
			}

			return UserCompany;

		}]);

})();