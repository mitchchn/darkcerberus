function highlightUrgent() {
 var workList = $(".worklistBody");
 $.each(workList.children("tbody"), function(index, val) {
  if ($(val).find("td:contains('Yes')").length > 0) {
   $(val).css("background","red");
   $(val).children("tr").css("background","red");
  }
 });
}

// For now, try to apply rules after all Ajax events
$.ajaxSetup({
	complete: function() {
		highlightUrgent();
	}
});