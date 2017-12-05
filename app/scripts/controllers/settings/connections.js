/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-08-01 10:13:16
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-05 11:46:41
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

		function post(data) {
			$rootScope.writeLog('Editing config');
			$rootScope.loading.load();
			$http({
				method: 'POST',
				url: Globals.api.get().address + 'config.php?action=edit',
				data: {
					data: data
				}
			}).then(function(success) {
				$rootScope.writeLog('New config values sent');
				$rootScope.writeLog(JSON.stringify(data));
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Sucesso', 'Dados atualizados!');
			}, function(error) {
				$rootScope.writeLog('Error while trying to edit config values!');
				$rootScope.writeLog(JSON.stringify(error));
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		};

		this.postApi = function() {
			post([
				{
					config_category: 'api',
					config_name: 'api_name',
					config_value: self.internal.api.name
				},
				{
					config_category: 'api',
					config_name: 'api_token',
					config_value: self.internal.api.token
				},
				{
					config_category: 'api',
					config_name: 'api_url',
					config_value: self.internal.api.url
				}
			]);
		};

		this.testApi = function() {
			$rootScope.loading.load();
			$http({
				method: 'POST',
				url: Globals.api.get().address + 'config.php?action=testApi',
				data: {
					api_url: self.internal.api.url,
					api_token: self.internal.api.token
				}
			}).then(function(success) {
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Sucesso', 'API válida!');
			}, function(error) {
				console.log(error);
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		};

	}

})();