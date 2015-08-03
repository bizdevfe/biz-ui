/**
 * @ignore
 */
define(function(require) {
    /**
     * Checkbox constructor
     *
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/Lcp5mpLt/)
     * @constructor
     * @param {HTMLElement|jQuery} checkbox 目标元素
     */
    function Checkbox(checkbox) {
        if (checkbox instanceof jQuery) {
            if (checkbox.length > 0) {
                checkbox = checkbox[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isCheckbox(checkbox)) {
            return;
        }

        this.main = checkbox;
        this.$main = $(this.main);
        this.group = $('input[name="' + this.$main.attr('name') + '"]');
        this.init();
    }

    var defaultClass = 'biz-label',
        unchecked = 'biz-checkbox-unchecked',
        uncheckedHover = 'biz-checkbox-unchecked-hover',
        checked = 'biz-checkbox-checked',
        checkedHover = 'biz-checkbox-checked-hover',
        uncheckedDisabled = 'biz-checkbox-unchecked-disabled',
        checkedDisabled = 'biz-checkbox-checked-disabled';

    Checkbox.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            var title = this.$main.attr('title'),
                id = this.$main.attr('id');
            this.$main.after('<label for="' + id + '">' + title + '</label>').hide();

            this.label = this.$main.next();
            this.label.addClass(defaultClass);

            //初始状态
            if (this.main.checked) {
                this.label.addClass(this.main.disabled ? checkedDisabled : checked);
            } else {
                this.label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
            }

            var self = this;
            this.label.on('mouseover.bizCheckbox', function(e) {
                if (!self.main.disabled) {
                    $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('mouseout.bizCheckbox', function(e) {
                if (!self.main.disabled) {
                    $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('click.bizCheckbox', function(e) {
                if (!self.main.disabled) {
                    if (self.main.checked) { //label的点击先于input的点击
                        $(this).attr('class', defaultClass + ' ' + unchecked + ' ' + uncheckedHover);
                    } else {
                        $(this).attr('class', defaultClass + ' ' + checked + ' ' + checkedHover);
                    }
                }
            });
        },

        /**
         * 勾选
         */
        check: function() {
            this.main.checked = true;
            this.label.attr('class', defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
        },

        /**
         * 取消勾选
         */
        uncheck: function() {
            this.main.checked = false;
            this.label.attr('class', defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.label.attr('class', defaultClass + ' ' + (this.main.checked ? checked : unchecked));
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.label.attr('class', defaultClass + ' ' + (this.main.checkedDisabled ? checked : uncheckedDisabled));
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
            this.label.off('mouseover.bizCheckbox')
                .off('mouseout.bizCheckbox')
                .off('click.bizCheckbox')
                .remove();
        }
    };

    function isCheckbox(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'input' &&
            elem.getAttribute('type').toLowerCase() === 'checkbox';
    }

    var dataKey = 'bizCheckbox';

    $.extend($.fn, {
        bizCheckbox: function(method, options) {
            var checkbox;
            switch (method) {
                case 'check':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.check();
                        }
                    });
                    break;
                case 'uncheck':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.uncheck();
                        }
                    });
                    break;
                case 'enable':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'val':
                    var values = [];
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox && checkbox.main.checked) {
                            values.push(checkbox.val());
                        }
                    });
                    return values.join(',');
                case 'get':
                    var instance;
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if ((options + '') === checkbox.main.id) {
                            instance = checkbox;
                        }
                    });
                    return instance;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isCheckbox(this)) {
                            $(this).data(dataKey, new Checkbox(this));
                        }
                    });
            }

            return this;
        }
    });

    return Checkbox;
});
