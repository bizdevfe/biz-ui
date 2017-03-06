/**
 * Checkbox
 * @class
 * @param {HTMLElement} checkbox        目标元素
 * @param {Object}      [options]       参数
 * @param {String}      [options.theme] 主题
 */
function Checkbox(checkbox, options) {
    this.main = checkbox;
    this.$main = $(this.main);
    // 同组选项
    this.$group = $('input[name="' + this.$main.attr('name') + '"]');

    var defaultOption = {
        theme: bizui.theme
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-label',
    unchecked = 'biz-checkbox-unchecked',
    uncheckedHover = 'biz-checkbox-unchecked-hover',
    checked = 'biz-checkbox-checked',
    checkedHover = 'biz-checkbox-checked-hover',
    uncheckedDisabled = 'biz-checkbox-unchecked-disabled',
    checkedDisabled = 'biz-checkbox-checked-disabled',
    dataKey = 'bizCheckbox',
    checkCodepoint = '&#xe834;',
    uncheckCodepoint = '&#xe835;';

Checkbox.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        var title = this.$main.attr('title'),
            id = this.$main.attr('id') || '';
        this.$main.after('<label for="' + id + '"><i class="biz-icon"></i>' + title + '</label>').hide();

        this.$label = this.$main.next();
        this.defaultClass = defaultClass + ' biz-label-' + options.theme;
        this.$label.addClass(this.defaultClass);
        this.$icon = this.$label.children('i');

        //初始状态
        if (this.main.checked) {
            this.$label.addClass(this.main.disabled ? checkedDisabled : checked);
            this.$icon.html(checkCodepoint);
        } else {
            this.$label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
            this.$icon.html(uncheckCodepoint);
        }

        var self = this;
        this.$label.on('mouseover.bizCheckbox', function() {
            if (!self.main.disabled) {
                $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
            }
        }).on('mouseout.bizCheckbox', function() {
            if (!self.main.disabled) {
                $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
            }
        }).on('click.bizCheckbox', function() {
            if (!self.main.disabled) {
                if (self.main.checked) { // label 的点击先于 input 的点击
                    $(this).attr('class', [self.defaultClass, unchecked, uncheckedHover].join(' '));
                    self.$icon.html(uncheckCodepoint);
                } else {
                    $(this).attr('class', [self.defaultClass, checked, checkedHover].join(' '));
                    self.$icon.html(checkCodepoint);
                }
                if (id === '') {
                    self.main.checked = !self.main.checked;
                }
            }
        });
    },

    /**
     * 勾选
     */
    check: function() {
        this.main.checked = true;
        this.$label.attr('class', this.defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
        this.$icon.html(checkCodepoint);
    },

    /**
     * 取消勾选
     */
    uncheck: function() {
        this.main.checked = false;
        this.$label.attr('class', this.defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
        this.$icon.html(uncheckCodepoint);
    },

    /**
     * 激活
     */
    enable: function() {
        this.main.disabled = false;
        this.$label.attr('class', this.defaultClass + ' ' + (this.main.checked ? checked : unchecked));
    },

    /**
     * 禁用
     */
    disable: function() {
        this.main.disabled = true;
        this.$label.attr('class', this.defaultClass + ' ' + (this.main.checked ? checkedDisabled : uncheckedDisabled));
    },

    /**
     * 获取选中的 value 值
     * @return {String}
     */
    val: function() {
        var value = [];
        this.$group.each(function(index, element) {
            if (element.checked) {
                value.push($(element).val());
            }
        });
        return value.join(',');
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$main.show();
        this.$label.off('mouseover.bizCheckbox')
            .off('mouseout.bizCheckbox')
            .off('click.bizCheckbox')
            .remove();
        this.$main.data(dataKey, null);
    }
};

function isCheckbox(elem) {
    return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'input' && elem.getAttribute('type').toLowerCase() === 'checkbox';
}

$.extend($.fn, {
    bizCheckbox: function(method) {
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
                if (isCheckbox(this) && (method === undefined || jQuery.isPlainObject(method))) {
                    $(this).data(dataKey, new Checkbox(this, method));
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

module.exports = Checkbox;