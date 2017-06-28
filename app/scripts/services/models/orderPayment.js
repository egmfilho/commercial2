/*
* @Author: egmfilho
* @Date:   2017-06-28 12:11:57
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-28 13:14:59
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('OrderPayment', OrderPayment);

	function OrderPayment() {

		function _OrderPayment(payment) {
			this.order_payment_id = null;
			this.order_id = null;
			this.order_payment_value = 0;
			this.order_payment_al_discount = 0;
			this.order_payment_vl_discount = 0;
			this.order_payment_value_total = 0;
			this.order_payment_deadline    = null;
			this.order_payment_installment = 1;
			this.order_payment_initial     = null;
			this.order_payment_credit      = null;
			this.order_payment_date        = null;
			this.order_payment_update      = null;

			if (payment) {
				Object.assign(this, payment, {
					order_payment_deadline: payment.order_payment_deadline ? new Date(payment.order_payment_deadline) : new Date(),
					order_payment_date: payment.order_payment_date ? new Date(payment.order_payment_date) : new Date(),
					order_payment_update: payment.order_payment_update ? new Date(payment.order_payment_update) : new Date()
				});
			}
		}

		return _OrderPayment;
	}

}());