/*
* @Author: egmfilho
* @Date:   2017-06-23 17:13:32
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-04 10:07:52
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('OpenOrderCtrl', OpenOrderCtrl);

		OpenOrderCtrl.$inject = [ '$rootScope', '$scope', '$routeParams', '$location', '$q', '$timeout', '$filter', 'ProviderOrder', 'Order', 'ProviderPerson', 'Person', 'Globals', 'Constants', 'ElectronWindow' ];

		function OpenOrderCtrl($rootScope, $scope, $routeParams, $location, $q, $timeout, $filter, providerOrder, Order, providerPerson, Person, Globals, constants, ElectronWindow) {

			var self = this,
				Mousetrap = null;

			self.seller = null;
			self.companyId = Globals.get('user').user_company[0].company_id;

			self.filters = {
				query: '',
				status: '',
				exportType: '',
				setStatus: function(exportType, status, child) {
					jQuery('.filters .status-filter').removeClass('active');

					if (status == self.filters.status && exportType == self.filters.exportType) {
						self.filters.status = '';
						self.filters.exportType = '';
					}
					else {
						self.filters.status = status;
						self.filters.exportType = exportType;
						jQuery('.filters .status-filter:nth-child(' + child + ')').addClass('active');
					}
				}
			}

			if (constants.isElectron) {
				Mousetrap = require('mousetrap');
				Mousetrap.bind(['command+f', 'ctrl+f'], function() {
					$timeout(function() { $scope.setSearchOpen(true); });
					return false;
				});
			}

			$scope.globals = Globals.get;

			$scope.$on('$viewContentLoaded', function() {
				$rootScope.titleBarText = 'Abrir Orçamento';

				if ($routeParams.company)
					self.companyId = $routeParams.company;

				if ($routeParams.start)
					self.calendar.start.value = $routeParams.company;

				
				self.getOrders();
			});

			$scope.$on('$destroy', function() {
				$rootScope.titleBarText = '';
				
				if (constants.isElectron) 
					Mousetrap.unbind(['command+f', 'ctrl+f']);
			});

			$scope.newOrder = function(companyId) {
				var options = {
					title: 'Novo orçamento'
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/new?company=' + companyId, options);
				else
					$location.path('/order/new').search('company', companyId);
			}

			$scope.open = function(order) {

				var options = {
					title: 'Cód: ' + order.order_code + ' (' + $filter('date')(order.order_date, 'short') + ')'
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/edit?code=' + order.order_code, options);
				else
					$location.path('/order/edit').search('code', order.order_code);
			};

			$scope.delete = function(order) {
				$rootScope.customDialog().showConfirm('Aviso', 'Excluir o orçamento <b>' + order.order_code + '</b>?')
					.then(function(success) {
						$rootScope.loading.load();
						providerOrder.remove(order.order_id).then(function(success) {
							$rootScope.loading.unload();
							// $rootScope.customDialog().showMessage('Sucesso', 'Orçamento excluído!');
							self.getOrders();
						}, function(error) { 
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						});
					}, function(error) { });
			}

			$scope.setSearchOpen = function(value) {
				$scope.isSearchOpened = value;

				if (value)
					jQuery('.search-container .search input').focus().select();
				else 
					jQuery('.search-container .search input').blur();
			};

			self.companies = Globals.get('user').user_company;

			self.calendar = {}
			self.calendar.start = {
				isCalendarOpen: false,
				value: moment().toDate(),
				maxDate: moment().toDate(),
				update: function(){
					self.calendar.end.value = moment(self.calendar.start.value).toDate();
					self.calendar.end.minDate = moment(self.calendar.start.value).toDate();
					self.calendar.end.maxDate = moment(self.calendar.start.value).add(7,'days').toDate();
				}
			};

			self.calendar.end = {
				isCalendarOpen: false,
				value: moment().toDate(),
				minDate: moment(self.calendar.start.value).toDate(),
				maxDate: moment(self.calendar.start.value).add(7,'days').toDate()
			};

			self.grid = {
				propertyName: 'order_code',
				reverse: true
			}

			self.sortBy = function(propertyName) {
				self.grid.reverse = (self.grid.propertyName === propertyName) ? !self.grid.reverse : false;
				self.grid.propertyName = propertyName;
			};

			self.getOrders = function (){
				self.orders = [];

				var options = {
						company_id: self.companyId,
						start_date: self.calendar.start.value,
						end_date: self.calendar.end.value,
						order_seller_id: self.seller && self.seller.person_id,
						getCustomer: true,
						getSeller: true,
						limit: 30
					};

				$rootScope.loading.load();
				providerOrder.getAll(options).then(function(success) {
					self.orders = success.data.map(function(order) {
						return new Order(order);
					});

					$rootScope.loading.unload();

					if (!self.orders.length) {
						$rootScope.customDialog().showMessage('Aviso', 'Nenhum orçamento encontrado!');
					}
				}, function(error) {
					constants.debug && console.log(error);
					$rootScope.loading.unload();
				});
			}

			function getPersonByName(name, category) {
				var deferred = $q.defer();

				if (!name || !category || name.length < 3)
					return [ ];

				providerPerson.getByName(name, category, { limit: 10 }).then(function(success) {
					deferred.resolve(success.data.map(function(p) { return new Person(p); }));
				}, function(error) {
					constants.debug && console.log(error);
					deferred.resolve([ ]);
				});

				return deferred.promise;
			}

			self.getSellerByName = function(name) {
				return getPersonByName(name, Globals.get('person-categories').seller);
			}

			self.print = function(code) {
				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/print/' + code + '?action=print');
				else
					$location.path('/order/print/'+code)
			}

			self.savePDF = function(code) {
				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/print/' + code + '?action=pdf');
				else
					$location.path('/order/print/'+code)
			}

		}

}());