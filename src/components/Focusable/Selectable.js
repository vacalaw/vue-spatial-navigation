import { enableNavigation, disableNavigation } from "@/focus/event";
export default {
  mounted() {
    enableNavigation({
      SELECT: () => {
        console.error("called here");
        this.$emit("onSelect", this.$props);
      },
      preCondition: () => {
        return this.isFocused;
      },
      id: this.id,
    });
  },
  destroyed() {
    disableNavigation(this.id);
  },
};
