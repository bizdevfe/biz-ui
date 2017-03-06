var Select = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .select').parent().addClass('active');

        var view = this;
        $.get('src/components/Select/select.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $('#fruit').bizSelect({
            inheritOriginalWidth: true
        }).on('change', function(e) {
            bizui.alert($(this).val());
        });
        $('button').bizButton({
            theme: 'blue-gray'
        });
        $('#b1').click(function() {
            $('#fruit').val('apples').bizSelect('refresh');
            // $('#fruit').prop('selectedIndex', 4).bizSelect('refresh');
        });
        $('#b2').click(function() {
            $('#fruit').val('bananas').bizSelect('refresh');
            // $('#fruit').prop('selectedIndex', 2).bizSelect('refresh');
        });
        $('#b3').click(function() {
            $('#fruit').val('cherries').bizSelect('refresh').trigger('change');
            // $('#fruit').prop('selectedIndex', 9).bizSelect('refresh');
        });
	},

    destroy: function() {
        $('#fruit').bizSelect('destroy').off();
        $('button').bizButton('destroy').off();
        this.$el.empty();
    }
});
