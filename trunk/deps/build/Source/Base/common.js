// $Id: common.js 487 2009-07-19 03:48:32Z jonlb@comcast.net $
/**
 * Class: Jx
 * Jx is a global singleton object that contains the entire Jx library
 * within it.  All Jx functions, attributes and classes are accessed
 * through the global Jx object.  Jx should not create any other
 * global variables, if you discover that it does then please report
 * it as a bug
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
 
/* firebug console supressor for IE/Safari/Opera */
window.addEvent('load', function() {
    if (!("console" in window) || !("firebug" in window.console)) {
        var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
        "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

        window.console = {};
        for (var i = 0; i < names.length; ++i) {
            window.console[names[i]] = function() {};
        }
    }
});
/* inspired by extjs, apparently removes css image flicker and related problems in IE 6 */
/* This is already done in mootools Source/Core/Browser.js  KASI*/
/*
(function() {
    var ua = navigator.userAgent.toLowerCase();
    var isIE = ua.indexOf("msie") > -1,
        isIE7 = ua.indexOf("msie 7") > -1;
    if(isIE && !isIE7) {
        try {
            document.execCommand("BackgroundImageCache", false, true);
        } catch(e) {}
    }    
})();
*/

Class.Mutators.Family = function(self,name) {
    if ($defined(name)){
        self.jxFamily = name;
        return self;
    }
    else {   
        this.implement({'jxFamily':self});
    }
};
function $unlink(object){
    if (object && object.jxFamily){
        return object
    }    
    var unlinked;
    switch ($type(object)){
        case 'object':
            unlinked = {};
            for (var p in object) unlinked[p] = $unlink(object[p]);
        break;
        case 'hash':
            unlinked = new Hash(object);
        break;
        case 'array':
            unlinked = [];
            for (var i = 0, l = object.length; i < l; i++) unlinked[i] = $unlink(object[i]);
        break;
        default: return object;
    }
    return unlinked;
};

/* Setup global namespace
 * If jxcore is loaded by jx.js, then the namespace and baseURL are
 * already established
 */
if (typeof Jx === 'undefined') {
    var Jx = {};
    (function() {
        var aScripts = document.getElementsByTagName('SCRIPT');
        for (var i=0; i<aScripts.length; i++) {
            var s = aScripts[i].src;
            var matches = /(.*[jx|js|lib])\/jxlib(.*)/.exec(s);
            if (matches && matches[0]) {
                /**
                 * Property: {String} baseURL
                 * This is the URL that Jx was loaded from, it is 
                 * automatically calculated from the script tag
                 * src property that included Jx.
                 *
                 * Note that this assumes that you are loading Jx
                 * from a js/ or lib/ folder in parallel to the
                 * images/ folder that contains the various images
                 * needed by Jx components.  If you have a different
                 * folder structure, you can define Jx's base
                 * by including the following before including
                 * the jxlib javascript file:
                 *
                 * (code)
                 * Jx = {
                 *    baseURL: 'some/path'
                 * }
                 * (end)
                 */ 
                 Jx.aPixel = document.createElement('img', {alt:'',title:''});
                 Jx.aPixel.src = matches[1]+'/a_pixel.png';
                 Jx.baseURL = Jx.aPixel.src.substring(0,
                     Jx.aPixel.src.indexOf('a_pixel.png'));
                
            }
        }
       
    })();
} 

(function(){
	/**
     * Determine if we're running in Adobe AIR. Run this regardless of whether the above runs
     * or not.
     */
    var aScripts = document.getElementsByTagName('SCRIPT');
    var src = aScripts[0].src;
    if (src.contains('app:')){
    	Jx.isAir = true;
    } else {
        Jx.isAir = false;
    }
})();

/**
 * Method: applyPNGFilter
 *
 * Static method that applies the PNG Filter Hack for IE browsers
 * when showing 24bit PNG's.  Used automatically for img tags with
 * a class of png24.
 *
 * The filter is applied using a nifty feature of IE that allows javascript to
 * be executed as part of a CSS style rule - this ensures that the hack only
 * gets applied on IE browsers.
 *
 * The CSS that triggers this hack is only in the ie6.css files of the various
 * themes.
 *
 * Parameters:
 * object {Object} the object (img) to which the filter needs to be applied.
 */
