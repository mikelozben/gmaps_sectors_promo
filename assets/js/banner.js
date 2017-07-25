/**
 * A class to interact with banner
 */

function Banner () {
    var
        self = {},
        content = "",
        
        $container = null,

        errorMessages = {
            __dom_container_not_found__:        "DOM Element for banner not found...",
            __template_not_found_or_invalid__:  "Banner template not found or invalid...",
        };
    
    /**
     * Updates banner data basing on provided data object
     * 
     * @param {object} data Data for update
     */
    function _updateBanner(data) {
        if ( "object" === typeof(data) ) {
            if ( "string" === typeof(data["content"]) ) {
                content = data["content"];
            }
        }
        
        _refresh();
    }
    
    /**
     * Refreshes banner dom structure basing on data
     */
    function _refresh() {
        $container.find('.content').html( content );
    }
        
    self = {
        init: function(options) {
            var 
                $_template = null,
                $_compiledContent = null;
            
            if ( "object" === typeof(options) ) {
                if ( "string" === typeof(options["container"]) ) {
                    $container = $(options["container"]);
                }
                if ( "string" === typeof(options["content"]) ) {
                    content = options["content"];
                }                
            }
            
            if ( 0 >= $container ) {
                throw new Error( errorMessages.__dom_container_not_found__ );
            }
            
            _refresh();
        },
        update: function(data) {
            _updateBanner(data);
        }
    };
    return self;
}