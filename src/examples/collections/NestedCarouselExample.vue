<template>
<div class="content">

  <List
    :child="child"
    :isFocused="selected"
    :items="items"
    :shouldScroll="shouldScroll"
    :nested="true"
    :hideItems="true"
    :onSettled="onFocusHandler"
    orientation="VERTICAL"
  />
</div>
<!-- <div>
</div> -->
</template>

<script>
import List from "@/focusable/List";
import Card from "@/examples/components/Card";
import { carouselData, gridData } from "../mock/mock";
export default {
  components: {
    List,
  },
  computed:{
    selected(){
      return this.$parent._data.focusElement === 'home'
    }
  },
  data() {
    return {
      items: [
        {
          shouldScroll: true,
          title: 'Test1',
          child: Card,
          hideItems: true,
          onSettled: this.onChildSettled,
          displayItems:5,
          items: gridData.map((item) => ({ items: item, width: '16vw'})),
        },
        {
          shouldScroll: true,
          title: 'Test2',
          child: Card,
          hideItems: true,
          onSettled: this.onChildSettled,
          displayItems:5,
          items: gridData.map((item) => ({ items: item, width: '16vw'})),
        },
        {
          shouldScroll: true,
          title: 'Test3',
          child: Card,
          hideItems: true,
          onSettled: this.onChildSettled,
          displayItems:5,
          items: gridData.map((item) => ({ items: item, width: '16vw'})),
        },
        {
          shouldScroll: true,
          title: 'Test4',
          child: Card,
          hideItems: true,
          onSettled: this.onChildSettled,
          displayItems:5,
          items: gridData.map((item) => ({ items: item, width: '16vw'})),
        },
      ],
      child: List,
      shouldScroll: true,
    };
  },
  methods:{
    onFocusHandler(data){
      console.log('parent',data);
    },
    onChildSettled(data){
      // console.log('Child',data);
      if(data == 'LEFT'){
        this.$parent._data.focusElement = 'menu'
      }
    }
  },
  mounted(){
    // console.log(this.$parent._data.focusElement)
  }
};
</script>

<style lang="css">
.content{
  height: 100%;
}
.focus {
  z-index: 1;
}
</style>
