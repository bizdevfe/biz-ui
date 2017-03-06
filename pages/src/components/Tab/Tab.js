var Tab = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .tab').parent().addClass('active');

        var view = this;
        $.get('src/components/Tab/tab.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        var tabs = $('.tabs');
        tabs.bizTab().on('change', function(e, data) {
            $('.log').html('index: ' + data.index + ', title: ' + data.title + ', content: ' + data.content);
        });
        $('button').bizButton({
            theme: 'blue-gray'
        });
        $('#b1').click(function() {
            tabs.bizTab('index', 0);
        });
        $('#b2').click(function() {
            tabs.bizTab('index', 1);
        });
        $('#b3').click(function() {
            tabs.bizTab('index', 2);
        });
        $('#b4').click(function() {
            var data = tabs.bizTab('index');
            bizui.alert('index: ' + data.index + ', title: ' + data.title + ', content: ' + data.content);
        });
	},

    destroy: function() {
        $('button').bizButton('destroy').off();
		$('.tab').bizTab('destroy');
        this.$el.empty();
    }
});
