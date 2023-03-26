<template>
  <div class="ras-compare-chart-container">
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
    <line-chart
      class="ras-chart-container"
      v-if="
        !updatingChart &&
        (this.searchTerm1 || this.searchTerm2 || this.searchTerm3)
      "
      :styles="lineChartStyle"
      :options="lineChartOptions"
      :chart-data="lineChartData"
    >
    </line-chart>
  </div>
</template>

<script>
import utils from "../../../../common/utils";
import LineChart from "../../../../adapters/lineChartAdapter";

export default {
  name: "ras-report-compare",
  components: {
    LineChart,
  },
  mixins: [utils],
  data() {
    return {
      lineChartStyle: {
        position: "relative",
      },
      dataCollection: null,
      timeout: false,
      updatingChart: true,
      referenceDisplayMode: 1,
      chartData: null,
    };
  },
  props: {
    referencedNodesMultiKey: Object,
    searchTerm1: Object,
    searchTerm2: Object,
    searchTerm3: Object,
  },
  computed: {
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
  },
  watch: {
    searchTerm1() {
      clearTimeout(this.timeout);
      this.updateChart();
    },
    searchTerm2() {
      clearTimeout(this.timeout);
      this.updateChart();
    },
    searchTerm3() {
      clearTimeout(this.timeout);
      this.updateChart();
    },
    referencedNodesMultiKey() {
      clearTimeout(this.timeout);
      this.updateChart();
    },
  },
  mounted() {
    this.updateChart();
  },
  methods: {
    updateChart() {
      this.updatingChart = true;
      this.timeout = window.setTimeout(() => {
        this.renderLineChart();
        this.updatingChart = false;
      }, 200);
    },
    getLineChartTooltipLabel(tooltipItem) {
      let label = this.chartData[tooltipItem.datasetIndex].label;
      if (label.length > 16) {
        label = label.substr(0, 16) + "...";
      }

      let tooltipLabel = "";

      if (
        this.chartData[tooltipItem.datasetIndex].frequencyType == "Week" &&
        tooltipItem.xLabel
      ) {
        let dates = this.getDateRangeFromWeek(tooltipItem.xLabel);
        tooltipLabel =
          tooltipItem.value +
          " references of " +
          label +
          " from " +
          dates.fromDate +
          " till " +
          dates.tillDate;
      } else {
        tooltipLabel =
          tooltipItem.value +
          " references of " +
          label +
          " in this time period";
      }

      return tooltipLabel;
    },
    setChartOptions() {
      this.lineChartOptions = {
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              return this.getLineChartTooltipLabel(tooltipItem, data);
            },
          },
        },
        legend: {
          display: true,
        },
        title: {
          display: true,
          text: "Usage of references over time",
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
                labelString: "Time period",
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
                labelString: "# of occurrences",
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      };
    },
    renderLineChart() {
      let nodeOne = this.searchTerm1 ? this.searchTerm1 : null;
      let nodeTwo = this.searchTerm2 ? this.searchTerm2 : null;
      let nodeThree = this.searchTerm3 ? this.searchTerm3 : null;

      let nodes = [nodeOne, nodeTwo, nodeThree];
      let backgrounds = [
        "rgba(255, 99, 132, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(54, 162, 235, 0.6)",
      ];

      let chartData = [];

      let chartDataIndex = 0;
      nodes.forEach((node, i) => {
        if (!node) {
          return;
        }

        chartData[chartDataIndex] = {};
        chartData[chartDataIndex].frequencyMap = {};

        let nodeData =
          node.type == "(page)"
            ? this.referencedNodesMultiKey.pages[node.uniqueIdentifier]
            : this.referencedNodesMultiKey.blocks[node.uniqueIdentifier];

        let frequencyData = null;

        if (!nodeData) {
          frequencyData = this.getFrequenciesOverTimePeriod(
            [],
            this.startDateTimestamp,
            this.endDateTimestamp
          );
        } else {
          frequencyData = this.getFrequenciesOverTimePeriod(
            nodeData.metadata,
            this.startDateTimestamp,
            this.endDateTimestamp
          );
        }

        let frequencies = frequencyData.frequencies;
        frequencies.forEach((frequency) => {
          chartData[chartDataIndex].frequencyMap[frequency.name] = {
            occurrences: frequency.value,
            timestamp: frequency.timestamp,
            name: frequency.name,
            data: [],
          };
        });

        chartData[chartDataIndex].frequencyType = frequencyData.type;
        chartData[chartDataIndex].backgroundColor = backgrounds[i];
        chartData[chartDataIndex].borderColor = backgrounds[i];
        chartData[chartDataIndex].fill = false;
        chartData[chartDataIndex].label = node.label;
        chartData[chartDataIndex].spanGaps = true;

        if (chartData[chartDataIndex].label.length > 16) {
          chartData[chartDataIndex].label =
            chartData[chartDataIndex].label.substr(0, 16) + "...";
        }

        chartDataIndex = chartDataIndex + 1;
      });

      if (chartData.length == 0) {
        return;
      }

      let allLabels = [];
      chartData.forEach((data) => {
        let frequencyLabels = Object.keys(data.frequencyMap);
        allLabels.push(...frequencyLabels);
      });

      allLabels = [...new Set(allLabels)];

      allLabels.forEach((label) => {
        chartData.forEach((data) => {
          let frequencyType = data.frequencyType;
          let timestamp = 0;

          if (frequencyType == "Day") {
            timestamp = Date.parse(label);
          } else {
            timestamp = Date.parse(this.getDateRangeFromWeek(label).fromDate);
          }

          if (!data.frequencyMap[label]) {
            data.frequencyMap[label] = {
              occurrences: 0,
              name: label,
              timestamp: timestamp
            };
          }
        });
      });

      chartData.forEach((item) => {
        item.frequencyData = Object.values(item.frequencyMap);
      });

      let sortedFrequencies = [];

      chartData.forEach((chartItem) => {
        let frequencyData = chartItem.frequencyData;

        frequencyData.sort((a, b) => {
          if (a["timestamp"] > b["timestamp"]) {
            return 1;
          }
          if (a["timestamp"] < b["timestamp"]) {
            return -1;
          }

          return 0;
        });

        chartItem.data = [];
        frequencyData.forEach((item) => chartItem.data.push(item.occurrences));
        sortedFrequencies.push(frequencyData);
      });

      let labels = [];
      sortedFrequencies[0].forEach((item) => labels.push(item.name));

      if (labels.length == 1) {
        chartData.forEach((item) => {
          item.type = "bar";
        });
      }

      this.chartData = chartData;
      this.setChartOptions();

      this.lineChartData = {
        labels: labels,
        datasets: this.chartData,
      };
    },
  },
};
</script>
<style scoped>
.ras-compare-chart-container {
  height: 100%;
}

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
