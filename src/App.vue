<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue';
import VueGoodTable from 'vue-good-table';
import 'vue-good-table/dist/vue-good-table.css';
import { store } from './vuex/store';

Vue.use(VueGoodTable);

export default {
  name: 'App',
  store,
  methods: {},
};
</script>

<style lang="sass">
@import "./style/global"
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  padding: 0
  margin: 0
  color: #2c3e50

html
  background: #f0f0f0

body
  margin: auto
  background: #f0f0f0
  width: 1920px
  padding: 32px 0
  display: flex
  align-items: center
  justify-content: center

.radvis-field
  $box-shadow-opacity: 0.45
  -webkit-box-shadow: 0 4px 8px 0 rgba(50, 50, 50, $box-shadow-opacity)
  -moz-box-shadow: 0 4px 8px 0 rgba(50, 50, 50, $box-shadow-opacity)
  box-shadow: 0 4px 8px 0 rgba(50, 50, 50, $box-shadow-opacity)

.section
  background: #fff
  width: 1896px
  height: 1080px

.test
  width: 1800px
  overflow: hidden

*
  box-sizing: border-box
</style>

