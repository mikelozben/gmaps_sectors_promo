<?php
/******************************************************************************
 * 
 * File is called by javascript functions.
 * Retrieves the area defined for advertising
 * based on a point value of latitude and longitude.
 * Then finds the advertisers for that area and generates
 * a sequence in which the advertisers need to be shown.
 * 
 * The sequence and the area is stored in the PHP session.
 *
 */
session_start();
include_once("mysql_connector.php");
ini_set('display_errors', '0');

if ( isset($_GET["debug"]) ) {
	$debug = true;
	$latitude		= $_GET["latitude"]; 	// testing
	$longitude		= $_GET["longitude"];	// testing
} else {
	$debug = false;
	$latitude		= $_POST["latitude"];
	$longitude		= $_POST["longitude"];
}

/******************************************************************************
 * Find the advertising area based on current location.
 */
$areaID = 0;
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
	// should only be one unless area's overlap at that point location
	// then only use the first one
	if ($row = $getResults->fetch_assoc()) {
		$areaID = $row['id'];
	}
	$getResults->free();
}
// store in the session
$_SESSION['rvl_ad_area']=$areaID;
/*
 * 
 *****************************************************************************/

if ($debug) {
echo "
SELECT
               id_advertiser,
               business_commercial_name,
               frequency,
               display_order,
               first_page_maximum,
               count_first_page
        FROM   advertising_rotation_frequency
        JOIN   advertiser ON advertiser.id = id_advertiser
        JOIN   driving_school ON driving_school.school_number = advertiser.school_number
        JOIN   driving_school_location ON driving_school_location.school_number = advertiser.school_number AND driving_school_location.location_number = advertiser.location_number
       WHERE   id_area = $areaID
    ORDER BY   display_order ASC
;
"."<br/><br/>";
}

/******************************************************************************
 * Find advertisers in this area with their requested frequency.
 * Generate the sequence for display
 */
$results = array();
$getResults = $mysqli->query("
      SELECT
               id_advertiser,
               business_commercial_name,
               frequency,
               display_order,
               first_page_maximum,
               count_first_page
        FROM   advertising_rotation_frequency
        JOIN   advertiser ON advertiser.id = id_advertiser
        JOIN   driving_school ON driving_school.school_number = advertiser.school_number
        JOIN   driving_school_location ON driving_school_location.school_number = advertiser.school_number AND driving_school_location.location_number = advertiser.location_number
       WHERE   id_area = $areaID
    ORDER BY   display_order ASC
;
				");
if ($getResults->num_rows > 0) {
	/**
	 * Generates a sequence of 100 ads,
	 * order is based on the requested and/or maximum frequency,
	 * after 100 page views the sequence can start over.
	 */
	$sequence_by_frequency = array();
	$sequence_ad_counter = array();
	/**
	 * With multiple advertisers the policy is to show each one equally.
	 * If there is capacity to spare then each one gets the requested frequency,
	 * this can be lower than the maximum available.
	 * If there are more advertisers than capacity all are displayed equally.
	 */
	$total_advertisers = $getResults->num_rows;
	$maximum_frequency = 100 / $total_advertisers;
	if ($debug) echo "max=".$maximum_frequency."<br>";
	
	/**
	 * Loop each advertiser,
	 * if possible retain his requested frequency,
	 * otherwise reset to maximum available.
	 */
	$sequence_frequencies = array();
	while ($row = $getResults->fetch_assoc()) {
		//echo $row['id_advertiser'] . "===". ($row['frequency']/100)."<br>";
		if ( $row['frequency'] >= $maximum_frequency ) {
			$sequence_frequencies[$row['id_advertiser']] = $maximum_frequency/100;
		} else {
			$sequence_frequencies[$row['id_advertiser']] = $row['frequency']/100;
		}
		$sequence_ad_counter[$row['id_advertiser']] = 0;
	}
	$getResults->free();
	
	// testing
	if ($debug) {
		$counter = 1;
		foreach ($sequence_frequencies as $id => $percent) {
			echo $counter++ . "==> id=".$id. " percent=".$percent . "<br>";
		}
	}
	
	/**
	 * Loop each advertiser,
	 * display each advertiser at least 3 times,
	 * then start the sequence using frequency.
	 */
	$sequence_counter = 1;
	for ( $c = 1; $c <= 3 ; $c++) {
		foreach ($sequence_frequencies as $id => $percent) {
			//echo "---" . $id . "-" . $percent . "<br><br>";
			$sequence_by_frequency[$sequence_counter++] = $id;
		}
	}
	
	if ($debug) echo "<br>firstpages at " . $sequence_counter . "<Br><br>";

	/**
	 * Generate sequence using set frequencies.
	 */
	$total = 1;
	$empties = 0; // testing
	for ( $c = $sequence_counter; $c <= 100 ; $c++) {
		foreach ($sequence_frequencies as $id => $percent) {
			//echo "ad_counter=".$sequence_ad_counter[$id]. " total=".$total. " ad/total=".($sequence_ad_counter[$id] / $total) . " percent=".$percent."<BR/>";
			if ( ($sequence_ad_counter[$id] / $total) <= $percent ) {
				// show
				$sequence_ad_counter[$id] = $sequence_ad_counter[$id]+1;
				$sequence_by_frequency[$c] = $id;
				$total++;
				//echo "show<br>";
				continue 2;
			}
		}
		// none then insert emty
		$sequence_by_frequency[$c] = 0;
		$total++;
		$empties++; // testing
		//echo "empty<br>";
	}
	
	// testing
	if ($debug) {
		echo "<br>Empties = ". $empties . " ==> " . $empties / $total . "<br>";
		foreach ($sequence_by_frequency as $nr => $id) {
			echo "nr=".$nr. " ad=".$id . "<br>";
		}
	}
	
	$mysqli->close();
}

// store sequence in session
$_SESSION['rvl_ad_sequence']=$sequence_by_frequency;
/*
 * 
 *****************************************************************************/

// returns array for testing
echo json_encode($sequence_by_frequency);
?>
