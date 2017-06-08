/*
* @Author: egmfilho
* @Date:   2017-05-29 17:06:00
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-08 16:14:38
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('User', ['UserProfile', 'Person', 'UserCompany', 'UserPrice', function(UserProfile, Person, UserCompany, UserPrice) {

			var _user = {
				user_id: null,
				user_profile_id: null,
				user_seller_id: '',
				user_active: '',
				user_user: '',
				user_pass: '',
				user_name: '',
				user_mail: '',
				user_max_discount: 0,
				user_unlock_device: '',
				user_session_expires: '',
				user_login: null,
				user_update: null,
				user_date: null,
				user_current_session: { },
				user_last_session: { },
				user_profile: new UserProfile(),
				user_seller: new Person(),
				user_company: [ ],
				user_price: [ ]
			};
			
			function User(user) {
				angular.extend(this, _user);

				if (user) {
					angular.extend(this, user, {
						user_login: user.user_login ? new Date(user.user_login) : null,
						user_date: user.user_date ? new Date(user.user_date) : null,
						user_update: user.user_update ? new Date(user.user_update) : null,
						user_company: user.user_company.map(function(b) { return new UserCompany(b); }),
						user_price: user.user_price.map(function(p) { return new UserPrice(p); })
					});
				}
			}

			return User;

		}]);

}());