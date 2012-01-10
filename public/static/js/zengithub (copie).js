
$.zengithub = function(debugEnabled)
{
	/**
	 * Mode debug ou pas
	 * Lance des TechnicalAlert ou des UserAlerts en fonction du mode
	 * @var bool
	 */
	this.debugEnabled = false;
	/*
	 * Les projets trouvés sur GitHub pour la Suggestion
	 * @var Array
	 */
	this.projectsFound = null;
	/**
	 * Les infos concernant le service web / API GitHub
	 @var Object
	*/
	this.remotingWS = { searchURL : "http://localhost/zengithub/public/gitsearch.php"};
	/**
	 * Autorise ou non l'appel au service GitHub
	 * suivant si le panel d'autocomplete est affiché ou non
	 * @var bool
	 */
	this.allowAjaxCall = true;
	/**
	 * Chercher les infos d'un projet hébergé dans les repositories GitHub
	 * @public
	 *
	 * @param [formData]  nom ou partie du nom du projet recherché
	 * @uses jQuery.ajax()
	 * @uses $.zenDebugger.triggerUserAlert()
	 * @return void 
	 */
	this.searchProject = function searchProject(searchData)
	{
		try
		{
			// Si la saisie compte au moins 3 caractères de type alphanumériques 
			// et qu'il n'agit pas d'un onKeyup déclenché avec les flèches du clavier 
			// alors on peut appeler le service
			// sinon on reste sur le cache-autocomplete
			//console.log('this.allowAjaxCall',this.allowAjaxCall.toString());
			if (this.allowAjaxCall ==true && $('#repository').val().length >=4 && (window.event.keyCode >= 65 && window.event.keyCode <=90)) 
			{
				$.get(this.remotingWS.searchURL+ '?verb=repos&'+searchData.toLowerCase(), {},
					function onSuccessAutoComplete(xhrResponse)
					{
						if ($.type(this.projectsFound)=='undefined') {
							this.projectsFound = [];
						}
						if ($.type(xhrResponse) == 'object') {
							return;
						}
						//liste ds noms de projets pour l'autocomplete
						if (xhrResponse.length > this.projectsFound.length) {
							this.projectsFound = xhrResponse;
						}
						var projectsList = [];
						for (var idx=0; idx < xhrResponse.length;idx++) 
						{
							projectsList.push(xhrResponse[idx].name.toLowerCase());
						}
						
						$("#repository").autocomplete(projectsList, {	width: '400px', 
																		height:'500px', 
																		autoFill: false,  
																		//open: function() { alert('off ajax'); this.allowAjaxCall = false;},
																		//	close:function() { this.allowAjaxCall = true;}
																	});
						console.log('run RPC');
						console.log('searchProject : this.projectsFound.length',this.projectsFound.length);
					}	
				);
			}
			//else if ($('#repository').val().trim().length <3){
			//	$.zenDebugger.triggerUserAlert($.zengithub.UserException.LENGTH_TOO_SHORT);
			//}
		}
		catch (exception)
		{
			// exception de nature technique  : alert uniquement si mode debug
			if (this.debugEnabled== true) {
				alert('exception : '+exception);
			}
		}
	};
	
	/**
	 * Vérifie si une variable est scalaire  
	 * le scope de la verification se limite ici aux type Number et String 
	 *
	 * @private
	 * @param string|number data
	 * 
	 * @uses $.zenDebugger.triggerTechAlert()
	 * @return void
	 * @throws $.zengithub.TechException
	 */
	this.assertIsScalar = function assertIsScalar(data)
	{
		if ($.trim(data).length == 0 || !(/number|string/).test($.type(data).toLowerCase())) {
			$.zenDebugger.triggerTechAlert($.zengithub.TechException.BAD_TYPE); 
		}
	};

	/**
	 * Renvoit un objet Projet d'après son nom (unique)
	 * @param String  	name 	le nom du projet
	 * @return Object
	 */
	this.getProjectByName = function getProjectByName(name)
	{
		name = name.trim().toLowerCase();
		for (var idx in _this.projectsFound)
		{
			if (_this.projectsFound[idx].name.toLowerCase() === name) {
				return _this.projectsFound[idx];
			}
		}
	};
	
	/**
	 * Constructeur
	 * @public
	 * 
	 * @uses jQuery.ajaxSetup()
	 */
	this._construct = function construct(debug)
	{
		$('#repository').focus();
		// Référence à this dans _this pour la gestion des callbacks.
		var _this = this;
		this.debugEnabled = (debug ||false);
		// Configuration globale du composant Ajax de jQuery
		$.ajaxSetup({
			async: false,
			error: 		function onAjaxError(xhrResponse)
						{
							$.zenDebugger.trace('aie aie aie', "onAjaxError");
							//$.zenDebugger.trace(arguments, "onAjaxError");
						},
			type: "GET"
		});
		// exec de la recherche lors de la frappe dans le champ de recherche
		$("input#repository").on("keyup", function(e)
			{
			$(this).val($(this).val().trim());
				_this.searchProject($('form#searchGit').serialize());
			}
		);
		$("#repository").result(function()
			{
			console.log('onResult!');
			console.log('onResult : this.projectsFound.length : ', $.type(_this.projectsFound));
				var ajaxArgs = {
					verb: 'collaborators',
					repository: _this.getProjectByName($(this).val()).owner.login,
					projectName: $(this).val() //'jquery-mobile'//_this.getProjectByName($(this).val()).name
				};
				
				$.get(_this.remotingWS.searchURL+ '?'+ $.param(ajaxArgs), {}, 
					function onSuccessShowCollaborators(xhrResponse)
					{
						if ($.type(xhrResponse) == 'undefined') {
							return;
						}
						for (var idx in xhrResponse)
						{
							console.log(xhrReponse[idx].login);
						}
					}
				);
			}
		);
	};
	this._construct(debugEnabled);
};

/**
 * Les types d'exception possibles
 */
$.zengithub.TechException = {
	BAD_TYPE : "Le type de la variable est incorrect"
};

$.zengithub.UserException = {
	LENGTH_TOO_SHORT: "Merci de saisir au moins 2 caractères pour déclencher la recherche.",
	PLUGIN_MISSING: 'L\'outil de suggestion est introuvable'
};

/**
 * Gestion du debug
 */
$.zenDebugger = 
{
	/**
	 * Utilise la console du plugin Firebug pour Chrome et Firefox pour logger les process
	 * 
	 * @param String	message		le message a afficher dans la console
	 * @param String 	[context]	la fonction qui appelle trace()
	 * @return void
	 */
	trace: function trace(message, context)
	{
	    // Vérifie d'abord la présence du plugin dans le DOM
		if (window.console)
		{
			if ($.type(context) == 'undefined')
				window.console.log(message);
			else
				window.console.log(context, message);
		}
	},
	triggerTechAlert : function triggerTechAlert(message)
	{
		this.trace(message);
		throw message;
	},
	triggerUserAlert : function triggerUserAlert(message)
	{
		alert('exception : '+message);
	}

};

// Lancement de l'application
$(function init()
{
	$('form#searchGit').submit(function(){return false;});
	var zenGit = new $.zengithub(true);
	//zenGit.searchProject($('form#searchGit').serialize());  
});