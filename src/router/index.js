import Vue from 'vue';
import Router from 'vue-router';
import Radvis from '../components/radvis.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Radvis',
      component: Radvis,
    },
  ],
});
