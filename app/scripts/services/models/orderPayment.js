/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-28 12:11:57
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 17:15:32
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('OrderPayment', OrderPayment);

	OrderPayment.$inject = [ 'PaymentModality' ];

	function OrderPayment(PaymentModality) {

		/*jshint validthis:true */
		function _OrderPayment(payment) {
			this.order_payment_id                     = null;
			this.order_payment_erp_id                 = null;
			this.order_id                             = null;
			this.order_payment_value                  = 0;
			this.order_payment_al_discount            = 0;
			this.order_payment_vl_discount            = 0;
			this.order_payment_value_total            = 0;
			this.order_payment_deadline               = null;
			this.order_payment_installment            = 1;
			this.order_payment_initial                = 'N';
			this.order_payment_credit                 = 'N';
			this.order_payment_credit_available       = 0;
			this.order_payment_date                   = null;
			this.order_payment_update                 = null;
			this.order_payment_bank_id                = null;
			this.order_payment_agency_id              = null;
			this.order_payment_check_number           = null;
			this.modality_id                          = null;
			this.modality                             = new PaymentModality();
			this.credit                               = [];

			if (payment) {
				Object.assign(this, payment, {
					order_payment_deadline: payment.order_payment_deadline ? new Date(payment.order_payment_deadline) : moment().tz('America/Sao_Paulo').toDate(),
					order_payment_date: payment.order_payment_date ? new Date(payment.order_payment_date) : moment().tz('America/Sao_Paulo').toDate(),
					order_payment_update: payment.order_payment_update ? new Date(payment.order_payment_update) : moment().tz('America/Sao_Paulo').toDate()
				});
			}
		}

		_OrderPayment.prototype = {
			setModality: function(modality) {
				this.modality = new PaymentModality(modality);
				this.modality_id = this.modality.modality_id;
			},

			setValue: function(value) {
				if (value)
					this.order_payment_value = value;
				
				this.order_payment_value_total = this.order_payment_value;
			}
		}

		return _OrderPayment;
	}

})();