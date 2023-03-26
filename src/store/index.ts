import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const Twitter = {
  state: {
    showConversationInTweet: false,
    includeMediaInTweet: false,
  },
  getters: {
    showConversationInTweet: (state) => {
      return state.showConversationInTweet;
    },
    includeMediaInTweet: (state) => {
      return state.includeMediaInTweet;
    },
  },
  mutations: {
    updateShowConversationInTweet(state, value) {
      state.showConversationInTweet = value;
    },
    updateIncludeMediaInTweet(state, value) {
      state.includeMediaInTweet = value;
    },
  },
  namespaced: true,
};

const Globe = {
  state: {
    showMentionedCountries: false,
    latitude: 0,
    longitude: 0,
    altitude: 4,
  },
  getters: {
    showMentionedCountries: (state) => {
      return state.showMentionedCountries;
    },
    latitude: (state) => {
      return state.latitude;
    },
    longitude: (state) => {
      return state.longitude;
    },
    altitude: (state) => {
      return state.altitude;
    },
  },
  mutations: {
    updateShowMentionedCountries(state, value) {
      state.showMentionedCountries = value;
    },
    updateLatitude(state, value) {
      state.latitude = value;
    },
    updateLongitude(state, value) {
      state.longitude = value;
    },
    updateAltitude(state, value) {
      state.altitude = value;
    },
  },
  namespaced: true,
};

const DatasetsConfig = {
  state: {
    countryFeatures: null,
    countryLanguages: null,
    cities: null,
    usaStates: {},
  },
  getters: {
    countryFeatures: (state) => {
      return state.countryFeatures;
    },
    countryLanguages: (state) => {
      return state.countryLanguages;
    },
    cities: (state) => {
      return state.cities;
    },
    usaStates: (state) => {
      return state.usaStates;
    },
  },
  mutations: {
    updateCountryFeatures(state, value) {
      state.countryFeatures = value;
    },
    updateCountryLanguages(state, value) {
      state.countryLanguages = value;
    },
    updateCities(state, value) {
      state.cities = value;
    },
    usaStates(state, value) {
      state.usaStates = value;
    },
  },
  namespaced: true,
};

const ReferenceViewSearchConfig = {
  state: {
    compareSearchTerm1: null,
    compareSearchTerm2: null,
    compareSearchTerm3: null,
  },
  getters: {
    compareSearchTerm1: (state) => {
      return state.compareSearchTerm1;
    },
    compareSearchTerm2: (state) => {
      return state.compareSearchTerm2;
    },
    compareSearchTerm3: (state) => {
      return state.compareSearchTerm3;
    },
  },
  mutations: {
    updateCompareSearchTerm1(state, value) {
      state.compareSearchTerm1 = value;
    },
    updateCompareSearchTerm2(state, value) {
      state.compareSearchTerm2 = value;
    },
    updateCompareSearchTerm3(state, value) {
      state.compareSearchTerm3 = value;
    },
  },
  namespaced: true,
};

const ViewConfig = {
  state: {
    imageDisplayMode: -1,
    tweetDisplayMode: -1,
    displayMode: -1,
    compareDisplayMode: 1,
    fullScreenMode: document.fullscreen,
    roamPortalDisplayed: false,
    graphVisualizationDisplayMode: 1,
    pageVisibilityHidden: document.hidden,
    setDisplayModeAfterResults: null,
  },
  getters: {
    tweetDisplayMode: (state) => {
      return state.tweetDisplayMode;
    },
    imageDisplayMode: (state) => {
      return state.imageDisplayMode;
    },
    setDisplayModeAfterResults: (state) => {
      return state.setDisplayModeAfterResults;
    },
    roamPortalDisplayed: (state) => {
      return state.roamPortalDisplayed;
    },
    fullScreenMode: (state) => {
      return state.fullScreenMode;
    },
    displayMode: (state) => {
      return state.displayMode;
    },
    compareDisplayMode: (state) => {
      return state.compareDisplayMode;
    },
    pageVisibilityHidden: (state) => {
      return state.pageVisibilityHidden;
    },
    graphVisualizationDisplayMode: (state) => {
      return state.graphVisualizationDisplayMode;
    },
  },
  mutations: {
    updateImageDisplayMode(state, value) {
      state.imageDisplayMode = value;
    },
    updateTweetDisplayMode(state, value) {
      state.tweetDisplayMode = value;
    },
    updateSetDisplayModeAfterResults(state, value) {
      state.setDisplayModeAfterResults = value;
    },
    updatePageVisibilityHidden(state, value) {
      state.pageVisibilityHidden = value;
    },
    updateRoamPortalDisplayed(state, value) {
      state.roamPortalDisplayed = value;
    },
    updateFullScreenMode(state, value) {
      state.fullScreenMode = value;
    },
    updateDisplayMode(state, value) {
      state.displayMode = value;
    },
    updateCompareDisplayMode(state, value) {
      state.compareDisplayMode = value;
    },
    updateGraphVisualizationDisplayMode(state, value) {
      state.graphVisualizationDisplayMode = value;
    },
  },
  namespaced: true,
};

