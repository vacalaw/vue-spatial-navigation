import Vue from "vue";
import Router from "vue-router";
import ListExample from "@/examples/collections/ListExample";
import ListDisabledExample from "@/examples/collections/ListDisabledExample";
import CarouselExample from "@/examples/collections/CarouselExample";
import NestedCarouselExample from "@/examples/collections/NestedCarouselExample";
import GridExample from "@/examples/collections/GridExample";
Vue.use(Router);

export const routes = [
  // {
  //   path: "/list",    
  //   title: "List",
  //   component: ListExample,
  // },
  // {
  //   path: "/listdisabled",    
  //   title: "List with disabled items",
  //   component: ListDisabledExample,
  // },
  // {
  //   path: "/carousel",    
  //   title: "Carousel",
  //   component: CarouselExample,
  // },
  {
    path: "/nestedcarousel",    
    title: "Nested Carousel",
    component: NestedCarouselExample,
  },
  {
    path: "/grid",    
    title: "Grid",
    component: GridExample,
  },
  { path: '*', redirect: '/nestedcarousel' }
];
export default new Router({
  mode: "history",
  routes,
});
