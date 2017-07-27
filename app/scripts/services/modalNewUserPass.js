(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalUserPass', [ '$rootScope', 'Globals', function($rootScope, Globals) {

			var _isOpen = true;

			return {
				show: function( title ) {
					
					var controller;

					controller = function(providerUser, User) {
						var vm = this;

						this._showCloseButton = true;

						this.text = 'Atualizar senha do usuário';

						this.data = {
							user_id: Globals.get('user')['user_id'],
							user_pass: '',
							user_new_pass: '',
							user_new_pass_confirm: ''
						}

						jQuery('input[name="user_pass"]').select().focus();

						this.update = function(data){
							if( !vm.data.user_pass.length || !vm.data.user_new_pass.length || !vm.data.user_new_pass_confirm.length ){
								$rootScope.customDialog().showMessage('Aviso', 'Preencha todas as informações.');
								return;
							}
							if( vm.data.user_new_pass != vm.data.user_new_pass_confirm ){
								$rootScope.customDialog().showMessage('Aviso', 'Confirme sua nova senha.');
								return;
							}					
							$rootScope.loading.load();
							providerUser.setNewPass(vm.data).then(function(success) {
								$rootScope.loading.unload();
								vm._close(1);								
							}, function(error) {
								console.log(error);
								$rootScope.customDialog().showMessage('Aviso', error.data.status.description);
								$rootScope.loading.unload();
							});
						}

						this.goTo = function(input) {
							jQuery('input[name="'+input+'"]').select().focus();
						};
					};

					controller.$inject = [ 'ProviderUser', 'User' ];

					var modalOptions = {
						zIndex: 1,
						hasBackdrop: true,
						innerDialog: false,
						focusOnOpen: false
					};

					return $rootScope.customDialog().showTemplate(title, './partials/modalNewUserPass.html', controller, modalOptions);
				}
			}
		}]);

}());