import dataRequestHelper from "../dataPreparation/dataRequestHelper";

export default {
  mixins: [dataRequestHelper],
  computed: {
    displayMode: {
      get() {
        return this.$store.getters["ViewConfig/displayMode"];
      },
      set(value) {
        this.$store.commit("ViewConfig/updateDisplayMode", value);
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
    linkedPage: {
      get() {
        return this.$store.getters["SearchConfig/linkedPage"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateLinkedPage", value);
      },
    },
    pageTitle: {
      get() {
        return this.$store.getters["SearchConfig/pageTitle"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updatePageTitle", value);
      },
    },
    fromQuery: {
      get() {
        return this.$store.getters["SearchConfig/fromQuery"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateFromQuery", value);
      },
    },
    toQuery: {
      get() {
        return this.$store.getters["SearchConfig/toQuery"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateToQuery", value);
      },
    },
    blockUids: {
      get() {
        return this.$store.getters["SearchConfig/blockUids"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateBlockUids", value);
      },
    },
    mentionedPageTitle: {
      get() {
        return this.$store.getters["SearchConfig/mentionedPageTitle"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateMentionedPageTitle", value);
      },
    },
    referencedBlockUid: {
      get() {
        return this.$store.getters["SearchConfig/referencedBlockUid"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateReferencedBlockUid", value);
      },
      fromQuery: {
        get() {
          return this.$store.getters["SearchConfig/fromQuery"];
        },
        set(value) {
          this.$store.commit("SearchConfig/updateFromQuery", value);
        },
      },
      toQuery: {
        get() {
          return this.$store.getters["SearchConfig/toQuery"];
        },
        set(value) {
          this.$store.commit("SearchConfig/updateToQuery", value);
        },
      },
    },
    searchScope: {
      get() {
        return this.$store.getters["SearchConfig/searchScope"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchScope", value);
      },
    },
    searchQuery: {
      get() {
        return this.$store.getters["SearchConfig/searchQuery"];
      },
      set(value) {
        this.$store.commit("SearchConfig/updateSearchQuery", value);
      },
    },
    setDisplayModeAfterResults: {
      get() {
        return this.$store.getters["ViewConfig/setDisplayModeAfterResults"];
      },
      set(value) {
        this.$store.commit(
          "ViewConfig/updateSetDisplayModeAfterResults",
          value
        );
      },
    },
    roamPortalDisplayed: {
      set(value) {
        this.$store.commit("ViewConfig/updateRoamPortalDisplayed", value);
      },
    },
  },
  methods: {
    roamPortalApiInitialize() {
      window.roamPortal = {};

      let roamPortal = window.roamPortal;
      if (!roamPortal) {
        roamPortal = {};
      }

      roamPortal.show = this.show;
      roamPortal.hide = this.hide;
      roamPortal.toggleShow = this.toggleShow;

      roamPortal.alphaQuery = (parameters) => {
        roamPortal.show();
        this.updateQueryParameters(parameters);
      };
    },
    resetAllFields() {
      this.searchQuery = "";
      this.pageTitle = "";
      this.mentionedPageTitle = "";
      this.startDateTimestamp = "";
      this.endDateTimestamp = "";
      this.fromQuery = "";
      this.toQuery = "";
      this.referencedBlockUid = "";
      this.linkedPage = "";
      this.blockUids = null;
    },
    toggleShow() {
      let rasDialog = document.getElementById("ras-roam-portal");
      if (rasDialog && rasDialog.style.display == "none") {
        this.show();
      } else {
        this.hide();
      }
    },
    show() {
      let rasDialog = document.getElementById("ras-roam-portal");
      if (!rasDialog)  {
        return;
      }

      rasDialog.style.display = "block";
      this.roamPortalDisplayed = true;

      let overlayDiv = document.getElementById("ras-overlay-div");
      if (overlayDiv) {
        overlayDiv.style.display = "block";
      }

      window.setTimeout(function () {
        let queryBox = document.getElementById("ras-query-box");
        if (queryBox) {
          queryBox.focus();
          queryBox.select();
        }
      }, 250);
    },
    hide() {
      window.setTimeout(() => {
        let rasDialog = document.getElementById("ras-roam-portal");
        if (!rasDialog) {
          return;
        }

        rasDialog.style.display = "none";
        let overlayDiv = document.getElementById("ras-overlay-div");
        if (overlayDiv) {
          overlayDiv.style.display = "none";
        }

        this.roamPortalDisplayed = false;
      }, 50);
    },
    updateQueryParameters(parameters) {
      if (!parameters) {
        return;
      }

      this.resetAllFields();
      this.searchScope = 0;
      this.displayMode = -1;

      if (parameters.blockUids) {
        this.searchScope = 3;
        this.searchWithWaitingForUserInput = false;
        this.blockUids = parameters.blockUids;
      }

      if (parameters.searchQuery && parameters.searchQuery.value) {
        this.searchWithWaitingForUserInput = false;
        this.searchQuery = parameters.searchQuery.value;
      }

      if (parameters.inPage && parameters.inPage.url) {
        let title = this.fetchPageTitleFromUrl(parameters.inPage.url);
        if (title && title.length > 0) {
          this.pageTitle = title;
        }
      }
    },
  },
};
