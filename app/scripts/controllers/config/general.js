/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-25 14:03:54
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-25 14:12:02
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('ConfigCtrl.General', General);

	General.$inject = [ '$rootScope', '$scope', 'Constants' ];

	function General($rootScope, $scope, constants) {

		var self = this;

		constants.debug && console.log('ConfigCtrl.General pronto!');

	}

})();