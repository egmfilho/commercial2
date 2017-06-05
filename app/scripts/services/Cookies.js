/*
* @Author: egmfilho
* @Date:   2017-06-05 09:24:11
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-05 13:32:34
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

			function clear(callback) {
				if (!constants.isElectron) {
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

}());