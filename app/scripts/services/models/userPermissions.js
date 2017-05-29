/*
* @Author: egmfilho
* @Date:   2017-05-29 17:10:12
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-29 17:50:48
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('UserPermissions', [function() {

			function UserPermissions(userPermissions) {
				angular.extend(this, {

				}, convertPermissions(userPermissions));
			}

			function convertPermissions(p) {
				var modules = { }, module = { }, permissions = { }, permission = { };

				angular.forEach(p, function(_module, _keyModule) {
					module = { name: _module.name };
					permissions = { };
					angular.forEach(_module, function(_permission, _keyPermission) {
						permission = { };
						if (_permission.hasOwnProperty('data_type')) {
							permission.name = _permission.name;
							permission.type = _permission.data_type;

							switch (_permission.data_type) {
								case 'bool':
									permission.value = _permission.value === 'Y';
									break;
								case 'varchar':
									permission.value = _permission.value;
								case 'percent':
								case 'currency':
									permission.value  = parseFloat(_permission.value);
									break;
							}

							permissions[_keyPermission] = permission;
						}
						module[_keyModule] = permissions;
					});

					return modules;
				});
			}

			return UserPermissions;

		}]);

}());