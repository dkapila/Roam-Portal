<template>
  <div>
    <div v-if="updatingResults" class="ras-loading-new-results-spinner"></div>
    <div
      class="ras-show-pages-on-top-checkbox-container"
      v-if="showIncludePagesCheckbox && !updatingResults"
    >
      <input
        type="checkbox"
        id="ras-include-page-in-results"
        v-model="includePagesInResults"
      />
      <label class="ras-search-label" for="ras-include-page-in-results"
        >Show pages created during this period ({{ pageCountString }})</label
      >
    </div>
    <div
      class="ras-emoji-bar-container"
      v-if="onlyIncludeBlocksWithReactions && nonPages.length > 0"
    >
      <emoji-reactions-filter-bar
        @onEmojiSelected="onEmojiSelected"
        :selectedEmojiReaction="selectedEmojiReaction"
        :blockResults="nonPages"
      />
      <div class="ras-tabs-container">
        <div
          class="ras-tabs-button"
          v-bind:class="{ 'ras-tab-active': sortMode == 1 }"
          v-on:click="sortMode = 1"
        >
          Sort by Date
        </div>
        <div
          class="ras-tabs-button"
          v-bind:class="{ 'ras-tab-active': sortMode == 2 }"
          v-on:click="sortMode = 2"
        >
          Sort by Reactions
        </div>
      </div>
    </div>
    <div class="ras-results-container">
      <div v-if="showResultsWithPages">
        <div
          v-bind:key="idx"
          class="ras-result"
          v-on:click="navigateToPage($event, blockResult)"
          v-for="(blockResult, idx) in pages"
        >
          <div class="ras-result-title">
            <span class="ras-page-title-span">{{ blockResult["title"] }}</span>
          </div>
        </div>
      </div>
      <div
        v-bind:key="blockResult"
        class="ras-result"
        v-on:click="navigateToPage($event, blockResult)"
        v-for="(blockResult, idx) in blocksToDisplay"
        @mouseleave="onHoverElmIndex = null"
        @mouseover="onHoverElmIndex = idx"
      >
        <div class="ras-result-title-container">
          <div class="ras-result-title">
            <span
              class="ras-result-page-title ras-page-title-span"
              v-if="blockResult['pageTitle']"
            >
              <text-highlight
                highlightClass="ras-highlight"
                :queries="highlightKey"
                >{{ blockResult["pageTitle"] }}</text-highlight
              >
            </span>
            <span v-else class="ras-page-title-span">{{
              blockResult["title"]
            }}</span>
          </div>
        </div>
        <div v-if="blockResult[blockSearchKey]" class="ras-result-string">
          <text-highlight
            highlightClass="ras-highlight"
            :queries="highlightKey"
            >{{ blockResult[blockSearchKey] }}</text-highlight
          >
        </div>
        <div class="ras-block-actions-container">
          <emojiAction
            @onEmojiSelected="onEmojiSelected"
            class="ras-block-action-item ras-result-emoji-reaction"
            v-if="blockResult['emojiReactions']"
            :emojiReactions="blockResult['emojiReactions']"
          />
          <copyReference
            class="ras-block-action-item ras-result-copy"
            v-if="blockResult[blockSearchKey]"
            :blockUid="blockResult['blockUid']"
          />
          <tweetAction
            class="ras-block-action-item ras-action-tweet"
            v-if="blockResult[blockSearchKey]"
            :blockText="blockResult[blockSearchKey]"
          />
          <timeAction
            :index="idx"
            :hoveredIndex="onHoverElmIndex"
            v-if="!('pageTitle' in blockResult)"
            :blockResult="blockResult"
            class="ras-block-action-item ras-result-time"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import emojiReactionsFilterBar from "./ras-emoji-reactions-filter-bar.vue";
import tweetAction from "../shared/blockActions/tweetAction.vue";
import emojiAction from "../shared/blockActions/emojiAction.vue";
import timeAction from "../shared/blockActions/timeAction.vue";
import copyReference from "../shared/blockActions/copyReferenceAction.vue";
import roamAdapter from "../../adapters/roamAdapter";

