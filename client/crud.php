<?php
/**
 * Description of crud
 *
 * @author mike
 */
class CRUD
{
	public function read($node) {
		$output = "";

		//
		//TODO: check for http(s)
		$url = $this->url . "/read/" . $node;
//		$url = "http://" . $this->url . "/read/" . $node;

		$file = fopen ($url, "r");
		if (!$file) {
			echo "<p>Unable to open remote file.\n";
			exit;
		}
		while (!feof ($file)) {
			$output .= fgets ($file, 1024);
		}
		fclose($file);
		return $output;
	}

	public function dump($node) {
		echo $this->read($node);
	}
}
?>