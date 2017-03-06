var Checkbox = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .checkbox').parent().addClass('active');

        var view = this;
        $.get('src/components/Checkbox/checkbox.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        var checkboxGroup = $(':checkbox');
        checkboxGroup.bizCheckbox({
            theme: 'green'
        });
        $('button').bizButton({
            theme: 'blue-gray'
        });
        $('#b1').click(function() {
            $('#apple').bizCheckbox('check');
        });
        $('#b2').click(function() {
            $('#banana').bizCheckbox('check');
        });
        $('#b3').click(function() {
            $('#cherry').bizCheckbox('check');
        });
        $('#b4').click(function() {
            checkboxGroup.bizCheckbox('uncheck');
        });
        $('#b5').click(function() {
            checkboxGroup.bizCheckbox('disable');
        });
        $('#b6').click(function() {
            checkboxGroup.bizCheckbox('enable');
        });
        $('#b7').click(function() {
            bizui.alert(checkboxGroup.bizCheckbox('val'));
        });
	},

    destroy: function() {
        $('button').bizButton('destroy').off();
        $(':checkbox').bizCheckbox('destroy');
        this.$el.empty();
    }
});
