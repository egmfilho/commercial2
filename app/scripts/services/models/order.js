/*
* @Author: egmfilho
* @Date:   2017-06-14 16:59:11
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-16 16:36:20
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Order', Order);

	Order.$inject = [ 'OrderItem', 'Person', 'Address', 'CompanyERP' ];

	function Order(OrderItem, Person, Address, CompanyERP) {

		var _order = {
			order_id: null,
			order_company_id: null,
			order_user_id: null,
			order_status_id: null, 
			order_client_id: null,
			order_address_delivery_code: null,
			order_seller_id: null,
			order_term_id: null,
			order_origin_id: null,
			order_code: null,
			order_code_erp: null,
			order_code_nfe: null,
			order_value: 0,
			order_al_discount: 0,
			order_vl_discount: 0,
			order_value_total: 0,
			order_note: null,
			order_mail_sent: [ ],
			order_trash: 'N',
			order_update: null,
			order_date: null,
			order_items: [ ],
			order_company: new CompanyERP(),
			order_seller: new Person(),
			order_client: new Person(),
			order_address: new Address()
		};

		function Order(order) {
			angular.extend(this, _order);

			if (order) {
				angular.extend(this, order, {
					order_mail_sent: order.order_mail_sent.split(';').map(function(i) { 
						return { name: i.split(':')[0], email: i.split(':')[1] } 
					}),
					order_update: order.order_update ? new Date(order.order_update) : null,
					order_date: order.order_date ? new Date(order.order_date) : null,
					order_items: order.items.map(function(oi) { return new OrderItem(oi); }),
					order_company: new CompanyERP(order.order_company),
					order_seller: new Person(order.order_selelr),
					order_client: new Person(order.order_client),
					order_address: new Address(order.order_address)
				});
			}
		}

		Order.prototype = { 
			setCompany: setCompany,
			setSeller: setSeller,
			removeSeller: removeSeller,
			setCustomer: setCustomer,
			removeCustomer: removeCustomer,
			addItem: addItem,
			removeItem: removeItem,
			hasItem: hasItem,
			setDeliveryAddress: setDeliveryAddress,
			setAlDiscount: setAlDiscount,
			setVlDiscount: setVlDiscount
		};

		return Order;

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
			if (hasItem(item) != -1)
				return false;
			
			this.order_items.push(new OrderItem(item));
			return true;
		}

		/**
		 * Remove um item do orcamento.
		 * @param {object} item - O item a ser removido.
		 */
		function removeItem(item) {
			var index = this.order_items.indexOf(item);
			this.order_items.splice(index, 1);
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
			this.order_address = new Address(address);
			this.order_address_delivery_code = this.order_address.person_address_code;
		}

	}

}());