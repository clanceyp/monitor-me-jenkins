/**
 * @author patcla
 */

(function($, chrome, document, window){
"use strict";

    var alert = window.alert,
        confirm = window.confirm,
        backgroundPage = chrome.extension.getBackgroundPage(),
        hideAuth = (backgroundPage.mmj.getLocalStore("allowBasicAuthentication") === "true") ? false : true,
        options = {
            ops:{
                "input":[
                    {"name":"JenkinsURL","label":"Jenkins URL","type":"text"},
                    {"name":"JenkinsView","label":"Jenkins view","type":"text"},
                    {"label":"Format [Jenkins URL]/view/[Jenkins view] (case sensitive)","type":"title","tag":"p","className":'help'},
                    {"name":"RefreshTime","label":"Refresh time","type":"text","html5":"range",ops:{"min":5,"max":60,"step":5,"range-type":"m"}},
                    {"name":"UseAuth","label":"Use authentication","type":"checkbox","hidden":hideAuth},
                    {"name":"username","label":"username","type":"text","hidden":hideAuth},
                    {"name":"password","label":"password","type":"password","hidden":hideAuth},
                    {"name":"Test","label":"test config","type":"button","className":"displayonly",value:"validate","hidden":hideAuth},
                    {"label":"Popup display","type":"title","tag":"h3"},
                    {"name":"SuccessMarker","label":"Use standard blue marker","type":"checkbox"},
                    {"label":"Build radiator display","type":"title","tag":"h3"},
                    {"name":"ColumnCount","label":"Number of cols","type":"text","html5":"range",ops:{"min":1,"max":5,"step":1}},
                    {"name":"DisplayHero","label":"Display hero panel","type":"checkbox"},
                    {"name":"DisplayHeroHTML","label":"Hero panel content","type":"textarea"},
                    {"name":"BackgroundImage","label":"Background image (images by subtlepatterns.com)","type":"select",options:{"none":"no image","carbon_fibre":"carbon fibre","dark_mosaic":"dark mosaic","dark_wood":"dark wood","moulin":"moulin","padded":"padded","simple_dashed":"simple dashed","squares":"squares"}},
                    {"name":"BackgroundColor","label":"Background colour","type":"text","html5":"color"},
                    {"name":"ButtonStyle","label":"Radiator item style","type":"select",options:{"flat":"flat","glossy":"glossy"}},
                    {"label":"Sorting","type":"title","tag":"h4"},
                    {"name":"SortBy","label":"Sort by","type":"select",options:{"name":"name","status":"status"}},
                    {"name":"SortDirection","label":"Invert order","type":"checkbox"},
                    {"label":"Culprit names","type":"title","tag":"h4"},
                    {"name":"ShowCulprits","label":"Show culprit names","type":"checkbox"},
                    {"name":"CulpritRegEx","label":"RegExp (optional)","type":"text"},
                    {"label":"RegExp, long names can be shortened by using a RegExp. e.g. to get the name from an email address you could use '([\\w|\\.]+)@' <br/><a href=http://gskinner.com/RegExr/ target=_blank>RegExp help</a>","type":"title","tag":"p",className:"note"}
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
                if (!target){return true;}
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
                if (!target){return true;}
                if ($(target).attr('type') === 'reset'){
                    e.preventDefault();
                    options.resetForm();
                } else if ($(target).attr('type') === 'checkbox'){
                    options.saveItemValue(target);
                }
            },
            resetForm:function(){
                backgroundPage.mmj.resetLocalStore();
                $('form fieldset').empty();
                options.setupForm();
            },
            setupForm:function(){
                function getOps(ops){
                            if (!ops){return "";}
                            var str = "";
                            for (var name in ops){
                                if (ops.hasOwnProperty(name)){
                                    str+= name +'="'+ ops[name] +'"';
                                }
                            }
                            return str;
                        }
                function getSelectHTML(options,html){
                    for (var name in options){
                        if (options.hasOwnProperty(name)){
                            html += '<option value="'+ name +'">'+ options[name] +'</option>';
                        }
                    }
                    return html;
                }
                for (var i = 0; i<options.ops.input.length; i++){
                    var item = options.ops.input[i],
                        hidden = (item.hidden) ? "hidden" : "",
                        type = item.html5 || item.type || "text",
                        opsStr = getOps(item.ops),
                        value = options.getItemValue(item.name) || item.value || "";

                    if (item.type === "button"){
                            $('form fieldset')
                                .append('<p class="'+hidden+'"><label for="'+item.name+'">'+ item.label +'</label><input class="'+ item.className+'" '+ opsStr +' type="'+ type +'" id="'+ item.name +'" value="'+ value +'" /></p>');
                    } if (item.type === "checkbox"){
                        var checked = value === "true" || value === true ? true : false;
                        $('form fieldset')
                            .append('<p class="option '+hidden+'"><span class="option"><input type="checkbox" id="'+ item.name +'" value="'+ options.getItemValue(item.name) +'" /></span><label for="'+item.name+'">'+ item.label +'</label></p>');
                        $("#"+ item.name).prop('checked', checked );
                    } else if (item.type === "text" || item.type === "password"){
                        if (type === "range"){
                            var t = item.ops["range-type"] || "";
                            $('form fieldset')
                                .append('<p class="'+hidden+'"><label for="'+item.name+'">'+ item.label +' <span id="span'+item.name+'">'+value+'</span>'+t+'</label><input '+ opsStr +' type="'+ type +'" id="'+ item.name +'" value="'+ value +'" /></p>');
                            addRangeListener(item.name);
                        } else {
                            $('form fieldset')
                                .append('<p class="'+hidden+'"><label for="'+item.name+'">'+ item.label +'</label><input '+ opsStr +' type="'+ type +'" id="'+ item.name +'" value="'+ value +'" /></p>');
                        }
                    } else if (item.type === "title"){
                        var tag = item.tag || "h2",
                            className = item.className ? ' class="'+ item.className +'"' : "";
                        $('form fieldset')
                            .append("<"+tag + className +" class="+hidden+">"+ item.label +"</"+tag+">");
                    } else if (item.type === "select"){
                            var html = getSelectHTML(item.options,'');
                            $('form fieldset')
                                .append('<p class="'+hidden+'"><label for="'+item.name+'">'+ item.label +'</label><select '+ opsStr +' type="'+ type +'" id="'+ item.name +'">'+html+'</select></p>');
                            $('#'+ item.name).val(value);
                    } else if (item.type === "textarea"){
                        $('form fieldset')
                            .append('<p class="'+hidden+'"><label for="'+item.name+'">'+ item.label +'</label><textarea '+ opsStr +' id="'+ item.name +'">'+value+'</textarea></p>');
                    }
                }

                function addRangeListener(itmeName){
                    $('#'+itmeName).on('change',function(){
                        $('#span'+itmeName).text( $("#"+itmeName).val() );
                    });
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


    $(function(){
        var section = "#sectionDonate";
        if(true || backgroundPage.mmj.getLocalStore("ge98AA68e8njj9","") === "8977XX-PZ34"){
            section = "#sectionSettings";
        }
        $(document).on('click', "input:not(.displayonly), button:not(.displayonly)", options.handleClick);
        $(document).on('keyup', "input", options.handleKeyup);
        $(document).on('change', "select, input", options.handleValueChange);
        options.init();
        $("nav a").each(function(i,el){
            if ($(this).attr("href") === section){
                $(this).parent("li").addClass("selected");
                return false;
            }
        });
        $('nav a').on('click',options.navigate);
        $("#formDonate").on("submit",function(){
            backgroundPage.mmj.setLocalStore("ge98AA68e8njj9","8977XX-PZ34");
        });
        $(section).removeClass("hidden");



        $(document).on('click', "#Test", function(){
            // anonymous function to test the user config
            var url;
            if ( $("#UseAuth").prop("checked") ){
                url = backgroundPage.mmj.getCleanUrl('api/json');
                if (confirm("Check Jenkins URL with authentication?\n"+ url)){
                    var httpRequest = new XMLHttpRequest(),
                        auth = window.btoa((backgroundPage.mmj.getLocalStore("username") || '') + ':' + (backgroundPage.mmj.getLocalStore("password") || ''));

                    httpRequest.onreadystatechange = function(){
                        if (httpRequest.readyState === 4) {
                            if (httpRequest.status === 200) {
                                var data = JSON.parse(httpRequest.responseText);
                                if (data && data.jobs && data.jobs.length){
                                    alert('Seems OK! : ) ');
                                } else {
                                    alert('Could not login to your Jenkins server');
                                }
                            } else {
                                var s = httpRequest.statusText || httpRequest.status;
                                alert('There was a problem with the request. '+ s);
                            }
                        }
                    };
                    httpRequest.onerror = function(xhr){
                        var s = xhr.statusText || xhr.status || "";
                        alert("Oops-a-daisy, that didn't work! "+ s);
                    };
                    httpRequest.open('GET', url , true);
                    httpRequest.setRequestHeader('Authorization', 'Basic ' + auth);
                    //httpRequest.responseType = "json";
                    httpRequest.send();
                }
            } else {
                url = backgroundPage.mmj.getCleanUrl('api/json');
                if (confirm("Check Jenkins URL without authentication?\n"+ url)){
                    $.ajax({
                        type: 'GET',
                        url: url,
                        // type of data we are expecting in return:
                        dataType: 'json',
                        timeout: 300,
                        success: function(data){
                            if (data && data.jobs && data.jobs.length){
                                alert('Seems OK! : ) ');
                            } else {
                                alert('Sorry, no jobs returned.');
                            }
                        },
                        error: function(xhr, type){
                            var s = xhr.statusText || xhr.status || "";
                            alert("Oops-a-daisy, that didn't work! "+ s);
                        }
                    });
                }
            }
        });
    });

})(window.$, window.chrome, window.document, window);
