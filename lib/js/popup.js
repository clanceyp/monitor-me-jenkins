var backgroundPage;

function init() {
	backgroundPage = chrome.extension.getBackgroundPage();
	var manifest = chrome.runtime.getManifest();
	$("h1").html(manifest.name);
	if (backgroundPage.mmj.getLocalStore("SuccessMarker") == "true"){
		$("body").addClass("SuccessMarker");
	}

	var jobs = backgroundPage.mmj.jobs;
	if (jobs && jobs.length) {
		for (var i = 0,job; i < jobs.length ; i++) {
			job = jobs[i];
			$("ul").append('<li class="status-'+ job.color +'">'+ job.name.link(job.url) +'</li>');
		}
	} else {
		if ($("p").length){
			$("p").html('Please check the <a href="options.html">configuration</a>.');
		} else {
			$("div").append('<p>Please check the <a href="options.html">configuration</a>.</p>');
		}
	}
}

$(function(){
	init();
	$("#refresh").on('click',function(){
		$("#display").empty().append("<ul></ul>");
		backgroundPage.mmj.init();
		setTimeout( function(){window.location.reload()}, 1000);
	})
})