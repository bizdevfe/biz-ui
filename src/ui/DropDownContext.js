/**
 * @ignore
 */
define(function() {
    /**
     * DropDownContext constructor
     *
     * @constructor
     * @param {HTMLElement|jQuery} context dropdown context中的内容，可以是原生dom，也可以是jquery dom对象，必填
     * @param {Object} [options] 参数
     * @param {HTMLElement|jQuery} options.trigger 触发dropdown的dom元素，可以是原生dom，也可以是jquery dom对象，必填
     * @param {String} [options.alignX] 水平方向上对齐，"left","right"分别对应左对齐和右对齐。默认"left"
     * @param {String} [options.alignY] 垂直方向上对齐，"top","bottom"分别对应上对齐和下对齐。默认"bottom"
     * @param {Number} [options.offsetX] 水平方向对齐偏移。默认0
     * @param {Number} [options.offsetY] 垂直方向对齐偏移。默认0
     * @param {Number} [options.delay] dropdown弹出延迟时间，单位毫秒。默认0.
     * @param {String} [options.event] 触发事件，"hover","click"分别对应hover触发和点击触发，默认"click"
     * @param {String} [options.skin] 样式，默认"biz-dropdown-context"
     * @param {Number} [options.zIndex] dropdown z-index，默认使用trigger的z-index
     * @param {Function} [options.onBeforeOpen] 打开时的回调函数，返回false（===严格判断是否等于false），则不执行打开
     * @param {Function} [options.onBeforeClose] 关闭时的回调函数，返回false（===严格判断是否等于false），则不执行关闭
     */
    function DropDownContext(context, options) {
        if (context instanceof jQuery) {
            if (context.length > 0) {
                context = context[0]; //只取第一个元素
            } else {
                return;
            }
        }
        this.context = context;
        this.$context = $(context);

        var defaultOption = {
            alignX: 'left',
            alignY: 'bottom',
            offsetX: 0,
            offsetY: 0,
            delay: 0,
            event: 'click',
            skin: 'biz-dropdown-context'
        };
        this.options = $.extend(defaultOption, options || {});

        //默认隐藏
        this.hasShow = false;

        this._init();
    }

    /**
     * init
     */
    DropDownContext.prototype._init = function() {
        if (!this.options.trigger || !this.$context) {
            return;
        }

        if (this.options.event == 'click') {
            this.eventHandler = $.proxy(this, 'toggle');
            this.options.trigger.on(this.options.event, this.eventHandler);
        }

        this.$main = $('<div class="' + this.options.skin + '" style="display:none;"></div>');
        this.$main.append(this.$context);
        this.$main.appendTo('body');
    };

    /**
     * toggle
     */
    DropDownContext.prototype.toggle = function() {
        (this.hasShow ? this.close : this.open).call(this);
    };

    /**
     * open dropdown context
     */
    DropDownContext.prototype.open = function() {
        var rs = true;
        if (this.options.onBeforeOpen && typeof(this.options.onBeforeOpen) == 'function') {
            rs = this.options.onBeforeOpen();
            if (rs === false) {
                return;
            }
        }

        function show() {
            var position = this.options.trigger.position(),
                top, left;
            //this.$main必须要首先被show，否则无法得到其高度和宽度
            this.$main.show();
            this.$context.show();

            //left值计算
            //left值计算要考虑trigger的位置，offsetX，tirgger与context的宽度比较
            if (this.options.alignX == 'left') {
                left = position.left + this.options.offsetX;
            } else if (this.options.alignX == 'right') {
                left = position.left + (this.options.trigger.outerWidth() - this.$main.outerWidth()) + this.options.offsetX;
            }

            //top值计算
            if (this.options.alignY == 'bottom') {
                top = position.top + this.options.trigger.outerHeight() + this.options.offsetY;
            } else if (this.options.alignY == 'top') {
                top = position.top - this.$main.outerHeight() + this.options.offsetY;
            }
            this.position(top, left);
            this.$main.css('z-index', this.options.zIndex || this.options.trigger.css('zIndex'));
            this.hasShow ^= 1;
        }

        if (this.options.delay > 0) {
            this.settimeout = setTimeout($.proxy(show, this), this.options.delay);
        } else {
            show.call(this);
        }
    };

    /**
     * close dropdown context
     */
    DropDownContext.prototype.close = function() {
        var rs = true;
        if (this.options.onBeforeClose && typeof(this.options.onBeforeClose) == 'function') {
            rs = this.options.onBeforeClose();
            if (rs === false) { // cancel close dialog
                return;
            }
        }
        this.$main.hide();
        this.hasShow ^= 1;
    };

    /**
     * @param  {Number|String} top 定位top值
     * @param  {Number|String} left 定位left值
     */
    DropDownContext.prototype.position = function(top, left) {
        this.$main.css('top', top)
            .css('left', left);
    };

    /**
     * 销毁
     */
    DropDownContext.prototype.destroy = function() {
        if (this.settimeout) {
            clearTimeout(this.settimeout);
        }
        this.$context.remove();
        if (this.options.event == 'click') {
            this.options.trigger.off(this.options.event, this.eventHandler);
        }
    };

    var dataKey = 'bizDialog';

    $.extend($.fn, {
        bizDDContext: function(method) {
            var dropDownContext;
            switch (method) {
                case 'open':
                    this.each(function() {
                        dropDownContext = $(this).data(dataKey);
                        if (dropDownContext) {
                            dropDownContext.open();
                        }
                    });
                    break;
                case 'close':
                    this.each(function() {
                        dropDownContext = $(this).data(dataKey);
                        if (dropDownContext) {
                            dropDownContext.close();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        dropDownContext = $(this).data(dataKey);
                        if (dropDownContext) {
                            dropDownContext.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey)) {
                            $(this).data(dataKey, new DropDownContext(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return DropDownContext;
});