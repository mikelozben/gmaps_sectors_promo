/**
 * A class to interact with info window
 */

function InfoWindow () {
    var
        self = {},
        
        $container = null,
        data = {
            title: null,
            content: null
        },

        _positionCalculatingFunction = null,
        
        _template = 
            "<div class=\"title\">\n"
                + "<div class=\"title-left\">&nbsp;</div>\n"
                + "<div class=\"title-center\"></div>\n"
                + "<div class=\"title-right\">\n"
                    + "<button class=\"close\">&times;</button>\n"
                + "</div>\n"
            + "</div>\n"
            + "<div class=\"content\"></div>\n",
        
        errorMessages = {
            __dom_container_not_found__:        "DOM Element for sidebar not found...",
            __template_not_found_or_invalid__:  "Sidebar template not found or invalid...",
            
            __section_not_found_or_invalid__:   "Sidebar section not found or invalid...",
            
            __gmap_not_provided__:              "GMap instance not provided...",
        };
    
    /**
     * Updates data according to dataUpdate object
     * @param {object} dataUpdate data to update
     */
    function _updateIW(dataUpdate) {
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
     * Refresh object dom structure 
     * basing on data
     */
    function _refresh() {
        if ( $container ) {
            $container.find('.title .title-center').html( (null === data['title'] ? '' : data['title']) );
            $container.find('.content').html( (null === data['content'] ? '' : data['content']) );
        }
    }
    
    /**
     * Shows info window
     */
    function _show() {
        if ( !$container.is(":visible") ) {
            _updatePosition();
            $container.fadeIn();
        }
    }

    /**
     * Hides info window
     */
    function _hide() {
        if ( $container.is(":visible") ) {
            $container.fadeOut();
        }
    }
    
    /**
     * Determines info window position to show on,
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
    
    /* <handlers */
    /**
     * On info window click callback,
     * hides info window
     * 
     * @param {object} el Info window dom element
     */
    function _onIWClick(el) {
        _hide();
    }
    
    /**
     * On Close button click callback,
     * hides info window
     * 
     * @param {object} el Close button dom element
     */
    function _onBtnCloseClick(el) {
        _hide();
    }
    /* </handlers */
    
    self = {
        init: function(options) {
            var 
                iwContaintment = null;
            
            if ( "object" === typeof(options) ) {
                if ( "string" === typeof(options['template']) ) {
                    _template = options['template'];
                }
                if ( "object" === typeof(options['data']) ) {
                    _updateIW(options['data']);
                }
                if ( "function" === typeof(options['positionCalculatingFunction']) ) {
                    _positionCalculatingFunction = options['positionCalculatingFunction'];
                }
            }
            
            iwContaintment = document.createElement('div');
            iwContaintment.className = 'info-window';
            iwContaintment.innerHTML = _template;
            
            document.body.appendChild(iwContaintment);
            $container = $(iwContaintment);
            
            if ( 0 >= $container.length ) {
                throw new Error( errorMessages.__dom_container_not_found__ );
            }
            
            _refresh();
            
            $container.on("click", function(ev) {
                _onIWClick(this);
            });
            $container.on("click", "button.close", function(ev) {
                _onBtnCloseClick(this);
            });
        },
        update: function(data) {
            _updateIW(data);
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