BizUI - A jQuery plugin for business UI components
===============

[![Code Climate][codeclimate-image]][codeclimate-url]
[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]

Features
--------
- Include 14 types of UI components: Button, Input, Textarea, Radio, Checkbox, Select, Dialog, Panel, Tooltip, Tab, Page, Tree, Calendar, Table.
- IE9+, Firefox, Chrome, Safari and Opera supported.
- Import other awesome components with the constant API using Adapter Pattern.

<img src="http://bizdevfe.github.io/biz-ui/img/adapter.png" />

Usage
-----
Download the latest version: [https://github.com/bizdevfe/biz-ui/releases](https://github.com/bizdevfe/biz-ui/releases), or:

    npm install biz-ui

Together with jQuery, include BizUI in your page:

    <script src="jquery.js" type="text/javascript"></script>
    <script src="jquery.bizui.js" type="text/javascript"></script>

jQuery 2.x or later is recommended. Older versions might work as well, but they are not tested.

Include the CSS file:

    <link href="jquery.bizui.css" rel="stylesheet" type="text/css" />

You can also load BizUI as a AMD module:

    var bizui = require('jquery.bizui');

To initialize:

    // recommended
    $('button').bizButton();
    
    // or create instance by constructor
    var button = new bizui.Button($('button'));

Customize themes: Theme styles are extracted to [theme-custom.less](https://github.com/bizdevfe/biz-ui/blob/master/src/css/theme-custom.less), to customize themes of your own, just simply mofidy the following colors: @primary-color, @assistant-color and @text-color.

API documentation
-----------------
See [http://bizdevfe.github.io/biz-ui](http://bizdevfe.github.io/biz-ui).

Demos
-----
See [http://bizdevfe.github.io/biz-ui/quickview](http://bizdevfe.github.io/biz-ui/quickview).

<img src="http://bizdevfe.github.io/biz-ui/img/demo.png" />

Build
-----
Do the code inspection, optimization or API generation here:

    $ cd tool
    $ build.sh

License
-------
Licensed under the [MIT license](http://opensource.org/licenses/MIT).

Feedback
--------
For issues or suggestions please see [biz-ui](https://github.com/bizdevfe/biz-ui) on Github. Thanks for your support!

[codeclimate-image]: https://codeclimate.com/github/bizdevfe/biz-ui/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/bizdevfe/biz-ui
[travis-image]: https://travis-ci.org/bizdevfe/biz-ui.svg
[travis-url]: https://travis-ci.org/bizdevfe/biz-ui
[npm-image]: http://img.shields.io/npm/v/biz-ui.svg
[npm-url]: https://npmjs.org/package/biz-ui
[npm-stat-image]: https://nodei.co/npm/biz-ui.png?downloads=true
[npm-stat-url]: https://nodei.co/npm/biz-ui