/*
* @Author: egmfilho
* @Date:   2017-06-14 16:59:11
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-17 08:23:41
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Order', Order);

	Order.$inject = [ 'OrderItem', 'Person', 'Address', 'CompanyERP', 'OrderPayment', 'Globals' ];

	function Order(OrderItem, Person, Address, CompanyERP, OrderPayment, Globals) {

		function _Order(order) {
			this.order_id                    = null;
			this.order_company_id            = null;
			this.order_user_id               = null;
			this.order_status_id             = Globals.get('order-status-values')['open']; 
			this.order_client_id             = null;
			this.order_address_delivery_code = null;
			this.order_seller_id             = null;
			this.order_term_id               = null;
			this.order_origin_id             = null;
			this.order_code                  = null;
			this.order_code_erp              = null;
			this.order_code_nfe              = null;
			this.order_value                 = 0;
			this.order_al_discount           = 0;
			this.order_vl_discount           = 0;
			this.order_value_total           = 0;
			this.order_note                  = null;
			this.order_note_doc              = null;
			this.order_mail_sent             = new Array();
			this.order_trash                 = 'N';
			this.order_update                = null;
			this.order_date                  = null;
			this.order_items                 = new Array();
			this.order_company               = new CompanyERP();
			this.order_seller                = new Person();
			this.order_client                = new Person();
			this.address_delivery            = new Address();
			this.order_payments              = new Array();
			this.credit                      = null;

			if (order) {
				Object.assign(this, order, {
					order_mail_sent: typeof(order.order_mail_sent) !== 'string' ? order.order_mail_sent : order.order_mail_sent.split(';')
						.map(function(i) { 
							return { name: i.split(':')[0], email: i.split(':')[1] } 
						}),
					order_update: order.order_update ? new Date(order.order_update) : null,
					order_date: order.order_date ? new Date(order.order_date) : null,
					order_items: order.order_items ? order.order_items.map(function(oi) { return new OrderItem(oi) }) : new Array(),
					order_company: new CompanyERP(order.order_company),
					order_seller: new Person(order.order_seller),
					order_client: new Person(order.order_client),
					address_delivery: new Address(order.address_delivery),
					order_payments: order.order_payments ? order.order_payments.map(function(op) { return new OrderPayment(op) }) : new Array()
				});
			}
		}

		_Order.prototype = { 
			setCompany: setCompany,
			setSeller: setSeller,
			removeSeller: removeSeller,
			setCustomer: setCustomer,
			removeCustomer: removeCustomer,
			addItem: addItem,
			replaceItem: replaceItem,
			removeItem: removeItem,
			hasItem: hasItem,
			setDeliveryAddress: setDeliveryAddress,
			removeDeliveryAddress: removeDeliveryAddress,
			setAlDiscount: setAlDiscount,
			setVlDiscount: setVlDiscount,
			updateValues: updateValues,
			getPaymentValue: getPaymentValue,
			getChange: getChange
		};

		return _Order;

		// ******************************
		// Methods declaration
		// ******************************

		/**
		 * Atribui uma empresa ao orcamento.
		 * @param {object} company - O objeto da empresa.
		 */
		function setCompany(company) {
			this.order_company = new CompanyERP(company);
			this.order_company_id = this.order_company.company_id;
		}

		/**
		 * Atribui um vendedor ao orcamento.
		 * @param {object} seller - O objeto do vendedor.
		 */
		function setSeller(seller) {
			this.order_seller = new Person(seller);
			this.order_seller_id = this.order_seller.person_id;
		}

		/**
		 * Remove o vendedor vinculado ao orcamento.
		 */
		function removeSeller() {
			this.order_seller = new Person();
			this.order_seller_id = null;
		}

		/**
		 * Atribui um cliente ao orcamento.
		 * @param {object} customer - O objeto do cliente.
		 */
		function setCustomer(customer) {
			this.order_client = new Person(customer);
			this.order_client_id = this.order_client.person_id;
		}

		/**
		 * Remove o cliente vinculado ao orcamento.
		 */
		function removeCustomer() {
			this.order_client = new Person();
			this.order_client_id = null;
		}

		/**
		 * Adiciona um item ao orcamento.
		 * @param {object} item - O item a ser adicionado.
		 * @returns {boolean} - Retorna true caso o item seja adicionado.
		 */
		function addItem(item) {
			if (this.hasItem(item) != -1)
				return false;
			
			this.order_items.push(new OrderItem(item));
			this.updateValues();
			return true;
		}

		/**
		 * Substitui um item do orcamento.
		 * @param {object} index - O index do item a ser substituido.
		 * @param {object} item - O item substituto.
		 */
		function replaceItem(index, item) {
			this.order_items[index] = new OrderItem(item);
			this.updateValues();
		}

		/**
		 * Remove um item do orcamento.
		 * @param {object} item - O item a ser removido.
		 */
		function removeItem(item) {
			var index = this.order_items.indexOf(item);
			this.order_items.splice(index, 1);
			this.updateValues();
		}

		/**
		 * Checa se um item existe no orcamento.
		 * @param {object} item - O item a ser checado.
		 * @returns {int} - Retorna o index do item ou -1 caso nao exista.
		 */
		function hasItem(item) {
			for (var i = 0; i < this.order_items.length; i++) {
				if (this.order_items[i].product_id == item.product_id) {
					return i;
				}
			}

			return -1;
		}

		/**
		 * Aplica uma aliquota de desconto igual para todos os items.
		 * @param {float} value - O valor do desconto.
		 */
		function setAlDiscount(value) {
			angular.forEach(this.order_items, function(item) {
				item.setAlDiscount(value);
			});
		}

		/**
		 * Aplica um valor de desconto igual para todos os items.
		 * @param {float} value - O valor do desconto.
		 */
		function setVlDiscount(value) {
			angular.forEach(this.order_items, function(item) {
				item.setVlDiscount(value);
			});	
		}

		/**
		 * Adiciona o endereco de entrega do pedido.
		 * @param {object} address - O endereco de entrega.
		 */
		function setDeliveryAddress(address) {
			this.address_delivery = new Address(address);
			this.order_address_delivery_code = this.address_delivery.person_address_code;
		}

		/**
		 * Remove o endereco de entrega do pedido.
		 */
		function removeDeliveryAddress() {
			this.address_delivery = new Address();
			this.order_address_delivery_code = null;
		}

		/**
		 * Recalcula e atualiza os valores do orcamento.
		 */
		function updateValues() {
			this.order_value = 0;
			this.order_value_total = 0;

			var scope = this;
			angular.forEach(this.order_items, function(item) {
				scope.order_value += item.getValue();
				scope.order_value_total += item.getValueTotal();
			});

			this.order_vl_discount = this.order_value - this.order_value_total;
			this.order_al_discount = (this.order_vl_discount * 100) / this.order_value;
		}

		/**
		 * Calcula a soma de todos os pagamentos do orcamento.
		 */
		function getPaymentValue() {
			var total = 0;

			angular.forEach(this.order_payments, function(item, index) {
				total += item.order_payment_value_total;
			});

			return total;
		}

		/**
		 * Calcula o troco do orcamento.
		 */
		function getChange() {
			// return Math.max(0, this.order_value_total - this.getPaymentValueTotal());
			return this.order_value_total - this.getPaymentValue();
		}

	}

}());