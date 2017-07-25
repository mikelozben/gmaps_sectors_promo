<?php
/*
 * File is called by javascript functions.
 * Retrieves the area defined for advertising
 * based on a point value of latitude and longitude.
 * returns with the id of the area.
 *
 */
include_once("mysql_connector.php");
ini_set('display_errors', '0');

$latitude		= $_POST["latitude"];
$longitude		= $_POST["longitude"];
//$latitude		= $_GET["latitude"]; 	// testing
//$longitude	= $_GET["longitude"];	// testing

$results = array();
$getResults = $mysqli->query("
      SELECT
               id,
               test_name
        FROM   advertising_areas
       WHERE   $latitude < latitude_north and
               $latitude > latitude_south and
               $longitude < longitude_east and
               $longitude > longitude_west
;");
if ($getResults->num_rows > 0) {
	$counter = 0;
	// should only be one unless area's overlap at that point location
	while ($row = $getResults->fetch_assoc()) {
		$results[$counter++] = array(
			$row['id'],
			$row['test_name']
		);
	}
	$getResults->free();
	$mysqli->close();
}
// returns array containing a sub-array per square area
echo json_encode($results);
?>
