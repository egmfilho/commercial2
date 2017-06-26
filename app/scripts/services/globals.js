/*
* @Author: egmfilho
* @Date:   2017-06-16 17:49:47
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-26 17:26:19
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.service('Globals', Globals);

	Globals.$inject = [ 'Constants' ];

	function Globals(constants) {

		var remote = null;

		if (constants.isElectron)
			remote = require('electron').remote;

		this.set    = set;
		this.get    = get;
		this.remove = remove;
		this.clear  = clear;

		// ******************************
		// Methods declaration
		// ******************************

		function set(key, value) {
			// if (!constants.isElectron) {
				window.sessionStorage.setItem('shared.' + key, JSON.stringify(value));
			// } else {
				// remote.getGlobal('globals').shared[key] = value;
			// }
		}

		function get(key) {
			// if (!constants.isElectron) {
				return JSON.parse(window.sessionStorage.getItem('shared.' + key));
			// } else {
				// return remote.getGlobal('globals').shared[key];
			// }
		}

		function remove(key) {
			// if (!constants.isElectron) {
				return window.sessionStorage.removeItem('shared.' + key);	
			// } else {
				// delete remote.getGlobal('globals').shared[key];
			// }
		}

		function clear() {
			// if (!constants.isElectron) {
				angular.forEach(window.sessionStorage, function(value, key) {
					if (key.indexOf('shared.') == 0)
						remove(key);
				});
			// } else {
				// remote.getGlobal('globals').shared = { };
			// }
		}
		
	}
	
}());