/*
* @Author: egmfilho
* @Date:   2017-07-14 09:39:04
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 17:24:37
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('BankAgency', [function() {

			function BankAgency(agency) {
				this.bank_agency_id     = null;
				this.bank_agency_code   = null;
				this.bank_agency_number = null;
				this.bank_agency_name   = null;

				if (agency) {
					Object.assign(this, agency, {
						queryable: agency.bank_agency_number + ' ' + agency.bank_agency_name
					});
				}
			}

			return BankAgency;

		}]);

	angular.module('commercial2.services')
		.factory('Bank', ['BankAgency', function(BankAgency) {

			function Bank(bank) {
				this.bank_id       = null;
				this.bank_name     = null;
				this.bank_agencies = new Array();
				this.queryable     = '';

				if (bank) {
					Object.assign(this, bank, {
						bank_agencies: bank.bank_agencies ? bank.bank_agencies.map(function(ba) { return new BankAgency(ba); }) : new Array(),
						queryable: bank.bank_id + ' ' + bank.bank_name
					});
				}
			}

			return Bank;

		}]);

})();