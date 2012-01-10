$.zengithub = function(config) {
	/**
	 * Mode debug ou pas Lance des TechnicalAlert ou des UserAlerts en fonction
	 * du mode
	 * 
	 * @var bool
	 */
	this.debugEnabled = false;
	/**
	 * Les infos concernant le service web / API GitHub
	 * 
	 * @var Object
	 */
	this.remotingWS = {
		searchURL : "http://localhost/zengithub/public/gitsearch.php"
	};

	this.currentProject = '';

	this.projectsFound = [];

	this.projectCommits = [];

	this.projectCommiters = [];
	this.config = {};
	this.isProjectSelected = false;
	this.UICanvas = null;
	
	this.lastXHR = null;

	/**
	 * Chercher les infos d'un projet hébergé dans les repositories GitHub
	 * 
	 * @public
	 * 
	 * @param [formData]
	 *            nom ou partie du nom du projet recherché
	 * @uses jQuery.ajax()
	 * @uses $.zenDebugger.triggerUserAlert()
	 * @return void
	 */
	this.searchOnServer = function searchOnServer(searchData, callback) {
		try {
			
			if (this.allowAjaxCall() == false) {
				return;
			}
			/*if (this.lastXHR != null) { 
				this.lastXHR.abort();
				return;
			}
			*/
			var _this = this;
			$('img#ajaxLoaderRepository').fadeIn('fast');

			if (searchData.indexOf('=') == -1) {
				searchData = 'repository=' + searchData;
			}
			
			this.lastXHR = $.get(this.remotingWS.searchURL + '?verb=repositories&' + searchData.toLowerCase(), {}, 
			function(xhrRepositories, status, xhr) {
				if (xhr == _this.lastXHR)
				{
					_this.onSuccessAutoComplete(xhrRepositories, searchData, callback);
					$('img#ajaxLoaderRepository').fadeOut('fast');
				}
			});
		} catch (exception) {
			// exception de nature technique : alert uniquement si mode debug
			if (this.debugEnabled == true) {
				alert('exception : ' + exception);
			}
		}
	};
	this.onSuccessAutoComplete = function onSuccessAutoComplete(
			xhrRepositories, searchData, callback) {

		if ($.type(xhrRepositories) != 'array') {
			return;
		}
		var searchValue = searchData.split('=')[1];

		// liste ds noms de projets pour l'autocomplete
		if ($.type(xhrRepositories) == 'array'
				&& ((xhrRepositories.length > 0 && xhrRepositories.length != this.projectsFound.length)
				// || (searchValue.length < this.currentProject.length)
				)) {
			this.projectsFound[searchValue] = xhrRepositories;
			this.currentProject = searchValue.toLowerCase();
			if ($.type(callback) != 'undefined') {
				callback(this.projectsFound[searchValue].length);
			}
		}
		
		var projectsList = [];
		if ($.type(this.projectsFound[searchValue]) == 'array'
				&& this.projectsFound[searchValue].length > 0) {
			for ( var idx = 0; idx < this.projectsFound[searchValue].length; idx++) {
				projectsList.push(this.projectsFound[searchValue][idx].name
						.toLowerCase());
			}
			this.config.searchBox.focus().autocomplete(projectsList, {
				width : '400px',
				height : '500px',
				autoFill : false
			});
			
		}

	};
	this.allowAjaxCall = function(event) {
		var check = ($('#repository').val().length < this.currentProject.length || ($(
				'.ac_results').css('display') != 'block' && this.config.searchBox
				.val().length >= 3));
		var checkEvent = true;
		if ($.type(event) != 'undefined') {
			checkEvent = ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8);
		}
		return (check == true && checkEvent == true);
	};

	/**
	 * Vérifie si une variable est scalaire le scope de la verification se
	 * limite ici aux type Number et String
	 * 
	 * @private
	 * @param string|number
	 *            data
	 * 
	 * @uses $.zenDebugger.triggerTechAlert()
	 * @return void
	 * @throws $.zengithub.TechException
	 */
	this.assertIsScalar = function assertIsScalar(data) {
		if ($.trim(data).length == 0
				|| !(/number|string/).test($.type(data).toLowerCase())) {
			$.zenDebugger.triggerTechAlert($.zengithub.TechException.BAD_TYPE);
		}
	};

	/**
	 * Renvoit un objet Projet d'après son nom (unique)
	 * 
	 * @param String
	 *            name le nom du projet
	 * @return Object
	 */
	this.getRootProject = function getRootProject(childProjectName) {
		for ( var rootProject in this.projectsFound) {
			if ($.type(this.projectsFound[rootProject]) == 'array') {
				for ( var projectName in this.projectsFound[rootProject]) {
					if (this.projectsFound[rootProject][projectName].name == childProjectName) {
						return this.projectsFound[rootProject][projectName];
					}
				}
			}
		}
	};

	/**
	 * Constructeur
	 * 
	 * @public
	 * 
	 * @uses jQuery.ajaxSetup()
	 */
	this._construct = function construct(config) {
		this.config = $.extend( {}, $.zengithub.defaultConfig, config);
		this.config.searchBox.focus();
		// Référence à this dans _this pour la gestion des callbacks.
		var _this = this;
		this.debugEnabled = this.config.debug || false;

		this.UICanvas = new $.zengithub.UICanvas(config);

		// Configuration globale du composant Ajax de jQuery
		$.ajaxSetup( {
			async : true,
			error : function onAjaxError(xhrResponse) {
				$.zenDebugger.trace('aie aie aie', "onAjaxError");
				// $.zenDebugger.trace(arguments, "onAjaxError");
		},
		beforeSend : function() {
			if (   this.isProjectSelected ==false && /contributors/gi.test(arguments[1].url) == true
				|| this.isProjectSelected == true && /projectName/gi.test(arguments[1].url) == true
			) {
				this.isProjectSelected = true;
			}
		},
		type : "GET"
		});

		// exec de la recherche lors de la frappe dans le champ de recherche
		this.config.searchBox.on("keyup", function(event) {
			if (event.keyCode == 8) { // 8 = backspace
				_this.isProjectSelected = false;
				_this.UICanvas.resetUI();
				_this.lastXHR = null;
				if ($('div#UICanvas').css('display') !='none') {
					$('div#UICanvas').hide('fast');
				}
			} 
			else if (_this.allowAjaxCall(event) == true) {
				//if (_this.isProjectSelected === false){
					_this.searchOnServer($(this).serialize());
				//}
			}
		});

		// Charge les infos du projet à la frappe dans la searchBox
		this.config.searchBox.result(function() {
			_this.fillGUI();
		});

		// Vérifie si l'URL est un bookmarke
		// et auto-recherche le projet bookrmarké
		if (this.queryString() !== null) {
			this.autoSearch(this.queryString());
		}
	};
	/**
	 * Chercher un projet GitHub
	 * 
	 * @param String
	 *            projectName le nom du projet
	 * @paral Bool animate animer la frappe dans la searchBoxt
	 * @return void
	 */
	this.searchProject = function searchProject(projectName, animate) {
		var _this = this;
		animate = animate || false;
		// URL bookmarkée : on lance l'automate de recherche
		if (projectName !== null) {
			// saisie automatisée dans la searchBox
			if (animate === false) {
				_this.config.searchBox.val(projectName);
				_this.searchOnServer(projectName, function() {
					_this.fillGUI();
				});
			}
			// simule une frappe au clavier
			else {
				(function(projectName) {
					var counter = 0;
					var intervalID = window.setInterval(
							function typeInConsole() {
								_this.config.searchBox
										.val(_this.config.searchBox.val()
												+ projectName[counter]);
								counter++;
								if (counter == projectName.length) {
									clearInterval(intervalID);
									_this.searchOnServer(projectName,
											function() {
												_this.fillGUI();
											});
								}
							}, _this.config.autoWriteSpeed);
				})(projectName);
			}
		}
	};
	this.autoSearch = function autoSearch(projectName) {
		this.searchProject(projectName, true);
	};

	this.fillGUI = function fillGUI() {
		var _this = this;
		this.UICanvas.resetUI();
		(function fetchContributors() {
			var project = _this.getRootProject(_this.config.searchBox.val());
			if ($.type(project) == 'undefined') {
				return;
			}
			$('img#ajaxLoaderCommitters').fadeIn('fast');
			var ajaxArgs = {
				verb : 'contributors',
				repository : _this.currentProject,// project.owner.login,
				projectName : _this.config.searchBox.val()
			};

			$
					.get(
							_this.remotingWS.searchURL + '?'
									+ $.param(ajaxArgs),
							{},
							function showContributors(xhrContributors) {
								if ($.type(xhrContributors) == 'array') {
									// On update le titre H2 des commiters
									_this.UICanvas.listCommitters.title
											.html('(' + xhrContributors.length.toString() + ')');

									$('table#gridCommiters',_this.UICanvas.listCommitters.placeholder).remove();
									var gridCommiters = $('<table class="datagrid" id="gridCommiters"/>');
									_this.UICanvas.listCommitters.placeholder.append(gridCommiters);

									// On remmplit le tableau des committers
									var rows = [];
									for ( var idx in xhrContributors) {
										var contributor = xhrContributors[idx];
										rows.push('<tr id="' + contributor.login + '">');
										rows.push('<td class="avatar"><img src="'+contributor.avatar_url+'" alt="'+ contributor.login+ '"/></a></td>');
										//rows.push('<td class="avatar"><a href="'+ contributor.url+ '" target="_blank"><img src="/zengithub/public/images/noface.png" alt="'+ contributor.login+ '"/></a></td>');
										rows.push('<td class="commiter">' + contributor.login + '</td>');
										rows.push('<td class="count">' + contributor.contributions + '</td>');
										rows.push('</tr>');
									}
									gridCommiters.append(rows.join(' '));

									// entete du tableau
									$('div#datagridHeader', _this.UICanvas.listCommitters.placeholder).remove();
									$('<div id="datagridHeader"/>')
											.append($('<div class="header committer" title="Contributeur">Contributeur</div>'))
											.append($('<div class="header count" title="Nombre de commits">Nombre</div>'))
											.insertBefore(_this.UICanvas.listCommitters.placeholder);
								}
								$('img#ajaxLoaderCommitters').fadeOut('fast');
							});
		})();

		(function fetchCommits(_this) {
			$('img#ajaxLoaderCommits').ajaxStart(function() {
				$(this).fadeIn('fast');
			});
			var ajaxArgs = {
				verb : 'commits',
				repository : _this.currentProject,
							// _this.getProjectByName(searchData).owner.login,
				projectName : _this.config.searchBox.val()
			};
			$.get(_this.remotingWS.searchURL + '?' + $.param(ajaxArgs), {},
				function onSuccessBuildCommitsGraphs(xhrCommits) 
				{
					var commitData = _this.buildListofCommiters(xhrCommits);
					// titre H2 de la répartition des commits
					$('#commitsCount').html('(' + commitData.totalCommits.toString() + ' derniers)');
					// On crée les données pour le graphique
					var graphData = [];
					for ( var idx3 = 0; idx3 < commitData.graphCommiters.length; idx3++) {
						graphData.push( ['<b>'+ commitData.graphCommiters[idx3].author.login+ '</b> '+ Math.round((commitData.graphCommiters[idx3].nbCommits / commitData.totalCommits) * 100)+ '%', 
						                 Math.round((commitData.graphCommiters[idx3].nbCommits / commitData.totalCommits) * 100) ]);
					}

					// On génèrele graphique SVG
					(function showCommitAllocationGraph(graphData, totalCommits, config) 
					{
						_this.UICanvas.graphCommitsRepartition = new Highcharts.Chart(
								{
									chart : {
										renderTo : config.placeholder,
										plotBackgroundColor : null,
										plotBorderWidth : null,
										plotShadow : false
									},
									title : {
										text : 'Part de chaque commiter dans ce projet'
									},
									tooltip : {
										formatter : function() {
											return this.point.name;
										}
									},
									plotOptions : {
										pie : {
											allowPointSelect : true,
											cursor : 'pointer',
											dataLabels : {
												enabled : true,
												color : Highcharts.theme.textColor || '#000000',
												connectorColor : Highcharts.theme.textColor || '#000000',
												formatter : function() {
													return this.point.name;
												}
											}
										}
									},
									series : [ {
										type : 'pie',
										name : 'Répartition',
										data : graphData
									} ]
								});
	
					})(graphData, commitData.totalCommits, _this.UICanvas.commits);

					(function buildCommitsTimeline(xhrCommits, config) 
					{
						var liste = [];
						for ( var idx = 0; idx < xhrCommits.length; idx++) {
							var dateCommit = xhrCommits[idx].commit.committer.date
									.split('T')[0];
							if ($.type(liste[dateCommit]) == 'undefined') {
								liste[dateCommit] = 0;
							}
							liste[dateCommit]++;
						}
						// liste = liste.reverse();
						var xAxisValues = [];
						var gValues = [];
						var loop = 0;
						var dateBounds = [];
						for ( var _date in liste) {
							var dateString = _date.split('-').reverse().join('/');
							dateBounds.push(dateString);
							xAxisValues.push((loop % 7 == 1) ? dateString: '');
							gValues.push(liste[_date]);
							loop++;
						}
						
						var gValues = gValues.reverse();
						var xAxisValues = xAxisValues.reverse();
	
						_this.UICanvas.timeline.title.html('(du '
								+ dateBounds.shift() + ' au '
								+ dateBounds.pop() + ')');
	
						_this.UICanvas.graphTimeline = new Highcharts.Chart(
								{
									chart : {
										renderTo : config.placeholder,
										defaultSeriesType : 'line',
										marginRight : 130,
										marginBottom : 25
									},
									plotOptions : {
										line : {
											dataLabels : {
												enabled : true
											},
											enableMouseTracking : true
										}
									},
									title : {
										text : '',
										x : -20
									// center
									},
									xAxis : {
										categories : xAxisValues
									},
									yAxis : {
										title : {
											text : 'Nombre de commits'
										},
										plotLines : [ {
											value : 0,
											width : 1,
											color : '#808080'
										} ]
									},
									tooltip : {
										formatter : function() {
											return '<b>'
													+ this.series.name
													+ '</b><br/>'
													+ this.x + ': '
													+ this.y + 'Â°C';
										}
									},
									legend : {
										layout : 'vertical',
										align : 'right',
										verticalAlign : 'top',
										x : -10,
										y : 100,
										borderWidth : 0
									},
									series : [ {
										name : 'commits',
										data : gValues
									} ]
								});
					})(xhrCommits, _this.UICanvas.timeline);
					
					$('img#ajaxLoaderCommits').fadeOut('fast');
			});
		})(_this);

	};

	this.buildListofCommiters = function buildListofCommiters(XHRCommits) {
		var graphCommiters = [];
		// var nbCommits = 0;
		var nbCommiters = 0;
		var totalCommits = 0;
		var passedCommiters = [];
		// On crée le référentiel de tous les commiters du projet
		for ( var idx in XHRCommits) 
		{
			if (XHRCommits[idx].author === null || $.inArray(XHRCommits[idx].author.login, passedCommiters) > -1) {
				continue;
			} 
			else 
			{
				XHRCommits[idx].nbCommits = 0;
				passedCommiters.push(XHRCommits[idx].author.login);
				graphCommiters.push(XHRCommits[idx]);
				nbCommiters++;
			}
		}
		
		function allocateCommitsOnAllCommiters(XHRCommits, graphCommiters,
				totalCommits) {
			// On parcourre les 100 commits les plus récents
			var nbLoops = XHRCommits.length > 100 ? 100 : XHRCommits.length;
			for ( var idx = 0; idx < nbLoops; idx++) {
				totalCommits++;
				// nombre de commits par commiter
				for ( var idx2 = 0; idx2 < graphCommiters.length; idx2++) 
				{
					if (XHRCommits[idx].author === null) {
						continue;
					}
					if (XHRCommits[idx].author.login == graphCommiters[idx2].author.login) {
						graphCommiters[idx2].nbCommits++;
						break;
					}
				}
			}
			return {
				XHRCommits : XHRCommits,
				graphCommiters : graphCommiters,
				totalCommits : totalCommits
			};
		}
		;
		return allocateCommitsOnAllCommiters(XHRCommits, graphCommiters,
				totalCommits);
	};
	/**
	 * Récupères une valeur en GET
	 * 
	 * @param key
	 * @return
	 */
	this.queryString = function queryString() {
		if (location.href.indexOf('q/') > -1) {
			return location.href.split('q/').pop();
		}
		return null;
	};

	this._construct(config);
};

