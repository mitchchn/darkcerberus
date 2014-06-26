/* Utility methods */
function matchPlatform(obj) {
	//Returns the OS matches for a given string
	var matches = {};
	var platforms = {mac: /mac|os\sx|osx|imac|macbook/ig,
					win: /windows|pc/ig,
					ios: /iphone|ipad|ios/ig,
					android: /android|droid|nexus|galaxy|samsung/ig};
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

function alreadyTagged(obj, tag) {
//Is there a child element with the provided CSS class?
	if ( $(obj).find( tag ).length > 0 ) {
		return true;
	}
	else {
		return false;
	}
}

/* Table methods */
function tableHighlightUrgent(obj) {
  if ($(obj).find("td:contains('Yes')").length > 0) {
   $(obj).addClass("highlight-urgent");
   $(obj).children("tr").addClass("property-urgent");
  }
}

function tableHighlightTechnical(obj) {
  if ($(obj).find("td:contains('Level 2 - Technical')").length > 0) {
   $(obj).addClass("highlight-technical");
   $(obj).children("tr").addClass("property-technical");
  }
}


function tableColorPlatforms(obj) {
	var subjectLine = $(obj).find("a.subject");
	var platform = matchPlatform(subjectLine.text());
	if ( !$.isEmptyObject(platform) ) {
		for (var p in platform) {
			if ( platform.hasOwnProperty(p) && !alreadyTagged(subjectLine,"span.platform-" + p) ) {
				//Multiple matches for one platform? Tag em all.
				var matches = platform[p];
				if ( matches.length > 1 ) {
					for (var match in matches) {
						if (matches.hasOwnProperty(match)) {
							$(subjectLine).html($(subjectLine).html().replace(matches[match],
							"<span class='platform-" + p + "'>" + matches[match] + "</span>"));
						}
					}
				}
				else {
					$(subjectLine).html($(subjectLine).html().replace(platform[p],
					"<span class='platform-" + p + "'>" + platform[p] + "</span>"));
				}
			}
		}
	}
}

/* Property pane methods */
function colorUrgent(obj) {
	var urgentProperty = $(obj).find(":contains('Urgent')");
	var tag = "<span class='property-urgent'>";
	if ( urgentProperty.length > 0 && !alreadyTagged(obj,'span.property-urgent') ) {
		$(obj).html(tag + $(obj).html() + "</span>");
	}
}

function colorTechnical(obj) {
	var technicalProperty = $(obj).find(":contains('Level')");
	var tag = "<span class='property-technical'>";
	if ( technicalProperty.length > 0 && !alreadyTagged(obj,'span.property-technical')) {
		$(obj).html(tag + $(obj).html() + "</span>");
	}
}

function colorPlatforms(obj) {
	var colorProperty = $(obj).find(":contains('Platform')");
	if ( colorProperty.length > 0 ) {
		var matched = matchPlatform($(obj).html());
		console.log(matched);
		for (var platform in matched) {
			if ( matched.hasOwnProperty(platform) && !alreadyTagged(obj,'span.platform-' + platform) ) {
				$(obj).html( $(obj).html().replace(matched[platform],
				"<span class='platform-" + platform + "'>" + matched[platform] + "</span>"));
			}
		}
		
// 		$(obj).html($(obj).html().replace(/Mac/,"<span class='platform-mac'>Mac</span>"));
// 		$(obj).html($(obj).html().replace(/Windows/,"<span class='platform-win'>Windows</span>"));
// 		$(obj).html($(obj).html().replace(/Android/,"<span class='platform-android'>Android</span>"));
// 		$(obj).html($(obj).html().replace(/iOS/,"<span class='platform-ios'>iOS</span>"));
	}
}



// Run through a table
function traverseWorkList() {
 var workList = $(".worklistBody");
 $.each(workList.children("tbody"), function(index, val) {
 	/* Check for various tags and text */
 	//Posts marked urgent
 	tableHighlightUrgent(val);
 	// Technical
 	tableHighlightTechnical(val);
 	//Platform words
 	tableColorPlatforms(val);
 	
 });
}

// Run through a property pane
function traverseProperties() {
 var properties = $(".properties");
 $.each(properties.find(".property"), function(index, val) {
 	/* Check for various tags and text */
 	//Urgent
 	colorUrgent(val);
 	colorPlatforms(val);
 	colorTechnical(val);
 });
}


// For now, try to apply rules after all Ajax events
$.ajaxSetup({
	complete: function() {
		traverseWorkList();
		traverseProperties();
	}
});

$(document).ready(function() {
	traverseProperties();
});