require('./ui/Button');
require('./ui/Calendar');
require('./ui/Checkbox');
var dialog = require('./ui/Dialog');
require('./ui/DropDown');
require('./ui/Input');
require('./ui/Page');
require('./ui/Panel');
require('./ui/Radio');
require('./ui/Select');
require('./ui/Tab');
require('./ui/Table');
require('./ui/Textarea');
require('./ui/Textline');
require('./ui/Transfer');
require('./ui/Tree');
require('./ui/TreeTable');

/**
 * @namespace
 */
var bizui = {
    /**
     * @property {String} theme 主题，默认 'blue'
     */
    theme: 'blue',
    /**
     * @property {Object} codepoints Iconfont codepoints
     */
    codepoints: require('./codepoints.js'),
    /**
     * 提示对话框
     * @param {Object|String} [options]         参数或提示内容
     * @param {String}        [options.content] 内容
     * @param {String}        [options.okText]  确认文字，默认 '确定'
     * @param {String}        [options.theme]   主题
     * @param {String}        [options.title]   标题
     * @function
     */
    alert: dialog.alert,
    /**
     * 确认对话框
     * @param {Object}   [options]            参数
     * @param {String}   [options.content]    内容
     * @param {String}   [options.cancelText] 取消文字，默认 '取消'
     * @param {String}   [options.okText]     确认文字，默认 '确定'
     * @param {String}   [options.theme]      主题
     * @param {String}   [options.title]      标题
     * @param {Function} [options.onOK]       确认回调，返回 false 则不关闭
     * @function
     */
    confirm: dialog.confirm,
    /**
     * Tooltip
     * @function
     * @param {Object}  [options]                参数
     * @param {String}  [options.action]         触发方式（focus | click | hover），默认 focus
     * @param {String}  [options.element]        目标对象选择器，默认 '.error'
     * @param {Boolean} [options.preventDefault] 阻止默认事件，默认 false
     * @param {Boolean} [options.removeAll]      移除所有绑定，默认 false
     * @param {Boolean} [options.removeSpecific] 移除指定绑定，需同时指定 action 和 element，默认 false
     * @param {Boolean} [options.theme]          主题，默认黑色
     */
    Tooltip: require('./ui/Tooltip')
};

window.bizui = bizui;

module.exports = bizui;