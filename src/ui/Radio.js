/**
 * Radio
 * @class
 * @param {HTMLElement} radio           目标元素
 * @param {Object}      [options]       参数
 * @param {String}      [options.theme] 主题
 */
function Radio(radio, options) {
    this.main = radio;
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
    unchecked = 'biz-radio-unchecked',
    uncheckedHover = 'biz-radio-unchecked-hover',
    checked = 'biz-radio-checked',
    checkedHover = 'biz-radio-checked-hover',
    uncheckedDisabled = 'biz-radio-unchecked-disabled',
    checkedDisabled = 'biz-radio-checked-disabled',
    dataKey = 'bizRadio',
    checkCodepoint = '&#xe837;',
    uncheckCodepoint = '&#xe836;';

Radio.prototype = {
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
        this.$label.on('mouseover.bizRadio', function() {
            if (!self.main.disabled) {
                $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
            }
        }).on('mouseout.bizRadio', function() {
            if (!self.main.disabled) {
                $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
            }
        }).on('click.bizRadio', function() {
            if (!self.main.disabled) {
                self.$group.bizRadio('uncheck');
                $(this).attr('class', [self.defaultClass, checked, checkedHover].join(' '));
                self.$icon.html(checkCodepoint);
                if (id === '') {
                    self.main.checked = true;
                }
            }
        });
    },

    /**
     * 勾选
     */
    check: function() {
        this.$group.bizRadio('uncheck');
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
        var value = '';
        this.$group.each(function(index, element) {
            if (element.checked) {
                value = $(element).val();
                return false;
            }
        });
        return value;
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$main.show();
        this.$label.off('mouseover.bizRadio')
            .off('mouseout.bizRadio')
            .off('click.bizRadio')
            .remove();
        this.$main.data(dataKey, null);
    }
};

function isRadio(elem) {
    return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'input' && elem.getAttribute('type').toLowerCase() === 'radio';
}

$.extend($.fn, {
    bizRadio: function(method) {
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
                if (isRadio(this) && (method === undefined || jQuery.isPlainObject(method))) {
                    $(this).data(dataKey, new Radio(this, method));
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

module.exports = Radio;