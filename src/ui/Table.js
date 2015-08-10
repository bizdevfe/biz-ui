/**
 * @ignore
 */
define(function(require) {
    /**
     * Table constructor
     *
     * [See demo on JSFiddle](http://jsfiddle.net/bizdevfe/)
     * @constructor
     * @param {HTMLElement|jQuery} table 目标元素
     * @param {Object} [options] 参数
     */
    function Table(table, options) {
        if (table instanceof jQuery) {
            if (table.length > 0) {
                table = table[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isTable(table)) {
            return;
        }

        /**
         * @property {HTMLElement} main `table`元素
         */
        this.main = table;

        /**
         * @property {jQuery} $main `table`元素的$包装
         */
        this.$main = $(this.main);

        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-table';

    Table.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass);
        }
    };

    function isTable(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'table';
    }

    var dataKey = 'bizTable';

    $.extend($.fn, {
        bizTable: function(method, options) {
            var table;
            switch (method) {
                case 'destroy':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTable(this)) {
                            $(this).data(dataKey, new Table(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Table;
});
