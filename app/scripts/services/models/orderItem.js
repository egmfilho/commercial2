/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-06-08 17:01:06
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-07 13:23:25
*/

(function() {

	angular.module('commercial2.services')
		.factory('Audit', [function() {

			function _Audit(audit) {
				this.user_id      = null;
				this.date         = moment().tz('America/Sao_Paulo').toDate();
				this.user_name    = null;
				this.product_name = null;
				this.product_code = null;

				if (audit)
					Object.assign(this, audit, {
						date: audit.date ? new Date(audit.date) : moment().tz('America/Sao_Paulo').toDate()
					});
			}

			return _Audit;

		}]);

	angular.module('commercial2.services')
		.factory('OrderItem', ['Product', 'Price', 'Audit', function(Product, Price, Audit) {

			function Item(item) {
				this.order_item_id            = null;
				this.order_item_erp_id        = null;
				this.order_id                 = null;
				this.product_id               = null;
				this.price_id                 = null;
				this.order_item_amount        = 1;
				this.order_item_value_unitary = null;
				this.order_item_value         = 0;
				this.order_item_al_discount   = 0;
				this.order_item_vl_discount   = 0;
				this.order_item_value_total   = 0;
				this.order_item_update        = null;
				this.order_item_date          = null;
				this.order_item_value_icms    = 0;
				this.order_item_value_st      = 0;
				this.order_item_stock         = 0;
				this.order_item_audit         = new Audit();
				this.product                  = new Product();
				this.price                    = new Price();
				this.isEditing                = false;

				if (item) {
					Object.assign(this, item, {
						order_item_update: item.order_item_update ? new Date(item.order_item_update) : null,
						order_item_date: item.order_item_date ? new Date(item.order_item_date) : null,
						order_item_audit: item.order_item_audit ? new Audit(item.order_item_audit) : new Audit(),
						product: item.product ? new Product(item.product) : new Product(),
						price: item.price ? new Price(item.price) : new Price()
					});
				}
			}

			Item.prototype = {
				setProduct: setProduct,
				setPrice: setPrice,
				setAmount: setAmount,
				setAlDiscount: setAlDiscount,
				setVlDiscount: setVlDiscount,
				setAudit: setAudit,
				removeAudit: removeAudit,
				getValue: getValue,
				getValueTotal: getValueTotal,
				updateValues: updateValues
			}

			return Item;

			// ******************************
			// Methods declaration
			// ******************************

			function setProduct(product) {
				if (!product) return;

				this.product = new Product(product);
				this.product_id = this.product.product_id;
				this.order_item_value_unitary = this.product.getDefaultPriceTable().price_value;
				this.price = new Price(this.product.getDefaultPriceTable());
				this.price_id = this.price.price_id;
				this.order_item_vl_discount = 0;
				this.order_item_al_discount = 0;
				this.order_item_stock = this.product.stock.product_stock;
				this.updateValues();
			}

			function setPrice(price) {
				if (price)
					this.price = new Price(price);

				this.price_id = this.price.price_id;
				this.order_item_value_unitary = this.price.price_value;
				this.updateValues();
			}

			function setAmount(value) {
				this.order_item_amount = value;
				this.setAlDiscount(this.order_item_al_discount);
				this.updateValues();
			}

			function setAlDiscount(value) {
				if (value == null) 
					value = this.order_item_al_discount;

				this.order_item_al_discount = value;

				this.order_item_vl_discount = parseFloat( (this.getValue() * (value / 100)).toFixed(2) );
				this.updateValues();
			}

			function setVlDiscount(value) {
				if (value == null) 
					value = this.order_item_vl_discount;

				value = Math.max(parseFloat(value), 0);
				this.order_item_vl_discount = value;

				var full_value = this.order_item_value_unitary * this.order_item_amount,
					al = parseFloat(full_value && ((value * 100) / full_value));
				
				this.order_item_al_discount = al;
				this.updateValues();
			}

			function setAudit(audit) {
				this.order_item_audit = new Audit(audit);
			}

			function removeAudit() {
				this.order_item_audit = new Audit();	
			}

			/*
			 * Antigamente, nos tempos mais primordios, o Commercial nao arrendondava os valores em seus 
			 * calculos de precos deixando para arredondar apenas o valor final, mantendo assim a integridade
			 * dos valores. Depois de algumas inconsistencias em relacao a orcamentos DAVs do Commercial e
			 * DAVs do ERP (Alterdata), verificou-se que no ERP os valores sao todos arredondados antes de calculados
			 * gerando assim um valor final acima ou abaixo do valor final do Commercial. 
			 * A partir de hoje, 15/08/2017, o Commercial passara a arredondadar os valores propositalmente errados 
			 * somente para manter regularidade com o ERP (Alterdata).
			 */

			function getValue() {
				/* JEITO CERTO */
				// return this.order_item_amount * this.order_item_value_unitary;
				
				/* JEITO ALTERDATANO */
				if (!this.order_item_value_unitary) {
					return 0;
				} else {
					var antiBug = 0.005555; // bug: console.log( (24.115).toFixed(2) ) // nao arredonda
					return parseFloat(( this.order_item_amount * parseFloat((this.order_item_value_unitary + antiBug).toFixed(2)) ).toFixed(2));
				}
			}

			function getValueTotal() {
				return this.getValue() - this.order_item_vl_discount;
			}

			function updateValues() {
				this.order_item_value = this.getValue();
				this.order_item_value_total = this.getValueTotal();
			}

		}]);

})();