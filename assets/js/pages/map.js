/**
 * Js file for map page, with initialization & event handlers
 */

/*
* Global variables to interact with google map, banner, sidebar, info and address windows and connector.
* sectionRequiresAddress - section name which requires manual address input
*/
var
    objMap = new GMap(),
    objBanner = new Banner(),
    objSidebar = new Sidebar(),
    objSidebarInfoWindow = new InfoWindow(),
    objSidebarAddressInputWindow = new AddressInputWindow(),
    sectionRequiresAddress = null,
    objConnector = new Connector(),
    onDetectLocationZoom = 13;


/**
 * Function calls whet client geolocation determining complete
 * 
 * @param {object|null} position            Current client geolocation position on success, null on fail
 * @param {PositionError|string} error      Error in case if user rejects request, string "Not Supported" if browser don't support geolocation
 */
function onDetermineClientGeolocationComplete(position, error) {
    if ( error ) {
        if ( error.PERMISSION_DENIED && (error.PERMISSION_DENIED === error.code) ) {
            objSidebarInfoWindow.update({
                'content':
                    "Geolocation disabled. Please turn it on if you want to detect your current position automatically"
            });
            objSidebar.update('geolocation', {
                'disable-reason':
                    'Your browser supports geolocation but it has been switched off.<br>You should turn it in on to use geolocation autodetection'
            });
        } else {
            objSidebarInfoWindow.update({
                'content':
                    "Geolocation feature is not supported by your current browser."
            });
            objSidebar.update('geolocation', {
                'disable-reason':
                    'Your browser does not seem to support geolocation.<br>Set a start location yourself'
            });
        }
    } else if ( position ) {
        // Determins address by detected geolocation position
        objMap.getAddressByPosition(position, function(res, stat) {
            // on success address geodecoded from position - 
            
            // enable geolocation section on sidebar with address and position
            if ( res ) {
                objSidebar.update('geolocation', {
                    enabled: true,
                    focused: true,
                    
                    address:res,
                    coordinates: position
                });
                objSidebar.update('home', {focused:false});
            }
            
            // and updates map position and marker label
            objMap.updateStartLocationMarker(position, 'Geolocation');
            objMap.setZoom(onDetectLocationZoom);
        });
    }
}

/**
 * Callback for goole maps api loaded
 */
function initMap() {
var
        gmapInitParams = {
            "container": "#map-container",
            "onStartLocationChange": function(position) {
                // callback function on gmap start location change : 
                
                // setting new position to connector to get banners linked to it
                objConnector.changePosition(position);
                objConnector.showNextAdvertiser();
                
                // hide driving schools list - need to start new search for new position
                $('.row-driving-schools').hide();
            }
        },
        sbInitParams = {
            "container": ".main .row-content .col-sidebar",
            "gmap": objMap,
            "onDetectLocationMapZoom": onDetectLocationZoom,
            "sections": {
                "geolocation": {
                    enabled: false, 
                    focused: false,
                    'disable-reason': 'Failed to detect geolocation'
                },
                "home": {
                    focused: true
                }
            },
            "labelDetailsClickCallback": function() {
                // on "More info" click callback
                // shows info window
                objSidebarInfoWindow.show();
            },
            "labelDirectInputClickCallback": function(section, onSuccess) {
                // on "Input directly" click callback
                // sets sectionRequiresAddress to a section name which requires address input
                sectionRequiresAddress = section;
                //and set callback function for address input complete 
                //(onSuccess function is declared inside objSidebar)
                objSidebarAddressInputWindow.setCompleteCallback(function(address) {
                    onSuccess(address);
                });
                //shows address input window
                objSidebarAddressInputWindow.show();
            },
            "drivingSchoolsSearchClickCallback": function(position, distance) {
                //on driving schools search click callback
                //loads driving schools using objConnector 
                objConnector.loadDrivingSchools(position, distance, function(schools) {
                    // on success sets driving schools on map (inside objMap schools are 
                    // filtering by distance, markers are creating)
                    objMap.setDrivingSchools(schools, distance);
                    
                    // refresh and show section with founded driving schools below map
                    $('.row-driving-schools .col-driving-school').remove();
                    var arrSchools = objMap.getDrivingSchools();
                    if ( 0 < arrSchools.length ) {
                        $('.row-driving-schools .col-driving-school-title').html('Driving schools : ');
                        for(var i=0; i < arrSchools.length; i++) {
                            $('.row-driving-schools').append(
                                '<div class="span12 col-driving-school text-left">' 
                                     + 'School : ' + arrSchools[i]['name']
                                     + '<br>Address : ' + arrSchools[i]['address']
                                     + '<br>Distance : ' + arrSchools[i]['distance'] + ' m'
                                 + '</div>');
                        }
                    } else {
                        $('.row-driving-schools .col-driving-school-title').html('No one driving school found...');
                    }
                    $('.row-driving-schools').show();
                });
            }
        },
        iwInitParams = {
            data: {
                title: 'Geolocation',
                content: 'Unable to detect geolocation'
            },
            positionCalculatingFunction : function() {
                // function for calculating position of info window on show
                var 
                    position = {'top':0, 'left':0};
                    
                position['top'] = ( parseFloat($('.main').css('height').replace('px', ''))/2 - (parseFloat($('.info-window').css('height').replace('px', '')))/2);
                position['left'] = ( parseFloat($('.main').css('width').replace('px', ''))/2 - (parseFloat($('.info-window').css('width').replace('px', '')))/2);
                
                return position;
            }
        },
        aiwInitParams = {
            data: {
                title: 'Address : '
            },
            positionCalculatingFunction : function() {
                // function for calculating position of address input window on show
                var 
                    position = null,
                    $targetElement = $('.row-' + sectionRequiresAddress);

                if ( 0 < $targetElement.length ) {
                    position = $targetElement.offset();

                    position['left'] += parseFloat($targetElement.css('width').replace('px', '')) + 10;
                }

                return {
                    'top': position['top'],
                    'left': position['left']
                };
            },
            onSetAddressCallback: function(address) {
                // on input address complete callback 
            }
        };
        
    objMap.init( gmapInitParams );
    objSidebar.init(sbInitParams);
    
    objSidebarInfoWindow.init(iwInitParams);
    objSidebarAddressInputWindow.init(aiwInitParams);
    
    objConnector.setBanner(objBanner);
    objConnector.setPosition( objMap.getStartLocation() );
    
    // trying to detect client geolocation
    objMap.getClientGeolocation(
        /*on success*/ function(position) { onDetermineClientGeolocationComplete(position, null);},
        /*on fail*/    function(gpError) { onDetermineClientGeolocationComplete(null, gpError);}
    );    
}

document.addEventListener("DOMContentLoaded", function(ev) {
    objBanner.init({
        "container": ".main .row-banner",
        "content": ""
    });
});