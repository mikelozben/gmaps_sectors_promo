<?php
/*
 * File is called by a javascript function.
 * Retrieves the driving schools.
 *
 */
include_once("mysql_connector.php");
ini_set('display_errors', '0');

$results = array();
$getResults = $mysqli->query("
      SELECT
               latitude_teaching_room,
               longitude_teaching_room,
               commercial_name as name,
               teaching_room_address
        FROM   driving_school_location AS loc
        JOIN   driving_school AS ds ON loc.id_driving_school = ds.id
");

if ($getResults->num_rows > 0) {
	$counter = 0;
	while ($row = $getResults->fetch_assoc()) {
		$results[$counter++] = array(
			floatval($row['latitude_teaching_room']),
			floatval($row['longitude_teaching_room']),
			$row['name'],
			$row['teaching_room_address']
			);
	}
	$getResults->free();
	$mysqli->close();
}
// returns array containing a sub-array per driving school
echo json_encode($results);
?>
