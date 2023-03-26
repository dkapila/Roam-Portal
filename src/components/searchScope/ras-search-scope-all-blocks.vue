<template>
  <div class="ras-search-scope-all-blocks-container">
    <transition name="fade">
      <ras-menu-bar
        class="ras-menu-bar-container"
        :resultsListNewChangesUnseen="resultsListNewChangesUnseen"
        :searchResultCount="searchResultCount"
        @onIndicateResultsComplete="onIndicateResultsComplete"
      >
      </ras-menu-bar>
    </transition>
    <transition name="fade-in">
      <keep-alive>
        <ras-home
          class="ras-home-view-mode"
          v-if="displayMode == -1"
          @refresh-search-called="onRefreshSearchClicked"
        >
        </ras-home>
      </keep-alive>
    </transition>
    <transition name="fade-in">
      <ras-result
        class="ras-results-view-mode"
        v-if="displayMode == 0 && showBlockSearchResults"
        :showBlockSearchResults="showBlockSearchResults"
        :blockResults="blockResults"
        :blockSearchKey="blockSearchKey"
        :pages="pages"
        :showIncludePagesCheckbox="showIncludePagesCheckbox"
      >
      </ras-result>
    </transition>
    <transition name="fade-in">
      <ras-report-usage
        class="ras-results-view-mode"
        v-if="displayMode == 1"
        :unsortedResults="unsortedResults"
        :displayMode="displayMode"
        :startDateTimestamp="startDateTimestamp"
        :endDateTimestamp="endDateTimestamp"
      >
      </ras-report-usage>
    </transition>
    <transition name="fade-in">
      <ras-report-frequency
        class="ras-results-view-mode"
        v-if="displayMode == 2 || displayMode == 3"
        :resultPages="resultPages"
        :displayMode="displayMode"
        :blockSearchKey="blockSearchKey"
        :allSortedBlocks="allSortedBlocks"
      >
      </ras-report-frequency>
    </transition>
    <transition name="fade-in">
      <ras-report-compare-references
        class="ras-results-view-mode"
        v-if="displayMode == 4 && searchResultCount > 0"
        :loadingNewResults="loadingNewResults"
        :startDateTimestamp="startDateTimestamp"
        :allSortedBlocks="allSortedBlocks"
        :endDateTimestamp="endDateTimestamp"
      >
      </ras-report-compare-references>
    </transition>
    <transition name="fade-in">
      <ras-graph-visualization
        class="ras-results-view-mode"
        v-if="displayMode == 5 && searchResultCount > 0"
        :blockParentPageMap="blockParentPageMap"
        :linkedPagesUidSet="linkedPagesUidSet"
        :startDateTimestamp="startDateTimestamp"
        :pages="pages"
        :endDateTimestamp="endDateTimestamp"
      >
      </ras-graph-visualization>
    </transition>
    <transition name="fade-in">
      <ras-globe-visualization
        class="ras-results-view-mode"
        v-if="displayMode == 6 && searchResultCount > 0"
        :pageReferenceCountMap="pageReferenceCountMap"
      >
      </ras-globe-visualization>
    </transition>
  </div>
</template>

<script>
import rasReportFrequency from "./../views/ras-report-frequency.vue";
import rasReportUsage from "./../views/ras-report-usage.vue";
import rasReportCompareReferences from "./../views/compareReferences/ras-report-compare-references.vue";
import rasGraphVisualization from "./../views/threeDVisualization/ras-report-graph-visualization.vue";
import rasGlobeVisualization from "./../views/globeVisualization/ras-report-globe-visualization.vue";
import rasResult from "./../results/ras-result.vue";
import rasMenuBar from "./../core/ras-menu-bar.vue";
import rasHome from "./../home/ras-home.vue";

export default {
  name: "ras-search-scope-all-blocks",
  components: {
    rasReportCompareReferences,
    rasGraphVisualization: rasGraphVisualization,
    rasGlobeVisualization: rasGlobeVisualization,
    rasResult,
    rasReportFrequency,
    rasReportUsage,
    rasMenuBar,
    rasHome,
  },
  props: {
    showBlockSearchResults: Boolean,
    loadingNewResults: Boolean,
    resultPages: Array,
    allSortedBlocks: Array,
    blockSearchKey: String,
    unsortedResults: Array,
    blockParentPageMap: Object,
    linkedPagesUidSet: Set,
    pageReferenceCountMap: Object,
    resultsListNewChangesUnseen: Boolean,
    searchResultCount: Number,
    pages: Array,
    blockResults: Array,
    showIncludePagesCheckbox: Boolean,
  },
  computed: {
    displayMode: {
      get() {
        return this.$store.getters["ViewConfig/displayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateDisplayMode", value);
      },
    },
  },
  methods: {
    onRefreshSearchClicked() {
      this.$emit("refresh-search-called");
    },
    onIndicateResultsComplete() {
      this.$emit("on-indicate-results-complete");
    },
  },
};
</script>
<style scoped>
.ras-search-scope-all-blocks-container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.fade-in-enter-active {
  transition: opacity 0.8s;
}
.fade-in-enter {
  opacity: 0;
}

.ras-home-view-mode {
  height: 100%;
  overflow-y: scroll;
}

.ras-results-view-mode {
  display: flex;
  flex-flow: column;
  height: 100%;
}
</style>
