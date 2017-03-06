var Panel = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .panel').parent().addClass('active');

        var view = this;
        $.get('src/components/Panel/panel.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $('button').bizButton({
            theme: 'blue-gray'
        }).click(function() {
            $('.panel-content').bizPanel('open');
        });
        $('.panel-content').bizPanel({
            buttons: [
                {
                    text: 'OK',
                    icon: 'done',
                    onClick: function() {
                        this.close();
                    }
                },
                {
                    text: 'Cancel',
                    icon: 'close',
                    theme: 'gray',
                    onClick: function() {
                        this.close();
                    }
                }
            ]
        });
    },

    destroy: function() {
        $('button').bizButton('destroy').off();
        $('.panel-content').bizPanel('destroy');
        this.$el.empty();
    }
});
