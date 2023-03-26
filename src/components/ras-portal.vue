<template>
  <div class="ras-portal-main">
    <div class="ras-loading-indicator" v-if="loadingNewResults">
      <div class="ras-loading-new-results-spinner"></div>
    </div>
    <rasSearchScope @refresh-search-clicked="onRefreshSearchClicked" />
    <transition name="fade">
      <ras-hangman v-if="searchScope == -1" />
    </transition>
    <div
      v-if="searchScope != -1"
      class="ras-search-bar"
      v-bind:class="{ 'ras-search-bar-dim': loadingNewResults }"
    >
      <rasSearch
        :showAdvanceOptions="showAdvanceOptions"
        :loadingNewResults="loadingNewResults"
        :newDatesApplied="newDatesApplied"
        @advance-button-clicked="onAdvanceButtonClicked"
        @enter-pressed="onRefreshSearchClicked"
      >
      </rasSearch>
      <transition name="slide">
        <rasAdvanceSearch
          class="ras-advance-options"
          v-if="showAdvanceOptions"
          :loadingNewResults="loadingNewResults"
          @enter-pressed="onRefreshSearchClicked"
        >
        </rasAdvanceSearch>
      </transition>
    </div>
    <ras-search-scope-all-blocks
      v-if="searchScope == 0 || searchScope == 3"
      @refresh-search-called="onRefreshSearchClicked"
      @on-indicate-results-complete="onIndicateResultsComplete"
      :resultsListNewChangesUnseen="resultsListNewChangesUnseen"
      :showBlockSearchResults="showBlockSearchResults"
      :blockResults="blockResults"
      :pages="sortedPages"
      :searchResultCount="searchResultCount"
      :showIncludePagesCheckbox="showIncludePagesCheckbox"
      :resultPages="resultPages"
      :blockSearchKey="blockSearchKey"
      :unsortedResults="unsortedResults"
      :loadingNewResults="loadingNewResults"
      :allSortedBlocks="allSortedBlocks"
      :blockParentPageMap="blockParentPageMap"
      :linkedPagesUidSet="linkedPagesUidSet"
      :pageReferenceCountMap="pageReferenceCountMap"
    />
    <ras-search-scope-images
      v-if="searchScope == 1"
      @refresh-search-called="onRefreshSearchClicked"
      @on-indicate-results-complete="onIndicateResultsComplete"
      :showBlockSearchResults="showBlockSearchResults"
      :blockResults="blockResults"
      :searchResultCount="searchResultCount"
      :blockSearchKey="blockSearchKey"
      :resultsListNewChangesUnseen="resultsListNewChangesUnseen"
    />

    <ras-search-scope-tweets
      v-if="searchScope == 2"
      @refresh-search-called="onRefreshSearchClicked"
      @on-indicate-results-complete="onIndicateResultsComplete"
      :showBlockSearchResults="showBlockSearchResults"
      :blockResults="blockResults"
      :searchResultCount="searchResultCount"
      :blockSearchKey="blockSearchKey"
      :resultsListNewChangesUnseen="resultsListNewChangesUnseen"
    />
  </div>
</template>
<script>
import rasSearchScope from "./core/ras-search-scope.vue";
import rasSearch from "./core/ras-search.vue";
import rasAdvanceSearch from "./core/ras-advance-search.vue";

import utils from "../common/utils";
import roamAdapter from "../adapters/roamAdapter";
import dataRequestHelper from "../dataPreparation/dataRequestHelper";
import dataPreparation from "../dataPreparation/dataPreparation";
import roamPortalApi from "../api/roamPortalApi";

import rasSearchScopeAllBlocks from "./searchScope/ras-search-scope-all-blocks.vue";
import rasSearchScopeImages from "./searchScope/ras-search-scope-images.vue";
import rasSearchScopeTweets from "./searchScope/ras-search-scope-tweets.vue";
import rasHangman from "./hiddenPortal/ras-hangman.vue";

