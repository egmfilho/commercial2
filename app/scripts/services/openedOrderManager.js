
(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('OpenedOrderManager', ['Globals', 'Constants', function(Globals) {

			var _key = 'opened-orders';

			Globals.set(_key, new Array());

			function add(code) {
				var array = Globals.get(_key);

				if (array.indexOf(code) < 0) {
					array.push(code);
					Globals.set(_key, array);

					console.log('Orcamento aberto: ' + code);
					console.log('Total: ' + array.length);
				}
			}

			function remove(code) {
				var array = Globals.get(_key),
					index = array.indexOf(code);
				
				if (index >= 0) {
					array.splice(index, 1);
					Globals.set(_key, array);

					console.log('Orcamento fechado: ' + code);
					console.log('Total: ' + array.length);
				}
			}

			function clear() {
				Globals.set(_key, new Array());
			}

			function isOpen(code) {
				var array = Globals.get(_key);
				
				if (!array || !array.length) {
					console.log(array, code, false);
					return false;
				} else {
					console.log(array, code, array.indexOf(code));
					return array.indexOf(code) >= 0;
				}
			}

			return {
				add: add,
				remove: remove,
				clear: clear,
				isOpen: isOpen
			}

		}]);

})();