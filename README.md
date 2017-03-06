BizUI - A jQuery plugin for business UI components
===============

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

[![NPM Stat][npm-stat-image]][npm-stat-url]

[npm-image]: http://img.shields.io/npm/v/biz-ui.svg
[npm-url]: https://npmjs.org/package/biz-ui

[travis-image]: https://travis-ci.org/bizdevfe/biz-ui.svg
[travis-url]: https://travis-ci.org/bizdevfe/biz-ui

[npm-stat-image]: https://nodei.co/npm/biz-ui.png?downloads=true
[npm-stat-url]: https://nodei.co/npm/biz-ui

Dependence
--------
jQuery 1.11.0+

Usage
--------
Install the latest version of BizUI via npm or bower, adding it to your dependencies:

	npm install biz-ui --save
	bower install biz-ui --save

It's recommended to bundle BizUI into a vendor chunk in your project, webpack configration for example:

    entry: {
        // stuff
        vendor: ['jquery', 'biz-ui']
    }

If you're not using a build system, just include the css file and the js file together width jQuery in your page:

    <link rel="stylesheet" type="text/css" href="jquery.bizui.css">
    <script src="jquery.js"></script>
    <script src="jquery.bizui.js"></script>

Use it in any module or global environment as jQuery plugins:

    $('button').bizButton();
	$('input').bizCalendar();

Themes
--------
BizUI provides 19 themes, set the `theme` field in each component:

    $('button').bizButton({
	    theme: 'light-blue'
    });

or set `bizui.theme` all at once:

    bizui.theme = 'light-blue';

Iconfonts
--------
Use iconfonts just like [Google Material Design Icons](https://material.io/icons/) in BizUI, for example:

    <i class="biz-icon">3d_rotation</i>

Demos
--------
[http://bizdevfe.github.io/biz-ui/](http://bizdevfe.github.io/biz-ui/pages/components.html)

Browser support
--------
IE9+, Firefox, Chrome and Safari.

Build
--------
    $ npm install
    $ gulp build

Get documentations
--------
    $ gulp doc
