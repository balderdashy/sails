<?php
	// Get and start up crud SDK
	require('../sdks/php/crud.php');
$crud = new CRUD(array(
	// The URL of your CRUD.io server instance
	'url' => "http://crud.io:4000"
));
?><!DOCTYPE html>
<html>
	<head>
		<title><?php $crud->read('title') ?></title>

        <!-- Browser SDK -->
        <script type="text/javascript" src="3rdpartylibs/underscore.js"></script>
        <script type="text/javascript" src="3rdpartylibs/backbone.js"></script>
        <script type="text/javascript" src="3rdpartylibs/socket.io.client.js"></script>
<!--        <script type="text/javascript" src="3rdpartylibs/backbone-override.js"></script>-->
        <script type="text/javascript" src="3rdpartylibs/jquery.js"></script>
        <script type="text/javascript" src="Log.js"></script>
        <script type="text/javascript" src="Nag.js"></script>
        <script type="text/javascript" src="Socket.js"></script>
        <script type="text/javascript" src="../sdks/browser/crud.io.client.js"></script>
		<script type="text/javascript">
            // Prepare the browser SDK
//			var crud = new CRUD({
//				server: 'http://localhost:4000',
//				success: function (msg) {
//					Log.log(msg);
//				}
//			});
		</script>
	</head>
	<body>

    <h1><?php $crud->read('heading'); ?></h1>
    <p><?php $crud->read('description'); ?></p>

    <?php $crud->read('description'); ?>

    <h3>There is also a browser SDK for accessing CRUD content with AJAX applications.</h3>
    <h2>Paste your HTML and run our converter which automatically makes your webpage editable.</h2>

    <?php $crud->read('description'); ?>

    </body>
</html>