export default {
  name: "ras-result",
  components: {
    copyReference,
    tweetAction,
    timeAction,
    emojiAction,
    emojiReactionsFilterBar,
  },
  mixins: [roamAdapter],
  props: {
    blockSearchKey: String,
    pages: Array,
    blockResults: Array,
    showIncludePagesCheckbox: Boolean,
  },
  data() {
    return {
      selectedEmojiReaction: null,
      onHoverElmIndex: null,
      updatingResults: true,
      highlightKey: [],
      pageCountString: "",
      nonPages: [],
      blocksToDisplay: [],
      includePagesInResults: false,
      timeout: false,
      showResultsWithPages: this.includePagesInResults,
      sortMode: 1,
    };
  },
  computed: {
    onlyIncludeBlocksWithReactions: {
      get() {
        return this.$store.getters[
          "SearchConfig/onlyIncludeBlocksWithReactions"
        ];
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
  watch: {
    onlyIncludeBlocksWithReactions(val) {
      if (!val) {
        this.selectedEmojiReaction = null;
      }
    },
    sortMode() {
      this.setData(this.blockResults);
    },
    selectedEmojiReaction() {
      this.setData(this.blockResults);
    },
    pages() {
      this.updatePageCountString();
    },
    blockResults() {
      clearTimeout(this.timeout);
      this.renderResults();
    },
    includePagesInResults(value) {
      this.showResultsWithPages = value;
    },
    showIncludePagesCheckbox(value) {
      this.includePagesInResults = !value;
    },
  },
  mounted() {
    clearTimeout(this.timeout);
    this.renderResults();
  },
  methods: {
    onEmojiSelected(payload) {
      this.selectedEmojiReaction = payload.selectedEmoji;
    },
    renderResults() {
      this.includePagesInResults = false;
      this.updatingResults = true;
      this.blocksToDisplay = [];
      this.nonPages = [];

      this.timeout = window.setTimeout(() => {
        let query = this.searchQuery;

        if (this.matchExactPhrase) {
          this.highlightKey = [query];
        } else {
          this.highlightKey = this.searchQuery
            .trim()
            .replace(/  +/g, " ")
            .split(" ");
        }

        if (!this.showIncludePagesCheckbox) {
          this.includePagesInResults = true;
        }

        this.setData(this.blockResults);
        this.updatingResults = false;
      }, 100);
    },
    updatePageCountString() {
      if (!this.pages || this.pages.length == 0) {
        this.pageCountString = 0;
        this.showResultsWithPages = false;
        return;
      }

      let pageLength = this.pages.length;
      this.pageCountString =
        this.pages.length > 0 ? pageLength + " pages" : pageLength + " page";
    },
    setData(blockResults) {
      let nonPages = [];
      let pages = [];
      blockResults.forEach((block) => {
        if (this.blockSearchKey in block) {
          let totalReactionsCount = 0;

          if (block.emojiReactions && block.emojiReactions.length > 0) {
            let emojiReactions = block.emojiReactions;
            emojiReactions.forEach((reaction) => {
              let userCount =
                reaction.users && reaction.users.length > 0
                  ? reaction.users.length
                  : 1;
              totalReactionsCount = totalReactionsCount + userCount;
            });

            block = {
              ...block,
              ...{ totalReactionsCount: totalReactionsCount },
            };
          }

          nonPages.push(block);
        } else {
          pages.push(block);
        }
      });

      let filteredBlocks = nonPages;

      try {
        if (this.selectedEmojiReaction) {
          filteredBlocks = [];

          nonPages.forEach((block) => {
            if (!block.emojiReactions || block.emojiReactions.length == 0) {
              return;
            }

            let emojiReactions = block.emojiReactions;
            emojiReactions.forEach((reaction) => {
              if (
                reaction.emoji &&
                reaction.emoji.native &&
                reaction.emoji.native == this.selectedEmojiReaction
              ) {
                filteredBlocks.push(block);
              }
            });
          });
        }
      } catch (e) {
        filteredBlocks = nonPages;
        throw new Error("Cannot find reaction blocks");
      }

      this.nonPages = nonPages;
      this.updatePageCountString();
      this.blocksToDisplay = this.getSortedResults(filteredBlocks).slice(
        0,
        300
      );
    },
    getSortedResults(filteredBlocks) {
      let sortedResults = [];

      if (this.sortMode == 2) {
        sortedResults = filteredBlocks.slice().sort((a, b) => {
          return b["totalReactionsCount"] - a["totalReactionsCount"];
        });
      } else {
        sortedResults = filteredBlocks;
      }

      return sortedResults;
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
.text__highlight {
  background: #ffcc007a !important;
  border-radius: 3px !important;
  padding: 0.1em !important;
}
</style>
<style scoped>
.ras-page-title-span {
  color: #ec6f35 !important;
}

.ras-result-title-container {
  margin-bottom: 8px;
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

.ras-results-container,
#ras-recent-searches-container {
  height: 100%;
  overflow-y: scroll;
  width: 100%;
}

.ras-result:hover {
  background-color: #e8e8e8 !important;
}

.ras-result {
  cursor: pointer;
  background: white;
  padding: 10px 15px;
  border-top: 0px;
  width: 100%;
}

.ras-block-actions-container {
  display: flex;
  justify-content: flex-end;
}

.ras-block-action-item {
  margin-left: 10px;
}

.ras-show-pages-on-top-checkbox-container {
  padding-left: 15px;
  display: flex;
  margin-top: 4px;
}

label.ras-search-label {
  margin-left: 10px;
  font-size: 12px;
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

.ras-result-string > span {
  color: #868686 !important;
  overflow-x: scroll;
}

.ras-result-title {
  border: none;
  font-size: 14px !important;
  text-align: left;
  font-weight: 600;
  color: #ec6f35 !important;
}

.ras-tabs-container {
  display: flex;
  justify-content: center;
  background: #f7f7f7;
  height: 40px;
}

.ras-tabs-button {
  padding: 5px;
  cursor: pointer;
  color: #ababab !important;
}

.ras-emoji-bar-container {
  display: flex;
  flex-flow: column;
}
.ras-tabs-button:hover {
  color: #ef7f4b !important;
}

.ras-tab-active {
  color: #ec6f35 !important;
  font-weight: 500;
}

.ras-tab-active:hover {
  color: #ec6f35 !important;
}

.fade-enter-active {
  transition: opacity 0.8s;
}
.fade-enter /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
