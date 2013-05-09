
(function($, can, chrome, document, window){
    "use strict";

    var backgroundPage = chrome.extension.getBackgroundPage(),
        pollInterval = 6000,
        popup = {},
        JenkinsURL=backgroundPage.mmj.getLocalStore("JenkinsURL"),
        manifest = chrome.runtime.getManifest();

    popup = {
        observable:{
            list:new can.Observe.List()
        },
        template:null,
        messages:{
            config:'Please check the <a href="options.html">configuration</a>.',
            login:'Please check you are <a href="'+ JenkinsURL +'">logged in</a>.'
        },
        init:function(){

            if (!$('body').hasClass('is-set')){
                popup.template = can.view("#jenkins-list-item", {jobs: popup.observable.list}, {
                    canClassName:function(value){
                        return "status-" + value().replace('_',' ');
                    }
                });
                can.$('#jenkins-list').append(popup.template);
                $('h1').html(manifest.name + '<span class="version">'+ manifest.version +'</span>');
                $('#login').attr("href", JenkinsURL);
                if (backgroundPage.mmj.getLocalStore("SuccessMarker") === "true"){
                    $('body').addClass("SuccessMarker");
                }
                $('body').addClass('is-set');
            }
            popup.update();
        },
        update:function(){
            popup.observable.list.replace( backgroundPage.mmj.observable.list );// can't observe background list directly
            if ($('body').hasClass('update-pending')){
                $('body').removeClass('update-pending');
            } else if (popup.observable.list.length > 0) {
                $('#login').text('Jenkins');
            } else {
                $('p.message').html( window.DEFAULT_VALUES.JenkinsURL === JenkinsURL ? popup.messages.config : popup.messages.login );
                $('#login').text('Login');
            }
        }
    };
    window.backgroundPage = backgroundPage;
    window.popup = popup;

    $(window).on('load', function(){
        $('#refresh').on('click',function(){
            clearInterval(window.pollForChanges);
            $('body').addClass('update-pending');
            popup.observable.list.replace();
            window.pollForChanges = setInterval(popup.init, pollInterval);
            backgroundPage.mmj.init();
        });
        popup.init();
        window.pollForChanges = setInterval(popup.init, pollInterval);
    });

})(window.Zepto, window.can, window.chrome, window.document, window);