<template>
  <div>
    <div v-if="updatingResults" class="ras-loading-new-results-spinner"></div>
    <div class="ras-tweet-scope-container">
      <div class="ras-tabs-container">
        <div class="ras-advance-options-row">
          <input
            :disabled="updatingResults"
            type="checkbox"
            id="ras-include-media-in-tweet"
            v-model="includeMediaInTweet"
          />
          <label class="ras-search-label" for="ras-include-media-in-tweet"
            >Show rich media in tweets</label
          >
        </div>
        <div class="ras-advance-options-row">
          <input
            :disabled="updatingResults"
            type="checkbox"
            id="ras-include-previous-tweet"
            v-model="showConversationInTweet"
          />
          <label class="ras-search-label" for="ras-include-previous-tweet"
            >Include previous tweet in thread</label
          >
        </div>
      </div>
      <div class="ras-tweet-results-container">
        <div
          v-infinite-scroll="loadMoreTweets"
          infinite-scroll-throttle-delay="500"
          infinite-scroll-disabled="busy"
          infinite-scroll-distance="2500"
          class="ras-results-container"
        >
          <div
            ref="loadedTweets"
            v-bind:key="idx"
            class="ras-result ras-tweet-container ras-tweet-loading"
            v-for="(blockResult, idx) in loadedTweets"
            @mouseleave="onHoverElmIndex = null"
            @mouseover="onHoverElmIndex = idx"
            v-on:click="navigateToPage($event, blockResult)"
          >
            <div class="ras-result-tweet-container">
              <Tweet
                class="ras-tweet-iframe-container ras-tweet-iframe-container-loading"
                :id="blockResult['tweetId']"
                @tweet-loaded-success="tweetLoadedSuccess(idx)"
                @tweet-loaded-failure="tweetLoadedFailure(idx)"
                :options="options"
                error-message="Unable to load tweet :'("
                error-message-class="ras-tweet-not-found"
              >
              </Tweet>

              <div
                class="ras-block-actions-container"
                v-on:click="navigateToPage($event, blockResult)"
              >
                <timeAction
                  :index="idx"
                  :hoveredIndex="onHoverElmIndex"
                  v-if="!('pageTitle' in blockResult)"
                  :blockResult="blockResult"
                  class="ras-block-action-item ras-result-time"
                >
                </timeAction>
                <copyReference
                  class="ras-block-action-item ras-result-copy"
                  v-if="blockResult[blockSearchKey]"
                  :blockUid="blockResult['blockUid']"
                >
                </copyReference>
              </div>

              <div class="ras-tweet-embed-loading">
                <div class="ras-tweet-loading-text">Loading Tweet...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import timeAction from "../../shared/blockActions/timeAction.vue";
import copyReference from "../../shared/blockActions/copyReferenceAction.vue";
import roamAdapter from "../../../adapters/roamAdapter";

import { Tweet } from "vue-tweet-embed";