Jx.applyPNGFilter = function(o)  {
   var t=Jx.aPixel.src;
   if( o.src != t ) {
       var s=o.src;
       o.src = t;
       o.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+s+"',sizingMethod='scale')";
   }
};

/**
 * NOTE: We should consider moving the image loading code into a separate
 * class. Perhaps as Jx.Preloader which could extend Jx.Object
 */
Jx.imgQueue = [];   //The queue of images to be loaded
Jx.imgLoaded = {};  //a hash table of images that have been loaded and cached
Jx.imagesLoading = 0; //counter for number of concurrent image loads 

/**
 * Method: addToImgQueue
 * Request that an image be set to a DOM IMG element src attribute.  This puts 
 * the image into a queue and there are private methods to manage that queue
 * and limit image loading to 2 at a time.
 *
 * Parameters:
 * obj - {Object} an object containing an element and src
 * property, where element is the element to update and src
 * is the url to the image.
 */
Jx.addToImgQueue = function(obj) {
    if (Jx.imgLoaded[obj.src]) {
        //if this image was already requested (i.e. it's in cache) just set it directly
        obj.element.src = obj.src;
    } else {
        //otherwise stick it in the queue
        Jx.imgQueue.push(obj);
        Jx.imgLoaded[obj.src] = true;
    }
    //start the queue management process
    Jx.checkImgQueue();
};

/**
 * Method: checkImgQueue
 *
 * An internal method that ensures no more than 2 images are loading at a time.
 */
Jx.checkImgQueue = function() {
    while (Jx.imagesLoading < 2 && Jx.imgQueue.length > 0) {
        Jx.loadNextImg();
    }
};

/**
 * Method: loadNextImg
 *
 * An internal method actually populate the DOM element with the image source.
 */
Jx.loadNextImg = function() {
    var obj = Jx.imgQueue.shift();
    if (obj) {
        ++Jx.imagesLoading;
        obj.element.onload = function(){--Jx.imagesLoading; Jx.checkImgQueue();};
        obj.element.onerror = function(){--Jx.imagesLoading; Jx.checkImgQueue();};
        obj.element.src = obj.src;
    }
};

/**
 * Method: createIframeShim
 * Creates a new iframe element that is intended to fill a container
 * to mask out other operating system controls (scrollbars, inputs, 
 * buttons, etc) when HTML elements are supposed to be above them.
 *
 * Returns:
 * an HTML iframe element that can be inserted into the DOM.
 */
/**
 * NOTE: This could be replaced by Mootools-more's IFrameShim class.
 */
Jx.createIframeShim = function() {
    return new Element('iframe', {
        'class':'jxIframeShim',
        'scrolling':'no',
        'frameborder':0
    });
};
/**
 * Method: getNumber
 * safely parse a number and return its integer value.  A NaN value 
 * returns 0.  CSS size values are also parsed correctly.
 *
 * Parameters: 
 * n - {Mixed} the string or object to parse.
 *
 * Returns:
 * {Integer} the integer value that the parameter represents
 */
Jx.getNumber = function(n, def) {
  var result = n===null||isNaN(parseInt(n,10))?(def||0):parseInt(n,10);
  return result;
}

/**
 * Method: getPageDimensions
 * return the dimensions of the browser client area.
 *
 * Returns:
 * {Object} an object containing a width and height property 
 * that represent the width and height of the browser client area.
 */
Jx.getPageDimensions = function() {
    return {width: window.getWidth(), height: window.getHeight()};
}

Jx.type = function(obj){
    if (typeof obj == undefined){
        return false;
    }
    return obj.jxFamily ? obj.jxFamily : $type(obj);
}
/**
 * Class: Element
 *
 * Element is a global object provided by the mootools library.  The
 * functions documented here are extensions to the Element object provided
 * by Jx to make cross-browser compatibility easier to achieve.  Most of the
 * methods are measurement related.
 *
 * While the code in these methods has been converted to use MooTools methods,
 * there may be better MooTools methods to use to accomplish these things.
 * Ultimately, it would be nice to eliminate most or all of these and find the
 * MooTools equivalent or convince MooTools to add them.
 * 
 * NOTE: Many of these methods can be replaced with mootools-more's 
 * Element.Measure
 */
 
 
