<template>
  <div class="ras-compare-chart-container">
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
    <bar-chart
      class="ras-chart-container"
      v-if="!updatingChart"
      :styles="barChartStyle"
      :options="barChartOptions"
      :chart-data="barChartData"
    ></bar-chart>
  </div>
</template>

<script>
import utils from "../../../../common/utils";
import BarChart from "../../../../adapters/barChartAdapter";
import roamAdapter from "../../../../adapters/roamAdapter";
import dataRequestHelper from "../../../../dataPreparation/dataRequestHelper";

export default {
  name: "ras-report-pages-mentioned",
  components: {
    BarChart,
  },
  mixins: [utils, roamAdapter, dataRequestHelper],
  data() {
    return {
      barChartStyle: {
        position: "relative",
      },
      timeout: false,
      updatingChart: true,
      barChartNodeData: [],
      barChartData: [],
      barChartOptions: {},
    };
  },
  props: {
    listOfReferences: Array,
  },
  computed: {
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
    mentionedPageTitle: {
      get() {
        return this.$store.getters["SearchConfig/mentionedPageTitle"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateMentionedPageTitle", value);
      },
    },
  },
  watch: {
    listOfReferences() {
      clearTimeout(this.timeout);
      this.updateChart();
    },
  },
  mounted() {
    this.updateChart();
  },
  methods: {
    updateChart() {
      let self = this;
      this.updatingChart = true;
      this.timeout = window.setTimeout(() => {
        self.renderBarChart(self);
        self.updatingChart = false;
      }, 200);
    },
    onBarChartClicked(event, item) {
      if (item && item.length > 0 && "_index" in item[0]) {
        let index = item[0]._index;
        let clickedItem = this.barChartNodeData[index];

        if (event.shiftKey) {
          this.roamOpenSidebar(this.fetchPageUid(clickedItem.uniqueIdentifier));
          return true;
        }

        this.searchWithWaitingForUserInput = false;
        this.mentionedPageTitle = clickedItem.uniqueIdentifier;
        this.displayMode = 0;
      }
    },
    getBarChartTooltipLabel(_, tooltipItem) {
      let tooltipLabel = [];
      let label = "";
      label = `${tooltipItem.yLabel} times this page was mentioned`;
      let labelActionText = "Click to show all blocks which mention this page";

      tooltipLabel.push(label, labelActionText);

      return tooltipLabel;
    },
    renderBarChart(self) {
      self.frequenciesOverPeriod = {};

      let chartLabel = ["Click to show results which mention this page"];

      self.barChartOptions = {
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              return self.getBarChartTooltipLabel(self, tooltipItem, data);
            },
          },
        },
        legend: {
          display: false,
        },
        onClick: self.onBarChartClicked,
        title: {
          display: true,
          text: chartLabel,
          fontSize: 16,
          fontColor: "#6C2D9F",
          fontStyle: "normal",
        },
        responsive: true,
        maintainAspectRatio: false,
        events: ["click", "mousemove", "mouseout", "touchstart", "touchmove"],
        scales: {
          xAxes: [
            {
              stacked: true,
              scaleLabel: {
                display: true,
                labelString: "Pages mentioned",
              },
              ticks: {
                callback: (value) => {
                  if (value.length > 16) {
                    return value.substr(0, 16) + "...";
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
                labelString: "# of occurrences of this page",
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      };

      let labels = [];
      let frequencies = [];

      this.barChartNodeData = [];

      let count = 0;
      this.listOfReferences.forEach((item) => {
        if (count == 25) {
          return;
        }

        if (item.type == "(page)") {
          labels.push(item.label);
          frequencies.push(item.referenceCount);
          this.barChartNodeData.push(item);
          count = count + 1;
        }
      });

      self.barChartData = {
        labels: labels,
        datasets: [
          {
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
            ],
            data: frequencies,
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

.ras-compare-chart-container {
  height: 100%;
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
