<template>
  <div class="ras-search-scope-container">
    <div
      class="ras-search-scope-picker-container"
    >
      <div class="ras-search-scope-picker">
        <span
          v-bind:class="{ 'ras-active-scope': localScope == 0 }"
          class="ras-search-scope-item ras-search-scope-all-blocks"
          @click="onScopeSelected(0)"
        >
          All blocks
        </span>
        <span
          v-bind:class="{ 'ras-active-scope': localScope == 1 }"
          class="ras-search-scope-item ras-search-scope-images"
          @click="onScopeSelected(1)"
        >
          Images
        </span>
        <span
          v-bind:class="{ 'ras-active-scope': localScope == 2 }"
          class="ras-search-scope-item ras-search-scope-tweets"
          @click="onScopeSelected(2)"
        >
          Tweets
        </span>
      </div>
    </div>
    <transition name="fade">
      <div
        v-if="totalConsecutiveSearchesWithNoResults > 2"
        class="ras-hidden-portal-container"
        v-bind:class="{ 'ras-active-scope': localScope == -1 }"
        @click="onScopeSelected(-1)"
        title="Secret"
      >
        <div class="ras-hidden-portal-button">Play Hangman</div>
      </div>
    </transition>
    <div
      v-if="localScope != -1"
      class="ras-search-scope-reactions-container"
      v-bind:class="{
        'ras-search-scope-reactions-container-active':
          onlyIncludeBlocksWithReactions == true,
      }"
    >
      <div
        v-if="onlyIncludeBlocksWithReactions"
        class="ras-search-scope-reactions-text"
      >
        Only showing blocks with reactions
      </div>
      <div
        class="ras-search-scope-reactions"
        :title="reactionButtonTitle"
        v-on:click="toggleIncludeReactions()"
      >
        :)
      </div>
    </div>
    <div
      class="ras-maximize-button-container"
      v-on:click="toggleMaximize()"
      title="Toggle Fullscreen"
    >
      <div class="ras-maximize-button">{{ maximizeText }}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "ras-search",
  props: {
    loadingNewResults: Boolean,
  },
  data() {
    return {
      localScope: 0,
      searchScopeString: "",
      maximizeText: "↗",
      reactionButtonTitle: "Only Show blocks with reactions",
    };
  },
  watch: {
    searchScope(value) {
      this.localScope = value;
    },
    fullScreenMode() {
      this.setMaximizeText();
    },
    localScope(value) {
      window.setTimeout(() => {
        this.searchRefreshPending = true;
        this.searchScope = value;
        this.setSearchScopeString();
      }, 100);
    },
    searchRefreshPending() {
      this.setSearchScopeString();
    },
  },
  mounted() {
    this.setSearchScopeString();
    this.setMaximizeText();
  },
  methods: {
    onScopeSelected(scopeValue) {
      if (!this.loadingNewResults && !this.waitingOnUserInputFinish) {
        this.localScope = scopeValue;
      }
    },
    setMaximizeText() {
      this.maximizeText = this.fullScreenMode ? "↙" : "↗";
    },
    onRefreshSearchClicked() {
      this.$emit("refresh-search-clicked");
    },
    toggleMaximize() {
      let elem = document.getElementById("ras-roam-portal");
      if (document.webkitFullscreenElement) {
        document.webkitCancelFullScreen();
      } else {
        elem.webkitRequestFullScreen();
      }
    },
    toggleIncludeReactions() {
      this.onlyIncludeBlocksWithReactions =
        !this.onlyIncludeBlocksWithReactions;

      if (!this.onlyIncludeBlocksWithReactions) {
        this.reactionButtonTitle = "Show blocks with and without reactions";
      } else {
        this.reactionButtonTitle = "Only Show blocks with reactions";
      }
    },
    setSearchScopeString() {
      switch (this.searchScope) {
        case -1:
          document
            .getElementById("ras-roam-portal")
            .style.setProperty("--background-shadow-color", "#da8767");
          this.totalConsecutiveSearchesWithNoResults = 0;
          this.searchScopeString = "Playing Hangman";
          break;
        case 0:
          document
            .getElementById("ras-roam-portal")
            .style.setProperty("--background-shadow-color", "#9370db");
          this.searchScopeString = "All blocks";
          break;
        case 1:
          document
            .getElementById("ras-roam-portal")
            .style.setProperty("--background-shadow-color", "#2eaf67");
          this.searchScopeString = "Images";
          break;
        case 2:
          document
            .getElementById("ras-roam-portal")
            .style.setProperty("--background-shadow-color", "#1DA1F2");
          this.searchScopeString = "Tweets";
          break;
        case 3:
          document
            .getElementById("ras-roam-portal")
            .style.setProperty("--background-shadow-color", "#c958ac");
          this.searchScopeString = "Custom User Query";
          break;
      }
    },
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
    fullScreenMode: {
      get() {
        return this.$store.getters["ViewConfig/fullScreenMode"];
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
    searchScope: {
      get() {
        return this.$store.getters["SearchConfig/searchScope"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchScope", value);
      },
    },
  },
};
</script>
<style scoped>
.ras-search-scope-header-string,
.ras-search-scope-item,
.ras-search-scope-reactions {
  font-size: 12px !important;
}

.ras-maximize-button-container {
  cursor: pointer;
  margin-left: 5px;
  flex-basis: 25px;
}

.ras-maximize-button {
  color: var(--background-shadow-color) !important;
  font-size: 14px !important;
  font-family: "Inter", sans-serif !important;
}

.ras-maximize-button:hover {
  color: #ca124c !important;
}

.ras-refresh-search-button:hover {
  opacity: 1;
}

.ras-refresh-search-button,
.ras-refresh-search-button:focus {
  border: 0;
  background: #f9f9f9;
  font-size: 14px !important;
  opacity: 0.5;
  cursor: pointer;
  position: relative;
  bottom: 1px;
  margin-left: 5px;
  border-bottom: 3px solid transparent;
  padding: 0px 6px 0px 6px;
}

.ras-search-scope-picker-container > div {
  position: relative;
  margin-bottom: 2px;
  display: flex;
  gap: 10px;
}

.ras-search-scope-picker-container {
  flex: 1;
}

.ras-search-scope-string {
  margin-left: 5px;
  cursor: pointer;
  font-size: 12px !important;
  color: #6f6b6b !important;
}

.ras-search-scope-string:hover {
  color: #ca124c !important;
}

.ras-search-scope-item {
  cursor: pointer;
  color: #ababab !important;
}

.ras-search-scope-item:hover {
  color: #ef7f4b !important;
}

.ras-search-scope-header {
  color: #ababab !important;
}

.ras-refresh-search-button-scope-updated {
  color: var(--background-shadow-color) !important;
  opacity: 1;
  background: #e4e4e4;
  border-radius: 25px;
}

.ras-refresh-search-button-scope-updated:hover {
  color: #ca124c !important;
}

.ras-active-scope {
  color: #ec6f35 !important;
  opacity: 1 !important;
}

.ras-search-scope-reactions {
  color: #969696 !important;
  cursor: pointer;
}

.ras-search-scope-reactions:hover {
  color: #ca124c !important;
}

.ras-search-scope-selected-parent-container {
  flex-grow: 1;
}

.ras-search-scope-reactions-container {
  display: flex;
}

.ras-search-scope-container {
  flex: 0 0 auto;
  display: flex;
  padding-left: 15px;
  padding-top: 5px;
  background: #f9f9f9;
  color: #969595 !important;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid #f9f9f9;
}

.ras-search-scope-reactions-text {
  margin-right: 5px;
  font-style: italic;
  color: var(--background-shadow-color);
  padding-left: 5px;
  background: #f8f9e0;
  padding-right: 5px;
  border: 1px solid #f8f9e0;
  border-radius: 6px;
  font-size: 12px !important;
}

.ras-search-scope-reactions-container-active > .ras-search-scope-reactions {
  color: var(--background-shadow-color) !important;
}

.ras-hidden-portal-container {
  position: absolute;
  left: 45%;
  cursor: pointer;
}

.ras-hidden-portal-container:hover {
  opacity: 1;
}

.ras-hidden-portal-button {
  color: #ababab !important;
}

.ras-hidden-portal-button:hover {
  color: #ef7f4b !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
