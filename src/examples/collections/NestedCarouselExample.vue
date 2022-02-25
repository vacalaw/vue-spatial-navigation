<template>
  <List
    :child="child"
    :isFocused="true"
    :items="items"
    :shouldScroll="shouldScroll"
    :onSettled="onFocusHandler"
    orientation="VERTICAL"
  />
</template>

<script>
import List from "@/focusable/List";
import Card from "@/examples/components/Card";
import { carouselData, gridData } from "../mock/mock";
export default {
  components: {
    List,
  },
  data() {
    return {
      items: [
        {
          shouldScroll: true,
          title: 'Test1',
          child: Card,
          onSettled: this.onFocusHandler,
          items: gridData.map((item) => ({ items: item, width: '16vw'})),
        },
        {
          child: Card,
          shouldScroll: true,
          title: 'Test1',
          items: gridData.map((item) => ({ items: item, width: '16vw',})),
        },
        {
          child: Card,
          shouldScroll: true,
          title: 'Test1',
          items: gridData.map((item) => ({ items: item, width: '16vw',})),
        },
        {
          child: Card,
          shouldScroll: true,
          title: 'Test1',
          items: gridData.map((item) => ({ items: item, width: '16vw',})),
        },
        {
          child: Card,
          shouldScroll: true,
          title: 'Test1',
          items: gridData.map((item) => ({ items: item, width: '16vw',})),
        },
        {
          child: Card,
          shouldScroll: true,
          title: 'Test1',
          items: gridData.map((item) => ({ items: item, width: '16vw',})),
        },
        {
          child: Card,
          shouldScroll: true,
          title: 'Test1',
          items: gridData.map((item) => ({ items: item, width: '16vw',})),
        },
        {
          child: Card,
          shouldScroll: true,
          title: 'Test1',
          items: gridData.map((item) => ({ items: item, width: '16vw',})),
        },
        {
          child: Card,
          shouldScroll: true,
          title: 'Test1',
          items: gridData.map((item) => ({ items: item, width: '16vw',})),
        },
      ],
      child: List,
      shouldScroll: true,
    };
  },
  methods:{
    onFocusHandler(data){
      console.log(data);
    }
  }
};
</script>

<style lang="css">
.focus {
  z-index: 1;
}
</style>
