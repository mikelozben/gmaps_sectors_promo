<?php
    /******************************************************************************
     * Prototype page.
     * Contains a number of items for testing functionality.
     */

    /******************************************************************************
     * Page and view counter to determine which advertiser to show.
     * If first time then the counter is created as part of the session,
     * change of php page should add to the page counter
     * inside javascript a change of home location should
     * also increment the counter and update the advertising
     */
    include('assets/php/increment_ad_page_counter.php');
?><!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">
        <title>Advertiser admin page</title>
        <!-- <link rel="shortcut icon" href="assets/img/icon.png"> -->
        
        <link rel="stylesheet" href="assets/css/bootstrap.min.css" type="text/css" />
        <link rel="stylesheet" href="assets/css/advertiser.css" type="text/css" />
        
        <script src="assets/js/jquery-1.11.1.min.js" type="text/javascript"></script>
        <script src="assets/js/bootstrap.min.js" type="text/javascript"></script>
        
        <script src="assets/js/gmap.js" type="text/javascript"></script>
        <script src="assets/js/gmapTextOverlay.js" type="text/javascript"></script>
        <script src="assets/js/infoWindow.js" type="text/javascript"></script>
        <script src="assets/js/addressInputWindow.js" type="text/javascript"></script>
        <script src="assets/js/banner.js" type="text/javascript"></script>
        <script src="assets/js/sidebar.js" type="text/javascript"></script>
        <script src="assets/js/connector.js" type="text/javascript"></script>
        
        <script src="assets/js/pages/advertiser.js" type="text/javascript"></script>
    </head>
    <body>
        <div class="container-fluid main" role="main">
            <div class="row-fluid row-advertiser-top">
                <div class="banner">
                    <h4 class="text-center content">
                        Advertiser ID : <input type="text" class="advertiser_id" placeholder="Advertiser ID" value="1" />
                    </h4>
                </div>
            </div>
            <div class="row-fluid row-content">
                <div class="span3 col-area-details">
                    <div class="row-fluid row-title text-center">
                        <div class="span12">
                            <label class="label label-success label-area-details">Area Details</label>
                        </div>
                    </div>
                    <div class="row-fluid row-title text-center">
                        <div class="span4 text-left">Title  :</div>
                        <div class="span8 text-right col-area-title">-NOT PROVIDED-</div>
                    </div>
                    <div class="row-fluid row-adv-number text-center">
                        <div class="span6 text-left">Advertisers number  :</div>
                        <div class="span6 text-right col-area-adv-number">-UNKNOWN-</div>
                    </div>
                    <div class="row-fluid row-available-frequency text-center">
                        <div class="span6 text-left">Available frequency :</div>
                        <div class="span6 text-right col-available-frequency">-UNKNOWN-</div>
                    </div>
                    <div class="row-fluid row-advertisers-title text-center">
                        <div class="span12">Advertisers :</div>
                    </div>
                    <div class="row-fluid row-details row-advertisers text-right">
                        <div class="span12">
                            NAME<br>
                            ADDRESS<br>
                            FREQUENCY
                        </div>
                    </div>
                    <div class="row-fluid row-details row-controls text-right">
                        <div class="span8 text-left">Your current frequency : </div>
                        <div class="span4"><input type="text" class="area-frequency text-center" value="0"/></div>
                    </div>
                    <div class="row-fluid row-details row-controls text-right">
                        <div class="span6 text-center"><button class="btn btn-success btn-save">Save</button></div>
                        <div class="span6 text-center"><button class="btn btn-danger btn-remove">Remove</button></div>
                    </div>
                </div>
                    
                <div class="span9">
                    <div class="row-fluid">
                        <div class="span12 col-map">
                            <div id="map-container"></div>
                        </div>
                    </div>
                </div>
            </div>
		<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCNc-imu-jmEKZ1CPOure1jw0DXGaWjFEY&libraries=geometry,places&callback=initMap&language=nl&region=BE"></script>
    </body>
</html>
