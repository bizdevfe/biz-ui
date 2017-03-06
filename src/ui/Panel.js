/**
 * Panel
 * @class
 * @param {HTMLElement} panel                    目标元素
 * @param {Object}      [options]                参数
 * @param {Array}       [options.buttons]        底部按钮的 option 数组（多一个 onClick 属性），默认 []
 * @param {String}      [options.customClass]    自定义 class
 * @param {Boolean}     [options.destroyOnClose] 关闭时销毁抽屉浮层，默认 false
 * @param {Number}      [options.marginLeft]     左边距（px），默认 200
 * @param {Number}      [options.speed]          动画速度（ms），默认 300
 * @param {String}      [options.theme]          主题
 * @param {String}      [options.title]          屉浮层标题，默认取目标元素的 data-title 属性
 * @param {Function}    [options.onBeforeClose]  关闭前回调，返回 false 则不关闭
 * @param {Number}      [options.zIndex]         抽屉浮层标 z-index
 */
function Panel(panel, options) {
    this.main = panel;
    this.$main = $(this.main);

    var defaultOption = {
        customClass: '',
        marginLeft: 200,
        speed: 300,
        theme: bizui.theme,
        title: '',
        buttons: [],
        destroyOnClose: false
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-panel',
    prefix = 'biz-panel-',
    dataKey = 'bizPanel',
    currentIndex = 1000;

Panel.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        // 在 body 下创建抽屉浮层和遮罩层
        this.$container = $('<div style="display:none;"></div>');
        this.$mask = $('<div class="biz-mask" style="display:none;"></div>');
        this.$container.appendTo('body').after(this.$mask);

        // 填充 $container
        var self = this;
        this.$container.addClass([defaultClass, options.customClass, prefix + options.theme].join(' '))
            .html([
                '<div class="biz-panel-margin"></div>',
                '<div class="biz-panel-body">',
                '<div class="biz-panel-title">',
                '<span class="biz-panel-title-text">', this.$main.attr('data-title') || options.title, '</span>',
                '<i class="biz-panel-close biz-icon">&#xe5cd;</i></div>',
                '<div class="biz-panel-content"></div>',
                '<div class="biz-panel-bottom"></div></div>'
            ].join(''))
            .on('click.bizPanel', '.biz-panel-close', function() {
                self.close();
            });
        this.$container.find('.biz-panel-content').append(this.$main.show()); // 把目标元素移至 $container 中
        this.updateButtons(options.buttons);

        this.$container.find('.biz-panel-margin').css({
            width: options.marginLeft
        });
        this.$container.find('.biz-panel-close').css({
            right: options.marginLeft + 85
        });
    },

    /**
     * 打开
     */
    open: function() {
        $('body').css({
            overflow: 'hidden'
        });

        var index = this.options.zIndex || ++currentIndex;

        this.$mask.css({
            zIndex: index - 1
        }).show();

        var self = this;
        this.$container.css({
                zIndex: index
            })
            .show()
            .animate({
                left: 0
            }, this.options.speed, function() {
                self.$container.find('.biz-panel-body')[0].scrollTop = 0;
            });
    },

    /**
     * 关闭
     */
    close: function() {
        var result = true;
        if (typeof this.options.onBeforeClose == 'function') {
            result = this.options.onBeforeClose();
            if (result === false) {
                return;
            }
        }

        var self = this;
        this.$container.animate({
            left: '100%'
        }, this.options.speed, function() {
            self.$container.hide();
            self.$mask.hide();
            $('body').css({
                overflow: 'visible'
            });
        });

        if (typeof this.options.zIndex == 'undefined') {
            currentIndex--;
        }

        if (this.options.destroyOnClose) {
            this.destroy();
        }
    },

    /**
     * 更新按钮
     * @param {Array} buttonOption 底部按钮的 option 数组
     */
    updateButtons: function(buttonOption) {
        buttonOption = buttonOption || [];
        var bottom = this.$container.find('.biz-panel-bottom'),
            self = this;
        bottom.find('button').bizButton('destroy').off().remove();
        $.each(buttonOption, function(index, buttonOption) {
            var button = $('<button></button>').appendTo(bottom).bizButton(buttonOption);
            if (buttonOption.onClick) {
                button.click(function(e) {
                    buttonOption.onClick.call(self, e);
                });
            }
        });
    },

    /**
     * 获取/设置标题
     * @param {String} [title] 标题
     * @return {String}
     */
    title: function(title) {
        var titleElement = this.$container.find('.biz-panel-title-text');
        if (undefined === title) {
            return titleElement.html();
        }
        titleElement.html(title);
    },

    /**
     * 销毁
     */
    destroy: function() {
        this.$container.off('click.bizPanel');
        this.$container.find('.biz-panel-bottom button').bizButton('destroy').off();
        this.$mask.remove();
        this.$container.remove();
        this.$main.data(dataKey, null);
    }
};

$.extend($.fn, {
    bizPanel: function(method) {
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
                if (method === undefined || jQuery.isPlainObject(method)) {
                    $(this).data(dataKey, new Panel(this, method));
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

module.exports = Panel;