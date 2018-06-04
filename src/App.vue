<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { store } from './vuex/store';

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
  background: #fff
  height: 100vh

body
  margin: auto
  background: #fff
  width: 1920px
  padding: 0
  height: 100vh
  overflow: hidden
  display: flex
  align-items: center
  justify-content: center

.section
  background: #fff
  width: 1896px
  height: 1080px
  $box-shadow-opacity: 0.45
  -webkit-box-shadow: 0 0 8px 0 rgba(50, 50, 50, $box-shadow-opacity)
  -moz-box-shadow: 0 0 8px 0 rgba(50, 50, 50, $box-shadow-opacity)
  box-shadow: 0 0 8px 0 rgba(50, 50, 50, $box-shadow-opacity)
.test
  width : 1800px
  overflow: hidden
*
  box-sizing: border-box
</style>

