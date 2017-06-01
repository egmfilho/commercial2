/*
* @Author: egmfilho
* @Date:   2017-05-29 17:06:00
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-01 09:55:38
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('User', ['UserProfile', 'Person', function(UserProfile, Person) {

			var _user = {
				user_id: null,
				user_profile_id: null,
				user_seller_id: '',
				user_active: true,
				user_name: '',
				user_mail: '',
				user_max_discount: 0,
				user_unlock_device: false,
				user_session_expires: true,
				user_login: null,
				user_update: null,
				user_date: null,
				user_current_session: { },
				user_shop: [ ],
				user_price: [ ],
				user_last_session: { },
				user_profile: new UserProfile(),
				user_seller: new Person()
			};
			
			function User(user) {
				angular.extend(this, _user);

				if (user) {
					angular.extend(this, user, {
						user_profile: new UserProfile(user.user_profile),
						user_seller: new Person(user.user_seller)
					});
				}
			}

			return User;

		}]);

}());