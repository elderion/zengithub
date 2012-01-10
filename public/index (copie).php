<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
	<link rel="stylesheet" type="text/css" href="static/css/zengithub.css" />
	<link rel="stylesheet" type="text/css" href="static/css/jquery.autocomplete.css" />
	<link rel="stylesheet" type="text/css" href="/highslide/highslide.css" />
	<!-- link rel="stylesheet" type="text/css" h});ref="static/css/thickbox.css" /--->
	
</head>
<body>
	<h1>Chercher un projet sur GitHub</h1>
	<form action="#" method="get" id="searchGit">
		<div>
			<label for="project">Nom du projet</label><input type="text" id="repository" name="repository" autocomplete="off" />
		</div>
		<!--  div>
			<label for="state">Etat</label> 
			<select id="state" name="state">
				<option value="testing" selected="selected">Testing</option>
				<option value="stable">Stable</option>
			</select>
		</div-->
	</form>
	
	<div id="areaCommiters">
		<h2>Les collaborateurs du projet <span class="projectName"></span></h2>
		<div class="datagrid"></div>
		<h2>Répartition des commits</h2>
	</div>
		<div id="container" class="highcharts-container" style="height:410px; margin: 0 2em; clear:both; min-width: 600px"></div>
	
	
	
	<!-- jQuery Core -->
	<script type="text/javascript" src="static/js/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="static/js/jquery-ui-1.8.custom.min.js"></script>
	<!-- script type="text/javascript" src="static/js/zengithub.js"></script-->
	<!-- /jQuery Core -->
	<!-- jquery:autocomplete -->
	<script type='text/javascript' src="static/js/jquery.ajaxQueue.js"></script>
	<script type='text/javascript' src="static/js/thickbox-compressed.js"></script>
	<script type='text/javascript' src="static/js/jquery.autocomplete.js"></script>
	<!-- /jquery:autocomplete -->
	<script type="text/javascript" src="static/js/highcharts.js"></script>
	<script type="text/javascript" src="static/js/exporting.js"></script>
	<!-- Highslide code-->
	<script type="text/javascript" src="static/js/highslide-full.min.js"></script>
	<script type="text/javascript" src="static/js/highslide.config.js" charset="utf-8"></script>
	<!-- /Highslide code -->
	
	<script type="text/javascript">

		var chart;
		jQuery(document).ready(function() {
			chart = new Highcharts.Chart({
				chart: {
					renderTo: 'container',
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false
				},
				title: {
					text: 'Browser market shares at a specific website, 2010'
				},
				tooltip: {
					formatter: function() {
						return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
					}
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: true,
							color: Highcharts.theme.textColor || '#000000',
							connectorColor: Highcharts.theme.textColor || '#000000',
							formatter: function() {
								return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
							}
						}
					}
				},
			    series: [{
					type: 'pie',
					name: 'Browser share',
					data: [
						['Firefox',   45.0],
						['IE',       26.8],
						{
							name: 'Chrome',    
							y: 12.8,
							sliced: true,
							selected: true
						},
						['Safari',    8.5],
						['Opera',     6.2],
						['Others',   0.7]
					]
				}]
			});
		});
	</script>
	
	
    
</body>
</html>