<?php
	// Include necessary files-- framework will do this automatically
	require('crud.php'); require('config.php');
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