// $Id: $
/**
 * Class: Jx.Tooltip
 *
 * Extends: <Jx.Widget>
 *
 * An implementation of tooltips. These are very simple tooltips that are
 * designed to be instantiated in javascript and directly attached to the object
 * that they are the tip for. We can only have one Tip per element so we use
 * element storage to store the tip object and check for it's presence
 * before creating a new tip. If one is there we remove it and create this new
 * one.
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
Jx.Tooltip = new Class({

    Extends : Jx.Widget,

    options : {
        /**
         * Option: offsets
         * An object with x and y components for where to put the tip related to
         * the mouse cursor.
         */
        offsets : {
            x : 15,
            y : 15
        },
        /**
         * Option: showDelay
         * The amount of time to delay before showing the tip. This ensures we
         * don't show a tip if we're just passing over an element quickly.
         */
        showDelay : 100,
        /**
         * Option: cssClass
         * a class to be added to the tip's container. This can be used to style
         * the tip.
         */
        cssClass : null
    },

    /**
     * Constructor: Jx.Tooltip
     * Creates the tooltip
     * 
     * Parameters:
     * target - The DOM element that triggers the toltip when moused over.
     * tip - The contents of the tip itself. This can be either a string or
     *       an Element.
     * options - <Jx.Tooltip.Options> and <Jx.Widget.Options>
     */
    initialize : function (target, tip, options) {
        this.parent(options);
        this.target = document.id(target);

        var t = this.target.retrieve('Tip');
        if (t) {
            this.target.eliminate('Tip');
        }

        //set up the tip options
        this.domObj = new Element('div', {
            styles : {
                'position' : 'absolute',
                'top' : 0,
                'left' : 0,
                'visibility' : 'hidden'
            }
        }).inject(document.body);
    
        if (Jx.type(tip) === 'string') {
            this.domObj.set('html', tip);
        } else {
            this.domObj.grab(tip);
        }
    
        this.domObj.addClass('jxTooltip');
        if ($defined(this.options.cssClass)) {
            this.domObj.addClass(this.options.cssClass);
        }
    
        target.store('Tip', this);
    
        //add events
        target.addEvent('mouseenter', this.enter.bindWithEvent(this));
        target.addEvent('mouseleave', this.leave.bindWithEvent(this));
        target.addEvent('mousemove', this.move.bindWithEvent(this));
    
    },
    
    /**
     * Method: enter
     * Method run when the cursor passes over an element with a tip
     * 
     * Parameters:
     * event - the event object
     * element - the element the cursor passed over
     */
    enter : function (event, element) {
        this.timer = $clear(this.timer);
        this.timer = (function () {
            this.domObj.setStyle('visibility', 'visible');
            this.position(event);
        }).delay(this.options.delay, this);
    },
    /**
     * Method: leave
     * Executed when the mouse moves out of an element with a tip
     * 
     * Parameters:
     * event - the event object
     * element - the element the cursor passed over
     */
    leave : function (event, element) {
        this.timer = $clear(this.timer);
        this.timer = (function () {
            this.domObj.setStyle('visibility', 'hidden');
        }).delay(this.options.delay, this);
    },
    /**
     * Method: move
     * Called when the mouse moves over an element with a tip.
     * 
     * Parameters:
     * event - the event object
     */
    move : function (event) {
        this.position(event);
    },
    /**
     * Method: position
     * Called to position the tooltip.
     * 
     * Parameters:
     * event - the event object
     */
    position : function (event) {
        //TODO: Adjust this to account for the viewport. How do we change the positioning
        //      near the edges?
        var size = window.getSize(), scroll = window.getScroll();
        var tip = {
            x : this.domObj.offsetWidth,
            y : this.domObj.offsetHeight
        };
        this.domObj.setStyle('top', (event.page.y + this.options.offsets.y));
        this.domObj.setStyle('left', (event.page.x + this.options.offsets.x));
    },
    /**
     * Method: detach
     * Called to manually remove a tooltip.
     */
    detach : function () {
        this.target.eliminate('Tip');
        this.domObj.dispose();
    }
});
