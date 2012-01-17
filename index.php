<?php
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






<?php
//
// CRUD.io Configuration
//

$crud = new CRUD(array(
	// options
));

// The URL of your CRUD.io server instance
$crud->url = "http://dev.chatkin.com/crud.io";

?>






<!DOCTYPE html>
<html>
	<head>
		<title><?= $crud->read('title')?></title>
	</head>
	<body>
		<h1 class="main-title"><?php $crud->dump('title'); ?></h1>
		<?= $crud->read('navbar')?>
		<div class="content">
			<?= $crud->read('content-header')?>
		</div>
		<?= $crud->read('footer')?>
	</body>
</html>