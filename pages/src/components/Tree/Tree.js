var Tree = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .tree').parent().addClass('active');

        var view = this;
        $.get('src/components/Tree/tree.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        var treeData = [
            {
                id: 100,
                text: 'Root 1',
                icon: false
            },
            {
                id: 200,
                text: 'Root 2',
                icon: false,
                children: [
                    {id: 210, text: 'Child 1', children: [
                        {
                            id: 211,
                            text: 'Child 1-1'
                        }
                    ]},
                    {id: 220, text: 'Child 2', state: {disabled: true}}
                ]
            },
            {
                id: 300,
                text: 'Root 3',
                icon: false,
                children: [
                    {id: 310, text: 'Child 3'}
                ]
            }
        ];
        $('.tree-container').on("loaded.jstree", function(e, data) {
            data.instance.open_all();
        }).bizTree({
            core: {
                data: treeData
            },
            plugins : ['checkbox']
        });
	},

    destroy: function() {
        $('.tree-container').bizTree('destroy');
        this.$el.empty();
    }
});
