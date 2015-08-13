/**
 * BizUI Framework
 * @version v1.0.1
 * @copyright 2015 Sogou, Inc.
 * @link https://github.com/bizdevfe/biz-ui
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.bizui = factory();
    }
}(this, function () {