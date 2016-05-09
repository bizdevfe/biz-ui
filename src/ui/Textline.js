/**
 * @ignore
 */
define(function(require) {
    /**
     * Textline constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/wus1a8wy/3/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} textline 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.disabled] 是否禁用
     * @param {Boolean} [options.skin] 皮肤
     */
    function Textline(textline, options) {
        if (textline instanceof jQuery) {
            if (textline.length > 0) {
                textline = textline[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isTextline(textline)) {
            return;
        }

        /**
         * @property {HTMLElement} main `textline`元素
         */
        this.main = textline;

        /**
         * @property {jQuery} $main `textline`元素的$包装
         */
        this.$main = $(this.main);

        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-textline',
        disableClass = 'biz-textline-disable',
        hoverClass = 'biz-textline-hover',
        focusClass = 'biz-textline-focus';

    Textline.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.skin = options.skin ? (' ' + options.skin) : '';

            this.$main.addClass(defaultClass + this.skin).html('<div><pre></pre></div><textarea></textarea>');

            var w = Math.max(this.$main.width(), 200),
                h = Math.max(this.$main.height(), 52);
            this.$main.css({
                width: w,
                height: h
            });
            this.$line = this.$main.children('div').css({
                height: h - 10
            });
            this.$lineNumber = this.$main.find('pre');
            this.$textarea = this.$main.children('textarea').css({
                width: w - 36,
                height: h - 12
            });

            if (options.disabled) {
                this.disable();
            }

            var self = this;
            this.$textarea.on('mouseover.bizTextline', function(e) {
                $(this).addClass(hoverClass);
            }).on('mouseout.bizTextline', function(e) {
                $(this).removeClass(hoverClass);
            }).on('focus.bizTextline', function(e) {
                $(this).addClass(focusClass);
            }).on('blur.bizTextline', function(e) {
                $(this).removeClass(focusClass);
            }).on('keyup.bizTextline', function(e) {
                self.renderLineNumber(e.target.scrollTop);
            }).on('scroll.bizTextline', function(e) {
                self.scrollLineNumber(e.target.scrollTop);
            });

            this.renderLineNumber(0);
        },

        /**
         * 激活
         */
        enable: function() {
            this.$textarea[0].disabled = false;
            this.$textarea.removeClass(disableClass);
        },

        /**
         * 禁用
         */
        disable: function() {
            this.$textarea[0].disabled = true;
            this.$textarea.addClass(disableClass);
        },

        /**
         * 获取文本长度（去除回车）
         * @return {Number} 文本长度
         */
        length: function() {
            return this.$textarea[0].value.replace(/\r?\n/g, '').length;
        },

		/**
         * 获取/设置文本行数
		 * @param {Number} [value] 行数
         * @return {Number} 文本行数
         */
        lines: function(value) {
			if (undefined === value) { //get
                return this.$textarea.val().split('\n');
            }
            var self = this;
			this.$textarea.keyup(function (event) {
				var key = event.which;
				var values = self.$textarea.val().split('\n');
				if (key == 13) {
					var length = values.length;
					if(length > value){
						self.val(temp);
					}
				}
            temp = self.$textarea.val();
			});
        },

        /**
         * 获取/设置值
         * @param {String} [value] 参数
         * @return {String}
         */
        val: function(value) {
            if (undefined === value) { //get
                return this.$textarea.val();
            }
            this.$textarea[0].value = value; //set
            this.renderLineNumber(0);
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$textarea.off('mouseover.bizTextline')
                .off('mouseout.bizTextline')
                .off('focus.bizTextline')
                .off('blur.bizTextline')
                .off('keyup.bizTextline')
                .off('scroll.bizTextline');
            this.$main.removeClass(defaultClass + this.skin).empty();
        },

        /**
         * 绘制行号
         * @param {Number} scrollTop 滚动高度
         * @protected
         */
        renderLineNumber: function(scrollTop) {
            var lineCount = this.$textarea.val().split('\n').length,
                numbers = '1';
            for (var i = 2; i <= lineCount; i++) {
                numbers += '\n' + i;
            }
            this.$lineNumber.html(numbers);
            this.scrollLineNumber(scrollTop);
        },

        /**
         * 滚动行号
         * @param {Number} scrollTop 滚动高度
         * @protected
         */
        scrollLineNumber: function(scrollTop) {
            this.$lineNumber.css({
                top: 5 - scrollTop
            });
        }
    };

    function isTextline(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
    }

    var dataKey = 'bizTextline';

    $.extend($.fn, {
        bizTextline: function(method, options) {
            var textline;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        textline = $(this).data(dataKey);
                        if (textline) {
                            textline.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        textline = $(this).data(dataKey);
                        if (textline) {
                            textline.disable();
                        }
                    });
                    break;
				case 'lines':
                    if (undefined === options) { //get
                        return $(this).data(dataKey).val().split("\n").length;
                    }
                    this.each(function() { //set
                        textline = $(this).data(dataKey);
                        if (textline) {
                            textline.lines(options);
                        }
                    });
                    break;
                case 'val':
                    if (undefined === options) { //get
                        return $(this).data(dataKey).val();
                    }
                    this.each(function() { //set
                        textline = $(this).data(dataKey);
                        if (textline) {
                            textline.val(options);
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        textline = $(this).data(dataKey);
                        if (textline) {
                            textline.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'length':
                    return this.length !== 0 ? this.data(dataKey).length() : null;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTextline(this)) {
                            $(this).data(dataKey, new Textline(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Textline;
});