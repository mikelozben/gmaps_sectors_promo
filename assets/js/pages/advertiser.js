/**
 * Js file for advertiser page, with initialization & event handlers
 */

/*
* Global variables to interact with google map and connector.
* adRectangles - advertising rectangles
*/
var
    objMap = new GMap(),
    objConnector = new Connector(),
    adRectangles = null,
    adRectangleStyles = {
        'default': {'fillColor':'#3a87ad', 'strokeColor':'#FF0000'},
        'advertiserInside': {'fillColor':'#468847', 'strokeColor':'#468847'},
        'areaSelected': {'fillColor':'#D87428', 'strokeColor':'#D87428'}
    }, 
    selectedAreaId = null;

/**
 * Function updates advertisement rectangle's data and map element
 * basing on provided ad rectangle object
 * 
 * @param {object} objAdRectangle object with ad rectangle data
 */
function updateAdRectangle(objAdRectangle) {
    
    var txtContent = "",
        advertiserID = $('input.advertiser_id').val(),
        isAdvertiserPresented = false,
        advCount = 0,
        currAdvFreq = 0;

    // recalculates sum frequency and number of advertisers,
    // detects if current advertiser is linked and if so - stores it's stats
    for(var j=0; j < objAdRectangle['advertisers'].length; j++ ) {
        advCount++;
        if ( objAdRectangle['advertisers'][j]['id'] == advertiserID ) {
            isAdvertiserPresented = true;
            currAdvFreq = parseInt(objAdRectangle['advertisers'][j]['frequency']);
        }
    }


    if ( selectedAreaId === objAdRectangle['areaId'] ) {
        objAdRectangle['rectangle'].setOptions( adRectangleStyles['areaSelected'] );
    } else if ( isAdvertiserPresented ) {
        // if advertiser already exists in current rectangle - make rectangle "blue"
        objAdRectangle['rectangle'].setOptions( adRectangleStyles['advertiserInside'] );
    } else {
        objAdRectangle['rectangle'].setOptions( adRectangleStyles['default'] );
    }

    // forming rectangle content for map element
    txtContent = 
        "<div class=\"area-content" + (isAdvertiserPresented ? " area-enabled" : "") + "\">"
            + (objAdRectangle['title'] ? objAdRectangle['title'] : "")
            + "<br><br>Advertisers : " + advCount
            + "<br>Available frequency : " + (advCount > 0 ? 
                    ( isAdvertiserPresented ? parseInt(100 / advCount) : parseInt(100 / (advCount+1)) ) : 100)
            + (isAdvertiserPresented ? "<br>Your frequency : " + currAdvFreq : "")
        + "</div>";

    // updates advertisers data and map element content for rectangle in objMap
    objMap.updateAdRectangleById(objAdRectangle['areaId'], {
        'content': txtContent,
        'advertisers': objAdRectangle['advertisers']
    });                            
}

/**
 * All ad rectangles data load complete callback
 * processing all ad rectangles to specific format
 * 
 * @param {array} rectangles Loaded ad rectangles data
 */
function onAdRectanglesLoad(rectangles) {
    if ( ('undefined' !== typeof(rectangles)) && Array.isArray(rectangles) ) {
        // forms ad rectangles data inside objMap
        objMap.setAdRectangles(rectangles);
        // gets formatted ad rectangles
        adRectangles = objMap.getAdRectangles();
        
        // for each ad rectangle loads advertisers
        for( var i=0; i < adRectangles.length; i++ ) {
            var objRectangle = adRectangles[i];
            //console.log('objRectangle : ', adRectangles[i]);
            if ( 'undefined' !== typeof(adRectangles[i]['areaId']) ) {
                objConnector.loadAdvertisersByAreaId(adRectangles[i]['areaId'], function(advertisers, areaId){
                    //console.log('advertisers : ', advertisers);
                    for( var i=0; i < adRectangles.length; i++ ) {
                        if ( areaId == adRectangles[i]['areaId'] ) {
                            var objRectangle = adRectangles[i];
                            objRectangle['advertisers'] = [];
                            for( var j=0; j < advertisers.length; j++ ) {
                                // for each advertiser adds info to ad rectangle in a spacific format
                                objRectangle['advertisers'].push({
                                    'id':advertisers[j]['id_advertiser'],
                                    'name':advertisers[j]['Business_commercial_name'],
                                    'frequency':advertisers[j]['frequency']
                                });
                            }
                            
                            // updates ad rectangle data & map element
                            updateAdRectangle(objRectangle);
                            break;
                        }
                    }
                });
            }
        }
    }
}

/**
 * On ad rectangle map element click callback
 * Displays information about selected ad rectangle on sidebar
 * 
 * @param {object} objAdRectangle
 */
