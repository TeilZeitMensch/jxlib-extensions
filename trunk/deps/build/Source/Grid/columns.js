// $Id: $
/**
 * Class: Jx.Columns
 *
 * Extends: <Jx.Object>
 *
 * This class is the container for all columns needed for a grid. It
 * consolidates many functions that didn't make sense to put directly
 * in the column class. Think of it as a model for columns.
 *
 * License:
 * Copyright (c) 2009, Jon Bomgardner.
 *
 * This file is licensed under an MIT style license
 */
Jx.Columns = new Class({

    Extends : Jx.Object,

    options : {
        /**
         * Option: headerRowHeight
         * the default height of the header row. Set to null or 'auto' to
         * have this class attempt to figure out a suitable height.
         */
        headerRowHeight : 20,
        /**
         * Option: useHeaders
         * Determines if the column headers should be displayed or not
         */
        useHeaders : false,
        /**
         * Option: columns
         * an array holding all of the column instances or objects containing
         * configuration info for the column
         */
        columns : []
    },
    /**
     * Property: columns
     * an array holding the actual instantiated column objects
     */
    columns : [],
    
    /**
     * Constructor: Jx.Columns
     * Creates the class.
     *
     * Parameters:
     * options - <Jx.Columns.Options> and <Jx.Object.Options>
     * grid - a reference to the <Jx.Grid> that this class is associated with
     */
    initialize : function (options, grid) {
        this.parent(options);

        if ($defined(grid) && grid instanceof Jx.Grid) {
            this.grid = grid;
        }

        this.options.columns.each(function (col) {
            //check the column to see if it's a Jx.Grid.Column or an object
                if (col instanceof Jx.Column) {
                    this.columns.push(col);
                } else if (Jx.type(col) === "object") {
                    this.columns.push(new Jx.Column(col, grid));
                }

            }, this);
    },
    /**
     * APIMethod: getHeaderHeight
     * returns the height of the column header row
     *
     * Parameters:
     * recalculate - determines if we should recalculate the height. Currently does nothing.
     */
    getHeaderHeight : function (recalculate) {
        if (!$defined(this.height) || recalculate) {
            if ($defined(this.options.headerRowHeight)
                    && this.options.headerRowHeight !== 'auto') {
                this.height = this.options.headerRowHeight;
            } else {
                //figure out a height.
            }
        }
        return this.height;
    },
    /**
     * APIMethod: useHeaders
     * returns whether the grid is/should display headers or not
     */
    useHeaders : function () {
        return this.options.useHeaders;
    },
    /**
     * APIMethod: getByName
     * Used to get a column object by the name of the column
     *
     * Parameters:
     * colName - the name of the column
     */
    getByName : function (colName) {
        var ret;
        this.columns.each(function (col) {
            if (col.name === colName) {
                ret = col;
            }
        }, this);
        return ret;
    },
    /**
     * APIMethod: getByField
     * Used to get a column by the model field it represents
     *
     *  Parameters:
     *  field - the field name to search by
     */
    getByField : function (field) {
        var ret;
        this.columns.each(function (col) {
            if (col.options.modelField === field) {
                ret = col;
            }
        }, this);
        return ret;
    },
    /**
     * APIMethod: getByGridIndex
     * Used to get a column when all you know is the cell index in the grid
     *
     * Parameters:
     * index - an integer denoting the placement of the column in the grid (zero-based)
     */
    getByGridIndex : function (index) {
        var headers = this.grid.colTableBody.getFirst().getChildren();
        var cell = headers[index];
        var hClasses = cell.get('class').split(' ').filter(function (cls) {
            return cls.test('jxColHead-');
        });
        var parts = hClasses[0].split('-');
        return this.getByName(parts[1]);
    },
    
    /**
     * APIMethod: getHeaders
     * Returns a row with the headers in it.
     *
     * Parameters:
     * row - the row to add the headers to.
     */
    getHeaders : function (row) {
        var r = this.grid.row.useHeaders();
        var hf = this.grid.row.getRowHeaderField();
        this.columns.each(function (col, idx) {
            if (r && hf === col.options.modelField) {
                //do nothing
            } else if (!col.isHidden()) {
                var th = new Element('td', {
                    'class' : 'jxGridColHead jxGridCol'+idx
                });
                th.adopt(col.getHeaderHTML());
                // th.setStyle('width', col.getWidth());
                th.addClass('jxColHead-' + col.options.modelField);
                //add other styles for different attributes
                if (col.isEditable()) {
                    th.addClass('jxColEditable');
                }
                if (col.isResizable()) {
                    th.addClass('jxColResizable');
                }
                if (col.isSortable()) {
                    th.addClass('jxColSortable');
                }
                // col.header = th;
                row.appendChild(th);
            }
        }, this);
        return row;
    },
    /**
     * APIMethod: getColumnCells
     * Appends the cells from each column for a specific row
     *
     * Parameters:
     * row - the row (tr) to add the cells to.
     */
    getColumnCells : function (row) {
        var r = this.grid.row;
        var f = r.getRowHeaderField();
        var h = r.useHeaders();
        this.columns.each(function (col, idx) {
            if (h && col.options.modelField !== f && !col.isHidden()) {
                row.appendChild(this.getColumnCell(col, idx));
            } else if (!h && !col.isHidden()) {
                row.appendChild(this.getColumnCell(col, idx));
            }
        }, this);
        return row;
    },
    /**
     * APIMethod: getColumnCell
     * Returns the cell (td) for a particular column.
     *
     * Paremeters:
     * col - the column to get a cell for.
     */
    getColumnCell : function (col, idx) {

        var td = new Element('td', {
            'class' : 'jxGridCell'
        });
        td.adopt(col.getHTML());
        td.addClass('jxCol-' + col.options.modelField);
        td.addClass('jxGridCol'+idx);
        // if (this.grid.model.getPosition() === 0) {
        //     var colWidth = col.getWidth();
        //     td.setStyle('width', colWidth);
        // }

        return td;
    },

    createRules: function(styleSheet, scope) {
        this.columns.each(function(col, idx) {
            var selector = scope+' .jxGridCol'+idx+', '+scope + " .jxGridCol" + idx + " .jxGridCellContent";
            col.rule = Jx.Styles.insertCssRule(selector, '', styleSheet);
            col.rule.style.width = col.getWidth() + "px";
        }, this);
    },

    /**
     * APIMethod: getColumnCOunt
     * returns the number of columns in this model (including hidden).
     */
    getColumnCount : function () {
        return this.columns.length;
    },
    /**
     * APIMethod: getIndexFromGrid
     * Gets the index of a column from its place in the grid.
     *
     * Parameters:
     * name - the name of the column to get an index for
     */
    getIndexFromGrid : function (name) {
        var headers = this.grid.colTableBody.getFirst().getChildren();
        var c;
        var i = -1;
        headers.each(function (h) {
            i++;
            var hClasses = h.get('class').split(' ').filter(function (cls) {
                return cls.test('jxColHead-'); 
            });
            hClasses.each(function (cls) {
                if (cls.test(name)) {
                    c = i;
                }
            });
        }, this);
        return c;
    }

});
