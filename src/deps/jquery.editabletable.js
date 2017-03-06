(function(factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($, undefined) {

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
                        editor.val(active.text())
                            .removeClass('error')
                            .show()
                            .offset(active.offset())
                            .css(active.css(activeOptions.cloneProperties))
                            .width(active.width())
                            .height(active.height())
                            .focus();
                        if (select) {
                            editor.select();
                        }
                    }
                },
                setActiveText = function(trigger) {
                    var text = $.trim(editor.val()),
                        evt = $.Event('change'),
                        originalContent;
                    if (!active || active.text() === text /* || editor.hasClass('error')*/ ) {
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
                setActiveText(true);
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

            $(window).on('resize.bizTableEdit', function() {
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

}));