<?php
session_start();
if ( isset($_SESSION['rvl_ad_view_counter']) ) {
	$_SESSION['rvl_ad_view_counter']=$_SESSION['rvl_ad_view_counter']+1;
	if ( $_SESSION['rvl_ad_view_counter'] > 100 ) {
		$_SESSION['rvl_ad_view_counter']=1;
	}
} else {
	$_SESSION['rvl_ad_view_counter']=1;
}
// no echo, called by other php page
?>
