/*
* @Author: egmfilho
* @Date:   2017-06-16 17:49:47
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-19 10:37:04
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.service('Globals', Globals);

	Globals.$inject = [ ];

	function Globals() {

		this.set    = set;
		this.get    = get;
		this.remove = remove;
		this.clear  = clear;

		// ******************************
		// Methods declaration
		// ******************************

		function set(key, value) {
			window.sessionStorage.setItem('shared.' + key, JSON.stringify(value));
		}

		function get(key) {
			return JSON.parse(window.sessionStorage.getItem('shared.' + key));
		}

		function remove(key) {
			return window.sessionStorage.removeItem('shared.' + key);	
		}

		function clear() {
			angular.forEach(window.sessionStorage, function(value, key) {
				if (key.indexOf('shared.') == 0)
					remove(key);
			});
		}
		
	}
	
}());