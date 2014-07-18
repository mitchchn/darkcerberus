var CEDarkMode = function() {
	var sun_moon = ["&#127774;", "&#127771;"];
	var cerbState = {};
	var state;
	function setState(state) {
		switch (state) {
			case "0":
			default:
				$("a.dayNight").html("&nbsp;" + sun_moon[1]);
				darkmode.disabled = true;
				localStorage["dark"] = 0;
				this.state = 0;
				break;
			case "1":
				$("a.dayNight").html("&nbsp;" + sun_moon[0]);
				darkmode.disabled = false;
				localStorage["dark"] = 1;
				this.state = 1;
				break;
		}
	}
	return {
		getCerbState: function() {
			return this.cerbState;
		},
		getState: function() {
			return this.state;
		},
		init: function (cerbState) {
			this.cerbState = cerbState;
			$("<a href='#' style='text-decoration: none' class='dayNight'>").insertAfter('#lnkSignedIn');
			setState(localStorage["dark"]);
			
			$(".dayNight").on("click", function() {
				if (localStorage["dark"] === "1") {
					setState("0");
				}
				else {
					setState("1");
				}
			});
		}
	}
}