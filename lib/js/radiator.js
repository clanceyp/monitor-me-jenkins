var backgroundPage;

function init() {
	backgroundPage = chrome.extension.getBackgroundPage();
	if (backgroundPage.mmj.getLocalStore("SuccessMarker") == "true"){
		$("body").addClass("SuccessMarker");
	}

	var name = {},details,result,culprits=[],culprit="",url,comma,date,lastBuild,displayDate,dateArr=[],newRow,job,img,anime,
		infoTextValue = backgroundPage.mmj.getLocalStore('DisplayHeroHTML'),
		showInfo = backgroundPage.mmj.getLocalStore('DisplayHero'),
		jobs = backgroundPage.mmj.jobs,
		radiatorColumns = backgroundPage.mmj.getLocalStore('ColumnCount');

	if (showInfo == "true" && infoTextValue){
		$('body').addClass("showInfo");
		$('#divInfo').html(infoTextValue).css({opacity:0,display:'block'}).animate({opacity:1});
	}
	if (jobs && jobs.length) {
		$('#divRadiator').addClass("col_"+ radiatorColumns);
		for (var i = 0; i < jobs.length ; i++) {
			anim=comma=culprit=displayDate=result=url="";
			lastBuild=name={};
			result="NA";
			date=null;
			culprits=[];
			if (!jobs[i] || !jobs[i].url){
				continue;
			}
			if (newRow == null){
				newRow = $('<div class="row"/>');
			}
			job = jobs[i];
			name.display = job.name.replace(/_|-/g," ");
			name.id = "div_"+decodeURIComponent(job.name).replace(/ /g,"");
			if (job.details && job.details.lastBuild){
				lastBuild = job.details.lastBuild;
				culprits = lastBuild.details.culprits;
				result = job.details.lastBuild.details.result;
				date = new Date(lastBuild.details.timestamp);
			}else{
				lastBuild = {url:""};
				culprits = {};
				result = "";
				date = new Date();
			}
			displayDate = date.toUTCString();
            job.color = job.color || "grey";

			anime = (job.color.match("_anime")) ? "anime" : "";
			job.color = job.color.replace("_anime","");

			for (var cul in culprits){
				culprit+= comma+culprits[cul].fullName  ;
				comma=", ";
			}
			if (!job || !job.url){
				job.url = 'about:blank';
			}
			try {
				img = '<img src="lib/images/32x32/'+ job.details.healthReport[0].iconUrl  +'" />';
			} catch (e){
                img = "<img/>";
            }
			try {
				$(newRow).append($('<div id="'+name.id+'" class="unit td '+job.color+' '+result+' '+anime+'"><div class="top">'+img+'</div><h2><a href="'+ job.url +'">'+name.display+'</a></h2><p><a href="'+ lastBuild.url +'">'+result+': '+displayDate+'</a></p><p class="culprit">'+getComment(culprit,job.color)+'</p></div>'));
			} catch (e){console.log(e)}

			if ((i+1)%radiatorColumns == 0 && newRow){
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
		$("#login").attr('href',backgroundPage.mmj.getLocalStore("JenkinsURL"))
	}
}
function getComment(name,color){
	if (color!='red'){return name}
	if (!name)name = "anon";
	var txt = ["Hmmm... might be $?","Oh oh, could be... $?","Oops, is that you $?","Not again $?","Forsooth, $, methinks!"];
	var m = txt[Math.floor(Math.random()*(txt.length))].replace("$",name);
	return m;
}
function setBackgroundColour(useimage, image, color){
	if (useimage == true || useimage == "true"){
		$("body").css({
			backgroundImage:"url(lib/bg/"+image+".png)"
		})
	} else {
		$("body").css({
			backgroundColor:color,
			backgroundImage:"none"
		})
	}
}
window.addEventListener("load", function(){
	var backgroundPage = chrome.extension.getBackgroundPage();
	var reset = parseInt(backgroundPage.mmj.getLocalStore('RefreshTime'),10) * 1000 * 60; // in milisecodns;
	reset = reset;
	console.log("hudson:sitetimeout("+ reset +":mins)");
	if (isNaN(reset)){
		reset = 1000 * 60 * 10
		console.log("can't connect to background page, or no timeout value set");
	}
	window.t = setTimeout(function(){
		window.location.reload()
	},reset);
	Date.prototype.getMinutesString = function(){
		var m = this.getMinutes();
		if (m<10){
			return "0"+m;
		}
		return m.toString();
	};
	var time = new Date();
	with (document.getElementById("divDateDisplay")){
		innerHTML = "updated "+time.getHours()+":"+time.getMinutesString();
		//style.webkitAnimationDuration = reset+"ms";
		//style.webkitAnimationName = "fadeIn";
		addEventListener("click", function(){
			backgroundPage.mmj.init();
			//window.location.reload();
		},false)
	}
	with (document.getElementById("divDateDisplay_under")){
		style.webkitAnimationDuration = reset+"ms";
		style.webkitAnimationName = "strech";
	}
	setBackgroundColour( backgroundPage.mmj.getLocalStore("Background"), backgroundPage.mmj.getLocalStore("BackgroundImage"), backgroundPage.mmj.getLocalStore("BackgroundColor"))
	init();
	setTimeout(resizeGrid,250);
},false);

function  resizeGrid(){
	var h = $(window).height(),offset=40;
	console.log("current h: " +h );
	if  (h > 500) {
		$("#divRadiator").css('height', (h - offset) );
	}
	if (backgroundPage.mmj.getLocalStore('DisplayHero') == "true"){
		var w = $('body').width() - 280;
		$('#divRadiator').css({'width':  w })
	}else{
		console.log('not w')
	}
}
window.addEventListener("resize",resizeGrid);