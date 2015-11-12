/**
 * @ignore
 */
define(function(require) {
    require('dep/jquery.resizableColumns');
    require('dep/jquery.treetable');

    /**
     * TreeTable constructor
     *
     * <iframe width="100%" height="350" src="//jsfiddle.net/bizdevfe/xxbdkfwy/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} table 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.resizable] 是否可调整列宽
     * @param {Boolean} [options.expanded] 是否展开
     * @param {Function} [options.onLoad] 初始化回调, this 为 Tree 对象
     * @param {Function} [options.onSelect] 选中回调, this 为 Node 对象
     */
    function TreeTable(table, options) {
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

        var defaultOption = {
            resizable: true,
            expanded: true
        };
        this.options = $.extend(defaultOption, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-table biz-treetable';

    TreeTable.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);

            var self = this;
            this.$main.treetable({
                expandable: true,
                stringCollapse: '',
                stringExpand: '',
                initialState: options.expanded ? 'expanded' : 'collapsed',
                onInitialized: options.onLoad,
                onNodeCollapse: options.onCollapse,
                onNodeExpand: options.onExpand
            }).on('click.bizTreeTable', 'tbody tr', function(e) {
                $('.tree-selected').not(this).removeClass('tree-selected');
                $(this).toggleClass('tree-selected');
                if ($(this).hasClass('tree-selected') && options.onSelect) {
                    var node = self.$main.treetable('node', $(this).attr('data-tt-id'));
                    options.onSelect.call(node);
                }
            });

            if (options.resizable) {
                this.$main.resizableColumns();
            }
        },

        /**
         * 收起所有节点
         */
        collapseAll: function() {
            this.$main.treetable('collapseAll');
        },

        /**
         * 收起指定节点
         * @param {String} [id] 节点id
         */
        collapseNode: function(id) {
            this.$main.treetable('collapseNode', id);
        },

        /**
         * 展开所有节点
         */
        expandAll: function() {
            this.$main.treetable('expandAll');
        },

        /**
         * 展开指定节点
         * @param {String} [id] 节点id
         */
        expandNode: function(id) {
            this.$main.treetable('expandNode', id);
        },

        /**
         * 选中指定节点
         * @param {String} [id] 节点id
         */
        selectNode: function(id) {
            this.$main.treetable('reveal', id);
            this.$main.find('tr[data-tt-id="' + id + '"]').click();
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass)
                .treetable('destroy')
                .off('click.bizTreeTable');
            this.$main.find('span.indenter a').off();
            this.$main.find('span.indenter').remove();
            this.$main.resizableColumns('destroy');
        }
    };

    function isTable(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'table';
    }

    var dataKey = 'bizTreeTable';

    $.extend($.fn, {
        bizTreeTable: function(method, options) {
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
                case 'collapseAll':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.collapseAll();
                        }
                    });
                    break;
                case 'collapseNode':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.collapseNode(options);
                        }
                    });
                    break;
                case 'expandAll':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.expandAll();
                        }
                    });
                    break;
                case 'expandNode':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.expandNode(options);
                        }
                    });
                    break;
                case 'selectNode':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.selectNode(options);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTable(this)) {
                            $(this).data(dataKey, new TreeTable(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return TreeTable;
});