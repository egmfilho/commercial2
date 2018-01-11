/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2018-01-11 11:22:31 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2018-01-11 13:47:19
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.service('Receita', ['$http', function($http) {

			var url = 'https://www.receitaws.com.br/v1/cnpj/';

			function normalize(cnpj) {
				return cnpj.replace(/[.\/-]/g, '');
			}

			this.search = function(cnpj) {
				var api = url + normalize(cnpj);
				return $http({
					method: 'GET',
					url: api
				});
			}

		}]);

})();