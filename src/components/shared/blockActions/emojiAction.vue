<template>
  <div class="ras-emoji-reactions-container" v-if="emojis.length > 0">
    <div
      v-bind:key="idx"
      class="ras-emoji-container"
      @click="emojiClicked(item)"
      v-for="(item, idx) in emojis"
    >
      <span class="ras-emoji">{{ item.emoji }}</span>
      <span class="ras-emoji-count">{{ item.userCount }}</span>
    </div>
  </div>
</template>
<script type="js">
export default {
  name: "ras-emoji-action",
  props: {
    emojiReactions: Array,
  },
  data() {
    return {
      emojis: [],
    };
  },
  methods: {
    emojiClicked(item) {
      this.$emit("onEmojiSelected", { selectedEmoji: item.emoji });
    },
  },
  mounted() {
    let emojis = [];
    this.emojiReactions.forEach((item) => {
      if (item.emoji && item.emoji.native) {
        let userCount = 1;
        if (item.users && item.users.length > 0) {
          userCount = item.users.length;
        }
        emojis.push({
          emoji: item.emoji.native,
          userCount: userCount,
        });
      }
    });

    this.emojis = emojis;
  },
};
</script>

<style scoped>
.ras-emoji-container {
  display: flex;
  border: 1px solid #80d2f0;
  border-radius: 7px;
  padding-left: 4px;
  padding-right: 4px;
  margin-left: 10px;
}

.ras-emoji-container:hover {
  border: 1px solid #ec7138;
}

.ras-emoji {
  font-size: 14px !important;
}

.ras-emoji-count {
  margin-left: 3px;
  margin-right: 3px;
  color: #4e012c !important;
  font-size: 14px !important;
}

.ras-emoji-reactions-container {
  display: flex;
  flex-wrap: wrap-reverse;
}
</style>
