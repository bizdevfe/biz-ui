/**
 * @ignore
 */
define(function(require) {
    /**
     * 命名空间
     * @class bizui
     * @singleton
     */
    var bizui = {};

    /**
     * @property {String} version 版本号
     */
    bizui.version = '2.0.0';

    var origin = window.bizui;

    /**
     * 获取无冲突bizui
     * @return {Object} bizui
     */
    bizui.noConflict = function() {
        window.bizui = origin;
        return this;
    };

    $.extend(bizui, {
        /**
         * {@link Button} constructor
         * @method Button
         */
        Button: require('ui/Button'),

        /**
         * {@link Input} constructor
         * @method Input
         */
        Input: require('ui/Input'),

        /**
         * {@link Textarea} constructor
         * @method Textarea
         */
        Textarea: require('ui/Textarea'),

        /**
         * {@link Radio} constructor
         * @method Radio
         */
        Radio: require('ui/Radio'),

        /**
         * {@link Checkbox} constructor
         * @method Checkbox
         */
        Checkbox: require('ui/Checkbox'),

        /**
         * {@link Select} constructor
         * @method Select
         */
        Select: require('ui/Select'),

        /**
         * {@link Dialog} constructor
         * @method Dialog
         */
        Dialog: require('ui/Dialog'),

        /**
         * {@link Panel} constructor
         * @method Panel
         */
        Panel: require('ui/Panel'),

        /**
         * {@link Tooltip} method
         * @method Tooltip
         */
        Tooltip: require('ui/Tooltip'),

        /**
         * {@link Tab} constructor
         * @method Tab
         */
        Tab: require('ui/Tab'),

        /**
         * {@link Page} constructor
         * @method Page
         */
        Page: require('ui/Page'),

        /**
         * {@link Tree} constructor
         * @method Tree
         */
        Tree: require('ui/Tree'),

        /**
         * {@link Calendar} constructor
         * @method Calendar
         */
        Calendar: require('ui/Calendar')
    });

    return bizui;
});
