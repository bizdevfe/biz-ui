/**
 * Tree
 */
var menuData = [
    {
        id: 100,
        text: 'Dashbord',
        icon: false
    },
    {
        id: 200,
        text: 'Consumption',
        icon: false,
        children: [
            {id: 210, text: 'PC'},
            {id: 220, text: 'Mobile'}
        ],
        state: {opened: true}
    },
    {
        id: 300,
        text: 'Report',
        icon: false,
        children: [
            {id: 310, text: 'Daily'},
            {id: 320, text: 'Weekly'},
            {id: 330, text: 'Monthly'}
        ]
    },
    {
        id: 400,
        text: 'Settings',
        icon: false,
        children: [
            {id: 410, text: 'Profile'},
            {id: 420, text: 'Security'}
        ]
    }
];
$('#menu').on("loaded.jstree", function(e, data) {
    data.instance.select_node(210);
}).bizTree({
    core: {data: menuData},
    plugins : ['wholerow']
});

/**
 * Tabs 
 */
$('#dimension').bizTab();

/**
 * Region Content 
 */
$('#region').bizSelect();
$('#range').bizCalendar({
    startDate: '2010-01-01',
    endDate: '2020-12-31'
});

/**
 * Client Content 
 */
$('#client').bizSelect();
$('#keyword').bizInput();
$('input[name="vip"]').bizCheckbox();
$('input[name="client"]').bizRadio();

/**
 * Button
 */
$('#add').bizButton().click(function() {
    $('#panel').bizPanel('open');
});

/**
 * Page 
 */
$('.page-size').bizSelect().change(function(e) {
    $('.page').bizPage('setPageSize', e.target.value);
});
$('.page').bizPage({
    pageSize: 10,
    pageNumber: 1,
    totalNumber: 200,
    onPageClick: function(pageNumber) {
        console.log(pageNumber);
    }
});
$('.page-number').bizInput({
    onEnter: go
});
$('.go').bizButton().click(go);
function go() {
    var value = parseInt($('.page-number').val(), 10),
        totalNumber = $('.page').bizPage('getTotalNumber');
    
    if (/^\d+$/.test(value) && value > 0 && value <= totalNumber) {
        $('.page').bizPage('setPageNumber', value);
        $('.page-number').val('');
    } else {
        $('.page-number').focus();
    }
}

/**
 * Panel & Dialog 
 */
$('#panel').bizPanel({
    buttons: [
        {
            text: 'Add',
            click: function() {
                var name = $.trim($('#name').val()),
                    panel = this;
                if (name === '') {
                    bizui.Dialog.alert({
                        title: 'Wanning',
                        content: 'Region name required!',
                        ok: 'OK'
                    });
                } else {
                    bizui.Dialog.confirm({
                        title: 'Confirmation',
                        content: 'Add new region?',
                        ok: 'Yes',
                        cancel: 'No',
                        onOK: function() {
                            panel.close();
                        }
                    });
                }
            }
        },
        {
            text: 'Canel',
            click: function() {
                this.close();
            },
            theme: 'dark'
        }
    ]
});
$('#name').bizInput();
$('#description').bizTextarea();
