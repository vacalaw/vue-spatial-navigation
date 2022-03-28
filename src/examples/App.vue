<template>
  <div class="container">
    <SideNav />
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import SideNav from "@/examples/SideNav";
import List from "@/focusable/List";
import Button from "@/examples/components/Button";
import { routes } from "@/examples/router";
import {Grid} from '../../dist/vue-spatial-navigation.esm';
export default {
  name: "App",
  components: {
    SideNav,
    List
  },
  created(){
    // console.error(Grid)
  },
  data(){
    return{
      Button: Button,
      items:routes,
      focusElement:'home',
    }
  },
};
</script>

<style>
body,html{
  padding: 0;
  margin: 0;
}
*{
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
}
body {
  overflow: hidden;
}
.container {
  background: black;
  height: 100vh;
  overflow: hidden;
}
.main-content {
  display: flex;
  flex-direction: column;
  padding: 4%;
  height: 100vh;
  overflow: hidden;
}
</style>
