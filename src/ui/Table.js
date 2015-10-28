/**
 * @ignore
 */
define(function(require) {
    require('dep/jquery.resizableColumns');
    require('dep/jquery.editabletable');

    /**
     * Table constructor
     *
     * <iframe width="100%" height="350" src="//jsfiddle.net/bizdevfe/q4myap58/34/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} table 目标元素
     * @param {Object}   options 参数
     * @param {String}   [options.skin] 皮肤类名
     * @param {Array}    options.column 列配置
     * @param {String}   options.column.field 表头字段名
     * @param {String}   options.column.title 表头文字
     * @param {Array}    options.column.content 单元格内容(拆分单元格内容: hover失效, editable失效)
     * @param {Function} [options.column.footContent] 总计行内容
     * @param {Boolean}  [options.column.escapeTitle] 转义表头文字, 默认true
     * @param {Boolean}  [options.column.escapeContent] 转义单元格内容, 默认true
     * @param {Boolean}  [options.column.sortable] 是否排序, 默认false
     * @param {String}   [options.column.currentSort] des-降序, asc-升序, sortable为true时生效
     * @param {Boolean}  [options.column.editable] 是否编辑, 默认false
     * @param {Number}   [options.column.width] 宽度
     * @param {Number}   [options.column.align] left-居左, right-居中, center-居右
     * @param {Boolean}  [options.column.visible] 是否显示, 默认true
     * @param {Array}    options.data 数据
     * @param {String}   [options.foot] 总计行, top-顶部, bottom-底部
     * @param {Boolean}  [options.selectable] 是否含勾选列
     * @param {Boolean}  [options.resizable] 是否可调整列宽
     * @param {Function} [options.onSort] 排序回调, onSort(data, event)
     * @param {Function} [options.onSelect] 勾选回调, onSelect(data, event)
     * @param {Function} [options.onEdit] 编辑单元格回调, onEdit(data, event)
     * @param {Function} [options.onValidate] 验证回调, onValidate(data, event)
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
        this.options = $.extend(defaultOption, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-table',
        selectPrefix = 'biz-table-select-row-';

    Table.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.html(
                '<div class="biz-table-scroll-wrap"><div class="biz-table-scroll"></div></div>' +
                '<div class="biz-table-wrap"><table></table></div>'
            );

            var scrollWrap = this.$main.find('.biz-table-scroll-wrap'),
                tableWrap = this.$main.find('.biz-table-wrap');

            //创建表格
            tableWrap.find('table')
                .html(this.createTable(options))
                .addClass(defaultClass + (options.skin ? (' ' + options.skin) : '') + (this.rowSpan > 1 ? ' biz-rowspan' : ''));

            //勾选列
            if (options.selectable) {
                this.createSelect();
                this.bindSelect();
            }

            //总计行
            if(this.getData() && this.getData().length){//如果没有数据，那么不显示合计
                if (options.foot === 'top') {
                    this.$main.find('tbody').prepend(this.createFoot(options));
                }
                if (options.foot === 'bottom') {
                    this.$main.find('tbody').append(this.createFoot(options));
                }
            }

            //模拟滚条
            var self = this;
            this.updateScroll();
            $(window).on('resize.bizTable', function() {
                self.updateScroll();
            });
            this.$main.find('.biz-table-scroll-wrap').on('scroll', function() {
                tableWrap[0].scrollLeft = this.scrollLeft;
            });
            this.$main.find('.biz-table-wrap').on('scroll', function() {
                scrollWrap[0].scrollLeft = this.scrollLeft;
            });

            //调整列宽
            if (options.resizable) {
                this.$main.find('table').resizableColumns({
                    start: function() {
                        $('.biz-table-editor').blur();
                    }
                });
            }

            //排序
            if (options.onSort) {
                this.bindSort();
            }

            //编辑单元格
            this.$main.find('table').editableTableWidget();
            if (options.onEdit) {
                this.bindEdit();
            }
            if (options.onValidate) {
                this.bindValidate();
            }
        },

        /**
         * 刷新滚条
         * @protected
         */
        updateScroll: function() {
            this.$main.find('.biz-table-scroll').css({
                width: this.$main.find('table').width()
            });
        },

        /**
         * 转义HTML
         * @param {String} str
         * @return {String}
         * @protected
         */
        escapeHTML: function(str) {
            return str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },

        /**
         * 创建表格
         * @param {Object} options
         * @return {String}
         * @protected
         */
        createTable: function(options) {
            var table = ['<thead><tr>'],
                column = options.column,
                columnCount = column.length,
                data = options.data,
                rowCount = data.length;

            this.rowSpan = 1;

            //表头
            for (var i = 0; i < columnCount; i++) {
                var item = column[i];
                if (typeof item.visible !== 'undefined' && !item.visible) {
                    continue;
                }

                if (item.content.length > this.rowSpan) {
                    this.rowSpan = item.content.length;
                }

                var sortable = (typeof item.sortable === 'undefined' || !item.sortable) ? '' : ' sortable',
                    sort = (item.sortable && typeof item.currentSort !== 'undefined') ? (' ' + item.currentSort) : '',
                    width = item.width ? ' width="' + item.width + '"' : '',
                    title = (typeof item.escapeTitle === 'undefined' || item.escapeTitle) ? this.escapeHTML(item.title) : item.title;
                table.push('<th nowrap field="' + item.field + '"' + sortable + sort + width + '>' + title + '</th>');
            }

            table.push('</tr></thead><tbody>');

            //数据
            for (var j = 0; j < rowCount; j++) {
                table.push('<tr>');

                for (var k = 0; k < columnCount; k++) {
                    var col = column[k];
                    if (typeof col.visible !== 'undefined' && !col.visible) {
                        continue;
                    }
                    var editable = (col.content.length > 1 || typeof col.editable === 'undefined' || !col.editable) ? '' : ' editable',
                        align = col.align ? ' align="' + col.align + '"' : '',
                        rowSpan = (this.rowSpan > 1 && col.content.length === 1) ? (' rowspan="' + this.rowSpan + '"') : '',
                        content = col.content[0].apply(this, [data[j], j + 1, col.field]) + '',
                        escapeContent = (typeof col.escapeContent === 'undefined' || col.escapeContent) ? this.escapeHTML(content) : content;
                    table.push('<td' + rowSpan + editable + align + '>' + escapeContent + '</td>');
                }

                table.push('</tr>');

                //附加行
                if (this.rowSpan > 1) {
                    for (var m = 1; m < this.rowSpan; m++) {
                        table.push('<tr>');
                        for (var n = 1; n < columnCount; n++) {
                            var _col = column[n];
                            if ((typeof _col.visible !== 'undefined' && !_col.visible) || _col.content.length === 1) {
                                continue;
                            }
                            var _align = _col.align ? ' align="' + _col.align + '"' : '',
                                _content = _col.content[m].apply(this, [data[j], j + 1, _col.field]) + '',
                                _escapeContent = (typeof _col.escapeContent === 'undefined' || _col.escapeContent) ? this.escapeHTML(_content) : _content;
                            table.push('<td' + _align + '>' + _escapeContent + '</td>');
                        }
                        table.push('</tr>');
                    }
                }
            }

            table.push('</tbody>');

            return table.join('');
        },

        /**
         * 创建总计行
         * @param {Object} options
         * @return {String}
         * @protected
         */
        createFoot: function(options) {
            var sum = ['<tr class="sum">'],
                column = options.column,
                columnCount = column.length;

            if (options.selectable) {
                sum.push('<td></td>');
            }
            for (var i = 0; i < columnCount; i++) {
                var col = column[i];
                if (typeof col.visible !== 'undefined' && !col.visible) {
                    continue;
                }
                var align = col.align ? ' align="' + col.align + '"' : '',
                    content = col.footContent ? col.footContent.call(this, col.field) + '' : '',
                    escapeContent = (typeof col.escapeContent === 'undefined' || col.escapeContent) ? this.escapeHTML(content) : content;
                sum.push('<td' + align + '>' + escapeContent + '</td>');
            }

            sum.push('</tr>');

            return sum.join('');
        },

        /**
         * 创建Checkbox控件
         * @protected
         */
        createSelect: function() {
            this.$main.find('tr:first').prepend('<th width="20"><input type="checkbox" title=" " id="' + (selectPrefix + 0) + '" /></th>');

            if (this.rowSpan === 1) {
                this.$main.find('tr').each(function(index, tr) {
                    if (index !== 0) {
                        $(tr).prepend('<td align="center"><input type="checkbox" title=" " id="' + (selectPrefix + index) + '" /></td>');
                    }
                });
            } else {
                var self = this,
                    rowIndex = 1;
                this.$main.find('tr').each(function(index, tr) {
                    if ((index + (self.rowSpan - 1)) % self.rowSpan === 0) {
                        $(tr).prepend('<td rowspan="' + self.rowSpan + '" align="center"><input type="checkbox" title=" " id="' + (selectPrefix + rowIndex) + '" /></td>');
                        rowIndex = rowIndex + 1;
                    }
                });
            }

            this.$main.find(':checkbox').bizCheckbox();
        },

        /**
         * 创建Checkbox控件
         * @protected
         */
        bindSelect: function() {
            var self = this;
            this.$main.on('click.bizTableSelectAll', 'th .biz-label', function(e) {
                var selected = $(e.target).hasClass('biz-checkbox-checked'),
                    checkbox = self.$main.find('td :checkbox'),
                    tr = self.$main.find('tr[class!="sum"]');
                if (selected) {
                    checkbox.bizCheckbox('check');
                    tr.addClass('selected');
                    if (self.options.onSelect) {
                        self.options.onSelect.call(self, self.options.data, e);
                    }
                } else {
                    checkbox.bizCheckbox('uncheck');
                    tr.removeClass('selected');
                    if (self.options.onSelect) {
                        self.options.onSelect.call(self, [], e);
                    }
                }
            }).on('click.bizTableSelectOne', 'td .biz-label', function(e) {
                var selected = $(e.target).hasClass('biz-checkbox-checked'),
                    selectedCount = self.$main.find('td .biz-checkbox-checked').length,
                    selectAll = self.$main.find('th :checkbox'),
                    tr = $(e.target).parent().parent(),
                    rowCount = self.options.data.length;
                if (selectedCount === rowCount) {
                    selectAll.bizCheckbox('check');
                } else {
                    selectAll.bizCheckbox('uncheck');
                }
                if (selected) {
                    tr.addClass('selected');
                } else {
                    tr.removeClass('selected');
                }
                if (self.options.onSelect) {
                    self.options.onSelect.call(self, $.map(self.getSelectedIndex(), function(item, index) {
                        return self.options.data[item];
                    }), e);
                }
            });
        },

        /**
         * 获取勾选行序号
         * @return {Array}
         * @protected
         */
        getSelectedIndex: function() {
            return $.map(this.$main.find('td .biz-checkbox-checked'), function(label, index) {
                return parseInt($(label).attr('for').replace(selectPrefix, ''), 10) - 1;
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
         * 绑定验证事件
         * @protected
         */
        bindValidate: function() {
            var self = this;
            this.$main.find('td[editable]').on('validate', function(e, newValue) {
                var columIndex = $(this).parent().find('td').index($(this));
                if (self.options.selectable) {
                    columIndex = columIndex - 1;
                }
                return self.options.onValidate.call(self, {
                    newValue: newValue,
                    field: self.options.column[columIndex].field
                }, e);
            });
        },

        /**
         * 绑定编辑事件
         * @protected
         */
        bindEdit: function() {
            var self = this;
            this.$main.find('td[editable]').on('change', function(e, newValue) {
                var rowIndex = parseInt($(this).parent().find(':checkbox').attr('id').replace(selectPrefix, ''), 10),
                    columIndex = $(this).parent().find('td').index($(this));
                if (self.options.selectable) {
                    columIndex = columIndex - 1;
                }
                var field = self.options.column[columIndex].field;

                //更新data
                self.options.data[rowIndex - 1][field] = newValue;

                self.options.onEdit.call(self, {
                    newValue: newValue,
                    item: self.options.data[rowIndex - 1],
                    index: rowIndex,
                    field: field
                }, e);
            });
        },

        /**
         * 获取列表数据
         * @return {Array}
         */
        getData: function() {
            return this.options.data;
        },

        /**
         * 更新列表数据
         * @param {Array} data
         */
        updateData: function(data) {
            this.options.data = data;
            this.refresh();
        },

        /**
         * 更新列数据
         * @param {Number} rowIndex 行号
         * @param {Object} data 行数据
         */
        updateRow: function(rowIndex, data) {
            this.options.data[rowIndex - 1] = data;
            this.refresh();
        },

        /**
         * 更新单元格数据
         * @param {Number} rowIndex 行号
         * @param {String} field 列字段
         * @param {Mixed} data 单元格数据
         */
        updateCell: function(rowIndex, field, data) {
            this.options.data[rowIndex - 1][field] = data;
            this.refresh();
        },

        /**
         * 获取勾选行数据
         * @return {Array}
         */
        getSelected: function() {
            var self = this;
            return $.map(this.getSelectedIndex(), function(item, index) {
                return self.options.data[item];
            });
        },

        /**
         * 设置勾选状态
         * @param {Number|Array} rowIndex 行号, 0表示全部
         * @param {Boolean} selected 勾选状态
         */
        setSelected: function(rowIndex, selected) {
            var self = this;
            if (rowIndex === 0) {
                rowIndex = $.map(this.options.data, function(val, index) {
                    return index + 1;
                });
            }
            if (toString.call(rowIndex) !== '[object Array]') {
                rowIndex = [rowIndex];
            }

            $.each(rowIndex, function(index, val) {
                var checkbox = self.$main.find('#' + selectPrefix + val),
                    tr = checkbox.parent().parent();
                if (selected) {
                    checkbox.bizCheckbox('check');
                    tr.addClass('selected');
                } else {
                    checkbox.bizCheckbox('uncheck');
                    tr.removeClass('selected');
                }
            });

            var checkAll = this.$main.find('th :checkbox');
            if (this.$main.find('td .biz-checkbox-checked').length === this.options.data.length) {
                checkAll.bizCheckbox('check');
            } else {
                checkAll.bizCheckbox('uncheck');
            }
        },

        /**
         * 显示列
         * @param {String|Array} field 列字段
         */
        showColumn: function(field) {
            this.setColumnVisible(field, true);
        },

        /**
         * 隐藏列
         * @param {String|Array} field 列字段
         */
        hideColumn: function(field) {
            this.setColumnVisible(field, false);
        },

        /**
         * 设置列显隐
         * @param {String|Array} field 列字段
         * @param {Boolean} visible 列字段
         * @protected
         */
        setColumnVisible: function(field, visible) {
            if (toString.call(field) !== '[object Array]') {
                field = [field];
            }
            var self = this;
            $.each(field, function(i, f) {
                $.each(self.options.column, function(j, col) {
                    if (col.field === f) {
                        col.visible = visible;
                    }
                });
            });
            this.refresh();
        },

        /**
         * 刷新表格
         * @protected
         */
        refresh: function() {
            //销毁
            this.$main.find(':checkbox').bizCheckbox('destroy');
            this.$main.find('td[editable]').off();

            //重绘表格
            this.$main.find('.biz-table-wrap table').html(this.createTable(this.options));
            //重建checkbox
            if (this.options.selectable) {
                this.createSelect();
            }
            //重绘总计行
            if(this.getData() && this.getData().length){//如果没有数据，那么不显示合计
                if (this.options.foot === 'top') {
                    this.$main.find('tbody').prepend(this.createFoot(this.options));
                }
                if (this.options.foot === 'bottom') {
                    this.$main.find('tbody').append(this.createFoot(this.options));
                }
            }
            //刷新滚条
            var scrollWrap = this.$main.find('.biz-table-scroll-wrap'),
                tableWrap = this.$main.find('.biz-table-wrap');
            tableWrap[0].scrollLeft = scrollWrap[0].scrollLeft = 0;
            this.updateScroll();

            if (this.options.resizable) {
                this.$main.find('table').resizableColumns('destroy').resizableColumns();
            }

            this.$main.find('td').prop('tabindex', 1);
            if (this.options.onEdit) {
                this.bindEdit();
            }
            if (this.options.onValidate) {
                this.bindValidate();
            }
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.find(':checkbox').bizCheckbox('destroy');
            this.$main.find('td[editable]').off();

            this.$main.off('click.bizTableSelectAll')
                .off('click.bizTableSelectOne')
                .off('click.bizTableSort');

            if (this.options.resizable) {
                this.$main.resizableColumns('destroy');
            }

            $(window).off('resize.bizTable');
            this.$main.find('.biz-table-scroll-wrap').off();
            this.$main.find('.biz-table-wrap').off();

            this.$main.empty();

            $('.biz-table-editor').off().remove();
        }
    };

    function isTable(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
    }

    var dataKey = 'bizTable';

    $.extend($.fn, {
        bizTable: function(method, options) {
            var table;
            switch (method) {
                case 'getData':
                    return this.data(dataKey).getData();
                case 'updateData':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.updateData(options);
                        }
                    });
                    break;
                case 'updateRow':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.updateRow(args[1], args[2]);
                        }
                    });
                    break;
                case 'updateCell':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.updateCell(args[1], args[2], args[3]);
                        }
                    });
                    break;
                case 'getSelected':
                    return this.data(dataKey).getSelected();
                case 'setSelected':
                    var args = arguments;
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.setSelected(args[1], args[2]);
                        }
                    });
                    break;
                case 'showColumn':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.showColumn(options);
                        }
                    });
                    break;
                case 'hideColumn':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.hideColumn(options);
                        }
                    });
                    break;
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
