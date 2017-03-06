require('tips.js');

function Tooltip(options) {
    // add css prefix
    if (options.theme) {
        options.tooltipClass = 'biz-tooltip-' + options.theme;
    }

    // bug fix
    if (options.removeAll) {
        $(document).off('focus.tips', '**');
    }

    $.tips(options);
}

module.exports = Tooltip;