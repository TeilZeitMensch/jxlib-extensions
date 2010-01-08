// $Id: $
/**
 * Class: Jx.Formatter.Currency
 * 
 * Extends: <Jx.Formatter.Number>
 * 
 * This class formats numbers as US currency. It actually
 * runs the value through Jx.Formatter.Number first and then 
 * updates the returned value as currency.
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
Jx.Formatter.Currency = new Class({
    
    Extends: Jx.Formatter.Number,
    
    options: {
        /**
         * Option: sign
         * The sign to use for this currency. Defaults to
         * the US '$'.
         */
        sign: "$"
    },
    /**
     * APIMethod: format
     * Takes a number and formats it as currency.
     * 
     * Parameters:
     * value - the number to format
     */
    format: function (value) {

        this.options.precision = 2;

        value = this.parent(value);

        //check for negative
        var neg = false;
        if (value.contains('(') || value.contains('-')) {
            neg = true;
        }
    
        var ret;
        if (neg && !this.options.useParens) {
            ret = "-" + this.options.sign + value.substring(1, value.length);
        } else {
            ret = this.options.sign + value;
        }
    
        return ret;
    }
});