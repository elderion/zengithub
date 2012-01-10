<?php
namespace ZenGitHub\Services\Exceptions;
/**
 * Exception dédiée au serice GitHubSearch
 * @author Joris GROUILLET
 *
 */
class GitHubSearchException extends \Exception
{
	public function toString()
	{
		$this->sendHTTPExceptionHeaders();
		return json_encode($this->getMessage());
	}
	private function sendHTTPExceptionHeaders()
	{
		header('Content-type: application/json');
		header("Content-Length: " . strlen($data));
		header("Expires: ".date(DATE_RFC822, time()) ); 
		header("Cache-Control: no-cache, must-revalidate"); 
		header("Pragma: no-cache");
	}
}