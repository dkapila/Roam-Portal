<template>
  <div class="ras-results-menu-bar" v-if="scopeUsedForRecentMostSearch != null">
    <div class="ras-results-toolbar-container">
      <div class="ras-home-view-button-container">
        <div
          v-bind:style="rasPortalStyle"
          class="ras-portal-logo"
          v-on:click="portalClicked()"
        ></div>
      </div>
      <transition name="fade">
        <div v-if="searchScope == 2" class="ras-result-menu-buttons-container">
          <div
            class="ras-menu-bar-button-container ras-show-results-button-container"
            v-bind:class="{
              'ras-results-list-new-changes-unseen': indicateNewResultsUpdate,
              'ras-menu-button-container-inactive': tweetDisplayMode != 0,
            }"
          >
            <div
              class="ras-menu-bar-button ras-show-results"
              v-on:click="tweetDisplayMode = 0"
              v-bind:class="{
                'ras-menu-button-active': tweetDisplayMode == 0,
                'ras-menu-button-inactive': tweetDisplayMode != 0,
              }"
            >
              {{ searchResultCountString }}
            </div>
          </div>

          <div
            class="ras-menu-bar-button-container ras-menu-bar-frequency-button-container"
            v-bind:class="{ 'ras-results-empty': searchResultCount == 0 }"
          >
            <div
              class="ras-menu-bar-button ras-show-tweet-word-cloud"
              v-on:click="tweetDisplayMode = 1"
              v-bind:class="{
                'ras-menu-button-active': tweetDisplayMode == 1,
                'ras-menu-button-inactive': tweetDisplayMode != 1,
              }"
            >
              Frequent usernames
            </div>
          </div>
        </div>
      </transition>
      <transition name="fade">
        <div v-if="searchScope == 1" class="ras-result-menu-buttons-container">
          <div
            class="ras-menu-bar-button-container ras-show-results-button-container"
            v-bind:class="{
              'ras-results-list-new-changes-unseen': indicateNewResultsUpdate,
              'ras-menu-button-container-inactive': imageDisplayMode != 0,
            }"
          >
            <div
              class="ras-menu-bar-button ras-show-results"
              v-on:click="imageDisplayMode = 0"
              v-bind:class="{
                'ras-menu-button-active': imageDisplayMode == 0,
                'ras-menu-button-inactive': imageDisplayMode != 0,
              }"
            >
              {{ searchResultCountString }}
            </div>
          </div>
        </div>
      </transition>
      <transition name="fade">
        <div
          v-if="searchScope == 0 || searchScope == 3"
          class="ras-result-menu-buttons-container"
        >
          <div
            class="ras-menu-bar-button-container ras-show-results-button-container"
            v-bind:class="{
              'ras-results-list-new-changes-unseen': indicateNewResultsUpdate,
              'ras-menu-button-container-inactive': displayMode != 0,
            }"
          >
            <div
              class="ras-menu-bar-button ras-show-results"
              v-on:click="displayMode = 0"
              v-bind:class="{
                'ras-menu-button-active': displayMode == 0,
                'ras-menu-button-inactive': displayMode != 0,
              }"
            >
              {{ searchResultCountString }}
            </div>
          </div>
          <div
            class="ras-menu-bar-button-container ras-menu-bar-frequency-button-container"
            v-bind:class="{ 'ras-results-empty': searchResultCount == 0 }"
          >
            <div
              class="ras-menu-bar-button ras-show-frequency"
              v-on:click="displayMode = 5"
              v-bind:class="{
                'ras-menu-button-active': displayMode == 5,
                'ras-menu-button-inactive': displayMode != 5,
              }"
            >
              Graph
            </div>
          </div>
          <div
            class="ras-menu-bar-button-container ras-menu-bar-frequency-button-container"
            v-bind:class="{ 'ras-results-empty': searchResultCount == 0 }"
          >
            <div
              class="ras-menu-bar-button ras-show-globe"
              v-on:click="displayMode = 6"
              v-bind:class="{
                'ras-menu-button-active': displayMode == 6,
                'ras-menu-button-inactive': displayMode != 6,
              }"
            >
              Globe
            </div>
          </div>
          <div
            class="ras-menu-bar-button-container"
            v-bind:class="{ 'ras-results-empty': searchResultCount == 0 }"
          >
            <div
              class="ras-menu-bar-button ras-show-frequency"
              v-on:click="displayMode = 1"
              v-bind:class="{
                'ras-menu-button-active': displayMode == 1,
                'ras-menu-button-inactive': displayMode != 1,
              }"
            >
              Time
            </div>
          </div>

          <div
            class="ras-menu-bar-button-container ras-menu-bar-frequency-button-container"
            v-bind:class="{ 'ras-results-empty': searchResultCount == 0 }"
          >
            <div
              class="ras-menu-bar-button ras-show-trends"
              v-on:click="displayMode = 4"
              v-bind:class="{
                'ras-menu-button-active': displayMode == 4,
                'ras-menu-button-inactive': displayMode != 4,
              }"
            >
              References
            </div>
          </div>
          <div
            class="ras-menu-bar-button-container ras-menu-bar-frequency-button-container"
            v-bind:class="{ 'ras-results-empty': searchResultCount == 0 }"
          >
            <div
              class="ras-menu-bar-button ras-show-page-frequency"
              v-on:click="displayMode = 2"
              v-bind:class="{
                'ras-menu-button-active': displayMode == 2,
                'ras-menu-button-inactive': displayMode != 2,
              }"
            >
              Pages
            </div>
          </div>
          <div
            class="ras-menu-bar-button-container ras-menu-bar-frequency-button-container"
            v-bind:class="{ 'ras-results-empty': searchResultCount == 0 }"
          >
            <div
              class="ras-menu-bar-button ras-show-word-frequency"
              v-on:click="displayMode = 3"
              v-bind:class="{
                'ras-menu-button-active': displayMode == 3,
                'ras-menu-button-inactive': displayMode != 3,
              }"
            >
              Words
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import utils from "../../common/utils";

