<template>
  <div class="ras-search-scope-image-blocks-container">
    <transition name="fade-in">
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
          v-if="imageDisplayMode == -1"
          @refresh-search-called="onRefreshSearchClicked"
        >
        </ras-home>
      </keep-alive>
    </transition>
    <transition name="fade-in">
      <ras-result-image
        class="ras-results-view-mode"
        v-if="imageDisplayMode == 0 && showBlockSearchResults"
        :blockResults="blockResults"
        :blockSearchKey="blockSearchKey"
      >
      </ras-result-image>
    </transition>
  </div>
</template>
<script>
import rasResultImage from "./../views/image/ras-result-image.vue";
import rasMenuBar from "./../core/ras-menu-bar.vue";
import rasHome from "./../home/ras-home.vue";

export default {
  name: "ras-search-scope-all-blocks",
  components: {
    rasResultImage,
    rasMenuBar,
    rasHome,
  },
  data() {
    return {};
  },
  props: {
    resultsListNewChangesUnseen: Boolean,
    searchResultCount: Number,
    showBlockSearchResults: Boolean,
    blockSearchKey: String,
    blockResults: Array,
  },
  mixins: [],
  computed: {
    imageDisplayMode: {
      get() {
        return this.$store.getters["ViewConfig/imageDisplayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateImageDisplayMode", value);
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
.ras-search-scope-image-blocks-container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.fade-enter-in-active {
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
