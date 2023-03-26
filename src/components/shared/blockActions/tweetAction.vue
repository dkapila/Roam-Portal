<template>
  <span
    class="ras-tweet-button-container"
    title="Tweet"
    v-on:click.stop="blockActionClicked()"
    >🐦</span
  >
</template>

<script>
export default {
  name: "ras-tweet-action",
  props: {
    blockText: String,
  },
  data() {
    return {
      tweetUrl: "https://twitter.com/intent/tweet?text=",
    };
  },
  methods: {
    blockActionClicked() {
      let newPageString = "_blank";
      let tweetString = window.encodeURIComponent(this.blockText.slice(0, 279));

      window.open(this.tweetUrl + tweetString, newPageString);
    },
  },
};
</script>
<style>
.ras-tweet-button-container {
  opacity: 0.5;
}

.ras-tweet-button-container:hover {
  opacity: 1;
}
</style>
