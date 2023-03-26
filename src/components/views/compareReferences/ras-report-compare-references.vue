<template>
  <div>
    <div class="ras-tabs-container">
      <div
        class="ras-tabs-button"
        v-bind:class="{ 'ras-tab-active': compareDisplayMode == 1 }"
        v-on:click="compareDisplayMode = 1"
      >
        Frequent Pages mentioned
      </div>
      <div
        class="ras-tabs-button"
        v-bind:class="{ 'ras-tab-active': compareDisplayMode == 2 }"
        v-on:click="compareDisplayMode = 2"
      >
        Frequent Blocks referenced
      </div>
      <div
        class="ras-tabs-button"
        v-bind:class="{ 'ras-tab-active': compareDisplayMode == 3 }"
        v-on:click="compareDisplayMode = 3"
      >
        Compare usage trends
      </div>
    </div>
    <div
      v-if="compareDisplayMode == 3"
      class="ras-compare-references-parent-input-container"
    >
      <rasDropdownSelect
        class="ras-compare-term-1 ras-compare-input-box-container"
        v-model="compareSearchTerm1"
        :searchTerm="compareSearchTerm1"
        placeholderText="Select a page"
        :loadingNewResults="loadingNewResults"
        :listOfOptions="listOfReferences"
      />
      <rasDropdownSelect
        class="ras-compare-term-2 ras-compare-input-box-container"
        v-model="compareSearchTerm2"
        :searchTerm="compareSearchTerm2"
        placeholderText="Or Select a block"
        :loadingNewResults="loadingNewResults"
        :listOfOptions="listOfReferences"
      />
      <rasDropdownSelect
        class="ras-compare-term-3 ras-compare-input-box-container"
        :searchTerm="compareSearchTerm3"
        v-model="compareSearchTerm3"
        placeholderText="Or insert ((block-ref)"
        :loadingNewResults="loadingNewResults"
        :listOfOptions="listOfReferences"
      />
    </div>
    <div class="ras-report-compare-references-chart">
      <rasReportPagesMentioned
        v-if="compareDisplayMode == 1"
        :listOfReferences="listOfReferences"
      />
      <rasReportBlocksMentioned
        v-if="compareDisplayMode == 2"
        :listOfReferences="listOfReferences"
      />
      <rasReportCompare
        v-if="compareDisplayMode == 3"
        :searchTerm1="compareSearchTerm1"
        :searchTerm2="compareSearchTerm2"
        :searchTerm3="compareSearchTerm3"
        :referencedNodesMultiKey="referencedNodesMultiKey"
      />
    </div>
  </div>
</template>

<script>
import utils from "../../../common/utils";
import rasReportBlocksMentioned from "./subViews/ras-report-blocks-mentioned.vue";
import rasReportPagesMentioned from "./subViews/ras-report-pages-mentioned.vue";
import rasReportCompare from "./subViews/ras-report-compare.vue";
import rasDropdownSelect from "@/components/shared/ras-dropdown-select.vue";

