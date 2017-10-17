/*
* @Author: egmfilho
* @Date:   2017-07-17 12:10:23
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-10 12:21:24
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
					get: get,
					pawn: pawn,
					redeem: redeem,
					order66: order66
				}

				// ******************************
				// Methods declaration
				// ******************************

				function get(person_id, options) {
					return provider.get({
						action: 'getList'
					}, {
						person_id: person_id,
						order_id: options && options.orderId,
						get_person_credit_pawn: options && options.getPawn
					}).$promise;
				}

				function pawn(array) {
					return provider.save({
						action: 'pawn'
					}, {
						payable_id: array
					}).$promise;
				}

				function redeem(array) {
					return provider.save({
						action: 'redeem'
					}, {
						payable_id: array
					}).$promise;
				}

				function order66() {
					return provider.get({
						action: 'order66'
					}, { }).$promise;
				}

			}];
		}]);

})();