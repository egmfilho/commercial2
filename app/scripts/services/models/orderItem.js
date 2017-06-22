/*
* @Author: egmfilho
* @Date:   2017-06-08 17:01:06
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-22 16:47:11
*/

(function() {

	angular.module('commercial2.services')
		.factory('Audit', [function() {

			function _Audit(audit) {
				this.user_id      = null;
				this.date         = new Date();
				this.user_name    = null;
				this.product_name = null;
				this.product_code = null;

				if (audit)
					angular.merge(this, audit, {
						date: audit.date ? new Date(audit.date) : null
					});
			}

			return _Audit;

		}]);

	angular.module('commercial2.services')
		.factory('OrderItem', ['Product', 'UserPrice', 'Audit', function(Product, UserPrice, Audit) {

			function Item(item) {
				this.order_item_id            = null;
				this.order_id                 = null;
				this.product_id               = null;
				this.price_id                 = null;
				this.order_item_amount        = 1;
				this.order_item_value         = 0;
				this.order_item_al_discount   = 0;
				this.order_item_vl_discount   = 0;
				this.order_item_value_total   = 0;
				this.order_item_update        = null;
				this.order_item_date          = null;
				this.order_item_value_unitary = null;
				this.order_item_audit         = new Object();
				this.product                  = new Product();
				this.user_price               = new UserPrice();

				if (item) {
					angular.merge(this, item, {
						order_item_update: item.order_item_update ? new Date(order_item_update) : null,
						order_item_date: item.order_item_date ? new Date(order_item_date) : null,
						order_item_audit: item.order_item_audit ? new Audit(item.order_item_audit) : new Audit(),
						product: item.product ? new Product(item.product) : new Product(),
						user_price: item.user_price ? new UserPrice(item.user_price) : new UserPrice()
					});
				}
			}

			Item.prototype = {
				setProduct: setProduct,
				setUserPrice: setUserPrice,
				setAmount: setAmount,
				setAlDiscount: setAlDiscount,
				setVlDiscount: setVlDiscount,
				setAudit: setAudit,
				getValue: getValue,
				getValueTotal: getValueTotal
			}

			return Item;

			// ******************************
			// Methods declaration
			// ******************************

			function setProduct(product) {
				if (!product) return;

				this.product = new Product(product);
				this.product_id = this.product.product_id;
				this.order_item_value_unitary = this.product.price.price_value;
				this.order_item_vl_discount = 0;
				this.order_item_al_discount = 0;
			}

			function setUserPrice(userPrice) {
				if (userPrice)
					this.user_price = new UserPrice(userPrice);
				this.price_id = this.user_price.price_id;
			}

			function setAmount(value) {
				this.order_item_amount = value;
				this.setAlDiscount(this.order_item_al_discount);
			}

			function setAlDiscount(value) {
				if (value == null) return;

				this.order_item_al_discount = value;

				this.order_item_vl_discount = parseFloat( (this.getValue() * (value / 100)).toFixed(2) );
			}

			function setVlDiscount(value) {
				if (!value) return;

				value = Math.max(parseFloat(value), 0);
				this.order_item_vl_discount = value;

				var full_value = this.order_item_value_unitary * this.order_item_amount,
					al = parseFloat(full_value && ((value * 100) / full_value));
				
				this.order_item_al_discount = al;
			}

			function setAudit(audit) {
				this.order_item_audit = new Audit(audit);
			}

			function getValue() {
				return this.order_item_amount * this.order_item_value_unitary;
			}

			function getValueTotal() {
				return this.getValue() - this.order_item_vl_discount;
			}

		}]);

}());