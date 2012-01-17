<?php
	// Include necessary files-- framework will do this automatically
	require('crud.php'); require('config.php');
?><!DOCTYPE html>
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