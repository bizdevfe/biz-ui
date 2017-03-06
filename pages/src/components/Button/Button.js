var Button = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .button').parent().addClass('active');

        var view = this;
        $.get('src/components/Button/button.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $('.ok').bizButton();
        $('.search').bizButton({
            theme: 'light-green',
            icon: 'search'
        });
        $('.disabled').bizButton({
            disabled: true
        });
	},

    destroy: function() {
		$('button').bizButton('destroy');
        this.$el.empty();
    }
});
