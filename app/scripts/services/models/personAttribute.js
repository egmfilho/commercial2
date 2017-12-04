/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-06-30 16:47:19
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-04 09:08:27
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('PersonAttribute', ['Globals', function(Globals) {
			
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
					var _root = Globals.api.get().root;
					
					Object.assign(this, attribute, {
						person_attribute_date: attribute.person_attribute_date ? new Date(attribute.person_attribute_date) : null,
						person_attribute_image: attribute.person_attribute_image && attribute.person_attribute_image.indexOf(_root) < 0 ? _root + attribute.person_attribute_image : attribute.person_attribute_image
					});
				}
			}

			return PersonAttribute;

		}]);

})();