import mitt from 'mitt';

const focusHandler = new mitt();
let registered = false;
let actions = [];
const KEY_CODE = {
  37: "LEFT",
  38: "UP",
  39: "RIGHT",
  40: "DOWN"
};
const enableNavigation = actionCB => {
  if (registered) {
    const index = actions.findIndex(item => item.id === actionCB.id);

    if (index > -1) {
      actions[index] = actionCB;
    } else {
      actions.push(actionCB);
    }
  } else {
    registered = true;
    actions.push(actionCB);
    window.addEventListener("keydown", event => {
      actions.forEach(action => {
        if (!action.preCondition || action.preCondition()) return action[KEY_CODE[event.keyCode]] && action[KEY_CODE[event.keyCode]]();
      });
    });
  }
};
const disableNavigation = id => {
  const index = actions.findIndex(item => item.id === id);

  if (index > -1) {
    actions.splice(index, 1);
  }
};

//
var script = {
  name: "FocusableGrid",
  props: {
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

  data() {
    return {
      focusedIndex: 0,
      scrollAmount: 0,
      activeRow: 0,
      activeColumn: 0
    };
  },

  computed: {
    columns() {
      return {
        width: `${100 / this.maxColumn}%`
      };
    },

    style() {
      return {
        top: `${this.scrollAmount}px`
      };
    }

  },
  methods: {
    getScrollAmount: (el, negative) => {
      if (el) {
        let value = el.clientHeight;
        return negative ? -value : value;
      }

      return 0;
    },

    isPrevColumnPresent() {
      return this.focusedIndex > 0 && this.activeColumn > 0;
    },

    isNextColumnPresent() {
      return this.focusedIndex < this.items.length - 1 && this.activeColumn < this.maxColumn - 1;
    },

    isPrevRowPresent() {
      return this.focusedIndex > 0 && this.activeRow > 0;
    },

    isNextRowPresent() {
      return this.focusedIndex < this.items.length - 1 && this.activeRow < this.items.length / this.maxColumn - 1;
    },

    updateColumn(reverse) {
      let value = reverse ? -1 : 1;
      this.focusedIndex += value;
      this.activeColumn += value;
    },

    updateRow(reverse) {
      let cardsPerColumn = reverse ? -this.maxColumn : this.maxColumn;
      let value = reverse ? -1 : 1;
      this.focusedIndex += cardsPerColumn;
      this.activeRow += value;

      if (this.isFocusIndexOutOfBound()) {
        //UNEVEN LAST ROW
        this.focusedIndex = this.items.length - 1;
        this.activeColumn = (this.items.length - 1) % this.maxColumn;
      }
    },

    isFocusIndexOutOfBound() {
      return this.focusedIndex > this.items.length - 1;
    },

    updateScrollValue(negative) {
      this.scrollAmount += this.getScrollAmount(this.$refs.childItem[this.focusedIndex], negative); // hide Elements in the dom

      setTimeout(() => {
        this.$refs.childItem.forEach(el => {
          if (!this.elementInViewport(el)) {
            el.classList.add('hide');
          } else {
            el.classList.remove('hide');
          }
        });
      }, 150);
    },

    handleFocusLost() {
      if (this.focusedIndex > this.items.length - 1) {
        this.focusedIndex = this.items.length - 1;
      }
    },

    resetFocus({
      force
    }) {
      if (force || !this.isFocused) {
        this.focusedIndex = 0;
        this.activeColumn = 0;
        this.activeRow = 0;
        this.scrollAmount = 0;
      }
    },

    elementInViewport(el) {
      var width = el.offsetWidth;
      var height = el.offsetHeight;
      var top = el.offsetTop;
      var left = el.offsetLeft;

      while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
      }

      return top + height / 2 >= window.pageYOffset && left >= window.pageXOffset && top + height / 2 <= window.pageYOffset + window.innerHeight && left + width <= window.pageXOffset + window.innerWidth;
    }

  },

  updated() {
    this.handleFocusLost();
  },

  mounted() {
    enableNavigation({
      LEFT: () => {
        if (this.isPrevColumnPresent()) {
          this.updateColumn("reverse");
        }
      },
      RIGHT: () => {
        if (this.isNextColumnPresent()) {
          this.updateColumn();
        }
      },
      UP: () => {
        if (this.isPrevRowPresent()) {
          this.updateRow("reverse");
          if (this.shouldScroll) this.updateScrollValue();
        }
      },
      DOWN: () => {
        if (this.isNextRowPresent()) {
          this.updateRow();
          if (this.shouldScroll) this.updateScrollValue("negative");
        }
      },
      preCondition: () => this.isFocused && !this.disabled,
      id: `grid-${this.id}`
    });
    focusHandler.on("RESET_FOCUS", this.resetFocus); // hide Elements in the dom

    this.$refs.childItem.forEach(el => {
      if (!this.elementInViewport(el)) {
        el.classList.add('hide');
      } else {
        el.classList.remove('hide');
      }
    });
  },

  destroyed() {
    disableNavigation(`grid-${this.id}`);
    focusHandler.off("RESET_FOCUS", this.resetFocus);
  }

};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    ref: "grid",
    staticClass: "grid",
    class: {
      focus: _vm.isFocused
    },
    style: _vm.style
  }, _vm._l(_vm.items, function (item, index) {
    return _c('div', {
      key: index,
      ref: "childItem",
      refInFor: true,
      staticClass: "child",
      style: _vm.columns
    }, [_c(_vm.child, _vm._b({
      tag: "component",
      attrs: {
        "id": "child" + (item.id || index),
        "isFocused": _vm.isFocused && index === _vm.focusedIndex
      }
    }, 'component', item, false))], 1);
  }), 0);
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = function (inject) {
  if (!inject) return;
  inject("data-v-c83184de_0", {
    source: ".grid[data-v-c83184de]{display:flex;flex-wrap:wrap;position:relative;transition:top .15s ease}.child[data-v-c83184de]{display:flex;transition:opacity .2s ease}.vertical[data-v-c83184de]{flex-direction:column}.hide[data-v-c83184de]{opacity:0}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__ = "data-v-c83184de";
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, createInjector, undefined, undefined);

//
var script$1 = {
  name: "focusableList",
  props: {
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
      default: () => [-1]
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
    id: {
      //unique id to differentiate navigation
      default: Math.random().toString()
    }
  },

  data() {
    return {
      focusedIndex: -1,
      scrollAmount: 0,
      ready: false
    };
  },

  computed: {
    style() {
      return (this.orientation === "VERTICAL" ? "top" : "left") + `: ${this.scrollAmount}px`;
    }

  },
  methods: {
    isEnabledIndex(index) {
      return !this.disabledIndex.includes(index);
    },

    setInitialvalue() {
      if (this.defaultIndex > -1 && this.defaultIndex < this.items.length && this.isEnabledIndex(this.defaultIndex)) {
        this.focusedIndex = this.defaultIndex;
      } else {
        this.focusedIndex = this.getValidNextIndex();
      }

      if (this.focusedIndex >= -1) this.updateScrollValue();
    },

    getKeysByOrientation: orientation => ({
      REVERSE: orientation === "VERTICAL" ? "UP" : "LEFT",
      FORWARD: orientation === "VERTICAL" ? "DOWN" : "RIGHT"
    }),
    getScrollAmountByOrientation: (el, orientation) => {
      if (el) {
        return -el[orientation === "VERTICAL" ? "clientHeight" : "clientWidth"];
      }

      return 0;
    },

    handleFocusLost() {
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

    isPrevItemPresent() {
      return this.focusedIndex > 0;
    },

    isNextItemPresent() {
      return this.focusedIndex < this.items.length - 1;
    },

    getValidNextIndex() {
      let i = this.focusedIndex + 1;
      let validIndex = this.focusedIndex;

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

    getValidPrevIndex() {
      let i = this.focusedIndex - 1;
      let validIndex = this.focusedIndex;

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

    updateFocus(reverse) {
      if (reverse) {
        this.focusedIndex = this.getValidPrevIndex();
      } else {
        this.focusedIndex = this.getValidNextIndex();
      }
    },

    onChildChangeFunction(prevIndex, newIndex, item) {
      if (this.ready && this.onChildChange) {
        this.onChildChange({
          prevIndex: prevIndex,
          newIndex: newIndex,
          item: item
        });
      }
    },

    updateScrollValue() {
      if (this.shouldScroll && this.$refs.childItem) {
        this.scrollAmount = this.getScrollAmountByOrientation(this.$refs.childItem[0], this.orientation) * this.focusedIndex;
      } // hide Elements in the dom


      setTimeout(() => {
        this.$refs.childItem.forEach(el => {
          if (!this.elementInViewport(el)) {
            el.classList.add('hide');
          } else {
            el.classList.remove('hide');
            const childs = el.children[0].querySelectorAll('.child');

            if (childs.length > 0) {
              childs.forEach(el => {
                if (this.elementInViewport(el)) {
                  el.classList.remove('hide');
                }
              });
            }
          }
        });
      }, 150);
    },

    resetFocus({
      force
    }) {
      if (force || !this.isFocused) {
        this.focusedIndex = 0;
        this.scrollAmount = 0;
      }
    },

    setExternalFocus({
      index,
      id
    } = {}) {
      if (id === this.id) {
        if (this.isEnabledIndex(index) && index >= 0 && index < this.items.length - 1) {
          this.focusedIndex = index;
          this.updateScrollValue();
        } else {
          console.error(`focus to the given index ${index} is not possible`);
        }
      }
    },

    elementInViewport(el) {
      var width = el.offsetWidth;
      var height = el.offsetHeight;
      var top = el.offsetTop;
      var left = el.offsetLeft;

      while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
      }

      return top + height >= window.pageYOffset && left >= window.pageXOffset && top + height / 3 <= window.pageYOffset + window.innerHeight && left + width / 2 <= window.pageXOffset + window.innerWidth;
    }

  },

  updated() {
    this.handleFocusLost();
  },

  mounted() {
    this.setInitialvalue();
    let KEYS = this.getKeysByOrientation(this.orientation);
    enableNavigation({
      id: `list-${this.id}`,
      [KEYS.REVERSE]: () => {
        if (this.isPrevItemPresent()) {
          this.updateFocus("reverse");
          this.updateScrollValue();
        }
      },
      [KEYS.FORWARD]: () => {
        if (this.isNextItemPresent()) {
          this.updateFocus();
          this.updateScrollValue();
        }
      },
      preCondition: () => this.isFocused && !this.disabled
    });
    focusHandler.on("RESET_FOCUS", this.resetFocus);
    focusHandler.on("SET_FOCUS", this.setExternalFocus);
    this.ready = true;
  },

  destroyed() {
    disableNavigation(`list-${this.id}`);
    focusHandler.off("RESET_FOCUS", this.resetFocus);
    focusHandler.off("SET_FOCUS", this.setExternalFocus);
  }

};

/* script */
const __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', [_vm.title ? _c('h3', [_vm._v(_vm._s(_vm.title))]) : _vm._e(), _vm._v(" "), _c('div', {
    ref: "list",
    staticClass: "list",
    class: {
      focus: _vm.isFocused,
      vertical: _vm.orientation === 'VERTICAL'
    },
    style: _vm.style
  }, _vm._l(_vm.items, function (item, index) {
    return _c('div', {
      key: index,
      ref: "childItem",
      refInFor: true,
      staticClass: "child"
    }, [_c(_vm.child, _vm._b({
      tag: "component",
      class: {
        disabled: _vm.disabledIndex.includes(index)
      },
      attrs: {
        "id": "child" + (item.id || index),
        "isFocused": _vm.isFocused && index === _vm.focusedIndex,
        "disabled": item.disabled || _vm.disabledIndex.includes(index)
      }
    }, 'component', item, false))], 1);
  }), 0)]);
};

