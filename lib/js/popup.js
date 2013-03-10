var backgroundPage,jobs = [];

function init() {
	backgroundPage = chrome.extension.getBackgroundPage();
	var manifest = chrome.runtime.getManifest();
	if (window.ticker){
		clearInterval(window.ticker);
	}
	$("h1").html(manifest.name);
	$("#login").attr("href",backgroundPage.mmj.getLocalStore("JenkinsURL"));
	if (backgroundPage.mmj.getLocalStore("SuccessMarker") == "true"){
		$("body").addClass("SuccessMarker");
	}
	if (!backgroundPage.mmj.jobs || jobs.length === backgroundPage.mmj.jobs.length){
		return; // nothing has changed
	}
	jobs = backgroundPage.mmj.jobs;
	$("#display ul").empty()
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

$(document).ready(function(){
	init();
	$("#refresh").on('click',function(){
		$("#display ul").empty().append('<li class="waiting"></li>');
		jobs = backgroundPage.mmj.jobs = [];
		backgroundPage.mmj.init();
		window.ticker = setInterval(function(){
			init();
		},2*1000)
	})
})