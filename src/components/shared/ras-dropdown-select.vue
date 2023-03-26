<template>
  <v-select
    class="ras-dropdown-input-with-options"
    :placeholder="placeholderText"
    :disabled="loadingNewResults"
    :options="paginated"
    :filterable="false"
    v-model="selectedItem"
    @open="onOpen"
    @close="onClose"
    :autocomplete="autocomplete"
    :clearSearchOnSelect="clearSearchOnSelect"
    @search="onSearch"
    @search:blur="onSearchBlur"
    @search:focus="onSearchFocussed"
  >
    <template v-slot:option="option">
      <div class="ras-select-dropdown-container">
        <span class="ras-dropdown-options-page-name">{{ option.label }}</span>
        <div
          class="ras-select-dropdown-right-container"
          v-if="option.referenceCountString || option.type"
        >
          <span
            class="ras-dropdown-options-count"
            v-if="option.referenceCountString"
            >{{ option.referenceCountString }}</span
          >
          <span class="ras-dropdown-options-type">&nbsp;{{ option.type }}</span>
        </div>
      </div>
    </template>
    <template #list-footer>
      <li ref="load" class="ras-list-footer" v-show="hasNextPage">More...</li>
    </template>
  </v-select>
</template>
<script>
import Fuse from "fuse.js";
import utils from "../../common/utils";

export default {
  name: "InfiniteScroll",
  data: () => ({
    observer: null,
    limit: 10,
    search: "",
    clearSearchOnSelect: true,
    selectedItem: null,
    autocomplete: null,
  }),
  props: {
    listOfOptions: Array,
    loadingNewResults: Boolean,
    placeholderText: String,
    searchTerm: Object,
    searchWithDebounceSeconds: Number,
  },
  mixins: [utils],
  mounted() {
    this.observer = new IntersectionObserver(this.infiniteScroll);
    this.selectedItem = this.searchTerm;
    this.autocomplete = this.getRandomUuid();
  },
  computed: {
    filtered() {
      const fuse = new Fuse(this.listOfOptions, {
        keys: ["label", "type", "uniqueIdentifier"],
        shouldSort: true,
        threshold: 0.01,
        distance: 10000000,
        ignoreLocation: true,
      });

      return this.search.length ? fuse.search(this.search) : fuse.list;
    },
    paginated() {
      return this.filtered.slice(0, this.limit);
    },
    hasNextPage() {
      return this.paginated.length < this.filtered.length;
    },
  },
  watch: {
    selectedItem(val) {
      this.$emit("input", val);
    },
  },
  methods: {
    onSearchBlur() {
      this.$emit("onSearchBlur");
    },
    onSearchFocussed() {
      this.selectedItem = null;
      this.$emit("onSearchFocussed");
    },
    onSearch(query, loading) {
      if (!this.searchWithDebounceSeconds) {
        this.search = query;
        return;
      }

      loading(true);
      clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        clearTimeout(this.timeout);
        this.search = query;
        loading(false);
      }, this.searchWithDebounceSeconds);
    },
    async onOpen() {
      if (this.hasNextPage) {
        await this.$nextTick();
        this.observer.observe(this.$refs.load);
      }
    },
    onClose() {
      this.observer.disconnect();
    },
    async infiniteScroll([{ isIntersecting, target }]) {
      if (isIntersecting) {
        const ul = target.offsetParent;
        const scrollTop = target.offsetParent.scrollTop;
        this.limit += 300;
        await this.$nextTick();
        ul.scrollTop = scrollTop;
      }
    },
  },
};
</script>

<style>
.ras-dropdown-with-footnote li.vs__no-options::after {
  content: "This list only shows references within your search query.";
  align-items: left;
  padding: 5px 15px 15px 25px;
  float: left;
}

.ras-dropdown-input-with-options .vs__selected-options {
  flex-basis: 85%;
}

.ras-dropdown-input-with-options .vs__search::placeholder {
  color: #6b6e6f !important;
}

.ras-dropdown-input-with-options .vs__selected {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
}

.ras-dropdown-input-with-options .vs__dropdown-toggle {
  height: 30px;
  overflow: hidden;
}

.ras-dropdown-input-with-options .vs__actions {
  cursor: pointer;
}
.ras-term-1 .vs__dropdown-menu {
  left: 0px;
}

.ras-term-2 .vs__dropdown-menu {
  left: -194px;
}

.ras-term-3 .vs__dropdown-menu {
  left: -388px;
}

.ras-dropdown-input-with-options .ras-list-footer {
  padding-left: 20px;
  color: grey !important;
}

.ras-dropdown-input-with-options .vs__dropdown-menu {
  top: 34px;
  width: 678px;
  height: 300px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  z-index: 2013;
}
</style>

<style scoped>
.ras-report-tabs-container {
  display: flex;
  justify-content: center;
}

.ras-report-tabs-button {
  padding: 5px;
  cursor: pointer;
  color: #ababab !important;
}

.ras-report-tabs-button:hover {
  color: #ef7f4b !important;
}

.ras-tab-active {
  color: #ec6f35 !important;
  font-weight: 500;
}

.ras-tab-active:hover {
  color: #ec6f35 !important;
}

.ras-dropdown-options-count {
  color: #ec6f35 !important;
}

.ras-dropdown-options-type {
  color: grey !important;
  width: 50px;
  text-align: right;
  margin-left: 20px;
}

.ras-input {
  padding: 0px 3px 0px 0px;
  flex-basis: 400px;
}

.ras-parent-input-container {
  display: flex;
  padding: 10px 10px 10px 10px;
}

.ras-select-dropdown-container {
  display: flex;
  justify-content: space-between;
}

.ras-dropdown-options-page-name {
  flex-basis: 340px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.ras-select-dropdown-right-container {
  justify-content: flex-end;
}

.loader {
  text-align: center;
  color: #bbbbbb !important;
}
</style>
