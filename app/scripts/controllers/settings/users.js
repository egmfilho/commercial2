/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-25 16:51:12
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-30 12:49:33
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

			var controller = function(ProviderPerson, Person, CompanyERP, Price) {
				this._showCloseButton = true;
				
				var scope = this;

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
						scope.newUser = new User(Object.assign({ }, temp, {
							user_company: temp.user_company.map(function(c) {
								return scope.transformCompany(c);
							}),
							user_price: temp.user_price.map(function(p) {
								return scope.transformPrice(p);
							})
						}));

						scope.tempSeller = scope.sellers.find(function(s) {
							return s.person_id == temp.user_seller_id;
						});
					}
					$rootScope.loading.unload();
				}, function(error) {
					$rootScope.loading.unload();
					$rootScope.customDialog().showMessage('Erro', 'Erro ao receber as informações do servidor.');
				});

				this.transformCompany = function(chip) {
					if (chip instanceof CompanyERP) {
						return {
							company_id: chip.company_id,
							company_short_name: chip.company_short_name
						}
					} else {
						return {
							company_id: chip.company_id,
							company_short_name: chip.company_erp.company_short_name
						}
					}
				};

				this.queryCompany = function(query) {
					return scope.companies.filter(function(c) { 
						return c.queryable.toLowerCase().indexOf(query.toLowerCase()) >= 0 && scope.newUser.user_company.indexOf(c) == -1;
					});
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

				this.save = function() {
					console.log(scope.newUser);
				};
			};
			 
			controller.$inject = [ 'ProviderPerson', 'Person', 'CompanyERP', 'Price' ];

			$rootScope.customDialog().showTemplate('Configurações', './partials/modalNewUser.html', controller, options)
				.then(function(success) {

				}, function(error) {

				});
		};
	}

})();