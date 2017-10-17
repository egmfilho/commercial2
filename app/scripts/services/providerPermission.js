/*
* @Author: egmfilho
* @Date:   2017-06-22 11:12:57
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-18 17:02:08
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderPermission', ['Constants', function(constants) {

			var url = constants.api + 'permission.php',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url);

				return {
					authorize: function(module, access, user, pass) {
						return provider.save({}, {
							module: module,
							access: access,
							user_user: user,
							user_pass: pass
						}).$promise;
					}
				}

			}];

		}]);

})();