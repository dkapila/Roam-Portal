<template>
  <div>
    <div class="ras-input-search-controller">
      <div class="ras-input-search-container ras-input-search-query-container">
        <div v-if="searchScope == 2" class="ras-twitter-at-sign">@</div>
        <input
          :disabled="loadingNewResults"
          type="text"
          spellcheck="false"
          autocomplete="off"
          class="ras-query-text-box ras-text-box-left"
          id="ras-query-box"
          v-model="searchQuery"
          @keyup.enter="onEnterPressed()"
          :placeholder="searchQueryPlaceholder"
        />
      </div>
      <div
        class="ras-input-search-container"
        v-bind:class="{
          'ras-new-search-query-applied': newLinkedPageApplied,
        }"
      >
        <input
          ref="linkedPageRef"
          @keyup.enter="onEnterPressed()"
          :disabled="loadingNewResults"
          type="text"
          spellcheck="false"
          autocomplete="off"
          class="ras-query-text-box"
          v-model="linkedPage"
          :placeholder="linkedPagePlaceholder"
          v-bind:class="{
            'ras-linked-page-globe-input': searchScope == 0 && displayMode == 6,
          }"
        />
      </div>
      <i
        v-bind:class="{
          'ras-up-arrow': showAdvanceOptions,
          'ras-down-arrow': !showAdvanceOptions,
        }"
        v-on:click="onAdvanceButtonClicked()"
      ></i>
    </div>
    <div
      class="ras-input-controller"
      v-bind:class="{ 'ras-new-dates-applied': newDatesApplied }"
    >
      <div class="ras-input-container ras-input-start-date-container">
        <input
          @keyup.enter="onEnterPressed()"
          :disabled="loadingNewResults"
          type="text"
          spellcheck="false"
          autocomplete="off"
          class="ras-date-text-box ras-text-box-left"
          v-model="fromQuery"
          placeholder="from (eg: 3 weeks ago)"
        />
        <div class="ras-date-formatted">
          <b>From:</b>{{ startDateFormatted }}
        </div>
      </div>
      <div class="ras-input-container">
        <input
          @keyup.enter="onEnterPressed()"
          :disabled="loadingNewResults"
          type="text"
          spellcheck="false"
          autocomplete="off"
          class="ras-date-text-box ras-text-box-to"
          v-model="toQuery"
          placeholder="till (eg: Today at 3pm)"
        />
        <div class="ras-date-formatted"><b>Till:</b>{{ endDateFormatted }}</div>
      </div>
    </div>
    <div class="ras-page-filters">
      <div class="ras-in-page-name" v-if="localLinkedPage.length > 0">
        <span v-on:click="onLinkedPageClicked()"
          ><b
            >In page, and across block paths which mention page:&nbsp;</b
          ></span
        >
        <span v-on:click="onLinkedPageClicked()" class="ras-in-page-label">{{
          localLinkedPage
        }}</span>
        <span
          class="ras-clear-page-title"
          v-on:click="clearLinkedPage()"
        ></span>
      </div>

      <div class="ras-in-page-name" v-if="localPageTitle.length > 0">
        <span v-on:click="onAdvanceButtonClicked()"><b>In Page:&nbsp;</b></span>
        <span v-on:click="onAdvanceButtonClicked()" class="ras-in-page-label">{{
          localPageTitle
        }}</span>
        <span class="ras-clear-page-title" v-on:click="clearPageTitle()"></span>
      </div>
      <div class="ras-in-page-name" v-if="localMentionedPageTitle.length > 0">
        <span v-on:click="onAdvanceButtonClicked()"
          ><b>Mentioned Page:&nbsp;</b></span
        >
        <span v-on:click="onAdvanceButtonClicked()" class="ras-in-page-label">{{
          localMentionedPageTitle
        }}</span>
        <span
          class="ras-clear-page-title"
          v-on:click="clearMentionedPageTitle()"
        ></span>
      </div>
      <div class="ras-in-page-name" v-if="localReferencedBlockUid.length > 0">
        <span v-on:click="onAdvanceButtonClicked()"
          ><b>Contains Reference:&nbsp;</b></span
        >
        <span v-on:click="onAdvanceButtonClicked()" class="ras-in-page-label">{{
          localReferencedBlockUid
        }}</span>
        <span
          class="ras-clear-page-title"
          v-on:click="clearMentionedBlockRef()"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
