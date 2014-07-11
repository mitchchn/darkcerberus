var CEDarkMode = function() {
	var sun_moon = ["&#127774;", "&#127771;"];
	function setState(state) {
		switch (state) {
			case "0":
			default:
				$("a.dayNight").html("&nbsp;" + sun_moon[1]);
				darkmode.disabled = true;
				localStorage["dark"] = 0;
				break;
			case "1":
				$("a.dayNight").html("&nbsp;" + sun_moon[0]);
				darkmode.disabled = false;
				localStorage["dark"] = 1;
				break;
		}
	}
	
	return {
		init: function () {
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

var cs, cd,
CerbExtensionApp = {
  /* Module pattern ftw! */
  plugins: ["CEDarkMode"],
  cerbData: {
		keywords: ["Dropbox","iCloud"],
		properties: {
		  urgent: "Urgent",
		  technical: "Level",
		},
		tableProperties: {
			"Urgent": "Yes",
			"Level": "Level 2 - Technical"
		},
		platforms: {
		  mac: /macbook|mac|os\sx|osx|imac/ig,
		  win: /windows|pc/ig,
		  ios: /iphone|ipad|ios/ig,
		  android: /android|droid|nexus|galaxy|samsung/ig
		}
  },
  cerbState: {
	 pageType: "",
	 ajaxResponse: "",
	 ajaxResponseType: "",
	 visibleWorkList: {},
	 visibleWorkListID: [],
	 visibleColumns: {},
	 activeColumns: {}
 },
 init: function() {
 	cd = this.cerbData;
 	cs = this.cerbState;
 	
 	/* Load plugins */
 	var loaded = CEDarkMode();
 	loaded.init();
 	
 	/* Observer pattern ftw! */
 	$(document).on("ce/stateChange",function() {
 		switch (cs.pageType) {
 			case "worklist":
 				ce.traverseWorkList();
 				break;
 			case "ticket":
 				ce.traverseProperties();
 		}
  	}); 
	this.updateCerbState();
 }
}
var ce = CerbExtensionApp;

// App methods
ce.updateCerbState = function(ajaxResponse) {
	  cs.ajaxResponse = ajaxResponse || "";
	  cs.ajaxResponseType = ce.getAjaxResponseType(cs.ajaxResponse);
	  if ( cs.ajaxResponseType === "load") {
		  return;
	  }
	if ( $(".worklistBody").length > 0 ) {
	  	//Changing tabs can add new worklists, so pick the visible one (based on the AJAX response)
		if ( cs.ajaxResponseType !== "refresh" ) {
			cs.visibleWorkListID = ce.getVisibleWorkListID(cs.ajaxResponse) || [];
		}
		cs.visibleWorkList = ce.getVisibleWorkList();
		cs.pageType = "worklist";
		cs.visibleColumns = ce.getVisibleColumns();
		cs.activeColumns = ce.getActiveColumns();
	}
	else {
		cs.pageType = "ticket";
	}
	$(document).trigger("ce/stateChange");
}

ce.getAjaxResponseType = function(e) {
	if ( e.match(/worklistAjaxLoader/) ) {
		return "load"
	}
	else if ( e.match(/^\<table/) ) {
		return "refresh"
	}
	else {
		return "default"
	}
}

/* Utility methods */

ce.sanitizeProperty = function(str) {
	return str.split(' ').join('_').toLowerCase();
};

ce.getTrailingNumbers = function(str) {
	return str.match(/\d+$/g);
}

ce.matchPlatform = function(obj) {
	//Returns the OS matches for a given string
	var platforms = cd.platforms;
	var matches = {};
	for (var os in platforms) {
		if (platforms.hasOwnProperty(os)) {
		 var match = obj.match(platforms[os]);
		 if ( match ) {
			 matches[os] = match; 
		 }
		}
	}
	return matches;
}

ce.alreadyTagged = function(obj, tag) {
  if ( $(obj).find( tag ).length > 0 ) {
	  return true;
  }
  else {
	  return false;
  }
}

ce.tagProperty = function(property) {
	return function(obj) {
		if ( ce.alreadyTagged(obj, property) ) {
			return;
		}
		$(obj).wrapInner( $(property) );		
	}
}

/* Table parsing methods */

ce.getVisibleWorkListID = function(ajaxResponse) {
	var tableID = $(ajaxResponse).filter('form[id]').attr('id');
	if ( $.isEmptyObject(tableID) ) {
		return;
	}
	return ce.getTrailingNumbers(tableID);
}

ce.getVisibleWorkList = function() {
	return $("form[id^='viewFormcust'][id$='" + cs.visibleWorkListID + "']").find(".worklistBody");
}

ce.getVisibleColumns = function() {
	if ( cs.visibleWorkListID.length > 0 ) {
		return cs.visibleWorkList.find("th").children("a");
	}
	else {
		return $(".worklistBody").find("th").children("a")[0];
	}
}

ce.getActiveColumns = function() {
	//Columns that are visible and affected by colouring/highlighting
 	var list = cs.visibleColumns;
 	var tableProperties = cd.tableProperties;
 	var activeColumns = {};
 	
 	Object.keys(tableProperties).forEach(function(property) {
	  var title = tableProperties[property][0];
	  var column = -1;
	  var active = $(list).filter(function(index, ele) {
	  	if ( $(ele).attr("title") === title ) {
			column = index;
	  		return true;
	  	}
	  });
	  if (column === -1) {
		  return;
	  }
	  activeColumns[property] = column;
	});
	return activeColumns;
}

ce.isColumnFlagged = function(column) {
	var flagged = false;
	$.each(cd.tableProperties, function(c,k) {
		var saneC = ce.sanitizeProperty(c);
		if ($(column).attr("class") === saneC && $(column).text() === k) {
			flagged = true;
		}
	});
	return flagged;
}

/* Colour methods */
ce.colorPlatforms = function(obj) {
    //Check for all platform matches in the element's string representation
	var matchedPlatforms = ce.matchPlatform($(obj).text());
	if ( $.isEmptyObject(matchedPlatforms) ) {
		return;
	}
	Object.keys(matchedPlatforms).forEach(function(platform) {
		//Skip the element has already been tagged
		var tag = "span.platform-" + platform;
		if ( ce.alreadyTagged(obj, tag) ) {
			return;
		}
		//Multiple matches for one platform? Tag em all.
		var multiMatches = matchedPlatforms[platform];
		multiMatches.forEach(function(match) {
		 $(obj).html($(obj).html().replace(match,
		 "<span class='platform-" + platform + "'>" + match + "</span>"));
		});
	});
}

/* Table methods */
ce.markupRow = function(row) {
  var visibleColumns = cs.visibleColumns;
  var tableData = cd.tableProperties;
  
  $.each(visibleColumns, function(index, column) {  
  		//First, tag the cell in the appropriate column
	   	var matchedColumn = $(row).find("td:nth-child(" + index + ")");
	   	if ( matchedColumn.length === 0 ) {
	   		return;
	   	}
	   	var columnTitle = $(column).attr("title");
	   	var property = ce.sanitizeProperty(columnTitle);
		$(matchedColumn).addClass(property);
		
		//Then, tag the whole row (if necessary)
		if ( matchedColumn.text().length === 0) {
			return;
		}
		if ( ce.isColumnFlagged(matchedColumn) ) {
	    	$(row).addClass("highlight-" + property);
			$(row).children("tr").addClass("property-" + property);
     	}
  });
}

ce.tableColorPlatforms = function(row) {
	var subjectLine = $(row).find("a.subject");
	ce.colorPlatforms(subjectLine);
	var platformCell = $(row).find("td.platform");
	ce.colorPlatforms(platformCell);
}


/* Property pane methods */
ce.paneColorProperty = function(obj) {
	var properties = cd.properties;
	Object.keys(properties).forEach(function(property) {
		var currentProperty = $(obj).find(':contains(' + properties[property] + ')');
		if ( currentProperty.length > 0 ) {
			var tag = $("<span class='property-" + property + "'>");
			var propertyTagMethod = ce.tagProperty(tag);
			propertyTagMethod(obj);
		}
	});
}
ce.colorKeywords = function(obj) {
/*
	var keywords = cd.keywords;
	keywords.forEach(function(word) {
	    var tag = "<span class='keyword-" + word.toLowerCase() + "'>";	     
		$(obj).html($(obj).html().replace(word, tag + word + "</span>"));
	});*/
}

/* Traversal methods */

// Run through a table
ce.traverseWorkList = function() {
 var workList = $(cs.visibleWorkList);
 $.each($(workList).children("tbody"), function(index, row) {
 	/* Check for various tags and text */
 	ce.markupRow(row);
  	ce.tableColorPlatforms(row);
 	/*
 	ce.tableHighlightCell(obj);
 	ce.colorKeywords(obj);*/
 });
}

// Run through a property pane
ce.traverseProperties = function() {
 var properties = $(".properties");
 $.each(properties.find(".property"), function(index, obj) {
 	ce.paneColorProperty(obj);
 	ce.colorPlatforms(obj);
 	ce.colorKeywords(obj);
 });
}


// For now, try to apply rules after all Ajax events
$.ajaxSetup({
	complete: function(e) {

		ce.updateCerbState(e.responseText);
	}
});

$(document).ready(function() {
	CerbExtensionApp.init();
});