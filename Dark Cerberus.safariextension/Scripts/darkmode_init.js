//To access to the site's JS namespace and JQuery we must append our script to each page
//instead of injecting it as part of the extension

var script   = document.createElement("script");
script.type  = "text/javascript";
script.src   = safari.extension.baseURI + "Scripts/darkmode.js";
document.body.appendChild(script);