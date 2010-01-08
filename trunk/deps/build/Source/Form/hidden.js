// $Id: $
/**
 * Class: Jx.Field.Hidden
 * 
 * Extends: <Jx.Field>
 * 
 * This class represents a hidden input field.
 *  
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2009, Jon Bomgardner.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Field.Hidden = new Class({
    
    Extends: Jx.Field,
    
    options: {
        /**
         * Option: template
         * The template used to render this field
         */
        template: '<input class="jxInputHidden" type="hidden" />'
    },
    /**
     * Property: type
     * The type of this field
     */
    type: 'Hidden',
    
    /**
     * Constructor: Jx.Field.Hidden
     * Creates a hidden input field.
     * 
     * Parameters:
     * options - <Jx.Field.Hidden.Options> and <Jx.Field.Options>
     */
    initialize: function (options) {
        this.parent(options);
        
    }
    
});




