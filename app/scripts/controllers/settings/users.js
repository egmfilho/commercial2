/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-25 16:51:12
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-05 08:34:41
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.Users', Users);

	Users.$inject = [ '$rootScope', '$scope', '$q', '$http', 'ProviderUser', 'User', 'UserProfile', 'Globals', 'Constants' ];

	function Users ($rootScope, $scope, $q, $http, providerUser, User, UserProfile, Globals, constants) {

		var self = this;

		this.view = 'profiles';
		this.profiles = [ ];
		this.users = [ ];
		this.filters = {
			profiles: {
				property: null,
				reverse: false
			},
			users: {
				property: 'user_name',
				reverse: false,
				getClassesFor: function(property) {
					var classes = 'fa ';
					if (property == self.filters.users.property) {
						classes += self.filters.users.reverse ? 'fa-sort-down' : 'fa-sort-up';
					} else {
						classes += 'fa-sort fandangos';
					}
					return classes;
				}
			}
		};

		constants.debug && console.log('SettingsCtrl.Users pronto!');

		function getUsers() {
			$rootScope.loading.load();
			providerUser.getAll().then(function(success) {
				self.users = success.data.map(function(u) { 
					var user = new User(u);
					user.user_profile_name = user.user_profile.user_profile_name;
					return user;
				});
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		function getProfiles() {
			$rootScope.loading.load();
			$http({
				method: 'GET',
				url: Globals.api.get().address + 'user_profile.php?action=getList'
			}).then(function(success) {
				self.profiles = success.data.data.map(function(p) {
					return new UserProfile(p);
				});
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		}

		getProfiles();

		this.changeView = function(viewName) {
			switch(viewName) {
				case 'profiles': {
					getProfiles();
					this.view = viewName;
					break;
				}

				case 'users': {
					getUsers();
					this.view = viewName;
					break;
				}
			}
		}

		this.setUsersTableFilters = function(property) {
			if (property == self.filters.users.property) {
				self.filters.users.reverse = !self.filters.users.reverse;
			} else {
				self.filters.users.reverse = false;
			}
			
			self.filters.users.property = property;
		};

		this.newUserModal = function(userToEdit) {
			var options = {
				width: 800,
				focusOnOpen: false,
			};
			console.log(userToEdit);
			var controller = function(ProviderPerson, Person, CompanyERP, Price) {
				this._showCloseButton = true;
				
				var scope = this;

				this.providerUser = providerUser;
				this.sellers = [ ];
				this.profiles = self.profiles;
				this.companies = [ ];
				this.prices = [ ];
				this.newUser = new User();
				
				function getUserToEdit() {
					if (userToEdit) {
						return providerUser.getById(userToEdit.user_id);
					} else {
						return null;
					}
				}

				function getSellers() {
					return ProviderPerson.getByType(Globals.get('person-categories').seller, { limit: -1, activeOnly: true });
				}

				function getCompanies() {
					return $http({
						method: 'GET',
						url: Globals.api.get().address + 'company.php?action=getList'
					});
				}

				function getPrices() {
					return $http({
						method: 'GET',
						url: Globals.api.get().address + 'price.php?action=getList'
					});
				}

				$rootScope.loading.load();
				$q.all([
					getCompanies(),
					getPrices(),
					getSellers(), 
					getUserToEdit()
				]).then(function(success) {
					scope.companies = success[0].data.data.map(function(c) { return new CompanyERP(c) });
					scope.prices = success[1].data.data.map(function(p) { return new Price(p) });
					scope.sellers = success[2].data.map(function(p) { return new Person(p) });
					if (success[3] && success[3].data) {
						var temp = new User(success[3].data);

						scope.newUser = new User(temp);
						scope.newUser.user_company = temp.user_company.map(function(c) {
							return scope.transformCompany(c);
						});
						scope.newUser.user_price = temp.user_price.map(function(p) {
							return scope.transformPrice(p);
						});

						scope.tempSeller = scope.sellers.find(function(s) {
							return s.person_id == temp.user_seller_id;
						});
						scope.mainCompanyId = scope.newUser.user_company.find(function(c) {
							return c.user_company_main == 'Y';
						}).company_id;
					}
					$rootScope.loading.unload();
				}, function(error) {
					$rootScope.loading.unload();
					$rootScope.customDialog().showMessage('Erro', 'Erro ao receber as informações do servidor.')
						.then(function(success) {
							scope._cancel();
						}, function(error) {
							scope._cancel();
						});
				});

				this.transformCompany = function(chip) {
					if (chip instanceof CompanyERP) {
						return {
							company_id: chip.company_id,
							company_name: chip.company_name,
							company_short_name: chip.company_short_name,
							user_company_main: 'N'
						}
					} else {
						return {
							company_id: chip.company_id,
							company_name: chip.company_erp.company_name,
							company_short_name: chip.company_erp.company_short_name,
							user_company_main: chip.user_company_main
						}
					}
				};

				this.queryCompany = function(query) {
					return scope.companies.filter(function(c) { 
						if (!scope.newUser.user_company.find(function(x) { return x.company_id == c.company_id }))
							return c.queryable.toLowerCase().indexOf(query.toLowerCase()) >= 0;
					});
				};

				this.setMainCompany = function(index) {
					if (index >= scope.newUser.user_company.length) {
						scope.mainCompanyId = null;
						return;
					}

					// quando nao vem index, seleciona o primeiro elemento 
					// mas so se o array for de 1 elemento
					if (!index && scope.newUser.user_company.length == 1) {
						scope.newUser.user_company[0].user_company_main = 'Y';
						scope.mainCompanyId = scope.newUser.user_company[0].company_id;
						return;
					}

					angular.forEach(scope.newUser.user_company, function(item) {
						item.user_company_main = 'N';
					});
					scope.newUser.user_company[index].user_company_main = 'Y';
				};

				this.transformPrice = function(chip) {
					if (chip instanceof Price) {
						return {
							price_id: chip.price_id,
							price_code: chip.price_code,
							price_name: chip.price_name
						}
					} else {
						return {
							price_id: chip.price_id,
							price_code: chip.price_erp.price_code,
							price_name: chip.price_erp.price_name
						}
					}
				};

				this.queryPrice = function(query) {
					return scope.prices.filter(function(p) { 
						return p.queryable.toLowerCase().indexOf(query.toLowerCase()) >= 0 && scope.newUser.user_price.indexOf(p) == -1;
					});
				};

				this.querySeller = function(query) {
					return scope.sellers.filter(function(p) {
						return p.queryable.toLowerCase().indexOf(query.toLowerCase()) >= 0;
					});
				};

				this.removeSeller = function(query) {;
					if (query.length == 0) 
						scope.newUser.removeSeller();
				};

				function validate() {
					if (!scope.newUser.user_name) {
						$rootScope.customDialog().showMessage('Aviso', 'Informe o nome!');
						return false;
					}

					if (!scope.newUser.user_mail) {
						$rootScope.customDialog().showMessage('Aviso', 'Informe o email!');
						return false;
					}

					if (!scope.newUser.user_user) {
						$rootScope.customDialog().showMessage('Aviso', 'Informe o nome de usuário!');
						return false;
					}

					// Verifica se está inserindo ou editando para validar a senha
					if (!scope.newUser.user_id) {
						if (!scope.newUser.user_pass) {
							$rootScope.customDialog().showMessage('Aviso', 'Informe a senha!');
							return false;
						}
					}

					if (scope.newUser.user_pass || scope.newUser.user_pass_confirmation) {
						if (scope.newUser.user_pass != scope.newUser.user_pass_confirmation) {
							$rootScope.customDialog().showMessage('Aviso', 'As senhas não conferem!');
							return false;
						}
					}

					// if (!scope.newUser.user_seller_id) {
					// 	$rootScope.customDialog().showMessage('Aviso', 'Informe o representante!');
					// 	return false;
					// }

					if (!scope.newUser.user_profile_id) {
						$rootScope.customDialog().showMessage('Aviso', 'Selecione o perfil do usuário!');
						return false;
					}

					if (!scope.newUser.user_company.length) {
						$rootScope.customDialog().showMessage('Aviso', 'Selecione pelo menos 1 empresa');
						return false;
					}

					if (!scope.mainCompanyId) {
						$rootScope.customDialog().showMessage('Aviso', 'Selecione a empresa principal');
						return false;
					}

					if (!scope.newUser.user_price.length) {
						$rootScope.customDialog().showMessage('Aviso', 'Selecione pelo menos 1 tabela de preço!');
						return false;
					}

					return true;
				}

				this.save = function(action) {
					if (!validate()) return;

					$rootScope.loading.load();
					if (scope.newUser.user_id) {
						providerUser.edit(scope.newUser).then(function(success) {
							getUsers();
							$rootScope.customDialog().showMessage('Sucesso', 'Usuário editado!')
								.then(function(success) {
									scope._close();
								}, function(error) {
									scope._close();
								});
							$rootScope.loading.unload();
						}, function(error) {
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						});
					} else {
						providerUser.save(scope.newUser).then(function(success) {
							getUsers();
							$rootScope.customDialog().showMessage('Sucesso', 'Usuário cadastrado!')
								.then(function(success) {
									scope._close();
								}, function(error) {
									scope._close();
								});
							$rootScope.loading.unload();
						}, function(error) {
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						});
					}
				};
			};
			 
			controller.$inject = [ 'ProviderPerson', 'Person', 'CompanyERP', 'Price' ];

			$rootScope.customDialog().showTemplate('Configurações', './partials/modalNewUser.html', controller, options)
				.then(function(success) {
					getUsers();
				}, function(error) {

				});
		};
	}

})();