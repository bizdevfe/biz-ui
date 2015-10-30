/**
 * @ignore
 */
define(function(require) {
    var defaultClass = 'biz-dialog',
        currentIndex = 1000;
    /**
     * Dialog constructor
     *
     * <iframe width="100%" height="350" src="//jsfiddle.net/bizdevfe/j5agtk3u/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} dialog 目标元素
     * @param {Object} [options] 参数
     * @param {Number|String} [options.width] 宽度
     * @param {Number|String} [options.height] 高度
     * @param {Array} [options.buttons] 按钮组 {text: '', click: function(event){}, theme: ''}
     * @param {Boolean} [options.destroyOnClose] 关闭时是否销毁
     * @param {String} [options.skin] 自定义样式
     * @param {String} [options.title] 弹窗标题
     * @param {Number} [options.zIndex] 弹窗显示登记
     *
     */
    function Dialog(dialog, options) {
        if (dialog instanceof jQuery) {
            if (dialog.length > 0) {
                dialog = dialog[0]; //只取第一个元素
            } else {
                return;
            }
        }

        /**
         * @property {HTMLElement} main `dialog`元素
         */
        this.main = dialog;

        /**
         * @property {jQuery} $main `dialog`元素的$包装
         */
        this.$main = $(this.main);

        var defaultOption = {
            width: 480,
            buttons: [],
            destroyOnClose: false,
            skin: '',
            title: ''
        };
        this.options = $.extend(defaultOption, options || {});
        this.init(this.options);
    }

    Dialog.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            var title = options.title || this.$main.attr('title'),
                content = this.$main.html(),
                self = this;
            this.$container = $('<div style="display:none;"></div>');
            this.$container.addClass(defaultClass + ' ' + options.skin)
                .html([
                    '<h1 class="biz-dialog-title">',
                    '<span>', title, '</span>',
                    '<span class="biz-dialog-close"></span></h1>',
                    '<div class="biz-dialog-content"></div>',
                    '<div class="biz-dialog-bottom"></div>'
                ].join(''))
                .css({
                    width: options.width,
                    marginLeft: -Math.floor(parseInt(options.width, 10) / 2),
                })
                .on('click', '.biz-dialog-close', function() {
                    self.close();
                });
            this.$container.find('.biz-dialog-content').append(this.$main);

            var bottom = this.$container.find('.biz-dialog-bottom');
            if (options.buttons.length) {
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
            } else {
                bottom.remove();
            }

            //把dialog加入到body中，并且设置top和left
            //加入mask
            this.$container.appendTo('body')
                .after($('<div class="biz-mask" style="display:none;"></div>').show());
            if (options.height) {
                this.$container.css({
                    height: options.height,
                    marginTop: -Math.floor(Math.min(parseInt(options.height, 10), $(window).height()) / 2)
                });
            } else {
                this.$container.css({
                    marginTop: -Math.floor(Math.min(parseInt(this.$container.height(), 10), $(window).height()) / 2)
                });
            }
        },

        /**
         * 打开
         */
        open: function() {
            var index = this.options.zIndex || currentIndex++;
            this.$container.next().css({
                zIndex: index - 1
            }).show();
            this.$main.show();
            this.$container.css({
                zIndex: index
            }).fadeIn();
        },

        /**
         * 关闭
         */
        close: function() {
            var rs = true;
            if (this.options.beforeClose && typeof(this.options.beforeClose) == 'function') {
                rs = this.options.beforeClose();
                if (rs === false) { // cancel close dialog
                    return;
                }
            }
            this.$container.hide();
            this.$container.next().fadeOut();
            if (typeof this.options.zIndex == 'undefined') {
                currentIndex--;
            }
            if (this.options.destroyOnClose) {
                this.destroy();
            }
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$container.find('.biz-dialog-bottom button').bizButton('destroy');
            this.$container.next().remove();
            this.$main.remove();
            this.$container.remove();
        }
    };

    /**
     * 提示对话框
     * @param {Object} options
     * @param {String} options.title 标题
     * @param {String} options.content 内容
     * @param {String} options.ok 确认文字
     * @static
     */
    Dialog.alert = function(options) {
        var alert = $('<div style="display:none;height:50px;" class="biz-alert" title="' + options.title + '">' + options.content + '</div>');
        alert.appendTo('body').bizDialog({
            width: 360,
            height: 200,
            destroyOnClose: true,
            buttons: [{
                text: options.ok,
                click: function() {
                    alert.bizDialog('close');
                }
            }]
        });
        alert.bizDialog('open');
    };

    /**
     * 确认对话框
     * @param {Object} options
     * @param {String} options.title 标题
     * @param {String} options.content 内容
     * @param {String} options.ok 确认文字
     * @param {String} options.cancel 取消文字
     * @param {Function} options.onOK 确认回调
     * @static
     */
    Dialog.confirm = function(options) {
        var confirm = $('<div style="display:none;height:50px;" class="biz-confirm" title="' + options.title + '">' + options.content + '</div>');
        confirm.appendTo('body').bizDialog({
            width: 360,
            height: 200,
            destroyOnClose: true,
            buttons: [{
                text: options.ok,
                click: function() {
                    confirm.bizDialog('close');
                    if (options.onOK) {
                        options.onOK();
                    }
                }
            }, {
                text: options.cancel,
                click: function() {
                    confirm.bizDialog('close');
                },
                theme: 'dark'
            }]
        });
        confirm.bizDialog('open');
    };

    var dataKey = 'bizDialog';

    $.extend($.fn, {
        bizDialog: function(method, options) {
            var dialog;
            switch (method) {
                case 'open':
                    this.each(function() {
                        dialog = $(this).data(dataKey);
                        if (dialog) {
                            dialog.open();
                        }
                    });
                    break;
                case 'close':
                    this.each(function() {
                        dialog = $(this).data(dataKey);
                        if (dialog) {
                            dialog.close();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        dialog = $(this).data(dataKey);
                        if (dialog) {
                            dialog.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey)) {
                            $(this).data(dataKey, new Dialog(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Dialog;
});
