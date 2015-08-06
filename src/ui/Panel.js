/**
 * @ignore
 */
define(function(require) {
    /**
     * Panel constructor
     *
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/4govkm96/)
     * @constructor
     * @param {HTMLElement|jQuery} panel 目标元素
     * @param {Object} [options] 参数
     * @param {Number} [options.marginLeft] 左边距
     * @param {Array} [options.buttons] 按钮组 {text: '', click: function(event){}, theme: ''}
     */
    function Panel(panel, options) {
        if (panel instanceof jQuery) {
            if (panel.length > 0) {
                panel = panel[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isPanel(panel)) {
            return;
        }

        /**
         * @property {HTMLElement} main `panel`元素
         */
        this.main = panel;

        /**
         * @property {jQuery} $main `panel`元素的$包装
         */
        this.$main = $(this.main);

        var defaultOption = {
            marginLeft: 200,
            buttons: []
        };
        this.options = $.extend(defaultOption, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-panel';

    Panel.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            var title = this.$main.attr('title'),
                content = this.$main.html(),
                self = this;
            this.orginContent = content;

            this.$main.hide()
                .addClass(defaultClass)
                .removeAttr('title')
                .html([
                    '<div class="biz-panel-margin"></div>',
                    '<div class="biz-panel-body">',
                    '<h1 class="biz-panel-title">', title, '</h1>',
                    '<div class="biz-panel-content">', content, '</div>',
                    '<div class="biz-panel-bottom"></div></div>'
                ].join(''))
                .after('<div class="biz-mask" style="display:none"></div>');

            this.$main.find('.biz-panel-margin').css({
                width: options.marginLeft
            });

            var bottom = this.$main.find('.biz-panel-bottom');
            $.each(options.buttons, function(index, button) {
                $('<button>' + button.text + '</button>')
                    .bizButton({
                        theme: button.theme
                    })
                    .click(function(e) {
                        button.click.call(self, e);
                    })
                    .appendTo(bottom);
            });
        },

        /**
         * 打开
         */
        open: function() {
            $('body').css({
                overflow: 'hidden'
            });

            this.$main.next().show();

            var self = this;
            this.$main
                .css({
                    top: Math.max(document.body.scrollTop, document.documentElement.scrollTop)
                })
                .show()
                .animate({
                    left: 0
                }, 300, function() {
                    self.$main.find('.biz-panel-body')[0].scrollTop = 0;
                });
        },

        /**
         * 关闭
         */
        close: function() {
            var self = this;
            this.$main
                .animate({
                    left: Math.max(document.body.offsetWidth, document.documentElement.offsetWidth)
                }, 300, function() {
                    self.$main.hide();
                    self.$main.next().hide();
                    $('body').css({
                        overflow: 'visible'
                    });
                });
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass)
                .attr('title', this.$main.find('.biz-panel-title').text())
                .removeAttr('style')
                .hide();
            this.$main.find('.biz-panel-bottom button').bizButton('destroy');
            this.$main.html(this.orginContent)
                .next()
                .remove();
            this.orginContent = null;
        }
    };

    function isPanel(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'div' &&
            elem.hasAttribute('title');
    }

    var dataKey = 'bizPanel';

    $.extend($.fn, {
        bizPanel: function(method, options) {
            var panel;
            switch (method) {
                case 'open':
                    this.each(function() {
                        panel = $(this).data(dataKey);
                        if (panel) {
                            panel.open();
                        }
                    });
                    break;
                case 'close':
                    this.each(function() {
                        panel = $(this).data(dataKey);
                        if (panel) {
                            panel.close();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        panel = $(this).data(dataKey);
                        if (panel) {
                            panel.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isPanel(this)) {
                            $(this).data(dataKey, new Panel(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Panel;
});
