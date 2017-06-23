/*
* @Author: egmfilho
* @Date:   2017-06-14 16:59:11
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-23 14:21:27
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Order', Order);

	Order.$inject = [ 'OrderItem', 'Person', 'Address', 'CompanyERP' ];

	function Order(OrderItem, Person, Address, CompanyERP) {

		var scope;

		function _Order(order) {
			scope = this;

			scope.order_id                    = null;
			scope.order_company_id            = null;
			scope.order_user_id               = null;
			scope.order_status_id             = null; 
			scope.order_client_id             = null;
			scope.order_address_delivery_code = null;
			scope.order_seller_id             = null;
			scope.order_term_id               = null;
			scope.order_origin_id             = null;
			scope.order_code                  = null;
			scope.order_code_erp              = null;
			scope.order_code_nfe              = null;
			scope.order_value                 = 0;
			scope.order_al_discount           = 0;
			scope.order_vl_discount           = 0;
			scope.order_value_total           = 0;
			scope.order_note                  = null;
			scope.order_mail_sent             = new Array();
			scope.order_trash                 = 'N';
			scope.order_update                = null;
			scope.order_date                  = null;
			scope.order_items                 = new Array();
			scope.order_company               = new CompanyERP();
			scope.order_seller                = new Person();
			scope.order_client                = new Person();
			scope.order_address               = new Address();

			if (order) {
				Object.assign(this, order, {
					order_mail_sent: typeof(order.order_mail_sent) !== 'string' ? order.order_mail_sent : order.order_mail_sent.split(';')
						.map(function(i) { 
							return { name: i.split(':')[0], email: i.split(':')[1] } 
						}),
					order_update: order.order_update ? new Date(order.order_update) : null,
					order_date: order.order_date ? new Date(order.order_date) : null,
					order_items: order.order_items && order.order_items.map(function(oi) { return new OrderItem(oi); }),
					order_company: new CompanyERP(order.order_company),
					order_seller: new Person(order.order_seller),
					order_client: new Person(order.order_client),
					order_address: new Address(order.order_address)
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
			setAlDiscount: setAlDiscount,
			setVlDiscount: setVlDiscount
		};

		function updateValues() {
			scope.order_value = 0;
			scope.order_value_total = 0;

			angular.forEach(scope.order_items, function(item) {
				scope.order_value += item.getValue();
				scope.order_value_total += item.getValueTotal();
			});

			scope.order_vl_discount = scope.order_value - scope.order_value_total;
			scope.order_al_discount = (scope.order_vl_discount * 100) / scope.order_value;
		}

		return _Order;

		// ******************************
		// Methods declaration
		// ******************************

		/**
		 * Atribui uma empresa ao orcamento.
		 * @param {object} company - O objeto da empresa.
		 */
		function setCompany(company) {
			scope.order_company = new CompanyERP(company);
			scope.order_company_id = scope.order_company.company_id;
		}

		/**
		 * Atribui um vendedor ao orcamento.
		 * @param {object} seller - O objeto do vendedor.
		 */
		function setSeller(seller) {
			scope.order_seller = new Person(seller);
			scope.order_seller_id = scope.order_seller.person_id;
		}

		/**
		 * Remove o vendedor vinculado ao orcamento.
		 */
		function removeSeller() {
			scope.order_seller = new Person();
			scope.order_seller_id = null;
		}

		/**
		 * Atribui um cliente ao orcamento.
		 * @param {object} customer - O objeto do cliente.
		 */
		function setCustomer(customer) {
			scope.order_client = new Person(customer);
			scope.order_client_id = scope.order_client.person_id;
		}

		/**
		 * Remove o cliente vinculado ao orcamento.
		 */
		function removeCustomer() {
			scope.order_client = new Person();
			scope.order_client_id = null;
		}

		/**
		 * Adiciona um item ao orcamento.
		 * @param {object} item - O item a ser adicionado.
		 * @returns {boolean} - Retorna true caso o item seja adicionado.
		 */
		function addItem(item) {
			if (hasItem(item) != -1)
				return false;
			
			/* para atualizar o orcamento qd atualizar o item */
			var item = new OrderItem(item);
			item.prototype = {
				updateValues: function() {
					item.updateValues();
					updateValues();
				}
			};
			scope.order_items.push(item);
			updateValues();
			return true;
		}

		/**
		 * Substitui um item do orcamento.
		 * @param {object} index - O index do item a ser substituido.
		 * @param {object} item - O item substituto.
		 */
		function replaceItem(index, item) {
			scope.order_items[index] = new OrderItem(item);
			updateValues();
		}

		/**
		 * Remove um item do orcamento.
		 * @param {object} item - O item a ser removido.
		 */
		function removeItem(item) {
			var index = scope.order_items.indexOf(item);
			scope.order_items.splice(index, 1);
			updateValues();
		}

		/**
		 * Checa se um item existe no orcamento.
		 * @param {object} item - O item a ser checado.
		 * @returns {int} - Retorna o index do item ou -1 caso nao exista.
		 */
		function hasItem(item) {
			for (var i = 0; i < scope.order_items.length; i++) {
				if (scope.order_items[i].product_id == item.product_id) {
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
			angular.forEach(scope.order_items, function(item) {
				item.setAlDiscount(value);
			});
		}

		/**
		* Aplica um valor de desconto igual para todos os items.
		* @param {float} value - O valor do desconto.
		*/
		function setVlDiscount(value) {
			angular.forEach(scope.order_items, function(item) {
				item.setVlDiscount(value);
			});	
		}

		/**
		* Adiciona o endereco de entrega do pedido.
		* @param {object} address - O endereco de entrega.
		*/
		function setDeliveryAddress(address) {
			scope.order_address = new Address(address);
			scope.order_address_delivery_code = scope.order_address.person_address_code;
		}

	}

}());