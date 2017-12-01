/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-06-30 16:47:19
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 17:25:47
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('PersonAttribute', [function() {
			
			function PersonAttribute(attribute) {
				
				this.person_id   = null;
				this.person_attribute_id = null;
				this.person_attribute_code = null;
				this.person_attribute_classification = null;
				this.person_attribute_type = null;
				this.person_attribute_name = null;
				this.person_attribute_image = null;
				this.person_attribute_description = null;
				this.person_attribute_date = null;

				if (attribute) {
					Object.assign(this, attribute, {
						person_attribute_date: attribute.person_attribute_date ? new Date(attribute.person_attribute_date) : null,
					});
				}
			}

			return PersonAttribute;

		}]);

})();