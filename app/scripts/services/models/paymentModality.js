/*
* @Author: egmfilho
* @Date:   2017-06-28 12:09:10
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-28 12:11:42
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('PaymentModality', PaymentModality);

	function PaymentModality() {

		function _PaymentModality(modality) {
			this.modality_id          = null;
			this.modality_code        = null;
			this.modality_description = null;
			this.modality_active      = null;
			this.modality_type        = null;
			this.payment_nature_id    = null;

			if (modality) {
				Object.assign(this, modality);
			}
		}

		return _PaymentModality;
	}

}());