<template>
  <div>
    <div v-if="searchScope == 1">
      <div class="ras-home-section ras-home-section-main-search-button">
        <div
          class="ras-home-header ras-section-label ras-home-section-main-search-button-heading"
          v-on:click="onShowAllResults()"
        >
          Show all images
        </div>
      </div>
      <div class="ras-home-section ras-default-searches-container">
        <div
          v-bind:key="idx"
          class="ras-saved-block-container"
          v-for="(item, idx) in defaultImageBlocks"
        >
          <div
            class="ras-saved-block-text"
            v-on:click="onSearchItemClicked($event, item)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="searchScope == 2">
      <div class="ras-home-section ras-home-section-main-search-button">
        <div
          class="ras-home-header ras-section-label ras-home-section-main-search-button-heading"
          v-on:click="onShowAllResults()"
        >
          Show all tweets
        </div>
      </div>
      <div class="ras-home-section ras-default-searches-container">
        <div
          v-bind:key="idx"
          class="ras-saved-block-container"
          v-for="(item, idx) in defaultTweetBlocks"
        >
          <div
            class="ras-saved-block-text"
            v-on:click="onSearchItemClicked($event, item)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="searchScope == 0">
      <div class="ras-home-section ras-home-section-main-search-button">
        <div
          class="ras-home-header ras-section-label ras-home-section-main-search-button-heading"
          v-on:click="onVisualize3DClicked()"
        >
          Visualize Graph
        </div>
      </div>
      <div class="ras-home-section ras-default-searches-container">
        <div
          v-bind:key="idx"
          class="ras-saved-block-container"
          v-for="(item, idx) in defaultBlocks"
        >
          <div
            class="ras-saved-block-text"
            v-on:click="onSearchItemClicked($event, item)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      <div class="ras-home-section ras-saved-searches-container">
        <div class="ras-home-favorites-list-instructions">
          <div
            class="ras-home-header ras-section-label"
            v-bind:class="{ 'ras-view-searches-button': !viewSavedSearches }"
            v-on:click="onRefreshSavedSearchesClicked($event, item)"
          >
            {{ savedSearchesLabel }}
          </div>
          <button
            title="Refresh list"
            class="ras-refresh-saved-search-button"
            v-on:click="onRefreshSavedSearchesClicked($event, item)"
          >
            ⟳
          </button>
        </div>
        <div v-if="viewSavedSearches">
          <div
            v-bind:key="idx"
            class="ras-saved-block-container"
            v-for="(item, idx) in savedBlocks"
          >
            <div
              class="ras-saved-block-text"
              v-on:click="onSearchItemClicked($event, item)"
            >
              {{ item.text }}
            </div>
            <div class="ras-result-time" v-if="item.relativeTime">
              <span
                :title="
                  'Last edited: ' +
                  item.absoluteTime +
                  ' (click to show all other blocks edited on this day)'
                "
                class="ras-result-date"
                v-on:click="onDateClicked($event, item)"
              >
                {{ item.relativeTime }}
              </span>
            </div>
          </div>
          <div
            class="ras-home-favorites-list-instructions ras-home-sub-instruction"
          >
            Add <mark>[[RoamPortal-Search]]</mark> in your blocks to add to this
            list.
          </div>
        </div>
      </div>
      <div class="ras-home-section ras-home-section-tips">
        <div class="ras-home-favorites-list-instructions">
          <div class="ras-home-header ras-section-label">Tips</div>
          <div class="ras-last-update-date-text">
            Last Updated on 26th March, 2023
          </div>
        </div>
        <div
          class="ras-home-favorites-list-instructions ras-home-sub-instruction"
        >
          1. Create a keyboard shortcut from Roam Settings → Hotkeys panel.
        </div>
        <div
          class="ras-home-favorites-list-instructions ras-home-sub-instruction"
        >
          2. This extension works on all Roam databases that you can access.
        </div>
        <div
          class="ras-home-favorites-list-instructions ras-home-sub-instruction"
        >
          3. Click inside the graphs to filter your search. Shift click to open in sidebar.
        </div>
        <div
          class="ras-home-favorites-list-instructions ras-home-sub-instruction"
        >
          4. If you face any problems, or
          have suggestions, please contact me by
          <a href="mailto:dharam@hey.com">email</a> or on
          <a href="https://twitter.com/DharamKapila" target="_blank">Twitter</a>.
        </div>
        <div
          class="ras-home-favorites-list-instructions ras-home-sub-instruction"
        >
          5. Thank you so much trying this extension :) If you wish to support me, 
          please consider buying me a coffee:
          <a href="https://buymeacoffee.com/dharam">https://buymeacoffee.com/dharam</a> 💕
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import utils from "../../common/utils";
import roamAdapter from "../../adapters/roamAdapter";

