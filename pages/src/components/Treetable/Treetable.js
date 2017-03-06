var Treetable = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .treetable').parent().addClass('active');

        var view = this;
        $.get('src/components/Treetable/treetable.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $(".dom-tree").bizTreeTable({
            initialState: 'expanded'
        });
        $('button').bizButton({
            theme: 'blue-gray'
        });
        $('#b1').click(function() {
            $(".dom-tree").bizTreeTable('collapseAll');
        });
        $('#b2').click(function() {
            $(".dom-tree").bizTreeTable('collapseNode', '1.1');
        });
        $('#b3').click(function() {
            $(".dom-tree").bizTreeTable('expandAll');
        });
        $('#b4').click(function() {
            $(".dom-tree").bizTreeTable('expandNode', '1.1');
        });
        $('#b5').click(function() {
            $(".dom-tree").bizTreeTable('reveal', '1.1');
        });
        $('#b6').click(function() {
            var parentNode = $(".dom-tree").bizTreeTable('node', '1.1');
            $(".dom-tree").bizTreeTable('loadBranch', parentNode, '<tr data-tt-id="1.1.2" data-tt-parent-id="1.1"><td>link</td><td>1.1.2</td></tr>');
        });
        $('#b7').click(function() {
            $(".dom-tree").bizTreeTable('move', '1.2.2', '1.2.1');
        });
        $('#b8').click(function() {
            $(".dom-tree").bizTreeTable('removeNode', '1.2.3');
        });
        $('#b9').click(function() {
            var parentNode = $(".dom-tree").bizTreeTable('node', '1.1');
            $(".dom-tree").bizTreeTable('unloadBranch', parentNode);
        });
        var sortAlphabeticallyDescending = function(a, b) {
            var valA = $.trim(a.row.find("td:eq(0)").text()).toUpperCase(),
                valB = $.trim(b.row.find("td:eq(0)").text()).toUpperCase();
            if (valA > valB) return -1;
            if (valA < valB) return 1;
            return 0;
        };
        $('#b10').click(function() {
            var parentNode = $(".dom-tree").bizTreeTable('node', '1.2');
            $(".dom-tree").bizTreeTable('sortBranch', parentNode, sortAlphabeticallyDescending);
        });
    },

    destroy: function() {
        $(".dom-tree").bizTreeTable('destroy');
        $('button').bizButton('destroy').off();
        this.$el.empty();
    }
});
