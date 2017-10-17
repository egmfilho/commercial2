/*
* @Author: egmfilho
* @Date:   2017-06-16 17:49:47
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-01 15:22:48
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.service('Globals', Globals);

	Globals.$inject = [ '$q', 'Constants' ];

	function Globals($q, constants) {

		var remote;

		if (constants.isElectron && !remote)
			remote = require('electron').remote;

		this.set    = set;
		this.get    = get;
		this.remove = remove;
		this.clear  = clear;
		this.api    = api;

		// ******************************
		// Methods declaration
		// ******************************

		function set(key, value) {
			if (!constants.isElectron) {
				window.sessionStorage.setItem('shared.' + key, JSON.stringify(value));
			} else {
				var temp = JSON.parse(remote.getGlobal('globals').shared);
				temp[key] = value;
				remote.getGlobal('globals').shared = JSON.stringify(temp);
			}
		}

		function get(key) {
			if (!constants.isElectron) {
				return JSON.parse(window.sessionStorage.getItem('shared.' + key));
			} else {
				return (JSON.parse(remote.getGlobal('globals').shared))[key];
			}
		}

		function remove(key) {
			if (!constants.isElectron) {
				return window.sessionStorage.removeItem('shared.' + key);	
			} else {
				var temp = JSON.parse(remote.getGlobal('globals').shared);
				delete temp[key];
				remote.getGlobal('globals').shared = JSON.stringify(temp);
			}
		}

		function clear() {
			var deferred = $q.defer();

			if (!constants.isElectron) {
				angular.forEach(window.sessionStorage, function(value, key) {
					if (key.indexOf('shared.') == 0)
						remove(key);
				});
				deferred.resolve();
			} else {
				remote.getGlobal('globals').shared = '{ }';
				deferred.resolve();
			}

			return deferred.promise;
		}

		function api() {
			if (!constants.isElectron) {
				return [{ 'id': 0, 'name': 'Teste', 'address': 'http://172.16.0.6/commercial2.api/.teste' }];
			} else {
				return remote.getGlobal('globals').api;
			}
		}
		
	}
	
}());