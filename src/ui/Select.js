/**
 * @ignore
 */
define(function(require) {
    var SelectBox = require('dep/jquery.selectBox');

    /**
     * Select constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/bsjn9hpw/3/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} select 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.loop] 上下键是否循环选项
     */
    function Select(select, options) {
        options = $.extend({}, options || {});

        this.instance = new SelectBox($(select), {
            mobile: true,
            loopOptions: options.loop
        });

        /**
         * @property {HTMLElement} main `select`元素
         */
        this.main = this.instance.selectElement;

        /**
         * @property {jQuery} $main `select`元素的$包装
         */
        this.$main = $(this.main);
    }

    Select.prototype = {
        /**
         * 激活
         */
        enable: function() {
            this.instance.enable();
        },

        /**
         * 禁用
         */
        disable: function() {
            this.instance.disable();
        },

        /**
         * 刷新
         */
        refresh: function() {
            this.instance.refresh();
        },

        /**
         * 获取/设置选中值
         * @param {String} [value] 参数
         * @return {String}
         */
        val: function(value) {
            if (undefined === value) { //get
                return this.$main.val();
            }
            this.instance.setValue(value); //set
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.instance.destroy();
        }
    };

    function isSelect(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'select';
    }

    var dataKey = 'bizSelect';

    $.extend($.fn, {
        bizSelect: function(method, options) {
            var select;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        select = $(this).data(dataKey);
                        if (select) {
                            select.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        select = $(this).data(dataKey);
                        if (select) {
                            select.disable();
                        }
                    });
                    break;
                case 'refresh':
                    this.each(function() {
                        select = $(this).data(dataKey);
                        if (select) {
                            select.refresh();
                        }
                    });
                    break;
                case 'val':
                    if (undefined === options) { //get
                        return $(this).val();
                    }
                    this.each(function() { //set
                        select = $(this).data(dataKey);
                        if (select) {
                            select.val(options);
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        select = $(this).data(dataKey);
                        if (select) {
                            select.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isSelect(this)) {
                            $(this).data(dataKey, new Select(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Select;
});
