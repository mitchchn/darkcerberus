//To access to the site's JS namespace and JQuery we must append our script to each page
//instead of injecting it as part of the extension.
//CSS also gets injected so we can add/remove it later.

(function() {
  /* Inject stylesheets */
  var extensionStyles = ["darkmode"];
  
  function loadCSS(sheet) {
	var styleSheet = document.createElement("link");
  		styleSheet.rel = "stylesheet";
	    styleSheet.id = sheet;
	    styleSheet.type = "text/css";
	    styleSheet.disabled = true;
  		styleSheet.href = safari.extension.baseURI + "CSS/" + sheet + ".css";
		document.head.appendChild(styleSheet);
  }
  
  for (sheet in extensionStyles) {
  	loadCSS(extensionStyles[sheet]);
  }
  
  /* Set up initial sheet states for those that can be toggled */
  switch (localStorage["dark"]) {
  	case "0":
  		darkmode.disabled = true;
  		break;
  	case "1":
  		darkmode.disabled = false;
  		break;
  	default:
  		localStorage["dark"] = 0;
  }
})();

(function() {
  /* Inject main script */
  var script   = document.createElement("script");
  script.type  = "text/javascript";
  script.src   = safari.extension.baseURI + "Scripts/darkmode.js";
  document.body.appendChild(script);
})();