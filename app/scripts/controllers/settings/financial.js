/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-11-27 16:32:57 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-05 11:40:56
 */

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.Financial', SettingsCtrl);

	SettingsCtrl.$inject = [ '$rootScope', '$scope', '$q', '$http', 'Globals' ];

	function SettingsCtrl($rootScope, $scope, $q, $http, Globals) {

		var self = this;

		self.internal = {
			payment: {
				authorized: null
			},
			credit: {
				entryId: null,
				modalityId: null,
				partialDrop: null,
				totalDrop: null
			},
			creditLimit: {
				authorized: null,
				debitLimit: null
			},
			bank: {
				authorized: null
			}
		};

		function convertConfigToInternalData(config) {
			self.internal.payment.authorized = config.payment ? config.payment.authorized_payments : null;

			self.internal.credit.entryId = config.credit ? config.credit.entry_id : null;
			self.internal.credit.modalityId = config.credit ? config.credit.modality_id : null;
			self.internal.credit.partialDrop = config.credit ? config.credit.partial_drop : null;
			self.internal.credit.totalDrop = config.credit ? config.credit.total_drop : null;

			self.internal.creditLimit.authorized = config.credit_limit ? config.credit_limit.authorized_modality_id : null;
			self.internal.creditLimit.debitLimit = config.credit_limit ? config.credit_limit.debit_day_limit : null;

			self.internal.bank.authorized = config.bank ? config.bank.authorized_bank : null;
		}

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

			convertConfigToInternalData(config);

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

		this.postPayment = function() {
			post([
				{
					config_category: 'payment',
					config_name: 'authorized_payments',
					config_value: self.internal.payment.authorized
				}
			]);
		};

		this.postCredit = function() {
			post([
				{
					config_category: 'credit',
					config_name: 'entry_id',
					config_value: self.internal.credit.entryId
				}, {
					config_category: 'credit',
					config_name: 'modality_id',
					config_value: self.internal.credit.modalityId
				}, {
					config_category: 'credit',
					config_name: 'partial_drop',
					config_value: self.internal.credit.partialDrop
				}, {
					config_category: 'credit',
					config_name: 'total_drop',
					config_value: self.internal.credit.totalDrop
				}
			]);
		};

		this.postCreditLimit = function() {
			post([
				{
					config_category: 'credit_limit',
					config_name: 'authorized_modality_id',
					config_value: self.internal.creditLimit.authorized
				}, {
					config_category: 'credit_limit',
					config_name: 'debit_day_limit',
					config_value: self.internal.creditLimit.debitLimit
				}
			]);
		};

		this.postBank = function() {
			post([
				{
					config_category: 'bank',
					config_name: 'authorized_bank',
					config_value: self.internal.bank.authorized
				}
			]);
		};
	}

})();