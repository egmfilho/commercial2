/*
* @Author: egmfilho
* @Date:   2017-06-30 16:47:19
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-19 13:38:00
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('PersonCreditLimit', [function() {

			function PersonCreditLimit(limit) {
				this.person_credit_limit_value   = 0;
				this.person_expired_value        = 0;
				this.person_expiring_value       = 0;
				this.person_credit_limit_balance = 0;
				this.person_expired_quantity     = 0;
				this.person_expiring_quantity    = 0;

				if (limit) {
					Object.assign(this, limit);
				}
			}

			return PersonCreditLimit;

		}]);

	angular.module('commercial2.services')
		.factory('Pawn', [function() {
			
			function Pawn(pawn) {
				this.user_name   = null;
				this.system_name = null;
				this.description = null;

				if (pawn) {
					Object.assign(this, pawn);
				}
			}

			return Pawn;

		}]);

	angular.module('commercial2.services')
		.factory('PersonCredit', ['Pawn', function(Pawn) {

			function PersonCredit(personCredit) {
				this.company_id             = null;
				this.credit_value           = 0;
				this.credit_value_available = 0;
				this.credit_value_utilized  = 0;
				this.modality_id            = null;
				this.modality_name          = null;
				this.modality_description   = null;
				this.payable_code           = null;
				this.payable_id             = null;
				this.payable_date           = null;
				this.payable_note           = null;
				this.person_id              = null;
				this.pawn                   = null;

				if (personCredit) {
					Object.assign(this, personCredit, {
						pawn: personCredit.pawn ? new Pawn(personCredit.pawn) : null
					});
				}
			}

			return PersonCredit;

		}]);

}());