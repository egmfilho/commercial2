/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-11-08 08:44:05 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-29 10:04:21
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
		}, function(error) {
			$rootScope.loading.unload();
			$rootScope.customDialog().showMessage('Erro', 'Erro ao receber as informações');
			angular.forEach(error, function(e) {
				$rootScope.writeLog(JSON.stringify(e));
			});
		});

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
				self.internal = {
					isActive: company.config.active ? company.config.active.company_active == 'Y' : false,
					usesCredit: company.config.credit ? company.config.credit.use_credit == 'Y' : false,
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
						smtp: company.config.mail ? company.config.mail.mail_smtp == 'Y' : false
					},
					orderMessage: company.config.order ? company.config.order.order_message : null,
					hasICMS: company.config.taxation ? company.config.taxation.has_icms == 'Y' : null,
					hasST: company.config.taxation ? company.config.taxation.has_st == 'Y' : null,
					uf: company.config.taxation ? company.config.taxation.uf_code : null
				};
			}

			self.internal.companyCode = company.company_code;
		}

		function convertToPostData() {
			return {
				active: {
					company_active: self.internal.isActive
				},
				credit: {
					use_credit: self.internal.usesCredit
				},
				customer: {
					customer_code: self.internal.defaultCustomerCode
				},
				financial: {
					modality_max_discount: (function() {
						return self.internal.maxDiscounts.reduce(function(obj, item) {
							obj[item.id] = item.value;
							return obj;
						}, { });
					})()
				},
				logo: {
					// company_logo: convertImageToBase64(self.internal.logoUrl)
				},
				mail: {
					mail_host: self.internal.mail.host,
					mail_mail: self.internal.mail.address,
					mail_password: self.internal.mail.password,
					mail_port: self.internal.mail.port,
					mail_sender: self.internal.mail.sender,
					mail_smtp: self.internal.mail.smtp
				},
				order: {
					order_message: self.internal.orderMessage
				},
				taxation: {
					has_icms: self.internal.hasICMS,
					has_st: self.internal.hasST,
					uf_code: self.internal.uf
				}
			};
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
				self.internal.logoUrl = data.data.path;
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

		function post(action, data) {
			if (!action || !data) return;
			
			return $http({
				method: 'POST',
				url: Globals.api.get().address + 'config.php?action=' + action,
				data: data
			});
		}

		this.postActivate = function() {
			var data = {
				company_active: self.internal.isActive
			};

			$rootScope.loading.load();
			post('edit', [{ active: data }]).then(function(success) {
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
			});
		};

		this.postLogo = function() {
			if (!self.internal.logo) {
				$rootScope.customDialog().showMessage('Erro', 'Nenhuma imagem informada!');
				return;
			}

			var data = {
				company_logo: self.internal.logo
			};

			$rootScope.loading.load();
			post('edit', [{ logo: data }]).then(function(success) {
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
			});
		};

		this.postEmail = function() {
			if (!self.internal.mail.sender) {
				$rootScope.customDialog().showMessage('Erro', 'Informe o nome do remetente do email!');
				return;
			}

			if (!self.internal.mail.host) {
				$rootScope.customDialog().showMessage('Erro', 'Informe o host do email!');
				return;
			}  

			if (!self.internal.mail.port) {
				$rootScope.customDialog().showMessage('Erro', 'Informe a porta do host de email!');
				return;
			} 

			if (!self.internal.mail.address) {
				$rootScope.customDialog().showMessage('Erro', 'Informe o endereço do email!');
				return;
			}
			
			if (!self.internal.mail.password) {
				$rootScope.customDialog().showMessage('Erro', 'Informe a senha do email!');
				return;
			}

			var data = {
				mail_host: self.internal.mail.host,
				mail_mail: self.internal.mail.address,
				mail_password: self.internal.mail.password,
				mail_port: self.internal.mail.port,
				mail_sender: self.internal.mail.sender,
				mail_smtp: self.internal.mail.smtp
			};

			$rootScope.loading.load();
			post('edit', [{ mail: data }]).then(function(success) {
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
			});
		};

		this.postPrint = function() {
			if (!self.internal.orderMessage) {
				$rootScope.customDialog().showMessage('Erro', 'Informe a mensagem de rodapé da impressão!');
			}

			var data = {
				order_message: self.internal.orderMessage
			};

			$rootScope.loading.load();
			post('edit', [{ order: data }]).then(function(success) {
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
			});
		};

		this.postFinancial = function() {
			var data = convertToPostData().financial;

			console.log(data);

			$rootScope.loading.load();
			post('financial', [data]).then(function(success) {
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
			});
		};

		this.postGeneral = function() {

			if (!self.internal.uf) {
				$rootScope.customDialog().showMessage('Erro', 'Informe a UF!');
				return;
			}

			var data = [{
					taxation: {
						has_icms: self.internal.hasICMS,
						has_st: self.internal.hasST,
						uf_code: self.internal.uf
					}
				}, 
				{
					credit: {
						use_credit: self.internal.usesCredit
					}
				}];

			$rootScope.loading.load();
			post('edit', data).then(function(success) {
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
			});
		};

	}

})();