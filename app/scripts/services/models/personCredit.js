/*
* @Author: egmfilho
* @Date:   2017-06-30 16:47:19
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-12 16:36:34
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('PersonCredit', [function() {

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

				if (personCredit) {
					Object.assign(this, personCredit);
				}
			}

			return PersonCredit;

		}]);

}());