import utils from "../../common/utils";

export default {
  name: "ras-search",
  props: {
    loadingNewResults: Boolean,
    showAdvanceOptions: Boolean,
    newDatesApplied: Boolean,
    newLinkedPageApplied: Boolean,
  },
  mixins: [utils],
  data() {
    return {
      linkedPagePlaceholder: "Linked page",
      startDateFormatted: "",
      endDateFormatted: "",
      linkedPageLabel: "",
      mentionedPageTitleLabel: "",
      pageTitleLabel: "",
      searchQueryPlaceholder: "Search...",
      localPageTitle: "",
      localLinkedPage: "",
      localMentionedPageTitle: "",
      localReferencedBlockUid: "",
    };
  },
  mounted() {
    this.setPlaceholderText();
    this.setPageFilters();
  },
  watch: {
    regularExpressionsEnabled() {
      this.setPlaceholderText();
    },
    searchScope() {
      this.setPlaceholderText();
    },
    displayMode() {
      this.setPlaceholderText();
    },
    linkedPage() {
      this.localLinkedPage =
        this.linkedPage.length > 20
          ? this.linkedPage.substr(0, 20) + "..."
          : this.linkedPage;
    },
    mentionedPageTitle() {
      this.localMentionedPageTitle =
        this.mentionedPageTitle.length > 20
          ? this.mentionedPageTitle.substr(0, 20) + "..."
          : this.mentionedPageTitle;
    },
    pageTitle() {
      this.localPageTitle =
        this.pageTitle.length > 20
          ? this.pageTitle.substr(0, 20) + "..."
          : this.pageTitle;
    },
    referencedBlockUid() {
      this.localReferencedBlockUid = this.referencedBlockUid;
    },
    fromQuery(value) {
      let enteredDate = window.ChronoNode.parseDate(value);

      if (enteredDate == null) {
        this.startDateTimestamp = "";
        this.startDateFormatted = " The beginning";
      } else {
        this.startDateTimestamp = enteredDate.valueOf();
        this.startDateFormatted = this.getFormattedDate(enteredDate);
      }
    },
    toQuery(value) {
      let enteredDate = window.ChronoNode.parseDate(value);

      if (enteredDate == null) {
        this.endDateTimestamp = "";
        this.endDateFormatted = " The beginning";
      } else {
        this.endDateTimestamp = enteredDate.valueOf();
        this.endDateFormatted = this.getFormattedDate(enteredDate);
      }
    },
  },
  methods: {
    setPageFilters() {
      this.localPageTitle = this.pageTitle;
      this.localLinkedPage = this.linkedPage;
      this.localReferencedBlockUid = this.referencedBlockUid;
      this.localMentionedPageTitle = this.mentionedPageTitle;
    },
    setPlaceholderText() {
      if (this.searchScope == 2) {
        this.searchQueryPlaceholder = this.regularExpressionsEnabled
          ? "Regex search..."
          : "username/";
      } else {
        this.searchQueryPlaceholder = this.regularExpressionsEnabled
          ? "Regex search..."
          : "Search...";
      }

      if (this.displayMode == 6) {
        this.linkedPagePlaceholder = "Location tag/attribute";
      } else {
        this.linkedPagePlaceholder = "Linked page";
      }
    },
    onEnterPressed() {
      this.$emit("enter-pressed");
    },
    onLinkedPageClicked() {
      this.$refs.linkedPageRef.select();
    },
    onAdvanceButtonClicked() {
      this.$emit("advance-button-clicked");
    },
    clearLinkedPage() {
      this.searchWithWaitingForUserInput = false;
      this.linkedPage = "";
    },
    clearPageTitle() {
      this.searchWithWaitingForUserInput = false;
      this.pageTitle = "";
    },
    clearMentionedPageTitle() {
      this.searchWithWaitingForUserInput = false;
      this.mentionedPageTitle = "";
    },
    clearMentionedBlockRef() {
      this.searchWithWaitingForUserInput = false;
      this.referencedBlockUid = "";
    },
  },
  computed: {
    regularExpressionsEnabled: {
      get() {
        return this.$store.getters["SearchConfig/regularExpressionsEnabled"];
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
    linkedPage: {
      get() {
        return this.$store.getters["SearchConfig/linkedPage"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateLinkedPage", value);
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
    },
    pageTitle: {
      get() {
        return this.$store.getters["SearchConfig/pageTitle"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updatePageTitle", value);
      },
    },
  },
};
</script>
<style scoped>
.ras-in-page-name {
  cursor: pointer;
  margin-right: 30px;
}

.ras-clear-page-title {
  position: absolute;
  width: 32px;
  height: 32px;
  opacity: 0.3;
}

.ras-clear-page-title:hover {
  opacity: 1;
}

.ras-page-filters {
  display: flex;
  margin-bottom: 5px;
  margin-top: 2px;
}

.ras-clear-page-title:before,
.ras-clear-page-title:after {
  position: absolute;
  left: 10px;
  top: 6px;
  content: " ";
  height: 10px;
  width: 2px;
  background-color: #333;
}

.ras-clear-page-title:before {
  transform: rotate(45deg);
}

.ras-clear-page-title:after {
  transform: rotate(-45deg);
}

.ras-top-search-bar {
  display: flex;
}

.ras-input-container {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
}

.ras-input-search-container {
  display: flex;
  flex-basis: 100%;
  flex: 1;
}

.ras-new-dates-applied > .ras-input-container > .ras-date-text-box {
  color: #ca124c !important;
  font-weight: 400;
}

.ras-new-search-query-applied > .ras-query-text-box {
  color: var(--background-shadow-color) !important;
  font-weight: 400;
}

.ras-input-controller {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 5px;
}

.ras-input-search-controller {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
}

.ras-in-page-label {
  color: #ea1d1d !important;
  font-size: 20px !important;
}

.ras-date-formatted {
  font-size: 12px !important;
  margin-top: 5px;
  color: black !important;
  display: flex;
  gap: 5px;
}

.ras-up-arrow {
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  position: absolute;
  top: 8px;
  right: 20px;
  height: 10px;
  width: 10px;

  transform: rotate(225deg);
  -webkit-transform: rotate(225deg);

  transition: transform 550ms ease;
  cursor: pointer;
  top: 35px;
}

.ras-down-arrow {
  border: solid black;
  border-width: 0 3px 3px 0;
  position: absolute;
  right: 20px;
  height: 10px;
  width: 10px;
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  transition: transform 550ms ease;
  cursor: pointer;
}

.ras-date-text-box::placeholder {
  color: #cfcfcf !important;
}

.ras-twitter-at-sign {
  font-size: 22px !important;
  padding: 0 4px 0 5px;
  color: #1da1f2 !important;
  border-bottom: 1px solid #ababab;
}

.ras-date-text-box,
.ras-date-text-box:focus {
  font-size: 18px !important;
  font-family: Inter, sans-serif !important;
  width: 100%;
  border-top: none;
  border-left: none;
  border-right: none;
  outline: none;
  font-style: italic;
  background-color: transparent;
  font-weight: 200;
  color: #485f6f !important;
  border-bottom: 1px solid #ababab;
}

.ras-date-text-box,
.ras-date-text-box {
  border-bottom: 1px solid #ababab;
}

.ras-query-text-box::placeholder {
  color: var(--background-shadow-color) !important;
  opacity: 0.5;
}

.ras-linked-page-globe-input::placeholder {
  color: #ec6f3585 !important;
}

.ras-query-text-box,
.ras-query-text-box:focus {
  font-size: 20px !important;
  font-family: Inter, sans-serif !important;
  border-top: none;
  border-right: none;
  border-left: none;
  outline: none;
  font-style: italic;
  font-weight: 300;
  color: var(--background-shadow-color) !important;
  background: transparent;
  width: 100%;
  border-bottom: 1px solid #ababab;
}

.ras-input-search-query-container,
.ras-input-start-date-container {
  margin-right: 10px;
}
</style>
