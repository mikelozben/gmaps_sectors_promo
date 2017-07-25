/**
 * A class to interact with google maps
 */

function GMap () {
    var
        self = {},
        errorMessages = {
            __dom_container_not_found__:        "DOM Element for google map not found...",
            __dom_container_not_set__:          "DOM Element for google map not initialized yet...",
            
            __google_maps_not_implemented__:    "Google maps api module not found...",
            __google_map_not_intialized__:      "Map is not initialized yet...",
            
            __geocoder_not_intialized__:        "Geocoder is not initialized yet...",
            
            __selector_format_error__:          "Wrong selector format : please provide a valid DOM selector string",
            __location_format_error__:          "Wrong location format : please provide a valid location object with lat & lng keys",
            
            __invalid_parameters__:             "Invalid parameters"
        },

        mapContainer = null,

        map = null, 
        mapZoom = 9,
        mapMinZoom = null,
        mapOnClickCallbacks = [],
        mapRequireClickCallback = null,
        _onStartLocationChange = null,
        mapInfoWindow = null,
        
        _showMarkers = true,
        _drivingSchools = [],
        
        _showAdRectangles = true,
        _adRectangleOnClickCallback = null,
        _adRectangles = [],
        
        geocoder = null,

        // As a default valus - center of Ghent, no advertisers on this location (lat = 51.044000, lng =  3.750000)
        startLocation = {lat: 51.044000, lng: 3.750000},
        startLocationMarker = null;

    /**
     * Inits google maps, geocoder and info window instances
     */
    function _initMap() {
        if ( null === mapContainer ) {
            throw new Error( errorMessages.__dom_container_not_set__ );
        }
        if ( "undefined" === typeof(google) ) {
            throw new Error( errorMessages.__google_maps_not_implemented__ );
        }
        
        map = new google.maps.Map(mapContainer, {
            zoom: mapZoom,
            center: startLocation
        });
        
        map.addListener('click', _onMapClick);
        google.maps.event.addListener(map, 'maptypeid_changed', function(event){
            if ( mapMinZoom ) {
                map.setOptions({minZoom:mapMinZoom});
            }
        });        
        
        geocoder = new google.maps.Geocoder();
        mapInfoWindow = new google.maps.InfoWindow();
    }
    
    /**
     * Updates start loaction marker basing on provided title
     * and current start location
     * 
     * @param {string|null} title
     */
    function _updateStartLocationMarker(title) {
        if ( ("undefined" === typeof(title)) || ( "string" !== typeof(title)) ) {
            title = (null !== startLocationMarker ? startLocationMarker.getTitle() : '');
        }
        
        if ( null === map ) {
            throw new Error( errorMessages.__google_map_not_intialized__ );
        }        
        
        if ( _showMarkers ) {
            if ( null === startLocationMarker ) {
                startLocationMarker = new google.maps.Marker({
                    animation: google.maps.Animation.BOUNCE,
                    title: title
                });
                if ( null !== startLocation ) {
                    startLocationMarker.setPosition(startLocation);
                    startLocationMarker.setMap(map);
                    startLocationMarker.setAnimation(google.maps.Animation.BOUNCE);
                }
            } else {
                if ( null === startLocation ) {
                    startLocationMarker.setMap(null);
                } else {
                    startLocationMarker.setPosition(startLocation);
                    startLocationMarker.setMap(map);
                    startLocationMarker.setAnimation(google.maps.Animation.BOUNCE);
                }
                startLocationMarker.setTitle(title);
            }
        }
        
        // on update location or marker - removes all previous driving schools markers
        _setDrivingSchools([], null);
        if ( 'function' === typeof(_onStartLocationChange) ) {
            // calling _onStartLocationChange callback if provided
            _onStartLocationChange.call(null, startLocation);
        }
    }
    
    /**
     * Adds new map onclick callback function
     * 
     * @param {function} clickCallback
     */
    function _addOnClickCallback(clickCallback) {
        if ( "function" === typeof(clickCallback) ) {
            mapOnClickCallbacks.push(clickCallback);
        }
    }
    
    /**
     * Removes map onclick callback function
     * @param {function} callback
     */
    function _removeOnClickCallback(callback) {
        if ( "function" === typeof(callback) ) {
            for(var i=0; i < mapOnClickCallbacks.length; i++) {
                if ( callback === mapOnClickCallbacks[i] ) {
                    delete mapOnClickCallbacks[i];
                }
            }
        }
    }
    
    /**
     * Requires position by map clicking - sets special cursor pointer
     * and waiting for map click action, on success - calls
     * onclickCallback callback function if provided and turns 
     * cursor pointer back
     * 
     * @param {function} onclickCallback
     */
    function _requirePositionByClick(onclickCallback) {
        if ( "function" === typeof(onclickCallback) ) {
            if ( null === mapRequireClickCallback ) {
                mapRequireClickCallback = onclickCallback;
                map.setOptions({ draggableCursor: 'crosshair' });
            }
        } else if ( null === onclickCallback ) {
            mapRequireClickCallback = null;
            map.setOptions({ draggableCursor: '' });
        }
    }
    
    /**
     * Determines marker image basing on distance precentage
     * 
     * @param {float} precentage Distance precentage, 0.0 to 1.0
     * @returns {String} icon url
     */
    function _generateMarkerImageByPrecentage(precentage) {
        var iconUrl = 'assets/img/car-4.png';
        
        precentage = ( "undefined" !== typeof(precentage) ? parseFloat(precentage) || null : null);
        if ( ('undefined' !== typeof(precentage)) && ( 0 <= precentage) && ( 1 >= precentage) ) {
            if (precentage < 0.85 ) {
                iconUrl = 'assets/img/car-5.png';
            } else if (precentage < 0.68 ) {
                iconUrl = 'assets/img/car-6.png';
            } else if (precentage < 0.68 ) {
                iconUrl = 'assets/img/car-7.png';
            } else if (precentage < 0.51 ) {
                iconUrl = 'assets/img/car-8.png';
            } else if (precentage < 0.34 ) {
                iconUrl = 'assets/img/car-9.png';
            } else if (precentage < 0.17 ) {
                iconUrl = 'assets/img/car-9.png';
            }
        }
        return iconUrl;
    }
    
    /* <handlers> */
    /**
     * On map click callback function.
     * Calls all provided onClick callbacks
     * and, if position was required, calls callback function
     * 
     * @param {event} ev
     */
    function _onMapClick(ev) {
        var 
            clickPosition = {lat: ev.latLng.lat(), lng: ev.latLng.lng()};
    
        for( var i=0; i < mapOnClickCallbacks.length; i++ ) {
            mapOnClickCallbacks[i].call(null, clickPosition);
        }
        
        if ( mapRequireClickCallback ) {
            mapRequireClickCallback.call(null, clickPosition);
            mapRequireClickCallback = null;
            map.setOptions({ draggableCursor: '' });
        }
    }
    /* </handlers> */
    
    /* <getters> */
    /**
     * Function determine client position. 
     * 
     * !!! IMPORTANT !!! : keep notice that google (chrome, ...) decide to forbid this feature
     *                     for "insecure" origins, so it will work only for ssl-certified sources.
     *                     More about it : https://goo.gl/rStTGz
     * 
     * @param {function} onSuccessCallback callback function for successfully determined position
     * @param {function} onFailCallback    callback for fail
     */
    function _getClientGeolocation(onSuccessCallback, onFailCallback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(gPosition) {
                if ( "function" === typeof(onSuccessCallback) ) {
                    onSuccessCallback.call(null, {
                        lat: gPosition.coords.latitude,
                        lng: gPosition.coords.longitude,
                    });
                }
            }, function(err) {
                if ( "function" === typeof(onFailCallback) ) {
                    onFailCallback.call(null, err);
                }
            });
        } else {
            onFailCallback.call(null, "Not Supported");
        }
    }
    
    /**
     * Determines address of given location,
     * on complete calls callback function with
     * geocode result and status
     * 
     * @param {object} objLocation given location
     * @param {function} callback on geocode complete callback function
     */
    function _getAddressByPosition(objLocation, callback) {
        if ( 
                ('object' !== typeof(objLocation)) 
                || ('function' !== typeof(callback))
                || ('undefined' === typeof(objLocation['lat']))
                || ('undefined' === typeof(objLocation['lng'])) ) {
            
            throw new Error( errorMessages.__invalid_parameters__ );
        }
        if ( null === geocoder ) {
            throw new Error( errorMessages.__geocoder_not_intialized__ );
        }
        
        geocoder.geocode({'location': objLocation}, function(results, status) {
            //console.log('[_getAddressByPosition] complete');
            //console.log('[_getAddressByPosition] results : ', results);
            //console.log('[_getAddressByPosition] status : ', status);
            
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    callback.call(null, results[0].formatted_address, status);
                } else {
                    callback.call(null, null, status);
                }
            } else {
                callback.call(null, null, status);
            }
        });        
    }
    
    /**
     * Determines location of given address,
     * on complete calls callback function with
     * geocode result and status
     * 
     * @param {string} address given address
     * @param {function} callback on geocode complete callback function
     */
    function _getPositionByAddress(address, callback) {
        if ( ('string' !== typeof(address)) || ('function' !== typeof(callback)) ) {
            throw new Error( errorMessages.__invalid_parameters__ );
        }
        if ( null === geocoder ) {
            throw new Error( errorMessages.__geocoder_not_intialized__ );
        }
        
        geocoder.geocode( { 'address': address}, function(results, status) {
            //console.log('[_getPositionByAddress] complete');
            //console.log('[_getPositionByAddress] results : ', results);
            //console.log('[_getPositionByAddress] status : ', status);
            
            if (status === google.maps.GeocoderStatus.OK) {
                callback.call(null, {
                        lat:results[0].geometry.location.lat(), 
                        lng:results[0].geometry.location.lng()
                    }, status);
            } else {
                callback.call(null, null, status);
            }
        });
    }
    
    /**
     * Calculates "crow flies" distance between two locations
     * 
     * @param {object} position1 position 1
     * @param {object} position2 position 2
     * @returns {float} distance in meters
     */
    function _getCrowfliesDistance(position1, position2) {
        if ( 
                ( 'object' !== typeof(position1) ) 
                || ( 'undefined' === typeof(position1['lat']) ) 
                || ( 'undefined' === typeof(position1['lng']) ) 
            
                || ( 'object' !== typeof(position2) ) 
                || ( 'undefined' === typeof(position2['lat']) ) 
                || ( 'undefined' === typeof(position2['lng']) ) ) {
        
            throw new Error( errorMessages.__invalid_parameters__ );
        }
        
        return google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(position1['lat'], position1['lng']), 
                new google.maps.LatLng(position2['lat'], position2['lng']) );
    }
    /* </getters> */
    
    /* <setters> */
    /**
     * Sets container for object dom structure
     * 
     * @param {string} containerSelector container selector
     */
    function _setContainer(containerSelector) {
        if ( "string" !== typeof(containerSelector) ) {
            throw new Error( errorMessages.__selector_format_error__ );
        }
        var domElement = document.querySelector(containerSelector);
        if ( null === domElement ) {
            throw new Error( errorMessages.__dom_container_not_found__ );
        }
        mapContainer = domElement;
    }
    
    /**
     * Sets map zoom
     * 
     * @param {int} newZoom new zoom
     */
    function _setZoom(newZoom) {
        newZoom = parseInt(newZoom) || null;
        
        if ( null !== newZoom ) {
            mapZoom = newZoom;
        }
    }
    
    /**
     * Sets map start location
     * 
     * @param {object} objLocation
     */
    function _setStartLocation(objLocation) {
        if ( null === objLocation ) {
            startLocation = null;
        } else if ( 
                ("object" !== typeof(objLocation)) 
                || ("undefined" === typeof(objLocation["lat"])) 
                || ("undefined" === typeof(objLocation["lng"])) ) {
        
            throw new Error( errorMessages.__location_format_error__ );
        } else {
            var 
                lat = parseFloat(objLocation["lat"]) || null,
                lng = parseFloat(objLocation["lng"]) || null;

            if ( (null === lat) || (null === lng) ) {
                throw new Error( errorMessages.__location_format_error__ );
            }

            startLocation = {lat: lat, lng: lng};
        }
        
        if ( startLocation ) {
            map.panTo(startLocation);
        }
    }
    
    /**
     * Sets founded driving schools data from provided schools array
     * in a spacific format, filters it by provided maxAllowedDistanse
     * and creates markers for filtered schools
     * 
     * @param {array} schools Schools data array
     * @param {float|null} maxAllowedDistanse Max allowed distanse for schools filtration
     */
    function _setDrivingSchools(schools, maxAllowedDistanse) {
        
        if ( Array.isArray(schools) ) {
            var
                maxDistance = 0;
            
            maxAllowedDistanse = ('undefined' !== typeof(maxAllowedDistanse) ? (parseFloat(maxAllowedDistanse) || null) : null);
            
            for( var i=0; i < _drivingSchools.length; i++ ) {
                _drivingSchools[i]['marker'].setMap(null);
            }
            _drivingSchools = [];
            
            for( var i=0; i < schools.length; i++ ) {
                var 
                    lat = parseFloat(schools[i]["Latitude_admin_room"]),
                    lng = parseFloat(schools[i]["Longitude_admin_room"]),
                    objSchool = {
                        'lat': lat,
                        'lng': lng,
                        
                        'name': schools[i]["Business_commercial_name"],
                        'address': schools[i]["administrative_address_street_number"],
                        
                        'distance': _getCrowfliesDistance(startLocation, {'lat':lat, 'lng':lng}),
                        
                        'marker': null
                    };
                
                maxDistance = ( objSchool['distance'] > maxDistance ? objSchool['distance'] : maxDistance );
                if ( maxAllowedDistanse && (0 < maxAllowedDistanse) ) {
                    if ( objSchool['distance'] < maxAllowedDistanse ) {
                        _drivingSchools.push(objSchool);
                    }
                } else {
                    _drivingSchools.push(objSchool);
                }
            }
            
            if ( _showMarkers ) {
                for( var i=0; i < _drivingSchools.length; i++ ) {
                    var distancePrecentage = 1 - ( _drivingSchools[i]['distance'] / maxDistance );

                    _drivingSchools[i]['marker'] = new google.maps.Marker({
                        'title': _drivingSchools[i]['name'] + "\n" + _drivingSchools[i]['address'] + "\nDistance : " + _drivingSchools[i]['distance'].toFixed(0) + " m",
                        'map': map,
                        'icon': _generateMarkerImageByPrecentage(distancePrecentage),
                        'position': {lat:_drivingSchools[i]['lat'], lng:_drivingSchools[i]['lng']}
                    });
                }
            }
        }
    }
    
    /**
     * Sets _adRectangles basing on rectangles array of data
     * in a specific format, sets rectangles and labels on map
     * 
     * @param {array} rectangles array of ad rectangles data
     * @returns {undefined}
     */
    function _setAdRectangles(rectangles) {
        if ( ("undefined" !== typeof(rectangles)) && Array.isArray(rectangles) ) {
            for( var i=0; i < _adRectangles.length; i++ ) {
                if ( null !== _adRectangles[i]['rectangle'] ) {
                    _adRectangles[i]['rectangle'].setMap(null);
                    _adRectangles[i]['txtOverlay'].setMap(null);
                }
            }
            _adRectangles = [];
            
            for( var i=0; i < rectangles.length; i++ ) {
                var 
                    objAdRectangle = {
                        'leftTopPosition': {'lat':rectangles[i][1], 'lng':rectangles[i][3]},
                        'rightBottomPosition': {'lat':rectangles[i][0], 'lng':rectangles[i][2]},
                        'title': rectangles[i][4],
                        'areaId': rectangles[i][5],
                        'advertisers': [],
                        'rectangle': null,
                        'txtOverlay': null
                    };
                
                if ( _showAdRectangles ) {
                    objAdRectangle['rectangle'] = new google.maps.Rectangle({
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                        fillColor: '#3a87ad',
                        fillOpacity: 0.15,
                        //clickable: false, // important otherwise click on map doesn't work as the rectangle is on top
                        
                        map: map,
                        bounds: {
                            north: objAdRectangle['leftTopPosition']['lat'],
                            south: objAdRectangle['rightBottomPosition']['lat'],
                            east:  objAdRectangle['rightBottomPosition']['lng'],
                            west:  objAdRectangle['leftTopPosition']['lng']
                        }
                    });
                    objAdRectangle['rectangle'].adRectangleId = rectangles[i][5];
                    objAdRectangle['rectangle'].addListener('click', function(ev) {
                        var objAdRectangle = self.getAdRectangleById(this.adRectangleId);
                        if ( 'undefined' !== typeof(_adRectangleOnClickCallback) ) {
                            _adRectangleOnClickCallback.call(null, objAdRectangle);
                        }
                    });
                    
                    var overlayTemplate = 
                        "<div>"
                            + (objAdRectangle['title'] ? objAdRectangle['title'] : "")
                        + "</div>"
                        ;
                    objAdRectangle['txtOverlay'] = CreateTxtOverlay(
                        new google.maps.LatLng(objAdRectangle['rightBottomPosition']['lat'], objAdRectangle['leftTopPosition']['lng']), 
                        overlayTemplate, 
                        "textOverlay", map);
                }
                
                _adRectangles.push( objAdRectangle);
            }
        }
    }
    
    /**
     * Updates ad rectangle (text overlay content and advertisers info) 
     * for _adRectangles and map element
     * 
     * @param {int} rectangleId rectangle areaId
     * @param {object} data Data to update
     */
    function _updateAdRectangleById(rectangleId, data) {
        if ( _showAdRectangles ) {
            for(var i=0; i < _adRectangles.length; i++ ) {
                if ( rectangleId == _adRectangles[i]['areaId'] ) {
                    if ( 'object' === typeof(data) ) {
                        if ( 'undefined' !== typeof(data['content']) ) {
                            _adRectangles[i]['txtOverlay'].updateContent(data['content']);
                        }
                        if ( ('undefined' !== typeof(data['advertisers'])) && Array.isArray(data['advertisers']) ) {
                            _adRectangles[i]['advertisers'] = data['advertisers'];
                        }
                    }
                    
                    break;
                }
            }
        }
    }
    /* </setters> */
    
    self = {
        init: function(options) {
            if ( "object" === typeof(options) ) {
                if ( "undefined" !== typeof(options["container"]) ) {
                    _setContainer( options["container"] );
                }
                if ( "boolean" === typeof(options["showMarkers"]) ) {
                    _showMarkers = options["showMarkers"];
                }
                
                if ( "undefined" !== typeof(options["zoom"]) ) {
                    _setZoom( options["zoom"] );
                }
                if ( "undefined" !== typeof(options["startLocation"]) ) {
                    _setStartLocation( options["startLocation"] );
                }
                if ( "function" === typeof(options["onStartLocationChange"]) ) {
                    _onStartLocationChange = options["onStartLocationChange"];
                }
                if ( "function" === typeof(options["adRectangleOnClickCallback"]) ) {
                    _adRectangleOnClickCallback = options["adRectangleOnClickCallback"];
                }                
            }

            _initMap();
            _setStartLocation(startLocation);
            
            return self;
        },
        
        addOnClickCallback: function(callback) {
            _addOnClickCallback(callback);
        },
        removeOnClickCallbacl: function(callback) {
            _removeOnClickCallback(callback);
        },
        requirePositionByClick: function(callback) {
            _requirePositionByClick(callback);
        },
        
        /* <setters> */
        setContainer: function(containerSelector) {
            _setContainer(containerSelector);
            return self;
        },
        
        setOnStartLocationChange: function(callback) {
            if ( 'function' === typeof(callback) ) {
                _onStartLocationChange = callback;
            }
        },
        setStartLocation: function(objLocation) {
            _setStartLocation(objLocation);
        },
        updateStartLocationMarker: function(objLocation, title) {
            _setStartLocation(objLocation);
            _updateStartLocationMarker(title);
           return self;
        },
        
        setDrivingSchools: function(schools, distance) {
            _setDrivingSchools(schools, distance);
        },
        setAdRectangles: function(rectangles) {
            _setAdRectangles(rectangles);
        },
        updateAdRectangleById: function(rectangleId, data) {
            _updateAdRectangleById(rectangleId, data);
        },
        setZoom: function(zoom) {
            zoom = ( 'undefined' !== typeof(zoom) ? parseInt(zoom) || null : null);
            if ( zoom ) {
                mapZoom = zoom;
                if ( map ) {
                    map.setOptions({zoom:mapZoom});
                }
            }
        },
        setMinZoom: function(minZoom) {
            minZoom = ( 'undefined' !== typeof(minZoom) ? parseInt(minZoom) || null : null);
            if ( minZoom ) {
                mapMinZoom = minZoom;
                if ( map ) {
                    map.setOptions({minZoom:mapMinZoom});
                }
            }
        },
        /* </setters> */
        
        /* <getters> */
        getClientGeolocation: function(onSuccessCallback, onFailCallback) {
            _getClientGeolocation(onSuccessCallback, onFailCallback);
            return self;
        },
        getAddressByPosition: function(objLocation, callback) {
            _getAddressByPosition(objLocation, callback);
            return self;
        },
        getPositionByAddress: function(address, callback) {
            _getPositionByAddress(address, callback);
            return self;
        },
        getCrowfliesDistance: function(position1, position2) {
            return _getCrowfliesDistance(position1, position2);
        },
        getDrivingSchools: function() {
            var arrDS = [];
            for(var i=0; i < _drivingSchools.length; i++) {
                arrDS.push({
                    'lat': _drivingSchools[i]['lat'],
                    'lng': _drivingSchools[i]['lng'],

                    'name': _drivingSchools[i]['name'],
                    'address': _drivingSchools[i]['address'],

                    'distance': parseInt(_drivingSchools[i]['distance'])
                });
            }
            
            arrDS = arrDS.sort(function(a,b) {
                if ( a['distance'] > b['distance'] ) {
                    return 1;
                } else if ( a['distance'] === b['distance'] ) {
                    return 0;
                } else {
                    return -1;
                }
            });
            return arrDS;
        },
        getAdRectangles: function() {
            return _adRectangles;
        },
        getAdRectangleById: function(rectangleID) {
            if ( _adRectangles ) {
                for( var i=0; i < _adRectangles.length; i++ ) {
                    if ( rectangleID == _adRectangles[i]['areaId']) {
                        return _adRectangles[i];
                    }
                }
            }
            return null;
        },
        getStartLocation: function() {
            return startLocation;
        },
        getMap: function() {
            return map;
        }
        /* </getters> */
    };
    return self;
}