;(function($){ // Wrapper for document.id

    
Element.implement({
    /**
     * Method: getBoxSizing
     * return the box sizing of an element, one of 'content-box' or 
     *'border-box'.
     *
     * Parameters: 
     * elem - {Object} the element to get the box sizing of.
     *
     * Returns:
     * {String} the box sizing of the element.
     */
    getBoxSizing : function() {
      var result = 'content-box';
      if (Browser.Engine.trident || Browser.Engine.presto) { 
          var cm = document["compatMode"];
          if (cm == "BackCompat" || cm == "QuirksMode") { 
              result = 'border-box'; 
          } else {
              result = 'content-box'; 
        }
      } else {
          if (arguments.length === 0) {
              node = document.documentElement; 
          }
          var sizing = this.getStyle("-moz-box-sizing");
          if (!sizing) { 
              sizing = this.getStyle("box-sizing"); 
          }
          result = (sizing ? sizing : 'content-box');
      }
      return result;
    },
    /**
     * Method: getContentBoxSize
     * return the size of the content area of an element.  This is the size of
     * the element less margins, padding, and borders.
     *
     * Parameters: 
     * elem - {Object} the element to get the content size of.
     *
     * Returns:
     * {Object} an object with two properties, width and height, that
     * are the size of the content area of the measured element.
     */
    getContentBoxSize : function() {
        var w = this.offsetWidth;
        var h = this.offsetHeight;
        var s = this.getSizes(['padding','border']);
        w = w - s.padding.left - s.padding.right - s.border.left - s.border.right;
        h = h - s.padding.bottom - s.padding.top - s.border.bottom - s.border.top;
        return {width: w, height: h};
    },
    /**
     * Method: getBorderBoxSize
     * return the size of the border area of an element.  This is the size of
     * the element less margins.
     *
     * Parameters: 
     * elem - {Object} the element to get the border sizing of.
     *
     * Returns:
     * {Object} an object with two properties, width and height, that
     * are the size of the border area of the measured element.
     */
    getBorderBoxSize: function() {
        var w = this.offsetWidth;
        var h = this.offsetHeight;
        return {width: w, height: h}; 
    },
    
    /**
     * Method: getMarginBoxSize
     * return the size of the margin area of an element.  This is the size of
     * the element plus margins.
     *
     * Parameters: 
     * elem - {Object} the element to get the margin sizing of.
     *
     * Returns:
     * {Object} an object with two properties, width and height, that
     * are the size of the margin area of the measured element.
     */
    getMarginBoxSize: function() {
        var s = this.getSizes(['margin']);
        var w = this.offsetWidth + s.margin.left + s.margin.right;
        var h = this.offsetHeight + s.margin.top + s.margin.bottom;
        return {width: w, height: h};
    },
    /**
     * Method: getSizes
     * measure the size of various styles on various edges and return
     * the values.
     *
     * Parameters:
     * styles - array, the styles to compute.  By default, this is ['padding',
     *     'border','margin'].  If you don't need all the styles, just request
     *     the ones you need to minimize compute time required.
     * edges - array, the edges to compute styles for.  By default,  this is
     *     ['top','right','bottom','left'].  If you don't need all the edges,
     *     then request the ones you need to minimize compute time.
     *
     * Returns:
     * {Object} an object with one member for each requested style.  Each
     * style member is an object containing members for each requested edge.
     * Values are the computed style for each edge in pixels.
     */
    getSizes: function(which, edges) {
      which = which || ['padding','border','margin'];
      edges = edges || ['left','top','right','bottom'];
      var result={};
      which.each(function(style) {
        result[style]={};
        edges.each(function(edge) {
            var e = (style == 'border') ? edge + '-width' : edge;
            var n = this.getStyle(style+'-'+e);
            result[style][edge] = n===null||isNaN(parseInt(n,10))?0:parseInt(n,10);
        }, this);
      }, this);
      return result;
    },    
    /**
     * Method: setContentBoxSize
     * set either or both of the width and height of an element to
     * the provided size.  This function ensures that the content
     * area of the element is the requested size and the resulting
     * size of the element may be larger depending on padding and
     * borders.
     *
     * Parameters: 
     * elem - {Object} the element to set the content area of.
     * size - {Object} an object with a width and/or height property that is the size to set
     * the content area of the element to.
     */
    setContentBoxSize : function(size) {
        if (this.getBoxSizing() == 'border-box') {
            var m = this.measure(function() {
                return this.getSizes(['padding','border']);
            });
            if ($defined(size.width)) {
                var width = size.width + m.padding.left + m.padding.right + m.border.left + m.border.right;
                if (width < 0) {
                    width = 0;
                }
                this.style.width = width + 'px';
            }
            if ($defined(size.height)) {
                var height = size.height + m.padding.top + m.padding.bottom + m.border.top + m.border.bottom;
                if (height < 0) {
                    height = 0;
                }
                this.style.height = height + 'px';
            }
        } else {
            if ($defined(size.width) && size.width >= 0) {
                this.style.width = size.width + 'px';
            }
            if ($defined(size.height) && size.height >= 0) {
                this.style.height = size.height + 'px';
            }
        }
    },
    /**
     * Method: setBorderBoxSize
     * set either or both of the width and height of an element to
     * the provided size.  This function ensures that the border
     * size of the element is the requested size and the resulting
     * content areaof the element may be larger depending on padding and
     * borders.
     *
     * Parameters: 
     * elem - {Object} the element to set the border size of.
     * size - {Object} an object with a width and/or height property that is the size to set
     * the content area of the element to.
     */
    setBorderBoxSize : function(size) {
      if (this.getBoxSizing() == 'content-box') {
          var m = this.measure(function() {
              return this.getSizes();
          });
          
        if ($defined(size.width)) {
          var width = size.width - m.padding.left - m.padding.right - m.border.left - m.border.right - m.margin.left - m.margin.right;
          if (width < 0) {
            width = 0;
          }
          this.style.width = width + 'px';
        }
        if ($defined(size.height)) {
          var height = size.height - m.padding.top - m.padding.bottom - m.border.top - m.border.bottom - m.margin.top - m.margin.bottom;
          if (height < 0) {
            height = 0;
          }
          this.style.height = height + 'px';
        }
      } else {
        if ($defined(size.width) && size.width >= 0) {
          this.style.width = size.width + 'px';
        }
        if ($defined(size.height) && size.height >= 0) {
          this.style.height = size.height + 'px';
        }
      }
    },
    
    /**
     * Method: descendantOf
     * determines if the element is a descendent of the reference node.
     *
     * Parameters:
     * node - {HTMLElement} the reference node
     *
     * Returns:
     * {Boolean} true if the element is a descendent, false otherwise.
     */
    descendantOf: function(node) {
        var parent = document.id(this.parentNode);
        while (parent != node && parent && parent.parentNode && parent.parentNode != parent) {
            parent = document.id(parent.parentNode);
        }
        return parent == node;
    },
    
    /**
     * Method: findElement
     * search the parentage of the element to find an element of the given
     * tag name.
     *
     * Parameters:
     * type - {String} the tag name of the element type to search for
     *
     * Returns:
     * {HTMLElement} the first node (this one or first parent) with the
     * requested tag name or false if none are found.
     */
    findElement: function(type) {
        var o = this;
        var tagName = o.tagName;
        while (o.tagName != type && o && o.parentNode && o.parentNode != o) {
            o = document.id(o.parentNode);
        }
        return o.tagName == type ? o : false;
    }
} );

Array.implement({
    
    /**
     * Method: swap
     * swaps 2 elements of an array
     * 
     * Parameters:
     * a - the first position to swap
     * b - the second position to swap
     */
    'swap': function(a,b){
        var temp;
        temp = this[a];
        this[a] = this[b];
        this[b] = temp;
    }
    
});

})(document.id || $); // End Wrapper for document.id 

