/*
* @Author: egmfilho
* @Date:   2017-06-28 12:09:10
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-29 18:05:25
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
		.factory('ModalityItem', [function() {

			function ModalityItem(item) {
				this.modality_item_installment = null;
				this.modality_item_delay       = null;
				this.modality_item_interval    = null;
				this.modality_item_al_card     = null;

				if (item) {
					Object.assign(this, item);
				}
			}

			return ModalityItem;
		}]);

	angular.module('commercial2.services')
		.factory('PaymentModality', ['ModalityConfig', 'ModalityItem', function(ModalityConfig, ModalityItem) {

			function PaymentModality(modality) {
				this.modality_id          = null;
				this.modality_code        = null;
				this.modality_description = null;
				this.modality_active      = null;
				this.modality_type        = null;
				this.payment_nature_id    = null;
				this.modality_config      = new ModalityConfig();
				this.modality_item        = [ new ModalityItem({
					modality_item_installment: 1,
					modality_item_delay: 0,
					modality_item_interval: 0,
					modality_item_al_card: 0
				})];

				if (modality) {
					Object.assign(this, modality, {
						modality_config: new ModalityConfig(modality.modality_config),
						modality_item: modality.modality_item && modality.modality_item.length ? modality.modality_item.map(function(mi) { return new ModalityItem(mi) }) : this.modality_item
					});
				}
			}

			return PaymentModality;
		}]);

}());