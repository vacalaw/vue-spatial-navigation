<template>
  <Grid
    :child="Card"
    :isFocused="true"
    :items="items"
    :shouldScroll="true"
    :maxColumn="4"
  />
</template>

<script>
import Grid from "@/focusable/Grid";
import Card from "@/examples/components/Card";
import { gridData } from "../mock/mock";
export default {
  props: ["shouldScroll"],
  components: {
    Grid,
  },
  data() {
    return {
      items: gridData.map((item) => ({ items: item, width:'100%' })),
      Card: Card,
    };
  },
};
</script>

<style lang="css" scoped>
.grid {
  width: 100%;
}
</style>
