<template>
  <div class="ras-3d-graph-parent-container">
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
    <div
      id="ras-3d-graph-container"
      v-bind:class="{
        'ras-graph-updating': updatingChart == true,
        'ras-graph-updated': updatingChart == false,
      }"
    >
      <div id="ras-3d-graph"></div>
    </div>
  </div>
</template>

<script>
import utils from "../../../../common/utils";
import dataRequestHelper from "../../../../dataPreparation/dataRequestHelper";
import roamAdapter from "../../../../adapters/roamAdapter";

export default {
  name: "ras-report-threeD-graph",
  mixins: [dataRequestHelper, utils, roamAdapter],
  beforeDestroy: function () {
    this.destroy();
    this.graph = null;
  },
  data() {
    return {
      timeout: false,
      updatingChart: true,
      graph: null,
      flyingToNode: false,
      meshObjects: [],
      spriteObjects: [],
    };
  },
  props: {
    graphTextEnabled: Boolean,
    nodes: Array,
    links: Array,
    pageSelectedToFlyTo: Object,
  },
  computed: {
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
      window.setTimeout(() => {
        this.setSize();
      }, 400);
    },
    graphTextEnabled() {
      this.graphTextEnabled ? this.setNodesAsText() : this.setNodesAsSphere();
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

      const distance = 80;
      const distRatio =
        1 +
        distance / Math.hypot(selectedNode.x, selectedNode.y, selectedNode.z);

      this.graph.cameraPosition(
        {
          x: selectedNode.x * distRatio,
          y: selectedNode.y * distRatio,
          z: selectedNode.z * distRatio,
        },
        selectedNode,
        3000
      );

      window.setTimeout(() => {
        this.flyingToNode = false;
      }, 3000);
    },
    setSize() {
      let width = document.getElementById("ras-3d-graph-container").offsetWidth;
      let height = document.getElementById(
        "ras-3d-graph-container"
      ).offsetHeight;
      this.graph.height(height);
      this.graph.width(width);
    },
    onNodeClicked(node, event) {
      if (event.altKey && node.id && node.id.length > 0) {
        this.graph.linkVisibility((link) => {
          if (link.source.id == node.id || link.target.id == node.id) {
            return true;
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
    setSphereColor(node) {
      if (node.group == 1) {
        return "#ec6f35";
      } else if (node.group == 0) {
        return "#33bdea";
      } else {
        return "green";
      }
    },
    setNodesAsSphere() {
      this.graph.pauseAnimation();
      this.graph.nodeColor((node) => this.setSphereColor(node));
      this.graph.nodeThreeObject(false);
      this.graph.resumeAnimation();
    },
    setNodesAsText() {
      this.graph.pauseAnimation();
      this.graph.nodeThreeObject((node) => {
        const obj = new this.$three.Mesh(
          new this.$three.SphereGeometry(10),
          new this.$three.MeshBasicMaterial({
            depthWrite: false,
            transparent: true,
            opacity: 0,
          })
        );

        let spriteText = node.id;

        spriteText =
          spriteText.length > 18
            ? spriteText.substr(0, 18) + "..."
            : spriteText;

        if (spriteText.length == 0) {
          return;
        }

        const sprite = new this.$spriteText(spriteText);
        sprite.material.depthWrite = false;
        sprite.color = node.color;
        sprite.textHeight = 4;

        if (node.group == 1) {
          sprite.color = "#ec6f35";
        } else if (node.group == 0) {
          sprite.color = "#33bdea";
        } else {
          sprite.color = "green";
        }

        if (node.id == this.linkedPage) {
          sprite.textHeight = 6;
          sprite.color = "red";
        }

        if (this.spriteObjects == null) {
          this.spriteObjects = [];
        }

        if (this.meshObjects == null) {
          this.meshObjects = [];
        }

        this.spriteObjects.push(sprite);
        this.meshObjects.push(obj);

        obj.add(sprite);

        return obj;
      });

      this.graph.resumeAnimation();
    },
    destroy() {
      if (this.graph) {
        this.graph.pauseAnimation();

        this.spriteObjects.forEach((spriteObject) => {
          spriteObject.geometry.dispose();
          spriteObject.material.dispose();
          spriteObject = undefined;
        });

        this.meshObjects.forEach((meshObject) => {
          meshObject.geometry.dispose();
          meshObject.material.dispose();
          meshObject = undefined;
        });

        this.spriteObjects = null;
        this.spriteObjects = [];

        this.meshObjects = null;
        this.meshObjects = [];

        this.graph.nodeThreeObject(false);
        this.graph.graphData({ nodes: [], links: [] });
      }
    },
    renderChart() {
      const elem = document.getElementById("ras-3d-graph");

      if (this.graph) {
        this.destroy();
        this.setSize();
        this.graph.graphData({ nodes: this.nodes, links: this.links });
        this.graphTextEnabled ? this.setNodesAsText() : this.setNodesAsSphere();
        this.graph.resumeAnimation();
        this.updatingChart = false;
        return;
      }

      this.graph = this.$forceGraph3D({ controlType: "trackball" })(
        document.getElementById("ras-3d-graph")
      )
        .linkResolution(2)
        .linkOpacity(0.5)
        .linkWidth((link) => {
          if (
            link.source == this.linkedPage ||
            link.target == this.linkedPage
          ) {
            return 0.8;
          } else {
            return 0.6;
          }
        });

      this.graph
        .linkDirectionalParticleWidth(4)
        .nodeLabel((node) => `${node.id}`)
        .onNodeHover((node) => {
          if (node) {
            elem.style.cursor = "pointer";
          } else {
            elem.style.cursor = null;
          }
        })
        .linkColor("skyblue")
        .onNodeClick((node, event) => this.onNodeClicked(node, event));

      let distanceBetweenNodes = -90;
      this.graph.d3Force("charge").strength(distanceBetweenNodes);
      this.graphTextEnabled ? this.setNodesAsText() : this.setNodesAsSphere();

      this.graph.pauseAnimation();
      this.setSize();
      this.graph.graphData({ nodes: this.nodes, links: this.links });
      this.graph.ngraphPhysics({
        springLength: 30,
        springCoeff: 0.0008,
        gravity: -1.2,
        theta: 0.8,
        dragCoeff: 0.02,
        timeStep: 20,
      });

      this.graph.resumeAnimation();
      this.updatingChart = false;
    },
  },
};
</script>
<style>
#ras-3d-graph .scene-tooltip {
  color: white !important;
  font-size: 14px;
  border: 1px solid #628498;
  border-radius: 5px;
  padding: 2px;
}
</style>
<style scoped>
#ras-3d-graph-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.ras-3d-graph-parent-container {
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
