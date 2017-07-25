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
where id < 1000
        order by id
        limit 5000
;
				");
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
