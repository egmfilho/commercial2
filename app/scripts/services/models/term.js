/*
* @Author: egmfilho
* @Date:   2017-06-28 12:02:16
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-28 12:55:28
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Term', Term);

	function Term() {

		function _Term(term) {
			this.term_id           = null;
			this.term_code         = null;
			this.term_description  = null;
			this.term_installments = null;
			this.term_delay        = null;
			this.term_interval     = null;
			this.term_active       = null;
			this.term_al_initial   = null;

			if (term) {
				Object.assign(this, term);
			}
		}

		return _Term;

	}

}());