/*
* @Author: egmfilho
* @Date:   2017-05-29 17:07:16
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-22 16:47:11
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('UserProfile', ['UserPermissions', function(UserPermissions) {

			function UserProfile(userProfile) {
				this.user_profile_id     = null;
				this.user_profile_name   = null;
				this.user_profile_date   = null;
				this.user_profile_update = null;
				this.user_profile_access = new UserPermissions();

				if (userProfile) {
					angular.merge(this, userProfile, {
						user_profile_access: new UserPermissions(userProfile.user_profile_access)
					});
				}
			}
			
			return UserProfile;		

		}]);

}());