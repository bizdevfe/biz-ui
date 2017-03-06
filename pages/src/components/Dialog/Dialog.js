var Dialog = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .dialog').parent().addClass('active');

        var view = this;
        $.get('src/components/Dialog/dialog.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $('button').bizButton({
            theme: 'blue-gray'
        });
        $('.d1').bizDialog({
            buttons: [
                {
                    text: 'OK',
                    icon: 'done',
                    onClick: function() {
                        this.close();
                    }
                }
            ]
        });
        $('#b1').click(function() {
            $('.d1').bizDialog('open');
        });
        $('.d2').bizDialog({
            buttons: [
                {
                    text: 'OK',
                    icon: 'done',
                    onClick: function() {
                        this.close();
                    }
                }
            ],
            position: 'absolute'
        });
        $('#b2').click(function() {
            $('.d2').bizDialog('open');
        });
        $('.d3').bizDialog({
            buttons: [
                {
                    text: 'OK',
                    icon: 'done',
                    onClick: function() {
                        this.close();
                    }
                }
            ],
            draggable: true
        });
        $('#b3').click(function() {
            $('.d3').bizDialog('open');
        });
        $('#b4').click(function() {
            bizui.alert({
                title: 'Alert',
                content: 'Content',
                theme: 'red'
            });
        });
        $('#b5').click(function() {
            bizui.confirm({
                title: 'Confirm',
                content: 'Content',
                theme: 'green'
            });
        });
	},

    destroy: function() {
        $('button').bizButton('destroy').off();
        $('.dialog-content').bizDialog('destroy');
        this.$el.empty();
    }
});
