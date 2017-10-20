/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-08-07 08:24:32
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-07 11:12:26
*/

(function() {

	angular.module('commercial2.services')
		.service('GUID', [function() {

			var _chars = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
				_guid = generate();

			console.log('GUID: ' + _guid);

			function generate() {
				var guid = '', i;

				for (i = 0; i < 10; i++) {
					guid += _chars[parseInt(Math.random() * _chars.length)];
				}

				return guid;
			}

			return {
				get: function() { return _guid; }
			};

		}]);

})();