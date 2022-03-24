<template>
  <div class="focusableGrid">
    <div
      class="grid"
      v-bind:class="{ focus: isFocused }"
      ref="grid"
      v-bind:style="style"
    >
      <div
        class="child"
        v-bind:style="columns"
        ref="childItem"
        v-for="(item, index) in items"
        :key="index"
      >
        <component
          :is="child"
          v-bind="item"
          :id="`child${item.id || index}`"
          :isFocused="isFocused && index === focusedIndex"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { enableNavigation, disableNavigation, focusHandler } from "@/event-bus";
export default {
  name: "FocusableGrid",
  props: {
		onSettled: {
			type: Function,
			required: false,
		},
    child: {
      type: Object, //Child component (eg: card, button)
      required: true,
    },
    items: {
      //Array to be passed to child
      type: Array,
      required: true,
    },
    isFocused: {
      //Condition to enable navigation
      type: Boolean,
      default: false,
    },
    disabled: {
      //Condition to prevent navigation
      type: Boolean,
      default: false,
    },
    shouldScroll: {
      type: Boolean,
      default: false,
    },
    maxColumn: {
      type: Number,
      default: 6,
    },
    id: {
      //unique id to differentiate navigation
      default: Math.random().toString(),
    },
  },
  data() {
    return {
      focusedIndex: 0,
      scrollAmount: 0,
      activeRow: 0,
      activeColumn: 0,
    };
  },
  computed: {
    columns(){
      return {width: `${100 / this.maxColumn}%`}
    },
    style() {
      return {
        top: `${this.scrollAmount}px`,
      };
    },
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
      return (
        this.focusedIndex < this.items.length - 1 &&
        this.activeColumn < this.maxColumn - 1
      );
    },
    isPrevRowPresent() {
      return this.focusedIndex > 0 && this.activeRow > 0;
    },
    isNextRowPresent() {
      return (
        this.focusedIndex < this.items.length - 1 &&
        this.activeRow < this.items.length / this.maxColumn - 1
      );
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
      this.scrollAmount += this.getScrollAmount(
        this.$refs.childItem[this.focusedIndex],
        negative
      );
    },
    handleFocusLost() {
      if (this.focusedIndex > this.items.length - 1) {
        this.focusedIndex = this.items.length - 1;
      }
    },
    resetFocus({ force }) {
      if (force || !this.isFocused) {
        this.focusedIndex = 0;
        this.activeColumn = 0;
        this.activeRow = 0;
        this.scrollAmount = 0;
      }
    },
    elementInViewport(el) {
      var container = this.$el;
			var parentRect = container.getBoundingClientRect();
			var childRect = el.getBoundingClientRect();
      
      // var hcheck = childRect.left + childRect.width >= parentRect.left && childRect.right - childRect.width / 2 <= parentRect.right;
      var vcheck = childRect.top + childRect.height >= parentRect.top && childRect.bottom - childRect.height  <= parentRect.bottom;
			return vcheck;
    },
    onSettledFunction(arg) {
      if (this.onSettled) {
				this.onSettled(arg);
			}
		},
  },
  updated() {
    this.handleFocusLost();
    // hide Elements in the dom
    setTimeout(()=>{
      this.$refs.childItem.forEach((el)=>{
        if(this.elementInViewport(el)){
            el.classList.remove('hide');
        } else{
            el.classList.add('hide');
        }
      })
    },200)
  },
  mounted() {
    enableNavigation({
      LEFT: () => {
        if (this.isPrevColumnPresent()) {
          this.updateColumn("reverse");
        } else{
          this.onSettledFunction('LEFT');
        }
      },
      RIGHT: () => {
        if (this.isNextColumnPresent()) {
          this.updateColumn();
        } else{
          this.onSettledFunction('RIGHT');
        }
      },
      UP: () => {
        if (this.isPrevRowPresent()) {
          this.updateRow("reverse");
          if (this.shouldScroll) this.updateScrollValue();
        }else{
          this.onSettledFunction('UP');
        }
      },
      DOWN: () => {
        if (this.isNextRowPresent()) {
          this.updateRow();
          if (this.shouldScroll) this.updateScrollValue("negative");
        }else{
          this.onSettledFunction('DOWN');
        }
      },
      preCondition: () => this.isFocused && !this.disabled,
      id: `grid-${this.id}`,
    });
    focusHandler.on("RESET_FOCUS", this.resetFocus);
  },
  destroyed() {
    disableNavigation(`grid-${this.id}`);
    focusHandler.off("RESET_FOCUS", this.resetFocus);
  },
};
</script>

<style lang="css" scoped>
.focusableGrid{
  width: 100%;
  height: 100%;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  transition: top 0.15s ease;
}
.child {
  display: flex;
  transition: opacity 0.15s ease;
}
.hide {
	opacity: 0;
}
.vertical {
  flex-direction: column;
}
</style>
