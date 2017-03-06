var Textline = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .textline').parent().addClass('active');

        var view = this;
        $.get('src/components/Textline/textline.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
      		view.initBizUI();
      		hljs.initHighlighting.called = false;
      		hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $('.line1').bizTextline({
            val: 'a\nb\nc'
        });
        $('.line2').bizTextline({
            theme: 'blue-gray',
            width: 300,
            height: 150,
            maxLine: 3,
            valArray: ['d', 'e', 'f', 'g', 'h']
        });
	},

    destroy: function() {
        $('.textline').bizTextline('destroy');
        this.$el.empty();
    }
});
