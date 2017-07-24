/*
* @Author: egmfilho
* @Date:   2017-06-21 12:20:38
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 17:24:57
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Contact', Contact);

	function Contact() {

		function _Contact(contact) {
			this.person_address_code            = null;
			this.person_address_contact_type_id = null;
			this.person_address_contact_main    = 'N',
			this.person_address_contact_name    = null;
			this.person_address_contact_note    = null;
			this.person_address_contact_label   = null;
			this.person_address_contact_value   = null;

			if (contact)
				Object.assign(this, contact);
		}

		return _Contact;

	}

}());