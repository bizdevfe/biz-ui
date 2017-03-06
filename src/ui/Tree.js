require('jstree');

/**
 * Tree
 * @class
 * @param {HTMLElement} tree      目标元素
 * @param {Object}      [options] 参数
 * @description 内部调用 jsTree，初始化选项、方法、事件及插件的使用请参见：https://www.jstree.com/api/ 和 https://www.jstree.com/plugins/
 */
function Tree(tree, options) {}

$.extend($.jstree.defaults.core, {
    strings: {
        'Loading ...': '加载中 ...'
    }
});

$.extend($.fn, {
    bizTree: $.fn.jstree
});

module.exports = Tree;