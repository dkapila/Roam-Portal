import dataPreparation from "./dataPreparation";
import roamAdapter from "../adapters/roamAdapter";
import utils from "../common/utils";

export default {
  mixins: [roamAdapter, utils, dataPreparation],
  methods: {
    fetchPageTitleFromUrl(pageUrl) {
      const url = new URL(pageUrl);
      let uid = url.hash.split("/")[4];
      if (!uid || uid.length == 0) {
        return this.getTodaysDateRoamFormat();
      }

      let data = [];

      try {
        data = this.roamFetchPageTitle(uid);
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      if (!data || data.length == 0 || data[0].length == 0) {
        return null;
      }

      let result = data[0][0];
      let pageTitle = "";

      if (result.title) {
        pageTitle = result.title;
      }

      if (result.parents) {
        pageTitle = result.parents[0].title;
      }

      return pageTitle;
    },
    fetchImageBlocks() {
      let data = [];

      try {
        data = this.roamFetchImageBlocks();
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      return data;
    },
    fetchPageUid(title) {
      let data = [];

      try {
        data = this.roamFetchPageUid(title)[0][0].uid;
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      return data;
    },
    fetchBlocksStartingWith(value) {
      let data = [];

      try {
        data = this.roamFetchBlocksStartingWith(value);
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      return data;
    },
    fetchLatitudeLongitudePages() {
      if (!("roamAlphaAPI" in window)) {
        return [];
      }

      let latitudePages =
        this.roamFetchAttributePageWithAttributeName("Latitude");
      let longitudePages =
        this.roamFetchAttributePageWithAttributeName("Longitude");

      let latitudeUidMap = {};
      latitudePages.forEach((page) => {
        let latitude = page[0].string;
        let uid = page[0]._children[0]["uid"];
        latitudeUidMap[uid] = latitude;
      });

      let longitudeUidMap = {};
      longitudePages.forEach((page) => {
        let longitude = page[0].string;
        let uid = page[0]._children[0]["uid"];
        longitudeUidMap[uid] = longitude;
      });

      let commonUids = [];

      Object.keys(latitudeUidMap).forEach((uid) => {
        if (uid in longitudeUidMap) {
          commonUids.push(uid);
        }
      });

      let blocks = this.fetchBlockDetails(commonUids, true);

      let latLongPageMap = {};

      blocks.forEach((block) => {
        let attributeParentMap =
          "title" in block[0] ? block[0].title : block[0].string;
        let latitude = parseFloat(
          latitudeUidMap[block[0].uid].replaceAll("Latitude::", "")
        );
        let longitude = parseFloat(
          longitudeUidMap[block[0].uid].replaceAll("Longitude::", "")
        );

        if (isNaN(latitude) || isNaN(longitude)) {
          return;
        }

        if (
          latitude > 90 ||
          latitude < -90 ||
          longitude > 180 ||
          longitude < -180
        ) {
          return;
        }

        latLongPageMap[attributeParentMap] = {
          lat: latitude,
          lng: longitude,
          uid: block[0].uid,
        };
      });

      return latLongPageMap;
    },
    fetchAllPages(uidSet) {
      let data = [];

      try {
        data = this.roamFetchAllPages(uidSet);
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      return data;
    },
    fetchAllPageWithReverseReferences(uidSet) {
      let data = [];

      try {
        data = this.roamFetchAllPageWithReverseReferences(uidSet);
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      return data;
    },
    fetchFullCacheData() {
      let blocks = [];

      try {
        blocks = this.fetchDataFromApi("", "");
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      return blocks;
    },
    fetchAttributePagesDict() {
      let data = [];

      let attrPages = {};
      try {
        data = this.roamFetchAttributePage();
        data.forEach((item) => {
          if (item[0] && item[0].refs && item[0].refs[0]) {
            const pageName = item[0].refs[0].title;
            attrPages[pageName] = true;
          }
        });
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      return attrPages;
    },
    fetchAllDailyNotesDict() {
      let data = [];

      let dailyNotesDict = {};
      try {
        data = this.roamFetchDailyNotePages();

        data.forEach((item) => {
          if (item[0] && item[0].title) {
            dailyNotesDict[item[0].title] = true;
          }
        });
      } catch (err) {
        throw new Error("Error fetching data from the Roam API: " + err);
      }

      return dailyNotesDict;
    },
    addToResultSet(
      item,
      startDateTimestamp,
      endDateTimestamp,
      blocks,
      blockParentPageMap,
      blockUidStringMap,
      linkedPagesUidSet,
      pageReferenceCountMap,
      uncountedReferences,
      searchScope,
      onlyIncludeBlocksWithReactions
    ) {
      let block = item[0];
      let page = item[1];

      if (
        block.id in blockParentPageMap ||
        (onlyIncludeBlocksWithReactions &&
          (!block.emojis || block.emojis.length == 0))
      ) {
        return;
      }

      let blockEditTime = parseInt(block.time, 10);
      let start = startDateTimestamp ? parseInt(startDateTimestamp, 10) : 0;
      let end = endDateTimestamp ? parseInt(endDateTimestamp, 10) : Date.now();

      if (blockEditTime >= start && blockEditTime <= end) {
        if (searchScope == 2) {
          let twitterLink = this.getTweetLink(block.string);

          if (!twitterLink) {
            return;
          }

          block.tweetId = twitterLink;
        }

        blockUidStringMap[block.uid] = block.string;

        if (block.refs && block.refs.length > 0) {
          block.refs.forEach((refItem) => {
            if (refItem.title) {
              linkedPagesUidSet.add(refItem.uid);
              pageReferenceCountMap[refItem.uid] =
                (pageReferenceCountMap[refItem.uid] || 0) + 1;
            }

            if (refItem.string) {
              blockUidStringMap[refItem.uid] = refItem.string;
            }
          });
        }

        if (block._refs && block._refs.length > 0) {
          block._refs.forEach((blockRefItem) => {
            uncountedReferences.add(blockRefItem.uid);
          });
        }

        blockParentPageMap[block.id] = page.title;
        linkedPagesUidSet.add(page.uid);

        block.emojiReactions = block.emojis;
        block.blockId = block.id;
        block.blockTime = block.time;
        block.blockUid = block.uid;
        block.fullString = block.string;
        block.pageUid = page.uid;
        page.pageId = page.id;

        blocks.push({ ...block, ...page });
      }
    },
    fetchData({
      searchScope = 0,
      startDateTimestamp = "",
      endDateTimestamp = "",
      pageTitle = "",
      mentionedPageTitle = "",
      includeReferenceBlocks = false,
      containsBlockRef = "",
      searchString = "",
      showResultsWithIncorrectSpelling = false,
      linkedPage = "",
      blockUids = null,
      matchExactPhrase = false,
      regularExpressionsEnabled = false,
      onlyIncludeBlocksWithReactions = false,
    } = {}) {
      let blocks = [];
      let uncountedReferences = new Set();
      let blockParentPageMap = {};
      let linkedPagesUidSet = new Set();
      let pageReferenceCountMap = {};
      let blockUidStringMap = {};

      let linkedPageBlockRefList = [];
      if (linkedPage) {
        let linkedPageParentBlocks =
          this.roamFetchAllNestedParentBlocksOfMentionPage(
            linkedPage,
            startDateTimestamp,
            endDateTimestamp
          );
        let linkedPageChildBlocks =
          this.roamFetchAllNestedChildBlocksOfMentionPage(
            linkedPage,
            startDateTimestamp,
            endDateTimestamp
          );
        let blocksInLinkedPage = this.fetchBlocksWithParents({
          pageTitle: linkedPage,
          startDateTimestamp,
          endDateTimestamp,
        });

        let linkedPageBlocks = [
          ...linkedPageParentBlocks,
          ...linkedPageChildBlocks,
          ...blocksInLinkedPage,
        ];

        linkedPageBlocks.forEach((linkedPageBlock) => {
          linkedPageBlockRefList.push(linkedPageBlock[0].uid);
        });
      }

      let processResults = (result, includeReverseReferences = false) => {
        let blockList = [];

        let blockPageUidMap = {};
        let pageUidTitleMap = {};

        result.forEach((res) => {
          if (res[1] && res[0]) {
            const { uid, title } = res[1];
            pageUidTitleMap[uid] = { title, uid };
            const blockUid = res[0].uid;
            blockList.push(blockUid);
            blockPageUidMap[blockUid] = uid;
          }
        });

        result.forEach((res) => {
          if (res[1] && res[0]) {
            const { uid, title } = res[1];
            pageUidTitleMap[uid] = { title, uid };
            const blockUid = res[0].uid;
            blockList.push(blockUid);
            blockPageUidMap[blockUid] = uid;
          }
        });

        let resultBlocks = this.fetchBlocks(
          blockList,
          includeReverseReferences,
          false,
          onlyIncludeBlocksWithReactions
        );

        resultBlocks.forEach((resultBlock) => {
          this.addToResultSet(
            {
              0: resultBlock[0],
              1: pageUidTitleMap[blockPageUidMap[resultBlock[0].uid]],
            },
            startDateTimestamp,
            endDateTimestamp,
            blocks,
            blockParentPageMap,
            blockUidStringMap,
            linkedPagesUidSet,
            pageReferenceCountMap,
            uncountedReferences,
            searchScope,
            onlyIncludeBlocksWithReactions
          );
        });
      };

      let queryResults = [];

      if (
        blockUids ||
        searchString.length == 0 ||
        showResultsWithIncorrectSpelling ||
        mentionedPageTitle ||
        containsBlockRef ||
        pageTitle ||
        linkedPage ||
        searchScope != 0
      ) {
        let blockRefList = null;
        if (linkedPageBlockRefList && blockUids) {
          blockRefList = [...new Set(linkedPageBlockRefList.concat(blockUids))];
        } else if (blockUids) {
          blockRefList = blockUids;
        } else if (linkedPageBlockRefList && linkedPageBlockRefList.length > 0) {
          blockRefList = linkedPageBlockRefList;
        }

        let scopeSearchString = "";
        if (searchScope == 1) {
          scopeSearchString = "![";
        } else if (searchScope == 2) {
          scopeSearchString = "https://twitter.com/";
        } else {
          includeReferenceBlocks = false;
        }

        let queryResults = this.fetchBlocksWithParents({
          startDateTimestamp: startDateTimestamp,
          endDateTimestamp: endDateTimestamp,
          pageTitle: pageTitle,
          mentionedPageTitle: mentionedPageTitle,
          containsBlockRef: containsBlockRef,
          blockRefList: blockRefList,
          searchString: scopeSearchString,
          onlyIncludeBlocksWithReactions: onlyIncludeBlocksWithReactions,
        });

        processResults(queryResults, includeReferenceBlocks);
      } else if (searchString.length > 1 && !regularExpressionsEnabled) {
        if (matchExactPhrase) {
          queryResults = this.fetchBlocksWithParents({
            searchString: searchString,
            onlyIncludeBlocksWithReactions: onlyIncludeBlocksWithReactions,
          });
        } else {
          let longestWord = searchString.split(" ").sort(function (a, b) {
            return b.length - a.length;
          })[0];
          let permutations =
            longestWord.length > 5
              ? [
                  longestWord,
                  longestWord.toLowerCase(),
                  longestWord.toUpperCase(),
                  longestWord.charAt(0).toUpperCase() + longestWord.slice(1),
                ]
              : [...new Set(this.getStringCasePermutations(longestWord))];

          permutations.forEach((permutation) => {
            const results = this.fetchBlocksWithParents({
              searchString: permutation,
              onlyIncludeBlocksWithReactions: onlyIncludeBlocksWithReactions,
            });
            queryResults.push(...results);
          });
        }
      }

      processResults(queryResults, includeReferenceBlocks);

      let level = 0;

      while ([...uncountedReferences].length != 0) {
        level = level + 1;
        queryResults = this.fetchBlocksWithParents({
          blockRefList: [...uncountedReferences],
        });
        uncountedReferences = new Set();
        processResults(queryResults, includeReferenceBlocks);

        if (level >= 3) {
          break;
        }
      }

      if (regularExpressionsEnabled && searchString.length > 0) {
        let uidList = [];
        if (blocks.length > 0) {
          return;
        }

        blocks.forEach((block) => {
          uidList.push(block.blockUid);
        });

        blocks = [];
        uncountedReferences = new Set();
        blockParentPageMap = {};
        linkedPagesUidSet = new Set();
        pageReferenceCountMap = {};
        blockUidStringMap = {};

        let queryResults = this.fetchBlocksWithParents({
          regularExpressionsEnabled: true,
          searchString: searchString,
          blockRefList: uidList,
          onlyIncludeBlocksWithReactions: onlyIncludeBlocksWithReactions,
        });

        processResults(queryResults, includeReferenceBlocks);
      }

      blocks.forEach((block) => {
        if (block.refs && block.refs.length > 0) {
          block.referenceBlocks = block.refs;
          block.fullString = this.getFullString(
            blockUidStringMap,
            block.string,
            0
          );
        }
      });

      if (
        !blockUids &&
        (searchScope != 0 ||
          pageTitle.length > 0 ||
          mentionedPageTitle.length > 0 ||
          onlyIncludeBlocksWithReactions ||
          containsBlockRef.length > 0 ||
          linkedPage.length > 0)
      ) {
        return {
          blocks: blocks,
          blockParentPageMap: blockParentPageMap,
          linkedPagesUidSet: linkedPagesUidSet,
          pageReferenceCountMap: pageReferenceCountMap,
        };
      }

      let pageUidList = this.blockUids;

      this.fetchPages(
        pageUidList,
        startDateTimestamp,
        endDateTimestamp,
        searchString,
        regularExpressionsEnabled
      ).forEach((item) => {
        const portalBlock = { ...item[0] };
        portalBlock.isPage = true;
        portalBlock.blockTime = item[0].time;
        portalBlock.pageTitle = item[0].title;
        portalBlock.blockId = item[0].id;
        portalBlock.pageUid = item[0].uid;

        blocks.push(portalBlock);
      });

      return {
        blocks: blocks,
        blockParentPageMap: blockParentPageMap,
        linkedPagesUidSet: linkedPagesUidSet,
        pageReferenceCountMap: pageReferenceCountMap,
      };
    },
  },
};
