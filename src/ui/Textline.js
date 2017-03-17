/**
 * Textline
 * @class
 * @param {HTMLElement} textline              目标元素
 * @param {Object}      [options]             参数
 * @param {String}      [options.customClass] 自定义 class
 * @param {Boolean}     [options.disabled]    禁用，默认 false
 * @param {Number}      [options.height]      高度，默认取目标对象高度，最小 52px
 * @param {Number}      [options.maxLine]     最大行数，大于等于 1
 * @param {String}      [options.theme]       主题
 * @param {String}      [options.val]         初始值，字符串形式
 * @param {Array}       [options.valArray]    初始值，数组形式
 * @param {Number}      [options.width]       宽度，默认取目标对象宽度，最小 200px
 */
function Textline(textline, options) {
    this.main = textline;
    this.$main = $(this.main);

    var defaultOption = {
        theme: window.bizui.theme,
        customClass: ''
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-textline',
    disableClass = 'biz-textline-disable',
    hoverClass = 'biz-textline-hover',
    focusClass = 'biz-textline-focus-',
    prefix = 'biz-textline-',
    dataKey = 'bizTextline';

Textline.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        this.$main.addClass([defaultClass, options.customClass, prefix + options.theme].join(' '))
            .html('<div><pre></pre></div><textarea></textarea>');

        var w = options.width || this.$main.width(),
            h = options.height || this.$main.height();

        w = Math.max(w, 200);
        h = Math.max(h, 52);

        this.$main.css({
            width: w,
            height: h
        });

        this.$line = this.$main.children('div').css({
            height: h - 10
        });
        this.$lineNumber = this.$main.find('pre');
        this.$textarea = this.$main.children('textarea').css({
            width: w - 36,
            height: h - 12
        });

        if (options.disabled) {
            this.disable();
        }

        var self = this;
        this.$textarea.on('mouseover.bizTextline', function() {
            $(this).addClass(hoverClass);
        }).on('mouseout.bizTextline', function() {
            $(this).removeClass(hoverClass);
        }).on('focus.bizTextline', function() {
            $(this).addClass(focusClass + options.theme);
        }).on('blur.bizTextline', function() {
            $(this).removeClass(focusClass + options.theme);
        }).on('keyup.bizTextline.render', function(e) {
            self.renderLineNumber(e.target.scrollTop);
        }).on('scroll.bizTextline', function(e) {
            self.scrollLineNumber(e.target.scrollTop);
        });

        if (parseInt(options.maxLine, 10) >= 1) {
            this.$textarea.on('keyup.bizTextline.maxLine', function(e) {
                if (e.keyCode === 13) {
                    var valArray = self.valArray(),
                        length = valArray.length;
                    if (length > options.maxLine) {
                        valArray.splice(options.maxLine, length - options.maxLine);
                        self.valArray(valArray);
                    }
                }
            });
        }

        this.renderLineNumber(0);

        if (typeof options.val === 'string') {
            this.val(options.val);
        }

        if (jQuery.isArray(options.valArray)) {
            this.valArray(options.valArray);
        }
    },

    /**
     * 激活
     */
    enable: function() {
        this.$textarea[0].disabled = false;
        this.$textarea.removeClass(disableClass);
    },

    /**
     * 禁用
     */
    disable: function() {
        this.$textarea[0].disabled = true;
        this.$textarea.addClass(disableClass);
    },

    /**
     * 获取文本长度（不计回车）
     * @return {Number}
     */
    length: function() {
        return this.$textarea.val().replace(/\r?\n/g, '').length;
    },

    /**
     * 以字符串形式获取/设置内容，超过 maxLine 会被截断
     * @param {String} [value] 内容
     * @return {String}
     */
    val: function(value) {
        if (undefined === value) {
            return this.$textarea.val();
        }

        if (parseInt(this.options.maxLine, 10) >= 1) {
            var valArray = value.split('\n'),
                length = valArray.length;
            if (length > this.options.maxLine) {
                valArray.splice(this.options.maxLine, length - this.options.maxLine);
                value = valArray.join('\n');
            }
        }

        this.$textarea.val(value);
        this.renderLineNumber(0);
    },

    /**
     * 以数组形式获取/设置内容，超过 maxLine 会被截断
     * @param {Array} [value] 内容
     * @return {Array}
     */
    valArray: function(value) {
        if (undefined === value) {
            return this.val().split('\n');
        }

        if (parseInt(this.options.maxLine, 10) >= 1) {
            var length = value.length;
            if (length > this.options.maxLine) {
                value.splice(this.options.maxLine, length - this.options.maxLine);
            }
        }

        this.$textarea.val(value.join('\n'));
        this.renderLineNumber(0);
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$textarea.off('mouseover.bizTextline')
            .off('mouseout.bizTextline')
            .off('focus.bizTextline')
            .off('blur.bizTextline')
            .off('keyup.bizTextline')
            .off('scroll.bizTextline');
        this.$main.removeClass([defaultClass, this.options.customClass, (prefix + this.options.theme)].join(' '))
            .empty();
        this.$main.data(dataKey, null);
    },

    /**
     * 绘制行号
     * @param {Number} scrollTop 滚动高度
     * @private
     */
    renderLineNumber: function(scrollTop) {
        var lineCount = this.$textarea.val().split('\n').length,
            numbers = '1';
        for (var i = 2; i <= lineCount; i++) {
            numbers += '\n' + i;
        }
        this.$lineNumber.html(numbers);
        this.scrollLineNumber(scrollTop);
    },

    /**
     * 滚动行号
     * @param {Number} scrollTop 滚动高度
     * @private
     */
    scrollLineNumber: function(scrollTop) {
        this.$lineNumber.css({
            top: 5 - scrollTop
        });
    }
};

function isTextline(elem) {
    return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
}

$.extend($.fn, {
    bizTextline: function(method) {
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
                if (isTextline(this) && (method === undefined || jQuery.isPlainObject(method))) {
                    $(this).data(dataKey, new Textline(this, method));
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

module.exports = Textline;