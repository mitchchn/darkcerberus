var cs, cd,
CerbExtensionApp = {
  /* Module pattern ftw! */
  plugins: ["CEDarkMode"],
  cerbData: {
  		propPrefix: "property",
		keywords: ["Dropbox","iCloud"],
		properties: {
		  urgent: "Urgent",
		  technical: "Level",
		},
		tableProperties: {
			"urgent": {
				"flag": "Yes",
				"highlight_row": true
				
			},
			"level": {
				"flag": /Level/,
				"highlight_row": true
			},
			"num_messages": {
				"flag": /^[1]$/,
				"color_text": true
			},
			"last_action": {
				"flag": /New from/,
				"color_text": true,
				"highlight_row": false,
				"tag": "new-from"
			}
		},
		platforms: {
		  mac: /imac|mac(\s?mini|\s?(book)(\s?(air|pro))?|\s?pro)?|mb(p|a)|os\s?x/ig,
		  win: /win(dows)?(\s?(7|8|xp|vista))?|pc/ig,
		  ios: /iphone(\s?[4-5]s?)?|ipod(\s?touch)?|itouch|ipad(\s?(mini|air))?|ios(\s?[5-8])?/ig,
		  android: /(an)?droid|nexus|galaxy|samsung|htc/ig
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
 				ce.traverseConversation();
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
	return str.split(' ').join('_').toLowerCase().replace(/#/,"num");
};

ce.getTrailingNumbers = function(str) {
	return str.match(/\d+$/g);
}

ce.matchAllPlatforms = function(obj) {
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

ce.doWhenLoaded = function(selector, callback) {
	var count = 0;
	var loaded = setInterval(function() {
	var element = $(selector);
	if ( element.length === 0 ) {
		count++;
		if ( count < 50 ) {
			return;
		}
	}
	callback();
	clearInterval(loaded);
	},25);
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
	var columns;
	if ( cs.visibleWorkListID.length > 0 ) {
		columns = cs.visibleWorkList.find("th").children("a");
	}
	else {
		columns = $(".worklistBody").find("th").children("a")[0];
	}
	//Give the column headers addressable IDs
	for (var index = 0; index < columns.length; index++) {
		var column = columns[index];
		column.id = ce.sanitizeProperty($(column).attr("title"));		
		//IMPLEMENT getActive *HERE* (tag class as active)
	}
	return columns;
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

ce.isCellFlagged = function(cell) {
	var cellVal = $(cell).text();
	var propsToFlag = cd.tableProperties;
	for (var index = 0; index < propsToFlag.length; index++) {
		var p = propsToFlag[index];
		if ( p["property"] === propertyToMatch && p["flag"] === cellVal ) {
			return true;
		}
	}
	return false;
}

/* Colour methods */
ce.colorPlatforms = function(obj) {
  //Check for all platform matches in the element's string representation
  for (var platform in cd.platforms) {
  	if (cd.platforms.hasOwnProperty(platform)) {
  		var platformRegex = cd.platforms[platform];
		$(obj).html($(obj).html().replace(platformRegex, function(match) {
			return "<span class='platform-" + platform + "'>" + match + "</span>";
		}));
  	}  
  }
}

/* Table methods */

/* Go through each cell in a Cerb table row and add CSS tags */
ce.markupRow = function(row) {    
  var rowColumns = $(row).find("td");
  for (var index = 0, len = cs.visibleColumns.length; index <= len; index++) {  	
    var currentCell = $(rowColumns).get(index);
    //Check if it's a multi-line cell
    var cellLineNumber = $(currentCell).parent().index();
    if ( cellLineNumber > 0 ) {
    	var currentColumn = cs.visibleColumns[index-1].id;
    	var cellProperty = cd.propPrefix + "-" + currentColumn + "-" + cellLineNumber;
    }
    else {
		var currentColumn = cs.visibleColumns[index].id;
		var cellProperty = cd.propPrefix + "-" + currentColumn;
	}
	//Match the cell to its column)
	$(currentCell).attr("headers", currentColumn);
	
	//Check if the cell or row needs to be flagged
	var tableProperty =  cd.tableProperties[currentColumn];
	var cellVal = $(currentCell).text();
	if (typeof tableProperty !== "undefined" && cellVal.match(tableProperty["flag"])) {
		var tag = tableProperty["tag"] || currentColumn;
		
		if ( tableProperty["highlight_cell"] === true ) {
			$(currentCell).addClass("highlight-" + tag);
		}
		if ( tableProperty["highlight_row"] === true ) {
			$(row).addClass("highlight-" + tag);
			$(row).children("tr").addClass(cellProperty);
		}
		if ( tableProperty["color_text"] === true ) {
			$(currentCell).wrapInner("<span class='property-" + tag + "'></span>");
		}
	}
  }
}

ce.tableColorPlatforms = function(row) {
	var subjectLine = $(row).find("a.subject");
	ce.colorPlatforms(subjectLine);
	var platformCell = $(row).find("td[headers='platform']");
	if ( platformCell.length > 0 ) {
		ce.colorPlatforms(platformCell);
	}
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
  //This hack excludes Cerb TDs that are not real cells (in multi-line cells)
  var workListEntries = $(cs.visibleWorkList).find("tbody");
  for (var index = 0, len = workListEntries.length; index < len; index++) {
     var row = workListEntries[index];
	 ce.markupRow(row);
	 ce.tableColorPlatforms(row);
  }
}

// Run through a property pane
ce.traverseProperties = function() {
 /*console.log("they called? (props)");*/
 var properties = $(".properties");
 $.each(properties.find(".property"), function(index, obj) {
 	/*ce.paneColorProperty(obj);*/
 	/*ce.colorPlatforms(obj);*/
 	/*ce.colorKeywords(obj);*/
 });
}

ce.traverseConversation = function() {
	var messages = "div#conversation";
	ce.doWhenLoaded(messages, function() {
		$(messages).find("span.tag:contains('sent')").addClass("tag-sent");
		$(messages).find("span.tag:contains('received')").addClass("tag-received");
		$(messages).find("span:contains('Replied in')").addClass("tag-replied");
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