export default {
  name: "ras-result-tweet",
  components: {
    Tweet,
    timeAction,
    copyReference,
  },
  mixins: [roamAdapter],
  props: {
    blockSearchKey: String,
    blockResults: Array,
  },
  data() {
    return {
      onHoverElmIndex: null,
      updatingResults: false,
      itemsToLoad: 4,
      loadedTweets: [],
      options: {},
      tweets: [],
      listOfTweets: [],
    };
  },
  computed: {
    showConversationInTweet: {
      get() {
        return this.$store.getters["Twitter/showConversationInTweet"];
      },
      set(value) {
        this.$store.commit("Twitter/updateShowConversationInTweet", value);
      },
    },
    includeMediaInTweet: {
      get() {
        return this.$store.getters["Twitter/includeMediaInTweet"];
      },
      set(value) {
        this.$store.commit("Twitter/updateIncludeMediaInTweet", value);
      },
    },
    searchQuery: {
      get() {
        return this.$store.getters["SearchConfig/searchQuery"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchQuery", value);
      },
    },
    matchExactPhrase: {
      get() {
        return this.$store.getters["SearchConfig/matchExactPhrase"];
      },
    },
  },
  mounted() {
    this.updateOptions();
    this.listOfTweets = [...this.blockResults];
    this.setData();
  },
  watch: {
    showConversationInTweet() {
      this.setData();
    },
    includeMediaInTweet() {
      this.setData();
    },
    blockResults(value) {
      this.listOfTweets = [...value];
    },
    listOfTweets() {
      this.setData();
    },
  },
  methods: {
    updateOptions() {
      this.options = {};

      this.options.cards = this.includeMediaInTweet == true ? "" : "hidden";
      this.options.conversation =
        this.showConversationInTweet == true ? "" : "none";
    },
    setData() {
      this.loadedTweets = [];
      this.updatingResults = true;
      this.updateOptions();
      window.setTimeout(() => {
        if (this.listOfTweets) {
          this.loadedTweets = this.listOfTweets.slice(0, this.itemsToLoad);
        }

        this.updatingResults = false;
      }, 100);
    },
    tweetLoaded(index, classToAdd) {
      let refElem = this.$refs.loadedTweets[index];

      refElem.className = "ras-result ras-tweet-container " + classToAdd;

      refElem
        .getElementsByClassName("ras-tweet-iframe-container")[0]
        .classList.remove("ras-tweet-iframe-container-loading");
      refElem
        .getElementsByClassName("ras-tweet-embed-loading")[0]
        .classList.add("ras-tweet-hide-loading-container");
    },
    tweetLoadedSuccess(index) {
      let refElem = this.$refs.loadedTweets[index];

      if (refElem && refElem.classList.contains("ras-tweet-failed")) {
        refElem.classList.remove("ras-tweet-loading");
      }

      this.tweetLoaded(index, "ras-tweet-loaded");
    },
    tweetLoadedFailure(index) {
      window.setTimeout(() => {
        let refElem = this.$refs.loadedTweets[index];
        if (refElem && refElem.classList.contains("ras-tweet-loaded")) {
          return;
        }

        if (this.$refs.loadedTweets && this.$refs.loadedTweets[index]) {
          refElem.classList.remove("ras-tweet-loading");
          this.tweetLoaded(index, "ras-tweet-failed");
        }
      }, 100);
    },
    loadMoreTweets() {
      let newTweets = this.listOfTweets.slice(
        this.loadedTweets.length,
        this.loadedTweets.length + this.itemsToLoad
      );
      this.loadedTweets.push(...newTweets);
    },
    navigateToPage(event, result) {
      let uid = result.isPage ? result.pageUid : result.blockUid;

      if (event.shiftKey) {
        this.roamOpenSidebar(uid);
        return true;
      }

      const url = new URL(window.location.href);
      let parts = url.hash.split("/");
      url.hash = parts.slice(0, 3).concat(["page"]).join("/");

      window.location.hash = url.hash + "/" + uid;
      window.roamPortal.hide();
    },
  },
};
</script>
<style>
.ras-result-tweet-container > .ras-tweet-not-found {
  display: flex;
  justify-content: center;
  position: relative;
  color: #ed7641 !important;
}
</style>
<style scoped>
.ras-tweet-loading
  > .ras-result-tweet-container
  > .ras-block-actions-container {
  display: none;
}

.ras-result-tweet-container {
  display: flex;
  width: 100%;
  justify-content: center;
}
.ras-tweet-container {
  display: flex;
  justify-content: center;
}

.ras-tweet-loading-text {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px;
}

.ras-tweet-embed-loading {
  height: 150px;
  display: flex;
  justify-content: center;
  width: 550px;
  border: 1px solid #ccd6dd;
  border-radius: 20px;
  position: relative;
  margin: 20px;
}

.ras-result.ras-tweet-failed {
  height: 150px;
}

.ras-tweet-loading {
  position: relative;
  padding: 0px;
  margin: 0px;
}

.ras-page-title-span {
  color: #ec6f35 !important;
}

.ras-visualize-page-button {
  float: right;
  color: #9769ff !important;
  font-weight: 400;
  font-size: 13px !important;
}

.ras-visualize-page-button:hover {
  color: #ca124c !important;
}

.ras-result-title-container {
  margin-bottom: 5px;
}

.ras-tweet-iframe-container-loading {
  height: 0px;
  width: 0px;
  visibility: hidden;
}

.ras-loading-new-results-spinner {
  display: inline-block;
  width: 40px;
  position: absolute;
  right: 40px;
  top: 15px;
  height: 40px;
}

.ras-loading-new-results-spinner:after {
  content: " ";
  display: block;
  width: 24px;
  height: 24px;
  margin: 8px;
  border-radius: 50%;
  border: 3px solid #b31a1a;
  border-color: #d62929 transparent transparent transparent;
  animation: ras-loading-new-results-spinner 1.5s linear infinite;
}

@keyframes ras-loading-new-results-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.ras-results-container {
  height: 100%;
  overflow-y: scroll;
  width: 100%;
}

.ras-result:hover {
  background-color: #e8e8e8 !important;
}

.ras-search-label {
  font-weight: 300;
  color: #6f6e6e !important;
  font-size: 14px !important;
  margin-left: 10px;
}

.ras-tweet-failed > .ras-result-tweet-container {
  border: 1px solid #ccd6dd;
  border-radius: 20px;
  margin: 10px 15px;
  width: 550px;
  padding: 20px;
  display: flex;
  flex-flow: column;
}

.ras-result {
  cursor: pointer;
  background: white;
  padding: 0px;
  border-top: 0px;
  width: 100%;
  overflow: hidden;
}

.ras-block-actions-container {
  display: flex;
  justify-content: flex-start;
}

.ras-block-action-item {
  margin-left: 10px;
}

span.ras-result-page-title {
  font-size: 16px !important;
}

.ras-result-time {
  text-align: right;
}

.ras-result-string {
  overflow-x: scroll;
}

.ras-tabs-container {
  display: flex;
  margin: 2px 0px 0px 15px;
}

.ras-result-string > span {
  color: #868686 !important;
  overflow-x: scroll;
}

.ras-block-actions-container {
  display: flex;
  justify-content: center;
}

.ras-tweet-iframe-container {
  justify-content: center;
  display: flex;
}

.ras-advance-options-row {
  display: flex;
  margin-right: 20px;
}

.ras-tweet-loaded {
  display: flex;
  justify-content: center;
  padding: 10px 15px;
}

.ras-tweet-loaded > div {
  flex-flow: column;
}

.ras-tweet-scope-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ras-loading-more-tweets {
  display: flex;
  justify-content: center;
}

.ras-tweet-hide-loading-container {
  display: none;
}

.ras-tweet-results-container {
  height: 100%;
  overflow-y: scroll;
}
.ras-result-tweet-block {
  height: 100%;
  overflow: hidden;
}

.ras-result-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 200px;
  overflow: hidden;
  border: none;
  font-size: 14px !important;
  text-align: left;
  font-weight: 600;
  color: #ec6f35 !important;
}
</style>
