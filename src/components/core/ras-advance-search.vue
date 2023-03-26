<template>
  <div>
    <div class="ras-advance-options-row">
      <div class="ras-reference-controller">
        <div class="ras-reference-container">
          <input
            @keyup.enter="onEnterPressed()"
            :disabled="loadingNewResults"
            type="text"
            spellcheck="false"
            autocomplete="off"
            class="ras-advance-search-text-box"
            v-model="pageTitle"
            placeholder="Search inside page"
          />
        </div>
        <div class="ras-reference-container">
          <input
            @keyup.enter="onEnterPressed()"
            :disabled="loadingNewResults"
            type="text"
            spellcheck="false"
            autocomplete="off"
            class="ras-advance-search-text-box"
            v-model="mentionedPageTitle"
            placeholder="Mentions of page"
          />
        </div>
        <div class="ras-reference-container">
          <input
            @keyup.enter="onEnterPressed()"
            :disabled="loadingNewResults"
            type="text"
            spellcheck="false"
            autocomplete="off"
            class="ras-advance-search-text-box"
            v-model="referencedBlockUid"
            placeholder="Blocks with ((block-ref))"
          />
        </div>
      </div>
    </div>
    <div class="ras-advance-options-row">
      <input
        :disabled="loadingNewResults"
        type="checkbox"
        id="ras-include-reference-blocks-checkbox"
        v-model="includeReferenceBlocks"
      />
      <label
        class="ras-search-label"
        for="ras-include-reference-blocks-checkbox"
        >Include all references and embeds of your search term</label
      >
    </div>
    <div class="ras-advance-options-row">
      <input
        :disabled="loadingNewResults"
        type="checkbox"
        id="ras-show-results-with-incorrect-spellings"
        v-model="showResultsWithIncorrectSpelling"
      />
      <label
        class="ras-search-label"
        for="ras-show-results-with-incorrect-spellings"
        >Include similar spellings (searching for "calendar" will also search
        "calender")</label
      >
    </div>
    <div class="ras-advance-options-row">
      <input
        :disabled="loadingNewResults"
        type="checkbox"
        id="ras-show-code-blocks"
        v-model="showCodeBlocks"
      />
      <label class="ras-search-label" for="ras-show-code-blocks"
        >Include results from code blocks (eg: roam/js, roam/css or
        :hiccup)</label
      >
    </div>
    <div class="ras-advance-options-row">
      <input
        :disabled="loadingNewResults"
        type="checkbox"
        id="ras-match-exact-phrase"
        v-model="matchExactPhrase"
      />
      <label class="ras-search-label" for="ras-match-exact-phrase"
        >Match exact phrase</label
      >
    </div>
    <div class="ras-advance-options-row">
      <input
        :disabled="loadingNewResults"
        type="checkbox"
        id="ras-regular-expressions-enabled"
        v-model="regularExpressionsEnabled"
      />
      <label class="ras-search-label" for="ras-regular-expressions-enabled"
        >Enable regular expressions
        <a
          class="ras-regex-tutorial-link"
          href="https://distroharvix.medium.com/part-9-a-complete-beginners-guide-to-computer-programming-with-clojure-regular-expressions-29a7d18730a9"
          target="_black"
          >(?)</a
        ></label
      >
    </div>
  </div>
</template>
<script>
export default {
  name: "ras-advance-search",
  props: {
    loadingNewResults: Boolean,
  },
  methods: {
    onEnterPressed() {
      this.$emit("enter-pressed");
    },
  },
  computed: {
    referencedBlockUid: {
      get() {
        return this.$store.getters["SearchConfig/referencedBlockUid"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateReferencedBlockUid", value);
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
    pageTitle: {
      get() {
        return this.$store.getters["SearchConfig/pageTitle"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updatePageTitle", value);
      },
    },
    matchExactPhrase: {
      get() {
        return this.$store.getters["SearchConfig/matchExactPhrase"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateMatchExactPhrase", value);
      },
    },
    regularExpressionsEnabled: {
      get() {
        return this.$store.getters["SearchConfig/regularExpressionsEnabled"];
      },
      set(value) {
        this.$store.commit(
          "SearchConfig/updateRegularExpressionsEnabled",
          value
        );
      },
    },
    showCodeBlocks: {
      get() {
        return this.$store.getters["SearchConfig/showCodeBlocks"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateShowCodeBlocks", value);
      },
    },
    includeReferenceBlocks: {
      get() {
        return this.$store.getters["SearchConfig/includeReferenceBlocks"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateIncludeReferenceBlocks", value);
      },
    },
    showResultsWithIncorrectSpelling: {
      get() {
        return this.$store.getters[
          "SearchConfig/showResultsWithIncorrectSpelling"
        ];
      },
      set(value) {
        this.$store.commit(
          "SearchConfig/updateShowResultsWithIncorrectSpelling",
          value
        );
      },
    },
  },
};
</script>
<style scoped>
.ras-reference-container {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
}

.ras-reference-controller {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
}

.ras-advance-options-row {
  border: none;
  padding-top: 10px;
  display: flex;
}

.ras-advance-search-text-box {
  font-size: 19px !important;
  font-family: Inter, sans-serif !important;
  width: 95%;
  border-top: none;
  border-left: none;
  border-right: none;
  outline: none;
  font-style: italic;
  background-color: white;
  font-weight: 200;
  color: #485f6f !important;
  background: transparent;
  border-bottom: 1px solid;
}

.ras-regex-tutorial-link {
  font-size: 14px !important;
  color: #d641af !important;
  font-weight: 500;
}

.ras-advance-search-text-box::placeholder {
  color: #cfcfcf !important;
}

.ras-search-label {
  max-width: 100%;
  margin-bottom: 5px;
  font-weight: 400;
  margin-left: 10px;
  color: #868686 !important;
  font-size: 14px !important;
}
</style>
