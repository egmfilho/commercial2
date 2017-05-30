/*
* @Author: egmfilho
* @Date:   2017-05-29 17:07:16
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 12:03:51
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('UserProfile', ['UserPermissions', function(UserPermissions) {

			var _userProfile = {
				user_profile_id: '',
				user_profile_name: '',
				user_profile_date: '',
				user_profile_update: '',
				user_profile_access: new UserPermissions()
			};

			function UserProfile(userProfile) {
				angular.extend(this, _userProfile);

				if (userProfile) {
					angular.extend(this, userProfile, {
						user_profile_access: new UserPermissions(userProfile.user_profile_access)
					});
				}
			}
			
			return UserProfile;		

		}]);

}());