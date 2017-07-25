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
        <title>Map</title>
        <!-- <link rel="shortcut icon" href="assets/img/icon.png"> -->
        
        <link rel="stylesheet" href="assets/css/bootstrap.min.css" type="text/css" />
        <link rel="stylesheet" href="assets/css/sidebar.css" type="text/css" />
        <link rel="stylesheet" href="assets/css/infoWindow.css" type="text/css" />
        <link rel="stylesheet" href="assets/css/addressInputWindow.css" type="text/css" />
        <link rel="stylesheet" href="assets/css/banner.css" type="text/css" />
        <link rel="stylesheet" href="assets/css/map.css" type="text/css" />
        
        <script src="assets/js/jquery-1.11.1.min.js" type="text/javascript"></script>
        <script src="assets/js/bootstrap.min.js" type="text/javascript"></script>
        
        <script src="assets/js/gmap.js" type="text/javascript"></script>
        <script src="assets/js/infoWindow.js" type="text/javascript"></script>
        <script src="assets/js/addressInputWindow.js" type="text/javascript"></script>
        <script src="assets/js/banner.js" type="text/javascript"></script>
        <script src="assets/js/sidebar.js" type="text/javascript"></script>
        <script src="assets/js/connector.js" type="text/javascript"></script>
        
        <script src="assets/js/pages/map.js" type="text/javascript"></script>
        
    </head>
    <body>
        <div class="container-fluid main" role="main">
            <div class="row-fluid row-banner">
                <div class="banner">
                    <h3 class="text-center content"></h3>
                </div>
            </div>
            <div class="row-fluid row-content">
                <div class="span3 col-sidebar">
                    <!-- Controls section -->
                    <div class="row-fluid row-controls text-center">
                        <div class="span6">
                            <label class="label label-success label-search-schools">Search Driving Schools</label>
                        </div>
                        <div class="span6">
                            <input type="text" class="search-distance" placeholder="Max distance, km" value="5" title="Max distance, km"/>
                        </div>
                    </div>
                    <!-- END Controls section -->
                    
                    <!-- Geolocation section -->
                    <div class="row-fluid row-section row-geolocation disabled">
                        <div class="span12">
                            <div class="row-fluid row-header">
                                <div class="span12 text-center">
                                    <h4><label class="label label-section-title label-success" data-section="geolocation">Geolocation</label></h4>
                                </div>
                            </div>
                            <div class="row-fluid row-address-label">
                                <div class="span6 text-left">
                                    Address: 
                                </div>
                                <div class="span6 text-right">
                                </div>
                            </div>
                            <div class="row-fluid row-address">
                                <div class="span12 col-address text-right">
                                    -NOT SPECIFIED-
                                </div>
                            </div>
                            <div class="row-fluid row-coordinates-label">
                                <div class="span6 text-left">
                                    Coordinates:
                                </div>
                                <div class="span6 text-right">
                                </div>
                            </div>
                            <div class="row-fluid row-coordinates">
                                <div class="span12 col-coordinates text-right">
                                    -NOT SPECIFIED-
                                </div>
                            </div>
                            <div class="row-fluid row-disable-title">
                                <div class="span12 col-disable-title text-left">
                                    Unavailable
                                </div>
                            </div>
                            <div class="row-fluid row-disable-reason">
                                <div class="span12 col-disable-reason text-left">
                                    Your browser does not seem to support geolocation.<br>
                                    Set a start point yourself
                                </div>
                            </div>
                            <div class="row-fluid row-disable-info">
                                <div class="span12 col-disable-info text-left">
                                    <a href='javascript:void(0)' class='btn-disable-info'>More info</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- END Geolocation section -->
                    
                    <!-- Home section -->
                    <div class="row-fluid row-section row-home focused">
                        <div class="span12">
                            <div class="row-fluid">
                                <div class="span12 text-center">
                                    <h4><label class="label label-section-title label-info" data-section="home">Home</label></h4>
                                </div>
                            </div>
                            <div class="row-fluid">
                                <div class="span6 text-left">
                                    Address: 
                                </div>
                                <div class="span6 text-right">
                                    <label class="label label-success label-position-by-input" data-section="home">Input directly</label>
                                </div>
                            </div>
                            <div class="row-fluid">
                                <div class="span12 col-address text-right">
                                    -NOT SPECIFIED-
                                </div>
                            </div>
                            <div class="row-fluid">
                                <div class="span6 text-left">
                                    Coordinates:
                                </div>
                                <div class="span6 text-right">
                                    <label class="label label-success label-position-by-click" data-section="home">Set on map</label>
                                </div>
                            </div>
                            <div class="row-fluid">
                                <div class="span12 col-coordinates text-right">
                                    -NOT SPECIFIED-
                                    <!--lat: <br>
                                    lng: -->
                                </div>
                            </div>
                            <div class="row-fluid">
                            </div>
                        </div>
                    </div>
                    <!-- END Home section -->
                    
                    <!-- Work section -->
                    <div class="row-fluid row-section row-work">
                        <div class="span12">
                            <div class="row-fluid">
                                <div class="span12 text-center">
                                    <h4><label class="label label-section-title label-info" data-section="work">Work</label></h4>
                                </div>
                            </div>
                            <div class="row-fluid">
                                <div class="span6 text-left">
                                    Address: 
                                </div>
                                <div class="span6 text-right">
                                    <label class="label label-success label-position-by-input" data-section="work">Input directly</label>
                                </div>
                            </div>
                            <div class="row-fluid">
                                <div class="span12 col-address text-right">
                                    -NOT SPECIFIED-
                                </div>
                            </div>
                            <div class="row-fluid">
                                <div class="span6 text-left">
                                    Coordinates:
                                </div>
                                <div class="span6 text-right">
                                    <label class="label label-success label-position-by-click" data-section="work">Set on map</label>
                                </div>
                            </div>
                            <div class="row-fluid">
                                <div class="span12 col-coordinates text-right">
                                    -NOT SPECIFIED-
                                    <!--lat: <br>
                                    lng: -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- END Work section -->
                </div>
                
                <div class="span9">
                    <div class="row-fluid">
                        <div class="span12 col-map">
                            <div id="map-container"></div>
                        </div>
                    </div>
                    <div class="row-fluid row-driving-schools">
                        <div class="span12 col-driving-school-title text-center">
                            Driving schools : 
                        </div>
                    </div>
                </div>
            </div>
		<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCNc-imu-jmEKZ1CPOure1jw0DXGaWjFEY&libraries=geometry,places&callback=initMap&language=nl&region=BE"></script>
    </body>
</html>
