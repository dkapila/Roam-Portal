<template>
  <div class="ras-search-scope-tweet-blocks-container">
    <transition name="fade-in">
      <ras-menu-bar
        class="ras-menu-bar-container"
        :resultsListNewChangesUnseen="resultsListNewChangesUnseen"
        :searchResultCount="searchResultCount"
        @onIndicateResultsComplete="onIndicateResultsComplete"
      >
      </ras-menu-bar>
    </transition>
    <transition name="fade-in">
      <keep-alive>
        <ras-home
          class="ras-home-view-mode"
          v-if="tweetDisplayMode == -1"
          @refresh-search-called="onRefreshSearchClicked"
        >
        </ras-home>
      </keep-alive>
    </transition>
    <transition name="fade-in">
      <ras-result-tweet
        class="ras-results-view-mode"
        v-if="tweetDisplayMode == 0 && showBlockSearchResults"
        :blockResults="blockResults"
      >
      </ras-result-tweet>
    </transition>
    <transition name="fade-in">
      <ras-twitter-user-word-cloud
        class="ras-results-view-mode"
        v-if="tweetDisplayMode == 1"
        :blockResults="blockResults"
      >
      </ras-twitter-user-word-cloud>
    </transition>
  </div>
</template>

<script>
import rasResultTweet from "./../views/tweet/ras-result-tweet.vue";
import rasTwitterUserWordCloud from "./../views/tweet/ras-twitter-user-word-cloud.vue";
import rasMenuBar from "./../core/ras-menu-bar.vue";
import rasHome from "./../home/ras-home.vue";

export default {
  name: "ras-search-scope-all-blocks",
  components: {
    rasResultTweet,
    rasMenuBar,
    rasHome,
    rasTwitterUserWordCloud,
  },
  props: {
    resultsListNewChangesUnseen: Boolean,
    searchResultCount: Number,
    showBlockSearchResults: Boolean,
    blockResults: Array,
  },
  mixins: [],
  computed: {
    tweetDisplayMode: {
      get() {
        return this.$store.getters["ViewConfig/tweetDisplayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateTweetDisplayMode", value);
      },
    },
  },
  methods: {
    onRefreshSearchClicked() {
      this.$emit("refresh-search-called");
    },
    onIndicateResultsComplete() {
      this.$emit("on-indicate-results-complete");
    },
  },
};
</script>
<style scoped>
.ras-search-scope-tweet-blocks-container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.fade-in-enter-active {
  transition: opacity 0.8s;
}
.fade-in-enter {
  opacity: 0;
}

.ras-home-view-mode {
  height: 100%;
  overflow-y: scroll;
}

.ras-results-view-mode {
  display: flex;
  flex-flow: column;
  height: 100%;
}
</style>
