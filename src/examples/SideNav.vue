<template>
  <div class="side-nav">
    <div class="title">Example Components</div>
    <List
      id="sidemenu"
      :child="Button"
      :isFocused="$parent.focusElement === 'menu'"
      :items="items"
      :onSettled="onFocusHandler"
      orientation="VERTICAL"
    />
    <!-- <router-link v-for="(item, index) in items" :key="index" :to="item.path">{{
      item.displayName
    }}</router-link> -->
  </div>
</template>

<script>
import { routes } from "@/examples/router";
import List from "@/focusable/List";
import Button from "@/examples/components/Button";
export default {
  components:{
    List
  },
  data() {
    return {
      Button: Button,
      items: routes.filter((e) => e.title),
    };
  },
  methods:{
    onFocusHandler(data){
      if(data == 'RIGHT'){
        this.$parent._data.focusElement = 'home'
      }
    }
  }
};
</script>

<style lang="css" scoped>
.side-nav {
  float: left;
  height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: left;
  background: grey;
  width: 300px;  
}
.side-nav .title {
    padding: 20px;
    text-align: center;
    color: white;
    font-size: 24px;
    background: #41b883;
  }
.side-nav .router-link-active, .side-nav /deep/ .button.router-link-active {
    background: #35495e;
  }
  .side-nav a, .side-nav /deep/ a{
    width: 100%;
    padding: 20px;
  }
  .side-nav a, .side-nav /deep/ :focus{
    outline: none;
    border-left: 5px solid #fff;
  }
.side-nav a, .side-nav /deep/ a:not(.focus) {
    background: grey;
    padding: 20px;
    color: white;
    text-decoration: none;
    font-size: 24px;
  }
</style>
