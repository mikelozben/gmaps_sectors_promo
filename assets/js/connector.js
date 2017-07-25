/**
 * A class to interact with application database and advertisings sequencing
 */

function Connector () {
    var
        self = {},
        
        _position = null,
        _updateSpeed = 2 * 1000, /*milliseconds*/
        _nextAdInterval = null,
        
        _objBanner = null, /* instance of Banner */
        _showAd = true,
        
        _data = {}
    ;

    /******************************************************************************
     * Generate a sequence of advertisers based on the current location.
     * The sequence is stored in the session and regenerated
     * only when the home location changes.
     * 
     * After generating the sequence update the advertising.
     */
    function generateSequence() {
        if ( null !== _position ) {
            var sequence = [];
            $.ajax({
                type : "POST",
                url : "assets/php/sequenceAdvertisersFrequency.php",
                data: { latitude: _position['lat'], longitude : _position['lng'] } ,
                dataType: 'json',
                success : function (sequence) {
                    //console.log( '[generateSequence] sequence : ', sequence);
                }
            });
        }
    }

    /******************************************************************************
     * Increment the view counter,
     * most likely becasue the user has changed his home location.
     */
    function incrementAdViewCounter() {
        $.ajax({
            type : "POST",
            url : "assets/php/increment_ad_view_counter.php",
            dataType: 'json',
            success : function (counter) {
                //console.log('[incrementAdViewCounter] counter : ', counter);
            }
        });
    }
    
    /******************************************************************************
     * Update advertisement based on the next advertiser in the sequence
     */
    function updateAds() {
        $.ajax({
            type : "POST",
            url : "assets/php/updateAds.php",
            dataType: 'json',
            success : function (advertiser) {
                //console.log('[updateAds] advertiser : ', advertiser);
                if ( advertiser ) {
                    var bannerContent = advertiser['banner']+"==="+advertiser['name']+"==="+advertiser['address'];
                    if ( objBanner ) {
                        objBanner.update({"content": bannerContent});
                    }
                }
            }
        });
    }

    /**
     * Restarts advertising sequence basing on current position
     */
    function _restartAdSequence() {
        if ( null !== _nextAdInterval ) {
            clearInterval(_nextAdInterval);
            _nextAdInterval = null;
        }
        if ( null !== _position ) {
            incrementAdViewCounter();
            generateSequence();            
            _nextAdInterval = setInterval(self.showNextAdvertiser, _updateSpeed);
        }
    }
    
    /**
     * Load driving schools data and place marker for each.
     * data consists of latitude, longitude, name, address
     */
    function _loadDrivingSchools(position, distance, completeCallback) {
        if ( position ) {
            $.ajax({
                type : "POST", 
                url : "assets/php/loadDrivingSchoolsLocationData.php",
                dataType: 'json',
                success : function (schools) {
                    if ( schools && ('function' === typeof(completeCallback)) ) {
                        completeCallback.call(null, schools);
                    }
                }
            });
        }
    }
    
    /**
     * Load all advertising rectangles
     * TODO add viewport boundaries
     */
    function _loadAllAdRectangles(completeCallback, mapBounds) {
    	// find boundary of displayed part of map,
    	// only display areas inside or overlapping that boundary,
    	// again to limit the amount of data to be displayed
    	
    	// TODO reference map object !
    	var ne = mapBounds.getNorthEast();
        var sw = mapBounds.getSouthWest();
        var west = sw.lng();
        var east = ne.lng();
        var north = ne.lat();
        var south = sw.lat();
        
        $.ajax({
            type : "POST", 
            url : "assets/php/loadAdvertisingGridAreasRectangles.php",
    		data: { west: west, east : east, north: north, south: south} ,
            dataType: 'json',
            success : function (adRectangles) {
                if ( ('undefined' !== typeof(adRectangles)) && Array.isArray(adRectangles) ) {
                    if ( 'function' === typeof(completeCallback) ) {
                        completeCallback.call(null, adRectangles);
                    }
                }
            }
        });
    }
    
    /**
     * Find the advertising area id based on a latitude and longitude point
     */
    function _loadAdRectangle(position, onSuccess) {
        $.ajax({
            type : "POST",
            url : "assets/php/findAdvertisingArea.php",
            data: { latitude: position['lat'], longitude : position['lng']},
            dataType: 'json',
            success : function (adRectangles) {
                if ( 'function' === typeof(onSuccess) ) {
                    onSuccess.apply(null, Array.isArray(adRectangles) ? adRectangles[0] : adRectangles);
                }
            }
        });
    }
    
    /**
     * Find the advertisers for an area
     */
    function _loadAdvertisersByAreaId(areaID, completeCallback) {
        $.ajax({
            type : "POST",
            url : "assets/php/findAdvertisersInArea.php",
            data: { areaID: areaID} ,
            dataType: 'json',
            success : function (advertisers) {
                if ( ('undefined' === typeof(advertisers)) || !Array.isArray(advertisers) ) {
                    advertisers = [];
                }
                if ( 'function' === typeof(completeCallback) ) {
                    completeCallback.call(null, advertisers, areaID);
                }
            }
        });
    }
    
    /**
     * Updates(saves) advertiser frequency for given ad rectangle
     * 
     * @param {int} advertiserId   Advertiser id
     * @param {int} areaId         Area id
     * @param {int} newFrequency   New frequency
     * @param {function} onSuccess On update success callback function
     */
    function _updateAdvertiserFrequency(advertiserId, areaId, newFrequency, onSuccess) {
        $.ajax({
            type : "POST",
            url : "assets/php/manageAdvertiserInArea.php",
            data: { 
                'action': 'edit-frequency',
                'area-id': areaId,
                'advertiser-id': advertiserId,
                'frequency': newFrequency
            },
            dataType: 'json',
            success : function (response) {
                if ( 'object' === typeof(response) ) {
                    if ( 'undefined' === typeof(response['error']) ) {
                        if ('function' === typeof(onSuccess)) {
                            onSuccess.call(null, newFrequency, areaId, advertiserId);
                        }
                    } else {
                        alert('Failed to save frequency : ' + response['error']);
                    }
                }
            }
        });
    }
    
    /**
     * Removes advertiser from ad rectangle
     * 
     * @param {int} advertiserId    Advertiser id
     * @param {int} areaId          Area id
     * @param {function} onSuccess  On remove success callback function
     */
    function _removeAdvertiserFromArea(advertiserId, areaId, onSuccess) {
        $.ajax({
            type : "POST",
            url : "assets/php/manageAdvertiserInArea.php",
            data: { 
                'action': 'remove-advertiser',
                'area-id': areaId,
                'advertiser-id': advertiserId
            },
            dataType: 'json',
            success : function (response) {
                if ( 'object' === typeof(response) ) {
                    if ( 'undefined' === typeof(response['error'])) {
                        if ( 'function' === typeof(onSuccess) ) {
                            onSuccess.call(null, areaId, advertiserId);
                        }
                    } else {
                        alert('Failed to remove advertiser : ' + response['error']);
                    }
                }
            }
        });
    }
    
    self = {
        /* <ad init, generate && sequencing> */
        setPosition: function(position) {
            _position = position;
            
            if ( _showAd ) {
                generateSequence();
            }
        },
        changePosition: function(position) {
            _position = position;
            
            if ( _showAd ) {
                incrementAdViewCounter();
                generateSequence();
            }
        },
        
        showNextAdvertiser: function() {
            if ( _showAd ) {
                updateAds();
            }
        },
        
        restartAdSequence: function() {
            if ( _showAd ) {
                _restartAdSequence();
            }
        },
        stopAdSequence: function() {
            if ( _showAd ) {
                if ( null !== _nextAdInterval ) {
                    clearInterval(_nextAdInterval);
                    _nextAdInterval = null;
                }
            }
        },
        
        setBanner: function(banner) {
            _objBanner = banner;
        },
        /* </ad init, generate && sequencing> */
        
        
        /* <data requests> */
        loadDrivingSchools: function(position, distance, completeCallback) {
            _loadDrivingSchools(position, distance, completeCallback);
        },
        loadAllAdRectangles: function(completeCallback, mapBounds) {
            _loadAllAdRectangles(completeCallback, mapBounds);
        },
        loadAdRectangle: function(position) {
            _loadAdRectangle(position);
        },
        loadAdvertisersByAreaId: function(areaID, completeCallback) {
            _loadAdvertisersByAreaId(areaID, completeCallback);
        },
        /* </data requests> */
        
        /* <data manipulation queries> */
        updateAdvertiserFrequency:function(advertiserId, areaId, newFrequency, onSuccess) {
            _updateAdvertiserFrequency(advertiserId, areaId, newFrequency, onSuccess);
        },
        removeAdvertiserFromArea:function(advertiserId, areaId, onSuccess) {
            _removeAdvertiserFromArea(advertiserId, areaId, onSuccess);
        }
        /* </data manipulation queries> */
    };
    return self;
}