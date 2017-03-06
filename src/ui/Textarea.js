require('jquery-placeholder');

/**
 * Textarea
 * @class
 * @param {HTMLElement} textarea              目标元素
 * @param {Object}      [options]             参数
 * @param {String}      [options.customClass] 自定义 class
 * @param {Boolean}     [options.disabled]    禁用，默认 false
 * @param {String}      [options.theme]       主题
 */
function Textarea(textarea, options) {
    this.main = textarea;
    this.$main = $(this.main);

    var defaultOption = {
        theme: bizui.theme,
        customClass: ''
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-textarea',
    disableClass = 'biz-textarea-disable',
    hoverClass = 'biz-textarea-hover',
    focusClass = 'biz-textarea-focus-',
    dataKey = 'bizTextarea';

Textarea.prototype = {
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

        this.$main.on('mouseover.bizTextarea', function() {
            $(this).addClass(hoverClass);
        }).on('mouseout.bizTextarea', function() {
            $(this).removeClass(hoverClass);
        }).on('focus.bizTextarea', function() {
            $(this).addClass(focusClass + options.theme);
        }).on('blur.bizTextarea', function() {
            $(this).removeClass(focusClass + options.theme);
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
     * 获取文本长度（不计回车）
     * @return {Number}
     */
    length: function() {
        return this.$main.val().replace(/\r?\n/g, '').length;
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$main.removeClass([defaultClass, this.options.customClass, disableClass].join(' '));
        this.$main.off('mouseover.bizTextarea')
            .off('mouseout.bizTextarea')
            .off('focus.bizTextarea')
            .off('blur.bizTextarea');
        this.$main.data(dataKey, null);
    }
};

function isTextarea(elem) {
    return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'textarea';
}

$.extend($.fn, {
    bizTextarea: function(method) {
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
                if (isTextarea(this) && (method === undefined || jQuery.isPlainObject(method))) {
                    $(this).data(dataKey, new Textarea(this, method));
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

module.exports = Textarea;