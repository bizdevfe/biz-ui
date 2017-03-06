(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        this.bizui = factory(jQuery);
    }
}(function (__external_jQuery) {
    var global = this, define;
    function _require(id) {
        var module = _require.cache[id];
        if (!module) {
            var exports = {};
            module = _require.cache[id] = {
                id: id,
                exports: exports
            };
            _require.modules[id].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            !function (a, b) {
                'object' == typeof exports ? module.exports = b() : 'function' == typeof define && define.amd ? define([], b) : a.Draggable = b();
            }(this, function () {
                'use strict';
                function a(a, b) {
                    var c = this, d = k.bind(c.start, c), e = k.bind(c.drag, c), g = k.bind(c.stop, c);
                    if (!f(a))
                        throw new TypeError('Draggable expects argument 0 to be an Element');
                    b = k.assign({}, i, b), k.assign(c, {
                        element: a,
                        handle: b.handle && f(b.handle) ? b.handle : a,
                        handlers: {
                            start: {
                                mousedown: d,
                                touchstart: d
                            },
                            move: {
                                mousemove: e,
                                mouseup: g,
                                touchmove: e,
                                touchend: g
                            }
                        },
                        options: b
                    }), c.initialize();
                }
                function b(a) {
                    return parseInt(a, 10);
                }
                function c(a) {
                    return 'currentStyle' in a ? a.currentStyle : getComputedStyle(a);
                }
                function d(a) {
                    return a instanceof Array;
                }
                function e(a) {
                    return void 0 !== a && null !== a;
                }
                function f(a) {
                    return a instanceof Element || 'undefined' != typeof HTMLDocument && a instanceof HTMLDocument;
                }
                function g(a) {
                    return a instanceof Function;
                }
                function h() {
                }
                var i = {
                        grid: 0,
                        filterTarget: null,
                        limit: {
                            x: null,
                            y: null
                        },
                        threshold: 0,
                        setCursor: !1,
                        setPosition: !0,
                        smoothDrag: !0,
                        useGPU: !0,
                        onDrag: h,
                        onDragStart: h,
                        onDragEnd: h
                    }, j = {
                        transform: function () {
                            for (var a = ' -o- -ms- -moz- -webkit-'.split(' '), b = document.body.style, c = a.length; c--;) {
                                var d = a[c] + 'transform';
                                if (d in b)
                                    return d;
                            }
                        }()
                    }, k = {
                        assign: function () {
                            for (var a = arguments[0], b = arguments.length, c = 1; b > c; c++) {
                                var d = arguments[c];
                                for (var e in d)
                                    a[e] = d[e];
                            }
                            return a;
                        },
                        bind: function (a, b) {
                            return function () {
                                a.apply(b, arguments);
                            };
                        },
                        on: function (a, b, c) {
                            if (b && c)
                                k.addEvent(a, b, c);
                            else if (b)
                                for (var d in b)
                                    k.addEvent(a, d, b[d]);
                        },
                        off: function (a, b, c) {
                            if (b && c)
                                k.removeEvent(a, b, c);
                            else if (b)
                                for (var d in b)
                                    k.removeEvent(a, d, b[d]);
                        },
                        limit: function (a, b) {
                            return d(b) ? (b = [
                                +b[0],
                                +b[1]
                            ], a < b[0] ? a = b[0] : a > b[1] && (a = b[1])) : a = +b, a;
                        },
                        addEvent: 'attachEvent' in Element.prototype ? function (a, b, c) {
                            a.attachEvent('on' + b, c);
                        } : function (a, b, c) {
                            a.addEventListener(b, c, !1);
                        },
                        removeEvent: 'attachEvent' in Element.prototype ? function (a, b, c) {
                            a.detachEvent('on' + b, c);
                        } : function (a, b, c) {
                            a.removeEventListener(b, c);
                        }
                    };
                return k.assign(a.prototype, {
                    setOption: function (a, b) {
                        var c = this;
                        return c.options[a] = b, c.initialize(), c;
                    },
                    get: function () {
                        var a = this.dragEvent;
                        return {
                            x: a.x,
                            y: a.y
                        };
                    },
                    set: function (a, b) {
                        var c = this, d = c.dragEvent;
                        return d.original = {
                            x: d.x,
                            y: d.y
                        }, c.move(a, b), c;
                    },
                    dragEvent: {
                        started: !1,
                        x: 0,
                        y: 0
                    },
                    initialize: function () {
                        var a, b = this, d = b.element, e = (b.handle, d.style), f = c(d), g = b.options, h = j.transform, i = b._dimensions = {
                                height: d.offsetHeight,
                                left: d.offsetLeft,
                                top: d.offsetTop,
                                width: d.offsetWidth
                            };
                        g.useGPU && h && (a = f[h], 'none' === a && (a = ''), e[h] = a + ' translate3d(0,0,0)'), g.setPosition && (e.display = 'block', e.left = i.left + 'px', e.top = i.top + 'px', e.bottom = e.right = 'auto', e.margin = 0, e.position = 'absolute'), g.setCursor && (e.cursor = 'move'), b.setLimit(g.limit), k.assign(b.dragEvent, {
                            x: i.left,
                            y: i.top
                        }), k.on(b.handle, b.handlers.start);
                    },
                    start: function (a) {
                        var b = this, c = b.getCursor(a), d = b.element;
                        b.useTarget(a.target || a.srcElement) && (a.preventDefault ? a.preventDefault() : a.returnValue = !1, b.dragEvent.oldZindex = d.style.zIndex, d.style.zIndex = 10000, b.setCursor(c), b.setPosition(), b.setZoom(), k.on(document, b.handlers.move));
                    },
                    drag: function (a) {
                        var b = this, c = b.dragEvent, d = b.element, e = b._cursor, f = b._dimensions, g = b.options, h = f.zoom, i = b.getCursor(a), j = g.threshold, k = (i.x - e.x) / h + f.left, l = (i.y - e.y) / h + f.top;
                        !c.started && j && Math.abs(e.x - i.x) < j && Math.abs(e.y - i.y) < j || (c.original || (c.original = {
                            x: k,
                            y: l
                        }), c.started || (g.onDragStart(d, k, l, a), c.started = !0), b.move(k, l) && g.onDrag(d, c.x, c.y, a));
                    },
                    move: function (a, b) {
                        var c = this, d = c.dragEvent, e = c.options, f = e.grid, g = c.element.style, h = c.limit(a, b, d.original.x, d.original.y);
                        return !e.smoothDrag && f && (h = c.round(h, f)), h.x !== d.x || h.y !== d.y ? (d.x = h.x, d.y = h.y, g.left = h.x + 'px', g.top = h.y + 'px', !0) : !1;
                    },
                    stop: function (a) {
                        var b, c = this, d = c.dragEvent, e = c.element, f = c.options, g = f.grid;
                        k.off(document, c.handlers.move), e.style.zIndex = d.oldZindex, f.smoothDrag && g && (b = c.round({
                            x: d.x,
                            y: d.y
                        }, g), c.move(b.x, b.y), k.assign(c.dragEvent, b)), c.dragEvent.started && f.onDragEnd(e, d.x, d.y, a), c.reset();
                    },
                    reset: function () {
                        this.dragEvent.started = !1;
                    },
                    round: function (a) {
                        var b = this.options.grid;
                        return {
                            x: b * Math.round(a.x / b),
                            y: b * Math.round(a.y / b)
                        };
                    },
                    getCursor: function (a) {
                        return {
                            x: (a.targetTouches ? a.targetTouches[0] : a).clientX,
                            y: (a.targetTouches ? a.targetTouches[0] : a).clientY
                        };
                    },
                    setCursor: function (a) {
                        this._cursor = a;
                    },
                    setLimit: function (a) {
                        var b = this, c = function (a, b) {
                                return {
                                    x: a,
                                    y: b
                                };
                            };
                        if (g(a))
                            b.limit = a;
                        else if (f(a)) {
                            var d = b._dimensions, h = a.scrollHeight - d.height, i = a.scrollWidth - d.width;
                            b.limit = function (a, b) {
                                return {
                                    x: k.limit(a, [
                                        0,
                                        i
                                    ]),
                                    y: k.limit(b, [
                                        0,
                                        h
                                    ])
                                };
                            };
                        } else if (a) {
                            var j = {
                                    x: e(a.x),
                                    y: e(a.y)
                                };
                            b.limit = j.x || j.y ? function (b, c) {
                                return {
                                    x: j.x ? k.limit(b, a.x) : b,
                                    y: j.y ? k.limit(c, a.y) : c
                                };
                            } : c;
                        } else
                            b.limit = c;
                    },
                    setPosition: function () {
                        var a = this, c = a.element, d = c.style;
                        k.assign(a._dimensions, {
                            left: b(d.left) || c.offsetLeft,
                            top: b(d.top) || c.offsetTop
                        });
                    },
                    setZoom: function () {
                        for (var a = this, b = a.element, d = 1; b = b.offsetParent;) {
                            var e = c(b).zoom;
                            if (e && 'normal' !== e) {
                                d = e;
                                break;
                            }
                        }
                        a._dimensions.zoom = d;
                    },
                    useTarget: function (a) {
                        var b = this.options.filterTarget;
                        return b instanceof Function ? b(a) : !0;
                    },
                    destroy: function () {
                        k.off(this.handle, this.handlers.start), k.off(document, this.handlers.move);
                    }
                }), a;
            });
        },
        function (module, exports) {
            !function (a) {
                a.fn.datepicker.dates['zh-CN'] = {
                    days: [
                        '\u661F\u671F\u65E5',
                        '\u661F\u671F\u4E00',
                        '\u661F\u671F\u4E8C',
                        '\u661F\u671F\u4E09',
                        '\u661F\u671F\u56DB',
                        '\u661F\u671F\u4E94',
                        '\u661F\u671F\u516D'
                    ],
                    daysShort: [
                        '\u5468\u65E5',
                        '\u5468\u4E00',
                        '\u5468\u4E8C',
                        '\u5468\u4E09',
                        '\u5468\u56DB',
                        '\u5468\u4E94',
                        '\u5468\u516D'
                    ],
                    daysMin: [
                        '\u65E5',
                        '\u4E00',
                        '\u4E8C',
                        '\u4E09',
                        '\u56DB',
                        '\u4E94',
                        '\u516D'
                    ],
                    months: [
                        '\u4E00\u6708',
                        '\u4E8C\u6708',
                        '\u4E09\u6708',
                        '\u56DB\u6708',
                        '\u4E94\u6708',
                        '\u516D\u6708',
                        '\u4E03\u6708',
                        '\u516B\u6708',
                        '\u4E5D\u6708',
                        '\u5341\u6708',
                        '\u5341\u4E00\u6708',
                        '\u5341\u4E8C\u6708'
                    ],
                    monthsShort: [
                        '1\u6708',
                        '2\u6708',
                        '3\u6708',
                        '4\u6708',
                        '5\u6708',
                        '6\u6708',
                        '7\u6708',
                        '8\u6708',
                        '9\u6708',
                        '10\u6708',
                        '11\u6708',
                        '12\u6708'
                    ],
                    today: '\u4ECA\u65E5',
                    clear: '\u6E05\u9664',
                    format: 'yyyy\u5E74mm\u6708dd\u65E5',
                    titleFormat: 'yyyy\u5E74mm\u6708',
                    weekStart: 1
                };
            }(jQuery);
        },
        function (module, exports) {
            (function (factory) {
                if (typeof define === 'function' && define.amd) {
                    define(['jquery'], factory);
                } else if (typeof module === 'object' && module.exports) {
                    factory(_require(3));
                } else {
                    factory(jQuery);
                }
            }(function ($) {
                var debugMode = false;
                var isOperaMini = Object.prototype.toString.call(window.operamini) === '[object OperaMini]';
                var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini && !debugMode;
                var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini && !debugMode;
                var valHooks = $.valHooks;
                var propHooks = $.propHooks;
                var hooks;
                var placeholder;
                var settings = {};
                if (isInputSupported && isTextareaSupported) {
                    placeholder = $.fn.placeholder = function () {
                        return this;
                    };
                    placeholder.input = true;
                    placeholder.textarea = true;
                } else {
                    placeholder = $.fn.placeholder = function (options) {
                        var defaults = { customClass: 'placeholder' };
                        settings = $.extend({}, defaults, options);
                        return this.filter((isInputSupported ? 'textarea' : ':input') + '[' + (debugMode ? 'placeholder-x' : 'placeholder') + ']').not('.' + settings.customClass).not(':radio, :checkbox, [type=hidden]').bind({
                            'focus.placeholder': clearPlaceholder,
                            'blur.placeholder': setPlaceholder
                        }).data('placeholder-enabled', true).trigger('blur.placeholder');
                    };
                    placeholder.input = isInputSupported;
                    placeholder.textarea = isTextareaSupported;
                    hooks = {
                        'get': function (element) {
                            var $element = $(element);
                            var $passwordInput = $element.data('placeholder-password');
                            if ($passwordInput) {
                                return $passwordInput[0].value;
                            }
                            return $element.data('placeholder-enabled') && $element.hasClass(settings.customClass) ? '' : element.value;
                        },
                        'set': function (element, value) {
                            var $element = $(element);
                            var $replacement;
                            var $passwordInput;
                            if (value !== '') {
                                $replacement = $element.data('placeholder-textinput');
                                $passwordInput = $element.data('placeholder-password');
                                if ($replacement) {
                                    clearPlaceholder.call($replacement[0], true, value) || (element.value = value);
                                    $replacement[0].value = value;
                                } else if ($passwordInput) {
                                    clearPlaceholder.call(element, true, value) || ($passwordInput[0].value = value);
                                    element.value = value;
                                }
                            }
                            if (!$element.data('placeholder-enabled')) {
                                element.value = value;
                                return $element;
                            }
                            if (value === '') {
                                element.value = value;
                                if (element != safeActiveElement()) {
                                    setPlaceholder.call(element);
                                }
                            } else {
                                if ($element.hasClass(settings.customClass)) {
                                    clearPlaceholder.call(element);
                                }
                                element.value = value;
                            }
                            return $element;
                        }
                    };
                    if (!isInputSupported) {
                        valHooks.input = hooks;
                        propHooks.value = hooks;
                    }
                    if (!isTextareaSupported) {
                        valHooks.textarea = hooks;
                        propHooks.value = hooks;
                    }
                    $(function () {
                        $(document).delegate('form', 'submit.placeholder', function () {
                            var $inputs = $('.' + settings.customClass, this).each(function () {
                                    clearPlaceholder.call(this, true, '');
                                });
                            setTimeout(function () {
                                $inputs.each(setPlaceholder);
                            }, 10);
                        });
                    });
                    $(window).bind('beforeunload.placeholder', function () {
                        var clearPlaceholders = true;
                        try {
                            if (document.activeElement.toString() === 'javascript:void(0)') {
                                clearPlaceholders = false;
                            }
                        } catch (exception) {
                        }
                        if (clearPlaceholders) {
                            $('.' + settings.customClass).each(function () {
                                this.value = '';
                            });
                        }
                    });
                }
                function args(elem) {
                    var newAttrs = {};
                    var rinlinejQuery = /^jQuery\d+$/;
                    $.each(elem.attributes, function (i, attr) {
                        if (attr.specified && !rinlinejQuery.test(attr.name)) {
                            newAttrs[attr.name] = attr.value;
                        }
                    });
                    return newAttrs;
                }
                function clearPlaceholder(event, value) {
                    var input = this;
                    var $input = $(this);
                    if (input.value === $input.attr(debugMode ? 'placeholder-x' : 'placeholder') && $input.hasClass(settings.customClass)) {
                        input.value = '';
                        $input.removeClass(settings.customClass);
                        if ($input.data('placeholder-password')) {
                            $input = $input.hide().nextAll('input[type="password"]:first').show().attr('id', $input.removeAttr('id').data('placeholder-id'));
                            if (event === true) {
                                $input[0].value = value;
                                return value;
                            }
                            $input.focus();
                        } else {
                            input == safeActiveElement() && input.select();
                        }
                    }
                }
                function setPlaceholder(event) {
                    var $replacement;
                    var input = this;
                    var $input = $(this);
                    var id = input.id;
                    if (event && event.type === 'blur' && $input.hasClass(settings.customClass)) {
                        return;
                    }
                    if (input.value === '') {
                        if (input.type === 'password') {
                            if (!$input.data('placeholder-textinput')) {
                                try {
                                    $replacement = $input.clone().prop({ 'type': 'text' });
                                } catch (e) {
                                    $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
                                }
                                $replacement.removeAttr('name').data({
                                    'placeholder-enabled': true,
                                    'placeholder-password': $input,
                                    'placeholder-id': id
                                }).bind('focus.placeholder', clearPlaceholder);
                                $input.data({
                                    'placeholder-textinput': $replacement,
                                    'placeholder-id': id
                                }).before($replacement);
                            }
                            input.value = '';
                            $input = $input.removeAttr('id').hide().prevAll('input[type="text"]:first').attr('id', $input.data('placeholder-id')).show();
                        } else {
                            var $passwordInput = $input.data('placeholder-password');
                            if ($passwordInput) {
                                $passwordInput[0].value = '';
                                $input.attr('id', $input.data('placeholder-id')).show().nextAll('input[type="password"]:last').hide().removeAttr('id');
                            }
                        }
                        $input.addClass(settings.customClass);
                        $input[0].value = $input.attr(debugMode ? 'placeholder-x' : 'placeholder');
                    } else {
                        $input.removeClass(settings.customClass);
                    }
                }
                function safeActiveElement() {
                    try {
                        return document.activeElement;
                    } catch (exception) {
                    }
                }
            }));
        },
        function (module, exports) {
            module.exports = __external_jQuery;
        },
        function (module, exports) {
            (function (factory) {
                'use strict';
                if (typeof define === 'function' && define.amd) {
                    define(['jquery'], factory);
                } else if (typeof module !== 'undefined' && module.exports) {
                    module.exports = factory(_require(3));
                } else {
                    factory(jQuery);
                }
            }(function ($, undefined) {
                'use strict';
                if ($.jstree) {
                    return;
                }
                var instance_counter = 0, ccp_node = false, ccp_mode = false, ccp_inst = false, themes_loaded = [], src = $('script:last').attr('src'), document = window.document;
                $.jstree = {
                    version: '3.3.3',
                    defaults: { plugins: [] },
                    plugins: {},
                    path: src && src.indexOf('/') !== -1 ? src.replace(/\/[^\/]+$/, '') : '',
                    idregex: /[\\:&!^|()\[\]<>@*'+~#";.,=\- \/${}%?`]/g,
                    root: '#'
                };
                $.jstree.create = function (el, options) {
                    var tmp = new $.jstree.core(++instance_counter), opt = options;
                    options = $.extend(true, {}, $.jstree.defaults, options);
                    if (opt && opt.plugins) {
                        options.plugins = opt.plugins;
                    }
                    $.each(options.plugins, function (i, k) {
                        if (i !== 'core') {
                            tmp = tmp.plugin(k, options[k]);
                        }
                    });
                    $(el).data('jstree', tmp);
                    tmp.init(el, options);
                    return tmp;
                };
                $.jstree.destroy = function () {
                    $('.jstree:jstree').jstree('destroy');
                    $(document).off('.jstree');
                };
                $.jstree.core = function (id) {
                    this._id = id;
                    this._cnt = 0;
                    this._wrk = null;
                    this._data = {
                        core: {
                            themes: {
                                name: false,
                                dots: false,
                                icons: false,
                                ellipsis: false
                            },
                            selected: [],
                            last_error: {},
                            working: false,
                            worker_queue: [],
                            focused: null
                        }
                    };
                };
                $.jstree.reference = function (needle) {
                    var tmp = null, obj = null;
                    if (needle && needle.id && (!needle.tagName || !needle.nodeType)) {
                        needle = needle.id;
                    }
                    if (!obj || !obj.length) {
                        try {
                            obj = $(needle);
                        } catch (ignore) {
                        }
                    }
                    if (!obj || !obj.length) {
                        try {
                            obj = $('#' + needle.replace($.jstree.idregex, '\\$&'));
                        } catch (ignore) {
                        }
                    }
                    if (obj && obj.length && (obj = obj.closest('.jstree')).length && (obj = obj.data('jstree'))) {
                        tmp = obj;
                    } else {
                        $('.jstree').each(function () {
                            var inst = $(this).data('jstree');
                            if (inst && inst._model.data[needle]) {
                                tmp = inst;
                                return false;
                            }
                        });
                    }
                    return tmp;
                };
                $.fn.jstree = function (arg) {
                    var is_method = typeof arg === 'string', args = Array.prototype.slice.call(arguments, 1), result = null;
                    if (arg === true && !this.length) {
                        return false;
                    }
                    this.each(function () {
                        var instance = $.jstree.reference(this), method = is_method && instance ? instance[arg] : null;
                        result = is_method && method ? method.apply(instance, args) : null;
                        if (!instance && !is_method && (arg === undefined || $.isPlainObject(arg))) {
                            $.jstree.create(this, arg);
                        }
                        if (instance && !is_method || arg === true) {
                            result = instance || false;
                        }
                        if (result !== null && result !== undefined) {
                            return false;
                        }
                    });
                    return result !== null && result !== undefined ? result : this;
                };
                $.expr.pseudos.jstree = $.expr.createPseudo(function (search) {
                    return function (a) {
                        return $(a).hasClass('jstree') && $(a).data('jstree') !== undefined;
                    };
                });
                $.jstree.defaults.core = {
                    data: false,
                    strings: false,
                    check_callback: false,
                    error: $.noop,
                    animation: 200,
                    multiple: true,
                    themes: {
                        name: false,
                        url: false,
                        dir: false,
                        dots: true,
                        icons: true,
                        ellipsis: false,
                        stripes: false,
                        variant: false,
                        responsive: false
                    },
                    expand_selected_onload: true,
                    worker: true,
                    force_text: false,
                    dblclick_toggle: true
                };
                $.jstree.core.prototype = {
                    plugin: function (deco, opts) {
                        var Child = $.jstree.plugins[deco];
                        if (Child) {
                            this._data[deco] = {};
                            Child.prototype = this;
                            return new Child(opts, this);
                        }
                        return this;
                    },
                    init: function (el, options) {
                        this._model = {
                            data: {},
                            changed: [],
                            force_full_redraw: false,
                            redraw_timeout: false,
                            default_state: {
                                loaded: true,
                                opened: false,
                                selected: false,
                                disabled: false
                            }
                        };
                        this._model.data[$.jstree.root] = {
                            id: $.jstree.root,
                            parent: null,
                            parents: [],
                            children: [],
                            children_d: [],
                            state: { loaded: false }
                        };
                        this.element = $(el).addClass('jstree jstree-' + this._id);
                        this.settings = options;
                        this._data.core.ready = false;
                        this._data.core.loaded = false;
                        this._data.core.rtl = this.element.css('direction') === 'rtl';
                        this.element[this._data.core.rtl ? 'addClass' : 'removeClass']('jstree-rtl');
                        this.element.attr('role', 'tree');
                        if (this.settings.core.multiple) {
                            this.element.attr('aria-multiselectable', true);
                        }
                        if (!this.element.attr('tabindex')) {
                            this.element.attr('tabindex', '0');
                        }
                        this.bind();
                        this.trigger('init');
                        this._data.core.original_container_html = this.element.find(' > ul > li').clone(true);
                        this._data.core.original_container_html.find('li').addBack().contents().filter(function () {
                            return this.nodeType === 3 && (!this.nodeValue || /^\s+$/.test(this.nodeValue));
                        }).remove();
                        this.element.html('<' + 'ul class=\'jstree-container-ul jstree-children\' role=\'group\'><' + 'li id=\'j' + this._id + '_loading\' class=\'jstree-initial-node jstree-loading jstree-leaf jstree-last\' role=\'tree-item\'><i class=\'jstree-icon jstree-ocl\'></i><' + 'a class=\'jstree-anchor\' href=\'#\'><i class=\'jstree-icon jstree-themeicon-hidden\'></i>' + this.get_string('Loading ...') + '</a></li></ul>');
                        this.element.attr('aria-activedescendant', 'j' + this._id + '_loading');
                        this._data.core.li_height = this.get_container_ul().children('li').first().height() || 24;
                        this._data.core.node = this._create_prototype_node();
                        this.trigger('loading');
                        this.load_node($.jstree.root);
                    },
                    destroy: function (keep_html) {
                        if (this._wrk) {
                            try {
                                window.URL.revokeObjectURL(this._wrk);
                                this._wrk = null;
                            } catch (ignore) {
                            }
                        }
                        if (!keep_html) {
                            this.element.empty();
                        }
                        this.teardown();
                    },
                    _create_prototype_node: function () {
                        var _node = document.createElement('LI'), _temp1, _temp2;
                        _node.setAttribute('role', 'treeitem');
                        _temp1 = document.createElement('I');
                        _temp1.className = 'jstree-icon jstree-ocl';
                        _temp1.setAttribute('role', 'presentation');
                        _node.appendChild(_temp1);
                        _temp1 = document.createElement('A');
                        _temp1.className = 'jstree-anchor';
                        _temp1.setAttribute('href', '#');
                        _temp1.setAttribute('tabindex', '-1');
                        _temp2 = document.createElement('I');
                        _temp2.className = 'jstree-icon jstree-themeicon';
                        _temp2.setAttribute('role', 'presentation');
                        _temp1.appendChild(_temp2);
                        _node.appendChild(_temp1);
                        _temp1 = _temp2 = null;
                        return _node;
                    },
                    teardown: function () {
                        this.unbind();
                        this.element.removeClass('jstree').removeData('jstree').find('[class^=\'jstree\']').addBack().attr('class', function () {
                            return this.className.replace(/jstree[^ ]*|$/gi, '');
                        });
                        this.element = null;
                    },
                    bind: function () {
                        var word = '', tout = null, was_click = 0;
                        this.element.on('dblclick.jstree', function (e) {
                            if (e.target.tagName && e.target.tagName.toLowerCase() === 'input') {
                                return true;
                            }
                            if (document.selection && document.selection.empty) {
                                document.selection.empty();
                            } else {
                                if (window.getSelection) {
                                    var sel = window.getSelection();
                                    try {
                                        sel.removeAllRanges();
                                        sel.collapse();
                                    } catch (ignore) {
                                    }
                                }
                            }
                        }).on('mousedown.jstree', $.proxy(function (e) {
                            if (e.target === this.element[0]) {
                                e.preventDefault();
                                was_click = +new Date();
                            }
                        }, this)).on('mousedown.jstree', '.jstree-ocl', function (e) {
                            e.preventDefault();
                        }).on('click.jstree', '.jstree-ocl', $.proxy(function (e) {
                            this.toggle_node(e.target);
                        }, this)).on('dblclick.jstree', '.jstree-anchor', $.proxy(function (e) {
                            if (e.target.tagName && e.target.tagName.toLowerCase() === 'input') {
                                return true;
                            }
                            if (this.settings.core.dblclick_toggle) {
                                this.toggle_node(e.target);
                            }
                        }, this)).on('click.jstree', '.jstree-anchor', $.proxy(function (e) {
                            e.preventDefault();
                            if (e.currentTarget !== document.activeElement) {
                                $(e.currentTarget).focus();
                            }
                            this.activate_node(e.currentTarget, e);
                        }, this)).on('keydown.jstree', '.jstree-anchor', $.proxy(function (e) {
                            if (e.target.tagName && e.target.tagName.toLowerCase() === 'input') {
                                return true;
                            }
                            if (e.which !== 32 && e.which !== 13 && (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey)) {
                                return true;
                            }
                            var o = null;
                            if (this._data.core.rtl) {
                                if (e.which === 37) {
                                    e.which = 39;
                                } else if (e.which === 39) {
                                    e.which = 37;
                                }
                            }
                            switch (e.which) {
                            case 32:
                                if (e.ctrlKey) {
                                    e.type = 'click';
                                    $(e.currentTarget).trigger(e);
                                }
                                break;
                            case 13:
                                e.type = 'click';
                                $(e.currentTarget).trigger(e);
                                break;
                            case 37:
                                e.preventDefault();
                                if (this.is_open(e.currentTarget)) {
                                    this.close_node(e.currentTarget);
                                } else {
                                    o = this.get_parent(e.currentTarget);
                                    if (o && o.id !== $.jstree.root) {
                                        this.get_node(o, true).children('.jstree-anchor').focus();
                                    }
                                }
                                break;
                            case 38:
                                e.preventDefault();
                                o = this.get_prev_dom(e.currentTarget);
                                if (o && o.length) {
                                    o.children('.jstree-anchor').focus();
                                }
                                break;
                            case 39:
                                e.preventDefault();
                                if (this.is_closed(e.currentTarget)) {
                                    this.open_node(e.currentTarget, function (o) {
                                        this.get_node(o, true).children('.jstree-anchor').focus();
                                    });
                                } else if (this.is_open(e.currentTarget)) {
                                    o = this.get_node(e.currentTarget, true).children('.jstree-children')[0];
                                    if (o) {
                                        $(this._firstChild(o)).children('.jstree-anchor').focus();
                                    }
                                }
                                break;
                            case 40:
                                e.preventDefault();
                                o = this.get_next_dom(e.currentTarget);
                                if (o && o.length) {
                                    o.children('.jstree-anchor').focus();
                                }
                                break;
                            case 106:
                                this.open_all();
                                break;
                            case 36:
                                e.preventDefault();
                                o = this._firstChild(this.get_container_ul()[0]);
                                if (o) {
                                    $(o).children('.jstree-anchor').filter(':visible').focus();
                                }
                                break;
                            case 35:
                                e.preventDefault();
                                this.element.find('.jstree-anchor').filter(':visible').last().focus();
                                break;
                            case 113:
                                e.preventDefault();
                                this.edit(e.currentTarget);
                                break;
                            default:
                                break;
                            }
                        }, this)).on('load_node.jstree', $.proxy(function (e, data) {
                            if (data.status) {
                                if (data.node.id === $.jstree.root && !this._data.core.loaded) {
                                    this._data.core.loaded = true;
                                    if (this._firstChild(this.get_container_ul()[0])) {
                                        this.element.attr('aria-activedescendant', this._firstChild(this.get_container_ul()[0]).id);
                                    }
                                    this.trigger('loaded');
                                }
                                if (!this._data.core.ready) {
                                    setTimeout($.proxy(function () {
                                        if (this.element && !this.get_container_ul().find('.jstree-loading').length) {
                                            this._data.core.ready = true;
                                            if (this._data.core.selected.length) {
                                                if (this.settings.core.expand_selected_onload) {
                                                    var tmp = [], i, j;
                                                    for (i = 0, j = this._data.core.selected.length; i < j; i++) {
                                                        tmp = tmp.concat(this._model.data[this._data.core.selected[i]].parents);
                                                    }
                                                    tmp = $.vakata.array_unique(tmp);
                                                    for (i = 0, j = tmp.length; i < j; i++) {
                                                        this.open_node(tmp[i], false, 0);
                                                    }
                                                }
                                                this.trigger('changed', {
                                                    'action': 'ready',
                                                    'selected': this._data.core.selected
                                                });
                                            }
                                            this.trigger('ready');
                                        }
                                    }, this), 0);
                                }
                            }
                        }, this)).on('keypress.jstree', $.proxy(function (e) {
                            if (e.target.tagName && e.target.tagName.toLowerCase() === 'input') {
                                return true;
                            }
                            if (tout) {
                                clearTimeout(tout);
                            }
                            tout = setTimeout(function () {
                                word = '';
                            }, 500);
                            var chr = String.fromCharCode(e.which).toLowerCase(), col = this.element.find('.jstree-anchor').filter(':visible'), ind = col.index(document.activeElement) || 0, end = false;
                            word += chr;
                            if (word.length > 1) {
                                col.slice(ind).each($.proxy(function (i, v) {
                                    if ($(v).text().toLowerCase().indexOf(word) === 0) {
                                        $(v).focus();
                                        end = true;
                                        return false;
                                    }
                                }, this));
                                if (end) {
                                    return;
                                }
                                col.slice(0, ind).each($.proxy(function (i, v) {
                                    if ($(v).text().toLowerCase().indexOf(word) === 0) {
                                        $(v).focus();
                                        end = true;
                                        return false;
                                    }
                                }, this));
                                if (end) {
                                    return;
                                }
                            }
                            if (new RegExp('^' + chr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '+$').test(word)) {
                                col.slice(ind + 1).each($.proxy(function (i, v) {
                                    if ($(v).text().toLowerCase().charAt(0) === chr) {
                                        $(v).focus();
                                        end = true;
                                        return false;
                                    }
                                }, this));
                                if (end) {
                                    return;
                                }
                                col.slice(0, ind + 1).each($.proxy(function (i, v) {
                                    if ($(v).text().toLowerCase().charAt(0) === chr) {
                                        $(v).focus();
                                        end = true;
                                        return false;
                                    }
                                }, this));
                                if (end) {
                                    return;
                                }
                            }
                        }, this)).on('init.jstree', $.proxy(function () {
                            var s = this.settings.core.themes;
                            this._data.core.themes.dots = s.dots;
                            this._data.core.themes.stripes = s.stripes;
                            this._data.core.themes.icons = s.icons;
                            this._data.core.themes.ellipsis = s.ellipsis;
                            this.set_theme(s.name || 'default', s.url);
                            this.set_theme_variant(s.variant);
                        }, this)).on('loading.jstree', $.proxy(function () {
                            this[this._data.core.themes.dots ? 'show_dots' : 'hide_dots']();
                            this[this._data.core.themes.icons ? 'show_icons' : 'hide_icons']();
                            this[this._data.core.themes.stripes ? 'show_stripes' : 'hide_stripes']();
                            this[this._data.core.themes.ellipsis ? 'show_ellipsis' : 'hide_ellipsis']();
                        }, this)).on('blur.jstree', '.jstree-anchor', $.proxy(function (e) {
                            this._data.core.focused = null;
                            $(e.currentTarget).filter('.jstree-hovered').mouseleave();
                            this.element.attr('tabindex', '0');
                        }, this)).on('focus.jstree', '.jstree-anchor', $.proxy(function (e) {
                            var tmp = this.get_node(e.currentTarget);
                            if (tmp && tmp.id) {
                                this._data.core.focused = tmp.id;
                            }
                            this.element.find('.jstree-hovered').not(e.currentTarget).mouseleave();
                            $(e.currentTarget).mouseenter();
                            this.element.attr('tabindex', '-1');
                        }, this)).on('focus.jstree', $.proxy(function () {
                            if (+new Date() - was_click > 500 && !this._data.core.focused) {
                                was_click = 0;
                                var act = this.get_node(this.element.attr('aria-activedescendant'), true);
                                if (act) {
                                    act.find('> .jstree-anchor').focus();
                                }
                            }
                        }, this)).on('mouseenter.jstree', '.jstree-anchor', $.proxy(function (e) {
                            this.hover_node(e.currentTarget);
                        }, this)).on('mouseleave.jstree', '.jstree-anchor', $.proxy(function (e) {
                            this.dehover_node(e.currentTarget);
                        }, this));
                    },
                    unbind: function () {
                        this.element.off('.jstree');
                        $(document).off('.jstree-' + this._id);
                    },
                    trigger: function (ev, data) {
                        if (!data) {
                            data = {};
                        }
                        data.instance = this;
                        this.element.triggerHandler(ev.replace('.jstree', '') + '.jstree', data);
                    },
                    get_container: function () {
                        return this.element;
                    },
                    get_container_ul: function () {
                        return this.element.children('.jstree-children').first();
                    },
                    get_string: function (key) {
                        var a = this.settings.core.strings;
                        if ($.isFunction(a)) {
                            return a.call(this, key);
                        }
                        if (a && a[key]) {
                            return a[key];
                        }
                        return key;
                    },
                    _firstChild: function (dom) {
                        dom = dom ? dom.firstChild : null;
                        while (dom !== null && dom.nodeType !== 1) {
                            dom = dom.nextSibling;
                        }
                        return dom;
                    },
                    _nextSibling: function (dom) {
                        dom = dom ? dom.nextSibling : null;
                        while (dom !== null && dom.nodeType !== 1) {
                            dom = dom.nextSibling;
                        }
                        return dom;
                    },
                    _previousSibling: function (dom) {
                        dom = dom ? dom.previousSibling : null;
                        while (dom !== null && dom.nodeType !== 1) {
                            dom = dom.previousSibling;
                        }
                        return dom;
                    },
                    get_node: function (obj, as_dom) {
                        if (obj && obj.id) {
                            obj = obj.id;
                        }
                        var dom;
                        try {
                            if (this._model.data[obj]) {
                                obj = this._model.data[obj];
                            } else if (typeof obj === 'string' && this._model.data[obj.replace(/^#/, '')]) {
                                obj = this._model.data[obj.replace(/^#/, '')];
                            } else if (typeof obj === 'string' && (dom = $('#' + obj.replace($.jstree.idregex, '\\$&'), this.element)).length && this._model.data[dom.closest('.jstree-node').attr('id')]) {
                                obj = this._model.data[dom.closest('.jstree-node').attr('id')];
                            } else if ((dom = $(obj, this.element)).length && this._model.data[dom.closest('.jstree-node').attr('id')]) {
                                obj = this._model.data[dom.closest('.jstree-node').attr('id')];
                            } else if ((dom = $(obj, this.element)).length && dom.hasClass('jstree')) {
                                obj = this._model.data[$.jstree.root];
                            } else {
                                return false;
                            }
                            if (as_dom) {
                                obj = obj.id === $.jstree.root ? this.element : $('#' + obj.id.replace($.jstree.idregex, '\\$&'), this.element);
                            }
                            return obj;
                        } catch (ex) {
                            return false;
                        }
                    },
                    get_path: function (obj, glue, ids) {
                        obj = obj.parents ? obj : this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root || !obj.parents) {
                            return false;
                        }
                        var i, j, p = [];
                        p.push(ids ? obj.id : obj.text);
                        for (i = 0, j = obj.parents.length; i < j; i++) {
                            p.push(ids ? obj.parents[i] : this.get_text(obj.parents[i]));
                        }
                        p = p.reverse().slice(1);
                        return glue ? p.join(glue) : p;
                    },
                    get_next_dom: function (obj, strict) {
                        var tmp;
                        obj = this.get_node(obj, true);
                        if (obj[0] === this.element[0]) {
                            tmp = this._firstChild(this.get_container_ul()[0]);
                            while (tmp && tmp.offsetHeight === 0) {
                                tmp = this._nextSibling(tmp);
                            }
                            return tmp ? $(tmp) : false;
                        }
                        if (!obj || !obj.length) {
                            return false;
                        }
                        if (strict) {
                            tmp = obj[0];
                            do {
                                tmp = this._nextSibling(tmp);
                            } while (tmp && tmp.offsetHeight === 0);
                            return tmp ? $(tmp) : false;
                        }
                        if (obj.hasClass('jstree-open')) {
                            tmp = this._firstChild(obj.children('.jstree-children')[0]);
                            while (tmp && tmp.offsetHeight === 0) {
                                tmp = this._nextSibling(tmp);
                            }
                            if (tmp !== null) {
                                return $(tmp);
                            }
                        }
                        tmp = obj[0];
                        do {
                            tmp = this._nextSibling(tmp);
                        } while (tmp && tmp.offsetHeight === 0);
                        if (tmp !== null) {
                            return $(tmp);
                        }
                        return obj.parentsUntil('.jstree', '.jstree-node').nextAll('.jstree-node:visible').first();
                    },
                    get_prev_dom: function (obj, strict) {
                        var tmp;
                        obj = this.get_node(obj, true);
                        if (obj[0] === this.element[0]) {
                            tmp = this.get_container_ul()[0].lastChild;
                            while (tmp && tmp.offsetHeight === 0) {
                                tmp = this._previousSibling(tmp);
                            }
                            return tmp ? $(tmp) : false;
                        }
                        if (!obj || !obj.length) {
                            return false;
                        }
                        if (strict) {
                            tmp = obj[0];
                            do {
                                tmp = this._previousSibling(tmp);
                            } while (tmp && tmp.offsetHeight === 0);
                            return tmp ? $(tmp) : false;
                        }
                        tmp = obj[0];
                        do {
                            tmp = this._previousSibling(tmp);
                        } while (tmp && tmp.offsetHeight === 0);
                        if (tmp !== null) {
                            obj = $(tmp);
                            while (obj.hasClass('jstree-open')) {
                                obj = obj.children('.jstree-children').first().children('.jstree-node:visible:last');
                            }
                            return obj;
                        }
                        tmp = obj[0].parentNode.parentNode;
                        return tmp && tmp.className && tmp.className.indexOf('jstree-node') !== -1 ? $(tmp) : false;
                    },
                    get_parent: function (obj) {
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        return obj.parent;
                    },
                    get_children_dom: function (obj) {
                        obj = this.get_node(obj, true);
                        if (obj[0] === this.element[0]) {
                            return this.get_container_ul().children('.jstree-node');
                        }
                        if (!obj || !obj.length) {
                            return false;
                        }
                        return obj.children('.jstree-children').children('.jstree-node');
                    },
                    is_parent: function (obj) {
                        obj = this.get_node(obj);
                        return obj && (obj.state.loaded === false || obj.children.length > 0);
                    },
                    is_loaded: function (obj) {
                        obj = this.get_node(obj);
                        return obj && obj.state.loaded;
                    },
                    is_loading: function (obj) {
                        obj = this.get_node(obj);
                        return obj && obj.state && obj.state.loading;
                    },
                    is_open: function (obj) {
                        obj = this.get_node(obj);
                        return obj && obj.state.opened;
                    },
                    is_closed: function (obj) {
                        obj = this.get_node(obj);
                        return obj && this.is_parent(obj) && !obj.state.opened;
                    },
                    is_leaf: function (obj) {
                        return !this.is_parent(obj);
                    },
                    load_node: function (obj, callback) {
                        var k, l, i, j, c;
                        if ($.isArray(obj)) {
                            this._load_nodes(obj.slice(), callback);
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj) {
                            if (callback) {
                                callback.call(this, obj, false);
                            }
                            return false;
                        }
                        if (obj.state.loaded) {
                            obj.state.loaded = false;
                            for (i = 0, j = obj.parents.length; i < j; i++) {
                                this._model.data[obj.parents[i]].children_d = $.vakata.array_filter(this._model.data[obj.parents[i]].children_d, function (v) {
                                    return $.inArray(v, obj.children_d) === -1;
                                });
                            }
                            for (k = 0, l = obj.children_d.length; k < l; k++) {
                                if (this._model.data[obj.children_d[k]].state.selected) {
                                    c = true;
                                }
                                delete this._model.data[obj.children_d[k]];
                            }
                            if (c) {
                                this._data.core.selected = $.vakata.array_filter(this._data.core.selected, function (v) {
                                    return $.inArray(v, obj.children_d) === -1;
                                });
                            }
                            obj.children = [];
                            obj.children_d = [];
                            if (c) {
                                this.trigger('changed', {
                                    'action': 'load_node',
                                    'node': obj,
                                    'selected': this._data.core.selected
                                });
                            }
                        }
                        obj.state.failed = false;
                        obj.state.loading = true;
                        this.get_node(obj, true).addClass('jstree-loading').attr('aria-busy', true);
                        this._load_node(obj, $.proxy(function (status) {
                            obj = this._model.data[obj.id];
                            obj.state.loading = false;
                            obj.state.loaded = status;
                            obj.state.failed = !obj.state.loaded;
                            var dom = this.get_node(obj, true), i = 0, j = 0, m = this._model.data, has_children = false;
                            for (i = 0, j = obj.children.length; i < j; i++) {
                                if (m[obj.children[i]] && !m[obj.children[i]].state.hidden) {
                                    has_children = true;
                                    break;
                                }
                            }
                            if (obj.state.loaded && dom && dom.length) {
                                dom.removeClass('jstree-closed jstree-open jstree-leaf');
                                if (!has_children) {
                                    dom.addClass('jstree-leaf');
                                } else {
                                    if (obj.id !== '#') {
                                        dom.addClass(obj.state.opened ? 'jstree-open' : 'jstree-closed');
                                    }
                                }
                            }
                            dom.removeClass('jstree-loading').attr('aria-busy', false);
                            this.trigger('load_node', {
                                'node': obj,
                                'status': status
                            });
                            if (callback) {
                                callback.call(this, obj, status);
                            }
                        }, this));
                        return true;
                    },
                    _load_nodes: function (nodes, callback, is_callback, force_reload) {
                        var r = true, c = function () {
                                this._load_nodes(nodes, callback, true);
                            }, m = this._model.data, i, j, tmp = [];
                        for (i = 0, j = nodes.length; i < j; i++) {
                            if (m[nodes[i]] && (!m[nodes[i]].state.loaded && !m[nodes[i]].state.failed || !is_callback && force_reload)) {
                                if (!this.is_loading(nodes[i])) {
                                    this.load_node(nodes[i], c);
                                }
                                r = false;
                            }
                        }
                        if (r) {
                            for (i = 0, j = nodes.length; i < j; i++) {
                                if (m[nodes[i]] && m[nodes[i]].state.loaded) {
                                    tmp.push(nodes[i]);
                                }
                            }
                            if (callback && !callback.done) {
                                callback.call(this, tmp);
                                callback.done = true;
                            }
                        }
                    },
                    load_all: function (obj, callback) {
                        if (!obj) {
                            obj = $.jstree.root;
                        }
                        obj = this.get_node(obj);
                        if (!obj) {
                            return false;
                        }
                        var to_load = [], m = this._model.data, c = m[obj.id].children_d, i, j;
                        if (obj.state && !obj.state.loaded) {
                            to_load.push(obj.id);
                        }
                        for (i = 0, j = c.length; i < j; i++) {
                            if (m[c[i]] && m[c[i]].state && !m[c[i]].state.loaded) {
                                to_load.push(c[i]);
                            }
                        }
                        if (to_load.length) {
                            this._load_nodes(to_load, function () {
                                this.load_all(obj, callback);
                            });
                        } else {
                            if (callback) {
                                callback.call(this, obj);
                            }
                            this.trigger('load_all', { 'node': obj });
                        }
                    },
                    _load_node: function (obj, callback) {
                        var s = this.settings.core.data, t;
                        var notTextOrCommentNode = function notTextOrCommentNode() {
                            return this.nodeType !== 3 && this.nodeType !== 8;
                        };
                        if (!s) {
                            if (obj.id === $.jstree.root) {
                                return this._append_html_data(obj, this._data.core.original_container_html.clone(true), function (status) {
                                    callback.call(this, status);
                                });
                            } else {
                                return callback.call(this, false);
                            }
                        }
                        if ($.isFunction(s)) {
                            return s.call(this, obj, $.proxy(function (d) {
                                if (d === false) {
                                    callback.call(this, false);
                                } else {
                                    this[typeof d === 'string' ? '_append_html_data' : '_append_json_data'](obj, typeof d === 'string' ? $($.parseHTML(d)).filter(notTextOrCommentNode) : d, function (status) {
                                        callback.call(this, status);
                                    });
                                }
                            }, this));
                        }
                        if (typeof s === 'object') {
                            if (s.url) {
                                s = $.extend(true, {}, s);
                                if ($.isFunction(s.url)) {
                                    s.url = s.url.call(this, obj);
                                }
                                if ($.isFunction(s.data)) {
                                    s.data = s.data.call(this, obj);
                                }
                                return $.ajax(s).done($.proxy(function (d, t, x) {
                                    var type = x.getResponseHeader('Content-Type');
                                    if (type && type.indexOf('json') !== -1 || typeof d === 'object') {
                                        return this._append_json_data(obj, d, function (status) {
                                            callback.call(this, status);
                                        });
                                    }
                                    if (type && type.indexOf('html') !== -1 || typeof d === 'string') {
                                        return this._append_html_data(obj, $($.parseHTML(d)).filter(notTextOrCommentNode), function (status) {
                                            callback.call(this, status);
                                        });
                                    }
                                    this._data.core.last_error = {
                                        'error': 'ajax',
                                        'plugin': 'core',
                                        'id': 'core_04',
                                        'reason': 'Could not load node',
                                        'data': JSON.stringify({
                                            'id': obj.id,
                                            'xhr': x
                                        })
                                    };
                                    this.settings.core.error.call(this, this._data.core.last_error);
                                    return callback.call(this, false);
                                }, this)).fail($.proxy(function (f) {
                                    callback.call(this, false);
                                    this._data.core.last_error = {
                                        'error': 'ajax',
                                        'plugin': 'core',
                                        'id': 'core_04',
                                        'reason': 'Could not load node',
                                        'data': JSON.stringify({
                                            'id': obj.id,
                                            'xhr': f
                                        })
                                    };
                                    this.settings.core.error.call(this, this._data.core.last_error);
                                }, this));
                            }
                            t = $.isArray(s) || $.isPlainObject(s) ? JSON.parse(JSON.stringify(s)) : s;
                            if (obj.id === $.jstree.root) {
                                return this._append_json_data(obj, t, function (status) {
                                    callback.call(this, status);
                                });
                            } else {
                                this._data.core.last_error = {
                                    'error': 'nodata',
                                    'plugin': 'core',
                                    'id': 'core_05',
                                    'reason': 'Could not load node',
                                    'data': JSON.stringify({ 'id': obj.id })
                                };
                                this.settings.core.error.call(this, this._data.core.last_error);
                                return callback.call(this, false);
                            }
                        }
                        if (typeof s === 'string') {
                            if (obj.id === $.jstree.root) {
                                return this._append_html_data(obj, $($.parseHTML(s)).filter(notTextOrCommentNode), function (status) {
                                    callback.call(this, status);
                                });
                            } else {
                                this._data.core.last_error = {
                                    'error': 'nodata',
                                    'plugin': 'core',
                                    'id': 'core_06',
                                    'reason': 'Could not load node',
                                    'data': JSON.stringify({ 'id': obj.id })
                                };
                                this.settings.core.error.call(this, this._data.core.last_error);
                                return callback.call(this, false);
                            }
                        }
                        return callback.call(this, false);
                    },
                    _node_changed: function (obj) {
                        obj = this.get_node(obj);
                        if (obj) {
                            this._model.changed.push(obj.id);
                        }
                    },
                    _append_html_data: function (dom, data, cb) {
                        dom = this.get_node(dom);
                        dom.children = [];
                        dom.children_d = [];
                        var dat = data.is('ul') ? data.children() : data, par = dom.id, chd = [], dpc = [], m = this._model.data, p = m[par], s = this._data.core.selected.length, tmp, i, j;
                        dat.each($.proxy(function (i, v) {
                            tmp = this._parse_model_from_html($(v), par, p.parents.concat());
                            if (tmp) {
                                chd.push(tmp);
                                dpc.push(tmp);
                                if (m[tmp].children_d.length) {
                                    dpc = dpc.concat(m[tmp].children_d);
                                }
                            }
                        }, this));
                        p.children = chd;
                        p.children_d = dpc;
                        for (i = 0, j = p.parents.length; i < j; i++) {
                            m[p.parents[i]].children_d = m[p.parents[i]].children_d.concat(dpc);
                        }
                        this.trigger('model', {
                            'nodes': dpc,
                            'parent': par
                        });
                        if (par !== $.jstree.root) {
                            this._node_changed(par);
                            this.redraw();
                        } else {
                            this.get_container_ul().children('.jstree-initial-node').remove();
                            this.redraw(true);
                        }
                        if (this._data.core.selected.length !== s) {
                            this.trigger('changed', {
                                'action': 'model',
                                'selected': this._data.core.selected
                            });
                        }
                        cb.call(this, true);
                    },
                    _append_json_data: function (dom, data, cb, force_processing) {
                        if (this.element === null) {
                            return;
                        }
                        dom = this.get_node(dom);
                        dom.children = [];
                        dom.children_d = [];
                        if (data.d) {
                            data = data.d;
                            if (typeof data === 'string') {
                                data = JSON.parse(data);
                            }
                        }
                        if (!$.isArray(data)) {
                            data = [data];
                        }
                        var w = null, args = {
                                'df': this._model.default_state,
                                'dat': data,
                                'par': dom.id,
                                'm': this._model.data,
                                't_id': this._id,
                                't_cnt': this._cnt,
                                'sel': this._data.core.selected
                            }, func = function (data, undefined) {
                                if (data.data) {
                                    data = data.data;
                                }
                                var dat = data.dat, par = data.par, chd = [], dpc = [], add = [], df = data.df, t_id = data.t_id, t_cnt = data.t_cnt, m = data.m, p = m[par], sel = data.sel, tmp, i, j, rslt, parse_flat = function (d, p, ps) {
                                        if (!ps) {
                                            ps = [];
                                        } else {
                                            ps = ps.concat();
                                        }
                                        if (p) {
                                            ps.unshift(p);
                                        }
                                        var tid = d.id.toString(), i, j, c, e, tmp = {
                                                id: tid,
                                                text: d.text || '',
                                                icon: d.icon !== undefined ? d.icon : true,
                                                parent: p,
                                                parents: ps,
                                                children: d.children || [],
                                                children_d: d.children_d || [],
                                                data: d.data,
                                                state: {},
                                                li_attr: { id: false },
                                                a_attr: { href: '#' },
                                                original: false
                                            };
                                        for (i in df) {
                                            if (df.hasOwnProperty(i)) {
                                                tmp.state[i] = df[i];
                                            }
                                        }
                                        if (d && d.data && d.data.jstree && d.data.jstree.icon) {
                                            tmp.icon = d.data.jstree.icon;
                                        }
                                        if (tmp.icon === undefined || tmp.icon === null || tmp.icon === '') {
                                            tmp.icon = true;
                                        }
                                        if (d && d.data) {
                                            tmp.data = d.data;
                                            if (d.data.jstree) {
                                                for (i in d.data.jstree) {
                                                    if (d.data.jstree.hasOwnProperty(i)) {
                                                        tmp.state[i] = d.data.jstree[i];
                                                    }
                                                }
                                            }
                                        }
                                        if (d && typeof d.state === 'object') {
                                            for (i in d.state) {
                                                if (d.state.hasOwnProperty(i)) {
                                                    tmp.state[i] = d.state[i];
                                                }
                                            }
                                        }
                                        if (d && typeof d.li_attr === 'object') {
                                            for (i in d.li_attr) {
                                                if (d.li_attr.hasOwnProperty(i)) {
                                                    tmp.li_attr[i] = d.li_attr[i];
                                                }
                                            }
                                        }
                                        if (!tmp.li_attr.id) {
                                            tmp.li_attr.id = tid;
                                        }
                                        if (d && typeof d.a_attr === 'object') {
                                            for (i in d.a_attr) {
                                                if (d.a_attr.hasOwnProperty(i)) {
                                                    tmp.a_attr[i] = d.a_attr[i];
                                                }
                                            }
                                        }
                                        if (d && d.children && d.children === true) {
                                            tmp.state.loaded = false;
                                            tmp.children = [];
                                            tmp.children_d = [];
                                        }
                                        m[tmp.id] = tmp;
                                        for (i = 0, j = tmp.children.length; i < j; i++) {
                                            c = parse_flat(m[tmp.children[i]], tmp.id, ps);
                                            e = m[c];
                                            tmp.children_d.push(c);
                                            if (e.children_d.length) {
                                                tmp.children_d = tmp.children_d.concat(e.children_d);
                                            }
                                        }
                                        delete d.data;
                                        delete d.children;
                                        m[tmp.id].original = d;
                                        if (tmp.state.selected) {
                                            add.push(tmp.id);
                                        }
                                        return tmp.id;
                                    }, parse_nest = function (d, p, ps) {
                                        if (!ps) {
                                            ps = [];
                                        } else {
                                            ps = ps.concat();
                                        }
                                        if (p) {
                                            ps.unshift(p);
                                        }
                                        var tid = false, i, j, c, e, tmp;
                                        do {
                                            tid = 'j' + t_id + '_' + ++t_cnt;
                                        } while (m[tid]);
                                        tmp = {
                                            id: false,
                                            text: typeof d === 'string' ? d : '',
                                            icon: typeof d === 'object' && d.icon !== undefined ? d.icon : true,
                                            parent: p,
                                            parents: ps,
                                            children: [],
                                            children_d: [],
                                            data: null,
                                            state: {},
                                            li_attr: { id: false },
                                            a_attr: { href: '#' },
                                            original: false
                                        };
                                        for (i in df) {
                                            if (df.hasOwnProperty(i)) {
                                                tmp.state[i] = df[i];
                                            }
                                        }
                                        if (d && d.id) {
                                            tmp.id = d.id.toString();
                                        }
                                        if (d && d.text) {
                                            tmp.text = d.text;
                                        }
                                        if (d && d.data && d.data.jstree && d.data.jstree.icon) {
                                            tmp.icon = d.data.jstree.icon;
                                        }
                                        if (tmp.icon === undefined || tmp.icon === null || tmp.icon === '') {
                                            tmp.icon = true;
                                        }
                                        if (d && d.data) {
                                            tmp.data = d.data;
                                            if (d.data.jstree) {
                                                for (i in d.data.jstree) {
                                                    if (d.data.jstree.hasOwnProperty(i)) {
                                                        tmp.state[i] = d.data.jstree[i];
                                                    }
                                                }
                                            }
                                        }
                                        if (d && typeof d.state === 'object') {
                                            for (i in d.state) {
                                                if (d.state.hasOwnProperty(i)) {
                                                    tmp.state[i] = d.state[i];
                                                }
                                            }
                                        }
                                        if (d && typeof d.li_attr === 'object') {
                                            for (i in d.li_attr) {
                                                if (d.li_attr.hasOwnProperty(i)) {
                                                    tmp.li_attr[i] = d.li_attr[i];
                                                }
                                            }
                                        }
                                        if (tmp.li_attr.id && !tmp.id) {
                                            tmp.id = tmp.li_attr.id.toString();
                                        }
                                        if (!tmp.id) {
                                            tmp.id = tid;
                                        }
                                        if (!tmp.li_attr.id) {
                                            tmp.li_attr.id = tmp.id;
                                        }
                                        if (d && typeof d.a_attr === 'object') {
                                            for (i in d.a_attr) {
                                                if (d.a_attr.hasOwnProperty(i)) {
                                                    tmp.a_attr[i] = d.a_attr[i];
                                                }
                                            }
                                        }
                                        if (d && d.children && d.children.length) {
                                            for (i = 0, j = d.children.length; i < j; i++) {
                                                c = parse_nest(d.children[i], tmp.id, ps);
                                                e = m[c];
                                                tmp.children.push(c);
                                                if (e.children_d.length) {
                                                    tmp.children_d = tmp.children_d.concat(e.children_d);
                                                }
                                            }
                                            tmp.children_d = tmp.children_d.concat(tmp.children);
                                        }
                                        if (d && d.children && d.children === true) {
                                            tmp.state.loaded = false;
                                            tmp.children = [];
                                            tmp.children_d = [];
                                        }
                                        delete d.data;
                                        delete d.children;
                                        tmp.original = d;
                                        m[tmp.id] = tmp;
                                        if (tmp.state.selected) {
                                            add.push(tmp.id);
                                        }
                                        return tmp.id;
                                    };
                                if (dat.length && dat[0].id !== undefined && dat[0].parent !== undefined) {
                                    for (i = 0, j = dat.length; i < j; i++) {
                                        if (!dat[i].children) {
                                            dat[i].children = [];
                                        }
                                        m[dat[i].id.toString()] = dat[i];
                                    }
                                    for (i = 0, j = dat.length; i < j; i++) {
                                        m[dat[i].parent.toString()].children.push(dat[i].id.toString());
                                        p.children_d.push(dat[i].id.toString());
                                    }
                                    for (i = 0, j = p.children.length; i < j; i++) {
                                        tmp = parse_flat(m[p.children[i]], par, p.parents.concat());
                                        dpc.push(tmp);
                                        if (m[tmp].children_d.length) {
                                            dpc = dpc.concat(m[tmp].children_d);
                                        }
                                    }
                                    for (i = 0, j = p.parents.length; i < j; i++) {
                                        m[p.parents[i]].children_d = m[p.parents[i]].children_d.concat(dpc);
                                    }
                                    rslt = {
                                        'cnt': t_cnt,
                                        'mod': m,
                                        'sel': sel,
                                        'par': par,
                                        'dpc': dpc,
                                        'add': add
                                    };
                                } else {
                                    for (i = 0, j = dat.length; i < j; i++) {
                                        tmp = parse_nest(dat[i], par, p.parents.concat());
                                        if (tmp) {
                                            chd.push(tmp);
                                            dpc.push(tmp);
                                            if (m[tmp].children_d.length) {
                                                dpc = dpc.concat(m[tmp].children_d);
                                            }
                                        }
                                    }
                                    p.children = chd;
                                    p.children_d = dpc;
                                    for (i = 0, j = p.parents.length; i < j; i++) {
                                        m[p.parents[i]].children_d = m[p.parents[i]].children_d.concat(dpc);
                                    }
                                    rslt = {
                                        'cnt': t_cnt,
                                        'mod': m,
                                        'sel': sel,
                                        'par': par,
                                        'dpc': dpc,
                                        'add': add
                                    };
                                }
                                if (typeof window === 'undefined' || typeof window.document === 'undefined') {
                                    postMessage(rslt);
                                } else {
                                    return rslt;
                                }
                            }, rslt = function (rslt, worker) {
                                if (this.element === null) {
                                    return;
                                }
                                this._cnt = rslt.cnt;
                                var i, m = this._model.data;
                                for (i in m) {
                                    if (m.hasOwnProperty(i) && m[i].state && m[i].state.loading && rslt.mod[i]) {
                                        rslt.mod[i].state.loading = true;
                                    }
                                }
                                this._model.data = rslt.mod;
                                if (worker) {
                                    var j, a = rslt.add, r = rslt.sel, s = this._data.core.selected.slice();
                                    m = this._model.data;
                                    if (r.length !== s.length || $.vakata.array_unique(r.concat(s)).length !== r.length) {
                                        for (i = 0, j = r.length; i < j; i++) {
                                            if ($.inArray(r[i], a) === -1 && $.inArray(r[i], s) === -1) {
                                                m[r[i]].state.selected = false;
                                            }
                                        }
                                        for (i = 0, j = s.length; i < j; i++) {
                                            if ($.inArray(s[i], r) === -1) {
                                                m[s[i]].state.selected = true;
                                            }
                                        }
                                    }
                                }
                                if (rslt.add.length) {
                                    this._data.core.selected = this._data.core.selected.concat(rslt.add);
                                }
                                this.trigger('model', {
                                    'nodes': rslt.dpc,
                                    'parent': rslt.par
                                });
                                if (rslt.par !== $.jstree.root) {
                                    this._node_changed(rslt.par);
                                    this.redraw();
                                } else {
                                    this.redraw(true);
                                }
                                if (rslt.add.length) {
                                    this.trigger('changed', {
                                        'action': 'model',
                                        'selected': this._data.core.selected
                                    });
                                }
                                cb.call(this, true);
                            };
                        if (this.settings.core.worker && window.Blob && window.URL && window.Worker) {
                            try {
                                if (this._wrk === null) {
                                    this._wrk = window.URL.createObjectURL(new window.Blob(['self.onmessage = ' + func.toString()], { type: 'text/javascript' }));
                                }
                                if (!this._data.core.working || force_processing) {
                                    this._data.core.working = true;
                                    w = new window.Worker(this._wrk);
                                    w.onmessage = $.proxy(function (e) {
                                        rslt.call(this, e.data, true);
                                        try {
                                            w.terminate();
                                            w = null;
                                        } catch (ignore) {
                                        }
                                        if (this._data.core.worker_queue.length) {
                                            this._append_json_data.apply(this, this._data.core.worker_queue.shift());
                                        } else {
                                            this._data.core.working = false;
                                        }
                                    }, this);
                                    if (!args.par) {
                                        if (this._data.core.worker_queue.length) {
                                            this._append_json_data.apply(this, this._data.core.worker_queue.shift());
                                        } else {
                                            this._data.core.working = false;
                                        }
                                    } else {
                                        w.postMessage(args);
                                    }
                                } else {
                                    this._data.core.worker_queue.push([
                                        dom,
                                        data,
                                        cb,
                                        true
                                    ]);
                                }
                            } catch (e) {
                                rslt.call(this, func(args), false);
                                if (this._data.core.worker_queue.length) {
                                    this._append_json_data.apply(this, this._data.core.worker_queue.shift());
                                } else {
                                    this._data.core.working = false;
                                }
                            }
                        } else {
                            rslt.call(this, func(args), false);
                        }
                    },
                    _parse_model_from_html: function (d, p, ps) {
                        if (!ps) {
                            ps = [];
                        } else {
                            ps = [].concat(ps);
                        }
                        if (p) {
                            ps.unshift(p);
                        }
                        var c, e, m = this._model.data, data = {
                                id: false,
                                text: false,
                                icon: true,
                                parent: p,
                                parents: ps,
                                children: [],
                                children_d: [],
                                data: null,
                                state: {},
                                li_attr: { id: false },
                                a_attr: { href: '#' },
                                original: false
                            }, i, tmp, tid;
                        for (i in this._model.default_state) {
                            if (this._model.default_state.hasOwnProperty(i)) {
                                data.state[i] = this._model.default_state[i];
                            }
                        }
                        tmp = $.vakata.attributes(d, true);
                        $.each(tmp, function (i, v) {
                            v = $.trim(v);
                            if (!v.length) {
                                return true;
                            }
                            data.li_attr[i] = v;
                            if (i === 'id') {
                                data.id = v.toString();
                            }
                        });
                        tmp = d.children('a').first();
                        if (tmp.length) {
                            tmp = $.vakata.attributes(tmp, true);
                            $.each(tmp, function (i, v) {
                                v = $.trim(v);
                                if (v.length) {
                                    data.a_attr[i] = v;
                                }
                            });
                        }
                        tmp = d.children('a').first().length ? d.children('a').first().clone() : d.clone();
                        tmp.children('ins, i, ul').remove();
                        tmp = tmp.html();
                        tmp = $('<div />').html(tmp);
                        data.text = this.settings.core.force_text ? tmp.text() : tmp.html();
                        tmp = d.data();
                        data.data = tmp ? $.extend(true, {}, tmp) : null;
                        data.state.opened = d.hasClass('jstree-open');
                        data.state.selected = d.children('a').hasClass('jstree-clicked');
                        data.state.disabled = d.children('a').hasClass('jstree-disabled');
                        if (data.data && data.data.jstree) {
                            for (i in data.data.jstree) {
                                if (data.data.jstree.hasOwnProperty(i)) {
                                    data.state[i] = data.data.jstree[i];
                                }
                            }
                        }
                        tmp = d.children('a').children('.jstree-themeicon');
                        if (tmp.length) {
                            data.icon = tmp.hasClass('jstree-themeicon-hidden') ? false : tmp.attr('rel');
                        }
                        if (data.state.icon !== undefined) {
                            data.icon = data.state.icon;
                        }
                        if (data.icon === undefined || data.icon === null || data.icon === '') {
                            data.icon = true;
                        }
                        tmp = d.children('ul').children('li');
                        do {
                            tid = 'j' + this._id + '_' + ++this._cnt;
                        } while (m[tid]);
                        data.id = data.li_attr.id ? data.li_attr.id.toString() : tid;
                        if (tmp.length) {
                            tmp.each($.proxy(function (i, v) {
                                c = this._parse_model_from_html($(v), data.id, ps);
                                e = this._model.data[c];
                                data.children.push(c);
                                if (e.children_d.length) {
                                    data.children_d = data.children_d.concat(e.children_d);
                                }
                            }, this));
                            data.children_d = data.children_d.concat(data.children);
                        } else {
                            if (d.hasClass('jstree-closed')) {
                                data.state.loaded = false;
                            }
                        }
                        if (data.li_attr['class']) {
                            data.li_attr['class'] = data.li_attr['class'].replace('jstree-closed', '').replace('jstree-open', '');
                        }
                        if (data.a_attr['class']) {
                            data.a_attr['class'] = data.a_attr['class'].replace('jstree-clicked', '').replace('jstree-disabled', '');
                        }
                        m[data.id] = data;
                        if (data.state.selected) {
                            this._data.core.selected.push(data.id);
                        }
                        return data.id;
                    },
                    _parse_model_from_flat_json: function (d, p, ps) {
                        if (!ps) {
                            ps = [];
                        } else {
                            ps = ps.concat();
                        }
                        if (p) {
                            ps.unshift(p);
                        }
                        var tid = d.id.toString(), m = this._model.data, df = this._model.default_state, i, j, c, e, tmp = {
                                id: tid,
                                text: d.text || '',
                                icon: d.icon !== undefined ? d.icon : true,
                                parent: p,
                                parents: ps,
                                children: d.children || [],
                                children_d: d.children_d || [],
                                data: d.data,
                                state: {},
                                li_attr: { id: false },
                                a_attr: { href: '#' },
                                original: false
                            };
                        for (i in df) {
                            if (df.hasOwnProperty(i)) {
                                tmp.state[i] = df[i];
                            }
                        }
                        if (d && d.data && d.data.jstree && d.data.jstree.icon) {
                            tmp.icon = d.data.jstree.icon;
                        }
                        if (tmp.icon === undefined || tmp.icon === null || tmp.icon === '') {
                            tmp.icon = true;
                        }
                        if (d && d.data) {
                            tmp.data = d.data;
                            if (d.data.jstree) {
                                for (i in d.data.jstree) {
                                    if (d.data.jstree.hasOwnProperty(i)) {
                                        tmp.state[i] = d.data.jstree[i];
                                    }
                                }
                            }
                        }
                        if (d && typeof d.state === 'object') {
                            for (i in d.state) {
                                if (d.state.hasOwnProperty(i)) {
                                    tmp.state[i] = d.state[i];
                                }
                            }
                        }
                        if (d && typeof d.li_attr === 'object') {
                            for (i in d.li_attr) {
                                if (d.li_attr.hasOwnProperty(i)) {
                                    tmp.li_attr[i] = d.li_attr[i];
                                }
                            }
                        }
                        if (!tmp.li_attr.id) {
                            tmp.li_attr.id = tid;
                        }
                        if (d && typeof d.a_attr === 'object') {
                            for (i in d.a_attr) {
                                if (d.a_attr.hasOwnProperty(i)) {
                                    tmp.a_attr[i] = d.a_attr[i];
                                }
                            }
                        }
                        if (d && d.children && d.children === true) {
                            tmp.state.loaded = false;
                            tmp.children = [];
                            tmp.children_d = [];
                        }
                        m[tmp.id] = tmp;
                        for (i = 0, j = tmp.children.length; i < j; i++) {
                            c = this._parse_model_from_flat_json(m[tmp.children[i]], tmp.id, ps);
                            e = m[c];
                            tmp.children_d.push(c);
                            if (e.children_d.length) {
                                tmp.children_d = tmp.children_d.concat(e.children_d);
                            }
                        }
                        delete d.data;
                        delete d.children;
                        m[tmp.id].original = d;
                        if (tmp.state.selected) {
                            this._data.core.selected.push(tmp.id);
                        }
                        return tmp.id;
                    },
                    _parse_model_from_json: function (d, p, ps) {
                        if (!ps) {
                            ps = [];
                        } else {
                            ps = ps.concat();
                        }
                        if (p) {
                            ps.unshift(p);
                        }
                        var tid = false, i, j, c, e, m = this._model.data, df = this._model.default_state, tmp;
                        do {
                            tid = 'j' + this._id + '_' + ++this._cnt;
                        } while (m[tid]);
                        tmp = {
                            id: false,
                            text: typeof d === 'string' ? d : '',
                            icon: typeof d === 'object' && d.icon !== undefined ? d.icon : true,
                            parent: p,
                            parents: ps,
                            children: [],
                            children_d: [],
                            data: null,
                            state: {},
                            li_attr: { id: false },
                            a_attr: { href: '#' },
                            original: false
                        };
                        for (i in df) {
                            if (df.hasOwnProperty(i)) {
                                tmp.state[i] = df[i];
                            }
                        }
                        if (d && d.id) {
                            tmp.id = d.id.toString();
                        }
                        if (d && d.text) {
                            tmp.text = d.text;
                        }
                        if (d && d.data && d.data.jstree && d.data.jstree.icon) {
                            tmp.icon = d.data.jstree.icon;
                        }
                        if (tmp.icon === undefined || tmp.icon === null || tmp.icon === '') {
                            tmp.icon = true;
                        }
                        if (d && d.data) {
                            tmp.data = d.data;
                            if (d.data.jstree) {
                                for (i in d.data.jstree) {
                                    if (d.data.jstree.hasOwnProperty(i)) {
                                        tmp.state[i] = d.data.jstree[i];
                                    }
                                }
                            }
                        }
                        if (d && typeof d.state === 'object') {
                            for (i in d.state) {
                                if (d.state.hasOwnProperty(i)) {
                                    tmp.state[i] = d.state[i];
                                }
                            }
                        }
                        if (d && typeof d.li_attr === 'object') {
                            for (i in d.li_attr) {
                                if (d.li_attr.hasOwnProperty(i)) {
                                    tmp.li_attr[i] = d.li_attr[i];
                                }
                            }
                        }
                        if (tmp.li_attr.id && !tmp.id) {
                            tmp.id = tmp.li_attr.id.toString();
                        }
                        if (!tmp.id) {
                            tmp.id = tid;
                        }
                        if (!tmp.li_attr.id) {
                            tmp.li_attr.id = tmp.id;
                        }
                        if (d && typeof d.a_attr === 'object') {
                            for (i in d.a_attr) {
                                if (d.a_attr.hasOwnProperty(i)) {
                                    tmp.a_attr[i] = d.a_attr[i];
                                }
                            }
                        }
                        if (d && d.children && d.children.length) {
                            for (i = 0, j = d.children.length; i < j; i++) {
                                c = this._parse_model_from_json(d.children[i], tmp.id, ps);
                                e = m[c];
                                tmp.children.push(c);
                                if (e.children_d.length) {
                                    tmp.children_d = tmp.children_d.concat(e.children_d);
                                }
                            }
                            tmp.children_d = tmp.children_d.concat(tmp.children);
                        }
                        if (d && d.children && d.children === true) {
                            tmp.state.loaded = false;
                            tmp.children = [];
                            tmp.children_d = [];
                        }
                        delete d.data;
                        delete d.children;
                        tmp.original = d;
                        m[tmp.id] = tmp;
                        if (tmp.state.selected) {
                            this._data.core.selected.push(tmp.id);
                        }
                        return tmp.id;
                    },
                    _redraw: function () {
                        var nodes = this._model.force_full_redraw ? this._model.data[$.jstree.root].children.concat([]) : this._model.changed.concat([]), f = document.createElement('UL'), tmp, i, j, fe = this._data.core.focused;
                        for (i = 0, j = nodes.length; i < j; i++) {
                            tmp = this.redraw_node(nodes[i], true, this._model.force_full_redraw);
                            if (tmp && this._model.force_full_redraw) {
                                f.appendChild(tmp);
                            }
                        }
                        if (this._model.force_full_redraw) {
                            f.className = this.get_container_ul()[0].className;
                            f.setAttribute('role', 'group');
                            this.element.empty().append(f);
                        }
                        if (fe !== null) {
                            tmp = this.get_node(fe, true);
                            if (tmp && tmp.length && tmp.children('.jstree-anchor')[0] !== document.activeElement) {
                                tmp.children('.jstree-anchor').focus();
                            } else {
                                this._data.core.focused = null;
                            }
                        }
                        this._model.force_full_redraw = false;
                        this._model.changed = [];
                        this.trigger('redraw', { 'nodes': nodes });
                    },
                    redraw: function (full) {
                        if (full) {
                            this._model.force_full_redraw = true;
                        }
                        this._redraw();
                    },
                    draw_children: function (node) {
                        var obj = this.get_node(node), i = false, j = false, k = false, d = document;
                        if (!obj) {
                            return false;
                        }
                        if (obj.id === $.jstree.root) {
                            return this.redraw(true);
                        }
                        node = this.get_node(node, true);
                        if (!node || !node.length) {
                            return false;
                        }
                        node.children('.jstree-children').remove();
                        node = node[0];
                        if (obj.children.length && obj.state.loaded) {
                            k = d.createElement('UL');
                            k.setAttribute('role', 'group');
                            k.className = 'jstree-children';
                            for (i = 0, j = obj.children.length; i < j; i++) {
                                k.appendChild(this.redraw_node(obj.children[i], true, true));
                            }
                            node.appendChild(k);
                        }
                    },
                    redraw_node: function (node, deep, is_callback, force_render) {
                        var obj = this.get_node(node), par = false, ind = false, old = false, i = false, j = false, k = false, c = '', d = document, m = this._model.data, f = false, s = false, tmp = null, t = 0, l = 0, has_children = false, last_sibling = false;
                        if (!obj) {
                            return false;
                        }
                        if (obj.id === $.jstree.root) {
                            return this.redraw(true);
                        }
                        deep = deep || obj.children.length === 0;
                        node = !document.querySelector ? document.getElementById(obj.id) : this.element[0].querySelector('#' + ('0123456789'.indexOf(obj.id[0]) !== -1 ? '\\3' + obj.id[0] + ' ' + obj.id.substr(1).replace($.jstree.idregex, '\\$&') : obj.id.replace($.jstree.idregex, '\\$&')));
                        if (!node) {
                            deep = true;
                            if (!is_callback) {
                                par = obj.parent !== $.jstree.root ? $('#' + obj.parent.replace($.jstree.idregex, '\\$&'), this.element)[0] : null;
                                if (par !== null && (!par || !m[obj.parent].state.opened)) {
                                    return false;
                                }
                                ind = $.inArray(obj.id, par === null ? m[$.jstree.root].children : m[obj.parent].children);
                            }
                        } else {
                            node = $(node);
                            if (!is_callback) {
                                par = node.parent().parent()[0];
                                if (par === this.element[0]) {
                                    par = null;
                                }
                                ind = node.index();
                            }
                            if (!deep && obj.children.length && !node.children('.jstree-children').length) {
                                deep = true;
                            }
                            if (!deep) {
                                old = node.children('.jstree-children')[0];
                            }
                            f = node.children('.jstree-anchor')[0] === document.activeElement;
                            node.remove();
                        }
                        node = this._data.core.node.cloneNode(true);
                        c = 'jstree-node ';
                        for (i in obj.li_attr) {
                            if (obj.li_attr.hasOwnProperty(i)) {
                                if (i === 'id') {
                                    continue;
                                }
                                if (i !== 'class') {
                                    node.setAttribute(i, obj.li_attr[i]);
                                } else {
                                    c += obj.li_attr[i];
                                }
                            }
                        }
                        if (!obj.a_attr.id) {
                            obj.a_attr.id = obj.id + '_anchor';
                        }
                        node.setAttribute('aria-selected', !!obj.state.selected);
                        node.setAttribute('aria-level', obj.parents.length);
                        node.setAttribute('aria-labelledby', obj.a_attr.id);
                        if (obj.state.disabled) {
                            node.setAttribute('aria-disabled', true);
                        }
                        for (i = 0, j = obj.children.length; i < j; i++) {
                            if (!m[obj.children[i]].state.hidden) {
                                has_children = true;
                                break;
                            }
                        }
                        if (obj.parent !== null && m[obj.parent] && !obj.state.hidden) {
                            i = $.inArray(obj.id, m[obj.parent].children);
                            last_sibling = obj.id;
                            if (i !== -1) {
                                i++;
                                for (j = m[obj.parent].children.length; i < j; i++) {
                                    if (!m[m[obj.parent].children[i]].state.hidden) {
                                        last_sibling = m[obj.parent].children[i];
                                    }
                                    if (last_sibling !== obj.id) {
                                        break;
                                    }
                                }
                            }
                        }
                        if (obj.state.hidden) {
                            c += ' jstree-hidden';
                        }
                        if (obj.state.loaded && !has_children) {
                            c += ' jstree-leaf';
                        } else {
                            c += obj.state.opened && obj.state.loaded ? ' jstree-open' : ' jstree-closed';
                            node.setAttribute('aria-expanded', obj.state.opened && obj.state.loaded);
                        }
                        if (last_sibling === obj.id) {
                            c += ' jstree-last';
                        }
                        node.id = obj.id;
                        node.className = c;
                        c = (obj.state.selected ? ' jstree-clicked' : '') + (obj.state.disabled ? ' jstree-disabled' : '');
                        for (j in obj.a_attr) {
                            if (obj.a_attr.hasOwnProperty(j)) {
                                if (j === 'href' && obj.a_attr[j] === '#') {
                                    continue;
                                }
                                if (j !== 'class') {
                                    node.childNodes[1].setAttribute(j, obj.a_attr[j]);
                                } else {
                                    c += ' ' + obj.a_attr[j];
                                }
                            }
                        }
                        if (c.length) {
                            node.childNodes[1].className = 'jstree-anchor ' + c;
                        }
                        if (obj.icon && obj.icon !== true || obj.icon === false) {
                            if (obj.icon === false) {
                                node.childNodes[1].childNodes[0].className += ' jstree-themeicon-hidden';
                            } else if (obj.icon.indexOf('/') === -1 && obj.icon.indexOf('.') === -1) {
                                node.childNodes[1].childNodes[0].className += ' ' + obj.icon + ' jstree-themeicon-custom';
                            } else {
                                node.childNodes[1].childNodes[0].style.backgroundImage = 'url("' + obj.icon + '")';
                                node.childNodes[1].childNodes[0].style.backgroundPosition = 'center center';
                                node.childNodes[1].childNodes[0].style.backgroundSize = 'auto';
                                node.childNodes[1].childNodes[0].className += ' jstree-themeicon-custom';
                            }
                        }
                        if (this.settings.core.force_text) {
                            node.childNodes[1].appendChild(d.createTextNode(obj.text));
                        } else {
                            node.childNodes[1].innerHTML += obj.text;
                        }
                        if (deep && obj.children.length && (obj.state.opened || force_render) && obj.state.loaded) {
                            k = d.createElement('UL');
                            k.setAttribute('role', 'group');
                            k.className = 'jstree-children';
                            for (i = 0, j = obj.children.length; i < j; i++) {
                                k.appendChild(this.redraw_node(obj.children[i], deep, true));
                            }
                            node.appendChild(k);
                        }
                        if (old) {
                            node.appendChild(old);
                        }
                        if (!is_callback) {
                            if (!par) {
                                par = this.element[0];
                            }
                            for (i = 0, j = par.childNodes.length; i < j; i++) {
                                if (par.childNodes[i] && par.childNodes[i].className && par.childNodes[i].className.indexOf('jstree-children') !== -1) {
                                    tmp = par.childNodes[i];
                                    break;
                                }
                            }
                            if (!tmp) {
                                tmp = d.createElement('UL');
                                tmp.setAttribute('role', 'group');
                                tmp.className = 'jstree-children';
                                par.appendChild(tmp);
                            }
                            par = tmp;
                            if (ind < par.childNodes.length) {
                                par.insertBefore(node, par.childNodes[ind]);
                            } else {
                                par.appendChild(node);
                            }
                            if (f) {
                                t = this.element[0].scrollTop;
                                l = this.element[0].scrollLeft;
                                node.childNodes[1].focus();
                                this.element[0].scrollTop = t;
                                this.element[0].scrollLeft = l;
                            }
                        }
                        if (obj.state.opened && !obj.state.loaded) {
                            obj.state.opened = false;
                            setTimeout($.proxy(function () {
                                this.open_node(obj.id, false, 0);
                            }, this), 0);
                        }
                        return node;
                    },
                    open_node: function (obj, callback, animation) {
                        var t1, t2, d, t;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.open_node(obj[t1], callback, animation);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        animation = animation === undefined ? this.settings.core.animation : animation;
                        if (!this.is_closed(obj)) {
                            if (callback) {
                                callback.call(this, obj, false);
                            }
                            return false;
                        }
                        if (!this.is_loaded(obj)) {
                            if (this.is_loading(obj)) {
                                return setTimeout($.proxy(function () {
                                    this.open_node(obj, callback, animation);
                                }, this), 500);
                            }
                            this.load_node(obj, function (o, ok) {
                                return ok ? this.open_node(o, callback, animation) : callback ? callback.call(this, o, false) : false;
                            });
                        } else {
                            d = this.get_node(obj, true);
                            t = this;
                            if (d.length) {
                                if (animation && d.children('.jstree-children').length) {
                                    d.children('.jstree-children').stop(true, true);
                                }
                                if (obj.children.length && !this._firstChild(d.children('.jstree-children')[0])) {
                                    this.draw_children(obj);
                                }
                                if (!animation) {
                                    this.trigger('before_open', { 'node': obj });
                                    d[0].className = d[0].className.replace('jstree-closed', 'jstree-open');
                                    d[0].setAttribute('aria-expanded', true);
                                } else {
                                    this.trigger('before_open', { 'node': obj });
                                    d.children('.jstree-children').css('display', 'none').end().removeClass('jstree-closed').addClass('jstree-open').attr('aria-expanded', true).children('.jstree-children').stop(true, true).slideDown(animation, function () {
                                        this.style.display = '';
                                        if (t.element) {
                                            t.trigger('after_open', { 'node': obj });
                                        }
                                    });
                                }
                            }
                            obj.state.opened = true;
                            if (callback) {
                                callback.call(this, obj, true);
                            }
                            if (!d.length) {
                                this.trigger('before_open', { 'node': obj });
                            }
                            this.trigger('open_node', { 'node': obj });
                            if (!animation || !d.length) {
                                this.trigger('after_open', { 'node': obj });
                            }
                            return true;
                        }
                    },
                    _open_to: function (obj) {
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        var i, j, p = obj.parents;
                        for (i = 0, j = p.length; i < j; i += 1) {
                            if (i !== $.jstree.root) {
                                this.open_node(p[i], false, 0);
                            }
                        }
                        return $('#' + obj.id.replace($.jstree.idregex, '\\$&'), this.element);
                    },
                    close_node: function (obj, animation) {
                        var t1, t2, t, d;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.close_node(obj[t1], animation);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        if (this.is_closed(obj)) {
                            return false;
                        }
                        animation = animation === undefined ? this.settings.core.animation : animation;
                        t = this;
                        d = this.get_node(obj, true);
                        obj.state.opened = false;
                        this.trigger('close_node', { 'node': obj });
                        if (!d.length) {
                            this.trigger('after_close', { 'node': obj });
                        } else {
                            if (!animation) {
                                d[0].className = d[0].className.replace('jstree-open', 'jstree-closed');
                                d.attr('aria-expanded', false).children('.jstree-children').remove();
                                this.trigger('after_close', { 'node': obj });
                            } else {
                                d.children('.jstree-children').attr('style', 'display:block !important').end().removeClass('jstree-open').addClass('jstree-closed').attr('aria-expanded', false).children('.jstree-children').stop(true, true).slideUp(animation, function () {
                                    this.style.display = '';
                                    d.children('.jstree-children').remove();
                                    if (t.element) {
                                        t.trigger('after_close', { 'node': obj });
                                    }
                                });
                            }
                        }
                    },
                    toggle_node: function (obj) {
                        var t1, t2;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.toggle_node(obj[t1]);
                            }
                            return true;
                        }
                        if (this.is_closed(obj)) {
                            return this.open_node(obj);
                        }
                        if (this.is_open(obj)) {
                            return this.close_node(obj);
                        }
                    },
                    open_all: function (obj, animation, original_obj) {
                        if (!obj) {
                            obj = $.jstree.root;
                        }
                        obj = this.get_node(obj);
                        if (!obj) {
                            return false;
                        }
                        var dom = obj.id === $.jstree.root ? this.get_container_ul() : this.get_node(obj, true), i, j, _this;
                        if (!dom.length) {
                            for (i = 0, j = obj.children_d.length; i < j; i++) {
                                if (this.is_closed(this._model.data[obj.children_d[i]])) {
                                    this._model.data[obj.children_d[i]].state.opened = true;
                                }
                            }
                            return this.trigger('open_all', { 'node': obj });
                        }
                        original_obj = original_obj || dom;
                        _this = this;
                        dom = this.is_closed(obj) ? dom.find('.jstree-closed').addBack() : dom.find('.jstree-closed');
                        dom.each(function () {
                            _this.open_node(this, function (node, status) {
                                if (status && this.is_parent(node)) {
                                    this.open_all(node, animation, original_obj);
                                }
                            }, animation || 0);
                        });
                        if (original_obj.find('.jstree-closed').length === 0) {
                            this.trigger('open_all', { 'node': this.get_node(original_obj) });
                        }
                    },
                    close_all: function (obj, animation) {
                        if (!obj) {
                            obj = $.jstree.root;
                        }
                        obj = this.get_node(obj);
                        if (!obj) {
                            return false;
                        }
                        var dom = obj.id === $.jstree.root ? this.get_container_ul() : this.get_node(obj, true), _this = this, i, j;
                        if (dom.length) {
                            dom = this.is_open(obj) ? dom.find('.jstree-open').addBack() : dom.find('.jstree-open');
                            $(dom.get().reverse()).each(function () {
                                _this.close_node(this, animation || 0);
                            });
                        }
                        for (i = 0, j = obj.children_d.length; i < j; i++) {
                            this._model.data[obj.children_d[i]].state.opened = false;
                        }
                        this.trigger('close_all', { 'node': obj });
                    },
                    is_disabled: function (obj) {
                        obj = this.get_node(obj);
                        return obj && obj.state && obj.state.disabled;
                    },
                    enable_node: function (obj) {
                        var t1, t2;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.enable_node(obj[t1]);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        obj.state.disabled = false;
                        this.get_node(obj, true).children('.jstree-anchor').removeClass('jstree-disabled').attr('aria-disabled', false);
                        this.trigger('enable_node', { 'node': obj });
                    },
                    disable_node: function (obj) {
                        var t1, t2;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.disable_node(obj[t1]);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        obj.state.disabled = true;
                        this.get_node(obj, true).children('.jstree-anchor').addClass('jstree-disabled').attr('aria-disabled', true);
                        this.trigger('disable_node', { 'node': obj });
                    },
                    is_hidden: function (obj) {
                        obj = this.get_node(obj);
                        return obj.state.hidden === true;
                    },
                    hide_node: function (obj, skip_redraw) {
                        var t1, t2;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.hide_node(obj[t1], true);
                            }
                            if (!skip_redraw) {
                                this.redraw();
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        if (!obj.state.hidden) {
                            obj.state.hidden = true;
                            this._node_changed(obj.parent);
                            if (!skip_redraw) {
                                this.redraw();
                            }
                            this.trigger('hide_node', { 'node': obj });
                        }
                    },
                    show_node: function (obj, skip_redraw) {
                        var t1, t2;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.show_node(obj[t1], true);
                            }
                            if (!skip_redraw) {
                                this.redraw();
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        if (obj.state.hidden) {
                            obj.state.hidden = false;
                            this._node_changed(obj.parent);
                            if (!skip_redraw) {
                                this.redraw();
                            }
                            this.trigger('show_node', { 'node': obj });
                        }
                    },
                    hide_all: function (skip_redraw) {
                        var i, m = this._model.data, ids = [];
                        for (i in m) {
                            if (m.hasOwnProperty(i) && i !== $.jstree.root && !m[i].state.hidden) {
                                m[i].state.hidden = true;
                                ids.push(i);
                            }
                        }
                        this._model.force_full_redraw = true;
                        if (!skip_redraw) {
                            this.redraw();
                        }
                        this.trigger('hide_all', { 'nodes': ids });
                        return ids;
                    },
                    show_all: function (skip_redraw) {
                        var i, m = this._model.data, ids = [];
                        for (i in m) {
                            if (m.hasOwnProperty(i) && i !== $.jstree.root && m[i].state.hidden) {
                                m[i].state.hidden = false;
                                ids.push(i);
                            }
                        }
                        this._model.force_full_redraw = true;
                        if (!skip_redraw) {
                            this.redraw();
                        }
                        this.trigger('show_all', { 'nodes': ids });
                        return ids;
                    },
                    activate_node: function (obj, e) {
                        if (this.is_disabled(obj)) {
                            return false;
                        }
                        if (!e || typeof e !== 'object') {
                            e = {};
                        }
                        this._data.core.last_clicked = this._data.core.last_clicked && this._data.core.last_clicked.id !== undefined ? this.get_node(this._data.core.last_clicked.id) : null;
                        if (this._data.core.last_clicked && !this._data.core.last_clicked.state.selected) {
                            this._data.core.last_clicked = null;
                        }
                        if (!this._data.core.last_clicked && this._data.core.selected.length) {
                            this._data.core.last_clicked = this.get_node(this._data.core.selected[this._data.core.selected.length - 1]);
                        }
                        if (!this.settings.core.multiple || !e.metaKey && !e.ctrlKey && !e.shiftKey || e.shiftKey && (!this._data.core.last_clicked || !this.get_parent(obj) || this.get_parent(obj) !== this._data.core.last_clicked.parent)) {
                            if (!this.settings.core.multiple && (e.metaKey || e.ctrlKey || e.shiftKey) && this.is_selected(obj)) {
                                this.deselect_node(obj, false, e);
                            } else {
                                this.deselect_all(true);
                                this.select_node(obj, false, false, e);
                                this._data.core.last_clicked = this.get_node(obj);
                            }
                        } else {
                            if (e.shiftKey) {
                                var o = this.get_node(obj).id, l = this._data.core.last_clicked.id, p = this.get_node(this._data.core.last_clicked.parent).children, c = false, i, j;
                                for (i = 0, j = p.length; i < j; i += 1) {
                                    if (p[i] === o) {
                                        c = !c;
                                    }
                                    if (p[i] === l) {
                                        c = !c;
                                    }
                                    if (!this.is_disabled(p[i]) && (c || p[i] === o || p[i] === l)) {
                                        if (!this.is_hidden(p[i])) {
                                            this.select_node(p[i], true, false, e);
                                        }
                                    } else {
                                        this.deselect_node(p[i], true, e);
                                    }
                                }
                                this.trigger('changed', {
                                    'action': 'select_node',
                                    'node': this.get_node(obj),
                                    'selected': this._data.core.selected,
                                    'event': e
                                });
                            } else {
                                if (!this.is_selected(obj)) {
                                    this.select_node(obj, false, false, e);
                                } else {
                                    this.deselect_node(obj, false, e);
                                }
                            }
                        }
                        this.trigger('activate_node', {
                            'node': this.get_node(obj),
                            'event': e
                        });
                    },
                    hover_node: function (obj) {
                        obj = this.get_node(obj, true);
                        if (!obj || !obj.length || obj.children('.jstree-hovered').length) {
                            return false;
                        }
                        var o = this.element.find('.jstree-hovered'), t = this.element;
                        if (o && o.length) {
                            this.dehover_node(o);
                        }
                        obj.children('.jstree-anchor').addClass('jstree-hovered');
                        this.trigger('hover_node', { 'node': this.get_node(obj) });
                        setTimeout(function () {
                            t.attr('aria-activedescendant', obj[0].id);
                        }, 0);
                    },
                    dehover_node: function (obj) {
                        obj = this.get_node(obj, true);
                        if (!obj || !obj.length || !obj.children('.jstree-hovered').length) {
                            return false;
                        }
                        obj.children('.jstree-anchor').removeClass('jstree-hovered');
                        this.trigger('dehover_node', { 'node': this.get_node(obj) });
                    },
                    select_node: function (obj, supress_event, prevent_open, e) {
                        var dom, t1, t2, th;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.select_node(obj[t1], supress_event, prevent_open, e);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        dom = this.get_node(obj, true);
                        if (!obj.state.selected) {
                            obj.state.selected = true;
                            this._data.core.selected.push(obj.id);
                            if (!prevent_open) {
                                dom = this._open_to(obj);
                            }
                            if (dom && dom.length) {
                                dom.attr('aria-selected', true).children('.jstree-anchor').addClass('jstree-clicked');
                            }
                            this.trigger('select_node', {
                                'node': obj,
                                'selected': this._data.core.selected,
                                'event': e
                            });
                            if (!supress_event) {
                                this.trigger('changed', {
                                    'action': 'select_node',
                                    'node': obj,
                                    'selected': this._data.core.selected,
                                    'event': e
                                });
                            }
                        }
                    },
                    deselect_node: function (obj, supress_event, e) {
                        var t1, t2, dom;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.deselect_node(obj[t1], supress_event, e);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        dom = this.get_node(obj, true);
                        if (obj.state.selected) {
                            obj.state.selected = false;
                            this._data.core.selected = $.vakata.array_remove_item(this._data.core.selected, obj.id);
                            if (dom.length) {
                                dom.attr('aria-selected', false).children('.jstree-anchor').removeClass('jstree-clicked');
                            }
                            this.trigger('deselect_node', {
                                'node': obj,
                                'selected': this._data.core.selected,
                                'event': e
                            });
                            if (!supress_event) {
                                this.trigger('changed', {
                                    'action': 'deselect_node',
                                    'node': obj,
                                    'selected': this._data.core.selected,
                                    'event': e
                                });
                            }
                        }
                    },
                    select_all: function (supress_event) {
                        var tmp = this._data.core.selected.concat([]), i, j;
                        this._data.core.selected = this._model.data[$.jstree.root].children_d.concat();
                        for (i = 0, j = this._data.core.selected.length; i < j; i++) {
                            if (this._model.data[this._data.core.selected[i]]) {
                                this._model.data[this._data.core.selected[i]].state.selected = true;
                            }
                        }
                        this.redraw(true);
                        this.trigger('select_all', { 'selected': this._data.core.selected });
                        if (!supress_event) {
                            this.trigger('changed', {
                                'action': 'select_all',
                                'selected': this._data.core.selected,
                                'old_selection': tmp
                            });
                        }
                    },
                    deselect_all: function (supress_event) {
                        var tmp = this._data.core.selected.concat([]), i, j;
                        for (i = 0, j = this._data.core.selected.length; i < j; i++) {
                            if (this._model.data[this._data.core.selected[i]]) {
                                this._model.data[this._data.core.selected[i]].state.selected = false;
                            }
                        }
                        this._data.core.selected = [];
                        this.element.find('.jstree-clicked').removeClass('jstree-clicked').parent().attr('aria-selected', false);
                        this.trigger('deselect_all', {
                            'selected': this._data.core.selected,
                            'node': tmp
                        });
                        if (!supress_event) {
                            this.trigger('changed', {
                                'action': 'deselect_all',
                                'selected': this._data.core.selected,
                                'old_selection': tmp
                            });
                        }
                    },
                    is_selected: function (obj) {
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        return obj.state.selected;
                    },
                    get_selected: function (full) {
                        return full ? $.map(this._data.core.selected, $.proxy(function (i) {
                            return this.get_node(i);
                        }, this)) : this._data.core.selected.slice();
                    },
                    get_top_selected: function (full) {
                        var tmp = this.get_selected(true), obj = {}, i, j, k, l;
                        for (i = 0, j = tmp.length; i < j; i++) {
                            obj[tmp[i].id] = tmp[i];
                        }
                        for (i = 0, j = tmp.length; i < j; i++) {
                            for (k = 0, l = tmp[i].children_d.length; k < l; k++) {
                                if (obj[tmp[i].children_d[k]]) {
                                    delete obj[tmp[i].children_d[k]];
                                }
                            }
                        }
                        tmp = [];
                        for (i in obj) {
                            if (obj.hasOwnProperty(i)) {
                                tmp.push(i);
                            }
                        }
                        return full ? $.map(tmp, $.proxy(function (i) {
                            return this.get_node(i);
                        }, this)) : tmp;
                    },
                    get_bottom_selected: function (full) {
                        var tmp = this.get_selected(true), obj = [], i, j;
                        for (i = 0, j = tmp.length; i < j; i++) {
                            if (!tmp[i].children.length) {
                                obj.push(tmp[i].id);
                            }
                        }
                        return full ? $.map(obj, $.proxy(function (i) {
                            return this.get_node(i);
                        }, this)) : obj;
                    },
                    get_state: function () {
                        var state = {
                                'core': {
                                    'open': [],
                                    'scroll': {
                                        'left': this.element.scrollLeft(),
                                        'top': this.element.scrollTop()
                                    },
                                    'selected': []
                                }
                            }, i;
                        for (i in this._model.data) {
                            if (this._model.data.hasOwnProperty(i)) {
                                if (i !== $.jstree.root) {
                                    if (this._model.data[i].state.opened) {
                                        state.core.open.push(i);
                                    }
                                    if (this._model.data[i].state.selected) {
                                        state.core.selected.push(i);
                                    }
                                }
                            }
                        }
                        return state;
                    },
                    set_state: function (state, callback) {
                        if (state) {
                            if (state.core) {
                                var res, n, t, _this, i;
                                if (state.core.open) {
                                    if (!$.isArray(state.core.open) || !state.core.open.length) {
                                        delete state.core.open;
                                        this.set_state(state, callback);
                                    } else {
                                        this._load_nodes(state.core.open, function (nodes) {
                                            this.open_node(nodes, false, 0);
                                            delete state.core.open;
                                            this.set_state(state, callback);
                                        });
                                    }
                                    return false;
                                }
                                if (state.core.scroll) {
                                    if (state.core.scroll && state.core.scroll.left !== undefined) {
                                        this.element.scrollLeft(state.core.scroll.left);
                                    }
                                    if (state.core.scroll && state.core.scroll.top !== undefined) {
                                        this.element.scrollTop(state.core.scroll.top);
                                    }
                                    delete state.core.scroll;
                                    this.set_state(state, callback);
                                    return false;
                                }
                                if (state.core.selected) {
                                    _this = this;
                                    this.deselect_all();
                                    $.each(state.core.selected, function (i, v) {
                                        _this.select_node(v, false, true);
                                    });
                                    delete state.core.selected;
                                    this.set_state(state, callback);
                                    return false;
                                }
                                for (i in state) {
                                    if (state.hasOwnProperty(i) && i !== 'core' && $.inArray(i, this.settings.plugins) === -1) {
                                        delete state[i];
                                    }
                                }
                                if ($.isEmptyObject(state.core)) {
                                    delete state.core;
                                    this.set_state(state, callback);
                                    return false;
                                }
                            }
                            if ($.isEmptyObject(state)) {
                                state = null;
                                if (callback) {
                                    callback.call(this);
                                }
                                this.trigger('set_state');
                                return false;
                            }
                            return true;
                        }
                        return false;
                    },
                    refresh: function (skip_loading, forget_state) {
                        this._data.core.state = forget_state === true ? {} : this.get_state();
                        if (forget_state && $.isFunction(forget_state)) {
                            this._data.core.state = forget_state.call(this, this._data.core.state);
                        }
                        this._cnt = 0;
                        this._model.data = {};
                        this._model.data[$.jstree.root] = {
                            id: $.jstree.root,
                            parent: null,
                            parents: [],
                            children: [],
                            children_d: [],
                            state: { loaded: false }
                        };
                        this._data.core.selected = [];
                        this._data.core.last_clicked = null;
                        this._data.core.focused = null;
                        var c = this.get_container_ul()[0].className;
                        if (!skip_loading) {
                            this.element.html('<' + 'ul class=\'' + c + '\' role=\'group\'><' + 'li class=\'jstree-initial-node jstree-loading jstree-leaf jstree-last\' role=\'treeitem\' id=\'j' + this._id + '_loading\'><i class=\'jstree-icon jstree-ocl\'></i><' + 'a class=\'jstree-anchor\' href=\'#\'><i class=\'jstree-icon jstree-themeicon-hidden\'></i>' + this.get_string('Loading ...') + '</a></li></ul>');
                            this.element.attr('aria-activedescendant', 'j' + this._id + '_loading');
                        }
                        this.load_node($.jstree.root, function (o, s) {
                            if (s) {
                                this.get_container_ul()[0].className = c;
                                if (this._firstChild(this.get_container_ul()[0])) {
                                    this.element.attr('aria-activedescendant', this._firstChild(this.get_container_ul()[0]).id);
                                }
                                this.set_state($.extend(true, {}, this._data.core.state), function () {
                                    this.trigger('refresh');
                                });
                            }
                            this._data.core.state = null;
                        });
                    },
                    refresh_node: function (obj) {
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        var opened = [], to_load = [], s = this._data.core.selected.concat([]);
                        to_load.push(obj.id);
                        if (obj.state.opened === true) {
                            opened.push(obj.id);
                        }
                        this.get_node(obj, true).find('.jstree-open').each(function () {
                            to_load.push(this.id);
                            opened.push(this.id);
                        });
                        this._load_nodes(to_load, $.proxy(function (nodes) {
                            this.open_node(opened, false, 0);
                            this.select_node(s);
                            this.trigger('refresh_node', {
                                'node': obj,
                                'nodes': nodes
                            });
                        }, this), false, true);
                    },
                    set_id: function (obj, id) {
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        var i, j, m = this._model.data, old = obj.id;
                        id = id.toString();
                        m[obj.parent].children[$.inArray(obj.id, m[obj.parent].children)] = id;
                        for (i = 0, j = obj.parents.length; i < j; i++) {
                            m[obj.parents[i]].children_d[$.inArray(obj.id, m[obj.parents[i]].children_d)] = id;
                        }
                        for (i = 0, j = obj.children.length; i < j; i++) {
                            m[obj.children[i]].parent = id;
                        }
                        for (i = 0, j = obj.children_d.length; i < j; i++) {
                            m[obj.children_d[i]].parents[$.inArray(obj.id, m[obj.children_d[i]].parents)] = id;
                        }
                        i = $.inArray(obj.id, this._data.core.selected);
                        if (i !== -1) {
                            this._data.core.selected[i] = id;
                        }
                        i = this.get_node(obj.id, true);
                        if (i) {
                            i.attr('id', id);
                            if (this.element.attr('aria-activedescendant') === obj.id) {
                                this.element.attr('aria-activedescendant', id);
                            }
                        }
                        delete m[obj.id];
                        obj.id = id;
                        obj.li_attr.id = id;
                        m[id] = obj;
                        this.trigger('set_id', {
                            'node': obj,
                            'new': obj.id,
                            'old': old
                        });
                        return true;
                    },
                    get_text: function (obj) {
                        obj = this.get_node(obj);
                        return !obj || obj.id === $.jstree.root ? false : obj.text;
                    },
                    set_text: function (obj, val) {
                        var t1, t2;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.set_text(obj[t1], val);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        obj.text = val;
                        if (this.get_node(obj, true).length) {
                            this.redraw_node(obj.id);
                        }
                        this.trigger('set_text', {
                            'obj': obj,
                            'text': val
                        });
                        return true;
                    },
                    get_json: function (obj, options, flat) {
                        obj = this.get_node(obj || $.jstree.root);
                        if (!obj) {
                            return false;
                        }
                        if (options && options.flat && !flat) {
                            flat = [];
                        }
                        var tmp = {
                                'id': obj.id,
                                'text': obj.text,
                                'icon': this.get_icon(obj),
                                'li_attr': $.extend(true, {}, obj.li_attr),
                                'a_attr': $.extend(true, {}, obj.a_attr),
                                'state': {},
                                'data': options && options.no_data ? false : $.extend(true, {}, obj.data)
                            }, i, j;
                        if (options && options.flat) {
                            tmp.parent = obj.parent;
                        } else {
                            tmp.children = [];
                        }
                        if (!options || !options.no_state) {
                            for (i in obj.state) {
                                if (obj.state.hasOwnProperty(i)) {
                                    tmp.state[i] = obj.state[i];
                                }
                            }
                        } else {
                            delete tmp.state;
                        }
                        if (options && options.no_li_attr) {
                            delete tmp.li_attr;
                        }
                        if (options && options.no_a_attr) {
                            delete tmp.a_attr;
                        }
                        if (options && options.no_id) {
                            delete tmp.id;
                            if (tmp.li_attr && tmp.li_attr.id) {
                                delete tmp.li_attr.id;
                            }
                            if (tmp.a_attr && tmp.a_attr.id) {
                                delete tmp.a_attr.id;
                            }
                        }
                        if (options && options.flat && obj.id !== $.jstree.root) {
                            flat.push(tmp);
                        }
                        if (!options || !options.no_children) {
                            for (i = 0, j = obj.children.length; i < j; i++) {
                                if (options && options.flat) {
                                    this.get_json(obj.children[i], options, flat);
                                } else {
                                    tmp.children.push(this.get_json(obj.children[i], options));
                                }
                            }
                        }
                        return options && options.flat ? flat : obj.id === $.jstree.root ? tmp.children : tmp;
                    },
                    create_node: function (par, node, pos, callback, is_loaded) {
                        if (par === null) {
                            par = $.jstree.root;
                        }
                        par = this.get_node(par);
                        if (!par) {
                            return false;
                        }
                        pos = pos === undefined ? 'last' : pos;
                        if (!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)) {
                            return this.load_node(par, function () {
                                this.create_node(par, node, pos, callback, true);
                            });
                        }
                        if (!node) {
                            node = { 'text': this.get_string('New node') };
                        }
                        if (typeof node === 'string') {
                            node = { 'text': node };
                        }
                        if (node.text === undefined) {
                            node.text = this.get_string('New node');
                        }
                        var tmp, dpc, i, j;
                        if (par.id === $.jstree.root) {
                            if (pos === 'before') {
                                pos = 'first';
                            }
                            if (pos === 'after') {
                                pos = 'last';
                            }
                        }
                        switch (pos) {
                        case 'before':
                            tmp = this.get_node(par.parent);
                            pos = $.inArray(par.id, tmp.children);
                            par = tmp;
                            break;
                        case 'after':
                            tmp = this.get_node(par.parent);
                            pos = $.inArray(par.id, tmp.children) + 1;
                            par = tmp;
                            break;
                        case 'inside':
                        case 'first':
                            pos = 0;
                            break;
                        case 'last':
                            pos = par.children.length;
                            break;
                        default:
                            if (!pos) {
                                pos = 0;
                            }
                            break;
                        }
                        if (pos > par.children.length) {
                            pos = par.children.length;
                        }
                        if (!node.id) {
                            node.id = true;
                        }
                        if (!this.check('create_node', node, par, pos)) {
                            this.settings.core.error.call(this, this._data.core.last_error);
                            return false;
                        }
                        if (node.id === true) {
                            delete node.id;
                        }
                        node = this._parse_model_from_json(node, par.id, par.parents.concat());
                        if (!node) {
                            return false;
                        }
                        tmp = this.get_node(node);
                        dpc = [];
                        dpc.push(node);
                        dpc = dpc.concat(tmp.children_d);
                        this.trigger('model', {
                            'nodes': dpc,
                            'parent': par.id
                        });
                        par.children_d = par.children_d.concat(dpc);
                        for (i = 0, j = par.parents.length; i < j; i++) {
                            this._model.data[par.parents[i]].children_d = this._model.data[par.parents[i]].children_d.concat(dpc);
                        }
                        node = tmp;
                        tmp = [];
                        for (i = 0, j = par.children.length; i < j; i++) {
                            tmp[i >= pos ? i + 1 : i] = par.children[i];
                        }
                        tmp[pos] = node.id;
                        par.children = tmp;
                        this.redraw_node(par, true);
                        if (callback) {
                            callback.call(this, this.get_node(node));
                        }
                        this.trigger('create_node', {
                            'node': this.get_node(node),
                            'parent': par.id,
                            'position': pos
                        });
                        return node.id;
                    },
                    rename_node: function (obj, val) {
                        var t1, t2, old;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.rename_node(obj[t1], val);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        old = obj.text;
                        if (!this.check('rename_node', obj, this.get_parent(obj), val)) {
                            this.settings.core.error.call(this, this._data.core.last_error);
                            return false;
                        }
                        this.set_text(obj, val);
                        this.trigger('rename_node', {
                            'node': obj,
                            'text': val,
                            'old': old
                        });
                        return true;
                    },
                    delete_node: function (obj) {
                        var t1, t2, par, pos, tmp, i, j, k, l, c, top, lft;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.delete_node(obj[t1]);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        par = this.get_node(obj.parent);
                        pos = $.inArray(obj.id, par.children);
                        c = false;
                        if (!this.check('delete_node', obj, par, pos)) {
                            this.settings.core.error.call(this, this._data.core.last_error);
                            return false;
                        }
                        if (pos !== -1) {
                            par.children = $.vakata.array_remove(par.children, pos);
                        }
                        tmp = obj.children_d.concat([]);
                        tmp.push(obj.id);
                        for (i = 0, j = obj.parents.length; i < j; i++) {
                            this._model.data[obj.parents[i]].children_d = $.vakata.array_filter(this._model.data[obj.parents[i]].children_d, function (v) {
                                return $.inArray(v, tmp) === -1;
                            });
                        }
                        for (k = 0, l = tmp.length; k < l; k++) {
                            if (this._model.data[tmp[k]].state.selected) {
                                c = true;
                                break;
                            }
                        }
                        if (c) {
                            this._data.core.selected = $.vakata.array_filter(this._data.core.selected, function (v) {
                                return $.inArray(v, tmp) === -1;
                            });
                        }
                        this.trigger('delete_node', {
                            'node': obj,
                            'parent': par.id
                        });
                        if (c) {
                            this.trigger('changed', {
                                'action': 'delete_node',
                                'node': obj,
                                'selected': this._data.core.selected,
                                'parent': par.id
                            });
                        }
                        for (k = 0, l = tmp.length; k < l; k++) {
                            delete this._model.data[tmp[k]];
                        }
                        if ($.inArray(this._data.core.focused, tmp) !== -1) {
                            this._data.core.focused = null;
                            top = this.element[0].scrollTop;
                            lft = this.element[0].scrollLeft;
                            if (par.id === $.jstree.root) {
                                if (this._model.data[$.jstree.root].children[0]) {
                                    this.get_node(this._model.data[$.jstree.root].children[0], true).children('.jstree-anchor').focus();
                                }
                            } else {
                                this.get_node(par, true).children('.jstree-anchor').focus();
                            }
                            this.element[0].scrollTop = top;
                            this.element[0].scrollLeft = lft;
                        }
                        this.redraw_node(par, true);
                        return true;
                    },
                    check: function (chk, obj, par, pos, more) {
                        obj = obj && obj.id ? obj : this.get_node(obj);
                        par = par && par.id ? par : this.get_node(par);
                        var tmp = chk.match(/^move_node|copy_node|create_node$/i) ? par : obj, chc = this.settings.core.check_callback;
                        if (chk === 'move_node' || chk === 'copy_node') {
                            if ((!more || !more.is_multi) && (obj.id === par.id || chk === 'move_node' && $.inArray(obj.id, par.children) === pos || $.inArray(par.id, obj.children_d) !== -1)) {
                                this._data.core.last_error = {
                                    'error': 'check',
                                    'plugin': 'core',
                                    'id': 'core_01',
                                    'reason': 'Moving parent inside child',
                                    'data': JSON.stringify({
                                        'chk': chk,
                                        'pos': pos,
                                        'obj': obj && obj.id ? obj.id : false,
                                        'par': par && par.id ? par.id : false
                                    })
                                };
                                return false;
                            }
                        }
                        if (tmp && tmp.data) {
                            tmp = tmp.data;
                        }
                        if (tmp && tmp.functions && (tmp.functions[chk] === false || tmp.functions[chk] === true)) {
                            if (tmp.functions[chk] === false) {
                                this._data.core.last_error = {
                                    'error': 'check',
                                    'plugin': 'core',
                                    'id': 'core_02',
                                    'reason': 'Node data prevents function: ' + chk,
                                    'data': JSON.stringify({
                                        'chk': chk,
                                        'pos': pos,
                                        'obj': obj && obj.id ? obj.id : false,
                                        'par': par && par.id ? par.id : false
                                    })
                                };
                            }
                            return tmp.functions[chk];
                        }
                        if (chc === false || $.isFunction(chc) && chc.call(this, chk, obj, par, pos, more) === false || chc && chc[chk] === false) {
                            this._data.core.last_error = {
                                'error': 'check',
                                'plugin': 'core',
                                'id': 'core_03',
                                'reason': 'User config for core.check_callback prevents function: ' + chk,
                                'data': JSON.stringify({
                                    'chk': chk,
                                    'pos': pos,
                                    'obj': obj && obj.id ? obj.id : false,
                                    'par': par && par.id ? par.id : false
                                })
                            };
                            return false;
                        }
                        return true;
                    },
                    last_error: function () {
                        return this._data.core.last_error;
                    },
                    move_node: function (obj, par, pos, callback, is_loaded, skip_redraw, origin) {
                        var t1, t2, old_par, old_pos, new_par, old_ins, is_multi, dpc, tmp, i, j, k, l, p;
                        par = this.get_node(par);
                        pos = pos === undefined ? 0 : pos;
                        if (!par) {
                            return false;
                        }
                        if (!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)) {
                            return this.load_node(par, function () {
                                this.move_node(obj, par, pos, callback, true, false, origin);
                            });
                        }
                        if ($.isArray(obj)) {
                            if (obj.length === 1) {
                                obj = obj[0];
                            } else {
                                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                    if (tmp = this.move_node(obj[t1], par, pos, callback, is_loaded, false, origin)) {
                                        par = tmp;
                                        pos = 'after';
                                    }
                                }
                                this.redraw();
                                return true;
                            }
                        }
                        obj = obj && obj.id ? obj : this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        old_par = (obj.parent || $.jstree.root).toString();
                        new_par = !pos.toString().match(/^(before|after)$/) || par.id === $.jstree.root ? par : this.get_node(par.parent);
                        old_ins = origin ? origin : this._model.data[obj.id] ? this : $.jstree.reference(obj.id);
                        is_multi = !old_ins || !old_ins._id || this._id !== old_ins._id;
                        old_pos = old_ins && old_ins._id && old_par && old_ins._model.data[old_par] && old_ins._model.data[old_par].children ? $.inArray(obj.id, old_ins._model.data[old_par].children) : -1;
                        if (old_ins && old_ins._id) {
                            obj = old_ins._model.data[obj.id];
                        }
                        if (is_multi) {
                            if (tmp = this.copy_node(obj, par, pos, callback, is_loaded, false, origin)) {
                                if (old_ins) {
                                    old_ins.delete_node(obj);
                                }
                                return tmp;
                            }
                            return false;
                        }
                        if (par.id === $.jstree.root) {
                            if (pos === 'before') {
                                pos = 'first';
                            }
                            if (pos === 'after') {
                                pos = 'last';
                            }
                        }
                        switch (pos) {
                        case 'before':
                            pos = $.inArray(par.id, new_par.children);
                            break;
                        case 'after':
                            pos = $.inArray(par.id, new_par.children) + 1;
                            break;
                        case 'inside':
                        case 'first':
                            pos = 0;
                            break;
                        case 'last':
                            pos = new_par.children.length;
                            break;
                        default:
                            if (!pos) {
                                pos = 0;
                            }
                            break;
                        }
                        if (pos > new_par.children.length) {
                            pos = new_par.children.length;
                        }
                        if (!this.check('move_node', obj, new_par, pos, {
                                'core': true,
                                'origin': origin,
                                'is_multi': old_ins && old_ins._id && old_ins._id !== this._id,
                                'is_foreign': !old_ins || !old_ins._id
                            })) {
                            this.settings.core.error.call(this, this._data.core.last_error);
                            return false;
                        }
                        if (obj.parent === new_par.id) {
                            dpc = new_par.children.concat();
                            tmp = $.inArray(obj.id, dpc);
                            if (tmp !== -1) {
                                dpc = $.vakata.array_remove(dpc, tmp);
                                if (pos > tmp) {
                                    pos--;
                                }
                            }
                            tmp = [];
                            for (i = 0, j = dpc.length; i < j; i++) {
                                tmp[i >= pos ? i + 1 : i] = dpc[i];
                            }
                            tmp[pos] = obj.id;
                            new_par.children = tmp;
                            this._node_changed(new_par.id);
                            this.redraw(new_par.id === $.jstree.root);
                        } else {
                            tmp = obj.children_d.concat();
                            tmp.push(obj.id);
                            for (i = 0, j = obj.parents.length; i < j; i++) {
                                dpc = [];
                                p = old_ins._model.data[obj.parents[i]].children_d;
                                for (k = 0, l = p.length; k < l; k++) {
                                    if ($.inArray(p[k], tmp) === -1) {
                                        dpc.push(p[k]);
                                    }
                                }
                                old_ins._model.data[obj.parents[i]].children_d = dpc;
                            }
                            old_ins._model.data[old_par].children = $.vakata.array_remove_item(old_ins._model.data[old_par].children, obj.id);
                            for (i = 0, j = new_par.parents.length; i < j; i++) {
                                this._model.data[new_par.parents[i]].children_d = this._model.data[new_par.parents[i]].children_d.concat(tmp);
                            }
                            dpc = [];
                            for (i = 0, j = new_par.children.length; i < j; i++) {
                                dpc[i >= pos ? i + 1 : i] = new_par.children[i];
                            }
                            dpc[pos] = obj.id;
                            new_par.children = dpc;
                            new_par.children_d.push(obj.id);
                            new_par.children_d = new_par.children_d.concat(obj.children_d);
                            obj.parent = new_par.id;
                            tmp = new_par.parents.concat();
                            tmp.unshift(new_par.id);
                            p = obj.parents.length;
                            obj.parents = tmp;
                            tmp = tmp.concat();
                            for (i = 0, j = obj.children_d.length; i < j; i++) {
                                this._model.data[obj.children_d[i]].parents = this._model.data[obj.children_d[i]].parents.slice(0, p * -1);
                                Array.prototype.push.apply(this._model.data[obj.children_d[i]].parents, tmp);
                            }
                            if (old_par === $.jstree.root || new_par.id === $.jstree.root) {
                                this._model.force_full_redraw = true;
                            }
                            if (!this._model.force_full_redraw) {
                                this._node_changed(old_par);
                                this._node_changed(new_par.id);
                            }
                            if (!skip_redraw) {
                                this.redraw();
                            }
                        }
                        if (callback) {
                            callback.call(this, obj, new_par, pos);
                        }
                        this.trigger('move_node', {
                            'node': obj,
                            'parent': new_par.id,
                            'position': pos,
                            'old_parent': old_par,
                            'old_position': old_pos,
                            'is_multi': old_ins && old_ins._id && old_ins._id !== this._id,
                            'is_foreign': !old_ins || !old_ins._id,
                            'old_instance': old_ins,
                            'new_instance': this
                        });
                        return obj.id;
                    },
                    copy_node: function (obj, par, pos, callback, is_loaded, skip_redraw, origin) {
                        var t1, t2, dpc, tmp, i, j, node, old_par, new_par, old_ins, is_multi;
                        par = this.get_node(par);
                        pos = pos === undefined ? 0 : pos;
                        if (!par) {
                            return false;
                        }
                        if (!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)) {
                            return this.load_node(par, function () {
                                this.copy_node(obj, par, pos, callback, true, false, origin);
                            });
                        }
                        if ($.isArray(obj)) {
                            if (obj.length === 1) {
                                obj = obj[0];
                            } else {
                                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                    if (tmp = this.copy_node(obj[t1], par, pos, callback, is_loaded, true, origin)) {
                                        par = tmp;
                                        pos = 'after';
                                    }
                                }
                                this.redraw();
                                return true;
                            }
                        }
                        obj = obj && obj.id ? obj : this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        old_par = (obj.parent || $.jstree.root).toString();
                        new_par = !pos.toString().match(/^(before|after)$/) || par.id === $.jstree.root ? par : this.get_node(par.parent);
                        old_ins = origin ? origin : this._model.data[obj.id] ? this : $.jstree.reference(obj.id);
                        is_multi = !old_ins || !old_ins._id || this._id !== old_ins._id;
                        if (old_ins && old_ins._id) {
                            obj = old_ins._model.data[obj.id];
                        }
                        if (par.id === $.jstree.root) {
                            if (pos === 'before') {
                                pos = 'first';
                            }
                            if (pos === 'after') {
                                pos = 'last';
                            }
                        }
                        switch (pos) {
                        case 'before':
                            pos = $.inArray(par.id, new_par.children);
                            break;
                        case 'after':
                            pos = $.inArray(par.id, new_par.children) + 1;
                            break;
                        case 'inside':
                        case 'first':
                            pos = 0;
                            break;
                        case 'last':
                            pos = new_par.children.length;
                            break;
                        default:
                            if (!pos) {
                                pos = 0;
                            }
                            break;
                        }
                        if (pos > new_par.children.length) {
                            pos = new_par.children.length;
                        }
                        if (!this.check('copy_node', obj, new_par, pos, {
                                'core': true,
                                'origin': origin,
                                'is_multi': old_ins && old_ins._id && old_ins._id !== this._id,
                                'is_foreign': !old_ins || !old_ins._id
                            })) {
                            this.settings.core.error.call(this, this._data.core.last_error);
                            return false;
                        }
                        node = old_ins ? old_ins.get_json(obj, {
                            no_id: true,
                            no_data: true,
                            no_state: true
                        }) : obj;
                        if (!node) {
                            return false;
                        }
                        if (node.id === true) {
                            delete node.id;
                        }
                        node = this._parse_model_from_json(node, new_par.id, new_par.parents.concat());
                        if (!node) {
                            return false;
                        }
                        tmp = this.get_node(node);
                        if (obj && obj.state && obj.state.loaded === false) {
                            tmp.state.loaded = false;
                        }
                        dpc = [];
                        dpc.push(node);
                        dpc = dpc.concat(tmp.children_d);
                        this.trigger('model', {
                            'nodes': dpc,
                            'parent': new_par.id
                        });
                        for (i = 0, j = new_par.parents.length; i < j; i++) {
                            this._model.data[new_par.parents[i]].children_d = this._model.data[new_par.parents[i]].children_d.concat(dpc);
                        }
                        dpc = [];
                        for (i = 0, j = new_par.children.length; i < j; i++) {
                            dpc[i >= pos ? i + 1 : i] = new_par.children[i];
                        }
                        dpc[pos] = tmp.id;
                        new_par.children = dpc;
                        new_par.children_d.push(tmp.id);
                        new_par.children_d = new_par.children_d.concat(tmp.children_d);
                        if (new_par.id === $.jstree.root) {
                            this._model.force_full_redraw = true;
                        }
                        if (!this._model.force_full_redraw) {
                            this._node_changed(new_par.id);
                        }
                        if (!skip_redraw) {
                            this.redraw(new_par.id === $.jstree.root);
                        }
                        if (callback) {
                            callback.call(this, tmp, new_par, pos);
                        }
                        this.trigger('copy_node', {
                            'node': tmp,
                            'original': obj,
                            'parent': new_par.id,
                            'position': pos,
                            'old_parent': old_par,
                            'old_position': old_ins && old_ins._id && old_par && old_ins._model.data[old_par] && old_ins._model.data[old_par].children ? $.inArray(obj.id, old_ins._model.data[old_par].children) : -1,
                            'is_multi': old_ins && old_ins._id && old_ins._id !== this._id,
                            'is_foreign': !old_ins || !old_ins._id,
                            'old_instance': old_ins,
                            'new_instance': this
                        });
                        return tmp.id;
                    },
                    cut: function (obj) {
                        if (!obj) {
                            obj = this._data.core.selected.concat();
                        }
                        if (!$.isArray(obj)) {
                            obj = [obj];
                        }
                        if (!obj.length) {
                            return false;
                        }
                        var tmp = [], o, t1, t2;
                        for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                            o = this.get_node(obj[t1]);
                            if (o && o.id && o.id !== $.jstree.root) {
                                tmp.push(o);
                            }
                        }
                        if (!tmp.length) {
                            return false;
                        }
                        ccp_node = tmp;
                        ccp_inst = this;
                        ccp_mode = 'move_node';
                        this.trigger('cut', { 'node': obj });
                    },
                    copy: function (obj) {
                        if (!obj) {
                            obj = this._data.core.selected.concat();
                        }
                        if (!$.isArray(obj)) {
                            obj = [obj];
                        }
                        if (!obj.length) {
                            return false;
                        }
                        var tmp = [], o, t1, t2;
                        for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                            o = this.get_node(obj[t1]);
                            if (o && o.id && o.id !== $.jstree.root) {
                                tmp.push(o);
                            }
                        }
                        if (!tmp.length) {
                            return false;
                        }
                        ccp_node = tmp;
                        ccp_inst = this;
                        ccp_mode = 'copy_node';
                        this.trigger('copy', { 'node': obj });
                    },
                    get_buffer: function () {
                        return {
                            'mode': ccp_mode,
                            'node': ccp_node,
                            'inst': ccp_inst
                        };
                    },
                    can_paste: function () {
                        return ccp_mode !== false && ccp_node !== false;
                    },
                    paste: function (obj, pos) {
                        obj = this.get_node(obj);
                        if (!obj || !ccp_mode || !ccp_mode.match(/^(copy_node|move_node)$/) || !ccp_node) {
                            return false;
                        }
                        if (this[ccp_mode](ccp_node, obj, pos, false, false, false, ccp_inst)) {
                            this.trigger('paste', {
                                'parent': obj.id,
                                'node': ccp_node,
                                'mode': ccp_mode
                            });
                        }
                        ccp_node = false;
                        ccp_mode = false;
                        ccp_inst = false;
                    },
                    clear_buffer: function () {
                        ccp_node = false;
                        ccp_mode = false;
                        ccp_inst = false;
                        this.trigger('clear_buffer');
                    },
                    edit: function (obj, default_text, callback) {
                        var rtl, w, a, s, t, h1, h2, fn, tmp, cancel = false;
                        obj = this.get_node(obj);
                        if (!obj) {
                            return false;
                        }
                        if (this.settings.core.check_callback === false) {
                            this._data.core.last_error = {
                                'error': 'check',
                                'plugin': 'core',
                                'id': 'core_07',
                                'reason': 'Could not edit node because of check_callback'
                            };
                            this.settings.core.error.call(this, this._data.core.last_error);
                            return false;
                        }
                        tmp = obj;
                        default_text = typeof default_text === 'string' ? default_text : obj.text;
                        this.set_text(obj, '');
                        obj = this._open_to(obj);
                        tmp.text = default_text;
                        rtl = this._data.core.rtl;
                        w = this.element.width();
                        this._data.core.focused = tmp.id;
                        a = obj.children('.jstree-anchor').focus();
                        s = $('<span>');
                        t = default_text;
                        h1 = $('<' + 'div />', {
                            css: {
                                'position': 'absolute',
                                'top': '-200px',
                                'left': rtl ? '0px' : '-1000px',
                                'visibility': 'hidden'
                            }
                        }).appendTo('body');
                        h2 = $('<' + 'input />', {
                            'value': t,
                            'class': 'jstree-rename-input',
                            'css': {
                                'padding': '0',
                                'border': '1px solid silver',
                                'box-sizing': 'border-box',
                                'display': 'inline-block',
                                'height': this._data.core.li_height + 'px',
                                'lineHeight': this._data.core.li_height + 'px',
                                'width': '150px'
                            },
                            'blur': $.proxy(function (e) {
                                e.stopImmediatePropagation();
                                e.preventDefault();
                                var i = s.children('.jstree-rename-input'), v = i.val(), f = this.settings.core.force_text, nv;
                                if (v === '') {
                                    v = t;
                                }
                                h1.remove();
                                s.replaceWith(a);
                                s.remove();
                                t = f ? t : $('<div></div>').append($.parseHTML(t)).html();
                                this.set_text(obj, t);
                                nv = !!this.rename_node(obj, f ? $('<div></div>').text(v).text() : $('<div></div>').append($.parseHTML(v)).html());
                                if (!nv) {
                                    this.set_text(obj, t);
                                }
                                this._data.core.focused = tmp.id;
                                setTimeout($.proxy(function () {
                                    var node = this.get_node(tmp.id, true);
                                    if (node.length) {
                                        this._data.core.focused = tmp.id;
                                        node.children('.jstree-anchor').focus();
                                    }
                                }, this), 0);
                                if (callback) {
                                    callback.call(this, tmp, nv, cancel);
                                }
                                h2 = null;
                            }, this),
                            'keydown': function (e) {
                                var key = e.which;
                                if (key === 27) {
                                    cancel = true;
                                    this.value = t;
                                }
                                if (key === 27 || key === 13 || key === 37 || key === 38 || key === 39 || key === 40 || key === 32) {
                                    e.stopImmediatePropagation();
                                }
                                if (key === 27 || key === 13) {
                                    e.preventDefault();
                                    this.blur();
                                }
                            },
                            'click': function (e) {
                                e.stopImmediatePropagation();
                            },
                            'mousedown': function (e) {
                                e.stopImmediatePropagation();
                            },
                            'keyup': function (e) {
                                h2.width(Math.min(h1.text('pW' + this.value).width(), w));
                            },
                            'keypress': function (e) {
                                if (e.which === 13) {
                                    return false;
                                }
                            }
                        });
                        fn = {
                            fontFamily: a.css('fontFamily') || '',
                            fontSize: a.css('fontSize') || '',
                            fontWeight: a.css('fontWeight') || '',
                            fontStyle: a.css('fontStyle') || '',
                            fontStretch: a.css('fontStretch') || '',
                            fontVariant: a.css('fontVariant') || '',
                            letterSpacing: a.css('letterSpacing') || '',
                            wordSpacing: a.css('wordSpacing') || ''
                        };
                        s.attr('class', a.attr('class')).append(a.contents().clone()).append(h2);
                        a.replaceWith(s);
                        h1.css(fn);
                        h2.css(fn).width(Math.min(h1.text('pW' + h2[0].value).width(), w))[0].select();
                        $(document).one('mousedown.jstree touchstart.jstree dnd_start.vakata', function (e) {
                            if (h2 && e.target !== h2) {
                                $(h2).blur();
                            }
                        });
                    },
                    set_theme: function (theme_name, theme_url) {
                        if (!theme_name) {
                            return false;
                        }
                        if (theme_url === true) {
                            var dir = this.settings.core.themes.dir;
                            if (!dir) {
                                dir = $.jstree.path + '/themes';
                            }
                            theme_url = dir + '/' + theme_name + '/style.css';
                        }
                        if (theme_url && $.inArray(theme_url, themes_loaded) === -1) {
                            $('head').append('<' + 'link rel="stylesheet" href="' + theme_url + '" type="text/css" />');
                            themes_loaded.push(theme_url);
                        }
                        if (this._data.core.themes.name) {
                            this.element.removeClass('jstree-' + this._data.core.themes.name);
                        }
                        this._data.core.themes.name = theme_name;
                        this.element.addClass('jstree-' + theme_name);
                        this.element[this.settings.core.themes.responsive ? 'addClass' : 'removeClass']('jstree-' + theme_name + '-responsive');
                        this.trigger('set_theme', { 'theme': theme_name });
                    },
                    get_theme: function () {
                        return this._data.core.themes.name;
                    },
                    set_theme_variant: function (variant_name) {
                        if (this._data.core.themes.variant) {
                            this.element.removeClass('jstree-' + this._data.core.themes.name + '-' + this._data.core.themes.variant);
                        }
                        this._data.core.themes.variant = variant_name;
                        if (variant_name) {
                            this.element.addClass('jstree-' + this._data.core.themes.name + '-' + this._data.core.themes.variant);
                        }
                    },
                    get_theme_variant: function () {
                        return this._data.core.themes.variant;
                    },
                    show_stripes: function () {
                        this._data.core.themes.stripes = true;
                        this.get_container_ul().addClass('jstree-striped');
                        this.trigger('show_stripes');
                    },
                    hide_stripes: function () {
                        this._data.core.themes.stripes = false;
                        this.get_container_ul().removeClass('jstree-striped');
                        this.trigger('hide_stripes');
                    },
                    toggle_stripes: function () {
                        if (this._data.core.themes.stripes) {
                            this.hide_stripes();
                        } else {
                            this.show_stripes();
                        }
                    },
                    show_dots: function () {
                        this._data.core.themes.dots = true;
                        this.get_container_ul().removeClass('jstree-no-dots');
                        this.trigger('show_dots');
                    },
                    hide_dots: function () {
                        this._data.core.themes.dots = false;
                        this.get_container_ul().addClass('jstree-no-dots');
                        this.trigger('hide_dots');
                    },
                    toggle_dots: function () {
                        if (this._data.core.themes.dots) {
                            this.hide_dots();
                        } else {
                            this.show_dots();
                        }
                    },
                    show_icons: function () {
                        this._data.core.themes.icons = true;
                        this.get_container_ul().removeClass('jstree-no-icons');
                        this.trigger('show_icons');
                    },
                    hide_icons: function () {
                        this._data.core.themes.icons = false;
                        this.get_container_ul().addClass('jstree-no-icons');
                        this.trigger('hide_icons');
                    },
                    toggle_icons: function () {
                        if (this._data.core.themes.icons) {
                            this.hide_icons();
                        } else {
                            this.show_icons();
                        }
                    },
                    show_ellipsis: function () {
                        this._data.core.themes.ellipsis = true;
                        this.get_container_ul().addClass('jstree-ellipsis');
                        this.trigger('show_ellipsis');
                    },
                    hide_ellipsis: function () {
                        this._data.core.themes.ellipsis = false;
                        this.get_container_ul().removeClass('jstree-ellipsis');
                        this.trigger('hide_ellipsis');
                    },
                    toggle_ellipsis: function () {
                        if (this._data.core.themes.ellipsis) {
                            this.hide_ellipsis();
                        } else {
                            this.show_ellipsis();
                        }
                    },
                    set_icon: function (obj, icon) {
                        var t1, t2, dom, old;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.set_icon(obj[t1], icon);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        old = obj.icon;
                        obj.icon = icon === true || icon === null || icon === undefined || icon === '' ? true : icon;
                        dom = this.get_node(obj, true).children('.jstree-anchor').children('.jstree-themeicon');
                        if (icon === false) {
                            this.hide_icon(obj);
                        } else if (icon === true || icon === null || icon === undefined || icon === '') {
                            dom.removeClass('jstree-themeicon-custom ' + old).css('background', '').removeAttr('rel');
                            if (old === false) {
                                this.show_icon(obj);
                            }
                        } else if (icon.indexOf('/') === -1 && icon.indexOf('.') === -1) {
                            dom.removeClass(old).css('background', '');
                            dom.addClass(icon + ' jstree-themeicon-custom').attr('rel', icon);
                            if (old === false) {
                                this.show_icon(obj);
                            }
                        } else {
                            dom.removeClass(old).css('background', '');
                            dom.addClass('jstree-themeicon-custom').css('background', 'url(\'' + icon + '\') center center no-repeat').attr('rel', icon);
                            if (old === false) {
                                this.show_icon(obj);
                            }
                        }
                        return true;
                    },
                    get_icon: function (obj) {
                        obj = this.get_node(obj);
                        return !obj || obj.id === $.jstree.root ? false : obj.icon;
                    },
                    hide_icon: function (obj) {
                        var t1, t2;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.hide_icon(obj[t1]);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj === $.jstree.root) {
                            return false;
                        }
                        obj.icon = false;
                        this.get_node(obj, true).children('.jstree-anchor').children('.jstree-themeicon').addClass('jstree-themeicon-hidden');
                        return true;
                    },
                    show_icon: function (obj) {
                        var t1, t2, dom;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.show_icon(obj[t1]);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj === $.jstree.root) {
                            return false;
                        }
                        dom = this.get_node(obj, true);
                        obj.icon = dom.length ? dom.children('.jstree-anchor').children('.jstree-themeicon').attr('rel') : true;
                        if (!obj.icon) {
                            obj.icon = true;
                        }
                        dom.children('.jstree-anchor').children('.jstree-themeicon').removeClass('jstree-themeicon-hidden');
                        return true;
                    }
                };
                $.vakata = {};
                $.vakata.attributes = function (node, with_values) {
                    node = $(node)[0];
                    var attr = with_values ? {} : [];
                    if (node && node.attributes) {
                        $.each(node.attributes, function (i, v) {
                            if ($.inArray(v.name.toLowerCase(), [
                                    'style',
                                    'contenteditable',
                                    'hasfocus',
                                    'tabindex'
                                ]) !== -1) {
                                return;
                            }
                            if (v.value !== null && $.trim(v.value) !== '') {
                                if (with_values) {
                                    attr[v.name] = v.value;
                                } else {
                                    attr.push(v.name);
                                }
                            }
                        });
                    }
                    return attr;
                };
                $.vakata.array_unique = function (array) {
                    var a = [], i, j, l, o = {};
                    for (i = 0, l = array.length; i < l; i++) {
                        if (o[array[i]] === undefined) {
                            a.push(array[i]);
                            o[array[i]] = true;
                        }
                    }
                    return a;
                };
                $.vakata.array_remove = function (array, from) {
                    array.splice(from, 1);
                    return array;
                };
                $.vakata.array_remove_item = function (array, item) {
                    var tmp = $.inArray(item, array);
                    return tmp !== -1 ? $.vakata.array_remove(array, tmp) : array;
                };
                $.vakata.array_filter = function (c, a, b, d, e) {
                    if (c.filter) {
                        return c.filter(a, b);
                    }
                    d = [];
                    for (e in c) {
                        if (~~e + '' === e + '' && e >= 0 && a.call(b, c[e], +e, c)) {
                            d.push(c[e]);
                        }
                    }
                    return d;
                };
                $.jstree.plugins.changed = function (options, parent) {
                    var last = [];
                    this.trigger = function (ev, data) {
                        var i, j;
                        if (!data) {
                            data = {};
                        }
                        if (ev.replace('.jstree', '') === 'changed') {
                            data.changed = {
                                selected: [],
                                deselected: []
                            };
                            var tmp = {};
                            for (i = 0, j = last.length; i < j; i++) {
                                tmp[last[i]] = 1;
                            }
                            for (i = 0, j = data.selected.length; i < j; i++) {
                                if (!tmp[data.selected[i]]) {
                                    data.changed.selected.push(data.selected[i]);
                                } else {
                                    tmp[data.selected[i]] = 2;
                                }
                            }
                            for (i = 0, j = last.length; i < j; i++) {
                                if (tmp[last[i]] === 1) {
                                    data.changed.deselected.push(last[i]);
                                }
                            }
                            last = data.selected.slice();
                        }
                        parent.trigger.call(this, ev, data);
                    };
                    this.refresh = function (skip_loading, forget_state) {
                        last = [];
                        return parent.refresh.apply(this, arguments);
                    };
                };
                var _i = document.createElement('I');
                _i.className = 'jstree-icon jstree-checkbox';
                _i.setAttribute('role', 'presentation');
                $.jstree.defaults.checkbox = {
                    visible: true,
                    three_state: true,
                    whole_node: true,
                    keep_selected_style: true,
                    cascade: '',
                    tie_selection: true
                };
                $.jstree.plugins.checkbox = function (options, parent) {
                    this.bind = function () {
                        parent.bind.call(this);
                        this._data.checkbox.uto = false;
                        this._data.checkbox.selected = [];
                        if (this.settings.checkbox.three_state) {
                            this.settings.checkbox.cascade = 'up+down+undetermined';
                        }
                        this.element.on('init.jstree', $.proxy(function () {
                            this._data.checkbox.visible = this.settings.checkbox.visible;
                            if (!this.settings.checkbox.keep_selected_style) {
                                this.element.addClass('jstree-checkbox-no-clicked');
                            }
                            if (this.settings.checkbox.tie_selection) {
                                this.element.addClass('jstree-checkbox-selection');
                            }
                        }, this)).on('loading.jstree', $.proxy(function () {
                            this[this._data.checkbox.visible ? 'show_checkboxes' : 'hide_checkboxes']();
                        }, this));
                        if (this.settings.checkbox.cascade.indexOf('undetermined') !== -1) {
                            this.element.on('changed.jstree uncheck_node.jstree check_node.jstree uncheck_all.jstree check_all.jstree move_node.jstree copy_node.jstree redraw.jstree open_node.jstree', $.proxy(function () {
                                if (this._data.checkbox.uto) {
                                    clearTimeout(this._data.checkbox.uto);
                                }
                                this._data.checkbox.uto = setTimeout($.proxy(this._undetermined, this), 50);
                            }, this));
                        }
                        if (!this.settings.checkbox.tie_selection) {
                            this.element.on('model.jstree', $.proxy(function (e, data) {
                                var m = this._model.data, p = m[data.parent], dpc = data.nodes, i, j;
                                for (i = 0, j = dpc.length; i < j; i++) {
                                    m[dpc[i]].state.checked = m[dpc[i]].state.checked || m[dpc[i]].original && m[dpc[i]].original.state && m[dpc[i]].original.state.checked;
                                    if (m[dpc[i]].state.checked) {
                                        this._data.checkbox.selected.push(dpc[i]);
                                    }
                                }
                            }, this));
                        }
                        if (this.settings.checkbox.cascade.indexOf('up') !== -1 || this.settings.checkbox.cascade.indexOf('down') !== -1) {
                            this.element.on('model.jstree', $.proxy(function (e, data) {
                                var m = this._model.data, p = m[data.parent], dpc = data.nodes, chd = [], c, i, j, k, l, tmp, s = this.settings.checkbox.cascade, t = this.settings.checkbox.tie_selection;
                                if (s.indexOf('down') !== -1) {
                                    if (p.state[t ? 'selected' : 'checked']) {
                                        for (i = 0, j = dpc.length; i < j; i++) {
                                            m[dpc[i]].state[t ? 'selected' : 'checked'] = true;
                                        }
                                        this._data[t ? 'core' : 'checkbox'].selected = this._data[t ? 'core' : 'checkbox'].selected.concat(dpc);
                                    } else {
                                        for (i = 0, j = dpc.length; i < j; i++) {
                                            if (m[dpc[i]].state[t ? 'selected' : 'checked']) {
                                                for (k = 0, l = m[dpc[i]].children_d.length; k < l; k++) {
                                                    m[m[dpc[i]].children_d[k]].state[t ? 'selected' : 'checked'] = true;
                                                }
                                                this._data[t ? 'core' : 'checkbox'].selected = this._data[t ? 'core' : 'checkbox'].selected.concat(m[dpc[i]].children_d);
                                            }
                                        }
                                    }
                                }
                                if (s.indexOf('up') !== -1) {
                                    for (i = 0, j = p.children_d.length; i < j; i++) {
                                        if (!m[p.children_d[i]].children.length) {
                                            chd.push(m[p.children_d[i]].parent);
                                        }
                                    }
                                    chd = $.vakata.array_unique(chd);
                                    for (k = 0, l = chd.length; k < l; k++) {
                                        p = m[chd[k]];
                                        while (p && p.id !== $.jstree.root) {
                                            c = 0;
                                            for (i = 0, j = p.children.length; i < j; i++) {
                                                c += m[p.children[i]].state[t ? 'selected' : 'checked'];
                                            }
                                            if (c === j) {
                                                p.state[t ? 'selected' : 'checked'] = true;
                                                this._data[t ? 'core' : 'checkbox'].selected.push(p.id);
                                                tmp = this.get_node(p, true);
                                                if (tmp && tmp.length) {
                                                    tmp.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
                                                }
                                            } else {
                                                break;
                                            }
                                            p = this.get_node(p.parent);
                                        }
                                    }
                                }
                                this._data[t ? 'core' : 'checkbox'].selected = $.vakata.array_unique(this._data[t ? 'core' : 'checkbox'].selected);
                            }, this)).on(this.settings.checkbox.tie_selection ? 'select_node.jstree' : 'check_node.jstree', $.proxy(function (e, data) {
                                var obj = data.node, m = this._model.data, par = this.get_node(obj.parent), dom = this.get_node(obj, true), i, j, c, tmp, s = this.settings.checkbox.cascade, t = this.settings.checkbox.tie_selection, sel = {}, cur = this._data[t ? 'core' : 'checkbox'].selected;
                                for (i = 0, j = cur.length; i < j; i++) {
                                    sel[cur[i]] = true;
                                }
                                if (s.indexOf('down') !== -1) {
                                    for (i = 0, j = obj.children_d.length; i < j; i++) {
                                        sel[obj.children_d[i]] = true;
                                        tmp = m[obj.children_d[i]];
                                        tmp.state[t ? 'selected' : 'checked'] = true;
                                        if (tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined) {
                                            tmp.original.state.undetermined = false;
                                        }
                                    }
                                }
                                if (s.indexOf('up') !== -1) {
                                    while (par && par.id !== $.jstree.root) {
                                        c = 0;
                                        for (i = 0, j = par.children.length; i < j; i++) {
                                            c += m[par.children[i]].state[t ? 'selected' : 'checked'];
                                        }
                                        if (c === j) {
                                            par.state[t ? 'selected' : 'checked'] = true;
                                            sel[par.id] = true;
                                            tmp = this.get_node(par, true);
                                            if (tmp && tmp.length) {
                                                tmp.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
                                            }
                                        } else {
                                            break;
                                        }
                                        par = this.get_node(par.parent);
                                    }
                                }
                                cur = [];
                                for (i in sel) {
                                    if (sel.hasOwnProperty(i)) {
                                        cur.push(i);
                                    }
                                }
                                this._data[t ? 'core' : 'checkbox'].selected = cur;
                                if (s.indexOf('down') !== -1 && dom.length) {
                                    dom.find('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked').parent().attr('aria-selected', true);
                                }
                            }, this)).on(this.settings.checkbox.tie_selection ? 'deselect_all.jstree' : 'uncheck_all.jstree', $.proxy(function (e, data) {
                                var obj = this.get_node($.jstree.root), m = this._model.data, i, j, tmp;
                                for (i = 0, j = obj.children_d.length; i < j; i++) {
                                    tmp = m[obj.children_d[i]];
                                    if (tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined) {
                                        tmp.original.state.undetermined = false;
                                    }
                                }
                            }, this)).on(this.settings.checkbox.tie_selection ? 'deselect_node.jstree' : 'uncheck_node.jstree', $.proxy(function (e, data) {
                                var obj = data.node, dom = this.get_node(obj, true), i, j, tmp, s = this.settings.checkbox.cascade, t = this.settings.checkbox.tie_selection, cur = this._data[t ? 'core' : 'checkbox'].selected, sel = {};
                                if (obj && obj.original && obj.original.state && obj.original.state.undetermined) {
                                    obj.original.state.undetermined = false;
                                }
                                if (s.indexOf('down') !== -1) {
                                    for (i = 0, j = obj.children_d.length; i < j; i++) {
                                        tmp = this._model.data[obj.children_d[i]];
                                        tmp.state[t ? 'selected' : 'checked'] = false;
                                        if (tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined) {
                                            tmp.original.state.undetermined = false;
                                        }
                                    }
                                }
                                if (s.indexOf('up') !== -1) {
                                    for (i = 0, j = obj.parents.length; i < j; i++) {
                                        tmp = this._model.data[obj.parents[i]];
                                        tmp.state[t ? 'selected' : 'checked'] = false;
                                        if (tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined) {
                                            tmp.original.state.undetermined = false;
                                        }
                                        tmp = this.get_node(obj.parents[i], true);
                                        if (tmp && tmp.length) {
                                            tmp.attr('aria-selected', false).children('.jstree-anchor').removeClass(t ? 'jstree-clicked' : 'jstree-checked');
                                        }
                                    }
                                }
                                sel = {};
                                for (i = 0, j = cur.length; i < j; i++) {
                                    if ((s.indexOf('down') === -1 || $.inArray(cur[i], obj.children_d) === -1) && (s.indexOf('up') === -1 || $.inArray(cur[i], obj.parents) === -1)) {
                                        sel[cur[i]] = true;
                                    }
                                }
                                cur = [];
                                for (i in sel) {
                                    if (sel.hasOwnProperty(i)) {
                                        cur.push(i);
                                    }
                                }
                                this._data[t ? 'core' : 'checkbox'].selected = cur;
                                if (s.indexOf('down') !== -1 && dom.length) {
                                    dom.find('.jstree-anchor').removeClass(t ? 'jstree-clicked' : 'jstree-checked').parent().attr('aria-selected', false);
                                }
                            }, this));
                        }
                        if (this.settings.checkbox.cascade.indexOf('up') !== -1) {
                            this.element.on('delete_node.jstree', $.proxy(function (e, data) {
                                var p = this.get_node(data.parent), m = this._model.data, i, j, c, tmp, t = this.settings.checkbox.tie_selection;
                                while (p && p.id !== $.jstree.root && !p.state[t ? 'selected' : 'checked']) {
                                    c = 0;
                                    for (i = 0, j = p.children.length; i < j; i++) {
                                        c += m[p.children[i]].state[t ? 'selected' : 'checked'];
                                    }
                                    if (j > 0 && c === j) {
                                        p.state[t ? 'selected' : 'checked'] = true;
                                        this._data[t ? 'core' : 'checkbox'].selected.push(p.id);
                                        tmp = this.get_node(p, true);
                                        if (tmp && tmp.length) {
                                            tmp.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
                                        }
                                    } else {
                                        break;
                                    }
                                    p = this.get_node(p.parent);
                                }
                            }, this)).on('move_node.jstree', $.proxy(function (e, data) {
                                var is_multi = data.is_multi, old_par = data.old_parent, new_par = this.get_node(data.parent), m = this._model.data, p, c, i, j, tmp, t = this.settings.checkbox.tie_selection;
                                if (!is_multi) {
                                    p = this.get_node(old_par);
                                    while (p && p.id !== $.jstree.root && !p.state[t ? 'selected' : 'checked']) {
                                        c = 0;
                                        for (i = 0, j = p.children.length; i < j; i++) {
                                            c += m[p.children[i]].state[t ? 'selected' : 'checked'];
                                        }
                                        if (j > 0 && c === j) {
                                            p.state[t ? 'selected' : 'checked'] = true;
                                            this._data[t ? 'core' : 'checkbox'].selected.push(p.id);
                                            tmp = this.get_node(p, true);
                                            if (tmp && tmp.length) {
                                                tmp.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
                                            }
                                        } else {
                                            break;
                                        }
                                        p = this.get_node(p.parent);
                                    }
                                }
                                p = new_par;
                                while (p && p.id !== $.jstree.root) {
                                    c = 0;
                                    for (i = 0, j = p.children.length; i < j; i++) {
                                        c += m[p.children[i]].state[t ? 'selected' : 'checked'];
                                    }
                                    if (c === j) {
                                        if (!p.state[t ? 'selected' : 'checked']) {
                                            p.state[t ? 'selected' : 'checked'] = true;
                                            this._data[t ? 'core' : 'checkbox'].selected.push(p.id);
                                            tmp = this.get_node(p, true);
                                            if (tmp && tmp.length) {
                                                tmp.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
                                            }
                                        }
                                    } else {
                                        if (p.state[t ? 'selected' : 'checked']) {
                                            p.state[t ? 'selected' : 'checked'] = false;
                                            this._data[t ? 'core' : 'checkbox'].selected = $.vakata.array_remove_item(this._data[t ? 'core' : 'checkbox'].selected, p.id);
                                            tmp = this.get_node(p, true);
                                            if (tmp && tmp.length) {
                                                tmp.attr('aria-selected', false).children('.jstree-anchor').removeClass(t ? 'jstree-clicked' : 'jstree-checked');
                                            }
                                        } else {
                                            break;
                                        }
                                    }
                                    p = this.get_node(p.parent);
                                }
                            }, this));
                        }
                    };
                    this._undetermined = function () {
                        if (this.element === null) {
                            return;
                        }
                        var i, j, k, l, o = {}, m = this._model.data, t = this.settings.checkbox.tie_selection, s = this._data[t ? 'core' : 'checkbox'].selected, p = [], tt = this;
                        for (i = 0, j = s.length; i < j; i++) {
                            if (m[s[i]] && m[s[i]].parents) {
                                for (k = 0, l = m[s[i]].parents.length; k < l; k++) {
                                    if (o[m[s[i]].parents[k]] !== undefined) {
                                        break;
                                    }
                                    if (m[s[i]].parents[k] !== $.jstree.root) {
                                        o[m[s[i]].parents[k]] = true;
                                        p.push(m[s[i]].parents[k]);
                                    }
                                }
                            }
                        }
                        this.element.find('.jstree-closed').not(':has(.jstree-children)').each(function () {
                            var tmp = tt.get_node(this), tmp2;
                            if (!tmp.state.loaded) {
                                if (tmp.original && tmp.original.state && tmp.original.state.undetermined && tmp.original.state.undetermined === true) {
                                    if (o[tmp.id] === undefined && tmp.id !== $.jstree.root) {
                                        o[tmp.id] = true;
                                        p.push(tmp.id);
                                    }
                                    for (k = 0, l = tmp.parents.length; k < l; k++) {
                                        if (o[tmp.parents[k]] === undefined && tmp.parents[k] !== $.jstree.root) {
                                            o[tmp.parents[k]] = true;
                                            p.push(tmp.parents[k]);
                                        }
                                    }
                                }
                            } else {
                                for (i = 0, j = tmp.children_d.length; i < j; i++) {
                                    tmp2 = m[tmp.children_d[i]];
                                    if (!tmp2.state.loaded && tmp2.original && tmp2.original.state && tmp2.original.state.undetermined && tmp2.original.state.undetermined === true) {
                                        if (o[tmp2.id] === undefined && tmp2.id !== $.jstree.root) {
                                            o[tmp2.id] = true;
                                            p.push(tmp2.id);
                                        }
                                        for (k = 0, l = tmp2.parents.length; k < l; k++) {
                                            if (o[tmp2.parents[k]] === undefined && tmp2.parents[k] !== $.jstree.root) {
                                                o[tmp2.parents[k]] = true;
                                                p.push(tmp2.parents[k]);
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        this.element.find('.jstree-undetermined').removeClass('jstree-undetermined');
                        for (i = 0, j = p.length; i < j; i++) {
                            if (!m[p[i]].state[t ? 'selected' : 'checked']) {
                                s = this.get_node(p[i], true);
                                if (s && s.length) {
                                    s.children('.jstree-anchor').children('.jstree-checkbox').addClass('jstree-undetermined');
                                }
                            }
                        }
                    };
                    this.redraw_node = function (obj, deep, is_callback, force_render) {
                        obj = parent.redraw_node.apply(this, arguments);
                        if (obj) {
                            var i, j, tmp = null, icon = null;
                            for (i = 0, j = obj.childNodes.length; i < j; i++) {
                                if (obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf('jstree-anchor') !== -1) {
                                    tmp = obj.childNodes[i];
                                    break;
                                }
                            }
                            if (tmp) {
                                if (!this.settings.checkbox.tie_selection && this._model.data[obj.id].state.checked) {
                                    tmp.className += ' jstree-checked';
                                }
                                icon = _i.cloneNode(false);
                                if (this._model.data[obj.id].state.checkbox_disabled) {
                                    icon.className += ' jstree-checkbox-disabled';
                                }
                                tmp.insertBefore(icon, tmp.childNodes[0]);
                            }
                        }
                        if (!is_callback && this.settings.checkbox.cascade.indexOf('undetermined') !== -1) {
                            if (this._data.checkbox.uto) {
                                clearTimeout(this._data.checkbox.uto);
                            }
                            this._data.checkbox.uto = setTimeout($.proxy(this._undetermined, this), 50);
                        }
                        return obj;
                    };
                    this.show_checkboxes = function () {
                        this._data.core.themes.checkboxes = true;
                        this.get_container_ul().removeClass('jstree-no-checkboxes');
                    };
                    this.hide_checkboxes = function () {
                        this._data.core.themes.checkboxes = false;
                        this.get_container_ul().addClass('jstree-no-checkboxes');
                    };
                    this.toggle_checkboxes = function () {
                        if (this._data.core.themes.checkboxes) {
                            this.hide_checkboxes();
                        } else {
                            this.show_checkboxes();
                        }
                    };
                    this.is_undetermined = function (obj) {
                        obj = this.get_node(obj);
                        var s = this.settings.checkbox.cascade, i, j, t = this.settings.checkbox.tie_selection, d = this._data[t ? 'core' : 'checkbox'].selected, m = this._model.data;
                        if (!obj || obj.state[t ? 'selected' : 'checked'] === true || s.indexOf('undetermined') === -1 || s.indexOf('down') === -1 && s.indexOf('up') === -1) {
                            return false;
                        }
                        if (!obj.state.loaded && obj.original.state.undetermined === true) {
                            return true;
                        }
                        for (i = 0, j = obj.children_d.length; i < j; i++) {
                            if ($.inArray(obj.children_d[i], d) !== -1 || !m[obj.children_d[i]].state.loaded && m[obj.children_d[i]].original.state.undetermined) {
                                return true;
                            }
                        }
                        return false;
                    };
                    this.disable_checkbox = function (obj) {
                        var t1, t2, dom;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.disable_checkbox(obj[t1]);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        dom = this.get_node(obj, true);
                        if (!obj.state.checkbox_disabled) {
                            obj.state.checkbox_disabled = true;
                            if (dom && dom.length) {
                                dom.children('.jstree-anchor').children('.jstree-checkbox').addClass('jstree-checkbox-disabled');
                            }
                            this.trigger('disable_checkbox', { 'node': obj });
                        }
                    };
                    this.enable_checkbox = function (obj) {
                        var t1, t2, dom;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.enable_checkbox(obj[t1]);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        dom = this.get_node(obj, true);
                        if (obj.state.checkbox_disabled) {
                            obj.state.checkbox_disabled = false;
                            if (dom && dom.length) {
                                dom.children('.jstree-anchor').children('.jstree-checkbox').removeClass('jstree-checkbox-disabled');
                            }
                            this.trigger('enable_checkbox', { 'node': obj });
                        }
                    };
                    this.activate_node = function (obj, e) {
                        if ($(e.target).hasClass('jstree-checkbox-disabled')) {
                            return false;
                        }
                        if (this.settings.checkbox.tie_selection && (this.settings.checkbox.whole_node || $(e.target).hasClass('jstree-checkbox'))) {
                            e.ctrlKey = true;
                        }
                        if (this.settings.checkbox.tie_selection || !this.settings.checkbox.whole_node && !$(e.target).hasClass('jstree-checkbox')) {
                            return parent.activate_node.call(this, obj, e);
                        }
                        if (this.is_disabled(obj)) {
                            return false;
                        }
                        if (this.is_checked(obj)) {
                            this.uncheck_node(obj, e);
                        } else {
                            this.check_node(obj, e);
                        }
                        this.trigger('activate_node', { 'node': this.get_node(obj) });
                    };
                    this.check_node = function (obj, e) {
                        if (this.settings.checkbox.tie_selection) {
                            return this.select_node(obj, false, true, e);
                        }
                        var dom, t1, t2, th;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.check_node(obj[t1], e);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        dom = this.get_node(obj, true);
                        if (!obj.state.checked) {
                            obj.state.checked = true;
                            this._data.checkbox.selected.push(obj.id);
                            if (dom && dom.length) {
                                dom.children('.jstree-anchor').addClass('jstree-checked');
                            }
                            this.trigger('check_node', {
                                'node': obj,
                                'selected': this._data.checkbox.selected,
                                'event': e
                            });
                        }
                    };
                    this.uncheck_node = function (obj, e) {
                        if (this.settings.checkbox.tie_selection) {
                            return this.deselect_node(obj, false, e);
                        }
                        var t1, t2, dom;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.uncheck_node(obj[t1], e);
                            }
                            return true;
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        dom = this.get_node(obj, true);
                        if (obj.state.checked) {
                            obj.state.checked = false;
                            this._data.checkbox.selected = $.vakata.array_remove_item(this._data.checkbox.selected, obj.id);
                            if (dom.length) {
                                dom.children('.jstree-anchor').removeClass('jstree-checked');
                            }
                            this.trigger('uncheck_node', {
                                'node': obj,
                                'selected': this._data.checkbox.selected,
                                'event': e
                            });
                        }
                    };
                    this.check_all = function () {
                        if (this.settings.checkbox.tie_selection) {
                            return this.select_all();
                        }
                        var tmp = this._data.checkbox.selected.concat([]), i, j;
                        this._data.checkbox.selected = this._model.data[$.jstree.root].children_d.concat();
                        for (i = 0, j = this._data.checkbox.selected.length; i < j; i++) {
                            if (this._model.data[this._data.checkbox.selected[i]]) {
                                this._model.data[this._data.checkbox.selected[i]].state.checked = true;
                            }
                        }
                        this.redraw(true);
                        this.trigger('check_all', { 'selected': this._data.checkbox.selected });
                    };
                    this.uncheck_all = function () {
                        if (this.settings.checkbox.tie_selection) {
                            return this.deselect_all();
                        }
                        var tmp = this._data.checkbox.selected.concat([]), i, j;
                        for (i = 0, j = this._data.checkbox.selected.length; i < j; i++) {
                            if (this._model.data[this._data.checkbox.selected[i]]) {
                                this._model.data[this._data.checkbox.selected[i]].state.checked = false;
                            }
                        }
                        this._data.checkbox.selected = [];
                        this.element.find('.jstree-checked').removeClass('jstree-checked');
                        this.trigger('uncheck_all', {
                            'selected': this._data.checkbox.selected,
                            'node': tmp
                        });
                    };
                    this.is_checked = function (obj) {
                        if (this.settings.checkbox.tie_selection) {
                            return this.is_selected(obj);
                        }
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        return obj.state.checked;
                    };
                    this.get_checked = function (full) {
                        if (this.settings.checkbox.tie_selection) {
                            return this.get_selected(full);
                        }
                        return full ? $.map(this._data.checkbox.selected, $.proxy(function (i) {
                            return this.get_node(i);
                        }, this)) : this._data.checkbox.selected;
                    };
                    this.get_top_checked = function (full) {
                        if (this.settings.checkbox.tie_selection) {
                            return this.get_top_selected(full);
                        }
                        var tmp = this.get_checked(true), obj = {}, i, j, k, l;
                        for (i = 0, j = tmp.length; i < j; i++) {
                            obj[tmp[i].id] = tmp[i];
                        }
                        for (i = 0, j = tmp.length; i < j; i++) {
                            for (k = 0, l = tmp[i].children_d.length; k < l; k++) {
                                if (obj[tmp[i].children_d[k]]) {
                                    delete obj[tmp[i].children_d[k]];
                                }
                            }
                        }
                        tmp = [];
                        for (i in obj) {
                            if (obj.hasOwnProperty(i)) {
                                tmp.push(i);
                            }
                        }
                        return full ? $.map(tmp, $.proxy(function (i) {
                            return this.get_node(i);
                        }, this)) : tmp;
                    };
                    this.get_bottom_checked = function (full) {
                        if (this.settings.checkbox.tie_selection) {
                            return this.get_bottom_selected(full);
                        }
                        var tmp = this.get_checked(true), obj = [], i, j;
                        for (i = 0, j = tmp.length; i < j; i++) {
                            if (!tmp[i].children.length) {
                                obj.push(tmp[i].id);
                            }
                        }
                        return full ? $.map(obj, $.proxy(function (i) {
                            return this.get_node(i);
                        }, this)) : obj;
                    };
                    this.load_node = function (obj, callback) {
                        var k, l, i, j, c, tmp;
                        if (!$.isArray(obj) && !this.settings.checkbox.tie_selection) {
                            tmp = this.get_node(obj);
                            if (tmp && tmp.state.loaded) {
                                for (k = 0, l = tmp.children_d.length; k < l; k++) {
                                    if (this._model.data[tmp.children_d[k]].state.checked) {
                                        c = true;
                                        this._data.checkbox.selected = $.vakata.array_remove_item(this._data.checkbox.selected, tmp.children_d[k]);
                                    }
                                }
                            }
                        }
                        return parent.load_node.apply(this, arguments);
                    };
                    this.get_state = function () {
                        var state = parent.get_state.apply(this, arguments);
                        if (this.settings.checkbox.tie_selection) {
                            return state;
                        }
                        state.checkbox = this._data.checkbox.selected.slice();
                        return state;
                    };
                    this.set_state = function (state, callback) {
                        var res = parent.set_state.apply(this, arguments);
                        if (res && state.checkbox) {
                            if (!this.settings.checkbox.tie_selection) {
                                this.uncheck_all();
                                var _this = this;
                                $.each(state.checkbox, function (i, v) {
                                    _this.check_node(v);
                                });
                            }
                            delete state.checkbox;
                            this.set_state(state, callback);
                            return false;
                        }
                        return res;
                    };
                    this.refresh = function (skip_loading, forget_state) {
                        if (!this.settings.checkbox.tie_selection) {
                            this._data.checkbox.selected = [];
                        }
                        return parent.refresh.apply(this, arguments);
                    };
                };
                $.jstree.defaults.conditionalselect = function () {
                    return true;
                };
                $.jstree.plugins.conditionalselect = function (options, parent) {
                    this.activate_node = function (obj, e) {
                        if (this.settings.conditionalselect.call(this, this.get_node(obj), e)) {
                            parent.activate_node.call(this, obj, e);
                        }
                    };
                };
                $.jstree.defaults.contextmenu = {
                    select_node: true,
                    show_at_node: true,
                    items: function (o, cb) {
                        return {
                            'create': {
                                'separator_before': false,
                                'separator_after': true,
                                '_disabled': false,
                                'label': 'Create',
                                'action': function (data) {
                                    var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
                                    inst.create_node(obj, {}, 'last', function (new_node) {
                                        setTimeout(function () {
                                            inst.edit(new_node);
                                        }, 0);
                                    });
                                }
                            },
                            'rename': {
                                'separator_before': false,
                                'separator_after': false,
                                '_disabled': false,
                                'label': 'Rename',
                                'action': function (data) {
                                    var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
                                    inst.edit(obj);
                                }
                            },
                            'remove': {
                                'separator_before': false,
                                'icon': false,
                                'separator_after': false,
                                '_disabled': false,
                                'label': 'Delete',
                                'action': function (data) {
                                    var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
                                    if (inst.is_selected(obj)) {
                                        inst.delete_node(inst.get_selected());
                                    } else {
                                        inst.delete_node(obj);
                                    }
                                }
                            },
                            'ccp': {
                                'separator_before': true,
                                'icon': false,
                                'separator_after': false,
                                'label': 'Edit',
                                'action': false,
                                'submenu': {
                                    'cut': {
                                        'separator_before': false,
                                        'separator_after': false,
                                        'label': 'Cut',
                                        'action': function (data) {
                                            var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
                                            if (inst.is_selected(obj)) {
                                                inst.cut(inst.get_top_selected());
                                            } else {
                                                inst.cut(obj);
                                            }
                                        }
                                    },
                                    'copy': {
                                        'separator_before': false,
                                        'icon': false,
                                        'separator_after': false,
                                        'label': 'Copy',
                                        'action': function (data) {
                                            var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
                                            if (inst.is_selected(obj)) {
                                                inst.copy(inst.get_top_selected());
                                            } else {
                                                inst.copy(obj);
                                            }
                                        }
                                    },
                                    'paste': {
                                        'separator_before': false,
                                        'icon': false,
                                        '_disabled': function (data) {
                                            return !$.jstree.reference(data.reference).can_paste();
                                        },
                                        'separator_after': false,
                                        'label': 'Paste',
                                        'action': function (data) {
                                            var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
                                            inst.paste(obj);
                                        }
                                    }
                                }
                            }
                        };
                    }
                };
                $.jstree.plugins.contextmenu = function (options, parent) {
                    this.bind = function () {
                        parent.bind.call(this);
                        var last_ts = 0, cto = null, ex, ey;
                        this.element.on('contextmenu.jstree', '.jstree-anchor', $.proxy(function (e, data) {
                            if (e.target.tagName.toLowerCase() === 'input') {
                                return;
                            }
                            e.preventDefault();
                            last_ts = e.ctrlKey ? +new Date() : 0;
                            if (data || cto) {
                                last_ts = +new Date() + 10000;
                            }
                            if (cto) {
                                clearTimeout(cto);
                            }
                            if (!this.is_loading(e.currentTarget)) {
                                this.show_contextmenu(e.currentTarget, e.pageX, e.pageY, e);
                            }
                        }, this)).on('click.jstree', '.jstree-anchor', $.proxy(function (e) {
                            if (this._data.contextmenu.visible && (!last_ts || +new Date() - last_ts > 250)) {
                                $.vakata.context.hide();
                            }
                            last_ts = 0;
                        }, this)).on('touchstart.jstree', '.jstree-anchor', function (e) {
                            if (!e.originalEvent || !e.originalEvent.changedTouches || !e.originalEvent.changedTouches[0]) {
                                return;
                            }
                            ex = e.originalEvent.changedTouches[0].clientX;
                            ey = e.originalEvent.changedTouches[0].clientY;
                            cto = setTimeout(function () {
                                $(e.currentTarget).trigger('contextmenu', true);
                            }, 750);
                        }).on('touchmove.vakata.jstree', function (e) {
                            if (cto && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0] && (Math.abs(ex - e.originalEvent.changedTouches[0].clientX) > 50 || Math.abs(ey - e.originalEvent.changedTouches[0].clientY) > 50)) {
                                clearTimeout(cto);
                            }
                        }).on('touchend.vakata.jstree', function (e) {
                            if (cto) {
                                clearTimeout(cto);
                            }
                        });
                        $(document).on('context_hide.vakata.jstree', $.proxy(function (e, data) {
                            this._data.contextmenu.visible = false;
                            $(data.reference).removeClass('jstree-context');
                        }, this));
                    };
                    this.teardown = function () {
                        if (this._data.contextmenu.visible) {
                            $.vakata.context.hide();
                        }
                        parent.teardown.call(this);
                    };
                    this.show_contextmenu = function (obj, x, y, e) {
                        obj = this.get_node(obj);
                        if (!obj || obj.id === $.jstree.root) {
                            return false;
                        }
                        var s = this.settings.contextmenu, d = this.get_node(obj, true), a = d.children('.jstree-anchor'), o = false, i = false;
                        if (s.show_at_node || x === undefined || y === undefined) {
                            o = a.offset();
                            x = o.left;
                            y = o.top + this._data.core.li_height;
                        }
                        if (this.settings.contextmenu.select_node && !this.is_selected(obj)) {
                            this.activate_node(obj, e);
                        }
                        i = s.items;
                        if ($.isFunction(i)) {
                            i = i.call(this, obj, $.proxy(function (i) {
                                this._show_contextmenu(obj, x, y, i);
                            }, this));
                        }
                        if ($.isPlainObject(i)) {
                            this._show_contextmenu(obj, x, y, i);
                        }
                    };
                    this._show_contextmenu = function (obj, x, y, i) {
                        var d = this.get_node(obj, true), a = d.children('.jstree-anchor');
                        $(document).one('context_show.vakata.jstree', $.proxy(function (e, data) {
                            var cls = 'jstree-contextmenu jstree-' + this.get_theme() + '-contextmenu';
                            $(data.element).addClass(cls);
                            a.addClass('jstree-context');
                        }, this));
                        this._data.contextmenu.visible = true;
                        $.vakata.context.show(a, {
                            'x': x,
                            'y': y
                        }, i);
                        this.trigger('show_contextmenu', {
                            'node': obj,
                            'x': x,
                            'y': y
                        });
                    };
                };
                (function ($) {
                    var right_to_left = false, vakata_context = {
                            element: false,
                            reference: false,
                            position_x: 0,
                            position_y: 0,
                            items: [],
                            html: '',
                            is_visible: false
                        };
                    $.vakata.context = {
                        settings: {
                            hide_onmouseleave: 0,
                            icons: true
                        },
                        _trigger: function (event_name) {
                            $(document).triggerHandler('context_' + event_name + '.vakata', {
                                'reference': vakata_context.reference,
                                'element': vakata_context.element,
                                'position': {
                                    'x': vakata_context.position_x,
                                    'y': vakata_context.position_y
                                }
                            });
                        },
                        _execute: function (i) {
                            i = vakata_context.items[i];
                            return i && (!i._disabled || $.isFunction(i._disabled) && !i._disabled({
                                'item': i,
                                'reference': vakata_context.reference,
                                'element': vakata_context.element
                            })) && i.action ? i.action.call(null, {
                                'item': i,
                                'reference': vakata_context.reference,
                                'element': vakata_context.element,
                                'position': {
                                    'x': vakata_context.position_x,
                                    'y': vakata_context.position_y
                                }
                            }) : false;
                        },
                        _parse: function (o, is_callback) {
                            if (!o) {
                                return false;
                            }
                            if (!is_callback) {
                                vakata_context.html = '';
                                vakata_context.items = [];
                            }
                            var str = '', sep = false, tmp;
                            if (is_callback) {
                                str += '<' + 'ul>';
                            }
                            $.each(o, function (i, val) {
                                if (!val) {
                                    return true;
                                }
                                vakata_context.items.push(val);
                                if (!sep && val.separator_before) {
                                    str += '<' + 'li class=\'vakata-context-separator\'><' + 'a href=\'#\' ' + ($.vakata.context.settings.icons ? '' : 'style="margin-left:0px;"') + '>&#160;<' + '/a><' + '/li>';
                                }
                                sep = false;
                                str += '<' + 'li class=\'' + (val._class || '') + (val._disabled === true || $.isFunction(val._disabled) && val._disabled({
                                    'item': val,
                                    'reference': vakata_context.reference,
                                    'element': vakata_context.element
                                }) ? ' vakata-contextmenu-disabled ' : '') + '\' ' + (val.shortcut ? ' data-shortcut=\'' + val.shortcut + '\' ' : '') + '>';
                                str += '<' + 'a href=\'#\' rel=\'' + (vakata_context.items.length - 1) + '\' ' + (val.title ? 'title=\'' + val.title + '\'' : '') + '>';
                                if ($.vakata.context.settings.icons) {
                                    str += '<' + 'i ';
                                    if (val.icon) {
                                        if (val.icon.indexOf('/') !== -1 || val.icon.indexOf('.') !== -1) {
                                            str += ' style=\'background:url("' + val.icon + '") center center no-repeat\' ';
                                        } else {
                                            str += ' class=\'' + val.icon + '\' ';
                                        }
                                    }
                                    str += '><' + '/i><' + 'span class=\'vakata-contextmenu-sep\'>&#160;<' + '/span>';
                                }
                                str += ($.isFunction(val.label) ? val.label({
                                    'item': i,
                                    'reference': vakata_context.reference,
                                    'element': vakata_context.element
                                }) : val.label) + (val.shortcut ? ' <span class="vakata-contextmenu-shortcut vakata-contextmenu-shortcut-' + val.shortcut + '">' + (val.shortcut_label || '') + '</span>' : '') + '<' + '/a>';
                                if (val.submenu) {
                                    tmp = $.vakata.context._parse(val.submenu, true);
                                    if (tmp) {
                                        str += tmp;
                                    }
                                }
                                str += '<' + '/li>';
                                if (val.separator_after) {
                                    str += '<' + 'li class=\'vakata-context-separator\'><' + 'a href=\'#\' ' + ($.vakata.context.settings.icons ? '' : 'style="margin-left:0px;"') + '>&#160;<' + '/a><' + '/li>';
                                    sep = true;
                                }
                            });
                            str = str.replace(/<li class\='vakata-context-separator'\><\/li\>$/, '');
                            if (is_callback) {
                                str += '</ul>';
                            }
                            if (!is_callback) {
                                vakata_context.html = str;
                                $.vakata.context._trigger('parse');
                            }
                            return str.length > 10 ? str : false;
                        },
                        _show_submenu: function (o) {
                            o = $(o);
                            if (!o.length || !o.children('ul').length) {
                                return;
                            }
                            var e = o.children('ul'), xl = o.offset().left, x = xl + o.outerWidth(), y = o.offset().top, w = e.width(), h = e.height(), dw = $(window).width() + $(window).scrollLeft(), dh = $(window).height() + $(window).scrollTop();
                            if (right_to_left) {
                                o[x - (w + 10 + o.outerWidth()) < 0 ? 'addClass' : 'removeClass']('vakata-context-left');
                            } else {
                                o[x + w > dw && xl > dw - x ? 'addClass' : 'removeClass']('vakata-context-right');
                            }
                            if (y + h + 10 > dh) {
                                e.css('bottom', '-1px');
                            }
                            if (o.hasClass('vakata-context-right')) {
                                if (xl < w) {
                                    e.css('margin-right', xl - w);
                                }
                            } else {
                                if (dw - x < w) {
                                    e.css('margin-left', dw - x - w);
                                }
                            }
                            e.show();
                        },
                        show: function (reference, position, data) {
                            var o, e, x, y, w, h, dw, dh, cond = true;
                            if (vakata_context.element && vakata_context.element.length) {
                                vakata_context.element.width('');
                            }
                            switch (cond) {
                            case !position && !reference:
                                return false;
                            case !!position && !!reference:
                                vakata_context.reference = reference;
                                vakata_context.position_x = position.x;
                                vakata_context.position_y = position.y;
                                break;
                            case !position && !!reference:
                                vakata_context.reference = reference;
                                o = reference.offset();
                                vakata_context.position_x = o.left + reference.outerHeight();
                                vakata_context.position_y = o.top;
                                break;
                            case !!position && !reference:
                                vakata_context.position_x = position.x;
                                vakata_context.position_y = position.y;
                                break;
                            }
                            if (!!reference && !data && $(reference).data('vakata_contextmenu')) {
                                data = $(reference).data('vakata_contextmenu');
                            }
                            if ($.vakata.context._parse(data)) {
                                vakata_context.element.html(vakata_context.html);
                            }
                            if (vakata_context.items.length) {
                                vakata_context.element.appendTo('body');
                                e = vakata_context.element;
                                x = vakata_context.position_x;
                                y = vakata_context.position_y;
                                w = e.width();
                                h = e.height();
                                dw = $(window).width() + $(window).scrollLeft();
                                dh = $(window).height() + $(window).scrollTop();
                                if (right_to_left) {
                                    x -= e.outerWidth() - $(reference).outerWidth();
                                    if (x < $(window).scrollLeft() + 20) {
                                        x = $(window).scrollLeft() + 20;
                                    }
                                }
                                if (x + w + 20 > dw) {
                                    x = dw - (w + 20);
                                }
                                if (y + h + 20 > dh) {
                                    y = dh - (h + 20);
                                }
                                vakata_context.element.css({
                                    'left': x,
                                    'top': y
                                }).show().find('a').first().focus().parent().addClass('vakata-context-hover');
                                vakata_context.is_visible = true;
                                $.vakata.context._trigger('show');
                            }
                        },
                        hide: function () {
                            if (vakata_context.is_visible) {
                                vakata_context.element.hide().find('ul').hide().end().find(':focus').blur().end().detach();
                                vakata_context.is_visible = false;
                                $.vakata.context._trigger('hide');
                            }
                        }
                    };
                    $(function () {
                        right_to_left = $('body').css('direction') === 'rtl';
                        var to = false;
                        vakata_context.element = $('<ul class=\'vakata-context\'></ul>');
                        vakata_context.element.on('mouseenter', 'li', function (e) {
                            e.stopImmediatePropagation();
                            if ($.contains(this, e.relatedTarget)) {
                                return;
                            }
                            if (to) {
                                clearTimeout(to);
                            }
                            vakata_context.element.find('.vakata-context-hover').removeClass('vakata-context-hover').end();
                            $(this).siblings().find('ul').hide().end().end().parentsUntil('.vakata-context', 'li').addBack().addClass('vakata-context-hover');
                            $.vakata.context._show_submenu(this);
                        }).on('mouseleave', 'li', function (e) {
                            if ($.contains(this, e.relatedTarget)) {
                                return;
                            }
                            $(this).find('.vakata-context-hover').addBack().removeClass('vakata-context-hover');
                        }).on('mouseleave', function (e) {
                            $(this).find('.vakata-context-hover').removeClass('vakata-context-hover');
                            if ($.vakata.context.settings.hide_onmouseleave) {
                                to = setTimeout(function (t) {
                                    return function () {
                                        $.vakata.context.hide();
                                    };
                                }(this), $.vakata.context.settings.hide_onmouseleave);
                            }
                        }).on('click', 'a', function (e) {
                            e.preventDefault();
                            if (!$(this).blur().parent().hasClass('vakata-context-disabled') && $.vakata.context._execute($(this).attr('rel')) !== false) {
                                $.vakata.context.hide();
                            }
                        }).on('keydown', 'a', function (e) {
                            var o = null;
                            switch (e.which) {
                            case 13:
                            case 32:
                                e.type = 'click';
                                e.preventDefault();
                                $(e.currentTarget).trigger(e);
                                break;
                            case 37:
                                if (vakata_context.is_visible) {
                                    vakata_context.element.find('.vakata-context-hover').last().closest('li').first().find('ul').hide().find('.vakata-context-hover').removeClass('vakata-context-hover').end().end().children('a').focus();
                                    e.stopImmediatePropagation();
                                    e.preventDefault();
                                }
                                break;
                            case 38:
                                if (vakata_context.is_visible) {
                                    o = vakata_context.element.find('ul:visible').addBack().last().children('.vakata-context-hover').removeClass('vakata-context-hover').prevAll('li:not(.vakata-context-separator)').first();
                                    if (!o.length) {
                                        o = vakata_context.element.find('ul:visible').addBack().last().children('li:not(.vakata-context-separator)').last();
                                    }
                                    o.addClass('vakata-context-hover').children('a').focus();
                                    e.stopImmediatePropagation();
                                    e.preventDefault();
                                }
                                break;
                            case 39:
                                if (vakata_context.is_visible) {
                                    vakata_context.element.find('.vakata-context-hover').last().children('ul').show().children('li:not(.vakata-context-separator)').removeClass('vakata-context-hover').first().addClass('vakata-context-hover').children('a').focus();
                                    e.stopImmediatePropagation();
                                    e.preventDefault();
                                }
                                break;
                            case 40:
                                if (vakata_context.is_visible) {
                                    o = vakata_context.element.find('ul:visible').addBack().last().children('.vakata-context-hover').removeClass('vakata-context-hover').nextAll('li:not(.vakata-context-separator)').first();
                                    if (!o.length) {
                                        o = vakata_context.element.find('ul:visible').addBack().last().children('li:not(.vakata-context-separator)').first();
                                    }
                                    o.addClass('vakata-context-hover').children('a').focus();
                                    e.stopImmediatePropagation();
                                    e.preventDefault();
                                }
                                break;
                            case 27:
                                $.vakata.context.hide();
                                e.preventDefault();
                                break;
                            default:
                                break;
                            }
                        }).on('keydown', function (e) {
                            e.preventDefault();
                            var a = vakata_context.element.find('.vakata-contextmenu-shortcut-' + e.which).parent();
                            if (a.parent().not('.vakata-context-disabled')) {
                                a.click();
                            }
                        });
                        $(document).on('mousedown.vakata.jstree', function (e) {
                            if (vakata_context.is_visible && !$.contains(vakata_context.element[0], e.target)) {
                                $.vakata.context.hide();
                            }
                        }).on('context_show.vakata.jstree', function (e, data) {
                            vakata_context.element.find('li:has(ul)').children('a').addClass('vakata-context-parent');
                            if (right_to_left) {
                                vakata_context.element.addClass('vakata-context-rtl').css('direction', 'rtl');
                            }
                            vakata_context.element.find('ul').hide().end();
                        });
                    });
                }($));
                $.jstree.defaults.dnd = {
                    copy: true,
                    open_timeout: 500,
                    is_draggable: true,
                    check_while_dragging: true,
                    always_copy: false,
                    inside_pos: 0,
                    drag_selection: true,
                    touch: true,
                    large_drop_target: false,
                    large_drag_target: false,
                    use_html5: false
                };
                var drg, elm;
                $.jstree.plugins.dnd = function (options, parent) {
                    this.init = function (el, options) {
                        parent.init.call(this, el, options);
                        this.settings.dnd.use_html5 = this.settings.dnd.use_html5 && 'draggable' in document.createElement('span');
                    };
                    this.bind = function () {
                        parent.bind.call(this);
                        this.element.on(this.settings.dnd.use_html5 ? 'dragstart.jstree' : 'mousedown.jstree touchstart.jstree', this.settings.dnd.large_drag_target ? '.jstree-node' : '.jstree-anchor', $.proxy(function (e) {
                            if (this.settings.dnd.large_drag_target && $(e.target).closest('.jstree-node')[0] !== e.currentTarget) {
                                return true;
                            }
                            if (e.type === 'touchstart' && (!this.settings.dnd.touch || this.settings.dnd.touch === 'selected' && !$(e.currentTarget).closest('.jstree-node').children('.jstree-anchor').hasClass('jstree-clicked'))) {
                                return true;
                            }
                            var obj = this.get_node(e.target), mlt = this.is_selected(obj) && this.settings.dnd.drag_selection ? this.get_top_selected().length : 1, txt = mlt > 1 ? mlt + ' ' + this.get_string('nodes') : this.get_text(e.currentTarget);
                            if (this.settings.core.force_text) {
                                txt = $.vakata.html.escape(txt);
                            }
                            if (obj && obj.id && obj.id !== $.jstree.root && (e.which === 1 || e.type === 'touchstart' || e.type === 'dragstart') && (this.settings.dnd.is_draggable === true || $.isFunction(this.settings.dnd.is_draggable) && this.settings.dnd.is_draggable.call(this, mlt > 1 ? this.get_top_selected(true) : [obj], e))) {
                                drg = {
                                    'jstree': true,
                                    'origin': this,
                                    'obj': this.get_node(obj, true),
                                    'nodes': mlt > 1 ? this.get_top_selected() : [obj.id]
                                };
                                elm = e.currentTarget;
                                if (this.settings.dnd.use_html5) {
                                    $.vakata.dnd._trigger('start', e, {
                                        'helper': $(),
                                        'element': elm,
                                        'data': drg
                                    });
                                } else {
                                    this.element.trigger('mousedown.jstree');
                                    return $.vakata.dnd.start(e, drg, '<div id="jstree-dnd" class="jstree-' + this.get_theme() + ' jstree-' + this.get_theme() + '-' + this.get_theme_variant() + ' ' + (this.settings.core.themes.responsive ? ' jstree-dnd-responsive' : '') + '"><i class="jstree-icon jstree-er"></i>' + txt + '<ins class="jstree-copy" style="display:none;">+</ins></div>');
                                }
                            }
                        }, this));
                        if (this.settings.dnd.use_html5) {
                            this.element.on('dragover.jstree', function (e) {
                                e.preventDefault();
                                $.vakata.dnd._trigger('move', e, {
                                    'helper': $(),
                                    'element': elm,
                                    'data': drg
                                });
                                return false;
                            }).on('drop.jstree', $.proxy(function (e) {
                                e.preventDefault();
                                $.vakata.dnd._trigger('stop', e, {
                                    'helper': $(),
                                    'element': elm,
                                    'data': drg
                                });
                                return false;
                            }, this));
                        }
                    };
                    this.redraw_node = function (obj, deep, callback, force_render) {
                        obj = parent.redraw_node.apply(this, arguments);
                        if (obj && this.settings.dnd.use_html5) {
                            if (this.settings.dnd.large_drag_target) {
                                obj.setAttribute('draggable', true);
                            } else {
                                var i, j, tmp = null;
                                for (i = 0, j = obj.childNodes.length; i < j; i++) {
                                    if (obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf('jstree-anchor') !== -1) {
                                        tmp = obj.childNodes[i];
                                        break;
                                    }
                                }
                                if (tmp) {
                                    tmp.setAttribute('draggable', true);
                                }
                            }
                        }
                        return obj;
                    };
                };
                $(function () {
                    var lastmv = false, laster = false, lastev = false, opento = false, marker = $('<div id="jstree-marker">&#160;</div>').hide();
                    $(document).on('dnd_start.vakata.jstree', function (e, data) {
                        lastmv = false;
                        lastev = false;
                        if (!data || !data.data || !data.data.jstree) {
                            return;
                        }
                        marker.appendTo('body');
                    }).on('dnd_move.vakata.jstree', function (e, data) {
                        if (opento) {
                            if (!data.event || data.event.type !== 'dragover' || data.event.target !== lastev.target) {
                                clearTimeout(opento);
                            }
                        }
                        if (!data || !data.data || !data.data.jstree) {
                            return;
                        }
                        if (data.event.target.id && data.event.target.id === 'jstree-marker') {
                            return;
                        }
                        lastev = data.event;
                        var ins = $.jstree.reference(data.event.target), ref = false, off = false, rel = false, tmp, l, t, h, p, i, o, ok, t1, t2, op, ps, pr, ip, tm, is_copy, pn;
                        if (ins && ins._data && ins._data.dnd) {
                            marker.attr('class', 'jstree-' + ins.get_theme() + (ins.settings.core.themes.responsive ? ' jstree-dnd-responsive' : ''));
                            is_copy = data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey));
                            data.helper.children().attr('class', 'jstree-' + ins.get_theme() + ' jstree-' + ins.get_theme() + '-' + ins.get_theme_variant() + ' ' + (ins.settings.core.themes.responsive ? ' jstree-dnd-responsive' : '')).find('.jstree-copy').first()[is_copy ? 'show' : 'hide']();
                            if ((data.event.target === ins.element[0] || data.event.target === ins.get_container_ul()[0]) && ins.get_container_ul().children().length === 0) {
                                ok = true;
                                for (t1 = 0, t2 = data.data.nodes.length; t1 < t2; t1++) {
                                    ok = ok && ins.check(data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey)) ? 'copy_node' : 'move_node', data.data.origin && data.data.origin !== ins ? data.data.origin.get_node(data.data.nodes[t1]) : data.data.nodes[t1], $.jstree.root, 'last', {
                                        'dnd': true,
                                        'ref': ins.get_node($.jstree.root),
                                        'pos': 'i',
                                        'origin': data.data.origin,
                                        'is_multi': data.data.origin && data.data.origin !== ins,
                                        'is_foreign': !data.data.origin
                                    });
                                    if (!ok) {
                                        break;
                                    }
                                }
                                if (ok) {
                                    lastmv = {
                                        'ins': ins,
                                        'par': $.jstree.root,
                                        'pos': 'last'
                                    };
                                    marker.hide();
                                    data.helper.find('.jstree-icon').first().removeClass('jstree-er').addClass('jstree-ok');
                                    if (data.event.originalEvent && data.event.originalEvent.dataTransfer) {
                                        data.event.originalEvent.dataTransfer.dropEffect = is_copy ? 'copy' : 'move';
                                    }
                                    return;
                                }
                            } else {
                                ref = ins.settings.dnd.large_drop_target ? $(data.event.target).closest('.jstree-node').children('.jstree-anchor') : $(data.event.target).closest('.jstree-anchor');
                                if (ref && ref.length && ref.parent().is('.jstree-closed, .jstree-open, .jstree-leaf')) {
                                    off = ref.offset();
                                    rel = (data.event.pageY !== undefined ? data.event.pageY : data.event.originalEvent.pageY) - off.top;
                                    h = ref.outerHeight();
                                    if (rel < h / 3) {
                                        o = [
                                            'b',
                                            'i',
                                            'a'
                                        ];
                                    } else if (rel > h - h / 3) {
                                        o = [
                                            'a',
                                            'i',
                                            'b'
                                        ];
                                    } else {
                                        o = rel > h / 2 ? [
                                            'i',
                                            'a',
                                            'b'
                                        ] : [
                                            'i',
                                            'b',
                                            'a'
                                        ];
                                    }
                                    $.each(o, function (j, v) {
                                        switch (v) {
                                        case 'b':
                                            l = off.left - 6;
                                            t = off.top;
                                            p = ins.get_parent(ref);
                                            i = ref.parent().index();
                                            break;
                                        case 'i':
                                            ip = ins.settings.dnd.inside_pos;
                                            tm = ins.get_node(ref.parent());
                                            l = off.left - 2;
                                            t = off.top + h / 2 + 1;
                                            p = tm.id;
                                            i = ip === 'first' ? 0 : ip === 'last' ? tm.children.length : Math.min(ip, tm.children.length);
                                            break;
                                        case 'a':
                                            l = off.left - 6;
                                            t = off.top + h;
                                            p = ins.get_parent(ref);
                                            i = ref.parent().index() + 1;
                                            break;
                                        }
                                        ok = true;
                                        for (t1 = 0, t2 = data.data.nodes.length; t1 < t2; t1++) {
                                            op = data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey)) ? 'copy_node' : 'move_node';
                                            ps = i;
                                            if (op === 'move_node' && v === 'a' && (data.data.origin && data.data.origin === ins) && p === ins.get_parent(data.data.nodes[t1])) {
                                                pr = ins.get_node(p);
                                                if (ps > $.inArray(data.data.nodes[t1], pr.children)) {
                                                    ps -= 1;
                                                }
                                            }
                                            ok = ok && (ins && ins.settings && ins.settings.dnd && ins.settings.dnd.check_while_dragging === false || ins.check(op, data.data.origin && data.data.origin !== ins ? data.data.origin.get_node(data.data.nodes[t1]) : data.data.nodes[t1], p, ps, {
                                                'dnd': true,
                                                'ref': ins.get_node(ref.parent()),
                                                'pos': v,
                                                'origin': data.data.origin,
                                                'is_multi': data.data.origin && data.data.origin !== ins,
                                                'is_foreign': !data.data.origin
                                            }));
                                            if (!ok) {
                                                if (ins && ins.last_error) {
                                                    laster = ins.last_error();
                                                }
                                                break;
                                            }
                                        }
                                        if (v === 'i' && ref.parent().is('.jstree-closed') && ins.settings.dnd.open_timeout) {
                                            opento = setTimeout(function (x, z) {
                                                return function () {
                                                    x.open_node(z);
                                                };
                                            }(ins, ref), ins.settings.dnd.open_timeout);
                                        }
                                        if (ok) {
                                            pn = ins.get_node(p, true);
                                            if (!pn.hasClass('.jstree-dnd-parent')) {
                                                $('.jstree-dnd-parent').removeClass('jstree-dnd-parent');
                                                pn.addClass('jstree-dnd-parent');
                                            }
                                            lastmv = {
                                                'ins': ins,
                                                'par': p,
                                                'pos': v === 'i' && ip === 'last' && i === 0 && !ins.is_loaded(tm) ? 'last' : i
                                            };
                                            marker.css({
                                                'left': l + 'px',
                                                'top': t + 'px'
                                            }).show();
                                            data.helper.find('.jstree-icon').first().removeClass('jstree-er').addClass('jstree-ok');
                                            if (data.event.originalEvent && data.event.originalEvent.dataTransfer) {
                                                data.event.originalEvent.dataTransfer.dropEffect = is_copy ? 'copy' : 'move';
                                            }
                                            laster = {};
                                            o = true;
                                            return false;
                                        }
                                    });
                                    if (o === true) {
                                        return;
                                    }
                                }
                            }
                        }
                        $('.jstree-dnd-parent').removeClass('jstree-dnd-parent');
                        lastmv = false;
                        data.helper.find('.jstree-icon').removeClass('jstree-ok').addClass('jstree-er');
                        if (data.event.originalEvent && data.event.originalEvent.dataTransfer) {
                            data.event.originalEvent.dataTransfer.dropEffect = 'none';
                        }
                        marker.hide();
                    }).on('dnd_scroll.vakata.jstree', function (e, data) {
                        if (!data || !data.data || !data.data.jstree) {
                            return;
                        }
                        marker.hide();
                        lastmv = false;
                        lastev = false;
                        data.helper.find('.jstree-icon').first().removeClass('jstree-ok').addClass('jstree-er');
                    }).on('dnd_stop.vakata.jstree', function (e, data) {
                        $('.jstree-dnd-parent').removeClass('jstree-dnd-parent');
                        if (opento) {
                            clearTimeout(opento);
                        }
                        if (!data || !data.data || !data.data.jstree) {
                            return;
                        }
                        marker.hide().detach();
                        var i, j, nodes = [];
                        if (lastmv) {
                            for (i = 0, j = data.data.nodes.length; i < j; i++) {
                                nodes[i] = data.data.origin ? data.data.origin.get_node(data.data.nodes[i]) : data.data.nodes[i];
                            }
                            lastmv.ins[data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey)) ? 'copy_node' : 'move_node'](nodes, lastmv.par, lastmv.pos, false, false, false, data.data.origin);
                        } else {
                            i = $(data.event.target).closest('.jstree');
                            if (i.length && laster && laster.error && laster.error === 'check') {
                                i = i.jstree(true);
                                if (i) {
                                    i.settings.core.error.call(this, laster);
                                }
                            }
                        }
                        lastev = false;
                        lastmv = false;
                    }).on('keyup.jstree keydown.jstree', function (e, data) {
                        data = $.vakata.dnd._get();
                        if (data && data.data && data.data.jstree) {
                            if (e.type === 'keyup' && e.which === 27) {
                                if (opento) {
                                    clearTimeout(opento);
                                }
                                lastmv = false;
                                laster = false;
                                lastev = false;
                                opento = false;
                                marker.hide().detach();
                                $.vakata.dnd._clean();
                            } else {
                                data.helper.find('.jstree-copy').first()[data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (e.metaKey || e.ctrlKey)) ? 'show' : 'hide']();
                                if (lastev) {
                                    lastev.metaKey = e.metaKey;
                                    lastev.ctrlKey = e.ctrlKey;
                                    $.vakata.dnd._trigger('move', lastev);
                                }
                            }
                        }
                    });
                });
                (function ($) {
                    $.vakata.html = {
                        div: $('<div />'),
                        escape: function (str) {
                            return $.vakata.html.div.text(str).html();
                        },
                        strip: function (str) {
                            return $.vakata.html.div.empty().append($.parseHTML(str)).text();
                        }
                    };
                    var vakata_dnd = {
                            element: false,
                            target: false,
                            is_down: false,
                            is_drag: false,
                            helper: false,
                            helper_w: 0,
                            data: false,
                            init_x: 0,
                            init_y: 0,
                            scroll_l: 0,
                            scroll_t: 0,
                            scroll_e: false,
                            scroll_i: false,
                            is_touch: false
                        };
                    $.vakata.dnd = {
                        settings: {
                            scroll_speed: 10,
                            scroll_proximity: 20,
                            helper_left: 5,
                            helper_top: 10,
                            threshold: 5,
                            threshold_touch: 50
                        },
                        _trigger: function (event_name, e, data) {
                            if (data === undefined) {
                                data = $.vakata.dnd._get();
                            }
                            data.event = e;
                            $(document).triggerHandler('dnd_' + event_name + '.vakata', data);
                        },
                        _get: function () {
                            return {
                                'data': vakata_dnd.data,
                                'element': vakata_dnd.element,
                                'helper': vakata_dnd.helper
                            };
                        },
                        _clean: function () {
                            if (vakata_dnd.helper) {
                                vakata_dnd.helper.remove();
                            }
                            if (vakata_dnd.scroll_i) {
                                clearInterval(vakata_dnd.scroll_i);
                                vakata_dnd.scroll_i = false;
                            }
                            vakata_dnd = {
                                element: false,
                                target: false,
                                is_down: false,
                                is_drag: false,
                                helper: false,
                                helper_w: 0,
                                data: false,
                                init_x: 0,
                                init_y: 0,
                                scroll_l: 0,
                                scroll_t: 0,
                                scroll_e: false,
                                scroll_i: false,
                                is_touch: false
                            };
                            $(document).off('mousemove.vakata.jstree touchmove.vakata.jstree', $.vakata.dnd.drag);
                            $(document).off('mouseup.vakata.jstree touchend.vakata.jstree', $.vakata.dnd.stop);
                        },
                        _scroll: function (init_only) {
                            if (!vakata_dnd.scroll_e || !vakata_dnd.scroll_l && !vakata_dnd.scroll_t) {
                                if (vakata_dnd.scroll_i) {
                                    clearInterval(vakata_dnd.scroll_i);
                                    vakata_dnd.scroll_i = false;
                                }
                                return false;
                            }
                            if (!vakata_dnd.scroll_i) {
                                vakata_dnd.scroll_i = setInterval($.vakata.dnd._scroll, 100);
                                return false;
                            }
                            if (init_only === true) {
                                return false;
                            }
                            var i = vakata_dnd.scroll_e.scrollTop(), j = vakata_dnd.scroll_e.scrollLeft();
                            vakata_dnd.scroll_e.scrollTop(i + vakata_dnd.scroll_t * $.vakata.dnd.settings.scroll_speed);
                            vakata_dnd.scroll_e.scrollLeft(j + vakata_dnd.scroll_l * $.vakata.dnd.settings.scroll_speed);
                            if (i !== vakata_dnd.scroll_e.scrollTop() || j !== vakata_dnd.scroll_e.scrollLeft()) {
                                $.vakata.dnd._trigger('scroll', vakata_dnd.scroll_e);
                            }
                        },
                        start: function (e, data, html) {
                            if (e.type === 'touchstart' && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]) {
                                e.pageX = e.originalEvent.changedTouches[0].pageX;
                                e.pageY = e.originalEvent.changedTouches[0].pageY;
                                e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset, e.originalEvent.changedTouches[0].pageY - window.pageYOffset);
                            }
                            if (vakata_dnd.is_drag) {
                                $.vakata.dnd.stop({});
                            }
                            try {
                                e.currentTarget.unselectable = 'on';
                                e.currentTarget.onselectstart = function () {
                                    return false;
                                };
                                if (e.currentTarget.style) {
                                    e.currentTarget.style.touchAction = 'none';
                                    e.currentTarget.style.msTouchAction = 'none';
                                    e.currentTarget.style.MozUserSelect = 'none';
                                }
                            } catch (ignore) {
                            }
                            vakata_dnd.init_x = e.pageX;
                            vakata_dnd.init_y = e.pageY;
                            vakata_dnd.data = data;
                            vakata_dnd.is_down = true;
                            vakata_dnd.element = e.currentTarget;
                            vakata_dnd.target = e.target;
                            vakata_dnd.is_touch = e.type === 'touchstart';
                            if (html !== false) {
                                vakata_dnd.helper = $('<div id=\'vakata-dnd\'></div>').html(html).css({
                                    'display': 'block',
                                    'margin': '0',
                                    'padding': '0',
                                    'position': 'absolute',
                                    'top': '-2000px',
                                    'lineHeight': '16px',
                                    'zIndex': '10000'
                                });
                            }
                            $(document).on('mousemove.vakata.jstree touchmove.vakata.jstree', $.vakata.dnd.drag);
                            $(document).on('mouseup.vakata.jstree touchend.vakata.jstree', $.vakata.dnd.stop);
                            return false;
                        },
                        drag: function (e) {
                            if (e.type === 'touchmove' && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]) {
                                e.pageX = e.originalEvent.changedTouches[0].pageX;
                                e.pageY = e.originalEvent.changedTouches[0].pageY;
                                e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset, e.originalEvent.changedTouches[0].pageY - window.pageYOffset);
                            }
                            if (!vakata_dnd.is_down) {
                                return;
                            }
                            if (!vakata_dnd.is_drag) {
                                if (Math.abs(e.pageX - vakata_dnd.init_x) > (vakata_dnd.is_touch ? $.vakata.dnd.settings.threshold_touch : $.vakata.dnd.settings.threshold) || Math.abs(e.pageY - vakata_dnd.init_y) > (vakata_dnd.is_touch ? $.vakata.dnd.settings.threshold_touch : $.vakata.dnd.settings.threshold)) {
                                    if (vakata_dnd.helper) {
                                        vakata_dnd.helper.appendTo('body');
                                        vakata_dnd.helper_w = vakata_dnd.helper.outerWidth();
                                    }
                                    vakata_dnd.is_drag = true;
                                    $(vakata_dnd.target).one('click.vakata', false);
                                    $.vakata.dnd._trigger('start', e);
                                } else {
                                    return;
                                }
                            }
                            var d = false, w = false, dh = false, wh = false, dw = false, ww = false, dt = false, dl = false, ht = false, hl = false;
                            vakata_dnd.scroll_t = 0;
                            vakata_dnd.scroll_l = 0;
                            vakata_dnd.scroll_e = false;
                            $($(e.target).parentsUntil('body').addBack().get().reverse()).filter(function () {
                                return /^auto|scroll$/.test($(this).css('overflow')) && (this.scrollHeight > this.offsetHeight || this.scrollWidth > this.offsetWidth);
                            }).each(function () {
                                var t = $(this), o = t.offset();
                                if (this.scrollHeight > this.offsetHeight) {
                                    if (o.top + t.height() - e.pageY < $.vakata.dnd.settings.scroll_proximity) {
                                        vakata_dnd.scroll_t = 1;
                                    }
                                    if (e.pageY - o.top < $.vakata.dnd.settings.scroll_proximity) {
                                        vakata_dnd.scroll_t = -1;
                                    }
                                }
                                if (this.scrollWidth > this.offsetWidth) {
                                    if (o.left + t.width() - e.pageX < $.vakata.dnd.settings.scroll_proximity) {
                                        vakata_dnd.scroll_l = 1;
                                    }
                                    if (e.pageX - o.left < $.vakata.dnd.settings.scroll_proximity) {
                                        vakata_dnd.scroll_l = -1;
                                    }
                                }
                                if (vakata_dnd.scroll_t || vakata_dnd.scroll_l) {
                                    vakata_dnd.scroll_e = $(this);
                                    return false;
                                }
                            });
                            if (!vakata_dnd.scroll_e) {
                                d = $(document);
                                w = $(window);
                                dh = d.height();
                                wh = w.height();
                                dw = d.width();
                                ww = w.width();
                                dt = d.scrollTop();
                                dl = d.scrollLeft();
                                if (dh > wh && e.pageY - dt < $.vakata.dnd.settings.scroll_proximity) {
                                    vakata_dnd.scroll_t = -1;
                                }
                                if (dh > wh && wh - (e.pageY - dt) < $.vakata.dnd.settings.scroll_proximity) {
                                    vakata_dnd.scroll_t = 1;
                                }
                                if (dw > ww && e.pageX - dl < $.vakata.dnd.settings.scroll_proximity) {
                                    vakata_dnd.scroll_l = -1;
                                }
                                if (dw > ww && ww - (e.pageX - dl) < $.vakata.dnd.settings.scroll_proximity) {
                                    vakata_dnd.scroll_l = 1;
                                }
                                if (vakata_dnd.scroll_t || vakata_dnd.scroll_l) {
                                    vakata_dnd.scroll_e = d;
                                }
                            }
                            if (vakata_dnd.scroll_e) {
                                $.vakata.dnd._scroll(true);
                            }
                            if (vakata_dnd.helper) {
                                ht = parseInt(e.pageY + $.vakata.dnd.settings.helper_top, 10);
                                hl = parseInt(e.pageX + $.vakata.dnd.settings.helper_left, 10);
                                if (dh && ht + 25 > dh) {
                                    ht = dh - 50;
                                }
                                if (dw && hl + vakata_dnd.helper_w > dw) {
                                    hl = dw - (vakata_dnd.helper_w + 2);
                                }
                                vakata_dnd.helper.css({
                                    left: hl + 'px',
                                    top: ht + 'px'
                                });
                            }
                            $.vakata.dnd._trigger('move', e);
                            return false;
                        },
                        stop: function (e) {
                            if (e.type === 'touchend' && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]) {
                                e.pageX = e.originalEvent.changedTouches[0].pageX;
                                e.pageY = e.originalEvent.changedTouches[0].pageY;
                                e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset, e.originalEvent.changedTouches[0].pageY - window.pageYOffset);
                            }
                            if (vakata_dnd.is_drag) {
                                if (e.target !== vakata_dnd.target) {
                                    $(vakata_dnd.target).off('click.vakata');
                                }
                                $.vakata.dnd._trigger('stop', e);
                            } else {
                                if (e.type === 'touchend' && e.target === vakata_dnd.target) {
                                    var to = setTimeout(function () {
                                            $(e.target).click();
                                        }, 100);
                                    $(e.target).one('click', function () {
                                        if (to) {
                                            clearTimeout(to);
                                        }
                                    });
                                }
                            }
                            $.vakata.dnd._clean();
                            return false;
                        }
                    };
                }($));
                $.jstree.defaults.massload = null;
                $.jstree.plugins.massload = function (options, parent) {
                    this.init = function (el, options) {
                        this._data.massload = {};
                        parent.init.call(this, el, options);
                    };
                    this._load_nodes = function (nodes, callback, is_callback, force_reload) {
                        var s = this.settings.massload, nodesString = JSON.stringify(nodes), toLoad = [], m = this._model.data, i, j, dom;
                        if (!is_callback) {
                            for (i = 0, j = nodes.length; i < j; i++) {
                                if (!m[nodes[i]] || (!m[nodes[i]].state.loaded && !m[nodes[i]].state.failed || force_reload)) {
                                    toLoad.push(nodes[i]);
                                    dom = this.get_node(nodes[i], true);
                                    if (dom && dom.length) {
                                        dom.addClass('jstree-loading').attr('aria-busy', true);
                                    }
                                }
                            }
                            this._data.massload = {};
                            if (toLoad.length) {
                                if ($.isFunction(s)) {
                                    return s.call(this, toLoad, $.proxy(function (data) {
                                        var i, j;
                                        if (data) {
                                            for (i in data) {
                                                if (data.hasOwnProperty(i)) {
                                                    this._data.massload[i] = data[i];
                                                }
                                            }
                                        }
                                        for (i = 0, j = nodes.length; i < j; i++) {
                                            dom = this.get_node(nodes[i], true);
                                            if (dom && dom.length) {
                                                dom.removeClass('jstree-loading').attr('aria-busy', false);
                                            }
                                        }
                                        parent._load_nodes.call(this, nodes, callback, is_callback, force_reload);
                                    }, this));
                                }
                                if (typeof s === 'object' && s && s.url) {
                                    s = $.extend(true, {}, s);
                                    if ($.isFunction(s.url)) {
                                        s.url = s.url.call(this, toLoad);
                                    }
                                    if ($.isFunction(s.data)) {
                                        s.data = s.data.call(this, toLoad);
                                    }
                                    return $.ajax(s).done($.proxy(function (data, t, x) {
                                        var i, j;
                                        if (data) {
                                            for (i in data) {
                                                if (data.hasOwnProperty(i)) {
                                                    this._data.massload[i] = data[i];
                                                }
                                            }
                                        }
                                        for (i = 0, j = nodes.length; i < j; i++) {
                                            dom = this.get_node(nodes[i], true);
                                            if (dom && dom.length) {
                                                dom.removeClass('jstree-loading').attr('aria-busy', false);
                                            }
                                        }
                                        parent._load_nodes.call(this, nodes, callback, is_callback, force_reload);
                                    }, this)).fail($.proxy(function (f) {
                                        parent._load_nodes.call(this, nodes, callback, is_callback, force_reload);
                                    }, this));
                                }
                            }
                        }
                        return parent._load_nodes.call(this, nodes, callback, is_callback, force_reload);
                    };
                    this._load_node = function (obj, callback) {
                        var data = this._data.massload[obj.id], rslt = null, dom;
                        if (data) {
                            rslt = this[typeof data === 'string' ? '_append_html_data' : '_append_json_data'](obj, typeof data === 'string' ? $($.parseHTML(data)).filter(function () {
                                return this.nodeType !== 3;
                            }) : data, function (status) {
                                callback.call(this, status);
                            });
                            dom = this.get_node(obj.id, true);
                            if (dom && dom.length) {
                                dom.removeClass('jstree-loading').attr('aria-busy', false);
                            }
                            delete this._data.massload[obj.id];
                            return rslt;
                        }
                        return parent._load_node.call(this, obj, callback);
                    };
                };
                $.jstree.defaults.search = {
                    ajax: false,
                    fuzzy: false,
                    case_sensitive: false,
                    show_only_matches: false,
                    show_only_matches_children: false,
                    close_opened_onclear: true,
                    search_leaves_only: false,
                    search_callback: false
                };
                $.jstree.plugins.search = function (options, parent) {
                    this.bind = function () {
                        parent.bind.call(this);
                        this._data.search.str = '';
                        this._data.search.dom = $();
                        this._data.search.res = [];
                        this._data.search.opn = [];
                        this._data.search.som = false;
                        this._data.search.smc = false;
                        this._data.search.hdn = [];
                        this.element.on('search.jstree', $.proxy(function (e, data) {
                            if (this._data.search.som && data.res.length) {
                                var m = this._model.data, i, j, p = [], k, l;
                                for (i = 0, j = data.res.length; i < j; i++) {
                                    if (m[data.res[i]] && !m[data.res[i]].state.hidden) {
                                        p.push(data.res[i]);
                                        p = p.concat(m[data.res[i]].parents);
                                        if (this._data.search.smc) {
                                            for (k = 0, l = m[data.res[i]].children_d.length; k < l; k++) {
                                                if (m[m[data.res[i]].children_d[k]] && !m[m[data.res[i]].children_d[k]].state.hidden) {
                                                    p.push(m[data.res[i]].children_d[k]);
                                                }
                                            }
                                        }
                                    }
                                }
                                p = $.vakata.array_remove_item($.vakata.array_unique(p), $.jstree.root);
                                this._data.search.hdn = this.hide_all(true);
                                this.show_node(p, true);
                                this.redraw(true);
                            }
                        }, this)).on('clear_search.jstree', $.proxy(function (e, data) {
                            if (this._data.search.som && data.res.length) {
                                this.show_node(this._data.search.hdn, true);
                                this.redraw(true);
                            }
                        }, this));
                    };
                    this.search = function (str, skip_async, show_only_matches, inside, append, show_only_matches_children) {
                        if (str === false || $.trim(str.toString()) === '') {
                            return this.clear_search();
                        }
                        inside = this.get_node(inside);
                        inside = inside && inside.id ? inside.id : null;
                        str = str.toString();
                        var s = this.settings.search, a = s.ajax ? s.ajax : false, m = this._model.data, f = null, r = [], p = [], i, j;
                        if (this._data.search.res.length && !append) {
                            this.clear_search();
                        }
                        if (show_only_matches === undefined) {
                            show_only_matches = s.show_only_matches;
                        }
                        if (show_only_matches_children === undefined) {
                            show_only_matches_children = s.show_only_matches_children;
                        }
                        if (!skip_async && a !== false) {
                            if ($.isFunction(a)) {
                                return a.call(this, str, $.proxy(function (d) {
                                    if (d && d.d) {
                                        d = d.d;
                                    }
                                    this._load_nodes(!$.isArray(d) ? [] : $.vakata.array_unique(d), function () {
                                        this.search(str, true, show_only_matches, inside, append, show_only_matches_children);
                                    });
                                }, this), inside);
                            } else {
                                a = $.extend({}, a);
                                if (!a.data) {
                                    a.data = {};
                                }
                                a.data.str = str;
                                if (inside) {
                                    a.data.inside = inside;
                                }
                                if (this._data.search.lastRequest) {
                                    this._data.search.lastRequest.abort();
                                }
                                this._data.search.lastRequest = $.ajax(a).fail($.proxy(function () {
                                    this._data.core.last_error = {
                                        'error': 'ajax',
                                        'plugin': 'search',
                                        'id': 'search_01',
                                        'reason': 'Could not load search parents',
                                        'data': JSON.stringify(a)
                                    };
                                    this.settings.core.error.call(this, this._data.core.last_error);
                                }, this)).done($.proxy(function (d) {
                                    if (d && d.d) {
                                        d = d.d;
                                    }
                                    this._load_nodes(!$.isArray(d) ? [] : $.vakata.array_unique(d), function () {
                                        this.search(str, true, show_only_matches, inside, append, show_only_matches_children);
                                    });
                                }, this));
                                return this._data.search.lastRequest;
                            }
                        }
                        if (!append) {
                            this._data.search.str = str;
                            this._data.search.dom = $();
                            this._data.search.res = [];
                            this._data.search.opn = [];
                            this._data.search.som = show_only_matches;
                            this._data.search.smc = show_only_matches_children;
                        }
                        f = new $.vakata.search(str, true, {
                            caseSensitive: s.case_sensitive,
                            fuzzy: s.fuzzy
                        });
                        $.each(m[inside ? inside : $.jstree.root].children_d, function (ii, i) {
                            var v = m[i];
                            if (v.text && !v.state.hidden && (!s.search_leaves_only || v.state.loaded && v.children.length === 0) && (s.search_callback && s.search_callback.call(this, str, v) || !s.search_callback && f.search(v.text).isMatch)) {
                                r.push(i);
                                p = p.concat(v.parents);
                            }
                        });
                        if (r.length) {
                            p = $.vakata.array_unique(p);
                            for (i = 0, j = p.length; i < j; i++) {
                                if (p[i] !== $.jstree.root && m[p[i]] && this.open_node(p[i], null, 0) === true) {
                                    this._data.search.opn.push(p[i]);
                                }
                            }
                            if (!append) {
                                this._data.search.dom = $(this.element[0].querySelectorAll('#' + $.map(r, function (v) {
                                    return '0123456789'.indexOf(v[0]) !== -1 ? '\\3' + v[0] + ' ' + v.substr(1).replace($.jstree.idregex, '\\$&') : v.replace($.jstree.idregex, '\\$&');
                                }).join(', #')));
                                this._data.search.res = r;
                            } else {
                                this._data.search.dom = this._data.search.dom.add($(this.element[0].querySelectorAll('#' + $.map(r, function (v) {
                                    return '0123456789'.indexOf(v[0]) !== -1 ? '\\3' + v[0] + ' ' + v.substr(1).replace($.jstree.idregex, '\\$&') : v.replace($.jstree.idregex, '\\$&');
                                }).join(', #'))));
                                this._data.search.res = $.vakata.array_unique(this._data.search.res.concat(r));
                            }
                            this._data.search.dom.children('.jstree-anchor').addClass('jstree-search');
                        }
                        this.trigger('search', {
                            nodes: this._data.search.dom,
                            str: str,
                            res: this._data.search.res,
                            show_only_matches: show_only_matches
                        });
                    };
                    this.clear_search = function () {
                        if (this.settings.search.close_opened_onclear) {
                            this.close_node(this._data.search.opn, 0);
                        }
                        this.trigger('clear_search', {
                            'nodes': this._data.search.dom,
                            str: this._data.search.str,
                            res: this._data.search.res
                        });
                        if (this._data.search.res.length) {
                            this._data.search.dom = $(this.element[0].querySelectorAll('#' + $.map(this._data.search.res, function (v) {
                                return '0123456789'.indexOf(v[0]) !== -1 ? '\\3' + v[0] + ' ' + v.substr(1).replace($.jstree.idregex, '\\$&') : v.replace($.jstree.idregex, '\\$&');
                            }).join(', #')));
                            this._data.search.dom.children('.jstree-anchor').removeClass('jstree-search');
                        }
                        this._data.search.str = '';
                        this._data.search.res = [];
                        this._data.search.opn = [];
                        this._data.search.dom = $();
                    };
                    this.redraw_node = function (obj, deep, callback, force_render) {
                        obj = parent.redraw_node.apply(this, arguments);
                        if (obj) {
                            if ($.inArray(obj.id, this._data.search.res) !== -1) {
                                var i, j, tmp = null;
                                for (i = 0, j = obj.childNodes.length; i < j; i++) {
                                    if (obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf('jstree-anchor') !== -1) {
                                        tmp = obj.childNodes[i];
                                        break;
                                    }
                                }
                                if (tmp) {
                                    tmp.className += ' jstree-search';
                                }
                            }
                        }
                        return obj;
                    };
                };
                (function ($) {
                    $.vakata.search = function (pattern, txt, options) {
                        options = options || {};
                        options = $.extend({}, $.vakata.search.defaults, options);
                        if (options.fuzzy !== false) {
                            options.fuzzy = true;
                        }
                        pattern = options.caseSensitive ? pattern : pattern.toLowerCase();
                        var MATCH_LOCATION = options.location, MATCH_DISTANCE = options.distance, MATCH_THRESHOLD = options.threshold, patternLen = pattern.length, matchmask, pattern_alphabet, match_bitapScore, search;
                        if (patternLen > 32) {
                            options.fuzzy = false;
                        }
                        if (options.fuzzy) {
                            matchmask = 1 << patternLen - 1;
                            pattern_alphabet = function () {
                                var mask = {}, i = 0;
                                for (i = 0; i < patternLen; i++) {
                                    mask[pattern.charAt(i)] = 0;
                                }
                                for (i = 0; i < patternLen; i++) {
                                    mask[pattern.charAt(i)] |= 1 << patternLen - i - 1;
                                }
                                return mask;
                            }();
                            match_bitapScore = function (e, x) {
                                var accuracy = e / patternLen, proximity = Math.abs(MATCH_LOCATION - x);
                                if (!MATCH_DISTANCE) {
                                    return proximity ? 1 : accuracy;
                                }
                                return accuracy + proximity / MATCH_DISTANCE;
                            };
                        }
                        search = function (text) {
                            text = options.caseSensitive ? text : text.toLowerCase();
                            if (pattern === text || text.indexOf(pattern) !== -1) {
                                return {
                                    isMatch: true,
                                    score: 0
                                };
                            }
                            if (!options.fuzzy) {
                                return {
                                    isMatch: false,
                                    score: 1
                                };
                            }
                            var i, j, textLen = text.length, scoreThreshold = MATCH_THRESHOLD, bestLoc = text.indexOf(pattern, MATCH_LOCATION), binMin, binMid, binMax = patternLen + textLen, lastRd, start, finish, rd, charMatch, score = 1, locations = [];
                            if (bestLoc !== -1) {
                                scoreThreshold = Math.min(match_bitapScore(0, bestLoc), scoreThreshold);
                                bestLoc = text.lastIndexOf(pattern, MATCH_LOCATION + patternLen);
                                if (bestLoc !== -1) {
                                    scoreThreshold = Math.min(match_bitapScore(0, bestLoc), scoreThreshold);
                                }
                            }
                            bestLoc = -1;
                            for (i = 0; i < patternLen; i++) {
                                binMin = 0;
                                binMid = binMax;
                                while (binMin < binMid) {
                                    if (match_bitapScore(i, MATCH_LOCATION + binMid) <= scoreThreshold) {
                                        binMin = binMid;
                                    } else {
                                        binMax = binMid;
                                    }
                                    binMid = Math.floor((binMax - binMin) / 2 + binMin);
                                }
                                binMax = binMid;
                                start = Math.max(1, MATCH_LOCATION - binMid + 1);
                                finish = Math.min(MATCH_LOCATION + binMid, textLen) + patternLen;
                                rd = new Array(finish + 2);
                                rd[finish + 1] = (1 << i) - 1;
                                for (j = finish; j >= start; j--) {
                                    charMatch = pattern_alphabet[text.charAt(j - 1)];
                                    if (i === 0) {
                                        rd[j] = (rd[j + 1] << 1 | 1) & charMatch;
                                    } else {
                                        rd[j] = (rd[j + 1] << 1 | 1) & charMatch | ((lastRd[j + 1] | lastRd[j]) << 1 | 1) | lastRd[j + 1];
                                    }
                                    if (rd[j] & matchmask) {
                                        score = match_bitapScore(i, j - 1);
                                        if (score <= scoreThreshold) {
                                            scoreThreshold = score;
                                            bestLoc = j - 1;
                                            locations.push(bestLoc);
                                            if (bestLoc > MATCH_LOCATION) {
                                                start = Math.max(1, 2 * MATCH_LOCATION - bestLoc);
                                            } else {
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (match_bitapScore(i + 1, MATCH_LOCATION) > scoreThreshold) {
                                    break;
                                }
                                lastRd = rd;
                            }
                            return {
                                isMatch: bestLoc >= 0,
                                score: score
                            };
                        };
                        return txt === true ? { 'search': search } : search(txt);
                    };
                    $.vakata.search.defaults = {
                        location: 0,
                        distance: 100,
                        threshold: 0.6,
                        fuzzy: false,
                        caseSensitive: false
                    };
                }($));
                $.jstree.defaults.sort = function (a, b) {
                    return this.get_text(a) > this.get_text(b) ? 1 : -1;
                };
                $.jstree.plugins.sort = function (options, parent) {
                    this.bind = function () {
                        parent.bind.call(this);
                        this.element.on('model.jstree', $.proxy(function (e, data) {
                            this.sort(data.parent, true);
                        }, this)).on('rename_node.jstree create_node.jstree', $.proxy(function (e, data) {
                            this.sort(data.parent || data.node.parent, false);
                            this.redraw_node(data.parent || data.node.parent, true);
                        }, this)).on('move_node.jstree copy_node.jstree', $.proxy(function (e, data) {
                            this.sort(data.parent, false);
                            this.redraw_node(data.parent, true);
                        }, this));
                    };
                    this.sort = function (obj, deep) {
                        var i, j;
                        obj = this.get_node(obj);
                        if (obj && obj.children && obj.children.length) {
                            obj.children.sort($.proxy(this.settings.sort, this));
                            if (deep) {
                                for (i = 0, j = obj.children_d.length; i < j; i++) {
                                    this.sort(obj.children_d[i], false);
                                }
                            }
                        }
                    };
                };
                var to = false;
                $.jstree.defaults.state = {
                    key: 'jstree',
                    events: 'changed.jstree open_node.jstree close_node.jstree check_node.jstree uncheck_node.jstree',
                    ttl: false,
                    filter: false
                };
                $.jstree.plugins.state = function (options, parent) {
                    this.bind = function () {
                        parent.bind.call(this);
                        var bind = $.proxy(function () {
                                this.element.on(this.settings.state.events, $.proxy(function () {
                                    if (to) {
                                        clearTimeout(to);
                                    }
                                    to = setTimeout($.proxy(function () {
                                        this.save_state();
                                    }, this), 100);
                                }, this));
                                this.trigger('state_ready');
                            }, this);
                        this.element.on('ready.jstree', $.proxy(function (e, data) {
                            this.element.one('restore_state.jstree', bind);
                            if (!this.restore_state()) {
                                bind();
                            }
                        }, this));
                    };
                    this.save_state = function () {
                        var st = {
                                'state': this.get_state(),
                                'ttl': this.settings.state.ttl,
                                'sec': +new Date()
                            };
                        $.vakata.storage.set(this.settings.state.key, JSON.stringify(st));
                    };
                    this.restore_state = function () {
                        var k = $.vakata.storage.get(this.settings.state.key);
                        if (!!k) {
                            try {
                                k = JSON.parse(k);
                            } catch (ex) {
                                return false;
                            }
                        }
                        if (!!k && k.ttl && k.sec && +new Date() - k.sec > k.ttl) {
                            return false;
                        }
                        if (!!k && k.state) {
                            k = k.state;
                        }
                        if (!!k && $.isFunction(this.settings.state.filter)) {
                            k = this.settings.state.filter.call(this, k);
                        }
                        if (!!k) {
                            this.element.one('set_state.jstree', function (e, data) {
                                data.instance.trigger('restore_state', { 'state': $.extend(true, {}, k) });
                            });
                            this.set_state(k);
                            return true;
                        }
                        return false;
                    };
                    this.clear_state = function () {
                        return $.vakata.storage.del(this.settings.state.key);
                    };
                };
                (function ($, undefined) {
                    $.vakata.storage = {
                        set: function (key, val) {
                            return window.localStorage.setItem(key, val);
                        },
                        get: function (key) {
                            return window.localStorage.getItem(key);
                        },
                        del: function (key) {
                            return window.localStorage.removeItem(key);
                        }
                    };
                }($));
                $.jstree.defaults.types = { 'default': {} };
                $.jstree.defaults.types[$.jstree.root] = {};
                $.jstree.plugins.types = function (options, parent) {
                    this.init = function (el, options) {
                        var i, j;
                        if (options && options.types && options.types['default']) {
                            for (i in options.types) {
                                if (i !== 'default' && i !== $.jstree.root && options.types.hasOwnProperty(i)) {
                                    for (j in options.types['default']) {
                                        if (options.types['default'].hasOwnProperty(j) && options.types[i][j] === undefined) {
                                            options.types[i][j] = options.types['default'][j];
                                        }
                                    }
                                }
                            }
                        }
                        parent.init.call(this, el, options);
                        this._model.data[$.jstree.root].type = $.jstree.root;
                    };
                    this.refresh = function (skip_loading, forget_state) {
                        parent.refresh.call(this, skip_loading, forget_state);
                        this._model.data[$.jstree.root].type = $.jstree.root;
                    };
                    this.bind = function () {
                        this.element.on('model.jstree', $.proxy(function (e, data) {
                            var m = this._model.data, dpc = data.nodes, t = this.settings.types, i, j, c = 'default', k;
                            for (i = 0, j = dpc.length; i < j; i++) {
                                c = 'default';
                                if (m[dpc[i]].original && m[dpc[i]].original.type && t[m[dpc[i]].original.type]) {
                                    c = m[dpc[i]].original.type;
                                }
                                if (m[dpc[i]].data && m[dpc[i]].data.jstree && m[dpc[i]].data.jstree.type && t[m[dpc[i]].data.jstree.type]) {
                                    c = m[dpc[i]].data.jstree.type;
                                }
                                m[dpc[i]].type = c;
                                if (m[dpc[i]].icon === true && t[c].icon !== undefined) {
                                    m[dpc[i]].icon = t[c].icon;
                                }
                                if (t[c].li_attr !== undefined && typeof t[c].li_attr === 'object') {
                                    for (k in t[c].li_attr) {
                                        if (t[c].li_attr.hasOwnProperty(k)) {
                                            if (k === 'id') {
                                                continue;
                                            } else if (m[dpc[i]].li_attr[k] === undefined) {
                                                m[dpc[i]].li_attr[k] = t[c].li_attr[k];
                                            } else if (k === 'class') {
                                                m[dpc[i]].li_attr['class'] = t[c].li_attr['class'] + ' ' + m[dpc[i]].li_attr['class'];
                                            }
                                        }
                                    }
                                }
                                if (t[c].a_attr !== undefined && typeof t[c].a_attr === 'object') {
                                    for (k in t[c].a_attr) {
                                        if (t[c].a_attr.hasOwnProperty(k)) {
                                            if (k === 'id') {
                                                continue;
                                            } else if (m[dpc[i]].a_attr[k] === undefined) {
                                                m[dpc[i]].a_attr[k] = t[c].a_attr[k];
                                            } else if (k === 'href' && m[dpc[i]].a_attr[k] === '#') {
                                                m[dpc[i]].a_attr['href'] = t[c].a_attr['href'];
                                            } else if (k === 'class') {
                                                m[dpc[i]].a_attr['class'] = t[c].a_attr['class'] + ' ' + m[dpc[i]].a_attr['class'];
                                            }
                                        }
                                    }
                                }
                            }
                            m[$.jstree.root].type = $.jstree.root;
                        }, this));
                        parent.bind.call(this);
                    };
                    this.get_json = function (obj, options, flat) {
                        var i, j, m = this._model.data, opt = options ? $.extend(true, {}, options, { no_id: false }) : {}, tmp = parent.get_json.call(this, obj, opt, flat);
                        if (tmp === false) {
                            return false;
                        }
                        if ($.isArray(tmp)) {
                            for (i = 0, j = tmp.length; i < j; i++) {
                                tmp[i].type = tmp[i].id && m[tmp[i].id] && m[tmp[i].id].type ? m[tmp[i].id].type : 'default';
                                if (options && options.no_id) {
                                    delete tmp[i].id;
                                    if (tmp[i].li_attr && tmp[i].li_attr.id) {
                                        delete tmp[i].li_attr.id;
                                    }
                                    if (tmp[i].a_attr && tmp[i].a_attr.id) {
                                        delete tmp[i].a_attr.id;
                                    }
                                }
                            }
                        } else {
                            tmp.type = tmp.id && m[tmp.id] && m[tmp.id].type ? m[tmp.id].type : 'default';
                            if (options && options.no_id) {
                                tmp = this._delete_ids(tmp);
                            }
                        }
                        return tmp;
                    };
                    this._delete_ids = function (tmp) {
                        if ($.isArray(tmp)) {
                            for (var i = 0, j = tmp.length; i < j; i++) {
                                tmp[i] = this._delete_ids(tmp[i]);
                            }
                            return tmp;
                        }
                        delete tmp.id;
                        if (tmp.li_attr && tmp.li_attr.id) {
                            delete tmp.li_attr.id;
                        }
                        if (tmp.a_attr && tmp.a_attr.id) {
                            delete tmp.a_attr.id;
                        }
                        if (tmp.children && $.isArray(tmp.children)) {
                            tmp.children = this._delete_ids(tmp.children);
                        }
                        return tmp;
                    };
                    this.check = function (chk, obj, par, pos, more) {
                        if (parent.check.call(this, chk, obj, par, pos, more) === false) {
                            return false;
                        }
                        obj = obj && obj.id ? obj : this.get_node(obj);
                        par = par && par.id ? par : this.get_node(par);
                        var m = obj && obj.id ? more && more.origin ? more.origin : $.jstree.reference(obj.id) : null, tmp, d, i, j;
                        m = m && m._model && m._model.data ? m._model.data : null;
                        switch (chk) {
                        case 'create_node':
                        case 'move_node':
                        case 'copy_node':
                            if (chk !== 'move_node' || $.inArray(obj.id, par.children) === -1) {
                                tmp = this.get_rules(par);
                                if (tmp.max_children !== undefined && tmp.max_children !== -1 && tmp.max_children === par.children.length) {
                                    this._data.core.last_error = {
                                        'error': 'check',
                                        'plugin': 'types',
                                        'id': 'types_01',
                                        'reason': 'max_children prevents function: ' + chk,
                                        'data': JSON.stringify({
                                            'chk': chk,
                                            'pos': pos,
                                            'obj': obj && obj.id ? obj.id : false,
                                            'par': par && par.id ? par.id : false
                                        })
                                    };
                                    return false;
                                }
                                if (tmp.valid_children !== undefined && tmp.valid_children !== -1 && $.inArray(obj.type || 'default', tmp.valid_children) === -1) {
                                    this._data.core.last_error = {
                                        'error': 'check',
                                        'plugin': 'types',
                                        'id': 'types_02',
                                        'reason': 'valid_children prevents function: ' + chk,
                                        'data': JSON.stringify({
                                            'chk': chk,
                                            'pos': pos,
                                            'obj': obj && obj.id ? obj.id : false,
                                            'par': par && par.id ? par.id : false
                                        })
                                    };
                                    return false;
                                }
                                if (m && obj.children_d && obj.parents) {
                                    d = 0;
                                    for (i = 0, j = obj.children_d.length; i < j; i++) {
                                        d = Math.max(d, m[obj.children_d[i]].parents.length);
                                    }
                                    d = d - obj.parents.length + 1;
                                }
                                if (d <= 0 || d === undefined) {
                                    d = 1;
                                }
                                do {
                                    if (tmp.max_depth !== undefined && tmp.max_depth !== -1 && tmp.max_depth < d) {
                                        this._data.core.last_error = {
                                            'error': 'check',
                                            'plugin': 'types',
                                            'id': 'types_03',
                                            'reason': 'max_depth prevents function: ' + chk,
                                            'data': JSON.stringify({
                                                'chk': chk,
                                                'pos': pos,
                                                'obj': obj && obj.id ? obj.id : false,
                                                'par': par && par.id ? par.id : false
                                            })
                                        };
                                        return false;
                                    }
                                    par = this.get_node(par.parent);
                                    tmp = this.get_rules(par);
                                    d++;
                                } while (par);
                            }
                            break;
                        }
                        return true;
                    };
                    this.get_rules = function (obj) {
                        obj = this.get_node(obj);
                        if (!obj) {
                            return false;
                        }
                        var tmp = this.get_type(obj, true);
                        if (tmp.max_depth === undefined) {
                            tmp.max_depth = -1;
                        }
                        if (tmp.max_children === undefined) {
                            tmp.max_children = -1;
                        }
                        if (tmp.valid_children === undefined) {
                            tmp.valid_children = -1;
                        }
                        return tmp;
                    };
                    this.get_type = function (obj, rules) {
                        obj = this.get_node(obj);
                        return !obj ? false : rules ? $.extend({ 'type': obj.type }, this.settings.types[obj.type]) : obj.type;
                    };
                    this.set_type = function (obj, type) {
                        var m = this._model.data, t, t1, t2, old_type, old_icon, k, d, a;
                        if ($.isArray(obj)) {
                            obj = obj.slice();
                            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                                this.set_type(obj[t1], type);
                            }
                            return true;
                        }
                        t = this.settings.types;
                        obj = this.get_node(obj);
                        if (!t[type] || !obj) {
                            return false;
                        }
                        d = this.get_node(obj, true);
                        if (d && d.length) {
                            a = d.children('.jstree-anchor');
                        }
                        old_type = obj.type;
                        old_icon = this.get_icon(obj);
                        obj.type = type;
                        if (old_icon === true || !t[old_type] || t[old_type].icon !== undefined && old_icon === t[old_type].icon) {
                            this.set_icon(obj, t[type].icon !== undefined ? t[type].icon : true);
                        }
                        if (t[old_type] && t[old_type].li_attr !== undefined && typeof t[old_type].li_attr === 'object') {
                            for (k in t[old_type].li_attr) {
                                if (t[old_type].li_attr.hasOwnProperty(k)) {
                                    if (k === 'id') {
                                        continue;
                                    } else if (k === 'class') {
                                        m[obj.id].li_attr['class'] = (m[obj.id].li_attr['class'] || '').replace(t[old_type].li_attr[k], '');
                                        if (d) {
                                            d.removeClass(t[old_type].li_attr[k]);
                                        }
                                    } else if (m[obj.id].li_attr[k] === t[old_type].li_attr[k]) {
                                        m[obj.id].li_attr[k] = null;
                                        if (d) {
                                            d.removeAttr(k);
                                        }
                                    }
                                }
                            }
                        }
                        if (t[old_type] && t[old_type].a_attr !== undefined && typeof t[old_type].a_attr === 'object') {
                            for (k in t[old_type].a_attr) {
                                if (t[old_type].a_attr.hasOwnProperty(k)) {
                                    if (k === 'id') {
                                        continue;
                                    } else if (k === 'class') {
                                        m[obj.id].a_attr['class'] = (m[obj.id].a_attr['class'] || '').replace(t[old_type].a_attr[k], '');
                                        if (a) {
                                            a.removeClass(t[old_type].a_attr[k]);
                                        }
                                    } else if (m[obj.id].a_attr[k] === t[old_type].a_attr[k]) {
                                        if (k === 'href') {
                                            m[obj.id].a_attr[k] = '#';
                                            if (a) {
                                                a.attr('href', '#');
                                            }
                                        } else {
                                            delete m[obj.id].a_attr[k];
                                            if (a) {
                                                a.removeAttr(k);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (t[type].li_attr !== undefined && typeof t[type].li_attr === 'object') {
                            for (k in t[type].li_attr) {
                                if (t[type].li_attr.hasOwnProperty(k)) {
                                    if (k === 'id') {
                                        continue;
                                    } else if (m[obj.id].li_attr[k] === undefined) {
                                        m[obj.id].li_attr[k] = t[type].li_attr[k];
                                        if (d) {
                                            if (k === 'class') {
                                                d.addClass(t[type].li_attr[k]);
                                            } else {
                                                d.attr(k, t[type].li_attr[k]);
                                            }
                                        }
                                    } else if (k === 'class') {
                                        m[obj.id].li_attr['class'] = t[type].li_attr[k] + ' ' + m[obj.id].li_attr['class'];
                                        if (d) {
                                            d.addClass(t[type].li_attr[k]);
                                        }
                                    }
                                }
                            }
                        }
                        if (t[type].a_attr !== undefined && typeof t[type].a_attr === 'object') {
                            for (k in t[type].a_attr) {
                                if (t[type].a_attr.hasOwnProperty(k)) {
                                    if (k === 'id') {
                                        continue;
                                    } else if (m[obj.id].a_attr[k] === undefined) {
                                        m[obj.id].a_attr[k] = t[type].a_attr[k];
                                        if (a) {
                                            if (k === 'class') {
                                                a.addClass(t[type].a_attr[k]);
                                            } else {
                                                a.attr(k, t[type].a_attr[k]);
                                            }
                                        }
                                    } else if (k === 'href' && m[obj.id].a_attr[k] === '#') {
                                        m[obj.id].a_attr['href'] = t[type].a_attr['href'];
                                        if (a) {
                                            a.attr('href', t[type].a_attr['href']);
                                        }
                                    } else if (k === 'class') {
                                        m[obj.id].a_attr['class'] = t[type].a_attr['class'] + ' ' + m[obj.id].a_attr['class'];
                                        if (a) {
                                            a.addClass(t[type].a_attr[k]);
                                        }
                                    }
                                }
                            }
                        }
                        return true;
                    };
                };
                $.jstree.defaults.unique = {
                    case_sensitive: false,
                    duplicate: function (name, counter) {
                        return name + ' (' + counter + ')';
                    }
                };
                $.jstree.plugins.unique = function (options, parent) {
                    this.check = function (chk, obj, par, pos, more) {
                        if (parent.check.call(this, chk, obj, par, pos, more) === false) {
                            return false;
                        }
                        obj = obj && obj.id ? obj : this.get_node(obj);
                        par = par && par.id ? par : this.get_node(par);
                        if (!par || !par.children) {
                            return true;
                        }
                        var n = chk === 'rename_node' ? pos : obj.text, c = [], s = this.settings.unique.case_sensitive, m = this._model.data, i, j;
                        for (i = 0, j = par.children.length; i < j; i++) {
                            c.push(s ? m[par.children[i]].text : m[par.children[i]].text.toLowerCase());
                        }
                        if (!s) {
                            n = n.toLowerCase();
                        }
                        switch (chk) {
                        case 'delete_node':
                            return true;
                        case 'rename_node':
                            i = $.inArray(n, c) === -1 || obj.text && obj.text[s ? 'toString' : 'toLowerCase']() === n;
                            if (!i) {
                                this._data.core.last_error = {
                                    'error': 'check',
                                    'plugin': 'unique',
                                    'id': 'unique_01',
                                    'reason': 'Child with name ' + n + ' already exists. Preventing: ' + chk,
                                    'data': JSON.stringify({
                                        'chk': chk,
                                        'pos': pos,
                                        'obj': obj && obj.id ? obj.id : false,
                                        'par': par && par.id ? par.id : false
                                    })
                                };
                            }
                            return i;
                        case 'create_node':
                            i = $.inArray(n, c) === -1;
                            if (!i) {
                                this._data.core.last_error = {
                                    'error': 'check',
                                    'plugin': 'unique',
                                    'id': 'unique_04',
                                    'reason': 'Child with name ' + n + ' already exists. Preventing: ' + chk,
                                    'data': JSON.stringify({
                                        'chk': chk,
                                        'pos': pos,
                                        'obj': obj && obj.id ? obj.id : false,
                                        'par': par && par.id ? par.id : false
                                    })
                                };
                            }
                            return i;
                        case 'copy_node':
                            i = $.inArray(n, c) === -1;
                            if (!i) {
                                this._data.core.last_error = {
                                    'error': 'check',
                                    'plugin': 'unique',
                                    'id': 'unique_02',
                                    'reason': 'Child with name ' + n + ' already exists. Preventing: ' + chk,
                                    'data': JSON.stringify({
                                        'chk': chk,
                                        'pos': pos,
                                        'obj': obj && obj.id ? obj.id : false,
                                        'par': par && par.id ? par.id : false
                                    })
                                };
                            }
                            return i;
                        case 'move_node':
                            i = obj.parent === par.id && (!more || !more.is_multi) || $.inArray(n, c) === -1;
                            if (!i) {
                                this._data.core.last_error = {
                                    'error': 'check',
                                    'plugin': 'unique',
                                    'id': 'unique_03',
                                    'reason': 'Child with name ' + n + ' already exists. Preventing: ' + chk,
                                    'data': JSON.stringify({
                                        'chk': chk,
                                        'pos': pos,
                                        'obj': obj && obj.id ? obj.id : false,
                                        'par': par && par.id ? par.id : false
                                    })
                                };
                            }
                            return i;
                        }
                        return true;
                    };
                    this.create_node = function (par, node, pos, callback, is_loaded) {
                        if (!node || node.text === undefined) {
                            if (par === null) {
                                par = $.jstree.root;
                            }
                            par = this.get_node(par);
                            if (!par) {
                                return parent.create_node.call(this, par, node, pos, callback, is_loaded);
                            }
                            pos = pos === undefined ? 'last' : pos;
                            if (!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)) {
                                return parent.create_node.call(this, par, node, pos, callback, is_loaded);
                            }
                            if (!node) {
                                node = {};
                            }
                            var tmp, n, dpc, i, j, m = this._model.data, s = this.settings.unique.case_sensitive, cb = this.settings.unique.duplicate;
                            n = tmp = this.get_string('New node');
                            dpc = [];
                            for (i = 0, j = par.children.length; i < j; i++) {
                                dpc.push(s ? m[par.children[i]].text : m[par.children[i]].text.toLowerCase());
                            }
                            i = 1;
                            while ($.inArray(s ? n : n.toLowerCase(), dpc) !== -1) {
                                n = cb.call(this, tmp, ++i).toString();
                            }
                            node.text = n;
                        }
                        return parent.create_node.call(this, par, node, pos, callback, is_loaded);
                    };
                };
                var div = document.createElement('DIV');
                div.setAttribute('unselectable', 'on');
                div.setAttribute('role', 'presentation');
                div.className = 'jstree-wholerow';
                div.innerHTML = '&#160;';
                $.jstree.plugins.wholerow = function (options, parent) {
                    this.bind = function () {
                        parent.bind.call(this);
                        this.element.on('ready.jstree set_state.jstree', $.proxy(function () {
                            this.hide_dots();
                        }, this)).on('init.jstree loading.jstree ready.jstree', $.proxy(function () {
                            this.get_container_ul().addClass('jstree-wholerow-ul');
                        }, this)).on('deselect_all.jstree', $.proxy(function (e, data) {
                            this.element.find('.jstree-wholerow-clicked').removeClass('jstree-wholerow-clicked');
                        }, this)).on('changed.jstree', $.proxy(function (e, data) {
                            this.element.find('.jstree-wholerow-clicked').removeClass('jstree-wholerow-clicked');
                            var tmp = false, i, j;
                            for (i = 0, j = data.selected.length; i < j; i++) {
                                tmp = this.get_node(data.selected[i], true);
                                if (tmp && tmp.length) {
                                    tmp.children('.jstree-wholerow').addClass('jstree-wholerow-clicked');
                                }
                            }
                        }, this)).on('open_node.jstree', $.proxy(function (e, data) {
                            this.get_node(data.node, true).find('.jstree-clicked').parent().children('.jstree-wholerow').addClass('jstree-wholerow-clicked');
                        }, this)).on('hover_node.jstree dehover_node.jstree', $.proxy(function (e, data) {
                            if (e.type === 'hover_node' && this.is_disabled(data.node)) {
                                return;
                            }
                            this.get_node(data.node, true).children('.jstree-wholerow')[e.type === 'hover_node' ? 'addClass' : 'removeClass']('jstree-wholerow-hovered');
                        }, this)).on('contextmenu.jstree', '.jstree-wholerow', $.proxy(function (e) {
                            if (this._data.contextmenu) {
                                e.preventDefault();
                                var tmp = $.Event('contextmenu', {
                                        metaKey: e.metaKey,
                                        ctrlKey: e.ctrlKey,
                                        altKey: e.altKey,
                                        shiftKey: e.shiftKey,
                                        pageX: e.pageX,
                                        pageY: e.pageY
                                    });
                                $(e.currentTarget).closest('.jstree-node').children('.jstree-anchor').first().trigger(tmp);
                            }
                        }, this)).on('click.jstree', '.jstree-wholerow', function (e) {
                            e.stopImmediatePropagation();
                            var tmp = $.Event('click', {
                                    metaKey: e.metaKey,
                                    ctrlKey: e.ctrlKey,
                                    altKey: e.altKey,
                                    shiftKey: e.shiftKey
                                });
                            $(e.currentTarget).closest('.jstree-node').children('.jstree-anchor').first().trigger(tmp).focus();
                        }).on('dblclick.jstree', '.jstree-wholerow', function (e) {
                            e.stopImmediatePropagation();
                            var tmp = $.Event('dblclick', {
                                    metaKey: e.metaKey,
                                    ctrlKey: e.ctrlKey,
                                    altKey: e.altKey,
                                    shiftKey: e.shiftKey
                                });
                            $(e.currentTarget).closest('.jstree-node').children('.jstree-anchor').first().trigger(tmp).focus();
                        }).on('click.jstree', '.jstree-leaf > .jstree-ocl', $.proxy(function (e) {
                            e.stopImmediatePropagation();
                            var tmp = $.Event('click', {
                                    metaKey: e.metaKey,
                                    ctrlKey: e.ctrlKey,
                                    altKey: e.altKey,
                                    shiftKey: e.shiftKey
                                });
                            $(e.currentTarget).closest('.jstree-node').children('.jstree-anchor').first().trigger(tmp).focus();
                        }, this)).on('mouseover.jstree', '.jstree-wholerow, .jstree-icon', $.proxy(function (e) {
                            e.stopImmediatePropagation();
                            if (!this.is_disabled(e.currentTarget)) {
                                this.hover_node(e.currentTarget);
                            }
                            return false;
                        }, this)).on('mouseleave.jstree', '.jstree-node', $.proxy(function (e) {
                            this.dehover_node(e.currentTarget);
                        }, this));
                    };
                    this.teardown = function () {
                        if (this.settings.wholerow) {
                            this.element.find('.jstree-wholerow').remove();
                        }
                        parent.teardown.call(this);
                    };
                    this.redraw_node = function (obj, deep, callback, force_render) {
                        obj = parent.redraw_node.apply(this, arguments);
                        if (obj) {
                            var tmp = div.cloneNode(true);
                            if ($.inArray(obj.id, this._data.core.selected) !== -1) {
                                tmp.className += ' jstree-wholerow-clicked';
                            }
                            if (this._data.core.focused && this._data.core.focused === obj.id) {
                                tmp.className += ' jstree-wholerow-hovered';
                            }
                            obj.insertBefore(tmp, obj.childNodes[0]);
                        }
                        return obj;
                    };
                };
                if (document.registerElement && Object && Object.create) {
                    var proto = Object.create(HTMLElement.prototype);
                    proto.createdCallback = function () {
                        var c = {
                                core: {},
                                plugins: []
                            }, i;
                        for (i in $.jstree.plugins) {
                            if ($.jstree.plugins.hasOwnProperty(i) && this.attributes[i]) {
                                c.plugins.push(i);
                                if (this.getAttribute(i) && JSON.parse(this.getAttribute(i))) {
                                    c[i] = JSON.parse(this.getAttribute(i));
                                }
                            }
                        }
                        for (i in $.jstree.defaults.core) {
                            if ($.jstree.defaults.core.hasOwnProperty(i) && this.attributes[i]) {
                                c.core[i] = JSON.parse(this.getAttribute(i)) || this.getAttribute(i);
                            }
                        }
                        $(this).jstree(c);
                    };
                    try {
                        document.registerElement('vakata-jstree', { prototype: proto });
                    } catch (ignore) {
                    }
                }
            }));
        },
        function (module, exports) {
            'use strict';
            var bind = function (t, e) {
                return function () {
                    return t.apply(e, arguments);
                };
            };
            !function (t) {
                return 'object' == typeof module && module.exports ? module.exports = t(_require(3)) : 'function' == typeof define && define.amd ? define(['jquery'], t) : t(jQuery);
            }(function (t) {
                var e;
                return e = function () {
                    function e(e) {
                        this.render = bind(this.render, this), this.hideTooltip = bind(this.hideTooltip, this), this.showTooltip = bind(this.showTooltip, this), this.replaceCharacters = bind(this.replaceCharacters, this), this.log = bind(this.log, this), this.settings = t.extend({}, this.defaults, e), this.render();
                    }
                    return e.prototype.defaults = {
                        action: 'focus',
                        debug: !1,
                        element: '.error',
                        fadeSpeed: 200,
                        html5: !0,
                        preventDefault: !1,
                        removeAll: !1,
                        removeSpecific: !1,
                        tailLength: 14,
                        tooltipClass: ''
                    }, e.prototype.log = function (t) {
                        return this.settings.debug && 'undefined' != typeof console && null !== console ? console.info(t) : void 0;
                    }, e.prototype.replaceCharacters = function (t) {
                        var e, i, o, n, s, l, r;
                        o = [], l = [], i = [], s = [], e = t.split('');
                        for (n in e)
                            r = e[n], '^' === r && o.push(n), '*' === r && l.push(n), '~' === r && i.push(n), '`' === r && s.push(n), '|' === r && (e[n] = '<br />'), '{' === r && (e[n] = '<ul>'), '}' === r && (e[n] = '</ul>');
                        for (; o.length > 1;)
                            e[o[0]] = '<h1>', e[o[1]] = '</h1>', o.splice(0, 2);
                        for (; l.length > 1;)
                            e[l[0]] = '<strong>', e[l[1]] = '</strong>', l.splice(0, 2);
                        for (; i.length > 1;)
                            e[i[0]] = '<em>', e[i[1]] = '</em>', i.splice(0, 2);
                        for (; s.length;)
                            e[s[0]] = '<li>', s.splice(0, 1);
                        return e.join('');
                    }, e.prototype.showTooltip = function (e) {
                        var i, o, n, s, l, r, u, c, f, p, h;
                        if (e.attr('data-tooltip')) {
                            switch (this.hideTooltip(), s = this.replaceCharacters(e.attr('data-tooltip')), i = e.attr('data-tooltip-direction'), c = this.settings.html5 ? '<aside>' : '<div>', t(c).addClass('tooltip ' + this.settings.tooltipClass).html(s).appendTo('body'), n = e.outerWidth(), o = e.outerHeight(), p = t('.tooltip:last').outerWidth(), f = t('.tooltip:last').outerHeight(), r = e.offset(), h = r.top, l = 0, u = 0, i) {
                            case 'left':
                                u = r.left - p - this.settings.tailLength, h = h - f / 2 + o / 2, t('.tooltip:last').css({
                                    left: u,
                                    top: h
                                }).addClass('left').fadeIn(this.settings.fadeSpeed);
                                break;
                            case 'bottom':
                                h = r.top + o + this.settings.tailLength, l = r.left + n / 2 - p / 2, t('.tooltip:last').css({
                                    left: l,
                                    top: h
                                }).addClass('bottom').fadeIn(this.settings.fadeSpeed);
                                break;
                            case 'top':
                                h = r.top - f - this.settings.tailLength, l = r.left + n / 2 - p / 2, t('.tooltip:last').css({
                                    left: l,
                                    top: h
                                }).addClass('top').fadeIn(this.settings.fadeSpeed);
                                break;
                            default:
                                l = r.left + n + this.settings.tailLength, h = h - f / 2 + o / 2, t('.tooltip:last').css({
                                    left: l,
                                    top: h
                                }).fadeIn(this.settings.fadeSpeed);
                            }
                            if (this.settings.debug && (this.log('Tooltip Content: ' + s), n && this.log('Element Width: ' + n), o && this.log('Element Height: ' + o), h && this.log('Element Top Position: ' + h), l && this.log('Element Left Position: ' + l), u && this.log('Element Right Position: ' + u), p && this.log('Tooltip Width: ' + p), f))
                                return this.log('Tooltip Height: ' + f);
                        }
                    }, e.prototype.hideTooltip = function () {
                        return t('.tooltip').fadeOut(this.settings.fadeSpeed, function () {
                            return t(this).remove();
                        });
                    }, e.prototype.render = function () {
                        var e, i;
                        if (e = this, i = e.settings.element, e.settings.removeSpecific && !e.settings.removeAll && (e.settings.debug && e.log('unbinding tooltip'), e.settings.action && i))
                            switch (e.settings.action) {
                            case 'click':
                                t(document).off('click.tips.cd', i), t(document).off('blur.tips.bc', i);
                                break;
                            case 'hover':
                                t(document).off('click.tips.hc', i), t(document).off('mouseenter.tips.he', i), t(document).off('mouseout.tips.ho', i);
                                break;
                            default:
                                t(document).off('click.tips.fc', i), t(document).off('focus.tips.ff', i), t(document).off('blur.tips.fb', i), t(document).off('change.tips.fch', i);
                            }
                        if (e.settings.removeAll && (e.settings.debug && e.log('removing all tooltip binding'), t(document).off('click.tips'), t(document).off('blur.tips'), t(document).off('mouseenter.tips'), t(document).off('mouseout.tips'), t(document).off('change.tips')), !e.settings.removeAll && !e.settings.removeSpecific)
                            switch (e.settings.action) {
                            case 'click':
                                return t(document).on('click.tips.cc', i, function (i) {
                                    return e.settings.preventDefault && i.preventDefault(), t(this).is(':input') || t(this).attr('tabindex') || t(this).attr('tabindex', 0).focus(), e.showTooltip(t(this));
                                }), t(document).on('blur.tips.bc', i, function (i) {
                                    return t(this).is(':input') || t(this).attr('tabindex') || t(this).removeAttr('tabindex'), e.hideTooltip();
                                });
                            case 'hover':
                                return t(document).on('click.tips.hc', i, function (t) {
                                    return e.settings.preventDefault ? t.preventDefault() : void 0;
                                }), t(document).on('mouseenter.tips.he', i, function (i) {
                                    return e.showTooltip(t(this));
                                }), t(document).on('mouseout.tips.ho', i, function (t) {
                                    return e.hideTooltip();
                                });
                            default:
                                return t(document).on('click.tips.fc', i, function (t) {
                                    return e.settings.preventDefault ? t.preventDefault() : void 0;
                                }), t(document).on('focus.tips.ff', i, function (i) {
                                    return e.showTooltip(t(this));
                                }), t(document).on('blur.tips.fb', i, function (t) {
                                    return e.hideTooltip();
                                }), t(document).on('change.tips.fch', i, function (t) {
                                    return e.hideTooltip();
                                });
                            }
                    }, e;
                }(), t.extend({
                    tips: function (t, i) {
                        return this(function () {
                            var o;
                            return o = new e(t), 'function' == typeof i ? i.call(this) : void 0;
                        });
                    }
                });
            });
        },
        function (module, exports) {
            _require(13);
            _require(14);
            _require(15);
            var dialog = _require(16);
            _require(17);
            _require(18);
            _require(19);
            _require(20);
            _require(21);
            _require(22);
            _require(23);
            _require(24);
            _require(25);
            _require(26);
            _require(28);
            _require(29);
            _require(30);
            var bizui = {
                    theme: 'blue',
                    codepoints: _require(7),
                    alert: dialog.alert,
                    confirm: dialog.confirm,
                    Tooltip: _require(27)
                };
            window.bizui = bizui;
            module.exports = bizui;
        },
        function (module, exports) {
            module.exports = {
                '3d_rotation': '&#xe84d;',
                'ac_unit': '&#xeb3b;',
                'access_alarms': '&#xe191;',
                'access_time': '&#xe192;',
                'accessibility': '&#xe84e;',
                'accessible': '&#xe914;',
                'account_balance': '&#xe84f;',
                'account_balance_wallet': '&#xe850;',
                'account_box': '&#xe851;',
                'account_circle': '&#xe853;',
                'adb': '&#xe60e;',
                'add': '&#xe145;',
                'add_a_photo': '&#xe439;',
                'add_alarm': '&#xe193;',
                'add_alert': '&#xe003;',
                'add_box': '&#xe146;',
                'add_circle': '&#xe147;',
                'add_circle_outline': '&#xe148;',
                'add_location': '&#xe567;',
                'add_shopping_cart': '&#xe854;',
                'add_to_photos': '&#xe39d;',
                'add_to_queue': '&#xe05c;',
                'adjust': '&#xe39e;',
                'airline_seat_flat': '&#xe630;',
                'airline_seat_flat_angled': '&#xe631;',
                'airline_seat_individual_suite': '&#xe632;',
                'airline_seat_legroom_extra': '&#xe633;',
                'airline_seat_legroom_normal': '&#xe634;',
                'airline_seat_legroom_reduced': '&#xe635;',
                'airline_seat_recline_extra': '&#xe636;',
                'airline_seat_recline_normal': '&#xe637;',
                'airplanemode_active': '&#xe195;',
                'airplanemode_inactive': '&#xe194;',
                'airplay': '&#xe055;',
                'airport_shuttle': '&#xeb3c;',
                'alarm': '&#xe855;',
                'alarm_add': '&#xe856;',
                'alarm_off': '&#xe857;',
                'alarm_on': '&#xe858;',
                'album': '&#xe019;',
                'all_inclusive': '&#xeb3d;',
                'all_out': '&#xe90b;',
                'android': '&#xe859;',
                'announcement': '&#xe85a;',
                'apps': '&#xe5c3;',
                'archive': '&#xe149;',
                'arrow_back': '&#xe5c4;',
                'arrow_downward': '&#xe5db;',
                'arrow_drop_down': '&#xe5c5;',
                'arrow_drop_down_circle': '&#xe5c6;',
                'arrow_drop_up': '&#xe5c7;',
                'arrow_forward': '&#xe5c8;',
                'arrow_upward': '&#xe5d8;',
                'art_track': '&#xe060;',
                'aspect_ratio': '&#xe85b;',
                'assessment': '&#xe85c;',
                'assignment': '&#xe85d;',
                'assignment_ind': '&#xe85e;',
                'assignment_late': '&#xe85f;',
                'assignment_return': '&#xe860;',
                'assignment_returned': '&#xe861;',
                'assignment_turned_in': '&#xe862;',
                'assistant': '&#xe39f;',
                'assistant_photo': '&#xe3a0;',
                'attach_file': '&#xe226;',
                'attach_money': '&#xe227;',
                'attachment': '&#xe2bc;',
                'audiotrack': '&#xe3a1;',
                'autorenew': '&#xe863;',
                'av_timer': '&#xe01b;',
                'access_alarm': '&#xe190;',
                'backup': '&#xe864;',
                'battery_alert': '&#xe19c;',
                'battery_full': '&#xe1a4;',
                'battery_std': '&#xe1a5;',
                'battery_unknown': '&#xe1a6;',
                'beach_access': '&#xeb3e;',
                'beenhere': '&#xe52d;',
                'block': '&#xe14b;',
                'bluetooth': '&#xe1a7;',
                'bluetooth_audio': '&#xe60f;',
                'bluetooth_connected': '&#xe1a8;',
                'bluetooth_disabled': '&#xe1a9;',
                'bluetooth_searching': '&#xe1aa;',
                'blur_circular': '&#xe3a2;',
                'blur_linear': '&#xe3a3;',
                'blur_off': '&#xe3a4;',
                'blur_on': '&#xe3a5;',
                'book': '&#xe865;',
                'bookmark': '&#xe866;',
                'bookmark_border': '&#xe867;',
                'border_all': '&#xe228;',
                'border_bottom': '&#xe229;',
                'border_clear': '&#xe22a;',
                'border_color': '&#xe22b;',
                'border_horizontal': '&#xe22c;',
                'border_inner': '&#xe22d;',
                'border_left': '&#xe22e;',
                'border_outer': '&#xe22f;',
                'border_right': '&#xe230;',
                'border_style': '&#xe231;',
                'border_top': '&#xe232;',
                'border_vertical': '&#xe233;',
                'branding_watermark': '&#xe06b;',
                'brightness_1': '&#xe3a6;',
                'brightness_2': '&#xe3a7;',
                'brightness_3': '&#xe3a8;',
                'brightness_4': '&#xe3a9;',
                'brightness_5': '&#xe3aa;',
                'brightness_6': '&#xe3ab;',
                'brightness_7': '&#xe3ac;',
                'brightness_auto': '&#xe1ab;',
                'brightness_high': '&#xe1ac;',
                'brightness_low': '&#xe1ad;',
                'brightness_medium': '&#xe1ae;',
                'broken_image': '&#xe3ad;',
                'brush': '&#xe3ae;',
                'bubble_chart': '&#xe6dd;',
                'bug_report': '&#xe868;',
                'build': '&#xe869;',
                'burst_mode': '&#xe43c;',
                'business': '&#xe0af;',
                'business_center': '&#xeb3f;',
                'backspace': '&#xe14a;',
                'battery_charging_full': '&#xe1a3;',
                'cloud': '&#xe2bd;',
                'call': '&#xe0b0;',
                'call_made': '&#xe0b2;',
                'call_merge': '&#xe0b3;',
                'call_missed': '&#xe0b4;',
                'call_missed_outgoing': '&#xe0e4;',
                'call_received': '&#xe0b5;',
                'call_split': '&#xe0b6;',
                'call_to_action': '&#xe06c;',
                'camera': '&#xe3af;',
                'camera_alt': '&#xe3b0;',
                'camera_enhance': '&#xe8fc;',
                'camera_front': '&#xe3b1;',
                'camera_rear': '&#xe3b2;',
                'camera_roll': '&#xe3b3;',
                'cake': '&#xe7e9;',
                'card_giftcard': '&#xe8f6;',
                'card_membership': '&#xe8f7;',
                'card_travel': '&#xe8f8;',
                'casino': '&#xeb40;',
                'cast': '&#xe307;',
                'cast_connected': '&#xe308;',
                'center_focus_strong': '&#xe3b4;',
                'center_focus_weak': '&#xe3b5;',
                'change_history': '&#xe86b;',
                'chat': '&#xe0b7;',
                'chat_bubble': '&#xe0ca;',
                'chat_bubble_outline': '&#xe0cb;',
                'check': '&#xe5ca;',
                'check_box': '&#xe834;',
                'check_box_outline_blank': '&#xe835;',
                'check_circle': '&#xe86c;',
                'chevron_left': '&#xe5cb;',
                'chevron_right': '&#xe5cc;',
                'child_care': '&#xeb41;',
                'child_friendly': '&#xeb42;',
                'chrome_reader_mode': '&#xe86d;',
                'class': '&#xe86e;',
                'clear': '&#xe14c;',
                'clear_all': '&#xe0b8;',
                'close': '&#xe5cd;',
                'closed_caption': '&#xe01c;',
                'call_end': '&#xe0b1;',
                'cloud_circle': '&#xe2be;',
                'cloud_done': '&#xe2bf;',
                'cloud_download': '&#xe2c0;',
                'cloud_off': '&#xe2c1;',
                'cloud_queue': '&#xe2c2;',
                'cloud_upload': '&#xe2c3;',
                'code': '&#xe86f;',
                'collections': '&#xe3b6;',
                'collections_bookmark': '&#xe431;',
                'color_lens': '&#xe3b7;',
                'colorize': '&#xe3b8;',
                'comment': '&#xe0b9;',
                'compare': '&#xe3b9;',
                'compare_arrows': '&#xe915;',
                'computer': '&#xe30a;',
                'confirmation_number': '&#xe638;',
                'contact_mail': '&#xe0d0;',
                'contact_phone': '&#xe0cf;',
                'contacts': '&#xe0ba;',
                'content_copy': '&#xe14d;',
                'content_cut': '&#xe14e;',
                'content_paste': '&#xe14f;',
                'control_point': '&#xe3ba;',
                'control_point_duplicate': '&#xe3bb;',
                'copyright': '&#xe90c;',
                'create': '&#xe150;',
                'create_new_folder': '&#xe2cc;',
                'credit_card': '&#xe870;',
                'crop': '&#xe3be;',
                'crop_16_9': '&#xe3bc;',
                'crop_3_2': '&#xe3bd;',
                'crop_5_4': '&#xe3bf;',
                'crop_7_5': '&#xe3c0;',
                'crop_din': '&#xe3c1;',
                'crop_free': '&#xe3c2;',
                'crop_landscape': '&#xe3c3;',
                'crop_original': '&#xe3c4;',
                'crop_portrait': '&#xe3c5;',
                'crop_rotate': '&#xe437;',
                'crop_square': '&#xe3c6;',
                'cached': '&#xe86a;',
                'cancel': '&#xe5c9;',
                'data_usage': '&#xe1af;',
                'date_range': '&#xe916;',
                'dehaze': '&#xe3c7;',
                'delete': '&#xe872;',
                'delete_forever': '&#xe92b;',
                'delete_sweep': '&#xe16c;',
                'description': '&#xe873;',
                'desktop_mac': '&#xe30b;',
                'desktop_windows': '&#xe30c;',
                'details': '&#xe3c8;',
                'developer_board': '&#xe30d;',
                'developer_mode': '&#xe1b0;',
                'device_hub': '&#xe335;',
                'devices': '&#xe1b1;',
                'devices_other': '&#xe337;',
                'dialer_sip': '&#xe0bb;',
                'dialpad': '&#xe0bc;',
                'directions': '&#xe52e;',
                'directions_bike': '&#xe52f;',
                'directions_boat': '&#xe532;',
                'directions_bus': '&#xe530;',
                'directions_car': '&#xe531;',
                'directions_railway': '&#xe534;',
                'directions_run': '&#xe566;',
                'directions_subway': '&#xe533;',
                'directions_transit': '&#xe535;',
                'directions_walk': '&#xe536;',
                'disc_full': '&#xe610;',
                'dns': '&#xe875;',
                'do_not_disturb': '&#xe612;',
                'do_not_disturb_alt': '&#xe611;',
                'do_not_disturb_off': '&#xe643;',
                'do_not_disturb_on': '&#xe644;',
                'dock': '&#xe30e;',
                'domain': '&#xe7ee;',
                'done': '&#xe876;',
                'done_all': '&#xe877;',
                'donut_large': '&#xe917;',
                'donut_small': '&#xe918;',
                'drafts': '&#xe151;',
                'drag_handle': '&#xe25d;',
                'drive_eta': '&#xe613;',
                'dvr': '&#xe1b2;',
                'dashboard': '&#xe871;',
                'edit_location': '&#xe568;',
                'enhanced_encryption': '&#xe63f;',
                'email': '&#xe0be;',
                'edit': '&#xe3c9;',
                'equalizer': '&#xe01d;',
                'error': '&#xe000;',
                'error_outline': '&#xe001;',
                'euro_symbol': '&#xe926;',
                'ev_station': '&#xe56d;',
                'event': '&#xe878;',
                'event_available': '&#xe614;',
                'event_busy': '&#xe615;',
                'event_note': '&#xe616;',
                'event_seat': '&#xe903;',
                'exit_to_app': '&#xe879;',
                'expand_less': '&#xe5ce;',
                'expand_more': '&#xe5cf;',
                'explicit': '&#xe01e;',
                'explore': '&#xe87a;',
                'exposure': '&#xe3ca;',
                'exposure_neg_1': '&#xe3cb;',
                'exposure_neg_2': '&#xe3cc;',
                'exposure_plus_1': '&#xe3cd;',
                'exposure_plus_2': '&#xe3ce;',
                'exposure_zero': '&#xe3cf;',
                'extension': '&#xe87b;',
                'eject': '&#xe8fb;',
                'forward_30': '&#xe057;',
                'fast_forward': '&#xe01f;',
                'favorite': '&#xe87d;',
                'favorite_border': '&#xe87e;',
                'featured_play_list': '&#xe06d;',
                'featured_video': '&#xe06e;',
                'feedback': '&#xe87f;',
                'fiber_dvr': '&#xe05d;',
                'fiber_manual_record': '&#xe061;',
                'fiber_new': '&#xe05e;',
                'fiber_pin': '&#xe06a;',
                'fiber_smart_record': '&#xe062;',
                'file_download': '&#xe2c4;',
                'file_upload': '&#xe2c6;',
                'filter': '&#xe3d3;',
                'filter_1': '&#xe3d0;',
                'filter_2': '&#xe3d1;',
                'filter_3': '&#xe3d2;',
                'filter_4': '&#xe3d4;',
                'filter_5': '&#xe3d5;',
                'filter_6': '&#xe3d6;',
                'filter_7': '&#xe3d7;',
                'filter_8': '&#xe3d8;',
                'filter_9': '&#xe3d9;',
                'filter_9_plus': '&#xe3da;',
                'filter_b_and_w': '&#xe3db;',
                'filter_center_focus': '&#xe3dc;',
                'filter_drama': '&#xe3dd;',
                'filter_frames': '&#xe3de;',
                'filter_hdr': '&#xe3df;',
                'filter_list': '&#xe152;',
                'filter_none': '&#xe3e0;',
                'filter_tilt_shift': '&#xe3e2;',
                'filter_vintage': '&#xe3e3;',
                'find_in_page': '&#xe880;',
                'find_replace': '&#xe881;',
                'fingerprint': '&#xe90d;',
                'first_page': '&#xe5dc;',
                'fitness_center': '&#xeb43;',
                'flag': '&#xe153;',
                'flare': '&#xe3e4;',
                'flash_auto': '&#xe3e5;',
                'flash_off': '&#xe3e6;',
                'flash_on': '&#xe3e7;',
                'flight': '&#xe539;',
                'flight_land': '&#xe904;',
                'flight_takeoff': '&#xe905;',
                'flip': '&#xe3e8;',
                'flip_to_back': '&#xe882;',
                'flip_to_front': '&#xe883;',
                'folder': '&#xe2c7;',
                'folder_open': '&#xe2c8;',
                'folder_shared': '&#xe2c9;',
                'folder_special': '&#xe617;',
                'font_download': '&#xe167;',
                'format_align_center': '&#xe234;',
                'format_align_justify': '&#xe235;',
                'format_align_left': '&#xe236;',
                'format_align_right': '&#xe237;',
                'format_bold': '&#xe238;',
                'format_clear': '&#xe239;',
                'format_color_fill': '&#xe23a;',
                'format_color_reset': '&#xe23b;',
                'format_color_text': '&#xe23c;',
                'format_indent_decrease': '&#xe23d;',
                'format_indent_increase': '&#xe23e;',
                'format_italic': '&#xe23f;',
                'face': '&#xe87c;',
                'format_list_bulleted': '&#xe241;',
                'format_list_numbered': '&#xe242;',
                'format_paint': '&#xe243;',
                'format_quote': '&#xe244;',
                'format_shapes': '&#xe25e;',
                'format_size': '&#xe245;',
                'format_strikethrough': '&#xe246;',
                'format_textdirection_l_to_r': '&#xe247;',
                'format_textdirection_r_to_l': '&#xe248;',
                'format_underlined': '&#xe249;',
                'forum': '&#xe0bf;',
                'forward': '&#xe154;',
                'forward_10': '&#xe056;',
                'fast_rewind': '&#xe020;',
                'forward_5': '&#xe058;',
                'free_breakfast': '&#xeb44;',
                'fullscreen': '&#xe5d0;',
                'fullscreen_exit': '&#xe5d1;',
                'functions': '&#xe24a;',
                'format_line_spacing': '&#xe240;',
                'g_translate': '&#xe927;',
                'games': '&#xe021;',
                'gavel': '&#xe90e;',
                'gesture': '&#xe155;',
                'get_app': '&#xe884;',
                'gif': '&#xe908;',
                'golf_course': '&#xeb45;',
                'gps_fixed': '&#xe1b3;',
                'gps_not_fixed': '&#xe1b4;',
                'gps_off': '&#xe1b5;',
                'grade': '&#xe885;',
                'gradient': '&#xe3e9;',
                'grain': '&#xe3ea;',
                'graphic_eq': '&#xe1b8;',
                'grid_off': '&#xe3eb;',
                'grid_on': '&#xe3ec;',
                'group': '&#xe7ef;',
                'group_add': '&#xe7f0;',
                'group_work': '&#xe886;',
                'gamepad': '&#xe30f;',
                'hdr_off': '&#xe3ed;',
                'hotel': '&#xe53a;',
                'hdr_strong': '&#xe3f1;',
                'hdr_weak': '&#xe3f2;',
                'headset': '&#xe310;',
                'headset_mic': '&#xe311;',
                'healing': '&#xe3f3;',
                'hearing': '&#xe023;',
                'help': '&#xe887;',
                'help_outline': '&#xe8fd;',
                'high_quality': '&#xe024;',
                'highlight': '&#xe25f;',
                'highlight_off': '&#xe888;',
                'history': '&#xe889;',
                'home': '&#xe88a;',
                'hot_tub': '&#xeb46;',
                'hd': '&#xe052;',
                'hourglass_empty': '&#xe88b;',
                'hourglass_full': '&#xe88c;',
                'http': '&#xe902;',
                'https': '&#xe88d;',
                'hdr_on': '&#xe3ee;',
                'invert_colors': '&#xe891;',
                'image_aspect_ratio': '&#xe3f5;',
                'import_export': '&#xe0c3;',
                'important_devices': '&#xe912;',
                'inbox': '&#xe156;',
                'image': '&#xe3f4;',
                'info': '&#xe88e;',
                'info_outline': '&#xe88f;',
                'input': '&#xe890;',
                'insert_chart': '&#xe24b;',
                'insert_comment': '&#xe24c;',
                'insert_drive_file': '&#xe24d;',
                'insert_emoticon': '&#xe24e;',
                'insert_invitation': '&#xe24f;',
                'insert_link': '&#xe250;',
                'insert_photo': '&#xe251;',
                'import_contacts': '&#xe0e0;',
                'invert_colors_off': '&#xe0c4;',
                'iso': '&#xe3f6;',
                'indeterminate_check_box': '&#xe909;',
                'keyboard': '&#xe312;',
                'keyboard_arrow_left': '&#xe314;',
                'keyboard_arrow_right': '&#xe315;',
                'keyboard_arrow_up': '&#xe316;',
                'keyboard_backspace': '&#xe317;',
                'keyboard_arrow_down': '&#xe313;',
                'keyboard_hide': '&#xe31a;',
                'keyboard_return': '&#xe31b;',
                'keyboard_tab': '&#xe31c;',
                'keyboard_voice': '&#xe31d;',
                'kitchen': '&#xeb47;',
                'keyboard_capslock': '&#xe318;',
                'label': '&#xe892;',
                'label_outline': '&#xe893;',
                'landscape': '&#xe3f7;',
                'language': '&#xe894;',
                'laptop': '&#xe31e;',
                'laptop_chromebook': '&#xe31f;',
                'laptop_mac': '&#xe320;',
                'laptop_windows': '&#xe321;',
                'last_page': '&#xe5dd;',
                'launch': '&#xe895;',
                'layers': '&#xe53b;',
                'layers_clear': '&#xe53c;',
                'leak_add': '&#xe3f8;',
                'leak_remove': '&#xe3f9;',
                'lens': '&#xe3fa;',
                'library_add': '&#xe02e;',
                'library_books': '&#xe02f;',
                'library_music': '&#xe030;',
                'lightbulb_outline': '&#xe90f;',
                'line_style': '&#xe919;',
                'line_weight': '&#xe91a;',
                'linear_scale': '&#xe260;',
                'link': '&#xe157;',
                'linked_camera': '&#xe438;',
                'list': '&#xe896;',
                'live_help': '&#xe0c6;',
                'live_tv': '&#xe639;',
                'local_activity': '&#xe53f;',
                'local_airport': '&#xe53d;',
                'local_atm': '&#xe53e;',
                'local_bar': '&#xe540;',
                'local_cafe': '&#xe541;',
                'local_car_wash': '&#xe542;',
                'local_convenience_store': '&#xe543;',
                'local_dining': '&#xe556;',
                'local_drink': '&#xe544;',
                'local_florist': '&#xe545;',
                'local_gas_station': '&#xe546;',
                'local_grocery_store': '&#xe547;',
                'local_hospital': '&#xe548;',
                'local_hotel': '&#xe549;',
                'local_laundry_service': '&#xe54a;',
                'local_library': '&#xe54b;',
                'local_mall': '&#xe54c;',
                'local_movies': '&#xe54d;',
                'local_offer': '&#xe54e;',
                'local_parking': '&#xe54f;',
                'local_pharmacy': '&#xe550;',
                'local_phone': '&#xe551;',
                'local_pizza': '&#xe552;',
                'local_play': '&#xe553;',
                'local_post_office': '&#xe554;',
                'local_printshop': '&#xe555;',
                'local_see': '&#xe557;',
                'local_shipping': '&#xe558;',
                'local_taxi': '&#xe559;',
                'location_city': '&#xe7f1;',
                'location_disabled': '&#xe1b6;',
                'location_off': '&#xe0c7;',
                'location_on': '&#xe0c8;',
                'location_searching': '&#xe1b7;',
                'lock': '&#xe897;',
                'lock_open': '&#xe898;',
                'lock_outline': '&#xe899;',
                'looks': '&#xe3fc;',
                'looks_3': '&#xe3fb;',
                'looks_4': '&#xe3fd;',
                'looks_5': '&#xe3fe;',
                'looks_6': '&#xe3ff;',
                'looks_one': '&#xe400;',
                'looks_two': '&#xe401;',
                'loop': '&#xe028;',
                'loupe': '&#xe402;',
                'low_priority': '&#xe16d;',
                'loyalty': '&#xe89a;',
                'mail': '&#xe158;',
                'mail_outline': '&#xe0e1;',
                'markunread': '&#xe159;',
                'markunread_mailbox': '&#xe89b;',
                'memory': '&#xe322;',
                'menu': '&#xe5d2;',
                'merge_type': '&#xe252;',
                'message': '&#xe0c9;',
                'mic': '&#xe029;',
                'mic_none': '&#xe02a;',
                'mic_off': '&#xe02b;',
                'mms': '&#xe618;',
                'mode_comment': '&#xe253;',
                'mode_edit': '&#xe254;',
                'monetization_on': '&#xe263;',
                'money_off': '&#xe25c;',
                'monochrome_photos': '&#xe403;',
                'mood': '&#xe7f2;',
                'mood_bad': '&#xe7f3;',
                'more': '&#xe619;',
                'more_horiz': '&#xe5d3;',
                'more_vert': '&#xe5d4;',
                'motorcycle': '&#xe91b;',
                'mouse': '&#xe323;',
                'move_to_inbox': '&#xe168;',
                'movie': '&#xe02c;',
                'movie_creation': '&#xe404;',
                'movie_filter': '&#xe43a;',
                'multiline_chart': '&#xe6df;',
                'music_note': '&#xe405;',
                'music_video': '&#xe063;',
                'my_location': '&#xe55c;',
                'map': '&#xe55b;',
                'note': '&#xe06f;',
                'nature_people': '&#xe407;',
                'navigation': '&#xe55d;',
                'near_me': '&#xe569;',
                'network_cell': '&#xe1b9;',
                'network_check': '&#xe640;',
                'network_locked': '&#xe61a;',
                'network_wifi': '&#xe1ba;',
                'new_releases': '&#xe031;',
                'next_week': '&#xe16a;',
                'nfc': '&#xe1bb;',
                'no_encryption': '&#xe641;',
                'no_sim': '&#xe0cc;',
                'not_interested': '&#xe033;',
                'navigate_next': '&#xe409;',
                'note_add': '&#xe89c;',
                'notifications': '&#xe7f4;',
                'notifications_active': '&#xe7f7;',
                'notifications_none': '&#xe7f5;',
                'notifications_off': '&#xe7f6;',
                'notifications_paused': '&#xe7f8;',
                'nature': '&#xe406;',
                'navigate_before': '&#xe408;',
                'ondemand_video': '&#xe63a;',
                'opacity': '&#xe91c;',
                'open_in_browser': '&#xe89d;',
                'open_in_new': '&#xe89e;',
                'open_with': '&#xe89f;',
                'offline_pin': '&#xe90a;',
                'pageview': '&#xe8a0;',
                'palette': '&#xe40a;',
                'pan_tool': '&#xe925;',
                'panorama': '&#xe40b;',
                'panorama_fish_eye': '&#xe40c;',
                'panorama_horizontal': '&#xe40d;',
                'panorama_vertical': '&#xe40e;',
                'panorama_wide_angle': '&#xe40f;',
                'party_mode': '&#xe7fa;',
                'pause': '&#xe034;',
                'pause_circle_filled': '&#xe035;',
                'pause_circle_outline': '&#xe036;',
                'payment': '&#xe8a1;',
                'people': '&#xe7fb;',
                'people_outline': '&#xe7fc;',
                'perm_camera_mic': '&#xe8a2;',
                'perm_contact_calendar': '&#xe8a3;',
                'perm_data_setting': '&#xe8a4;',
                'perm_device_information': '&#xe8a5;',
                'perm_identity': '&#xe8a6;',
                'perm_media': '&#xe8a7;',
                'perm_phone_msg': '&#xe8a8;',
                'perm_scan_wifi': '&#xe8a9;',
                'person': '&#xe7fd;',
                'person_add': '&#xe7fe;',
                'person_outline': '&#xe7ff;',
                'person_pin': '&#xe55a;',
                'person_pin_circle': '&#xe56a;',
                'personal_video': '&#xe63b;',
                'pets': '&#xe91d;',
                'phone': '&#xe0cd;',
                'phone_android': '&#xe324;',
                'phone_bluetooth_speaker': '&#xe61b;',
                'phone_forwarded': '&#xe61c;',
                'phone_in_talk': '&#xe61d;',
                'phone_iphone': '&#xe325;',
                'phone_locked': '&#xe61e;',
                'phone_missed': '&#xe61f;',
                'phone_paused': '&#xe620;',
                'phonelink': '&#xe326;',
                'phonelink_erase': '&#xe0db;',
                'phonelink_lock': '&#xe0dc;',
                'phonelink_off': '&#xe327;',
                'phonelink_ring': '&#xe0dd;',
                'phonelink_setup': '&#xe0de;',
                'photo': '&#xe410;',
                'photo_album': '&#xe411;',
                'photo_camera': '&#xe412;',
                'photo_filter': '&#xe43b;',
                'photo_library': '&#xe413;',
                'pages': '&#xe7f9;',
                'photo_size_select_large': '&#xe433;',
                'photo_size_select_small': '&#xe434;',
                'picture_as_pdf': '&#xe415;',
                'picture_in_picture': '&#xe8aa;',
                'picture_in_picture_alt': '&#xe911;',
                'pie_chart': '&#xe6c4;',
                'pie_chart_outlined': '&#xe6c5;',
                'pin_drop': '&#xe55e;',
                'place': '&#xe55f;',
                'play_arrow': '&#xe037;',
                'play_circle_filled': '&#xe038;',
                'play_circle_outline': '&#xe039;',
                'play_for_work': '&#xe906;',
                'playlist_add': '&#xe03b;',
                'playlist_add_check': '&#xe065;',
                'playlist_play': '&#xe05f;',
                'plus_one': '&#xe800;',
                'poll': '&#xe801;',
                'polymer': '&#xe8ab;',
                'pool': '&#xeb48;',
                'portable_wifi_off': '&#xe0ce;',
                'portrait': '&#xe416;',
                'power': '&#xe63c;',
                'power_input': '&#xe336;',
                'power_settings_new': '&#xe8ac;',
                'pregnant_woman': '&#xe91e;',
                'present_to_all': '&#xe0df;',
                'print': '&#xe8ad;',
                'priority_high': '&#xe645;',
                'public': '&#xe80b;',
                'publish': '&#xe255;',
                'photo_size_select_actual': '&#xe432;',
                'query_builder': '&#xe8ae;',
                'queue': '&#xe03c;',
                'queue_music': '&#xe03d;',
                'queue_play_next': '&#xe066;',
                'question_answer': '&#xe8af;',
                'replay_5': '&#xe05b;',
                'radio_button_checked': '&#xe837;',
                'rate_review': '&#xe560;',
                'receipt': '&#xe8b0;',
                'recent_actors': '&#xe03f;',
                'record_voice_over': '&#xe91f;',
                'redeem': '&#xe8b1;',
                'redo': '&#xe15a;',
                'refresh': '&#xe5d5;',
                'remove': '&#xe15b;',
                'remove_circle': '&#xe15c;',
                'remove_circle_outline': '&#xe15d;',
                'remove_from_queue': '&#xe067;',
                'remove_red_eye': '&#xe417;',
                'remove_shopping_cart': '&#xe928;',
                'reorder': '&#xe8fe;',
                'repeat': '&#xe040;',
                'repeat_one': '&#xe041;',
                'radio': '&#xe03e;',
                'replay_10': '&#xe059;',
                'replay_30': '&#xe05a;',
                'radio_button_unchecked': '&#xe836;',
                'reply': '&#xe15e;',
                'reply_all': '&#xe15f;',
                'report': '&#xe160;',
                'report_problem': '&#xe8b2;',
                'restaurant': '&#xe56c;',
                'restaurant_menu': '&#xe561;',
                'restore': '&#xe8b3;',
                'restore_page': '&#xe929;',
                'ring_volume': '&#xe0d1;',
                'room': '&#xe8b4;',
                'room_service': '&#xeb49;',
                'rotate_90_degrees_ccw': '&#xe418;',
                'rotate_left': '&#xe419;',
                'rotate_right': '&#xe41a;',
                'rounded_corner': '&#xe920;',
                'router': '&#xe328;',
                'rowing': '&#xe921;',
                'rss_feed': '&#xe0e5;',
                'rv_hookup': '&#xe642;',
                'replay': '&#xe042;',
                'satellite': '&#xe562;',
                'save': '&#xe161;',
                'scanner': '&#xe329;',
                'schedule': '&#xe8b5;',
                'school': '&#xe80c;',
                'screen_lock_landscape': '&#xe1be;',
                'screen_lock_portrait': '&#xe1bf;',
                'screen_lock_rotation': '&#xe1c0;',
                'screen_rotation': '&#xe1c1;',
                'screen_share': '&#xe0e2;',
                'sd_card': '&#xe623;',
                'sd_storage': '&#xe1c2;',
                'search': '&#xe8b6;',
                'security': '&#xe32a;',
                'select_all': '&#xe162;',
                'send': '&#xe163;',
                'sentiment_dissatisfied': '&#xe811;',
                'sentiment_neutral': '&#xe812;',
                'sentiment_satisfied': '&#xe813;',
                'sentiment_very_dissatisfied': '&#xe814;',
                'sentiment_very_satisfied': '&#xe815;',
                'settings': '&#xe8b8;',
                'settings_applications': '&#xe8b9;',
                'settings_backup_restore': '&#xe8ba;',
                'settings_bluetooth': '&#xe8bb;',
                'settings_brightness': '&#xe8bd;',
                'settings_cell': '&#xe8bc;',
                'settings_ethernet': '&#xe8be;',
                'settings_input_antenna': '&#xe8bf;',
                'settings_input_component': '&#xe8c0;',
                'settings_input_composite': '&#xe8c1;',
                'settings_input_hdmi': '&#xe8c2;',
                'settings_input_svideo': '&#xe8c3;',
                'settings_overscan': '&#xe8c4;',
                'settings_phone': '&#xe8c5;',
                'settings_power': '&#xe8c6;',
                'settings_remote': '&#xe8c7;',
                'settings_system_daydream': '&#xe1c3;',
                'settings_voice': '&#xe8c8;',
                'share': '&#xe80d;',
                'shop': '&#xe8c9;',
                'shop_two': '&#xe8ca;',
                'shopping_basket': '&#xe8cb;',
                'shopping_cart': '&#xe8cc;',
                'short_text': '&#xe261;',
                'show_chart': '&#xe6e1;',
                'shuffle': '&#xe043;',
                'signal_cellular_4_bar': '&#xe1c8;',
                'signal_cellular_connected_no_internet_4_bar': '&#xe1cd;',
                'signal_cellular_no_sim': '&#xe1ce;',
                'signal_cellular_null': '&#xe1cf;',
                'signal_cellular_off': '&#xe1d0;',
                'signal_wifi_4_bar': '&#xe1d8;',
                'signal_wifi_4_bar_lock': '&#xe1d9;',
                'signal_wifi_off': '&#xe1da;',
                'sim_card': '&#xe32b;',
                'sim_card_alert': '&#xe624;',
                'skip_next': '&#xe044;',
                'skip_previous': '&#xe045;',
                'slideshow': '&#xe41b;',
                'slow_motion_video': '&#xe068;',
                'smartphone': '&#xe32c;',
                'smoke_free': '&#xeb4a;',
                'smoking_rooms': '&#xeb4b;',
                'sms': '&#xe625;',
                'sms_failed': '&#xe626;',
                'snooze': '&#xe046;',
                'sort': '&#xe164;',
                'sort_by_alpha': '&#xe053;',
                'spa': '&#xeb4c;',
                'space_bar': '&#xe256;',
                'speaker': '&#xe32d;',
                'speaker_group': '&#xe32e;',
                'speaker_notes': '&#xe8cd;',
                'speaker_notes_off': '&#xe92a;',
                'speaker_phone': '&#xe0d2;',
                'spellcheck': '&#xe8ce;',
                'star': '&#xe838;',
                'star_border': '&#xe83a;',
                'star_half': '&#xe839;',
                'stars': '&#xe8d0;',
                'stay_current_landscape': '&#xe0d3;',
                'stay_current_portrait': '&#xe0d4;',
                'stay_primary_landscape': '&#xe0d5;',
                'stay_primary_portrait': '&#xe0d6;',
                'stop': '&#xe047;',
                'stop_screen_share': '&#xe0e3;',
                'storage': '&#xe1db;',
                'store': '&#xe8d1;',
                'store_mall_directory': '&#xe563;',
                'straighten': '&#xe41c;',
                'streetview': '&#xe56e;',
                'strikethrough_s': '&#xe257;',
                'style': '&#xe41d;',
                'subdirectory_arrow_left': '&#xe5d9;',
                'subdirectory_arrow_right': '&#xe5da;',
                'subject': '&#xe8d2;',
                'subscriptions': '&#xe064;',
                'subtitles': '&#xe048;',
                'subway': '&#xe56f;',
                'supervisor_account': '&#xe8d3;',
                'surround_sound': '&#xe049;',
                'swap_calls': '&#xe0d7;',
                'swap_horiz': '&#xe8d4;',
                'swap_vert': '&#xe8d5;',
                'swap_vertical_circle': '&#xe8d6;',
                'switch_camera': '&#xe41e;',
                'switch_video': '&#xe41f;',
                'sync': '&#xe627;',
                'sync_disabled': '&#xe628;',
                'sync_problem': '&#xe629;',
                'system_update': '&#xe62a;',
                'system_update_alt': '&#xe8d7;',
                'toll': '&#xe8e0;',
                'tab': '&#xe8d8;',
                'tablet_android': '&#xe330;',
                'tablet_mac': '&#xe331;',
                'tag_faces': '&#xe420;',
                'tap_and_play': '&#xe62b;',
                'terrain': '&#xe564;',
                'text_fields': '&#xe262;',
                'text_format': '&#xe165;',
                'textsms': '&#xe0d8;',
                'texture': '&#xe421;',
                'theaters': '&#xe8da;',
                'thumb_down': '&#xe8db;',
                'thumb_up': '&#xe8dc;',
                'thumbs_up_down': '&#xe8dd;',
                'time_to_leave': '&#xe62c;',
                'timelapse': '&#xe422;',
                'timeline': '&#xe922;',
                'timer': '&#xe425;',
                'timer_10': '&#xe423;',
                'timer_3': '&#xe424;',
                'timer_off': '&#xe426;',
                'title': '&#xe264;',
                'toc': '&#xe8de;',
                'today': '&#xe8df;',
                'tablet': '&#xe32f;',
                'tonality': '&#xe427;',
                'touch_app': '&#xe913;',
                'toys': '&#xe332;',
                'track_changes': '&#xe8e1;',
                'traffic': '&#xe565;',
                'train': '&#xe570;',
                'tram': '&#xe571;',
                'transfer_within_a_station': '&#xe572;',
                'transform': '&#xe428;',
                'translate': '&#xe8e2;',
                'trending_down': '&#xe8e3;',
                'trending_flat': '&#xe8e4;',
                'trending_up': '&#xe8e5;',
                'tune': '&#xe429;',
                'turned_in': '&#xe8e6;',
                'turned_in_not': '&#xe8e7;',
                'tv': '&#xe333;',
                'tab_unselected': '&#xe8d9;',
                'unarchive': '&#xe169;',
                'undo': '&#xe166;',
                'unfold_less': '&#xe5d6;',
                'unfold_more': '&#xe5d7;',
                'update': '&#xe923;',
                'usb': '&#xe1e0;',
                'verified_user': '&#xe8e8;',
                'vertical_align_bottom': '&#xe258;',
                'vertical_align_center': '&#xe259;',
                'vertical_align_top': '&#xe25a;',
                'vibration': '&#xe62d;',
                'video_call': '&#xe070;',
                'video_label': '&#xe071;',
                'video_library': '&#xe04a;',
                'videocam': '&#xe04b;',
                'videocam_off': '&#xe04c;',
                'videogame_asset': '&#xe338;',
                'view_agenda': '&#xe8e9;',
                'view_array': '&#xe8ea;',
                'view_carousel': '&#xe8eb;',
                'view_column': '&#xe8ec;',
                'view_comfy': '&#xe42a;',
                'view_compact': '&#xe42b;',
                'view_day': '&#xe8ed;',
                'view_headline': '&#xe8ee;',
                'view_list': '&#xe8ef;',
                'view_module': '&#xe8f0;',
                'view_quilt': '&#xe8f1;',
                'view_stream': '&#xe8f2;',
                'view_week': '&#xe8f3;',
                'vignette': '&#xe435;',
                'visibility': '&#xe8f4;',
                'visibility_off': '&#xe8f5;',
                'voice_chat': '&#xe62e;',
                'voicemail': '&#xe0d9;',
                'volume_down': '&#xe04d;',
                'volume_mute': '&#xe04e;',
                'volume_off': '&#xe04f;',
                'volume_up': '&#xe050;',
                'vpn_key': '&#xe0da;',
                'vpn_lock': '&#xe62f;',
                'weekend': '&#xe16b;',
                'wallpaper': '&#xe1bc;',
                'watch': '&#xe334;',
                'watch_later': '&#xe924;',
                'wb_auto': '&#xe42c;',
                'wb_cloudy': '&#xe42d;',
                'wb_incandescent': '&#xe42e;',
                'wb_iridescent': '&#xe436;',
                'wb_sunny': '&#xe430;',
                'wc': '&#xe63d;',
                'web': '&#xe051;',
                'web_asset': '&#xe069;',
                'warning': '&#xe002;',
                'whatshot': '&#xe80e;',
                'widgets': '&#xe1bd;',
                'wifi': '&#xe63e;',
                'wifi_lock': '&#xe1e1;',
                'wifi_tethering': '&#xe1e2;',
                'work': '&#xe8f9;',
                'wrap_text': '&#xe25b;',
                'youtube_searched_for': '&#xe8fa;',
                'zoom_in': '&#xe8ff;',
                'zoom_out': '&#xe900;',
                'zoom_out_map': '&#xe56b;'
            };
        },
        function (module, exports) {
            (function (factory) {
                if (typeof define === 'function' && define.amd) {
                    define(['jquery'], factory);
                } else if (typeof exports === 'object') {
                    factory(_require(3));
                } else {
                    factory(jQuery);
                }
            }(function ($, undefined) {
                function UTCDate() {
                    return new Date(Date.UTC.apply(Date, arguments));
                }
                function UTCToday() {
                    var today = new Date();
                    return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
                }
                function isUTCEquals(date1, date2) {
                    return date1.getUTCFullYear() === date2.getUTCFullYear() && date1.getUTCMonth() === date2.getUTCMonth() && date1.getUTCDate() === date2.getUTCDate();
                }
                function alias(method) {
                    return function () {
                        return this[method].apply(this, arguments);
                    };
                }
                function isValidDate(d) {
                    return d && !isNaN(d.getTime());
                }
                var DateArray = function () {
                        var extras = {
                                get: function (i) {
                                    return this.slice(i)[0];
                                },
                                contains: function (d) {
                                    var val = d && d.valueOf();
                                    for (var i = 0, l = this.length; i < l; i++)
                                        if (this[i].valueOf() === val)
                                            return i;
                                    return -1;
                                },
                                remove: function (i) {
                                    this.splice(i, 1);
                                },
                                replace: function (new_array) {
                                    if (!new_array)
                                        return;
                                    if (!$.isArray(new_array))
                                        new_array = [new_array];
                                    this.clear();
                                    this.push.apply(this, new_array);
                                },
                                clear: function () {
                                    this.length = 0;
                                },
                                copy: function () {
                                    var a = new DateArray();
                                    a.replace(this);
                                    return a;
                                }
                            };
                        return function () {
                            var a = [];
                            a.push.apply(a, arguments);
                            $.extend(a, extras);
                            return a;
                        };
                    }();
                var Datepicker = function (element, options) {
                    $(element).data('datepicker', this);
                    this._process_options(options);
                    this.dates = new DateArray();
                    this.viewDate = this.o.defaultViewDate;
                    this.focusDate = null;
                    this.element = $(element);
                    this.isInput = this.element.is('input');
                    this.inputField = this.isInput ? this.element : this.element.find('input');
                    this.component = this.element.hasClass('date') ? this.element.find('.add-on, .input-group-addon, .btn') : false;
                    this.hasInput = this.component && this.inputField.length;
                    if (this.component && this.component.length === 0)
                        this.component = false;
                    this.isInline = !this.component && this.element.is('div');
                    this.picker = $(DPGlobal.template);
                    this.picker.addClass('biz-calendar-' + (options.theme || bizui.theme));
                    if (this._check_template(this.o.templates.leftArrow)) {
                        this.picker.find('.prev').html(this.o.templates.leftArrow);
                    }
                    if (this._check_template(this.o.templates.rightArrow)) {
                        this.picker.find('.next').html(this.o.templates.rightArrow);
                    }
                    this._buildEvents();
                    this._attachEvents();
                    if (this.isInline) {
                        this.picker.addClass('datepicker-inline').appendTo(this.element);
                    } else {
                        this.picker.addClass('datepicker-dropdown dropdown-menu');
                    }
                    if (this.o.rtl) {
                        this.picker.addClass('datepicker-rtl');
                    }
                    this.viewMode = this.o.startView;
                    if (this.o.calendarWeeks)
                        this.picker.find('thead .datepicker-title, tfoot .today, tfoot .clear').attr('colspan', function (i, val) {
                            return parseInt(val) + 1;
                        });
                    this._allow_update = false;
                    this.setStartDate(this._o.startDate);
                    this.setEndDate(this._o.endDate);
                    this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);
                    this.setDaysOfWeekHighlighted(this.o.daysOfWeekHighlighted);
                    this.setDatesDisabled(this.o.datesDisabled);
                    this.fillDow();
                    this.fillMonths();
                    this._allow_update = true;
                    this.update();
                    this.showMode();
                    if (this.isInline) {
                        this.show();
                    }
                };
                Datepicker.prototype = {
                    constructor: Datepicker,
                    _resolveViewName: function (view, default_value) {
                        if (view === 0 || view === 'days' || view === 'month') {
                            return 0;
                        }
                        if (view === 1 || view === 'months' || view === 'year') {
                            return 1;
                        }
                        if (view === 2 || view === 'years' || view === 'decade') {
                            return 2;
                        }
                        if (view === 3 || view === 'decades' || view === 'century') {
                            return 3;
                        }
                        if (view === 4 || view === 'centuries' || view === 'millennium') {
                            return 4;
                        }
                        return default_value === undefined ? false : default_value;
                    },
                    _check_template: function (tmp) {
                        try {
                            if (tmp === undefined || tmp === '') {
                                return false;
                            }
                            if ((tmp.match(/[<>]/g) || []).length <= 0) {
                                return true;
                            }
                            var jDom = $(tmp);
                            return jDom.length > 0;
                        } catch (ex) {
                            return false;
                        }
                    },
                    _process_options: function (opts) {
                        this._o = $.extend({}, this._o, opts);
                        var o = this.o = $.extend({}, this._o);
                        var lang = o.language;
                        if (!dates[lang]) {
                            lang = lang.split('-')[0];
                            if (!dates[lang])
                                lang = defaults.language;
                        }
                        o.language = lang;
                        o.startView = this._resolveViewName(o.startView, 0);
                        o.minViewMode = this._resolveViewName(o.minViewMode, 0);
                        o.maxViewMode = this._resolveViewName(o.maxViewMode, 4);
                        o.startView = Math.min(o.startView, o.maxViewMode);
                        o.startView = Math.max(o.startView, o.minViewMode);
                        if (o.multidate !== true) {
                            o.multidate = Number(o.multidate) || false;
                            if (o.multidate !== false)
                                o.multidate = Math.max(0, o.multidate);
                        }
                        o.multidateSeparator = String(o.multidateSeparator);
                        o.weekStart %= 7;
                        o.weekEnd = (o.weekStart + 6) % 7;
                        var format = DPGlobal.parseFormat(o.format);
                        if (o.startDate !== -Infinity) {
                            if (!!o.startDate) {
                                if (o.startDate instanceof Date)
                                    o.startDate = this._local_to_utc(this._zero_time(o.startDate));
                                else
                                    o.startDate = DPGlobal.parseDate(o.startDate, format, o.language, o.assumeNearbyYear);
                            } else {
                                o.startDate = -Infinity;
                            }
                        }
                        if (o.endDate !== Infinity) {
                            if (!!o.endDate) {
                                if (o.endDate instanceof Date)
                                    o.endDate = this._local_to_utc(this._zero_time(o.endDate));
                                else
                                    o.endDate = DPGlobal.parseDate(o.endDate, format, o.language, o.assumeNearbyYear);
                            } else {
                                o.endDate = Infinity;
                            }
                        }
                        o.daysOfWeekDisabled = o.daysOfWeekDisabled || [];
                        if (!$.isArray(o.daysOfWeekDisabled))
                            o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
                        o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function (d) {
                            return parseInt(d, 10);
                        });
                        o.daysOfWeekHighlighted = o.daysOfWeekHighlighted || [];
                        if (!$.isArray(o.daysOfWeekHighlighted))
                            o.daysOfWeekHighlighted = o.daysOfWeekHighlighted.split(/[,\s]*/);
                        o.daysOfWeekHighlighted = $.map(o.daysOfWeekHighlighted, function (d) {
                            return parseInt(d, 10);
                        });
                        o.datesDisabled = o.datesDisabled || [];
                        if (!$.isArray(o.datesDisabled)) {
                            o.datesDisabled = [o.datesDisabled];
                        }
                        o.datesDisabled = $.map(o.datesDisabled, function (d) {
                            return DPGlobal.parseDate(d, format, o.language, o.assumeNearbyYear);
                        });
                        var plc = String(o.orientation).toLowerCase().split(/\s+/g), _plc = o.orientation.toLowerCase();
                        plc = $.grep(plc, function (word) {
                            return /^auto|left|right|top|bottom$/.test(word);
                        });
                        o.orientation = {
                            x: 'auto',
                            y: 'auto'
                        };
                        if (!_plc || _plc === 'auto');
                        else if (plc.length === 1) {
                            switch (plc[0]) {
                            case 'top':
                            case 'bottom':
                                o.orientation.y = plc[0];
                                break;
                            case 'left':
                            case 'right':
                                o.orientation.x = plc[0];
                                break;
                            }
                        } else {
                            _plc = $.grep(plc, function (word) {
                                return /^left|right$/.test(word);
                            });
                            o.orientation.x = _plc[0] || 'auto';
                            _plc = $.grep(plc, function (word) {
                                return /^top|bottom$/.test(word);
                            });
                            o.orientation.y = _plc[0] || 'auto';
                        }
                        if (o.defaultViewDate) {
                            var year = o.defaultViewDate.year || new Date().getFullYear();
                            var month = o.defaultViewDate.month || 0;
                            var day = o.defaultViewDate.day || 1;
                            o.defaultViewDate = UTCDate(year, month, day);
                        } else {
                            o.defaultViewDate = UTCToday();
                        }
                    },
                    _events: [],
                    _secondaryEvents: [],
                    _applyEvents: function (evs) {
                        for (var i = 0, el, ch, ev; i < evs.length; i++) {
                            el = evs[i][0];
                            if (evs[i].length === 2) {
                                ch = undefined;
                                ev = evs[i][1];
                            } else if (evs[i].length === 3) {
                                ch = evs[i][1];
                                ev = evs[i][2];
                            }
                            el.on(ev, ch);
                        }
                    },
                    _unapplyEvents: function (evs) {
                        for (var i = 0, el, ev, ch; i < evs.length; i++) {
                            el = evs[i][0];
                            if (evs[i].length === 2) {
                                ch = undefined;
                                ev = evs[i][1];
                            } else if (evs[i].length === 3) {
                                ch = evs[i][1];
                                ev = evs[i][2];
                            }
                            el.off(ev, ch);
                        }
                    },
                    _buildEvents: function () {
                        var events = {
                                keyup: $.proxy(function (e) {
                                    if ($.inArray(e.keyCode, [
                                            27,
                                            37,
                                            39,
                                            38,
                                            40,
                                            32,
                                            13,
                                            9
                                        ]) === -1)
                                        this.update();
                                }, this),
                                keydown: $.proxy(this.keydown, this),
                                paste: $.proxy(this.paste, this)
                            };
                        if (this.o.showOnFocus === true) {
                            events.focus = $.proxy(this.show, this);
                        }
                        if (this.isInput) {
                            this._events = [[
                                    this.element,
                                    events
                                ]];
                        } else if (this.component && this.hasInput) {
                            this._events = [
                                [
                                    this.inputField,
                                    events
                                ],
                                [
                                    this.component,
                                    { click: $.proxy(this.show, this) }
                                ]
                            ];
                        } else {
                            this._events = [[
                                    this.element,
                                    {
                                        click: $.proxy(this.show, this),
                                        keydown: $.proxy(this.keydown, this)
                                    }
                                ]];
                        }
                        this._events.push([
                            this.element,
                            '*',
                            {
                                blur: $.proxy(function (e) {
                                    this._focused_from = e.target;
                                }, this)
                            }
                        ], [
                            this.element,
                            {
                                blur: $.proxy(function (e) {
                                    this._focused_from = e.target;
                                }, this)
                            }
                        ]);
                        if (this.o.immediateUpdates) {
                            this._events.push([
                                this.element,
                                {
                                    'changeYear changeMonth': $.proxy(function (e) {
                                        this.update(e.date);
                                    }, this)
                                }
                            ]);
                        }
                        this._secondaryEvents = [
                            [
                                this.picker,
                                { click: $.proxy(this.click, this) }
                            ],
                            [
                                $(window),
                                { resize: $.proxy(this.place, this) }
                            ],
                            [
                                $(document),
                                {
                                    mousedown: $.proxy(function (e) {
                                        if (!(this.element.is(e.target) || this.element.find(e.target).length || this.picker.is(e.target) || this.picker.find(e.target).length || this.isInline)) {
                                            this.hide();
                                        }
                                    }, this)
                                }
                            ]
                        ];
                    },
                    _attachEvents: function () {
                        this._detachEvents();
                        this._applyEvents(this._events);
                    },
                    _detachEvents: function () {
                        this._unapplyEvents(this._events);
                    },
                    _attachSecondaryEvents: function () {
                        this._detachSecondaryEvents();
                        this._applyEvents(this._secondaryEvents);
                    },
                    _detachSecondaryEvents: function () {
                        this._unapplyEvents(this._secondaryEvents);
                    },
                    _trigger: function (event, altdate) {
                        var date = altdate || this.dates.get(-1), local_date = this._utc_to_local(date);
                        this.element.trigger({
                            type: event,
                            date: local_date,
                            dates: $.map(this.dates, this._utc_to_local),
                            format: $.proxy(function (ix, format) {
                                if (arguments.length === 0) {
                                    ix = this.dates.length - 1;
                                    format = this.o.format;
                                } else if (typeof ix === 'string') {
                                    format = ix;
                                    ix = this.dates.length - 1;
                                }
                                format = format || this.o.format;
                                var date = this.dates.get(ix);
                                return DPGlobal.formatDate(date, format, this.o.language);
                            }, this)
                        });
                    },
                    show: function () {
                        if (this.inputField.prop('disabled') || this.inputField.prop('readonly') && this.o.enableOnReadonly === false)
                            return;
                        if (!this.isInline)
                            this.picker.appendTo(this.o.container);
                        this.place();
                        this.picker.show();
                        this._attachSecondaryEvents();
                        this._trigger('show');
                        if ((window.navigator.msMaxTouchPoints || 'ontouchstart' in document) && this.o.disableTouchKeyboard) {
                            $(this.element).blur();
                        }
                        return this;
                    },
                    hide: function () {
                        if (this.isInline || !this.picker.is(':visible'))
                            return this;
                        this.focusDate = null;
                        this.picker.hide().detach();
                        this._detachSecondaryEvents();
                        this.viewMode = this.o.startView;
                        this.showMode();
                        if (this.o.forceParse && this.inputField.val())
                            this.setValue();
                        this._trigger('hide');
                        return this;
                    },
                    destroy: function () {
                        this.hide();
                        this._detachEvents();
                        this._detachSecondaryEvents();
                        this.picker.remove();
                        delete this.element.data().datepicker;
                        if (!this.isInput) {
                            delete this.element.data().date;
                        }
                        return this;
                    },
                    paste: function (evt) {
                        var dateString;
                        if (evt.originalEvent.clipboardData && evt.originalEvent.clipboardData.types && $.inArray('text/plain', evt.originalEvent.clipboardData.types) !== -1) {
                            dateString = evt.originalEvent.clipboardData.getData('text/plain');
                        } else if (window.clipboardData) {
                            dateString = window.clipboardData.getData('Text');
                        } else {
                            return;
                        }
                        this.setDate(dateString);
                        this.update();
                        evt.preventDefault();
                    },
                    _utc_to_local: function (utc) {
                        return utc && new Date(utc.getTime() + utc.getTimezoneOffset() * 60000);
                    },
                    _local_to_utc: function (local) {
                        return local && new Date(local.getTime() - local.getTimezoneOffset() * 60000);
                    },
                    _zero_time: function (local) {
                        return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
                    },
                    _zero_utc_time: function (utc) {
                        return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
                    },
                    getDates: function () {
                        return $.map(this.dates, this._utc_to_local);
                    },
                    getUTCDates: function () {
                        return $.map(this.dates, function (d) {
                            return new Date(d);
                        });
                    },
                    getDate: function () {
                        return this._utc_to_local(this.getUTCDate());
                    },
                    getUTCDate: function () {
                        var selected_date = this.dates.get(-1);
                        if (typeof selected_date !== 'undefined') {
                            return new Date(selected_date);
                        } else {
                            return null;
                        }
                    },
                    clearDates: function () {
                        if (this.inputField) {
                            this.inputField.val('');
                        }
                        this.update();
                        this._trigger('changeDate');
                        if (this.o.autoclose) {
                            this.hide();
                        }
                    },
                    setDates: function () {
                        var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
                        this.update.apply(this, args);
                        this._trigger('changeDate');
                        this.setValue();
                        return this;
                    },
                    setUTCDates: function () {
                        var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
                        this.update.apply(this, $.map(args, this._utc_to_local));
                        this._trigger('changeDate');
                        this.setValue();
                        return this;
                    },
                    setDate: alias('setDates'),
                    setUTCDate: alias('setUTCDates'),
                    remove: alias('destroy'),
                    setValue: function () {
                        var formatted = this.getFormattedDate();
                        this.inputField.val(formatted);
                        return this;
                    },
                    getFormattedDate: function (format) {
                        if (format === undefined)
                            format = this.o.format;
                        var lang = this.o.language;
                        return $.map(this.dates, function (d) {
                            return DPGlobal.formatDate(d, format, lang);
                        }).join(this.o.multidateSeparator);
                    },
                    getStartDate: function () {
                        return this.o.startDate;
                    },
                    setStartDate: function (startDate) {
                        this._process_options({ startDate: startDate });
                        this.update();
                        this.updateNavArrows();
                        return this;
                    },
                    getEndDate: function () {
                        return this.o.endDate;
                    },
                    setEndDate: function (endDate) {
                        this._process_options({ endDate: endDate });
                        this.update();
                        this.updateNavArrows();
                        return this;
                    },
                    setDaysOfWeekDisabled: function (daysOfWeekDisabled) {
                        this._process_options({ daysOfWeekDisabled: daysOfWeekDisabled });
                        this.update();
                        this.updateNavArrows();
                        return this;
                    },
                    setDaysOfWeekHighlighted: function (daysOfWeekHighlighted) {
                        this._process_options({ daysOfWeekHighlighted: daysOfWeekHighlighted });
                        this.update();
                        return this;
                    },
                    setDatesDisabled: function (datesDisabled) {
                        this._process_options({ datesDisabled: datesDisabled });
                        this.update();
                        this.updateNavArrows();
                    },
                    place: function () {
                        if (this.isInline)
                            return this;
                        var calendarWidth = this.picker.outerWidth(), calendarHeight = this.picker.outerHeight(), visualPadding = 10, container = $(this.o.container), windowWidth = container.width(), scrollTop = this.o.container === 'body' ? $(document).scrollTop() : container.scrollTop(), appendOffset = container.offset();
                        var parentsZindex = [];
                        this.element.parents().each(function () {
                            var itemZIndex = $(this).css('z-index');
                            if (itemZIndex !== 'auto' && itemZIndex !== 0)
                                parentsZindex.push(parseInt(itemZIndex));
                        });
                        var zIndex = Math.max.apply(Math, parentsZindex) + this.o.zIndexOffset;
                        var offset = this.component ? this.component.parent().offset() : this.element.offset();
                        var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
                        var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
                        var left = offset.left - appendOffset.left, top = offset.top - appendOffset.top;
                        if (this.o.container !== 'body') {
                            top += scrollTop;
                        }
                        this.picker.removeClass('datepicker-orient-top datepicker-orient-bottom ' + 'datepicker-orient-right datepicker-orient-left');
                        if (this.o.orientation.x !== 'auto') {
                            this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
                            if (this.o.orientation.x === 'right')
                                left -= calendarWidth - width;
                        } else {
                            if (offset.left < 0) {
                                this.picker.addClass('datepicker-orient-left');
                                left -= offset.left - visualPadding;
                            } else if (left + calendarWidth > windowWidth) {
                                this.picker.addClass('datepicker-orient-right');
                                left += width - calendarWidth;
                            } else {
                                this.picker.addClass('datepicker-orient-left');
                            }
                        }
                        var yorient = this.o.orientation.y, top_overflow;
                        if (yorient === 'auto') {
                            top_overflow = -scrollTop + top - calendarHeight;
                            yorient = top_overflow < 0 ? 'bottom' : 'top';
                        }
                        this.picker.addClass('datepicker-orient-' + yorient);
                        if (yorient === 'top')
                            top -= calendarHeight + parseInt(this.picker.css('padding-top'));
                        else
                            top += height;
                        if (this.o.rtl) {
                            var right = windowWidth - (left + width);
                            this.picker.css({
                                top: top,
                                right: right,
                                zIndex: zIndex
                            });
                        } else {
                            this.picker.css({
                                top: top,
                                left: left,
                                zIndex: zIndex
                            });
                        }
                        return this;
                    },
                    _allow_update: true,
                    update: function () {
                        if (!this._allow_update)
                            return this;
                        var oldDates = this.dates.copy(), dates = [], fromArgs = false;
                        if (arguments.length) {
                            $.each(arguments, $.proxy(function (i, date) {
                                if (date instanceof Date)
                                    date = this._local_to_utc(date);
                                dates.push(date);
                            }, this));
                            fromArgs = true;
                        } else {
                            dates = this.isInput ? this.element.val() : this.element.data('date') || this.inputField.val();
                            if (dates && this.o.multidate)
                                dates = dates.split(this.o.multidateSeparator);
                            else
                                dates = [dates];
                            delete this.element.data().date;
                        }
                        dates = $.map(dates, $.proxy(function (date) {
                            return DPGlobal.parseDate(date, this.o.format, this.o.language, this.o.assumeNearbyYear);
                        }, this));
                        dates = $.grep(dates, $.proxy(function (date) {
                            return !this.dateWithinRange(date) || !date;
                        }, this), true);
                        this.dates.replace(dates);
                        if (this.dates.length)
                            this.viewDate = new Date(this.dates.get(-1));
                        else if (this.viewDate < this.o.startDate)
                            this.viewDate = new Date(this.o.startDate);
                        else if (this.viewDate > this.o.endDate)
                            this.viewDate = new Date(this.o.endDate);
                        else
                            this.viewDate = this.o.defaultViewDate;
                        if (fromArgs) {
                            this.setValue();
                        } else if (dates.length) {
                            if (String(oldDates) !== String(this.dates))
                                this._trigger('changeDate');
                        }
                        if (!this.dates.length && oldDates.length)
                            this._trigger('clearDate');
                        this.fill();
                        this.element.change();
                        return this;
                    },
                    fillDow: function () {
                        var dowCnt = this.o.weekStart, html = '<tr>';
                        if (this.o.calendarWeeks) {
                            this.picker.find('.datepicker-days .datepicker-switch').attr('colspan', function (i, val) {
                                return parseInt(val) + 1;
                            });
                            html += '<th class="cw">&#160;</th>';
                        }
                        while (dowCnt < this.o.weekStart + 7) {
                            html += '<th class="dow';
                            if ($.inArray(dowCnt, this.o.daysOfWeekDisabled) > -1)
                                html += ' disabled';
                            html += '">' + dates[this.o.language].daysMin[dowCnt++ % 7] + '</th>';
                        }
                        html += '</tr>';
                        this.picker.find('.datepicker-days thead').append(html);
                    },
                    fillMonths: function () {
                        var localDate = this._utc_to_local(this.viewDate);
                        var html = '', i = 0;
                        while (i < 12) {
                            var focused = localDate && localDate.getMonth() === i ? ' focused' : '';
                            html += '<span class="month' + focused + '">' + dates[this.o.language].monthsShort[i++] + '</span>';
                        }
                        this.picker.find('.datepicker-months td').html(html);
                    },
                    setRange: function (range) {
                        if (!range || !range.length)
                            delete this.range;
                        else
                            this.range = $.map(range, function (d) {
                                return d.valueOf();
                            });
                        this.fill();
                    },
                    getClassNames: function (date) {
                        var cls = [], year = this.viewDate.getUTCFullYear(), month = this.viewDate.getUTCMonth(), today = new Date();
                        if (date.getUTCFullYear() < year || date.getUTCFullYear() === year && date.getUTCMonth() < month) {
                            cls.push('old');
                        } else if (date.getUTCFullYear() > year || date.getUTCFullYear() === year && date.getUTCMonth() > month) {
                            cls.push('new');
                        }
                        if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
                            cls.push('focused');
                        if (this.o.todayHighlight && date.getUTCFullYear() === today.getFullYear() && date.getUTCMonth() === today.getMonth() && date.getUTCDate() === today.getDate()) {
                            cls.push('today');
                        }
                        if (this.dates.contains(date) !== -1)
                            cls.push('active');
                        if (!this.dateWithinRange(date)) {
                            cls.push('disabled');
                        }
                        if (this.dateIsDisabled(date)) {
                            cls.push('disabled', 'disabled-date');
                        }
                        if ($.inArray(date.getUTCDay(), this.o.daysOfWeekHighlighted) !== -1) {
                            cls.push('highlighted');
                        }
                        if (this.range) {
                            if (date > this.range[0] && date < this.range[this.range.length - 1]) {
                                cls.push('range');
                            }
                            if ($.inArray(date.valueOf(), this.range) !== -1) {
                                cls.push('selected');
                            }
                            if (date.valueOf() === this.range[0]) {
                                cls.push('range-start');
                            }
                            if (date.valueOf() === this.range[this.range.length - 1]) {
                                cls.push('range-end');
                            }
                        }
                        return cls;
                    },
                    _fill_yearsView: function (selector, cssClass, factor, step, currentYear, startYear, endYear, callback) {
                        var html, view, year, steps, startStep, endStep, thisYear, i, classes, tooltip, before;
                        html = '';
                        view = this.picker.find(selector);
                        year = parseInt(currentYear / factor, 10) * factor;
                        startStep = parseInt(startYear / step, 10) * step;
                        endStep = parseInt(endYear / step, 10) * step;
                        steps = $.map(this.dates, function (d) {
                            return parseInt(d.getUTCFullYear() / step, 10) * step;
                        });
                        view.find('.datepicker-switch').text(year + '-' + (year + step * 9));
                        thisYear = year - step;
                        for (i = -1; i < 11; i += 1) {
                            classes = [cssClass];
                            tooltip = null;
                            if (i === -1) {
                                classes.push('old');
                            } else if (i === 10) {
                                classes.push('new');
                            }
                            if ($.inArray(thisYear, steps) !== -1) {
                                classes.push('active');
                            }
                            if (thisYear < startStep || thisYear > endStep) {
                                classes.push('disabled');
                            }
                            if (thisYear === this.viewDate.getFullYear()) {
                                classes.push('focused');
                            }
                            if (callback !== $.noop) {
                                before = callback(new Date(thisYear, 0, 1));
                                if (before === undefined) {
                                    before = {};
                                } else if (typeof before === 'boolean') {
                                    before = { enabled: before };
                                } else if (typeof before === 'string') {
                                    before = { classes: before };
                                }
                                if (before.enabled === false) {
                                    classes.push('disabled');
                                }
                                if (before.classes) {
                                    classes = classes.concat(before.classes.split(/\s+/));
                                }
                                if (before.tooltip) {
                                    tooltip = before.tooltip;
                                }
                            }
                            html += '<span class="' + classes.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + '>' + thisYear + '</span>';
                            thisYear += step;
                        }
                        view.find('td').html(html);
                    },
                    fill: function () {
                        var d = new Date(this.viewDate), year = d.getUTCFullYear(), month = d.getUTCMonth(), startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity, startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity, endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity, endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity, todaytxt = dates[this.o.language].today || dates['en'].today || '', cleartxt = dates[this.o.language].clear || dates['en'].clear || '', titleFormat = dates[this.o.language].titleFormat || dates['en'].titleFormat, tooltip, before;
                        if (isNaN(year) || isNaN(month))
                            return;
                        this.picker.find('.datepicker-days .datepicker-switch').text(DPGlobal.formatDate(d, titleFormat, this.o.language));
                        this.picker.find('tfoot .today').text(todaytxt).toggle(this.o.todayBtn !== false);
                        this.picker.find('tfoot .clear').text(cleartxt).toggle(this.o.clearBtn !== false);
                        this.picker.find('thead .datepicker-title').text(this.o.title).toggle(this.o.title !== '');
                        this.updateNavArrows();
                        this.fillMonths();
                        var prevMonth = UTCDate(year, month - 1, 28), day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
                        prevMonth.setUTCDate(day);
                        prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7) % 7);
                        var nextMonth = new Date(prevMonth);
                        if (prevMonth.getUTCFullYear() < 100) {
                            nextMonth.setUTCFullYear(prevMonth.getUTCFullYear());
                        }
                        nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
                        nextMonth = nextMonth.valueOf();
                        var html = [];
                        var clsName;
                        while (prevMonth.valueOf() < nextMonth) {
                            if (prevMonth.getUTCDay() === this.o.weekStart) {
                                html.push('<tr>');
                                if (this.o.calendarWeeks) {
                                    var ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 86400000), th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 86400000), yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay()) % 7 * 86400000), calWeek = (th - yth) / 86400000 / 7 + 1;
                                    html.push('<td class="cw">' + calWeek + '</td>');
                                }
                            }
                            clsName = this.getClassNames(prevMonth);
                            clsName.push('day');
                            if (this.o.beforeShowDay !== $.noop) {
                                before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
                                if (before === undefined)
                                    before = {};
                                else if (typeof before === 'boolean')
                                    before = { enabled: before };
                                else if (typeof before === 'string')
                                    before = { classes: before };
                                if (before.enabled === false)
                                    clsName.push('disabled');
                                if (before.classes)
                                    clsName = clsName.concat(before.classes.split(/\s+/));
                                if (before.tooltip)
                                    tooltip = before.tooltip;
                            }
                            if ($.isFunction($.uniqueSort)) {
                                clsName = $.uniqueSort(clsName);
                            } else {
                                clsName = $.unique(clsName);
                            }
                            html.push('<td class="' + clsName.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + '>' + prevMonth.getUTCDate() + '</td>');
                            tooltip = null;
                            if (prevMonth.getUTCDay() === this.o.weekEnd) {
                                html.push('</tr>');
                            }
                            prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
                        }
                        this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
                        var monthsTitle = dates[this.o.language].monthsTitle || dates['en'].monthsTitle || 'Months';
                        var months = this.picker.find('.datepicker-months').find('.datepicker-switch').text(this.o.maxViewMode < 2 ? monthsTitle : year).end().find('span').removeClass('active');
                        $.each(this.dates, function (i, d) {
                            if (d.getUTCFullYear() === year)
                                months.eq(d.getUTCMonth()).addClass('active');
                        });
                        if (year < startYear || year > endYear) {
                            months.addClass('disabled');
                        }
                        if (year === startYear) {
                            months.slice(0, startMonth).addClass('disabled');
                        }
                        if (year === endYear) {
                            months.slice(endMonth + 1).addClass('disabled');
                        }
                        if (this.o.beforeShowMonth !== $.noop) {
                            var that = this;
                            $.each(months, function (i, month) {
                                var moDate = new Date(year, i, 1);
                                var before = that.o.beforeShowMonth(moDate);
                                if (before === undefined)
                                    before = {};
                                else if (typeof before === 'boolean')
                                    before = { enabled: before };
                                else if (typeof before === 'string')
                                    before = { classes: before };
                                if (before.enabled === false && !$(month).hasClass('disabled'))
                                    $(month).addClass('disabled');
                                if (before.classes)
                                    $(month).addClass(before.classes);
                                if (before.tooltip)
                                    $(month).prop('title', before.tooltip);
                            });
                        }
                        this._fill_yearsView('.datepicker-years', 'year', 10, 1, year, startYear, endYear, this.o.beforeShowYear);
                        this._fill_yearsView('.datepicker-decades', 'decade', 100, 10, year, startYear, endYear, this.o.beforeShowDecade);
                        this._fill_yearsView('.datepicker-centuries', 'century', 1000, 100, year, startYear, endYear, this.o.beforeShowCentury);
                    },
                    updateNavArrows: function () {
                        if (!this._allow_update)
                            return;
                        var d = new Date(this.viewDate), year = d.getUTCFullYear(), month = d.getUTCMonth();
                        switch (this.viewMode) {
                        case 0:
                            if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
                                this.picker.find('.prev').css({ visibility: 'hidden' });
                            } else {
                                this.picker.find('.prev').css({ visibility: 'visible' });
                            }
                            if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
                                this.picker.find('.next').css({ visibility: 'hidden' });
                            } else {
                                this.picker.find('.next').css({ visibility: 'visible' });
                            }
                            break;
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                            if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() || this.o.maxViewMode < 2) {
                                this.picker.find('.prev').css({ visibility: 'hidden' });
                            } else {
                                this.picker.find('.prev').css({ visibility: 'visible' });
                            }
                            if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() || this.o.maxViewMode < 2) {
                                this.picker.find('.next').css({ visibility: 'hidden' });
                            } else {
                                this.picker.find('.next').css({ visibility: 'visible' });
                            }
                            break;
                        }
                    },
                    click: function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var target, dir, day, year, month, monthChanged, yearChanged;
                        target = $(e.target);
                        if (target.hasClass('datepicker-switch')) {
                            this.showMode(1);
                        }
                        var navArrow = target.closest('.prev, .next');
                        if (navArrow.length > 0) {
                            dir = DPGlobal.modes[this.viewMode].navStep * (navArrow.hasClass('prev') ? -1 : 1);
                            if (this.viewMode === 0) {
                                this.viewDate = this.moveMonth(this.viewDate, dir);
                                this._trigger('changeMonth', this.viewDate);
                            } else {
                                this.viewDate = this.moveYear(this.viewDate, dir);
                                if (this.viewMode === 1) {
                                    this._trigger('changeYear', this.viewDate);
                                }
                            }
                            this.fill();
                        }
                        if (target.hasClass('today') && !target.hasClass('day')) {
                            this.showMode(-2);
                            this._setDate(UTCToday(), this.o.todayBtn === 'linked' ? null : 'view');
                        }
                        if (target.hasClass('clear')) {
                            this.clearDates();
                        }
                        if (!target.hasClass('disabled')) {
                            if (target.hasClass('day')) {
                                day = parseInt(target.text(), 10) || 1;
                                year = this.viewDate.getUTCFullYear();
                                month = this.viewDate.getUTCMonth();
                                if (target.hasClass('old')) {
                                    if (month === 0) {
                                        month = 11;
                                        year = year - 1;
                                        monthChanged = true;
                                        yearChanged = true;
                                    } else {
                                        month = month - 1;
                                        monthChanged = true;
                                    }
                                }
                                if (target.hasClass('new')) {
                                    if (month === 11) {
                                        month = 0;
                                        year = year + 1;
                                        monthChanged = true;
                                        yearChanged = true;
                                    } else {
                                        month = month + 1;
                                        monthChanged = true;
                                    }
                                }
                                this._setDate(UTCDate(year, month, day));
                                if (yearChanged) {
                                    this._trigger('changeYear', this.viewDate);
                                }
                                if (monthChanged) {
                                    this._trigger('changeMonth', this.viewDate);
                                }
                            }
                            if (target.hasClass('month')) {
                                this.viewDate.setUTCDate(1);
                                day = 1;
                                month = target.parent().find('span').index(target);
                                year = this.viewDate.getUTCFullYear();
                                this.viewDate.setUTCMonth(month);
                                this._trigger('changeMonth', this.viewDate);
                                if (this.o.minViewMode === 1) {
                                    this._setDate(UTCDate(year, month, day));
                                    this.showMode();
                                } else {
                                    this.showMode(-1);
                                }
                                this.fill();
                            }
                            if (target.hasClass('year') || target.hasClass('decade') || target.hasClass('century')) {
                                this.viewDate.setUTCDate(1);
                                day = 1;
                                month = 0;
                                year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                                if (target.hasClass('year')) {
                                    this._trigger('changeYear', this.viewDate);
                                    if (this.o.minViewMode === 2) {
                                        this._setDate(UTCDate(year, month, day));
                                    }
                                }
                                if (target.hasClass('decade')) {
                                    this._trigger('changeDecade', this.viewDate);
                                    if (this.o.minViewMode === 3) {
                                        this._setDate(UTCDate(year, month, day));
                                    }
                                }
                                if (target.hasClass('century')) {
                                    this._trigger('changeCentury', this.viewDate);
                                    if (this.o.minViewMode === 4) {
                                        this._setDate(UTCDate(year, month, day));
                                    }
                                }
                                this.showMode(-1);
                                this.fill();
                            }
                        }
                        if (this.picker.is(':visible') && this._focused_from) {
                            $(this._focused_from).focus();
                        }
                        delete this._focused_from;
                    },
                    _toggle_multidate: function (date) {
                        var ix = this.dates.contains(date);
                        if (!date) {
                            this.dates.clear();
                        }
                        if (ix !== -1) {
                            if (this.o.multidate === true || this.o.multidate > 1 || this.o.toggleActive) {
                                this.dates.remove(ix);
                            }
                        } else if (this.o.multidate === false) {
                            this.dates.clear();
                            this.dates.push(date);
                        } else {
                            this.dates.push(date);
                        }
                        if (typeof this.o.multidate === 'number')
                            while (this.dates.length > this.o.multidate)
                                this.dates.remove(0);
                    },
                    _setDate: function (date, which) {
                        if (!which || which === 'date')
                            this._toggle_multidate(date && new Date(date));
                        if (!which || which === 'view')
                            this.viewDate = date && new Date(date);
                        this.fill();
                        this.setValue();
                        if (!which || which !== 'view') {
                            this._trigger('changeDate');
                        }
                        if (this.inputField) {
                            this.inputField.change();
                        }
                        if (this.o.autoclose && (!which || which === 'date')) {
                            this.hide();
                        }
                    },
                    moveDay: function (date, dir) {
                        var newDate = new Date(date);
                        newDate.setUTCDate(date.getUTCDate() + dir);
                        return newDate;
                    },
                    moveWeek: function (date, dir) {
                        return this.moveDay(date, dir * 7);
                    },
                    moveMonth: function (date, dir) {
                        if (!isValidDate(date))
                            return this.o.defaultViewDate;
                        if (!dir)
                            return date;
                        var new_date = new Date(date.valueOf()), day = new_date.getUTCDate(), month = new_date.getUTCMonth(), mag = Math.abs(dir), new_month, test;
                        dir = dir > 0 ? 1 : -1;
                        if (mag === 1) {
                            test = dir === -1 ? function () {
                                return new_date.getUTCMonth() === month;
                            } : function () {
                                return new_date.getUTCMonth() !== new_month;
                            };
                            new_month = month + dir;
                            new_date.setUTCMonth(new_month);
                            if (new_month < 0 || new_month > 11)
                                new_month = (new_month + 12) % 12;
                        } else {
                            for (var i = 0; i < mag; i++)
                                new_date = this.moveMonth(new_date, dir);
                            new_month = new_date.getUTCMonth();
                            new_date.setUTCDate(day);
                            test = function () {
                                return new_month !== new_date.getUTCMonth();
                            };
                        }
                        while (test()) {
                            new_date.setUTCDate(--day);
                            new_date.setUTCMonth(new_month);
                        }
                        return new_date;
                    },
                    moveYear: function (date, dir) {
                        return this.moveMonth(date, dir * 12);
                    },
                    moveAvailableDate: function (date, dir, fn) {
                        do {
                            date = this[fn](date, dir);
                            if (!this.dateWithinRange(date))
                                return false;
                            fn = 'moveDay';
                        } while (this.dateIsDisabled(date));
                        return date;
                    },
                    weekOfDateIsDisabled: function (date) {
                        return $.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1;
                    },
                    dateIsDisabled: function (date) {
                        return this.weekOfDateIsDisabled(date) || $.grep(this.o.datesDisabled, function (d) {
                            return isUTCEquals(date, d);
                        }).length > 0;
                    },
                    dateWithinRange: function (date) {
                        return date >= this.o.startDate && date <= this.o.endDate;
                    },
                    keydown: function (e) {
                        if (!this.picker.is(':visible')) {
                            if (e.keyCode === 40 || e.keyCode === 27) {
                                this.show();
                                e.stopPropagation();
                            }
                            return;
                        }
                        var dateChanged = false, dir, newViewDate, focusDate = this.focusDate || this.viewDate;
                        switch (e.keyCode) {
                        case 27:
                            if (this.focusDate) {
                                this.focusDate = null;
                                this.viewDate = this.dates.get(-1) || this.viewDate;
                                this.fill();
                            } else
                                this.hide();
                            e.preventDefault();
                            e.stopPropagation();
                            break;
                        case 37:
                        case 38:
                        case 39:
                        case 40:
                            if (!this.o.keyboardNavigation || this.o.daysOfWeekDisabled.length === 7)
                                break;
                            dir = e.keyCode === 37 || e.keyCode === 38 ? -1 : 1;
                            if (this.viewMode === 0) {
                                if (e.ctrlKey) {
                                    newViewDate = this.moveAvailableDate(focusDate, dir, 'moveYear');
                                    if (newViewDate)
                                        this._trigger('changeYear', this.viewDate);
                                } else if (e.shiftKey) {
                                    newViewDate = this.moveAvailableDate(focusDate, dir, 'moveMonth');
                                    if (newViewDate)
                                        this._trigger('changeMonth', this.viewDate);
                                } else if (e.keyCode === 37 || e.keyCode === 39) {
                                    newViewDate = this.moveAvailableDate(focusDate, dir, 'moveDay');
                                } else if (!this.weekOfDateIsDisabled(focusDate)) {
                                    newViewDate = this.moveAvailableDate(focusDate, dir, 'moveWeek');
                                }
                            } else if (this.viewMode === 1) {
                                if (e.keyCode === 38 || e.keyCode === 40) {
                                    dir = dir * 4;
                                }
                                newViewDate = this.moveAvailableDate(focusDate, dir, 'moveMonth');
                            } else if (this.viewMode === 2) {
                                if (e.keyCode === 38 || e.keyCode === 40) {
                                    dir = dir * 4;
                                }
                                newViewDate = this.moveAvailableDate(focusDate, dir, 'moveYear');
                            }
                            if (newViewDate) {
                                this.focusDate = this.viewDate = newViewDate;
                                this.setValue();
                                this.fill();
                                e.preventDefault();
                            }
                            break;
                        case 13:
                            if (!this.o.forceParse)
                                break;
                            focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
                            if (this.o.keyboardNavigation) {
                                this._toggle_multidate(focusDate);
                                dateChanged = true;
                            }
                            this.focusDate = null;
                            this.viewDate = this.dates.get(-1) || this.viewDate;
                            this.setValue();
                            this.fill();
                            if (this.picker.is(':visible')) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (this.o.autoclose)
                                    this.hide();
                            }
                            break;
                        case 9:
                            this.focusDate = null;
                            this.viewDate = this.dates.get(-1) || this.viewDate;
                            this.fill();
                            this.hide();
                            break;
                        }
                        if (dateChanged) {
                            if (this.dates.length)
                                this._trigger('changeDate');
                            else
                                this._trigger('clearDate');
                            if (this.inputField) {
                                this.inputField.change();
                            }
                        }
                    },
                    showMode: function (dir) {
                        if (dir) {
                            this.viewMode = Math.max(this.o.minViewMode, Math.min(this.o.maxViewMode, this.viewMode + dir));
                        }
                        this.picker.children('div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).show();
                        this.updateNavArrows();
                    }
                };
                var DateRangePicker = function (element, options) {
                    $(element).data('datepicker', this);
                    this.element = $(element);
                    this.inputs = $.map(options.inputs, function (i) {
                        return i.jquery ? i[0] : i;
                    });
                    delete options.inputs;
                    datepickerPlugin.call($(this.inputs), options).on('changeDate', $.proxy(this.dateUpdated, this));
                    this.pickers = $.map(this.inputs, function (i) {
                        return $(i).data('datepicker');
                    });
                    this.updateDates();
                };
                DateRangePicker.prototype = {
                    updateDates: function () {
                        this.dates = $.map(this.pickers, function (i) {
                            return i.getUTCDate();
                        });
                        this.updateRanges();
                    },
                    updateRanges: function () {
                        var range = $.map(this.dates, function (d) {
                                return d.valueOf();
                            });
                        $.each(this.pickers, function (i, p) {
                            p.setRange(range);
                        });
                    },
                    dateUpdated: function (e) {
                        if (this.updating)
                            return;
                        this.updating = true;
                        var dp = $(e.target).data('datepicker');
                        if (typeof dp === 'undefined') {
                            return;
                        }
                        var new_date = dp.getUTCDate(), i = $.inArray(e.target, this.inputs), j = i - 1, k = i + 1, l = this.inputs.length;
                        if (i === -1)
                            return;
                        $.each(this.pickers, function (i, p) {
                            if (!p.getUTCDate())
                                p.setUTCDate(new_date);
                        });
                        if (new_date < this.dates[j]) {
                            while (j >= 0 && new_date < this.dates[j]) {
                                this.pickers[j--].setUTCDate(new_date);
                            }
                        } else if (new_date > this.dates[k]) {
                            while (k < l && new_date > this.dates[k]) {
                                this.pickers[k++].setUTCDate(new_date);
                            }
                        }
                        this.updateDates();
                        delete this.updating;
                    },
                    remove: function () {
                        $.map(this.pickers, function (p) {
                            p.remove();
                        });
                        delete this.element.data().datepicker;
                    }
                };
                function opts_from_el(el, prefix) {
                    var data = $(el).data(), out = {}, inkey, replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
                    prefix = new RegExp('^' + prefix.toLowerCase());
                    function re_lower(_, a) {
                        return a.toLowerCase();
                    }
                    for (var key in data)
                        if (prefix.test(key)) {
                            inkey = key.replace(replace, re_lower);
                            out[inkey] = data[key];
                        }
                    return out;
                }
                function opts_from_locale(lang) {
                    var out = {};
                    if (!dates[lang]) {
                        lang = lang.split('-')[0];
                        if (!dates[lang])
                            return;
                    }
                    var d = dates[lang];
                    $.each(locale_opts, function (i, k) {
                        if (k in d)
                            out[k] = d[k];
                    });
                    return out;
                }
                var old = $.fn.datepicker;
                var datepickerPlugin = function (option) {
                    var args = Array.apply(null, arguments);
                    args.shift();
                    var internal_return;
                    this.each(function () {
                        var $this = $(this), data = $this.data('datepicker'), options = typeof option === 'object' && option;
                        if (!data) {
                            var elopts = opts_from_el(this, 'date'), xopts = $.extend({}, defaults, elopts, options), locopts = opts_from_locale(xopts.language), opts = $.extend({}, defaults, locopts, elopts, options);
                            if ($this.hasClass('input-daterange') || opts.inputs) {
                                $.extend(opts, { inputs: opts.inputs || $this.find('input').toArray() });
                                data = new DateRangePicker(this, opts);
                            } else {
                                data = new Datepicker(this, opts);
                            }
                            $this.data('datepicker', data);
                        }
                        if (typeof option === 'string' && typeof data[option] === 'function') {
                            internal_return = data[option].apply(data, args);
                        }
                    });
                    if (internal_return === undefined || internal_return instanceof Datepicker || internal_return instanceof DateRangePicker)
                        return this;
                    if (this.length > 1)
                        throw new Error('Using only allowed for the collection of a single element (' + option + ' function)');
                    else
                        return internal_return;
                };
                $.fn.datepicker = datepickerPlugin;
                var defaults = $.fn.datepicker.defaults = {
                        assumeNearbyYear: false,
                        autoclose: false,
                        beforeShowDay: $.noop,
                        beforeShowMonth: $.noop,
                        beforeShowYear: $.noop,
                        beforeShowDecade: $.noop,
                        beforeShowCentury: $.noop,
                        calendarWeeks: false,
                        clearBtn: false,
                        toggleActive: false,
                        daysOfWeekDisabled: [],
                        daysOfWeekHighlighted: [],
                        datesDisabled: [],
                        endDate: Infinity,
                        forceParse: true,
                        format: 'mm/dd/yyyy',
                        keyboardNavigation: true,
                        language: 'en',
                        minViewMode: 0,
                        maxViewMode: 4,
                        multidate: false,
                        multidateSeparator: ',',
                        orientation: 'auto',
                        rtl: false,
                        startDate: -Infinity,
                        startView: 0,
                        todayBtn: false,
                        todayHighlight: false,
                        weekStart: 0,
                        disableTouchKeyboard: false,
                        enableOnReadonly: true,
                        showOnFocus: true,
                        zIndexOffset: 10,
                        container: 'body',
                        immediateUpdates: false,
                        title: '',
                        templates: {
                            leftArrow: '&laquo;',
                            rightArrow: '&raquo;'
                        }
                    };
                var locale_opts = $.fn.datepicker.locale_opts = [
                        'format',
                        'rtl',
                        'weekStart'
                    ];
                $.fn.datepicker.Constructor = Datepicker;
                var dates = $.fn.datepicker.dates = {
                        en: {
                            days: [
                                'Sunday',
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday'
                            ],
                            daysShort: [
                                'Sun',
                                'Mon',
                                'Tue',
                                'Wed',
                                'Thu',
                                'Fri',
                                'Sat'
                            ],
                            daysMin: [
                                'Su',
                                'Mo',
                                'Tu',
                                'We',
                                'Th',
                                'Fr',
                                'Sa'
                            ],
                            months: [
                                'January',
                                'February',
                                'March',
                                'April',
                                'May',
                                'June',
                                'July',
                                'August',
                                'September',
                                'October',
                                'November',
                                'December'
                            ],
                            monthsShort: [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec'
                            ],
                            today: 'Today',
                            clear: 'Clear',
                            titleFormat: 'MM yyyy'
                        }
                    };
                var DPGlobal = {
                        modes: [
                            {
                                clsName: 'days',
                                navFnc: 'Month',
                                navStep: 1
                            },
                            {
                                clsName: 'months',
                                navFnc: 'FullYear',
                                navStep: 1
                            },
                            {
                                clsName: 'years',
                                navFnc: 'FullYear',
                                navStep: 10
                            },
                            {
                                clsName: 'decades',
                                navFnc: 'FullDecade',
                                navStep: 100
                            },
                            {
                                clsName: 'centuries',
                                navFnc: 'FullCentury',
                                navStep: 1000
                            }
                        ],
                        isLeapYear: function (year) {
                            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
                        },
                        getDaysInMonth: function (year, month) {
                            return [
                                31,
                                DPGlobal.isLeapYear(year) ? 29 : 28,
                                31,
                                30,
                                31,
                                30,
                                31,
                                31,
                                30,
                                31,
                                30,
                                31
                            ][month];
                        },
                        validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
                        nonpunctuation: /[^ -\/:-@\u5e74\u6708\u65e5\[-`{-~\t\n\r]+/g,
                        parseFormat: function (format) {
                            if (typeof format.toValue === 'function' && typeof format.toDisplay === 'function')
                                return format;
                            var separators = format.replace(this.validParts, '\0').split('\0'), parts = format.match(this.validParts);
                            if (!separators || !separators.length || !parts || parts.length === 0) {
                                throw new Error('Invalid date format.');
                            }
                            return {
                                separators: separators,
                                parts: parts
                            };
                        },
                        parseDate: function (date, format, language, assumeNearby) {
                            if (!date)
                                return undefined;
                            if (date instanceof Date)
                                return date;
                            if (typeof format === 'string')
                                format = DPGlobal.parseFormat(format);
                            if (format.toValue)
                                return format.toValue(date, format, language);
                            var part_re = /([\-+]\d+)([dmwy])/, parts = date.match(/([\-+]\d+)([dmwy])/g), fn_map = {
                                    d: 'moveDay',
                                    m: 'moveMonth',
                                    w: 'moveWeek',
                                    y: 'moveYear'
                                }, dateAliases = {
                                    yesterday: '-1d',
                                    today: '+0d',
                                    tomorrow: '+1d'
                                }, part, dir, i, fn;
                            if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
                                date = new Date();
                                for (i = 0; i < parts.length; i++) {
                                    part = part_re.exec(parts[i]);
                                    dir = parseInt(part[1]);
                                    fn = fn_map[part[2]];
                                    date = Datepicker.prototype[fn](date, dir);
                                }
                                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                            }
                            if (typeof dateAliases[date] !== 'undefined') {
                                date = dateAliases[date];
                                parts = date.match(/([\-+]\d+)([dmwy])/g);
                                if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
                                    date = new Date();
                                    for (i = 0; i < parts.length; i++) {
                                        part = part_re.exec(parts[i]);
                                        dir = parseInt(part[1]);
                                        fn = fn_map[part[2]];
                                        date = Datepicker.prototype[fn](date, dir);
                                    }
                                    return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                                }
                            }
                            parts = date && date.match(this.nonpunctuation) || [];
                            date = new Date();
                            function applyNearbyYear(year, threshold) {
                                if (threshold === true)
                                    threshold = 10;
                                if (year < 100) {
                                    year += 2000;
                                    if (year > new Date().getFullYear() + threshold) {
                                        year -= 100;
                                    }
                                }
                                return year;
                            }
                            var parsed = {}, setters_order = [
                                    'yyyy',
                                    'yy',
                                    'M',
                                    'MM',
                                    'm',
                                    'mm',
                                    'd',
                                    'dd'
                                ], setters_map = {
                                    yyyy: function (d, v) {
                                        return d.setUTCFullYear(assumeNearby ? applyNearbyYear(v, assumeNearby) : v);
                                    },
                                    yy: function (d, v) {
                                        return d.setUTCFullYear(assumeNearby ? applyNearbyYear(v, assumeNearby) : v);
                                    },
                                    m: function (d, v) {
                                        if (isNaN(d))
                                            return d;
                                        v -= 1;
                                        while (v < 0)
                                            v += 12;
                                        v %= 12;
                                        d.setUTCMonth(v);
                                        while (d.getUTCMonth() !== v)
                                            d.setUTCDate(d.getUTCDate() - 1);
                                        return d;
                                    },
                                    d: function (d, v) {
                                        return d.setUTCDate(v);
                                    }
                                }, val, filtered;
                            setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
                            setters_map['dd'] = setters_map['d'];
                            date = UTCToday();
                            var fparts = format.parts.slice();
                            if (parts.length !== fparts.length) {
                                fparts = $(fparts).filter(function (i, p) {
                                    return $.inArray(p, setters_order) !== -1;
                                }).toArray();
                            }
                            function match_part() {
                                var m = this.slice(0, parts[i].length), p = parts[i].slice(0, m.length);
                                return m.toLowerCase() === p.toLowerCase();
                            }
                            if (parts.length === fparts.length) {
                                var cnt;
                                for (i = 0, cnt = fparts.length; i < cnt; i++) {
                                    val = parseInt(parts[i], 10);
                                    part = fparts[i];
                                    if (isNaN(val)) {
                                        switch (part) {
                                        case 'MM':
                                            filtered = $(dates[language].months).filter(match_part);
                                            val = $.inArray(filtered[0], dates[language].months) + 1;
                                            break;
                                        case 'M':
                                            filtered = $(dates[language].monthsShort).filter(match_part);
                                            val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                            break;
                                        }
                                    }
                                    parsed[part] = val;
                                }
                                var _date, s;
                                for (i = 0; i < setters_order.length; i++) {
                                    s = setters_order[i];
                                    if (s in parsed && !isNaN(parsed[s])) {
                                        _date = new Date(date);
                                        setters_map[s](_date, parsed[s]);
                                        if (!isNaN(_date))
                                            date = _date;
                                    }
                                }
                            }
                            return date;
                        },
                        formatDate: function (date, format, language) {
                            if (!date)
                                return '';
                            if (typeof format === 'string')
                                format = DPGlobal.parseFormat(format);
                            if (format.toDisplay)
                                return format.toDisplay(date, format, language);
                            var val = {
                                    d: date.getUTCDate(),
                                    D: dates[language].daysShort[date.getUTCDay()],
                                    DD: dates[language].days[date.getUTCDay()],
                                    m: date.getUTCMonth() + 1,
                                    M: dates[language].monthsShort[date.getUTCMonth()],
                                    MM: dates[language].months[date.getUTCMonth()],
                                    yy: date.getUTCFullYear().toString().substring(2),
                                    yyyy: date.getUTCFullYear()
                                };
                            val.dd = (val.d < 10 ? '0' : '') + val.d;
                            val.mm = (val.m < 10 ? '0' : '') + val.m;
                            date = [];
                            var seps = $.extend([], format.separators);
                            for (var i = 0, cnt = format.parts.length; i <= cnt; i++) {
                                if (seps.length)
                                    date.push(seps.shift());
                                date.push(val[format.parts[i]]);
                            }
                            return date.join('');
                        },
                        headTemplate: '<thead>' + '<tr>' + '<th colspan="7" class="datepicker-title"></th>' + '</tr>' + '<tr>' + '<th class="prev">&laquo;</th>' + '<th colspan="5" class="datepicker-switch"></th>' + '<th class="next">&raquo;</th>' + '</tr>' + '</thead>',
                        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
                        footTemplate: '<tfoot>' + '<tr>' + '<th colspan="7" class="today"></th>' + '</tr>' + '<tr>' + '<th colspan="7" class="clear"></th>' + '</tr>' + '</tfoot>'
                    };
                DPGlobal.template = '<div class="datepicker">' + '<div class="datepicker-days">' + '<table class="table-condensed">' + DPGlobal.headTemplate + '<tbody></tbody>' + DPGlobal.footTemplate + '</table>' + '</div>' + '<div class="datepicker-months">' + '<table class="table-condensed">' + DPGlobal.headTemplate + DPGlobal.contTemplate + DPGlobal.footTemplate + '</table>' + '</div>' + '<div class="datepicker-years">' + '<table class="table-condensed">' + DPGlobal.headTemplate + DPGlobal.contTemplate + DPGlobal.footTemplate + '</table>' + '</div>' + '<div class="datepicker-decades">' + '<table class="table-condensed">' + DPGlobal.headTemplate + DPGlobal.contTemplate + DPGlobal.footTemplate + '</table>' + '</div>' + '<div class="datepicker-centuries">' + '<table class="table-condensed">' + DPGlobal.headTemplate + DPGlobal.contTemplate + DPGlobal.footTemplate + '</table>' + '</div>' + '</div>';
                $.fn.datepicker.DPGlobal = DPGlobal;
                $.fn.datepicker.noConflict = function () {
                    $.fn.datepicker = old;
                    return this;
                };
                $.fn.datepicker.version = '1.6.4';
                $(document).on('focus.datepicker.data-api click.datepicker.data-api', '[data-provide="datepicker"]', function (e) {
                    var $this = $(this);
                    if ($this.data('datepicker'))
                        return;
                    e.preventDefault();
                    datepickerPlugin.call($this, 'show');
                });
                $(function () {
                    datepickerPlugin.call($('[data-provide="datepicker-inline"]'));
                });
            }));
        },
        function (module, exports) {
            (function (factory) {
                if (typeof define === 'function' && define.amd) {
                    define(['jquery'], factory);
                } else if (typeof exports === 'object') {
                    factory(_require(3));
                } else {
                    factory(jQuery);
                }
            }(function ($, undefined) {
                $.fn.editableTableWidget = function (options) {
                    'use strict';
                    return $(this).each(function () {
                        var buildDefaultOptions = function () {
                                var opts = $.extend({}, $.fn.editableTableWidget.defaultOptions);
                                opts.editor = opts.editor.clone();
                                return opts;
                            }, activeOptions = $.extend(buildDefaultOptions(), options), ARROW_LEFT = 37, ARROW_UP = 38, ARROW_RIGHT = 39, ARROW_DOWN = 40, ENTER = 13, ESC = 27, TAB = 9, element = $(this), editor = activeOptions.editor.css('position', 'absolute').hide().appendTo(element.parent()), active, showEditor = function (select) {
                                active = element.find('td:focus');
                                if (active.length) {
                                    editor.val(active.text()).removeClass('error').show().offset(active.offset()).css(active.css(activeOptions.cloneProperties)).width(active.width()).height(active.height()).focus();
                                    if (select) {
                                        editor.select();
                                    }
                                }
                            }, setActiveText = function (trigger) {
                                var text = $.trim(editor.val()), evt = $.Event('change'), originalContent;
                                if (!active || active.text() === text) {
                                    return true;
                                }
                                if (editor.hasClass('error')) {
                                    if (trigger) {
                                        active.trigger('fail', text);
                                    }
                                    return true;
                                }
                                originalContent = active.html();
                                active.text(text).trigger(evt, text);
                                if (evt.result === false) {
                                    active.html(originalContent);
                                }
                            }, movement = function (element, keycode) {
                                if (keycode === ARROW_RIGHT) {
                                    return element.next('td');
                                } else if (keycode === ARROW_LEFT) {
                                    return element.prev('td');
                                } else if (keycode === ARROW_UP) {
                                    return element.parent().prev().children().eq(element.index());
                                } else if (keycode === ARROW_DOWN) {
                                    return element.parent().next().children().eq(element.index());
                                }
                                return [];
                            };
                        editor.blur(function () {
                            setActiveText(true);
                            editor.hide();
                        }).keydown(function (e) {
                            if (e.which === ENTER) {
                                setActiveText();
                                editor.hide();
                                active.focus();
                                e.preventDefault();
                                e.stopPropagation();
                            } else if (e.which === ESC) {
                                editor.val(active.text());
                                e.preventDefault();
                                e.stopPropagation();
                                editor.hide();
                                active.focus();
                            } else if (e.which === TAB) {
                                active.focus();
                            } else if (this.selectionEnd - this.selectionStart === this.value.length) {
                                var possibleMove = movement(active, e.which);
                                if (possibleMove.length > 0) {
                                    possibleMove.focus();
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }
                        }).on('input paste', function () {
                            var evt = $.Event('validate');
                            active.trigger(evt, $.trim(editor.val()));
                            if (evt.result === false) {
                                editor.addClass('error');
                            } else {
                                editor.removeClass('error');
                            }
                        });
                        element.on('click.bizTableEdit', 'td[editable]', showEditor);
                        element.find('td').prop('tabindex', 1);
                        $(window).on('resize.bizTableEdit', function () {
                            if (editor.is(':visible')) {
                                editor.offset(active.offset()).width(active.width()).height(active.height());
                            }
                        });
                    });
                };
                $.fn.editableTableWidget.defaultOptions = {
                    cloneProperties: [
                        'padding',
                        'padding-top',
                        'padding-bottom',
                        'padding-left',
                        'padding-right',
                        'text-align',
                        'font',
                        'font-size',
                        'font-family',
                        'font-weight'
                    ],
                    editor: $('<input class="biz-table-editor">')
                };
            }));
        },
        function (module, exports) {
            (function (factory) {
                if (typeof define === 'function' && define.amd) {
                    define(['jquery'], factory);
                } else if (typeof exports === 'object') {
                    factory(_require(3));
                } else {
                    factory(jQuery);
                }
            }(function ($, undefined) {
                'use strict';
                var $doc = $(document);
                var $win = $(window);
                var pluginName = 'selectric';
                var classList = 'Input Items Open Disabled TempShow HideSelect Wrapper Focus Hover Responsive Above Scroll Group GroupLabel';
                var eventNamespaceSuffix = '.sl';
                var chars = [
                        'a',
                        'e',
                        'i',
                        'o',
                        'u',
                        'n',
                        'c',
                        'y'
                    ];
                var diacritics = [
                        /[\xE0-\xE5]/g,
                        /[\xE8-\xEB]/g,
                        /[\xEC-\xEF]/g,
                        /[\xF2-\xF6]/g,
                        /[\xF9-\xFC]/g,
                        /[\xF1]/g,
                        /[\xE7]/g,
                        /[\xFD-\xFF]/g
                    ];
                var Selectric = function (element, opts) {
                    var _this = this;
                    _this.element = element;
                    _this.$element = $(element);
                    _this.state = {
                        multiple: !!_this.$element.attr('multiple'),
                        enabled: false,
                        opened: false,
                        currValue: -1,
                        selectedIdx: -1,
                        highlightedIdx: -1
                    };
                    _this.eventTriggers = {
                        open: _this.open,
                        close: _this.close,
                        destroy: _this.destroy,
                        refresh: _this.refresh,
                        init: _this.init
                    };
                    _this.init(opts);
                };
                Selectric.prototype = {
                    utils: {
                        isMobile: function () {
                            return /android|ip(hone|od|ad)/i.test(navigator.userAgent);
                        },
                        escapeRegExp: function (str) {
                            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        },
                        replaceDiacritics: function (str) {
                            var k = diacritics.length;
                            while (k--) {
                                str = str.toLowerCase().replace(diacritics[k], chars[k]);
                            }
                            return str;
                        },
                        format: function (f) {
                            var a = arguments;
                            return ('' + f).replace(/\{(?:(\d+)|(\w+))\}/g, function (s, i, p) {
                                return p && a[1] ? a[1][p] : a[i];
                            });
                        },
                        nextEnabledItem: function (selectItems, selected) {
                            while (selectItems[selected = (selected + 1) % selectItems.length].disabled) {
                            }
                            return selected;
                        },
                        previousEnabledItem: function (selectItems, selected) {
                            while (selectItems[selected = (selected > 0 ? selected : selectItems.length) - 1].disabled) {
                            }
                            return selected;
                        },
                        toDash: function (str) {
                            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                        },
                        triggerCallback: function (fn, scope) {
                            var elm = scope.element;
                            var func = scope.options['on' + fn];
                            var args = [elm].concat([].slice.call(arguments).slice(1));
                            if ($.isFunction(func)) {
                                func.apply(elm, args);
                            }
                            $(elm).trigger(pluginName + '-' + this.toDash(fn), args);
                        },
                        arrayToClassname: function (arr) {
                            var newArr = $.grep(arr, function (item) {
                                    return !!item;
                                });
                            return $.trim(newArr.join(' '));
                        }
                    },
                    init: function (opts) {
                        var _this = this;
                        _this.options = $.extend(true, {}, $.fn[pluginName].defaults, _this.options, opts);
                        _this.utils.triggerCallback('BeforeInit', _this);
                        _this.destroy(true);
                        if (_this.options.disableOnMobile && _this.utils.isMobile()) {
                            _this.disableOnMobile = true;
                            return;
                        }
                        _this.classes = _this.getClassNames();
                        var input = $('<input/>', {
                                'class': _this.classes.input,
                                'readonly': _this.utils.isMobile()
                            });
                        var items = $('<div/>', {
                                'class': _this.classes.items,
                                'tabindex': -1
                            });
                        var itemsScroll = $('<div/>', { 'class': _this.classes.scroll });
                        var wrapper = $('<div/>', {
                                'class': _this.classes.prefix,
                                'html': _this.options.arrowButtonMarkup
                            });
                        var label = $('<span/>', { 'class': 'label' });
                        var outerWrapper = _this.$element.wrap('<div/>').parent().append(wrapper.prepend(label), items, input);
                        var hideSelectWrapper = $('<div/>', { 'class': _this.classes.hideselect });
                        _this.elements = {
                            input: input,
                            items: items,
                            itemsScroll: itemsScroll,
                            wrapper: wrapper,
                            label: label,
                            outerWrapper: outerWrapper
                        };
                        if (_this.options.nativeOnMobile && _this.utils.isMobile()) {
                            _this.elements.input = undefined;
                            hideSelectWrapper.addClass(_this.classes.prefix + '-is-native');
                            _this.$element.on('change', function () {
                                _this.refresh();
                            });
                        }
                        _this.$element.on(_this.eventTriggers).wrap(hideSelectWrapper);
                        _this.originalTabindex = _this.$element.prop('tabindex');
                        _this.$element.prop('tabindex', -1);
                        _this.populate();
                        _this.activate();
                        _this.utils.triggerCallback('Init', _this);
                    },
                    activate: function () {
                        var _this = this;
                        var hiddenChildren = _this.elements.items.closest(':visible').children(':hidden').addClass(_this.classes.tempshow);
                        var originalWidth = _this.$element.width();
                        hiddenChildren.removeClass(_this.classes.tempshow);
                        _this.utils.triggerCallback('BeforeActivate', _this);
                        _this.elements.outerWrapper.prop('class', _this.utils.arrayToClassname([
                            _this.classes.wrapper,
                            _this.$element.prop('class').replace(/\S+/g, _this.classes.prefix + '-$&'),
                            _this.options.responsive ? _this.classes.responsive : '',
                            'biz-select-' + (_this.options.theme || bizui.theme)
                        ]));
                        if (_this.options.inheritOriginalWidth && originalWidth > 0) {
                            _this.elements.outerWrapper.width(originalWidth);
                        }
                        _this.unbindEvents();
                        if (!_this.$element.prop('disabled')) {
                            _this.state.enabled = true;
                            _this.elements.outerWrapper.removeClass(_this.classes.disabled);
                            _this.$li = _this.elements.items.removeAttr('style').find('li');
                            _this.bindEvents();
                        } else {
                            _this.elements.outerWrapper.addClass(_this.classes.disabled);
                            if (_this.elements.input) {
                                _this.elements.input.prop('disabled', true);
                            }
                        }
                        _this.utils.triggerCallback('Activate', _this);
                    },
                    getClassNames: function () {
                        var _this = this;
                        var customClass = _this.options.customClass;
                        var classesObj = {};
                        $.each(classList.split(' '), function (i, currClass) {
                            var c = customClass.prefix + currClass;
                            classesObj[currClass.toLowerCase()] = customClass.camelCase ? c : _this.utils.toDash(c);
                        });
                        classesObj.prefix = customClass.prefix;
                        return classesObj;
                    },
                    setLabel: function () {
                        var _this = this;
                        var labelBuilder = _this.options.labelBuilder;
                        if (_this.state.multiple) {
                            var currentValues = $.isArray(_this.state.currValue) ? _this.state.currValue : [_this.state.currValue];
                            currentValues = currentValues.length === 0 ? [0] : currentValues;
                            var labelMarkup = $.map(currentValues, function (value) {
                                    return $.grep(_this.lookupItems, function (item) {
                                        return item.index === value;
                                    })[0];
                                });
                            labelMarkup = $.grep(labelMarkup, function (item) {
                                if (labelMarkup.length > 1 || labelMarkup.length === 0) {
                                    return $.trim(item.value) !== '';
                                }
                                return item;
                            });
                            labelMarkup = $.map(labelMarkup, function (item) {
                                return $.isFunction(labelBuilder) ? labelBuilder(item) : _this.utils.format(labelBuilder, item);
                            });
                            if (_this.options.multiple.maxLabelEntries) {
                                if (labelMarkup.length >= _this.options.multiple.maxLabelEntries + 1) {
                                    labelMarkup = labelMarkup.slice(0, _this.options.multiple.maxLabelEntries);
                                    labelMarkup.push($.isFunction(labelBuilder) ? labelBuilder({ text: '...' }) : _this.utils.format(labelBuilder, { text: '...' }));
                                } else {
                                    labelMarkup.slice(labelMarkup.length - 1);
                                }
                            }
                            _this.elements.label.html(labelMarkup.join(_this.options.multiple.separator));
                        } else {
                            var currItem = _this.lookupItems[_this.state.currValue];
                            _this.elements.label.html($.isFunction(labelBuilder) ? labelBuilder(currItem) : _this.utils.format(labelBuilder, currItem));
                        }
                    },
                    populate: function () {
                        var _this = this;
                        var $options = _this.$element.children();
                        var $justOptions = _this.$element.find('option');
                        var $selected = $justOptions.filter(':selected');
                        var selectedIndex = $justOptions.index($selected);
                        var currIndex = 0;
                        var emptyValue = _this.state.multiple ? [] : 0;
                        if ($selected.length > 1 && _this.state.multiple) {
                            selectedIndex = [];
                            $selected.each(function () {
                                selectedIndex.push($(this).index());
                            });
                        }
                        _this.state.currValue = ~selectedIndex ? selectedIndex : emptyValue;
                        _this.state.selectedIdx = _this.state.currValue;
                        _this.state.highlightedIdx = _this.state.currValue;
                        _this.items = [];
                        _this.lookupItems = [];
                        if ($options.length) {
                            $options.each(function (i) {
                                var $elm = $(this);
                                if ($elm.is('optgroup')) {
                                    var optionsGroup = {
                                            element: $elm,
                                            label: $elm.prop('label'),
                                            groupDisabled: $elm.prop('disabled'),
                                            items: []
                                        };
                                    $elm.children().each(function (i) {
                                        var $elm = $(this);
                                        optionsGroup.items[i] = _this.getItemData(currIndex, $elm, optionsGroup.groupDisabled || $elm.prop('disabled'));
                                        _this.lookupItems[currIndex] = optionsGroup.items[i];
                                        currIndex++;
                                    });
                                    _this.items[i] = optionsGroup;
                                } else {
                                    _this.items[i] = _this.getItemData(currIndex, $elm, $elm.prop('disabled'));
                                    _this.lookupItems[currIndex] = _this.items[i];
                                    currIndex++;
                                }
                            });
                            _this.setLabel();
                            _this.elements.items.append(_this.elements.itemsScroll.html(_this.getItemsMarkup(_this.items)));
                        }
                    },
                    getItemData: function (index, $elm, isDisabled) {
                        var _this = this;
                        return {
                            index: index,
                            element: $elm,
                            value: $elm.val(),
                            className: $elm.prop('class'),
                            text: $elm.html(),
                            slug: $.trim(_this.utils.replaceDiacritics($elm.html())),
                            selected: $elm.prop('selected'),
                            disabled: isDisabled
                        };
                    },
                    getItemsMarkup: function (items) {
                        var _this = this;
                        var markup = '<ul>';
                        if ($.isFunction(_this.options.listBuilder) && _this.options.listBuilder) {
                            items = _this.options.listBuilder(items);
                        }
                        $.each(items, function (i, elm) {
                            if (elm.label !== undefined) {
                                markup += _this.utils.format('<ul class="{1}"><li class="{2}">{3}</li>', _this.utils.arrayToClassname([
                                    _this.classes.group,
                                    elm.groupDisabled ? 'disabled' : '',
                                    elm.element.prop('class')
                                ]), _this.classes.grouplabel, elm.element.prop('label'));
                                $.each(elm.items, function (i, elm) {
                                    markup += _this.getItemMarkup(elm.index, elm);
                                });
                                markup += '</ul>';
                            } else {
                                markup += _this.getItemMarkup(elm.index, elm);
                            }
                        });
                        return markup + '</ul>';
                    },
                    getItemMarkup: function (index, itemData) {
                        var _this = this;
                        var itemBuilder = _this.options.optionsItemBuilder;
                        var filteredItemData = {
                                value: itemData.value,
                                text: itemData.text,
                                slug: itemData.slug,
                                index: itemData.index
                            };
                        return _this.utils.format('<li data-index="{1}" class="{2}">{3}</li>', index, _this.utils.arrayToClassname([
                            itemData.className,
                            index === _this.items.length - 1 ? 'last' : '',
                            itemData.disabled ? 'disabled' : '',
                            itemData.selected ? 'selected' : ''
                        ]), $.isFunction(itemBuilder) ? _this.utils.format(itemBuilder(itemData), itemData) : _this.utils.format(itemBuilder, filteredItemData));
                    },
                    unbindEvents: function () {
                        var _this = this;
                        _this.elements.wrapper.add(_this.$element).add(_this.elements.outerWrapper).add(_this.elements.input).off(eventNamespaceSuffix);
                    },
                    bindEvents: function () {
                        var _this = this;
                        _this.elements.outerWrapper.on('mouseenter' + eventNamespaceSuffix + ' mouseleave' + eventNamespaceSuffix, function (e) {
                            $(this).toggleClass(_this.classes.hover, e.type === 'mouseenter');
                            if (_this.options.openOnHover) {
                                clearTimeout(_this.closeTimer);
                                if (e.type === 'mouseleave') {
                                    _this.closeTimer = setTimeout($.proxy(_this.close, _this), _this.options.hoverIntentTimeout);
                                } else {
                                    _this.open();
                                }
                            }
                        });
                        _this.elements.wrapper.on('click' + eventNamespaceSuffix, function (e) {
                            _this.state.opened ? _this.close() : _this.open(e);
                        });
                        if (!(_this.options.nativeOnMobile && _this.utils.isMobile())) {
                            _this.$element.on('focus' + eventNamespaceSuffix, function () {
                                _this.elements.input.focus();
                            });
                            _this.elements.input.prop({
                                tabindex: _this.originalTabindex,
                                disabled: false
                            }).on('keydown' + eventNamespaceSuffix, $.proxy(_this.handleKeys, _this)).on('focusin' + eventNamespaceSuffix, function (e) {
                                _this.elements.outerWrapper.addClass(_this.classes.focus);
                                _this.elements.input.one('blur', function () {
                                    _this.elements.input.blur();
                                });
                                if (_this.options.openOnFocus && !_this.state.opened) {
                                    _this.open(e);
                                }
                            }).on('focusout' + eventNamespaceSuffix, function () {
                                _this.elements.outerWrapper.removeClass(_this.classes.focus);
                            }).on('input propertychange', function () {
                                var val = _this.elements.input.val();
                                var searchRegExp = new RegExp('^' + _this.utils.escapeRegExp(val), 'i');
                                clearTimeout(_this.resetStr);
                                _this.resetStr = setTimeout(function () {
                                    _this.elements.input.val('');
                                }, _this.options.keySearchTimeout);
                                if (val.length) {
                                    $.each(_this.items, function (i, elm) {
                                        if (!elm.disabled && searchRegExp.test(elm.text) || searchRegExp.test(elm.slug)) {
                                            _this.highlight(i);
                                            return;
                                        }
                                    });
                                }
                            });
                        }
                        _this.$li.on({
                            mousedown: function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                            },
                            click: function () {
                                _this.select($(this).data('index'));
                                return false;
                            }
                        });
                    },
                    handleKeys: function (e) {
                        var _this = this;
                        var key = e.which;
                        var keys = _this.options.keys;
                        var isPrevKey = $.inArray(key, keys.previous) > -1;
                        var isNextKey = $.inArray(key, keys.next) > -1;
                        var isSelectKey = $.inArray(key, keys.select) > -1;
                        var isOpenKey = $.inArray(key, keys.open) > -1;
                        var idx = _this.state.highlightedIdx;
                        var isFirstOrLastItem = isPrevKey && idx === 0 || isNextKey && idx + 1 === _this.items.length;
                        var goToItem = 0;
                        if (key === 13 || key === 32) {
                            e.preventDefault();
                        }
                        if (isPrevKey || isNextKey) {
                            if (!_this.options.allowWrap && isFirstOrLastItem) {
                                return;
                            }
                            if (isPrevKey) {
                                goToItem = _this.utils.previousEnabledItem(_this.lookupItems, idx);
                            }
                            if (isNextKey) {
                                goToItem = _this.utils.nextEnabledItem(_this.lookupItems, idx);
                            }
                            _this.highlight(goToItem);
                        }
                        if (isSelectKey && _this.state.opened) {
                            _this.select(idx);
                            if (!_this.state.multiple || !_this.options.multiple.keepMenuOpen) {
                                _this.close();
                            }
                            return;
                        }
                        if (isOpenKey && !_this.state.opened) {
                            _this.open();
                        }
                    },
                    refresh: function () {
                        var _this = this;
                        _this.populate();
                        _this.activate();
                        _this.utils.triggerCallback('Refresh', _this);
                    },
                    setOptionsDimensions: function () {
                        var _this = this;
                        var hiddenChildren = _this.elements.items.closest(':visible').children(':hidden').addClass(_this.classes.tempshow);
                        var maxHeight = _this.options.maxHeight;
                        var itemsWidth = _this.elements.items.outerWidth();
                        var wrapperWidth = _this.elements.wrapper.outerWidth() - (itemsWidth - _this.elements.items.width());
                        if (!_this.options.expandToItemText || wrapperWidth > itemsWidth) {
                            _this.finalWidth = wrapperWidth;
                        } else {
                            _this.elements.items.css('overflow', 'scroll');
                            _this.elements.outerWrapper.width(90000);
                            _this.finalWidth = _this.elements.items.width();
                            _this.elements.items.css('overflow', '');
                            _this.elements.outerWrapper.width('');
                        }
                        _this.elements.items.width(_this.finalWidth).height() > maxHeight && _this.elements.items.height(maxHeight);
                        hiddenChildren.removeClass(_this.classes.tempshow);
                    },
                    isInViewport: function () {
                        var _this = this;
                        var scrollTop = $win.scrollTop();
                        var winHeight = $win.height();
                        var uiPosX = _this.elements.outerWrapper.offset().top;
                        var uiHeight = _this.elements.outerWrapper.outerHeight();
                        var fitsDown = uiPosX + uiHeight + _this.itemsHeight <= scrollTop + winHeight;
                        var fitsAbove = uiPosX - _this.itemsHeight > scrollTop;
                        var renderAbove = !fitsDown && fitsAbove;
                        _this.elements.outerWrapper.toggleClass(_this.classes.above, renderAbove);
                    },
                    detectItemVisibility: function (index) {
                        var _this = this;
                        var $filteredLi = _this.$li.filter('[data-index]');
                        if (_this.state.multiple) {
                            index = $.isArray(index) && index.length === 0 ? 0 : index;
                            index = $.isArray(index) ? Math.min.apply(Math, index) : index;
                        }
                        var liHeight = $filteredLi.eq(index).outerHeight();
                        var liTop = $filteredLi[index].offsetTop;
                        var itemsScrollTop = _this.elements.itemsScroll.scrollTop();
                        var scrollT = liTop + liHeight * 2;
                        _this.elements.itemsScroll.scrollTop(scrollT > itemsScrollTop + _this.itemsHeight ? scrollT - _this.itemsHeight : liTop - liHeight < itemsScrollTop ? liTop - liHeight : itemsScrollTop);
                    },
                    open: function (e) {
                        var _this = this;
                        if (_this.options.nativeOnMobile && _this.utils.isMobile()) {
                            return false;
                        }
                        _this.utils.triggerCallback('BeforeOpen', _this);
                        if (e) {
                            e.preventDefault();
                            if (_this.options.stopPropagation) {
                                e.stopPropagation();
                            }
                        }
                        if (_this.state.enabled) {
                            _this.setOptionsDimensions();
                            $('.' + _this.classes.hideselect, '.' + _this.classes.open).children()[pluginName]('close');
                            _this.state.opened = true;
                            _this.itemsHeight = _this.elements.items.outerHeight();
                            _this.itemsInnerHeight = _this.elements.items.height();
                            _this.elements.outerWrapper.addClass(_this.classes.open);
                            _this.elements.input.val('');
                            if (e && e.type !== 'focusin') {
                                _this.elements.input.focus();
                            }
                            setTimeout(function () {
                                $doc.on('click' + eventNamespaceSuffix, $.proxy(_this.close, _this)).on('scroll' + eventNamespaceSuffix, $.proxy(_this.isInViewport, _this));
                            }, 1);
                            _this.isInViewport();
                            if (_this.options.preventWindowScroll) {
                                $doc.on('mousewheel' + eventNamespaceSuffix + ' DOMMouseScroll' + eventNamespaceSuffix, '.' + _this.classes.scroll, function (e) {
                                    var orgEvent = e.originalEvent;
                                    var scrollTop = $(this).scrollTop();
                                    var deltaY = 0;
                                    if ('detail' in orgEvent) {
                                        deltaY = orgEvent.detail * -1;
                                    }
                                    if ('wheelDelta' in orgEvent) {
                                        deltaY = orgEvent.wheelDelta;
                                    }
                                    if ('wheelDeltaY' in orgEvent) {
                                        deltaY = orgEvent.wheelDeltaY;
                                    }
                                    if ('deltaY' in orgEvent) {
                                        deltaY = orgEvent.deltaY * -1;
                                    }
                                    if (scrollTop === this.scrollHeight - _this.itemsInnerHeight && deltaY < 0 || scrollTop === 0 && deltaY > 0) {
                                        e.preventDefault();
                                    }
                                });
                            }
                            _this.detectItemVisibility(_this.state.selectedIdx);
                            _this.highlight(_this.state.multiple ? -1 : _this.state.selectedIdx);
                            _this.utils.triggerCallback('Open', _this);
                        }
                    },
                    close: function () {
                        var _this = this;
                        _this.utils.triggerCallback('BeforeClose', _this);
                        $doc.off(eventNamespaceSuffix);
                        _this.elements.outerWrapper.removeClass(_this.classes.open);
                        _this.state.opened = false;
                        _this.utils.triggerCallback('Close', _this);
                    },
                    change: function () {
                        var _this = this;
                        _this.utils.triggerCallback('BeforeChange', _this);
                        if (_this.state.multiple) {
                            $.each(_this.lookupItems, function (idx) {
                                _this.lookupItems[idx].selected = false;
                                _this.$element.find('option').prop('selected', false);
                            });
                            $.each(_this.state.selectedIdx, function (idx, value) {
                                _this.lookupItems[value].selected = true;
                                _this.$element.find('option').eq(value).prop('selected', true);
                            });
                            _this.state.currValue = _this.state.selectedIdx;
                            _this.setLabel();
                            _this.utils.triggerCallback('Change', _this);
                        } else if (_this.state.currValue !== _this.state.selectedIdx) {
                            _this.$element.prop('selectedIndex', _this.state.currValue = _this.state.selectedIdx).data('value', _this.lookupItems[_this.state.selectedIdx].text);
                            _this.setLabel();
                            _this.utils.triggerCallback('Change', _this);
                        }
                    },
                    highlight: function (index) {
                        var _this = this;
                        var $filteredLi = _this.$li.filter('[data-index]').removeClass('highlighted');
                        _this.utils.triggerCallback('BeforeHighlight', _this);
                        if (index === undefined || index === -1 || _this.lookupItems[index].disabled) {
                            return;
                        }
                        $filteredLi.eq(_this.state.highlightedIdx = index).addClass('highlighted');
                        _this.detectItemVisibility(index);
                        _this.utils.triggerCallback('Highlight', _this);
                    },
                    select: function (index) {
                        var _this = this;
                        var $filteredLi = _this.$li.filter('[data-index]');
                        _this.utils.triggerCallback('BeforeSelect', _this, index);
                        if (index === undefined || index === -1 || _this.lookupItems[index].disabled) {
                            return;
                        }
                        if (_this.state.multiple) {
                            _this.state.selectedIdx = $.isArray(_this.state.selectedIdx) ? _this.state.selectedIdx : [_this.state.selectedIdx];
                            var hasSelectedIndex = $.inArray(index, _this.state.selectedIdx);
                            if (hasSelectedIndex !== -1) {
                                _this.state.selectedIdx.splice(hasSelectedIndex, 1);
                            } else {
                                _this.state.selectedIdx.push(index);
                            }
                            $filteredLi.removeClass('selected').filter(function (index) {
                                return $.inArray(index, _this.state.selectedIdx) !== -1;
                            }).addClass('selected');
                        } else {
                            $filteredLi.removeClass('selected').eq(_this.state.selectedIdx = index).addClass('selected');
                        }
                        if (!_this.state.multiple || !_this.options.multiple.keepMenuOpen) {
                            _this.close();
                        }
                        _this.change();
                        _this.utils.triggerCallback('Select', _this, index);
                    },
                    destroy: function (preserveData) {
                        var _this = this;
                        if (_this.state && _this.state.enabled) {
                            _this.elements.items.add(_this.elements.wrapper).add(_this.elements.input).remove();
                            if (!preserveData) {
                                _this.$element.removeData(pluginName).removeData('value');
                            }
                            _this.$element.prop('tabindex', _this.originalTabindex).off(eventNamespaceSuffix).off(_this.eventTriggers).unwrap().unwrap();
                            _this.state.enabled = false;
                        }
                    }
                };
                $.fn[pluginName] = function (args) {
                    return this.each(function () {
                        var data = $.data(this, pluginName);
                        if (data && !data.disableOnMobile) {
                            typeof args === 'string' && data[args] ? data[args]() : data.init(args);
                        } else {
                            $.data(this, pluginName, new Selectric(this, args));
                        }
                    });
                };
                $.fn[pluginName].defaults = {
                    onChange: function (elm) {
                        $(elm).change();
                    },
                    maxHeight: 300,
                    keySearchTimeout: 500,
                    arrowButtonMarkup: '<b class="button">&#x25be;</b>',
                    disableOnMobile: false,
                    nativeOnMobile: true,
                    openOnFocus: true,
                    openOnHover: false,
                    hoverIntentTimeout: 500,
                    expandToItemText: false,
                    responsive: false,
                    preventWindowScroll: true,
                    inheritOriginalWidth: false,
                    allowWrap: true,
                    stopPropagation: true,
                    optionsItemBuilder: '{text}',
                    labelBuilder: '{text}',
                    listBuilder: false,
                    keys: {
                        previous: [
                            37,
                            38
                        ],
                        next: [
                            39,
                            40
                        ],
                        select: [
                            9,
                            13,
                            27
                        ],
                        open: [
                            13,
                            32,
                            37,
                            38,
                            39,
                            40
                        ],
                        close: [
                            9,
                            27
                        ]
                    },
                    customClass: {
                        prefix: pluginName,
                        camelCase: false
                    },
                    multiple: {
                        separator: ', ',
                        keepMenuOpen: true,
                        maxLabelEntries: false
                    }
                };
            }));
        },
        function (module, exports) {
            (function (factory) {
                if (typeof define === 'function' && define.amd) {
                    define(['jquery'], factory);
                } else if (typeof exports === 'object') {
                    factory(_require(3));
                } else {
                    factory(jQuery);
                }
            }(function ($, undefined) {
                var methods = {
                        init: function (options) {
                            var o = $.extend({
                                    cssStyle: (options.theme || bizui.theme) + (options.customClass ? ' ' + options.customClass : ''),
                                    currentPage: options.pageNumber || 0,
                                    items: options.totalNumber || 1,
                                    itemsOnPage: options.pageSize || 1,
                                    prevText: '<i class="biz-icon">&#xe5cb;</i>',
                                    nextText: '<i class="biz-icon">&#xe5cc;</i>',
                                    edges: 2,
                                    displayedPages: 5,
                                    pages: 0,
                                    ellipsePageSet: false,
                                    ellipseText: '&hellip;',
                                    labelMap: [],
                                    listStyle: '',
                                    invertPageOrder: false,
                                    nextAtFront: false,
                                    selectOnClick: true,
                                    useStartEdge: true,
                                    useEndEdge: true,
                                    onInit: function () {
                                    }
                                }, options || {});
                            var self = this;
                            o.pages = o.pages ? o.pages : Math.ceil(o.items / o.itemsOnPage) ? Math.ceil(o.items / o.itemsOnPage) : 1;
                            if (o.currentPage)
                                o.currentPage = o.currentPage - 1;
                            else
                                o.currentPage = !o.invertPageOrder ? 0 : o.pages - 1;
                            o.halfDisplayed = o.displayedPages / 2;
                            this.each(function () {
                                self.addClass('biz-page biz-page-' + o.cssStyle).data('pagination', o);
                                methods._draw.call(self);
                            });
                            o.onInit();
                            return this;
                        },
                        setPageNumber: function (page) {
                            methods._selectPage.call(this, page - 1);
                            return this;
                        },
                        prevPage: function () {
                            var o = this.data('pagination');
                            if (!o.invertPageOrder) {
                                if (o.currentPage > 0) {
                                    methods._selectPage.call(this, o.currentPage - 1);
                                }
                            } else {
                                if (o.currentPage < o.pages - 1) {
                                    methods._selectPage.call(this, o.currentPage + 1);
                                }
                            }
                            return this;
                        },
                        nextPage: function () {
                            var o = this.data('pagination');
                            if (!o.invertPageOrder) {
                                if (o.currentPage < o.pages - 1) {
                                    methods._selectPage.call(this, o.currentPage + 1);
                                }
                            } else {
                                if (o.currentPage > 0) {
                                    methods._selectPage.call(this, o.currentPage - 1);
                                }
                            }
                            return this;
                        },
                        getPageCount: function () {
                            return this.data('pagination').pages;
                        },
                        setPagesCount: function (count) {
                            this.data('pagination').pages = count;
                        },
                        getPageNumber: function () {
                            return this.data('pagination').currentPage + 1;
                        },
                        destroy: function () {
                            this.empty();
                            return this;
                        },
                        drawPage: function (page) {
                            var o = this.data('pagination');
                            o.currentPage = page - 1;
                            this.data('pagination', o);
                            methods._draw.call(this);
                            return this;
                        },
                        redraw: function () {
                            methods._draw.call(this);
                            return this;
                        },
                        disable: function () {
                            var o = this.data('pagination');
                            o.disabled = true;
                            this.data('pagination', o);
                            methods._draw.call(this);
                            return this;
                        },
                        enable: function () {
                            var o = this.data('pagination');
                            o.disabled = false;
                            this.data('pagination', o);
                            methods._draw.call(this);
                            return this;
                        },
                        setTotalNumber: function (newItems, redraw) {
                            var o = this.data('pagination');
                            o.items = newItems;
                            o.pages = methods._getPages(o);
                            this.data('pagination', o);
                            methods._draw.call(this);
                            if (redraw !== undefined && !!redraw) {
                                methods.drawPage.call(this, 1);
                            }
                        },
                        setPageSize: function (itemsOnPage) {
                            var o = this.data('pagination');
                            o.itemsOnPage = itemsOnPage;
                            o.pages = methods._getPages(o);
                            this.data('pagination', o);
                            methods._selectPage.call(this, 0);
                            return this;
                        },
                        getPageSize: function () {
                            return this.data('pagination').itemsOnPage;
                        },
                        _draw: function () {
                            var o = this.data('pagination'), interval = methods._getInterval(o), i, tagName;
                            methods.destroy.call(this);
                            tagName = typeof this.prop === 'function' ? this.prop('tagName') : this.attr('tagName');
                            var $panel = tagName === 'UL' ? this : $('<ul' + (o.listStyle ? ' class="' + o.listStyle + '"' : '') + '></ul>').appendTo(this);
                            if (o.prevText) {
                                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage - 1 : o.currentPage + 1, {
                                    text: o.prevText,
                                    classes: 'prev'
                                });
                            }
                            if (o.nextText && o.nextAtFront) {
                                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, {
                                    text: o.nextText,
                                    classes: 'next'
                                });
                            }
                            if (!o.invertPageOrder) {
                                if (interval.start > 0 && o.edges > 0) {
                                    if (o.useStartEdge) {
                                        var end = Math.min(o.edges, interval.start);
                                        for (i = 0; i < end; i++) {
                                            methods._appendItem.call(this, i);
                                        }
                                    }
                                    if (o.edges < interval.start && interval.start - o.edges != 1) {
                                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                                    } else if (interval.start - o.edges == 1) {
                                        methods._appendItem.call(this, o.edges);
                                    }
                                }
                            } else {
                                if (interval.end < o.pages && o.edges > 0) {
                                    if (o.useStartEdge) {
                                        var begin = Math.max(o.pages - o.edges, interval.end);
                                        for (i = o.pages - 1; i >= begin; i--) {
                                            methods._appendItem.call(this, i);
                                        }
                                    }
                                    if (o.pages - o.edges > interval.end && o.pages - o.edges - interval.end != 1) {
                                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                                    } else if (o.pages - o.edges - interval.end == 1) {
                                        methods._appendItem.call(this, interval.end);
                                    }
                                }
                            }
                            if (!o.invertPageOrder) {
                                for (i = interval.start; i < interval.end; i++) {
                                    methods._appendItem.call(this, i);
                                }
                            } else {
                                for (i = interval.end - 1; i >= interval.start; i--) {
                                    methods._appendItem.call(this, i);
                                }
                            }
                            if (!o.invertPageOrder) {
                                if (interval.end < o.pages && o.edges > 0) {
                                    if (o.pages - o.edges > interval.end && o.pages - o.edges - interval.end != 1) {
                                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                                    } else if (o.pages - o.edges - interval.end == 1) {
                                        methods._appendItem.call(this, interval.end);
                                    }
                                    if (o.useEndEdge) {
                                        var begin = Math.max(o.pages - o.edges, interval.end);
                                        for (i = begin; i < o.pages; i++) {
                                            methods._appendItem.call(this, i);
                                        }
                                    }
                                }
                            } else {
                                if (interval.start > 0 && o.edges > 0) {
                                    if (o.edges < interval.start && interval.start - o.edges != 1) {
                                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                                    } else if (interval.start - o.edges == 1) {
                                        methods._appendItem.call(this, o.edges);
                                    }
                                    if (o.useEndEdge) {
                                        var end = Math.min(o.edges, interval.start);
                                        for (i = end - 1; i >= 0; i--) {
                                            methods._appendItem.call(this, i);
                                        }
                                    }
                                }
                            }
                            if (o.nextText && !o.nextAtFront) {
                                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, {
                                    text: o.nextText,
                                    classes: 'next'
                                });
                            }
                            if (o.ellipsePageSet && !o.disabled) {
                                methods._ellipseClick.call(this, $panel);
                            }
                        },
                        _getPages: function (o) {
                            var pages = Math.ceil(o.items / o.itemsOnPage);
                            return pages || 1;
                        },
                        _getInterval: function (o) {
                            return {
                                start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, o.pages - o.displayedPages), 0) : 0),
                                end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed, o.pages) : Math.min(o.displayedPages, o.pages))
                            };
                        },
                        _appendItem: function (pageIndex, opts) {
                            var self = this, options, $link, o = self.data('pagination'), $linkWrapper = $('<li></li>'), $ul = self.find('ul');
                            pageIndex = pageIndex < 0 ? 0 : pageIndex < o.pages ? pageIndex : o.pages - 1;
                            options = {
                                text: pageIndex + 1,
                                classes: ''
                            };
                            if (o.labelMap.length && o.labelMap[pageIndex]) {
                                options.text = o.labelMap[pageIndex];
                            }
                            options = $.extend(options, opts || {});
                            if (pageIndex == o.currentPage || o.disabled) {
                                if (o.disabled || options.classes === 'prev' || options.classes === 'next') {
                                    $linkWrapper.addClass('disabled');
                                } else {
                                    $linkWrapper.addClass('active');
                                }
                                $link = $('<span class="current">' + options.text + '</span>');
                            } else {
                                $link = $('<a href="javascript:void(0);" class="page-link">' + options.text + '</a>');
                                $link.click(function (event) {
                                    return methods._selectPage.call(self, pageIndex, event);
                                });
                            }
                            if (options.classes) {
                                $link.addClass(options.classes);
                            }
                            $linkWrapper.append($link);
                            if ($ul.length) {
                                $ul.append($linkWrapper);
                            } else {
                                self.append($linkWrapper);
                            }
                        },
                        _selectPage: function (pageIndex, event) {
                            var o = this.data('pagination');
                            o.currentPage = pageIndex;
                            if (o.selectOnClick) {
                                methods._draw.call(this);
                            }
                            return $(this).trigger('change', pageIndex + 1);
                        },
                        _ellipseClick: function ($panel) {
                            var self = this, o = this.data('pagination'), $ellip = $panel.find('.ellipse');
                            $ellip.addClass('clickable').parent().removeClass('disabled');
                            $ellip.click(function (event) {
                                if (!o.disable) {
                                    var $this = $(this), val = (parseInt($this.parent().prev().text(), 10) || 0) + 1;
                                    $this.html('<input type="number" min="1" max="' + o.pages + '" step="1" value="' + val + '">').find('input').focus().click(function (event) {
                                        event.stopPropagation();
                                    }).keyup(function (event) {
                                        var val = $(this).val();
                                        if (event.which === 13 && val !== '') {
                                            if (val > 0 && val <= o.pages)
                                                methods._selectPage.call(self, val - 1);
                                        } else if (event.which === 27) {
                                            $ellip.empty().html(o.ellipseText);
                                        }
                                    }).bind('blur', function (event) {
                                        var val = $(this).val();
                                        if (val !== '') {
                                            methods._selectPage.call(self, val - 1);
                                        }
                                        $ellip.empty().html(o.ellipseText);
                                        return false;
                                    });
                                }
                                return false;
                            });
                        }
                    };
                $.fn.pagination = function (method) {
                    if (methods[method] && method.charAt(0) != '_') {
                        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
                    } else if (typeof method === 'object' || !method) {
                        return methods.init.apply(this, arguments);
                    } else {
                        $.error('Method ' + method + ' does not exist on jQuery.pagination');
                    }
                };
            }));
        },
        function (module, exports) {
            (function (factory) {
                if (typeof define === 'function' && define.amd) {
                    define(['jquery'], factory);
                } else if (typeof exports === 'object') {
                    factory(_require(3));
                } else {
                    factory(jQuery);
                }
            }(function ($, undefined) {
                var Node, Tree, methods;
                Node = function () {
                    function Node(row, tree, settings) {
                        var parentId;
                        this.row = row;
                        this.tree = tree;
                        this.settings = settings;
                        this.id = this.row.data(this.settings.nodeIdAttr);
                        parentId = this.row.data(this.settings.parentIdAttr);
                        if (parentId != null && parentId !== '') {
                            this.parentId = parentId;
                        }
                        this.treeCell = $(this.row.children(this.settings.columnElType)[this.settings.column]);
                        this.expander = $(this.settings.expanderTemplate);
                        this.indenter = $(this.settings.indenterTemplate);
                        this.children = [];
                        this.initialized = false;
                        this.treeCell.prepend(this.indenter);
                    }
                    Node.prototype.addChild = function (child) {
                        return this.children.push(child);
                    };
                    Node.prototype.ancestors = function () {
                        var ancestors, node;
                        node = this;
                        ancestors = [];
                        while (node = node.parentNode()) {
                            ancestors.push(node);
                        }
                        return ancestors;
                    };
                    Node.prototype.collapse = function () {
                        if (this.collapsed()) {
                            return this;
                        }
                        this.row.removeClass('expanded').addClass('collapsed');
                        this._hideChildren();
                        this.expander.attr('title', this.settings.stringExpand);
                        if (this.initialized && this.settings.onNodeCollapse != null) {
                            this.settings.onNodeCollapse.apply(this);
                        }
                        return this;
                    };
                    Node.prototype.collapsed = function () {
                        return this.row.hasClass('collapsed');
                    };
                    Node.prototype.expand = function () {
                        if (this.expanded()) {
                            return this;
                        }
                        this.row.removeClass('collapsed').addClass('expanded');
                        if (this.initialized && this.settings.onNodeExpand != null) {
                            this.settings.onNodeExpand.apply(this);
                        }
                        if ($(this.row).is(':visible')) {
                            this._showChildren();
                        }
                        this.expander.attr('title', this.settings.stringCollapse);
                        return this;
                    };
                    Node.prototype.expanded = function () {
                        return this.row.hasClass('expanded');
                    };
                    Node.prototype.hide = function () {
                        this._hideChildren();
                        this.row.hide();
                        return this;
                    };
                    Node.prototype.isBranchNode = function () {
                        if (this.children.length > 0 || this.row.data(this.settings.branchAttr) === true) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    Node.prototype.updateBranchLeafClass = function () {
                        this.row.removeClass('branch');
                        this.row.removeClass('leaf');
                        this.row.addClass(this.isBranchNode() ? 'branch' : 'leaf');
                    };
                    Node.prototype.level = function () {
                        return this.ancestors().length;
                    };
                    Node.prototype.parentNode = function () {
                        if (this.parentId != null) {
                            return this.tree[this.parentId];
                        } else {
                            return null;
                        }
                    };
                    Node.prototype.removeChild = function (child) {
                        var i = $.inArray(child, this.children);
                        return this.children.splice(i, 1);
                    };
                    Node.prototype.render = function () {
                        var handler, settings = this.settings, target;
                        if (settings.expandable === true && this.isBranchNode()) {
                            handler = function (e) {
                                $(this).parents('table').treetable('node', $(this).parents('tr').data(settings.nodeIdAttr)).toggle();
                                return e.preventDefault();
                            };
                            this.indenter.html(this.expander);
                            target = settings.clickableNodeNames === true ? this.treeCell : this.expander;
                            target.off('click.treetable').on('click.treetable', handler);
                            target.off('keydown.treetable').on('keydown.treetable', function (e) {
                                if (e.keyCode == 13) {
                                    handler.apply(this, [e]);
                                }
                            });
                        }
                        this.indenter[0].style.paddingLeft = '' + this.level() * settings.indent + 'px';
                        return this;
                    };
                    Node.prototype.reveal = function () {
                        if (this.parentId != null) {
                            this.parentNode().reveal();
                        }
                        return this.expand();
                    };
                    Node.prototype.setParent = function (node) {
                        if (this.parentId != null) {
                            this.tree[this.parentId].removeChild(this);
                        }
                        this.parentId = node.id;
                        this.row.data(this.settings.parentIdAttr, node.id);
                        return node.addChild(this);
                    };
                    Node.prototype.show = function () {
                        if (!this.initialized) {
                            this._initialize();
                        }
                        this.row.show();
                        if (this.expanded()) {
                            this._showChildren();
                        }
                        return this;
                    };
                    Node.prototype.toggle = function () {
                        if (this.expanded()) {
                            this.collapse();
                        } else {
                            this.expand();
                        }
                        return this;
                    };
                    Node.prototype._hideChildren = function () {
                        var child, _i, _len, _ref, _results;
                        _ref = this.children;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            child = _ref[_i];
                            _results.push(child.hide());
                        }
                        return _results;
                    };
                    Node.prototype._initialize = function () {
                        var settings = this.settings;
                        this.render();
                        if (settings.expandable === true && settings.initialState === 'collapsed') {
                            this.collapse();
                        } else {
                            this.expand();
                        }
                        if (settings.onNodeInitialized != null) {
                            settings.onNodeInitialized.apply(this);
                        }
                        return this.initialized = true;
                    };
                    Node.prototype._showChildren = function () {
                        var child, _i, _len, _ref, _results;
                        _ref = this.children;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            child = _ref[_i];
                            _results.push(child.show());
                        }
                        return _results;
                    };
                    return Node;
                }();
                Tree = function () {
                    function Tree(table, settings) {
                        this.table = table;
                        this.settings = settings;
                        this.tree = {};
                        this.nodes = [];
                        this.roots = [];
                    }
                    Tree.prototype.collapseAll = function () {
                        var node, _i, _len, _ref, _results;
                        _ref = this.nodes;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            node = _ref[_i];
                            _results.push(node.collapse());
                        }
                        return _results;
                    };
                    Tree.prototype.expandAll = function () {
                        var node, _i, _len, _ref, _results;
                        _ref = this.nodes;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            node = _ref[_i];
                            _results.push(node.expand());
                        }
                        return _results;
                    };
                    Tree.prototype.findLastNode = function (node) {
                        if (node.children.length > 0) {
                            return this.findLastNode(node.children[node.children.length - 1]);
                        } else {
                            return node;
                        }
                    };
                    Tree.prototype.loadRows = function (rows) {
                        var node, row, i;
                        if (rows != null) {
                            for (i = 0; i < rows.length; i++) {
                                row = $(rows[i]);
                                if (row.data(this.settings.nodeIdAttr) != null) {
                                    node = new Node(row, this.tree, this.settings);
                                    this.nodes.push(node);
                                    this.tree[node.id] = node;
                                    if (node.parentId != null && this.tree[node.parentId]) {
                                        this.tree[node.parentId].addChild(node);
                                    } else {
                                        this.roots.push(node);
                                    }
                                }
                            }
                        }
                        for (i = 0; i < this.nodes.length; i++) {
                            node = this.nodes[i].updateBranchLeafClass();
                        }
                        return this;
                    };
                    Tree.prototype.move = function (node, destination) {
                        var nodeParent = node.parentNode();
                        if (node !== destination && destination.id !== node.parentId && $.inArray(node, destination.ancestors()) === -1) {
                            node.setParent(destination);
                            this._moveRows(node, destination);
                            if (node.parentNode().children.length === 1) {
                                node.parentNode().render();
                            }
                        }
                        if (nodeParent) {
                            nodeParent.updateBranchLeafClass();
                        }
                        if (node.parentNode()) {
                            node.parentNode().updateBranchLeafClass();
                        }
                        node.updateBranchLeafClass();
                        return this;
                    };
                    Tree.prototype.removeNode = function (node) {
                        this.unloadBranch(node);
                        node.row.remove();
                        if (node.parentId != null) {
                            node.parentNode().removeChild(node);
                        }
                        delete this.tree[node.id];
                        this.nodes.splice($.inArray(node, this.nodes), 1);
                        return this;
                    };
                    Tree.prototype.render = function () {
                        var root, _i, _len, _ref;
                        _ref = this.roots;
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            root = _ref[_i];
                            root.show();
                        }
                        return this;
                    };
                    Tree.prototype.sortBranch = function (node, sortFun) {
                        node.children.sort(sortFun);
                        this._sortChildRows(node);
                        return this;
                    };
                    Tree.prototype.unloadBranch = function (node) {
                        var children = node.children.slice(0), i;
                        for (i = 0; i < children.length; i++) {
                            this.removeNode(children[i]);
                        }
                        node.children = [];
                        node.updateBranchLeafClass();
                        return this;
                    };
                    Tree.prototype._moveRows = function (node, destination) {
                        var children = node.children, i;
                        node.row.insertAfter(destination.row);
                        node.render();
                        for (i = children.length - 1; i >= 0; i--) {
                            this._moveRows(children[i], node);
                        }
                    };
                    Tree.prototype._sortChildRows = function (parentNode) {
                        return this._moveRows(parentNode, parentNode);
                    };
                    return Tree;
                }();
                methods = {
                    init: function (options, force) {
                        var settings;
                        settings = $.extend({
                            branchAttr: 'ttBranch',
                            clickableNodeNames: false,
                            column: 0,
                            columnElType: 'td',
                            customClass: '',
                            expandable: true,
                            expanderTemplate: '<a href=\'javascript:void(0)\'>&nbsp;</a>',
                            indent: 19,
                            indenterTemplate: '<span class=\'indenter\'></span>',
                            initialState: 'collapsed',
                            nodeIdAttr: 'ttId',
                            parentIdAttr: 'ttParentId',
                            stringExpand: '',
                            stringCollapse: '',
                            onInitialized: null,
                            onNodeCollapse: null,
                            onNodeExpand: null,
                            onNodeInitialized: null
                        }, options);
                        return this.each(function () {
                            var el = $(this), tree;
                            if (force || el.data('treetable') === undefined) {
                                tree = new Tree(this, settings);
                                tree.loadRows(this.rows).render();
                                el.addClass('treetable ' + settings.customClass).data('treetable', tree);
                                if (settings.onInitialized != null) {
                                    settings.onInitialized.apply(tree);
                                }
                            }
                            return el;
                        });
                    },
                    destroy: function () {
                        return this.each(function () {
                            $(this).find('span.indenter a').off();
                            $(this).find('span.indenter').remove();
                            return $(this).removeData('treetable').removeClass('treetable');
                        });
                    },
                    collapseAll: function () {
                        this.data('treetable').collapseAll();
                        return this;
                    },
                    collapseNode: function (id) {
                        var node = this.data('treetable').tree[id];
                        if (node) {
                            node.collapse();
                        } else {
                            throw new Error('Unknown node \'' + id + '\'');
                        }
                        return this;
                    },
                    expandAll: function () {
                        this.data('treetable').expandAll();
                        return this;
                    },
                    expandNode: function (id) {
                        var node = this.data('treetable').tree[id];
                        if (node) {
                            if (!node.initialized) {
                                node._initialize();
                            }
                            node.expand();
                        } else {
                            throw new Error('Unknown node \'' + id + '\'');
                        }
                        return this;
                    },
                    loadBranch: function (node, rows) {
                        var settings = this.data('treetable').settings, tree = this.data('treetable').tree;
                        rows = $(rows);
                        if (node == null) {
                            this.append(rows);
                        } else {
                            var lastNode = this.data('treetable').findLastNode(node);
                            rows.insertAfter(lastNode.row);
                        }
                        this.data('treetable').loadRows(rows);
                        rows.filter('tr').each(function () {
                            tree[$(this).data(settings.nodeIdAttr)].show();
                        });
                        if (node != null) {
                            node.render().expand();
                        }
                        return this;
                    },
                    move: function (nodeId, destinationId) {
                        var destination, node;
                        node = this.data('treetable').tree[nodeId];
                        destination = this.data('treetable').tree[destinationId];
                        this.data('treetable').move(node, destination);
                        return this;
                    },
                    node: function (id) {
                        return this.data('treetable').tree[id];
                    },
                    removeNode: function (id) {
                        var node = this.data('treetable').tree[id];
                        if (node) {
                            this.data('treetable').removeNode(node);
                        } else {
                            throw new Error('Unknown node \'' + id + '\'');
                        }
                        return this;
                    },
                    reveal: function (id) {
                        var node = this.data('treetable').tree[id];
                        if (node) {
                            node.reveal();
                        } else {
                            throw new Error('Unknown node \'' + id + '\'');
                        }
                        return this;
                    },
                    sortBranch: function (node, columnOrFunction) {
                        var settings = this.data('treetable').settings, prepValue, sortFun;
                        columnOrFunction = columnOrFunction || settings.column;
                        sortFun = columnOrFunction;
                        if ($.isNumeric(columnOrFunction)) {
                            sortFun = function (a, b) {
                                var extractValue, valA, valB;
                                extractValue = function (node) {
                                    var val = node.row.find('td:eq(' + columnOrFunction + ')').text();
                                    return $.trim(val).toUpperCase();
                                };
                                valA = extractValue(a);
                                valB = extractValue(b);
                                if (valA < valB)
                                    return -1;
                                if (valA > valB)
                                    return 1;
                                return 0;
                            };
                        }
                        this.data('treetable').sortBranch(node, sortFun);
                        return this;
                    },
                    unloadBranch: function (node) {
                        this.data('treetable').unloadBranch(node);
                        return this;
                    }
                };
                $.fn.treetable = function (method) {
                    if (methods[method]) {
                        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
                    } else if (typeof method === 'object' || !method) {
                        return methods.init.apply(this, arguments);
                    } else {
                        return $.error('Method ' + method + ' does not exist on jQuery.treetable');
                    }
                };
                this.TreeTable || (this.TreeTable = {});
                this.TreeTable.Node = Node;
                this.TreeTable.Tree = Tree;
            }));
        },
        function (module, exports) {
            function Button(button, options) {
                this.main = button;
                this.$main = $(this.main);
                var defaultOption = {
                        theme: bizui.theme,
                        customClass: '',
                        size: 'small'
                    };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-button', largeClass = 'biz-button-large', disableClass = 'biz-button-disable', prefix = 'biz-button-', dataKey = 'bizButton';
            Button.prototype = {
                init: function (options) {
                    this.originHTML = this.$main.html();
                    this.$main.addClass([
                        defaultClass,
                        options.customClass,
                        prefix + options.theme
                    ].join(' '));
                    if (options.size === 'large') {
                        this.$main.addClass(largeClass);
                    }
                    if (options.text) {
                        this.$main.html(options.text);
                    }
                    if (options.icon) {
                        var iconName = !document.documentMode ? options.icon : bizui.codepoints[options.icon];
                        this.$main.prepend('<i class="biz-icon">' + iconName + '</i> ');
                    }
                    if (options.disabled) {
                        this.disable();
                    }
                },
                enable: function () {
                    this.main.disabled = false;
                    this.$main.removeClass(disableClass);
                },
                disable: function () {
                    this.main.disabled = true;
                    this.$main.addClass(disableClass);
                },
                destroy: function () {
                    this.$main.removeClass([
                        defaultClass,
                        this.options.customClass,
                        prefix + this.options.theme,
                        largeClass,
                        disableClass
                    ].join(' '));
                    this.$main.html(this.originHTML);
                    this.originHTML = null;
                    this.$main.data(dataKey, null);
                }
            };
            function isButton(elem) {
                return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'button';
            }
            $.extend($.fn, {
                bizButton: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
                                }
                            }
                        } else {
                            if (isButton(this) && (method === undefined || jQuery.isPlainObject(method))) {
                                $(this).data(dataKey, new Button(this, method));
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
            module.exports = Button;
        },
        function (module, exports) {
            _require(8);
            _require(1);
            function Calendar(calendar, options) {
            }
            Calendar.prototype = {
                destroy: function () {
                },
                show: function () {
                },
                hide: function () {
                },
                setDate: function (date) {
                },
                getDate: function () {
                },
                setStartDate: function (date) {
                },
                setEndDate: function (date) {
                },
                setDatesDisabled: function (dates) {
                },
                setDaysOfWeekDisabled: function (days) {
                },
                setDaysOfWeekHighlighted: function (days) {
                }
            };
            $.extend($.fn.datepicker.defaults, {
                autoclose: true,
                language: 'zh-CN'
            });
            $.extend($.fn.datepicker.dates['zh-CN'], { format: 'yyyy-mm-dd' });
            $.extend($.fn, { bizCalendar: $.fn.datepicker });
            module.exports = Calendar;
        },
        function (module, exports) {
            function Checkbox(checkbox, options) {
                this.main = checkbox;
                this.$main = $(this.main);
                this.$group = $('input[name="' + this.$main.attr('name') + '"]');
                var defaultOption = { theme: bizui.theme };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-label', unchecked = 'biz-checkbox-unchecked', uncheckedHover = 'biz-checkbox-unchecked-hover', checked = 'biz-checkbox-checked', checkedHover = 'biz-checkbox-checked-hover', uncheckedDisabled = 'biz-checkbox-unchecked-disabled', checkedDisabled = 'biz-checkbox-checked-disabled', dataKey = 'bizCheckbox', checkCodepoint = '&#xe834;', uncheckCodepoint = '&#xe835;';
            Checkbox.prototype = {
                init: function (options) {
                    var title = this.$main.attr('title'), id = this.$main.attr('id') || '';
                    this.$main.after('<label for="' + id + '"><i class="biz-icon"></i>' + title + '</label>').hide();
                    this.$label = this.$main.next();
                    this.defaultClass = defaultClass + ' biz-label-' + options.theme;
                    this.$label.addClass(this.defaultClass);
                    this.$icon = this.$label.children('i');
                    if (this.main.checked) {
                        this.$label.addClass(this.main.disabled ? checkedDisabled : checked);
                        this.$icon.html(checkCodepoint);
                    } else {
                        this.$label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
                        this.$icon.html(uncheckCodepoint);
                    }
                    var self = this;
                    this.$label.on('mouseover.bizCheckbox', function () {
                        if (!self.main.disabled) {
                            $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
                        }
                    }).on('mouseout.bizCheckbox', function () {
                        if (!self.main.disabled) {
                            $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
                        }
                    }).on('click.bizCheckbox', function () {
                        if (!self.main.disabled) {
                            if (self.main.checked) {
                                $(this).attr('class', [
                                    self.defaultClass,
                                    unchecked,
                                    uncheckedHover
                                ].join(' '));
                                self.$icon.html(uncheckCodepoint);
                            } else {
                                $(this).attr('class', [
                                    self.defaultClass,
                                    checked,
                                    checkedHover
                                ].join(' '));
                                self.$icon.html(checkCodepoint);
                            }
                            if (id === '') {
                                self.main.checked = !self.main.checked;
                            }
                        }
                    });
                },
                check: function () {
                    this.main.checked = true;
                    this.$label.attr('class', this.defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
                    this.$icon.html(checkCodepoint);
                },
                uncheck: function () {
                    this.main.checked = false;
                    this.$label.attr('class', this.defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
                    this.$icon.html(uncheckCodepoint);
                },
                enable: function () {
                    this.main.disabled = false;
                    this.$label.attr('class', this.defaultClass + ' ' + (this.main.checked ? checked : unchecked));
                },
                disable: function () {
                    this.main.disabled = true;
                    this.$label.attr('class', this.defaultClass + ' ' + (this.main.checked ? checkedDisabled : uncheckedDisabled));
                },
                val: function () {
                    var value = [];
                    this.$group.each(function (index, element) {
                        if (element.checked) {
                            value.push($(element).val());
                        }
                    });
                    return value.join(',');
                },
                destroy: function () {
                    this.$main.show();
                    this.$label.off('mouseover.bizCheckbox').off('mouseout.bizCheckbox').off('click.bizCheckbox').remove();
                    this.$main.data(dataKey, null);
                }
            };
            function isCheckbox(elem) {
                return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'input' && elem.getAttribute('type').toLowerCase() === 'checkbox';
            }
            $.extend($.fn, {
                bizCheckbox: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
                                }
                            }
                        } else {
                            if (isCheckbox(this) && (method === undefined || jQuery.isPlainObject(method))) {
                                $(this).data(dataKey, new Checkbox(this, method));
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
            module.exports = Checkbox;
        },
        function (module, exports) {
            var Draggable = _require(0);
            function Dialog(dialog, options) {
                this.main = dialog;
                this.$main = $(this.main);
                var defaultOption = {
                        customClass: '',
                        position: 'fixed',
                        draggable: false,
                        theme: bizui.theme,
                        title: '',
                        buttons: [],
                        destroyOnClose: false
                    };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-dialog', prefix = 'biz-dialog-', dataKey = 'bizDialog', minWidth = 320, minHeight = 150, currentIndex = 1000;
            Dialog.prototype = {
                init: function (options) {
                    this.$container = $('<div style="display:none;"></div>');
                    this.$mask = $('<div class="biz-mask" style="display:none;"></div>');
                    this.$container.appendTo('body').after(this.$mask);
                    var self = this;
                    this.$container.addClass([
                        defaultClass,
                        options.customClass,
                        prefix + options.theme
                    ].join(' ')).html([
                        '<div class="biz-dialog-title">',
                        '<span class="biz-dialog-title-text">',
                        this.$main.attr('data-title') || options.title,
                        '</span>',
                        '<i class="biz-dialog-close biz-icon">&#xe5cd;</i></div>',
                        '<div class="biz-dialog-content"></div>',
                        '<div class="biz-dialog-bottom"></div>'
                    ].join('')).on('click.bizDialog', '.biz-dialog-close', function () {
                        self.close();
                    });
                    this.$container.find('.biz-dialog-content').append(this.$main.show());
                    this.updateButtons(options.buttons);
                    var containerWidth = typeof options.width !== 'undefined' ? Math.max(parseInt(options.width, 10), minWidth) : minWidth, containerHeight;
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
                    if (options.draggable) {
                        this.draggable = new Draggable(this.$container[0], {
                            handle: this.$container.find('.biz-dialog-title').addClass('biz-draggble')[0],
                            setPosition: options.position === 'absolute',
                            limit: {
                                x: [
                                    0,
                                    $('body').width() - containerWidth
                                ],
                                y: [
                                    0,
                                    $('body').height() - containerHeight
                                ]
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
                open: function () {
                    var index = this.options.zIndex || ++currentIndex;
                    this.$mask.css({ zIndex: index - 1 }).show();
                    this.$container.css({ zIndex: index }).show();
                    if (this.options.position === 'absolute') {
                        this.$container.css({ top: this.$container.position().top + document.body.scrollTop });
                    }
                },
                close: function () {
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
                updateButtons: function (buttonOption) {
                    buttonOption = buttonOption || [];
                    var bottom = this.$container.find('.biz-dialog-bottom'), self = this;
                    bottom.find('button').bizButton('destroy').off().remove();
                    $.each(buttonOption, function (index, buttonOption) {
                        var button = $('<button></button>').appendTo(bottom).bizButton(buttonOption);
                        if (buttonOption.onClick) {
                            button.click(function (e) {
                                buttonOption.onClick.call(self, e);
                            });
                        }
                    });
                },
                title: function (title) {
                    var titleElement = this.$container.find('.biz-panel-title-text');
                    if (undefined === title) {
                        return titleElement.html();
                    }
                    titleElement.html(title);
                },
                destroy: function () {
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
            var alert = function (options) {
                if (!jQuery.isPlainObject(options)) {
                    options = { content: options };
                }
                var defaultOption = {
                        content: '',
                        okText: '\u786E\u5B9A'
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
                            onClick: function () {
                                this.close();
                            }
                        }]
                });
                alert.bizDialog('open');
            };
            var confirm = function (options) {
                var defaultOption = {
                        content: '',
                        okText: '\u786E\u5B9A',
                        cancelText: '\u53D6\u6D88'
                    };
                options = $.extend(defaultOption, options || {});
                var confirm = $('<div style="display:none;" class="biz-confirm"><i class="biz-icon">&#xe8fd;</i><div>' + options.content + '</div></div>');
                confirm.appendTo('body').bizDialog({
                    destroyOnClose: true,
                    title: options.title,
                    theme: options.theme,
                    buttons: [
                        {
                            text: options.okText,
                            theme: options.theme,
                            onClick: function () {
                                var result = true;
                                if (typeof options.onOK == 'function') {
                                    result = options.onOK();
                                    if (result === false) {
                                        return;
                                    }
                                }
                                this.close();
                            }
                        },
                        {
                            text: options.cancelText,
                            theme: 'gray',
                            onClick: function () {
                                this.close();
                            }
                        }
                    ]
                });
                confirm.bizDialog('open');
            };
            $.extend($.fn, {
                bizDialog: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
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
        },
        function (module, exports) {
            function DropDown(dropdown, options) {
                this.main = dropdown;
                this.$main = $(this.main);
                var defaultOption = {
                        alignX: 'left',
                        alignY: 'bottom',
                        customClass: '',
                        offsetX: 0,
                        offsetY: 0
                    };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-dropdown', dataKey = 'bizDialog';
            DropDown.prototype = {
                init: function (options) {
                    if (typeof options.trigger === 'undefined') {
                        return;
                    }
                    this.$container = $('<div style="display:none;"></div>');
                    this.$container.addClass(defaultClass + ' ' + options.customClass).appendTo('body').append(this.$main.show());
                    this.$trigger = $(options.trigger);
                    var self = this;
                    this.$trigger.on('click.bizDropDown', function () {
                        self.toggle();
                    });
                },
                toggle: function () {
                    if (this.$container.css('display') === 'none') {
                        this.open();
                    } else {
                        this.close();
                    }
                },
                open: function () {
                    var result = true;
                    if (typeof this.options.onBeforeOpen == 'function') {
                        result = this.options.onBeforeOpen();
                        if (result === false) {
                            return;
                        }
                    }
                    this.$container.show();
                    var triggerPosition = this.$trigger.position(), containerLeft, containerTop;
                    if (this.options.alignX === 'left') {
                        containerLeft = triggerPosition.left + this.options.offsetX;
                    } else if (this.options.alignX === 'right') {
                        containerLeft = triggerPosition.left + this.$trigger.outerWidth() - this.$container.outerWidth() + this.options.offsetX;
                    }
                    if (this.options.alignY == 'bottom') {
                        containerTop = triggerPosition.top + this.$trigger.outerHeight() + this.options.offsetY;
                    } else if (this.options.alignY == 'top') {
                        containerTop = triggerPosition.top - this.$container.outerHeight() + this.options.offsetY;
                    }
                    this.$container.css({
                        left: containerLeft,
                        top: containerTop,
                        zIndex: this.options.zIndex || this.$trigger.css('zIndex')
                    });
                },
                close: function () {
                    var result = true;
                    if (typeof this.options.onBeforeClose == 'function') {
                        result = this.options.onBeforeClose();
                        if (result === false) {
                            return;
                        }
                    }
                    this.$container.hide();
                },
                destroy: function () {
                    this.$trigger.off('click.bizDropDown');
                    this.$container.remove();
                    this.$main.data(dataKey, null);
                }
            };
            $.extend($.fn, {
                bizDropDown: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
                                }
                            }
                        } else {
                            if (method === undefined || jQuery.isPlainObject(method)) {
                                $(this).data(dataKey, new DropDown(this, method));
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
            module.exports = DropDown;
        },
        function (module, exports) {
            _require(2);
            function Input(input, options) {
                this.main = input;
                this.$main = $(this.main);
                var defaultOption = {
                        theme: bizui.theme,
                        customClass: ''
                    };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-input', disableClass = 'biz-input-disable', hoverClass = 'biz-input-hover', focusClass = 'biz-input-focus-', dataKey = 'bizInput';
            Input.prototype = {
                init: function (options) {
                    this.$main.addClass(defaultClass + ' ' + options.customClass);
                    this.$main.placeholder();
                    if (options.disabled) {
                        this.disable();
                    }
                    this.$main.on('mouseover.bizInput', function () {
                        $(this).addClass(hoverClass);
                    }).on('mouseout.bizInput', function () {
                        $(this).removeClass(hoverClass);
                    }).on('focus.bizInput', function () {
                        $(this).addClass(focusClass + options.theme);
                    }).on('blur.bizInput', function () {
                        $(this).removeClass(focusClass + options.theme);
                    }).on('keydown.bizInput', function (e) {
                        if (e.keyCode === 13) {
                            $(this).trigger('enter', $(this).val());
                            return false;
                        }
                    });
                },
                enable: function () {
                    this.main.disabled = false;
                    this.$main.removeClass(disableClass);
                },
                disable: function () {
                    this.main.disabled = true;
                    this.$main.addClass(disableClass);
                },
                destroy: function () {
                    this.$main.removeClass([
                        defaultClass,
                        this.options.customClass,
                        disableClass
                    ].join(' '));
                    this.$main.off('keydown.bizInput').off('mouseover.bizInput').off('mouseout.bizInput').off('focus.bizInput').off('blur.bizInput');
                    this.$main.data(dataKey, null);
                }
            };
            function isInput(elem) {
                var type = elem.getAttribute('type');
                return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'input' && (!type || type.toLowerCase() === 'text' || type.toLowerCase() === 'password');
            }
            $.extend($.fn, {
                bizInput: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
                                }
                            }
                        } else {
                            if (isInput(this) && (method === undefined || jQuery.isPlainObject(method))) {
                                $(this).data(dataKey, new Input(this, method));
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
            module.exports = Input;
        },
        function (module, exports) {
            _require(11);
            function Page(page, options) {
            }
            Page.prototype = {
                destroy: function () {
                },
                disable: function () {
                },
                enable: function () {
                },
                getPageCount: function () {
                },
                getPageNumber: function () {
                },
                getPageSize: function () {
                },
                prevPage: function () {
                },
                nextPage: function () {
                },
                setPageNumber: function (pageNumber) {
                },
                setPageSize: function (pageSize) {
                },
                setTotalNumber: function (totalNumber, redraw) {
                }
            };
            $.extend($.fn, { bizPage: $.fn.pagination });
            module.exports = Page;
        },
        function (module, exports) {
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
            var defaultClass = 'biz-panel', prefix = 'biz-panel-', dataKey = 'bizPanel', currentIndex = 1000;
            Panel.prototype = {
                init: function (options) {
                    this.$container = $('<div style="display:none;"></div>');
                    this.$mask = $('<div class="biz-mask" style="display:none;"></div>');
                    this.$container.appendTo('body').after(this.$mask);
                    var self = this;
                    this.$container.addClass([
                        defaultClass,
                        options.customClass,
                        prefix + options.theme
                    ].join(' ')).html([
                        '<div class="biz-panel-margin"></div>',
                        '<div class="biz-panel-body">',
                        '<div class="biz-panel-title">',
                        '<span class="biz-panel-title-text">',
                        this.$main.attr('data-title') || options.title,
                        '</span>',
                        '<i class="biz-panel-close biz-icon">&#xe5cd;</i></div>',
                        '<div class="biz-panel-content"></div>',
                        '<div class="biz-panel-bottom"></div></div>'
                    ].join('')).on('click.bizPanel', '.biz-panel-close', function () {
                        self.close();
                    });
                    this.$container.find('.biz-panel-content').append(this.$main.show());
                    this.updateButtons(options.buttons);
                    this.$container.find('.biz-panel-margin').css({ width: options.marginLeft });
                    this.$container.find('.biz-panel-close').css({ right: options.marginLeft + 85 });
                },
                open: function () {
                    $('body').css({ overflow: 'hidden' });
                    var index = this.options.zIndex || ++currentIndex;
                    this.$mask.css({ zIndex: index - 1 }).show();
                    var self = this;
                    this.$container.css({ zIndex: index }).show().animate({ left: 0 }, this.options.speed, function () {
                        self.$container.find('.biz-panel-body')[0].scrollTop = 0;
                    });
                },
                close: function () {
                    var result = true;
                    if (typeof this.options.onBeforeClose == 'function') {
                        result = this.options.onBeforeClose();
                        if (result === false) {
                            return;
                        }
                    }
                    var self = this;
                    this.$container.animate({ left: '100%' }, this.options.speed, function () {
                        self.$container.hide();
                        self.$mask.hide();
                        $('body').css({ overflow: 'visible' });
                    });
                    if (typeof this.options.zIndex == 'undefined') {
                        currentIndex--;
                    }
                    if (this.options.destroyOnClose) {
                        this.destroy();
                    }
                },
                updateButtons: function (buttonOption) {
                    buttonOption = buttonOption || [];
                    var bottom = this.$container.find('.biz-panel-bottom'), self = this;
                    bottom.find('button').bizButton('destroy').off().remove();
                    $.each(buttonOption, function (index, buttonOption) {
                        var button = $('<button></button>').appendTo(bottom).bizButton(buttonOption);
                        if (buttonOption.onClick) {
                            button.click(function (e) {
                                buttonOption.onClick.call(self, e);
                            });
                        }
                    });
                },
                title: function (title) {
                    var titleElement = this.$container.find('.biz-panel-title-text');
                    if (undefined === title) {
                        return titleElement.html();
                    }
                    titleElement.html(title);
                },
                destroy: function () {
                    this.$container.off('click.bizPanel');
                    this.$container.find('.biz-panel-bottom button').bizButton('destroy').off();
                    this.$mask.remove();
                    this.$container.remove();
                    this.$main.data(dataKey, null);
                }
            };
            $.extend($.fn, {
                bizPanel: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
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
        },
        function (module, exports) {
            function Radio(radio, options) {
                this.main = radio;
                this.$main = $(this.main);
                this.$group = $('input[name="' + this.$main.attr('name') + '"]');
                var defaultOption = { theme: bizui.theme };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-label', unchecked = 'biz-radio-unchecked', uncheckedHover = 'biz-radio-unchecked-hover', checked = 'biz-radio-checked', checkedHover = 'biz-radio-checked-hover', uncheckedDisabled = 'biz-radio-unchecked-disabled', checkedDisabled = 'biz-radio-checked-disabled', dataKey = 'bizRadio', checkCodepoint = '&#xe837;', uncheckCodepoint = '&#xe836;';
            Radio.prototype = {
                init: function (options) {
                    var title = this.$main.attr('title'), id = this.$main.attr('id') || '';
                    this.$main.after('<label for="' + id + '"><i class="biz-icon"></i>' + title + '</label>').hide();
                    this.$label = this.$main.next();
                    this.defaultClass = defaultClass + ' biz-label-' + options.theme;
                    this.$label.addClass(this.defaultClass);
                    this.$icon = this.$label.children('i');
                    if (this.main.checked) {
                        this.$label.addClass(this.main.disabled ? checkedDisabled : checked);
                        this.$icon.html(checkCodepoint);
                    } else {
                        this.$label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
                        this.$icon.html(uncheckCodepoint);
                    }
                    var self = this;
                    this.$label.on('mouseover.bizRadio', function () {
                        if (!self.main.disabled) {
                            $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
                        }
                    }).on('mouseout.bizRadio', function () {
                        if (!self.main.disabled) {
                            $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
                        }
                    }).on('click.bizRadio', function () {
                        if (!self.main.disabled) {
                            self.$group.bizRadio('uncheck');
                            $(this).attr('class', [
                                self.defaultClass,
                                checked,
                                checkedHover
                            ].join(' '));
                            self.$icon.html(checkCodepoint);
                            if (id === '') {
                                self.main.checked = true;
                            }
                        }
                    });
                },
                check: function () {
                    this.$group.bizRadio('uncheck');
                    this.main.checked = true;
                    this.$label.attr('class', this.defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
                    this.$icon.html(checkCodepoint);
                },
                uncheck: function () {
                    this.main.checked = false;
                    this.$label.attr('class', this.defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
                    this.$icon.html(uncheckCodepoint);
                },
                enable: function () {
                    this.main.disabled = false;
                    this.$label.attr('class', this.defaultClass + ' ' + (this.main.checked ? checked : unchecked));
                },
                disable: function () {
                    this.main.disabled = true;
                    this.$label.attr('class', this.defaultClass + ' ' + (this.main.checked ? checkedDisabled : uncheckedDisabled));
                },
                val: function () {
                    var value = '';
                    this.$group.each(function (index, element) {
                        if (element.checked) {
                            value = $(element).val();
                            return false;
                        }
                    });
                    return value;
                },
                destroy: function () {
                    this.$main.show();
                    this.$label.off('mouseover.bizRadio').off('mouseout.bizRadio').off('click.bizRadio').remove();
                    this.$main.data(dataKey, null);
                }
            };
            function isRadio(elem) {
                return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'input' && elem.getAttribute('type').toLowerCase() === 'radio';
            }
            $.extend($.fn, {
                bizRadio: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
                                }
                            }
                        } else {
                            if (isRadio(this) && (method === undefined || jQuery.isPlainObject(method))) {
                                $(this).data(dataKey, new Radio(this, method));
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
            module.exports = Radio;
        },
        function (module, exports) {
            _require(10);
            function Select(select, options) {
            }
            Select.prototype = {
                destroy: function () {
                },
                refresh: function () {
                },
                open: function () {
                },
                close: function () {
                }
            };
            $.extend($.fn.selectric.defaults, { maxHeight: 240 });
            $.extend($.fn, { bizSelect: $.fn.selectric });
            module.exports = Select;
        },
        function (module, exports) {
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
            var defaultClass = 'biz-tab', prefix = 'biz-tab-', dataKey = 'bizTab';
            Tab.prototype = {
                init: function (options) {
                    this.$main.addClass([
                        defaultClass,
                        options.customClass,
                        prefix + options.theme
                    ].join(' '));
                    this.$tabs = this.$main.children('ul').children('li');
                    this.$contents = this.$main.children('div').children('div').hide();
                    var self = this;
                    if (options.action === 'hover') {
                        options.action = 'mouseover';
                    }
                    this.$tabs.on(options.action + '.bizTab', function (e) {
                        if (!$(this).hasClass('active')) {
                            var index;
                            self.$tabs.each(function (i, tab) {
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
                index: function (selectedIndex, fire) {
                    var curTab, curContent;
                    if (typeof selectedIndex != 'undefined') {
                        this.$tabs.removeClass('active');
                        this.$contents.hide();
                        this.options.selectedIndex = selectedIndex;
                        curTab = $(this.$tabs[selectedIndex]).addClass('active');
                        curContent = $(this.$contents[selectedIndex]).show();
                        if (fire === undefined || !!fire) {
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
                destroy: function () {
                    this.$main.removeClass([
                        defaultClass,
                        this.options.customClass,
                        prefix + this.options.theme
                    ].join(' '));
                    this.$tabs.off(this.options.action + '.bizTab');
                    this.$main.data(dataKey, null);
                }
            };
            function isTab(elem) {
                return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
            }
            $.extend($.fn, {
                bizTab: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
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
        },
        function (module, exports) {
            _require(9);
            function Table(table, options) {
                this.main = table;
                this.$main = $(this.main);
                var defaultOption = {
                        customClass: '',
                        data: [],
                        noDataContent: '<p><i class="biz-icon">&#xe001;</i> \u6CA1\u6709\u6570\u636E</p>',
                        selectable: false,
                        defaultSort: 'des',
                        lockHead: false,
                        topOffset: 0
                    };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-table', dataKey = 'bizTable';
            function escapeHTML(str) {
                return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            }
            Table.prototype = {
                init: function (options) {
                    this.$main.html([
                        '<div class="biz-table-head-wrap"><table class="biz-table-head"></table></div>',
                        '<div class="biz-table-placeholder"></div>',
                        '<div class="biz-table-body-wrap"><table class="biz-table-body"></table></div>'
                    ].join(''));
                    this.$headWrap = this.$main.find('.biz-table-head-wrap');
                    this.$bodyWrap = this.$main.find('.biz-table-body-wrap');
                    this.$placeholder = this.$main.find('.biz-table-placeholder');
                    this.$tableHead = this.$main.find('.biz-table-head');
                    this.$tableBody = this.$main.find('.biz-table-body');
                    this.$tableHead.html(this.createTableHead(options)).addClass([
                        defaultClass,
                        options.customClass
                    ].join(' '));
                    this.$tableBody.html(this.createTableBody(options)).addClass([
                        defaultClass,
                        options.customClass,
                        this.rowSpan > 1 && options.data.length > 0 ? 'biz-rowspan' : ''
                    ].join(' '));
                    if (options.foot && options.data.length > 0) {
                        var tbody = this.$tableBody.find('tbody'), foot = this.createFoot(options);
                        if (options.foot === 'top') {
                            tbody.prepend(foot);
                        }
                        if (options.foot === 'bottom') {
                            tbody.append(foot);
                        }
                    }
                    if (options.data.length === 0) {
                        this.createNoDataContent();
                    }
                    if (options.selectable && options.data.length > 0) {
                        this.createSelect(options.data);
                        this.bindSelect();
                    }
                    if (options.onSort) {
                        this.bindSort();
                    }
                    var self = this;
                    this.$headWrap.on('scroll', function () {
                        self.$bodyWrap[0].scrollLeft = this.scrollLeft;
                    });
                    this.$bodyWrap.on('scroll', function () {
                        self.$headWrap[0].scrollLeft = this.scrollLeft;
                    });
                    this.syncWidth();
                    $(window).on('resize.bizTable', function () {
                        self.syncWidth();
                    });
                    if (options.lockHead) {
                        var headHeight = this.$headWrap.height();
                        $(window).on('scroll.bizTable', function () {
                            var currentOffsetTop = self.$main.offset().top - options.topOffset;
                            if ($(window).scrollTop() > currentOffsetTop) {
                                if (!self.hasLocked) {
                                    self.$headWrap.css({
                                        position: 'fixed',
                                        top: self.options.topOffset,
                                        width: self.$main.width()
                                    });
                                    self.$placeholder.css({ height: headHeight });
                                    self.hasLocked = true;
                                }
                            } else {
                                if (self.hasLocked) {
                                    self.$headWrap.css({
                                        position: 'static',
                                        top: 'auto',
                                        width: 'auto'
                                    });
                                    self.$placeholder.css({ height: 0 });
                                    self.hasLocked = false;
                                }
                            }
                        });
                    }
                    this.$tableBody.editableTableWidget();
                    if (options.onValidate) {
                        this.bindValidate();
                    }
                    if (options.onEdit) {
                        this.bindEdit();
                    }
                    if (options.onFailEdit) {
                        this.bindFailEdit();
                    }
                },
                createTableHead: function (options) {
                    var thead = $('<thead><tr></tr></thead><tbody></tbody>'), column = options.column, columnCount = column.length;
                    this.rowSpan = 1;
                    for (var i = 0; i < columnCount; i++) {
                        var col = column[i];
                        if (typeof col.visible !== 'undefined' && !col.visible) {
                            continue;
                        }
                        if (!$.isArray(col.content)) {
                            col.content = [col.content];
                        }
                        if (col.content.length > this.rowSpan) {
                            this.rowSpan = col.content.length;
                        }
                        var th = $('<th nowrap></th>').attr({
                                width: col.width,
                                field: col.field
                            });
                        var title = col.escapeTitle === false ? col.title : escapeHTML(col.title);
                        if (col.sortable) {
                            var wrap = $('<div class="sortable"></div>').html(title);
                            if (col.currentSort) {
                                wrap.attr(col.currentSort, '');
                            }
                            title = wrap.prop('outerHTML');
                        }
                        thead.find('tr').append(th.html(title).prop('outerHTML'));
                    }
                    return thead.prop('outerHTML');
                },
                createTableBody: function (options) {
                    var tbody = $('<tbody></tbody>'), column = options.column, columnCount = column.length, data = options.data, rowCount = data.length;
                    for (var i = 0; i < rowCount; i++) {
                        var tr = $('<tr></tr>'), item = data[i], index = i + 1;
                        for (var j = 0; j < columnCount; j++) {
                            var col = column[j];
                            if (typeof col.visible !== 'undefined' && !col.visible) {
                                continue;
                            }
                            if (!$.isArray(col.content)) {
                                col.content = [col.content];
                            }
                            var td = $('<td></td>').attr({
                                    align: col.align,
                                    width: col.width
                                });
                            if (col.editable && col.content.length === 1) {
                                td.attr('editable', '');
                            }
                            if (this.rowSpan > 1 && col.content.length === 1) {
                                td.attr('rowspan', this.rowSpan);
                            }
                            var content = col.content[0].apply(this, [
                                    item,
                                    index,
                                    col.field
                                ]).toString();
                            td.html(col.escapeContent === false ? content : escapeHTML(content)).appendTo(tr);
                        }
                        tbody.append(tr);
                        if (this.rowSpan > 1) {
                            for (var m = 1; m < this.rowSpan; m++) {
                                var _tr = $('<tr></tr>');
                                for (var n = 0; n < columnCount; n++) {
                                    var _col = column[n];
                                    if (!$.isArray(_col.content)) {
                                        _col.content = [_col.content];
                                    }
                                    if (typeof _col.visible !== 'undefined' && !_col.visible || _col.content.length === 1) {
                                        continue;
                                    }
                                    var _td = $('<td></td>').attr('align', _col.align), _content = _col.content[m].apply(this, [
                                            item,
                                            index,
                                            _col.field
                                        ]).toString();
                                    _td.html(_col.escapeContent === false ? _content : escapeHTML(_content)).appendTo(_tr);
                                }
                                tbody.append(_tr);
                            }
                        }
                    }
                    return tbody.prop('outerHTML');
                },
                createFoot: function (options) {
                    var sum = $('<tr class="sum"></tr>'), column = options.column, columnCount = column.length;
                    if (options.selectable) {
                        sum.append('<td width="24"></td>');
                    }
                    for (var i = 0; i < columnCount; i++) {
                        var col = column[i];
                        if (typeof col.visible !== 'undefined' && !col.visible) {
                            continue;
                        }
                        var td = $('<td></td>').attr({
                                align: col.align,
                                width: col.width
                            });
                        var content = col.footContent ? col.footContent.call(this, col.field).toString() : '';
                        td.html(col.escapeContent === false ? content : escapeHTML(content)).appendTo(sum);
                    }
                    return sum.prop('outerHTML');
                },
                createNoDataContent: function () {
                    var colspan = this.options.column.length;
                    $.each(this.options.column, function (index, col) {
                        if (col.visible) {
                            colspan--;
                        }
                    });
                    if (this.options.selectable) {
                        colspan = colspan + 1;
                    }
                    this.$tableBody.find('tbody').append('<tr class="no-data"><td colspan="' + colspan + '">' + this.options.noDataContent + '</td></tr>');
                },
                createSelect: function (data) {
                    var headEnabled = false;
                    if (this.rowSpan === 1) {
                        this.$tableBody.find('tr[class!="sum"]').each(function (index, tr) {
                            var td = $('<td width="24" align="center" class="select-col"><input type="checkbox" title=" "></td>');
                            $(this).prepend(td);
                            if (data[index].disabledSelect) {
                                $(this).addClass('select-disabled');
                                td.find(':checkbox').prop('disabled', true);
                            } else {
                                headEnabled = true;
                            }
                        });
                    } else {
                        var self = this, dataIndex = 0;
                        this.$tableBody.find('tr[class!="sum"]').each(function (index, tr) {
                            if ((index + self.rowSpan) % self.rowSpan === 0) {
                                var td = $('<td width="24" align="center" class="select-col" rowspan="' + self.rowSpan + '"><input type="checkbox" title=" "></td>');
                                $(this).prepend(td);
                                if (data[dataIndex].disabledSelect) {
                                    $(this).addClass('select-disabled');
                                    td.find(':checkbox').prop('disabled', true);
                                } else {
                                    headEnabled = true;
                                }
                                dataIndex++;
                            }
                        });
                    }
                    var th = $('<th nowrap width="24" class="select-col"><input type="checkbox" title=" "></th>');
                    this.$tableHead.find('tr').prepend(th);
                    if (!headEnabled) {
                        th.find(':checkbox').prop('disabled', true);
                    }
                    this.$main.find(':checkbox').bizCheckbox({ theme: 'gray' });
                },
                bindSelect: function () {
                    var self = this;
                    this.$main.on('click.bizTableSelectAll', '.biz-table-head .select-col .biz-label', function (e) {
                        if ($(this).hasClass('biz-checkbox-unchecked-disabled')) {
                            return;
                        }
                        var selected = $(this).hasClass('biz-checkbox-checked'), checkbox = self.$tableBody.find('.select-col :checkbox').filter(':not(:disabled)'), tr = self.$tableBody.find('tr[class!="sum"]').filter('[class!="select-disabled"]');
                        if (selected) {
                            checkbox.bizCheckbox('check');
                            tr.addClass('selected');
                        } else {
                            checkbox.bizCheckbox('uncheck');
                            tr.removeClass('selected');
                        }
                        if (self.options.onSelect) {
                            self.options.onSelect.call(self, self.getSelected(), e);
                        }
                    }).on('click.bizTableSelectOne', '.biz-table-body .select-col .biz-label', function (e) {
                        if ($(this).hasClass('biz-checkbox-unchecked-disabled')) {
                            return;
                        }
                        var selected = $(this).hasClass('biz-checkbox-checked'), tr = $(this).parent().parent();
                        if (selected) {
                            tr.addClass('selected');
                        } else {
                            tr.removeClass('selected');
                        }
                        var selectedCount = self.$tableBody.find('.select-col .biz-checkbox-checked').length, checkboxCount = self.$tableBody.find('.select-col :checkbox').filter(':not(:disabled)').length, selectAll = self.$tableHead.find('.select-col :checkbox');
                        if (selectedCount === checkboxCount) {
                            selectAll.bizCheckbox('check');
                        } else {
                            selectAll.bizCheckbox('uncheck');
                        }
                        if (self.options.onSelect) {
                            self.options.onSelect.call(self, self.getSelected(), e);
                        }
                    });
                },
                getSelectedIndex: function () {
                    var self = this, result = [];
                    this.$tableBody.find('tr[class!="sum"]').each(function (index, tr) {
                        if ($(tr).hasClass('selected')) {
                            result.push(self.rowSpan > 1 ? index / self.rowSpan : index);
                        }
                    });
                    return result;
                },
                getSelected: function () {
                    var self = this;
                    return $.map(this.getSelectedIndex(), function (index) {
                        return self.options.data[index];
                    });
                },
                setSelected: function (rowIndex, selected, fire) {
                    var self = this;
                    if (rowIndex === 0) {
                        rowIndex = $.map(this.options.data, function (val, index) {
                            return index + 1;
                        });
                    }
                    if (!$.isArray(rowIndex)) {
                        rowIndex = [rowIndex];
                    }
                    $.each(rowIndex, function (index, val) {
                        var tr = self.$tableBody.find('tbody tr:nth-child(' + (self.rowSpan > 1 ? val * self.rowSpan : val) + ')').filter('[class!="sum"]').filter('[class!="select-disabled"]'), checkbox = tr.find('.select-col :checkbox');
                        if (selected) {
                            checkbox.bizCheckbox('check');
                            tr.addClass('selected');
                        } else {
                            checkbox.bizCheckbox('uncheck');
                            tr.removeClass('selected');
                        }
                    });
                    var selectedCount = self.$tableBody.find('.select-col .biz-checkbox-checked').length, checkboxCount = self.$tableBody.find('.select-col :checkbox').filter(':not(:disabled)').length, selectAll = self.$tableHead.find('.select-col :checkbox');
                    if (selectedCount === checkboxCount) {
                        selectAll.bizCheckbox('check');
                    } else {
                        selectAll.bizCheckbox('uncheck');
                    }
                    if (fire && this.options.onSelect) {
                        this.options.onSelect.call(this, this.getSelected());
                    }
                },
                getData: function () {
                    return this.options.data;
                },
                getColumn: function () {
                    return this.options.column;
                },
                removeSort: function () {
                    this.$tableHead.find('.sortable').removeAttr('des').removeAttr('asc');
                },
                bindSort: function () {
                    var self = this;
                    this.$main.on('click.bizTableSort', '.biz-table-head .sortable', function (e) {
                        var head = $(this), field = head.parent().attr('field');
                        if (head.attr('des') !== undefined) {
                            self.removeSort();
                            head.attr('asc', '');
                        } else if (head.attr('asc') !== undefined) {
                            self.removeSort();
                            head.attr('des', '');
                        } else {
                            self.removeSort();
                            head.attr(self.options.defaultSort === 'des' ? 'des' : 'asc', '');
                        }
                        self.options.onSort.call(self, {
                            field: field,
                            des: head.attr('des') !== undefined,
                            asc: head.attr('asc') !== undefined
                        }, e);
                    });
                },
                syncWidth: function () {
                    this.$headWrap.css({ width: this.$main.width() });
                    this.$tableHead.css({ width: this.$tableBody.width() });
                },
                showColumn: function (field) {
                    this.setColumnVisible(field, true);
                },
                hideColumn: function (field) {
                    this.setColumnVisible(field, false);
                },
                setColumnVisible: function (fields, visible) {
                    if (!$.isArray(fields)) {
                        fields = [fields];
                    }
                    var self = this;
                    $.each(fields, function (index, field) {
                        $.each(self.options.column, function (i, col) {
                            if (col.field === field) {
                                col.visible = visible;
                            }
                        });
                    });
                    this.refresh();
                },
                updateData: function (data) {
                    this.options.data = $.map(data || [], function (val, index) {
                        return val;
                    });
                    this.refresh();
                },
                updateRow: function (rowIndex, data) {
                    this.options.data[rowIndex - 1] = $.extend(true, {}, data);
                    this.refresh();
                },
                updateCell: function (rowIndex, field, data) {
                    this.options.data[rowIndex - 1][field] = data;
                    this.refresh();
                },
                bindValidate: function () {
                    var self = this;
                    this.$main.on('validate', 'td[editable]', function (e, newValue) {
                        var columIndex = $(this).parent().find('td').index($(this));
                        if (self.options.selectable) {
                            columIndex = columIndex - 1;
                        }
                        return self.options.onValidate.call(self, {
                            newValue: newValue,
                            field: self.options.column[columIndex].field
                        }, e);
                    });
                },
                bindEdit: function () {
                    var self = this;
                    this.$main.on('change', 'td[editable]', function (e, newValue) {
                        var row = $(this).parent(), columIndex = row.find('td').index($(this)), rowIndex = row.parent().find('tr[class!="sum"]').index(row) / self.rowSpan;
                        if (self.options.selectable) {
                            columIndex = columIndex - 1;
                        }
                        var field = self.options.column[columIndex].field;
                        self.options.data[rowIndex][field] = newValue;
                        return self.options.onEdit.call(self, {
                            newValue: newValue,
                            field: field,
                            item: self.options.data[rowIndex],
                            index: rowIndex
                        }, e);
                    });
                },
                bindFailEdit: function () {
                    var self = this;
                    this.$main.on('fail', 'td[editable]', function (e, newValue) {
                        var row = $(this).parent(), columIndex = row.find('td').index($(this)), rowIndex = row.parent().find('tr[class!="sum"]').index(row) / self.rowSpan;
                        if (self.options.selectable) {
                            columIndex = columIndex - 1;
                        }
                        var field = self.options.column[columIndex].field;
                        return self.options.onFailEdit.call(self, {
                            newValue: newValue,
                            field: field,
                            item: self.options.data[rowIndex],
                            index: rowIndex
                        }, e);
                    });
                },
                refresh: function () {
                    var options = this.options;
                    this.$main.find('.select-col :checkbox').bizCheckbox('destroy');
                    this.$tableHead.html(this.createTableHead(options));
                    this.$tableBody.html(this.createTableBody(options));
                    if (options.foot && options.data.length > 0) {
                        var tbody = this.$tableBody.find('tbody'), foot = this.createFoot(options);
                        if (options.foot === 'top') {
                            tbody.prepend(foot);
                        }
                        if (options.foot === 'bottom') {
                            tbody.append(foot);
                        }
                    }
                    if (options.data.length === 0) {
                        this.createNoDataContent();
                    }
                    if (options.selectable && options.data.length > 0) {
                        this.createSelect(options.data);
                    }
                    this.$headWrap[0].scrollLeft = this.$bodyWrap[0].scrollLeft = 0;
                    this.syncWidth();
                    this.$tableBody.find('td').prop('tabindex', 1);
                },
                destroy: function () {
                    this.$main.find('.select-col :checkbox').bizCheckbox('destroy');
                    this.$main.off('click.bizTableSelectAll').off('click.bizTableSelectOne').off('click.bizTableSort').off('click.bizTableEdit').off('validate').off('change').off('fail');
                    this.$headWrap.off();
                    this.$bodyWrap.off();
                    $(window).off('scroll.bizTable').off('resize.bizTable').off('resize.bizTableEdit');
                    $('.biz-table-editor').off().remove();
                    this.$main.empty();
                    this.$main.data(dataKey, null);
                }
            };
            $.extend($.fn, {
                bizTable: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
                                }
                            }
                        } else {
                            if (method === undefined || jQuery.isPlainObject(method)) {
                                $(this).data(dataKey, new Table(this, method));
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
            module.exports = Table;
        },
        function (module, exports) {
            _require(2);
            function Textarea(textarea, options) {
                this.main = textarea;
                this.$main = $(this.main);
                var defaultOption = {
                        theme: bizui.theme,
                        customClass: ''
                    };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-textarea', disableClass = 'biz-textarea-disable', hoverClass = 'biz-textarea-hover', focusClass = 'biz-textarea-focus-', dataKey = 'bizTextarea';
            Textarea.prototype = {
                init: function (options) {
                    this.$main.addClass(defaultClass + ' ' + options.customClass);
                    this.$main.placeholder();
                    if (options.disabled) {
                        this.disable();
                    }
                    this.$main.on('mouseover.bizTextarea', function () {
                        $(this).addClass(hoverClass);
                    }).on('mouseout.bizTextarea', function () {
                        $(this).removeClass(hoverClass);
                    }).on('focus.bizTextarea', function () {
                        $(this).addClass(focusClass + options.theme);
                    }).on('blur.bizTextarea', function () {
                        $(this).removeClass(focusClass + options.theme);
                    });
                },
                enable: function () {
                    this.main.disabled = false;
                    this.$main.removeClass(disableClass);
                },
                disable: function () {
                    this.main.disabled = true;
                    this.$main.addClass(disableClass);
                },
                length: function () {
                    return this.$main.val().replace(/\r?\n/g, '').length;
                },
                destroy: function () {
                    this.$main.removeClass([
                        defaultClass,
                        this.options.customClass,
                        disableClass
                    ].join(' '));
                    this.$main.off('mouseover.bizTextarea').off('mouseout.bizTextarea').off('focus.bizTextarea').off('blur.bizTextarea');
                    this.$main.data(dataKey, null);
                }
            };
            function isTextarea(elem) {
                return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'textarea';
            }
            $.extend($.fn, {
                bizTextarea: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
                                }
                            }
                        } else {
                            if (isTextarea(this) && (method === undefined || jQuery.isPlainObject(method))) {
                                $(this).data(dataKey, new Textarea(this, method));
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
            module.exports = Textarea;
        },
        function (module, exports) {
            function Textline(textline, options) {
                this.main = textline;
                this.$main = $(this.main);
                var defaultOption = {
                        theme: bizui.theme,
                        customClass: ''
                    };
                this.options = $.extend(defaultOption, options || {});
                this.init(this.options);
            }
            var defaultClass = 'biz-textline', disableClass = 'biz-textline-disable', hoverClass = 'biz-textline-hover', focusClass = 'biz-textline-focus-', prefix = 'biz-textline-', dataKey = 'bizTextline';
            Textline.prototype = {
                init: function (options) {
                    this.$main.addClass([
                        defaultClass,
                        options.customClass,
                        prefix + options.theme
                    ].join(' ')).html('<div><pre></pre></div><textarea></textarea>');
                    var w = options.width || this.$main.width(), h = options.height || this.$main.height();
                    w = Math.max(w, 200);
                    h = Math.max(h, 52);
                    this.$main.css({
                        width: w,
                        height: h
                    });
                    this.$line = this.$main.children('div').css({ height: h - 10 });
                    this.$lineNumber = this.$main.find('pre');
                    this.$textarea = this.$main.children('textarea').css({
                        width: w - 36,
                        height: h - 12
                    });
                    if (options.disabled) {
                        this.disable();
                    }
                    var self = this;
                    this.$textarea.on('mouseover.bizTextline', function () {
                        $(this).addClass(hoverClass);
                    }).on('mouseout.bizTextline', function () {
                        $(this).removeClass(hoverClass);
                    }).on('focus.bizTextline', function () {
                        $(this).addClass(focusClass + options.theme);
                    }).on('blur.bizTextline', function () {
                        $(this).removeClass(focusClass + options.theme);
                    }).on('keyup.bizTextline.render', function (e) {
                        self.renderLineNumber(e.target.scrollTop);
                    }).on('scroll.bizTextline', function (e) {
                        self.scrollLineNumber(e.target.scrollTop);
                    });
                    if (parseInt(options.maxLine, 10) >= 1) {
                        this.$textarea.on('keyup.bizTextline.maxLine', function (e) {
                            if (e.keyCode === 13) {
                                var valArray = self.valArray(), length = valArray.length;
                                if (length > options.maxLine) {
                                    valArray.splice(options.maxLine, length - options.maxLine);
                                    self.valArray(valArray);
                                }
                            }
                        });
                    }
                    this.renderLineNumber(0);
                    if (typeof options.val === 'string') {
                        this.val(options.val);
                    }
                    if (jQuery.isArray(options.valArray)) {
                        this.valArray(options.valArray);
                    }
                },
                enable: function () {
                    this.$textarea[0].disabled = false;
                    this.$textarea.removeClass(disableClass);
                },
                disable: function () {
                    this.$textarea[0].disabled = true;
                    this.$textarea.addClass(disableClass);
                },
                length: function () {
                    return this.$textarea.val().replace(/\r?\n/g, '').length;
                },
                val: function (value) {
                    if (undefined === value) {
                        return this.$textarea.val();
                    }
                    if (parseInt(this.options.maxLine, 10) >= 1) {
                        var valArray = value.split('\n'), length = valArray.length;
                        if (length > this.options.maxLine) {
                            valArray.splice(this.options.maxLine, length - this.options.maxLine);
                            value = valArray.join('\n');
                        }
                    }
                    this.$textarea.val(value);
                    this.renderLineNumber(0);
                },
                valArray: function (value) {
                    if (undefined === value) {
                        return this.val().split('\n');
                    }
                    if (parseInt(this.options.maxLine, 10) >= 1) {
                        var length = value.length;
                        if (length > this.options.maxLine) {
                            value.splice(this.options.maxLine, length - this.options.maxLine);
                        }
                    }
                    this.$textarea.val(value.join('\n'));
                    this.renderLineNumber(0);
                },
                destroy: function () {
                    this.$textarea.off('mouseover.bizTextline').off('mouseout.bizTextline').off('focus.bizTextline').off('blur.bizTextline').off('keyup.bizTextline').off('scroll.bizTextline');
                    this.$main.removeClass([
                        defaultClass,
                        this.options.customClass,
                        prefix + this.options.theme
                    ].join(' ')).empty();
                    this.$main.data(dataKey, null);
                },
                renderLineNumber: function (scrollTop) {
                    var lineCount = this.$textarea.val().split('\n').length, numbers = '1';
                    for (var i = 2; i <= lineCount; i++) {
                        numbers += '\n' + i;
                    }
                    this.$lineNumber.html(numbers);
                    this.scrollLineNumber(scrollTop);
                },
                scrollLineNumber: function (scrollTop) {
                    this.$lineNumber.css({ top: 5 - scrollTop });
                }
            };
            function isTextline(elem) {
                return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
            }
            $.extend($.fn, {
                bizTextline: function (method) {
                    var internal_return, args = arguments;
                    this.each(function () {
                        var instance = $(this).data(dataKey);
                        if (instance) {
                            if (typeof method === 'string' && typeof instance[method] === 'function') {
                                internal_return = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
                                if (internal_return !== undefined) {
                                    return false;
                                }
                            }
                        } else {
                            if (isTextline(this) && (method === undefined || jQuery.isPlainObject(method))) {
                                $(this).data(dataKey, new Textline(this, method));
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
            module.exports = Textline;
        },
        function (module, exports) {
            _require(5);
            function Tooltip(options) {
                if (options.theme) {
                    options.tooltipClass = 'biz-tooltip-' + options.theme;
                }
                if (options.removeAll) {
                    $(document).off('focus.tips', '**');
                }
                $.tips(options);
            }
            module.exports = Tooltip;
        },
        function (module, exports) {
        },
        function (module, exports) {
            _require(4);
            function Tree(tree, options) {
            }
            $.extend($.jstree.defaults.core, { strings: { 'Loading ...': '\u52A0\u8F7D\u4E2D ...' } });
            $.extend($.fn, { bizTree: $.fn.jstree });
            module.exports = Tree;
        },
        function (module, exports) {
            _require(12);
            function TreeTable(treetable, options) {
            }
            TreeTable.prototype = {
                destroy: function () {
                },
                collapseAll: function () {
                },
                collapseNode: function (id) {
                },
                expandAll: function () {
                },
                expandNode: function (nodeId) {
                },
                loadBranch: function (parentId, rows) {
                },
                move: function (nodeId, newParentId) {
                },
                node: function (nodeId) {
                },
                reveal: function (nodeId) {
                },
                removeNode: function (nodeId) {
                },
                unloadBranch: function (parentNode) {
                },
                sortBranch: function (parentNode, sortFunction) {
                }
            };
            $.extend($.fn, { bizTreeTable: $.fn.treetable });
            module.exports = TreeTable;
        }
    ];
    return _require(6);
}));