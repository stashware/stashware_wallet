<template>
  <v-app style="background:#4C4D55;">
    <v-main>
      <div class="wraper elevation-5">
        <router-view></router-view>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'App',
  components: {},
})
</script>

<style lang="less" scoped>
.wraper {
  width: 1000px;
  height: 720px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background: #18191d;
  color: white;
  border-radius: 5px;
  overflow: hidden;
}
</style>