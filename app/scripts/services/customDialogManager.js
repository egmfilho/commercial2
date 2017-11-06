/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date:   2017-06-16 12:29:16
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-06 12:39:57
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.service('CustomDialogManager', CustomDialogManager);

	function CustomDialogManager() {
		var _openDialogs = [ ];

		this.addDialog = function(dialog) {
			_openDialogs.push(dialog);
		};

		this.removeDialog = function(dialog) {
			try {
				dialog.close();
			} catch(e) {
				
			} finally {
				var index = _openDialogs.findIndex(function(n) {
					return n.guid == dialog.guid;
				});
				
				if (index >= 0)
					_openDialogs.splice(index, 1);
			}
		};

		this.closeAll = function() {
			angular.forEach(_openDialogs, function(d) {
				d.close();
			});
			
			_openDialogs = [ ];
		};
	}

})();