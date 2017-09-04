/*
* @Author: egmfilho
* @Date:   2017-06-14 16:59:11
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-31 18:03:29
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('OrderAudit', [function() {

			function _OrderAudit(audit) {
				this.title       = null;
				this.user_id     = null;
				this.date        = moment().toDate();
				this.user_name   = null;
				this.person_name = null;
				this.person_code = null;

				if (audit)
					Object.assign(this, audit, {
						date: audit.date ? new Date(audit.date) : new Date()
					});
			}

			return _OrderAudit;

		}]);

	angular.module('commercial2.services')
		.factory('OrderStatus', [function() {

			function _OrderStatus(status) {
				this.billed   = null;
				this.editable = 'Y';
				this.status   = null;
				this.type     = null;

				if (status)
					Object.assign(this, status);
			}

			return _OrderStatus;
		}]);

	angular.module('commercial2.services')
		.factory('Order', Order);

	Order.$inject = [ '$filter', 'OrderItem', 'Person', 'Address', 'CompanyERP', 'OrderPayment', 'OrderAudit', 'OrderStatus', 'Globals' ];

	function Order($filter, OrderItem, Person, Address, CompanyERP, OrderPayment, OrderAudit, OrderStatus, Globals) {

		function _Order(order) {
			this.order_id                    = null;
			this.order_erp_id                = null;
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
			this.order_code_document         = null;
			this.order_value                 = 0;
			this.order_al_discount           = 0;
			this.order_vl_discount           = 0;
			this.order_value_total           = 0;
			this.order_value_total_plus_st   = 0;
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
			this.creditPayment               = null;
			this.order_audit                 = new OrderAudit();
			this.order_filled                = 'N';
			this.order_credit                = null;
			this.order_value_icms            = 0;
			this.order_value_st              = 0;
			this.order_addition              = 0;
			this.status                      = new OrderStatus(),
			this.queryable                   = '';

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
					order_payments: order.order_payments ? order.order_payments.map(function(op) { return new OrderPayment(op) }) : new Array(),
					status: order.status ? new OrderStatus(order.status) : new OrderStatus(),
					order_value_total_plus_st: order.order_value_total + order.order_value_st,
					queryable: order.order_id ?
						(order.order_code + ' '
						+ order.order_client.person_code + ' '
						+ order.order_code_erp + ' '
						+ order.order_client.person_name + ' '
						+ order.order_seller.person_code + ' '
						+ order.order_seller.person_name + ' '
						+ order.order_seller.person_shortname + ' '
						+ $filter('currency')(order.order_value_total, "R$ ") + ' '
						+ $filter('date')(order.order_date, "dd/MM/yyyy")) : ''
				});
			}
		}

		_Order.prototype = { 
			setCompany: setCompany,
			setSeller: setSeller,
			removeSeller: removeSeller,
			setCustomer: setCustomer,
			setOrderAudit: setOrderAudit,
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
			getPaymentAliquot: getPaymentAliquot,
			getPaymentValue: getPaymentValue,
			getChange: getChange,
			removeAudit: removeAudit,
			getMainContact: getMainContact
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

		function setOrderAudit(audit) {
			this.order_audit = new OrderAudit(audit);
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

			/* Concatena a observacao do endereco nas observacoes da nota */
			var obsFlag = Globals.get('obsFlag');
			if (address.person_address_note) {
				if (this.order_note_doc && this.order_note_doc.indexOf(obsFlag) >= 0) {
					this.order_note_doc = this.order_note_doc.split(obsFlag)[0];
				}

				this.order_note_doc += obsFlag;
				this.order_note_doc += address.person_address_note;	
			}
		}

		/**
		 * Remove o endereco de entrega do pedido.
		 */
		function removeDeliveryAddress() {
			this.address_delivery = new Address();
			this.order_address_delivery_code = null;
			
			/* Remove a observacao do endereco das observacoes da nota */
			var obsFlag = Globals.get('obsFlag');
			if (this.order_note_doc.indexOf(obsFlag) >= 0) {
				this.order_note_doc = this.order_note_doc.split(obsFlag)[0];
			}
		}

		/**
		 * Recalcula e atualiza os valores do orcamento.
		 */
		function updateValues() {
			if (!this.order_addition)
				this.order_addition = 0;

			this.order_value = 0;
			this.order_value_total = 0;

			var scope = this;
			angular.forEach(this.order_items, function(item) {
				scope.order_value += item.getValue();
				scope.order_value_total += item.getValueTotal();
			});

			this.order_vl_discount = this.order_value - this.order_value_total;
			this.order_al_discount = this.order_value == 0 ? 0 : (this.order_vl_discount * 100) / this.order_value;

			this.order_value_total += this.order_value_addition;
		}

		/**
		 * Calcula a soma de todos os pagamentos do orcamento.
		 */
		function getPaymentAliquot() {
			var total = 0;

			var order_value = this.order_value_total;
			if( order_value == 0 ){
				return total;
			}
			var payments = this.getPaymentValue();

			total = (100*payments)/(order_value);

			return total;
		}

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
			return parseFloat((this.order_value_total - this.getPaymentValue()).toFixed(2));
		}

		function removeAudit() {
			this.order_audit = new OrderAudit();
		}

		/**
		 * Retorna o contato principal do endereco de entrega.
		 */
		function getMainContact() {
			if (this.address_delivery && this.address_delivery.person_address_contact.length) {
				return this.address_delivery.person_address_contact.filter(function(c) {
					return c.person_address_contact_main == 'Y';
				})[0];
			} else {
				return null;
			}
		}

	}

}());