// $Id: $
/**
 * Class: Jx.Field.Textarea
 * 
 * Extends: <Jx.Field>
 * 
 * This class represents a textarea field.
 * 
 * These fields are rendered as below.
 * 
 * (code)
 * <div id='' class=''>
 *    <label for=''>A label for the field</label>
 *    <textarea id='' name='' rows='' cols=''>
 *      value/ext
 *    </textarea>
 * </div>
 * (end)
 * 
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2009, Jon Bomgardner.
 * 
 * This file is licensed under an MIT style license
 * 
 */
Jx.Field.Textarea = new Class({
    
    Extends: Jx.Field,
    
    options: {
        /**
         * Option: rows
         * the number of rows to show
         */
        rows: null,
        /**
         * Option: columns
         * the number of columns to show
         */
        columns: null,
        /**
         * Option: template
         * the template used to render this field
         */
        template: '<label class="jxInputLabel"></label><textarea class="jxInputTextarea"></textarea><span class="jxInputTag"></span>'
    },
    /**
     * Property: type
     * The type of field this is.
     */
    type: 'Textarea',
    /**
     * Property: errorClass
     * The class applied to error elements
     */
    errorClass: 'jxFormErrorTextarea',
    
    /**
     * Constructor: Jx.Field.Textarea
     * Creates the input.
     * 
     * Parameters:
     * options - <Jx.Field.Textarea.Options> and <Jx.Field.Options>
     */
    initialize: function (options) {
        this.parent(options);
                
        if ($defined(this.options.rows)) {
            this.field.set('rows', this.options.rows);
        }
        if ($defined(this.options.columns)) {
            this.field.set('cols', this.options.columns);
        }
        
        //TODO: Do we need to use OverText here as well??
        
    }
});