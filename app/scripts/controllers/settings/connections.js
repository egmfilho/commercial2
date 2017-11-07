/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-08-01 10:13:16
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-07 12:23:35
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.Connections', Connections);

	Connections.$inject = [ '$rootScope', '$scope', 'Constants' ];

	function Connections($rootScope, $scope, constants) {

		var self = this;

		constants.debug && console.log('SettingsCtrl.Connections pronto!');

	}

})();