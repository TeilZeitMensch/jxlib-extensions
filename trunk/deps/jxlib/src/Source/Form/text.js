// $Id: $
/**
 * Class: Jx.Field.Text
 * 
 * Extends: <Jx.Field>
 * 
 * This class represents a text input field.
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
Jx.Field.Text = new Class({
    
    Extends: Jx.Field,
    
    options: {
        /**
         * Option: overText
         * an object holding options for mootools-more's OverText class. Leave it null to 
         * not enable it, make it an object to enable.
         */
        overText: null,
        /**
         * Option: template
         * The template used to render this field
         */
        template: '<label class="jxInputLabel"></label><input class="jxInputText" type="text" /><span class="jxInputTag"></span>'
    },
    /**
     * Property: type
     * The type of this field
     */
    type: 'Text',
    
    /**
     * Constructor: Jx.Field.Text
     * Creates a text input field.
     * 
     * Parameters:
     * options - <Jx.Field.Text.Options> and <Jx.Field.Options> 
     */
    initialize: function (options) {
        this.parent(options);
        
        //create the overText instance if needed
        if ($defined(this.options.overText)) {
            var opts = $extend({}, this.options.overText);
            this.field.set('alt', this.options.tip);
            this.overText = new OverText(this.field, opts);
            this.overText.show();
        }
        
    }
    
});