const SearchConfig = {
  state: {
    scopeUsedForRecentMostSearch: null,
    searchWithWaitingForUserInput: true,
    searchScope: 0,
    linkedPage: "",
    matchExactPhrase: false,
    showCodeBlocks: false,
    showResultsWithIncorrectSpelling: false,
    onlyIncludeBlocksWithReactions: false,
    includeReferenceBlocks: true,
    pageTitle: "",
    referencedBlockUid: "",
    mentionedPageTitle: "",
    searchQuery: "",
    fromQuery: "",
    toQuery: "",
    blockUids: null,
    startDateTimestamp: "",
    endDateTimestamp: "",
    searchRefreshPending: false,
    regularExpressionsEnabled: false,
    totalConsecutiveSearchesWithNoResults: 0,
  },
  getters: {
    blockUids: (state) => {
      return state.blockUids;
    },
    totalConsecutiveSearchesWithNoResults: (state) => {
      return state.totalConsecutiveSearchesWithNoResults;
    },
    onlyIncludeBlocksWithReactions: (state) => {
      return state.onlyIncludeBlocksWithReactions;
    },
    scopeUsedForRecentMostSearch: (state) => {
      return state.scopeUsedForRecentMostSearch;
    },
    searchRefreshPending: (state) => {
      return state.searchRefreshPending;
    },
    searchWithWaitingForUserInput: (state) => {
      return state.searchWithWaitingForUserInput;
    },
    searchScope: (state) => {
      return state.searchScope;
    },
    linkedPage: (state) => {
      return state.linkedPage;
    },
    startDateTimestamp: (state) => {
      return state.startDateTimestamp;
    },
    endDateTimestamp: (state) => {
      return state.endDateTimestamp;
    },
    searchQuery: (state) => {
      return state.searchQuery;
    },
    fromQuery: (state) => {
      return state.fromQuery;
    },
    toQuery: (state) => {
      return state.toQuery;
    },
    pageTitle: (state) => {
      return state.pageTitle;
    },
    referencedBlockUid: (state) => {
      return state.referencedBlockUid;
    },
    mentionedPageTitle: (state) => {
      return state.mentionedPageTitle;
    },
    matchExactPhrase: (state) => {
      return state.matchExactPhrase;
    },
    regularExpressionsEnabled: (state) => {
      return state.regularExpressionsEnabled;
    },
    showCodeBlocks: (state) => {
      return state.showCodeBlocks;
    },
    showResultsWithIncorrectSpelling: (state) => {
      return state.showResultsWithIncorrectSpelling;
    },
    includeReferenceBlocks: (state) => {
      return state.includeReferenceBlocks;
    },
  },
  mutations: {
    updateBlockUids(state, value) {
      state.blockUids = value;
    },
    updateTotalConsecutiveSearchesWithNoResults(state, value) {
      state.totalConsecutiveSearchesWithNoResults = value;
    },
    updateOnlyIncludeBlocksWithReactions(state, value) {
      state.onlyIncludeBlocksWithReactions = value;
    },
    updateScopeUsedForRecentMostSearch(state, value) {
      state.scopeUsedForRecentMostSearch = value;
    },
    updateSearchRefreshPending(state, value) {
      state.searchRefreshPending = value;
    },
    updateSearchWithWaitingForUserInput(state, value) {
      state.searchWithWaitingForUserInput = value;
    },
    updateSearchScope(state, scopeValue) {
      state.searchScope = scopeValue;
    },
    updateLinkedPage(state, pageTitle) {
      state.linkedPage = pageTitle;
    },
    updateStartDateTimestamp(state, timestamp) {
      state.startDateTimestamp = timestamp;
    },
    updateEndDateTimestamp(state, timestamp) {
      state.endDateTimestamp = timestamp;
    },
    updateSearchQuery(state, query) {
      state.searchQuery = query;
    },
    updateFromQuery(state, query) {
      state.fromQuery = query;
    },
    updateToQuery(state, query) {
      state.toQuery = query;
    },
    updatePageTitle(state, title) {
      state.pageTitle = title;
    },
    updateMentionedPageTitle(state, title) {
      state.mentionedPageTitle = title;
    },
    updateReferencedBlockUid(state, blockRef) {
      state.referencedBlockUid = blockRef;
    },
    updateMatchExactPhrase(state, isSet) {
      state.matchExactPhrase = isSet;
    },
    updateRegularExpressionsEnabled(state, isSet) {
      state.regularExpressionsEnabled = isSet;
    },
    updateShowCodeBlocks(state, isSet) {
      state.showCodeBlocks = isSet;
    },
    updateShowResultsWithIncorrectSpelling(state, isSet) {
      state.showResultsWithIncorrectSpelling = isSet;
    },
    updateIncludeReferenceBlocks(state, isSet) {
      state.includeReferenceBlocks = isSet;
    },
  },
  namespaced: true,
};

export default new Vuex.Store({
  modules: {
    Globe: Globe,
    SearchConfig: SearchConfig,
    ViewConfig: ViewConfig,
    ReferenceViewSearchConfig: ReferenceViewSearchConfig,
    DatasetsConfig: DatasetsConfig,
    Twitter: Twitter,
  },
});
