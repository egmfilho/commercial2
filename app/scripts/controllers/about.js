/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-24 17:37:37
 * @Last Modified by: egmfilho
 * @Last Modified time: 2018-01-24 12:34:59
 */
'use strict';

angular.module('commercial2.controllers')
	.controller('AboutCtrl', ['$http', 'Globals', 'Alphabet', function($http, Globals, Alphabet) {
		
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

		this.chars = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ];
		this.getColors = function(character) {
			if (!character) return;
			console.log('CHAR: ' + character);
			return Alphabet[character.toLowerCase()];
		};

	}]);