export default {
  name: "ras-report-compare-references",
  components: {
    rasReportBlocksMentioned,
    rasReportCompare,
    rasReportPagesMentioned,
    rasDropdownSelect,
  },
  mixins: [utils],
  data() {
    return {
      dataCollection: null,
      timeout: false,
      listOfReferences: [],
      referencedNodesMultiKey: [],
    };
  },
  props: {
    loadingNewResults: Boolean,
    allSortedBlocks: Array,
  },
  computed: {
    compareSearchTerm1: {
      get() {
        return this.$store.getters[
          "ReferenceViewSearchConfig/compareSearchTerm1"
        ];
      },
      set(value) {
        this.$store.commit(
          "ReferenceViewSearchConfig/updateCompareSearchTerm1",
          value
        );
      },
    },
    compareSearchTerm2: {
      get() {
        return this.$store.getters[
          "ReferenceViewSearchConfig/compareSearchTerm2"
        ];
      },
      set(value) {
        this.$store.commit(
          "ReferenceViewSearchConfig/updateCompareSearchTerm2",
          value
        );
      },
    },
    compareSearchTerm3: {
      get() {
        return this.$store.getters[
          "ReferenceViewSearchConfig/compareSearchTerm3"
        ];
      },
      set(value) {
        this.$store.commit(
          "ReferenceViewSearchConfig/updateCompareSearchTerm3",
          value
        );
      },
    },
    compareDisplayMode: {
      get() {
        return this.$store.getters["ViewConfig/compareDisplayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateCompareDisplayMode", value);
      },
    },
  },
  watch: {
    allSortedBlocks() {
      clearTimeout(this.timeout);
      this.refreshListOfReferences();
    },
  },
  mounted() {
    this.refreshListOfReferences();
  },
  methods: {
    getAllReferencedNodes() {
      let nodesMultiKey = {};
      nodesMultiKey["pages"] = {};
      nodesMultiKey["blocks"] = {};

      this.allSortedBlocks.forEach((sortedBlock) => {
        if (sortedBlock.referenceBlocks) {
          let referenceBlocks = sortedBlock.referenceBlocks;

          referenceBlocks.forEach((block) => {
            let type = "";
            let name = "";

            if ("title" in block) {
              type = "pages";
              name = block.title;
            } else {
              type = "blocks";
              name = "((" + block.uid + "))";
            }

            if (nodesMultiKey[type][name]) {
              nodesMultiKey[type][name].count =
                nodesMultiKey[type][name].count + 1;
              nodesMultiKey[type][name].metadata.push({
                blockTime: sortedBlock.blockTime,
              });
            } else {
              let text = null;

              if ("title" in block && block.title) {
                text = block.title;
              }

              if ("string" in block && block.string) {
                text = block.string;
              }

              if (text) {
                nodesMultiKey[type][name] = {
                  metadata: [
                    {
                      blockTime: sortedBlock.blockTime,
                    },
                  ],
                  text: text,
                  count: 1,
                };
              }
            }
          });
        }
      });

      return nodesMultiKey;
    },
    refreshListOfReferences() {
      this.listOfReferences = [];

      let nodesMultiKey = this.getAllReferencedNodes();

      let allReferences = [];

      Object.keys(nodesMultiKey.pages).forEach((page) => {
        const referenceCount = nodesMultiKey.pages[page].count;
        let referenceCountString = "1 linked reference";
        if (referenceCount > 1) {
          referenceCountString = referenceCount + " linked references";
        }
        const opt = {
          type: "(page)",
          label: page,
          uniqueIdentifier: page,
          referenceCount: referenceCount,
          referenceCountString: referenceCountString,
        };
        allReferences.push(opt);
      });

      Object.keys(nodesMultiKey.blocks).forEach((block) => {
        const referenceCount = nodesMultiKey.blocks[block].count;
        let referenceCountString = "1 linked reference";

        if (referenceCount > 1) {
          referenceCountString = `${referenceCount} linked references`;
        }

        const opt = {
          type: "(block)",
          label: nodesMultiKey.blocks[block].text,
          uniqueIdentifier: block,
          referenceCount,
          referenceCountString,
        };

        allReferences.push(opt);
      });

      let sortedResults = allReferences.slice().sort((a, b) => {
        if (a["referenceCount"] < b["referenceCount"]) {
          return 1;
        }
        if (a["referenceCount"] > b["referenceCount"]) {
          return -1;
        }

        return 0;
      });

      this.referencedNodesMultiKey = [];
      this.listOfReferences = sortedResults;
      this.referencedNodesMultiKey = nodesMultiKey;
    },
  },
};
</script>
<style>
.ras-compare-term-2 .vs__dropdown-menu {
  left: calc(100% - 450px);
}

.ras-compare-term-3 .vs__dropdown-menu {
  left: calc(100% - 680px);
}
</style>
<style scoped>
.ras-compare-input-box-container {
  flex-basis: 100%;
  margin-left: 10px;
}

.ras-compare-references-parent-input-container > .ras-dropdown-input {
  width: 200px;
  margin-left: 10px;
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

.ras-tabs-container {
  display: flex;
  justify-content: center;
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

.ras-compare-references-parent-input-container {
  display: flex;
  padding: 10px 8px 10px 4px;
}

.ras-report-compare-references-chart {
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
