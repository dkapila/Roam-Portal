f
<template>
  <div class="ras-globe-parent-container">
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
    <div
      id="ras-3d-globe-container"
      v-bind:class="{
        'ras-graph-updating': updatingChart == true,
        'ras-graph-updated': updatingChart == false,
      }"
    ></div>
  </div>
</template>

<script>
import * as d3 from "d3";
import Globe from "globe.gl";
import Vue from "vue";

import utils from "../../../../common/utils";
import dataRequestHelper from "../../../../dataPreparation/dataRequestHelper";

Object.defineProperty(Vue.prototype, "$globe", { value: Globe });

export default {
  name: "ras-report-globe-graph",
  beforeDestroy: function () {
    this.destroy();
  },
  mixins: [dataRequestHelper, utils],
  data() {
    return {
      circleLabels: [],
      timeout: false,
      updatingChart: true,
      globe: null,
    };
  },
  props: {
    locationSelected: Object,
    listOfNonCountries: Array,
    countryFeatures: Array,
    resultsCountryCount: Object,
  },
  computed: {
    showMentionedCountries: {
      get() {
        return this.$store.getters["Globe/showMentionedCountries"];
      },
      set(value) {
        this.$store.commit("Globe/updateShowMentionedCountries", value);
      },
    },
    latitude: {
      get() {
        return this.$store.getters["Globe/latitude"];
      },
      set(value) {
        this.$store.commit("Globe/updateLatitude", value);
      },
    },
    longitude: {
      get() {
        return this.$store.getters["Globe/longitude"];
      },
      set(value) {
        this.$store.commit("Globe/updateLongitude", value);
      },
    },
    altitude: {
      get() {
        return this.$store.getters["Globe/altitude"];
      },
      set(value) {
        this.$store.commit("Globe/updateAltitude", value);
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
      set(value) {
        this.$store.commit("ViewConfig/updateRoamPortalDisplayed", value);
      },
    },
    fullScreenMode: {
      get() {
        return this.$store.getters["ViewConfig/fullScreenMode"];
      },
    },
  },
  watch: {
    locationSelected() {
      this.setCircleLabel();
    },
    listOfNonCountries() {
      this.renderChart();
    },
    showMentionedCountries() {
      this.setCountryPolygons();
    },
    latitude() {
      this.setPointOfView();
    },
    longitude() {
      this.setPointOfView();
    },
    pageVisibilityHidden(isHidden) {
      if (this.globe && isHidden) {
        this.globe.pauseAnimation();
      } else {
        this.globe.resumeAnimation();
      }
    },
    roamPortalDisplayed(isShown) {
      if (this.globe && isShown) {
        this.globe.resumeAnimation();
      } else {
        this.globe.pauseAnimation();
      }
    },
    fullScreenMode() {
      window.setTimeout(() => {
        this.setSize();
      }, 400);
    },
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    setCircleLabel() {
      this.globe
        .labelsData([this.locationSelected])
        .labelLat((d) => d.latitude)
        .labelLng((d) => d.longitude)
        .labelText((d) => d.label)
        .labelAltitude(0.02)
        .labelSize(1)
        .labelDotRadius(0.7)
        .labelResolution(1)
        .labelColor(() => "rgba(255, 165, 0, 1)");
    },
    setSize() {
      let width = document.getElementById("ras-3d-globe-container").offsetWidth;
      let height = document.getElementById(
        "ras-3d-globe-container"
      ).offsetHeight;
      this.globe.height(height - 5);
      this.globe.width(width);
    },
    destroy() {
      if (this.globe) {
        this.globe.pauseAnimation();
        this.globe = null;
      }
    },
    setPointOfView(duration) {
      let delay = duration != null && duration != undefined ? duration : 3000;

      const mapCenter = { lat: this.latitude, lng: this.longitude };
      if (this.globe) {
        this.globe.pointOfView(mapCenter, delay);
      }
    },
    setCountryPolygons() {
      if (!this.showMentionedCountries && this.globe) {
        this.globe
          .polygonsData([])
          .polygonCapColor(() => {})
          .polygonSideColor(() => {})
          .polygonStrokeColor(() => {})
          .polygonLabel(() => {})
          .onPolygonHover(() => {});

        return;
      }

      if (this.showMentionedCountries && this.globe) {
        this.globe.pauseAnimation();
        this.updatingChart = true;

        const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlGn);

        let maxVal = 0;

        Object.keys(this.resultsCountryCount).forEach((result) => {
          let count = this.resultsCountryCount[result].count;
          if (count > maxVal) {
            maxVal = count;
          }
        });

        maxVal = maxVal * 2;

        colorScale.domain([0, maxVal]);

        const getVal = (feat) => {
          if (
            this.resultsCountryCount[feat.properties.ADM0_A3_IS.toLowerCase()]
          ) {
            return this.resultsCountryCount[
              feat.properties.ADM0_A3_IS.toLowerCase()
            ].count;
          }
        };

        this.globe
          .polygonsData(this.countryFeatures)
          .polygonAltitude(0.01)
          .polygonCapColor((feat) => colorScale(getVal(feat)))
          .polygonSideColor(() => "#ffffaa00")
          .polygonStrokeColor(() => "#111")
          .polygonLabel(({ properties: d }) => {
            return `<b style="color:black;">${d.NAME}</b> <br />`;
          })
          .onPolygonHover((hoverD) =>
            this.globe.polygonAltitude((d) => (d === hoverD ? 0.01 : 0.01))
          )
          .polygonsTransitionDuration(300);

        window.setTimeout(() => {
          this.globe.resumeAnimation();
          this.updatingChart = false;
        }, 200);
      }
    },
    setLocations() {
      if (this.listOfNonCountries.length > 0) {
        this.globe
          .pointsData(this.listOfNonCountries)
          .pointAltitude("size")
          .pointColor("color")
          .pointRadius(0.3)
          .onPointClick((point, event) => {
            if (event.shiftKey) {
              this.roamOpenSidebar(this.fetchPageUid(point.label));
              return true;
            }

            this.openPage(this.fetchPageUid(point.label));
            window.roamPortal.hide();
          })
          .pointLabel((d) => {
            return `<b style="color:black">${d.label} ${d.referenceCountString}</b> <br />`;
          });
      }
    },
    renderChart() {
      this.updatingChart = true;

      if (this.globe) {
        this.globe.pauseAnimation();
        this.globe = null;
      }

      const elem = document.getElementById("ras-3d-globe-container");
      this.globe = this.$globe()(elem);
      this.globe
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-day.jpg")
        .backgroundImageUrl(
          "//unpkg.com/three-globe/example/img/night-sky.png"
        );

      this.setCountryPolygons();
      this.setLocations();
      this.setPointOfView(0);
      this.setSize();
      this.globe.resumeAnimation();
      this.updatingChart = false;
    },
  },
};
</script>
<style scoped>
#ras-3d-globe-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.ras-graph-updating {
  opacity: 0.5;
  transition: opacity 0.5s linear;
}

.ras-graph-updated {
  opacity: 1;
  transition: opacity 0.5s linear;
}

.ras-globe-parent-container {
  height: 100%;
  width: 100%;
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
