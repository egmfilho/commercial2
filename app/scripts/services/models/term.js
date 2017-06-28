/*
* @Author: egmfilho
* @Date:   2017-06-28 12:02:16
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-28 17:03:52
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Term', Term);

	Term.$inject = [ 'PaymentModality' ];

	function Term(PaymentModality) {

		function _Term(term) {
			this.term_id           = null;
			this.term_code         = null;
			this.term_description  = null;
			this.term_installments = null;
			this.term_delay        = null;
			this.term_interval     = null;
			this.term_active       = null;
			this.term_al_initial   = null;
			this.modality          = new Array();

			if (term) {
				Object.assign(this, term, {
					modality: term.modality ? term.modality.map(function(m) { return new PaymentModality(m) }) : new Array()
				});
			}
		}

		return _Term;

	}

}());