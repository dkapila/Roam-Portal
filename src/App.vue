<template>
  <div id="ras-roam-portal">
    <ras-portal />
  </div>
</template>
<script lang="ts">
import rasPortal from "./components/ras-portal.vue";

export default {
  name: "app",
  components: {
    rasPortal,
  },
};
</script>
<style>
#ras-overlay-div {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  background: black;
  opacity: 0.1;
}
</style>
<style scoped>
#ras-roam-portal {
  display: none;
  position: absolute;
  height: 88%;
  max-height: 1200px;
  min-height: 400px;
  overflow: hidden;
  min-width: 700px;
  max-width: 1000px;
  width: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  box-shadow: 0 0 4px 0 var(--background-shadow-color);
  background-color: #fff;
  border-radius: 15px;
  top: 50%;
}
</style>
