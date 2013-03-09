

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
		if (status == 0) {
			chrome.browserAction.setIcon({path:'lib/i/grey19.png'});
		} else if (status == 1) {
			var color = (mmj.getLocalStore("SuccessMarker") == "true" ) ? "blue" : "green";
			chrome.browserAction.setIcon({path:'lib/i/'+color+'.png'});
		} else if (status == 2) {
			chrome.browserAction.setIcon({path:'lib/i/yellow19.png'});
		} else if (status == 3) {
			chrome.browserAction.setIcon({path:'lib/i/red19.png'});
		} else {
			chrome.browserAction.setIcon({path:'lib/i/icon19.png'});
			chrome.browserAction.setBadgeText({text:'?'});
		}
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