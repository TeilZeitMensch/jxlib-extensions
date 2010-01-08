// $Id: colorpalette.js 443 2009-05-21 13:31:59Z pagameba $
/**
 * Class: Jx.ColorPalette
 *
 * Extends: <Jx.Widget>
 *
 * A Jx.ColorPalette presents a user interface for selecting colors.
 * Currently, the user can either enter a HEX colour value or select from a
 * palette of web-safe colours.  The user can also enter an opacity value.
 *
 * A Jx.ColorPalette can be embedded anywhere in a web page using its addTo
 * method.  However, a <Jx.Button> subclass is provided (<Jx.Button.Color>)
 * that embeds a colour panel inside a button for easy use in toolbars.
 *
 * Colour changes are propogated via a change event.  To be notified 
 * of changes in a Jx.ColorPalette, use the addEvent method.
 *
 * Example:
 * (code)
 * (end)
 *
 * Events:
 * change - triggered when the color changes.
 * click - the user clicked on a color swatch (emitted after a change event)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.ColorPalette = new Class({
    Family: 'Jx.ColorPalette',
    Extends: Jx.Widget,
    /**
     * Property: {HTMLElement} domObj
     * the HTML element representing the color panel
     */
    domObj: null,
    options: {
        /* Option: parent
         * default null, the DOM element to add the palette to.
         */
        parent: null,
        /* Option: color
         * default #000000, the initially selected color
         */
        color: '#000000',
        /* Option: alpha
         * default 100, the initial alpha value
         */
        alpha: 1,
        /* Option: hexColors
         * an array of hex colors for creating the palette, defaults to a
         * set of web safe colors.
         */
        hexColors: ['00', '33', '66', '99', 'CC', 'FF'],
        /* Option: alphaLabel
         * the text to display next to the alpha input for i18n.
         */
        alphaLabel: 'alpha (%)'
    },
    /**
     * Constructor: Jx.ColorPalette
     * initialize a new instance of Jx.ColorPalette
     *
     * Parameters:
     * options - <Jx.ColorPalette.Options>
     */
    initialize: function(options) {
        this.setOptions(options);

        this.domObj = new Element('div', {
            id: this.options.id,
            'class':'jxColorPalette'
        });

        var top = new Element('div', {'class':'jxColorBar'});
        var d = new Element('div', {'class':'jxColorPreview'});

        this.selectedSwatch = new Element('div', {'class':'jxColorSelected'});
        this.previewSwatch = new Element('div', {'class':'jxColorHover'});
        d.adopt(this.selectedSwatch);
        d.adopt(this.previewSwatch);
        
        top.adopt(d);

        this.colorInputLabel = new Element('label', {'class':'jxColorLabel', html:'#'});
        top.adopt(this.colorInputLabel);

        var cc = this.changed.bind(this);
        this.colorInput = new Element('input', {
            'class':'jxHexInput',
            'type':'text',
            'maxLength':6,
            events: {
                'keyup':cc,
                'blur':cc,
                'change':cc
            }
        });

        top.adopt(this.colorInput);

        this.alphaLabel = new Element('label', {'class':'jxAlphaLabel', 'html':this.options.alphaLabel});
        top.adopt(this.alphaLabel);

        this.alphaInput = new Element('input', {
            'class':'jxAlphaInput',
            'type':'text',
            'maxLength':3,
            events: {
                'keyup': this.alphaChanged.bind(this)
            }
        });
        top.adopt(this.alphaInput);

        this.domObj.adopt(top);

        var swatchClick = this.swatchClick.bindWithEvent(this);
        var swatchOver = this.swatchOver.bindWithEvent(this);

        var table = new Element('table', {'class':'jxColorGrid'});
        var tbody = new Element('tbody');
        table.adopt(tbody);
        for (var i=0; i<12; i++) {
            var tr = new Element('tr');
            for (var j=-3; j<18; j++) {
                var bSkip = false;
                var r, g, b;
                /* hacky approach to building first three columns
                 * because I couldn't find a good way to do it
                 * programmatically
                 */

                if (j < 0) {
                    if (j == -3 || j == -1) {
                        r = g = b = 0;
                        bSkip = true;
                    } else {
                        if (i<6) {
                            r = g = b = i;
                        } else {
                            if (i == 6) {
                                r = 5; g = 0; b = 0;
                            } else if (i == 7) {
                                r = 0; g = 5; b = 0;
                            } else if (i == 8) {
                                r = 0; g = 0; b = 5;
                            } else if (i == 9) {
                                r = 5; g = 5; b = 0;
                            } else if (i == 10) {
                                r = 0; g = 5; b = 5;
                            } else if (i == 11) {
                                r = 5; g = 0; b = 5;
                            }
                        }
                    }
                } else {
                    /* remainder of the columns are built
                     * based on the current row/column
                     */
                    r = parseInt(i/6)*3 + parseInt(j/6);
                    g = j%6;
                    b = i%6;
                }
                var bgColor = '#'+this.options.hexColors[r]+this.options.hexColors[g]+this.options.hexColors[b];

                var td = new Element('td');
                if (!bSkip) {
                    td.setStyle('backgroundColor', bgColor);

                    var a = new Element('a', {
                        'class': 'colorSwatch ' + (((r > 2 && g > 2) || (r > 2 && b > 2) || (g > 2 && b > 2)) ? 'borderBlack': 'borderWhite'),
                        'href':'javascript:void(0)',
                        'title':bgColor,
                        'alt':bgColor,
                        events: {
                            'mouseover': swatchOver,
                            'click': swatchClick
                        }
                    });
                    a.store('swatchColor', bgColor);
                    td.adopt(a);
                } else {
                    var span = new Element('span', {'class':'emptyCell'});
                    td.adopt(span);
                }
                tr.adopt(td);
            }
            tbody.adopt(tr);
        }
        this.domObj.adopt(table);
        this.updateSelected();
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
    },

    /**
     * Method: swatchOver
     * handle the mouse moving over a colour swatch by updating the preview
     *
     * Parameters:
     * e - {Event} the mousemove event object
     */
    swatchOver: function(e) {
        var a = e.target;

        this.previewSwatch.setStyle('backgroundColor', a.retrieve('swatchColor'));
    },

    /**
     * Method: swatchClick
     * handle mouse click on a swatch by updating the color and hiding the
     * panel.
     *
     * Parameters:
     * e - {Event} the mouseclick event object
     */
    swatchClick: function(e) {
        var a = e.target;

        this.options.color = a.retrieve('swatchColor');
        this.updateSelected();
        this.fireEvent('click', this);
    },

    /**
     * Method: changed
     * handle the user entering a new colour value manually by updating the
     * selected colour if the entered value is valid HEX.
     */
    changed: function() {
        var color = this.colorInput.value;
        if (color.substring(0,1) == '#') {
            color = color.substring(1);
        }
        if (color.toLowerCase().match(/^[0-9a-f]{6}$/)) {
            this.options.color = '#' +color.toUpperCase();
            this.updateSelected();
        }
    },

    /**
     * Method: alphaChanged
     * handle the user entering a new alpha value manually by updating the
     * selected alpha if the entered value is valid alpha (0-100).
     */
    alphaChanged: function() {
        var alpha = this.alphaInput.value;
        if (alpha.match(/^[0-9]{1,3}$/)) {
            this.options.alpha = parseFloat(alpha/100);
            this.updateSelected();
        }
    },

    /**
     * Method: setColor
     * set the colour represented by this colour panel
     *
     * Parameters:
     * color - {String} the new hex color value
     */
    setColor: function( color ) {
        this.colorInput.value = color;
        this.changed();
    },

    /**
     * Method: setAlpha
     * set the alpha represented by this colour panel
     *
     * Parameters:
     * alpha - {Integer} the new alpha value (between 0 and 100)
     */
    setAlpha: function( alpha ) {
        this.alphaInput.value = alpha;
        this.alphaChanged();
    },

    /**
     * Method: updateSelected
     * update the colour panel user interface based on the current
     * colour and alpha values
     */
    updateSelected: function() {
        var styles = {'backgroundColor':this.options.color};

        this.colorInput.value = this.options.color.substring(1);

        this.alphaInput.value = parseInt(this.options.alpha*100);
        if (this.options.alpha < 1) {
            styles.opacity = this.options.alpha;
            styles.filter = 'Alpha(opacity='+(this.options.alpha*100)+')';
        } else {
            styles.opacity = '';
            styles.filter = '';
        }
        this.selectedSwatch.setStyles(styles);
        this.previewSwatch.setStyles(styles);
        this.fireEvent('change', this);
    }
});