function onAdRectangleClick(objAdRectangle) {
    if ( objAdRectangle ) {
        var 
            advsCount = 0,
            sumFrequency = 0,
            currAdFrequency = 0,
            advertiserID = $('input.advertiser_id').val(),
            isAdvertiserPresented = false;
    
        $('.col-area-details .row-advertisers').empty();
        if ( objAdRectangle['advertisers'] ) {
            for( var i=0; i < objAdRectangle['advertisers'].length; i++ ) {
                advsCount++;
                sumFrequency += parseInt(objAdRectangle['advertisers'][i]['frequency']);
                
                if ( advertiserID == objAdRectangle['advertisers'][i]['id'] ) {
                    currAdFrequency = parseInt(objAdRectangle['advertisers'][i]['frequency']);
                    isAdvertiserPresented = true;
                }
                $('.col-area-details .row-advertisers').append(
                    "<div class=\"span6 title\">Name :</div>"
                    + "<div class=\"span6 adv adv-name\">"+ objAdRectangle['advertisers'][i]['name'] + "</div>"
            
                    + "<div class=\"span6 title adv-end\">Frequency :</div>"
                    + "<div class=\"span6 adv adv-end adv-frequency\">"+ objAdRectangle['advertisers'][i]['frequency'] + "</div>"
                     + "</div>");
            }
        }
    
        $('.col-area-details .col-area-title').html( (objAdRectangle['title'] ? objAdRectangle['title'] : "-NOT PROVIDED-"));
        $('.col-area-details .col-area-adv-number').html( advsCount );
        $('.col-area-details .col-available-frequency').html( (advsCount > 0 ? 
                    ( isAdvertiserPresented ? parseInt(100 / advsCount) : parseInt(100 / (advsCount+1)) ) : 100) );
        
        $('.col-area-details input.area-frequency').val( currAdFrequency );
        
        //linking ad rectangle "areaId" to buttons dom elements as properties for 
        // future usage
        $('button.btn-save')[0].dataset['areaId'] = objAdRectangle['areaId'];
        $('button.btn-remove')[0].dataset['areaId'] = objAdRectangle['areaId'];
        
        if ( isAdvertiserPresented ) {
            $('button.btn-remove').show();
        } else {
            $('button.btn-remove').hide();
        }
        
        $('.col-area-details').css('visibility', 'visible');
        
        selectedAreaId = objAdRectangle['areaId'];
    } else {
        selectedAreaId = null;
        $('.col-area-details').css('visibility', 'hidden');
    }
    
    for( var i=0; i < adRectangles.length; i++ ) {
        updateAdRectangle(adRectangles[i]);
    }
}

/**
 * On button "Save" click callback
 * Processing save operation for current ad rectangle
 * 
 * @param {string} areaId
 */
function onSaveClick(areaId) {
    var 
        advertiserId = $('input.advertiser_id').val(),
        newFrequency = $('.col-area-details input.area-frequency').val();
    
    // updates ad rectangle data in database using connector
    objConnector.updateAdvertiserFrequency(advertiserId, areaId, newFrequency, function(data){
        // on success update - reloads advertisers for saved ad rectangle 
        // and updates global adRectangles, objMap adRectangles data and sidebar
        objConnector.loadAdvertisersByAreaId(areaId, function(advertisers, _areaId){
            //console.log('advertisers : ', advertisers);
            for( var i=0; i < adRectangles.length; i++ ) {
                if ( _areaId == adRectangles[i]['areaId'] ) {
                    var objRectangle = adRectangles[i];
                    objRectangle['advertisers'] = [];
                    for( var j=0; j < advertisers.length; j++ ) {
                        objRectangle['advertisers'].push({
                            'id':advertisers[j]['id_advertiser'],
                            'name':advertisers[j]['Business_commercial_name'],
                            'frequency':advertisers[j]['frequency']
                        });
                    }

                    updateAdRectangle(objRectangle);
                    onAdRectangleClick(objRectangle);
                    break;
                }
            }
        });
    });
}

/**
 * On remove button click callback
 * process remove action for current ad rectangle
 * 
 * @param {string} areaId
 */
function onRemoveClick(areaId) {
    var 
        advertiserId = $('input.advertiser_id').val(),
        newFrequency = $('.col-area-details input.area-frequency').val();
    
    // updates advertiser from ad rectangle in database using connector
    objConnector.removeAdvertiserFromArea(advertiserId, areaId, function(data){
        // on success remove - reloads advertisers for processed ad rectangle 
        // and updates global adRectangles, objMap adRectangles data and sidebar
        objConnector.loadAdvertisersByAreaId(areaId, function(advertisers, _areaId){
            //console.log('advertisers : ', advertisers);
            for( var i=0; i < adRectangles.length; i++ ) {
                if ( _areaId == adRectangles[i]['areaId'] ) {
                    var objRectangle = adRectangles[i];
                    objRectangle['advertisers'] = [];
                    for( var j=0; j < advertisers.length; j++ ) {
                        objRectangle['advertisers'].push({
                            'id':advertisers[j]['id_advertiser'],
                            'name':advertisers[j]['Business_commercial_name'],
                            'frequency':advertisers[j]['frequency']
                        });
                    }

                    updateAdRectangle(objRectangle);
                    onAdRectangleClick(objRectangle);
                    break;
                }
            }
        });
    });
}