export default {
  name: "ras-menu-bar",
  props: {
    resultsListNewChangesUnseen: Boolean,
    searchResultCount: Number,
  },
  data() {
    return {
      searchResultCountString: null,
      indicateNewResultsUpdate: false,
      rasPortalStyle: {},
    };
  },
  computed: {
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
    searchScope: {
      get() {
        return this.$store.getters["SearchConfig/searchScope"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchScope", value);
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
    displayMode: {
      get() {
        return this.$store.getters["ViewConfig/displayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateDisplayMode", value);
      },
    },
  },
  mounted() {
    this.updateSearchCountString();
  },
  methods: {
    portalClicked() {
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
    updateSearchCountString() {
      let resultString = "";
      let resultStringPlural = "";

      let scope =
        this.scopeUsedForRecentMostSearch != 0 && this.searchScope == 0
          ? this.scopeUsedForRecentMostSearch
          : this.searchScope;

      switch (scope) {
        case 0:
          resultString = "Result";
          resultStringPlural = "Results";
          break;
        case 1:
          resultString = "Image";
          resultStringPlural = "Images";
          break;
        case 2:
          resultString = "Tweet";
          resultStringPlural = "Tweets";
          break;
        default:
          resultString = "Result";
          resultStringPlural = "Results";
      }

      if (this.searchResultCount == 0) {
        this.searchResultCountString = "No " + resultStringPlural;

        if (this.scopeUsedForRecentMostSearch == 1) {
          this.searchResultCountString =
            "No " + resultStringPlural.toLowerCase();
        }
      }

      if (this.searchResultCount == 1) {
        this.searchResultCountString = "1 " + resultString;
      }
      if (this.searchResultCount > 1) {
        this.searchResultCountString =
          this.searchResultCount + " " + resultStringPlural;
      }
    },
  },
  mixins: [utils],
  watch: {
    searchScope() {
      this.updateSearchCountString();
    },
    searchResultCount() {
      this.updateSearchCountString();
    },
    resultsListNewChangesUnseen(val) {
      this.indicateNewResultsUpdate = val;
    },
    tweetDisplayMode() {
      this.rasPortalStyle["border"] = "2px solid " + this.getRandomColor();
    },
    imageDisplayMode() {
      this.rasPortalStyle["border"] = "2px solid " + this.getRandomColor();
    },
    displayMode() {
      this.rasPortalStyle["border"] = "2px solid " + this.getRandomColor();
    },
  },
};
</script>
<style scoped>
.ras-portal-logo {
  height: 25px;
  position: relative;
  width: 25px;
  margin-left: 5px;
  margin-top: 2px;
  cursor: pointer;
}

.ras-portal-logo {
  background: radial-gradient(#ffffff, #ffffff 50%, #ffffff 70%);
  border: 2px solid #ff86ad;
  box-shadow: 0px 0px 5px 2px #e8a95a9c;
  border-radius: 50%;
  transition: border 400ms ease-in;
}

.ras-results-toolbar-container {
  display: flex;
  margin-bottom: 5px;
}

.ras-results-toolbar-container input[type="radio"] {
  opacity: 0;
  position: fixed;
  height: 30px;
  width: 100%;
}

.ras-menu-bar-button {
  border-radius: 5px;
  padding: 5px 8px;
  cursor: pointer;
  margin-right: 5px;
  font-weight: 400;
  font-size: 14px !important;
  transition: 0.3s;
  width: 100%;
}

.ras-menu-bar-button {
  cursor: pointer;
  background: #e2e2e2;
  color: #f1ecec !important;
}

.ras-results-empty {
  display: none;
}

.ras-results-menu-bar {
  padding-left: 10px;
  padding-bottom: 5px;
  padding-top: 5px;
}

.ras-menu-chart-buttons-container {
  display: flex;
  margin-right: 10px;
}

.ras-results-list-new-changes-unseen > .ras-show-results {
  background-color: crimson !important;
  color: white !important;
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.ras-menu-button-inactive {
  color: black !important;
}

.ras-menu-button-inactive:hover {
  background: #e0c4fb !important;
  transition: background 0.25s linear;
}

.ras-menu-button-inactive:active {
  background: #d4b0f7 !important;
  transition: background 0.25s linear;
  color: white !important;
}

.ras-menu-button-active {
  background: #9769ff !important;
  color: #f1ecec !important;
  transition: background 0.25s linear;
}

.ras-menu-chart-buttons-container {
  display: flex;
}

.ras-result-menu-buttons-container {
  display: flex;
  width: 100%;
}

.ras-home-view-button-container {
  flex-basis: 50px;
}

.ras-show-results-button-container {
  margin-right: 5px;
}

.ras-show-results {
  width: 100%;
  text-align: center;
}

.ras-menu-bar-button-container {
  flex-grow: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.ras-menu-bar-button-container {
  cursor: pointer;
  flex: flex-end;
  flex-grow: 1.1;
  margin-right: 10px;
  text-align: center;
}
</style>
