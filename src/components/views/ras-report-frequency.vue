<template>
  <div>
    <bar-chart
      class="ras-chart-container"
      v-if="updatingChart == false"
      :styles="chartStyle"
      :options="options"
      :chart-data="dataCollection"
    ></bar-chart>
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
  </div>
</template>

<script>
import BarChart from "../../adapters/barChartAdapter";
import roamAdapter from "../../adapters/roamAdapter";
import utils from "../../common/utils";
import dataRequestHelper from "../../dataPreparation/dataRequestHelper";

export default {
  name: "ras-report-frequency",
  components: {
    BarChart,
  },
  data() {
    return {
      labels: [],
      frequencies: [],
      chartTitle: "",
      options: {},
      chartStyle: {
        position: "relative",
      },
      dataCollection: null,
      timeout: false,
      updatingChart: true,
      fullTextOfAllResults: "",
    };
  },
  mixins: [utils, roamAdapter, dataRequestHelper],
  props: {
    resultPages: Array,
    allSortedBlocks: Array,
    blockSearchKey: String,
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
    pageTitle: {
      get() {
        return this.$store.getters["SearchConfig/pageTitle"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updatePageTitle", value);
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
  },
  watch: {
    allSortedBlocks() {
      if (this.displayMode == 3) {
        clearTimeout(this.timeout);

        this.setFullTextOfAllResults();
        this.renderChart();
      }
    },
    resultPages() {
      if (this.displayMode == 2) {
        clearTimeout(this.timeout);
        this.renderChart();
      }
    },
    displayMode() {
      clearTimeout(this.timeout);
      this.renderChart();
    },
  },
  mounted() {
    this.setFullTextOfAllResults();

    if (this.resultPages && this.resultPages.length > 0) {
      clearTimeout(this.timeout);
      this.renderChart();
    }
  },
  methods: {
    setFullTextOfAllResults() {
      this.fullTextOfAllResults = "";

      this.allSortedBlocks.forEach((block) => {
        if (this.blockSearchKey in block) {
          this.fullTextOfAllResults = this.fullTextOfAllResults.concat(
            block[this.blockSearchKey] + " "
          );
        } else if ("isPage" in block) {
          this.fullTextOfAllResults = this.fullTextOfAllResults.concat(
            block["title"] + " "
          );
        }
      });
    },
    onChartClicked(event, item) {
      if (item && item.length > 0 && "_index" in item[0]) {
        let index = item[0]._index;
        let labelTitle = this.labels[index];

        if (this.displayMode == 2) {
          if (event.shiftKey) {
            this.roamOpenSidebar(this.fetchPageUid(labelTitle));
            return true;
          }

          this.searchWithWaitingForUserInput = false;
          this.displayMode = 0;
          this.pageTitle = labelTitle;
        }
        if (this.displayMode == 3) {
          this.searchWithWaitingForUserInput = false;
          this.searchQuery = this.searchQuery + " " + labelTitle;
        }
      }
    },
    getTooltipLabel(self, tooltipItem) {
      let searchQuery = self.searchQuery;

      let tooltipLabel = [];

      if (self.displayMode == 2) {
        let label = `${tooltipItem.yLabel} occurrence(s) of '${searchQuery}' in this page:`;
        if (searchQuery.length == 0) {
          label = `${tooltipItem.yLabel} blocks edited/created in this page`;
        }

        let labelActionText = `Click to show results from this page`;
        tooltipLabel.push(label, labelActionText);
      }

      if (self.displayMode == 3) {
        let label = `${tooltipItem.yLabel} occurrence(s) of '${tooltipItem.label}' in the same block as '${searchQuery}'`;

        if (searchQuery.length == 0) {
          label = `${tooltipItem.yLabel} occurrence(s) of '${tooltipItem.label}'`;
        }

        let labelActionText = `Click to add this word to your current search query`;

        tooltipLabel.push(label, labelActionText);
      }

      return tooltipLabel;
    },
    renderChart() {
      let self = this;
      this.updatingChart = true;
      this.timeout = window.setTimeout(() => {
        self.updateChart(self);
        self.updatingChart = false;
      }, 300);
    },
    updateChart(self) {
      let frequenciesArray = [];
      self.labels = [];
      self.frequencies = [];
      self.chartLabel = "";
      if (
        self.displayMode == 2 &&
        self.resultPages &&
        self.resultPages.length > 0
      ) {
        frequenciesArray = self.getPageFrequency(self.resultPages).slice(0, 25);

        if (self.searchQuery.length == 0) {
          self.chartLabel = [
            "Pages with most blocks edited (within your search filters)",
            "Click to show results edited within a particular page",
          ];
        } else {
          self.chartLabel = [
            'Pages where "' +
              self.searchQuery +
              '" frequently occurs (within your search filters)',
            "Click to show results edited within a particular page",
          ];
        }
      }
      if (
        self.displayMode == 3 &&
        this.fullTextOfAllResults &&
        this.fullTextOfAllResults.length > 0
      ) {
        frequenciesArray = self
          .getWordFrequency(this.fullTextOfAllResults)
          .slice(0, 25);
        if (self.searchQuery.length == 0) {
          self.chartLabel = [
            "Most frequent words used (within your search filters)",
            "Click to add a word to your current search",
          ];
        } else {
          self.chartLabel = [
            'Words that occur frequently with "' +
              self.searchQuery +
              '" (within your search filters)',
            "Click to add a word to your current search",
          ];
        }
      }

      self.options = {
        responsive: true,
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              return self.getTooltipLabel(self, tooltipItem, data);
            },
          },
        },
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: self.chartLabel,
          fontSize: 16,
          fontColor: "#6C2D9F",
          fontStyle: "normal",
        },
        maintainAspectRatio: false,
        events: ["click", "mousemove", "mouseout", "touchstart", "touchmove"],
        onClick: self.onChartClicked,
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString:
                  self.displayMode == 2
                    ? "Page Names"
                    : "Frequently occurring words",
              },
              ticks: {
                callback: (value) => {
                  if (
                    self.labels &&
                    self.labels.length > 0 &&
                    value.length > 10
                  ) {
                    return value.substr(0, 13) + "...";
                  } else {
                    return value;
                  }
                },
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "# of occurrences",
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      };

      frequenciesArray.forEach((frequency) => {
        self.labels.push(frequency.name);
        self.frequencies.push(frequency.value);
      });

      self.fillData(self, self.chartLabel);
    },
    fillData(self, chartLabel) {
      self.dataCollection = {
        labels: self.labels,
        datasets: [
          {
            label: chartLabel,
            fill: false,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
            ],
            borderWidth: 1,
            data: self.frequencies,
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.ras-regular-size {
  height: 100%;
  position: relative;
}

.ras-chart-container {
  position: relative;
  height: 100%;
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
</style>