/**
 * Function calls whet client geolocation determining complete
 * 
 * @param {object|null} position            Current client geolocation position on success, null on fail
 * @param {PositionError|string} error      Error in case if user rejects request, string "Not Supported" if browser don't support geolocation
 */
function onDetermineClientGeolocationComplete(position, error) {
    if ( position ) {
        objMap.setZoom( 14 );
        objMap.setStartLocation(position);
        
        onAdRectanglesLoad([]);
    }
}

/**
 * Callback for goole maps api loaded
 */
function initMap() {
    var
        gmapInitParams = {
            "container": "#map-container",
            "showMarkers": false,
            "adRectangleOnClickCallback": onAdRectangleClick
        };
    
    objMap.init( gmapInitParams );
    objMap.setStartLocation( {lat:51.00, lng:4.25} );
    objMap.setZoom( 9 );
    
    objMap.getClientGeolocation(
        /*on success*/ function(position) { onDetermineClientGeolocationComplete(position, null);},
        /*on fail*/    function(gpError) { onDetermineClientGeolocationComplete(null, gpError);}
    );
    var map = objMap.getMap();
    
    var bounds = 0;
    google.maps.event.addListener(map, 'bounds_changed', function() {
    	bounds = bounds+1;
    });
    var dragit = 0;
    google.maps.event.addListener(map, 'dragend', function() {
    	dragit = dragit+1;
    });
    var zoomit = 0;
    google.maps.event.addListener(map, 'zoom_changed', function() {
    	zoomit = zoomit+1;
    });
    google.maps.event.addListener(map, 'idle', function(){
    	//alert("b="+bounds+"-d="+dragit+"-z="+zoomit);
    	if ( (bounds+dragit+zoomit) > 0 ) {
    		var zoom = this.getZoom();
	        if ( zoom < 14 ) {
	            onAdRectanglesLoad([]);
	            onAdRectangleClick(null);
	        } else {
	            objConnector.loadAllAdRectangles(onAdRectanglesLoad, this.getBounds());
	        }
    	}
    	bounds = 0;
    	dragit = 0;
    	zoomit = 0;
    });
    /*
    google.maps.event.addListenerOnce(map, 'idle', function(){

    	// first time load
    	var zoom = this.getZoom();
        if ( zoom < 14 ) {
            onAdRectanglesLoad([]);
        } else {
            objConnector.loadAllAdRectangles(onAdRectanglesLoad, this.getBounds());
        }

        google.maps.event.addListener(this, 'bounds_changed', function() {
        	alert('bounds_changed');
            //console.log('bounds_changed');
            var zoom = this.getZoom();
            
            if ( zoom < 14 ) {
                onAdRectanglesLoad([]);
            } else {
                objConnector.loadAllAdRectangles(onAdRectanglesLoad, this.getBounds());
            }
        });
        google.maps.event.addListener(this, 'dragend', function() {
        	//alert('dragend');
            var zoom = this.getZoom();
            
            if ( zoom < 14 ) {
                onAdRectanglesLoad([]);
                onAdRectangleClick(null);
            } else {
                objConnector.loadAllAdRectangles(onAdRectanglesLoad, this.getBounds());
            }
        });
        google.maps.event.addListener(this, 'zoom_changed', function() {
        	alert('zoom_changed');
        	var zoom = this.getZoom();
            
            if ( zoom < 14 ) {
                onAdRectanglesLoad([]);
                onAdRectangleClick(null);
            } else {
                objConnector.loadAllAdRectangles(onAdRectanglesLoad, this.getBounds());
            }
        });
    });
    */
}

$(document).ready(function() {
    $('input.advertiser_id').on('change', function() {
        // on change advertiser id callback - 
        // updates all global adRectangles and hide sidebar
        for( var i=0; i < adRectangles.length; i++ ) {
            updateAdRectangle(adRectangles[i]);
        }
        onAdRectangleClick(null);
    });
    $('button.btn-save').on('click', function() {
        onSaveClick(this.dataset['areaId']);
    });
    $('button.btn-remove').on('click', function() {
        onRemoveClick(this.dataset['areaId']);
    });
});
