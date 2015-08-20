/**
 * @ignore
 */
define(function(require) {
    /**
     * Button constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/yaram3jy/3/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} button 目标元素
     * @param {Object} [options] 参数
     * @param {String} [options.theme] 主题（dark）
     * @param {String} [options.label] 文字
     * @param {Boolean} [options.disabled] 是否禁用
     */
    function Button(button, options) {
        if (button instanceof jQuery) {
            if (button.length > 0) {
                button = button[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isButton(button)) {
            return;
        }

        /**
         * @property {HTMLElement} main `button`元素
         */
        this.main = button;

        /**
         * @property {jQuery} $main `button`元素的$包装
         */
        this.$main = $(this.main);

        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-button',
        disableClass = 'biz-button-disable',
        prefix = 'biz-button-';

    Button.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);
            if (options.theme) {
                this.$main.addClass(prefix + options.theme);
            }

            if (options.label) {
                this.$main.html(options.label);
            }

            if (options.disabled) {
                this.disable();
            }
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
            this.$main.removeClass(defaultClass + ' ' + disableClass);
            if (this.options.theme) {
                this.$main.removeClass(prefix + this.options.theme);
            }
        }
    };

    function isButton(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'button';
    }

    var dataKey = 'bizButton';

    $.extend($.fn, {
        bizButton: function(method, options) {
            var button;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        button = $(this).data(dataKey);
                        if (button) {
                            button.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        button = $(this).data(dataKey);
                        if (button) {
                            button.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        button = $(this).data(dataKey);
                        if (button) {
                            button.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isButton(this)) {
                            $(this).data(dataKey, new Button(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Button;
});