export default {
  name: "ras-search",
  components: {
    rasSearchScope,
    rasSearch,
    rasAdvanceSearch,
    rasSearchScopeAllBlocks,
    rasSearchScopeImages,
    rasSearchScopeTweets,
    rasHangman,
  },
  mixins: [
    utils,
    dataRequestHelper,
    dataPreparation,
    roamAdapter,
    roamPortalApi,
  ],
  data() {
    return {
      pageReferenceCountMap: {},
      resultPages: null,
      queryResponse: {},
      blockParentPageMap: {},
      showIncludePagesCheckbox: false,
      loadingNewResults: false,
      resultsListNewChangesUnseen: false,
      searchResultCount: 0,
      showAdvanceOptions: false,
      timeout: false,
      showBlockSearchResults: false,
      newDatesApplied: false,
      blockResults: [],
      allSortedBlocks: [],
      unsortedResults: [],
      sortedPages: [],
      fuseThreshold: 0.01,
      blockSearchKey: "fullString",
      linkedPagesUidSet: new Set(),
    };
  },
  computed: {
    totalConsecutiveSearchesWithNoResults: {
      get() {
        return this.$store.getters[
          "SearchConfig/totalConsecutiveSearchesWithNoResults"
        ];
      },
      set(value) {
        this.$store.commit(
          "SearchConfig/updateTotalConsecutiveSearchesWithNoResults",
          value
        );
      },
    },
    onlyIncludeBlocksWithReactions: {
      get() {
        return this.$store.getters[
          "SearchConfig/onlyIncludeBlocksWithReactions"
        ];
      },
      set(value) {
        this.$store.commit(
          "SearchConfig/updateOnlyIncludeBlocksWithReactions",
          value
        );
      },
    },
    tweetDisplayMode: {
      get() {
        return this.$store.getters["ViewConfig/tweetDisplayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateTweetDisplayMode", value);
      },
    },
    imageDisplayMode: {
      get() {
        return this.$store.getters["ViewConfig/imageDisplayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateImageDisplayMode", value);
      },
    },
    scopeUsedForRecentMostSearch: {
      get() {
        return this.$store.getters["SearchConfig/scopeUsedForRecentMostSearch"];
      },
      set(value) {
        this.$store.commit(
          "SearchConfig/updateScopeUsedForRecentMostSearch",
          value
        );
      },
    },
    searchRefreshPending: {
      get() {
        return this.$store.getters["SearchConfig/searchRefreshPending"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchRefreshPending", value);
      },
    },
    searchWithWaitingForUserInput: {
      get() {
        return this.$store.getters[
          "SearchConfig/searchWithWaitingForUserInput"
        ];
      },
      set(value) {
        this.$store.commit(
          "SearchConfig/updateSearchWithWaitingForUserInput",
          value
        );
      },
    },
    searchScope: {
      get() {
        return this.$store.getters["SearchConfig/searchScope"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchScope", value);
      },
    },
    blockUids: {
      get() {
        return this.$store.getters["SearchConfig/blockUids"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateBlockUids", value);
      },
    },
    linkedPage: {
      get() {
        return this.$store.getters["SearchConfig/linkedPage"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateLinkedPage", value);
      },
    },
    setDisplayModeAfterResults: {
      get() {
        return this.$store.getters["ViewConfig/setDisplayModeAfterResults"];
      },
      set(value) {
        this.$store.commit(
          "ViewConfig/updateSetDisplayModeAfterResults",
          value
        );
      },
    },
    displayMode: {
      get() {
        return this.$store.getters["ViewConfig/displayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateDisplayMode", value);
      },
    },
    endDateTimestamp: {
      get() {
        return this.$store.getters["SearchConfig/endDateTimestamp"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateEndDateTimestamp", value);
      },
    },
    startDateTimestamp: {
      get() {
        return this.$store.getters["SearchConfig/startDateTimestamp"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateStartDateTimestamp", value);
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
    fromQuery: {
      get() {
        return this.$store.getters["SearchConfig/fromQuery"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateFromQuery", value);
      },
    },
    toQuery: {
      get() {
        return this.$store.getters["SearchConfig/toQuery"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateToQuery", value);
      },
    },
    regularExpressionsEnabled: {
      get() {
        return this.$store.getters["SearchConfig/regularExpressionsEnabled"];
      },
    },
    matchExactPhrase: {
      get() {
        return this.$store.getters["SearchConfig/matchExactPhrase"];
      },
    },
    showCodeBlocks: {
      get() {
        return this.$store.getters["SearchConfig/showCodeBlocks"];
      },
    },
    includeReferenceBlocks: {
      get() {
        return this.$store.getters["SearchConfig/includeReferenceBlocks"];
      },
    },
    showResultsWithIncorrectSpelling: {
      get() {
        return this.$store.getters[
          "SearchConfig/showResultsWithIncorrectSpelling"
        ];
      },
    },
    mentionedPageTitle: {
      get() {
        return this.$store.getters["SearchConfig/mentionedPageTitle"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateMentionedPageTitle", value);
      },
    },
    referencedBlockUid: {
      get() {
        return this.$store.getters["SearchConfig/referencedBlockUid"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateReferencedBlockUid", value);
      },
    },
    pageTitle: {
      get() {
        return this.$store.getters["SearchConfig/pageTitle"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updatePageTitle", value);
      },
    },
    fullScreenMode: {
      get() {
        return this.$store.getters["ViewConfig/fullScreenMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateFullScreenMode", value);
      },
    },
    roamPortalDisplayed: {
      get() {
        return this.$store.getters["ViewConfig/roamPortalDisplayed"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateRoamPortalDisplayed", value);
      },
    },
    pageVisibilityHidden: {
      get() {
        return this.$store.getters["ViewConfig/pageVisibilityHidden"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updatePageVisibilityHidden", value);
      },
    },
  },
  mounted() {
    this.roamPortalApiInitialize();

    document.addEventListener("webkitvisibilitychange", () => {
      this.pageVisibilityHidden = document.hidden ? true : false;
    });

    document.addEventListener("webkitfullscreenchange", () => {
      this.fullScreenMode = document.fullscreenElement ? true : false;
    });
  },
  watch: {
    searchScope(value) {
      this.totalConsecutiveSearchesWithNoResults = 0;

      if (value != 3) {
        this.blockUids = null;
      }

      if (value == 1 || value == 2) {
        this.searchWithWaitingForUserInput = false;
        this.getResults();
      }
    },
    onlyIncludeBlocksWithReactions() {
      this.searchWithWaitingForUserInput = false;
      this.getResults();
    },
    showCodeBlocks() {
      this.searchInputUpdated();
    },
    regularExpressionsEnabled() {
      this.searchInputUpdated();
    },
    matchExactPhrase() {
      this.searchInputUpdated();
    },
    blockUids() {
      this.searchWithWaitingForUserInput = false;
      this.getResults();
    },
    includeReferenceBlocks(value) {
      if (value) {
        this.blockSearchKey = "fullString";
      } else {
        this.blockSearchKey = "string";
      }

      this.searchInputUpdated();
    },
    showResultsWithIncorrectSpelling(value) {
      if (value) {
        this.fuseThreshold = 0.24;
      } else {
        this.fuseThreshold = 0.01;
      }

      this.searchInputUpdated();
    },
    startDateTimestamp() {
      if (this.searchWithWaitingForUserInput) {
        window.setTimeout(() => {
          this.searchInputUpdated();
        }, 500);
      } else {
        this.searchInputUpdated();
      }
    },
    endDateTimestamp() {
      if (this.searchWithWaitingForUserInput) {
        window.setTimeout(() => {
          this.searchInputUpdated();
        }, 500);
      } else {
        this.searchInputUpdated();
      }
    },
    mentionedPageTitle() {
      this.searchInputUpdated();
    },
    linkedPage() {
      this.searchInputUpdated();
    },
    referencedBlockUid() {
      this.searchInputUpdated();
    },
    pageTitle() {
      this.searchInputUpdated();
    },
    searchQuery() {
      this.searchInputUpdated();
    },
    unsortedResults(results) {
      this.fullTextOfAllResults = "";
      let sortedBlocks = this.getSortedBlocks(results);

      this.sortedPages = sortedBlocks.pages;
      sortedBlocks = sortedBlocks.blocks;

      this.searchResultCount = sortedBlocks.length + this.sortedPages.length;

      if (this.searchResultCount == 0) {
        this.totalConsecutiveSearchesWithNoResults =
          this.totalConsecutiveSearchesWithNoResults + 1;
      } else {
        this.totalConsecutiveSearchesWithNoResults = 0;
      }

      if (!this.sortedPages || this.sortedPages.length == 0) {
        this.showIncludePagesCheckbox = false;
      } else {
        this.showIncludePagesCheckbox = true;
      }

      if (this.displayMode == -1) {
        this.displayMode = 0;
      }

      if (this.imageDisplayMode == -1) {
        this.imageDisplayMode = 0;
      }

      if (this.tweetDisplayMode == -1) {
        this.tweetDisplayMode = 0;
      }

      if (this.searchResultCount == 0) {
        this.displayMode = -1;
        this.imageDisplayMode = -1;
        this.tweetDisplayMode = -1;
      }

      this.resultsListNewChangesUnseen = false;
      if (
        (this.displayMode != 0 && this.searchScope == 0) ||
        (this.imageDisplayMode != 0 && this.searchScope == 1) ||
        (this.tweetDisplayMode != 0 && this.searchScope == 2)
      ) {
        this.resultsListNewChangesUnseen = true;
        window.setTimeout(() => {
          this.resultsListNewChangesUnseen = false;
        }, 500);
      }

      this.resultPages = this.getAllPagesTitles(results);
      this.allSortedBlocks = sortedBlocks.concat(this.sortedPages);

      let sortedBlockResults = sortedBlocks;

      sortedBlockResults.forEach((block) => {
        let timestamp = block["blockTime"];
        block["relativeTime"] = this.getRelativeTime(timestamp);
        block["absoluteTime"] =
          new Date(timestamp).toLocaleTimeString() +
          ", " +
          new Date(timestamp).toDateString();
      });

      this.blockResults = this.sortedPages.concat(sortedBlockResults);
      this.showBlockSearchResults = true;
      this.loadingNewResults = false;
      this.searchWithWaitingForUserInput = true;
      this.newDatesApplied = false;
      this.blockParentPageMap = {
        ...this.queryResponse.blockParentPageMap,
      };
      this.pageReferenceCountMap = this.queryResponse.pageReferenceCountMap;
      this.linkedPagesUidSet = this.queryResponse.linkedPagesUidSet;
      this.searchRefreshPending = false;

      if (
        this.searchScope == 0 &&
        this.setDisplayModeAfterResults &&
        results &&
        results.length > 0
      ) {
        this.displayMode = this.setDisplayModeAfterResults;
        this.setDisplayModeAfterResults = null;
      }
    },
  },
  methods: {
    searchInputUpdated() {
      if (!this.searchWithWaitingForUserInput) {
        this.getResults();
      } else {
        this.searchRefreshPending = true;
      }
    },
    onRefreshSearchClicked() {
      this.searchWithWaitingForUserInput = false;
      this.getResults();
    },
    onAdvanceButtonClicked() {
      this.showAdvanceOptions = !this.showAdvanceOptions;
    },
    filterResultsByQuery(
      nextWord,
      remainingWords,
      searchKeys,
      filteredSearchResults
    ) {
      let self = this;
      window.setTimeout(() => {
        self
          .$search(nextWord, filteredSearchResults, {
            distance: 10000000,
            ignoreLocation: true,
            threshold: self.fuseThreshold,
            keys: searchKeys,
            includeMatches: true,
          })
          .then((results) => {
            let filteredResults = self.processResults(
              results,
              self.showCodeBlocks,
              self.blockSearchKey
            );
            if (remainingWords.length == 0) {
              self.unsortedResults = filteredResults;
              return;
            }

            let nextWord = remainingWords[0];
            remainingWords.shift();
            self.filterResultsByQuery(
              nextWord,
              remainingWords,
              searchKeys,
              filteredResults
            );
          });
      }, 10);
    },
    allFieldsEmpty(self) {
      return (
        self.referencedBlockUid == "" &&
        self.mentionedPageTitle == "" &&
        self.pageTitle == "" &&
        self.startDateTimestamp == "" &&
        self.endDateTimestamp == "" &&
        self.linkedPage == "" &&
        self.searchQuery == "" &&
        self.blockUids == null
      );
    },
    resetToHomeView(self) {
      self.fullTextOfAllResults = "";
      self.searchResultCount = 0;
      self.resultPages = [];
      self.loadingNewResults = false;
      self.unsortedResults = [];
      self.imageDisplayMode = -1;
      self.tweetDisplayMode = -1;
      self.queryResponse = {};
      self.blockParentPageMap = {};
      self.linkedPagesUidSet = new Set();

      if (this.searchScope == 0) {
        this.displayMode = -1;
      }

      if (this.searchScope == 1) {
        this.imageDisplayMode = -1;
      }

      if (this.searchScope == 2) {
        this.tweetDisplayMode = -1;
      }
    },
    refreshWithNewResults(self) {
      if (self.allFieldsEmpty(self)) {
        self.resetToHomeView(self);

        return;
      }

      let searchResults = null;
      let searchQuery = self.searchQuery.trim().replace(/  +/g, " ");
      this.scopeUsedForRecentMostSearch = this.searchScope;
      this.blockParentPageMap = {};
      this.linkedPagesUidSet = new Set();
      this.queryResponse = this.fetchData({
        searchScope: self.searchScope,
        startDateTimestamp: self.startDateTimestamp,
        endDateTimestamp: self.endDateTimestamp,
        pageTitle: self.pageTitle,
        mentionedPageTitle: self.mentionedPageTitle,
        includeReferenceBlocks: self.includeReferenceBlocks,
        containsBlockRef: self.referencedBlockUid,
        searchString: searchQuery,
        regularExpressionsEnabled: self.regularExpressionsEnabled,
        matchExactPhrase: self.matchExactPhrase,
        showResultsWithIncorrectSpelling: self.showResultsWithIncorrectSpelling,
        onlyIncludeBlocksWithReactions: self.onlyIncludeBlocksWithReactions,
        blockUids: self.blockUids,
        linkedPage: self.linkedPage,
      });

      searchResults = this.queryResponse.blocks;

      if (searchQuery.length == 0 || self.regularExpressionsEnabled) {
        let results = [];
        searchResults.forEach((result) => {
          results.push({ item: result });
        });

        self.unsortedResults = self.processResults(
          results,
          self.showCodeBlocks,
          self.blockSearchKey,
          true
        );
        return;
      }

      let searchKeys =
        searchQuery.length <= 1
          ? ["pageTitle"]
          : [self.blockSearchKey, "pageTitle"];

      if (self.matchExactPhrase) {
        self.highlightKey = [searchQuery];
        self.filterResultsByQuery(searchQuery, [], searchKeys, searchResults);
      } else {
        let words = searchQuery.split(" ");
        let nextWord = words[0];
        words.shift();

        self.filterResultsByQuery(nextWord, words, searchKeys, searchResults);
      }
    },
    onIndicateResultsComplete() {
      this.resultsListNewChangesUnseen = false;
    },
    getResults() {
      let self = this;
      clearTimeout(this.timeout);
      let waitingTime = this.searchWithWaitingForUserInput == true ? 2000 : 100;

      if (!this.loadingNewResults) {
        this.loadingNewResults = true;
        waitingTime = 100;
      }

      this.timeout = window.setTimeout(() => {
        clearTimeout(this.timeout);
        self.loadingNewResults = true;

        window.setTimeout(() => {
          this.searchWithWaitingForUserInput = true;
          self.refreshWithNewResults(self);
        }, 0);
      }, waitingTime);
    },
  },
};
</script>
<style scoped>
.ras-portal-main {
  height: 100%;
  display: flex;
  flex-flow: column;
}

.ras-search-bar {
  flex-basis: auto;
  flex-grow: 0;
  flex-shrink: 0;
  padding: 10px;
  padding-top: 0px;
  padding-bottom: 0px;
  left: 50%;
  right: 50%;
  width: 100%;
  background: #f9f9f9;
}

.ras-search-bar-dim {
  opacity: 0.3;
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

.slide-enter-active {
  -moz-transition-duration: 0.6s;
  -webkit-transition-duration: 0.6s;
  -o-transition-duration: 0.6s;
  transition-duration: 0.6s;
  -moz-transition-timing-function: ease-in;
  -webkit-transition-timing-function: ease-in;
  -o-transition-timing-function: ease-in;
  transition-timing-function: ease-in;
}

.ras-loading-indicator {
  height: 0px;
}
.slide-leave-active {
  -moz-transition-duration: 0.3s;
  -webkit-transition-duration: 0.3s;
  -o-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -moz-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -webkit-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -o-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}

.slide-enter-to,
.slide-leave {
  max-height: 400px;
  overflow: hidden;
}

.slide-enter,
.slide-leave-to {
  overflow: hidden;
  max-height: 0;
}

.fade-enter-active {
  transition: opacity 0.8s;
}
.fade-enter {
  opacity: 0;
}
</style>
