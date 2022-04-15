<template>
  <FocusableGrid
    :child="Card"
    :isFocused="selected"
    :items="items"
    :onSettled="onFocusHandler"
    :shouldScroll="true"
    :maxColumn="4"
  />
</template>

<script>
import FocusableGrid from "@/focusable/Grid";
import Card from "@/examples/components/Card";
import { ContentApp } from "../mock/mock";
export default {
  props: ["shouldScroll"],
  components: {
    FocusableGrid,
  },
  computed:{
    selected(){
      return this.$parent._data.focusElement === 'home'
    }
  },
  data() {
    return {
      items: ContentApp.smartTvAppVideos[2].videos[0].content.map((item) => ({ items: item, width:'100%' })),
      Card: Card,
    };
  },
  methods:{
    onFocusHandler(data){
      if(data == 'LEFT'){
        this.$parent._data.focusElement = 'menu'
      }
    }
  }
};
</script>

<style lang="css" scoped>
.grid {
  width: 100%;
}
</style>
