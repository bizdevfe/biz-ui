var Radio = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .radio').parent().addClass('active');

        var view = this;
        $.get('src/components/Radio/radio.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        var radioGroup = $(':radio');
        radioGroup.bizRadio({
            theme: 'green'
        });
        $('button').bizButton({
            theme: 'blue-gray'
        });
        $('#b1').click(function() {
            $('#apple').bizRadio('check');
        });
        $('#b2').click(function() {
            $('#banana').bizRadio('check');
        });
        $('#b3').click(function() {
            $('#cherry').bizRadio('check');
        });
        $('#b4').click(function() {
            radioGroup.bizRadio('uncheck');
        });
        $('#b5').click(function() {
            radioGroup.bizRadio('disable');
        });
        $('#b6').click(function() {
            radioGroup.bizRadio('enable');
        });
        $('#b7').click(function() {
            bizui.alert(radioGroup.bizRadio('val'));
        });
	},

    destroy: function() {
        $('button').bizButton('destroy').off();
        $(':radio').bizRadio('destroy');
        this.$el.empty();
    }
});
