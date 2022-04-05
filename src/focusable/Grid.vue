<template>
  <div class="focusableGrid">
    <transition-group ref="grid" :class="{ focus: isFocused }" name="list" class="grid" tag="div">
        <div
          class="child" 
          :style="columns"
          ref="childItem"
          v-for="(item, index) in filteredItems"
          :key="item.id"
        >
          <component
            :is="child"
            v-bind="item"
            :id="`child${item.id || index}`"
            :isFocused="isFocused && index === activeColumn"
          />
        </div>
    </transition-group>
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
      width: 0,
    };
  },
  computed: {
    columns(){
      return {
        width: `${100 / this.maxColumn}%`,
        height: `${(this.width / this.maxColumn)/16*9}px`
      }
    },
    style() {
      return {
        top: `${this.scrollAmount}px`,
      };
    },
    filteredItems(){
			return this.items.filter((item,index)=> this.showItem(item, index));
		},
  },
  methods: {
    showItem(item, index) {
			if(index >= this.activeRow * this.maxColumn && index <= this.focusedIndex + this.maxColumn * this.maxColumn - this.activeColumn + this.maxColumn - 1){
				return item;
			}
			return false;
		},
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
    onSettledFunction(arg) {
      if (this.onSettled) {
				this.onSettled(arg);
			}
		},
		onMainScrollWeel(element){
			element.preventDefault();
			if(!this.isKeyPress){
				if(element.deltaY < 0 || element.deltaY > 0){
					if(element.deltaY > 0  && this.isNextRowPresent()){
						this.updateRow();
						this.updateScrollValue('negative');
					} else if (element.deltaY < 0 && this.isPrevRowPresent()){
						this.updateRow('reverse')
						this.updateScrollValue();
					}
				}
			}
		}
  },
  updated() {
    this.handleFocusLost();
  },
  mounted() {
    this.width = this.$el.clientWidth;
		this.$el.addEventListener("wheel", this.onMainScrollWeel);
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
		this.$el.removeEventListener("wheel", this.onMainScrollWeel);
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
	height: 100%;
	flex-wrap: wrap;
	align-content: flex-start;
	position: relative;
}
.child {
  display: flex;
  align-items: stretch;
}
.list-enter-active, .list-leave-active {
  transition: all .15s ease;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  height: 0!important;
  z-index: 10;
  border-color: transparent;
}
.list-leave-to .focus{
  border-color: transparent;
}
</style>
