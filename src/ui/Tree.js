/**
 * @ignore
 */
define(function(require) {
    var JSTree = require('dep/jquery.jstree');

    /**
     * Tree constructor
     *
     * [See demo on JSFiddle](http://jsfiddle.net/bizdevfe/cysonubv/)
     *
     * More details about options, methods and events, see [jstree API](https://www.jstree.com/api/)
     * @constructor
     * @param {HTMLElement|jQuery} tree 目标元素
     * @param {Object} [options] 参数
     */
    function Tree(tree, options) {
        this.instance = JSTree.create(tree, options);
    }

    Tree.prototype = {
        /**
         * 返回jstree实例
         * @return {Object}
         */
        ins: function() {
            return this.instance;
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.instance.destroy();
        }
    };

    function isTree(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
    }

    var dataKey = 'bizTree';

    $.extend($.fn, {
        bizTree: function(method, options) {
            var tree;
            switch (method) {
                case 'ins':
                    return this.data(dataKey).ins();
                case 'destroy':
                    this.each(function() {
                        tree = $(this).data(dataKey);
                        if (tree) {
                            tree.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTree(this)) {
                            $(this).data(dataKey, new Tree(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Tree;
});
