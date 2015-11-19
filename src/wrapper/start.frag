/**
 * BizUI Framework
 * @version v1.1.3
 * @copyright 2015 Sogou, Inc.
 * @link https://github.com/bizdevfe/biz-ui
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root.bizui = factory();
    }
}(this, function($) {
    $ = $ || window.$;
    