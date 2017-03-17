require('jquery-placeholder');

/**
 * Input
 * @class
 * @param {HTMLElement} input                 目标元素
 * @param {Object}      [options]             参数
 * @param {String}      [options.customClass] 自定义 class
 * @param {Boolean}     [options.disabled]    禁用，默认 false
 * @param {String}      [options.theme]       主题
 */
function Input(input, options) {
    this.main = input;
    this.$main = $(this.main);

    var defaultOption = {
        theme: window.bizui.theme,
        customClass: ''
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-input',
    disableClass = 'biz-input-disable',
    hoverClass = 'biz-input-hover',
    focusClass = 'biz-input-focus-',
    dataKey = 'bizInput';

Input.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        this.$main.addClass(defaultClass + ' ' + options.customClass);

        this.$main.placeholder();

        if (options.disabled) {
            this.disable();
        }

        this.$main.on('mouseover.bizInput', function() {
            $(this).addClass(hoverClass);
        }).on('mouseout.bizInput', function() {
            $(this).removeClass(hoverClass);
        }).on('focus.bizInput', function() {
            $(this).addClass(focusClass + options.theme);
        }).on('blur.bizInput', function() {
            $(this).removeClass(focusClass + options.theme);
        }).on('keydown.bizInput', function(e) {
            /**
             * 回车
             * @event Input#enter
             * @param {Object} e     事件对象
             * @param {String} value 输入值
             */
            if (e.keyCode === 13) {
                $(this).trigger('enter', $(this).val());
                return false; // IE10-会自动寻找第一个<button>标签并触发它的click事件
            }
        });
    },

    /**
     * 激活
     */
    enable: function() {
        this.main.disabled = false;
        this.$main.removeClass(disableClass);
    },

    /**
     * 禁用
     */
    disable: function() {
        this.main.disabled = true;
        this.$main.addClass(disableClass);
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$main.removeClass([defaultClass, this.options.customClass, disableClass].join(' '));
        this.$main.off('keydown.bizInput')
            .off('mouseover.bizInput')
            .off('mouseout.bizInput')
            .off('focus.bizInput')
            .off('blur.bizInput');
        this.$main.data(dataKey, null);
    }
};

function isInput(elem) {
    var type = elem.getAttribute('type');
    return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'input' && (!type || type.toLowerCase() === 'text' || type.toLowerCase() === 'password');
}

$.extend($.fn, {
    bizInput: function(method) {
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
                if (isInput(this) && (method === undefined || jQuery.isPlainObject(method))) {
                    $(this).data(dataKey, new Input(this, method));
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

module.exports = Input;