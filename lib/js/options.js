/**
 * @author patcla
 */
"use strict";

var backgroundPage = chrome.extension.getBackgroundPage();
var options = {
	ops:{
		"input":[
			{"name":"JenkinsURL","label":"Jenkins URL","type":"text"}
			,{"name":"JenkinsView","label":"Jenkins view","type":"text"}
			,{"label":"Format [Jenkins URL]/view/[Jenkins view] (case sensitive)","type":"title","tag":"p","className":'help'}
			,{"name":"RefreshTime","label":"Refresh time","type":"text","html5":"range",ops:{"min":5,"max":60,"step":5,"range-type":"m"}}
			,{"name":"UseAuth","label":"Use authentication","type":"checkbox"}
			,{"name":"username","label":"username","type":"text"}
			,{"name":"password","label":"password","type":"password"}
			,{"label":"Build radiator display","type":"title","tag":"h3"}
			,{"name":"ColumnCount","label":"Number of cols","type":"text","html5":"range",ops:{"min":1,"max":5,"step":1}}
			,{"name":"DisplayHero","label":"Display hero panel","type":"checkbox"}
			,{"name":"DisplayHeroHTML","label":"Hero panel content","type":"textarea"}
			,{"name":"SuccessMarker","label":"Use standard blue marker","type":"checkbox"}
			,{"label":"Sorting","type":"title","tag":"h4"}
			,{"name":"SortBy","label":"Sort by","type":"select",options:{"name":"name","status":"status"}}
			,{"name":"SortDirection","label":"Invert order","type":"checkbox"}
		]
	},
	init:function(){
		var manifest = chrome.runtime.getManifest();
		$("h1").html(manifest.name + " <span>"+ manifest.version +"</span>");
		$("#appVersion").text(manifest.version);
		$("#appName").text(manifest.name);
		options.setupForm();
	},
	getItemValue:function(key){
		return backgroundPage.mmj.getLocalStore(key);
	},
	saveItemValue:function(target){
		if (!target){return true}
		var id = $(target).attr("id"),
			value = $(target).attr('value'),
			type = $(target).attr('type');
		if (type === "checkbox"){
			backgroundPage.mmj.setLocalStore(id, $(target).prop('checked') );
		} else {
			backgroundPage.mmj.setLocalStore(id,value);
		}
	},
	handleValueChange:function(e){
		var target = e.target;
		options.saveItemValue(target);
	},
	handleKeyup:function(e){
		var target = e.target;
		options.saveItemValue(target);
	},
	handleClick:function(e){
		var target = e.target;
		if (!target){return true}
		if ($(target).attr('type') == 'reset'){
			e.preventDefault()
			options.resetForm();
		} else if ($(target).attr('type') == 'checkbox'){
			options.saveItemValue(target);
		}
	},
	resetForm:function(){
		backgroundPage.mmj.resetLocalStore();
		$('form fieldset').empty();
		options.setupForm();
	},
	setupForm:function(){
		for (var i = 0; i<options.ops.input.length; i++){
			var item = options.ops.input[i],
				type = item.html5 || item.type || "text",
				opsStr = (function(ops){
					if (!ops){return ""};
					var str = "";
					for (var name in ops){
						str+= name +'="'+ ops[name] +'"';
					}
					return str;
				})(item.ops),
				value = options.getItemValue(item.name);

			if (item.type === "checkbox"){
				var checked = value == "true" || value === true ? true : false;
				$('form fieldset')
					.append('<p class="option"><span class="option"><input type="checkbox" id="'+ item.name +'" value="'+ options.getItemValue(item.name) +'" /></span><label for="'+item.name+'">'+ item.label +'</label></p>')
				$("#"+ item.name).prop('checked', checked );
			} else if (item.type === "text" || item.type === "password"){
				if (type == "range"){
					var t = item.ops["range-type"] || "";
					$('form fieldset')
						.append('<p><label for="'+item.name+'">'+ item.label +' <span id="span'+item.name+'">'+value+'</span>'+t+'</label><input '+ opsStr +' type="'+ type +'" id="'+ item.name +'" value="'+ value +'" /></p>');
					addRangeListener(item.name)
				} else {
					$('form fieldset')
						.append('<p><label for="'+item.name+'">'+ item.label +'</label><input '+ opsStr +' type="'+ type +'" id="'+ item.name +'" value="'+ value +'" /></p>')
				}
			} else if (item.type === "title"){
				var tag = item.tag || "h2",
					className = item.className ? ' class="'+ item.className +'"' : "";
				$('form fieldset')
					.append("<"+tag + className +">"+ item.label +"</"+tag+">")
			} else if (item.type === "select"){
					var html = (function(options,value,html){
						for (var name in options){
							if (options[name] === value){
								html += '<option value="'+ name +'" selected="selected">'+ options[name] +'</option>';
							} else {
								html += '<option value="'+ name +'">'+ options[name] +'</option>';
							}
						}
						return html;
					})(item.options, value, '');
					$('form fieldset')
						.append('<p><label for="'+item.name+'">'+ item.label +'</label><select '+ opsStr +' type="'+ type +'" id="'+ item.name +'">'+html+'</select></p>')
			} else if (item.type === "textarea"){
				$('form fieldset')
					.append('<p><label for="'+item.name+'">'+ item.label +'</label><textarea '+ opsStr +' id="'+ item.name +'">'+value+'</textarea></p>')
			}
		}

		function addRangeListener(itmeName){
			$('#'+itmeName).on('change',function(){
				$('#span'+itmeName).text( $("#"+itmeName).val() );
			})
		}
	},
	/**
	 * Method, shows the correct section depending on which tab was clicked
	 * @id navigate
	 * @return void
	 */
	navigate:function(e){
		$("section").addClass("hidden");
		$("nav li.selected").removeClass('selected');
		$(e.target.hash).removeClass("hidden");
		$(e.target).parent("li").addClass("selected");
		e.preventDefault();
	}
};


Zepto(function($){
	var section = "#sectionDonate";
	if(backgroundPage.mmj.getLocalStore("ge98AA68e8njj9","") === "8977XX-PZ34"){
		section = "#sectionSettings";
	}
	$(document).on('click', "input, button", options.handleClick);
	$(document).on('keyup', "input", options.handleKeyup);
	$(document).on('change', "select, input", options.handleValueChange);
	options.init()
	$("nav a").each(function(i,el){
		if ($(this).attr("href") == section){
			$(this).parent("li").addClass("selected");
			return false;
		}
	})
	$('nav a').on('click',options.navigate);
	$("#formDonate").on("submit",function(){
		backgroundPage.mmj.setLocalStore("ge98AA68e8njj9","8977XX-PZ34")
	})
	$(section).removeClass("hidden");
})


