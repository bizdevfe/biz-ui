/**
 * @ignore
 */
define(function(require) {
    var util = {};

    /**
     * 判断数组
     * @param {Mixed} a
     * @return {Boolean}
     * @protected
     */
    util.isArray = function(a) {
        return toString.call(a) === '[object Array]';
    };

    /**
     * 转义HTML
     * @param {String} str
     * @return {String}
     * @protected
     */
    util.escapeHTML = function(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    return util;
});