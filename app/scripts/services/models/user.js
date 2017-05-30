/*
* @Author: egmfilho
* @Date:   2017-05-29 17:06:00
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 12:04:01
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('User', ['UserProfile', 'Person', function(UserProfile, Person) {

			var _user = {
				user_id: '',
				user_profile_id: '',
				user_shop_id: '',
				user_seller_id: '',
				user_shop: '',
				user_price_id: '',
				user_price: '',
				user_current_session_id: '',
				user_active: '',
				user_unlock_device: '',
				user_name: '',
				user_user: '',
				user_mail: '',
				user_login: '',
				user_max_discount: '',
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