var Switch = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .switch').parent().addClass('active');

        var view = this;
        $.get('src/components/Switch/switch.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $(':checkbox').bizSwitch({
            theme: 'green'
        });
	},

    destroy: function() {
		$(':checkbox').bizSwitch('destroy');
        this.$el.empty();
    }
});
