/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-07-25 14:03:54
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-07 12:23:17
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.General', General);

	General.$inject = [ '$rootScope', '$scope', 'Constants' ];

	function General($rootScope, $scope, constants) {

		var self = this;

		constants.debug && console.log('SettingsCtrl.General pronto!');

	}

})();