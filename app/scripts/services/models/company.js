/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-06-06 14:07:56
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-30 15:47:24
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('CompanyERP', [function() {

			function CompanyERP(companyERP) {
				this.company_id         = null;
				this.company_code       = null;
				this.company_name       = null;
				this.company_cnpj       = null;
				this.company_phone      = null;
				this.company_short_name = null;	
				this.queryable          = null;

				if (companyERP) {
					Object.assign(this, companyERP, {
						queryable: companyERP.company_code + ' ' + companyERP.company_short_name
					});
				}
			}

			return CompanyERP;

		}]);

	angular.module('commercial2.services')
		.factory('UserCompany', ['CompanyERP', function(CompanyERP) {

			function UserCompany(userCompany) {
				this.user_company      = null;
				this.user_company_main = 'N';
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