$.zengithub.defaultConfig = {
	autoWriteSpeed : 150
};

$.zengithub.UICanvas = function UICanvas(config) {
	for ( var key in config) {
		this[key] = config[key];
	}
	this.graphCommitsRepartition = null;
	this.graphTimeline = null;

	this.resetUI = function resetUI() {
		$('#UICanvas').fadeIn('fast');
		this.listCommitters.title.html('');
		$('table#gridCommiters', this.listCommitters.placeholder).remove();
		$('#datagridHeader', this.listCommitters.placeholder.parent()).remove();

		$('#' + this.commits.placeholder).html('');
		if (this.graphCommitsRepartition !== null
				&& "destroy" in this.graphCommitsRepartition) {
			this.graphCommitsRepartition.destroy();
		}

		this.timeline.title.html('');
		if (this.graphTimeline !== null && "destroy" in this.graphTimeline) {
			this.graphTimeline.destroy();
		}
	};
};

$.zengithub.ProjectCache = function ProjectCache() {
	this.commiters = [];
	this.commits = [];

	this.addToCommiters = function addToCommiters(commiter) {
		if ($.type(commiter) == 'object') {
			this.commiters.push(commiters);
		}
	};
	this.addToCommits = function addToCommits(commit) {
		if ($.type(commit) == 'object') {
			this.commits.push(commit);
		}
	};
};

/**
 * Les types d'exception possibles
 */
$.zengithub.TechException = {
	BAD_TYPE : "Le type de la variable est incorrect"
};

$.zengithub.UserException = {
	LENGTH_TOO_SHORT : "Merci de saisir au moins 2 caractères pour déclencher la recherche.",
	PLUGIN_MISSING : 'L\'outil de suggestion est introuvable'
};

/**
 * Gestion du debug
 */
$.zenDebugger = {
	/**
	 * Utilise la console du plugin Firebug pour Chrome et Firefox pour logger
	 * les process
	 * 
	 * @param String
	 *            message le message a afficher dans la console
	 * @param String
	 *            [context] la fonction qui appelle trace()
	 * @return void
	 */
	trace : function trace(message, context) {
		// Vérifie d'abord la présence du plugin dans le DOM
	if (window.console) {
		if ($.type(context) == 'undefined')
			window.console.log(message);
		else
			window.console.log(context, message);
	}
},
triggerTechAlert : function triggerTechAlert(message) {
	this.trace(message);
	throw message;
},
triggerUserAlert : function triggerUserAlert(message) {
	alert('exception : ' + message);
}

};