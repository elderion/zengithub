<?php
namespace ZenGitHub\Services;

abstract class HTTPService
{
	/**
	 * Renvoit la valeur d'un paramètre de la QueryString /GET
	 * 
	 * @param string $key
	 * @return string|null
	 */
	public static function queryString($key)
	{
		if (!array_key_exists($key, $_GET))
			return null;
		if (is_scalar($_GET[$key]))
			return addslashes(strip_tags($_GET[$key]));
		else 
			return $_GET[$key];
	}
	public static function queryKey($index)
	{
		$keys = array_keys($_GET);
		if (array_key_exists($index, $keys))
			return $keys[$index];
		return null;
	}
}