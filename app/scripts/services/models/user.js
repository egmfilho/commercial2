/*
* @Author: egmfilho
* @Date:   2017-05-29 17:06:00
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-25 18:11:08
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('User', ['UserProfile', 'Person', 'UserCompany', 'UserPrice', function(UserProfile, Person, UserCompany, UserPrice) {
			
			function User(user) {
				this.user_id              = null;
				this.user_profile_id      = null;
				this.user_seller_id       = null;
				this.user_active          = null;
				this.user_user            = null;
				this.user_pass            = null;
				this.user_name            = null;
				this.user_mail            = null;
				this.user_max_discount    = 0;
				this.user_unlock_device   = null;
				this.user_session_expires = null;
				this.user_login           = null;
				this.user_update          = null;
				this.user_date            = null;
				this.user_current_session = new Object();
				this.user_last_session    = new Object();
				this.user_profile         = new UserProfile();
				this.user_seller          = new Person();
				this.user_company         = new Array();
				this.user_price           = new Array();

				if (user) {
					Object.assign(this, user, {
						user_login: user.user_login ? new Date(user.user_login) : null,
						user_date: user.user_date ? new Date(user.user_date) : null,
						user_update: user.user_update ? new Date(user.user_update) : null,
						user_company: user.user_company ? user.user_company.map(function(b) { return new UserCompany(b); }) : null,
						user_price: user.user_price ? user.user_price.map(function(p) { return new UserPrice(p); }) : null
					});
				}
			}

			return User;

		}]);

}());