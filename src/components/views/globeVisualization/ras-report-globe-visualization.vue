<template>
  <div>
    <div v-if="updatingChart" class="ras-loading-new-results-spinner"></div>
    <div class="ras-globe-controls">
      <rasDropdownSelect
        class="ras-globe-mentioned-locations-dropdown"
        v-model="selectedMentionedLocation"
        :searchTerm="selectedMentionedLocation"
        placeholderText="Search locations mentioned"
        :loadingNewResults="updatingChart"
        @onSearchBlur="onSearchBlur"
        @onSearchFocussed="onSearchFocussed"
        :searchWithDebounceSeconds="500"
        :listOfOptions="listOfLocations"
      />

      <rasLocationSearch
        class="ras-search-location-container"
        placeholderText="Search any location"
        v-model="selectedSearchedLocation"
        :latitude="latitude"
        :longitude="longitude"
        @onSearchBlur="onPhotonSearchBlur"
        @onSearchFocussed="onPhotonSearchFocussed"
        :searchTerm="selectedSearchedLocation"
        :loadingNewResults="updatingChart"
      />

      <div class="ras-tabs-container ras-tab-maximize-button-container">
        <div
          class="ras-tabs-button"
          v-on:click="showMentionedCountries = !showMentionedCountries"
        >
          <span v-if="!showMentionedCountries">Show Countries</span>
          <span v-if="showMentionedCountries">Hide Countries</span>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div class="ras-globe-dropdown-info" v-if="photonSearchDropdownShown">
        <a target="_blank" href="https://github.com/komoot/photon"
          >photon software</a
        >
        is open source and licensed under&nbsp;<a
          target="_blank"
          href="http://www.apache.org/licenses/LICENSE-2.0.txt"
          >Apache License, Version 2.0</a
        >
      </div>
      <div class="ras-globe-dropdown-info" v-if="searchDropdownShown">
        <div>
          <div>
            This extension contains a file with several cities/countries as
            shown here. There are 2 ways to add a location on this globe:
          </div>
          <ol class="ras-globe-dropdown-info-list">
            <li>
              If a [[page name]] matches one of the places from this list, it is
              shown on the globe.
              <span class="ras-globe-dropdown-info-bold"
                >&nbsp;Your data is not collected for any processing.</span
              >
            </li>
            <li>
              Alternatively, add a
              <span class="ras-globe-dropdown-info-bold">Latitude</span> and a
              <span class="ras-globe-dropdown-info-bold">Longitude</span>
              attribute on any page to include it in this list (and in the
              globe). Use the search box on the right to find the latitude and
              longitude values for any place.
            </li>
          </ol>
          <div class="ras-globe-dropdown-info-citation">
            City list is provided by
            <a target="_blank" href="https://simplemaps.com/data/world-cities"
              >simplemaps</a
            >
            under a
            <a
              target="_blank"
              href="https://creativecommons.org/licenses/by/4.0/"
              >Creative Commons Attribution 4.0 License</a
            >.
          </div>
        </div>
      </div>
    </transition>

    <ras-report-globe
      v-if="this.dataLoaded"
      :listOfNonCountries="listOfNonCountries"
      :locationSelected="locationSelected"
      :resultsCountryCount="resultsCountryCount"
      :countryFeatures="countryFeatures"
    />
  </div>
</template>
<script>
import dataRequestHelper from "../../../dataPreparation/dataRequestHelper";
import utils from "../../../common/utils";
import rasDropdownSelect from "@/components/shared/ras-dropdown-select.vue";
import rasLocationSearch from "./globe/ras-location-search.vue";
import rasReportGlobe from "./globe/ras-report-globe.vue";

