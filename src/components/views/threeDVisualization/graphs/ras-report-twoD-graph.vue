<template>
  <div class="ras-2d-graph-parent-container">
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
    <div
      id="ras-2d-graph-container"
      v-bind:class="{
        'ras-graph-updating': updatingChart == true,
        'ras-graph-updated': updatingChart == false,
      }"
    >
      <div id="ras-2d-graph"></div>
    </div>
  </div>
</template>

<script>
import roamAdapter from "../../../../adapters/roamAdapter";
import utils from "../../../../common/utils";
import dataRequestHelper from "../../../../dataPreparation/dataRequestHelper";

export default {
  name: "ras-report-2d-graph",
  mixins: [dataRequestHelper, utils, roamAdapter],
  beforeDestroy: function () {
    this.graph.pauseAnimation();
    this.graph.nodeCanvasObject(false);
    this.graph.nodeCanvasObject(null);
    this.graph.graphData({ nodes: [], links: [] });
    this.graph = null;
  },
  data() {
    return {
      timeout: false,
      graph: null,
      flyingToNode: false,
      updatingChart: true,
    };
  },
  props: {
    links: Array,
    nodes: Array,
    pageSelectedToFlyTo: Object,
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
    pageVisibilityHidden: {
      get() {
        return this.$store.getters["ViewConfig/pageVisibilityHidden"];
      },
    },
    roamPortalDisplayed: {
      get() {
        return this.$store.getters["ViewConfig/roamPortalDisplayed"];
      },
    },
    fullScreenMode: {
      get() {
        return this.$store.getters["ViewConfig/fullScreenMode"];
      },
    },
    linkedPage: {
      get() {
        return this.$store.getters["SearchConfig/linkedPage"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateLinkedPage", value);
      },
    },
  },
  watch: {
    pageVisibilityHidden(isHidden) {
      if (this.graph) {
        if (isHidden) {
          this.graph.pauseAnimation();
        } else {
          this.graph.resumeAnimation();
        }
      }
    },
    roamPortalDisplayed(isShown) {
      if (this.graph) {
        if (isShown) {
          this.graph.resumeAnimation();
        } else {
          this.graph.pauseAnimation();
        }
      }
    },
    nodes() {
      this.renderChart();
    },
    fullScreenMode() {
      this.setSize();
    },
    pageSelectedToFlyTo(selectedItem) {
      if (selectedItem && "label" in selectedItem) {
        this.flyToPage(selectedItem.label);
      }
    },
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    flyToPage(pageTitle) {
      this.flyingToNode = true;
      let selectedNode = null;
      this.nodes.forEach((node) => {
        if (node.id == pageTitle) {
          selectedNode = node;
        }
      });

      this.graph.centerAt(selectedNode.x, selectedNode.y, 1000);
      this.graph.zoom(8, 2000);
      window.setTimeout(() => {
        this.flyingToNode = false;
      }, 2000);
    },
    setSize() {
      let width = document.getElementById("ras-2d-graph-container").offsetWidth;
      let height = document.getElementById(
        "ras-2d-graph-container"
      ).offsetHeight;
      this.graph.height(height);
      this.graph.width(width);
    },
    navigateToPage(uid) {
      const url = new URL(window.location.href);
      let parts = url.hash.split("/");
      url.hash = parts.slice(0, 3).concat(["page"]).join("/");

      window.location.hash = url.hash + "/" + uid;
    },
    onNodeClicked(node, event) {
      if (event.altKey && node.id && node.id.length > 0) {
        let numLinksUpdated = 0;
        let nodeToHighlight = node;
        let connectingNodesDict = {};

        this.graph.linkVisibility((link) => {
          numLinksUpdated = numLinksUpdated + 1;

          if (link.source.id == node.id || link.target.id == node.id) {
            connectingNodesDict[link.source.id] = true;
            connectingNodesDict[link.target.id] = true;

            if (numLinksUpdated == this.links.length) {
              this.setNodesAsText(nodeToHighlight.id, connectingNodesDict);
            }
            return true;
          }

          if (numLinksUpdated == this.links.length) {
            this.setNodesAsText(nodeToHighlight, connectingNodesDict);
          }

          return false;
        });

        return true;
      }

      if (event.shiftKey && node.id && node.id.length > 0) {
        this.roamOpenSidebar(this.fetchPageUid(node.id));
        return true;
      }

      if (event.metaKey && node.id && node.id.length > 0) {
        this.openPage(this.fetchPageUid(node.id));

        window.roamPortal.hide();
        return;
      }

      if (node.id == this.linkedPage) {
        return;
      }

      window.setTimeout(() => {
        if (!this.flyingToNode) {
          this.graph.pauseAnimation();
          this.updatingChart = true;
          this.searchWithWaitingForUserInput = false;
          window.setTimeout(() => {
            this.linkedPage = node.id;
          }, 100);
        }
      }, 100);
    },
    onColorLink(link) {
      let node = this.pageGroups[link.source];

      return node.group;
    },
    setNodesAsText(nodeToHighlight, connectingNodesDict) {
      this.graph.nodeCanvasObject((node, ctx, globalScale) => {
        let label = node.id;

        label = label.length > 18 ? label.substr(0, 18) + "..." : label;

        if (label.length == 0) {
          return;
        }

        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const backgroundDimensions = [textWidth, fontSize].map(
          (n) => n + fontSize * 0.2
        );

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(
          node.x - backgroundDimensions[0] / 2,
          node.y - backgroundDimensions[1] / 2,
          ...backgroundDimensions
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (node.group == 1) {
          ctx.fillStyle = "#ec6f35";
        } else if (node.group == 0) {
          ctx.fillStyle = "#33bdea";
        } else {
          ctx.fillStyle = "green";
        }

        if (connectingNodesDict && !(node.id in connectingNodesDict)) {
          ctx.fillStyle = "#e0e0e4";
        }

        if (node.id == this.linkedPage || node.id == nodeToHighlight) {
          ctx.fillStyle = "red";
        }

        ctx.fillText(label, node.x, node.y);
      });
    },
    updateChartData() {
      this.graph.pauseAnimation();
      this.graph.graphData({ nodes: [], links: [] });
      this.graph.graphData({ nodes: this.nodes, links: this.links });
      this.setSize();
      this.graph.resumeAnimation();
    },
    renderChart() {
      const elem = document.getElementById("ras-2d-graph");

      if (this.graph) {
        this.graph.pauseAnimation();
        this.graph.graphData({ nodes: [], links: [] });
        this.graph = null;
      }

      this.graph = this.$forceGraph()(document.getElementById("ras-2d-graph"))
        .backgroundColor("white")
        .linkColor("black");

      this.setNodesAsText();
      this.setSize();

      this.graph
        .linkDirectionalParticleWidth(4)
        .nodeLabel((node) => `${node.id}`)
        .onNodeHover((node) => (elem.style.cursor = node ? "pointer" : null))
        .onNodeClick((node, event) => this.onNodeClicked(node, event))
        .graphData({ nodes: this.nodes, links: this.links })
        .onNodeDragEnd((node) => {
          node.fx = node.x;
          node.fy = node.y;
        });

      this.graph.d3Force("charge").strength(-70);

      this.graph.resumeAnimation();
      this.updatingChart = false;
    },
  },
};
</script>
<style>
#ras-2d-graph .graph-tooltip {
  background: white !important;
  font-size: 13px !important;
  border: 1px solid grey;
  border-radius: 10px;
  color: black !important;
}
</style>
<style scoped>
#ras-2d-graph-container {
  width: 100%;
  height: 100%;
}

.ras-graph-updating {
  opacity: 0.5;
  transition: opacity 0.5s linear;
}

.ras-graph-updated {
  opacity: 1;
  transition: opacity 0.5s linear;
}

.ras-2d-graph-parent-container {
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
