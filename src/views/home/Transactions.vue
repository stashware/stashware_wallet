<template>
  <section>
    <records />
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Records from '@/components/Records.vue'

@Component({
  components: {
    Records,
  },
})
export default class Transcations extends Vue {
}
</script>

<style scoped lang="less">
</style>
