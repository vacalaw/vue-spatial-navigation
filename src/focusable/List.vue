<template>
	<div class="focusableList" :class="[{ready: ready},{'nested-hide-items': (hideItems && nested)},{'hide-items': (hideItems && !nested)}]">
		<h3 v-if="title">{{ title }}</h3>
		<div
			class="list"
			:class="[{vertical: orientation === 'VERTICAL' }]"
			ref="list"
			:style="style"
		>
			<div
				class="child"
				:class="[{focus: index === focusedIndex}]"
				ref="childItem"
				v-for="(item, index) in itemsList"
				:key="`child-${item.id || index}`"
			>
				<component
					:is="child"
					v-bind="item"
					:id="`nested-${item.id}`"
					:key="`nested-${item.id || index}`"
					:isFocused="isFocused && index === focusedIndex"
					:class="{ disabled: disabledIndex.includes(index) }"
					:disabled="item.disabled || disabledIndex.includes(index)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { enableNavigation, disableNavigation, focusHandler } from "@/event-bus";

export default {
	name: "focusableList",
	props: {
		hideItems: {
			type: Boolean,
			default: false,
		},
		nested: {
			type: Boolean,
			default: false,
		},
		onSettled: {
			type: Function,
			required: false,
		},
		onChildChange: {
			type: Function,
			required: false,
		},
		child: {
			type: Object, //Child component (eg: card, button)
			required: true,
		},
		title: {
			type: String,
			require: false,
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
		defaultIndex: {
			type: Number,
			default: -1,
		},
		disabled: {
			//Condition to prevent navigation
			type: Boolean,
			default: false,
		},
		disabledIndex: {
			type: Array,
			default: () => [-1],
		},
		orientation: {
			type: String, //Direction of list
			default: "HORIZONTAL", //'VERTICAL'
		},
		shouldScroll: {
			type: Boolean,
			default: false,
		},
		displayItems: {
			type: Number,
			default: 4,
		},
		id: {
			//unique id to differentiate navigation
			default: Math.random().toString(),
		},
	},
	data() {
		return {
			focusedIndex: -1,
			scrollAmount: 0,
			ready: false,
			itemsList: this.hideItems ? this.items.slice(0,this.displayItems) : this.items,
		};
	},
	computed: {
		style() {
			return (
				((this.orientation === "VERTICAL" ? "transform: translateY" : "transform: translateX") + `(${this.scrollAmount}px);`)
			);
		},
	},
	methods: {
		showItem(item, index) {
			if (this.hideItems) {
				return (
					index >= this.focusedIndex &&
					index < +this.displayItems + this.focusedIndex
				);
			}
			return true;
		},
		isEnabledIndex(index) {
			return !this.disabledIndex.includes(index);
		},
		setInitialvalue() {
			if (
				this.defaultIndex > -1 &&
				this.defaultIndex < this.items.length &&
				this.isEnabledIndex(this.defaultIndex)
			) {
				this.focusedIndex = this.defaultIndex;
			} else {
				this.focusedIndex = this.getValidNextIndex();
			}
			if (this.focusedIndex >= -1) this.updateScrollValue();
		},
		getKeysByOrientation: (orientation) => ({
			REVERSE: orientation === "VERTICAL" ? "UP" : "LEFT",
			FORWARD: orientation === "VERTICAL" ? "DOWN" : "RIGHT",
		}),
		getScrollAmountByOrientation: (el, orientation) => {
			if (el) {
				return -el[orientation === "VERTICAL" ? "clientHeight" : "clientWidth"];
			}
			return 0;
		},
		handleFocusLost() {
			if (
				this.focusedIndex > this.items.length - 1 ||
				this.disabledIndex.includes(this.focusedIndex)
			) {
				if (this.getValidPrevIndex() !== this.focusedIndex) {
					this.$emit("onFocusLost", {
						prevIndex: this.focusedIndex,
						newIndex: this.getValidPrevIndex(),
					});
					this.focusedIndex = this.getValidPrevIndex();
				} else if (this.getValidNextIndex() !== this.focusedIndex) {
					this.$emit("onFocusLost", {
						prevIndex: this.focusedIndex,
						newIndex: this.getValidNextIndex(),
					});
					this.focusedIndex = this.getValidNextIndex();
				} else {
					this.focusedIndex = -1;
					this.$emit("onFocusLost", {
						err: "No items to set focus, either disable it or provide new item to setFocus",
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
						item: this.items[validIndex],
					});
					this.onChildChangeFunction(
						this.focusedIndex,
						validIndex,
						this.items[validIndex]
					);
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
						item: this.items[validIndex],
					});
					this.onChildChangeFunction(
						this.focusedIndex,
						validIndex,
						this.items[validIndex]
					);
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
					item: item,
				});
			}
		},
		updateScrollValue() {
			if (this.shouldScroll && this.$refs.childItem) {
				this.scrollAmount =
					this.getScrollAmountByOrientation(
						this.$refs.childItem[0],
						this.orientation
					) * this.focusedIndex;
			}
		},
		resetFocus({ force }) {
			if (force || !this.isFocused) {
				this.focusedIndex = 0;
				this.scrollAmount = 0;
			}
		},
		setExternalFocus({ index, id } = {}) {
			if (id === this.id) {
				if (
					this.isEnabledIndex(index) &&
					index >= 0 &&
					index < this.items.length - 1
				) {
					this.focusedIndex = index;
					this.updateScrollValue();
				} else {
					console.error(`focus to the given index ${index} is not possible`);
				}
			}
		},
		onSettledFunction(arg) {
			if (this.ready && this.onSettled) {
				this.onSettled(arg);
			}
		},
		appendItem(){
			console.log('append child');
			if(this.itemsList.length < this.items.length){
				this.itemsList.push(this.items[this.itemsList.length]);
			}
			// itemsList:  this.items.slice(0,this.displayItems),
		}
	},
	updated() {
		this.handleFocusLost();
	},
	mounted() {
		this.setInitialvalue();
		let KEYS = this.getKeysByOrientation(this.orientation);
		let KEYSLR = this.getKeysByOrientation(!this.orientation);
		enableNavigation({
			id: `list-${this.id}`,
			[KEYSLR.REVERSE]: () => {
				if (this.orientation == "VERTICAL" && !this.hideItems) {
					this.onSettledFunction(KEYSLR.REVERSE);
				}
			},
			[KEYSLR.FORWARD]: () => {
				if (this.orientation == "VERTICAL" && !this.hideItems) {
					this.onSettledFunction(KEYSLR.FORWARD);
				}
			},
			[KEYS.REVERSE]: () => {
				if (this.isPrevItemPresent()) {
					this.updateFocus("reverse");
					this.updateScrollValue();
				} else {
					this.onSettledFunction(KEYS.REVERSE);
				}
			},
			[KEYS.FORWARD]: () => {
				if (this.isNextItemPresent()) {
					this.updateFocus();
					this.updateScrollValue();
					this.appendItem();
				} else {
					this.onSettledFunction(KEYS.FORWARD);
				}
			},
			preCondition: () => this.isFocused && !this.disabled,
		});
		focusHandler.on("RESET_FOCUS", this.resetFocus);
		focusHandler.on("SET_FOCUS", this.setExternalFocus);

		setTimeout(()=>{
			this.ready = true;
		},500)
	},
	destroyed() {
		disableNavigation(`list-${this.id}`);
		focusHandler.off("RESET_FOCUS", this.resetFocus);
		focusHandler.off("SET_FOCUS", this.setExternalFocus);
	},
};
</script>

<style lang="css" scoped>
.focusableList {
	height: 100%;
	width: 100%;
}
h3 {
	color: #fff;
	text-align: left;
	margin: 32px 0 16px;
	font-size: 1.6vmax;
}
.list {
	display: flex;
	position: relative;
}
.child {
	display: flex;
}
.hide-items .child, .nested-hide-items .child{
	opacity: 0;
	visibility: hidden;
	transition: opacity 0.2s ease;
}
.child.focus,
.child.focus + .child,
.child.focus + .child + .child,
.nested-hide-items .child.focus + .child + .child + .child,
.nested-hide-items .child.focus + .child + .child + .child + .child{
	opacity: 1;
	visibility: visible;
}
.vertical {
	flex-direction: column;
}
.disabled {
	background: grey;
}
.ready > .list{
	transition: transform 0.1s ease;
}
</style>
