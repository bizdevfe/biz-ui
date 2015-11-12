/**
 * @ignore
 */
define(function(require) {
    var Datepicker = require('dep/jquery.datepicker'),
        Input = require('ui/Input');

    /**
     * Calendar constructor
     *
     * <iframe width="100%" height="380" src="//jsfiddle.net/bizdevfe/oa3s8e8w/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} calendar 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.todayHighlight] 今日是否高亮
     * @param {Boolean|String} [options.todayBtn] 是否显示今日按钮, 若为'linked', 则选中并关闭
     * @param {Date|String} [options.startDate] 最早开始日期
     * @param {Date|String} [options.endDate] 最晚结束日期
     * @param {Function} [options.onChange] 日期变更回调(event)
     */
    function Calendar(calendar, options) {
        if (isInput(calendar)) {
            this.date = new Input($(calendar));
            $(this.date.main).addClass(defaultClass).attr('maxlength', 10);
        } else {
            this.range = $(calendar).find(':text');
            this.startDate = new Input(this.range[0]);
            $(this.startDate.main).addClass(defaultClass).attr('maxlength', 10);
            this.endDate = new Input(this.range[1]);
            $(this.endDate.main).addClass(defaultClass).attr('maxlength', 10);
        }

        options = $.extend({}, options || {});

        this.instance = Datepicker.call($(calendar), {
            autoclose: true,
            format: 'yyyy-mm-dd',
            language: options.language || 'zh-CN',
            orientation: 'top left',
            weekStart: 1,
            todayHighlight: options.todayHighlight,
            todayBtn: options.todayBtn,
            startDate: options.startDate,
            endDate: options.endDate
        });

        var self = this;
        if (options.onChange) {
            this.instance.on('changeDate', function(e) {
                options.onChange.call(self, e);
            });
        }
    }

    var defaultClass = 'biz-calendar';

    Calendar.prototype = {
        /**
         * 获取本地时间
         * @return {Date|Array} 本地时间（多日历为数组）
         */
        getDate: function() {
            return !this.range ? this.instance.datepicker('getDate') : [$(this.range[0]).datepicker('getDate'), $(this.range[1]).datepicker('getDate')];
        },

        /**
         * 设置本地时间
         * @param {Date|Array} date 本地时间（多日历为数组）
         * @fires onChange
         */
        setDate: function(date) {
            //Bug? 界面没有同步选中状态
            if (!this.range) {
                this.instance.datepicker('setDate', date);
            } else {
                $(this.range[0]).datepicker('setDate', date[0]);
                $(this.range[1]).datepicker('setDate', date[1]);
            }
        },

        /**
         * 激活
         */
        enable: function() {
            if (this.date) {
                this.date.enable();
            } else {
                this.startDate.enable();
                this.endDate.enable();
            }
        },

        /**
         * 禁用
         */
        disable: function() {
            if (this.date) {
                this.date.disable();
            } else {
                this.startDate.disable();
                this.endDate.disable();
            }
        },

        /**
         * 销毁
         */
        destroy: function() {
            if (this.date) {
                this.date.destroy();
            } else {
                this.startDate.destroy();
                this.endDate.destroy();
            }
            this.instance.remove();
        }
    };

    function isInput(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'input' &&
            elem.getAttribute('type').toLowerCase() === 'text';
    }

    var dataKey = 'bizCalendar';

    $.extend($.fn, {
        bizCalendar: function(method, options) {
            var calendar;
            switch (method) {
                case 'getDate':
                    return this.data(dataKey).getDate();
                case 'setDate':
                    this.each(function() {
                        calendar = $(this).data(dataKey);
                        if (calendar) {
                            calendar.setDate(options);
                        }
                    });
                    break;
                case 'enable':
                    this.each(function() {
                        calendar = $(this).data(dataKey);
                        if (calendar) {
                            calendar.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        calendar = $(this).data(dataKey);
                        if (calendar) {
                            calendar.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        calendar = $(this).data(dataKey);
                        if (calendar) {
                            calendar.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey)) {
                            $(this).data(dataKey, new Calendar(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Calendar;
});