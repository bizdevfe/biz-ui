/**
 * BizUI Framework
 * @version v2.0.0
 * @copyright 2015 Sogou, Inc.
 * @link https://github.com/bizdevfe/biz-ui
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.bizui = factory();
    }
}(this, function () {var requirejs, require, define;
(function(undef) {
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
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

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
        return function() {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function(name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function(value) {
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
    makeMap = function(name, relName) {
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
        return function() {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function(name) {
            return makeRequire(name);
        },
        exports: function(name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function(name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function(name, deps, callback, relName) {
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

    requirejs = require = req = function(deps, callback, relName, forceSync, alt) {
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
        callback = callback || function() {};

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
            setTimeout(function() {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function(cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function(name, deps, callback) {

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

define("loader/almond", function(){});

/**
 * @ignore
 */
define('ui/Button',['require'],function(require) {
    /**
     * Button constructor
     *
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/yaram3jy/3/)
     * @constructor
     * @param {HTMLElement|jQuery} button 目标元素
     * @param {Object} [options] 参数
     * @param {String} [options.theme] 主题
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

        this.main = button;
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
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/sx74qw4g/)
     * @constructor
     * @param {HTMLElement|jQuery} input 目标元素
     * @param {Object} [options] 参数
     * @param {Boolean} [options.disabled] 是否禁用
     * @param {Function} [options.onEnter] 按回车回调
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

        this.main = input;
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

            if (options.onEnter) {
                var self = this;
                this.$main.on('keydown.bizInput', function(e) {
                    if (e.keyCode === 13) {
                        options.onEnter.call(self, e);
                    }
                });
            }

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
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/wus1a8wy/)
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

        this.main = textarea;
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
define('ui/Radio',['require'],function(require) {
    /**
     * Radio constructor
     *
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/o74stme1/)
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

        this.main = radio;
        this.$main = $(this.main);
        this.group = $('input[name="' + this.$main.attr('name') + '"]');
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

            this.label = this.$main.next();
            this.label.addClass(defaultClass);

            //初始状态
            if (this.main.checked) {
                this.label.addClass(this.main.disabled ? checkedDisabled : checked);
            } else {
                this.label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
            }

            var self = this;
            this.label.on('mouseover.bizRadio', function(e) {
                if (!self.main.disabled) {
                    $(this).addClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('mouseout.bizRadio', function(e) {
                if (!self.main.disabled) {
                    $(this).removeClass(self.main.checked ? checkedHover : uncheckedHover);
                }
            }).on('click.bizRadio', function(e) {
                if (!self.main.disabled) {
                    self.group.bizRadio('uncheck');
                    $(this).attr('class', defaultClass + ' ' + checked + ' ' + checkedHover);
                }
            });
        },

        /**
         * 勾选
         */
        check: function() {
            this.group.bizRadio('uncheck');
            this.main.checked = true;
            this.label.attr('class', defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
        },

        /**
         * 取消勾选
         */
        uncheck: function() {
            this.main.checked = false;
            this.label.attr('class', defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.label.attr('class', defaultClass + ' ' + (this.main.checked ? checked : unchecked));
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.label.attr('class', defaultClass + ' ' + (this.main.checkedDisabled ? checked : uncheckedDisabled));
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
            this.label.off('mouseover.bizRadio')
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
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/Lcp5mpLt/)
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

        this.main = checkbox;
        this.$main = $(this.main);
        this.group = $('input[name="' + this.$main.attr('name') + '"]');
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

            this.label = this.$main.next();
            this.label.addClass(defaultClass);

            //初始状态
            if (this.main.checked) {
                this.label.addClass(this.main.disabled ? checkedDisabled : checked);
            } else {
                this.label.addClass(this.main.disabled ? uncheckedDisabled : unchecked);
            }

            var self = this;
            this.label.on('mouseover.bizCheckbox', function(e) {
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
            this.label.attr('class', defaultClass + ' ' + (this.main.disabled ? checkedDisabled : checked));
        },

        /**
         * 取消勾选
         */
        uncheck: function() {
            this.main.checked = false;
            this.label.attr('class', defaultClass + ' ' + (this.main.disabled ? uncheckedDisabled : unchecked));
        },

        /**
         * 激活
         */
        enable: function() {
            this.main.disabled = false;
            this.label.attr('class', defaultClass + ' ' + (this.main.checked ? checked : unchecked));
        },

        /**
         * 禁用
         */
        disable: function() {
            this.main.disabled = true;
            this.label.attr('class', defaultClass + ' ' + (this.main.checkedDisabled ? checked : uncheckedDisabled));
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
            this.label.off('mouseover.bizCheckbox')
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
define('bizui',['require','ui/Button','ui/Input','ui/Textarea','ui/Radio','ui/Checkbox'],function(require) {
    /**
     * 命名空间
     * @class bizui
     * @singleton
     */
    var bizui = {};

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
         * {@link Button} 构造器
         * @method Button
         */
        Button: require('ui/Button'),

        /**
         * {@link Input} 构造器
         * @method Input
         */
        Input: require('ui/Input'),

        /**
         * {@link Textarea} 构造器
         * @method Textarea
         */
        Textarea: require('ui/Textarea'),

        /**
         * {@link Radio} 构造器
         * @method Radio
         */
        Radio: require('ui/Radio'),

        /**
         * {@link Checkbox} 构造器
         * @method Checkbox
         */
        Checkbox: require('ui/Checkbox')
    });

    return bizui;
});

return require('bizui');
}));