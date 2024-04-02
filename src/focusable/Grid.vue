<template>
    <div class="focusableGrid">
        <div
            ref="grid"
            :class="{ focus: isFocused }"
            class="grid"
            :style="style"
        >
            <div
                class="child"
                :style="columns"
                ref="childItem"
                v-for="(item, index) in itemsList"
                :key="item.id"
                :class="{ activeRow: showItem(index) }"
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
            type: String,
            default: Math.random().toString(),
        },
        poster: {
            default: false,
        },
    },
    data() {
        return {
            focusedIndex: 0,
            scrollAmount: 0,
            activeRow: 0,
            activeColumn: 0,
            width: 0,
            preventMove: false,
            itemsList: this.items.slice(
                0,
                this.maxColumn * this.maxColumn + this.maxColumn,
            ),
        };
    },
    computed: {
        columns() {
            let divider = this.poster
                ? (this.width / this.maxColumn / 2) * 3
                : (this.width / this.maxColumn / 16) * 9;
            return {
                width: `${100 / this.maxColumn}%`,
                height: `${Math.round(divider)}px`,
            };
        },
        style() {
            return `transform: translateY(${this.scrollAmount}px)`;
        },
    },
    methods: {
        showItem(index) {
            return (
                index >= this.activeRow * this.maxColumn &&
                index <=
                    this.focusedIndex +
                        this.maxColumn * this.maxColumn -
                        this.activeColumn +
                        this.maxColumn -
                        1
            );
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
            this.preventMoveFunction();
        },
        preventMoveFunction() {
            this.preventMove = true;
            setTimeout(() => {
                this.preventMove = false;
            }, 300);
        },
        isFocusIndexOutOfBound() {
            return this.focusedIndex > this.items.length - 1;
        },
        updateScrollValue(negative) {
            this.scrollAmount += this.getScrollAmount(
                this.$refs.childItem[this.focusedIndex],
                negative,
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
        onMainScrollWeel(element) {
            element.preventDefault();
            if (element.deltaY < 0 || element.deltaY > 0) {
                if (element.deltaY > 0 && this.isNextRowPresent()) {
                    this.updateRow();
                    this.appendItem();
                    this.updateScrollValue("negative");
                } else if (element.deltaY < 0 && this.isPrevRowPresent()) {
                    this.updateRow("reverse");
                    this.updateScrollValue();
                }
            }
        },
        appendItem() {
            const amount = this.items.length - this.itemsList.length;
            const pushAmount =
                amount > this.maxColumn ? this.maxColumn : amount;
            const newItems = this.items.slice(
                this.itemsList.length,
                this.itemsList.length + pushAmount,
            );
            if (this.itemsList.length < this.items.length) {
                this.itemsList.push(...newItems);
            }
        },
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
                } else {
                    this.onSettledFunction("LEFT");
                }
            },
            RIGHT: () => {
                if (this.isNextColumnPresent()) {
                    this.updateColumn();
                } else {
                    this.onSettledFunction("RIGHT");
                }
            },
            UP: () => {
                if (this.isPrevRowPresent()) {
                    if (!this.preventMove) {
                        this.updateRow("reverse");
                        if (this.shouldScroll) this.updateScrollValue();
                    }
                } else {
                    this.onSettledFunction("UP");
                }
            },
            DOWN: () => {
                if (this.isNextRowPresent()) {
                    if (!this.preventMove) {
                        this.updateRow();
                        if (this.shouldScroll)
                            this.updateScrollValue("negative");
                        this.appendItem();
                    }
                } else {
                    this.onSettledFunction("DOWN");
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
.focusableGrid {
    width: 100%;
    height: 100%;
}
.grid {
    display: flex;
    height: 100%;
    flex-wrap: wrap;
    align-content: flex-start;
    position: relative;
    transition: transform 0.3s ease;
}
.child {
    display: flex;
    align-items: stretch;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease;
}
h3 {
    color: #fff;
    font-size: 20px;
}
.child.activeRow {
    opacity: 1;
    visibility: visible;
}
.list-enter-active,
.list-leave-active {
    transition: all 0.15s ease;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    height: 0 !important;
    z-index: 10;
    border-color: transparent;
}
.list-leave-to .focus {
    border-color: transparent;
}
</style>
