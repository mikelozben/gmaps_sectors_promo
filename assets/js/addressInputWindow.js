/**
 * A class to interact with address input window
 */

function AddressInputWindow () {
    var
        self = {},
        
        $container = null,
        data = {
            title: null
        },
        _autocomplete = null,

        _positionCalculatingFunction = null,
        
        _onSetAddressCallback = null,
        
        _template = 
            "<div class=\"title\">\n"
                + "<div class=\"title-left\">&nbsp;</div>\n"
                + "<div class=\"title-center\">Address : </div>\n"
                + "<div class=\"title-right\">\n"
                    + "<button class=\"close\">&times;</button>\n"
                + "</div>\n"
            + "</div>\n"
            + "<div class=\"content\">\n"
                + "<input type=\"text\" class=\"address\" placeholder=\"Enter a location\" />&nbsp;<label class=\"label label-success label-apply\">Apply</label>"
            + "</div>\n",
        
        errorMessages = {
            __dom_container_not_found__:        "DOM Element for sidebar not found...",
            __template_not_found_or_invalid__:  "Sidebar template not found or invalid...",
            
            __section_not_found_or_invalid__:   "Sidebar section not found or invalid...",
            
            __gmap_not_provided__:              "GMap instance not provided...",
        };
    
    /**
     * Updates data basing on given dataUpdate object
     * 
     * @param {object} dataUpdate Data to update
     */
    function _updateAIW(dataUpdate) {
        if ( "object" === typeof(dataUpdate) ) {
            for( var prop in dataUpdate ) {
                if ( "undefined" !== typeof(data[prop]) ) {
                    data[prop] = dataUpdate[prop];
                }
            }
        }
        
        _refresh();
    }
    
    /**
     * Refreshes object dom structure 
     * basing on data
     */
    function _refresh() {
        if ( $container ) {
            $container.find('.title .title-center').html( (null === data['title'] ? '' : data['title']) );
        }
    }

    /**
     * Shows address input window
     */
    function _show() {
        if ( !$container.is(":visible") ) {
            $container.find('input.address').val('');
            _updatePosition();
            $container.fadeIn();
        }
    }
    
    /**
     * Hides address info window,
     * calls _onSetAddressCallback if provided with current address
     */
    function _hide() {
        if ( $container.is(":visible") ) {
            if ( 'function' === typeof(_onSetAddressCallback) ) {
                _onSetAddressCallback.call(null, $container.find('input.address').val());
            }
            $container.fadeOut();
        }
    }
    
    /**
     * Determins address info window position to show on,
     * use _positionCalculatingFunction function if provided
     */
    function _updatePosition() {
        var
            offsetTop = null,
            offsetLeft = null;
        
        if ( "function" === typeof(_positionCalculatingFunction) ) {
            var position = _positionCalculatingFunction.apply(null);
            if ( 
                    ("object" === typeof(position))
                    && ("undefined" !== typeof(position['top']))
                    && ("undefined" !== typeof(position['left'])) ) {
                offsetTop = parseFloat(position['top']) || null;
                offsetLeft = parseFloat(position['left']) || null;
            }
        }
        
        if ( (null === offsetTop) || (null === offsetLeft) ) {
            offsetTop = parseFloat($(document.body).css('height').replace('px', ''))/2 - parseFloat($container.css('height').replace('px', ''))/2;
            offsetLeft = parseFloat($(document.body).css('width').replace('px', ''))/2 - parseFloat($container.css('width').replace('px', ''))/2;
            
            offsetTop = (offsetTop >= 0 ? offsetTop : 0);
            offsetLeft = (offsetLeft >= 0 ? offsetLeft : 0);
        }
        
        $container.css('top', offsetTop + 'px');
        $container.css('left', offsetLeft + 'px');
    }
    
    /**
     * Sets address input click callback
     * 
     * @param {function} callback Address input click callback
     */
    function _setCompleteCallback(callback) {
        if ( "function" === typeof(callback) ) {
            _onSetAddressCallback = callback;
        }
    }
    
    /* <handlers */
    /**
     * On button apply click callback,
     * hides address input window
     * 
     * @param {object} el Apply buttom dom element
     */
    function _onBtnApplyClick(el) {
        _hide();
    }
    
    /**
     * On button close click callback,
     * resets current address and close address input window
     * 
     * @param {object} el Close button dom element
     */
    function _onBtnCloseClick(el) {
        $container.find('input.address').val('');
        _hide();
    }
    /* </handlers */
    
    self = {
        init: function(options) {
            var 
                aiwContaintment = null;
            
            if ( "object" === typeof(options) ) {
                if ( "string" === typeof(options['template']) ) {
                    _template = options['template'];
                }
                if ( "object" === typeof(options['data']) ) {
                    _updateAIW(options['data']);
                }
                if ( "function" === typeof(options['positionCalculatingFunction']) ) {
                    _positionCalculatingFunction = options['positionCalculatingFunction'];
                }
                if ( "function" === typeof(options['onSetAddressCallback']) ) {
                    _onSetAddressCallback = options['onSetAddressCallback'];
                }
                
            }
            
            aiwContaintment = document.createElement('div');
            aiwContaintment.className = 'address-input-window';
            aiwContaintment.innerHTML = _template;
            
            document.body.appendChild(aiwContaintment);
            $container = $(aiwContaintment);
            
            if ( 0 >= $container.length ) {
                throw new Error( errorMessages.__dom_container_not_found__ );
            }
            
            _refresh();
            
            $container.on("click", ".label-apply", function(ev) {
                _onBtnApplyClick(this);
            });
            $container.on("change", "input.address", function(ev) {
                //_onBtnApplyClick(this);
            });
            $container.on("click", "button.close", function(ev) {
                _onBtnCloseClick(this);
            });
            
            _autocomplete = new google.maps.places.Autocomplete( $container.find('input.address')[0] );
            _autocomplete.addListener('place_changed', function() {
                var place = _autocomplete.getPlace();
                if ( place ) {
                    $container.find('input.address').val(place.formatted_address);
                    //_onBtnApplyClick(this);
                }
            });
        },
        setCompleteCallback: function(callback) {
            _setCompleteCallback(callback);
        },
        update: function(data) {
            _updateAIW(data);
        },
        show: function() {
            _show();
        },
        hide: function() {
            _hide();
        }
    };
    return self;
}
