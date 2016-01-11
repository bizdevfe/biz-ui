/**
 * @ignore
 */
define(function(require) {
    /**
     * Tab constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/9t1nzb07/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} tab 目标元素
     * @param {Object} [options] 参数
     * @param {String} [options.event] 切换tab事件
     * @param {Function} [options.onChange] 切换回调(data, event)
     * @param {Function} [options.skin] 皮肤
     */
    function Tab(tab, options) {
        if (tab instanceof jQuery) {
            if (tab.length > 0) {
                tab = tab[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isTab(tab)) {
            return;
        }

        /**
         * @property {HTMLElement} main `tab`元素
         */
        this.main = tab;

        /**
         * @property {jQuery} $main `tab`元素的$包装
         */
        this.$main = $(this.main);

        var defaultOption = {
            event: 'click',
            selectedIndex: 0
        };
        this.options = $.extend(defaultOption, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-tab';

    Tab.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.skin = options.skin ? (' ' + options.skin) : '';

            this.$main.addClass(defaultClass + this.skin);
            this.tabs = this.$main.find('ul li');
            this.contents = this.$main.children('div').children('div').hide();
            this.select(options.selectedIndex);

            var self = this;
            this.$main.on(options.event + '.bizTab', 'ul li', function(e) {
                var curTab = $(e.target);
                if (!curTab.hasClass('active')) {
                    var index;
                    $.each(self.tabs, function(i, tab) {
                        if (tab === e.target) {
                            index = i;
                        }
                    });

                    self.select(index);

                    if (options.onChange) {
                        options.onChange.call(self, {
                            title: curTab.text(),
                            index: index
                        }, e);
                    }
                }
            });
        },

        /**
         * 选中tab，或者得到当前被选中的tab
         * @param  {Number} [selectedIndex] tab索引号
         * @return {Number} [selectedIndex] 当前tab索引号
         */
        select: function(selectedIndex) {
            if (typeof selectedIndex != 'undefined') {
                this.tabs.removeClass('active');
                this.contents.hide();
                this.options.selectedIndex = selectedIndex;
                $(this.tabs[selectedIndex]).addClass('active');
                $(this.contents[selectedIndex]).show();
            } else {
                return this.options.selectedIndex;
            }
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass + this.skin);
            this.$main.off(this.options.event + '.bizTab');
        }
    };

    function isTab(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
    }

    var dataKey = 'bizTab';

    $.extend($.fn, {
        bizTab: function(method, options) {
            var tab;
            switch (method) {
                case 'destroy':
                    this.each(function() {
                        tab = $(this).data(dataKey);
                        if (tab) {
                            tab.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'select':
                    var selectedIndex;
                    this.each(function() {
                        tab = $(this).data(dataKey);
                        if (tab) {
                            selectedIndex = tab.select(options);
                        }
                    });
                    return selectedIndex;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTab(this)) {
                            $(this).data(dataKey, new Tab(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Tab;
});