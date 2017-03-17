## 1.4.1 (March 17, 2017)

* Make Select inline-block.
* Convert images to base64 before building.

## 1.4.0 (March 8, 2017)

* Redesign homepage.
* Rewrite CSS using Less.
* Rewrap modules with CommonJS specification.
* Build with Gulp.
* Remove image dependencies by iconfont or base64.
* JSDoc3 style documentations.
* 19 new themes: blue(default), light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, brown, blue-gray, gray, deep-orange, red, pink, purple, deep-purple, indigo.

#### Components updates
* bizui (namespace)
  1. Exposed to global environment.
  2. New properties: `codepoints`, `theme`.
  3. Deprecated methods: `noConflict` and component constructors(except Tooltip).
  4. Deprecated property: `version`.
* Button
  1. New options: `customClass`, `icon`, `size`.
  2. Deprecated option: `label`(use `text`).
  3. Deprecated theme value of option: `dark`(use `gray`).
* Calendar
  1. Lots of new options and methods.
  2. Deprecated methods: `enable`, `disable`.
  3. Decoupling Input components, initialize and style them by yourself.
* Checkbox, Radio
  1. New option: `theme`.
  2. Deprecated method: `get`(use jQuery selector).
* Dialog
  1. New options: `customClass`, `draggable`, `position`, `theme`.
  2. New methods: `title`, `updateButtons`.
  3. Deprecated methods: `bizui.Dialog.alert`(use `bizui.alert`), `bizui.Dialog.confirm`(use `bizui.confirm`).
  4. Deprecated options: `skin`(use `theme` or `customClass`), `useMousewheel`.
  5. Use `data-title` attribute to retrieve title instead of `title`.
* DropDown
  1. New option: `customClass`.
  2. Deprecated options: `skin`(use `customClass`), `delay`, `event`.
  3. Rename plugin: `bizDropDown`.
* Input
  1. New options: `customClass`, `theme`.
  2. New event: `enter`.
  3. Support the `placeholder` attribute for older IE.
  3. Deprecated option: `onEnter`(bind `enter` event).
* Page
  1. New options: `customClass`, `theme`.
  2. New methods: `disable`, `enable`, `getPageSize`, `nextPage`, `prevPage`.
  3. Provide second boolean param for `setTotalNumber` to control redrawing.
  4. New event: `change`.
  5. Deprecated option: `onPageClick`(bind `change` event).
* Panel
  1. New options: `customClass`, `destroyOnClose`, `speed`, `theme`, `title`, `onBeforeClose`, `zIndex`.
  2. New methods: `title`, `updateButtons`.
  3. Use `data-title` attribute to retrieve title instead of `title`.
* Select
  1. New options: `theme`, `inheritOriginalWidth`.
  2. New methods: `open`, `close`.
  2. Deprecated option: `loop`.
  3. Deprecated methods: `enable`, `disable`, `val`(use jQuery val() to get or set, call refresh() after setting).
* Tab
  1. New options: `action`, `customClass`, `selectedIndex`, `theme`.
  2. New method: `index`.
  3. New event: `change`.
  3. Deprecated options: `event`(use `action`), `onChange`(bind `change` event), `skin`(use `theme` or `customClass`).
  4. Deprecated method: `select`(use `index`).
* Table
  1. New options: `customClass`, `defaultSort`, `onFailEdit`.
  2. Provide third boolean param for `setSelected` to tigger onSelect.
  3. Deprecated option: `skin`(use `customClass`), `resizable`(huge code and low usage ratio).
* Textarea
  1. New options: `customClass`, `theme`.
  2. Support the `placeholder` attribute for older IE.
* Textline
  1. New options: `customClass`, `maxLine`, `theme`, `valArray`.
  2. New method: `valArray`.
  3. Deprecated option: `skin`(use `theme` or `customClass`).
  4. Deprecated method: `lines`(use `valArray` to get data, use `maxLine` to limit max line number).
* Tooltip
  1. Use `data-tooltip` attribute to mark target elements instead of `title`.
  2. New options: `action`, `element`, `theme`, `preventDefault`, `removeAll`, `removeSpecific`.
  4. Deprecated param: `destroy`(use option `{removeAll: true}`).
  3. Deprecated options: `color`(use `theme`), `direction`(use `data-tooltip-direction` attribute), `margin`, `el`(use `element`).
* Tree
  1. Lots of new options and methods.
  2. Deprecated methods: `ins`.
* TreeTable
  1. New options: `column`, `customClass`, `initialState`, `clickableNodeNames`.
  2. New methods: `loadBranch`, `move`, `node`, `removeNode`, `sortBranch`, `unloadBranch`.
  3. Deprecated options: `expanded`(use `initialState`), `resizable`, `onLoad`, `onSelect`, `onCancelSelect`.
  4. Deprecated method: `selectNode`.

For more detailed APIs, run `gulp doc` and see `docs/`.
