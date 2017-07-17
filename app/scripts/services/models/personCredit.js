/*
* @Author: egmfilho
* @Date:   2017-06-30 16:47:19
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-17 12:47:28
*/

(function() {

	'use strict';

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