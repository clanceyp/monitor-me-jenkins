

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		// console.log(sender.tab ?
		//             "from a content script:" + sender.tab.url :
		//             "from the extension");
	});

$(document).on('ajaxBeforeSend', function(e, xhr, options){
	// This gets fired for every Ajax request performed on the page.
	// The xhr object and $.ajax() options are available for editing.
	// Return false to cancel this request.
	var auth = null,
		useAuth = mmj.getLocalStore("UseAuth");

	if (useAuth == "true"){
		auth = window.btoa((mmj.getLocalStore("username") || '') + ':' + (mmj.getLocalStore("password") || ''));
		xhr.setRequestHeader('Authorization', 'Basic ' + auth);
	}
})

var mmj = {
	jobs:[],
	getOptions:function(){
		if (!mmj.getLocalStore('loaded')){
			mmj.resetLocalStore();
			mmj.setLocalStore("loaded",true);
		}
		var ops = {};
		for (var key in DEFAULT_VALUES){
			ops[key] = mmj.getLocalStore(key);
		}
		return ops;
	},
	getLocalStore:function(key){
		var value = localStorage[key];
		key = key || "";
		if (value === undefined){
			value = DEFAULT_VALUES[key];
		}
		if (key.toLowerCase().indexOf("password") === 0){
			value = window.atob(value);
		}
		return value;
	},
	setLocalStore:function(key,value){
		if (key.toLowerCase().indexOf("password") === 0){
			value = window.btoa(value);
		}
		localStorage[key] = value;
	},
	resetLocalStore:function(){
		localStorage.clear();
		for (var key in DEFAULT_VALUES){
			localStorage[key] = DEFAULT_VALUES[key];
		}
	},
	log:function(message){
		if (DEBUG){
			console.log(message);
		}
	},
	init:function(){
		mmj.updateBrowserActionStatus(-1);
		mmj.sendRequest();
		if (mmj.repeat){
			clearTimeout(mmj.repeat);
		}
		mmj.repeat = setTimeout(mmj.init,mmj.getLocalStore("RefreshTime") * 1000 * 60 )
	},
	getCleanUrl:function(path){
		var url = mmj.getLocalStore("JenkinsURL") +"/view/"+ mmj.getLocalStore("JenkinsView") +"/",
			urlArr = url.split("://");
		if (urlArr.length > 1){
			return urlArr[0]+"://"+urlArr[1].replace(/\/+/g,'/') + path;
		} else {
			return urlArr[0].replace(/\/+/g,'/') + path;
		}
	},
	updateBrowserActionStatus:function(status) {
		mmj.log("update status: "+ status)
		chrome.browserAction.setBadgeText({text:''});
		if (status >= 0) {
			mmj.updateBrowserActionStatusPie()
		} else {
			chrome.browserAction.setIcon({path:'lib/i/icon19.png'});
			chrome.browserAction.setBadgeText({text:'?'});
		}
		//mmj.updateBrowserActionStatusPie()
	},
	updateBrowserActionStatusPie:function(){
			function pie(ctx, w, h, datalist, colourlist, padding)
			{
				var p = padding || 0,
					radius = (h / 2) - p,
					centerx = w / 2,
					centery = h / 2,
					total = 0,
					last = 0,
					offset = Math.PI / 2,
					total = datalist.reduce(function(a, b) {
						return a + b;
					}),
					len = datalist.length;
				/* pie */
				ctx.save();
				for(var x=0; x < len; x++){
					var item = datalist[x],
						arcsector = Math.PI * (2 * item / total);
					ctx.beginPath();
					ctx.fillStyle = colourlist[x];
					ctx.moveTo(centerx,centery);
					ctx.arc(centerx, centery, radius, last - offset, last +
						arcsector - offset, false);
					ctx.lineTo(centerx, centery);
					ctx.fill();
					ctx.closePath();
					last += arcsector;
				}
				ctx.restore();
				ctx.beginPath();
				ctx.arc(centerx, centery, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.strokeStyle = "#555555";
				ctx.lineWidth   = 1;
				ctx.stroke();

			}
		/*
			function ellipse(centerX, centerY, radX, radY, fill){
				ctx.save();
				ctx.beginPath();
				for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 0.01 ) {
					var xPos = centerX - (radY * Math.sin(i)) * Math.sin(0 * Math.PI) + (radX * Math.cos(i)) * Math.cos(0 * Math.PI);
					var yPos = centerY + (radX * Math.cos(i)) * Math.sin(0 * Math.PI) + (radY * Math.sin(i)) * Math.cos(0 * Math.PI);
					if (i == 0) {
						ctx.moveTo(xPos, yPos);
					} else {
						ctx.lineTo(xPos, yPos);
					}
				}
				ctx.strokeStyle = "#000000";
				ctx.lineWidth   = 2;
				ctx.stroke();
				ctx.fillStyle = fill;
				ctx.fill();
				ctx.closePath();
				ctx.restore();
			}
			*/
			function getCanvas(){
				var canvas;
				if (document.getElementsByTagName("canvas").length){
					canvas = document.getElementsByTagName("canvas")[0]
				} else {
					canvas = document.createElement("canvas");
					document.getElementsByTagName('body')[0].appendChild( canvas )
				}
				return canvas;
			}
			var canvas = getCanvas(),
				datalist= [0,0,0],
				colourlist = new Array('#00ff00', '#ff0000', '#bbbbbb'),
				ctx = canvas.getContext('2d');
			datalist[0] = mmj.jobs.filter(function(job){ return job.color === "red"}).length;
			datalist[1] = mmj.jobs.filter(function(job){ return job.color === "blue"}).length;
			datalist[2] = mmj.jobs.length - (datalist[0] + datalist[1]);

			pie(ctx, 19, 19, datalist, colourlist, 2);
			var radgrad = ctx.createRadialGradient(5,5,2,5,5,5);
			radgrad.addColorStop(0, '#A7D30C');
			radgrad.addColorStop(0.9, '#019F62');
			radgrad.addColorStop(1, 'rgba(1,159,98,0)');
			//ctx.fillStyle = radgrad;
			//ctx.fillRect(0,0,150,150);
			// ellipse(400/2,400-40,70,30,"#888888");

		var imageData = ctx.getImageData(0, 0, 19, 19);

		chrome.browserAction.setIcon({
			imageData: imageData
		});
	},
	sendRequest:function(){
		var auth = null;
		if (mmj.httpRequest) {// we only need one request at a time, so cancel current request.
			mmj.httpRequest.abort();
		}
		if (mmj.abortTimer){
			window.clearTimeout(mmj.abortTimer);
		}

		mmj.httpRequest = new XMLHttpRequest();
		mmj.abortTimer = window.setTimeout(mmj.httpRequest.abort, DEFAULT_VALUES["timeout"]);
		var auth = null,
			useAuth = mmj.getLocalStore("UseAuth");

		if (useAuth == "true"){
			auth = window.btoa((mmj.getLocalStore("username") || '') + ':' + (mmj.getLocalStore("password") || ''));
		}
		try {
			mmj.httpRequest.onreadystatechange = mmj.handleResponse;
			mmj.httpRequest.onerror = mmj.handleResponseError;
			mmj.httpRequest.open('GET', mmj.getCleanUrl('api/json') , true);
			if (useAuth == "true") {
				mmj.log('using Authorization')
				mmj.httpRequest.setRequestHeader('Authorization', 'Basic ' + auth);
			}
			mmj.httpRequest.send();
		} catch (e) {
			mmj.handleResponseError(e);
		}
	},
	handleResponseError:function(e){
		mmj.log(e);
		mmj.log("Something bad happened, maybe couldn't connect to Jenkins?")
		mmj.jobs = [];
	},
	handleResponse:function(){
		var auth = null,
			useAuth = mmj.getLocalStore("UseAuth");

		if (mmj.httpRequest && mmj.httpRequest.status == 200 && mmj.httpRequest.responseText){
			mmj.log(mmj.httpRequest.status)
			var response = JSON.parse(mmj.httpRequest.responseText),
				topStatus = -1,
				xr;
			if (!response.jobs) {
				return
			}
			if (mmj.getLocalStore("SortBy") !== 'status') {
				mmj.jobs = _.sortBy(response.jobs,function(job){return job.name});
			}else{
				mmj.jobs = _.sortBy(response.jobs,function(job){return STATUSES[job.color]});
			}
			if (mmj.getLocalStore("SortDirection") === 'true'){
				mmj.jobs.reverse();
			}
			topStatus = STATUSES[ _.max(mmj.jobs, function(job) { return STATUSES[job.color]; }).color ];
			mmj.updateBrowserActionStatus(topStatus);
			for (var i = 0; i< mmj.jobs.length; i++){
				var j = i,
					job = mmj.jobs[j]
					url = job.url;
				$.getJSON(url, function(data){
					job.details = data;
					if (job.details && job.details.lastBuild){
						$.getJSON(job.details.lastBuild.url+'/api/json', function(data){
							job.details.lastBuild.details = JSON.parse(data) || {};
						})
					}	else {
						job.details = job.details || {};
						job.details.lastBuild = {};
					}
				})
			}
			//mmj.updateBrowserActionStatus(topStatus);
		}
	},
	processStatus:function(topStatus){

	}
}

mmj.init();