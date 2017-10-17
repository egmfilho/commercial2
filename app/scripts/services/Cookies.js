/*
* @Author: egmfilho
* @Date:   2017-06-05 09:24:11
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 14:31:57
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('Cookies', Cookies);

	Cookies.$inject = [ 'Constants' ];

	function Cookies(constants) {
		var session,
			_url = 'http://commercial.com.br';

		if (constants.isElectron) {
			constants.debug && console.log('Cookies started on Electron mode');
			session = require('electron').remote.session.defaultSession;
		}

		this.$get = ['$window', '$q', function($window, $q) {
			
			return {
				set: set,
				get: get,
				remove: remove,
				clear: clear
			};

			// ******************************
			// Methods declaration
			// ******************************

			/**
			* Adiciona um cookie.
			* @param {object} data - O valores do cookie a ser armazenado.
			* @returns {object} Uma promise com o resultado.
			*/
			function set(data) {
				var deferred = $q.defer();

				if (constants.isElectron) {
					session.cookies.set({
						url: _url,
						name: data.name,
						value: data.value,
					}, function(error) {
						error ? deferred.reject(error) : deferred.resolve();
					});
				} else {
					$window.sessionStorage.setItem(data.name, data.value);
					deferred.resolve();
				}

				return deferred.promise;
			}

			/**
			* Recupera um cookie.
			* @param {string} name - O nome do cookie a ser recuperado.
			* @returns {object} Uma promise com o resultado.
			*/
			function get(name) {
				var deferred = $q.defer();

				if (constants.isElectron) {
					session.cookies.get({ url: _url, name: name }, function(error, cookies) {
						cookies.length ? deferred.resolve(cookies[0].value) : deferred.reject();
					});					
				} else {
					var res = $window.sessionStorage.getItem(name);
					res ? deferred.resolve(res) : deferred.reject();
				}

				return deferred.promise;
			}

			/**
			* Remove um cookie permanentemente.
			* @param {string} name - O nome do cookie a ser removido.
			* @returns {object} Uma promise com o resultado.
			*/
			function remove(name) {
				var deferred = $q.defer();

				if (constants.isElectron) {
					session.cookies.remove({
						url: _url,
						name: name
					}, function() {
						deferred.resolve();
					});
				} else {
					$window.sessionStorage.removeItem(name);
					deferred.resolve();
				}

				return deferred.promise;
			}

			/**
			* Remove todos os cookies permanentemente.
			* @returns {object} Uma promise com o resultado.
			*/
			function clear() {
				var deferred = $q.defer();

				if (constants.isElectron) {
					session.clearStorageData([], function() {
						deferred.resolve();
					});
				} else {
					$window.sessionStorage.clear();
					deferred.resolve();
				}

				return deferred.promise;
			}
		}];

	}

})();