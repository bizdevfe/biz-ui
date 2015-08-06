/**
 * @ignore
 */
define(function(require) {
    /**
     * Dialog constructor
     *
     * [See demo on JSFiddle](http://jsfiddle.net/bizdevfe/j5agtk3u/)
     * @constructor
     * @param {HTMLElement|jQuery} dialog 目标元素
     * @param {Object} [options] 参数
     * @param {Number} [options.width] 宽度
     * @param {Number} [options.height] 高度
     * @param {Array} [options.buttons] 按钮组 {text: '', click: function(event){}, theme: ''}
     */
    function Dialog(dialog, options) {
        if (dialog instanceof jQuery) {
            if (dialog.length > 0) {
                dialog = dialog[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isDialog(dialog)) {
            return;
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
            height: 240,
            buttons: []
        };
        this.options = $.extend(defaultOption, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-dialog';

    Dialog.prototype = {
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
                    '<h1 class="biz-dialog-title">',
                    '<span>', title, '</span>',
                    '<span class="biz-dialog-close"></span></h1>',
                    '<div class="biz-dialog-content">', content, '</div>',
                    '<div class="biz-dialog-bottom"></div>'
                ].join(''))
                .css({
                    width: options.width,
                    height: options.height,
                    marginLeft: -Math.floor(options.width / 2),
                    marginTop: -Math.floor(options.height / 2),
                })
                .after('<div class="biz-mask" style="display:none"></div>')
                .on('click', '.biz-dialog-close', function() {
                    self.close();
                });

            this.$main.find('.biz-dialog-content').css({
                height: options.height - 150
            });

            var bottom = this.$main.find('.biz-dialog-bottom');
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
            this.$main.next().show();
            this.$main.fadeIn();
        },

        /**
         * 关闭
         */
        close: function() {
            this.$main.hide();
            this.$main.next().fadeOut();
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass)
                .attr('title', this.$main.find('.biz-dialog-title').text())
                .removeAttr('style')
                .hide()
                .off('click');
            this.$main.find('.biz-dialog-bottom button').bizButton('destroy');
            this.$main.html(this.orginContent)
                .next()
                .remove();
            this.orginContent = null;
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
        var alert = $('<div style="display:none" class="bizui-alert" title="' + options.title + '">' + options.content + '</div>');
        alert.appendTo('body').bizDialog({
            width: 360,
            height: 200,
            buttons: [{
                text: options.ok,
                click: function() {
                    alert.bizDialog('destroy').remove();
                }
            }]
        });
        alert.find('.biz-dialog-close').remove();
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
        var confirm = $('<div style="display:none" class="bizui-confirm" title="' + options.title + '">' + options.content + '</div>');
        confirm.appendTo('body').bizDialog({
            width: 360,
            height: 200,
            buttons: [{
                text: options.ok,
                click: function() {
                    confirm.bizDialog('destroy').remove();
                    if (options.onOK) {
                        options.onOK();
                    }
                }
            }, {
                text: options.cancel,
                click: function() {
                    confirm.bizDialog('destroy').remove();
                },
                theme: 'dark'
            }]
        });
        confirm.find('.biz-dialog-close').remove();
        confirm.bizDialog('open');
    };

    function isDialog(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'div' &&
            elem.hasAttribute('title');
    }

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
                        if (!$(this).data(dataKey) && isDialog(this)) {
                            $(this).data(dataKey, new Dialog(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Dialog;
});