var __vue_staticRenderFns__$1 = [];
/* style */

const __vue_inject_styles__$1 = function (inject) {
  if (!inject) return;
  inject("data-v-090100b2_0", {
    source: "h3[data-v-090100b2]{color:#fff;text-align:left;margin:32px 0 16px;font-size:1.6vmax}.list[data-v-090100b2]{display:flex;transition:all .15s ease;position:relative}.child[data-v-090100b2]{display:flex;transition:opacity .2s ease}.hide[data-v-090100b2]{opacity:0}.vertical[data-v-090100b2]{flex-direction:column}.disabled[data-v-090100b2]{background:grey}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__$1 = "data-v-090100b2";
/* module identifier */

const __vue_module_identifier__$1 = undefined;
/* functional template */

const __vue_is_functional_template__$1 = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, createInjector, undefined, undefined);

var components = /*#__PURE__*/Object.freeze({
  __proto__: null,
  FocusableList: __vue_component__$1,
  Grid: __vue_component__
});

// Import vue components

const install = function installVueSpatialNavigation(Vue) {
  if (install.installed) return;
  install.installed = true;
  Object.entries(components).forEach(([componentName, component]) => {
    console.error('componentName', componentName);
    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()


const plugin = {
  install
}; // To auto-install on non-es builds, when vue is found

export default plugin;
export { __vue_component__$1 as FocusableList, __vue_component__ as Grid };
