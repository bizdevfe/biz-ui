/**
 * @ignore
 */
define(function(require) {
    /**
     * Radio constructor
     *
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/o74stme1/)
     * @constructor
     * @param {HTMLElement|jQuery} radio 目标元素
     */
    function Radio(radio) {
        if (radio instanceof jQuery) {
            if (radio.length > 0) {
                radio = radio[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isRadio(radio)) {
            return;
        }

        /**
         * @property {HTMLElement} main `input`元素
         */
        this.main = radio;

        /**
         * @property {jQuery} $main `input`元素的$包装
         */
        this.$main = $(this.main);

        /**
         * @property {Array} $group 同组选项
         */
        this.$group = $('input[name="' + this.$main.attr('name') + '"]');

        this.init();
    }

    var defaultClass = 'biz-label',
        unchecked = 'biz-radio-unchecked',
        uncheckedHover = 'biz-radio-unchecked-hover',
        checked = 'biz-radio-checked',
        checkedHover = 'biz-radio-checked-hover',
        uncheckedDisabled = 'biz-radio-unchecked-disabled',
        checkedDisabled = 'biz-radio-checked-disabled';

    Radio.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            var title = this.$main.attr('title'),
                id = this.$main.attr('id');
            this.$main.after('<label for="' + id + '">' + title + '</label>').hide();

            /**
             * @property {jQuery} $label `label`元素的$包装
             */
            this.$label = this.$main.next();
            this.$label.addClass(defaultClass);

            //初始状态
            if (this.main.checked) {
                this.$label.addClass(this.main.disabled ? checkedDisabled : checked);
            } else {
                this.$label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
            }

            var self = this;
            this.$label.on('mouseover.bizRadio', function(e) {
                if (!self.main.disabled) {
                    $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('mouseout.bizRadio', function(e) {
                if (!self.main.disabled) {
                    $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('click.bizRadio', function(e) {
                if (!self.main.disabled) {
                    self.$group.bizRadio('uncheck');
                    $(this).attr('class', defaultClass + ' ' + checked + ' ' + checkedHover);
                }
            });
        },

        /**
         * 勾选
         */
        check: function() {
            this.$group.bizRadio('uncheck');
            this.main.checked = true;
            this.$label.attr('class', defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
        },

        /**
         * 取消勾选
         */
        uncheck: function() {
            this.main.checked = false;
            this.$label.attr('class', defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.$label.attr('class', defaultClass + ' ' + (this.main.checked ? checked : unchecked));
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.$label.attr('class', defaultClass + ' ' + (this.main.checkedDisabled ? checked : uncheckedDisabled));
        },

        /**
         * 获取value值
         * @return {String} value值
         */
        val: function() {
            return this.main.value;
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
        }
    };

    function isRadio(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'input' &&
            elem.getAttribute('type').toLowerCase() === 'radio';
    }

    var dataKey = 'bizRadio';

    $.extend($.fn, {
        bizRadio: function(method, options) {
            var radio;
            switch (method) {
                case 'uncheck':
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio) {
                            radio.uncheck();
                        }
                    });
                    break;
                case 'enable':
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio) {
                            radio.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio) {
                            radio.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio) {
                            radio.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'val':
                    var value;
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio && radio.main.checked) {
                            value = radio.val();
                        }
                    });
                    return value;
                case 'get':
                    var instance;
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if ((options + '') === radio.main.id) {
                            instance = radio;
                        }
                    });
                    return instance;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isRadio(this)) {
                            $(this).data(dataKey, new Radio(this));
                        }
                    });
            }

            return this;
        }
    });

    return Radio;
});
