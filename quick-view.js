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

$('#menu').bizTree({
    core: {
        data: menuData
    },
    plugins : ['wholerow']
});

$('#dimension').bizTab();
$('#region').bizSelect();
$('.biz-range').bizCalendar({
    startDate: '2010-01-01',
    endDate: '2020-12-31'
});
$('#client').bizSelect();
$('#keyword').bizInput();


$('#add').bizButton();
$('#query').bizButton({
    theme: 'dark'
});

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

$('#panel').bizPanel({
    buttons: [
        {
            text: 'Create Account',
            click: function() {
                this.close();
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

$('#add').click(function() {
    $('#panel').bizPanel('open');
});
