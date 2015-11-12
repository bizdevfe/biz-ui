/**
 * BizUI Framework
 * @version v1.1.3
 * @copyright 2015 Sogou, Inc.
 * @link https://github.com/bizdevfe/biz-ui
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root.bizui = factory();
    }
}(this, function($) {
    $ = $ || window.$;
    /**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../node_modules/almond/almond", function(){});

/**
 * @ignore
 */
define('ui/Button',['require'],function(require) {
    /**
     * Button constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/yaram3jy/3/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} button 目标元素
     * @param {Object} [options] 参数
     * @param {String} [options.theme] 主题（dark）
     * @param {String} [options.label] 文字
     * @param {Boolean} [options.disabled] 是否禁用
     */
    function Button(button, options) {
        if (button instanceof jQuery) {
            if (button.length > 0) {
                button = button[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isButton(button)) {
            return;
        }

        /**
         * @property {HTMLElement} main `button`元素
         */
        this.main = button;

        /**
         * @property {jQuery} $main `button`元素的$包装
         */
        this.$main = $(this.main);

        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-button',
        disableClass = 'biz-button-disable',
        prefix = 'biz-button-';

    Button.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);
            if (options.theme) {
                this.$main.addClass(prefix + options.theme);
            }

            if (options.label) {
                this.$main.html(options.label);
            }

            if (options.disabled) {
                this.disable();
            }
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.$main.removeClass(disableClass);
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.$main.addClass(disableClass);
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass + ' ' + disableClass);
            if (this.options.theme) {
                this.$main.removeClass(prefix + this.options.theme);
            }
        }
    };

    function isButton(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'button';
    }

    var dataKey = 'bizButton';

    $.extend($.fn, {
        bizButton: function(method, options) {
            var button;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        button = $(this).data(dataKey);
                        if (button) {
                            button.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        button = $(this).data(dataKey);
                        if (button) {
                            button.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        button = $(this).data(dataKey);
                        if (button) {
                            button.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isButton(this)) {
                            $(this).data(dataKey, new Button(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Button;
});
/**
 * @ignore
 */
define('ui/Input',['require'],function(require) {
    /**
     * Input constructor
     *
     * <iframe width="100%" height="200" src="//jsfiddle.net/bizdevfe/sx74qw4g/1/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} input 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.disabled] 是否禁用
     * @param {Function} [options.onEnter] 按回车回调(event)
     */
    function Input(input, options) {
        if (input instanceof jQuery) {
            if (input.length > 0) {
                input = input[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isInput(input)) {
            return;
        }

        /**
         * @property {HTMLElement} main `input`元素
         */
        this.main = input;

        /**
         * @property {jQuery} $main `input`元素的$包装
         */
        this.$main = $(this.main);

        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-input',
        disableClass = 'biz-input-disable',
        hoverClass = 'biz-input-hover',
        focusClass = 'biz-input-focus';

    Input.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);

            if (options.disabled) {
                this.disable();
            }

            var self = this;
            this.$main.on('keydown.bizInput', function(e) {
                if (e.keyCode === 13) {
                    if (options.onEnter) {
                        options.onEnter.call(self, e);
                    }
                    return false; //阻止IE9, 10触发<button>元素的click事件
                }
            });

            this.$main.on('mouseover.bizInput', function(e) {
                $(this).addClass(hoverClass);
            }).on('mouseout.bizInput', function(e) {
                $(this).removeClass(hoverClass);
            }).on('focus.bizInput', function(e) {
                $(this).addClass(focusClass);
            }).on('blur.bizInput', function(e) {
                $(this).removeClass(focusClass);
            });
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.$main.removeClass(disableClass);
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.$main.addClass(disableClass);
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass + ' ' + disableClass);
            this.$main.off('keydown.bizInput')
                .off('mouseover.bizInput')
                .off('mouseout.bizInput')
                .off('focus.bizInput')
                .off('blur.bizInput');
        }
    };

    function isInput(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'input' &&
            elem.getAttribute('type').toLowerCase() === 'text';
    }

    var dataKey = 'bizInput';

    $.extend($.fn, {
        bizInput: function(method, options) {
            var input;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        input = $(this).data(dataKey);
                        if (input) {
                            input.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        input = $(this).data(dataKey);
                        if (input) {
                            input.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        input = $(this).data(dataKey);
                        if (input) {
                            input.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isInput(this)) {
                            $(this).data(dataKey, new Input(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Input;
});
/**
 * @ignore
 */
define('ui/Textarea',['require'],function(require) {
    /**
     * Textarea constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/wus1a8wy/3/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} textarea 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.disabled] 是否禁用
     */
    function Textarea(textarea, options) {
        if (textarea instanceof jQuery) {
            if (textarea.length > 0) {
                textarea = textarea[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isTextarea(textarea)) {
            return;
        }

        /**
         * @property {HTMLElement} main `textarea`元素
         */
        this.main = textarea;

        /**
         * @property {jQuery} $main `textarea`元素的$包装
         */
        this.$main = $(this.main);

        this.options = $.extend({}, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-textarea',
        disableClass = 'biz-textarea-disable',
        hoverClass = 'biz-textarea-hover',
        focusClass = 'biz-textarea-focus';

    Textarea.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);

            if (options.disabled) {
                this.disable();
            }

            this.$main.on('mouseover.bizTextarea', function(e) {
                $(this).addClass(hoverClass);
            }).on('mouseout.bizTextarea', function(e) {
                $(this).removeClass(hoverClass);
            }).on('focus.bizTextarea', function(e) {
                $(this).addClass(focusClass);
            }).on('blur.bizTextarea', function(e) {
                $(this).removeClass(focusClass);
            });
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.$main.removeClass(disableClass);
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.$main.addClass(disableClass);
        },

        /**
         * 获取文本长度（去除回车）
         * @return {Number} 文本长度
         */
        length: function() {
            return this.main.value.replace(/\r?\n/g, '').length;
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass + ' ' + disableClass);
            this.$main.off('mouseover.bizTextarea')
                .off('mouseout.bizTextarea')
                .off('focus.bizTextarea')
                .off('blur.bizTextarea');
        }
    };

    function isTextarea(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'textarea';
    }

    var dataKey = 'bizTextarea';

    $.extend($.fn, {
        bizTextarea: function(method, options) {
            var textarea;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        textarea = $(this).data(dataKey);
                        if (textarea) {
                            textarea.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        textarea = $(this).data(dataKey);
                        if (textarea) {
                            textarea.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        textarea = $(this).data(dataKey);
                        if (textarea) {
                            textarea.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'length':
                    return this.length !== 0 ? this.data(dataKey).length() : null;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTextarea(this)) {
                            $(this).data(dataKey, new Textarea(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Textarea;
});
/**
 * @ignore
 */
define('ui/Textline',['require'],function(require) {
    /**
     * Textline constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/wus1a8wy/3/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} textline 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.disabled] 是否禁用
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
            this.$main.addClass(defaultClass).html('<div><pre></pre></div><textarea></textarea>');

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
            this.$main.removeClass(defaultClass).empty();
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
/**
 * @ignore
 */
define('ui/Radio',['require'],function(require) {
    /**
     * Radio constructor
     *
     * <iframe width="100%" height="200" src="//jsfiddle.net/bizdevfe/o74stme1/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} radio 目标元素
     */
    function Radio(radio) {
        if (radio instanceof jQuery) {
            if (radio.length > 0) {
                radio = radio[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isRadio(radio)) {
            return;
        }

        /**
         * @property {HTMLElement} main `input`元素
         */
        this.main = radio;

        /**
         * @property {jQuery} $main `input`元素的$包装
         */
        this.$main = $(this.main);

        /**
         * @property {Array} $group 同组选项
         */
        this.$group = $('input[name="' + this.$main.attr('name') + '"]');

        this.init();
    }

    var defaultClass = 'biz-label',
        unchecked = 'biz-radio-unchecked',
        uncheckedHover = 'biz-radio-unchecked-hover',
        checked = 'biz-radio-checked',
        checkedHover = 'biz-radio-checked-hover',
        uncheckedDisabled = 'biz-radio-unchecked-disabled',
        checkedDisabled = 'biz-radio-checked-disabled';

    Radio.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            var title = this.$main.attr('title'),
                id = this.$main.attr('id');
            this.$main.after('<label for="' + id + '">' + title + '</label>').hide();

            /**
             * @property {jQuery} $label `label`元素的$包装
             */
            this.$label = this.$main.next();
            this.$label.addClass(defaultClass);

            //初始状态
            if (this.main.checked) {
                this.$label.addClass(this.main.disabled ? checkedDisabled : checked);
            } else {
                this.$label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
            }

            var self = this;
            this.$label.on('mouseover.bizRadio', function(e) {
                if (!self.main.disabled) {
                    $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('mouseout.bizRadio', function(e) {
                if (!self.main.disabled) {
                    $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('click.bizRadio', function(e) {
                if (!self.main.disabled) {
                    self.$group.bizRadio('uncheck');
                    self.main.checked = true;
                    $(this).attr('class', defaultClass + ' ' + checked + ' ' + checkedHover);
                }
            });
        },

        /**
         * 勾选
         */
        check: function() {
            this.$group.bizRadio('uncheck');
            this.main.checked = true;
            this.$label.attr('class', defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
        },

        /**
         * 取消勾选
         */
        uncheck: function() {
            this.main.checked = false;
            this.$label.attr('class', defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.$label.attr('class', defaultClass + ' ' + (this.main.checked ? checked : unchecked));
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.$label.attr('class', defaultClass + ' ' + (this.main.checked ? checkedDisabled : uncheckedDisabled));
        },

        /**
         * 获取value值
         * @return {String} value值
         */
        val: function() {
            return this.main.value;
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.show();
            this.$label.off('mouseover.bizRadio')
                .off('mouseout.bizRadio')
                .off('click.bizRadio')
                .remove();
        }
    };

    function isRadio(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'input' &&
            elem.getAttribute('type').toLowerCase() === 'radio';
    }

    var dataKey = 'bizRadio';

    $.extend($.fn, {
        bizRadio: function(method, options) {
            var radio;
            switch (method) {
                case 'uncheck':
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio) {
                            radio.uncheck();
                        }
                    });
                    break;
                case 'enable':
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio) {
                            radio.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio) {
                            radio.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio) {
                            radio.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'val':
                    var value;
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if (radio && radio.main.checked) {
                            value = radio.val();
                        }
                    });
                    return value;
                case 'get':
                    var instance;
                    this.each(function() {
                        radio = $(this).data(dataKey);
                        if ((options + '') === radio.main.id) {
                            instance = radio;
                        }
                    });
                    return instance;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isRadio(this)) {
                            $(this).data(dataKey, new Radio(this));
                        }
                    });
            }

            return this;
        }
    });

    return Radio;
});
/**
 * @ignore
 */
define('ui/Checkbox',['require'],function(require) {
    /**
     * Checkbox constructor
     *
     * <iframe width="100%" height="200" src="//jsfiddle.net/bizdevfe/Lcp5mpLt/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} checkbox 目标元素
     */
    function Checkbox(checkbox) {
        if (checkbox instanceof jQuery) {
            if (checkbox.length > 0) {
                checkbox = checkbox[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isCheckbox(checkbox)) {
            return;
        }

        /**
         * @property {HTMLElement} main `input`元素
         */
        this.main = checkbox;

        /**
         * @property {jQuery} $main `input`元素的$包装
         */
        this.$main = $(this.main);

        /**
         * @property {Array} $group 同组选项
         */
        this.$group = $('input[name="' + this.$main.attr('name') + '"]');

        this.init();
    }

    var defaultClass = 'biz-label',
        unchecked = 'biz-checkbox-unchecked',
        uncheckedHover = 'biz-checkbox-unchecked-hover',
        checked = 'biz-checkbox-checked',
        checkedHover = 'biz-checkbox-checked-hover',
        uncheckedDisabled = 'biz-checkbox-unchecked-disabled',
        checkedDisabled = 'biz-checkbox-checked-disabled';

    Checkbox.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            var title = this.$main.attr('title'),
                id = this.$main.attr('id');
            this.$main.after('<label for="' + id + '">' + title + '</label>').hide();

            /**
             * @property {jQuery} $label `label`元素的$包装
             */
            this.$label = this.$main.next();
            this.$label.addClass(defaultClass);

            //初始状态
            if (this.main.checked) {
                this.$label.addClass(this.main.disabled ? checkedDisabled : checked);
            } else {
                this.$label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
            }

            var self = this;
            this.$label.on('mouseover.bizCheckbox', function(e) {
                if (!self.main.disabled) {
                    $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('mouseout.bizCheckbox', function(e) {
                if (!self.main.disabled) {
                    $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('click.bizCheckbox', function(e) {
                if (!self.main.disabled) {
                    if (self.main.checked) { //label的点击先于input的点击
                        $(this).attr('class', defaultClass + ' ' + unchecked + ' ' + uncheckedHover);
                    } else {
                        $(this).attr('class', defaultClass + ' ' + checked + ' ' + checkedHover);
                    }
                }
            });
        },

        /**
         * 勾选
         */
        check: function() {
            this.main.checked = true;
            this.$label.attr('class', defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
        },

        /**
         * 取消勾选
         */
        uncheck: function() {
            this.main.checked = false;
            this.$label.attr('class', defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.$label.attr('class', defaultClass + ' ' + (this.main.checked ? checked : unchecked));
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.$label.attr('class', defaultClass + ' ' + (this.main.checked ? checkedDisabled : uncheckedDisabled));
        },

        /**
         * 获取value值
         * @return {String} value值
         */
        val: function() {
            return this.main.value;
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.show();
            this.$label.off('mouseover.bizCheckbox')
                .off('mouseout.bizCheckbox')
                .off('click.bizCheckbox')
                .remove();
        }
    };

    function isCheckbox(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'input' &&
            elem.getAttribute('type').toLowerCase() === 'checkbox';
    }

    var dataKey = 'bizCheckbox';

    $.extend($.fn, {
        bizCheckbox: function(method, options) {
            var checkbox;
            switch (method) {
                case 'check':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.check();
                        }
                    });
                    break;
                case 'uncheck':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.uncheck();
                        }
                    });
                    break;
                case 'enable':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox) {
                            checkbox.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'val':
                    var values = [];
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if (checkbox && checkbox.main.checked) {
                            values.push(checkbox.val());
                        }
                    });
                    return values.join(',');
                case 'get':
                    var instance;
                    this.each(function() {
                        checkbox = $(this).data(dataKey);
                        if ((options + '') === checkbox.main.id) {
                            instance = checkbox;
                        }
                    });
                    return instance;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isCheckbox(this)) {
                            $(this).data(dataKey, new Checkbox(this));
                        }
                    });
            }

            return this;
        }
    });

    return Checkbox;
});
/**
 * @ignore
 */
define('dep/jquery.selectBox',['require'],function(require) {
    /**
     * SelectBox class.
     *
     * @param {HTMLElement|jQuery} select If it's a jQuery object, we use the first element.
     * @param {Object}             options
     * @constructor
     */
    var SelectBox = function(select, options) {
        if (select instanceof jQuery) {
            if (select.length > 0) {
                select = select[0];
            } else {
                return;
            }
        }

        this.typeTimer = null;
        this.typeSearch = '';
        this.isMac = navigator.platform.match(/mac/i);
        options = 'object' === typeof options ? options : {};
        this.selectElement = select;

        // Disable for iOS devices (their native controls are more suitable for a touch device)
        if (!options.mobile && navigator.userAgent.match(/iPad|iPhone|Android|IEMobile|BlackBerry/i)) {
            return false;
        }

        // Element must be a select control
        if ('select' !== select.tagName.toLowerCase()) {
            return false;
        }

        this.init(options);
    };

    /**
     * @type {String}
     */
    SelectBox.prototype.version = '1.2.0';

    /**
     * @param {Object} options
     *
     * @returns {Boolean}
     */
    SelectBox.prototype.init = function(options) {
        var select = $(this.selectElement);
        if (select.data('selectBox-control')) {
            return false;
        }

        var control = $('<a class="selectBox" />'),
            inline = select.attr('multiple') || parseInt(select.attr('size')) > 1,
            settings = options || {},
            tabIndex = parseInt(select.prop('tabindex')) || 0,
            self = this;

        control
            .width(select.outerWidth())
            .addClass(select.attr('class'))
            .attr('title', select.attr('title') || '')
            .attr('tabindex', tabIndex)
            .css('display', 'inline-block')
            .bind('focus.selectBox', function() {
                if (this !== document.activeElement && document.body !== document.activeElement) {
                    $(document.activeElement).blur();
                }
                if (control.hasClass('selectBox-active')) {
                    return;
                }
                control.addClass('selectBox-active');
                select.trigger('focus');
            })
            .bind('blur.selectBox', function() {
                if (!control.hasClass('selectBox-active')) {
                    return;
                }
                control.removeClass('selectBox-active');
                select.trigger('blur');
            });

        if (!$(window).data('selectBox-bindings')) {
            $(window)
                .data('selectBox-bindings', true)
                .bind('scroll.selectBox', (settings.hideOnWindowScroll) ? this.hideMenus : $.noop)
                .bind('resize.selectBox', this.hideMenus);
        }

        if (select.attr('disabled')) {
            control.addClass('selectBox-disabled');
        }

        // Focus on control when label is clicked
        select.bind('click.selectBox', function(event) {
            control.focus();
            event.preventDefault();
        });

        // Generate control
        if (inline) {
            // Inline controls
            options = this.getOptions('inline');

            control
                .append(options)
                .data('selectBox-options', options).addClass('selectBox-inline selectBox-menuShowing')
                .bind('keydown.selectBox', function(event) {
                    self.handleKeyDown(event);
                })
                .bind('keypress.selectBox', function(event) {
                    self.handleKeyPress(event);
                })
                .bind('mousedown.selectBox', function(event) {
                    if (1 !== event.which) {
                        return;
                    }
                    if ($(event.target).is('A.selectBox-inline')) {
                        event.preventDefault();
                    }
                    if (!control.hasClass('selectBox-focus')) {
                        control.focus();
                    }
                })
                .insertAfter(select);

            // Auto-height based on size attribute
            if (!select[0].style.height) {
                var size = select.attr('size') ? parseInt(select.attr('size')) : 5;
                // Draw a dummy control off-screen, measure, and remove it
                var tmp = control
                    .clone()
                    .removeAttr('id')
                    .css({
                        position: 'absolute',
                        top: '-9999em'
                    })
                    .show()
                    .appendTo('body');
                tmp.find('.selectBox-options').html('<li><a>\u00A0</a></li>');
                var optionHeight = parseInt(tmp.find('.selectBox-options A:first').html('&nbsp;').outerHeight());
                tmp.remove();
                control.height(optionHeight * size);
            }
            this.disableSelection(control);
        } else {
            // Dropdown controls
            var label = $('<span class="selectBox-label" />'),
                arrow = $('<span class="selectBox-arrow" />');

            // Update label
            label.attr('class', this.getLabelClass()).text(this.getLabelText());
            options = this.getOptions('dropdown');
            options.appendTo('BODY');

            control
                .data('selectBox-options', options)
                .addClass('selectBox-dropdown')
                .append(label)
                .append(arrow)
                .bind('mousedown.selectBox', function(event) {
                    if (1 === event.which) {
                        if (control.hasClass('selectBox-menuShowing')) {
                            self.hideMenus();
                        } else {
                            event.stopPropagation();
                            // Webkit fix to prevent premature selection of options
                            options
                                .data('selectBox-down-at-x', event.screenX)
                                .data('selectBox-down-at-y', event.screenY);
                            self.showMenu();
                        }
                    }
                })
                .bind('keydown.selectBox', function(event) {
                    self.handleKeyDown(event);
                })
                .bind('keypress.selectBox', function(event) {
                    self.handleKeyPress(event);
                })
                .bind('open.selectBox', function(event, triggerData) {
                    if (triggerData && triggerData._selectBox === true) {
                        return;
                    }
                    self.showMenu();
                })
                .bind('close.selectBox', function(event, triggerData) {
                    if (triggerData && triggerData._selectBox === true) {
                        return;
                    }
                    self.hideMenus();
                })
                .insertAfter(select);

            // Set label width
            var labelWidth =
                control.width() - arrow.outerWidth() - (parseInt(label.css('paddingLeft')) || 0) - (parseInt(label.css('paddingRight')) || 0);

            label.width(labelWidth);
            this.disableSelection(control);
        }
        // Store data for later use and show the control
        select
            .addClass('selectBox')
            .data('selectBox-control', control)
            .data('selectBox-settings', settings)
            .hide();
    };

    /**
     * @param {String} type 'inline'|'dropdown'
     * @returns {jQuery}
     */
    SelectBox.prototype.getOptions = function(type) {
        var options;
        var select = $(this.selectElement);
        var self = this;
        // Private function to handle recursion in the getOptions function.
        var _getOptions = function(select, options) {
            // Loop through the set in order of element children.
            select.children('OPTION, OPTGROUP').each(function() {
                // If the element is an option, add it to the list.
                if ($(this).is('OPTION')) {
                    // Check for a value in the option found.
                    if ($(this).length > 0) {
                        // Create an option form the found element.
                        self.generateOptions($(this), options);
                    } else {
                        // No option information found, so add an empty.
                        options.append('<li>\u00A0</li>');
                    }
                } else {
                    // If the element is an option group, add the group and call this function on it.
                    var optgroup = $('<li class="selectBox-optgroup" />');
                    optgroup.text($(this).attr('label'));
                    options.append(optgroup);
                    options = _getOptions($(this), options);
                }
            });
            // Return the built strin
            return options;
        };

        switch (type) {
            case 'inline':
                options = $('<ul class="selectBox-options" />');
                options = _getOptions(select, options);
                options
                    .find('A')
                    .bind('mouseover.selectBox', function(event) {
                        self.addHover($(this).parent());
                    })
                    .bind('mouseout.selectBox', function(event) {
                        self.removeHover($(this).parent());
                    })
                    .bind('mousedown.selectBox', function(event) {
                        if (1 !== event.which) {
                            return;
                        }
                        event.preventDefault(); // Prevent options from being "dragged"
                        if (!select.selectBox('control').hasClass('selectBox-active')) {
                            select.selectBox('control').focus();
                        }
                    })
                    .bind('mouseup.selectBox', function(event) {
                        if (1 !== event.which) {
                            return;
                        }
                        self.hideMenus();
                        self.selectOption($(this).parent(), event);
                    });

                this.disableSelection(options);
                return options;
            case 'dropdown':
                options = $('<ul class="selectBox-dropdown-menu selectBox-options" />');
                options = _getOptions(select, options);

                options
                    .data('selectBox-select', select)
                    .css('display', 'none')
                    .appendTo('BODY')
                    .find('A')
                    .bind('mousedown.selectBox', function(event) {
                        if (event.which === 1) {
                            event.preventDefault(); // Prevent options from being "dragged"
                            if (event.screenX === options.data('selectBox-down-at-x') &&
                                event.screenY === options.data('selectBox-down-at-y')) {
                                options.removeData('selectBox-down-at-x').removeData('selectBox-down-at-y');
                                if (/android/i.test(navigator.userAgent.toLowerCase()) &&
                                    /chrome/i.test(navigator.userAgent.toLowerCase())) {
                                    self.selectOption($(this).parent());
                                }
                                self.hideMenus();
                            }
                        }
                    })
                    .bind('mouseup.selectBox', function(event) {
                        if (1 !== event.which) {
                            return;
                        }
                        if (event.screenX === options.data('selectBox-down-at-x') &&
                            event.screenY === options.data('selectBox-down-at-y')) {
                            return;
                        } else {
                            options.removeData('selectBox-down-at-x').removeData('selectBox-down-at-y');
                        }
                        self.selectOption($(this).parent());
                        self.hideMenus();
                    })
                    .bind('mouseover.selectBox', function(event) {
                        self.addHover($(this).parent());
                    })
                    .bind('mouseout.selectBox', function(event) {
                        self.removeHover($(this).parent());
                    });

                // Inherit classes for dropdown menu
                var classes = select.attr('class') || '';
                if ('' !== classes) {
                    classes = classes.split(' ');
                    for (var i = 0; i < classes.length; i++) {
                        options.addClass(classes[i] + '-selectBox-dropdown-menu');
                    }

                }
                this.disableSelection(options);
                return options;
        }
    };

    /**
     * Returns the current class of the selected option.
     *
     * @returns {String}
     */
    SelectBox.prototype.getLabelClass = function() {
        var selected = $(this.selectElement).find('OPTION:selected');
        return ('selectBox-label ' + (selected.attr('class') || '')).replace(/\s+$/, '');
    };

    /**
     * Returns the current label of the selected option.
     *
     * @returns {String}
     */
    SelectBox.prototype.getLabelText = function() {
        var selected = $(this.selectElement).find('OPTION:selected');
        return selected.text() || '\u00A0';
    };

    /**
     * Sets the label.
     * This method uses the getLabelClass() and getLabelText() methods.
     */
    SelectBox.prototype.setLabel = function() {
        var select = $(this.selectElement);
        var control = select.data('selectBox-control');
        if (!control) {
            return;
        }

        control
            .find('.selectBox-label')
            .attr('class', this.getLabelClass())
            .text(this.getLabelText());
    };

    /**
     * Destroys the SelectBox instance and shows the origin select element.
     *
     */
    SelectBox.prototype.destroy = function() {
        var select = $(this.selectElement);
        var control = select.data('selectBox-control');
        if (!control) {
            return;
        }

        var options = control.data('selectBox-options');
        options.remove();
        control.remove();
        select
            .removeClass('selectBox')
            .removeData('selectBox-control')
            .data('selectBox-control', null)
            .removeData('selectBox-settings')
            .data('selectBox-settings', null)
            .show();
    };

    /**
     * Refreshes the option elements.
     */
    SelectBox.prototype.refresh = function() {
        var select = $(this.selectElement),
            control = select.data('selectBox-control'),
            type = control.hasClass('selectBox-dropdown') ? 'dropdown' : 'inline',
            options;

        // Remove old options
        control.data('selectBox-options').remove();

        // Generate new options
        options = this.getOptions(type);
        control.data('selectBox-options', options);

        switch (type) {
            case 'inline':
                control.append(options);
                break;
            case 'dropdown':
                // Update label
                this.setLabel();
                $("BODY").append(options);
                break;
        }

        // Restore opened dropdown state (original menu was trashed)
        if ('dropdown' === type && control.hasClass('selectBox-menuShowing')) {
            this.showMenu();
        }
    };

    /**
     * Shows the dropdown menu.
     */
    SelectBox.prototype.showMenu = function() {
        var self = this,
            select = $(this.selectElement),
            control = select.data('selectBox-control'),
            settings = select.data('selectBox-settings'),
            options = control.data('selectBox-options');

        if (control.hasClass('selectBox-disabled')) {
            return false;
        }

        this.hideMenus();

        // Get top and bottom width of selectBox
        var borderBottomWidth = parseInt(control.css('borderBottomWidth')) || 0;
        var borderTopWidth = parseInt(control.css('borderTopWidth')) || 0;

        // Get proper variables for keeping options in viewport
        var pos = control.offset(),
            topPositionCorrelation = (settings.topPositionCorrelation) ? settings.topPositionCorrelation : 0,
            bottomPositionCorrelation = (settings.bottomPositionCorrelation) ? settings.bottomPositionCorrelation : 0,
            optionsHeight = options.outerHeight(),
            controlHeight = control.outerHeight(),
            maxHeight = parseInt(options.css('max-height')),
            scrollPos = $(window).scrollTop(),
            heightToTop = pos.top - scrollPos,
            heightToBottom = $(window).height() - (heightToTop + controlHeight),
            posTop = (heightToTop > heightToBottom) && (settings.keepInViewport === null ? true : settings.keepInViewport),
            top = posTop ? pos.top - optionsHeight + borderTopWidth + topPositionCorrelation : pos.top + controlHeight - borderBottomWidth - bottomPositionCorrelation;


        // If the height to top and height to bottom are less than the max-height
        if (heightToTop < maxHeight && heightToBottom < maxHeight) {

            // Set max-height and top
            var maxHeightDiff;
            if (posTop) {
                maxHeightDiff = maxHeight - (heightToTop - 5);
                options.css({
                    'max-height': maxHeight - maxHeightDiff + 'px'
                });
                top = top + maxHeightDiff;
            } else {
                maxHeightDiff = maxHeight - (heightToBottom - 5);
                options.css({
                    'max-height': maxHeight - maxHeightDiff + 'px'
                });
            }

        }

        // Save if position is top to options data
        options.data('posTop', posTop);


        // Menu position
        options
            .width(control.innerWidth())
            .css({
                top: top,
                left: control.offset().left
            })
            // Add Top and Bottom class based on position
            .addClass('selectBox-options selectBox-options-' + (posTop ? 'top' : 'bottom'));


        if (select.triggerHandler('beforeopen')) {
            return false;
        }

        var dispatchOpenEvent = function() {
            select.triggerHandler('open', {
                _selectBox: true
            });
        };

        // Show menu
        switch (settings.menuTransition) {
            case 'fade':
                options.fadeIn(settings.menuSpeed, dispatchOpenEvent);
                break;
            case 'slide':
                options.slideDown(settings.menuSpeed, dispatchOpenEvent);
                break;
            default:
                options.show(settings.menuSpeed, dispatchOpenEvent);
                break;
        }

        if (!settings.menuSpeed) {
            dispatchOpenEvent();
        }

        // Center on selected option
        var li = options.find('.selectBox-selected:first');
        this.keepOptionInView(li, true);
        this.addHover(li);
        control.addClass('selectBox-menuShowing selectBox-menuShowing-' + (posTop ? 'top' : 'bottom'));

        $(document).bind('mousedown.selectBox', function(event) {
            if (1 === event.which) {
                if ($(event.target).parents().andSelf().hasClass('selectBox-options')) {
                    return;
                }
                self.hideMenus();
            }
        });
    };

    /**
     * Hides the menu of all instances.
     */
    SelectBox.prototype.hideMenus = function() {
        if ($(".selectBox-dropdown-menu:visible").length === 0) {
            return;
        }

        $(document).unbind('mousedown.selectBox');
        $(".selectBox-dropdown-menu").each(function() {
            var options = $(this),
                select = options.data('selectBox-select'),
                control = select.data('selectBox-control'),
                settings = select.data('selectBox-settings'),
                posTop = options.data('posTop');

            if (select.triggerHandler('beforeclose')) {
                return false;
            }

            var dispatchCloseEvent = function() {
                select.triggerHandler('close', {
                    _selectBox: true
                });
            };
            if (settings) {
                switch (settings.menuTransition) {
                    case 'fade':
                        options.fadeOut(settings.menuSpeed, dispatchCloseEvent);
                        break;
                    case 'slide':
                        options.slideUp(settings.menuSpeed, dispatchCloseEvent);
                        break;
                    default:
                        options.hide(settings.menuSpeed, dispatchCloseEvent);
                        break;
                }
                if (!settings.menuSpeed) {
                    dispatchCloseEvent();
                }
                control.removeClass('selectBox-menuShowing selectBox-menuShowing-' + (posTop ? 'top' : 'bottom'));
            } else {
                $(this).hide();
                $(this).triggerHandler('close', {
                    _selectBox: true
                });
                $(this).removeClass('selectBox-menuShowing selectBox-menuShowing-' + (posTop ? 'top' : 'bottom'));
            }

            options.css('max-height', '');
            //Remove Top or Bottom class based on position
            options.removeClass('selectBox-options-' + (posTop ? 'top' : 'bottom'));
            options.data('posTop', false);
        });
    };

    /**
     * Selects an option.
     *
     * @param {HTMLElement} li
     * @param {DOMEvent}    event
     * @returns {Boolean}
     */
    SelectBox.prototype.selectOption = function(li, event) {
        var select = $(this.selectElement);
        li = $(li);

        var control = select.data('selectBox-control'),
            settings = select.data('selectBox-settings');

        if (control.hasClass('selectBox-disabled')) {
            return false;
        }

        if (0 === li.length || li.hasClass('selectBox-disabled')) {
            return false;
        }

        if (select.attr('multiple')) {
            // If event.shiftKey is true, this will select all options between li and the last li selected
            if (event.shiftKey && control.data('selectBox-last-selected')) {
                li.toggleClass('selectBox-selected');
                var affectedOptions;
                if (li.index() > control.data('selectBox-last-selected').index()) {
                    affectedOptions = li
                        .siblings()
                        .slice(control.data('selectBox-last-selected').index(), li.index());
                } else {
                    affectedOptions = li
                        .siblings()
                        .slice(li.index(), control.data('selectBox-last-selected').index());
                }
                affectedOptions = affectedOptions.not('.selectBox-optgroup, .selectBox-disabled');
                if (li.hasClass('selectBox-selected')) {
                    affectedOptions.addClass('selectBox-selected');
                } else {
                    affectedOptions.removeClass('selectBox-selected');
                }
            } else if ((this.isMac && event.metaKey) || (!this.isMac && event.ctrlKey)) {
                li.toggleClass('selectBox-selected');
            } else {
                li.siblings().removeClass('selectBox-selected');
                li.addClass('selectBox-selected');
            }
        } else {
            li.siblings().removeClass('selectBox-selected');
            li.addClass('selectBox-selected');
        }

        if (control.hasClass('selectBox-dropdown')) {
            control.find('.selectBox-label').text(li.text());
        }

        // Update original control's value
        var i = 0,
            selection = [];
        if (select.attr('multiple')) {
            control.find('.selectBox-selected A').each(function() {
                selection[i++] = $(this).attr('rel');
            });
        } else {
            selection = li.find('A').attr('rel');
        }

        // Remember most recently selected item
        control.data('selectBox-last-selected', li);

        // Change callback
        if (select.val() !== selection) {
            select.val(selection);
            this.setLabel();
            select.trigger('change');
        }

        return true;
    };

    /**
     * Adds the hover class.
     *
     * @param {HTMLElement} li
     */
    SelectBox.prototype.addHover = function(li) {
        li = $(li);
        var select = $(this.selectElement),
            control = select.data('selectBox-control'),
            options = control.data('selectBox-options');

        options.find('.selectBox-hover').removeClass('selectBox-hover');
        li.addClass('selectBox-hover');
    };

    /**
     * Returns the original HTML select element.
     *
     * @returns {HTMLElement}
     */
    SelectBox.prototype.getSelectElement = function() {
        return this.selectElement;
    };

    /**
     * Remove the hover class.
     *
     * @param {HTMLElement} li
     */
    SelectBox.prototype.removeHover = function(li) {
        li = $(li);
        var select = $(this.selectElement),
            control = select.data('selectBox-control'),
            options = control.data('selectBox-options');

        options.find('.selectBox-hover').removeClass('selectBox-hover');
    };

    /**
     * Checks if the widget is in the view.
     *
     * @param {jQuery}      li
     * @param {Boolean}     center
     */
    SelectBox.prototype.keepOptionInView = function(li, center) {
        if (!li || li.length === 0) {
            return;
        }

        var select = $(this.selectElement),
            control = select.data('selectBox-control'),
            options = control.data('selectBox-options'),
            scrollBox = control.hasClass('selectBox-dropdown') ? options : options.parent(),
            top = parseInt(li.offset().top - scrollBox.position().top),
            bottom = parseInt(top + li.outerHeight());

        if (center) {
            scrollBox.scrollTop(li.offset().top - scrollBox.offset().top + scrollBox.scrollTop() -
                (scrollBox.height() / 2));
        } else {
            if (top < 0) {
                scrollBox.scrollTop(li.offset().top - scrollBox.offset().top + scrollBox.scrollTop());
            }
            if (bottom > scrollBox.height()) {
                scrollBox.scrollTop((li.offset().top + li.outerHeight()) - scrollBox.offset().top +
                    scrollBox.scrollTop() - scrollBox.height());
            }
        }
    };

    /**
     * Handles the keyDown event.
     * Handles open/close and arrow key functionality
     *
     * @param {DOMEvent}    event
     */
    SelectBox.prototype.handleKeyDown = function(event) {
        var select = $(this.selectElement),
            control = select.data('selectBox-control'),
            options = control.data('selectBox-options'),
            settings = select.data('selectBox-settings'),
            totalOptions = 0,
            i = 0;

        if (control.hasClass('selectBox-disabled')) {
            return;
        }

        switch (event.keyCode) {
            case 8:
                // backspace
                event.preventDefault();
                this.typeSearch = '';
                break;
            case 9:
                // tab
            case 27:
                // esc
                this.hideMenus();
                this.removeHover();
                break;
            case 13:
                // enter
                if (control.hasClass('selectBox-menuShowing')) {
                    this.selectOption(options.find('LI.selectBox-hover:first'), event);
                    if (control.hasClass('selectBox-dropdown')) {
                        this.hideMenus();
                    }
                } else {
                    this.showMenu();
                }
                break;
            case 38:
                // up
            case 37:
                // left
                event.preventDefault();
                if (control.hasClass('selectBox-menuShowing')) {
                    var prev = options.find('.selectBox-hover').prev('LI');
                    totalOptions = options.find('LI:not(.selectBox-optgroup)').length;
                    i = 0;
                    while (prev.length === 0 || prev.hasClass('selectBox-disabled') ||
                        prev.hasClass('selectBox-optgroup')) {
                        prev = prev.prev('LI');
                        if (prev.length === 0) {
                            if (settings.loopOptions) {
                                prev = options.find('LI:last');
                            } else {
                                prev = options.find('LI:first');
                            }
                        }
                        if (++i >= totalOptions) {
                            break;
                        }
                    }
                    this.addHover(prev);
                    this.selectOption(prev, event);
                    this.keepOptionInView(prev);
                } else {
                    this.showMenu();
                }
                break;
            case 40:
                // down
            case 39:
                // right
                event.preventDefault();
                if (control.hasClass('selectBox-menuShowing')) {
                    var next = options.find('.selectBox-hover').next('LI');
                    totalOptions = options.find('LI:not(.selectBox-optgroup)').length;
                    i = 0;
                    while (0 === next.length || next.hasClass('selectBox-disabled') ||
                        next.hasClass('selectBox-optgroup')) {
                        next = next.next('LI');
                        if (next.length === 0) {
                            if (settings.loopOptions) {
                                next = options.find('LI:first');
                            } else {
                                next = options.find('LI:last');
                            }
                        }
                        if (++i >= totalOptions) {
                            break;
                        }
                    }
                    this.addHover(next);
                    this.selectOption(next, event);
                    this.keepOptionInView(next);
                } else {
                    this.showMenu();
                }
                break;
        }
    };

    /**
     * Handles the keyPress event.
     * Handles type-to-find functionality
     *
     * @param {DOMEvent}    event
     */
    SelectBox.prototype.handleKeyPress = function(event) {
        var select = $(this.selectElement),
            control = select.data('selectBox-control'),
            options = control.data('selectBox-options'),
            self = this;

        if (control.hasClass('selectBox-disabled')) {
            return;
        }

        switch (event.keyCode) {
            case 9:
                // tab
            case 27:
                // esc
            case 13:
                // enter
            case 38:
                // up
            case 37:
                // left
            case 40:
                // down
            case 39:
                // right
                // Don't interfere with the keydown event!
                break;
            default:
                // Type to find
                if (!control.hasClass('selectBox-menuShowing')) {
                    this.showMenu();
                }
                event.preventDefault();
                clearTimeout(this.typeTimer);
                this.typeSearch += String.fromCharCode(event.charCode || event.keyCode);
                options.find('A').each(function() {
                    if ($(this).text().substr(0, self.typeSearch.length).toLowerCase() === self.typeSearch.toLowerCase()) {
                        self.addHover($(this).parent());
                        self.selectOption($(this).parent(), event);
                        self.keepOptionInView($(this).parent());
                        return false;
                    }
                });
                // Clear after a brief pause
                this.typeTimer = setTimeout(function() {
                    self.typeSearch = '';
                }, 1000);
                break;
        }
    };

    /**
     * Enables the selectBox.
     */
    SelectBox.prototype.enable = function() {
        var select = $(this.selectElement);
        select.prop('disabled', false);
        var control = select.data('selectBox-control');
        if (!control) {
            return;
        }
        control.removeClass('selectBox-disabled');
    };

    /**
     * Disables the selectBox.
     */
    SelectBox.prototype.disable = function() {
        var select = $(this.selectElement);
        select.prop('disabled', true);
        var control = select.data('selectBox-control');
        if (!control) {
            return;
        }
        control.addClass('selectBox-disabled');
    };

    /**
     * Sets the current value.
     *
     * @param {String}      value
     */
    SelectBox.prototype.setValue = function(value) {
        var select = $(this.selectElement);
        select.val(value);
        value = select.val(); // IE9's select would be null if it was set with a non-exist options value

        if (null === value) { // So check it here and set it with the first option's value if possible
            value = select.children().first().val();
            select.val(value);
        }

        var control = select.data('selectBox-control');
        if (!control) {
            return;
        }

        var settings = select.data('selectBox-settings'),
            options = control.data('selectBox-options');

        // Update label
        this.setLabel();

        // Update control values
        options.find('.selectBox-selected').removeClass('selectBox-selected');
        options.find('A').each(function() {
            if (typeof(value) === 'object') {
                for (var i = 0; i < value.length; i++) {
                    if ($(this).attr('rel') == value[i]) {
                        $(this).parent().addClass('selectBox-selected');
                    }
                }
            } else {
                if ($(this).attr('rel') == value) {
                    $(this).parent().addClass('selectBox-selected');
                }
            }
        });

        if (settings.change) {
            settings.change.call(select);
        }
    };

    /**
     * Disables the selection.
     *
     * @param {*} selector
     */
    SelectBox.prototype.disableSelection = function(selector) {
        $(selector).css('MozUserSelect', 'none').bind('selectstart', function(event) {
            event.preventDefault();
        });
    };

    /**
     * Generates the options.
     *
     * @param {jQuery} self
     * @param {jQuery} options
     */
    SelectBox.prototype.generateOptions = function(self, options) {
        var li = $('<li />'),
            a = $('<a />');
        li.addClass(self.attr('class'));
        li.data(self.data());
        a.attr('rel', self.val()).text(self.text());
        li.append(a);
        if (self.attr('disabled')) {
            li.addClass('selectBox-disabled');
        }
        if (self.attr('selected')) {
            li.addClass('selectBox-selected');
        }
        options.append(li);
    };

    /**
     * Extends the jQuery.fn object.
     */
    $.extend($.fn, {

        /**
         * Sets the option elements.
         *
         * @param {String|Object} options
         */
        setOptions: function(options) {
            var select = $(this),
                control = select.data('selectBox-control');


            switch (typeof(options)) {
                case 'string':
                    select.html(options);
                    break;
                case 'object':
                    select.html('');
                    for (var i in options) {
                        if (options[i] === null) {
                            continue;
                        }
                        if (typeof(options[i]) === 'object') {
                            var optgroup = $('<optgroup label="' + i + '" />');
                            for (var j in options[i]) {
                                optgroup.append('<option value="' + j + '">' + options[i][j] + '</option>');
                            }
                            select.append(optgroup);
                        } else {
                            var option = $('<option value="' + i + '">' + options[i] + '</option>');
                            select.append(option);
                        }
                    }
                    break;
            }

            if (control) {
                // Refresh the control
                $(this).selectBox('refresh');
                // Remove old options

            }
        },

        selectBox: function(method, options) {
            var selectBox;

            switch (method) {
                case 'control':
                    return $(this).data('selectBox-control');
                case 'settings':
                    if (!options) {
                        return $(this).data('selectBox-settings');
                    }
                    $(this).each(function() {
                        $(this).data('selectBox-settings', $.extend(true, $(this).data('selectBox-settings'), options));
                    });
                    break;
                case 'options':
                    // Getter

                    if (undefined === options) {
                        return $(this).data('selectBox-control').data('selectBox-options');
                    }

                    // Setter
                    $(this).each(function() {
                        $(this).setOptions(options);
                    });
                    break;
                case 'value':
                    // Empty string is a valid value
                    if (undefined === options) {
                        return $(this).val();
                    }
                    $(this).each(function() {
                        selectBox = $(this).data('selectBox');
                        if (selectBox) {
                            selectBox.setValue(options);
                        }
                    });
                    break;
                case 'refresh':
                    $(this).each(function() {
                        selectBox = $(this).data('selectBox');
                        if (selectBox) {
                            selectBox.refresh();
                        }
                    });
                    break;
                case 'enable':
                    $(this).each(function() {
                        selectBox = $(this).data('selectBox');
                        if (selectBox) {
                            selectBox.enable(this);
                        }
                    });
                    break;
                case 'disable':
                    $(this).each(function() {
                        selectBox = $(this).data('selectBox');
                        if (selectBox) {
                            selectBox.disable();
                        }
                    });
                    break;
                case 'destroy':
                    $(this).each(function() {
                        selectBox = $(this).data('selectBox');
                        if (selectBox) {
                            selectBox.destroy();
                            $(this).data('selectBox', null);
                        }
                    });
                    break;
                case 'instance':
                    return $(this).data('selectBox');
                default:
                    $(this).each(function(idx, select) {
                        if (!$(select).data('selectBox')) {
                            $(select).data('selectBox', new SelectBox(select, method));
                        }
                    });
                    break;
            }
            return $(this);
        }
    });

    return SelectBox;
});
/**
 * @ignore
 */
define('ui/Select',['require','dep/jquery.selectBox'],function(require) {
    var SelectBox = require('dep/jquery.selectBox');

    /**
     * Select constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/bsjn9hpw/3/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} select 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.loop] 上下键是否循环选项
     */
    function Select(select, options) {
        options = $.extend({}, options || {});

        this.instance = new SelectBox($(select), {
            mobile: true,
            loopOptions: options.loop
        });

        /**
         * @property {HTMLElement} main `select`元素
         */
        this.main = this.instance.selectElement;

        /**
         * @property {jQuery} $main `select`元素的$包装
         */
        this.$main = $(this.main);
    }

    Select.prototype = {
        /**
         * 激活
         */
        enable: function() {
            this.instance.enable();
        },

        /**
         * 禁用
         */
        disable: function() {
            this.instance.disable();
        },

        /**
         * 刷新
         */
        refresh: function() {
            this.instance.refresh();
        },

        /**
         * 获取/设置选中值
         * @param {String} [value] 参数
         * @return {String}
         */
        val: function(value) {
            if (undefined === value) { //get
                return this.$main.val();
            }
            this.instance.setValue(value); //set
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.instance.destroy();
        }
    };

    function isSelect(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'select';
    }

    var dataKey = 'bizSelect';

    $.extend($.fn, {
        bizSelect: function(method, options) {
            var select;
            switch (method) {
                case 'enable':
                    this.each(function() {
                        select = $(this).data(dataKey);
                        if (select) {
                            select.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        select = $(this).data(dataKey);
                        if (select) {
                            select.disable();
                        }
                    });
                    break;
                case 'refresh':
                    this.each(function() {
                        select = $(this).data(dataKey);
                        if (select) {
                            select.refresh();
                        }
                    });
                    break;
                case 'val':
                    if (undefined === options) { //get
                        return $(this).val();
                    }
                    this.each(function() { //set
                        select = $(this).data(dataKey);
                        if (select) {
                            select.val(options);
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        select = $(this).data(dataKey);
                        if (select) {
                            select.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isSelect(this)) {
                            $(this).data(dataKey, new Select(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Select;
});
/**
 * @ignore
 */
define('ui/Dialog',['require'],function(require) {
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
            }).show();
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
            this.$container.next().hide();
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
/**
 * @ignore
 */
define('ui/Panel',['require'],function(require) {
    /**
     * Panel constructor
     *
     * <iframe width="100%" height="300" src="//jsfiddle.net/bizdevfe/4govkm96/embedded/result,js,html/" frameborder="0"></iframe>
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
/**
 * @ignore
 */
define('ui/Tooltip',['require'],function(require) {
    var tooltip;
    var arrow;
    var arrowWidth;
    var arrowHeight;
    var content;
    var win;

    function getState(el, options) {
        var s = {};
        var elementHeight = el.outerHeight();
        var elementWidth = el.outerWidth();
        var offset = el.offset();
        s.height = tooltip.outerHeight(true);
        s.width = tooltip.outerWidth(true);
        s.offset = {};
        s.offset.top = offset.top;
        s.offset.left = offset.left;
        s.offset.right = s.offset.left + elementWidth;
        s.offset.bottom = s.offset.top + elementHeight;
        s.offset.hCenter = s.offset.left + Math.floor(elementWidth / 2);
        s.offset.vCenter = s.offset.top + Math.floor(elementHeight / 2);
        s.css = {};
        s.on = {};
        s.off = {};
        s.arrow = {};
        return s;
    }

    function checkBounds(s, direction, margin, slide) {
        var bound, alternate;
        margin = parseInt(margin);
        slide = parseInt(slide);
        switch (direction) {
            case 'top':
                bound = win.scrollTop();
                if (s.offset.top - s.height - margin - slide < bound) {
                    alternate = 'bottom';
                }
                s.on.top = s.offset.top - s.height - margin;
                s.off.top = s.on.top + slide;
                s.css.top = s.on.top - slide;
                s.css.left = getCenter(s, true);
                break;
            case 'left':
                bound = win.scrollLeft();
                if (s.offset.left - s.width - margin - slide < bound) {
                    alternate = 'right';
                }
                s.on.left = s.offset.left - s.width - margin;
                s.off.left = s.on.left + slide;
                s.css.top = getCenter(s, false);
                s.css.left = s.on.left - slide;
                break;
            case 'bottom':
                bound = win.scrollTop() + win.height();
                if (s.offset.bottom + s.height + margin + slide > bound) {
                    alternate = 'top';
                }
                s.on.top = s.offset.bottom + margin;
                s.off.top = s.offset.bottom - slide + margin;
                s.css.top = s.on.top + slide;
                s.css.left = getCenter(s, true);
                break;
            case 'right':
                bound = win.scrollLeft() + win.width();
                if (s.offset.right + s.width + margin + slide > bound) {
                    alternate = 'left';
                }
                s.on.left = s.offset.right + margin;
                s.off.left = s.on.left - slide;
                s.css.left = s.on.left + slide;
                s.css.top = getCenter(s, false);
                break;
        }
        if (alternate && !s.over) {
            s.over = true;
            checkBounds(s, alternate, margin, slide);
        } else {
            s.direction = direction;
            getArrowOffset(s, direction);
            checkSlide(s, direction);
        }
    }

    function checkSlide(s, dir) {
        var offset;
        if (dir == 'top' || dir == 'bottom') {
            offset = win.scrollLeft() - s.css.left + 5;
            if (offset > 0) {
                s.css.left += Math.abs(offset);
                s.arrow.left -= offset;
            }
            offset = (s.css.left + s.width) - (win.scrollLeft() + win.width()) + 5;
            if (offset > 0) {
                s.css.left -= Math.abs(offset);
                s.arrow.left += offset;
            }
        } else if (dir == 'left' || dir == 'right') {
            offset = win.scrollTop() - s.css.top + 5;
            if (offset > 0) {
                s.css.top += Math.abs(offset);
                s.arrow.top -= offset;
            }
            offset = (s.css.top + s.height) - (win.scrollTop() + win.height()) + 5;
            if (offset > 0) {
                s.css.top -= Math.abs(offset);
                s.arrow.top += offset;
            }
        }
    }

    function getArrowOffset(s, dir) {
        if (dir == 'left' || dir == 'right') {
            s.arrow.top = Math.floor((s.height / 2) - (arrowHeight / 2));
        } else {
            s.arrow.left = Math.floor((s.width / 2) - (arrowWidth / 2));
        }
        s.arrow[getInverseDirection(dir)] = -arrowHeight;
    }

    function getInverseDirection(dir) {
        switch (dir) {
            case 'top':
                return 'bottom';
            case 'bottom':
                return 'top';
            case 'left':
                return 'right';
            case 'right':
                return 'left';
        }
    }

    function getCenter(s, horizontal) {
        if (horizontal) {
            return s.offset.hCenter + (-s.width / 2);
        } else {
            return s.offset.vCenter + (-s.height / 2);
        }
    }

    function animateTooltip(s, options, el, fn) {
        var color = getDefault('color', options, el, 'white');
        var duration = getDefault('duration', options, el, 150);
        tooltip.attr('class', color + ' ' + s.direction);
        tooltip.stop(true, true).css(s.css);
        arrow.attr('style', '').css(s.arrow);
        tooltip.animate(s.on, {
            duration: duration,
            queue: false,
            complete: fn
        });
        tooltip.fadeIn(duration);
    }

    function animateTooltipOut(s, options, el, fn) {
        var duration = getDefault('duration', options, el, 100);
        tooltip.animate(s.off, {
            duration: duration,
            queue: false,
            complete: fn
        });
        tooltip.fadeOut(duration);
    }

    function unescapeHTML(html) {
        if (/&/.test(html)) {
            html = $('<p/>').html(html).text();
        }
        return html;
    }

    function setContent(el, title) {
        var html, ref;
        try {
            ref = $(document.body).find(title);
        } catch (e) {
            // May throw a malfolmed selector error
        }
        if (ref && ref.length > 0) {
            html = ref.html();
        } else {
            html = unescapeHTML(title);
        }
        content.html(html);
    }

    function getDefault(name, options, el, defaultValue) {
        return or(options[name], el.data('tooltip-' + name), defaultValue);
    }

    function or() {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) {
                return arguments[i];
            }
        }
    }

    $.extend($.fn, {
        bizTooltip: function(options) {
            options = options || {};
            this.each(function() {
                var el = $(this);
                var title = el.attr('title');
                if (!title) {
                    return;
                }
                var animating = false;
                var state;
                var timer;
                el.unbind('mouseenter').mouseenter(function() {
                    var delay = getDefault('delay', options, el, 300);
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        var margin = getDefault('margin', options, el, 20);
                        var slide = getDefault('slide', options, el, 10);
                        var direction = getDefault('direction', options, el, 'top');
                        var t = el.attr('title');
                        if (t) {
                            title = t;
                        }
                        el.removeAttr('title');
                        setContent(el, options.html || title);
                        state = getState(el, options);
                        checkBounds(state, direction, margin, slide);
                        animateTooltip(state, options, el, function() {
                            animating = false;
                        });
                        animating = true;
                    }, delay);
                });
                el.unbind('mouseleave').mouseleave(function() {
                    clearTimeout(timer);
                    if (!state) {
                        return;
                    }
                    if (animating) {
                        tooltip.fadeOut(100, function() {
                            animating = false;
                        });
                    } else {
                        animateTooltipOut(state, options, el, function() {
                            animating = false;
                        });
                    }
                    state = null;
                    animating = true;
                });
            });
        }
    });

    /**
     * Tooltip method
     *
     * <iframe width="100%" height="200" src="//jsfiddle.net/bizdevfe/x6s36byf/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @param {Object|String} options 参数
     * @param {String} options.color 颜色
     * @param {String} options.direction 位置
     * @param {Number} options.margin 边距
     */
    function Tooltip(options) {
        if (options !== 'destroy') {
            if ($('#biz-tooltip').length === 0) {
                tooltip = $('<div id="biz-tooltip" />').appendTo(document.body).css('position', 'absolute').hide();
                arrow = $('<div class="arrow" />').appendTo(tooltip);
                content = $('<div class="content" />').appendTo(tooltip);
                win = $(window);
                arrowWidth = arrow.width();
                arrowHeight = arrow.height();
                $('[title]').bizTooltip(options);
            }
        } else {
            $('#biz-tooltip').remove();
            $('[title]').each(function() {
                $(this).unbind('mouseenter').unbind('mouseleave');
            });
        }
    }

    return Tooltip;
});
/**
 * @ignore
 */
define('ui/Tab',['require'],function(require) {
    /**
     * Tab constructor
     *
     * <iframe width="100%" height="220" src="//jsfiddle.net/bizdevfe/9t1nzb07/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} tab 目标元素
     * @param {Object} [options] 参数
     * @param {String} [options.event] 切换tab事件
     * @param {Function} [options.onChange] 切换回调(data, event)
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
            this.contents = this.$main.children('div').children('div').hide();
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
                        }, e);
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
/**
 * @ignore
 */
define('dep/jquery.simplePagination',['require'],function(require) {
    var methods = {
        init: function(options) {
            var o = $.extend({
                items: 1,
                itemsOnPage: 1,
                pages: 0,
                displayedPages: 5,
                edges: 2,
                currentPage: 0,
                hrefTextPrefix: '#page-',
                hrefTextSuffix: '',
                prevText: 'Prev',
                nextText: 'Next',
                ellipseText: '&hellip;',
                cssStyle: 'light-theme',
                listStyle: '',
                labelMap: [],
                selectOnClick: true,
                nextAtFront: false,
                invertPageOrder: false,
                useStartEdge: true,
                useEndEdge: true,
                onPageClick: function(pageNumber, event) {
                    // Callback triggered when a page is clicked
                    // Page number is given as an optional parameter
                },
                onInit: function() {
                    // Callback triggered immediately after initialization
                }
            }, options || {});

            var self = this;

            o.pages = o.pages ? o.pages : Math.ceil(o.items / o.itemsOnPage) ? Math.ceil(o.items / o.itemsOnPage) : 1;
            if (o.currentPage) {
                o.currentPage = o.currentPage - 1;
            } else {
                o.currentPage = !o.invertPageOrder ? 0 : o.pages - 1;
            }
            o.halfDisplayed = o.displayedPages / 2;

            this.each(function() {
                self.addClass(o.cssStyle + ' simple-pagination').data('pagination', o);
                methods._draw.call(self);
            });

            o.onInit();

            return this;
        },

        selectPage: function(page) {
            methods._selectPage.call(this, page - 1);
            return this;
        },

        prevPage: function() {
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

        nextPage: function() {
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

        getPagesCount: function() {
            return this.data('pagination').pages;
        },

        setPagesCount: function(count) {
            this.data('pagination').pages = count;
        },

        getCurrentPage: function() {
            return this.data('pagination').currentPage + 1;
        },

        destroy: function() {
            this.empty();
            return this;
        },

        drawPage: function(page) {
            var o = this.data('pagination');
            o.currentPage = page - 1;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        redraw: function() {
            methods._draw.call(this);
            return this;
        },

        disable: function() {
            var o = this.data('pagination');
            o.disabled = true;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        enable: function() {
            var o = this.data('pagination');
            o.disabled = false;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        updateItems: function(newItems) {
            var o = this.data('pagination');
            o.items = newItems;
            o.pages = methods._getPages(o);
            this.data('pagination', o);
            methods._draw.call(this);
        },

        updateItemsOnPage: function(itemsOnPage) {
            var o = this.data('pagination');
            o.itemsOnPage = itemsOnPage;
            o.pages = methods._getPages(o);
            this.data('pagination', o);
            return this;
        },

        getItemsOnPage: function() {
            return this.data('pagination').itemsOnPage;
        },

        _draw: function() {
            var o = this.data('pagination'),
                interval = methods._getInterval(o),
                i,
                tagName,
                begin,
                end;

            methods.destroy.call(this);

            tagName = (typeof this.prop === 'function') ? this.prop('tagName') : this.attr('tagName');

            var $panel = tagName === 'UL' ? this : $('<ul' + (o.listStyle ? ' class="' + o.listStyle + '"' : '') + '></ul>').appendTo(this);

            // Generate Prev link
            if (o.prevText) {
                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage - 1 : o.currentPage + 1, {
                    text: o.prevText,
                    classes: 'prev'
                });
            }

            // Generate Next link (if option set for at front)
            if (o.nextText && o.nextAtFront) {
                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, {
                    text: o.nextText,
                    classes: 'next'
                });
            }

            // Generate start edges
            if (!o.invertPageOrder) {
                if (interval.start > 0 && o.edges > 0) {
                    if (o.useStartEdge) {
                        end = Math.min(o.edges, interval.start);
                        for (i = 0; i < end; i++) {
                            methods._appendItem.call(this, i);
                        }
                    }
                    if (o.edges < interval.start && (interval.start - o.edges != 1)) {
                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                    } else if (interval.start - o.edges == 1) {
                        methods._appendItem.call(this, o.edges);
                    }
                }
            } else {
                if (interval.end < o.pages && o.edges > 0) {
                    if (o.useStartEdge) {
                        begin = Math.max(o.pages - o.edges, interval.end);
                        for (i = o.pages - 1; i >= begin; i--) {
                            methods._appendItem.call(this, i);
                        }
                    }

                    if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                    } else if (o.pages - o.edges - interval.end == 1) {
                        methods._appendItem.call(this, interval.end);
                    }
                }
            }

            // Generate interval links
            if (!o.invertPageOrder) {
                for (i = interval.start; i < interval.end; i++) {
                    methods._appendItem.call(this, i);
                }
            } else {
                for (i = interval.end - 1; i >= interval.start; i--) {
                    methods._appendItem.call(this, i);
                }
            }

            // Generate end edges
            if (!o.invertPageOrder) {
                if (interval.end < o.pages && o.edges > 0) {
                    if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                    } else if (o.pages - o.edges - interval.end == 1) {
                        methods._appendItem.call(this, interval.end);
                    }
                    if (o.useEndEdge) {
                        begin = Math.max(o.pages - o.edges, interval.end);
                        for (i = begin; i < o.pages; i++) {
                            methods._appendItem.call(this, i);
                        }
                    }
                }
            } else {
                if (interval.start > 0 && o.edges > 0) {
                    if (o.edges < interval.start && (interval.start - o.edges != 1)) {
                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                    } else if (interval.start - o.edges == 1) {
                        methods._appendItem.call(this, o.edges);
                    }

                    if (o.useEndEdge) {
                        end = Math.min(o.edges, interval.start);
                        for (i = end - 1; i >= 0; i--) {
                            methods._appendItem.call(this, i);
                        }
                    }
                }
            }

            // Generate Next link (unless option is set for at front)
            if (o.nextText && !o.nextAtFront) {
                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, {
                    text: o.nextText,
                    classes: 'next'
                });
            }
        },

        _getPages: function(o) {
            var pages = Math.ceil(o.items / o.itemsOnPage);
            return pages || 1;
        },

        _getInterval: function(o) {
            return {
                start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, (o.pages - o.displayedPages)), 0) : 0),
                end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed, o.pages) : Math.min(o.displayedPages, o.pages))
            };
        },

        _appendItem: function(pageIndex, opts) {
            var self = this,
                options, $link, o = self.data('pagination'),
                $linkWrapper = $('<li></li>'),
                $ul = self.find('ul');

            pageIndex = pageIndex < 0 ? 0 : (pageIndex < o.pages ? pageIndex : o.pages - 1);

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
                $link = $('<span class="current">' + (options.text) + '</span>');
            } else {
                //$link = $('<a href="' + o.hrefTextPrefix + (pageIndex + 1) + o.hrefTextSuffix + '" class="page-link">' + (options.text) + '</a>');
                $link = $('<a href="javascript:void(0)" class="page-link">' + (options.text) + '</a>');
                $link.click(function(event) {
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

        _selectPage: function(pageIndex, event) {
            var o = this.data('pagination');
            o.currentPage = pageIndex;
            if (o.selectOnClick) {
                methods._draw.call(this);
            }
            return o.onPageClick(pageIndex + 1, event);
        }

    };

    $.fn.pagination = function(method) {

        // Method calling logic
        if (methods[method] && method.charAt(0) != '_') {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pagination');
        }

    };

    return methods;
});
/**
 * @ignore
 */
define('ui/Page',['require','dep/jquery.simplePagination'],function(require) {
    var Pagination = require('dep/jquery.simplePagination');

    /**
     * Page constructor
     *
     * <iframe width="100%" height="300" src="//jsfiddle.net/bizdevfe/b73bLbqx/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} page 目标元素
     * @param {Object} [options] 参数
     * @param {Number} [options.pageSize] 每页条数
     * @param {Number} [options.pageNumber] 当前页码
     * @param {Number} [options.totalNumber] 总条数
     * @param {String} [options.prevText] 前一页文字
     * @param {String} [options.nextText] 后一页文字
     * @param {Function} [options.onPageClick] 页码点击回调(pageNumber, event)
     */
    function Page(page, options) {
        options = $.extend({}, options || {});

        this.instance = Pagination.init.call($(page), {
            itemsOnPage: options.pageSize,
            currentPage: options.pageNumber,
            items: options.totalNumber,
            prevText: options.prevText || '◀',
            nextText: options.nextText || '▶',
            onPageClick: options.onPageClick
        });
    }

    Page.prototype = {
        /**
         * 设置每页条数
         * @param {Number} pageSize 每页条数
         */
        setPageSize: function(pageSize) {
            this.instance.pagination('updateItemsOnPage', pageSize);
            this.instance.pagination('drawPage', 1);
        },

        /**
         * 设置当前页码
         * @param {Number} pageNumber 当前页码
         * @fires onPageClick
         */
        setPageNumber: function(pageNumber) {
            this.instance.pagination('selectPage', pageNumber);
        },

        /**
         * 设置总条数
         * @param {Number} totalNumber 总条数
         */
        setTotalNumber: function(totalNumber) {
            this.instance.pagination('updateItems', totalNumber);
            this.instance.pagination('drawPage', 1);
        },

        /**
         * 获取当前页码
         * @return {Number} 当前页码
         */
        getPageNumber: function() {
            return this.instance.pagination('getCurrentPage');
        },

        /**
         * 获取页数
         * @return {Number} 页数
         */
        getPageCount: function() {
            return this.instance.pagination('getPagesCount');
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.instance.pagination('destroy');
        }
    };

    function isPage(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
    }

    var dataKey = 'bizPage';

    $.extend($.fn, {
        bizPage: function(method, options) {
            var page;
            switch (method) {
                case 'setPageSize':
                    this.each(function() {
                        page = $(this).data(dataKey);
                        if (page) {
                            page.setPageSize(options);
                        }
                    });
                    break;
                case 'setPageNumber':
                    this.each(function() {
                        page = $(this).data(dataKey);
                        if (page) {
                            page.setPageNumber(options);
                        }
                    });
                    break;
                case 'setTotalNumber':
                    this.each(function() {
                        page = $(this).data(dataKey);
                        if (page) {
                            page.setTotalNumber(options);
                        }
                    });
                    break;
                case 'getPageNumber':
                    return this.data(dataKey).getPageNumber();
                case 'getPageCount':
                    return this.data(dataKey).getPageCount();
                case 'destroy':
                    this.each(function() {
                        page = $(this).data(dataKey);
                        if (page) {
                            page.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isPage(this)) {
                            $(this).data(dataKey, new Page(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Page;
});
/**
 * @ignore
 */
define('dep/jquery.jstree',['require'],function(require) {
    /*
     * if using jslint please allow for the jQuery global and use following options:
     * jslint: browser: true, ass: true, bitwise: true, continue: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, white: true
     */

    // prevent another load? maybe there is a better way?
    if ($.jstree) {
        return;
    }

    /**
     * ### jsTree core functionality
     */

    // internal variables
    var instance_counter = 0,
        ccp_node = false,
        ccp_mode = false,
        ccp_inst = false,
        themes_loaded = [],
        src = $('script:last').attr('src'),
        document = window.document, // local variable is always faster to access then a global
        _node = document.createElement('LI'),
        _temp1, _temp2;

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

    /**
     * holds all jstree related functions and variables, including the actual class and methods to create, access and manipulate instances.
     * @name $.jstree
     */
    $.jstree = {
        /**
         * specifies the jstree version in use
         * @name $.jstree.version
         */
        version: '3.1.1',
        /**
         * holds all the default options used when creating new instances
         * @name $.jstree.defaults
         */
        defaults: {
            /**
             * configure which plugins will be active on an instance. Should be an array of strings, where each element is a plugin name. The default is `[]`
             * @name $.jstree.defaults.plugins
             */
            plugins: []
        },
        /**
         * stores all loaded jstree plugins (used internally)
         * @name $.jstree.plugins
         */
        plugins: {},
        path: src && src.indexOf('/') !== -1 ? src.replace(/\/[^\/]+$/, '') : '',
        idregex: /[\\:&!^|()\[\]<>@*'+~#";.,=\- \/${}%?`]/g
    };
    /**
     * creates a jstree instance
     * @name $.jstree.create(el [, options])
     * @param {DOMElement|jQuery|String} el the element to create the instance on, can be jQuery extended or a selector
     * @param {Object} options options for this instance (extends `$.jstree.defaults`)
     * @return {jsTree} the new instance
     */
    $.jstree.create = function(el, options) {
        var tmp = new $.jstree.core(++instance_counter),
            opt = options;
        options = $.extend(true, {}, $.jstree.defaults, options);
        if (opt && opt.plugins) {
            options.plugins = opt.plugins;
        }
        $.each(options.plugins, function(i, k) {
            if (i !== 'core') {
                tmp = tmp.plugin(k, options[k]);
            }
        });
        $(el).data('jstree', tmp);
        tmp.init(el, options);
        return tmp;
    };
    /**
     * remove all traces of jstree from the DOM and destroy all instances
     * @name $.jstree.destroy()
     */
    $.jstree.destroy = function() {
        $('.jstree:jstree').jstree('destroy');
        $(document).off('.jstree');
    };
    /**
     * the jstree class constructor, used only internally
     * @private
     * @name $.jstree.core(id)
     * @param {Number} id this instance's index
     */
    $.jstree.core = function(id) {
        this._id = id;
        this._cnt = 0;
        this._wrk = null;
        this._data = {
            core: {
                themes: {
                    name: false,
                    dots: false,
                    icons: false
                },
                selected: [],
                last_error: {},
                working: false,
                worker_queue: [],
                focused: null
            }
        };
    };
    /**
     * get a reference to an existing instance
     *
     * __Examples__
     *
     *	// provided a container with an ID of "tree", and a nested node with an ID of "branch"
     *	// all of there will return the same instance
     *	$.jstree.reference('tree');
     *	$.jstree.reference('#tree');
     *	$.jstree.reference($('#tree'));
     *	$.jstree.reference(document.getElementByID('tree'));
     *	$.jstree.reference('branch');
     *	$.jstree.reference('#branch');
     *	$.jstree.reference($('#branch'));
     *	$.jstree.reference(document.getElementByID('branch'));
     *
     * @name $.jstree.reference(needle)
     * @param {DOMElement|jQuery|String} needle
     * @return {jsTree|null} the instance or `null` if not found
     */
    $.jstree.reference = function(needle) {
        var tmp = null,
            obj = null;
        if (needle && needle.id && (!needle.tagName || !needle.nodeType)) {
            needle = needle.id;
        }

        if (!obj || !obj.length) {
            try {
                obj = $(needle);
            } catch (ignore) {}
        }
        if (!obj || !obj.length) {
            try {
                obj = $('#' + needle.replace($.jstree.idregex, '\\$&'));
            } catch (ignore) {}
        }
        if (obj && obj.length && (obj = obj.closest('.jstree')).length && (obj = obj.data('jstree'))) {
            tmp = obj;
        } else {
            $('.jstree').each(function() {
                var inst = $(this).data('jstree');
                if (inst && inst._model.data[needle]) {
                    tmp = inst;
                    return false;
                }
            });
        }
        return tmp;
    };
    /**
     * Create an instance, get an instance or invoke a command on a instance.
     *
     * If there is no instance associated with the current node a new one is created and `arg` is used to extend `$.jstree.defaults` for this new instance. There would be no return value (chaining is not broken).
     *
     * If there is an existing instance and `arg` is a string the command specified by `arg` is executed on the instance, with any additional arguments passed to the function. If the function returns a value it will be returned (chaining could break depending on function).
     *
     * If there is an existing instance and `arg` is not a string the instance itself is returned (similar to `$.jstree.reference`).
     *
     * In any other case - nothing is returned and chaining is not broken.
     *
     * __Examples__
     *
     *	$('#tree1').jstree(); // creates an instance
     *	$('#tree2').jstree({ plugins : [] }); // create an instance with some options
     *	$('#tree1').jstree('open_node', '#branch_1'); // call a method on an existing instance, passing additional arguments
     *	$('#tree2').jstree(); // get an existing instance (or create an instance)
     *	$('#tree2').jstree(true); // get an existing instance (will not create new instance)
     *	$('#branch_1').jstree().select_node('#branch_1'); // get an instance (using a nested element and call a method)
     *
     * @name $().jstree([arg])
     * @param {String|Object} arg
     * @return {Mixed}
     */
    $.fn.jstree = function(arg) {
        // check for string argument
        var is_method = (typeof arg === 'string'),
            args = Array.prototype.slice.call(arguments, 1),
            result = null;
        if (arg === true && !this.length) {
            return false;
        }
        this.each(function() {
            // get the instance (if there is one) and method (if it exists)
            var instance = $.jstree.reference(this),
                method = is_method && instance ? instance[arg] : null;
            // if calling a method, and method is available - execute on the instance
            result = is_method && method ?
                method.apply(instance, args) :
                null;
            // if there is no instance and no method is being called - create one
            if (!instance && !is_method && (arg === undefined || $.isPlainObject(arg))) {
                $.jstree.create(this, arg);
            }
            // if there is an instance and no method is called - return the instance
            if ((instance && !is_method) || arg === true) {
                result = instance || false;
            }
            // if there was a method call which returned a result - break and return the value
            if (result !== null && result !== undefined) {
                return false;
            }
        });
        // if there was a method call with a valid return value - return that, otherwise continue the chain
        return result !== null && result !== undefined ?
            result : this;
    };
    /**
     * used to find elements containing an instance
     *
     * __Examples__
     *
     *	$('div:jstree').each(function () {
     *		$(this).jstree('destroy');
     *	});
     *
     * @name $(':jstree')
     * @return {jQuery}
     */
    $.expr[':'].jstree = $.expr.createPseudo(function(search) {
        return function(a) {
            return $(a).hasClass('jstree') &&
                $(a).data('jstree') !== undefined;
        };
    });

    /**
     * stores all defaults for the core
     * @name $.jstree.defaults.core
     */
    $.jstree.defaults.core = {
        /**
         * data configuration
         *
         * If left as `false` the HTML inside the jstree container element is used to populate the tree (that should be an unordered list with list items).
         *
         * You can also pass in a HTML string or a JSON array here.
         *
         * It is possible to pass in a standard jQuery-like AJAX config and jstree will automatically determine if the response is JSON or HTML and use that to populate the tree.
         * In addition to the standard jQuery ajax options here you can suppy functions for `data` and `url`, the functions will be run in the current instance's scope and a param will be passed indicating which node is being loaded, the return value of those functions will be used.
         *
         * The last option is to specify a function, that function will receive the node being loaded as argument and a second param which is a function which should be called with the result.
         *
         * __Examples__
         *
         *	// AJAX
         *	$('#tree').jstree({
         *		'core' : {
         *			'data' : {
         *				'url' : '/get/children/',
         *				'data' : function (node) {
         *					return { 'id' : node.id };
         *				}
         *			}
         *		});
         *
         *	// direct data
         *	$('#tree').jstree({
         *		'core' : {
         *			'data' : [
         *				'Simple root node',
         *				{
         *					'id' : 'node_2',
         *					'text' : 'Root node with options',
         *					'state' : { 'opened' : true, 'selected' : true },
         *					'children' : [ { 'text' : 'Child 1' }, 'Child 2']
         *				}
         *			]
         *		});
         *
         *	// function
         *	$('#tree').jstree({
         *		'core' : {
         *			'data' : function (obj, callback) {
         *				callback.call(this, ['Root 1', 'Root 2']);
         *			}
         *		});
         *
         * @name $.jstree.defaults.core.data
         */
        data: false,
        /**
         * configure the various strings used throughout the tree
         *
         * You can use an object where the key is the string you need to replace and the value is your replacement.
         * Another option is to specify a function which will be called with an argument of the needed string and should return the replacement.
         * If left as `false` no replacement is made.
         *
         * __Examples__
         *
         *	$('#tree').jstree({
         *		'core' : {
         *			'strings' : {
         *				'Loading ...' : 'Please wait ...'
         *			}
         *		}
         *	});
         *
         * @name $.jstree.defaults.core.strings
         */
        strings: false,
        /**
         * determines what happens when a user tries to modify the structure of the tree
         * If left as `false` all operations like create, rename, delete, move or copy are prevented.
         * You can set this to `true` to allow all interactions or use a function to have better control.
         *
         * __Examples__
         *
         *	$('#tree').jstree({
         *		'core' : {
         *			'check_callback' : function (operation, node, node_parent, node_position, more) {
         *				// operation can be 'create_node', 'rename_node', 'delete_node', 'move_node' or 'copy_node'
         *				// in case of 'rename_node' node_position is filled with the new node name
         *				return operation === 'rename_node' ? true : false;
         *			}
         *		}
         *	});
         *
         * @name $.jstree.defaults.core.check_callback
         */
        check_callback: false,
        /**
         * a callback called with a single object parameter in the instance's scope when something goes wrong (operation prevented, ajax failed, etc)
         * @name $.jstree.defaults.core.error
         */
        error: $.noop,
        /**
         * the open / close animation duration in milliseconds - set this to `false` to disable the animation (default is `200`)
         * @name $.jstree.defaults.core.animation
         */
        animation: 200,
        /**
         * a boolean indicating if multiple nodes can be selected
         * @name $.jstree.defaults.core.multiple
         */
        multiple: true,
        /**
         * theme configuration object
         * @name $.jstree.defaults.core.themes
         */
        themes: {
            /**
             * the name of the theme to use (if left as `false` the default theme is used)
             * @name $.jstree.defaults.core.themes.name
             */
            name: false,
            /**
             * the URL of the theme's CSS file, leave this as `false` if you have manually included the theme CSS (recommended). You can set this to `true` too which will try to autoload the theme.
             * @name $.jstree.defaults.core.themes.url
             */
            url: false,
            /**
             * the location of all jstree themes - only used if `url` is set to `true`
             * @name $.jstree.defaults.core.themes.dir
             */
            dir: false,
            /**
             * a boolean indicating if connecting dots are shown
             * @name $.jstree.defaults.core.themes.dots
             */
            dots: true,
            /**
             * a boolean indicating if node icons are shown
             * @name $.jstree.defaults.core.themes.icons
             */
            icons: true,
            /**
             * a boolean indicating if the tree background is striped
             * @name $.jstree.defaults.core.themes.stripes
             */
            stripes: false,
            /**
             * a string (or boolean `false`) specifying the theme variant to use (if the theme supports variants)
             * @name $.jstree.defaults.core.themes.variant
             */
            variant: false,
            /**
             * a boolean specifying if a reponsive version of the theme should kick in on smaller screens (if the theme supports it). Defaults to `false`.
             * @name $.jstree.defaults.core.themes.responsive
             */
            responsive: false
        },
        /**
         * if left as `true` all parents of all selected nodes will be opened once the tree loads (so that all selected nodes are visible to the user)
         * @name $.jstree.defaults.core.expand_selected_onload
         */
        expand_selected_onload: true,
        /**
         * if left as `true` web workers will be used to parse incoming JSON data where possible, so that the UI will not be blocked by large requests. Workers are however about 30% slower. Defaults to `true`
         * @name $.jstree.defaults.core.worker
         */
        worker: true,
        /**
         * Force node text to plain text (and escape HTML). Defaults to `false`
         * @name $.jstree.defaults.core.force_text
         */
        force_text: false,
        /**
         * Should the node should be toggled if the text is double clicked . Defaults to `true`
         * @name $.jstree.defaults.core.dblclick_toggle
         */
        dblclick_toggle: true
    };
    $.jstree.core.prototype = {
        /**
         * used to decorate an instance with a plugin. Used internally.
         * @private
         * @name plugin(deco [, opts])
         * @param  {String} deco the plugin to decorate with
         * @param  {Object} opts options for the plugin
         * @return {jsTree}
         */
        plugin: function(deco, opts) {
            var Child = $.jstree.plugins[deco];
            if (Child) {
                this._data[deco] = {};
                Child.prototype = this;
                return new Child(opts, this);
            }
            return this;
        },
        /**
         * initialize the instance. Used internally.
         * @private
         * @name init(el, optons)
         * @param {DOMElement|jQuery|String} el the element we are transforming
         * @param {Object} options options for this instance
         * @trigger init.jstree, loading.jstree, loaded.jstree, ready.jstree, changed.jstree
         */
        init: function(el, options) {
            this._model = {
                data: {
                    '#': {
                        id: '#',
                        parent: null,
                        parents: [],
                        children: [],
                        children_d: [],
                        state: {
                            loaded: false
                        }
                    }
                },
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

            this.element = $(el).addClass('jstree jstree-' + this._id);
            this.settings = options;

            this._data.core.ready = false;
            this._data.core.loaded = false;
            this._data.core.rtl = (this.element.css("direction") === "rtl");
            this.element[this._data.core.rtl ? 'addClass' : 'removeClass']("jstree-rtl");
            this.element.attr('role', 'tree');
            if (this.settings.core.multiple) {
                this.element.attr('aria-multiselectable', true);
            }
            if (!this.element.attr('tabindex')) {
                this.element.attr('tabindex', '0');
            }

            this.bind();
            /**
             * triggered after all events are bound
             * @event
             * @name init.jstree
             */
            this.trigger("init");

            this._data.core.original_container_html = this.element.find(" > ul > li").clone(true);
            this._data.core.original_container_html
                .find("li").addBack()
                .contents().filter(function() {
                    return this.nodeType === 3 && (!this.nodeValue || /^\s+$/.test(this.nodeValue));
                })
                .remove();
            this.element.html("<" + "ul class='jstree-container-ul jstree-children' role='group'><" + "li id='j" + this._id + "_loading' class='jstree-initial-node jstree-loading jstree-leaf jstree-last' role='tree-item'><i class='jstree-icon jstree-ocl'></i><" + "a class='jstree-anchor' href='#'><i class='jstree-icon jstree-themeicon-hidden'></i>" + this.get_string("Loading ...") + "</a></li></ul>");
            this.element.attr('aria-activedescendant', 'j' + this._id + '_loading');
            this._data.core.li_height = this.get_container_ul().children("li").first().height() || 24;
            /**
             * triggered after the loading text is shown and before loading starts
             * @event
             * @name loading.jstree
             */
            this.trigger("loading");
            this.load_node('#');
        },
        /**
         * destroy an instance
         * @name destroy()
         * @param  {Boolean} keep_html if not set to `true` the container will be emptied, otherwise the current DOM elements will be kept intact
         */
        destroy: function(keep_html) {
            if (this._wrk) {
                try {
                    window.URL.revokeObjectURL(this._wrk);
                    this._wrk = null;
                } catch (ignore) {}
            }
            if (!keep_html) {
                this.element.empty();
            }
            this.teardown();
        },
        /**
         * part of the destroying of an instance. Used internally.
         * @private
         * @name teardown()
         */
        teardown: function() {
            this.unbind();
            this.element
                .removeClass('jstree')
                .removeData('jstree')
                .find("[class^='jstree']")
                .addBack()
                .attr("class", function() {
                    return this.className.replace(/jstree[^ ]*|$/ig, '');
                });
            this.element = null;
        },
        /**
         * bind all events. Used internally.
         * @private
         * @name bind()
         */
        bind: function() {
            var word = '',
                tout = null,
                was_click = 0;
            this.element
                .on("dblclick.jstree", function() {
                    if (document.selection && document.selection.empty) {
                        document.selection.empty();
                    } else {
                        if (window.getSelection) {
                            var sel = window.getSelection();
                            try {
                                sel.removeAllRanges();
                                sel.collapse();
                            } catch (ignore) {}
                        }
                    }
                })
                .on("mousedown.jstree", $.proxy(function(e) {
                    if (e.target === this.element[0]) {
                        e.preventDefault(); // prevent losing focus when clicking scroll arrows (FF, Chrome)
                        was_click = +(new Date()); // ie does not allow to prevent losing focus
                    }
                }, this))
                .on("mousedown.jstree", ".jstree-ocl", function(e) {
                    e.preventDefault(); // prevent any node inside from losing focus when clicking the open/close icon
                })
                .on("click.jstree", ".jstree-ocl", $.proxy(function(e) {
                    this.toggle_node(e.target);
                }, this))
                .on("dblclick.jstree", ".jstree-anchor", $.proxy(function(e) {
                    if (this.settings.core.dblclick_toggle) {
                        this.toggle_node(e.target);
                    }
                }, this))
                .on("click.jstree", ".jstree-anchor", $.proxy(function(e) {
                    e.preventDefault();
                    if (e.currentTarget !== document.activeElement) {
                        $(e.currentTarget).focus();
                    }
                    this.activate_node(e.currentTarget, e);
                }, this))
                .on('keydown.jstree', '.jstree-anchor', $.proxy(function(e) {
                    if (e.target.tagName === "INPUT") {
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
                        case 32: // aria defines space only with Ctrl
                            if (e.ctrlKey) {
                                e.type = "click";
                                $(e.currentTarget).trigger(e);
                            }
                            break;
                        case 13: // enter
                            e.type = "click";
                            $(e.currentTarget).trigger(e);
                            break;
                        case 37: // right
                            e.preventDefault();
                            if (this.is_open(e.currentTarget)) {
                                this.close_node(e.currentTarget);
                            } else {
                                o = this.get_parent(e.currentTarget);
                                if (o && o.id !== '#') {
                                    this.get_node(o, true).children('.jstree-anchor').focus();
                                }
                            }
                            break;
                        case 38: // up
                            e.preventDefault();
                            o = this.get_prev_dom(e.currentTarget);
                            if (o && o.length) {
                                o.children('.jstree-anchor').focus();
                            }
                            break;
                        case 39: // left
                            e.preventDefault();
                            if (this.is_closed(e.currentTarget)) {
                                this.open_node(e.currentTarget, function(o) {
                                    this.get_node(o, true).children('.jstree-anchor').focus();
                                });
                            } else if (this.is_open(e.currentTarget)) {
                                o = this.get_node(e.currentTarget, true).children('.jstree-children')[0];
                                if (o) {
                                    $(this._firstChild(o)).children('.jstree-anchor').focus();
                                }
                            }
                            break;
                        case 40: // down
                            e.preventDefault();
                            o = this.get_next_dom(e.currentTarget);
                            if (o && o.length) {
                                o.children('.jstree-anchor').focus();
                            }
                            break;
                        case 106: // aria defines * on numpad as open_all - not very common
                            this.open_all();
                            break;
                        case 36: // home
                            e.preventDefault();
                            o = this._firstChild(this.get_container_ul()[0]);
                            if (o) {
                                $(o).children('.jstree-anchor').filter(':visible').focus();
                            }
                            break;
                        case 35: // end
                            e.preventDefault();
                            this.element.find('.jstree-anchor').filter(':visible').last().focus();
                            break;
                            /*
							// delete
							case 46:
								e.preventDefault();
								o = this.get_node(e.currentTarget);
								if(o && o.id && o.id !== '#') {
									o = this.is_selected(o) ? this.get_selected() : o;
									this.delete_node(o);
								}
								break;
							// f2
							case 113:
								e.preventDefault();
								o = this.get_node(e.currentTarget);
								if(o && o.id && o.id !== '#') {
									// this.edit(o);
								}
								break;
							default:
								// console.log(e.which);
								break;
							*/
                    }
                }, this))
                .on("load_node.jstree", $.proxy(function(e, data) {
                    if (data.status) {
                        if (data.node.id === '#' && !this._data.core.loaded) {
                            this._data.core.loaded = true;
                            if (this._firstChild(this.get_container_ul()[0])) {
                                this.element.attr('aria-activedescendant', this._firstChild(this.get_container_ul()[0]).id);
                            }
                            /**
                             * triggered after the root node is loaded for the first time
                             * @event
                             * @name loaded.jstree
                             */
                            this.trigger("loaded");
                        }
                        if (!this._data.core.ready) {
                            setTimeout($.proxy(function() {
                                if (this.element && !this.get_container_ul().find('.jstree-loading').length) {
                                    this._data.core.ready = true;
                                    if (this._data.core.selected.length) {
                                        if (this.settings.core.expand_selected_onload) {
                                            var tmp = [],
                                                i, j;
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
                                    /**
                                     * triggered after all nodes are finished loading
                                     * @event
                                     * @name ready.jstree
                                     */
                                    this.trigger("ready");
                                }
                            }, this), 0);
                        }
                    }
                }, this))
                // quick searching when the tree is focused
                .on('keypress.jstree', $.proxy(function(e) {
                    if (e.target.tagName === "INPUT") {
                        return true;
                    }
                    if (tout) {
                        clearTimeout(tout);
                    }
                    tout = setTimeout(function() {
                        word = '';
                    }, 500);

                    var chr = String.fromCharCode(e.which).toLowerCase(),
                        col = this.element.find('.jstree-anchor').filter(':visible'),
                        ind = col.index(document.activeElement) || 0,
                        end = false;
                    word += chr;

                    // match for whole word from current node down (including the current node)
                    if (word.length > 1) {
                        col.slice(ind).each($.proxy(function(i, v) {
                            if ($(v).text().toLowerCase().indexOf(word) === 0) {
                                $(v).focus();
                                end = true;
                                return false;
                            }
                        }, this));
                        if (end) {
                            return;
                        }

                        // match for whole word from the beginning of the tree
                        col.slice(0, ind).each($.proxy(function(i, v) {
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
                    // list nodes that start with that letter (only if word consists of a single char)
                    if (new RegExp('^' + chr + '+$').test(word)) {
                        // search for the next node starting with that letter
                        col.slice(ind + 1).each($.proxy(function(i, v) {
                            if ($(v).text().toLowerCase().charAt(0) === chr) {
                                $(v).focus();
                                end = true;
                                return false;
                            }
                        }, this));
                        if (end) {
                            return;
                        }

                        // search from the beginning
                        col.slice(0, ind + 1).each($.proxy(function(i, v) {
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
                }, this))
                // THEME RELATED
                .on("init.jstree", $.proxy(function() {
                    var s = this.settings.core.themes;
                    this._data.core.themes.dots = s.dots;
                    this._data.core.themes.stripes = s.stripes;
                    this._data.core.themes.icons = s.icons;
                    this.set_theme(s.name || "default", s.url);
                    this.set_theme_variant(s.variant);
                }, this))
                .on("loading.jstree", $.proxy(function() {
                    this[this._data.core.themes.dots ? "show_dots" : "hide_dots"]();
                    this[this._data.core.themes.icons ? "show_icons" : "hide_icons"]();
                    this[this._data.core.themes.stripes ? "show_stripes" : "hide_stripes"]();
                }, this))
                .on('blur.jstree', '.jstree-anchor', $.proxy(function(e) {
                    this._data.core.focused = null;
                    $(e.currentTarget).filter('.jstree-hovered').mouseleave();
                    this.element.attr('tabindex', '0');
                }, this))
                .on('focus.jstree', '.jstree-anchor', $.proxy(function(e) {
                    var tmp = this.get_node(e.currentTarget);
                    if (tmp && tmp.id) {
                        this._data.core.focused = tmp.id;
                    }
                    this.element.find('.jstree-hovered').not(e.currentTarget).mouseleave();
                    $(e.currentTarget).mouseenter();
                    this.element.attr('tabindex', '-1');
                }, this))
                .on('focus.jstree', $.proxy(function() {
                    if (+(new Date()) - was_click > 500 && !this._data.core.focused) {
                        was_click = 0;
                        var act = this.get_node(this.element.attr('aria-activedescendant'), true);
                        if (act) {
                            act.find('> .jstree-anchor').focus();
                        }
                    }
                }, this))
                .on('mouseenter.jstree', '.jstree-anchor', $.proxy(function(e) {
                    this.hover_node(e.currentTarget);
                }, this))
                .on('mouseleave.jstree', '.jstree-anchor', $.proxy(function(e) {
                    this.dehover_node(e.currentTarget);
                }, this));
        },
        /**
         * part of the destroying of an instance. Used internally.
         * @private
         * @name unbind()
         */
        unbind: function() {
            this.element.off('.jstree');
            $(document).off('.jstree-' + this._id);
        },
        /**
         * trigger an event. Used internally.
         * @private
         * @name trigger(ev [, data])
         * @param  {String} ev the name of the event to trigger
         * @param  {Object} data additional data to pass with the event
         */
        trigger: function(ev, data) {
            if (!data) {
                data = {};
            }
            data.instance = this;
            this.element.triggerHandler(ev.replace('.jstree', '') + '.jstree', data);
        },
        /**
         * returns the jQuery extended instance container
         * @name get_container()
         * @return {jQuery}
         */
        get_container: function() {
            return this.element;
        },
        /**
         * returns the jQuery extended main UL node inside the instance container. Used internally.
         * @private
         * @name get_container_ul()
         * @return {jQuery}
         */
        get_container_ul: function() {
            return this.element.children(".jstree-children").first();
        },
        /**
         * gets string replacements (localization). Used internally.
         * @private
         * @name get_string(key)
         * @param  {String} key
         * @return {String}
         */
        get_string: function(key) {
            var a = this.settings.core.strings;
            if ($.isFunction(a)) {
                return a.call(this, key);
            }
            if (a && a[key]) {
                return a[key];
            }
            return key;
        },
        /**
         * gets the first child of a DOM node. Used internally.
         * @private
         * @name _firstChild(dom)
         * @param  {DOMElement} dom
         * @return {DOMElement}
         */
        _firstChild: function(dom) {
            dom = dom ? dom.firstChild : null;
            while (dom !== null && dom.nodeType !== 1) {
                dom = dom.nextSibling;
            }
            return dom;
        },
        /**
         * gets the next sibling of a DOM node. Used internally.
         * @private
         * @name _nextSibling(dom)
         * @param  {DOMElement} dom
         * @return {DOMElement}
         */
        _nextSibling: function(dom) {
            dom = dom ? dom.nextSibling : null;
            while (dom !== null && dom.nodeType !== 1) {
                dom = dom.nextSibling;
            }
            return dom;
        },
        /**
         * gets the previous sibling of a DOM node. Used internally.
         * @private
         * @name _previousSibling(dom)
         * @param  {DOMElement} dom
         * @return {DOMElement}
         */
        _previousSibling: function(dom) {
            dom = dom ? dom.previousSibling : null;
            while (dom !== null && dom.nodeType !== 1) {
                dom = dom.previousSibling;
            }
            return dom;
        },
        /**
         * get the JSON representation of a node (or the actual jQuery extended DOM node) by using any input (child DOM element, ID string, selector, etc)
         * @name get_node(obj [, as_dom])
         * @param  {mixed} obj
         * @param  {Boolean} as_dom
         * @return {Object|jQuery}
         */
        get_node: function(obj, as_dom) {
            if (obj && obj.id) {
                obj = obj.id;
            }
            var dom;
            try {
                if (this._model.data[obj]) {
                    obj = this._model.data[obj];
                } else if (typeof obj === "string" && this._model.data[obj.replace(/^#/, '')]) {
                    obj = this._model.data[obj.replace(/^#/, '')];
                } else if (typeof obj === "string" && (dom = $('#' + obj.replace($.jstree.idregex, '\\$&'), this.element)).length && this._model.data[dom.closest('.jstree-node').attr('id')]) {
                    obj = this._model.data[dom.closest('.jstree-node').attr('id')];
                } else if ((dom = $(obj, this.element)).length && this._model.data[dom.closest('.jstree-node').attr('id')]) {
                    obj = this._model.data[dom.closest('.jstree-node').attr('id')];
                } else if ((dom = $(obj, this.element)).length && dom.hasClass('jstree')) {
                    obj = this._model.data['#'];
                } else {
                    return false;
                }

                if (as_dom) {
                    obj = obj.id === '#' ? this.element : $('#' + obj.id.replace($.jstree.idregex, '\\$&'), this.element);
                }
                return obj;
            } catch (ex) {
                return false;
            }
        },
        /**
         * get the path to a node, either consisting of node texts, or of node IDs, optionally glued together (otherwise an array)
         * @name get_path(obj [, glue, ids])
         * @param  {mixed} obj the node
         * @param  {String} glue if you want the path as a string - pass the glue here (for example '/'), if a falsy value is supplied here, an array is returned
         * @param  {Boolean} ids if set to true build the path using ID, otherwise node text is used
         * @return {mixed}
         */
        get_path: function(obj, glue, ids) {
            obj = obj.parents ? obj : this.get_node(obj);
            if (!obj || obj.id === '#' || !obj.parents) {
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
        /**
         * get the next visible node that is below the `obj` node. If `strict` is set to `true` only sibling nodes are returned.
         * @name get_next_dom(obj [, strict])
         * @param  {mixed} obj
         * @param  {Boolean} strict
         * @return {jQuery}
         */
        get_next_dom: function(obj, strict) {
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
            if (obj.hasClass("jstree-open")) {
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
            return obj.parentsUntil(".jstree", ".jstree-node").nextAll(".jstree-node:visible").first();
        },
        /**
         * get the previous visible node that is above the `obj` node. If `strict` is set to `true` only sibling nodes are returned.
         * @name get_prev_dom(obj [, strict])
         * @param  {mixed} obj
         * @param  {Boolean} strict
         * @return {jQuery}
         */
        get_prev_dom: function(obj, strict) {
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
                while (obj.hasClass("jstree-open")) {
                    obj = obj.children(".jstree-children").first().children(".jstree-node:visible:last");
                }
                return obj;
            }
            tmp = obj[0].parentNode.parentNode;
            return tmp && tmp.className && tmp.className.indexOf('jstree-node') !== -1 ? $(tmp) : false;
        },
        /**
         * get the parent ID of a node
         * @name get_parent(obj)
         * @param  {mixed} obj
         * @return {String}
         */
        get_parent: function(obj) {
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            return obj.parent;
        },
        /**
         * get a jQuery collection of all the children of a node (node must be rendered)
         * @name get_children_dom(obj)
         * @param  {mixed} obj
         * @return {jQuery}
         */
        get_children_dom: function(obj) {
            obj = this.get_node(obj, true);
            if (obj[0] === this.element[0]) {
                return this.get_container_ul().children(".jstree-node");
            }
            if (!obj || !obj.length) {
                return false;
            }
            return obj.children(".jstree-children").children(".jstree-node");
        },
        /**
         * checks if a node has children
         * @name is_parent(obj)
         * @param  {mixed} obj
         * @return {Boolean}
         */
        is_parent: function(obj) {
            obj = this.get_node(obj);
            return obj && (obj.state.loaded === false || obj.children.length > 0);
        },
        /**
         * checks if a node is loaded (its children are available)
         * @name is_loaded(obj)
         * @param  {mixed} obj
         * @return {Boolean}
         */
        is_loaded: function(obj) {
            obj = this.get_node(obj);
            return obj && obj.state.loaded;
        },
        /**
         * check if a node is currently loading (fetching children)
         * @name is_loading(obj)
         * @param  {mixed} obj
         * @return {Boolean}
         */
        is_loading: function(obj) {
            obj = this.get_node(obj);
            return obj && obj.state && obj.state.loading;
        },
        /**
         * check if a node is opened
         * @name is_open(obj)
         * @param  {mixed} obj
         * @return {Boolean}
         */
        is_open: function(obj) {
            obj = this.get_node(obj);
            return obj && obj.state.opened;
        },
        /**
         * check if a node is in a closed state
         * @name is_closed(obj)
         * @param  {mixed} obj
         * @return {Boolean}
         */
        is_closed: function(obj) {
            obj = this.get_node(obj);
            return obj && this.is_parent(obj) && !obj.state.opened;
        },
        /**
         * check if a node has no children
         * @name is_leaf(obj)
         * @param  {mixed} obj
         * @return {Boolean}
         */
        is_leaf: function(obj) {
            return !this.is_parent(obj);
        },
        /**
         * loads a node (fetches its children using the `core.data` setting). Multiple nodes can be passed to by using an array.
         * @name load_node(obj [, callback])
         * @param  {mixed} obj
         * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives two arguments - the node and a boolean status
         * @return {Boolean}
         * @trigger load_node.jstree
         */
        load_node: function(obj, callback) {
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
            // if(obj.state.loading) { } // the node is already loading - just wait for it to load and invoke callback? but if called implicitly it should be loaded again?
            if (obj.state.loaded) {
                obj.state.loaded = false;
                for (k = 0, l = obj.children_d.length; k < l; k++) {
                    for (i = 0, j = obj.parents.length; i < j; i++) {
                        this._model.data[obj.parents[i]].children_d = $.vakata.array_remove_item(this._model.data[obj.parents[i]].children_d, obj.children_d[k]);
                    }
                    if (this._model.data[obj.children_d[k]].state.selected) {
                        c = true;
                        this._data.core.selected = $.vakata.array_remove_item(this._data.core.selected, obj.children_d[k]);
                    }
                    delete this._model.data[obj.children_d[k]];
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
            this.get_node(obj, true).addClass("jstree-loading").attr('aria-busy', true);
            this._load_node(obj, $.proxy(function(status) {
                obj = this._model.data[obj.id];
                obj.state.loading = false;
                obj.state.loaded = status;
                obj.state.failed = !obj.state.loaded;
                var dom = this.get_node(obj, true);
                if (obj.state.loaded && !obj.children.length && dom && dom.length && !dom.hasClass('jstree-leaf')) {
                    dom.removeClass('jstree-closed jstree-open').addClass('jstree-leaf');
                }
                dom.removeClass("jstree-loading").attr('aria-busy', false);
                /**
                 * triggered after a node is loaded
                 * @event
                 * @name load_node.jstree
                 * @param {Object} node the node that was loading
                 * @param {Boolean} status was the node loaded successfully
                 */
                this.trigger('load_node', {
                    "node": obj,
                    "status": status
                });
                if (callback) {
                    callback.call(this, obj, status);
                }
            }, this));
            return true;
        },
        /**
         * load an array of nodes (will also load unavailable nodes as soon as the appear in the structure). Used internally.
         * @private
         * @name _load_nodes(nodes [, callback])
         * @param  {array} nodes
         * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives one argument - the array passed to _load_nodes
         */
        _load_nodes: function(nodes, callback, is_callback) {
            var r = true,
                c = function() {
                    this._load_nodes(nodes, callback, true);
                },
                m = this._model.data,
                i, j, tmp = [];
            for (i = 0, j = nodes.length; i < j; i++) {
                if (m[nodes[i]] && ((!m[nodes[i]].state.loaded && !m[nodes[i]].state.failed) || !is_callback)) {
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
        /**
         * loads all unloaded nodes
         * @name load_all([obj, callback])
         * @param {mixed} obj the node to load recursively, omit to load all nodes in the tree
         * @param {function} callback a function to be executed once loading all the nodes is complete,
         * @trigger load_all.jstree
         */
        load_all: function(obj, callback) {
            if (!obj) {
                obj = '#';
            }
            obj = this.get_node(obj);
            if (!obj) {
                return false;
            }
            var to_load = [],
                m = this._model.data,
                c = m[obj.id].children_d,
                i, j;
            if (obj.state && !obj.state.loaded) {
                to_load.push(obj.id);
            }
            for (i = 0, j = c.length; i < j; i++) {
                if (m[c[i]] && m[c[i]].state && !m[c[i]].state.loaded) {
                    to_load.push(c[i]);
                }
            }
            if (to_load.length) {
                this._load_nodes(to_load, function() {
                    this.load_all(obj, callback);
                });
            } else {
                /**
                 * triggered after a load_all call completes
                 * @event
                 * @name load_all.jstree
                 * @param {Object} node the recursively loaded node
                 */
                if (callback) {
                    callback.call(this, obj);
                }
                this.trigger('load_all', {
                    "node": obj
                });
            }
        },
        /**
         * handles the actual loading of a node. Used only internally.
         * @private
         * @name _load_node(obj [, callback])
         * @param  {mixed} obj
         * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives one argument - a boolean status
         * @return {Boolean}
         */
        _load_node: function(obj, callback) {
            var s = this.settings.core.data,
                t;
            // use original HTML
            if (!s) {
                if (obj.id === '#') {
                    return this._append_html_data(obj, this._data.core.original_container_html.clone(true), function(status) {
                        callback.call(this, status);
                    });
                } else {
                    return callback.call(this, false);
                }
                // return callback.call(this, obj.id === '#' ? this._append_html_data(obj, this._data.core.original_container_html.clone(true)) : false);
            }
            if ($.isFunction(s)) {
                return s.call(this, obj, $.proxy(function(d) {
                    if (d === false) {
                        callback.call(this, false);
                    }
                    this[typeof d === 'string' ? '_append_html_data' : '_append_json_data'](obj, typeof d === 'string' ? $($.parseHTML(d)).filter(function() {
                        return this.nodeType !== 3;
                    }) : d, function(status) {
                        callback.call(this, status);
                    });
                    // return d === false ? callback.call(this, false) : callback.call(this, this[typeof d === 'string' ? '_append_html_data' : '_append_json_data'](obj, typeof d === 'string' ? $(d) : d));
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
                    return $.ajax(s)
                        .done($.proxy(function(d, t, x) {
                            var type = x.getResponseHeader('Content-Type');
                            if ((type && type.indexOf('json') !== -1) || typeof d === "object") {
                                return this._append_json_data(obj, d, function(status) {
                                    callback.call(this, status);
                                });
                                //return callback.call(this, this._append_json_data(obj, d));
                            }
                            if ((type && type.indexOf('html') !== -1) || typeof d === "string") {
                                return this._append_html_data(obj, $($.parseHTML(d)).filter(function() {
                                    return this.nodeType !== 3;
                                }), function(status) {
                                    callback.call(this, status);
                                });
                                // return callback.call(this, this._append_html_data(obj, $(d)));
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
                        }, this))
                        .fail($.proxy(function(f) {
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
                t = ($.isArray(s) || $.isPlainObject(s)) ? JSON.parse(JSON.stringify(s)) : s;
                if (obj.id === '#') {
                    return this._append_json_data(obj, t, function(status) {
                        callback.call(this, status);
                    });
                } else {
                    this._data.core.last_error = {
                        'error': 'nodata',
                        'plugin': 'core',
                        'id': 'core_05',
                        'reason': 'Could not load node',
                        'data': JSON.stringify({
                            'id': obj.id
                        })
                    };
                    this.settings.core.error.call(this, this._data.core.last_error);
                    return callback.call(this, false);
                }
                //return callback.call(this, (obj.id === "#" ? this._append_json_data(obj, t) : false) );
            }
            if (typeof s === 'string') {
                if (obj.id === '#') {
                    return this._append_html_data(obj, $($.parseHTML(s)).filter(function() {
                        return this.nodeType !== 3;
                    }), function(status) {
                        callback.call(this, status);
                    });
                } else {
                    this._data.core.last_error = {
                        'error': 'nodata',
                        'plugin': 'core',
                        'id': 'core_06',
                        'reason': 'Could not load node',
                        'data': JSON.stringify({
                            'id': obj.id
                        })
                    };
                    this.settings.core.error.call(this, this._data.core.last_error);
                    return callback.call(this, false);
                }
                //return callback.call(this, (obj.id === "#" ? this._append_html_data(obj, $(s)) : false) );
            }
            return callback.call(this, false);
        },
        /**
         * adds a node to the list of nodes to redraw. Used only internally.
         * @private
         * @name _node_changed(obj [, callback])
         * @param  {mixed} obj
         */
        _node_changed: function(obj) {
            obj = this.get_node(obj);
            if (obj) {
                this._model.changed.push(obj.id);
            }
        },
        /**
         * appends HTML content to the tree. Used internally.
         * @private
         * @name _append_html_data(obj, data)
         * @param  {mixed} obj the node to append to
         * @param  {String} data the HTML string to parse and append
         * @trigger model.jstree, changed.jstree
         */
        _append_html_data: function(dom, data, cb) {
            dom = this.get_node(dom);
            dom.children = [];
            dom.children_d = [];
            var dat = data.is('ul') ? data.children() : data,
                par = dom.id,
                chd = [],
                dpc = [],
                m = this._model.data,
                p = m[par],
                s = this._data.core.selected.length,
                tmp, i, j;
            dat.each($.proxy(function(i, v) {
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
            /**
             * triggered when new data is inserted to the tree model
             * @event
             * @name model.jstree
             * @param {Array} nodes an array of node IDs
             * @param {String} parent the parent ID of the nodes
             */
            this.trigger('model', {
                "nodes": dpc,
                'parent': par
            });
            if (par !== '#') {
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
        /**
         * appends JSON content to the tree. Used internally.
         * @private
         * @name _append_json_data(obj, data)
         * @param  {mixed} obj the node to append to
         * @param  {String} data the JSON object to parse and append
         * @param  {Boolean} force_processing internal param - do not set
         * @trigger model.jstree, changed.jstree
         */
        _append_json_data: function(dom, data, cb, force_processing) {
            if (this.element === null) {
                return;
            }
            dom = this.get_node(dom);
            dom.children = [];
            dom.children_d = [];
            // *%$@!!!
            if (data.d) {
                data = data.d;
                if (typeof data === "string") {
                    data = JSON.parse(data);
                }
            }
            if (!$.isArray(data)) {
                data = [data];
            }
            var w = null,
                args = {
                    'df': this._model.default_state,
                    'dat': data,
                    'par': dom.id,
                    'm': this._model.data,
                    't_id': this._id,
                    't_cnt': this._cnt,
                    'sel': this._data.core.selected
                },
                func = function(data, undefined) {
                    if (data.data) {
                        data = data.data;
                    }
                    var dat = data.dat,
                        par = data.par,
                        chd = [],
                        dpc = [],
                        add = [],
                        df = data.df,
                        t_id = data.t_id,
                        t_cnt = data.t_cnt,
                        m = data.m,
                        p = m[par],
                        sel = data.sel,
                        tmp, i, j, rslt,
                        parse_flat = function(d, p, ps) {
                            if (!ps) {
                                ps = [];
                            } else {
                                ps = ps.concat();
                            }
                            if (p) {
                                ps.unshift(p);
                            }
                            var tid = d.id.toString(),
                                i, j, c, e,
                                tmp = {
                                    id: tid,
                                    text: d.text || '',
                                    icon: d.icon !== undefined ? d.icon : true,
                                    parent: p,
                                    parents: ps,
                                    children: d.children || [],
                                    children_d: d.children_d || [],
                                    data: d.data,
                                    state: {},
                                    li_attr: {
                                        id: false
                                    },
                                    a_attr: {
                                        href: '#'
                                    },
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
                            if (tmp.icon === undefined || tmp.icon === null || tmp.icon === "") {
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
                        },
                        parse_nest = function(d, p, ps) {
                            if (!ps) {
                                ps = [];
                            } else {
                                ps = ps.concat();
                            }
                            if (p) {
                                ps.unshift(p);
                            }
                            var tid = false,
                                i, j, c, e, tmp;
                            do {
                                tid = 'j' + t_id + '_' + (++t_cnt);
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
                                li_attr: {
                                    id: false
                                },
                                a_attr: {
                                    href: '#'
                                },
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
                            if (tmp.icon === undefined || tmp.icon === null || tmp.icon === "") {
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
                        // Flat JSON support (for easy import from DB):
                        // 1) convert to object (foreach)
                        for (i = 0, j = dat.length; i < j; i++) {
                            if (!dat[i].children) {
                                dat[i].children = [];
                            }
                            m[dat[i].id.toString()] = dat[i];
                        }
                        // 2) populate children (foreach)
                        for (i = 0, j = dat.length; i < j; i++) {
                            m[dat[i].parent.toString()].children.push(dat[i].id.toString());
                            // populate parent.children_d
                            p.children_d.push(dat[i].id.toString());
                        }
                        // 3) normalize && populate parents and children_d with recursion
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
                        // ?) three_state selection - p.state.selected && t - (if three_state foreach(dat => ch) -> foreach(parents) if(parent.selected) child.selected = true;
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
                },
                rslt = function(rslt, worker) {
                    if (this.element === null) {
                        return;
                    }
                    this._cnt = rslt.cnt;
                    this._model.data = rslt.mod; // breaks the reference in load_node - careful

                    if (worker) {
                        var i, j, a = rslt.add,
                            r = rslt.sel,
                            s = this._data.core.selected.slice(),
                            m = this._model.data;
                        // if selection was changed while calculating in worker
                        if (r.length !== s.length || $.vakata.array_unique(r.concat(s)).length !== r.length) {
                            // deselect nodes that are no longer selected
                            for (i = 0, j = r.length; i < j; i++) {
                                if ($.inArray(r[i], a) === -1 && $.inArray(r[i], s) === -1) {
                                    m[r[i]].state.selected = false;
                                }
                            }
                            // select nodes that were selected in the mean time
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
                        "nodes": rslt.dpc,
                        'parent': rslt.par
                    });

                    if (rslt.par !== '#') {
                        this._node_changed(rslt.par);
                        this.redraw();
                    } else {
                        // this.get_container_ul().children('.jstree-initial-node').remove();
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
                        this._wrk = window.URL.createObjectURL(
                            new window.Blob(
                                ['self.onmessage = ' + func.toString()], {
                                    type: "text/javascript"
                                }
                            )
                        );
                    }
                    if (!this._data.core.working || force_processing) {
                        this._data.core.working = true;
                        w = new window.Worker(this._wrk);
                        w.onmessage = $.proxy(function(e) {
                            rslt.call(this, e.data, true);
                            try {
                                w.terminate();
                                w = null;
                            } catch (ignore) {}
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
                        this._data.core.worker_queue.push([dom, data, cb, true]);
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
        /**
         * parses a node from a jQuery object and appends them to the in memory tree model. Used internally.
         * @private
         * @name _parse_model_from_html(d [, p, ps])
         * @param  {jQuery} d the jQuery object to parse
         * @param  {String} p the parent ID
         * @param  {Array} ps list of all parents
         * @return {String} the ID of the object added to the model
         */
        _parse_model_from_html: function(d, p, ps) {
            if (!ps) {
                ps = [];
            } else {
                ps = [].concat(ps);
            }
            if (p) {
                ps.unshift(p);
            }
            var c, e, m = this._model.data,
                data = {
                    id: false,
                    text: false,
                    icon: true,
                    parent: p,
                    parents: ps,
                    children: [],
                    children_d: [],
                    data: null,
                    state: {},
                    li_attr: {
                        id: false
                    },
                    a_attr: {
                        href: '#'
                    },
                    original: false
                },
                i, tmp, tid;
            for (i in this._model.default_state) {
                if (this._model.default_state.hasOwnProperty(i)) {
                    data.state[i] = this._model.default_state[i];
                }
            }
            tmp = $.vakata.attributes(d, true);
            $.each(tmp, function(i, v) {
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
                $.each(tmp, function(i, v) {
                    v = $.trim(v);
                    if (v.length) {
                        data.a_attr[i] = v;
                    }
                });
            }
            tmp = d.children("a").first().length ? d.children("a").first().clone() : d.clone();
            tmp.children("ins, i, ul").remove();
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
            tmp = d.children("a").children(".jstree-themeicon");
            if (tmp.length) {
                data.icon = tmp.hasClass('jstree-themeicon-hidden') ? false : tmp.attr('rel');
            }
            if (data.state.icon !== undefined) {
                data.icon = data.state.icon;
            }
            if (data.icon === undefined || data.icon === null || data.icon === "") {
                data.icon = true;
            }
            tmp = d.children("ul").children("li");
            do {
                tid = 'j' + this._id + '_' + (++this._cnt);
            } while (m[tid]);
            data.id = data.li_attr.id ? data.li_attr.id.toString() : tid;
            if (tmp.length) {
                tmp.each($.proxy(function(i, v) {
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
        /**
         * parses a node from a JSON object (used when dealing with flat data, which has no nesting of children, but has id and parent properties) and appends it to the in memory tree model. Used internally.
         * @private
         * @name _parse_model_from_flat_json(d [, p, ps])
         * @param  {Object} d the JSON object to parse
         * @param  {String} p the parent ID
         * @param  {Array} ps list of all parents
         * @return {String} the ID of the object added to the model
         */
        _parse_model_from_flat_json: function(d, p, ps) {
            if (!ps) {
                ps = [];
            } else {
                ps = ps.concat();
            }
            if (p) {
                ps.unshift(p);
            }
            var tid = d.id.toString(),
                m = this._model.data,
                df = this._model.default_state,
                i, j, c, e,
                tmp = {
                    id: tid,
                    text: d.text || '',
                    icon: d.icon !== undefined ? d.icon : true,
                    parent: p,
                    parents: ps,
                    children: d.children || [],
                    children_d: d.children_d || [],
                    data: d.data,
                    state: {},
                    li_attr: {
                        id: false
                    },
                    a_attr: {
                        href: '#'
                    },
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
            if (tmp.icon === undefined || tmp.icon === null || tmp.icon === "") {
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
        /**
         * parses a node from a JSON object and appends it to the in memory tree model. Used internally.
         * @private
         * @name _parse_model_from_json(d [, p, ps])
         * @param  {Object} d the JSON object to parse
         * @param  {String} p the parent ID
         * @param  {Array} ps list of all parents
         * @return {String} the ID of the object added to the model
         */
        _parse_model_from_json: function(d, p, ps) {
            if (!ps) {
                ps = [];
            } else {
                ps = ps.concat();
            }
            if (p) {
                ps.unshift(p);
            }
            var tid = false,
                i, j, c, e, m = this._model.data,
                df = this._model.default_state,
                tmp;
            do {
                tid = 'j' + this._id + '_' + (++this._cnt);
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
                li_attr: {
                    id: false
                },
                a_attr: {
                    href: '#'
                },
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
            if (tmp.icon === undefined || tmp.icon === null || tmp.icon === "") {
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
        /**
         * redraws all nodes that need to be redrawn. Used internally.
         * @private
         * @name _redraw()
         * @trigger redraw.jstree
         */
        _redraw: function() {
            var nodes = this._model.force_full_redraw ? this._model.data['#'].children.concat([]) : this._model.changed.concat([]),
                f = document.createElement('UL'),
                tmp, i, j, fe = this._data.core.focused;
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
                //this.get_container_ul()[0].appendChild(f);
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
            /**
             * triggered after nodes are redrawn
             * @event
             * @name redraw.jstree
             * @param {array} nodes the redrawn nodes
             */
            this.trigger('redraw', {
                "nodes": nodes
            });
        },
        /**
         * redraws all nodes that need to be redrawn or optionally - the whole tree
         * @name redraw([full])
         * @param {Boolean} full if set to `true` all nodes are redrawn.
         */
        redraw: function(full) {
            if (full) {
                this._model.force_full_redraw = true;
            }
            //if(this._model.redraw_timeout) {
            //	clearTimeout(this._model.redraw_timeout);
            //}
            //this._model.redraw_timeout = setTimeout($.proxy(this._redraw, this),0);
            this._redraw();
        },
        /**
         * redraws a single node's children. Used internally.
         * @private
         * @name draw_children(node)
         * @param {mixed} node the node whose children will be redrawn
         */
        draw_children: function(node) {
            var obj = this.get_node(node),
                i = false,
                j = false,
                k = false,
                d = document;
            if (!obj) {
                return false;
            }
            if (obj.id === '#') {
                return this.redraw(true);
            }
            node = this.get_node(node, true);
            if (!node || !node.length) {
                return false;
            } // TODO: quick toggle

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
        /**
         * redraws a single node. Used internally.
         * @private
         * @name redraw_node(node, deep, is_callback, force_render)
         * @param {mixed} node the node to redraw
         * @param {Boolean} deep should child nodes be redrawn too
         * @param {Boolean} is_callback is this a recursion call
         * @param {Boolean} force_render should children of closed parents be drawn anyway
         */
        redraw_node: function(node, deep, is_callback, force_render) {
            var obj = this.get_node(node),
                par = false,
                ind = false,
                old = false,
                i = false,
                j = false,
                k = false,
                c = '',
                d = document,
                m = this._model.data,
                f = false,
                s = false,
                tmp = null,
                t = 0,
                l = 0;
            if (!obj) {
                return false;
            }
            if (obj.id === '#') {
                return this.redraw(true);
            }
            deep = deep || obj.children.length === 0;
            node = !document.querySelector ? document.getElementById(obj.id) : this.element[0].querySelector('#' + ("0123456789".indexOf(obj.id[0]) !== -1 ? '\\3' + obj.id[0] + ' ' + obj.id.substr(1).replace($.jstree.idregex, '\\$&') : obj.id.replace($.jstree.idregex, '\\$&'))); //, this.element);
            if (!node) {
                deep = true;
                //node = d.createElement('LI');
                if (!is_callback) {
                    par = obj.parent !== '#' ? $('#' + obj.parent.replace($.jstree.idregex, '\\$&'), this.element)[0] : null;
                    if (par !== null && (!par || !m[obj.parent].state.opened)) {
                        return false;
                    }
                    ind = $.inArray(obj.id, par === null ? m['#'].children : m[obj.parent].children);
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
                // m[obj.id].data = node.data(); // use only node's data, no need to touch jquery storage
                if (!deep && obj.children.length && !node.children('.jstree-children').length) {
                    deep = true;
                }
                if (!deep) {
                    old = node.children('.jstree-children')[0];
                }
                f = node.children('.jstree-anchor')[0] === document.activeElement;
                node.remove();
                //node = d.createElement('LI');
                //node = node[0];
            }
            node = _node.cloneNode(true);
            // node is DOM, deep is boolean

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

            if (obj.state.loaded && !obj.children.length) {
                c += ' jstree-leaf';
            } else {
                c += obj.state.opened && obj.state.loaded ? ' jstree-open' : ' jstree-closed';
                node.setAttribute('aria-expanded', (obj.state.opened && obj.state.loaded));
            }
            if (obj.parent !== null && m[obj.parent].children[m[obj.parent].children.length - 1] === obj.id) {
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
            if ((obj.icon && obj.icon !== true) || obj.icon === false) {
                if (obj.icon === false) {
                    node.childNodes[1].childNodes[0].className += ' jstree-themeicon-hidden';
                } else if (obj.icon.indexOf('/') === -1 && obj.icon.indexOf('.') === -1) {
                    node.childNodes[1].childNodes[0].className += ' ' + obj.icon + ' jstree-themeicon-custom';
                } else {
                    node.childNodes[1].childNodes[0].style.backgroundImage = 'url(' + obj.icon + ')';
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
                // append back using par / ind
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
                setTimeout($.proxy(function() {
                    this.open_node(obj.id, false, 0);
                }, this), 0);
            }
            return node;
        },
        /**
         * opens a node, revaling its children. If the node is not loaded it will be loaded and opened once ready.
         * @name open_node(obj [, callback, animation])
         * @param {mixed} obj the node to open
         * @param {Function} callback a function to execute once the node is opened
         * @param {Number} animation the animation duration in milliseconds when opening the node (overrides the `core.animation` setting). Use `false` for no animation.
         * @trigger open_node.jstree, after_open.jstree, before_open.jstree
         */
        open_node: function(obj, callback, animation) {
            var t1, t2, d, t;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.open_node(obj[t1], callback, animation);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
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
                    return setTimeout($.proxy(function() {
                        this.open_node(obj, callback, animation);
                    }, this), 500);
                }
                this.load_node(obj, function(o, ok) {
                    return ok ? this.open_node(o, callback, animation) : (callback ? callback.call(this, o, false) : false);
                });
            } else {
                d = this.get_node(obj, true);
                t = this;
                if (d.length) {
                    if (animation && d.children(".jstree-children").length) {
                        d.children(".jstree-children").stop(true, true);
                    }
                    if (obj.children.length && !this._firstChild(d.children('.jstree-children')[0])) {
                        this.draw_children(obj);
                        //d = this.get_node(obj, true);
                    }
                    if (!animation) {
                        this.trigger('before_open', {
                            "node": obj
                        });
                        d[0].className = d[0].className.replace('jstree-closed', 'jstree-open');
                        d[0].setAttribute("aria-expanded", true);
                    } else {
                        this.trigger('before_open', {
                            "node": obj
                        });
                        d
                            .children(".jstree-children").css("display", "none").end()
                            .removeClass("jstree-closed").addClass("jstree-open").attr("aria-expanded", true)
                            .children(".jstree-children").stop(true, true)
                            .slideDown(animation, function() {
                                this.style.display = "";
                                t.trigger("after_open", {
                                    "node": obj
                                });
                            });
                    }
                }
                obj.state.opened = true;
                if (callback) {
                    callback.call(this, obj, true);
                }
                if (!d.length) {
                    /**
                     * triggered when a node is about to be opened (if the node is supposed to be in the DOM, it will be, but it won't be visible yet)
                     * @event
                     * @name before_open.jstree
                     * @param {Object} node the opened node
                     */
                    this.trigger('before_open', {
                        "node": obj
                    });
                }
                /**
                 * triggered when a node is opened (if there is an animation it will not be completed yet)
                 * @event
                 * @name open_node.jstree
                 * @param {Object} node the opened node
                 */
                this.trigger('open_node', {
                    "node": obj
                });
                if (!animation || !d.length) {
                    /**
                     * triggered when a node is opened and the animation is complete
                     * @event
                     * @name after_open.jstree
                     * @param {Object} node the opened node
                     */
                    this.trigger("after_open", {
                        "node": obj
                    });
                }
            }
        },
        /**
         * opens every parent of a node (node should be loaded)
         * @name _open_to(obj)
         * @param {mixed} obj the node to reveal
         * @private
         */
        _open_to: function(obj) {
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            var i, j, p = obj.parents;
            for (i = 0, j = p.length; i < j; i += 1) {
                if (i !== '#') {
                    this.open_node(p[i], false, 0);
                }
            }
            return $('#' + obj.id.replace($.jstree.idregex, '\\$&'), this.element);
        },
        /**
         * closes a node, hiding its children
         * @name close_node(obj [, animation])
         * @param {mixed} obj the node to close
         * @param {Number} animation the animation duration in milliseconds when closing the node (overrides the `core.animation` setting). Use `false` for no animation.
         * @trigger close_node.jstree, after_close.jstree
         */
        close_node: function(obj, animation) {
            var t1, t2, t, d;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.close_node(obj[t1], animation);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            if (this.is_closed(obj)) {
                return false;
            }
            animation = animation === undefined ? this.settings.core.animation : animation;
            t = this;
            d = this.get_node(obj, true);
            if (d.length) {
                if (!animation) {
                    d[0].className = d[0].className.replace('jstree-open', 'jstree-closed');
                    d.attr("aria-expanded", false).children('.jstree-children').remove();
                } else {
                    d
                        .children(".jstree-children").attr("style", "display:block !important").end()
                        .removeClass("jstree-open").addClass("jstree-closed").attr("aria-expanded", false)
                        .children(".jstree-children").stop(true, true).slideUp(animation, function() {
                            this.style.display = "";
                            d.children('.jstree-children').remove();
                            t.trigger("after_close", {
                                "node": obj
                            });
                        });
                }
            }
            obj.state.opened = false;
            /**
             * triggered when a node is closed (if there is an animation it will not be complete yet)
             * @event
             * @name close_node.jstree
             * @param {Object} node the closed node
             */
            this.trigger('close_node', {
                "node": obj
            });
            if (!animation || !d.length) {
                /**
                 * triggered when a node is closed and the animation is complete
                 * @event
                 * @name after_close.jstree
                 * @param {Object} node the closed node
                 */
                this.trigger("after_close", {
                    "node": obj
                });
            }
        },
        /**
         * toggles a node - closing it if it is open, opening it if it is closed
         * @name toggle_node(obj)
         * @param {mixed} obj the node to toggle
         */
        toggle_node: function(obj) {
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
        /**
         * opens all nodes within a node (or the tree), revaling their children. If the node is not loaded it will be loaded and opened once ready.
         * @name open_all([obj, animation, original_obj])
         * @param {mixed} obj the node to open recursively, omit to open all nodes in the tree
         * @param {Number} animation the animation duration in milliseconds when opening the nodes, the default is no animation
         * @param {jQuery} reference to the node that started the process (internal use)
         * @trigger open_all.jstree
         */
        open_all: function(obj, animation, original_obj) {
            if (!obj) {
                obj = '#';
            }
            obj = this.get_node(obj);
            if (!obj) {
                return false;
            }
            var dom = obj.id === '#' ? this.get_container_ul() : this.get_node(obj, true),
                i, j, _this;
            if (!dom.length) {
                for (i = 0, j = obj.children_d.length; i < j; i++) {
                    if (this.is_closed(this._model.data[obj.children_d[i]])) {
                        this._model.data[obj.children_d[i]].state.opened = true;
                    }
                }
                return this.trigger('open_all', {
                    "node": obj
                });
            }
            original_obj = original_obj || dom;
            _this = this;
            dom = this.is_closed(obj) ? dom.find('.jstree-closed').addBack() : dom.find('.jstree-closed');
            dom.each(function() {
                _this.open_node(
                    this,
                    function(node, status) {
                        if (status && this.is_parent(node)) {
                            this.open_all(node, animation, original_obj);
                        }
                    },
                    animation || 0
                );
            });
            if (original_obj.find('.jstree-closed').length === 0) {
                /**
                 * triggered when an `open_all` call completes
                 * @event
                 * @name open_all.jstree
                 * @param {Object} node the opened node
                 */
                this.trigger('open_all', {
                    "node": this.get_node(original_obj)
                });
            }
        },
        /**
         * closes all nodes within a node (or the tree), revaling their children
         * @name close_all([obj, animation])
         * @param {mixed} obj the node to close recursively, omit to close all nodes in the tree
         * @param {Number} animation the animation duration in milliseconds when closing the nodes, the default is no animation
         * @trigger close_all.jstree
         */
        close_all: function(obj, animation) {
            if (!obj) {
                obj = '#';
            }
            obj = this.get_node(obj);
            if (!obj) {
                return false;
            }
            var dom = obj.id === '#' ? this.get_container_ul() : this.get_node(obj, true),
                _this = this,
                i, j;
            if (!dom.length) {
                for (i = 0, j = obj.children_d.length; i < j; i++) {
                    this._model.data[obj.children_d[i]].state.opened = false;
                }
                return this.trigger('close_all', {
                    "node": obj
                });
            }
            dom = this.is_open(obj) ? dom.find('.jstree-open').addBack() : dom.find('.jstree-open');
            $(dom.get().reverse()).each(function() {
                _this.close_node(this, animation || 0);
            });
            /**
             * triggered when an `close_all` call completes
             * @event
             * @name close_all.jstree
             * @param {Object} node the closed node
             */
            this.trigger('close_all', {
                "node": obj
            });
        },
        /**
         * checks if a node is disabled (not selectable)
         * @name is_disabled(obj)
         * @param  {mixed} obj
         * @return {Boolean}
         */
        is_disabled: function(obj) {
            obj = this.get_node(obj);
            return obj && obj.state && obj.state.disabled;
        },
        /**
         * enables a node - so that it can be selected
         * @name enable_node(obj)
         * @param {mixed} obj the node to enable
         * @trigger enable_node.jstree
         */
        enable_node: function(obj) {
            var t1, t2;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.enable_node(obj[t1]);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            obj.state.disabled = false;
            this.get_node(obj, true).children('.jstree-anchor').removeClass('jstree-disabled').attr('aria-disabled', false);
            /**
             * triggered when an node is enabled
             * @event
             * @name enable_node.jstree
             * @param {Object} node the enabled node
             */
            this.trigger('enable_node', {
                'node': obj
            });
        },
        /**
         * disables a node - so that it can not be selected
         * @name disable_node(obj)
         * @param {mixed} obj the node to disable
         * @trigger disable_node.jstree
         */
        disable_node: function(obj) {
            var t1, t2;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.disable_node(obj[t1]);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            obj.state.disabled = true;
            this.get_node(obj, true).children('.jstree-anchor').addClass('jstree-disabled').attr('aria-disabled', true);
            /**
             * triggered when an node is disabled
             * @event
             * @name disable_node.jstree
             * @param {Object} node the disabled node
             */
            this.trigger('disable_node', {
                'node': obj
            });
        },
        /**
         * called when a node is selected by the user. Used internally.
         * @private
         * @name activate_node(obj, e)
         * @param {mixed} obj the node
         * @param {Object} e the related event
         * @trigger activate_node.jstree, changed.jstree
         */
        activate_node: function(obj, e) {
            if (this.is_disabled(obj)) {
                return false;
            }

            // ensure last_clicked is still in the DOM, make it fresh (maybe it was moved?) and make sure it is still selected, if not - make last_clicked the last selected node
            this._data.core.last_clicked = this._data.core.last_clicked && this._data.core.last_clicked.id !== undefined ? this.get_node(this._data.core.last_clicked.id) : null;
            if (this._data.core.last_clicked && !this._data.core.last_clicked.state.selected) {
                this._data.core.last_clicked = null;
            }
            if (!this._data.core.last_clicked && this._data.core.selected.length) {
                this._data.core.last_clicked = this.get_node(this._data.core.selected[this._data.core.selected.length - 1]);
            }

            if (!this.settings.core.multiple || (!e.metaKey && !e.ctrlKey && !e.shiftKey) || (e.shiftKey && (!this._data.core.last_clicked || !this.get_parent(obj) || this.get_parent(obj) !== this._data.core.last_clicked.parent))) {
                if (!this.settings.core.multiple && (e.metaKey || e.ctrlKey || e.shiftKey) && this.is_selected(obj)) {
                    this.deselect_node(obj, false, e);
                } else {
                    this.deselect_all(true);
                    this.select_node(obj, false, false, e);
                    this._data.core.last_clicked = this.get_node(obj);
                }
            } else {
                if (e.shiftKey) {
                    var o = this.get_node(obj).id,
                        l = this._data.core.last_clicked.id,
                        p = this.get_node(this._data.core.last_clicked.parent).children,
                        c = false,
                        i, j;
                    for (i = 0, j = p.length; i < j; i += 1) {
                        // separate IFs work whem o and l are the same
                        if (p[i] === o) {
                            c = !c;
                        }
                        if (p[i] === l) {
                            c = !c;
                        }
                        if (!this.is_disabled(p[i]) && (c || p[i] === o || p[i] === l)) {
                            this.select_node(p[i], true, false, e);
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
            /**
             * triggered when an node is clicked or intercated with by the user
             * @event
             * @name activate_node.jstree
             * @param {Object} node
             */
            this.trigger('activate_node', {
                'node': this.get_node(obj)
            });
        },
        /**
         * applies the hover state on a node, called when a node is hovered by the user. Used internally.
         * @private
         * @name hover_node(obj)
         * @param {mixed} obj
         * @trigger hover_node.jstree
         */
        hover_node: function(obj) {
            obj = this.get_node(obj, true);
            if (!obj || !obj.length || obj.children('.jstree-hovered').length) {
                return false;
            }
            var o = this.element.find('.jstree-hovered'),
                t = this.element;
            if (o && o.length) {
                this.dehover_node(o);
            }

            obj.children('.jstree-anchor').addClass('jstree-hovered');
            /**
             * triggered when an node is hovered
             * @event
             * @name hover_node.jstree
             * @param {Object} node
             */
            this.trigger('hover_node', {
                'node': this.get_node(obj)
            });
            setTimeout(function() {
                t.attr('aria-activedescendant', obj[0].id);
            }, 0);
        },
        /**
         * removes the hover state from a nodecalled when a node is no longer hovered by the user. Used internally.
         * @private
         * @name dehover_node(obj)
         * @param {mixed} obj
         * @trigger dehover_node.jstree
         */
        dehover_node: function(obj) {
            obj = this.get_node(obj, true);
            if (!obj || !obj.length || !obj.children('.jstree-hovered').length) {
                return false;
            }
            obj.children('.jstree-anchor').removeClass('jstree-hovered');
            /**
             * triggered when an node is no longer hovered
             * @event
             * @name dehover_node.jstree
             * @param {Object} node
             */
            this.trigger('dehover_node', {
                'node': this.get_node(obj)
            });
        },
        /**
         * select a node
         * @name select_node(obj [, supress_event, prevent_open])
         * @param {mixed} obj an array can be used to select multiple nodes
         * @param {Boolean} supress_event if set to `true` the `changed.jstree` event won't be triggered
         * @param {Boolean} prevent_open if set to `true` parents of the selected node won't be opened
         * @trigger select_node.jstree, changed.jstree
         */
        select_node: function(obj, supress_event, prevent_open, e) {
            var dom, t1, t2, th;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.select_node(obj[t1], supress_event, prevent_open, e);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
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
                /**
                 * triggered when an node is selected
                 * @event
                 * @name select_node.jstree
                 * @param {Object} node
                 * @param {Array} selected the current selection
                 * @param {Object} event the event (if any) that triggered this select_node
                 */
                this.trigger('select_node', {
                    'node': obj,
                    'selected': this._data.core.selected,
                    'event': e
                });
                if (!supress_event) {
                    /**
                     * triggered when selection changes
                     * @event
                     * @name changed.jstree
                     * @param {Object} node
                     * @param {Object} action the action that caused the selection to change
                     * @param {Array} selected the current selection
                     * @param {Object} event the event (if any) that triggered this changed event
                     */
                    this.trigger('changed', {
                        'action': 'select_node',
                        'node': obj,
                        'selected': this._data.core.selected,
                        'event': e
                    });
                }
            }
        },
        /**
         * deselect a node
         * @name deselect_node(obj [, supress_event])
         * @param {mixed} obj an array can be used to deselect multiple nodes
         * @param {Boolean} supress_event if set to `true` the `changed.jstree` event won't be triggered
         * @trigger deselect_node.jstree, changed.jstree
         */
        deselect_node: function(obj, supress_event, e) {
            var t1, t2, dom;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.deselect_node(obj[t1], supress_event, e);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            dom = this.get_node(obj, true);
            if (obj.state.selected) {
                obj.state.selected = false;
                this._data.core.selected = $.vakata.array_remove_item(this._data.core.selected, obj.id);
                if (dom.length) {
                    dom.attr('aria-selected', false).children('.jstree-anchor').removeClass('jstree-clicked');
                }
                /**
                 * triggered when an node is deselected
                 * @event
                 * @name deselect_node.jstree
                 * @param {Object} node
                 * @param {Array} selected the current selection
                 * @param {Object} event the event (if any) that triggered this deselect_node
                 */
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
        /**
         * select all nodes in the tree
         * @name select_all([supress_event])
         * @param {Boolean} supress_event if set to `true` the `changed.jstree` event won't be triggered
         * @trigger select_all.jstree, changed.jstree
         */
        select_all: function(supress_event) {
            var tmp = this._data.core.selected.concat([]),
                i, j;
            this._data.core.selected = this._model.data['#'].children_d.concat();
            for (i = 0, j = this._data.core.selected.length; i < j; i++) {
                if (this._model.data[this._data.core.selected[i]]) {
                    this._model.data[this._data.core.selected[i]].state.selected = true;
                }
            }
            this.redraw(true);
            /**
             * triggered when all nodes are selected
             * @event
             * @name select_all.jstree
             * @param {Array} selected the current selection
             */
            this.trigger('select_all', {
                'selected': this._data.core.selected
            });
            if (!supress_event) {
                this.trigger('changed', {
                    'action': 'select_all',
                    'selected': this._data.core.selected,
                    'old_selection': tmp
                });
            }
        },
        /**
         * deselect all selected nodes
         * @name deselect_all([supress_event])
         * @param {Boolean} supress_event if set to `true` the `changed.jstree` event won't be triggered
         * @trigger deselect_all.jstree, changed.jstree
         */
        deselect_all: function(supress_event) {
            var tmp = this._data.core.selected.concat([]),
                i, j;
            for (i = 0, j = this._data.core.selected.length; i < j; i++) {
                if (this._model.data[this._data.core.selected[i]]) {
                    this._model.data[this._data.core.selected[i]].state.selected = false;
                }
            }
            this._data.core.selected = [];
            this.element.find('.jstree-clicked').removeClass('jstree-clicked').parent().attr('aria-selected', false);
            /**
             * triggered when all nodes are deselected
             * @event
             * @name deselect_all.jstree
             * @param {Object} node the previous selection
             * @param {Array} selected the current selection
             */
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
        /**
         * checks if a node is selected
         * @name is_selected(obj)
         * @param  {mixed}  obj
         * @return {Boolean}
         */
        is_selected: function(obj) {
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            return obj.state.selected;
        },
        /**
         * get an array of all selected nodes
         * @name get_selected([full])
         * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
         * @return {Array}
         */
        get_selected: function(full) {
            return full ? $.map(this._data.core.selected, $.proxy(function(i) {
                return this.get_node(i);
            }, this)) : this._data.core.selected.slice();
        },
        /**
         * get an array of all top level selected nodes (ignoring children of selected nodes)
         * @name get_top_selected([full])
         * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
         * @return {Array}
         */
        get_top_selected: function(full) {
            var tmp = this.get_selected(true),
                obj = {},
                i, j, k, l;
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
            return full ? $.map(tmp, $.proxy(function(i) {
                return this.get_node(i);
            }, this)) : tmp;
        },
        /**
         * get an array of all bottom level selected nodes (ignoring selected parents)
         * @name get_bottom_selected([full])
         * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
         * @return {Array}
         */
        get_bottom_selected: function(full) {
            var tmp = this.get_selected(true),
                obj = [],
                i, j;
            for (i = 0, j = tmp.length; i < j; i++) {
                if (!tmp[i].children.length) {
                    obj.push(tmp[i].id);
                }
            }
            return full ? $.map(obj, $.proxy(function(i) {
                return this.get_node(i);
            }, this)) : obj;
        },
        /**
         * gets the current state of the tree so that it can be restored later with `set_state(state)`. Used internally.
         * @name get_state()
         * @private
         * @return {Object}
         */
        get_state: function() {
            var state = {
                    'core': {
                        'open': [],
                        'scroll': {
                            'left': this.element.scrollLeft(),
                            'top': this.element.scrollTop()
                        },
                        /*
					'themes' : {
						'name' : this.get_theme(),
						'icons' : this._data.core.themes.icons,
						'dots' : this._data.core.themes.dots
					},
					*/
                        'selected': []
                    }
                },
                i;
            for (i in this._model.data) {
                if (this._model.data.hasOwnProperty(i)) {
                    if (i !== '#') {
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
        /**
         * sets the state of the tree. Used internally.
         * @name set_state(state [, callback])
         * @private
         * @param {Object} state the state to restore
         * @param {Function} callback an optional function to execute once the state is restored.
         * @trigger set_state.jstree
         */
        set_state: function(state, callback) {
            if (state) {
                if (state.core) {
                    var res, n, t, _this, i;
                    if (state.core.open) {
                        if (!$.isArray(state.core.open) || !state.core.open.length) {
                            delete state.core.open;
                            this.set_state(state, callback);
                        } else {
                            this._load_nodes(state.core.open, function(nodes) {
                                this.open_node(nodes, false, 0);
                                delete state.core.open;
                                this.set_state(state, callback);
                            }, true);
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
                        $.each(state.core.selected, function(i, v) {
                            _this.select_node(v, false, true);
                        });
                        delete state.core.selected;
                        this.set_state(state, callback);
                        return false;
                    }
                    for (i in state) {
                        if (state.hasOwnProperty(i) && i !== "core" && $.inArray(i, this.settings.plugins) === -1) {
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
                    /**
                     * triggered when a `set_state` call completes
                     * @event
                     * @name set_state.jstree
                     */
                    this.trigger('set_state');
                    return false;
                }
                return true;
            }
            return false;
        },
        /**
         * refreshes the tree - all nodes are reloaded with calls to `load_node`.
         * @name refresh()
         * @param {Boolean} skip_loading an option to skip showing the loading indicator
         * @param {Mixed} forget_state if set to `true` state will not be reapplied, if set to a function (receiving the current state as argument) the result of that function will be used as state
         * @trigger refresh.jstree
         */
        refresh: function(skip_loading, forget_state) {
            this._data.core.state = forget_state === true ? {} : this.get_state();
            if (forget_state && $.isFunction(forget_state)) {
                this._data.core.state = forget_state.call(this, this._data.core.state);
            }
            this._cnt = 0;
            this._model.data = {
                '#': {
                    id: '#',
                    parent: null,
                    parents: [],
                    children: [],
                    children_d: [],
                    state: {
                        loaded: false
                    }
                }
            };
            var c = this.get_container_ul()[0].className;
            if (!skip_loading) {
                this.element.html("<" + "ul class='" + c + "' role='group'><" + "li class='jstree-initial-node jstree-loading jstree-leaf jstree-last' role='treeitem' id='j" + this._id + "_loading'><i class='jstree-icon jstree-ocl'></i><" + "a class='jstree-anchor' href='#'><i class='jstree-icon jstree-themeicon-hidden'></i>" + this.get_string("Loading ...") + "</a></li></ul>");
                this.element.attr('aria-activedescendant', 'j' + this._id + '_loading');
            }
            this.load_node('#', function(o, s) {
                if (s) {
                    this.get_container_ul()[0].className = c;
                    if (this._firstChild(this.get_container_ul()[0])) {
                        this.element.attr('aria-activedescendant', this._firstChild(this.get_container_ul()[0]).id);
                    }
                    this.set_state($.extend(true, {}, this._data.core.state), function() {
                        /**
                         * triggered when a `refresh` call completes
                         * @event
                         * @name refresh.jstree
                         */
                        this.trigger('refresh');
                    });
                }
                this._data.core.state = null;
            });
        },
        /**
         * refreshes a node in the tree (reload its children) all opened nodes inside that node are reloaded with calls to `load_node`.
         * @name refresh_node(obj)
         * @param  {mixed} obj the node
         * @trigger refresh_node.jstree
         */
        refresh_node: function(obj) {
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            var opened = [],
                to_load = [],
                s = this._data.core.selected.concat([]);
            to_load.push(obj.id);
            if (obj.state.opened === true) {
                opened.push(obj.id);
            }
            this.get_node(obj, true).find('.jstree-open').each(function() {
                opened.push(this.id);
            });
            this._load_nodes(to_load, $.proxy(function(nodes) {
                this.open_node(opened, false, 0);
                this.select_node(this._data.core.selected);
                /**
                 * triggered when a node is refreshed
                 * @event
                 * @name refresh_node.jstree
                 * @param {Object} node - the refreshed node
                 * @param {Array} nodes - an array of the IDs of the nodes that were reloaded
                 */
                this.trigger('refresh_node', {
                    'node': obj,
                    'nodes': nodes
                });
            }, this));
        },
        /**
         * set (change) the ID of a node
         * @name set_id(obj, id)
         * @param  {mixed} obj the node
         * @param  {String} id the new ID
         * @return {Boolean}
         */
        set_id: function(obj, id) {
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            var i, j, m = this._model.data;
            id = id.toString();
            // update parents (replace current ID with new one in children and children_d)
            m[obj.parent].children[$.inArray(obj.id, m[obj.parent].children)] = id;
            for (i = 0, j = obj.parents.length; i < j; i++) {
                m[obj.parents[i]].children_d[$.inArray(obj.id, m[obj.parents[i]].children_d)] = id;
            }
            // update children (replace current ID with new one in parent and parents)
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
            // update model and obj itself (obj.id, this._model.data[KEY])
            i = this.get_node(obj.id, true);
            if (i) {
                i.attr('id', id).children('.jstree-anchor').attr('id', id + '_anchor').end().attr('aria-labelledby', id + '_anchor');
                if (this.element.attr('aria-activedescendant') === obj.id) {
                    this.element.attr('aria-activedescendant', id);
                }
            }
            delete m[obj.id];
            obj.id = id;
            obj.li_attr.id = id;
            m[id] = obj;
            return true;
        },
        /**
         * get the text value of a node
         * @name get_text(obj)
         * @param  {mixed} obj the node
         * @return {String}
         */
        get_text: function(obj) {
            obj = this.get_node(obj);
            return (!obj || obj.id === '#') ? false : obj.text;
        },
        /**
         * set the text value of a node. Used internally, please use `rename_node(obj, val)`.
         * @private
         * @name set_text(obj, val)
         * @param  {mixed} obj the node, you can pass an array to set the text on multiple nodes
         * @param  {String} val the new text value
         * @return {Boolean}
         * @trigger set_text.jstree
         */
        set_text: function(obj, val) {
            var t1, t2;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.set_text(obj[t1], val);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            obj.text = val;
            if (this.get_node(obj, true).length) {
                this.redraw_node(obj.id);
            }
            /**
             * triggered when a node text value is changed
             * @event
             * @name set_text.jstree
             * @param {Object} obj
             * @param {String} text the new value
             */
            this.trigger('set_text', {
                "obj": obj,
                "text": val
            });
            return true;
        },
        /**
         * gets a JSON representation of a node (or the whole tree)
         * @name get_json([obj, options])
         * @param  {mixed} obj
         * @param  {Object} options
         * @param  {Boolean} options.no_state do not return state information
         * @param  {Boolean} options.no_id do not return ID
         * @param  {Boolean} options.no_children do not include children
         * @param  {Boolean} options.no_data do not include node data
         * @param  {Boolean} options.flat return flat JSON instead of nested
         * @return {Object}
         */
        get_json: function(obj, options, flat) {
            obj = this.get_node(obj || '#');
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
                        //( this.get_node(obj, true).length ? this.get_node(obj, true).data() : obj.data ),
                },
                i, j;
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
            if (options && options.flat && obj.id !== '#') {
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
            return options && options.flat ? flat : (obj.id === '#' ? tmp.children : tmp);
        },
        /**
         * create a new node (do not confuse with load_node)
         * @name create_node([obj, node, pos, callback, is_loaded])
         * @param  {mixed}   par       the parent node (to create a root node use either "#" (string) or `null`)
         * @param  {mixed}   node      the data for the new node (a valid JSON object, or a simple string with the name)
         * @param  {mixed}   pos       the index at which to insert the node, "first" and "last" are also supported, default is "last"
         * @param  {Function} callback a function to be called once the node is created
         * @param  {Boolean} is_loaded internal argument indicating if the parent node was succesfully loaded
         * @return {String}            the ID of the newly create node
         * @trigger model.jstree, create_node.jstree
         */
        create_node: function(par, node, pos, callback, is_loaded) {
            if (par === null) {
                par = "#";
            }
            par = this.get_node(par);
            if (!par) {
                return false;
            }
            pos = pos === undefined ? "last" : pos;
            if (!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)) {
                return this.load_node(par, function() {
                    this.create_node(par, node, pos, callback, true);
                });
            }
            if (!node) {
                node = {
                    "text": this.get_string('New node')
                };
            }
            if (typeof node === "string") {
                node = {
                    "text": node
                };
            }
            if (node.text === undefined) {
                node.text = this.get_string('New node');
            }
            var tmp, dpc, i, j;

            if (par.id === '#') {
                if (pos === "before") {
                    pos = "first";
                }
                if (pos === "after") {
                    pos = "last";
                }
            }
            switch (pos) {
                case "before":
                    tmp = this.get_node(par.parent);
                    pos = $.inArray(par.id, tmp.children);
                    par = tmp;
                    break;
                case "after":
                    tmp = this.get_node(par.parent);
                    pos = $.inArray(par.id, tmp.children) + 1;
                    par = tmp;
                    break;
                case "inside":
                case "first":
                    pos = 0;
                    break;
                case "last":
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
            if (!this.check("create_node", node, par, pos)) {
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
                "nodes": dpc,
                "parent": par.id
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
            /**
             * triggered when a node is created
             * @event
             * @name create_node.jstree
             * @param {Object} node
             * @param {String} parent the parent's ID
             * @param {Number} position the position of the new node among the parent's children
             */
            this.trigger('create_node', {
                "node": this.get_node(node),
                "parent": par.id,
                "position": pos
            });
            return node.id;
        },
        /**
         * set the text value of a node
         * @name rename_node(obj, val)
         * @param  {mixed} obj the node, you can pass an array to rename multiple nodes to the same name
         * @param  {String} val the new text value
         * @return {Boolean}
         * @trigger rename_node.jstree
         */
        rename_node: function(obj, val) {
            var t1, t2, old;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.rename_node(obj[t1], val);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            old = obj.text;
            if (!this.check("rename_node", obj, this.get_parent(obj), val)) {
                this.settings.core.error.call(this, this._data.core.last_error);
                return false;
            }
            this.set_text(obj, val); // .apply(this, Array.prototype.slice.call(arguments))
            /**
             * triggered when a node is renamed
             * @event
             * @name rename_node.jstree
             * @param {Object} node
             * @param {String} text the new value
             * @param {String} old the old value
             */
            this.trigger('rename_node', {
                "node": obj,
                "text": val,
                "old": old
            });
            return true;
        },
        /**
         * remove a node
         * @name delete_node(obj)
         * @param  {mixed} obj the node, you can pass an array to delete multiple nodes
         * @return {Boolean}
         * @trigger delete_node.jstree, changed.jstree
         */
        delete_node: function(obj) {
            var t1, t2, par, pos, tmp, i, j, k, l, c;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.delete_node(obj[t1]);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            par = this.get_node(obj.parent);
            pos = $.inArray(obj.id, par.children);
            c = false;
            if (!this.check("delete_node", obj, par, pos)) {
                this.settings.core.error.call(this, this._data.core.last_error);
                return false;
            }
            if (pos !== -1) {
                par.children = $.vakata.array_remove(par.children, pos);
            }
            tmp = obj.children_d.concat([]);
            tmp.push(obj.id);
            for (k = 0, l = tmp.length; k < l; k++) {
                for (i = 0, j = obj.parents.length; i < j; i++) {
                    pos = $.inArray(tmp[k], this._model.data[obj.parents[i]].children_d);
                    if (pos !== -1) {
                        this._model.data[obj.parents[i]].children_d = $.vakata.array_remove(this._model.data[obj.parents[i]].children_d, pos);
                    }
                }
                if (this._model.data[tmp[k]].state.selected) {
                    c = true;
                    pos = $.inArray(tmp[k], this._data.core.selected);
                    if (pos !== -1) {
                        this._data.core.selected = $.vakata.array_remove(this._data.core.selected, pos);
                    }
                }
            }
            /**
             * triggered when a node is deleted
             * @event
             * @name delete_node.jstree
             * @param {Object} node
             * @param {String} parent the parent's ID
             */
            this.trigger('delete_node', {
                "node": obj,
                "parent": par.id
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
            this.redraw_node(par, true);
            return true;
        },
        /**
         * check if an operation is premitted on the tree. Used internally.
         * @private
         * @name check(chk, obj, par, pos)
         * @param  {String} chk the operation to check, can be "create_node", "rename_node", "delete_node", "copy_node" or "move_node"
         * @param  {mixed} obj the node
         * @param  {mixed} par the parent
         * @param  {mixed} pos the position to insert at, or if "rename_node" - the new name
         * @param  {mixed} more some various additional information, for example if a "move_node" operations is triggered by DND this will be the hovered node
         * @return {Boolean}
         */
        check: function(chk, obj, par, pos, more) {
            obj = obj && obj.id ? obj : this.get_node(obj);
            par = par && par.id ? par : this.get_node(par);
            var tmp = chk.match(/^move_node|copy_node|create_node$/i) ? par : obj,
                chc = this.settings.core.check_callback;
            if (chk === "move_node" || chk === "copy_node") {
                if ((!more || !more.is_multi) && (obj.id === par.id || $.inArray(obj.id, par.children) === pos || $.inArray(par.id, obj.children_d) !== -1)) {
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
            if (chc === false || ($.isFunction(chc) && chc.call(this, chk, obj, par, pos, more) === false) || (chc && chc[chk] === false)) {
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
        /**
         * get the last error
         * @name last_error()
         * @return {Object}
         */
        last_error: function() {
            return this._data.core.last_error;
        },
        /**
         * move a node to a new parent
         * @name move_node(obj, par [, pos, callback, is_loaded])
         * @param  {mixed} obj the node to move, pass an array to move multiple nodes
         * @param  {mixed} par the new parent
         * @param  {mixed} pos the position to insert at (besides integer values, "first" and "last" are supported, as well as "before" and "after"), defaults to integer `0`
         * @param  {function} callback a function to call once the move is completed, receives 3 arguments - the node, the new parent and the position
         * @param  {Boolean} is_loaded internal parameter indicating if the parent node has been loaded
         * @param  {Boolean} skip_redraw internal parameter indicating if the tree should be redrawn
         * @param  {Boolean} instance internal parameter indicating if the node comes from another instance
         * @trigger move_node.jstree
         */
        move_node: function(obj, par, pos, callback, is_loaded, skip_redraw, origin) {
            var t1, t2, old_par, old_pos, new_par, old_ins, is_multi, dpc, tmp, i, j, k, l, p;

            par = this.get_node(par);
            pos = pos === undefined ? 0 : pos;
            if (!par) {
                return false;
            }
            if (!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)) {
                return this.load_node(par, function() {
                    this.move_node(obj, par, pos, callback, true, false, origin);
                });
            }

            if ($.isArray(obj)) {
                if (obj.length === 1) {
                    obj = obj[0];
                } else {
                    //obj = obj.slice();
                    for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                        if ((tmp = this.move_node(obj[t1], par, pos, callback, is_loaded, false, origin))) {
                            par = tmp;
                            pos = "after";
                        }
                    }
                    this.redraw();
                    return true;
                }
            }
            obj = obj && obj.id ? obj : this.get_node(obj);

            if (!obj || obj.id === '#') {
                return false;
            }

            old_par = (obj.parent || '#').toString();
            new_par = (!pos.toString().match(/^(before|after)$/) || par.id === '#') ? par : this.get_node(par.parent);
            old_ins = origin ? origin : (this._model.data[obj.id] ? this : $.jstree.reference(obj.id));
            is_multi = !old_ins || !old_ins._id || (this._id !== old_ins._id);
            old_pos = old_ins && old_ins._id && old_par && old_ins._model.data[old_par] && old_ins._model.data[old_par].children ? $.inArray(obj.id, old_ins._model.data[old_par].children) : -1;
            if (old_ins && old_ins._id) {
                obj = old_ins._model.data[obj.id];
            }

            if (is_multi) {
                if ((tmp = this.copy_node(obj, par, pos, callback, is_loaded, false, origin))) {
                    if (old_ins) {
                        old_ins.delete_node(obj);
                    }
                    return tmp;
                }
                return false;
            }
            //var m = this._model.data;
            if (par.id === '#') {
                if (pos === "before") {
                    pos = "first";
                }
                if (pos === "after") {
                    pos = "last";
                }
            }
            switch (pos) {
                case "before":
                    pos = $.inArray(par.id, new_par.children);
                    break;
                case "after":
                    pos = $.inArray(par.id, new_par.children) + 1;
                    break;
                case "inside":
                case "first":
                    pos = 0;
                    break;
                case "last":
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
            if (!this.check("move_node", obj, new_par, pos, {
                    'core': true,
                    'origin': origin,
                    'is_multi': (old_ins && old_ins._id && old_ins._id !== this._id),
                    'is_foreign': (!old_ins || !old_ins._id)
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
                this.redraw(new_par.id === '#');
            } else {
                // clean old parent and up
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

                // insert into new parent and up
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

                // update object
                obj.parent = new_par.id;
                tmp = new_par.parents.concat();
                tmp.unshift(new_par.id);
                p = obj.parents.length;
                obj.parents = tmp;

                // update object children
                tmp = tmp.concat();
                for (i = 0, j = obj.children_d.length; i < j; i++) {
                    this._model.data[obj.children_d[i]].parents = this._model.data[obj.children_d[i]].parents.slice(0, p * -1);
                    Array.prototype.push.apply(this._model.data[obj.children_d[i]].parents, tmp);
                }

                if (old_par === '#' || new_par.id === '#') {
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
            /**
             * triggered when a node is moved
             * @event
             * @name move_node.jstree
             * @param {Object} node
             * @param {String} parent the parent's ID
             * @param {Number} position the position of the node among the parent's children
             * @param {String} old_parent the old parent of the node
             * @param {Number} old_position the old position of the node
             * @param {Boolean} is_multi do the node and new parent belong to different instances
             * @param {jsTree} old_instance the instance the node came from
             * @param {jsTree} new_instance the instance of the new parent
             */
            this.trigger('move_node', {
                "node": obj,
                "parent": new_par.id,
                "position": pos,
                "old_parent": old_par,
                "old_position": old_pos,
                'is_multi': (old_ins && old_ins._id && old_ins._id !== this._id),
                'is_foreign': (!old_ins || !old_ins._id),
                'old_instance': old_ins,
                'new_instance': this
            });
            return obj.id;
        },
        /**
         * copy a node to a new parent
         * @name copy_node(obj, par [, pos, callback, is_loaded])
         * @param  {mixed} obj the node to copy, pass an array to copy multiple nodes
         * @param  {mixed} par the new parent
         * @param  {mixed} pos the position to insert at (besides integer values, "first" and "last" are supported, as well as "before" and "after"), defaults to integer `0`
         * @param  {function} callback a function to call once the move is completed, receives 3 arguments - the node, the new parent and the position
         * @param  {Boolean} is_loaded internal parameter indicating if the parent node has been loaded
         * @param  {Boolean} skip_redraw internal parameter indicating if the tree should be redrawn
         * @param  {Boolean} instance internal parameter indicating if the node comes from another instance
         * @trigger model.jstree copy_node.jstree
         */
        copy_node: function(obj, par, pos, callback, is_loaded, skip_redraw, origin) {
            var t1, t2, dpc, tmp, i, j, node, old_par, new_par, old_ins, is_multi;

            par = this.get_node(par);
            pos = pos === undefined ? 0 : pos;
            if (!par) {
                return false;
            }
            if (!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)) {
                return this.load_node(par, function() {
                    this.copy_node(obj, par, pos, callback, true, false, origin);
                });
            }

            if ($.isArray(obj)) {
                if (obj.length === 1) {
                    obj = obj[0];
                } else {
                    //obj = obj.slice();
                    for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                        if ((tmp = this.copy_node(obj[t1], par, pos, callback, is_loaded, true, origin))) {
                            par = tmp;
                            pos = "after";
                        }
                    }
                    this.redraw();
                    return true;
                }
            }
            obj = obj && obj.id ? obj : this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }

            old_par = (obj.parent || '#').toString();
            new_par = (!pos.toString().match(/^(before|after)$/) || par.id === '#') ? par : this.get_node(par.parent);
            old_ins = origin ? origin : (this._model.data[obj.id] ? this : $.jstree.reference(obj.id));
            is_multi = !old_ins || !old_ins._id || (this._id !== old_ins._id);

            if (old_ins && old_ins._id) {
                obj = old_ins._model.data[obj.id];
            }

            if (par.id === '#') {
                if (pos === "before") {
                    pos = "first";
                }
                if (pos === "after") {
                    pos = "last";
                }
            }
            switch (pos) {
                case "before":
                    pos = $.inArray(par.id, new_par.children);
                    break;
                case "after":
                    pos = $.inArray(par.id, new_par.children) + 1;
                    break;
                case "inside":
                case "first":
                    pos = 0;
                    break;
                case "last":
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
            if (!this.check("copy_node", obj, new_par, pos, {
                    'core': true,
                    'origin': origin,
                    'is_multi': (old_ins && old_ins._id && old_ins._id !== this._id),
                    'is_foreign': (!old_ins || !old_ins._id)
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
                "nodes": dpc,
                "parent": new_par.id
            });

            // insert into new parent and up
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

            if (new_par.id === '#') {
                this._model.force_full_redraw = true;
            }
            if (!this._model.force_full_redraw) {
                this._node_changed(new_par.id);
            }
            if (!skip_redraw) {
                this.redraw(new_par.id === '#');
            }
            if (callback) {
                callback.call(this, tmp, new_par, pos);
            }
            /**
             * triggered when a node is copied
             * @event
             * @name copy_node.jstree
             * @param {Object} node the copied node
             * @param {Object} original the original node
             * @param {String} parent the parent's ID
             * @param {Number} position the position of the node among the parent's children
             * @param {String} old_parent the old parent of the node
             * @param {Number} old_position the position of the original node
             * @param {Boolean} is_multi do the node and new parent belong to different instances
             * @param {jsTree} old_instance the instance the node came from
             * @param {jsTree} new_instance the instance of the new parent
             */
            this.trigger('copy_node', {
                "node": tmp,
                "original": obj,
                "parent": new_par.id,
                "position": pos,
                "old_parent": old_par,
                "old_position": old_ins && old_ins._id && old_par && old_ins._model.data[old_par] && old_ins._model.data[old_par].children ? $.inArray(obj.id, old_ins._model.data[old_par].children) : -1,
                'is_multi': (old_ins && old_ins._id && old_ins._id !== this._id),
                'is_foreign': (!old_ins || !old_ins._id),
                'old_instance': old_ins,
                'new_instance': this
            });
            return tmp.id;
        },
        /**
         * cut a node (a later call to `paste(obj)` would move the node)
         * @name cut(obj)
         * @param  {mixed} obj multiple objects can be passed using an array
         * @trigger cut.jstree
         */
        cut: function(obj) {
            if (!obj) {
                obj = this._data.core.selected.concat();
            }
            if (!$.isArray(obj)) {
                obj = [obj];
            }
            if (!obj.length) {
                return false;
            }
            var tmp = [],
                o, t1, t2;
            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                o = this.get_node(obj[t1]);
                if (o && o.id && o.id !== '#') {
                    tmp.push(o);
                }
            }
            if (!tmp.length) {
                return false;
            }
            ccp_node = tmp;
            ccp_inst = this;
            ccp_mode = 'move_node';
            /**
             * triggered when nodes are added to the buffer for moving
             * @event
             * @name cut.jstree
             * @param {Array} node
             */
            this.trigger('cut', {
                "node": obj
            });
        },
        /**
         * copy a node (a later call to `paste(obj)` would copy the node)
         * @name copy(obj)
         * @param  {mixed} obj multiple objects can be passed using an array
         * @trigger copy.jstree
         */
        copy: function(obj) {
            if (!obj) {
                obj = this._data.core.selected.concat();
            }
            if (!$.isArray(obj)) {
                obj = [obj];
            }
            if (!obj.length) {
                return false;
            }
            var tmp = [],
                o, t1, t2;
            for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                o = this.get_node(obj[t1]);
                if (o && o.id && o.id !== '#') {
                    tmp.push(o);
                }
            }
            if (!tmp.length) {
                return false;
            }
            ccp_node = tmp;
            ccp_inst = this;
            ccp_mode = 'copy_node';
            /**
             * triggered when nodes are added to the buffer for copying
             * @event
             * @name copy.jstree
             * @param {Array} node
             */
            this.trigger('copy', {
                "node": obj
            });
        },
        /**
         * get the current buffer (any nodes that are waiting for a paste operation)
         * @name get_buffer()
         * @return {Object} an object consisting of `mode` ("copy_node" or "move_node"), `node` (an array of objects) and `inst` (the instance)
         */
        get_buffer: function() {
            return {
                'mode': ccp_mode,
                'node': ccp_node,
                'inst': ccp_inst
            };
        },
        /**
         * check if there is something in the buffer to paste
         * @name can_paste()
         * @return {Boolean}
         */
        can_paste: function() {
            return ccp_mode !== false && ccp_node !== false; // && ccp_inst._model.data[ccp_node];
        },
        /**
         * copy or move the previously cut or copied nodes to a new parent
         * @name paste(obj [, pos])
         * @param  {mixed} obj the new parent
         * @param  {mixed} pos the position to insert at (besides integer, "first" and "last" are supported), defaults to integer `0`
         * @trigger paste.jstree
         */
        paste: function(obj, pos) {
            obj = this.get_node(obj);
            if (!obj || !ccp_mode || !ccp_mode.match(/^(copy_node|move_node)$/) || !ccp_node) {
                return false;
            }
            if (this[ccp_mode](ccp_node, obj, pos, false, false, false, ccp_inst)) {
                /**
                 * triggered when paste is invoked
                 * @event
                 * @name paste.jstree
                 * @param {String} parent the ID of the receiving node
                 * @param {Array} node the nodes in the buffer
                 * @param {String} mode the performed operation - "copy_node" or "move_node"
                 */
                this.trigger('paste', {
                    "parent": obj.id,
                    "node": ccp_node,
                    "mode": ccp_mode
                });
            }
            ccp_node = false;
            ccp_mode = false;
            ccp_inst = false;
        },
        /**
         * clear the buffer of previously copied or cut nodes
         * @name clear_buffer()
         * @trigger clear_buffer.jstree
         */
        clear_buffer: function() {
            ccp_node = false;
            ccp_mode = false;
            ccp_inst = false;
            /**
             * triggered when the copy / cut buffer is cleared
             * @event
             * @name clear_buffer.jstree
             */
            this.trigger('clear_buffer');
        },
        /**
         * put a node in edit mode (input field to rename the node)
         * @name edit(obj [, default_text, callback])
         * @param  {mixed} obj
         * @param  {String} default_text the text to populate the input with (if omitted or set to a non-string value the node's text value is used)
         * @param  {Function} callback a function to be called once the text box is blurred, it is called in the instance's scope and receives the node and a status parameter - true if the rename is successful, false otherwise. You can access the node's title using .text
         */
        edit: function(obj, default_text, callback) {
            var rtl, w, a, s, t, h1, h2, fn, tmp;
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
            this.set_text(obj, "");
            obj = this._open_to(obj);
            tmp.text = default_text;

            rtl = this._data.core.rtl;
            w = this.element.width();
            a = obj.children('.jstree-anchor');
            s = $('<span>');
            /*
			oi = obj.children("i:visible"),
			ai = a.children("i:visible"),
			w1 = oi.width() * oi.length,
			w2 = ai.width() * ai.length,
			*/
            t = default_text;
            h1 = $("<" + "div />", {
                css: {
                    "position": "absolute",
                    "top": "-200px",
                    "left": (rtl ? "0px" : "-1000px"),
                    "visibility": "hidden"
                }
            }).appendTo("body");
            h2 = $("<" + "input />", {
                "value": t,
                "class": "jstree-rename-input",
                // "size" : t.length,
                "css": {
                    "padding": "0",
                    "border": "1px solid silver",
                    "box-sizing": "border-box",
                    "display": "inline-block",
                    "height": (this._data.core.li_height) + "px",
                    "lineHeight": (this._data.core.li_height) + "px",
                    "width": "150px" // will be set a bit further down
                },
                "blur": $.proxy(function() {
                    var i = s.children(".jstree-rename-input"),
                        v = i.val(),
                        f = this.settings.core.force_text,
                        nv;
                    if (v === "") {
                        v = t;
                    }
                    h1.remove();
                    s.replaceWith(a);
                    s.remove();
                    t = f ? t : $('<div></div>').append($.parseHTML(t)).html();
                    this.set_text(obj, t);
                    nv = !!this.rename_node(obj, f ? $('<div></div>').text(v).text() : $('<div></div>').append($.parseHTML(v)).html());
                    if (!nv) {
                        this.set_text(obj, t); // move this up? and fix #483
                    }
                    if (callback) {
                        callback.call(this, tmp, nv);
                    }
                }, this),
                "keydown": function(event) {
                    var key = event.which;
                    if (key === 27) {
                        this.value = t;
                    }
                    if (key === 27 || key === 13 || key === 37 || key === 38 || key === 39 || key === 40 || key === 32) {
                        event.stopImmediatePropagation();
                    }
                    if (key === 27 || key === 13) {
                        event.preventDefault();
                        this.blur();
                    }
                },
                "click": function(e) {
                    e.stopImmediatePropagation();
                },
                "mousedown": function(e) {
                    e.stopImmediatePropagation();
                },
                "keyup": function(event) {
                    h2.width(Math.min(h1.text("pW" + this.value).width(), w));
                },
                "keypress": function(event) {
                    if (event.which === 13) {
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
            h2.css(fn).width(Math.min(h1.text("pW" + h2[0].value).width(), w))[0].select();
        },


        /**
         * changes the theme
         * @name set_theme(theme_name [, theme_url])
         * @param {String} theme_name the name of the new theme to apply
         * @param {mixed} theme_url  the location of the CSS file for this theme. Omit or set to `false` if you manually included the file. Set to `true` to autoload from the `core.themes.dir` directory.
         * @trigger set_theme.jstree
         */
        set_theme: function(theme_name, theme_url) {
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
            /**
             * triggered when a theme is set
             * @event
             * @name set_theme.jstree
             * @param {String} theme the new theme
             */
            this.trigger('set_theme', {
                'theme': theme_name
            });
        },
        /**
         * gets the name of the currently applied theme name
         * @name get_theme()
         * @return {String}
         */
        get_theme: function() {
            return this._data.core.themes.name;
        },
        /**
         * changes the theme variant (if the theme has variants)
         * @name set_theme_variant(variant_name)
         * @param {String|Boolean} variant_name the variant to apply (if `false` is used the current variant is removed)
         */
        set_theme_variant: function(variant_name) {
            if (this._data.core.themes.variant) {
                this.element.removeClass('jstree-' + this._data.core.themes.name + '-' + this._data.core.themes.variant);
            }
            this._data.core.themes.variant = variant_name;
            if (variant_name) {
                this.element.addClass('jstree-' + this._data.core.themes.name + '-' + this._data.core.themes.variant);
            }
        },
        /**
         * gets the name of the currently applied theme variant
         * @name get_theme()
         * @return {String}
         */
        get_theme_variant: function() {
            return this._data.core.themes.variant;
        },
        /**
         * shows a striped background on the container (if the theme supports it)
         * @name show_stripes()
         */
        show_stripes: function() {
            this._data.core.themes.stripes = true;
            this.get_container_ul().addClass("jstree-striped");
        },
        /**
         * hides the striped background on the container
         * @name hide_stripes()
         */
        hide_stripes: function() {
            this._data.core.themes.stripes = false;
            this.get_container_ul().removeClass("jstree-striped");
        },
        /**
         * toggles the striped background on the container
         * @name toggle_stripes()
         */
        toggle_stripes: function() {
            if (this._data.core.themes.stripes) {
                this.hide_stripes();
            } else {
                this.show_stripes();
            }
        },
        /**
         * shows the connecting dots (if the theme supports it)
         * @name show_dots()
         */
        show_dots: function() {
            this._data.core.themes.dots = true;
            this.get_container_ul().removeClass("jstree-no-dots");
        },
        /**
         * hides the connecting dots
         * @name hide_dots()
         */
        hide_dots: function() {
            this._data.core.themes.dots = false;
            this.get_container_ul().addClass("jstree-no-dots");
        },
        /**
         * toggles the connecting dots
         * @name toggle_dots()
         */
        toggle_dots: function() {
            if (this._data.core.themes.dots) {
                this.hide_dots();
            } else {
                this.show_dots();
            }
        },
        /**
         * show the node icons
         * @name show_icons()
         */
        show_icons: function() {
            this._data.core.themes.icons = true;
            this.get_container_ul().removeClass("jstree-no-icons");
        },
        /**
         * hide the node icons
         * @name hide_icons()
         */
        hide_icons: function() {
            this._data.core.themes.icons = false;
            this.get_container_ul().addClass("jstree-no-icons");
        },
        /**
         * toggle the node icons
         * @name toggle_icons()
         */
        toggle_icons: function() {
            if (this._data.core.themes.icons) {
                this.hide_icons();
            } else {
                this.show_icons();
            }
        },
        /**
         * set the node icon for a node
         * @name set_icon(obj, icon)
         * @param {mixed} obj
         * @param {String} icon the new icon - can be a path to an icon or a className, if using an image that is in the current directory use a `./` prefix, otherwise it will be detected as a class
         */
        set_icon: function(obj, icon) {
            var t1, t2, dom, old;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.set_icon(obj[t1], icon);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            old = obj.icon;
            obj.icon = icon === true || icon === null || icon === undefined || icon === '' ? true : icon;
            dom = this.get_node(obj, true).children(".jstree-anchor").children(".jstree-themeicon");
            if (icon === false) {
                this.hide_icon(obj);
            } else if (icon === true || icon === null || icon === undefined || icon === '') {
                dom.removeClass('jstree-themeicon-custom ' + old).css("background", "").removeAttr("rel");
                if (old === false) {
                    this.show_icon(obj);
                }
            } else if (icon.indexOf("/") === -1 && icon.indexOf(".") === -1) {
                dom.removeClass(old).css("background", "");
                dom.addClass(icon + ' jstree-themeicon-custom').attr("rel", icon);
                if (old === false) {
                    this.show_icon(obj);
                }
            } else {
                dom.removeClass(old).css("background", "");
                dom.addClass('jstree-themeicon-custom').css("background", "url('" + icon + "') center center no-repeat").attr("rel", icon);
                if (old === false) {
                    this.show_icon(obj);
                }
            }
            return true;
        },
        /**
         * get the node icon for a node
         * @name get_icon(obj)
         * @param {mixed} obj
         * @return {String}
         */
        get_icon: function(obj) {
            obj = this.get_node(obj);
            return (!obj || obj.id === '#') ? false : obj.icon;
        },
        /**
         * hide the icon on an individual node
         * @name hide_icon(obj)
         * @param {mixed} obj
         */
        hide_icon: function(obj) {
            var t1, t2;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.hide_icon(obj[t1]);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj === '#') {
                return false;
            }
            obj.icon = false;
            this.get_node(obj, true).children(".jstree-anchor").children(".jstree-themeicon").addClass('jstree-themeicon-hidden');
            return true;
        },
        /**
         * show the icon on an individual node
         * @name show_icon(obj)
         * @param {mixed} obj
         */
        show_icon: function(obj) {
            var t1, t2, dom;
            if ($.isArray(obj)) {
                obj = obj.slice();
                for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
                    this.show_icon(obj[t1]);
                }
                return true;
            }
            obj = this.get_node(obj);
            if (!obj || obj === '#') {
                return false;
            }
            dom = this.get_node(obj, true);
            obj.icon = dom.length ? dom.children(".jstree-anchor").children(".jstree-themeicon").attr('rel') : true;
            if (!obj.icon) {
                obj.icon = true;
            }
            dom.children(".jstree-anchor").children(".jstree-themeicon").removeClass('jstree-themeicon-hidden');
            return true;
        }
    };

    // helpers
    $.vakata = {};
    // collect attributes
    $.vakata.attributes = function(node, with_values) {
        node = $(node)[0];
        var attr = with_values ? {} : [];
        if (node && node.attributes) {
            $.each(node.attributes, function(i, v) {
                if ($.inArray(v.name.toLowerCase(), ['style', 'contenteditable', 'hasfocus', 'tabindex']) !== -1) {
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
    $.vakata.array_unique = function(array) {
        var a = [],
            i, j, l, o = {};
        for (i = 0, l = array.length; i < l; i++) {
            if (o[array[i]] === undefined) {
                a.push(array[i]);
                o[array[i]] = true;
            }
        }
        return a;
    };
    // remove item from array
    $.vakata.array_remove = function(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        array.push.apply(array, rest);
        return array;
    };
    // remove item from array
    $.vakata.array_remove_item = function(array, item) {
        var tmp = $.inArray(item, array);
        return tmp !== -1 ? $.vakata.array_remove(array, tmp) : array;
    };

    /**
     * ### Checkbox plugin
     *
     * This plugin renders checkbox icons in front of each node, making multiple selection much easier.
     * It also supports tri-state behavior, meaning that if a node has a few of its children checked it will be rendered as undetermined, and state will be propagated up.
     */
    var _i = document.createElement('I');
    _i.className = 'jstree-icon jstree-checkbox';
    _i.setAttribute('role', 'presentation');
    /**
     * stores all defaults for the checkbox plugin
     * @name $.jstree.defaults.checkbox
     * @plugin checkbox
     */
    $.jstree.defaults.checkbox = {
        /**
         * a boolean indicating if checkboxes should be visible (can be changed at a later time using `show_checkboxes()` and `hide_checkboxes`). Defaults to `true`.
         * @name $.jstree.defaults.checkbox.visible
         * @plugin checkbox
         */
        visible: true,
        /**
         * a boolean indicating if checkboxes should cascade down and have an undetermined state. Defaults to `true`.
         * @name $.jstree.defaults.checkbox.three_state
         * @plugin checkbox
         */
        three_state: true,
        /**
         * a boolean indicating if clicking anywhere on the node should act as clicking on the checkbox. Defaults to `true`.
         * @name $.jstree.defaults.checkbox.whole_node
         * @plugin checkbox
         */
        whole_node: true,
        /**
         * a boolean indicating if the selected style of a node should be kept, or removed. Defaults to `true`.
         * @name $.jstree.defaults.checkbox.keep_selected_style
         * @plugin checkbox
         */
        keep_selected_style: true,
        /**
         * This setting controls how cascading and undetermined nodes are applied.
         * If 'up' is in the string - cascading up is enabled, if 'down' is in the string - cascading down is enabled, if 'undetermined' is in the string - undetermined nodes will be used.
         * If `three_state` is set to `true` this setting is automatically set to 'up+down+undetermined'. Defaults to ''.
         * @name $.jstree.defaults.checkbox.cascade
         * @plugin checkbox
         */
        cascade: '',
        /**
         * This setting controls if checkbox are bound to the general tree selection or to an internal array maintained by the checkbox plugin. Defaults to `true`, only set to `false` if you know exactly what you are doing.
         * @name $.jstree.defaults.checkbox.tie_selection
         * @plugin checkbox
         */
        tie_selection: true
    };
    $.jstree.plugins.checkbox = function(options, parent) {
        this.bind = function() {
            parent.bind.call(this);
            this._data.checkbox.uto = false;
            this._data.checkbox.selected = [];
            if (this.settings.checkbox.three_state) {
                this.settings.checkbox.cascade = 'up+down+undetermined';
            }
            this.element
                .on("init.jstree", $.proxy(function() {
                    this._data.checkbox.visible = this.settings.checkbox.visible;
                    if (!this.settings.checkbox.keep_selected_style) {
                        this.element.addClass('jstree-checkbox-no-clicked');
                    }
                    if (this.settings.checkbox.tie_selection) {
                        this.element.addClass('jstree-checkbox-selection');
                    }
                }, this))
                .on("loading.jstree", $.proxy(function() {
                    this[this._data.checkbox.visible ? 'show_checkboxes' : 'hide_checkboxes']();
                }, this));
            if (this.settings.checkbox.cascade.indexOf('undetermined') !== -1) {
                this.element
                    .on('changed.jstree uncheck_node.jstree check_node.jstree uncheck_all.jstree check_all.jstree move_node.jstree copy_node.jstree redraw.jstree open_node.jstree', $.proxy(function() {
                        // only if undetermined is in setting
                        if (this._data.checkbox.uto) {
                            clearTimeout(this._data.checkbox.uto);
                        }
                        this._data.checkbox.uto = setTimeout($.proxy(this._undetermined, this), 50);
                    }, this));
            }
            if (!this.settings.checkbox.tie_selection) {
                this.element
                    .on('model.jstree', $.proxy(function(e, data) {
                        var m = this._model.data,
                            p = m[data.parent],
                            dpc = data.nodes,
                            i, j;
                        for (i = 0, j = dpc.length; i < j; i++) {
                            m[dpc[i]].state.checked = (m[dpc[i]].original && m[dpc[i]].original.state && m[dpc[i]].original.state.checked);
                            if (m[dpc[i]].state.checked) {
                                this._data.checkbox.selected.push(dpc[i]);
                            }
                        }
                    }, this));
            }
            if (this.settings.checkbox.cascade.indexOf('up') !== -1 || this.settings.checkbox.cascade.indexOf('down') !== -1) {
                this.element
                    .on('model.jstree', $.proxy(function(e, data) {
                        var m = this._model.data,
                            p = m[data.parent],
                            dpc = data.nodes,
                            chd = [],
                            c, i, j, k, l, tmp, s = this.settings.checkbox.cascade,
                            t = this.settings.checkbox.tie_selection;

                        if (s.indexOf('down') !== -1) {
                            // apply down
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
                            // apply up
                            for (i = 0, j = p.children_d.length; i < j; i++) {
                                if (!m[p.children_d[i]].children.length) {
                                    chd.push(m[p.children_d[i]].parent);
                                }
                            }
                            chd = $.vakata.array_unique(chd);
                            for (k = 0, l = chd.length; k < l; k++) {
                                p = m[chd[k]];
                                while (p && p.id !== '#') {
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
                    }, this))
                    .on(this.settings.checkbox.tie_selection ? 'select_node.jstree' : 'check_node.jstree', $.proxy(function(e, data) {
                        var obj = data.node,
                            m = this._model.data,
                            par = this.get_node(obj.parent),
                            dom = this.get_node(obj, true),
                            i, j, c, tmp, s = this.settings.checkbox.cascade,
                            t = this.settings.checkbox.tie_selection;

                        // apply down
                        if (s.indexOf('down') !== -1) {
                            this._data[t ? 'core' : 'checkbox'].selected = $.vakata.array_unique(this._data[t ? 'core' : 'checkbox'].selected.concat(obj.children_d));
                            for (i = 0, j = obj.children_d.length; i < j; i++) {
                                tmp = m[obj.children_d[i]];
                                tmp.state[t ? 'selected' : 'checked'] = true;
                                if (tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined) {
                                    tmp.original.state.undetermined = false;
                                }
                            }
                        }

                        // apply up
                        if (s.indexOf('up') !== -1) {
                            while (par && par.id !== '#') {
                                c = 0;
                                for (i = 0, j = par.children.length; i < j; i++) {
                                    c += m[par.children[i]].state[t ? 'selected' : 'checked'];
                                }
                                if (c === j) {
                                    par.state[t ? 'selected' : 'checked'] = true;
                                    this._data[t ? 'core' : 'checkbox'].selected.push(par.id);
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

                        // apply down (process .children separately?)
                        if (s.indexOf('down') !== -1 && dom.length) {
                            dom.find('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked').parent().attr('aria-selected', true);
                        }
                    }, this))
                    .on(this.settings.checkbox.tie_selection ? 'deselect_all.jstree' : 'uncheck_all.jstree', $.proxy(function(e, data) {
                        var obj = this.get_node('#'),
                            m = this._model.data,
                            i, j, tmp;
                        for (i = 0, j = obj.children_d.length; i < j; i++) {
                            tmp = m[obj.children_d[i]];
                            if (tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined) {
                                tmp.original.state.undetermined = false;
                            }
                        }
                    }, this))
                    .on(this.settings.checkbox.tie_selection ? 'deselect_node.jstree' : 'uncheck_node.jstree', $.proxy(function(e, data) {
                        var obj = data.node,
                            dom = this.get_node(obj, true),
                            i, j, tmp, s = this.settings.checkbox.cascade,
                            t = this.settings.checkbox.tie_selection;
                        if (obj && obj.original && obj.original.state && obj.original.state.undetermined) {
                            obj.original.state.undetermined = false;
                        }

                        // apply down
                        if (s.indexOf('down') !== -1) {
                            for (i = 0, j = obj.children_d.length; i < j; i++) {
                                tmp = this._model.data[obj.children_d[i]];
                                tmp.state[t ? 'selected' : 'checked'] = false;
                                if (tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined) {
                                    tmp.original.state.undetermined = false;
                                }
                            }
                        }

                        // apply up
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
                        tmp = [];
                        for (i = 0, j = this._data[t ? 'core' : 'checkbox'].selected.length; i < j; i++) {
                            // apply down + apply up
                            if (
                                (s.indexOf('down') === -1 || $.inArray(this._data[t ? 'core' : 'checkbox'].selected[i], obj.children_d) === -1) &&
                                (s.indexOf('up') === -1 || $.inArray(this._data[t ? 'core' : 'checkbox'].selected[i], obj.parents) === -1)
                            ) {
                                tmp.push(this._data[t ? 'core' : 'checkbox'].selected[i]);
                            }
                        }
                        this._data[t ? 'core' : 'checkbox'].selected = $.vakata.array_unique(tmp);

                        // apply down (process .children separately?)
                        if (s.indexOf('down') !== -1 && dom.length) {
                            dom.find('.jstree-anchor').removeClass(t ? 'jstree-clicked' : 'jstree-checked').parent().attr('aria-selected', false);
                        }
                    }, this));
            }
            if (this.settings.checkbox.cascade.indexOf('up') !== -1) {
                this.element
                    .on('delete_node.jstree', $.proxy(function(e, data) {
                        // apply up (whole handler)
                        var p = this.get_node(data.parent),
                            m = this._model.data,
                            i, j, c, tmp, t = this.settings.checkbox.tie_selection;
                        while (p && p.id !== '#') {
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
                    }, this))
                    .on('move_node.jstree', $.proxy(function(e, data) {
                        // apply up (whole handler)
                        var is_multi = data.is_multi,
                            old_par = data.old_parent,
                            new_par = this.get_node(data.parent),
                            m = this._model.data,
                            p, c, i, j, tmp, t = this.settings.checkbox.tie_selection;
                        if (!is_multi) {
                            p = this.get_node(old_par);
                            while (p && p.id !== '#') {
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
                        p = new_par;
                        while (p && p.id !== '#') {
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
        /**
         * set the undetermined state where and if necessary. Used internally.
         * @private
         * @name _undetermined()
         * @plugin checkbox
         */
        this._undetermined = function() {
            if (this.element === null) {
                return;
            }
            var i, j, k, l, o = {},
                m = this._model.data,
                t = this.settings.checkbox.tie_selection,
                s = this._data[t ? 'core' : 'checkbox'].selected,
                p = [],
                tt = this;
            for (i = 0, j = s.length; i < j; i++) {
                if (m[s[i]] && m[s[i]].parents) {
                    for (k = 0, l = m[s[i]].parents.length; k < l; k++) {
                        if (o[m[s[i]].parents[k]] === undefined && m[s[i]].parents[k] !== '#') {
                            o[m[s[i]].parents[k]] = true;
                            p.push(m[s[i]].parents[k]);
                        }
                    }
                }
            }
            // attempt for server side undetermined state
            this.element.find('.jstree-closed').not(':has(.jstree-children)')
                .each(function() {
                    var tmp = tt.get_node(this),
                        tmp2;
                    if (!tmp.state.loaded) {
                        if (tmp.original && tmp.original.state && tmp.original.state.undetermined && tmp.original.state.undetermined === true) {
                            if (o[tmp.id] === undefined && tmp.id !== '#') {
                                o[tmp.id] = true;
                                p.push(tmp.id);
                            }
                            for (k = 0, l = tmp.parents.length; k < l; k++) {
                                if (o[tmp.parents[k]] === undefined && tmp.parents[k] !== '#') {
                                    o[tmp.parents[k]] = true;
                                    p.push(tmp.parents[k]);
                                }
                            }
                        }
                    } else {
                        for (i = 0, j = tmp.children_d.length; i < j; i++) {
                            tmp2 = m[tmp.children_d[i]];
                            if (!tmp2.state.loaded && tmp2.original && tmp2.original.state && tmp2.original.state.undetermined && tmp2.original.state.undetermined === true) {
                                if (o[tmp2.id] === undefined && tmp2.id !== '#') {
                                    o[tmp2.id] = true;
                                    p.push(tmp2.id);
                                }
                                for (k = 0, l = tmp2.parents.length; k < l; k++) {
                                    if (o[tmp2.parents[k]] === undefined && tmp2.parents[k] !== '#') {
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
        this.redraw_node = function(obj, deep, is_callback, force_render) {
            obj = parent.redraw_node.apply(this, arguments);
            if (obj) {
                var i, j, tmp = null;
                for (i = 0, j = obj.childNodes.length; i < j; i++) {
                    if (obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf("jstree-anchor") !== -1) {
                        tmp = obj.childNodes[i];
                        break;
                    }
                }
                if (tmp) {
                    if (!this.settings.checkbox.tie_selection && this._model.data[obj.id].state.checked) {
                        tmp.className += ' jstree-checked';
                    }
                    tmp.insertBefore(_i.cloneNode(false), tmp.childNodes[0]);
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
        /**
         * show the node checkbox icons
         * @name show_checkboxes()
         * @plugin checkbox
         */
        this.show_checkboxes = function() {
            this._data.core.themes.checkboxes = true;
            this.get_container_ul().removeClass("jstree-no-checkboxes");
        };
        /**
         * hide the node checkbox icons
         * @name hide_checkboxes()
         * @plugin checkbox
         */
        this.hide_checkboxes = function() {
            this._data.core.themes.checkboxes = false;
            this.get_container_ul().addClass("jstree-no-checkboxes");
        };
        /**
         * toggle the node icons
         * @name toggle_checkboxes()
         * @plugin checkbox
         */
        this.toggle_checkboxes = function() {
            if (this._data.core.themes.checkboxes) {
                this.hide_checkboxes();
            } else {
                this.show_checkboxes();
            }
        };
        /**
         * checks if a node is in an undetermined state
         * @name is_undetermined(obj)
         * @param  {mixed} obj
         * @return {Boolean}
         */
        this.is_undetermined = function(obj) {
            obj = this.get_node(obj);
            var s = this.settings.checkbox.cascade,
                i, j, t = this.settings.checkbox.tie_selection,
                d = this._data[t ? 'core' : 'checkbox'].selected,
                m = this._model.data;
            if (!obj || obj.state[t ? 'selected' : 'checked'] === true || s.indexOf('undetermined') === -1 || (s.indexOf('down') === -1 && s.indexOf('up') === -1)) {
                return false;
            }
            if (!obj.state.loaded && obj.original.state.undetermined === true) {
                return true;
            }
            for (i = 0, j = obj.children_d.length; i < j; i++) {
                if ($.inArray(obj.children_d[i], d) !== -1 || (!m[obj.children_d[i]].state.loaded && m[obj.children_d[i]].original.state.undetermined)) {
                    return true;
                }
            }
            return false;
        };

        this.activate_node = function(obj, e) {
            if (this.settings.checkbox.tie_selection && (this.settings.checkbox.whole_node || $(e.target).hasClass('jstree-checkbox'))) {
                e.ctrlKey = true;
            }
            if (this.settings.checkbox.tie_selection || (!this.settings.checkbox.whole_node && !$(e.target).hasClass('jstree-checkbox'))) {
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
            this.trigger('activate_node', {
                'node': this.get_node(obj)
            });
        };

        /**
         * check a node (only if tie_selection in checkbox settings is false, otherwise select_node will be called internally)
         * @name check_node(obj)
         * @param {mixed} obj an array can be used to check multiple nodes
         * @trigger check_node.jstree
         * @plugin checkbox
         */
        this.check_node = function(obj, e) {
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
            if (!obj || obj.id === '#') {
                return false;
            }
            dom = this.get_node(obj, true);
            if (!obj.state.checked) {
                obj.state.checked = true;
                this._data.checkbox.selected.push(obj.id);
                if (dom && dom.length) {
                    dom.children('.jstree-anchor').addClass('jstree-checked');
                }
                /**
                 * triggered when an node is checked (only if tie_selection in checkbox settings is false)
                 * @event
                 * @name check_node.jstree
                 * @param {Object} node
                 * @param {Array} selected the current selection
                 * @param {Object} event the event (if any) that triggered this check_node
                 * @plugin checkbox
                 */
                this.trigger('check_node', {
                    'node': obj,
                    'selected': this._data.checkbox.selected,
                    'event': e
                });
            }
        };
        /**
         * uncheck a node (only if tie_selection in checkbox settings is false, otherwise deselect_node will be called internally)
         * @name uncheck_node(obj)
         * @param {mixed} obj an array can be used to uncheck multiple nodes
         * @trigger uncheck_node.jstree
         * @plugin checkbox
         */
        this.uncheck_node = function(obj, e) {
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
            if (!obj || obj.id === '#') {
                return false;
            }
            dom = this.get_node(obj, true);
            if (obj.state.checked) {
                obj.state.checked = false;
                this._data.checkbox.selected = $.vakata.array_remove_item(this._data.checkbox.selected, obj.id);
                if (dom.length) {
                    dom.children('.jstree-anchor').removeClass('jstree-checked');
                }
                /**
                 * triggered when an node is unchecked (only if tie_selection in checkbox settings is false)
                 * @event
                 * @name uncheck_node.jstree
                 * @param {Object} node
                 * @param {Array} selected the current selection
                 * @param {Object} event the event (if any) that triggered this uncheck_node
                 * @plugin checkbox
                 */
                this.trigger('uncheck_node', {
                    'node': obj,
                    'selected': this._data.checkbox.selected,
                    'event': e
                });
            }
        };
        /**
         * checks all nodes in the tree (only if tie_selection in checkbox settings is false, otherwise select_all will be called internally)
         * @name check_all()
         * @trigger check_all.jstree, changed.jstree
         * @plugin checkbox
         */
        this.check_all = function() {
            if (this.settings.checkbox.tie_selection) {
                return this.select_all();
            }
            var tmp = this._data.checkbox.selected.concat([]),
                i, j;
            this._data.checkbox.selected = this._model.data['#'].children_d.concat();
            for (i = 0, j = this._data.checkbox.selected.length; i < j; i++) {
                if (this._model.data[this._data.checkbox.selected[i]]) {
                    this._model.data[this._data.checkbox.selected[i]].state.checked = true;
                }
            }
            this.redraw(true);
            /**
             * triggered when all nodes are checked (only if tie_selection in checkbox settings is false)
             * @event
             * @name check_all.jstree
             * @param {Array} selected the current selection
             * @plugin checkbox
             */
            this.trigger('check_all', {
                'selected': this._data.checkbox.selected
            });
        };
        /**
         * uncheck all checked nodes (only if tie_selection in checkbox settings is false, otherwise deselect_all will be called internally)
         * @name uncheck_all()
         * @trigger uncheck_all.jstree
         * @plugin checkbox
         */
        this.uncheck_all = function() {
            if (this.settings.checkbox.tie_selection) {
                return this.deselect_all();
            }
            var tmp = this._data.checkbox.selected.concat([]),
                i, j;
            for (i = 0, j = this._data.checkbox.selected.length; i < j; i++) {
                if (this._model.data[this._data.checkbox.selected[i]]) {
                    this._model.data[this._data.checkbox.selected[i]].state.checked = false;
                }
            }
            this._data.checkbox.selected = [];
            this.element.find('.jstree-checked').removeClass('jstree-checked');
            /**
             * triggered when all nodes are unchecked (only if tie_selection in checkbox settings is false)
             * @event
             * @name uncheck_all.jstree
             * @param {Object} node the previous selection
             * @param {Array} selected the current selection
             * @plugin checkbox
             */
            this.trigger('uncheck_all', {
                'selected': this._data.checkbox.selected,
                'node': tmp
            });
        };
        /**
         * checks if a node is checked (if tie_selection is on in the settings this function will return the same as is_selected)
         * @name is_checked(obj)
         * @param  {mixed}  obj
         * @return {Boolean}
         * @plugin checkbox
         */
        this.is_checked = function(obj) {
            if (this.settings.checkbox.tie_selection) {
                return this.is_selected(obj);
            }
            obj = this.get_node(obj);
            if (!obj || obj.id === '#') {
                return false;
            }
            return obj.state.checked;
        };
        /**
         * get an array of all checked nodes (if tie_selection is on in the settings this function will return the same as get_selected)
         * @name get_checked([full])
         * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
         * @return {Array}
         * @plugin checkbox
         */
        this.get_checked = function(full) {
            if (this.settings.checkbox.tie_selection) {
                return this.get_selected(full);
            }
            return full ? $.map(this._data.checkbox.selected, $.proxy(function(i) {
                return this.get_node(i);
            }, this)) : this._data.checkbox.selected;
        };
        /**
         * get an array of all top level checked nodes (ignoring children of checked nodes) (if tie_selection is on in the settings this function will return the same as get_top_selected)
         * @name get_top_checked([full])
         * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
         * @return {Array}
         * @plugin checkbox
         */
        this.get_top_checked = function(full) {
            if (this.settings.checkbox.tie_selection) {
                return this.get_top_selected(full);
            }
            var tmp = this.get_checked(true),
                obj = {},
                i, j, k, l;
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
            return full ? $.map(tmp, $.proxy(function(i) {
                return this.get_node(i);
            }, this)) : tmp;
        };
        /**
         * get an array of all bottom level checked nodes (ignoring selected parents) (if tie_selection is on in the settings this function will return the same as get_bottom_selected)
         * @name get_bottom_checked([full])
         * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
         * @return {Array}
         * @plugin checkbox
         */
        this.get_bottom_checked = function(full) {
            if (this.settings.checkbox.tie_selection) {
                return this.get_bottom_selected(full);
            }
            var tmp = this.get_checked(true),
                obj = [],
                i, j;
            for (i = 0, j = tmp.length; i < j; i++) {
                if (!tmp[i].children.length) {
                    obj.push(tmp[i].id);
                }
            }
            return full ? $.map(obj, $.proxy(function(i) {
                return this.get_node(i);
            }, this)) : obj;
        };
        this.load_node = function(obj, callback) {
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
        this.get_state = function() {
            var state = parent.get_state.apply(this, arguments);
            if (this.settings.checkbox.tie_selection) {
                return state;
            }
            state.checkbox = this._data.checkbox.selected.slice();
            return state;
        };
        this.set_state = function(state, callback) {
            var res = parent.set_state.apply(this, arguments);
            if (res && state.checkbox) {
                if (!this.settings.checkbox.tie_selection) {
                    this.uncheck_all();
                    var _this = this;
                    $.each(state.checkbox, function(i, v) {
                        _this.check_node(v);
                    });
                }
                delete state.checkbox;
                this.set_state(state, callback);
                return false;
            }
            return res;
        };
    };
    // include the checkbox plugin by default
    // $.jstree.defaults.plugins.push("checkbox");

    /**
     * ### Wholerow plugin
     *
     * Makes each node appear block level. Making selection easier. May cause slow down for large trees in old browsers.
     */
    var div = document.createElement('DIV');
    div.setAttribute('unselectable', 'on');
    div.setAttribute('role', 'presentation');
    div.className = 'jstree-wholerow';
    div.innerHTML = '&#160;';
    $.jstree.plugins.wholerow = function(options, parent) {
        this.bind = function() {
            parent.bind.call(this);

            this.element
                .on('ready.jstree set_state.jstree', $.proxy(function() {
                    this.hide_dots();
                }, this))
                .on("init.jstree loading.jstree ready.jstree", $.proxy(function() {
                    //div.style.height = this._data.core.li_height + 'px';
                    this.get_container_ul().addClass('jstree-wholerow-ul');
                }, this))
                .on("deselect_all.jstree", $.proxy(function(e, data) {
                    this.element.find('.jstree-wholerow-clicked').removeClass('jstree-wholerow-clicked');
                }, this))
                .on("changed.jstree", $.proxy(function(e, data) {
                    this.element.find('.jstree-wholerow-clicked').removeClass('jstree-wholerow-clicked');
                    var tmp = false,
                        i, j;
                    for (i = 0, j = data.selected.length; i < j; i++) {
                        tmp = this.get_node(data.selected[i], true);
                        if (tmp && tmp.length) {
                            tmp.children('.jstree-wholerow').addClass('jstree-wholerow-clicked');
                        }
                    }
                }, this))
                .on("open_node.jstree", $.proxy(function(e, data) {
                    this.get_node(data.node, true).find('.jstree-clicked').parent().children('.jstree-wholerow').addClass('jstree-wholerow-clicked');
                }, this))
                .on("hover_node.jstree dehover_node.jstree", $.proxy(function(e, data) {
                    if (e.type === "hover_node" && this.is_disabled(data.node)) {
                        return;
                    }
                    this.get_node(data.node, true).children('.jstree-wholerow')[e.type === "hover_node" ? "addClass" : "removeClass"]('jstree-wholerow-hovered');
                }, this))
                .on("contextmenu.jstree", ".jstree-wholerow", $.proxy(function(e) {
                    e.preventDefault();
                    var tmp = $.Event('contextmenu', {
                        metaKey: e.metaKey,
                        ctrlKey: e.ctrlKey,
                        altKey: e.altKey,
                        shiftKey: e.shiftKey,
                        pageX: e.pageX,
                        pageY: e.pageY
                    });
                    $(e.currentTarget).closest(".jstree-node").children(".jstree-anchor").first().trigger(tmp);
                }, this))
                /*
				.on("mousedown.jstree touchstart.jstree", ".jstree-wholerow", function (e) {
						if(e.target === e.currentTarget) {
							var a = $(e.currentTarget).closest(".jstree-node").children(".jstree-anchor");
							e.target = a[0];
							a.trigger(e);
						}
					})
				*/
                .on("click.jstree", ".jstree-wholerow", function(e) {
                    e.stopImmediatePropagation();
                    var tmp = $.Event('click', {
                        metaKey: e.metaKey,
                        ctrlKey: e.ctrlKey,
                        altKey: e.altKey,
                        shiftKey: e.shiftKey
                    });
                    $(e.currentTarget).closest(".jstree-node").children(".jstree-anchor").first().trigger(tmp).focus();
                })
                .on("click.jstree", ".jstree-leaf > .jstree-ocl", $.proxy(function(e) {
                    e.stopImmediatePropagation();
                    var tmp = $.Event('click', {
                        metaKey: e.metaKey,
                        ctrlKey: e.ctrlKey,
                        altKey: e.altKey,
                        shiftKey: e.shiftKey
                    });
                    $(e.currentTarget).closest(".jstree-node").children(".jstree-anchor").first().trigger(tmp).focus();
                }, this))
                .on("mouseover.jstree", ".jstree-wholerow, .jstree-icon", $.proxy(function(e) {
                    e.stopImmediatePropagation();
                    if (!this.is_disabled(e.currentTarget)) {
                        this.hover_node(e.currentTarget);
                    }
                    return false;
                }, this))
                .on("mouseleave.jstree", ".jstree-node", $.proxy(function(e) {
                    this.dehover_node(e.currentTarget);
                }, this));
        };
        this.teardown = function() {
            if (this.settings.wholerow) {
                this.element.find(".jstree-wholerow").remove();
            }
            parent.teardown.call(this);
        };
        this.redraw_node = function(obj, deep, callback, force_render) {
            obj = parent.redraw_node.apply(this, arguments);
            if (obj) {
                var tmp = div.cloneNode(true);
                //tmp.style.height = this._data.core.li_height + 'px';
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
    // include the wholerow plugin by default
    // $.jstree.defaults.plugins.push("wholerow");

    if (document.registerElement && Object && Object.create) {
        var proto = Object.create(HTMLElement.prototype);
        proto.createdCallback = function() {
            var c = {
                    core: {},
                    plugins: []
                },
                i;
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
        // proto.attributeChangedCallback = function (name, previous, value) { };
        try {
            document.registerElement("vakata-jstree", {
                prototype: proto
            });
        } catch (ignore) {}
    }

    return $.jstree;
});
/**
 * @ignore
 */
define('ui/Tree',['require','dep/jquery.jstree'],function(require) {
    var JSTree = require('dep/jquery.jstree');

    /**
     * Tree constructor
     *
     * More details about options, methods and events, see [jstree API](https://www.jstree.com/api/)
     * <iframe width="100%" height="200" src="//jsfiddle.net/bizdevfe/cysonubv/1/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} tree 目标元素
     * @param {Object} [options] 参数
     */
    function Tree(tree, options) {
        this.instance = JSTree.create(tree, options);
    }

    Tree.prototype = {
        /**
         * 获取jstree实例
         * @return {Object}
         */
        ins: function() {
            return this.instance;
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.instance.destroy();
        }
    };

    function isTree(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
    }

    var dataKey = 'bizTree';

    $.extend($.fn, {
        bizTree: function(method, options) {
            var tree;
            switch (method) {
                case 'ins':
                    return this.data(dataKey).ins();
                case 'destroy':
                    this.each(function() {
                        tree = $(this).data(dataKey);
                        if (tree) {
                            tree.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTree(this)) {
                            $(this).data(dataKey, new Tree(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Tree;
});
/**
 * @ignore
 */
define('dep/jquery.datepicker',['require'],function(require) {
    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }

    function UTCToday() {
        var today = new Date();
        return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
    }

    function isUTCEquals(date1, date2) {
        return (
            date1.getUTCFullYear() === date2.getUTCFullYear() &&
            date1.getUTCMonth() === date2.getUTCMonth() &&
            date1.getUTCDate() === date2.getUTCDate()
        );
    }

    function alias(method) {
        return function() {
            return this[method].apply(this, arguments);
        };
    }

    var DateArray = (function() {
        var extras = {
            get: function(i) {
                return this.slice(i)[0];
            },
            contains: function(d) {
                // Array.indexOf is not cross-browser;
                // $.inArray doesn't work with Dates
                var val = d && d.valueOf();
                for (var i = 0, l = this.length; i < l; i++)
                    if (this[i].valueOf() === val)
                        return i;
                return -1;
            },
            remove: function(i) {
                this.splice(i, 1);
            },
            replace: function(new_array) {
                if (!new_array)
                    return;
                if (!$.isArray(new_array))
                    new_array = [new_array];
                this.clear();
                this.push.apply(this, new_array);
            },
            clear: function() {
                this.length = 0;
            },
            copy: function() {
                var a = new DateArray();
                a.replace(this);
                return a;
            }
        };

        return function() {
            var a = [];
            a.push.apply(a, arguments);
            $.extend(a, extras);
            return a;
        };
    })();


    // Picker object

    var Datepicker = function(element, options) {
        this._process_options(options);

        this.dates = new DateArray();
        this.viewDate = this.o.defaultViewDate;
        this.focusDate = null;

        this.element = $(element);
        this.isInline = false;
        this.isInput = this.element.is('input');
        this.component = this.element.hasClass('date') ? this.element.find('.add-on, .input-group-addon, .btn') : false;
        this.hasInput = this.component && this.element.find('input').length;
        if (this.component && this.component.length === 0)
            this.component = false;

        this.picker = $(DPGlobal.template);
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
            this.picker.find('tfoot .today, tfoot .clear')
            .attr('colspan', function(i, val) {
                return parseInt(val) + 1;
            });

        this._allow_update = false;

        this.setStartDate(this._o.startDate);
        this.setEndDate(this._o.endDate);
        this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);
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

        _process_options: function(opts) {
            // Store raw options for reference
            this._o = $.extend({}, this._o, opts);
            // Processed options
            var o = this.o = $.extend({}, this._o);

            // Check if "de-DE" style date is available, if not language should
            // fallback to 2 letter code eg "de"
            var lang = o.language;
            if (!dates[lang]) {
                lang = lang.split('-')[0];
                if (!dates[lang])
                    lang = defaults.language;
            }
            o.language = lang;

            switch (o.startView) {
                case 2:
                case 'decade':
                    o.startView = 2;
                    break;
                case 1:
                case 'year':
                    o.startView = 1;
                    break;
                default:
                    o.startView = 0;
            }

            switch (o.minViewMode) {
                case 1:
                case 'months':
                    o.minViewMode = 1;
                    break;
                case 2:
                case 'years':
                    o.minViewMode = 2;
                    break;
                default:
                    o.minViewMode = 0;
            }

            o.startView = Math.max(o.startView, o.minViewMode);

            // true, false, or Number > 0
            if (o.multidate !== true) {
                o.multidate = Number(o.multidate) || false;
                if (o.multidate !== false)
                    o.multidate = Math.max(0, o.multidate);
            }
            o.multidateSeparator = String(o.multidateSeparator);

            o.weekStart %= 7;
            o.weekEnd = ((o.weekStart + 6) % 7);

            var format = DPGlobal.parseFormat(o.format);
            if (o.startDate !== -Infinity) {
                if (!!o.startDate) {
                    if (o.startDate instanceof Date)
                        o.startDate = this._local_to_utc(this._zero_time(o.startDate));
                    else
                        o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
                } else {
                    o.startDate = -Infinity;
                }
            }
            if (o.endDate !== Infinity) {
                if (!!o.endDate) {
                    if (o.endDate instanceof Date)
                        o.endDate = this._local_to_utc(this._zero_time(o.endDate));
                    else
                        o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
                } else {
                    o.endDate = Infinity;
                }
            }

            o.daysOfWeekDisabled = o.daysOfWeekDisabled || [];
            if (!$.isArray(o.daysOfWeekDisabled))
                o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
            o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function(d) {
                return parseInt(d, 10);
            });

            o.datesDisabled = o.datesDisabled || [];
            if (!$.isArray(o.datesDisabled)) {
                var datesDisabled = [];
                datesDisabled.push(DPGlobal.parseDate(o.datesDisabled, format, o.language));
                o.datesDisabled = datesDisabled;
            }
            o.datesDisabled = $.map(o.datesDisabled, function(d) {
                return DPGlobal.parseDate(d, format, o.language);
            });

            var plc = String(o.orientation).toLowerCase().split(/\s+/g),
                _plc = o.orientation.toLowerCase();
            plc = $.grep(plc, function(word) {
                return /^auto|left|right|top|bottom$/.test(word);
            });
            o.orientation = {
                x: 'auto',
                y: 'auto'
            };
            if (!_plc || _plc === 'auto')
            ; // no action
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
                _plc = $.grep(plc, function(word) {
                    return /^left|right$/.test(word);
                });
                o.orientation.x = _plc[0] || 'auto';

                _plc = $.grep(plc, function(word) {
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
            o.showOnFocus = o.showOnFocus !== undefined ? o.showOnFocus : true;
        },
        _events: [],
        _secondaryEvents: [],
        _applyEvents: function(evs) {
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
        _unapplyEvents: function(evs) {
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
        _buildEvents: function() {
            var events = {
                keyup: $.proxy(function(e) {
                    if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
                        this.update();
                }, this),
                keydown: $.proxy(this.keydown, this)
            };

            if (this.o.showOnFocus === true) {
                events.focus = $.proxy(this.show, this);
            }

            if (this.isInput) { // single input
                this._events = [
                    [this.element, events]
                ];
            } else if (this.component && this.hasInput) { // component: input + button
                this._events = [
                    // For components that are not readonly, allow keyboard nav
                    [this.element.find('input'), events],
                    [this.component, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            } else if (this.element.is('div')) { // inline datepicker
                this.isInline = true;
            } else {
                this._events = [
                    [this.element, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            }
            this._events.push(
                // Component: listen for blur on element descendants
                [this.element, '*', {
                    blur: $.proxy(function(e) {
                        this._focused_from = e.target;
                    }, this)
                }],
                // Input: listen for blur on element
                [this.element, {
                    blur: $.proxy(function(e) {
                        this._focused_from = e.target;
                    }, this)
                }]
            );

            this._secondaryEvents = [
                [this.picker, {
                    click: $.proxy(this.click, this)
                }],
                [$(window), {
                    resize: $.proxy(this.place, this)
                }],
                [$(document), {
                    'mousedown touchstart': $.proxy(function(e) {
                        // Clicked outside the datepicker, hide it
                        if (!(
                                this.element.is(e.target) ||
                                this.element.find(e.target).length ||
                                this.picker.is(e.target) ||
                                this.picker.find(e.target).length
                            )) {
                            this.hide();
                        }
                    }, this)
                }]
            ];
        },
        _attachEvents: function() {
            this._detachEvents();
            this._applyEvents(this._events);
        },
        _detachEvents: function() {
            this._unapplyEvents(this._events);
        },
        _attachSecondaryEvents: function() {
            this._detachSecondaryEvents();
            this._applyEvents(this._secondaryEvents);
        },
        _detachSecondaryEvents: function() {
            this._unapplyEvents(this._secondaryEvents);
        },
        _trigger: function(event, altdate) {
            var date = altdate || this.dates.get(-1),
                local_date = this._utc_to_local(date);

            this.element.trigger({
                type: event,
                date: local_date,
                dates: $.map(this.dates, this._utc_to_local),
                format: $.proxy(function(ix, format) {
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

        show: function() {
            if (this.element.attr('readonly') && this.o.enableOnReadonly === false)
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

        hide: function() {
            if (this.isInline)
                return this;
            if (!this.picker.is(':visible'))
                return this;
            this.focusDate = null;
            this.picker.hide().detach();
            this._detachSecondaryEvents();
            this.viewMode = this.o.startView;
            this.showMode();

            if (
                this.o.forceParse &&
                (
                    this.isInput && this.element.val() ||
                    this.hasInput && this.element.find('input').val()
                )
            )
                this.setValue();
            this._trigger('hide');
            return this;
        },

        remove: function() {
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

        _utc_to_local: function(utc) {
            return utc && new Date(utc.getTime() + (utc.getTimezoneOffset() * 60000));
        },
        _local_to_utc: function(local) {
            return local && new Date(local.getTime() - (local.getTimezoneOffset() * 60000));
        },
        _zero_time: function(local) {
            return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
        },
        _zero_utc_time: function(utc) {
            return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
        },

        getDates: function() {
            return $.map(this.dates, this._utc_to_local);
        },

        getUTCDates: function() {
            return $.map(this.dates, function(d) {
                return new Date(d);
            });
        },

        getDate: function() {
            return this._utc_to_local(this.getUTCDate());
        },

        getUTCDate: function() {
            var selected_date = this.dates.get(-1);
            if (typeof selected_date !== 'undefined') {
                return new Date(selected_date);
            } else {
                return null;
            }
        },

        clearDates: function() {
            var element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }

            if (element) {
                element.val('').change();
            }

            this.update();
            this._trigger('changeDate');

            if (this.o.autoclose) {
                this.hide();
            }
        },
        setDates: function() {
            var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
            this.update.apply(this, args);
            this._trigger('changeDate');
            this.setValue();
            return this;
        },

        setUTCDates: function() {
            var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
            this.update.apply(this, $.map(args, this._utc_to_local));
            this._trigger('changeDate');
            this.setValue();
            return this;
        },

        setDate: alias('setDates'),
        setUTCDate: alias('setUTCDates'),

        setValue: function() {
            var formatted = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').val(formatted).change();
                }
            } else {
                this.element.val(formatted).change();
            }
            return this;
        },

        getFormattedDate: function(format) {
            if (format === undefined)
                format = this.o.format;

            var lang = this.o.language;
            return $.map(this.dates, function(d) {
                return DPGlobal.formatDate(d, format, lang);
            }).join(this.o.multidateSeparator);
        },

        setStartDate: function(startDate) {
            this._process_options({
                startDate: startDate
            });
            this.update();
            this.updateNavArrows();
            return this;
        },

        setEndDate: function(endDate) {
            this._process_options({
                endDate: endDate
            });
            this.update();
            this.updateNavArrows();
            return this;
        },

        setDaysOfWeekDisabled: function(daysOfWeekDisabled) {
            this._process_options({
                daysOfWeekDisabled: daysOfWeekDisabled
            });
            this.update();
            this.updateNavArrows();
            return this;
        },

        setDatesDisabled: function(datesDisabled) {
            this._process_options({
                datesDisabled: datesDisabled
            });
            this.update();
            this.updateNavArrows();
        },

        place: function() {
            if (this.isInline)
                return this;
            var calendarWidth = this.picker.outerWidth(),
                calendarHeight = this.picker.outerHeight(),
                visualPadding = 10,
                windowWidth = $(this.o.container).width(),
                windowHeight = $(this.o.container).height(),
                scrollTop = $(this.o.container).scrollTop(),
                appendOffset = $(this.o.container).offset();

            var parentsZindex = [];
            this.element.parents().each(function() {
                var itemZIndex = $(this).css('z-index');
                if (itemZIndex !== 'auto' && itemZIndex !== 0) parentsZindex.push(parseInt(itemZIndex));
            });
            var zIndex = Math.max.apply(Math, parentsZindex) + 10;
            var offset = this.component ? this.component.parent().offset() : this.element.offset();
            var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
            var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
            var left = offset.left - appendOffset.left,
                top = offset.top - appendOffset.top;

            this.picker.removeClass(
                'datepicker-orient-top datepicker-orient-bottom ' +
                'datepicker-orient-right datepicker-orient-left'
            );

            if (this.o.orientation.x !== 'auto') {
                this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
                if (this.o.orientation.x === 'right')
                    left -= calendarWidth - width;
            }
            // auto x orientation is best-placement: if it crosses a window
            // edge, fudge it sideways
            else {
                if (offset.left < 0) {
                    // component is outside the window on the left side. Move it into visible range
                    this.picker.addClass('datepicker-orient-left');
                    left -= offset.left - visualPadding;
                } else if (left + calendarWidth > windowWidth) {
                    // the calendar passes the widow right edge. Align it to component right side
                    this.picker.addClass('datepicker-orient-right');
                    left = offset.left + width - calendarWidth;
                } else {
                    // Default to left
                    this.picker.addClass('datepicker-orient-left');
                }
            }

            // auto y orientation is best-situation: top or bottom, no fudging,
            // decision based on which shows more of the calendar
            var yorient = this.o.orientation.y,
                top_overflow, bottom_overflow;
            if (yorient === 'auto') {
                top_overflow = -scrollTop + top - calendarHeight;
                bottom_overflow = scrollTop + windowHeight - (top + height + calendarHeight);
                if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
                    yorient = 'top';
                else
                    yorient = 'bottom';
            }
            this.picker.addClass('datepicker-orient-' + yorient);
            if (yorient === 'top')
                top += height;
            else
                top -= calendarHeight + parseInt(this.picker.css('padding-top'));

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
        update: function() {
            if (!this._allow_update)
                return this;

            var oldDates = this.dates.copy(),
                dates = [],
                fromArgs = false;
            if (arguments.length) {
                $.each(arguments, $.proxy(function(i, date) {
                    if (date instanceof Date)
                        date = this._local_to_utc(date);
                    dates.push(date);
                }, this));
                fromArgs = true;
            } else {
                dates = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
                if (dates && this.o.multidate)
                    dates = dates.split(this.o.multidateSeparator);
                else
                    dates = [dates];
                delete this.element.data().date;
            }

            dates = $.map(dates, $.proxy(function(date) {
                return DPGlobal.parseDate(date, this.o.format, this.o.language);
            }, this));
            dates = $.grep(dates, $.proxy(function(date) {
                return (
                    date < this.o.startDate ||
                    date > this.o.endDate ||
                    !date
                );
            }, this), true);
            this.dates.replace(dates);

            if (this.dates.length)
                this.viewDate = new Date(this.dates.get(-1));
            else if (this.viewDate < this.o.startDate)
                this.viewDate = new Date(this.o.startDate);
            else if (this.viewDate > this.o.endDate)
                this.viewDate = new Date(this.o.endDate);

            if (fromArgs) {
                // setting date by clicking
                this.setValue();
            } else if (dates.length) {
                // setting date by typing
                if (String(oldDates) !== String(this.dates))
                    this._trigger('changeDate');
            }
            if (!this.dates.length && oldDates.length)
                this._trigger('clearDate');

            this.fill();
            return this;
        },

        fillDow: function() {
            var dowCnt = this.o.weekStart,
                html = '<tr>';
            if (this.o.calendarWeeks) {
                this.picker.find('.datepicker-days thead tr:first-child .datepicker-switch')
                    .attr('colspan', function(i, val) {
                        return parseInt(val) + 1;
                    });
                var cell = '<th class="cw">&#160;</th>';
                html += cell;
            }
            while (dowCnt < this.o.weekStart + 7) {
                html += '<th class="dow">' + dates[this.o.language].daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datepicker-days thead').append(html);
        },

        fillMonths: function() {
            var html = '',
                i = 0;
            while (i < 12) {
                html += '<span class="month">' + dates[this.o.language].monthsShort[i++] + '</span>';
            }
            this.picker.find('.datepicker-months td').html(html);
        },

        setRange: function(range) {
            if (!range || !range.length)
                delete this.range;
            else
                this.range = $.map(range, function(d) {
                    return d.valueOf();
                });
            this.fill();
        },

        getClassNames: function(date) {
            var cls = [],
                year = this.viewDate.getUTCFullYear(),
                month = this.viewDate.getUTCMonth(),
                today = new Date();
            if (date.getUTCFullYear() < year || (date.getUTCFullYear() === year && date.getUTCMonth() < month)) {
                cls.push('old');
            } else if (date.getUTCFullYear() > year || (date.getUTCFullYear() === year && date.getUTCMonth() > month)) {
                cls.push('new');
            }
            if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
                cls.push('focused');
            // Compare internal UTC date with local today, not UTC today
            if (this.o.todayHighlight &&
                date.getUTCFullYear() === today.getFullYear() &&
                date.getUTCMonth() === today.getMonth() &&
                date.getUTCDate() === today.getDate()) {
                cls.push('today');
            }
            if (this.dates.contains(date) !== -1)
                cls.push('active');
            if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
                $.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1) {
                cls.push('disabled');
            }
            if (this.o.datesDisabled.length > 0 &&
                $.grep(this.o.datesDisabled, function(d) {
                    return isUTCEquals(date, d);
                }).length > 0) {
                cls.push('disabled', 'disabled-date');
            }

            if (this.range) {
                if (date > this.range[0] && date < this.range[this.range.length - 1]) {
                    cls.push('range');
                }
                if ($.inArray(date.valueOf(), this.range) !== -1) {
                    cls.push('selected');
                }
            }
            return cls;
        },

        fill: function() {
            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth(),
                startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
                startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
                endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
                endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
                todaytxt = dates[this.o.language].today || dates['en'].today || '',
                cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
                tooltip;
            if (isNaN(year) || isNaN(month))
                return;
            this.picker.find('.datepicker-days thead .datepicker-switch')
                .text(dates[this.o.language].months[month] + ' ' + year);
            this.picker.find('tfoot .today')
                .text(todaytxt)
                .toggle(this.o.todayBtn !== false);
            this.picker.find('tfoot .clear')
                .text(cleartxt)
                .toggle(this.o.clearBtn !== false);
            this.updateNavArrows();
            this.fillMonths();
            var prevMonth = UTCDate(year, month - 1, 28),
                day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7) % 7);
            var nextMonth = new Date(prevMonth);
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() === this.o.weekStart) {
                    html.push('<tr>');
                    if (this.o.calendarWeeks) {
                        // ISO 8601: First week contains first thursday.
                        // ISO also states week starts on Monday, but we can be more abstract here.
                        var
                        // Start of current week: based on weekstart/current date
                            ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
                            // Thursday of this week
                            th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
                            // First Thursday of year, year from thursday
                            yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay()) % 7 * 864e5),
                            // Calendar week: ms between thursdays, div ms per day, div 7 days
                            calWeek = (th - yth) / 864e5 / 7 + 1;
                        html.push('<td class="cw">' + calWeek + '</td>');

                    }
                }
                clsName = this.getClassNames(prevMonth);
                clsName.push('day');

                if (this.o.beforeShowDay !== $.noop) {
                    var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
                    if (before === undefined)
                        before = {};
                    else if (typeof(before) === 'boolean')
                        before = {
                            enabled: before
                        };
                    else if (typeof(before) === 'string')
                        before = {
                            classes: before
                        };
                    if (before.enabled === false)
                        clsName.push('disabled');
                    if (before.classes)
                        clsName = clsName.concat(before.classes.split(/\s+/));
                    if (before.tooltip)
                        tooltip = before.tooltip;
                }

                clsName = $.unique(clsName);
                html.push('<td class="' + clsName.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + '>' + prevMonth.getUTCDate() + '</td>');
                tooltip = null;
                if (prevMonth.getUTCDay() === this.o.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

            var months = this.picker.find('.datepicker-months')
                .find('th:eq(1)')
                .text(year)
                .end()
                .find('span').removeClass('active');

            $.each(this.dates, function(i, d) {
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
                $.each(months, function(i, month) {
                    if (!$(month).hasClass('disabled')) {
                        var moDate = new Date(year, i, 1);
                        var before = that.o.beforeShowMonth(moDate);
                        if (before === false)
                            $(month).addClass('disabled');
                    }
                });
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.picker.find('.datepicker-years')
                .find('th:eq(1)')
                .text(year + '-' + (year + 9))
                .end()
                .find('td');
            year -= 1;
            var years = $.map(this.dates, function(d) {
                    return d.getUTCFullYear();
                }),
                classes;
            for (var i = -1; i < 11; i++) {
                classes = ['year'];
                if (i === -1)
                    classes.push('old');
                else if (i === 10)
                    classes.push('new');
                if ($.inArray(year, years) !== -1)
                    classes.push('active');
                if (year < startYear || year > endYear)
                    classes.push('disabled');
                html += '<span class="' + classes.join(' ') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },

        updateNavArrows: function() {
            if (!this._allow_update)
                return;

            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth();
            switch (this.viewMode) {
                case 0:
                    if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
                        this.picker.find('.prev').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.prev').css({
                            visibility: 'visible'
                        });
                    }
                    if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
                        this.picker.find('.next').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.next').css({
                            visibility: 'visible'
                        });
                    }
                    break;
                case 1:
                case 2:
                    if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()) {
                        this.picker.find('.prev').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.prev').css({
                            visibility: 'visible'
                        });
                    }
                    if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()) {
                        this.picker.find('.next').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.next').css({
                            visibility: 'visible'
                        });
                    }
                    break;
            }
        },

        click: function(e) {
            e.preventDefault();
            var target = $(e.target).closest('span, td, th'),
                year, month, day;
            if (target.length === 1) {
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'datepicker-switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 0:
                                        this.viewDate = this.moveMonth(this.viewDate, dir);
                                        this._trigger('changeMonth', this.viewDate);
                                        break;
                                    case 1:
                                    case 2:
                                        this.viewDate = this.moveYear(this.viewDate, dir);
                                        if (this.viewMode === 1)
                                            this._trigger('changeYear', this.viewDate);
                                        break;
                                }
                                this.fill();
                                break;
                            case 'today':
                                var date = new Date();
                                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

                                this.showMode(-2);
                                var which = this.o.todayBtn === 'linked' ? null : 'view';
                                this._setDate(date, which);
                                break;
                            case 'clear':
                                this.clearDates();
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.hasClass('disabled')) {
                            this.viewDate.setUTCDate(1);
                            if (target.hasClass('month')) {
                                day = 1;
                                month = target.parent().find('span').index(target);
                                year = this.viewDate.getUTCFullYear();
                                this.viewDate.setUTCMonth(month);
                                this._trigger('changeMonth', this.viewDate);
                                if (this.o.minViewMode === 1) {
                                    this._setDate(UTCDate(year, month, day));
                                }
                            } else {
                                day = 1;
                                month = 0;
                                year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                                this._trigger('changeYear', this.viewDate);
                                if (this.o.minViewMode === 2) {
                                    this._setDate(UTCDate(year, month, day));
                                }
                            }
                            this.showMode(-1);
                            this.fill();
                        }
                        break;
                    case 'td':
                        if (target.hasClass('day') && !target.hasClass('disabled')) {
                            day = parseInt(target.text(), 10) || 1;
                            year = this.viewDate.getUTCFullYear();
                            month = this.viewDate.getUTCMonth();
                            if (target.hasClass('old')) {
                                if (month === 0) {
                                    month = 11;
                                    year -= 1;
                                } else {
                                    month -= 1;
                                }
                            } else if (target.hasClass('new')) {
                                if (month === 11) {
                                    month = 0;
                                    year += 1;
                                } else {
                                    month += 1;
                                }
                            }
                            this._setDate(UTCDate(year, month, day));
                        }
                        break;
                }
            }
            if (this.picker.is(':visible') && this._focused_from) {
                $(this._focused_from).focus();
            }
            delete this._focused_from;
        },

        _toggle_multidate: function(date) {
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

        _setDate: function(date, which) {
            if (!which || which === 'date')
                this._toggle_multidate(date && new Date(date));
            if (!which || which === 'view')
                this.viewDate = date && new Date(date);

            this.fill();
            this.setValue();
            if (!which || which !== 'view') {
                this._trigger('changeDate');
            }
            var element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element) {
                element.change();
            }
            if (this.o.autoclose && (!which || which === 'date')) {
                this.hide();
            }
        },

        moveMonth: function(date, dir) {
            if (!date)
                return undefined;
            if (!dir)
                return date;
            var new_date = new Date(date.valueOf()),
                day = new_date.getUTCDate(),
                month = new_date.getUTCMonth(),
                mag = Math.abs(dir),
                new_month, test;
            dir = dir > 0 ? 1 : -1;
            if (mag === 1) {
                test = dir === -1
                    // If going back one month, make sure month is not current month
                    // (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
                    ? function() {
                        return new_date.getUTCMonth() === month;
                    }
                    // If going forward one month, make sure month is as expected
                    // (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
                    : function() {
                        return new_date.getUTCMonth() !== new_month;
                    };
                new_month = month + dir;
                new_date.setUTCMonth(new_month);
                // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
                if (new_month < 0 || new_month > 11)
                    new_month = (new_month + 12) % 12;
            } else {
                // For magnitudes >1, move one month at a time...
                for (var i = 0; i < mag; i++)
                // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
                    new_date = this.moveMonth(new_date, dir);
                // ...then reset the day, keeping it in the new month
                new_month = new_date.getUTCMonth();
                new_date.setUTCDate(day);
                test = function() {
                    return new_month !== new_date.getUTCMonth();
                };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setUTCMonth(new_month);
            }
            return new_date;
        },

        moveYear: function(date, dir) {
            return this.moveMonth(date, dir * 12);
        },

        dateWithinRange: function(date) {
            return date >= this.o.startDate && date <= this.o.endDate;
        },

        keydown: function(e) {
            if (!this.picker.is(':visible')) {
                if (e.keyCode === 27) // allow escape to hide and re-show picker
                    this.show();
                return;
            }
            var dateChanged = false,
                dir, newDate, newViewDate,
                focusDate = this.focusDate || this.viewDate;
            switch (e.keyCode) {
                case 27: // escape
                    if (this.focusDate) {
                        this.focusDate = null;
                        this.viewDate = this.dates.get(-1) || this.viewDate;
                        this.fill();
                    } else
                        this.hide();
                    e.preventDefault();
                    break;
                case 37: // left
                case 39: // right
                    if (!this.o.keyboardNavigation)
                        break;
                    dir = e.keyCode === 37 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveYear(focusDate, dir);
                        this._trigger('changeYear', this.viewDate);
                    } else if (e.shiftKey) {
                        newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveMonth(focusDate, dir);
                        this._trigger('changeMonth', this.viewDate);
                    } else {
                        newDate = new Date(this.dates.get(-1) || UTCToday());
                        newDate.setUTCDate(newDate.getUTCDate() + dir);
                        newViewDate = new Date(focusDate);
                        newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
                    }
                    if (this.dateWithinRange(newViewDate)) {
                        this.focusDate = this.viewDate = newViewDate;
                        this.setValue();
                        this.fill();
                        e.preventDefault();
                    }
                    break;
                case 38: // up
                case 40: // down
                    if (!this.o.keyboardNavigation)
                        break;
                    dir = e.keyCode === 38 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveYear(focusDate, dir);
                        this._trigger('changeYear', this.viewDate);
                    } else if (e.shiftKey) {
                        newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveMonth(focusDate, dir);
                        this._trigger('changeMonth', this.viewDate);
                    } else {
                        newDate = new Date(this.dates.get(-1) || UTCToday());
                        newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
                        newViewDate = new Date(focusDate);
                        newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
                    }
                    if (this.dateWithinRange(newViewDate)) {
                        this.focusDate = this.viewDate = newViewDate;
                        this.setValue();
                        this.fill();
                        e.preventDefault();
                    }
                    break;
                case 32: // spacebar
                    // Spacebar is used in manually typing dates in some formats.
                    // As such, its behavior should not be hijacked.
                    break;
                case 13: // enter
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
                        if (typeof e.stopPropagation === 'function') {
                            e.stopPropagation(); // All modern browsers, IE9+
                        } else {
                            e.cancelBubble = true; // IE6,7,8 ignore "stopPropagation"
                        }
                        if (this.o.autoclose)
                            this.hide();
                    }
                    break;
                case 9: // tab
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
                var element;
                if (this.isInput) {
                    element = this.element;
                } else if (this.component) {
                    element = this.element.find('input');
                }
                if (element) {
                    element.change();
                }
            }
        },

        showMode: function(dir) {
            if (dir) {
                this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
            }
            this.picker
                .children('div')
                .hide()
                .filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName)
                .css('display', 'block');
            this.updateNavArrows();
        }
    };

    var DateRangePicker = function(element, options) {
        this.element = $(element);
        this.inputs = $.map(options.inputs, function(i) {
            return i.jquery ? i[0] : i;
        });
        delete options.inputs;

        datepickerPlugin.call($(this.inputs), options)
            .bind('changeDate', $.proxy(this.dateUpdated, this));

        this.pickers = $.map(this.inputs, function(i) {
            return $(i).data('datepicker');
        });
        this.updateDates();
    };
    DateRangePicker.prototype = {
        updateDates: function() {
            this.dates = $.map(this.pickers, function(i) {
                return i.getUTCDate();
            });
            this.updateRanges();
        },
        updateRanges: function() {
            var range = $.map(this.dates, function(d) {
                return d.valueOf();
            });
            $.each(this.pickers, function(i, p) {
                p.setRange(range);
            });
        },
        dateUpdated: function(e) {
            // `this.updating` is a workaround for preventing infinite recursion
            // between `changeDate` triggering and `setUTCDate` calling.  Until
            // there is a better mechanism.
            if (this.updating)
                return;
            this.updating = true;

            var dp = $(e.target).data('datepicker'),
                new_date = dp.getUTCDate(),
                i = $.inArray(e.target, this.inputs),
                j = i - 1,
                k = i + 1,
                l = this.inputs.length;
            if (i === -1)
                return;

            $.each(this.pickers, function(i, p) {
                if (!p.getUTCDate())
                    p.setUTCDate(new_date);
            });

            if (new_date < this.dates[j]) {
                // Date being moved earlier/left
                while (j >= 0 && new_date < this.dates[j]) {
                    this.pickers[j--].setUTCDate(new_date);
                }
            } else if (new_date > this.dates[k]) {
                // Date being moved later/right
                while (k < l && new_date > this.dates[k]) {
                    this.pickers[k++].setUTCDate(new_date);
                }
            }
            this.updateDates();

            delete this.updating;
        },
        remove: function() {
            $.map(this.pickers, function(p) {
                p.remove();
            });
            delete this.element.data().datepicker;
        }
    };

    function opts_from_el(el, prefix) {
        // Derive options from element data-attrs
        var data = $(el).data(),
            out = {},
            inkey,
            replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
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
        // Derive options from locale plugins
        var out = {};
        // Check if "de-DE" style date is available, if not language should
        // fallback to 2 letter code eg "de"
        if (!dates[lang]) {
            lang = lang.split('-')[0];
            if (!dates[lang])
                return;
        }
        var d = dates[lang];
        $.each(locale_opts, function(i, k) {
            if (k in d)
                out[k] = d[k];
        });
        return out;
    }

    var old = $.fn.datepicker;
    var datepickerPlugin = function(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        var internal_return;
        this.each(function() {
            var $this = $(this),
                data = $this.data('datepicker'),
                options = typeof option === 'object' && option;
            if (!data) {
                var elopts = opts_from_el(this, 'date'),
                    // Preliminary otions
                    xopts = $.extend({}, defaults, elopts, options),
                    locopts = opts_from_locale(xopts.language),
                    // Options priority: js args, data-attrs, locales, defaults
                    opts = $.extend({}, defaults, locopts, elopts, options);
                if ($this.hasClass('biz-range') || opts.inputs) {
                    var ropts = {
                        inputs: opts.inputs || $this.find('input').toArray()
                    };
                    $this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
                } else {
                    $this.data('datepicker', (data = new Datepicker(this, opts)));
                }
            }
            if (typeof option === 'string' && typeof data[option] === 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined)
                    return false;
            }
        });
        if (internal_return !== undefined)
            return internal_return;
        else
            return this;
    };
    $.fn.datepicker = datepickerPlugin;

    var defaults = $.fn.datepicker.defaults = {
        autoclose: false,
        beforeShowDay: $.noop,
        beforeShowMonth: $.noop,
        calendarWeeks: false,
        clearBtn: false,
        toggleActive: false,
        daysOfWeekDisabled: [],
        datesDisabled: [],
        endDate: Infinity,
        forceParse: true,
        format: 'mm/dd/yyyy',
        keyboardNavigation: true,
        language: 'en',
        minViewMode: 0,
        multidate: false,
        multidateSeparator: ',',
        orientation: "auto",
        rtl: false,
        startDate: -Infinity,
        startView: 0,
        todayBtn: false,
        todayHighlight: false,
        weekStart: 0,
        disableTouchKeyboard: false,
        enableOnReadonly: true,
        container: 'body'
    };
    var locale_opts = $.fn.datepicker.locale_opts = [
        'format',
        'rtl',
        'weekStart'
    ];
    $.fn.datepicker.Constructor = Datepicker;
    var dates = $.fn.datepicker.dates = {
        en: {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today: "Today",
            clear: "Clear"
        }
    };

    var DPGlobal = {
        modes: [{
            clsName: 'days',
            navFnc: 'Month',
            navStep: 1
        }, {
            clsName: 'months',
            navFnc: 'FullYear',
            navStep: 1
        }, {
            clsName: 'years',
            navFnc: 'FullYear',
            navStep: 10
        }],
        isLeapYear: function(year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        getDaysInMonth: function(year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
        nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
        parseFormat: function(format) {
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            var separators = format.replace(this.validParts, '\0').split('\0'),
                parts = format.match(this.validParts);
            if (!separators || !separators.length || !parts || parts.length === 0) {
                throw new Error("Invalid date format.");
            }
            return {
                separators: separators,
                parts: parts
            };
        },
        parseDate: function(date, format, language) {
            if (!date)
                return undefined;
            if (date instanceof Date)
                return date;
            if (typeof format === 'string')
                format = DPGlobal.parseFormat(format);
            var part_re = /([\-+]\d+)([dmwy])/,
                parts = date.match(/([\-+]\d+)([dmwy])/g),
                part, dir, i;
            if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
                date = new Date();
                for (i = 0; i < parts.length; i++) {
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    switch (part[2]) {
                        case 'd':
                            date.setUTCDate(date.getUTCDate() + dir);
                            break;
                        case 'm':
                            date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
                            break;
                        case 'w':
                            date.setUTCDate(date.getUTCDate() + dir * 7);
                            break;
                        case 'y':
                            date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
                            break;
                    }
                }
                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
            }
            parts = date && date.match(this.nonpunctuation) || [];
            date = new Date();
            var parsed = {},
                setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
                setters_map = {
                    yyyy: function(d, v) {
                        return d.setUTCFullYear(v);
                    },
                    yy: function(d, v) {
                        return d.setUTCFullYear(2000 + v);
                    },
                    m: function(d, v) {
                        if (isNaN(d))
                            return d;
                        v -= 1;
                        while (v < 0) v += 12;
                        v %= 12;
                        d.setUTCMonth(v);
                        while (d.getUTCMonth() !== v)
                            d.setUTCDate(d.getUTCDate() - 1);
                        return d;
                    },
                    d: function(d, v) {
                        return d.setUTCDate(v);
                    }
                },
                val, filtered;
            setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
            setters_map['dd'] = setters_map['d'];
            date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            var fparts = format.parts.slice();
            // Remove noop parts
            if (parts.length !== fparts.length) {
                fparts = $(fparts).filter(function(i, p) {
                    return $.inArray(p, setters_order) !== -1;
                }).toArray();
            }
            // Process remainder
            function match_part() {
                var m = this.slice(0, parts[i].length),
                    p = parts[i].slice(0, m.length);
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
        formatDate: function(date, format, language) {
            if (!date)
                return '';
            if (typeof format === 'string')
                format = DPGlobal.parseFormat(format);
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
        headTemplate: '<thead>' +
            '<tr>' +
            '<th class="prev">◀</th>' +
            '<th colspan="5" class="datepicker-switch"></th>' +
            '<th class="next">▶</th>' +
            '</tr>' +
            '</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot>' +
            '<tr>' +
            '<th colspan="7" class="today"></th>' +
            '</tr>' +
            '<tr>' +
            '<th colspan="7" class="clear"></th>' +
            '</tr>' +
            '</tfoot>'
    };
    DPGlobal.template = '<div class="datepicker">' +
        '<div class="datepicker-days">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplate +
        '<tbody></tbody>' +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-months">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-years">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '</div>';

    $.fn.datepicker.DPGlobal = DPGlobal;

    /* DATEPICKER NO CONFLICT
     * =================== */

    $.fn.datepicker.noConflict = function() {
        $.fn.datepicker = old;
        return this;
    };

    /* DATEPICKER VERSION
     * =================== */
    $.fn.datepicker.version = "1.4.0";

    $.fn.datepicker.dates["zh-CN"] = {
        days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
        daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        today: "今日",
        clear: "清空",
        weekStart: 1,
        format: "yyyy年mm月dd日"
    };

    $.fn.datepicker.dates["en"] = {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        today: "Today",
        clear: "Clear",
        weekStart: 1,
        format: "dd/mm/yyyy"
    };

    /* DATEPICKER DATA-API
     * ================== */

    $(document).on(
        'focus.datepicker.data-api click.datepicker.data-api',
        '[data-provide="datepicker"]',
        function(e) {
            var $this = $(this);
            if ($this.data('datepicker'))
                return;
            e.preventDefault();
            // component click requires us to explicitly show it
            datepickerPlugin.call($this, 'show');
        }
    );
    $(function() {
        datepickerPlugin.call($('[data-provide="datepicker-inline"]'));
    });

    return datepickerPlugin;
});
/**
 * @ignore
 */
define('ui/Calendar',['require','dep/jquery.datepicker','ui/Input'],function(require) {
    var Datepicker = require('dep/jquery.datepicker'),
        Input = require('ui/Input');

    /**
     * Calendar constructor
     *
     * <iframe width="100%" height="380" src="//jsfiddle.net/bizdevfe/oa3s8e8w/embedded/result,js,html,css/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} calendar 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.todayHighlight] 今日是否高亮
     * @param {Boolean|String} [options.todayBtn] 是否显示今日按钮, 若为'linked', 则选中并关闭
     * @param {Date|String} [options.startDate] 最早开始日期
     * @param {Date|String} [options.endDate] 最晚结束日期
     * @param {Function} [options.onChange] 日期变更回调(event)
     */
    function Calendar(calendar, options) {
        if (isInput(calendar)) {
            this.date = new Input($(calendar));
            $(this.date.main).addClass(defaultClass).attr('maxlength', 10);
        } else {
            this.range = $(calendar).find(':text');
            this.startDate = new Input(this.range[0]);
            $(this.startDate.main).addClass(defaultClass).attr('maxlength', 10);
            this.endDate = new Input(this.range[1]);
            $(this.endDate.main).addClass(defaultClass).attr('maxlength', 10);
        }

        options = $.extend({}, options || {});

        this.instance = Datepicker.call($(calendar), {
            autoclose: true,
            format: 'yyyy-mm-dd',
            language: options.language || 'zh-CN',
            orientation: 'top left',
            weekStart: 1,
            todayHighlight: options.todayHighlight,
            todayBtn: options.todayBtn,
            startDate: options.startDate,
            endDate: options.endDate
        });

        var self = this;
        if (options.onChange) {
            this.instance.on('changeDate', function(e) {
                options.onChange.call(self, e);
            });
        }
    }

    var defaultClass = 'biz-calendar';

    Calendar.prototype = {
        /**
         * 获取本地时间
         * @return {Date|Array} 本地时间（多日历为数组）
         */
        getDate: function() {
            return !this.range ? this.instance.datepicker('getDate') : [$(this.range[0]).datepicker('getDate'), $(this.range[1]).datepicker('getDate')];
        },

        /**
         * 设置本地时间
         * @param {Date|Array} date 本地时间（多日历为数组）
         * @fires onChange
         */
        setDate: function(date) {
            //Bug? 界面没有同步选中状态
            if (!this.range) {
                this.instance.datepicker('setDate', date);
            } else {
                $(this.range[0]).datepicker('setDate', date[0]);
                $(this.range[1]).datepicker('setDate', date[1]);
            }
        },

        /**
         * 激活
         */
        enable: function() {
            if (this.date) {
                this.date.enable();
            } else {
                this.startDate.enable();
                this.endDate.enable();
            }
        },

        /**
         * 禁用
         */
        disable: function() {
            if (this.date) {
                this.date.disable();
            } else {
                this.startDate.disable();
                this.endDate.disable();
            }
        },

        /**
         * 销毁
         */
        destroy: function() {
            if (this.date) {
                this.date.destroy();
            } else {
                this.startDate.destroy();
                this.endDate.destroy();
            }
            this.instance.remove();
        }
    };

    function isInput(elem) {
        return elem.nodeType === 1 &&
            elem.tagName.toLowerCase() === 'input' &&
            elem.getAttribute('type').toLowerCase() === 'text';
    }

    var dataKey = 'bizCalendar';

    $.extend($.fn, {
        bizCalendar: function(method, options) {
            var calendar;
            switch (method) {
                case 'getDate':
                    return this.data(dataKey).getDate();
                case 'setDate':
                    this.each(function() {
                        calendar = $(this).data(dataKey);
                        if (calendar) {
                            calendar.setDate(options);
                        }
                    });
                    break;
                case 'enable':
                    this.each(function() {
                        calendar = $(this).data(dataKey);
                        if (calendar) {
                            calendar.enable();
                        }
                    });
                    break;
                case 'disable':
                    this.each(function() {
                        calendar = $(this).data(dataKey);
                        if (calendar) {
                            calendar.disable();
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        calendar = $(this).data(dataKey);
                        if (calendar) {
                            calendar.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey)) {
                            $(this).data(dataKey, new Calendar(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Calendar;
});
/**
 * @ignore
 */
define('ui/util',['require'],function(require) {
    var util = {};

    /**
     * 判断数组
     * @param {Mixed} a
     * @return {Boolean}
     * @protected
     */
    util.isArray = function(a) {
        return toString.call(a) === '[object Array]';
    };

    /**
     * 转义HTML
     * @param {String} str
     * @return {String}
     * @protected
     */
    util.escapeHTML = function(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    return util;
});
(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a)
                    return a(o, !0);
                if (i)
                    return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }

    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)
        s(r[o]);
    return s;
})({
    1: [

        function(require, module, exports) {
            'use strict';

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    'default': obj
                };
            }

            var _class = require('./class');

            var _class2 = _interopRequireDefault(_class);

            var _constants = require('./constants');

            $.fn.resizableColumns = function(optionsOrMethod) {
                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                return this.each(function() {
                    var $table = $(this);

                    var api = $table.data(_constants.DATA_API);
                    if (!api) {
                        api = new _class2['default']($table, optionsOrMethod);
                        $table.data(_constants.DATA_API, api);
                    } else if (typeof optionsOrMethod === 'string') {
                        return api[optionsOrMethod].apply(api, args);
                    }
                });
            };

            $.resizableColumns = _class2['default'];

        }, {
            "./class": 2,
            "./constants": 3
        }
    ],
    2: [

        function(require, module, exports) {
            'use strict';

            Object.defineProperty(exports, '__esModule', {
                value: true
            });

            var _createClass = (function() {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ('value' in descriptor)
                            descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function(Constructor, protoProps, staticProps) {
                    if (protoProps)
                        defineProperties(Constructor.prototype, protoProps);
                    if (staticProps)
                        defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            })();

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError('Cannot call a class as a function');
                }
            }

            var _constants = require('./constants');

            /**
         Takes a <table /> element and makes it's columns resizable across both
         mobile and desktop clients.

         @class ResizableColumns
         @param $table {jQuery} jQuery-wrapped <table> element to make resizable
         @param options {Object} Configuration object
         **/

            var ResizableColumns = (function() {
                function ResizableColumns($table, options) {
                    _classCallCheck(this, ResizableColumns);

                    this.ns = '.rc' + this.count++;

                    this.options = $.extend({}, ResizableColumns.defaults, options);

                    this.$window = $(window);
                    this.$ownerDocument = $($table[0].ownerDocument);
                    this.$table = $table;

                    this.$content = $table.parent().parent().find('.biz-table-body tr[class!="no-data"]:first td');
                    this.hasContent = this.$content.length !== 0;

                    this.refreshHeaders();
                    this.restoreColumnWidths();
                    this.syncHandleWidths();

                    this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

                    if (this.options.start) {
                        this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
                    }
                    if (this.options.resize) {
                        this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
                    }
                    if (this.options.stop) {
                        this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
                    }
                }

                _createClass(ResizableColumns, [{
                    key: 'refreshHeaders',

                    /**
                 Refreshes the headers associated with this instances <table/> element and
                 generates handles for them. Also assigns percentage widths.
                 @method refreshHeaders
                 **/
                    value: function refreshHeaders() {
                        // Allow the selector to be both a regular selctor string as well as
                        // a dynamic callback
                        var selector = this.options.selector;
                        if (typeof selector === 'function') {
                            selector = selector.call(this, this.$table);
                        }

                        // Select all table headers
                        this.$tableHeaders = this.$table.find(selector);

                        // Assign percentage widths first, then create drag handles
                        this.assignPercentageWidths();
                        this.createHandles();
                    }
                }, {
                    key: 'createHandles',

                    /**
                 Creates dummy handle elements for all table header columns
                 @method createHandles
                 **/
                    value: function createHandles() {
                        var _this = this;

                        var ref = this.$handleContainer;
                        if (ref != null) {
                            ref.remove();
                        }

                        this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
                        this.$table.before(this.$handleContainer);

                        this.$tableHeaders.each(function(i, el) {
                            var $current = _this.$tableHeaders.eq(i);
                            var $next = _this.$tableHeaders.eq(i + 1);

                            if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
                                return;
                            }

                            var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
                        });

                        this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
                    }
                }, {
                    key: 'assignPercentageWidths',

                    /**
                 Assigns a percentage width to all columns based on their current pixel width(s)
                 @method assignPercentageWidths
                 **/
                    value: function assignPercentageWidths() {
                        var _this2 = this;

                        this.$tableHeaders.each(function(_, el) {
                            var $el = $(el),
                                percent = $el.outerWidth() / _this2.$table.width() * 100;
                            _this2.setWidth($el[0], percent);
                            if (_this2.hasContent) {
                                _this2.setWidth(_this2.$content[_], percent);
                            }
                        });
                    }
                }, {
                    key: 'syncHandleWidths',

                    /**

                 @method syncHandleWidths
                 **/
                    value: function syncHandleWidths() {
                        var _this3 = this;

                        var $container = this.$handleContainer;

                        $container.width(this.$table.width());

                        $container.find('.' + _constants.CLASS_HANDLE).each(function(_, el) {
                            var $el = $(el);

                            var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();

                            var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

                            $el.css({
                                left: left,
                                height: height
                            });
                        });
                    }
                }, {
                    key: 'saveColumnWidths',

                    /**
                 Persists the column widths in localStorage
                 @method saveColumnWidths
                 **/
                    value: function saveColumnWidths() {
                        var _this4 = this;

                        this.$tableHeaders.each(function(_, el) {
                            var $el = $(el);

                            if (_this4.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
                                _this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
                            }
                        });
                    }
                }, {
                    key: 'restoreColumnWidths',

                    /**
                 Retrieves and sets the column widths from localStorage
                 @method restoreColumnWidths
                 **/
                    value: function restoreColumnWidths() {
                        var _this5 = this;

                        this.$tableHeaders.each(function(_, el) {
                            var $el = $(el);

                            if (_this5.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
                                var width = _this5.options.store.get(_this5.generateColumnId($el));

                                if (width != null) {
                                    _this5.setWidth(el, width);
                                }
                            }
                        });
                    }
                }, {
                    key: 'onPointerDown',

                    /**
                 Pointer/mouse down handler
                 @method onPointerDown
                 @param event {Object} Event object associated with the interaction
                 **/
                    value: function onPointerDown(event) {
                        // Only applies to left-click dragging
                        if (event.which !== 1) {
                            return;
                        }

                        // If a previous operation is defined, we missed the last mouseup.
                        // Probably gobbled up by user mousing out the window then releasing.
                        // We'll simulate a pointerup here prior to it
                        if (this.operation) {
                            this.onPointerUp(event);
                        }

                        // Ignore non-resizable columns
                        var $currentGrip = $(event.currentTarget);
                        if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
                            return;
                        }

                        var gripIndex = $currentGrip.index();
                        var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
                        var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

                        var leftWidth = this.parseWidth($leftColumn[0]);
                        var rightWidth = this.parseWidth($rightColumn[0]);

                        this.operation = {
                            $leftColumn: $leftColumn,
                            $rightColumn: $rightColumn,
                            $currentGrip: $currentGrip,

                            startX: this.getPointerX(event),

                            widths: {
                                left: leftWidth,
                                right: rightWidth
                            },
                            newWidths: {
                                left: leftWidth,
                                right: rightWidth
                            }
                        };

                        if (this.hasContent) {
                            this.operation.$leftContent = this.$content.eq(gripIndex);
                            this.operation.$rightContent = this.$content.eq(gripIndex + 1);
                        }

                        this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
                        this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

                        this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

                        $leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

                        this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

                        event.preventDefault();
                    }
                }, {
                    key: 'onPointerMove',

                    /**
                 Pointer/mouse movement handler
                 @method onPointerMove
                 @param event {Object} Event object associated with the interaction
                 **/
                    value: function onPointerMove(event) {
                        var op = this.operation;
                        if (!this.operation) {
                            return;
                        }

                        // Determine the delta change between start and new mouse position, as a percentage of the table width
                        var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
                        if (difference === 0) {
                            return;
                        }

                        var leftColumn = op.$leftColumn[0];
                        var rightColumn = op.$rightColumn[0];
                        if (this.hasContent) {
                            var leftContent = op.$leftContent[0];
                            var rightContent = op.$rightContent[0];
                        }
                        var widthLeft = undefined,
                            widthRight = undefined;

                        var minLeft = (op.$leftColumn.data('width') + 17) / this.$table.width() * 100,
                            minRight = (op.$rightColumn.data('width') + 17) / this.$table.width() * 100;

                        if (difference > 0) {
                            widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
                            //widthRight = this.constrainWidth(op.widths.right - difference);
                            widthRight = Math.max(minRight, op.widths.right - difference);
                        } else if (difference < 0) {
                            //widthLeft = this.constrainWidth(op.widths.left + difference);
                            widthLeft = Math.max(minLeft, op.widths.left + difference);
                            widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
                        }

                        if (leftColumn) {
                            this.setWidth(leftColumn, widthLeft);
                            if (this.hasContent) {
                                this.setWidth(leftContent, widthLeft);
                            }
                        }
                        if (rightColumn) {
                            this.setWidth(rightColumn, widthRight);
                            if (this.hasContent) {
                                this.setWidth(rightContent, widthRight);
                            }
                        }

                        op.newWidths.left = widthLeft;
                        op.newWidths.right = widthRight;

                        return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
                    }
                }, {
                    key: 'onPointerUp',

                    /**
                 Pointer/mouse release handler
                 @method onPointerUp
                 @param event {Object} Event object associated with the interaction
                 **/
                    value: function onPointerUp(event) {
                        var op = this.operation;
                        if (!this.operation) {
                            return;
                        }

                        this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

                        this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

                        op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

                        this.syncHandleWidths();
                        this.saveColumnWidths();

                        this.operation = null;

                        return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
                    }
                }, {
                    key: 'destroy',

                    /**
                 Removes all event listeners, data, and added DOM elements. Takes
                 the <table/> element back to how it was, and returns it
                 @method destroy
                 @return {jQuery} Original jQuery-wrapped <table> element
                 **/
                    value: function destroy() {
                        var $table = this.$table;
                        var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

                        this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

                        $handles.removeData(_constants.DATA_TH);
                        $table.removeData(_constants.DATA_API);

                        this.$handleContainer.remove();
                        this.$handleContainer = null;
                        this.$tableHeaders = null;
                        this.$table = null;

                        return $table;
                    }
                }, {
                    key: 'bindEvents',

                    /**
                 Binds given events for this instance to the given target DOMElement
                 @private
                 @method bindEvents
                 @param target {jQuery} jQuery-wrapped DOMElement to bind events to
                 @param events {String|Array} Event name (or array of) to bind
                 @param selectorOrCallback {String|Function} Selector string or callback
                 @param [callback] {Function} Callback method
                 **/
                    value: function bindEvents($target, events, selectorOrCallback, callback) {
                        if (typeof events === 'string') {
                            events = events + this.ns;
                        } else {
                            events = events.join(this.ns + ' ') + this.ns;
                        }

                        if (arguments.length > 3) {
                            $target.on(events, selectorOrCallback, callback);
                        } else {
                            $target.on(events, selectorOrCallback);
                        }
                    }
                }, {
                    key: 'unbindEvents',

                    /**
                 Unbinds events specific to this instance from the given target DOMElement
                 @private
                 @method unbindEvents
                 @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
                 @param events {String|Array} Event name (or array of) to unbind
                 **/
                    value: function unbindEvents($target, events) {
                        if (typeof events === 'string') {
                            events = events + this.ns;
                        } else if (events != null) {
                            events = events.join(this.ns + ' ') + this.ns;
                        } else {
                            events = this.ns;
                        }

                        $target.off(events);
                    }
                }, {
                    key: 'triggerEvent',

                    /**
                 Triggers an event on the <table/> element for a given type with given
                 arguments, also setting and allowing access to the originalEvent if
                 given. Returns the result of the triggered event.
                 @private
                 @method triggerEvent
                 @param type {String} Event name
                 @param args {Array} Array of arguments to pass through
                 @param [originalEvent] If given, is set on the event object
                 @return {Mixed} Result of the event trigger action
                 **/
                    value: function triggerEvent(type, args, originalEvent) {
                        var event = $.Event(type);
                        if (event.originalEvent) {
                            event.originalEvent = $.extend({}, originalEvent);
                        }

                        return this.$table.trigger(event, [this].concat(args || []));
                    }
                }, {
                    key: 'generateColumnId',

                    /**
                 Calculates a unique column ID for a given column DOMElement
                 @private
                 @method generateColumnId
                 @param $el {jQuery} jQuery-wrapped column element
                 @return {String} Column ID
                 **/
                    value: function generateColumnId($el) {
                        return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
                    }
                }, {
                    key: 'parseWidth',

                    /**
                 Parses a given DOMElement's width into a float
                 @private
                 @method parseWidth
                 @param element {DOMElement} Element to get width of
                 @return {Number} Element's width as a float
                 **/
                    value: function parseWidth(element) {
                        return element ? parseFloat(element.style.width.replace('%', '')) : 0;
                    }
                }, {
                    key: 'setWidth',

                    /**
                 Sets the percentage width of a given DOMElement
                 @private
                 @method setWidth
                 @param element {DOMElement} Element to set width on
                 @param width {Number} Width, as a percentage, to set
                 **/
                    value: function setWidth(element, width) {
                        width = width.toFixed(2);
                        width = width > 0 ? width : 0;
                        element.style.width = width + '%';
                    }
                }, {
                    key: 'constrainWidth',

                    /**
                 Constrains a given width to the minimum and maximum ranges defined in
                 the `minWidth` and `maxWidth` configuration options, respectively.
                 @private
                 @method constrainWidth
                 @param width {Number} Width to constrain
                 @return {Number} Constrained width
                 **/
                    value: function constrainWidth(width) {
                        if (this.options.minWidth != undefined) {
                            width = Math.max(this.options.minWidth, width);
                        }

                        if (this.options.maxWidth != undefined) {
                            width = Math.min(this.options.maxWidth, width);
                        }

                        return width;
                    }
                }, {
                    key: 'getPointerX',

                    /**
                 Given a particular Event object, retrieves the current pointer offset along
                 the horizontal direction. Accounts for both regular mouse clicks as well as
                 pointer-like systems (mobiles, tablets etc.)
                 @private
                 @method getPointerX
                 @param event {Object} Event object associated with the interaction
                 @return {Number} Horizontal pointer offset
                 **/
                    value: function getPointerX(event) {
                        if (event.type.indexOf('touch') === 0) {
                            return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
                        }
                        return event.pageX;
                    }
                }]);

                return ResizableColumns;
            })();

            exports['default'] = ResizableColumns;

            ResizableColumns.defaults = {
                selector: function selector($table) {
                    if ($table.find('thead').length) {
                        return _constants.SELECTOR_TH;
                    }

                    return _constants.SELECTOR_TD;
                },
                store: window.store,
                syncHandlers: true,
                resizeFromBody: true,
                maxWidth: null,
                minWidth: 0.01
            };

            ResizableColumns.count = 0;
            module.exports = exports['default'];

        }, {
            "./constants": 3
        }
    ],
    3: [

        function(require, module, exports) {
            'use strict';

            Object.defineProperty(exports, '__esModule', {
                value: true
            });
            var DATA_API = 'resizableColumns';
            exports.DATA_API = DATA_API;
            var DATA_COLUMNS_ID = 'resizable-columns-id';
            exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
            var DATA_COLUMN_ID = 'resizable-column-id';
            exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
            var DATA_TH = 'th';

            exports.DATA_TH = DATA_TH;
            var CLASS_TABLE_RESIZING = 'rc-table-resizing';
            exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
            var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
            exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
            var CLASS_HANDLE = 'rc-handle';
            exports.CLASS_HANDLE = CLASS_HANDLE;
            var CLASS_HANDLE_CONTAINER = 'rc-handle-container';

            exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
            var EVENT_RESIZE_START = 'column:resize:start';
            exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
            var EVENT_RESIZE = 'column:resize';
            exports.EVENT_RESIZE = EVENT_RESIZE;
            var EVENT_RESIZE_STOP = 'column:resize:stop';

            exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
            var SELECTOR_TH = 'tr:first > th:visible';
            exports.SELECTOR_TH = SELECTOR_TH;
            var SELECTOR_TD = 'tr:first > td:visible';
            exports.SELECTOR_TD = SELECTOR_TD;
            var SELECTOR_UNRESIZABLE = '[data-noresize]';
            exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;

        }, {}
    ],
    4: [

        function(require, module, exports) {
            'use strict';

            Object.defineProperty(exports, '__esModule', {
                value: true
            });

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    'default': obj
                };
            }

            var _class = require('./class');

            var _class2 = _interopRequireDefault(_class);

            var _adapter = require('./adapter');

            var _adapter2 = _interopRequireDefault(_adapter);

            exports['default'] = _class2['default'];
            module.exports = exports['default'];

        }, {
            "./adapter": 1,
            "./class": 2
        }
    ]
}, {}, [4]);
define("dep/jquery.resizableColumns", function(){});

/**
 * @ignore
 */
define('dep/jquery.editabletable',['require'],function(require) {
    $.fn.editableTableWidget = function(options) {
        'use strict';
        return $(this).each(function() {
            var buildDefaultOptions = function() {
                    var opts = $.extend({}, $.fn.editableTableWidget.defaultOptions);
                    opts.editor = opts.editor.clone();
                    return opts;
                },
                activeOptions = $.extend(buildDefaultOptions(), options),
                ARROW_LEFT = 37,
                ARROW_UP = 38,
                ARROW_RIGHT = 39,
                ARROW_DOWN = 40,
                ENTER = 13,
                ESC = 27,
                TAB = 9,
                element = $(this),
                editor = activeOptions.editor.css('position', 'absolute').hide().appendTo(element.parent()),
                active, showEditor = function(select) {
                    active = element.find('td:focus');
                    if (active.length) {
                        editor.val(active.text()).removeClass('error').show().offset(active.offset()).css(active.css(activeOptions.cloneProperties)).width(active.width()).height(active.height()).focus();
                        if (select) {
                            editor.select();
                        }
                    }
                },
                setActiveText = function() {
                    var text = $.trim(editor.val()),
                        evt = $.Event('change'),
                        originalContent;
                    if (!active || active.text() === text || editor.hasClass('error')) {
                        return true;
                    }
                    originalContent = active.html();
                    active.text(text).trigger(evt, text);
                    if (evt.result === false) {
                        active.html(originalContent);
                    }
                },
                movement = function(element, keycode) {
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
            editor.blur(function() {
                setActiveText();
                editor.hide();
            }).keydown(function(e) {
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
            }).on('input paste', function() {
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

            $(window).on('resize', function() {
                if (editor.is(':visible')) {
                    editor.offset(active.offset()).width(active.width()).height(active.height());
                }
            });
        });
    };

    $.fn.editableTableWidget.defaultOptions = {
        cloneProperties: ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'text-align', 'font', 'font-size', 'font-family', 'font-weight'],
        editor: $('<input class="biz-table-editor">')
    };
});
/**
 * @ignore
 */
define('ui/Table',['require','ui/util','dep/jquery.resizableColumns','dep/jquery.editabletable'],function(require) {
    var util = require('ui/util');
    require('dep/jquery.resizableColumns');
    require('dep/jquery.editabletable');

    /**
     * Table constructor
     *
     * <iframe width="100%" height="350" src="//jsfiddle.net/bizdevfe/q4myap58/35/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} table 目标元素
     * @param {Object}         options 参数
     * @param {String}         [options.skin] 皮肤类名
     * @param {Array}          options.column 列配置
     * @param {String}         options.column.field 表头字段名
     * @param {String}         options.column.title 表头文字
     * @param {Function|Array} options.column.content 单元格内容(拆分单元格内容: hover失效, editable失效)
     * @param {Function}       [options.column.footContent] 总计行内容
     * @param {Boolean}        [options.column.escapeTitle] 转义表头文字, 默认true
     * @param {Boolean}        [options.column.escapeContent] 转义单元格内容, 默认true
     * @param {Boolean}        [options.column.sortable] 是否排序, 默认false
     * @param {String}         [options.column.currentSort] des-降序, asc-升序, sortable为true时生效
     * @param {Boolean}        [options.column.editable] 是否编辑, 默认false
     * @param {Number}         options.column.width 最小宽度
     * @param {Number}         [options.column.align] left-居左, right-居中, center-居右
     * @param {Boolean}        [options.column.visible] 是否显示, 默认true
     * @param {Array}          options.data 数据
     * @param {String}         [options.noDataContent] 无数据时显示的内容, 不转义
     * @param {String}         [options.foot] 总计行, top-顶部, bottom-底部
     * @param {Boolean}        [options.selectable] 是否含勾选列
     * @param {Boolean}        [options.resizable] 是否可调整列宽
     * @param {Function}       [options.onSort] 排序回调, onSort(data, event)
     * @param {Function}       [options.onSelect] 勾选回调, onSelect(data, event)
     * @param {Function}       [options.onEdit] 编辑单元格回调, onEdit(data, event)
     * @param {Function}       [options.onValidate] 验证回调, onValidate(data, event)
     * @param {Boolean}        [options.lockHead] 是否开启表头锁定
     * @param {Number}         [options.topOffset] 表头锁定时，表头上方预留高度
     */
    function Table(table, options) {
        if (table instanceof jQuery) {
            if (table.length > 0) {
                table = table[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isTable(table)) {
            return;
        }

        /**
         * @property {HTMLElement} main `table`元素
         */
        this.main = table;

        /**
         * @property {jQuery} $main `table`元素的$包装
         */
        this.$main = $(this.main);

        var defaultOption = {
            data: [],
            selectable: false,
            resizable: false,
            topOffset: 0,
            lockHead: false
        };
        this.options = $.extend(true, defaultOption, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-table',
        selectPrefix = 'biz-table-select-row-';

    Table.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.html(
                '<div class="biz-table-head-wrap"><table class="biz-table-head"></table></div>' +
                '<div class="biz-table-placeholder"></div>' +
                '<div class="biz-table-body-wrap"><table class="biz-table-body"></table></div>'
            );

            this.$headWrap = this.$main.find('.biz-table-head-wrap');
            this.$bodyWrap = this.$main.find('.biz-table-body-wrap');
            this.$placeholder = this.$main.find('.biz-table-placeholder');
            this.$tableHead = this.$main.find('.biz-table-head');
            this.$tableBody = this.$main.find('.biz-table-body');

            var skin = options.skin ? (' ' + options.skin) : '';

            //创建表头
            this.$tableHead.html(this.createTableHead(options))
                .addClass(defaultClass + skin);

            //创建表格
            this.$tableBody.html(this.createTableBody(options))
                .addClass(defaultClass + skin + (this.rowSpan > 1 ? ' biz-rowspan' : ''));

            //勾选列
            if (options.selectable) {
                this.createSelect();
                this.bindSelect();
            }

            if (options.data.length) { //总计行
                if (options.foot === 'top') {
                    this.$tableBody.find('tbody').prepend(this.createFoot(options));
                }
                if (options.foot === 'bottom') {
                    this.$tableBody.find('tbody').append(this.createFoot(options));
                }
            } else if (options.noDataContent) { //无数据提示行
                this.createNoDataContent();
            }

            //同步宽度
            this.syncWidth();
            $(window).on('resize.bizTable', function() {
                self.syncWidth();
            });

            //绑定横向滚动
            var self = this;
            this.$headWrap.on('scroll', function() {
                self.$bodyWrap[0].scrollLeft = this.scrollLeft;
            });
            this.$bodyWrap.on('scroll', function() {
                self.$headWrap[0].scrollLeft = this.scrollLeft;
            });

            if (options.lockHead) {
                var headHeight = this.$headWrap.height();

                //表头跟随
                $(window).on('scroll.bizTable', function() {
                    //此处要实时计算表头位置，防止表头位置动态发生变化
                    var currentOffsetTop = self.$main.offset().top - options.topOffset;
                    if ($(window).scrollTop() > currentOffsetTop) {
                        if (!self.hasLocked) {
                            self.$headWrap.css({
                                position: 'fixed',
                                top: self.options.topOffset,
                                width: self.$main.width()
                            });
                            self.$placeholder.css({
                                height: headHeight + self.options.topOffset
                            });
                            self.hasLocked = true;
                        }
                    } else {
                        if (self.hasLocked) {
                            self.$headWrap.css({
                                position: 'static',
                                top: 'auto',
                                width: 'auto'
                            });
                            self.$placeholder.css({
                                height: 0
                            });
                            self.hasLocked = false;
                        }
                    }
                });
            }

            //调整列宽
            if (options.resizable) {
                this.setMinWidth();
                this.$tableHead.resizableColumns({
                    start: function() {
                        $('.biz-table-editor').blur();
                    }
                });
            }

            //排序
            if (options.onSort) {
                this.bindSort();
            }

            //编辑单元格
            this.$tableBody.editableTableWidget();
            if (options.onEdit) {
                this.bindEdit();
            }
            if (options.onValidate) {
                this.bindValidate();
            }
        },

        /**
         * 同步宽度
         * @protected
         */
        syncWidth: function() {
            this.$headWrap.css({
                width: this.$main.width()
            });
            this.$tableHead.css({
                width: this.$tableBody.width()
            });
        },

        /**
         * 设置表格最小宽度
         * @protected
         */
        setMinWidth: function() {
            var width = $.map(this.options.column, function(col, index) {
                if (typeof col.visible !== 'undefined' && !col.visible) {
                    return 0;
                }
                return col.width + 17;
            });
            var minWidth = this.options.selectable ? 37 : 0;
            $.each(width, function(index, val) {
                minWidth = minWidth + val;
            });
            this.$tableHead.css('min-width', minWidth);
            this.$tableBody.css('min-width', minWidth);
            this.syncWidth();
        },

        /**
         * 创建表头
         * @param {Object} options
         * @return {String}
         * @protected
         */
        createTableHead: function(options) {
            var table = ['<thead><tr>'],
                column = options.column,
                columnCount = column.length;

            this.rowSpan = 1;

            //表头
            for (var i = 0; i < columnCount; i++) {
                var col = column[i];
                if (typeof col.visible !== 'undefined' && !col.visible) {
                    continue;
                }

                if (!util.isArray(col.content)) {
                    col.content = [col.content];
                }
                if (col.content.length > this.rowSpan) {
                    this.rowSpan = col.content.length;
                }

                var sortable = (typeof col.sortable === 'undefined' || !col.sortable) ? '' : ' sortable',
                    sort = (col.sortable && typeof col.currentSort !== 'undefined') ? (' ' + col.currentSort) : '',
                    width = col.width ? ' width="' + col.width + '"' : '',
                    title = (typeof col.escapeTitle === 'undefined' || col.escapeTitle) ? util.escapeHTML(col.title) : col.title;
                table.push('<th nowrap data-width="' + col.width + '"' + width + sortable + sort + ' field="' + col.field + '">' + title + '</th>');
            }

            table.push('</tr></thead><tbody></tbody>');

            return table.join('');
        },

        /**
         * 创建表格
         * @param {Object} options
         * @return {String}
         * @protected
         */
        createTableBody: function(options) {
            var table = ['<tbody>'],
                column = options.column,
                columnCount = column.length,
                data = options.data,
                rowCount = data.length;

            //数据
            for (var j = 0; j < rowCount; j++) {
                table.push('<tr>');

                for (var k = 0; k < columnCount; k++) {
                    var col = column[k];
                    if (typeof col.visible !== 'undefined' && !col.visible) {
                        continue;
                    }
                    var editable = (col.content.length > 1 || typeof col.editable === 'undefined' || !col.editable) ? '' : ' editable',
                        align = col.align ? ' align="' + col.align + '"' : '',
                        width = col.width ? ' width="' + (editable !== '' ? col.width - 22 : col.width) + '"' : '',
                        rowSpan = (this.rowSpan > 1 && col.content.length === 1) ? (' rowspan="' + this.rowSpan + '"') : '',
                        content = col.content[0].apply(this, [data[j], j + 1, col.field]) + '',
                        escapeContent = (typeof col.escapeContent === 'undefined' || col.escapeContent) ? util.escapeHTML(content) : content;
                    table.push('<td' + width + rowSpan + editable + align + '>' + escapeContent + '</td>');
                }

                table.push('</tr>');

                //附加行
                if (this.rowSpan > 1) {
                    for (var m = 1; m < this.rowSpan; m++) {
                        table.push('<tr>');
                        for (var n = 1; n < columnCount; n++) {
                            var _col = column[n];
                            if ((typeof _col.visible !== 'undefined' && !_col.visible) || _col.content.length === 1) {
                                continue;
                            }
                            var _align = _col.align ? ' align="' + _col.align + '"' : '',
                                _content = _col.content[m].apply(this, [data[j], j + 1, _col.field]) + '',
                                _escapeContent = (typeof _col.escapeContent === 'undefined' || _col.escapeContent) ? util.escapeHTML(_content) : _content;
                            table.push('<td' + _align + '>' + _escapeContent + '</td>');
                        }
                        table.push('</tr>');
                    }
                }
            }

            table.push('</tbody>');

            return table.join('');
        },

        /**
         * 创建总计行
         * @param {Object} options
         * @return {String}
         * @protected
         */
        createFoot: function(options) {
            var sum = ['<tr class="sum">'],
                column = options.column,
                columnCount = column.length;

            if (options.selectable) {
                sum.push('<td width="20"></td>');
            }
            for (var i = 0; i < columnCount; i++) {
                var col = column[i];
                if (typeof col.visible !== 'undefined' && !col.visible) {
                    continue;
                }
                var align = col.align ? ' align="' + col.align + '"' : '',
                    width = col.width ? ' width="' + col.width + '"' : '',
                    content = col.footContent ? col.footContent.call(this, col.field) + '' : '',
                    escapeContent = (typeof col.escapeContent === 'undefined' || col.escapeContent) ? util.escapeHTML(content) : content;
                sum.push('<td' + width + align + '>' + escapeContent + '</td>');
            }

            sum.push('</tr>');

            return sum.join('');
        },

        /**
         * 创建无数据提示行
         * @protected
         */
        createNoDataContent: function() {
            var colspan = this.options.column.length;
            $.each(this.options.column, function(index, val) {
                if (typeof val.visible !== 'undefined' && !val.visible) {
                    colspan = colspan - 1;
                }
            });
            if (this.options.selectable) {
                colspan = colspan + 1;
            }
            this.$tableBody.find('tbody').append('<tr class="no-data"><td colspan="' + colspan + '">' + this.options.noDataContent + '</td></tr>');
        },

        /**
         * 创建Checkbox控件
         * @protected
         */
        createSelect: function() {
            if (this.options.data.length) {
                this.$tableHead.find('tr').prepend('<th nowrap data-width="20" width="20"><input type="checkbox" title=" " id="' + (selectPrefix + 0) + '" /></th>');
            }

            if (this.rowSpan === 1) {
                this.$tableBody.find('tr').each(function(index, tr) {
                    $(tr).prepend('<td width="20" align="center"><input type="checkbox" title=" " id="' + (selectPrefix + (index + 1)) + '" /></td>');
                });
            } else {
                var self = this,
                    rowIndex = 1;
                this.$tableBody.find('tr').each(function(index, tr) {
                    if ((index + self.rowSpan) % self.rowSpan === 0) {
                        $(tr).prepend('<td width="20" align="center" rowspan="' + self.rowSpan + '"><input type="checkbox" title=" " id="' + (selectPrefix + rowIndex) + '" /></td>');
                        rowIndex = rowIndex + 1;
                    }
                });
            }

            this.$main.find(':checkbox').bizCheckbox();
        },

        /**
         * 创建Checkbox控件
         * @protected
         */
        bindSelect: function() {
            var self = this;
            this.$main.on('click.bizTableSelectAll', '.biz-table-head th .biz-label', function(e) {
                var selected = $(e.target).hasClass('biz-checkbox-checked'),
                    checkbox = self.$tableBody.find(':checkbox'),
                    tr = self.$tableBody.find('tr[class!="sum"]');
                if (selected) {
                    checkbox.bizCheckbox('check');
                    tr.addClass('selected');
                    if (self.options.onSelect) {
                        self.options.onSelect.call(self, self.options.data, e);
                    }
                } else {
                    checkbox.bizCheckbox('uncheck');
                    tr.removeClass('selected');
                    if (self.options.onSelect) {
                        self.options.onSelect.call(self, [], e);
                    }
                }
            }).on('click.bizTableSelectOne', '.biz-table-body td .biz-label', function(e) {
                var selected = $(e.target).hasClass('biz-checkbox-checked'),
                    selectedCount = self.$tableBody.find('.biz-checkbox-checked').length,
                    selectAll = self.$tableHead.find(':checkbox'),
                    tr = $(e.target).parent().parent(),
                    rowCount = self.options.data.length;
                if (selectedCount === rowCount) {
                    selectAll.bizCheckbox('check');
                } else {
                    selectAll.bizCheckbox('uncheck');
                }
                if (selected) {
                    tr.addClass('selected');
                } else {
                    tr.removeClass('selected');
                }
                if (self.options.onSelect) {
                    self.options.onSelect.call(self, $.map(self.getSelectedIndex(), function(item, index) {
                        return self.options.data[item];
                    }), e);
                }
            });
        },

        /**
         * 获取勾选行序号
         * @return {Array}
         * @protected
         */
        getSelectedIndex: function() {
            return $.map(this.$tableBody.find('.biz-checkbox-checked'), function(label, index) {
                return parseInt($(label).attr('for').replace(selectPrefix, ''), 10) - 1;
            });
        },

        /**
         * 绑定排序事件
         * @protected
         */
        bindSort: function() {
            var self = this;
            this.$main.on('click.bizTableSort', '.biz-table-head th[sortable]', function(e) {
                var head = $(e.currentTarget),
                    field = head.attr('field');
                if (head.attr('des') !== undefined) {
                    head.removeAttr('des').attr('asc', '');
                } else if (head.attr('asc') !== undefined) {
                    head.removeAttr('asc').attr('des', '');
                } else {
                    head.parent().children('th').removeAttr('des').removeAttr('asc');
                    head.attr('des', '');
                }
                $.each(self.options.column, function(index, val) {
                    if (val.field === field) {
                        val.currentSort = head.attr('des') !== undefined ? 'des' : 'asc';
                    } else if (val.currentSort) {
                        delete val.currentSort;
                    }
                });
                self.options.onSort.call(self, {
                    field: head.attr('field'),
                    des: head.attr('des') !== undefined,
                    asc: head.attr('asc') !== undefined
                }, e);
            });
        },

        /**
         * 绑定验证事件
         * @protected
         */
        bindValidate: function() {
            var self = this;
            this.$main.find('td[editable]').on('validate', function(e, newValue) {
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

        /**
         * 绑定编辑事件
         * @protected
         */
        bindEdit: function() {
            var self = this;
            this.$main.find('td[editable]').on('change', function(e, newValue) {
                var rowIndex = parseInt($(this).parent().find(':checkbox').attr('id').replace(selectPrefix, ''), 10),
                    columIndex = $(this).parent().find('td').index($(this));
                if (self.options.selectable) {
                    columIndex = columIndex - 1;
                }
                var field = self.options.column[columIndex].field;

                //更新data
                self.options.data[rowIndex - 1][field] = newValue;

                self.options.onEdit.call(self, {
                    newValue: newValue,
                    item: self.options.data[rowIndex - 1],
                    index: rowIndex,
                    field: field
                }, e);
            });
        },

        /**
         * 获取列表数据
         * @return {Array}
         */
        getData: function() {
            return this.options.data;
        },

        /**
         * 更新列表数据
         * @param {Array} data
         */
        updateData: function(data) {
            this.options.data = $.map(data || [], function(val, index) {
                return val;
            });
            this.refresh();
        },

        /**
         * 更新列数据
         * @param {Number} rowIndex 行号
         * @param {Object} data 行数据
         */
        updateRow: function(rowIndex, data) {
            this.options.data[rowIndex - 1] = $.extend(true, {}, data);
            this.refresh();
        },

        /**
         * 更新单元格数据
         * @param {Number} rowIndex 行号
         * @param {String} field 列字段
         * @param {Mixed} data 单元格数据
         */
        updateCell: function(rowIndex, field, data) {
            this.options.data[rowIndex - 1][field] = data;
            this.refresh();
        },

        /**
         * 获取勾选行数据
         * @return {Array}
         */
        getSelected: function() {
            var self = this;
            return $.map(this.getSelectedIndex(), function(item, index) {
                return self.options.data[item];
            });
        },

        /**
         * 设置勾选状态
         * @param {Number|Array} rowIndex 行号, 0表示全部
         * @param {Boolean} selected 勾选状态
         */
        setSelected: function(rowIndex, selected) {
            var self = this;
            if (rowIndex === 0) {
                rowIndex = $.map(this.options.data, function(val, index) {
                    return index + 1;
                });
            }
            if (!util.isArray(rowIndex)) {
                rowIndex = [rowIndex];
            }

            $.each(rowIndex, function(index, val) {
                var checkbox = self.$main.find('#' + selectPrefix + val),
                    tr = checkbox.parent().parent();
                if (selected) {
                    checkbox.bizCheckbox('check');
                    tr.addClass('selected');
                } else {
                    checkbox.bizCheckbox('uncheck');
                    tr.removeClass('selected');
                }
            });

            var checkAll = this.$tableHead.find(':checkbox');
            if (this.$tableBody.find('.biz-checkbox-checked').length === this.options.data.length) {
                checkAll.bizCheckbox('check');
            } else {
                checkAll.bizCheckbox('uncheck');
            }
        },

        /**
         * 显示列
         * @param {String|Array} field 列字段
         */
        showColumn: function(field) {
            this.setColumnVisible(field, true);
        },

        /**
         * 隐藏列
         * @param {String|Array} field 列字段
         */
        hideColumn: function(field) {
            this.setColumnVisible(field, false);
        },

        /**
         * 设置列显隐
         * @param {String|Array} field 列字段
         * @param {Boolean} visible 列字段
         * @protected
         */
        setColumnVisible: function(field, visible) {
            if (!util.isArray(field)) {
                field = [field];
            }
            var self = this;
            $.each(field, function(i, f) {
                $.each(self.options.column, function(j, col) {
                    if (col.field === f) {
                        col.visible = visible;
                    }
                });
            });
            this.refresh();
        },

        /**
         * 根据当前参数重绘表格
         */
        refresh: function() {
            //销毁
            this.$main.find(':checkbox').bizCheckbox('destroy');
            this.$tableBody.find('td[editable]').off();

            //重绘表格
            this.$tableHead.html(this.createTableHead(this.options));
            this.$tableBody.html(this.createTableBody(this.options));

            //重建checkbox
            if (this.options.selectable) {
                this.createSelect();
            }

            if (this.options.data.length) { //重绘总计行
                if (this.options.foot === 'top') {
                    this.$tableBody.find('tbody').prepend(this.createFoot(this.options));
                }
                if (this.options.foot === 'bottom') {
                    this.$tableBody.find('tbody').append(this.createFoot(this.options));
                }
            } else if (this.options.noDataContent) { //重绘无数据提示行
                this.createNoDataContent();
            }

            //同步宽度
            this.syncWidth();

            //重置滚条位置
            this.$headWrap[0].scrollLeft = this.$bodyWrap[0].scrollLeft = 0;

            //重置列宽
            if (this.options.resizable) {
                this.setMinWidth();
                this.$tableHead.resizableColumns('destroy').resizableColumns({
                    start: function() {
                        $('.biz-table-editor').blur();
                    }
                });
            }

            //重置编辑
            this.$tableBody.find('td').prop('tabindex', 1);
            if (this.options.onEdit) {
                this.bindEdit();
            }
            if (this.options.onValidate) {
                this.bindValidate();
            }
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.find(':checkbox').bizCheckbox('destroy');
            this.$tableBody.find('td[editable]').off();
            $('.biz-table-editor').off().remove();

            this.$main.off('click.bizTableSelectAll')
                .off('click.bizTableSelectOne')
                .off('click.bizTableSort');

            if (this.options.resizable) {
                this.$tableHead.resizableColumns('destroy');
            }

            $(window).off('scroll.bizTable');

            this.$headWrap.off();
            this.$bodyWrap.off();

            this.$main.empty();
        }
    };

    function isTable(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'div';
    }

    var dataKey = 'bizTable';

    $.extend($.fn, {
        bizTable: function(method, options) {
            var table;
            switch (method) {
                case 'getData':
                    return this.data(dataKey).getData();
                case 'updateData':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.updateData(options);
                        }
                    });
                    break;
                case 'updateRow':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.updateRow(args[1], args[2]);
                        }
                    });
                    break;
                case 'updateCell':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.updateCell(args[1], args[2], args[3]);
                        }
                    });
                    break;
                case 'getSelected':
                    return this.data(dataKey).getSelected();
                case 'setSelected':
                    var args = arguments;
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.setSelected(args[1], args[2]);
                        }
                    });
                    break;
                case 'showColumn':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.showColumn(options);
                        }
                    });
                    break;
                case 'hideColumn':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.hideColumn(options);
                        }
                    });
                    break;
                case 'destroy':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTable(this)) {
                            $(this).data(dataKey, new Table(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return Table;
});
/**
 * @ignore
 */
define('dep/jquery.treetable',['require'],function(require) {
    var Node, Tree, methods;

    Node = (function() {
        function Node(row, tree, settings) {
            var parentId;

            this.row = row;
            this.tree = tree;
            this.settings = settings;

            // TODO Ensure id/parentId is always a string (not int)
            this.id = this.row.data(this.settings.nodeIdAttr);

            // TODO Move this to a setParentId function?
            parentId = this.row.data(this.settings.parentIdAttr);
            if (parentId != null && parentId !== "") {
                this.parentId = parentId;
            }

            this.treeCell = $(this.row.children(this.settings.columnElType)[this.settings.column]);
            this.expander = $(this.settings.expanderTemplate);
            this.indenter = $(this.settings.indenterTemplate);
            this.children = [];
            this.initialized = false;
            this.treeCell.prepend(this.indenter);
        }

        Node.prototype.addChild = function(child) {
            return this.children.push(child);
        };

        Node.prototype.ancestors = function() {
            var ancestors, node;
            node = this;
            ancestors = [];
            while (node = node.parentNode()) {
                ancestors.push(node);
            }
            return ancestors;
        };

        Node.prototype.collapse = function() {
            if (this.collapsed()) {
                return this;
            }

            this.row.removeClass("expanded").addClass("collapsed");

            this._hideChildren();
            this.expander.attr("title", this.settings.stringExpand);

            if (this.initialized && this.settings.onNodeCollapse != null) {
                this.settings.onNodeCollapse.apply(this);
            }

            return this;
        };

        Node.prototype.collapsed = function() {
            return this.row.hasClass("collapsed");
        };

        // TODO destroy: remove event handlers, expander, indenter, etc.

        Node.prototype.expand = function() {
            if (this.expanded()) {
                return this;
            }

            this.row.removeClass("collapsed").addClass("expanded");

            if (this.initialized && this.settings.onNodeExpand != null) {
                this.settings.onNodeExpand.apply(this);
            }

            if ($(this.row).is(":visible")) {
                this._showChildren();
            }

            this.expander.attr("title", this.settings.stringCollapse);

            return this;
        };

        Node.prototype.expanded = function() {
            return this.row.hasClass("expanded");
        };

        Node.prototype.hide = function() {
            this._hideChildren();
            this.row.hide();
            return this;
        };

        Node.prototype.isBranchNode = function() {
            if (this.children.length > 0 || this.row.data(this.settings.branchAttr) === true) {
                return true;
            } else {
                return false;
            }
        };

        Node.prototype.updateBranchLeafClass = function() {
            this.row.removeClass('branch');
            this.row.removeClass('leaf');
            this.row.addClass(this.isBranchNode() ? 'branch' : 'leaf');
        };

        Node.prototype.level = function() {
            return this.ancestors().length;
        };

        Node.prototype.parentNode = function() {
            if (this.parentId != null) {
                return this.tree[this.parentId];
            } else {
                return null;
            }
        };

        Node.prototype.removeChild = function(child) {
            var i = $.inArray(child, this.children);
            return this.children.splice(i, 1);
        };

        Node.prototype.render = function() {
            var handler,
                settings = this.settings,
                target;

            if (settings.expandable === true && this.isBranchNode()) {
                handler = function(e) {
                    $(this).parents("table").treetable("node", $(this).parents("tr").data(settings.nodeIdAttr)).toggle();
                    return e.preventDefault();
                };

                this.indenter.html(this.expander);
                target = settings.clickableNodeNames === true ? this.treeCell : this.expander;

                target.off("click.treetable").on("click.treetable", handler);
                target.off("keydown.treetable").on("keydown.treetable", function(e) {
                    if (e.keyCode == 13) {
                        handler.apply(this, [e]);
                    }
                });
            }

            this.indenter[0].style.paddingLeft = "" + (this.level() * settings.indent) + "px";

            return this;
        };

        Node.prototype.reveal = function() {
            if (this.parentId != null) {
                this.parentNode().reveal();
            }
            return this.expand();
        };

        Node.prototype.setParent = function(node) {
            if (this.parentId != null) {
                this.tree[this.parentId].removeChild(this);
            }
            this.parentId = node.id;
            this.row.data(this.settings.parentIdAttr, node.id);
            return node.addChild(this);
        };

        Node.prototype.show = function() {
            if (!this.initialized) {
                this._initialize();
            }
            this.row.show();
            if (this.expanded()) {
                this._showChildren();
            }
            return this;
        };

        Node.prototype.toggle = function() {
            if (this.expanded()) {
                this.collapse();
            } else {
                this.expand();
            }
            return this;
        };

        Node.prototype._hideChildren = function() {
            var child, _i, _len, _ref, _results;
            _ref = this.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(child.hide());
            }
            return _results;
        };

        Node.prototype._initialize = function() {
            var settings = this.settings;

            this.render();

            if (settings.expandable === true && settings.initialState === "collapsed") {
                this.collapse();
            } else {
                this.expand();
            }

            if (settings.onNodeInitialized != null) {
                settings.onNodeInitialized.apply(this);
            }

            return this.initialized = true;
        };

        Node.prototype._showChildren = function() {
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
    })();

    Tree = (function() {
        function Tree(table, settings) {
            this.table = table;
            this.settings = settings;
            this.tree = {};

            // Cache the nodes and roots in simple arrays for quick access/iteration
            this.nodes = [];
            this.roots = [];
        }

        Tree.prototype.collapseAll = function() {
            var node, _i, _len, _ref, _results;
            _ref = this.nodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                node = _ref[_i];
                _results.push(node.collapse());
            }
            return _results;
        };

        Tree.prototype.expandAll = function() {
            var node, _i, _len, _ref, _results;
            _ref = this.nodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                node = _ref[_i];
                _results.push(node.expand());
            }
            return _results;
        };

        Tree.prototype.findLastNode = function(node) {
            if (node.children.length > 0) {
                return this.findLastNode(node.children[node.children.length - 1]);
            } else {
                return node;
            }
        };

        Tree.prototype.loadRows = function(rows) {
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

        Tree.prototype.move = function(node, destination) {
            // Conditions:
            // 1: +node+ should not be inserted as a child of +node+ itself.
            // 2: +destination+ should not be the same as +node+'s current parent (this
            //    prevents +node+ from being moved to the same location where it already
            //    is).
            // 3: +node+ should not be inserted in a location in a branch if this would
            //    result in +node+ being an ancestor of itself.
            var nodeParent = node.parentNode();
            if (node !== destination && destination.id !== node.parentId && $.inArray(node, destination.ancestors()) === -1) {
                node.setParent(destination);
                this._moveRows(node, destination);

                // Re-render parentNode if this is its first child node, and therefore
                // doesn't have the expander yet.
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

        Tree.prototype.removeNode = function(node) {
            // Recursively remove all descendants of +node+
            this.unloadBranch(node);

            // Remove node from DOM (<tr>)
            node.row.remove();

            // Remove node from parent children list
            if (node.parentId != null) {
                node.parentNode().removeChild(node);
            }

            // Clean up Tree object (so Node objects are GC-ed)
            delete this.tree[node.id];
            this.nodes.splice($.inArray(node, this.nodes), 1);

            return this;
        };

        Tree.prototype.render = function() {
            var root, _i, _len, _ref;
            _ref = this.roots;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                root = _ref[_i];

                // Naming is confusing (show/render). I do not call render on node from
                // here.
                root.show();
            }
            return this;
        };

        Tree.prototype.sortBranch = function(node, sortFun) {
            // First sort internal array of children
            node.children.sort(sortFun);

            // Next render rows in correct order on page
            this._sortChildRows(node);

            return this;
        };

        Tree.prototype.unloadBranch = function(node) {
            // Use a copy of the children array to not have other functions interfere
            // with this function if they manipulate the children array
            // (eg removeNode).
            var children = node.children.slice(0),
                i;

            for (i = 0; i < children.length; i++) {
                this.removeNode(children[i]);
            }

            // Reset node's collection of children
            node.children = [];

            node.updateBranchLeafClass();

            return this;
        };

        Tree.prototype._moveRows = function(node, destination) {
            var children = node.children,
                i;

            node.row.insertAfter(destination.row);
            node.render();

            // Loop backwards through children to have them end up on UI in correct
            // order (see #112)
            for (i = children.length - 1; i >= 0; i--) {
                this._moveRows(children[i], node);
            }
        };

        // Special _moveRows case, move children to itself to force sorting
        Tree.prototype._sortChildRows = function(parentNode) {
            return this._moveRows(parentNode, parentNode);
        };

        return Tree;
    })();

    // jQuery Plugin
    methods = {
        init: function(options, force) {
            var settings;

            settings = $.extend({
                branchAttr: "ttBranch",
                clickableNodeNames: false,
                column: 0,
                columnElType: "td", // i.e. 'td', 'th' or 'td,th'
                expandable: false,
                expanderTemplate: "<a href='#'>&nbsp;</a>",
                indent: 19,
                indenterTemplate: "<span class='indenter'></span>",
                initialState: "collapsed",
                nodeIdAttr: "ttId", // maps to data-tt-id
                parentIdAttr: "ttParentId", // maps to data-tt-parent-id
                stringExpand: "Expand",
                stringCollapse: "Collapse",

                // Events
                onInitialized: null,
                onNodeCollapse: null,
                onNodeExpand: null,
                onNodeInitialized: null
            }, options);

            return this.each(function() {
                var el = $(this),
                    tree;

                if (force || el.data("treetable") === undefined) {
                    tree = new Tree(this, settings);
                    tree.loadRows(this.rows).render();

                    el.data("treetable", tree);

                    if (settings.onInitialized != null) {
                        settings.onInitialized.apply(tree);
                    }
                }

                return el;
            });
        },

        destroy: function() {
            return this.each(function() {
                return $(this).removeData("treetable");
            });
        },

        collapseAll: function() {
            this.data("treetable").collapseAll();
            return this;
        },

        collapseNode: function(id) {
            var node = this.data("treetable").tree[id];

            if (node) {
                node.collapse();
            } else {
                throw new Error("Unknown node '" + id + "'");
            }

            return this;
        },

        expandAll: function() {
            this.data("treetable").expandAll();
            return this;
        },

        expandNode: function(id) {
            var node = this.data("treetable").tree[id];

            if (node) {
                if (!node.initialized) {
                    node._initialize();
                }

                node.expand();
            } else {
                throw new Error("Unknown node '" + id + "'");
            }

            return this;
        },

        loadBranch: function(node, rows) {
            var settings = this.data("treetable").settings,
                tree = this.data("treetable").tree;

            // TODO Switch to $.parseHTML
            rows = $(rows);

            if (node == null) { // Inserting new root nodes
                this.append(rows);
            } else {
                var lastNode = this.data("treetable").findLastNode(node);
                rows.insertAfter(lastNode.row);
            }

            this.data("treetable").loadRows(rows);

            // Make sure nodes are properly initialized
            rows.filter("tr").each(function() {
                tree[$(this).data(settings.nodeIdAttr)].show();
            });

            if (node != null) {
                // Re-render parent to ensure expander icon is shown (#79)
                node.render().expand();
            }

            return this;
        },

        move: function(nodeId, destinationId) {
            var destination, node;

            node = this.data("treetable").tree[nodeId];
            destination = this.data("treetable").tree[destinationId];
            this.data("treetable").move(node, destination);

            return this;
        },

        node: function(id) {
            return this.data("treetable").tree[id];
        },

        removeNode: function(id) {
            var node = this.data("treetable").tree[id];

            if (node) {
                this.data("treetable").removeNode(node);
            } else {
                throw new Error("Unknown node '" + id + "'");
            }

            return this;
        },

        reveal: function(id) {
            var node = this.data("treetable").tree[id];

            if (node) {
                node.reveal();
            } else {
                throw new Error("Unknown node '" + id + "'");
            }

            return this;
        },

        sortBranch: function(node, columnOrFunction) {
            var settings = this.data("treetable").settings,
                prepValue,
                sortFun;

            columnOrFunction = columnOrFunction || settings.column;
            sortFun = columnOrFunction;

            if ($.isNumeric(columnOrFunction)) {
                sortFun = function(a, b) {
                    var extractValue, valA, valB;

                    extractValue = function(node) {
                        var val = node.row.find("td:eq(" + columnOrFunction + ")").text();
                        // Ignore trailing/leading whitespace and use uppercase values for
                        // case insensitive ordering
                        return $.trim(val).toUpperCase();
                    };

                    valA = extractValue(a);
                    valB = extractValue(b);

                    if (valA < valB) return -1;
                    if (valA > valB) return 1;
                    return 0;
                };
            }

            this.data("treetable").sortBranch(node, sortFun);
            return this;
        },

        unloadBranch: function(node) {
            this.data("treetable").unloadBranch(node);
            return this;
        }
    };

    $.fn.treetable = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            return $.error("Method " + method + " does not exist on jQuery.treetable");
        }
    };
});
/**
 * @ignore
 */
define('ui/TreeTable',['require','dep/jquery.resizableColumns','dep/jquery.treetable'],function(require) {
    require('dep/jquery.resizableColumns');
    require('dep/jquery.treetable');

    /**
     * TreeTable constructor
     *
     * <iframe width="100%" height="350" src="//jsfiddle.net/bizdevfe/xxbdkfwy/embedded/result,js,html/" frameborder="0"></iframe>
     * @constructor
     * @param {HTMLElement|jQuery} table 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.resizable] 是否可调整列宽
     * @param {Boolean} [options.expanded] 是否展开
     * @param {Function} [options.onLoad] 初始化回调, this 为 Tree 对象
     * @param {Function} [options.onSelect] 选中回调, this 为 Node 对象
     */
    function TreeTable(table, options) {
        if (table instanceof jQuery) {
            if (table.length > 0) {
                table = table[0]; //只取第一个元素
            } else {
                return;
            }
        }

        if (!isTable(table)) {
            return;
        }

        /**
         * @property {HTMLElement} main `table`元素
         */
        this.main = table;

        /**
         * @property {jQuery} $main `table`元素的$包装
         */
        this.$main = $(this.main);

        var defaultOption = {
            resizable: true,
            expanded: true
        };
        this.options = $.extend(defaultOption, options || {});
        this.init(this.options);
    }

    var defaultClass = 'biz-table biz-treetable';

    TreeTable.prototype = {
        /**
         * 初始化
         * @param {Object} [options] 参数
         * @protected
         */
        init: function(options) {
            this.$main.addClass(defaultClass);

            var self = this;
            this.$main.treetable({
                expandable: true,
                stringCollapse: '',
                stringExpand: '',
                initialState: options.expanded ? 'expanded' : 'collapsed',
                onInitialized: options.onLoad,
                onNodeCollapse: options.onCollapse,
                onNodeExpand: options.onExpand
            }).on('click.bizTreeTable', 'tbody tr', function(e) {
                $('.tree-selected').not(this).removeClass('tree-selected');
                $(this).toggleClass('tree-selected');
                if ($(this).hasClass('tree-selected') && options.onSelect) {
                    var node = self.$main.treetable('node', $(this).attr('data-tt-id'));
                    options.onSelect.call(node);
                }
            });

            if (options.resizable) {
                this.$main.resizableColumns();
            }
        },

        /**
         * 收起所有节点
         */
        collapseAll: function() {
            this.$main.treetable('collapseAll');
        },

        /**
         * 收起指定节点
         * @param {String} [id] 节点id
         */
        collapseNode: function(id) {
            this.$main.treetable('collapseNode', id);
        },

        /**
         * 展开所有节点
         */
        expandAll: function() {
            this.$main.treetable('expandAll');
        },

        /**
         * 展开指定节点
         * @param {String} [id] 节点id
         */
        expandNode: function(id) {
            this.$main.treetable('expandNode', id);
        },

        /**
         * 选中指定节点
         * @param {String} [id] 节点id
         */
        selectNode: function(id) {
            this.$main.treetable('reveal', id);
            this.$main.find('tr[data-tt-id="' + id + '"]').click();
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.$main.removeClass(defaultClass)
                .treetable('destroy')
                .off('click.bizTreeTable');
            this.$main.find('span.indenter a').off();
            this.$main.find('span.indenter').remove();
            this.$main.resizableColumns('destroy');
        }
    };

    function isTable(elem) {
        return elem.nodeType === 1 && elem.tagName.toLowerCase() === 'table';
    }

    var dataKey = 'bizTreeTable';

    $.extend($.fn, {
        bizTreeTable: function(method, options) {
            var table;
            switch (method) {
                case 'destroy':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.destroy();
                            $(this).data(dataKey, null);
                        }
                    });
                    break;
                case 'collapseAll':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.collapseAll();
                        }
                    });
                    break;
                case 'collapseNode':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.collapseNode(options);
                        }
                    });
                    break;
                case 'expandAll':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.expandAll();
                        }
                    });
                    break;
                case 'expandNode':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.expandNode(options);
                        }
                    });
                    break;
                case 'selectNode':
                    this.each(function() {
                        table = $(this).data(dataKey);
                        if (table) {
                            table.selectNode(options);
                        }
                    });
                    break;
                default:
                    this.each(function() {
                        if (!$(this).data(dataKey) && isTable(this)) {
                            $(this).data(dataKey, new TreeTable(this, method));
                        }
                    });
            }

            return this;
        }
    });

    return TreeTable;
});
/**
 * @ignore
 */
define('bizui',['require','ui/Button','ui/Input','ui/Textarea','ui/Textline','ui/Radio','ui/Checkbox','ui/Select','ui/Dialog','ui/Panel','ui/Tooltip','ui/Tab','ui/Page','ui/Tree','ui/Calendar','ui/Table','ui/TreeTable'],function(require) {
    /**
     * 命名空间
     * @class bizui
     * @singleton
     */
    var bizui = {};

    /**
     * @property {String} version 版本号
     */
    bizui.version = '1.1.3';

    var origin = window.bizui;

    /**
     * 获取无冲突bizui
     * @return {Object} bizui
     */
    bizui.noConflict = function() {
        window.bizui = origin;
        return this;
    };

    $.extend(bizui, {
        /**
         * {@link Button} constructor
         * @method Button
         */
        Button: require('ui/Button'),

        /**
         * {@link Input} constructor
         * @method Input
         */
        Input: require('ui/Input'),

        /**
         * {@link Textarea} constructor
         * @method Textarea
         */
        Textarea: require('ui/Textarea'),

        /**
         * {@link Textline} constructor
         * @method Textline
         */
        Textline: require('ui/Textline'),

        /**
         * {@link Radio} constructor
         * @method Radio
         */
        Radio: require('ui/Radio'),

        /**
         * {@link Checkbox} constructor
         * @method Checkbox
         */
        Checkbox: require('ui/Checkbox'),

        /**
         * {@link Select} constructor
         * @method Select
         */
        Select: require('ui/Select'),

        /**
         * {@link Dialog} constructor
         * @method Dialog
         */
        Dialog: require('ui/Dialog'),

        /**
         * {@link Panel} constructor
         * @method Panel
         */
        Panel: require('ui/Panel'),

        /**
         * {@link Tooltip} method
         * @method Tooltip
         */
        Tooltip: require('ui/Tooltip'),

        /**
         * {@link Tab} constructor
         * @method Tab
         */
        Tab: require('ui/Tab'),

        /**
         * {@link Page} constructor
         * @method Page
         */
        Page: require('ui/Page'),

        /**
         * {@link Tree} constructor
         * @method Tree
         */
        Tree: require('ui/Tree'),

        /**
         * {@link Calendar} constructor
         * @method Calendar
         */
        Calendar: require('ui/Calendar'),

        /**
         * {@link Table} constructor
         * @method Table
         */
        Table: require('ui/Table'),

        /**
         * {@link TreeTable} constructor
         * @method TreeTable
         */
        TreeTable: require('ui/TreeTable')
    });

    return bizui;
});
return require('bizui');
}));