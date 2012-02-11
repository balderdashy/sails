<?php
/**
 * CRUD.io
 * PHP SDK
 * c. Michael McNeil 2012
 * 
 * TODO: Use a server-wide cache to store non-secure requests to
 *		the Content Cloud.  Only refresh a node if it goes stale.
 *
 */
class CRUD
{
	// Create empty page cache
	private $cache = array();

	public function  __construct($options=null) {

		if (isset($options) && isset($options['url'])) {
			$this->url = $options['url'];

			// Immediately load the relevant content for this page
			$this->load();
		}
		else {
			throw new Exception (
				'No CRUD.io Content Cloud specified.' .
				'Please specify a "url" option in the SDK configuration.');
		}
	}


	/**
	 * Request a node from the Content Cloud.
	 *
	 * NOTE:
	 * This is a safe way of accessing the functionality of CRUD.get, since
	 * it prevents accessing nodes which were not already fetched on CRUD.io's
	 * initialization.
	 *
	 * @param <type> $node
	 * @param <type> $dontEcho
	 * @return <type>
	 */
	public function read($node, $dontEcho=false) {
		// Check cache first
		if (isset($this->cache[$node])) {
			$type = $this->cache[$node]['type'];
			$payload = $this->cache[$node]['payload'];
		}
		else {
			$type = 'text';
			$payload =
				"The node ('$node') was not loaded. ".
				"Make sure it is included in your CMS, ".
				"or force another load with crud.get.";
		}

		return $this->output($payload,$type,$dontEcho);
	}
	

	/**
	 * Request a node from the Content Cloud.
	 *
	 * WARNING:
	 * Make sure you're only accessing nodes which are included in this
	 * page, collection or layout.  Otherwise, this is an inefficient method
	 * of accessing data since you're hitting your Content Cloud for each
	 * payload.
	 *
	 * @param <type> $node
	 * @param <type> $dontEcho
	 * @return <type>
	 */
	public function get($node, $dontEcho=false) {
		
		// Check cache first
		if (isset($this->cache[$node])) {
			$type = $this->cache[$node]['type'];
			$payload = $this->cache[$node]['payload'];
		}
		else {
			// If the node isn't in the cache, request it from Content Cloud
			$readObject = $this->request('read',$node);

			if (!$readObject['success']) {
				// Handle errors
				$type = 'text';
				$payload = $readObject['error']['message'];
			}
			else {
				// Return requested node
				$type = $readObject['content'][$node]['type'];
				$payload = $readObject['content'][$node]['payload'];
			}
		}

		return $this->output($payload,$type,$dontEcho);
	}


	/**
	 * Called automatically during the initialization.
	 * Loads applicable nodes from the Content Cloud.
	 *
	 * @param <type> $node
	 * @param <type> $dontEcho
	 * @return <type>
	 */
	public function load($collection=null) {
		$loadObject = $this->request('load',$collection);

		if (!$loadObject['success']) {
			// Handle errors
			throw new Exception($loadObject['error']['message']);
		}
		else {
			// Update cache with any changes/new nodes
			$this->cache = array_merge($this->cache,$loadObject['content']);
		}
	}
	

	/**
	 * Make a request to the CRUD.io Cloud Server
	 */
	private function request($method, $parameter=null) {

		// Generate API URL from request
		// TODO: check if http(s) exists and delete if necessary
		// TODO: check if trailing slash exists on url and delete if necessary
		$url = $this->url . "/".$method."/" . $this->urlEscape($parameter);

		$file = fopen ($url, "r");
		if (!$file) {
			$response = $this->buildError("Unable to access Content Cloud.");
		}
		else {
			$buffer = "";
			while (!feof ($file)) {
				$buffer .= fgets ($file, 1024);
			}
			fclose($file);

			// Decode JSON response from server
			$response = json_decode($buffer,true);
			if (!$response) {
				$response = $this->buildError("Unable to parse content request.");
			}
		}
		
		// Return response object
		return $response;
	}



	/**
	 * Output payload differently depending on content-type and dontEcho flag
	 */
	private function output($payload,$type='text',$dontEcho=false) {

		// TODO: handle images
		// TODO: support other types of media and other HTML <elements>
		// TODO: support data URI with BSON

		// Escape HTML inside payload if type=='text'
		$payload = ($type=='text') ? htmlentities($payload) : $payload;

		// Output or return $payload
		if ($dontEcho) {
			return $payload;
		}
		else {
			echo $payload;
		}
	}

	// Escape a parameter for use in the request URL
	private function urlEscape ($parameter) {
		// Replace spaces with dashes
		$parameter = str_replace(" ","-",$parameter);

		// Crud.io nodes are case insensitive
		$parameter = strtolower($parameter);

		// Encode naughty characters
		return urlencode($parameter);
	}



	/**
	 * @param String $msg
	 * @return error object
	 */
	private function buildError($msg) {
		return array(
			'success' => false,
			'error' => array(
				'message' => $msg
			)
		);
	}
}
?>