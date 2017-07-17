/*
* @Author: egmfilho
* @Date:   2017-07-17 12:10:23
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-17 14:17:32
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderPersonCredit', ['Constants', function(constants) {

			var url = constants.api + 'person_credit.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false }
				});

				return {
					get: get
				}

				// ******************************
				// Methods declaration
				// ******************************

				function get(person_id, options) {
					return provider.get({
						action: 'getList'
					}, {
						person_id: person_id,
						get_person_credit_pawn: options && options.getPawn
					}).$promise;
				}

				function send(array, instance) {
					return provider.save({
						action: 'pawn'
					}, {
						payable_id: array,
						instance_id: instance
					}).$promise;
				}

			}];
		}]);

}());