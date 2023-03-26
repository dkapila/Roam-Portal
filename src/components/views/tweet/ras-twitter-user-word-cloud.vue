<template>
  <div class="ras-twitter-word-cloud-container">
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
    <div
      v-if="words.length > 0"
      class="ras-word-cloud-warning"
      title="Thoughts on word clouds"
    >
      <a
        href="https://www.niemanlab.org/2011/10/word-clouds-considered-harmful/"
        target="_blank"
        >ⓘ</a
      >
    </div>
    <div v-if="words.length > 0" class="ras-word-cloud-canvas-container">
    <vue-word-cloud
      style="
        height: 480px;
        width: 640px;
      "
      :words="words"
      font-size-ratio="1.5"
      :color="([, weight]) => weight > 10 ? 'DeepPink' : weight > 5 ? 'RoyalBlue' : 'Indigo'"
      font-family="Roboto"
    />
    </div>
  </div>
</template>

<script>
export default {
  name: "ras-twitter-user-word-cloud",
  data() {
    return {
      updatingChart: false,
      fontsizeMinMax: [15, 75],
      words: [],
      margin: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
      myColors: ["#1f77b4", "#629fc9", "#94bedb", "#c9e0ef"],
    };
  },
  props: {
    blockResults: Array,
  },
  computed: {
    searchQuery: {
      get() {
        return this.$store.getters["SearchConfig/searchQuery"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchQuery", value);
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
    tweetDisplayMode: {
      get() {
        return this.$store.getters["ViewConfig/tweetDisplayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateTweetDisplayMode", value);
      },
    },
  },
  watch: {
    blockResults() {
      clearTimeout(this.timeout);
      this.renderChart();
    },
  },
  mounted() {
    if (this.blockResults && this.blockResults.length > 0) {
      clearTimeout(this.timeout);
      this.renderChart();
    }
  },
  methods: {
    onWordClicked(clickedWord) {
      if (clickedWord) {
        clickedWord = clickedWord.replaceAll("@", "");

        this.searchWithWaitingForUserInput = false;
        this.searchQuery = clickedWord + "/";
        this.tweetDisplayMode = 0;
      }
    },
    renderChart() {
      this.updatingChart = true;
      this.timeout = window.setTimeout(() => {
        this.updateChart();
        this.updatingChart = false;
      }, 300);
    },
    getUserName(blockText) {
      let start = blockText.indexOf("https://twitter.com/");
      let end = blockText.indexOf("/status/");

      if (start == -1 || end == -1) {
        return null;
      }

      let userName = blockText.slice(start + 20, end).trim();

      if (!userName || userName.length == 0) {
        return;
      }

      let tempUser = userName.replaceAll("_", "");
      if (tempUser.match(/^[a-z0-9]+$/i)) {
        return userName;
      }

      return null;
    },
    updateChart() {
      let userList = {};

      this.blockResults.forEach((block) => {
        let userName = this.getUserName(block.string);
        if (!userName) {
          return;
        }

        if (userName in userList) {
          userList[userName] = userList[userName] + 1;
        } else {
          userList[userName] = 1;
        }
      });

      let tempFrequencyList = [];

      Object.keys(userList).forEach((key) => {
        tempFrequencyList.push(["@" + key, userList[key]]);
      });

      tempFrequencyList.sort((a, b) => {
        return b[1] - a[1];
      });

      this.words = tempFrequencyList.slice(0, 50);
    },
  },
};
</script>
<style scoped>
.ras-word-cloud-warning {
  bottom: 3px;
  left: 8px;
  position: absolute;
  z-index: 10;
  cursor: pointer;
}

.ras-word-cloud-warning a {
  text-decoration: none;
  color: #34c36e !important;
  font-style: normal !important;
  font-size: 16px !important;
}

.ras-word-cloud-warning:hover {
  color: #ee7c49 !important;
  border: none !important;
}

.ras-regular-size {
  height: 100%;
  position: relative;
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

.ras-twitter-word-cloud {
  background: #f9f2f2;
  height: 100%;
}

.ras-chart-container {
  position: relative;
  height: 100%;
}

.ras-twitter-word-cloud-container {
  height: 100%;
}

.ras-word-cloud-canvas-container {
  height: 100%;
}

@keyframes ras-loading-new-results-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
