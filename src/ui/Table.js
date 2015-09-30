/**
 * @ignore
 */
define(function(require) {
    require('dep/jquery.resizableColumns');
    require('dep/jquery.editabletable');

    /**
     * Table constructor
     *
     * <iframe width="100%" height="350" src="//jsfiddle.net/bizdevfe/q4myap58/1/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} table 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.selectable] 是否含勾选列, tr含unselectable属性不可选, checkbox默认取tr的id, 没有则取行号
     * @param {Boolean} [options.resizable] 是否可调整列宽
     * @param {Function} [options.onSort] 排序回调({data, event), th含sortable属性可排序, 含des属性为降序，asc属性为升序, field属性为排序项
     * @param {Function} [options.onChange] 修改单元格回调(newValue, event), td含editable属性可编辑
     * @param {Object} [options.changePattern] 修改单元格正则, 不合法输入不会触发onChange
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

        var defaultOption = {
            selectable: false,
            resizable: false
        };
        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-table',
        selectPrefix = 'biz-table-checkbox-';

    Table.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);

            if (options.selectable) {
                this.createSelect();
                this.rowCount = this.$main.find('td :checkbox:enabled').length;
                this.bindSelect();
            }

            if (options.onSort) {
                this.bindSort();
            }

            if (options.resizable) {
                this.$main.resizableColumns();
            }

            this.$main.editableTableWidget();
            if (options.onChange) {
                this.bindEdit();
            }
        },

        /**
         * 创建Checkbox控件
         * @protected
         */
        createSelect: function() {
            var that = this;
            this.$main.find('tr').each(function(index, tr) {
                var id = selectPrefix + (tr.id ? tr.id : index),
                    disabled = $(tr).attr('unselectable') !== undefined ? ' disabled' : '';
                if(that.$main.find('#' + id).length){
                    return false;
                }
                $(tr).prepend(index === 0 ? '<th width="20"></th>' : '<td style="text-align:center"></td>')
                    .children(':first-child').html('<input type="checkbox" title=" " id="' + id + '"' + disabled + ' />');
            });

            this.$main.find(':checkbox').bizCheckbox();
        },

        /**
         * 绑定勾选事件
         * @protected
         */
        bindSelect: function() {
            var self = this;
            this.$main.on('click.bizTableSelectAll', 'th .biz-label', function(e) {
                var selected = $(e.target).hasClass('biz-checkbox-checked'),
                    checkbox = self.$main.find('td :checkbox:enabled'),
                    tr = self.$main.find('tr').not('[unselectable]');
                if (selected) {
                    checkbox.bizCheckbox('check');
                    tr.addClass('selected');
                } else {
                    checkbox.bizCheckbox('uncheck');
                    tr.removeClass('selected');
                }
            }).on('click.bizTableSelectOne', 'td .biz-label', function(e) {
                var selected = $(e.target).hasClass('biz-checkbox-checked'),
                    selectedCount = self.$main.find('td .biz-checkbox-checked').length, //不能用input计数
                    selectAll = self.$main.find('th :checkbox'),
                    tr = $(e.target).parent().parent();
                if (selectedCount === self.rowCount) {
                    selectAll.bizCheckbox('check');
                } else {
                    selectAll.bizCheckbox('uncheck');
                }
                if (selected) {
                    tr.addClass('selected');
                } else {
                    tr.removeClass('selected');
                }
            });
        },

        /**
         * 绑定排序事件
         * @protected
         */
        bindSort: function() {
            var self = this;
            this.$main.on('click.bizTableSort', 'th[sortable]', function(e) {
                var head = $(e.currentTarget);
                if (head.attr('des') !== undefined) {
                    head.removeAttr('des').attr('asc', '');
                } else if (head.attr('asc') !== undefined) {
                    head.removeAttr('asc').attr('des', '');
                } else {
                    head.parent().children('th').removeAttr('des').removeAttr('asc');
                    head.attr('des', '');
                }
                self.options.onSort.call(self, {
                    field: head.attr('field'),
                    des: head.attr('des') !== undefined,
                    asc: head.attr('asc') !== undefined
                }, e);
            });
        },

        /**
         * 绑定编辑事件
         * @protected
         */
        bindEdit: function() {
            var self = this;
            this.$main.find('td[editable]').on('validate', function(e, newValue) {
                if (self.options.changePattern && !self.options.changePattern.test(newValue)) {
                    return false;
                }
            });
            this.$main.find('td[editable]').on('change', function(e, newValue) {
                self.options.onChange.call(self, newValue, e);
            });
        },

        /**
         * 更新数据
         */
        refresh: function() {
            if (this.options.selectable) {
                this.createSelect();
                this.rowCount = this.$main.find('td :checkbox:enabled').length;
            }

            if (this.options.resizable) {
                this.$main.resizableColumns('destroy');
                this.$main.resizableColumns();
            }

            this.$main.find('td').prop('tabindex', 1);
            if (this.options.onChange) {
                this.bindEdit();
            }
        },

        /**
         * 获取选中行id（逗号分隔）
         * @return {String} 选中行id
         */
        getSelected: function() {
            return $.map(this.$main.find('td :checked'), function(checkbox, index) {
                return checkbox.id.replace(selectPrefix, '');
            }).join(',');
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass);

            this.$main.find(':checkbox').bizCheckbox('destroy');
            this.$main.find('td[editable]').off();
            this.$main.find('td').removeAttr('tabindex');

            this.$main.off('click.bizTableSelectAll')
                .off('click.bizTableSelectOne')
                .off('click.bizTableSort')
                .off('click.bizTableEdit');

            if (this.options.resizable) {
                this.$main.resizableColumns('destroy');
            }

            $('.biz-table-editor').off().remove();
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
                case 'getSelected':
                    return $(this).data(dataKey).getSelected();
                case 'destroy':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'refresh':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.refresh();
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
