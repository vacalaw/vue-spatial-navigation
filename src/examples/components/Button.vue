<template>
  <router-link v-if="path" class="button" v-bind:class="{ focus: isFocused, disabled }" :to="path">
    {{ title }}
  </router-link>
  <button v-else class="button" @click="goTo(path)" v-bind:class="{ focus: isFocused, disabled }">
    {{ title }}
  </button>
</template>

<script>
export default {
  props: ["title", "isFocused", "disabled","path"],
  methods:{
    goTo(path){
      console.log(path);
      location.href = path;
    }
  },
  watch:{
    isFocused(val){
      if(val){
        this.$el.focus();
      }
    }
  }
};
</script>

<style lang="css" scoped>
.button {
  padding: 30px;
  background: white;
  font-size: 24px;
  width: fit-content;
  white-space: nowrap;
  text-decoration: none;
}
.focus {
  background: #ff005e;
  color: white;
}
.disabled {
  background: grey;
}
</style>
