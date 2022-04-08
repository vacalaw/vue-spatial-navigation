'use strict';Object.defineProperty(exports,'__esModule',{value:true});var mitt=require('mitt');function _interopDefaultLegacy(e){return e&&typeof e==='object'&&'default'in e?e:{'default':e}}var mitt__default=/*#__PURE__*/_interopDefaultLegacy(mitt);function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}var focusHandler = new mitt__default['default']();
var registered = false;
var actions = [];
var KEY_CODE = {
  37: "LEFT",
  38: "UP",
  39: "RIGHT",
  40: "DOWN"
};
var enableNavigation = function enableNavigation(actionCB) {
  if (registered) {
    var index = actions.findIndex(function (item) {
      return item.id === actionCB.id;
    });

    if (index > -1) {
      actions[index] = actionCB;
    } else {
      actions.push(actionCB);
    }
  } else {
    registered = true;
    actions.push(actionCB);
    window.addEventListener("keydown", function (event) {
      actions.forEach(function (action) {
        if (!action.preCondition || action.preCondition()) return action[KEY_CODE[event.keyCode]] && action[KEY_CODE[event.keyCode]]();
      });
    });
  }
};
var disableNavigation = function disableNavigation(id) {
  var index = actions.findIndex(function (item) {
    return item.id === id;
  });

  if (index > -1) {
    actions.splice(index, 1);
  }
};//
var script = {
  name: "FocusableGrid",
  props: {
    onSettled: {
      type: Function,
      required: false
    },
    child: {
      type: Object,
      //Child component (eg: card, button)
      required: true
    },
    items: {
      //Array to be passed to child
      type: Array,
      required: true
    },
    isFocused: {
      //Condition to enable navigation
      type: Boolean,
      default: false
    },
    disabled: {
      //Condition to prevent navigation
      type: Boolean,
      default: false
    },
    shouldScroll: {
      type: Boolean,
      default: false
    },
    maxColumn: {
      type: Number,
      default: 6
    },
    id: {
      //unique id to differentiate navigation
      default: Math.random().toString()
    }
  },
  data: function data() {
    return {
      focusedIndex: 0,
      scrollAmount: 0,
      activeRow: 0,
      activeColumn: 0,
      width: 0
    };
  },
  computed: {
    columns: function columns() {
      return {
        width: "".concat(100 / this.maxColumn, "%"),
        height: "".concat(this.width / this.maxColumn / 16 * 9, "px")
      };
    },
    style: function style() {
      return {
        top: "".concat(this.scrollAmount, "px")
      };
    },
    filteredItems: function filteredItems() {
      var _this = this;

      return this.items.filter(function (item, index) {
        return _this.showItem(item, index);
      });
    }
  },
  methods: {
    showItem: function showItem(item, index) {
      if (index >= this.activeRow * this.maxColumn && index <= this.focusedIndex + this.maxColumn * this.maxColumn - this.activeColumn + this.maxColumn - 1) {
        return item;
      }

      return false;
    },
    getScrollAmount: function getScrollAmount(el, negative) {
      if (el) {
        var value = el.clientHeight;
        return negative ? -value : value;
      }

      return 0;
    },
    isPrevColumnPresent: function isPrevColumnPresent() {
      return this.focusedIndex > 0 && this.activeColumn > 0;
    },
    isNextColumnPresent: function isNextColumnPresent() {
      return this.focusedIndex < this.items.length - 1 && this.activeColumn < this.maxColumn - 1;
    },
    isPrevRowPresent: function isPrevRowPresent() {
      return this.focusedIndex > 0 && this.activeRow > 0;
    },
    isNextRowPresent: function isNextRowPresent() {
      return this.focusedIndex < this.items.length - 1 && this.activeRow < this.items.length / this.maxColumn - 1;
    },
    updateColumn: function updateColumn(reverse) {
      var value = reverse ? -1 : 1;
      this.focusedIndex += value;
      this.activeColumn += value;
    },
    updateRow: function updateRow(reverse) {
      var cardsPerColumn = reverse ? -this.maxColumn : this.maxColumn;
      var value = reverse ? -1 : 1;
      this.focusedIndex += cardsPerColumn;
      this.activeRow += value;

      if (this.isFocusIndexOutOfBound()) {
        //UNEVEN LAST ROW
        this.focusedIndex = this.items.length - 1;
        this.activeColumn = (this.items.length - 1) % this.maxColumn;
      }
    },
    isFocusIndexOutOfBound: function isFocusIndexOutOfBound() {
      return this.focusedIndex > this.items.length - 1;
    },
    updateScrollValue: function updateScrollValue(negative) {
      this.scrollAmount += this.getScrollAmount(this.$refs.childItem[this.focusedIndex], negative);
    },
    handleFocusLost: function handleFocusLost() {
      if (this.focusedIndex > this.items.length - 1) {
        this.focusedIndex = this.items.length - 1;
      }
    },
    resetFocus: function resetFocus(_ref) {
      var force = _ref.force;

      if (force || !this.isFocused) {
        this.focusedIndex = 0;
        this.activeColumn = 0;
        this.activeRow = 0;
        this.scrollAmount = 0;
      }
    },
    onSettledFunction: function onSettledFunction(arg) {
      if (this.onSettled) {
        this.onSettled(arg);
      }
    },
    onMainScrollWeel: function onMainScrollWeel(element) {
      element.preventDefault();

      if (!this.isKeyPress) {
        if (element.deltaY < 0 || element.deltaY > 0) {
          if (element.deltaY > 0 && this.isNextRowPresent()) {
            this.updateRow();
            this.updateScrollValue('negative');
          } else if (element.deltaY < 0 && this.isPrevRowPresent()) {
            this.updateRow('reverse');
            this.updateScrollValue();
          }
        }
      }
    }
  },
  updated: function updated() {
    this.handleFocusLost();
  },
  mounted: function mounted() {
    var _this2 = this;

    this.width = this.$el.clientWidth;
    this.$el.addEventListener("wheel", this.onMainScrollWeel);
    enableNavigation({
      LEFT: function LEFT() {
        if (_this2.isPrevColumnPresent()) {
          _this2.updateColumn("reverse");
        } else {
          _this2.onSettledFunction('LEFT');
        }
      },
      RIGHT: function RIGHT() {
        if (_this2.isNextColumnPresent()) {
          _this2.updateColumn();
        } else {
          _this2.onSettledFunction('RIGHT');
        }
      },
      UP: function UP() {
        if (_this2.isPrevRowPresent()) {
          _this2.updateRow("reverse");

          if (_this2.shouldScroll) _this2.updateScrollValue();
        } else {
          _this2.onSettledFunction('UP');
        }
      },
      DOWN: function DOWN() {
        if (_this2.isNextRowPresent()) {
          _this2.updateRow();

          if (_this2.shouldScroll) _this2.updateScrollValue("negative");
        } else {
          _this2.onSettledFunction('DOWN');
        }
      },
      preCondition: function preCondition() {
        return _this2.isFocused && !_this2.disabled;
      },
      id: "grid-".concat(this.id)
    });
    focusHandler.on("RESET_FOCUS", this.resetFocus);
  },
  destroyed: function destroyed() {
    this.$el.removeEventListener("wheel", this.onMainScrollWeel);
    disableNavigation("grid-".concat(this.id));
    focusHandler.off("RESET_FOCUS", this.resetFocus);
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}function createInjectorSSR(context) {
    if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
    }
    if (!context)
        return () => { };
    if (!('styles' in context)) {
        context._styles = context._styles || {};
        Object.defineProperty(context, 'styles', {
            enumerable: true,
            get: () => context._renderStyles(context._styles)
        });
        context._renderStyles = context._renderStyles || renderStyles;
    }
    return (id, style) => addStyle(id, style, context);
}
function addStyle(id, css, context) {
    const group =  css.media || 'default' ;
    const style = context._styles[group] || (context._styles[group] = { ids: [], css: '' });
    if (!style.ids.includes(id)) {
        style.media = css.media;
        style.ids.push(id);
        let code = css.source;
        style.css += code + '\n';
    }
}
function renderStyles(styles) {
    let css = '';
    for (const key in styles) {
        const style = styles[key];
        css +=
            '<style data-vue-ssr-id="' +
                Array.from(style.ids).join(' ') +
                '"' +
                (style.media ? ' media="' + style.media + '"' : '') +
                '>' +
                style.css +
                '</style>';
    }
    return css;
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "focusableGrid"
  }, [_c('transition-group', {
    ref: "grid",
    staticClass: "grid",
    class: {
      focus: _vm.isFocused
    },
    attrs: {
      "name": "list",
      "tag": "div"
    }
  }, _vm._l(_vm.filteredItems, function (item, index) {
    return _c('div', {
      key: item.id,
      ref: "childItem",
      refInFor: true,
      staticClass: "child",
      style: _vm.columns
    }, [_c(_vm.child, _vm._b({
      tag: "component",
      attrs: {
        "id": "child" + (item.id || index),
        "isFocused": _vm.isFocused && index === _vm.activeColumn
      }
    }, 'component', item, false))], 1);
  }), 0)], 1);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
  if (!inject) return;
  inject("data-v-14172eab_0", {
    source: ".focusableGrid[data-v-14172eab]{width:100%;height:100%}.grid[data-v-14172eab]{display:flex;height:100%;flex-wrap:wrap;align-content:flex-start;position:relative}.child[data-v-14172eab]{display:flex;align-items:stretch}.list-enter-active[data-v-14172eab],.list-leave-active[data-v-14172eab]{transition:all .15s ease}.list-enter[data-v-14172eab],.list-leave-to[data-v-14172eab]{height:0!important;z-index:10;border-color:transparent}.list-leave-to .focus[data-v-14172eab]{border-color:transparent}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__ = "data-v-14172eab";
/* module identifier */

var __vue_module_identifier__ = "data-v-14172eab";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, createInjectorSSR, undefined);var script$1 = {
  name: "focusableList",
  props: {
    hideItems: {
      type: Boolean,
      default: false
    },
    nested: {
      type: Boolean,
      default: false
    },
    onSettled: {
      type: Function,
      required: false
    },
    onChildChange: {
      type: Function,
      required: false
    },
    child: {
      type: Object,
      //Child component (eg: card, button)
      required: true
    },
    title: {
      type: String,
      require: false
    },
    items: {
      //Array to be passed to child
      type: Array,
      required: true
    },
    isFocused: {
      //Condition to enable navigation
      type: Boolean,
      default: false
    },
    defaultIndex: {
      type: Number,
      default: -1
    },
    disabled: {
      //Condition to prevent navigation
      type: Boolean,
      default: false
    },
    disabledIndex: {
      type: Array,
      default: function _default() {
        return [-1];
      }
    },
    orientation: {
      type: String,
      //Direction of list
      default: "HORIZONTAL" //'VERTICAL'

    },
    shouldScroll: {
      type: Boolean,
      default: false
    },
    displayItems: {
      type: Number,
      default: 4
    },
    id: {
      //unique id to differentiate navigation
      default: Math.random().toString()
    }
  },
  data: function data() {
    return {
      focusedIndex: -1,
      scrollAmount: 0,
      ready: false
    };
  },
  computed: {
    style: function style() {
      return this.hideItems ? "" : (this.orientation === "VERTICAL" ? "top" : "left") + ": ".concat(this.scrollAmount, "px;");
    },
    filterList: function filterList() {
      var _this = this;

      return this.items.filter(function (item, index) {
        return _this.showItem(item, index);
      });
    }
  },
  methods: {
    showItem: function showItem(item, index) {
      if (this.hideItems && this.nested) {
        return index >= this.focusedIndex && index < +this.displayItems + this.focusedIndex;
      }

      return true;
    },
    isEnabledIndex: function isEnabledIndex(index) {
      return !this.disabledIndex.includes(index);
    },
    setInitialvalue: function setInitialvalue() {
      if (this.defaultIndex > -1 && this.defaultIndex < this.items.length && this.isEnabledIndex(this.defaultIndex)) {
        this.focusedIndex = this.defaultIndex;
      } else {
        this.focusedIndex = this.getValidNextIndex();
      }

      if (this.focusedIndex >= -1) this.updateScrollValue();
    },
    getKeysByOrientation: function getKeysByOrientation(orientation) {
      return {
        REVERSE: orientation === "VERTICAL" ? "UP" : "LEFT",
        FORWARD: orientation === "VERTICAL" ? "DOWN" : "RIGHT"
      };
    },
    getScrollAmountByOrientation: function getScrollAmountByOrientation(el, orientation) {
      if (el) {
        return -el[orientation === "VERTICAL" ? "clientHeight" : "clientWidth"];
      }

      return 0;
    },
    handleFocusLost: function handleFocusLost() {
      if (this.focusedIndex > this.items.length - 1 || this.disabledIndex.includes(this.focusedIndex)) {
        if (this.getValidPrevIndex() !== this.focusedIndex) {
          this.$emit("onFocusLost", {
            prevIndex: this.focusedIndex,
            newIndex: this.getValidPrevIndex()
          });
          this.focusedIndex = this.getValidPrevIndex();
        } else if (this.getValidNextIndex() !== this.focusedIndex) {
          this.$emit("onFocusLost", {
            prevIndex: this.focusedIndex,
            newIndex: this.getValidNextIndex()
          });
          this.focusedIndex = this.getValidNextIndex();
        } else {
          this.focusedIndex = -1;
          this.$emit("onFocusLost", {
            err: "No items to set focus, either disable it or provide new item to setFocus"
          });
        }
      }
    },
    isPrevItemPresent: function isPrevItemPresent() {
      return this.focusedIndex > 0;
    },
    isNextItemPresent: function isNextItemPresent() {
      return this.focusedIndex < this.items.length - 1;
    },
    getValidNextIndex: function getValidNextIndex() {
      var i = this.focusedIndex + 1;
      var validIndex = this.focusedIndex;

      while (i < this.items.length) {
        if (this.isEnabledIndex(i)) {
          validIndex = i;
          this.$emit("onFocusChange", {
            prevIndex: this.focusedIndex,
            newIndex: validIndex,
            item: this.items[validIndex]
          });
          this.onChildChangeFunction(this.focusedIndex, validIndex, this.items[validIndex]);
          break;
        }

        i++;
      }

      return validIndex;
    },
    getValidPrevIndex: function getValidPrevIndex() {
      var i = this.focusedIndex - 1;
      var validIndex = this.focusedIndex;

      while (i >= 0) {
        if (this.isEnabledIndex(i) && i < this.items.length) {
          validIndex = i;
          this.$emit("onFocusChange", {
            prevIndex: this.focusedIndex,
            newIndex: validIndex,
            item: this.items[validIndex]
          });
          this.onChildChangeFunction(this.focusedIndex, validIndex, this.items[validIndex]);
          break;
        }

        i--;
      }

      return validIndex;
    },
    updateFocus: function updateFocus(reverse) {
      if (reverse) {
        this.focusedIndex = this.getValidPrevIndex();
      } else {
        this.focusedIndex = this.getValidNextIndex();
      }
    },
    onChildChangeFunction: function onChildChangeFunction(prevIndex, newIndex, item) {
      if (this.ready && this.onChildChange) {
        this.onChildChange({
          prevIndex: prevIndex,
          newIndex: newIndex,
          item: item
        });
      }
    },
    updateScrollValue: function updateScrollValue() {
      if (this.shouldScroll && this.$refs.childItem) {
        this.scrollAmount = this.getScrollAmountByOrientation(this.$refs.childItem[0], this.orientation) * this.focusedIndex;
      }
    },
    resetFocus: function resetFocus(_ref) {
      var force = _ref.force;

      if (force || !this.isFocused) {
        this.focusedIndex = 0;
        this.scrollAmount = 0;
      }
    },
    setExternalFocus: function setExternalFocus() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          index = _ref2.index,
          id = _ref2.id;

      if (id === this.id) {
        if (this.isEnabledIndex(index) && index >= 0 && index < this.items.length - 1) {
          this.focusedIndex = index;
          this.updateScrollValue();
        } else {
          console.error("focus to the given index ".concat(index, " is not possible"));
        }
      }
    },
    onSettledFunction: function onSettledFunction(arg) {
      if (this.ready && this.onSettled) {
        this.onSettled(arg);
      }
    }
  },
  updated: function updated() {
    this.handleFocusLost();
  },
  mounted: function mounted() {
    var _this2 = this,
        _enableNavigation;

    this.setInitialvalue();
    var KEYS = this.getKeysByOrientation(this.orientation);
    var KEYSLR = this.getKeysByOrientation(!this.orientation);
    enableNavigation((_enableNavigation = {
      id: "list-".concat(this.id)
    }, _defineProperty(_enableNavigation, KEYSLR.REVERSE, function () {
      if (_this2.orientation == "VERTICAL" && !_this2.nested) {
        _this2.onSettledFunction(KEYSLR.REVERSE);
      }
    }), _defineProperty(_enableNavigation, KEYSLR.FORWARD, function () {
      if (_this2.orientation == "VERTICAL" && !_this2.nested) {
        _this2.onSettledFunction(KEYSLR.FORWARD);
      }
    }), _defineProperty(_enableNavigation, KEYS.REVERSE, function () {
      if (_this2.isPrevItemPresent()) {
        _this2.updateFocus("reverse");

        _this2.updateScrollValue();
      } else {
        _this2.onSettledFunction(KEYS.REVERSE);
      }
    }), _defineProperty(_enableNavigation, KEYS.FORWARD, function () {
      if (_this2.isNextItemPresent()) {
        _this2.updateFocus();

        _this2.updateScrollValue();
      } else {
        _this2.onSettledFunction(KEYS.FORWARD);
      }
    }), _defineProperty(_enableNavigation, "preCondition", function preCondition() {
      return _this2.isFocused && !_this2.disabled;
    }), _enableNavigation));
    focusHandler.on("RESET_FOCUS", this.resetFocus);
    focusHandler.on("SET_FOCUS", this.setExternalFocus);
    this.ready = true;
  },
  destroyed: function destroyed() {
    disableNavigation("list-".concat(this.id));
    focusHandler.off("RESET_FOCUS", this.resetFocus);
    focusHandler.off("SET_FOCUS", this.setExternalFocus);
  }
};/* script */
var __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "focusableList"
  }, [_vm._ssrNode((_vm.title ? "<h3 data-v-19c3b7e0>" + _vm._ssrEscape(_vm._s(_vm.title)) + "</h3>" : "<!---->") + " "), _c('transition-group', {
    ref: "list",
    staticClass: "list",
    class: [{
      vertical: _vm.orientation === 'VERTICAL'
    }],
    style: _vm.style,
    attrs: {
      "name": _vm.orientation === 'VERTICAL' ? 'slide-vertical' : 'slide-horizontal'
    }
  }, _vm._l(_vm.filterList, function (item, index) {
    return _c('div', {
      key: "child-" + (item.id || index),
      ref: "childItem",
      refInFor: true,
      staticClass: "child",
      class: [{
        focus: _vm.isFocused && (_vm.hideItems && _vm.nested ? index === 0 : index === _vm.focusedIndex)
      }, {
        ready: _vm.ready
      }]
    }, [_c(_vm.child, _vm._b({
      key: "nested-" + item.id,
      tag: "component",
      class: {
        disabled: _vm.disabledIndex.includes(index)
      },
      attrs: {
        "id": "child-" + item.id,
        "isFocused": _vm.isFocused && (_vm.hideItems && _vm.nested ? index === 0 : index === _vm.focusedIndex),
        "disabled": item.disabled || _vm.disabledIndex.includes(index)
      }
    }, 'component', item, false))], 1);
  }), 0)], 2);
};

