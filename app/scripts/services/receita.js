/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2018-01-11 11:22:31 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2018-01-11 11:42:14
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.service('Receita', ['$http', function($http) {

			var url = 'https://www.receitaws.com.br/v1/cnpj/'

			function normalize(cnpj) {
				return cnpj.replace('.', '').replace('/', '').replace('-', '');
			}

			this.search = function(cnpj) {
				return $http({
					method: 'GET',
					URL: url + normalize(cnpj)
				});
			}

		}]);

})();