
(function($, chrome, document, window){
    "use strict";

    var backgroundPage = chrome.extension.getBackgroundPage(),
        console = window.console,
        radiator = {
                util:{
                getComment:function(name,color){
                    if (color !== 'red'){return name;}
                    if (!name) {name = "anon";}
                    var txt = ["Hmmm... might be $?","Oh oh, could be... $?","Oops, is that you $?","Not again $?","Forsooth, $, methinks!"],
                        m = txt[Math.floor(Math.random()*(txt.length))].replace("$",name);
                    return m;
                },
                setBackgroundColour:function(image, color){
                    $("body").css({
                        backgroundColor:color,
                        backgroundImage:"url(lib/bg/"+image+".png)"
                    }).addClass('SuccessMarker_'+backgroundPage.mmj.getLocalStore("SuccessMarker"));
                },
                resizeGrid:function(){
                    var h = $(window).height(),offset=40;
                    if  (h > 500) {
                        $("#divRadiator").css('height', (h - offset) );
                    }
                    if (backgroundPage.mmj.getLocalStore('DisplayHero') === "true"){
                        var w = $('body').width() - 280;
                        $('#divRadiator').css({'width':  w });
                    }
                }
            }
        };

    radiator.init = function() {

        var name = {},details,result,culprits=[],culprit="",url,comma,date,lastBuild,displayDate,dateArr=[],newRow,job,img,
            anim,colour,
            infoTextValue = backgroundPage.mmj.getLocalStore('DisplayHeroHTML'),
            showInfo = backgroundPage.mmj.getLocalStore('DisplayHero'),
            jobs = backgroundPage.mmj.jobs,
            radiatorColumns = backgroundPage.mmj.getLocalStore('ColumnCount'),
            CulpritRegEx = backgroundPage.mmj.getLocalStore('CulpritRegEx'),
            ShowCulprits = backgroundPage.mmj.getLocalStore('ShowCulprits'),
            regEx = null;

        if (showInfo === "true" && infoTextValue){
            $('body').addClass("showInfo");
            $('#divInfo').html(infoTextValue).css({opacity:0,display:'block'}).animate({opacity:1});
        }
        if (CulpritRegEx && CulpritRegEx.length > 1){
            try {
                regEx = new RegExp( CulpritRegEx );
            }catch(e){
                console.log(e);
            }
        }
        if (jobs && jobs.length) {
            $('#divRadiator').addClass("col_"+ radiatorColumns);
            newRow = $('<div class="row"/>');
            for (var i = 0, l = jobs.length; i < l ; i++) {
                anim=comma=culprit=displayDate=result=url=colour="";
                lastBuild=name=job={};
                result="NA";
                date=null;
                culprits=[];
                if (!jobs[i] || !jobs[i].url){
                    continue;
                }
                if (newRow === null){
                    newRow = $('<div class="row"/>');
                }
                job = jobs[i];
                name.display = job.name.replace(/_|-/g," ");
                name.id = "div_"+decodeURIComponent(job.name).replace(/ /g,"");
                if (job.details && job.details.lastBuild){
                    lastBuild = job.details.lastBuild;
                    colour = job.details.color || job.color;
                    if (lastBuild.details){
                        culprits = lastBuild.details.culprits;
                        result = lastBuild.details.result;
                        date = new Date(lastBuild.details.timestamp);
                    }else{
                        culprits = {};
                        result = "unknown";
                        date = new Date();
                    }
                }else{
                    lastBuild = {url:""};
                    culprits = {};
                    result = "unknown";
                    date = new Date();
                }
                displayDate = date.toUTCString();
                colour = colour || "grey";

                anim = (colour.match("_anime")) ? "anime" : "static";
                colour = colour.replace("_anime","");
                if (ShowCulprits === "true"){
                    for (var cul in culprits){
                        if (culprits.hasOwnProperty(cul)){
                            culprit+= comma+ getCulpritName( culprits[cul].fullName, regEx)  ;
                            comma=", ";
                        }
                    }
                }
                if (!job || !job.url){
                    job.url = 'about:blank';
                }
                try {
                    img = '<img data-color="'+ colour +'" src="lib/images/32x32/'+ job.details.healthReport[0].iconUrl  +'" />';
                } catch (e){
                    img = "<img/>";
                }
                try {
                    $(newRow).append($('<div id="'+name.id+'" class="unit td '+ colour +' '+result+' '+anim+'"><div class="top">'+img+'</div><h2><a href="'+ job.url +'">'+name.display+'</a></h2><p><a href="'+ lastBuild.url +'">'+result+': '+displayDate+'</a></p><p class="culprit">'+radiator.util.getComment(culprit,job.color)+'</p></div>'));
                } catch (e){console.log(e);}

                if ((i+1)%radiatorColumns === 0 && newRow){
                    $("#divRadiator").append(newRow);
                    newRow = null;
                }
            }
            if (newRow){
                $("#divRadiator").append(newRow);
            }
        } else {
            $('#divRadiator').append('<div class="row"><div class="unit td red">' +
                'No items returned; Please check the connection settings and the view details<br/><a href="options.html">Options</a><br/><a id="login" href="#">Log in</a></div></div>');
            $("#login").attr('href',backgroundPage.mmj.getLocalStore("JenkinsURL"));
        }

        function getCulpritName(fullName, re){
            var name;
            if (re){
                try {
                    var temp = re.exec( fullName );
                    if (temp && Array.isArray( temp )){
                        name = temp.pop();
                    }else{
                        name = fullName;
                    }
                } catch(e){
                    name = fullName;
                }
            } else {
                name = fullName;
            }
            return name;
        }
    };
    window.radiator = radiator;
    window.backgroundPage = backgroundPage;

    window.addEventListener("load", function(){
        var reset = parseInt(backgroundPage.mmj.getLocalStore('RefreshTime'),10) * 1000 * 60;
        if (isNaN(reset)){
            reset = 1000 * 60 * 10;
        }
        window.t = setTimeout(function(){
            window.location.reload();
        },reset);
        Date.prototype.getMinutesString = function(){
            var m = this.getMinutes();
            if (m<10){
                return "0"+m;
            }
            return m.toString();
        };
        var time = new Date();
        $('#divDateDisplay')
            .text( "updated "+ time.getHours() +":"+time.getMinutesString() )
            .on('click',function(){
                backgroundPage.mmj.init();
                window.location.reload();
            });
        document.getElementById("divDateDisplay_under").style.webkitAnimationDuration = reset+"ms";
        document.getElementById("divDateDisplay_under").style.webkitAnimationName = "strech";
        radiator.util.setBackgroundColour(
            backgroundPage.mmj.getLocalStore("BackgroundImage"),
            backgroundPage.mmj.getLocalStore("BackgroundColor")
        );
        $('body').addClass( backgroundPage.mmj.getLocalStore("ButtonStyle") );
        radiator.init();
        setTimeout(radiator.util.resizeGrid,250);
    },false);

    window.addEventListener("resize",radiator.util.resizeGrid);

})(window.Zepto, window.chrome, document, window);