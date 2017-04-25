var Transfer = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .transfer').parent().addClass('active');

        var view = this;
        $.get('src/components/Transfer/transfer.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        var data = [
            {
                id: 1,
                title: 'Apple',
                chosen: false
            }, {
                id: 2,
                title: 'Banana',
                chosen: true
            }, {
                id: 3,
                title: 'Cherry',
                chosen: false
            }, {
                id: 4,
                title: 'Grape',
                chosen: false
            }, {
                id: 5,
                title: 'Orange',
                chosen: false
            }
        ];
        $('.transfer-container').bizTransfer({
            dataSource: data,
            theme: 'pink'
        });
	},

    destroy: function() {
        $('.transfer-container').bizTransfer('destroy');
        this.$el.empty();
    }
});
