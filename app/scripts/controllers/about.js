/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-24 17:37:37
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-06 12:51:19
 */
'use strict';

angular.module('commercial2.controllers')
	.controller('AboutCtrl', ['WebCamera', function(WebCamera) {
		
		var self = this;

		this.img = null;

		this.camera = function() {
			WebCamera.start().then(function(success) {
				self.img = success;
			});
		};

	}]);