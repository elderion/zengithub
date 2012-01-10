<?php
//On charge la classe métier
require_once realpath(__DIR__.'/../').'/services/GitHubSearch.php';
// On importe le package des services
use ZenGitHub\Services;

try
{
	// On instancie le service de recherche Git
	$gitSearch = new ZenGitHub\Services\GitHubSearch();
	//  On execute la recherche distante
	$gitSearch->searchProject(	Services\HTTPService::queryString('verb'),
								Services\HTTPService::queryString('repository'),
								Services\HTTPService::queryString('projectName') 
								);
	// On envoit la réponse JSON dans le stream HTTP
	$gitSearch->handleResponse();
}
catch(ZenGitHub\Services\Exceptions\GitHubSearchException $e)
{
	echo $e->toString();
}
?>