/**
 * @author patcla
 */
const DEBUG = true;
const STATUSES = {
    '': 0,
    'undefined': 0,
    'aborted': 0,
    'aborted_anime': 0,
    'disabled': 0,
    'disabled_anime': 0,
    'grey': 0,
    'grey_anime': 0,
    'blue': 1,
    'blue_anime': 1,
    'yellow': 2,
    'yellow_anime': 2,
    'red': 3,
    'red_anime': 3
}
const DEFAULT_VALUES = {
	"Background":"true"
	,"BackgroundColor":"rgb(0,0,0)"
	,"BackgroundImage":"squares"
    ,"ButtonStyle":"glossy"
	,"ColumnCount":3
	,"CulpritRegEx":""
	,"DisplayHero":"true"
	,"DisplayHeroHTML":'<h1>Jenkins build monitor</h1><p>For more in formation on Jenkins <a rel="nofollow" class="external-link" target="_blank" href="http://jenkins-ci.org/">http://jenkins-ci.org/</a></p><ul><li><a target="_blank" title="Meet Jenkins" href="https://wiki.jenkins-ci.org/display/JENKINS/Meet+Jenkins">Meet Jenkins</a></li><li><a target="_blank" title="Use Jenkins" href="https://wiki.jenkins-ci.org/display/JENKINS/Use+Jenkins">Use Jenkins</a></li><li><a target="_blank" title="Extend Jenkins" href="https://wiki.jenkins-ci.org/display/JENKINS/Extend+Jenkins">Extend Jenkins</a></li></ul>'
	,"JenkinsURL":"http:// my Jenkins url"
	,"JenkinsView":"All"
    ,"JenkinsViews":'[{"title":"My title","url":"http:// my jenkins /path/to/view"}]'
	,"password":""
    ,"pollinterval":30
	,"RefreshTime":15
	,"UseAuth":false
	,"username":""
	,"ShowCulprits":"true"
    ,"SortBy":"name"
	,"timeout": 200000 // 20 seconds
    ,"TESTVALUE": "ABC"
}

