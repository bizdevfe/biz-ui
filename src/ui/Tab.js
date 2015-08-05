/**
 * @ignore
 */
define(function(require) {
    /**
     * Tab constructor
     *
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/9t1nzb07/)
     * @constructor
     * @param {HTMLElement|jQuery} tab 目标元素
     * @param {Object} [options] 参数
     * @param {String} [options.event] 切换tab事件
     * @param {Function} [options.onChange] 切换回调
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
            event: 'click'
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
            this.$main.addClass(defaultClass);
            this.tabs = this.$main.find('ul li');
            this.contents = this.$main.find('div > div').hide();
            $(this.tabs[0]).addClass('active');
            $(this.contents[0]).show();

            var self = this;
            this.$main.on(options.event + '.bizTab', 'ul li', function(e) {
                var curTab = $(e.target);

                if (!curTab.hasClass('active')) {
                    self.tabs.removeClass('active');
                    curTab.addClass('active');

                    var index;
                    $.each(self.tabs, function(i, tab) {
                        if (tab === e.target) {
                            index = i;
                        }
                    });

                    self.contents.hide();
                    $(self.contents[index]).show();

                    if (options.onChange) {
                        options.onChange.call(self, {
                            title: curTab.text(),
                            index: index
                        });
                    }
                }
            });
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass);
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
