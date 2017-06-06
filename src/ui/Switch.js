/**
 * BizSwitch
 * @class
 * @param {HTMLElement} switchDom        目标元素,switch是JS关键字，所以叫做switchDom
 * @param {Object}      [options]       参数
 * @param {String}      [options.theme] 主题
 */
function BizSwitch(switchDom, options) {
    this.main = switchDom;
    this.$main = $(this.main);

    var defaultOption = {
        theme: window.bizui.theme
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-switch',
    defaultContainerClass = 'biz-switch-container',
    defaultContainerDisableClass = 'biz-switch-container-disable',
    checkedClass = 'biz-switch-checked',
    dataKey = 'bizSwitch';

BizSwitch.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        var title = this.$main.attr('title'),
            id = this.$main.attr('id') || '',
            theme = options.theme;

        var switchContainer = '<label class="' + defaultContainerClass + ' biz-switch-container-' + theme + '" for="' + id + '"><span class="biz-switch" id=""><span class="biz-switch-inner"></span></span><span>' + title + '</span></label>';

        this.$main.after(switchContainer).hide();

        this.$switchContainer = this.$main.next();
        this.$switchDom = this.$switchContainer.find('.biz-switch');
        //初始状态
        if (this.$main.attr('checked')) {
            this.$switchDom.addClass(checkedClass);
        } else {
            this.$switchDom.addClass(defaultClass);
        }

        var self = this;
        this.$switchContainer.on('click.bizSwitch', function() {
            if (!self.main.disabled) {
                if (self.main.checked) {
                    self.$switchDom.attr('class', [defaultClass].join(' '));
                } else {
                    self.$switchDom.attr('class', [defaultClass, checkedClass].join(' '));
                }
                if (id === '') {
                    self.main.checked = !self.main.checked;
                }
            }
        });
    },

    /**
     * 关闭
     */
    off: function() {
        this.main.checked = false;
        this.$switchDom.attr('class', defaultClass);
    },

    /**
     * 打开
     */
    on: function() {
        this.main.checked = true;
        this.$switchDom.attr('class', [defaultClass, checkedClass].join(' '));
    },

    /**
     * 禁用
     */
    disable: function() {
        this.main.disabled = true;
        this.$switchDom.attr('class', defaultClass);
        this.$switchContainer.addClass(defaultContainerDisableClass);
    },

    /**
     * 激活
     */
    enable: function() {
        this.main.disabled = false;
        this.$switchDom.attr('class', defaultClass + ' ' + (this.main.checked ? checkedClass : ''));
        this.$switchContainer.removeClass(defaultContainerDisableClass);
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$main.show();
        this.$switchContainer.off('click.bizSwitch').remove();
        this.$main.data(dataKey, null);
    },

    /**
     * 获取当前状态
     */
    val: function() {
        if (this.$switchDom.hasClass(checkedClass)) {
            return 'on';
        }
        return 'off';
    },
};

function isSwitch(elem) {
    return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'input' && elem.getAttribute('type').toLowerCase() === 'checkbox';
}

$.extend($.fn, {
    bizSwitch: function(method) {
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
                if (isSwitch(this) && (method === undefined || jQuery.isPlainObject(method))) {
                    $(this).data(dataKey, new BizSwitch(this, method));
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

module.exports = BizSwitch;