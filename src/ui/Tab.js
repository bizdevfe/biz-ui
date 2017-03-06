/**
 * Tab
 * @class
 * @param {HTMLElement} tab                     目标元素
 * @param {Object}      [options]               参数
 * @param {String}      [options.action]        切换方式（click | hover），默认 'click'
 * @param {String}      [options.customClass]   自定义 class
 * @param {Number}      [options.selectedIndex] 选中 tab 序号，默认 0
 * @param {String}      [options.theme]         主题
 */
function Tab(tab, options) {
    this.main = tab;
    this.$main = $(this.main);

    var defaultOption = {
        action: 'click',
        customClass: '',
        selectedIndex: 0,
        theme: bizui.theme
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-tab',
    prefix = 'biz-tab-',
    dataKey = 'bizTab';

Tab.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        this.$main.addClass([defaultClass, options.customClass, prefix + options.theme].join(' '));

        this.$tabs = this.$main.children('ul').children('li');
        this.$contents = this.$main.children('div').children('div').hide();

        var self = this;
        if (options.action === 'hover') {
            options.action = 'mouseover';
        }
        this.$tabs.on(options.action + '.bizTab', function(e) {
            if (!$(this).hasClass('active')) {
                var index;
                self.$tabs.each(function(i, tab) {
                    if (tab === e.target) {
                        index = i;
                        return false;
                    }
                });

                self.index(index);
            }
        });

        this.index(options.selectedIndex, false);
    },

    /**
     * 获取/设置当前被选中的 tab
     * @param {Number}  [selectedIndex] 序号
     * @param {Boolean} [fire]          触发 change 事件，默认 true
     * @fires Tab#change
     * @return {Object}
     */
    index: function(selectedIndex, fire) {
        var curTab, curContent;
        if (typeof selectedIndex != 'undefined') {
            this.$tabs.removeClass('active');
            this.$contents.hide();

            this.options.selectedIndex = selectedIndex;
            curTab = $(this.$tabs[selectedIndex]).addClass('active');
            curContent = $(this.$contents[selectedIndex]).show();

            if (fire === undefined || !!fire) {
                /**
                 * 切换 tab
                 * @event Tab#change
                 * @param {Object} e            事件对象
                 * @param {Object} data         数据
                 * @param {Number} data.index   序号
                 * @param {String} data.title   tab 标题
                 * @param {String} data.content tab 内容
                 */
                curTab.trigger('change', {
                    index: selectedIndex,
                    title: curTab.text(),
                    content: curContent.html()
                });
            }
        } else {
            var curIndex = this.options.selectedIndex;
            curTab = $(this.$tabs[curIndex]);
            curContent = $(this.$contents[curIndex]);
            return {
                index: curIndex,
                title: curTab.text(),
                content: curContent.html()
            };
        }
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$main.removeClass([defaultClass, this.options.customClass, (prefix + this.options.theme)].join(' '));
        this.$tabs.off(this.options.action + '.bizTab');
        this.$main.data(dataKey, null);
    }
};

function isTab(elem) {
    return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
}

$.extend($.fn, {
    bizTab: function(method) {
        var internal_return, args = arguments;
        this.each(function() {
            var instance = $(this).data(dataKey);
            if (instance) {
                if (typeof method === 'string' && typeof instance[method] === 'function') {
                    internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                    if (internal_return !== undefined) {
                        return false; // break loop
                    }
                }
            } else {
                if (isTab(this) && (method === undefined || jQuery.isPlainObject(method))) {
                    $(this).data(dataKey, new Tab(this, method));
                }
            }
        });

        if (internal_return !== undefined) {
            return internal_return;
        } else {
            return this;
        }
    }
});

module.exports = Tab;