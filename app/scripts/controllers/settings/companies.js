/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-11-08 08:44:05 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-05 13:13:47
 */

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.Companies', Companies);

	Companies.$inject = [ '$rootScope', '$scope', '$q', '$http', 'Globals', 'Constants' ];

	function Companies($rootScope, $scope, $q, $http, Globals, constants) {

		var self = this;

		this.array = [ ];
		this.currentCompany = null;
		this.internal = { };

		load();

		function getCompaniesConfig() {
			return $http({
				method: 'GET',
				url: Globals.api.get().address + 'config.php?action=getList'
			});
		}

		function getCompanies() {
			return $http({
				method: 'GET',
				url: Globals.api.get().address + 'company.php?action=getList'
			});
		}

		function load() {
			var deferred = $q.defer();

			$rootScope.loading.load();
			$q.all([
				getCompanies(),
				getCompaniesConfig()
			]).then(function(success) {
				var companies = success[0].data.data,
					configs = success[1].data.data;
	
				self.array = companies.map(function(c) {
					c.config = configs.company[c.company_code];
					return c;
				});
	
				convertToInternalData(self.array[0]);
	
				$rootScope.loading.unload();

				deferred.resolve();
			}, function(error) {
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', 'Erro ao receber as informações');
				angular.forEach(error, function(e) {
					$rootScope.writeLog(JSON.stringify(e));
				});
				
				deferred.reject();
			});

			return deferred.promise;
		}

		function resetInternalData() {
			self.internal = {
				companyCode: null,
				isActive: false,
				usesCredit: false,
				defaultCustomerCode: null,
				maxDiscounts: [],
				logoUrl: null,
				logo: null,
				mail: {
					host: null,
					address: null,
					password: null,
					port: null,
					sender: null,
					smtp: false
				},
				orderMessage: null,
				hasICMS: false,
				hasST: false,
				uf: null
			};
		}

		function convertToInternalData(company) {
			if (!company.config) {
				resetInternalData();
			} else {
				try {
					self.internal = {
						isActive: company.config.active ? company.config.active.company_active : null,
						usesCredit: company.config.credit ? company.config.credit.use_credit : null,
						defaultCustomerCode: company.config.customer ? company.config.customer.customer_code : null,
						maxDiscounts: (function() {
							if (!company.config.financial)
								return []; 
							
							var obj = company.config.financial.modality_max_discount;
							
							return Object.keys(obj).map(function(n) { 
								return { id: n, value: obj[n] }
							});;
						})(),
						logo: company.config.logo ? company.config.logo.company_logo : null,
						mail: {
							host: company.config.mail ? company.config.mail.mail_host : null,
							address: company.config.mail ? company.config.mail.mail_mail : null,
							password: company.config.mail ? company.config.mail.mail_password : null,
							port: company.config.mail ? company.config.mail.mail_port : null,
							sender: company.config.mail ? company.config.mail.mail_sender : null,
							smtp: company.config.mail ? company.config.mail.mail_smtp : false
						},
						orderMessage: company.config.order ? company.config.order.order_message : null,
						hasICMS: company.config.taxation ? company.config.taxation.has_icms : null,
						hasST: company.config.taxation ? company.config.taxation.has_st : null,
						uf: company.config.taxation ? company.config.taxation.uf_code : null
					};
				} catch(e) {
					console.log(e);
				}
			}

			self.internal.companyCode = company.company_code;
		}

		this.selectCompany = function(company) {
			$rootScope.loading.load();
			
			jQuery('.companies > div > md-content').animate({
				scrollTop: 0
			}, 100);
			
			setTimeout(function() {
				convertToInternalData(company);
				$rootScope.loading.unload();
			}, 200);
		};

		this.openDialog = function() {
			jQuery('#file-input').click();
		};

		this.watchFile = function(data) {
			console.log(data);

			if (data.data.type.indexOf('image/') < 0) {
				$rootScope.customDialog().showMessage('Erro', 'Por favor selecione um arquivo de imagem.');
				return;
			}

			$scope.$apply(function() {
				self.internal.logoUrl = data.data.name;
				self.internal.logo = data.result;
			});
		};

		this.addModalityDiscount = function() {
			self.internal.maxDiscounts.push({
				id: null,
				value: 0
			});
		};

		this.removeModalityDiscount = function(modality) {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja remover a modalidade?')
				.then(function(success) {
					var index = self.internal.maxDiscounts.indexOf(modality);
					
					if (index < 0) {
						console.log('modality not found');
						return;
					}
		
					self.internal.maxDiscounts.splice(index, 1);
				}, function(error) { });
		};

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
				load().then(function() {
					$rootScope.customDialog().showMessage('Sucesso', 'Dados atualizados!');
				}, function() {});
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.writeLog('Error while trying to edit config values!');
				$rootScope.writeLog(JSON.stringify(error));
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		};

		this.postActivate = function() {
			post([
				{
					config_category: 'active',
					config_name: 'company_active',
					company_id: self.internal.companyCode,
					config_value: self.internal.isActive
				}
			]);
		};

		this.postLogo = function() {
			console.log(self.internal.logo);
			if (!self.internal.logo) {
				$rootScope.customDialog().showMessage('Erro', 'Selecione uma imagem válida!');
				return;
			}

			post([
				{
					config_category: 'logo',
					config_name: 'company_logo',
					company_id: self.internal.companyCode,
					config_value: self.internal.logo
				}
			]);
		};

		function validateEmail() {
			if (!self.internal.mail.sender) {
				$rootScope.customDialog().showMessage('Erro', 'Informe o nome do remetente do email!');
				return false;
			}

			if (!self.internal.mail.host) {
				$rootScope.customDialog().showMessage('Erro', 'Informe o host do email!');
				return false;
			}  

			if (!self.internal.mail.port) {
				$rootScope.customDialog().showMessage('Erro', 'Informe a porta do host de email!');
				return false;
			} 

			if (!self.internal.mail.address) {
				$rootScope.customDialog().showMessage('Erro', 'Informe o endereço do email!');
				return false;
			}
			
			if (!self.internal.mail.password) {
				$rootScope.customDialog().showMessage('Erro', 'Informe a senha do email!');
				return false;
			}

			return true;
		}

		this.testEmail = function() {
			if (!validateEmail()) return;

			$rootScope.loading.load();
			$http({
				method: 'POST',
				url: Globals.api.get().address + 'config.php?action=testEmail',
				data: {
					mail_host: self.internal.mail.host,
					mail_mail: self.internal.mail.address,
					mail_password: self.internal.mail.password,
					mail_port: self.internal.mail.port,
					mail_sender: self.internal.mail.sender,
					mail_smtp: self.internal.mail.smtp
				}
			}).then(function(success) {
				$rootScope.customDialog().showMessage('Sucesso', 'Configurações validadas com sucesso!');
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		};

		this.postEmail = function() {
			if (!validateEmail()) return;

			post([
				{
					config_category: 'mail',
					config_name: 'mail_host',
					company_id: self.internal.companyCode,
					config_value: self.internal.mail.host
				}, {
					config_category: 'mail',
					config_name: 'mail_mail',
					company_id: self.internal.companyCode,
					config_value: self.internal.mail.address
				}, {
					config_category: 'mail',
					config_name: 'mail_password',
					company_id: self.internal.companyCode,
					config_value: self.internal.mail.password
				}, {
					config_category: 'mail',
					config_name: 'mail_port',
					company_id: self.internal.companyCode,
					config_value: self.internal.mail.port
				}, {
					config_category: 'mail',
					config_name: 'mail_sender',
					company_id: self.internal.companyCode,
					config_value: self.internal.mail.sender
				}, {
					config_category: 'mail',
					config_name: 'mail_smtp',
					company_id: self.internal.companyCode,
					config_value: self.internal.mail.smtp
				}
			]);
		};

		this.postPrint = function() {
			post([
				{
					config_category: 'order',
					config_name: 'order_message',
					company_id: self.internal.companyCode,
					config_value: self.internal.orderMessage
				}
			]);
		};

		this.postFinancial = function() {
			var data = self.internal.maxDiscounts.reduce(function(obj, item) {
				obj[item.id] = item.value;
				return obj;
			}, { });

			post([
				{
					config_category: 'financial',
					config_name: 'modality_max_discount',
					company_id: self.internal.companyCode,
					config_value: JSON.stringify(data)
				}
			]);
		};

		this.postGeneral = function() {

			if (!self.internal.uf) {
				$rootScope.customDialog().showMessage('Erro', 'Informe a UF!');
				return;
			}

			post([
				{
					config_category: 'customer',
					config_name: 'customer_code',
					company_id: self.internal.companyCode,
					config_value: self.internal.defaultCustomerCode
				}, {
					config_category: 'credit',
					config_name: 'user_credit',
					company_id: self.internal.companyCode,
					config_value: self.internal.usesCredit
				}, {
					config_category: 'taxation',
					config_name: 'has_icms',
					company_id: self.internal.companyCode,
					config_value: self.internal.hasICMS
				}, {
					config_category: 'taxation',
					config_name: 'has_st',
					company_id: self.internal.companyCode,
					config_value: self.internal.hasST
				}, {
					config_category: 'taxation',
					config_name: 'uf_code',
					company_id: self.internal.companyCode,
					config_value: self.internal.uf
				}
			]);
		};

	}

})();