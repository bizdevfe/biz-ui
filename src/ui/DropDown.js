/**
 * DropDown
 * @class
 * @param {HTMLElement} dropdown                下拉浮层容器（创建时将被移动到 body 下）
 * @param {Object}      options                 参数
 * @param {String}      [options.alignX]        水平方对齐方式（left|right），默认 "left"
 * @param {String}      [options.alignY]        垂直方对齐方式（top|bottom），默认 "bottom"
 * @param {String}      [options.customClass]   自定义 class
 * @param {Function}    [options.onBeforeOpen]  打开时的回调，返回 false 则不执行打开
 * @param {Function}    [options.onBeforeClose] 关闭时的回调，返回 false 则不执行关闭
 * @param {Number}      [options.offsetX]       水平偏移，默认 0
 * @param {Number}      [options.offsetY]       垂直偏移，默认 0
 * @param {String}      options.trigger         触发下拉浮层的元素选择器
 * @param {Number}      [options.zIndex]        下拉浮层 z-index，默认使用 trigger 的 z-index
 */
function DropDown(dropdown, options) {
    this.main = dropdown;
    this.$main = $(this.main);

    var defaultOption = {
        alignX: 'left',
        alignY: 'bottom',
        customClass: '',
        offsetX: 0,
        offsetY: 0
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-dropdown',
    dataKey = 'bizDialog';

DropDown.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        if (typeof options.trigger === 'undefined') {
            return;
        }

        this.$container = $('<div style="display:none;"></div>');
        this.$container.addClass(defaultClass + ' ' + options.customClass)
            .appendTo('body')
            .append(this.$main.show());

        this.$trigger = $(options.trigger);
        var self = this;
        this.$trigger.on('click.bizDropDown', function() {
            self.toggle();
        });
    },

    /**
     * 显隐
     * @private
     */
    toggle: function() {
        if (this.$container.css('display') === 'none') {
            this.open();
        } else {
            this.close();
        }
    },

    /**
     * 打开下拉浮层
     */
    open: function() {
        var result = true;
        if (typeof this.options.onBeforeOpen == 'function') {
            result = this.options.onBeforeOpen();
            if (result === false) {
                return;
            }
        }

        this.$container.show();

        var triggerPosition = this.$trigger.position(),
            containerLeft, containerTop;
        if (this.options.alignX === 'left') {
            containerLeft = triggerPosition.left + this.options.offsetX;
        } else if (this.options.alignX === 'right') {
            containerLeft = triggerPosition.left + this.$trigger.outerWidth() - this.$container.outerWidth() + this.options.offsetX;
        }
        if (this.options.alignY == 'bottom') {
            containerTop = triggerPosition.top + this.$trigger.outerHeight() + this.options.offsetY;
        } else if (this.options.alignY == 'top') {
            containerTop = triggerPosition.top - this.$container.outerHeight() + this.options.offsetY;
        }

        this.$container.css({
            left: containerLeft,
            top: containerTop,
            zIndex: this.options.zIndex || this.$trigger.css('zIndex')
        });
    },

    /**
     * 关闭下拉浮层
     */
    close: function() {
        var result = true;
        if (typeof this.options.onBeforeClose == 'function') {
            result = this.options.onBeforeClose();
            if (result === false) {
                return;
            }
        }

        this.$container.hide();
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$trigger.off('click.bizDropDown');
        this.$container.remove();
        this.$main.data(dataKey, null);
    }
};

$.extend($.fn, {
    bizDropDown: function(method) {
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
                    $(this).data(dataKey, new DropDown(this, method));
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

module.exports = DropDown;