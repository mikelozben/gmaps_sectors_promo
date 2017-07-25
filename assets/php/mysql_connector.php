<?php
$rhcHOST = getenv('OPENSHIFT_MYSQL_DB_HOST');
$rhcPORT = getenv('OPENSHIFT_MYSQL_DB_PORT');
$mysqli = new MySQLi("{$rhcHOST}:{$rhcPORT}", "admin5dbWM2E", "eev5bDqQ7RsV", "mike");
?>
