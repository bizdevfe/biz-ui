/**
 * @ignore
 */
define(function(require) {
    /**
     * Input constructor
     *
     * <iframe width="100%" height="200" src="//jsfiddle.net/bizdevfe/sx74qw4g/1/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} input 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.disabled] 是否禁用
     * @param {Function} [options.onEnter] 按回车回调(event)
     */
    function Input(input, options) {
        if (input instanceof jQuery) {
            if (input.length > 0) {
                input = input[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isInput(input)) {
            return;
        }

        /**
         * @property {HTMLElement} main `input`元素
         */
        this.main = input;

        /**
         * @property {jQuery} $main `input`元素的$包装
         */
        this.$main = $(this.main);

        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-input',
        disableClass = 'biz-input-disable',
        hoverClass = 'biz-input-hover',
        focusClass = 'biz-input-focus';

    Input.prototype = {
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

            var self = this;
            this.$main.on('keydown.bizInput', function(e) {
                if (e.keyCode === 13) {
                    if (options.onEnter) {
                        options.onEnter.call(self, e);
                    }
                    return false; //阻止IE9, 10触发<button>元素的click事件
                }
            });

            this.$main.on('mouseover.bizInput', function(e) {
                $(this).addClass(hoverClass);
            }).on('mouseout.bizInput', function(e) {
                $(this).removeClass(hoverClass);
            }).on('focus.bizInput', function(e) {
                $(this).addClass(focusClass);
            }).on('blur.bizInput', function(e) {
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
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass + ' ' + disableClass);
            this.$main.off('keydown.bizInput')
                .off('mouseover.bizInput')
                .off('mouseout.bizInput')
                .off('focus.bizInput')
                .off('blur.bizInput');
        }
    };

    function isInput(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'input' &&
            elem.getAttribute('type').toLowerCase() === 'text';
    }

    var dataKey = 'bizInput';

    $.extend($.fn, {
        bizInput: function(method, options) {
            var input;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        input = $(this).data(dataKey);
                        if (input) {
                            input.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        input = $(this).data(dataKey);
                        if (input) {
                            input.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        input = $(this).data(dataKey);
                        if (input) {
                            input.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isInput(this)) {
                            $(this).data(dataKey, new Input(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Input;
});