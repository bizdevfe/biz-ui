require('../deps/jquery.editabletable');

/**
 * Table
 * @class
 * @param {HTMLElement}    table                           目标元素
 * @param {Object}         options                         参数
 * @param {Array}          options.column                  列配置
 * @param {Function|Array} options.column.content              单元格内容
 * @param {String}         options.column.field                表头字段名
 * @param {String}         options.column.title                表头文字
 * @param {Number}         options.column.width                此列最小宽度，建议每列都设置
 * @param {Number}         [options.column.align]              单元格对齐方式（left | center | right）
 * @param {Function}       [options.column.footContent]        总计行内容
 * @param {Boolean}        [options.column.editable]           单元格可编辑, 默认 false
 * @param {Boolean}        [options.column.escapeContent]      转义单元格, 默认 true
 * @param {Boolean}        [options.column.escapeTitle]        转义表头, 默认 true
 * @param {Boolean}        [options.column.sortable]           此列排序, 默认 false
 * @param {String}         [options.column.currentSort]        排序方式（des-降序 | asc-升序），仅 sortable 为 true 时生效
 * @param {Boolean}        [options.column.visible]            此列可见，默认 true
 * @param {Array}          options.data                    数据，data[i].disabledSelect = true 时此行不可选中，默认 false
 * @param {String}         [options.customClass]           自定义 class
 * @param {String}         [options.foot]                  总计行位置（top | bottom），默认无总计行
 * @param {String}         [options.noDataContent]         无数据提示，不转义
 * @param {Boolean}        [options.selectable]            可勾选，默认 false
 * @param {Function}       [options.onSelect]              勾选回调，onSelect(Object data, Event e)
 * @param {Function}       [options.onSort]                排序回调，onSort(Object data, Event e)
 * @param {Function}       [options.defaultSort]           点击排序时的排序方式（des-降序 | asc-升序），默认 'des'
 * @param {Boolean}        [options.lockHead]              表头锁定，默认 false
 * @param {Number}         [options.topOffset]             表头锁定时，表头上方预留高度（如表格上方工具栏同时锁定），默认 0
 * @param {Function}       [options.onValidate]            编辑单元格时的回调，返回 true 时，按下回车才能进入 onEdit 方法，否则进入 onFailEdit 方法，onValidate(Object data, Event e)
 * @param {Function}       [options.onFailEdit]            编辑单元格失败后的回调，onFailEdit(Object data, Event e)
 * @param {Function}       [options.onEdit]                编辑单元格成功后的回调，返回 false，取消编辑，onEdit(Object data, Event e)
 */
