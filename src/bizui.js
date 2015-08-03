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
         * {@link Button} 构造器
         * @method Button
         */
        Button: require('ui/Button'),

        /**
         * {@link Input} 构造器
         * @method Input
         */
        Input: require('ui/Input'),

        /**
         * {@link Textarea} 构造器
         * @method Textarea
         */
        Textarea: require('ui/Textarea'),

        /**
         * {@link Radio} 构造器
         * @method Radio
         */
        Radio: require('ui/Radio')
    });

    return bizui;
});
