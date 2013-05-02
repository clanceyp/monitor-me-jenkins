
(function($, chrome, document, window){
    "use strict";

    var backgroundPage = chrome.extension.getBackgroundPage(),
        jobs = [];

    function init() {
        var manifest = chrome.runtime.getManifest(),
            url = backgroundPage.mmj.getLocalStore("JenkinsURL");
        if (window.ticker){
            clearInterval(window.ticker);
        }
        $("h1").html(manifest.name + '<span class="version">'+ manifest.version +'</span>');
        $("#login").attr("href",backgroundPage.mmj.getLocalStore("JenkinsURL"));
        if (backgroundPage.mmj.getLocalStore("SuccessMarker") === "true"){
            $("body").addClass("SuccessMarker");
        }
        if (!backgroundPage.mmj.jobs || jobs.length === backgroundPage.mmj.jobs.length){
            return; // nothing has changed
        }
        jobs = backgroundPage.mmj.jobs;
        $("#display ul").empty();
        if (jobs && jobs.length > 0) {
            for (var i = 0,l = jobs.length,job; i < l ; i++) {
                job = jobs[i];
                $("ul").append('<li class="status-'+ (job.color + " ").replace('_',' ') +'">'+ job.name.link(job.url) +'</li>');
            }
        } else {
           if (window.DEFAULT_VALUES.JenkinsURL === url){
               $("p.message").html('Please check the <a href="options.html">configuration</a>.');
           } else {
               $("p.message").html('Please check you are <a href="'+ url +'">logged in</a>.');
           }
        }
        window.backgroundPage = backgroundPage;
    }

    setTimeout(function(){
        init();
        $("#refresh").on('click',function(){
            $("#display ul").empty().append('<li class="waiting"></li>');
            jobs = backgroundPage.mmj.jobs = [];
            backgroundPage.mmj.init();
            window.ticker = setInterval(function(){
                init();
            },2*1000);
        });
    },10);

})(window.Zepto, window.chrome, window.document, window);