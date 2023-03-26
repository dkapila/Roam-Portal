<template>
  <div>
    <div v-if="updatingResults" class="ras-loading-new-results-spinner"></div>
    <div
      v-infinite-scroll="loadMoreImages"
      infinite-scroll-disabled="busy"
      infinite-scroll-distance="10"
      class="ras-results-container"
    >
      <viewer
        ref="rasViewer"
        class="ras-image-viewer"
        v-if="images"
        :images="images"
      >
        <img v-for="src in images" :src="src" :key="src" />
      </viewer>
      <div
        v-bind:key="idx"
        class="ras-result"
        v-for="(blockResult, idx) in loadedImages"
        v-on:click="navigateToPage($event, blockResult)"
        @mouseleave="onHoverPageIndex = null"
        @mouseover="onHoverPageIndex = idx"
      >
        <div class="ras-result-image-container">
          <div class="ras-result-title-container">
            <div class="ras-result-title">
              <span class="ras-page-title-span">{{
                blockResult["title"]
              }}</span>
            </div>
          </div>
          <div class="ras-result-image-block">
            <img
              class="ras-result-image"
              :src="blockResult['imageLink']"
              width="225"
            />
          </div>
          <transition name="fade">
            <div
              class="ras-result-image-slideshow-container"
              v-if="onHoverPageIndex == idx"
            >
              <div
                class="ras-result-image-slideshow-container-text"
                v-on:click.stop="openViewer(idx)"
              >
                Slideshow
              </div>
              <div
                class="ras-result-image-slideshow-container-arrow"
                v-on:click.stop="openViewer(idx)"
              >
                ↗
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import "viewerjs/dist/viewer.css";
import Viewer from "v-viewer";
import Vue from "vue";
import roamAdapter from "../../../adapters/roamAdapter";

Vue.use(Viewer);

export default {
  name: "ras-result-image",
  props: {
    blockSearchKey: String,
    blockResults: Array,
  },
  mixins: [roamAdapter],
  data() {
    return {
      images: [],
      updatingResults: true,
      timeout: false,
      itemsToLoad: 20,
      totalImages: null,
      loadedImages: [],
      allImageBlocks: [],
      onHoverPageIndex: null,
    };
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
    fullScreenMode: {
      get() {
        return this.$store.getters["ViewConfig/fullScreenMode"];
      },
    },
    matchExactPhrase: {
      get() {
        return this.$store.getters["SearchConfig/matchExactPhrase"];
      },
    },
  },
  watch: {
    fullScreenMode(val) {
      if (val) {
        this.loadMoreImages();
      }
    },
    loadedImages() {
      let images = [];
      this.loadedImages.forEach((image) => {
        images.push(image.imageLink);
      });

      this.images = images;
    },
    totalImages() {
      this.loadedImages = this.allImageBlocks.slice(0, this.itemsToLoad);
    },
    blockResults() {
      clearTimeout(this.timeout);

      this.renderResults();
    },
  },
  mounted() {
    clearTimeout(this.timeout);
    this.renderResults();
  },
  methods: {
    openViewer(index) {
      let viewer = this.$refs.rasViewer.$viewer;
      if (viewer && index != null) {
        viewer.index = index;
        viewer.show();
      }
    },
    loadMoreImages() {
      let newImages = this.allImageBlocks.slice(
        this.loadedImages.length,
        this.loadedImages.length + this.itemsToLoad
      );
      this.loadedImages.push(...newImages);
    },
    renderResults() {
      let self = this;

      this.updatingResults = true;
      this.timeout = window.setTimeout(() => {
        self.setData(self);
        self.updatingResults = false;
      }, 200);
    },
    setData(self) {
      self.nonPages = [];
      self.allImageBlocks = [];

      self.blockResults.forEach((blockResult) => {
        if (self.blockSearchKey in blockResult) {
          let tokens = this.$markdownIt().parse(
            blockResult[self.blockSearchKey],
            {}
          );
          let imageLinks = this.getImageLinks(tokens);

          imageLinks.forEach((imageLink) => {
            let block = blockResult;
            block.imageLink = imageLink;
            self.allImageBlocks.push(block);
          });
        }
      });

      self.totalImages = self.allImageBlocks.length;
    },
    getImageLinks(tokens) {
      let getImageLinksArr = (tokens, imageLinks) => {
        tokens.forEach((token) => {
          if (token.tag == "img" && token.attrs) {
            if (token.attrs[0][0] == "src") {
              let link = token.attrs[0][1];
              imageLinks.push(link);
            }
          }

          if (token.children && token.children.length > 0) {
            imageLinks = getImageLinksArr(token.children, imageLinks);
          }
        });

        return imageLinks;
      };

      return getImageLinksArr(tokens, []);
    },
    navigateToPage(event, result) {
      let uid = result.isPage ? result.pageUid : result.blockUid;

      if (event.shiftKey) {
        this.roamOpenSidebar(uid);
        return true;
      }

      const url = new URL(window.location.href);
      let parts = url.hash.split("/");
      url.hash = parts.slice(0, 3).concat(["page"]).join("/");

      window.location.hash = url.hash + "/" + uid;
      window.roamPortal.hide();
    },
  },
};
</script>
<style>
.viewer-footer .viewer-toolbar {
  font-size: 0px !important;
}
</style>
<style scoped>
.ras-page-title-span {
  color: #ec6f35 !important;
}

.ras-visualize-page-button {
  float: right;
  color: #9769ff !important;
  font-weight: 400;
  font-size: 13px !important;
}

.ras-visualize-page-button:hover {
  color: #ca124c !important;
}

.ras-result-title-container {
  margin-bottom: 5px;
}

.ras-result-image-slideshow-container-arrow {
  position: relative;
  top: 1px;
  color: #eb6f34 !important;
  font-family: Inter, sans-serif !important;
}

.ras-result-image-slideshow-container-text {
  color: #1ab11a !important;
}

.ras-result-image-slideshow-container-text:hover {
  color: #eb6f34 !important;
}

.ras-result-image-slideshow-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
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

.ras-image-viewer {
  display: none;
}

.ras-results-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 0em;
  grid-auto-rows: 200px;
  grid-gap: 5px;
}

.ras-results-container {
  height: 100%;
  overflow-y: scroll;
  width: 100%;
}

.ras-result:hover {
  background-color: #e8e8e8 !important;
}

.ras-result {
  cursor: pointer;
  background: white;
  padding: 10px 15px;
  border-top: 0px;
  width: 100%;
  overflow: hidden;
}

.ras-block-actions-container {
  display: flex;
  justify-content: flex-end;
}

.ras-block-action-item {
  margin-left: 10px;
}

span.ras-result-page-title {
  font-size: 16px !important;
}

.ras-result-time {
  text-align: right;
}

.ras-result-string {
  overflow-x: scroll;
}

.ras-result-image {
  transition: transform 0.5s, filter 0.5s ease;
  filter: brightness(92%);
}

.ras-result-image:hover {
  transform: scale(1.2);
  filter: brightness(100%);
}

.ras-result-string > span {
  color: #868686 !important;
  overflow-x: scroll;
}

.ras-result-image-container {
  display: flex;
  flex-flow: column;
}

.ras-result-image-block {
  max-height: 135px;
  overflow: hidden;
}

.fade-enter-active {
  transition: opacity 0.25s;
}
.fade-enter/* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.ras-result-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 200px;
  overflow: hidden;
  border: none;
  font-size: 14px !important;
  text-align: left;
  font-weight: 600;
  color: #ec6f35 !important;
}
</style>
