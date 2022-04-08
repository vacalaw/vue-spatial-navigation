<template>
  <button class="card" :style="{width:width}" @click="test" v-bind:class="{ focus: isFocused }">
    <img :src="items.card || items.background || items.thumb_url" :style="{height:height}"/>
  </button>
</template>

<script>
export default {
  props: ["items", "isFocused", "disabled","height","width"],
  data(){
    return{
      showInfo: null,
      timeout: null,
    }
  },
  methods:{
    test(){
      console.log(this.items);
    }
  },
  watch:{
    isFocused(val){
      if(val){
        this.$el.focus();
        // this.timeout = setTimeout(()=>{
        //   console.log('Show Info');
        //   this.$el.classList.add('info');
        // },2000)
      } else{
        // clearTimeout(this.timeout);
      }
    }
  }
};
</script>

<style lang="css" scoped>
.card{
  margin: 5px;
  padding: 0;
  outline: none;
  border: none;
  background: none;
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  border: 5px solid transparent;
}
.info{
  transform: scale(3.5)!important;
  transform-origin: left top;
  border-radius: 8px;
  transition: transform 0.2s ease-out;
}
*{
  transition: all 0.1s ease;
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.focus {
  transform: scale(1.08);
  z-index: 2;
  position: relative;
  border-color:white;
}
.disabled {
  opacity: 0.5;
  filter: grayscale(1);
}
</style>
