/**
 * BizUI Framework
 * @version v1.2.2
 * @copyright 2015 Sogou, Inc.
 * @link https://github.com/bizdevfe/biz-ui
 */
(function(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object') {
        var $ = require('jquery');
        module.exports = factory($);
    } else if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root['bizui'] = factory(root.$);
    }
}(this, function($) {
    