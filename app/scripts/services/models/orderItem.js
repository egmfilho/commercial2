/*
* @Author: egmfilho
* @Date:   2017-06-08 17:01:06
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-16 11:15:06
*/

(function() {

	angular.module('commercial2.services')
		.factory('OrderItem', ['Product', function(Product) {

			var _item = {
				order_item_id: null,
				order_id: null,
				product_id: null,
				order_item_amount: 1,
				order_item_value: null,
				order_item_al_discount: 0,
				order_item_vl_discount: 0,
				order_item_value_total: null,
				order_item_update: null,
				order_item_date: null,
				order_item_value_unitary: null,
				product: new Product()
			}

			function Item(item) {
				angular.extend(this, _item);

				if (item) {
					angular.extend(this, item, {
						order_item_update: item.order_item_update ? new Date(order_item_update) : null,
						order_item_date: item.order_item_date ? new Date(order_item_date) : null,
						product: item.product ? new Product(item.product) : new Product()
					});
				}
			}

			Item.prototype = {
				setProduct: setProduct,
				setAmount: setAmount,
				setAlDiscount: setAlDiscount,
				setVlDiscount: setVlDiscount,
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
				this.order_item_value = this.product.price.price_value;
				this.order_item_vl_discount = 0;
				this.order_item_al_discount = 0;
			}

			function setAmount(value) {
				this.order_item_amount = value;
			}

			function setAlDiscount(value) {
				if (!value) return;

				value = Math.max(parseFloat(value), 0);
				this.order_item_al_discount = value;

				var full_value = this.order_item_value * this.order_item_amount;
				this.order_item_vl_discount = (full_value * (value / 100)).toFixed(2);
			}

			function setVlDiscount(value) {
				if (!value) return;

				value = Math.max(parseFloat(value), 0);
				this.order_item_vl_discount = value;

				var full_value = this.order_item_value * this.order_item_amount;
				this.order_item_al_discount = full_value && ((value * 100) / full_value).toFixed(2);
			}

			function getValueTotal() {
				return (this.order_item_amount * this.order_item_value) - this.order_item_vl_discount;
			}

		}]);

}());