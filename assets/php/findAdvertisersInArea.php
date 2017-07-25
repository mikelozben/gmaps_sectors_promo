<?php
/*
 * File is called by javascript functions.
 * Retrieves the area defined for advertising
 * based on a point value of latitude and longitude.
 * Returns the advertisers for that area.
 *
 * TODO show more data
 */
include_once("mysql_connector.php");
ini_set('display_errors', '0');

$areaID		= $_POST["areaID"];
//$areaID		= $_GET["areaID"]; 	// testing

$results = array();

/*
echo "
      SELECT
               id_advertiser,
               driving_school.school_number,
               driving_school_location.location_number,
               Business_commercial_name,
               frequency,
               display_order,
               first_page_maximum,
               count_first_page,
               count_second_page,
               count_third_page,
               count_rotation_pages
        FROM   advertising_rotation_frequency
        JOIN   advertiser ON advertiser.id = id_advertiser
        JOIN   driving_school ON driving_school.school_number = advertiser.school_number
        JOIN   driving_school_location ON driving_school_location.school_number = advertiser.school_number AND driving_school_location.location_number = advertiser.location_number
       WHERE   id_area = $areaID
;
";
*/

$getResults = $mysqli->query("
      SELECT
               id_advertiser,
               driving_school.school_number,
               driving_school_location.location_number,
               Business_commercial_name,
               frequency,
               display_order,
               first_page_maximum,
               count_first_page,
               count_second_page,
               count_third_page,
               count_rotation_pages
        FROM   advertising_rotation_frequency
        JOIN   advertiser ON advertiser.id = id_advertiser
        JOIN   driving_school ON driving_school.school_number = advertiser.school_number
        JOIN   driving_school_location ON driving_school_location.school_number = advertiser.school_number AND driving_school_location.location_number = advertiser.location_number
       WHERE   id_area = $areaID
;
				");
if ($getResults->num_rows > 0) {
	$counter = 0;
	while ($row = $getResults->fetch_assoc()) {
		$results[$counter++] = $row;
	}
	$getResults->free();
	$mysqli->close();
}
// returns array containing a sub-array per advertiser
echo json_encode($results);
?>
