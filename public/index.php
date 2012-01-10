
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "xhtml11.dtd">

<html debug="true">
<head>
<title>Highcharts Demo Gallery</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--  meta http-equiv="X-UA-Compatible" content="chrome=1" -->
<link rel="stylesheet" type="text/css" href="static/css/zengithub.css" />
<link rel="stylesheet" type="text/css" href="static/css/jquery.autocomplete.css" />


</head>
<body>

<h1>Chercher un projet sur GitHub</h1>
	<form action="#" method="get" id="searchGit">
		<div>
			<label for="repository">Nom du projet</label><input type="text" id="repository" name="repository" autocomplete="off" />
			<img src="images/ajax-loader.gif" class="ajax-loader" id="ajaxLoaderRepository" alt="requête serveur en cours..." />			
		</div>
		<!--  div>
			<label for="state">Etat</label> 
			<select id="state" name="state">
				<option value="testing" selected="selected">Testing</option>
				<option value="stable">Stable</option>
			</select>
		</div-->
	</form>
	<div id="UICanvas">
		<hr />
		<div id="areaCommiters" class="slot">
			<h2>Les contributeurs à ce projet <span id="collabsCount"></span></h2>
			<div class="slotAjaxLoader"><img src="images/ajax-loader.gif" class="ajax-loader" id="ajaxLoaderCommitters" alt="requête serveur en cours..." /></div>
			<div id="datagridHeader"></div>
			<div class="datagrid"></div>
		</div>
		<div id="areaGraphs" class="slot">
			<h2>Répartition des commits <span id="commitsCount"></span></h2>
			<div class="slotAjaxLoader"><img src="images/ajax-loader.gif" class="ajax-loader" id="ajaxLoaderCommits" alt="requête serveur en cours..." /></div>
			<div id="container" style="height: 300px;width: 600px"></div>
		</div>
		<div style="clear:both"></div>
		<div id="areaTimeline" class="slot">
			<h2>Timeline des commits <span id="timelineDateRange"></span></h2>
			<div id="timeline" class="highcharts-container" style="height:200px; margin: 0 2em; clear:both; min-width: 600px"></div>
		<br /><br /><br />
		</div>
	</div>

	<script type="text/javascript" src="static/js/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="static/js/zengithub.js"></script>
	<script type='text/javascript' src="static/js/jquery.autocomplete.js"></script>
	<script type="text/javascript" src="static/js/highcharts.js"></script>
	<script type="text/javascript" src="static/js/exporting.js"></script>
	<script type="text/javascript">
	Highcharts.theme = { colors: ['#4572A7'] };// prevent errors in default theme
	var highchartsOptions = Highcharts.getOptions(); 
	var highchartsOptions = null;

	var example = 'pie-basic';
	var theme = 'default';

	
	// Lancement de l'application
	$(document).ready(function(){
		//jQuery.noConflict();
		example = 'pie-basic';
		theme = 'default';
		Highcharts.theme = { colors: ['#4572A7'] };// prevent errors in default theme
		highchartsOptions = Highcharts.getOptions(); 

		$('form#searchGit').submit(function(){return false;});
		var zenGit = new $.zengithub({	searchBox: $('input#repository'), 
										listCommitters: {
											title: $('#collabsCount'),
											placeholder: $('.datagrid', $('#areaCommiters'))
										},
										commits: {
											title: $('#commitsCount'),
											placeholder: 'container'
										},
										timeline: {
											title: $('#timelineDateRange'),
											placeholder: 'timeline'
										},
										debug: true});
		//zenGit.searchProject('symfony');		  
	});
	</script>
</body>
</html>