/*
* @Author: egmfilho
* @Date:   2017-06-28 12:09:10
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-28 17:46:43
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalityConfig', [function() {

			function ModalityConfig(config) {
				this.agglutinate = null;
				this.name        = null;

				if (config) {
					Object.assign(this, config);
				}
			}

			return ModalityConfig;
		}]);

	angular.module('commercial2.services')
		.factory('PaymentModality', ['ModalityConfig', function(ModalityConfig) {

			function PaymentModality(modality) {
				this.modality_id          = null;
				this.modality_code        = null;
				this.modality_description = null;
				this.modality_active      = null;
				this.modality_type        = null;
				this.payment_nature_id    = null;
				this.modality_config      = new ModalityConfig();

				if (modality) {
					Object.assign(this, modality, {
						modality_config: new ModalityConfig(modality.modality_config)
					});
				}
			}

			return PaymentModality;
		}]);

}());