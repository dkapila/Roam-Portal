<template>
  <div class="ras-emoji-reactions-filter-bar-container">
    <div
      v-bind:key="idx"
      class="ras-emoji-container"
      v-bind:class="{
        'ras-emoji-container-active': selectedIndex === idx,
        'ras-emoji-container-inactive': selectedIndex != idx,
      }"
      v-for="(item, idx) in emojiList"
      v-on:click="toggleSelectEmoji(idx, item)"
    >
      <div class="ras-emoji">{{ item[0] }}</div>
      <div class="ras-emoji-count">{{ item[1] }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ras-emoji-reactions-filter-bar",
  props: {
    blockResults: Array,
    selectedEmojiReaction: String,
  },
  data() {
    return {
      emojiList: [],
      selectedIndex: null,
    };
  },
  watch: {
    blockResults() {
      this.updateEmojiList();
    },
    selectedEmojiReaction() {
      this.updateSelectedEmoji();
    },
  },
  mounted() {
    this.updateEmojiList();
  },
  methods: {
    updateSelectedEmoji() {
      this.emojiList.forEach((emoji, idx) => {
        if (emoji[0] == this.selectedEmojiReaction) {
          this.selectedIndex = idx;
          return;
        }
      });
    },
    toggleSelectEmoji(index, item) {
      if (this.selectedIndex == index) {
        this.selectedIndex = null;
        this.$emit("onEmojiSelected", { selectedEmoji: null });
        return;
      }

      this.selectedIndex = index;
      this.$emit("onEmojiSelected", { selectedEmoji: item[0] });
    },
    updateEmojiList() {
      let emojis = {};
      this.blockResults.forEach((block) => {
        if (!block.emojiReactions || block.emojiReactions.length == 0) {
          return;
        }

        let emojiReactions = block.emojiReactions;

        emojiReactions.forEach((emojiReaction) => {
          if (emojiReaction.emoji && emojiReaction.emoji.native) {
            let userCount = 1;

            if (emojiReaction.users && emojiReaction.users.length > 0) {
              userCount = emojiReaction.users.length;
            }

            let emoji = emojiReaction.emoji.native;

            if (emoji in emojis) {
              emojis[emoji] = emojis[emoji] + userCount;
            } else {
              emojis[emoji] = userCount;
            }
          }
        });
      });

      let emojiList = Object.keys(emojis).map(function (key) {
        return [key, emojis[key]];
      });

      emojiList.sort((a, b) => {
        return b[1] - a[1];
      });

      this.emojiList = emojiList;
    },
  },
};
</script>

<style scoped>
.ras-emoji-reactions-filter-bar-container {
  display: flex;
  overflow-x: auto;
  background: #f4efff;
}

.ras-emoji-container {
  display: flex;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 18px;
  flex-shrink: 0;
  cursor: pointer;
}

.ras-emoji {
  font-size: 14px !important;
}

.ras-emoji-container-inactive:hover {
  background: bisque;
}

.ras-emoji-count {
  margin-left: 2px;
  font-size: 14px !important;
  color: #4e012c;
}

.ras-emoji-container-active {
  background: #f5c0ab;
}
</style>
