var Draggable = require('Draggable');

/**
 * Dialog
 * @class
 * @param {HTMLElement} dialog                   目标元素（创建对话框时，目标元素将移动到 body 下的对话框容器中）
 * @param {Object}      [options]                参数
 * @param {Array}       [options.buttons]        底部按钮的 option 数组（多一个 onClick 属性），默认 []
 * @param {String}      [options.customClass]    自定义 class
 * @param {Boolean}     [options.destroyOnClose] 关闭时销毁对话框，默认 false
 * @param {Boolean}     [options.draggable]      可拖拽，默认 false
 * @param {Number}      [options.height]         对话框高度，默认取填充内容后的高度，最小 150px
 * @param {String}      [options.position]       定位方式（fixed | absolute），默认 'fixed'
 * @param {String}      [options.theme]          主题
 * @param {String}      [options.title]          对话框标题，默认取目标元素的 data-title 属性
 * @param {Number}      [options.width]          对话框宽度，最小 320px
 * @param {Function}    [options.onBeforeClose]  关闭前回调，返回 false 则不关闭
 * @param {Number}      [options.zIndex]         对话框 z-index
 */
function Dialog(dialog, options) {
    this.main = dialog;
    this.$main = $(this.main);

    var defaultOption = {
        customClass: '',
        position: 'fixed',
        draggable: false,
        theme: window.bizui.theme,
        title: '',
        buttons: [],
        destroyOnClose: false
    };
    this.options = $.extend(defaultOption, options || {});
    this.init(this.options);
}

var defaultClass = 'biz-dialog',
    prefix = 'biz-dialog-',
    dataKey = 'bizDialog',
    minWidth = 320,
    minHeight = 150,
    currentIndex = 1000;

Dialog.prototype = {
    /**
     * 初始化
     * @param {Object} options 参数
     * @private
     */
    init: function(options) {
        // 在 body 下创建对话框和遮罩层
        this.$container = $('<div style="display:none;"></div>');
        this.$mask = $('<div class="biz-mask" style="display:none;"></div>');
        this.$container.appendTo('body').after(this.$mask);

        // 填充 $container
        var self = this;
        this.$container.addClass([defaultClass, options.customClass, prefix + options.theme].join(' '))
            .html([
                '<div class="biz-dialog-title">',
                '<span class="biz-dialog-title-text">', this.$main.attr('data-title') || options.title, '</span>',
                '<i class="biz-dialog-close biz-icon">&#xe5cd;</i></div>',
                '<div class="biz-dialog-content"></div>',
                '<div class="biz-dialog-bottom"></div>'
            ].join(''))
            .on('click.bizDialog', '.biz-dialog-close', function() {
                self.close();
            });
        this.$container.find('.biz-dialog-content').append(this.$main.show()); // 把目标元素移至 $container 中
        this.updateButtons(options.buttons);

        // 设置 $container 尺寸和位置
        var containerWidth = typeof options.width !== 'undefined' ? Math.max(parseInt(options.width, 10), minWidth) : minWidth,
            containerHeight;
        if (typeof options.height !== 'undefined') {
            containerHeight = Math.max(parseInt(options.height, 10), minHeight);
        } else {
            this.$container.show();
            containerHeight = Math.max(this.$container.height(), minHeight);
            this.$container.hide();
        }
        this.$container.css({
            width: containerWidth,
            height: containerHeight,
            position: options.position,
            marginLeft: -Math.floor(containerWidth / 2),
            marginTop: -Math.floor(Math.min(containerHeight, $(window).height()) / 2)
        });

        // 拖拽
        if (options.draggable) {
            this.draggable = new Draggable(this.$container[0], {
                handle: this.$container.find('.biz-dialog-title').addClass('biz-draggble')[0],
                setPosition: options.position === 'absolute',
                limit: {
                    x: [0, $('body').width() - containerWidth],
                    y: [0, $('body').height() - containerHeight]
                }
            });
            this.$container.css({
                margin: 0,
                display: 'none',
                left: Math.floor(($(window).width() - containerWidth) / 2),
                top: containerHeight < $(window).height() ? Math.floor(($(window).height() - containerHeight) / 2) : 0
            });
        }
    },

    /**
     * 打开对话框
     */
    open: function() {
        var index = this.options.zIndex || ++currentIndex;

        this.$mask.css({
            zIndex: index - 1
        }).show();

        this.$container.css({
            zIndex: index
        }).show();

        if (this.options.position === 'absolute') {
            this.$container.css({
                top: this.$container.position().top + document.body.scrollTop
            });
        }
    },

    /**
     * 关闭对话框
     */
    close: function() {
        var result = true;
        if (typeof this.options.onBeforeClose == 'function') {
            result = this.options.onBeforeClose();
            if (result === false) {
                return;
            }
        }
        this.$container.hide();
        this.$mask.hide();

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
        var bottom = this.$container.find('.biz-dialog-bottom'),
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
        if (this.options.draggable) {
            this.draggable.destroy();
        }
        this.$container.off('click.bizDialog');
        this.$container.find('.biz-dialog-bottom button').bizButton('destroy').off();
        this.$mask.remove();
        this.$container.remove();
        this.$main.data(dataKey, null);
    }
};

var alert = function(options) {
    if (!jQuery.isPlainObject(options)) {
        options = {
            content: options
        };
    }

    var defaultOption = {
        content: '',
        okText: '确定'
    };
    options = $.extend(defaultOption, options || {});

    var alert = $('<div style="display:none;" class="biz-alert"><i class="biz-icon">&#xe001;</i><div>' + options.content + '</div></div>');
    alert.appendTo('body').bizDialog({
        destroyOnClose: true,
        title: options.title,
        theme: options.theme,
        buttons: [{
            text: options.okText,
            theme: options.theme,
            onClick: function() {
                this.close();
            }
        }]
    });
    alert.bizDialog('open');
};

var confirm = function(options) {
    var defaultOption = {
        content: '',
        okText: '确定',
        cancelText: '取消'
    };
    options = $.extend(defaultOption, options || {});

    var confirm = $('<div style="display:none;" class="biz-confirm"><i class="biz-icon">&#xe8fd;</i><div>' + options.content + '</div></div>');
    confirm.appendTo('body').bizDialog({
        destroyOnClose: true,
        title: options.title,
        theme: options.theme,
        buttons: [{
            text: options.okText,
            theme: options.theme,
            onClick: function() {
                var result = true;
                if (typeof options.onOK == 'function') {
                    result = options.onOK();
                    if (result === false) {
                        return;
                    }
                }
                this.close();
            }
        }, {
            text: options.cancelText,
            theme: 'gray',
            onClick: function() {
                this.close();
            }
        }]
    });
    confirm.bizDialog('open');
};

$.extend($.fn, {
    bizDialog: function(method) {
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
                    $(this).data(dataKey, new Dialog(this, method));
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

module.exports = {
    alert: alert,
    confirm: confirm
};