export default {
  name: "ras-report-globe-visualization",
  components: {
    rasReportGlobe,
    rasDropdownSelect,
    rasLocationSearch,
  },
  data() {
    return {
      nodes: [],
      iso3: {},
      updatingChart: true,
      resultsCount: {},
      resultsCountryCount: {},
      countryToIso3: {},
      pages: null,
      selectedSearchedLocation: null,
      selectedMentionedLocation: null,
      listOfCountries: [],
      listOfLocations: [],
      listOfLocationsWithReferences: [],
      pageReferencesCount: {},
      countryDict: {},
      latLongPageMap: {},
      dataLoaded: false,
      usaStatesMap: {},
      searchDropdownShown: false,
      photonSearchDropdownShown: false,
      countryBbox: {},
    };
  },
  mixins: [dataRequestHelper, utils],
  props: {
    pageReferenceCountMap: Object,
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
    globeModeEnabled: {
      get() {
        return this.$store.getters["ViewConfig/globeModeEnabled"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateGlobeModeEnabled", value);
      },
    },
    countryFeatures: {
      get() {
        return this.$store.getters["DatasetsConfig/countryFeatures"];
      },
      set(value) {
        this.$store.commit("DatasetsConfig/updateCountryFeatures", value);
      },
    },
    usaStates: {
      get() {
        return this.$store.getters["DatasetsConfig/usaStates"];
      },
      set(value) {
        this.$store.commit("DatasetsConfig/updateUsaStates", value);
      },
    },
    countryLanguages: {
      get() {
        return this.$store.getters["DatasetsConfig/countryLanguages"];
      },
      set(value) {
        this.$store.commit("DatasetsConfig/updateCountryLanguages", value);
      },
    },
    cities: {
      get() {
        return this.$store.getters["DatasetsConfig/cities"];
      },
      set(value) {
        this.$store.commit("DatasetsConfig/updateCities", value);
      },
    },
  },
  watch: {
    selectedSearchedLocation(item) {
      if (item == null) {
        return;
      }

      this.latitude = item.coordinates[1];
      this.longitude = item.coordinates[0];

      this.locationSelected = {
        label: item.name,
        latitude: item.coordinates[1],
        longitude: item.coordinates[0],
      };
    },
    selectedMentionedLocation(item) {
      if (item == null) {
        return;
      }

      if (item.type == "Country") {
        this.countrySelectedToFlyTo(item);
        return;
      }

      this.latitude = item.lat;
      this.longitude = item.lng;

      this.locationSelected = {
        label: item.label,
        latitude: item.lat,
        longitude: item.lng,
      };
    },
    pageReferenceCountMap() {
      this.updateChart();
    },
  },
  async mounted() {
    if (!this.countryFeatures) {
      const res = await fetch(
        "https://roam-portal.dharamkapila.repl.co/countryMetadata.json"
      );

      const countryMetadata = await res.json();
      const res2 = await fetch(
        "https://roam-portal.dharamkapila.repl.co/worldCities.json"
      );

      const cities = await res2.json();

      this.cities = cities;
      this.countryLanguages = countryMetadata.country_languages;
      this.usaStates = countryMetadata.usa_states;
      this.countryFeatures = countryMetadata.geojson_features;
      this.updateChart();
    } else {
      this.updateChart();
    }
  },
  methods: {
    onPhotonSearchFocussed() {
      this.photonSearchDropdownShown = true;
    },
    onPhotonSearchBlur() {
      window.setTimeout(() => {
        this.photonSearchDropdownShown = false;
      }, 200);
    },
    onSearchFocussed() {
      this.searchDropdownShown = true;
    },
    onSearchBlur() {
      window.setTimeout(() => {
        this.searchDropdownShown = false;
      }, 200);
    },
    countrySelectedToFlyTo(item) {
      let countryCentralCoordinates = this.getCenterOfPolygon(
        item.countryBoundingBox
      );

      this.latitude = countryCentralCoordinates.lat;
      this.longitude = countryCentralCoordinates.lng;
    },
    getCenterOfPolygon(bbox) {
      let latMax = bbox[1] > bbox[3] ? bbox[1] : bbox[3];
      let latMin = bbox[1] > bbox[3] ? bbox[3] : bbox[1];
      let longMax = bbox[0] > bbox[2] ? bbox[0] : bbox[2];
      let longMin = bbox[0] > bbox[2] ? bbox[2] : bbox[0];

      let centerLat = latMin + (latMax - latMin) / 2;
      let centerLong = longMin + (longMax - longMin) / 2;
      return {
        lng: centerLong,
        lat: centerLat,
      };
    },
    updateChart() {
      this.updatingChart = true;

      this.timeout = window.setTimeout(() => {
        clearTimeout(this.timeout);
        this.getDate();
      }, 200);
    },
    buildIso3CountryMappings() {
      this.countryToIso3 = {};
      this.iso3 = {};

      let countryLanguagesArr = this.countryLanguages;
      for (let i = 0; i < countryLanguagesArr.length; i++) {
        if (countryLanguagesArr[i].language == "English") {
          countryLanguagesArr[i].data.forEach((country) => {
            this.iso3[country.alpha3] = country.name;
            this.resultsCount[country.alpha3] = {
              countryList: [],
              count: 0,
              type: "Country",
            };
          });
        }

        countryLanguagesArr[i].data.forEach((country) => {
          this.countryToIso3[country.name] = country.alpha3;
        });
      }

      this.countryBbox = {};

      this.countryFeatures.forEach((feature) => {
        this.countryBbox[feature.properties.ADM0_A3.toLowerCase()] =
          feature.bbox;
      });
    },
    getAllDestinationMentions() {
      for (let i = 0; i < this.pages.length; i++) {
        let page = this.pages[i][0];
        let title = page.title;
        let uid = page.uid;

        if (this.latLongPageMap[title]) {
          this.resultsCount[title] = {
            count: this.pageReferenceCountMap[uid],
            type: "Custom",
          };
        } else if (this.countryToIso3[title]) {
          let countryList =
            this.resultsCount[this.countryToIso3[title]].countryList;

          this.resultsCount[this.countryToIso3[title]] = {
            countryList: [
              {
                name: title,
                count: this.pageReferenceCountMap[uid],
              },
              ...countryList,
            ],
            type: "Country",
          };
        } else if (this.cityLatLong[title]) {
          this.resultsCount[title] = {
            count: this.pageReferenceCountMap[uid],
            type: "City",
          };
        }

        if (!page.Refs || page.Refs.length == 0) {
          continue;
        }
      }
    },
    buildCityLatLong() {
      let totalCities = this.cities.length;
      let cityNamesLatLong = {};

      for (let i = 0; i < totalCities; i++) {
        let item = this.cities[i];

        let lat = item.lat;
        let long = item.lng;

        if (item.population > 20000) {
          cityNamesLatLong[item.c] = [lat, long];
          cityNamesLatLong[item.ca] = [lat, long];
          this.resultsCount[item.ca] = { count: 0, type: "City" };

          if (cityNamesLatLong[item.c] != cityNamesLatLong[item.ca]) {
            this.resultsCount[item.c] = { count: 0, type: "City" };
          }
        }

        if (item.adminName && this.usaStatesMap[item.adminName]) {
          cityNamesLatLong[item.ca + ", " + this.usaStatesMap[item.adminName]] =
            [lat, long];
          this.resultsCount[
            item.ca + ", " + this.usaStatesMap[item.adminName]
          ] = { count: 0, type: "City" };
        }

        let country = this.iso3[item.iso3.toLowerCase()];

        if (country) {
          let countryName = country;
          cityNamesLatLong[item.c + ", " + countryName] = [lat, long];
          cityNamesLatLong[item.ca + ", " + countryName] = [lat, long];

          this.resultsCount[item.c + ", " + countryName] = {
            count: 0,
            type: "City",
          };
          this.resultsCount[item.ca + ", " + countryName] = {
            count: 0,
            type: "City",
          };

          if (countryName == "United Kingdom") {
            countryName = "UK";
            cityNamesLatLong[item.c + ", " + countryName] = [lat, long];
            cityNamesLatLong[item.ca + ", " + countryName] = [lat, long];

            this.resultsCount[item.c + ", " + countryName] = {
              count: 0,
              type: "City",
            };
            this.resultsCount[item.ca + ", " + countryName] = {
              count: 0,
              type: "City",
            };
          }
          if (countryName == "United States of America") {
            countryName = "USA";
            cityNamesLatLong[item.c + ", " + countryName] = [lat, long];
            cityNamesLatLong[item.ca + ", " + countryName] = [lat, long];

            this.resultsCount[item.c + ", " + countryName] = {
              count: 0,
              type: "City",
            };
            this.resultsCount[item.ca + ", " + countryName] = {
              count: 0,
              type: "City",
            };
          }
          if (countryName == "Czechia") {
            countryName = "Czech Republic";
            cityNamesLatLong[item.c + ", " + countryName] = [lat, long];
            cityNamesLatLong[item.ca + ", " + countryName] = [lat, long];

            this.resultsCount[item.c + ", " + countryName] = {
              count: 0,
              type: "City",
            };
            this.resultsCount[item.ca + ", " + countryName] = {
              count: 0,
              type: "City",
            };
          }
        }
        if (item.cs) {
          cityNamesLatLong[item.cas] = [lat, long];
        } else if (item.adminName) {
          cityNamesLatLong[item.c + ", " + item.adminName] = [lat, long];
        }

        if (item.cas) {
          cityNamesLatLong[item.cas] = [lat, long];
          this.resultsCount[item.cas] = { count: 0, type: "City" };

          if (country) {
            if (country == "United States of America") {
              cityNamesLatLong[item.cas + ", " + "USA"] = [lat, long];
              this.resultsCount[item.cas + ", " + "USA"] = {
                count: 0,
                type: "City",
              };
            } else if (country == "United Kingdom") {
              cityNamesLatLong[item.cas + ", " + "UK"] = [lat, long];
              this.resultsCount[item.cas + ", " + "UK"] = {
                count: 0,
                type: "City",
              };
            } else {
              cityNamesLatLong[item.cas + ", " + country] = [lat, long];
              this.resultsCount[item.cas + ", " + country] = {
                count: 0,
                type: "City",
              };
            }
          }
        } else if (item.adminName) {
          let cityState = item.ca + ", " + item.adminName;
          cityNamesLatLong[cityState] = [lat, long];
          this.resultsCount[cityState] = { count: 0, type: "City" };
          if (country) {
            if (country == "United States of America") {
              cityNamesLatLong[cityState + ", " + "USA"] = [lat, long];
              this.resultsCount[cityState + ", " + "USA"] = {
                count: 0,
                type: "City",
              };
            } else if (country == "United Kingdom") {
              cityNamesLatLong[cityState + ", " + "UK"] = [lat, long];
              this.resultsCount[cityState + ", " + "UK"] = {
                count: 0,
                type: "City",
              };
            } else {
              cityNamesLatLong[cityState + ", " + country] = [lat, long];
              this.resultsCount[cityState + ", " + country] = {
                count: 0,
                type: "City",
              };
            }
          }
        }
      }

      return cityNamesLatLong;
    },
    buildUsaStatesMap() {
      this.usaStatesMap = {};

      Object.keys(this.usaStates).forEach((key) => {
        this.usaStatesMap[this.usaStates[key]] = key;
      });
    },
    getDate() {
      this.resultsCount = {};
      this.latLongPageMap = this.fetchLatitudeLongitudePages();
      this.pages = this.fetchAllPages(Object.keys(this.pageReferenceCountMap));
      this.buildIso3CountryMappings();
      this.buildUsaStatesMap();

      this.cityLatLong = this.buildCityLatLong();

      this.getAllDestinationMentions();

      let dropDownLocationList = [];
      let listOfCountries = [];
      let listOfNonCountries = [];

      let resultsCountryCount = {};
      for (let item in this.resultsCount) {
        let type = this.resultsCount[item].type;

        if (
          this.resultsCount[item].countryList &&
          this.resultsCount[item].countryList.length > 0
        ) {
          let totalMentions = 0;
          for (let j = 0; j < this.resultsCount[item].countryList.length; j++) {
            let listItem = this.resultsCount[item].countryList[j];
            let mentionString =
              listItem.count == 1
                ? "1 mention of this page"
                : listItem.count + " mentions of this page";
            totalMentions += listItem.count;

            let countryBoundingBox = null;
            if (this.countryBbox[item]) {
              countryBoundingBox = this.countryBbox[item];
            }

            let country = {
              label: listItem.name,
              countryBoundingBox: countryBoundingBox,
              referenceCountString: mentionString,
              referenceCount: listItem.count,
              type: this.resultsCount[item].type,
            };

            listOfCountries.push(country);
            dropDownLocationList.push(country);
          }

          resultsCountryCount[item] = this.resultsCount[item];
          resultsCountryCount[item].count = totalMentions;

          continue;
        }

        let mentionCount = this.resultsCount[item].count;
        let mentionString =
          mentionCount == 1
            ? "1 mention of this page"
            : mentionCount + " mentions of this page";

        if (type == "Country") {
          let countryItem = this.iso3[item];
          if (!countryItem) {
            continue;
          }

          let countryName = this.iso3[item];
          resultsCountryCount[item] = this.resultsCount[item];

          let countryBoundingBox = null;
          if (this.countryBbox[item]) {
            countryBoundingBox = this.countryBbox[item];
          }

          let country = {
            label: countryName,
            countryBoundingBox: countryBoundingBox,
            referenceCountString: mentionString,
            referenceCount: mentionCount,
            type: this.resultsCount[item].type,
          };
          listOfCountries.push(country);
          dropDownLocationList.push(country);
        }
        if (type == "City") {
          let cityName = item;
          let cityCoordinates = this.cityLatLong[item];

          let city = {
            label: cityName,
            lat: cityCoordinates[0],
            lng: cityCoordinates[1],
            color: this.getRandomColor(),
            size: 0.25,
            referenceCountString: mentionString,
            referenceCount: mentionCount,
            type: this.resultsCount[item].type,
          };

          dropDownLocationList.push(city);
          listOfNonCountries.push(city);
        }
        if (type == "Custom") {
          let placeName = item;
          let place = this.latLongPageMap[placeName];

          let placeObj = {
            label: placeName,
            lat: place.lat,
            lng: place.lng,
            color: this.getRandomColor(),
            size: 0.25,
            referenceCountString: mentionString,
            referenceCount: mentionCount,
            type: this.resultsCount[item].type,
          };

          dropDownLocationList.push(placeObj);
          listOfNonCountries.push(placeObj);
        }
      }

      this.listOfLocations = dropDownLocationList.slice().sort((a, b) => {
        if (a["referenceCount"] < b["referenceCount"]) {
          return 1;
        }
        if (a["referenceCount"] > b["referenceCount"]) {
          return -1;
        }

        return 0;
      });

      this.listOfCountries = listOfCountries;
      this.listOfNonCountries = listOfNonCountries.filter(
        (item) => item["referenceCount"] > 0
      );
      this.resultsCountryCount = resultsCountryCount;
      this.updatingChart = false;

      window.setTimeout(() => {
        this.dataLoaded = true;
      }, 200);
    },
  },
};
</script>
<style>
.ras-search-location-container .vs__dropdown-menu {
  left: -255px;
}
</style>
<style scoped>
.ras-globe-dropdown-info-bold {
  font-weight: bold;
}

.ras-globe-dropdown-info-citation {
  color: grey !important;
}

.ras-globe-dropdown-info-list {
  padding-left: 20px;
  margin-bottom: 0px;
}

.ras-globe-dropdown-info {
  position: absolute;
  bottom: 0px;
  z-index: 2013;
  font-size: 12px !important;
  padding-top: 4px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 4px;
  width: 100%;
  border-top: 2px dotted #ababab !important;
  background: #f9fafb;
}

.ras-globe-mentioned-locations-dropdown {
  flex-basis: 250px;
  margin-left: 5px;
}

.ras-search-location-container {
  flex-basis: 250px;
  margin-left: 5px;
}

.ras-tabs-container {
  display: flex;
  margin-left: 20px;
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

.ras-globe-controls {
  display: flex;
}

.ras-globe-controls {
  margin-left: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
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

.fade-enter-active {
  transition: opacity 0.4s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
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
