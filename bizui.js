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
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/sx74qw4g/1/)
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
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/wus1a8wy/1/)
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
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/bsjn9hpw/2/)
     * @constructor
     * @param {HTMLElement|jQuery} select 目标元素
     * @param {Object} [options] 参数
     */
    function Select(select, options) {
        this.instance = new SelectBox($(select), options);

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
    /**
     * Dialog constructor
     *
     * [See example on JSFiddle](http://jsfiddle.net/bizdevfe/j5agtk3u/)
     * @constructor
     * @param {HTMLElement|jQuery} dialog 目标元素
     * @param {Object} [options] 参数
     * @param {Number} [options.width] 宽度
     * @param {Number} [options.height] 高度
     * @param {Array} [options.buttons] 按钮组 {text: '', click: function(){}, theme: ''}
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
                    }).click(function(e) {
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

/**
 * @ignore
 */
define('bizui',['require','ui/Button','ui/Input','ui/Textarea','ui/Radio','ui/Checkbox','ui/Select','ui/Dialog'],function(require) {
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
        Checkbox: require('ui/Checkbox'),

        /**
         * {@link Select} 构造器
         * @method Select
         */
        Select: require('ui/Select'),

        /**
         * {@link Dialog} 构造器
         * @method Dialog
         */
        Dialog: require('ui/Dialog')
    });

    return bizui;
});

return require('bizui');
}));