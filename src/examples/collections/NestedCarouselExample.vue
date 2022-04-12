<template>
<div class="content">

  <List
    id="ExanpleNested"
    :child="child"
    :isFocused="selected"
    :items="content"
    :displayItems="4"
    :hideItems="true"
    :shouldScroll="shouldScroll"
    :onSettled="onFocusHandler"
    :onChildChange="childChage"
    orientation="VERTICAL"
  />
</div>
</template>

<script>
import List from "@/focusable/List";
import Card from "@/examples/components/Card";
import { carouselData, gridData, ContentApp } from "../mock/mock";
export default {
  components: {
    List,
  },
  computed:{
    selected(){
      return this.$parent._data.focusElement === 'home'
    },
    content(){
      return ContentApp.smartTvAppVideos.map((item,index) => ({
          id:`${item.channel_id}`,
          shouldScroll: true,
          title: `${item.category}`,
          child: Card,
          hideItems: true,
          onSettled: this.onChildSettled,
          displayItems:5,
          nested:true,
          defaultIndex: this.stateScroll[index || this.rowSelected],
          onChildChange: this.nestedChildChange,
          items: item.videos.map((item) => ({ items: item, id:item.id, width: '16vw'})),
      }));
    }
  },
  data() {
    return {
      child: List,
      shouldScroll: true,
      rowSelected:0,
      stateScroll:ContentApp.smartTvAppVideos.map(() => (-1)),
    };
  },
  methods:{
    nestedChildChange(data){
      this.stateScroll[this.rowSelected] = data.newIndex;
    },
    childChage(data){
      this.rowSelected = data.newIndex;
    },
    onFocusHandler(data){
      console.log('parent',data);
    },
    onChildSettled(data){
      if(data == 'LEFT'){
        this.$parent._data.focusElement = 'menu'
      }
    }
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
