<?php
session_start();
include_once("mysql_connector.php");
ini_set('display_errors', '0');

/******************************************************************************
 * For debugging call routine with parameter 'debug'
 * otherwise should only produce an echo for javascript
 */
$debug = false;
if ( isset($_GET['debug']) ) {
	$debug = true;
}
if ($debug) {
	if ( !isset($_SESSION['rvl_ad_sequence']) ) {
		echo "error: got no sequence<br>";
	} else {
		echo "Stored areaID    =".$_SESSION['rvl_ad_area']."<BR>";
		echo "First in sequence=".$_SESSION['rvl_ad_sequence']['1']."<BR>";
	}
	if ( !isset($_SESSION['rvl_ad_view_counter']) ) {
		echo "error: got no counter<br>";
	} else {
		echo "View counter     =".$_SESSION['rvl_ad_view_counter']."<BR>";
		echo "Current          =".$_SESSION['rvl_ad_sequence'][$_SESSION['rvl_ad_view_counter']]."<BR>";
	}
}
/*****************************************************************************/

/******************************************************************************
 * Get advertiser info from id in sequence.
 * If there is no advertiser set then return a placeholder advertiser.
 */
$result = array();
$nextAdvertiserID = $_SESSION['rvl_ad_sequence'][$_SESSION['rvl_ad_view_counter']];
if ( $nextAdvertiserID == 0 ) {
	// got no advertiser,
	// return without any statistics, to be done later
	$result['banner']	= "placeholder banner";
	$result['name']		= "placeholder name";
	$result['address']	= "placeholder";
	echo json_encode($result);
	exit();
}

//-----------------------------------------------------------------------------
$query =
"
      SELECT
               Banner1,
               Business_commercial_name
        FROM   advertiser
        JOIN   driving_school ON advertiser.school_number = driving_school.school_number
        JOIN   driving_school_location ON driving_school_location.school_number = advertiser.school_number AND driving_school_location.location_number = advertiser.location_number
       WHERE   advertiser.id=$nextAdvertiserID
;
";
if ($debug) { echo $query."<BR><br>"; }
$getResults = $mysqli->query($query);
//-----------------------------------------------------------------------------
if ($getResults->num_rows > 0) {
	// should only be one unless area's overlap at that point location
	// then only use the first one
	if ($row = $getResults->fetch_assoc()) {
		$result['banner']	= $row['Banner1'];
		$result['name']		= $row['Business_commercial_name'];
	}
	$getResults->free();
}
if ($debug) { echo "Name advertiser = ".$result['name']."<Br>"; }

/******************************************************************************
 * Get recent counts of advertising displays.
 * Includes maximum first pages before reordering.
 */
$areaID = $_SESSION['rvl_ad_area'];
if ($debug) { echo "Processing areaID = ".$areaID."<BR><BR><BR>"; }
//-----------------------------------------------------------------------------
$query =
"
      SELECT
               *,
               IF (count_first_page < first_page_maximum,false,true) AS reorder
        FROM   advertising_rotation_frequency
       WHERE   id_advertiser = $nextAdvertiserID
         AND   id_area = $areaID
    ORDER BY   display_order ASC
;
";
if ($debug) { echo $query."<BR><br>"; }
$getResults = $mysqli->query($query);
//-----------------------------------------------------------------------------
$field = "";
if ( $getResults->num_rows > 0) {
	if ($row = $getResults->fetch_assoc()) {
		if ( $row['reorder'] ) {
			// rearrange order of display
			// copy data to statistics
			if ($debug) { echo "REORDERING<br><br>"; }
			
			$getResults->free();
			include("reorderAdvertisers.php");

		}
		// determine page for accounting
		if ( $_SESSION['rvl_ad_view_counter'] == 1 ) {
			$field = "count_first_page = count_first_page+1";
		} else if ( $_SESSION['rvl_ad_view_counter'] == 2 ) {
			$field = "count_second_page = count_second_page+1";
		} else if ( $_SESSION['rvl_ad_view_counter'] == 3 ) {
			$field = "count_third_page = count_third_page+1";
		} else {
			$field = "count_rotation_pages = count_rotation_pages+1";
		}
		// Increment counter for this advertiser and area.
		if ($debug) {
			echo "
		      UPDATE   advertising_rotation_frequency
		         SET   $field
		       WHERE   id_advertiser = $nextAdvertiserID
		         AND   id_area = $areaID
					   ;"."<br><br>";
		}
		$mysqli->query("
		      UPDATE   advertising_rotation_frequency
		         SET   $field
		       WHERE   id_advertiser = $nextAdvertiserID
		         AND   id_area = $areaID
		;
						");
	}
}

echo json_encode($result);
?>
