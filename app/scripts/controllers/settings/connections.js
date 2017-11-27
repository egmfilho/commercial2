/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-08-01 10:13:16
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-27 11:15:23
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.Connections', Connections);

	Connections.$inject = [ '$rootScope', '$scope', '$q', '$http', 'Globals', 'Constants' ];

	function Connections($rootScope, $scope, $q, $http, Globals, constants) {

		var self = this;

		this.internal = {
			api: {
				name: null,
				url: null,
				token: null
			}
		};

		function getConfig() {
			return $http({
				method: 'GET',
				url: Globals.api.get().address + 'config.php?action=getList'
			});
		}

		$rootScope.loading.load();
		$q.all([
			getConfig()
		]).then(function(success) {
			var config = success[0].data.data;

			self.internal.api.name = config.api ? config.api.api_name : null;
			self.internal.api.url = config.api ? config.api.api_url : null;
			self.internal.api.token = config.api ? config.api.api_token : null;

			$rootScope.loading.unload();
		}, function(error) {
			$rootScope.loading.unload();
			$rootScope.customDialog().showMessage('Erro', 'Erro ao receber as informações');
			angular.forEach(error, function(e) {
				$rootScope.writeLog(JSON.stringify(e));
			});
		});

		this.postApi = function() {

		};

		this.testApi = function() {

		};

	}

})();