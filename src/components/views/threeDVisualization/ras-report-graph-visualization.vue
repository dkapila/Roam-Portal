<template>
  <div>
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
    <div class="ras-graph-controls">
      <rasDropdownSelect
        class="ras-graph-dropdown-page-selector"
        v-model="pageSelectedToFlyTo"
        :searchTerm="pageSelectedToFlyTo"
        placeholderText="Fly to a page"
        :loadingNewResults="updatingChart"
        :listOfOptions="listOfPages"
      />

      <div class="ras-tabs-container">
        <div
          class="ras-tabs-button"
          v-bind:class="{
            'ras-tab-active': graphVisualizationDisplayMode == 1,
          }"
          v-on:click="graphVisualizationDisplayMode = 1"
        >
          2D
        </div>
        <div
          class="ras-tabs-button"
          v-bind:class="{
            'ras-tab-active': graphVisualizationDisplayMode == 0,
          }"
          v-on:click="graphVisualizationDisplayMode = 0"
        >
          3D
        </div>
      </div>
      <div
        class="ras-tabs-container ras-tabs-container-for-3d"
        v-if="graphVisualizationDisplayMode == 0"
      >
        <div
          class="ras-tabs-button"
          v-bind:class="{ 'ras-tab-active': graphTextEnabled == false }"
          v-on:click="graphTextEnabled = false"
        >
          Spheres
        </div>
        <div
          class="ras-tabs-button"
          v-bind:class="{ 'ras-tab-active': graphTextEnabled == true }"
          v-on:click="graphTextEnabled = true"
        >
          Text
        </div>
      </div>
      <div class="ras-graph-help-label">
        (Opt/Alt + click = show edges, Cmd/Win + click = open page)
      </div>
    </div>
    <ras-report-two-d-graph
      v-if="graphVisualizationDisplayMode == 1"
      :links="links"
      :nodes="nodes"
      :pageSelectedToFlyTo="pageSelectedToFlyTo"
    />
    <ras-report-three-d-graph
      v-if="graphVisualizationDisplayMode == 0"
      :graphTextEnabled="graphTextEnabled"
      :links="links"
      :nodes="nodes"
      :pageSelectedToFlyTo="pageSelectedToFlyTo"
    />
  </div>
</template>

<script>
import dataRequestHelper from "../../../dataPreparation/dataRequestHelper";
import utils from "../../../common/utils";
import rasDropdownSelect from "@/components/shared/ras-dropdown-select.vue";

import rasReportTwoDGraph from "./graphs/ras-report-twoD-graph.vue";
import rasReportThreeDGraph from "./graphs/ras-report-threeD-graph.vue";

export default {
  name: "ras-report-threeD-visualization",
  components: {
    rasReportTwoDGraph,
    rasReportThreeDGraph,
    rasDropdownSelect,
  },
  data() {
    return {
      graphTextEnabled: true,
      nodes: [],
      updatingChart: true,
      pageReferences: null,
      links: [],
      pageSelectedToFlyTo: "",
      listOfPages: [],
      pageReferencesCount: {},
      dailyNotesDict: {},
    };
  },
  mixins: [dataRequestHelper, utils],
  props: {
    startDateTimestamp: String,
    endDateTimestamp: String,
    blockParentPageMap: Object,
    linkedPagesUidSet: Set,
    pages: Array,
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
    graphVisualizationDisplayMode: {
      get() {
        return this.$store.getters["ViewConfig/graphVisualizationDisplayMode"];
      },
      set(value) {
        this.$store.commit(
          "ViewConfig/updateGraphVisualizationDisplayMode",
          value
        );
      },
    },
  },
  watch: {
    blockParentPageMap() {
      this.updateChart();
    },
  },
  mounted() {
    this.dailyNotesDict = this.fetchAllDailyNotesDict();
    this.attrNotesDict = this.fetchAttributePagesDict();
    this.updateChart();
  },
  methods: {
    maximize() {
      let elem = document.getElementById("ras-roam-portal");
      if (document.webkitFullscreenElement) {
        document.webkitCancelFullScreen();
      } else {
        elem.webkitRequestFullScreen();
      }
    },
    buildSourceTargetMapping(pageReferences) {
      let links = [];

      this.pageReferencesCount = {};

      let pageList = new Set();
      this.pages.forEach((page) => {
        pageList.add(page.title);
      });

      pageReferences.forEach((pageReference) => {
        if (pageReference[0]._refs == null) {
          return;
        }

        let page = pageReference[0].title;
        let references = pageReference[0]._refs;

        references.forEach((reference) => {
          if (reference.id in this.blockParentPageMap) {
            let referencePage = this.blockParentPageMap[reference.id];
            links.push({ source: page, target: referencePage });
            pageList.add(page);
            pageList.add(referencePage);

            if (page in this.pageReferencesCount) {
              this.pageReferencesCount[page] =
                this.pageReferencesCount[page] + 1;
            } else {
              this.pageReferencesCount[page] = 1;
            }
          }
        });
      });

      return {
        links: links,
        pageList: pageList,
      };
    },
    isDailyPage(pageTitle) {
      return this.dailyNotesDict[pageTitle];
    },
    isAttrPage(pageTitle) {
      return this.attrNotesDict[pageTitle];
    },
    updateChart() {
      this.updatingChart = true;

      this.timeout = window.setTimeout(() => {
        clearTimeout(this.timeout);
        this.getGraphData();
        this.updatingChart = false;
      }, 200);
    },
    getGraphData() {
      this.pageReferences = this.fetchAllPageWithReverseReferences(
        this.linkedPagesUidSet
      );
      let sourceTargetMapping = this.buildSourceTargetMapping(
        this.pageReferences
      );

      let dropDownPageList = [];

      let nodes = [];
      let pageList = [...sourceTargetMapping.pageList];

      pageList.forEach((page) => {
        let title = page;
        let type = "(Page)";
        let group = 0;
        if (this.isDailyPage(title)) {
          group = 1;
          type = "(Date)";
        }
        if (this.isAttrPage(title)) {
          group = 2;
          type = "(Attr)";
        }

        let numReferences = this.pageReferencesCount[title]
          ? this.pageReferencesCount[title]
          : 0;
        nodes.push({ id: title, group: group, numReferences: numReferences });
        dropDownPageList.push({
          label: title,
          referenceCountString: numReferences + " link(s)",
          referenceCount: numReferences,
          type: type,
        });
      });

      this.listOfPages = dropDownPageList.slice().sort((a, b) => {
        return b["referenceCount"] - a["referenceCount"];
      });

      this.nodes = nodes;
      this.links = sourceTargetMapping.links;
    },
  },
};
</script>

<style>
#ras-3d-graph-container .scene-nav-info {
  top: 5px;
  color: #989898c2 !important;
}
</style>
<style scoped>
.ras-tabs-container {
  display: flex;
  margin-left: 5px;
}

.ras-tabs-button {
  font-size: 12px !important;
}

.ras-tabs-button {
  padding: 5px;
  cursor: pointer;
  color: #ababab !important;
}

.ras-tabs-button:hover {
  color: #ef7f4b !important;
}

.ras-tab-active {
  color: #ec6f35 !important;
  font-weight: 500;
}

.ras-tab-active:hover {
  color: #ec6f35 !important;
}

.ras-graph-controls {
  display: flex;
}

.ras-graph-dropdown-page-selector {
  flex-basis: 180px;
}

.ras-graph-controls {
  margin-left: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
}

.ras-graph-help-label {
  color: #cecece !important;
  font-size: 12px !important;
  padding: 5px;
}

.ras-tabs-container-for-3d {
  margin-left: 0px;
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
