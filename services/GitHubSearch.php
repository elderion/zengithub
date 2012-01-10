<?php
namespace ZenGitHub\Services;
use ZenGitHub\Services\Exceptions;

require_once __DIR__.'/HTTPService.php';
require_once __DIR__.'/Exceptions/GitHubSearchException.php';

class GitHubSearch extends HTTPService
{
	/**
	 * L'adresse du service web deRecherche de GitHub
	 * @private const
	 * @var String
	 */ 
	private static $GIT_SEARCH_URL = 'https://api.github.com'; 
	//'http://github.com/api/v2/json/repos/search/';
	/**
	 * Précision sur le format d'échange Git
	 */
	private static $GIT_STREAM_TYPE = 'JSON';
	/**
	 * liste possible des états
	 * @var enum
	 */
	const STATE_TESTING = 'testing';
	const STATE_STABLE = 'stable';
	/**
	 * Pointeur de la connexion cURL
	 * @var resource
	 */
	private $_curlHandler = null;
	/**
	 * Retour de réponse cURL
	 * @var String|false
	 */
	private $_curlResponse = null;
	/**
	 * L'action WS à executer
	 * @var String
	 */
	private $_verb = null;
	/**
	 * Le nom  du projet
	 * @var String
	 */
	private $_repository = null;
	/**
	 * Le user par défaut du projet
	 * 
	 * @var String
	 */
	private $_projectName = null;
	/**
	 * Cherche le nom d'un projet dans les repositories de GitHub
	 * 
	 * @param String 					$pattern 	le nom du projet à chercher
	 * @param enum('testing', stable') 	$status  	état du projet
	 * @param array 					$filter	 	filtres additionnels
	 * 
	 * @uses GitHubSearch::assertCurlHandle()
	 * @uses GitHubSearch::initConn()
	 * @uses GitHubSearch::buildQuery()
	 * 
	 * @return string JSON
	 * @throws Exception
	 */
	public function searchProject($verb, $repository, $projectName = null)
	{
		if (!is_scalar($repository)) {
			throw new Exceptions\GitHubSearchException('le pattern de recherche doit etre alphanumérique');
		}
		$this->_verb = $verb;
		$this->_repository = $repository;
		$this->_projectName = $projectName;
		
		/*
		$cacheFile = __DIR__."/{$this->_repository}.{$this->_verb}.json";
		//die('cxachefile : '.$cacheFile);
		error_log($cacheFile.' -> '.((int)is_file($cacheFile)));
		if (is_file($cacheFile)) {
			$data = file_get_contents($cacheFile); 
			$this->sendHTTPHeaders($data);
			die($data);
		}
		*/
		//else { 
			// Dans notre contexte, $pattern est déjà nettoyé par HTTPService, nul besoin de réitérer l'opération
			// Dans un contexte différent, il faudrait appliquer le nettoyage ici
			$this->initConn();
			$this->buildQuery();
			$this->_curlResponse = curl_exec($this->_curlHandler);
		//}
	}
	/**
	 * Gère la réponse cURL
	 * 
	 * @param String|bool $response
	 * @uses GitHubSearch::triggerError()
	 * @uses GitHubSearch::sendData()
	 * @return void
	 */
	public function handleResponse()
	{
		if($this->_curlResponse === false)
		{
			// réponse en erreur : on renvoit les infos d'erreur dans le flux HTTP 
			$this->triggerError();
		}
		else
		{
			// réponse : on renvoit la réponse dans le flux HTTP
			$this->sendData($this->_curlResponse);
		}
	}
	/**
	 * Renvoit les données JSON dans le flux de sortie de HTTP en retour
	 * @param unknown_type $jsonData
	 * 
	 * @return void
	 */
	private function sendData($data)
	{
		// On libère la connexion
		$this->closeConn();
		// On type le format de retour
		$this->sendHTTPHeaders($data);
		// Lecture de la chaine JSON dans le flux HTTP
		die($data);
	}
	/**
	 *  Renvoi du type MIME pour déclarer le type du format d'échange
	 *  + force le rafraichissement du cache
	 *  
	 *  @return void
	 */
	private function sendHTTPHeaders($data, array $moreHeaders = array())
	{
		header('Content-type: application/json');
		header("Content-Length: " . strlen($data));
		header("Expires: ".date(DATE_RFC822, time()) ); 
		header("Cache-Control: no-cache, must-revalidate"); 
		header("Pragma: no-cache");
		if (count($moreHeaders) >0)
		{
			foreach ($moreHeaders as $headerType => $value) {
				header("{$headerType}: {$value}");		
			}
		}
	}
	/**
	 * Renvoit les données d'erreur toujours en JSON dans le flux de sortie HTTP en retour
	 * 
	 * @uses GitHubSearch::closeConn()
	 * @uses GitHubSearch::senData();
	 */
	private function triggerError()
	{
		$jsonError = array('isError' => true, 'details' => curl_error($this->_curlHandler));
		$this->closeConn();
		$this->sendData(json_encode($jsonError, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE));
	}
	/**
	 * Construit l'URL pour la recherche, dans le format attendu par l'API
	 * @param String $pattern
	 * @return String
	 */
	private function buildQuery()
	{
		$argVerb = '';
	
		switch ($this->_verb)
		{
			case 'repositories' : 
				$argVerb = "/users/{$this->_repository}/repos";
				break;
			case 'contributors' :
			case 'commits':
				$argVerb = "/repos/{$this->_repository}/{$this->_projectName}/{$this->_verb}?per_page=100";
				break;
		}
		$searchQuery = self::$GIT_SEARCH_URL . $argVerb;
		//error_log('url github: '.$searchQuery);
		//echo $searchQuery;
		curl_setopt($this->_curlHandler, CURLOPT_URL, $searchQuery);
	}
	/**
	 * Crée et configure la connexion cURL
	 * 
	 * @uses curl_*()
	 * @uses GitHubSearch::assertCurlHandle
	 * @return void');
	 * @throws Exception
	 */
	private function initConn()
	{
		// Initialisation de la ressource cURL
		$this->_curlHandler = curl_init();
		// On définit l'URL a interroger
		// La réponse doit etre retournée et pas affichée
		curl_setopt($this->_curlHandler, CURLOPT_RETURNTRANSFER, true);
		// cURL ne doit pas retourner les header HTTP (seul le body nous intéresse)
		
		curl_setopt($c, CURLOPT_USERAGENT, "yiiext.components.github-api (v 0.5dev)");
		curl_setopt($c, CURLOPT_TIMEOUT, 30);

		curl_setopt($c, CURLOPT_HEADER, $header); // returns header in output
		curl_setopt($c, CURLOPT_FOLLOWLOCATION, true);
		
		// Avant de finir on vérifie l'intégrité de la ressource cURL
		$this->assertCurlHandle();
	}
	/**
	 * Libère la connexion cURL
	 * 
	 * @uses GitHubSearch::assertCurlHandle()
	 * @uses curl_close()
	 * 
	 * @¶eturn void
	 */
	private function closeConn()
	{
		if ($this->assertCurlHandle())
		/*On ferme la ressource*/ 
		curl_close($this->_curlHandler);
	}
	/**
	 * Vérifie que le pointeur cURL est valide
	 * @throws Exception
	 */
	private function assertCurlHandle()
	{
		if (! is_resource($this->_curlHandler)) {
			throw new GitHubException('Le pointeur cURl est invalide');
		}
	}
	/**
	 * Nettoie et sécurise les données de recherche
	 * @param String $data
	 */
	private function cleanData(& $data)
	{
		$data = addslashes(strip_tags($data));
	}
	
}