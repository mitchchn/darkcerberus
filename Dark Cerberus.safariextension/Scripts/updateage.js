var CEUpdateAge = function() {
	var cerbState = {};
	
	return {
		getCerbState: function() {
			return this.cerbState;
		},
		init: function (cerbState) {
			this.cerbState = cerbState;
			console.log(this.cerbState);
		}
	}
}