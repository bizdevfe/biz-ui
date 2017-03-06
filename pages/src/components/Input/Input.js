var Input = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .input').parent().addClass('active');

        var view = this;
        $.get('src/components/Input/input.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
      		view.initBizUI();
      		hljs.initHighlighting.called = false;
      		hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $('input').bizInput().on('enter', function(e, value) {
            bizui.alert(value);
        });
        $('.item2').bizInput('disable');
	},

    destroy: function() {
        $('input').bizInput('destroy');
        this.$el.empty();
    }
});
