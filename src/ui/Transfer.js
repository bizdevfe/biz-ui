/**
 * Transfer
 * @class
 * @param {HTMLElement} transfer              目标元素
 * @param {Object}      [options]             参数
 * @param {String}      [options.customClass] 自定义 class
 * @param {Array}       [options.dataSource]  数据
 * @param {Object}      [options.keyMap]      数据字段，默认 {id: 'id', title: 'title', chosen: 'chosen'}
 * @param {Array}       [options.titles]      标题
 * @param {String}      [options.noContent]   无数据提示，不转义
 * @param {Function}    [options.onChange]    移动数据回调，onChange(Array data, Event e)
 * @param {String}      [options.theme]       主题
 */
function Transfer(transfer, options) {
    this.main = transfer;
    this.$main = $(this.main);

    var defaultOption = {
        theme: window.bizui.theme,
        customClass: '',
        dataSource: [],
        keyMap: {
            id: 'id',
            title: 'title',
            chosen: 'chosen'
        },
        titles: ['请选择', '已选择'],
        noContent: '请新增选项'
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-transfer',
    dataKey = 'bizTransfer';

Transfer.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        var tpl = $('\
			<div class="biz-transfer-list">\
				<div class="biz-transfer-list-header">\
					<input type="checkbox" title="' + options.titles[0] + '">\
				</div>\
				<div class="biz-transfer-list-body"><ul class="biz-transfer-list-content"></ul></div>\
			</div>\
			<div class="biz-transfer-operation">\
				<button class="biz-transfer-move-right"><i class="biz-icon">&#xe315;</i></button>\
				<button class="biz-transfer-move-left"><i class="biz-icon">&#xe314;</i></button>\
			</div>\
			<div class="biz-transfer-list">\
				<div class="biz-transfer-list-header">\
					<input type="checkbox" title="' + options.titles[1] + '">\
				</div>\
				<div class="biz-transfer-list-body"><ul class="biz-transfer-list-content"></ul></div>\
			</div>\
		');

        this.$main.addClass(defaultClass + ' ' + options.customClass).append(tpl);

        var content = this.$main.find('.biz-transfer-list-content');
        this.$leftListBody = $(content[0]);
        this.$rightListBody = $(content[1]);

        this.render(options.dataSource);
    },

    /**
     * 渲染
     * @param {Array} data 源数据
     * @private
     */
    render: function(data) {
        if (data.length === 0) {
            this.$leftListBody.html('<li class="biz-transfer-list-content-item">' + this.options.noContent + '</li>');
        }
        this.addItems(data);
        this.bindSelect();
        this.createButton();
    },

    /**
     * 添加数据项
     * @param {Array} data 源数据
     * @private
     */
    addItems: function(data) {
        var leftData = this.formatInput(data),
            rightData = this.getTargets(leftData),
            me = this;

        $.each(leftData, function(index, value) {
            me.$leftListBody.append([
                '<li class="biz-transfer-list-content-item">',
                '<input type="checkbox" data-id="' + value.id + '" title="' + value.title + '" ' + (value.chosen ? 'disabled' : '') + '/></li>'
            ].join(''));
        });

        $.each(rightData, function(index, value) {
            me.$rightListBody.append(['<li class="biz-transfer-list-content-item">',
                '<input type="checkbox" data-id="' + value.id + '" title="' + value.title + '" /></li>'
            ].join(''));
        });

        this.$main.find(':checkbox').bizCheckbox({
            theme: this.options.theme
        });
    },

    /**
     * 预处理左侧数据
     * @param {Array} data 源数据
     * @return {Array}
     * @private
     */
    formatInput: function(data) {
        var keyMap = this.options.keyMap;
        return $.map(data, function(value) {
            return {
                id: value[keyMap.id],
                title: value[keyMap.title],
                chosen: !!value[keyMap.chosen]
            };
        });
    },

    /**
     * 生成右侧数据
     * @param {Array} data 左侧数据
     * @return {Array}
     * @private
     */
    getTargets: function(data) {
        return data.filter(function(item) {
            return item.chosen === true;
        });
    },

    /**
     * 绑定 Checkbox
     * @private
     */
    bindSelect: function() {
        this.$main.on('click.bizTransferSelectAll', '.biz-transfer-list-header .biz-label', function(e) {
            var selected = $(this).hasClass('biz-checkbox-checked'),
                list = $(this).parent().next().find(':checkbox').filter(':not(:disabled)');

            if (selected) {
                list.bizCheckbox('check');
            } else {
                list.bizCheckbox('uncheck');
            }
        }).on('click.bizTransferSelectOne', '.biz-transfer-list-content .biz-label', function(e) {
            var list = $(this).parent().parent(),
                selectedCount = list.find('.biz-checkbox-checked').length,
                checkboxCount = list.find(':checkbox').filter(':not(:disabled)').length,
                selectAll = list.parent().prev().find(':checkbox');
            if (selectedCount === checkboxCount && selectedCount !== 0) {
                selectAll.bizCheckbox('check');
            } else {
                selectAll.bizCheckbox('uncheck');
            }
        });
    },

    /**
     * 创建 Button
     * @private
     */
    createButton: function() {
        this.$main.find('button').bizButton({
            theme: this.options.theme
        });

        var me = this;
        this.$main.on('click.bizTransferMoveRight', '.biz-transfer-move-right', function(e) {
            var selected = me.$leftListBody.find(':checked');
            if (selected.length > 0) {
                me.moveRight(selected, e);
            }
        }).on('click.bizTransferMoveLeft', '.biz-transfer-move-left', function(e) {
            var selected = me.$rightListBody.find(':checked');
            if (selected.length > 0) {
                me.moveLeft(selected, e);
            }
        });
    },

    /**
     * 右移
     * @param {Array} selected 数据项数组
     * @param {Event}  e       事件
     * @private
     */
    moveRight: function(selected, e) {
        var data = [];
        $.each(selected, function(index, value) {
            data.push({
                id: $(value).attr('data-id'),
                title: $(value).next()[0].lastChild.nodeValue
            });
            $(value).bizCheckbox('disable').bizCheckbox('uncheck');
        });

        this.$main.find('.biz-transfer-list-header :checkbox').bizCheckbox('uncheck');

        var me = this;
        $.each(data, function(index, value) {
            me.$rightListBody.append(['<li class="biz-transfer-list-content-item">',
                '<input type="checkbox" data-id="' + value.id + '" title="' + value.title + '" /></li>'
            ].join(''));
        });

        this.$rightListBody.find(':checkbox').bizCheckbox({
            theme: this.options.theme
        });

        if (this.options.onChange) {
            this.options.onChange.call(this, data, e);
        }
    },

    /**
     * 左移
     * @param {Array} selected  数据项数组
     * @param {Event}  e        事件
     * @private
     */
    moveLeft: function(selected, e) {
        var data = [];
        $.each(selected, function(index, value) {
            data.push({
                id: $(value).attr('data-id'),
                title: $(value).next()[0].lastChild.nodeValue
            });
            $(value).bizCheckbox('destroy').parent().remove();
        });

        $(this.$main.find('.biz-transfer-list-header :checkbox')[0]).bizCheckbox('uncheck');

        var me = this;
        $.each(data, function(index, value) {
            me.$leftListBody.find(':checkbox[data-id="' + value.id + '"]').bizCheckbox('enable');
        });

        if (this.options.onChange) {
            this.options.onChange.call(this, data, e);
        }
    },

    /**
     * 新增数据项
     * @param {Array} data 源数据
     */
    add: function(data) {
        this.addItems(data);
        $(this.$main.find('.biz-transfer-list-header :checkbox')[0]).bizCheckbox('uncheck');
    },

    /**
     * 获取已选数据项
     * @return {Array}
     */
    value: function() {
        var selected = this.$rightListBody.find(':checkbox'),
            keyMap = this.options.keyMap;
        return $.map(selected, function(value, index) {
            var result = {};
            result[keyMap.id] = $(value).attr('data-id');
            result[keyMap.title] = $(value).next()[0].lastChild.nodeValue;
            return result;
        });
    },

    /**
     * 更新数据项
     * @param {Array} data 源数据
     */
    update: function(data) {
        this.$leftListBody.find(':checkbox').bizCheckbox('destroy');
        this.$rightListBody.find(':checkbox').bizCheckbox('destroy');
        this.$leftListBody.empty();
        this.$rightListBody.empty();
        this.$main.find('.biz-transfer-list-header :checkbox').bizCheckbox('uncheck');

        if (data.length === 0) {
            this.$leftListBody.html('<li class="biz-transfer-list-content-item">' + this.options.noContent + '</li>');
        }
        this.addItems(data);
    },

    /**
     * 选中数据项
     * @param {Array} ids 数据项 id 数组
     */
    select: function(ids) {
        var me = this,
            selected = [];
        $.each(ids, function(index, value) {
            var item = me.$leftListBody.find(':checkbox[data-id="' + value + '"]');
            if (item.length > 0 && !item.prop('disabled')) {
                selected.push(item[0]);
            }
        });
        if (selected.length > 0) {
            this.moveRight(selected, null);
        }
    },

    /**
     * 反选数据项
     * @param {Array} ids 数据项 id 数组
     */
    unselect: function(ids) {
        var me = this,
            selected = [];
        $.each(ids, function(index, value) {
            var item = me.$rightListBody.find(':checkbox[data-id="' + value + '"]');
            if (item.length > 0) {
                selected.push(item[0]);
            }
        });
        if (selected.length > 0) {
            this.moveLeft(selected, null);
        }
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$main.removeClass(defaultClass + ' ' + this.options.customClass)
            .find(':checkbox').bizCheckbox('destroy')
            .find('button').bizButton('destroy');

        this.$main
            .off('click.bizTransferSelectAll')
            .off('click.bizTransferSelectOne')
            .off('click.bizTransferMoveRight')
            .off('click.bizTransferMoveLeft');

        this.$main.empty();

        this.$main.data(dataKey, null);
    }
};

$.extend($.fn, {
    bizTransfer: function(method) {
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
                    $(this).data(dataKey, new Transfer(this, method));
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

module.exports = Transfer;