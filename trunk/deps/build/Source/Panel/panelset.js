// $Id: panelset.js 487 2009-07-19 03:48:32Z jonlb@comcast.net $
/**
 * Class: Jx.PanelSet
 *
 * Extends: <Jx.Widget>
 *
 * A panel set manages a set of panels within a DOM element.  The PanelSet fills
 * its container by resizing the panels in the set to fill the width and then
 * distributing the height of the container across all the panels.  Panels
 * can be resized by dragging their respective title bars to make them taller
 * or shorter.  The maximize button on the panel title will cause all other
 * panels to be closed and the target panel to be expanded to fill the remaining
 * space.  In this respect, PanelSet works like a traditional Accordion control.
 *
 * When creating panels for use within a panel set, it is important to use the
 * proper options.  You must override the collapse option and set it to false
 * and add a maximize option set to true.  You must also not include options
 * for menu and close.
 *
 * Example:
 * (code)
 * var p1 = new Jx.Panel({collapse: false, maximize: true, content: 'content1'});
 * var p2 = new Jx.Panel({collapse: false, maximize: true, content: 'content2'});
 * var p3 = new Jx.Panel({collapse: false, maximize: true, content: 'content3'});
 * var panelSet = new Jx.PanelSet('panels', [p1,p2,p3]);
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.PanelSet = new Class({
    Family: 'Jx.PanelSet',
    Extends: Jx.Widget,
    
    options: {
        /* Option: parent
         * the object to add the panel set to
         */
        parent: null,
        /* Option: panels
         * an array of <Jx.Panel> objects that will be managed by the set.
         */
        panels: [],
        /* Option: barTooltip
         * the tooltip to place on the title bars of each panel
         */
        barTooltip: 'drag this bar to resize'
    },
    
    /**
     * Property: panels
     * {Array} the panels being managed by the set
     */
    panels: null,
    /**
     * Property: height
     * {Integer} the height of the container, cached for speed
     */
    height: null,
    /**
     * Property: firstLayout
     * {Boolean} true until the panel set has first been resized
     */
    firstLayout: true,
    /**
     * Constructor: Jx.PanelSet
     * Create a new instance of Jx.PanelSet.
     *
     * Parameters:
     * options - <Jx.PanelSet.Options>
     *
     * TODO: Jx.PanelSet.initialize
     * Remove the panels parameter in favour of an add method.
     */
    initialize: function(options) {
        if (options && options.panels) {
            this.panels = options.panels;
            options.panels = null;
        }
        this.setOptions(options);
        this.domObj = new Element('div');
        new Jx.Layout(this.domObj);
        
        //make a fake panel so we get the right number of splitters
        var d = new Element('div', {styles:{position:'absolute'}});
        new Jx.Layout(d, {minHeight:0,maxHeight:0,height:0});
        var elements = [d];
        this.panels.each(function(panel){
            elements.push(panel.domObj);
            panel.options.hideTitle = true;
            panel.contentContainer.resize({top:0});
            panel.toggleCollapse = this.maximizePanel.bind(this,panel);
            panel.domObj.store('Jx.Panel', panel);
            panel.manager = this;
        }, this);
        
        this.splitter = new Jx.Splitter(this.domObj, {
            splitInto: this.panels.length+1,
            layout: 'vertical',
            elements: elements,
            prepareBar: (function(i) {
                var bar = new Element('div', {
                    'class': 'jxPanelBar',
                    'title': this.options.barTooltip
                });
                
                var panel = this.panels[i];
                panel.title.setStyle('visibility', 'hidden');
                document.id(document.body).adopt(panel.title);
                var size = panel.title.getBorderBoxSize();
                bar.adopt(panel.title);
                panel.title.setStyle('visibility','');
                
                bar.setStyle('height', size.height);
                bar.store('size', size);
                
                return bar;
            }).bind(this)
        });
        this.addEvent('addTo', function() {
            document.id(this.domObj.parentNode).setStyle('overflow', 'hidden');
            this.domObj.resize();
        });
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
    },
    
    /**
     * Method: maximizePanel
     * Maximize a panel, taking up all available space (taking into
     * consideration any minimum or maximum values)
     */
    maximizePanel: function(panel) {
        var domHeight = this.domObj.getContentBoxSize().height;
        var space = domHeight;
        var panelSize = panel.domObj.retrieve('jxLayout').options.maxHeight;
        var panelIndex;
        
        /* calculate how much space might be left after setting all the panels to
         * their minimum height (except the one we are resizing of course)
         */
        for (var i=1; i<this.splitter.elements.length; i++) {
            var p = this.splitter.elements[i];
            space -= p.retrieve('leftBar').getBorderBoxSize().height;
            if (p !== panel.domObj) {
                var thePanel = p.retrieve('Jx.Panel');
                var o = p.retrieve('jxLayout').options;
                space -= o.minHeight;
            } else {
                panelIndex = i;
            }
        }

        // calculate how much space the panel will take and what will be left over
        if (panelSize == -1 || panelSize >= space) {
            panelSize = space;
            space = 0;
        } else {
            space = space - panelSize;
        }
        var top = 0;
        for (var i=1; i<this.splitter.elements.length; i++) {
            var p = this.splitter.elements[i];
            top += p.retrieve('leftBar').getBorderBoxSize().height;
            if (p !== panel.domObj) {
                var thePanel = p.retrieve('Jx.Panel');
                var o = p.retrieve('jxLayout').options;
                var panelHeight = $chk(o.height) ? o.height : p.getBorderBoxSize().height;
                if (space > 0) {
                    if (space >= panelHeight) {
                        // this panel can stay open at its current height
                        space -= panelHeight;
                        p.resize({top: top, height: panelHeight});
                        top += panelHeight;
                    } else {
                        // this panel needs to shrink some
                        if (space > o.minHeight) {
                            // it can use all the space
                            p.resize({top: top, height: space});
                            top += space;
                            space = 0;
                        } else {
                            p.resize({top: top, height: o.minHeight});
                            top += o.minHeight;
                        }
                    }
                } else {
                    // no more space, just shrink away
                    p.resize({top:top, height: o.minHeight});
                    top += o.minHeight;
                }
                p.retrieve('rightBar').style.top = top + 'px';
            } else {
                break;
            }
        }
        
        /* now work from the bottom up */
        var bottom = domHeight;
        for (var i=this.splitter.elements.length - 1; i > 0; i--) {
            p = this.splitter.elements[i];
            if (p !== panel.domObj) {
                var o = p.retrieve('jxLayout').options;
                var panelHeight = $chk(o.height) ? o.height : p.getBorderBoxSize().height;
                if (space > 0) {
                    if (space >= panelHeight) {
                        // panel can stay open
                        bottom -= panelHeight;
                        space -= panelHeight;
                        p.resize({top: bottom, height: panelHeight});
                    } else {
                        if (space > o.minHeight) {
                            bottom -= space;
                            p.resize({top: bottom, height: space});
                            space = 0;
                        } else {
                            bottom -= o.minHeight;
                            p.resize({top: bottom, height: o.minHeight});
                        }
                    }
                } else {
                    bottom -= o.minHeight;
                    p.resize({top: bottom, height: o.minHeight, bottom: null});                    
                }
                bottom -= p.retrieve('leftBar').getBorderBoxSize().height;
                p.retrieve('leftBar').style.top = bottom + 'px';
                
            } else {
                break;
            }
        }
        panel.domObj.resize({top: top, height:panelSize, bottom: null});
    }
});