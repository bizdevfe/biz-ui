/**
 * @ignore
 */
define(function(require) {
    /**
     * Textarea constructor
     *
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/wus1a8wy/)
     * @constructor
     * @param {HTMLElement|jQuery} textarea 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.disabled] 是否禁用
     */
    function Textarea(textarea, options) {
        if (textarea instanceof jQuery) {
            if (textarea.length > 0) {
                textarea = textarea[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isTextarea(textarea)) {
            return;
        }

        /**
         * @property {HTMLElement} main `textarea`元素
         */
        this.main = textarea;

        /**
         * @property {jQuery} $main `textarea`元素的$包装
         */
        this.$main = $(this.main);

        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-textarea',
        disableClass = 'biz-textarea-disable',
        hoverClass = 'biz-textarea-hover',
        focusClass = 'biz-textarea-focus';

    Textarea.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);

            if (options.disabled) {
                this.disable();
            }

            this.$main.on('mouseover.bizTextarea', function(e) {
                $(this).addClass(hoverClass);
            }).on('mouseout.bizTextarea', function(e) {
                $(this).removeClass(hoverClass);
            }).on('focus.bizTextarea', function(e) {
                $(this).addClass(focusClass);
            }).on('blur.bizTextarea', function(e) {
                $(this).removeClass(focusClass);
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
         * 获取文本长度（去除回车）
         * @return {Number} 文本长度
         */
        length: function() {
            return this.main.value.replace(/\r?\n/g, '').length;
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass + ' ' + disableClass);
            this.$main.off('mouseover.bizTextarea')
                .off('mouseout.bizTextarea')
                .off('focus.bizTextarea')
                .off('blur.bizTextarea');
        }
    };

    function isTextarea(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'textarea';
    }

    var dataKey = 'bizTextarea';

    $.extend($.fn, {
        bizTextarea: function(method, options) {
            var textarea;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        textarea = $(this).data(dataKey);
                        if (textarea) {
                            textarea.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        textarea = $(this).data(dataKey);
                        if (textarea) {
                            textarea.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        textarea = $(this).data(dataKey);
                        if (textarea) {
                            textarea.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'length':
                    return this.length !== 0 ? this.data(dataKey).length() : null;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTextarea(this)) {
                            $(this).data(dataKey, new Textarea(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Textarea;
});
