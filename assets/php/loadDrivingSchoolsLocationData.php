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
               *
        FROM   driving_school_location
        JOIN   driving_school ON driving_school_location.school_number = driving_school.school_number
       WHERE   
               Latitude_teaching_room > 0
         AND   Longitude_teaching_room > 0
         AND   Latitude_admin_room > 0
         AND   Longitude_admin_room > 0
;
");

if ($getResults->num_rows > 0) {
	while ($row = $getResults->fetch_assoc()) {
        $je = json_encode($row);
        if ( !$je ) {
            error_log('Failed to decode data, record id : ' . $row['id']);
        } else {
            $results[] = $row;
        }
	}
	$getResults->free();
	$mysqli->close();
}
// returns array containing a sub-array per driving school
echo json_encode($results);
?>
