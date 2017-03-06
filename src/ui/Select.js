require('../deps/jquery.selectric');

/**
 * Select
 * @class
 * @param {HTMLElement} select                         目标元素
 * @param {Object}      [options]                      参数
 * @param {Number}      [options.maxHeight]            选项浮层最大高度，默认 240
 * @param {Boolean}     [options.inheritOriginalWidth] 继承 select 元素的样式，默认 false
 * @param {String}      [options.theme]                主题
 */
function Select(select, options) {}

Select.prototype = {
    /**
     * 销毁
     */
    destroy: function() {},

    /**
     * 刷新
     */
    refresh: function() {},

    /**
     * 打开选项浮层
     */
    open: function() {},

    /**
     * 关闭选项浮层
     */
    close: function() {}
};

$.extend($.fn.selectric.defaults, {
    maxHeight: 240
});

$.extend($.fn, {
    bizSelect: $.fn.selectric
});

module.exports = Select;