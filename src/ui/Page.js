/**
 * @ignore
 */
define(function(require) {
    var Pagination = require('dep/jquery.simplePagination');

    /**
     * Page constructor
     *
     * <iframe width="100%" height="300" src="//jsfiddle.net/bizdevfe/b73bLbqx/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} page 目标元素
     * @param {Object} [options] 参数
     * @param {Number} [options.pageSize] 每页条数
     * @param {Number} [options.pageNumber] 当前页码
     * @param {Number} [options.totalNumber] 总条数
     * @param {String} [options.prevText] 前一页文字
     * @param {String} [options.nextText] 后一页文字
     * @param {Function} [options.onPageClick] 页码点击回调(pageNumber, event)
     */
    function Page(page, options) {
        options = $.extend({}, options || {});

        this.instance = Pagination.init.call($(page), {
            itemsOnPage: options.pageSize,
            currentPage: options.pageNumber,
            items: options.totalNumber,
            prevText: options.prevText || '◀',
            nextText: options.nextText || '▶',
            onPageClick: options.onPageClick
        });
    }

    Page.prototype = {
        /**
         * 设置每页条数
         * @param {Number} pageSize 每页条数
         */
        setPageSize: function(pageSize) {
            this.instance.pagination('updateItemsOnPage', pageSize);
            this.instance.pagination('drawPage', 1);
        },

        /**
         * 设置当前页码
         * @param {Number} pageNumber 当前页码
         * @fires onPageClick
         */
        setPageNumber: function(pageNumber) {
            this.instance.pagination('selectPage', pageNumber);
        },

        /**
         * 设置总条数
         * @param {Number} totalNumber 总条数
         */
        setTotalNumber: function(totalNumber) {
            this.instance.pagination('updateItems', totalNumber);
            this.instance.pagination('drawPage', 1);
        },

        /**
         * 获取当前页码
         * @return {Number} 当前页码
         */
        getPageNumber: function() {
            return this.instance.pagination('getCurrentPage');
        },

        /**
         * 获取页数
         * @return {Number} 页数
         */
        getPageCount: function() {
            return this.instance.pagination('getPagesCount');
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.instance.pagination('destroy');
        }
    };

    function isPage(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
    }

    var dataKey = 'bizPage';

    $.extend($.fn, {
        bizPage: function(method, options) {
            var page;
            switch (method) {
                case 'setPageSize':
                    this.each(function() {
                        page = $(this).data(dataKey);
                        if (page) {
                            page.setPageSize(options);
                        }
                    });
                    break;
                case 'setPageNumber':
                    this.each(function() {
                        page = $(this).data(dataKey);
                        if (page) {
                            page.setPageNumber(options);
                        }
                    });
                    break;
                case 'setTotalNumber':
                    this.each(function() {
                        page = $(this).data(dataKey);
                        if (page) {
                            page.setTotalNumber(options);
                        }
                    });
                    break;
                case 'getPageNumber':
                    return this.data(dataKey).getPageNumber();
                case 'getPageCount':
                    return this.data(dataKey).getPageCount();
                case 'destroy':
                    this.each(function() {
                        page = $(this).data(dataKey);
                        if (page) {
                            page.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isPage(this)) {
                            $(this).data(dataKey, new Page(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Page;
});