export default {
  name: "ras-report-usage",
  data() {
    return {
      viewSavedSearches: false,
      savedBlocks: [],
      defaultBlocks: [],
      defaultImageBlocks: [],
      defaultTweetBlocks: [],
      recentlyEditedBlocks: [],
      savedBlocksDefaultPage: "RoamPortal-Search",
      savedSearchesLabel: "View Saved Searches",
    };
  },
  mixins: [utils, roamAdapter],
  computed: {
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
    displayMode: {
      get() {
        return this.$store.getters["ViewConfig/displayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateDisplayMode", value);
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
    linkedPage: {
      get() {
        return this.$store.getters["SearchConfig/linkedPage"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateLinkedPage", value);
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
    },
    searchScope: {
      get() {
        return this.$store.getters["SearchConfig/searchScope"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchScope", value);
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
    blockUids: {
      get() {
        return this.$store.getters["SearchConfig/blockUids"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateBlockUids", value);
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
  },
  mounted() {
    this.updateHomeView();
  },
  methods: {
    resetAllFields() {
      this.searchQuery = "";
      this.pageTitle = "";
      this.mentionedPageTitle = "";
      this.fromQuery = "";
      this.toQuery = "";
      this.referencedBlockUid = "";
      this.linkedPage = "";
      this.blockUids = null;
    },
    onSavedSearchClicked(item) {
      this.setDisplayModeAfterResults = 0;
      this.resetAllFields();
      this.searchWithWaitingForUserInput = false;
      this.onlyIncludeBlocksWithReactions = false;

      if ("onlyIncludeBlocksWithReactions" in item) {
        this.onlyIncludeBlocksWithReactions =
          item.onlyIncludeBlocksWithReactions;
      }

      if ("searchScope" in item) {
        this.searchScope = item.searchScope;
      }
      if ("tweetDisplayMode" in item) {
        this.tweetDisplayMode = item.tweetDisplayMode;
      }

      if ("displayMode" in item) {
        this.setDisplayModeAfterResults = item.displayMode;
      }
      if ("linkedPage" in item) {
        this.linkedPage = item.linkedPage;
      }

      if ("pageName" in item) {
        this.pageTitle = item.pageName;
      }
      if ("mentionedPageTitle" in item) {
        this.mentionedPageTitle = item.mentionedPageTitle;
      }
      if ("from" in item) {
        this.fromQuery = item.from;
      }
      if ("to" in item) {
        this.toQuery = item.to;
      }
      if ("from" in item || "to" in item) {
        this.newDatesApplied = true;
      }
      if ("query" in item) {
        this.searchQuery = item.query;
      }

      this.$emit("refresh-search-called");
    },
    onDateClicked($event, item) {
      let date = new Date(item.time);
      let start = new Date(date).setHours(0, 0, 0);
      let startDate = new Date(start);

      let till = startDate.setDate(new Date(start).getDate() + 1);
      let fromQuery = new Date(start)
        .toDateString()
        .split(" ")
        .slice(1)
        .join(" ");
      let toQuery = new Date(till).toDateString().split(" ").slice(1).join(" ");

      this.searchWithWaitingForUserInput = false;
      this.fromQuery = fromQuery;
      this.toQuery = toQuery;
    },
    getDefaultSavedTweetBlocks() {
      let clearSearch = { text: "Clear search" };

      let frequentUsernames = {
        text: "Most frequent usernames mentioned last year",
        tweetDisplayMode: 1,
        from: "1 January, 2020",
        to: "31 December 2020, 11:59pm",
      };

      let recent = { text: "Recently added tweets", from: "2 week ago" };

      let lastYear = {
        text: "Tweets from this year",
        from: "1 January, 2021",
      };

      let thisYear = {
        text: "Tweets from last year",
        from: "1 January, 2020",
        to: "31 December 2020, 11:59pm",
      };

      return [clearSearch, frequentUsernames, recent, lastYear, thisYear];
    },
    getDefaultSavedImageBlocks() {
      let clearSearch = { text: "Clear search" };

      let recentImagesWeek = {
        text: "Recently edited image blocks",
        from: "2 week ago",
      };

      let todoImages = {
        text: "Images in block paths mentioning TODO",
        linkedPage: "TODO",
      };

      let doneImages = {
        text: "Images in block paths mentioning DONE",
        linkedPage: "DONE",
      };
      return [clearSearch, recentImagesWeek, todoImages, doneImages];
    },
    getDefaultSavedBlocks() {
      let clearSearch = { text: "Clear search" };

      let reactionBlocks = {
        text: "Show blocks which contain reactions (from you and others)",
        onlyIncludeBlocksWithReactions: true,
        from: "2 years ago",
      };

      let referenceSearch = {
        text: "Recent pages and blocks used as reference",
        displayMode: 4,
        from: "1 month ago",
      };

      let recentlyEditedBlock = {
        from: "3 days ago",
        text: "Recently edited",
      };

      let todaysPageName = this.getTodaysDateRoamFormat();

      let recentEditsToTodaysDailyNoteBlock = {
        text: "Recently edited in today's page: " + todaysPageName,
        pageName: todaysPageName,
      };

      let frequentPagesInLastWeekBlock = {
        from: "1 week ago",
        displayMode: 2,
        text: "Frequently edited pages last week",
      };

      let frequentWordsUsedLastWeekBlock = {
        from: "1 Month ago",
        text: "Frequent words used over the last month",
        displayMode: 3,
      };

      let doneTasksOverLastWeekBlock = {
        from: "1 week ago",
        text: "Recently completed tasks",
        mentionedPageTitle: "DONE",
      };

      return [
        clearSearch,
        recentlyEditedBlock,
        reactionBlocks,
        doneTasksOverLastWeekBlock,
        referenceSearch,
        recentEditsToTodaysDailyNoteBlock,
        frequentPagesInLastWeekBlock,
        frequentWordsUsedLastWeekBlock,
      ];
    },
    onRefreshSavedSearchesClicked() {
      this.viewSavedSearches = true;
      this.savedSearchesLabel = "Saved Searches";
      this.updateHomeView();
    },
    onShowAllResults() {
      let item = {
        from: "Jan 1, 2018",
      };

      this.onSavedSearchClicked(item);
    },
    onVisualize3DClicked() {
      let item = {
        displayMode: 5,
        from: "1 month ago",
      };

      this.onSavedSearchClicked(item);
    },
    updateHomeView() {
      let savedBlocksFromRoam = this.fetchBlocksMentioningPage(
        this.savedBlocksDefaultPage
      );

      this.savedBlocks = [];
      let tempResult = [];

      savedBlocksFromRoam.forEach((savedBlock) => {
        let block = savedBlock[0];
        let timestamp = block["time"];
        let relativeTime = this.getRelativeTime(timestamp);
        let absoluteTime =
          new Date(timestamp).toLocaleTimeString() +
          ", " +
          new Date(timestamp).toDateString();

        if ("string" in block) {
          let blockString = block["string"];

          blockString = blockString.replaceAll(
            "[[" + this.savedBlocksDefaultPage + "]]",
            ""
          );
          blockString = blockString.replaceAll(
            "#[[" + this.savedBlocksDefaultPage + "]]",
            ""
          );
          blockString = blockString.replaceAll(
            "#" + this.savedBlocksDefaultPage + "",
            ""
          );

          tempResult.push({
            text: blockString,
            query: blockString,
            useTextAsQuery: true,
            relativeTime: relativeTime,
            absoluteTime: absoluteTime,
            time: timestamp,
          });
        }
      });

      if (tempResult.length > 0) {
        this.savedBlocks = tempResult
          .slice()
          .sort((a, b) => {
            if (a["time"] > b["time"]) {
              return -1;
            } else if (b["time"] > a["time"]) {
              return 1;
            }

            return 0;
          })
          .slice(0, 1000);
      }

      this.defaultBlocks = this.getDefaultSavedBlocks();
      this.defaultImageBlocks = this.getDefaultSavedImageBlocks();
      this.defaultTweetBlocks = this.getDefaultSavedTweetBlocks();
    },
    onSearchItemClicked(_, item) {
      this.onSavedSearchClicked(item);
    },
  },
};
</script>
<style scoped>
.ras-home-header {
  padding-bottom: 5px;
  margin-top: 0px;
  margin-bottom: 0px;
  margin-left: 10px;
  color: black !important;
  margin-left: 0px;
  font-size: 20px !important;
}

.ras-saved-block-container:hover {
  background-color: #e8e8e8 !important;
}

.ras-home-section-main-search-button-heading {
  color: grey !important;
  padding-left: 10px;
}

.ras-home-section-main-search-button-heading:hover {
  cursor: pointer;
  color: #ca124c !important;
}

.ras-home-favorites-list-instructions {
  color: grey !important;
  border-top: 1px solid grey;
  padding-top: 10px;
  padding-left: 10px;
  margin-bottom: 5px;
}

.ras-refresh-saved-search-button:hover {
  opacity: 1;
}

.ras-refresh-saved-search-button,
.ras-refresh-saved-search-button:focus {
  float: right;
  border: 0px;
  background: white;
  font-size: 20px !important;
  opacity: 0.5;
  margin-top: 3px;
  outline: none;
}

.ras-saved-block-container {
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;
}

.ras-saved-block-text {
  border: none;
  font-size: 17px !important;
  text-align: left;
  font-weight: 400;
  color: #ec6f35 !important;
}

.ras-result-time {
  text-align: right;
}

.ras-section-label {
  color: #33bdea !important;
}

.ras-last-update-date-text {
  float: right;
  color: grey !important;
  margin-right: 10px;
  position: relative;
  font-size: 12px !important;
  margin-top: 8px;
  text-align: center;
}

.ras-result-date {
  color: #33bdea !important;
  padding-right: 15px;
}

.ras-result-date:hover {
  color: #ca124c !important;
  cursor: pointer;
}

.ras-view-searches-button {
  color: #33bdea !important;
}

.ras-home-section-main-search-button {
  padding-bottom: 5px;
  border-bottom: 1px solid;
  margin-bottom: 0px;
  margin-top: 10px;
}

.ras-view-searches-button:hover {
  cursor: pointer;
  color: #ca124c !important;
}

.ras-saved-searches-container {
  margin-bottom: 0px;
}

.ras-saved-block-text:hover {
  cursor: pointer;
}

.ras-home-section-tips {
  margin-bottom: 10px;
}
.ras-home-sub-instruction {
  border-top: none;
  padding-top: 2px;
  margin-right: 2px;
  margin-left: 2px;
}

.ras-home-header {
  font-weight: 250;
  font-size: 25px !important;
  display: inline-block;
}
</style>
