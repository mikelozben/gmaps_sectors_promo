<?php
/*
 * File is called by javascript functions.
 * Retrieves the areas defined for advertising,
 * returns array with series of 4 points.
 *
 * Must be done based on zoom factor and map boundary,
 * otherwise there can be too many rectangles.
 */
include_once("mysql_connector.php");
ini_set('display_errors', '0');

if ( isset($_GET["debug"]) ) {
	$debug = true;
	$west		= $_GET["west"]; 	// testing
	$east		= $_GET["east"]; 	// testing
	$north		= $_GET["north"]; 	// testing
	$south		= $_GET["south"]; 	// testing
} else {
	$debug = false;
	$west		= $_POST["west"];
	$east		= $_POST["east"];
	$north		= $_POST["north"];
	$south		= $_POST["south"];
}

$results = array();
$getResults = $mysqli->query("
      SELECT
               latitude_north,
               latitude_south,
               longitude_east,
               longitude_west,
               test_name,
               id
               FROM   advertising_areas
       WHERE
               longitude_west < $east AND
               longitude_east > $west AND
               latitude_north > $south AND
               latitude_south < $north
    ORDER BY   id
       LIMIT   500
;
");

// LIMIT 500	limit just to be sure not to overload the map inside the browser

if ($getResults->num_rows > 0) {
	$counter = 0;
	while ($row = $getResults->fetch_assoc()) {
		$results[$counter++] = array(
			floatval($row['latitude_north']),
			floatval($row['latitude_south']),
			floatval($row['longitude_east']),
			floatval($row['longitude_west']),
			$row['test_name'],
            $row['id'] /* added */
		);
	}
	$getResults->free();
	$mysqli->close();
}
// returns array containing a sub-array per square area
echo json_encode($results);
?>