function Table(table, options) {
    this.main = table;
    this.$main = $(this.main);

    var defaultOption = {
        customClass: '',
        data: [],
        noDataContent: '<p><i class="biz-icon">&#xe001;</i> 没有数据</p>',
        selectable: false,
        defaultSort: 'des',
        lockHead: false,
        topOffset: 0
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-table',
    dataKey = 'bizTable';

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

Table.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        this.$main.html([
            '<div class="biz-table-head-wrap"><table class="biz-table-head"></table></div>',
            '<div class="biz-table-placeholder"></div>',
            '<div class="biz-table-body-wrap"><table class="biz-table-body"></table></div>'
        ].join(''));

        this.$headWrap = this.$main.find('.biz-table-head-wrap');
        this.$bodyWrap = this.$main.find('.biz-table-body-wrap');
        this.$placeholder = this.$main.find('.biz-table-placeholder');
        this.$tableHead = this.$main.find('.biz-table-head');
        this.$tableBody = this.$main.find('.biz-table-body');

        // 创建 thead
        this.$tableHead.html(this.createTableHead(options))
            .addClass([defaultClass, options.customClass].join(' '));

        // 创建 tbody
        this.$tableBody.html(this.createTableBody(options))
            .addClass([defaultClass, options.customClass, (this.rowSpan > 1 && options.data.length > 0) ? 'biz-rowspan' : ''].join(' '));

        // 创建总计行
        if (options.foot && options.data.length > 0) {
            var tbody = this.$tableBody.find('tbody'),
                foot = this.createFoot(options);
            if (options.foot === 'top') {
                tbody.prepend(foot);
            }
            if (options.foot === 'bottom') {
                tbody.append(foot);
            }
        }

        // 无数据提示行
        if (options.data.length === 0) {
            this.createNoDataContent();
        }

        // 勾选列
        if (options.selectable && options.data.length > 0) {
            this.createSelect(options.data);
            this.bindSelect();
        }

        // 排序
        if (options.onSort) {
            this.bindSort();
        }

        // 自动横向滚动
        var self = this;
        this.$headWrap.on('scroll', function() {
            self.$bodyWrap[0].scrollLeft = this.scrollLeft;
        });
        this.$bodyWrap.on('scroll', function() {
            self.$headWrap[0].scrollLeft = this.scrollLeft;
        });

        // 同步宽度
        this.syncWidth();
        $(window).on('resize.bizTable', function() {
            self.syncWidth();
        });

        // 表头锁定
        if (options.lockHead) {
            var headHeight = this.$headWrap.height();
            $(window).on('scroll.bizTable', function() {
                var currentOffsetTop = self.$main.offset().top - options.topOffset;
                if ($(window).scrollTop() > currentOffsetTop) {
                    if (!self.hasLocked) {
                        self.$headWrap.css({
                            position: 'fixed',
                            top: self.options.topOffset,
                            width: self.$main.width()
                        });
                        self.$placeholder.css({
                            height: headHeight
                        });
                        self.hasLocked = true;
                    }
                } else {
                    if (self.hasLocked) {
                        self.$headWrap.css({
                            position: 'static',
                            top: 'auto',
                            width: 'auto'
                        });
                        self.$placeholder.css({
                            height: 0
                        });
                        self.hasLocked = false;
                    }
                }
            });
        }

        // 编辑单元格
        this.$tableBody.editableTableWidget();
        if (options.onValidate) {
            this.bindValidate();
        }
        if (options.onEdit) {
            this.bindEdit();
        }
        if (options.onFailEdit) {
            this.bindFailEdit();
        }
    },

    /**
     * 创建 thead
     * @param {Object} options 参数
     * @return {String}
     * @private
     */
    createTableHead: function(options) {
        var thead = $('<thead><tr></tr></thead><tbody></tbody>'),
            column = options.column,
            columnCount = column.length;

        this.rowSpan = 1;

        for (var i = 0; i < columnCount; i++) {
            var col = column[i];

            if (typeof col.visible !== 'undefined' && !col.visible) {
                continue;
            }

            if (!$.isArray(col.content)) {
                col.content = [col.content];
            }
            if (col.content.length > this.rowSpan) {
                this.rowSpan = col.content.length;
            }

            var th = $('<th nowrap></th>').attr({
                width: col.width,
                field: col.field
            });

            var title = (col.escapeTitle === false) ? col.title : escapeHTML(col.title);
            if (col.sortable) {
                var wrap = $('<div class="sortable"></div>').html(title);
                if (col.currentSort) {
                    wrap.attr(col.currentSort, '');
                }
                title = wrap.prop('outerHTML');
            }

            thead.find('tr').append(th.html(title).prop('outerHTML'));
        }

        return thead.prop('outerHTML');
    },

    /**
     * 创建 tbody
     * @param {Object} options 参数
     * @return {String}
     * @private
     */
    createTableBody: function(options) {
        var tbody = $('<tbody></tbody>'),
            column = options.column,
            columnCount = column.length,
            data = options.data,
            rowCount = data.length;

        for (var i = 0; i < rowCount; i++) {
            var tr = $('<tr></tr>'),
                item = data[i],
                index = i + 1;

            for (var j = 0; j < columnCount; j++) {
                var col = column[j];

                if (typeof col.visible !== 'undefined' && !col.visible) {
                    continue;
                }

                if (!$.isArray(col.content)) {
                    col.content = [col.content];
                }

                var td = $('<td></td>').attr({
                    align: col.align,
                    width: col.width
                });
                if (col.editable && col.content.length === 1) {
                    td.attr('editable', '');
                }
                if (this.rowSpan > 1 && col.content.length === 1) {
                    td.attr('rowspan', this.rowSpan);
                }

                var content = col.content[0].apply(this, [item, index, col.field]).toString();
                td.html((col.escapeContent === false) ? content : escapeHTML(content)).appendTo(tr);
            }

            tbody.append(tr);

            if (this.rowSpan > 1) {
                for (var m = 1; m < this.rowSpan; m++) {
                    var _tr = $('<tr></tr>');
                    for (var n = 0; n < columnCount; n++) {
                        var _col = column[n];

                        if (!$.isArray(_col.content)) {
                            _col.content = [_col.content];
                        }

                        if ((typeof _col.visible !== 'undefined' && !_col.visible) || _col.content.length === 1) {
                            continue;
                        }

                        var _td = $('<td></td>').attr('align', _col.align),
                            _content = _col.content[m].apply(this, [item, index, _col.field]).toString();
                        _td.html((_col.escapeContent === false) ? _content : escapeHTML(_content)).appendTo(_tr);
                    }
                    tbody.append(_tr);
                }
            }
        }

        return tbody.prop('outerHTML');
    },

    /**
     * 创建总计行
     * @param {Object} options 参数
     * @return {String}
     * @private
     */
    createFoot: function(options) {
        var sum = $('<tr class="sum"></tr>'),
            column = options.column,
            columnCount = column.length;

        if (options.selectable) {
            sum.append('<td width="24"></td>');
        }

        for (var i = 0; i < columnCount; i++) {
            var col = column[i];

            if (typeof col.visible !== 'undefined' && !col.visible) {
                continue;
            }

            var td = $('<td></td>').attr({
                align: col.align,
                width: col.width
            });

            var content = col.footContent ? col.footContent.call(this, col.field).toString() : '';
            td.html((col.escapeContent === false) ? content : escapeHTML(content)).appendTo(sum);
        }

        return sum.prop('outerHTML');
    },

    /**
     * 创建无数据提示行
     * @private
     */
    createNoDataContent: function() {
        var colspan = this.options.column.length;
        $.each(this.options.column, function(index, col) {
            if (col.visible) {
                colspan--;
            }
        });
        if (this.options.selectable) {
            colspan = colspan + 1;
        }
        this.$tableBody.find('tbody').append('<tr class="no-data"><td colspan="' + colspan + '">' + this.options.noDataContent + '</td></tr>');
    },

    /**
     * 创建 Checkbox 控件
     * @param {Array} data 数据
     * @private
     */
    createSelect: function(data) {
        var headEnabled = false;
        if (this.rowSpan === 1) {
            this.$tableBody.find('tr[class!="sum"]').each(function(index, tr) {
                var td = $('<td width="24" align="center" class="select-col"><input type="checkbox" title=" "></td>');
                $(this).prepend(td);
                if (data[index].disabledSelect) {
                    $(this).addClass('select-disabled');
                    td.find(':checkbox').prop('disabled', true);
                } else {
                    headEnabled = true;
                }
            });
        } else {
            var self = this,
                dataIndex = 0;
            this.$tableBody.find('tr[class!="sum"]').each(function(index, tr) {
                if ((index + self.rowSpan) % self.rowSpan === 0) {
                    var td = $('<td width="24" align="center" class="select-col" rowspan="' + self.rowSpan + '"><input type="checkbox" title=" "></td>');
                    $(this).prepend(td);
                    if (data[dataIndex].disabledSelect) {
                        $(this).addClass('select-disabled');
                        td.find(':checkbox').prop('disabled', true);
                    } else {
                        headEnabled = true;
                    }
                    dataIndex++;
                }
            });
        }

        var th = $('<th nowrap width="24" class="select-col"><input type="checkbox" title=" "></th>');
        this.$tableHead.find('tr').prepend(th);
        if (!headEnabled) {
            th.find(':checkbox').prop('disabled', true);
        }

        this.$main.find(':checkbox').bizCheckbox({
            theme: 'gray'
        });
    },

    /**
     * 绑定 Checkbox 事件
     * @private
     */
    bindSelect: function() {
        var self = this;
        this.$main.on('click.bizTableSelectAll', '.biz-table-head .select-col .biz-label', function(e) {
            if ($(this).hasClass('biz-checkbox-unchecked-disabled')) {
                return;
            }

            var selected = $(this).hasClass('biz-checkbox-checked'),
                checkbox = self.$tableBody.find('.select-col :checkbox').filter(':not(:disabled)'),
                tr = self.$tableBody.find('tr[class!="sum"]').filter('[class!="select-disabled"]');

            if (selected) {
                checkbox.bizCheckbox('check');
                tr.addClass('selected');
            } else {
                checkbox.bizCheckbox('uncheck');
                tr.removeClass('selected');
            }

            if (self.options.onSelect) {
                self.options.onSelect.call(self, self.getSelected(), e);
            }
        }).on('click.bizTableSelectOne', '.biz-table-body .select-col .biz-label', function(e) {
            if ($(this).hasClass('biz-checkbox-unchecked-disabled')) {
                return;
            }

            var selected = $(this).hasClass('biz-checkbox-checked'),
                tr = $(this).parent().parent();
            if (selected) {
                tr.addClass('selected');
            } else {
                tr.removeClass('selected');
            }

            var selectedCount = self.$tableBody.find('.select-col .biz-checkbox-checked').length,
                checkboxCount = self.$tableBody.find('.select-col :checkbox').filter(':not(:disabled)').length,
                selectAll = self.$tableHead.find('.select-col :checkbox');
            if (selectedCount === checkboxCount) {
                selectAll.bizCheckbox('check');
            } else {
                selectAll.bizCheckbox('uncheck');
            }

            if (self.options.onSelect) {
                self.options.onSelect.call(self, self.getSelected(), e);
            }
        });
    },

    /**
     * 获取选中行的序号
     * @return {Array}
     * @private
     */
    getSelectedIndex: function() {
        var self = this,
            result = [];
        this.$tableBody.find('tr[class!="sum"]').each(function(index, tr) {
            if ($(tr).hasClass('selected')) {
                result.push(self.rowSpan > 1 ? (index / self.rowSpan) : index);
            }
        });
        return result;
    },

    /**
     * 获取选中行数据
     * @return {Array}
     */
    getSelected: function() {
        var self = this;
        return $.map(this.getSelectedIndex(), function(index) {
            return self.options.data[index];
        });
    },

    /**
     * 设置选中状态
     * @param {Number|Array} rowIndex 行号, 0表示全部
     * @param {Boolean}      selected 状态
     * @param {Boolean}      [fire]   触发 onSelect，默认 false
     */
    setSelected: function(rowIndex, selected, fire) {
        var self = this;
        if (rowIndex === 0) {
            rowIndex = $.map(this.options.data, function(val, index) {
                return index + 1;
            });
        }
        if (!$.isArray(rowIndex)) {
            rowIndex = [rowIndex];
        }

        $.each(rowIndex, function(index, val) {
            var tr = self.$tableBody.find('tbody tr:nth-child(' + (self.rowSpan > 1 ? (val * self.rowSpan) : val) + ')')
                .filter('[class!="sum"]')
                .filter('[class!="select-disabled"]'),
                checkbox = tr.find('.select-col :checkbox');
            if (selected) {
                checkbox.bizCheckbox('check');
                tr.addClass('selected');
            } else {
                checkbox.bizCheckbox('uncheck');
                tr.removeClass('selected');
            }
        });

        var selectedCount = self.$tableBody.find('.select-col .biz-checkbox-checked').length,
            checkboxCount = self.$tableBody.find('.select-col :checkbox').filter(':not(:disabled)').length,
            selectAll = self.$tableHead.find('.select-col :checkbox');
        if (selectedCount === checkboxCount) {
            selectAll.bizCheckbox('check');
        } else {
            selectAll.bizCheckbox('uncheck');
        }

        if (fire && this.options.onSelect) {
            this.options.onSelect.call(this, this.getSelected());
        }
    },

    /**
     * 获取列表数据
     * @return {Array}
     */
    getData: function() {
        return this.options.data;
    },

    /**
     * 获取列配置
     * @return {Array}
     */
    getColumn: function() {
        return this.options.column;
    },

    /**
     * 移除 sort class
     * @private
     */
    removeSort: function() {
        this.$tableHead.find('.sortable').removeAttr('des').removeAttr('asc');
    },

    /**
     * 绑定排序事件
     * @private
     */
    bindSort: function() {
        var self = this;
        this.$main.on('click.bizTableSort', '.biz-table-head .sortable', function(e) {
            var head = $(this),
                field = head.parent().attr('field');
            if (head.attr('des') !== undefined) {
                self.removeSort();
                head.attr('asc', '');
            } else if (head.attr('asc') !== undefined) {
                self.removeSort();
                head.attr('des', '');
            } else {
                self.removeSort();
                head.attr(self.options.defaultSort === 'des' ? 'des' : 'asc', '');
            }
            self.options.onSort.call(self, {
                field: field,
                des: head.attr('des') !== undefined,
                asc: head.attr('asc') !== undefined
            }, e);
        });
    },

    /**
     * 同步宽度
     * @private
     */
    syncWidth: function() {
        this.$headWrap.css({
            width: this.$main.width()
        });
        this.$tableHead.css({
            width: this.$tableBody.width()
        });
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
     * @param {String|Array} fields  列字段
     * @param {Boolean}      visible 列字段
     * @private
     */
    setColumnVisible: function(fields, visible) {
        if (!$.isArray(fields)) {
            fields = [fields];
        }
        var self = this;
        $.each(fields, function(index, field) {
            $.each(self.options.column, function(i, col) {
                if (col.field === field) {
                    col.visible = visible;
                }
            });
        });
        this.refresh();
    },

    /**
     * 更新列表数据
     * @param {Array} data 数据
     */
    updateData: function(data) {
        this.options.data = $.map(data || [], function(val, index) {
            return val;
        });
        this.refresh();
    },

    /**
     * 更新行数据
     * @param {Number} rowIndex 行号（从 1 开始）
     * @param {Object} data     行数据
     */
    updateRow: function(rowIndex, data) {
        this.options.data[rowIndex - 1] = $.extend(true, {}, data);
        this.refresh();
    },

    /**
     * 更新单元格数据
     * @param {Number} rowIndex 行号（从 1 开始）
     * @param {String} field    列字段
     * @param {Mixed} data      单元格数据
     */
    updateCell: function(rowIndex, field, data) {
        this.options.data[rowIndex - 1][field] = data;
        this.refresh();
    },

    /**
     * 绑定验证事件
     * @private
     */
    bindValidate: function() {
        var self = this;
        this.$main.on('validate', 'td[editable]', function(e, newValue) {
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
     * 绑定编辑成功事件
     * @private
     */
    bindEdit: function() {
        var self = this;
        this.$main.on('change', 'td[editable]', function(e, newValue) {
            var row = $(this).parent(),
                columIndex = row.find('td').index($(this)),
                rowIndex = row.parent().find('tr[class!="sum"]').index(row) / self.rowSpan;
            if (self.options.selectable) {
                columIndex = columIndex - 1;
            }
            var field = self.options.column[columIndex].field;

            // 更新 data
            self.options.data[rowIndex][field] = newValue;

            return self.options.onEdit.call(self, {
                newValue: newValue,
                field: field,
                item: self.options.data[rowIndex],
                index: rowIndex
            }, e);
        });
    },

    /**
     * 绑定编辑失败事件
     * @private
     */
    bindFailEdit: function() {
        var self = this;
        this.$main.on('fail', 'td[editable]', function(e, newValue) {
            var row = $(this).parent(),
                columIndex = row.find('td').index($(this)),
                rowIndex = row.parent().find('tr[class!="sum"]').index(row) / self.rowSpan;
            if (self.options.selectable) {
                columIndex = columIndex - 1;
            }
            var field = self.options.column[columIndex].field;

            return self.options.onFailEdit.call(self, {
                newValue: newValue,
                field: field,
                item: self.options.data[rowIndex],
                index: rowIndex
            }, e);
        });
    },

    /**
     * 重绘表格
     */
    refresh: function() {
        var options = this.options;

        this.$main.find('.select-col :checkbox').bizCheckbox('destroy');

        this.$tableHead.html(this.createTableHead(options));
        this.$tableBody.html(this.createTableBody(options));

        if (options.foot && options.data.length > 0) {
            var tbody = this.$tableBody.find('tbody'),
                foot = this.createFoot(options);
            if (options.foot === 'top') {
                tbody.prepend(foot);
            }
            if (options.foot === 'bottom') {
                tbody.append(foot);
            }
        }

        if (options.data.length === 0) {
            this.createNoDataContent();
        }

        if (options.selectable && options.data.length > 0) {
            this.createSelect(options.data);
        }

        this.$headWrap[0].scrollLeft = this.$bodyWrap[0].scrollLeft = 0;

        this.syncWidth();

        this.$tableBody.find('td').prop('tabindex', 1);
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$main.find('.select-col :checkbox').bizCheckbox('destroy');

        this.$main
            .off('click.bizTableSelectAll')
            .off('click.bizTableSelectOne')
            .off('click.bizTableSort')
            .off('click.bizTableEdit')
            .off('validate')
            .off('change')
            .off('fail');

        this.$headWrap.off();
        this.$bodyWrap.off();

        $(window).off('scroll.bizTable')
            .off('resize.bizTable')
            .off('resize.bizTableEdit');

        $('.biz-table-editor').off().remove();

        this.$main.empty();

        this.$main.data(dataKey, null);
    }
};

$.extend($.fn, {
    bizTable: function(method) {
        var internal_return, args = arguments;
        this.each(function() {
            var instance = $(this).data(dataKey);
            if (instance) {
                if (typeof method === 'string' && typeof instance[method] === 'function') {
                    internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                    if (internal_return !== undefined) {
                        return false; // break loop
                    }
                }
            } else {
                if (method === undefined || jQuery.isPlainObject(method)) {
                    $(this).data(dataKey, new Table(this, method));
                }
            }
        });

        if (internal_return !== undefined) {
            return internal_return;
        } else {
            return this;
        }
    }
});

module.exports = Table;