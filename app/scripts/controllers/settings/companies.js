/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-11-08 08:44:05 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-08 14:31:09
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
		});

		function resetInternalData() {
			self.internal = {
				companyCode: null,
				isActive: false,
				usesCredit: false,
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
				logo: {
					company_logo: convertImageToBase64(self.internal.logoUrl)
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
			$scope.$apply(function() {
				self.internal.logoUrl = data.data.path;
				self.internal.logo = data.result;
			});
		};

	}

})();