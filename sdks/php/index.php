<?php
	// Get and start up crud SDK
	require('crud.php');
$crud = new CRUD(array(
	// The URL of your CRUD.io server instance
	'url' => "http://localhost:4000"
));
?><!DOCTYPE html>
<html>
	<head>
		<title><?php $crud->read('heading') ?></title>
	</head>
	<body>
		<h1 class="main-title"><?php $crud->read('heading') ?></h1>
		<?php $crud->read('navbar')?>
		<div class="content">
			<?php $crud->read('heading')?>
		</div>
		<?php $crud->read('headding')?>
	</body>
</html>