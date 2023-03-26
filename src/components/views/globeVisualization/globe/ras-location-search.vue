<template>
  <v-select
    class="ras-dropdown-input"
    label="name"
    :filterable="false"
    :disabled="loadingNewResults"
    :placeholder="placeholderText"
    v-model="selectedItem"
    :options="options"
    :clearSearchOnSelect="clearSearchOnSelect"
    :autocomplete="autocomplete"
    @search:blur="onSearchBlur"
    @search:focus="onSearchFocussed"
    @search="onSearch"
  >
    <template slot="no-options">
      <div class="ras-location-search-dropdown-placeholder">
        Type to search any location.
      </div>
    </template>
    <template slot="option" slot-scope="option">
      <div class="ras-select-dropdown-container">
        <div class="ras-dropdown-options">
          <span v-if="option.name"> {{ option.name }}</span>
          <span v-if="option.city">, {{ option.city }}</span>
          <span v-if="option.state">, {{ option.state }}</span>
          <span v-if="option.country">, {{ option.country }}</span>
        </div>
        <div class="ras-dropdown-show-lat-long">
          <span
            >({{ parseFloat(option.coordinates[1]).toFixed(2) }},
            {{ parseFloat(option.coordinates[0]).toFixed(2) }})</span
          >
        </div>
      </div>
    </template>
  </v-select>
</template>
<script>
import utils from "../../../../common/utils";

export default {
  name: "ras-location-search",
  data: () => ({
    options: [],
    timeout: false,
    clearSearchOnSelect: false,
    selectedItem: null,
    autocomplete: null,
  }),
  props: {
    loadingNewResults: Boolean,
    placeholderText: String,
    searchTerm: Object,
    latitude: Number,
    longitude: Number,
  },
  mixins: [utils],
  watch: {
    selectedItem(val) {
      this.$emit("input", val);
    },
  },
  mounted() {
    this.selectedItem = this.searchTerm;
    this.autocomplete = this.getRandomUuid();
  },
  methods: {
    onSearchBlur() {
      this.$emit("onSearchBlur");
    },
    onSearchFocussed() {
      this.selectedItem = null;
      this.$emit("onSearchFocussed");
    },
    onSearch(search, loading) {
      loading(true);
      clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        clearTimeout(this.timeout);
        fetch(
          `https://photon.komoot.io/api/?q=${search.trim()}&lat=${
            this.latitude
          }&lon=${this.longitude}`
        ).then((res) => {
          res.json().then((json) => {
            let features = json.features;
            let options = [];
            features.forEach((item) => {
              if (item.properties.name) {
                options.push({
                  ...item.properties,
                  ...item.geometry,
                });
              }
            });

            loading(false);
            this.options = options;
          });
        });
      }, 500);
    },
  },
};
</script>

<style>
.ras-dropdown-input .vs__selected-options {
  flex-basis: 85%;
}

.ras-dropdown-input .vs__search::placeholder {
  color: #6b6e6f !important;
}

.ras-dropdown-input .vs__selected {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
}

.ras-dropdown-input .vs__dropdown-toggle {
  height: 30px;
  overflow: hidden;
}

.ras-dropdown-input .vs__actions {
  cursor: pointer;
}

.ras-dropdown-input .ras-list-footer {
  padding-left: 20px;
  color: grey !important;
}

.ras-dropdown-input .vs__dropdown-menu {
  top: 34px;
  width: 678px;
  height: 300px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  z-index: 2018;
}
</style>

<style scoped>
.ras-location-search-dropdown-placeholder {
  padding-left: 10px;
  font-size: 15px !important;
  font-style: italic;
  color: grey !important;
}

.ras-search-location-container {
  width: 200px;
}

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

.ras-dropdown-options {
  flex-basis: 400px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.ras-select-dropdown-right-container {
  display: inline-flex;
  justify-content: flex-end;
}

.loader {
  text-align: center;
  color: #bbbbbb !important;
}
</style>
