require('../deps/bootstrap-datepicker');
require('../../node_modules/bootstrap-datepicker/dist/locales/bootstrap-datepicker.zh-CN.min');

/**
 * Calendar
 * @class
 * @param {HTMLElement}    calendar                        目标元素
 * @param {Object}         [options]                       参数
 * @param {Boolean}        [options.autoclose]             选中日期后关闭日历，默认 true
 * @param {Boolean}        [options.calendarWeeks]         显示周数，默认 false
 * @param {Boolean}        [options.clearBtn]              显示清空按钮，默认 false，如果 autoclose 为 true，点击后将关闭日历
 * @param {String}         [options.container]             日历所在容器，默认 'body'
 * @param {Array|String}   [options.datesDisabled]         禁用哪些日期，使用 format 格式的字符串或数组
 * @param {Array|String}   [options.daysOfWeekDisabled]    每周禁用哪几天，格式为 '06'，'0,6' 或 [0,6]
 * @param {Array|String}   [options.daysOfWeekHighlighted] 每周高亮哪几天，格式同 daysOfWeekDisabled
 * @param {Object}         [options.defaultViewDate]       打开日历时的默认视图，格式为 {year: yyyy, month: 0, day: 1}，默认今天
 * @param {Boolean}        [options.disableTouchKeyboard]  移动端禁用键盘，默认 false
 * @param {Boolean}        [options.enableOnReadonly]      可以在 readonly 输入框上启用，默认 true
 * @param {Date|String}    [options.endDate]               最晚结束日期，默认不限制
 * @param {String}         [options.format]                日期格式，默认 'yyyy-mm-dd'
 * @param {String}         [options.language]              语言（zh-CN|en），默认 'zh-CN'
 * @param {Date|String}    [options.startDate]             最早开始日期，默认不限制
 * @param {Object}         [options.templates]             左右箭头模版，默认 {leftArrow: '&laquo;', rightArrow: '&raquo;'}
 * @param {String}         [options.theme]                 主题
 * @param {String}         [options.title]                 标题
 * @param {Boolean|String} [options.todayBtn]              显示切换到今日视图的按钮，默认 false，如为 'linked'，则点击即选中
 * @param {Boolean}        [options.todayHighlight]        高亮今日，默认 false
 * @param {Number}         [options.weekStart]             每周开始日，默认 1
 */
function Calendar(calendar, options) {}

Calendar.prototype = {
    /**
     * 销毁
     */
    destroy: function() {},
    /**
     * 显示日历浮层
     */
    show: function() {},
    /**
     * 隐藏日历浮层
     */
    hide: function() {},
    /**
     * 设置日期
     * @param {Date|String} date 日期
     * @fires Calendar#changeDate
     */
    setDate: function(date) {
        /**
         * 日期变更
         * @event Calendar#changeDate
         * @param {Object}   e        事件对象
         * @param {Date}     e.date   日期对象
         * @param {Function} e.format 格式化函数 format([format])
         */
    },
    /**
     * 获取日期
     * @return {Object}
     */
    getDate: function() {},
    /**
     * 设置最早开始日期
     * @param {Date|Boolean} date 日期，false 取消设置
     */
    setStartDate: function(date) {},
    /**
     * 设置最晚结束日期
     * @param {Date|Boolean} date 日期，false 取消设置
     */
    setEndDate: function(date) {},
    /**
     * 设置禁用哪些日期
     * @param {Array|String|Boolean} dates 日期，false 取消设置
     */
    setDatesDisabled: function(dates) {},
    /**
     * 设置每周禁用哪几天
     * @param {Array|String|Boolean} days 日期，false 取消设置
     */
    setDaysOfWeekDisabled: function(days) {},
    /**
     * 设置每周高亮哪几天
     * @param {Array|String|Boolean} days 日期，false 取消设置
     */
    setDaysOfWeekHighlighted: function(days) {}
};

$.extend($.fn.datepicker.defaults, {
    autoclose: true,
    language: 'zh-CN'
});

$.extend($.fn.datepicker.dates["zh-CN"], {
    format: 'yyyy-mm-dd'
});

$.extend($.fn, {
    bizCalendar: $.fn.datepicker
});

module.exports = Calendar;