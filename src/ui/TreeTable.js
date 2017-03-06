require('../deps/jquery.treetable');

/**
 * TreeTable
 * @class
 * @param {HTMLElement} treetable                    目标元素
 * @param {Object}      [options]                    参数
 * @param {Number}      [options.column]             控制开关所在的列号，默认 0，即第一列
 * @param {String}      [options.customClass]        自定义 class
 * @param {Boolean}     [options.initialState]       初始化状态（collapsed | expanded），默认 'collapsed'
 * @param {Boolean}     [options.clickableNodeNames] 节点名称可点击，默认 false
 */
function TreeTable(treetable, options) {}

TreeTable.prototype = {
    /**
     * 销毁
     */
    destroy: function() {},
    /**
     * 关闭所有节点
     */
    collapseAll: function() {},
    /**
     * 关闭节点
     * @param {String} nodeId 节点 id
     */
    collapseNode: function(id) {},
    /**
     * 打开所有节点
     */
    expandAll: function() {},
    /**
     * 打开节点
     * @param {String} nodeId 节点 id
     */
    expandNode: function(nodeId) {},
    /**
     * 插入节点
     * @param {Object} parentNode 父节点对象
     * @param {String} rows       节点 tr 的 html
     */
    loadBranch: function(parentId, rows) {},
    /**
     * 移动节点
     * @param {String} nodeId      节点 id
     * @param {String} newParentId 新的父节点 id
     */
    move: function(nodeId, newParentId) {},
    /**
     * 获取节点对象
     * @param {String} nodeId 节点 id
     * @return 节点对象
     */
    node: function(nodeId) {},
    /**
     * 显示并展开节点
     * @param {String} nodeId 节点 id
     */
    reveal: function(nodeId) {},
    /**
     * 删除节点
     * @param {String} nodeId 节点 id
     */
    removeNode: function(nodeId) {},
    /**
     * 删除子节点
     * @param {Object} parentNode 父节点对象
     */
    unloadBranch: function(parentNode) {},
    /**
     * 排序
     * @param {Object}          parentNode   父节点对象
     * @param {Number|Function} sortFunction 排序列或排序函数，默认按第一列字母序排序，排序函数的两个参数为节点对象
     */
    sortBranch: function(parentNode, sortFunction) {}
};

$.extend($.fn, {
    bizTreeTable: $.fn.treetable
});

module.exports = TreeTable;