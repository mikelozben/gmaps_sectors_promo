/**
 * A class to interact with banner
 */

function Sidebar () {
    var
        self = {},
        objGMap = null, /* GMap instance */
        onDetectLocationMapZoom = 11,
        
        sections = {
            "geolocation": {
                enabled: true,
                focused: true,
                title: "Geolocation",
                address: null,
                coordinates: {lat:null, lng:null},
                'disable-reason': ''
            },
            "home": {
                enabled: true,
                focused: false,
                title: "Home Address",
                address: null,
                coordinates: {lat:null, lng:null}
            },
            "work": {
                enabled: true,
                focused: false,
                title: "Work Address",
                address: null,
                coordinates: {lat:null, lng:null}
            }
        },
        addressInputRequested = false,
        
        labelDetailsClickCallback = null,
        labelDirectInputClickCallback = null,
        drivingSchoolsSearchClickCallback = null,
        
        $container = null,

        errorMessages = {
            __dom_container_not_found__:        "DOM Element for sidebar not found...",
            __template_not_found_or_invalid__:  "Sidebar template not found or invalid...",
            
            __section_not_found_or_invalid__:   "Sidebar section not found or invalid...",
            
            __gmap_not_provided__:              "GMap instance not provided...",
        };
    
    /**
     * Updates sidebar data basing on given data object for given section
     * 
     * @param {string} section Section name
     * @param {object} data Data to update
     */
    function _updateSidebar(section, data) {
        if ( ("string" !== typeof(section)) || ("undefined" === typeof(sections[section])) ) {
            throw new Error( errorMessages.__section_not_found_or_invalid__ );
        }
        
        if ( "object" === typeof(data) ) {
            for( var prop in data ) {
                if ( "undefined" !== typeof(sections[section][prop]) ) {
                    sections[section][prop] = data[prop];
                }
            }
        }
        
        _refresh();
    }
    
    /**
     * Refreshes sidebar dom structure basing on data
     */
    function _refresh() {
        for(var section in sections) {
            var $sectionRow = $container.find('.row-' + section);
            if ( 0 < $sectionRow.length ) {
                if ( false === sections[section]['enabled'] ) {
                    $sectionRow.addClass('disabled');
                    
                    $sectionRow.find('.label-details')
                            .css('display', 'inline-block');
                    
                    $sectionRow.find('.label-position-by-input')
                            .removeClass('label-success')
                            .addClass('label-default');
                    
                    $sectionRow.find('.label-position-by-click')
                            .removeClass('label-success')
                            .addClass('label-default');
                    
                    if ( 'undefined' !== typeof(sections[section]['disable-reason']) ) {
                        $sectionRow.find('.col-disable-reason').html( sections[section]['disable-reason'] );
                    }
                } else {
                    $sectionRow.removeClass('disabled');
                    $sectionRow.find('.label-section-title')
                            .removeClass('label-default');
                    
                    $sectionRow.find('.label-details')
                            .hide();
                    
                    $sectionRow.find('.label-position-by-input')
                            .removeClass('label-default')
                            .addClass('label-success');
                    
                    $sectionRow.find('.label-position-by-click')
                            .removeClass('label-default')
                            .addClass('label-success');
                    
                    if ( false === sections[section]['focused'] ) {
                        $sectionRow.removeClass('focused');
                        $sectionRow.find('.label-section-title')
                                .removeClass('label-success')
                                .addClass('label-info');
                    } else {
                        $sectionRow.addClass('focused');
                        $sectionRow.find('.label-section-title')
                                .removeClass('label-info')
                                .addClass('label-success');
                    }
                }
                
                $sectionRow.find('.label-section-title').html( (null !== sections[section]['title'] ? sections[section]['title'] : '-NOT SPECIFIED-') );
                $sectionRow.find('.col-address').html( (null !== sections[section]['address'] ? sections[section]['address'] : '-NOT SPECIFIED-') );
                
                if ( (null !== sections[section]['coordinates']['lat']) && (null !== sections[section]['coordinates']['lng']) ) {
                    // if section coordinates are provided
                    $sectionRow.find('.col-coordinates').html( 
                           'lat : ' + sections[section]['coordinates']['lat'] + "<br>\n"
                            + 'lng : ' + sections[section]['coordinates']['lng'] + "<br>\n");
                    
                    if ( true === sections[section]['focused'] ) {
                        $container.find('.row-controls').show();
                    }
                } else {
                    // if section coordinates are NOT provided
                    $sectionRow.find('.col-coordinates').html( '-NOT SPECIFIED-' );
                    
                    if ( true === sections[section]['focused'] ) {
                        $container.find('.row-controls').hide();
                    }
                }
                
                if ( true === addressInputRequested ) {
                    // if address requested for section by direct input 
                    $sectionRow.find('.label-position-by-input')
                            .removeClass('label-success')
                            .addClass('label-default');
                    
                    $sectionRow.find('.label-position-by-click')
                            .removeClass('label-success')
                            .addClass('label-default');
                } else if ( true === sections[section]['enabled'] ) {
                    $sectionRow.find('.label-position-by-input')
                            .removeClass('label-default')
                            .addClass('label-success');
                    
                    $sectionRow.find('.label-position-by-click')
                            .removeClass('label-default')
                            .addClass('label-success');
                }
            }
        }
    }
    
    /* <handlers */
    /**
     * On section title click callback.
     * Switches between sections
     * 
     * @param {object} el Title dom element
     */
    function _onSectionTitleClick(el) {
        var 
            targetSection = el.dataset['section'] || null;
        
        if ( ("undefined" !== typeof(sections[targetSection])) && (true === sections[targetSection]['enabled']) ) {
            for(var section in sections) {
                if ( targetSection !== section ) {
                    sections[section]['focused'] = false;
                } else {
                    sections[section]['focused'] = true;
                }
            }
            
            if ( (null !== sections[targetSection]['coordinates']['lat']) && (null !== sections[targetSection]['coordinates']['lng']) ) {
                objMap.updateStartLocationMarker(sections[targetSection]['coordinates'], sections[targetSection]['title']);
                objMap.setZoom(onDetectLocationMapZoom);
            } else {
                objMap.updateStartLocationMarker(null, sections[targetSection]['title']);
            }
            
            _refresh();
        }
    }
    
    /**
     * On "Input directly" click callback.
     * Disables sections position determining buttons 
     * and calls labelDirectInputClickCallback for section
     * 
     * @param {type} el
     */
    function _onDirectInputClick(el) {
        var 
            targetSection = el.dataset['section'] || null;
        
        if ( (false === addressInputRequested) && (null !== targetSection) ) {
            if ( null !== labelDirectInputClickCallback ) {
                addressInputRequested = true;
                _refresh();
                
                // calls labelDirectInputClickCallback function 
                labelDirectInputClickCallback.call(el, targetSection, function(address) {
                    // on address determining complete
                    if ( ("string" === typeof(address)) && (address.length > 0) ) {
                        // getting position for provided address
                        objMap.getPositionByAddress(address, function(position, status) {
                            sections[targetSection]['address'] = address;
                            if ( position ) {
                                sections[targetSection]['coordinates'] = position;
                            } else {
                                sections[targetSection]['coordinates'] = '-NOT SPECIFIED-';
                            }
                            
                            addressInputRequested = false;
                            _onSectionTitleClick({'dataset':{'section':targetSection}});
                        });
                    } else {
                        addressInputRequested = false;
                        _onSectionTitleClick({'dataset':{'section':targetSection}});
                    }
                });
            }
        }
    }
    
    /**
     * On "More info" click callback,
     * calls labelDetailsClickCallback if provided
     * 
     * @param {object} el Dom element of "More info" button
     */
    function _onLabelDetailsClick(el) {
        if ( 'function' === typeof(labelDetailsClickCallback) ) {
            labelDetailsClickCallback.call(el);
        }
    }
    
    /**
     * Disables sections position determining buttons 
     * and updates sections on position&address determining success
     * 
     * @param {object} el Dom element of "Set on map" button
     */
    function _onSetOnMapClick(el) {
        var 
            targetSection = el.dataset['section'] || null;
        
        if ( null === objGMap ) {
            throw new Error( errorMessages.__gmap_not_provided__ );
        }
        
        if ( 
                ("undefined" !== sections[targetSection]) 
                && (true === sections[targetSection]['enabled']) 
                && (true !== addressInputRequested) ) {
            
            addressInputRequested = true;
            _refresh();
            
            // requires position by click
            objGMap.requirePositionByClick(function(position) {
                // on complete - determins address of given position
                objMap.getAddressByPosition(position, function(res, stat){
                    // on success - update sections 
                    addressInputRequested = false;

                    sections[targetSection]['coordinates']['lat'] = position.lat;
                    sections[targetSection]['coordinates']['lng'] = position.lng;
                    
                    if ( res && ('string' === typeof(res)) ) {
                        sections[targetSection]['address'] = res;
                    }
                    _onSectionTitleClick({'dataset':{'section':targetSection}});
                });                
            });
        }
    }
    
    /**
     * On "Search driving schools" button click callback,
     * calls drivingSchoolsSearchClickCallback
     */
    function _onDrivingSchoolsSearchClick() {
        for( var section in sections ) {
            if ( 
                    ( true === sections[section]['focused'] )
                    && ( null !== sections[section]['coordinates']['lat'] )
                    && ( null !== sections[section]['coordinates']['lng'] ) ) {
                if ( 'function' === typeof(drivingSchoolsSearchClickCallback) ) {
                    drivingSchoolsSearchClickCallback.call(null, 
                        sections[section]['coordinates'], 
                        parseFloat($container.find('input.search-distance').val())*1000 || null);
                }
            }
        }
    }
    /* </handlers */
    
    /**
     * Returns currently focused section name
     * @returns {string} Section name
     */
    function _getSelectedSection() {
        for(var section in sections) {
            if ( true === sections[section]['focused'] ) {
                return section;
            }
        }
        return null;
    }
    
    self = {
        init: function(options) {
           if ( "object" === typeof(options) ) {
                if ( "string" === typeof(options["container"]) ) {
                    $container = $(options["container"]);
                }
                if ( "object" === typeof(options["sections"]) ) {
                    for( var section in options["sections"] ) {
                        _updateSidebar(section, options["sections"][section]);
                    }
                }
                if ( "object" === typeof(options["gmap"]) ) {
                    objGMap = options["gmap"];
                }
                if ( "undefined" !== typeof(options["onDetectLocationMapZoom"]) ) {
                    onDetectLocationMapZoom = parseInt(options["onDetectLocationMapZoom"]) || onDetectLocationMapZoom;
                }
                
                if ( "function" === typeof(options["labelDetailsClickCallback"]) ) {
                    labelDetailsClickCallback = options["labelDetailsClickCallback"];
                }
                if ( "function" === typeof(options["labelDirectInputClickCallback"]) ) {
                    labelDirectInputClickCallback = options["labelDirectInputClickCallback"];
                }
                if ( "function" === typeof(options["drivingSchoolsSearchClickCallback"]) ) {
                    drivingSchoolsSearchClickCallback = options["drivingSchoolsSearchClickCallback"];
                }
            }
            
            if ( 0 >= $container ) {
                throw new Error( errorMessages.__dom_container_not_found__ );
            }
            
            $container.on("click", ".label-section-title", function(ev) {
                _onSectionTitleClick(this);
            });
            $container.on("click", ".label-position-by-click", function(ev) {
                _onSetOnMapClick(this);
            });
            $container.on("click", ".label-position-by-input", function(ev) {
                _onDirectInputClick(this);
            });
            $container.on("click", ".btn-disable-info", function(ev) {
                _onLabelDetailsClick(this);
            });
            $container.on("click", ".label-search-schools", function(ev) {
                _onDrivingSchoolsSearchClick(this);
            });
            $container.on("change", "input.search-distance", function(ev) {
                _onDrivingSchoolsSearchClick(this);
            });
        },
        update: function(section, data) {
            _updateSidebar(section, data);
        },
        getSelectedSection: function() {
            return _getSelectedSection();
        }, 
        resetAddressInputRequested: function() {
            if ( addressInputRequested ) {
                addressInputRequested = false;
                _refresh();
            }
        }
    };
    return self;
}