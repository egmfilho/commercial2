/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-24 17:37:37
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-07 16:07:41
 */
'use strict';

angular.module('commercial2.controllers')
	.controller('AboutCtrl', ['$http', 'Globals', function($http, Globals) {
		
		var self = this;

		this.printTemplate = 'oi';

		$http({
			method: 'POST',
			url: Globals.api.get().address + 'order.php?action=getPrint',
			data: {
				order_code: '060807'
			}
		}).then(function(success) {
			self.printTemplate = success.data;
		}, function(error) {
			console.log(error);
		});

	}]);