var __vue_staticRenderFns__$1 = [];
/* style */

var __vue_inject_styles__$1 = function __vue_inject_styles__(inject) {
  if (!inject) return;
  inject("data-v-19c3b7e0_0", {
    source: ".focusableList[data-v-19c3b7e0]{height:100%;width:100%}h3[data-v-19c3b7e0]{color:#fff;text-align:left;margin:32px 0 16px;font-size:1.6vmax}.list[data-v-19c3b7e0]{display:flex;position:relative}.child[data-v-19c3b7e0]{display:flex}.show[data-v-19c3b7e0]{opacity:1;visibility:visible}.vertical[data-v-19c3b7e0]{flex-direction:column}.disabled[data-v-19c3b7e0]{background:grey}.slide-vertical-enter[data-v-19c3b7e0],.slide-vertical-leave-to[data-v-19c3b7e0]{margin-bottom:-277px;transform:translateY(-100%);opacity:0}.slide-horizontal-enter-active[data-v-19c3b7e0],.slide-horizontal-leave-active[data-v-19c3b7e0]{position:relative;z-index:-1}.slide-horizontal-enter[data-v-19c3b7e0],.slide-horizontal-leave-to[data-v-19c3b7e0]{margin-right:-16vw;transform:translateX(-150%)}.ready[data-v-19c3b7e0]{transition:all .15s ease}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__$1 = "data-v-19c3b7e0";
/* module identifier */

var __vue_module_identifier__$1 = "data-v-19c3b7e0";
/* functional template */

var __vue_is_functional_template__$1 = false;
/* style inject shadow dom */

var __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, createInjectorSSR, undefined);var components=/*#__PURE__*/Object.freeze({__proto__:null,FocusableList: __vue_component__$1,FocusableGrid: __vue_component__});var install = function installVueSpatialNavigation(Vue) {
  if (install.installed) return;
  install.installed = true;
  Object.entries(components).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        componentName = _ref2[0],
        component = _ref2[1];

    console.error('componentName', componentName);
    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()


var plugin = {
  install: install
}; // To auto-install on non-es builds, when vue is found
// eslint-disable-next-line no-redeclare

/* global window, global */

{
  var GlobalVue = null;

  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }

  if (GlobalVue) {
    GlobalVue.use(plugin);
  }
} // Default export is library as a whole, registered via Vue.use()
exports.FocusableGrid=__vue_component__;exports.FocusableList=__vue_component__$1;exports.default=plugin;