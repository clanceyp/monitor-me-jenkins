var backgroundPage;

function init() {
	backgroundPage = chrome.extension.getBackgroundPage();
	if (backgroundPage.mom.getLocalStore("SuccessMarker") == "true"){
		$("body").addClass("SuccessMarker");
	}

	var name = {},details,result,culprits=[],culprit="",url,comma,date,lastBuild,displayDate,dateArr=[],newRow,job,img,anime,
		infoTextValue = backgroundPage.mom.getLocalStore('DisplayHeroHTML'),
		showInfo = backgroundPage.mom.getLocalStore('DisplayHero'),
		jobs = backgroundPage.mom.jobs,
		radiatorColumns = backgroundPage.mom.getLocalStore('ColumnCount');

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
			name.id = "div_"+unescape(job.name).replace(/ /g,"");
			if (job.details && job.details.lastBuild){
				lastBuild = job.details.lastBuild;
				culprits = lastBuild.details.culprits;
				result = job.details.lastBuild.details.result;
				date = new Date(lastBuild.details.timestamp);
				console.log('ok lastbuild'+ lastBuild);
			}else{
				lastBuild = {url:""};
				culprits = {};
				result = "";
				date = new Date();
				console.log('not so much lastbuild');
			}
			displayDate = date.toUTCString();

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
				img = '<img src="http://deploy-01.mapofmedicine.com:8080/hudson/static/156dc64c/images/32x32/'+ job.details.healthReport[0].iconUrl  +'" />'
			} catch (e){}
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
		$('#divRadiator').append('<div class="row"><div class="unit td red"><a href="options.html">No items returned; Please check the connection settings and the view details</a>.</div></div>');
	}

	resizeGrid();
}
function getComment(name,color){
	if (color!='red'){return name}
	if (!name)name = "anon";
	var txt = ["Hmmm... might be $?","Oh oh, could be... $?","Oops, is that you $?","Not again $?","Forsooth, $, methinks!"];
	var m = txt[Math.floor(Math.random()*(txt.length))].replace("$",name);
	return m;
}
function getImage(status) {
	if (status == 0) {
		return '<img src="lib/i/grey19.png" height="19" width="19"/>';
	} else if (status == 1) {
		if (green) {
			return '<img src="lib/i/green19.png" height="19" width="19"/>';
		} else {
			return '<img src="lib/i/blue19.png" height="19" width="19"/>';
		}
	} else if (status == 2) {
		return '<img src="lib/i/yellow19.png" height="19" width="19"/>';
	} else if (status == 3) {
		return '<img src="lib/i/red19.png" height="19" width="19"/>';
	} else {
		return '?';
	}
}
window.addEventListener("load", function(){
	var backgroundPage = chrome.extension.getBackgroundPage();
	var reset = parseInt(backgroundPage.mom.getLocalStore('RefreshTime'),10) * 1000 * 60; // in milisecodns;
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
			backgroundPage.mom.init();
			//window.location.reload();
		},false)
	}
	with (document.getElementById("divDateDisplay_under")){
		style.webkitAnimationDuration = reset+"ms";
		style.webkitAnimationName = "strech";
	}
	init();
},false);

function  resizeGrid(){
	var h = $(window).height(),offset=40;
	console.log("current h: " +h );
	if  (h > 500) {
		$("#divRadiator").css('height', (h - offset) );
	}
	if (backgroundPage.mom.getLocalStore('DisplayHero') == "true"){
		var w = $('body').width() - 280;
		$('#divRadiator').css({'width':  w })
	}else{
		console.log('not w')
	}
}
window.addEventListener("resize",resizeGrid);