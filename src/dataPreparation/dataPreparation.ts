import { PortalBlock, RoamBlock } from "../types";

import roamAdapter from "../adapters/roamAdapter";

export default {
  mixins: [roamAdapter],
  methods: {
    isNumber(stringToTest: string) {
      return /^\d+$/.test(stringToTest.trim());
    },
    getTweetLink(blockString: string) {
      let tweetId = blockString.slice(
        blockString.indexOf("/status/") + 8,
        blockString.length
      );

      if (this.isNumber(tweetId)) {
        return tweetId;
      }

      if (tweetId.trim().length == 0) {
        return null;
      }

      if (tweetId.match(/\D/) == null) {
        return null;
      }

      const match = tweetId.match(/\D/);

      if (!match) {
        return null;
      }

      tweetId = tweetId.slice(0, match.index);

      return this.isNumber(tweetId) ? tweetId : null;
    },
    processResults(results, showCodeBlocks, blockSearchKey, removePages) {
      let filteredResults: any[] = [];

      results.forEach((result) => {
        if (
          !showCodeBlocks &&
          blockSearchKey in result.item &&
          result.item[blockSearchKey].includes("```")
        ) {
          return;
        }

        if (
          !showCodeBlocks &&
          blockSearchKey in result.item &&
          result.item[blockSearchKey].startsWith(":hiccup")
        ) {
          return;
        }

        if (removePages == true && result.isPage == true) {
          return;
        }

        if ("matches" in result) {
          let index = result.matches[0].indices;
          index = index[index.length - 1];
          let key = result.matches[0].key;
          if (!("indexOfMatches" in result.item)) {
            result.item["indexOfMatches"] = [{ index: index, key: key }];
          } else {
            result.item["indexOfMatches"].push({ index: index, key: key });
          }
        }

        filteredResults.push({ ...result.item });
      });

      return filteredResults;
    },
    getAllPagesTitles(totalBlocks) {
      if (totalBlocks && totalBlocks.length == 0) {
        return [];
      }

      let pageTitles: string[] = [];

      totalBlocks.forEach((block: RoamBlock) => {
        pageTitles.push(block.title);
      });

      return pageTitles;
    },
    getAllPagesAndBlocks(totalBlocks) {
      if (totalBlocks && totalBlocks.length == 0) {
        return {
          pages: [],
          nonPages: [],
        };
      }

      let pages: PortalBlock[] = [];
      let nonPages: PortalBlock[] = [];

      totalBlocks.forEach((block: PortalBlock) => {
        if (block.isPage) {
          pages.push(block);
        } else {
          nonPages.push(block);
        }
      });

      return {
        pages: pages,
        nonPages: nonPages,
      };
    },
    getSortedBlocks(unsortedResults) {
      if (unsortedResults && unsortedResults.length == 0) {
        return {
          blocks: [],
          pages: [],
        };
      }

      let sortedResults = this.sortAllBlocks(unsortedResults);
      let blocks = this.getAllPagesAndBlocks(sortedResults);

      return {
        blocks: blocks.nonPages,
        pages: blocks.pages,
      };
    },
    sortAllBlocks: (unsortedResults) => {
      if (unsortedResults && unsortedResults.length == 0) {
        return [];
      }

      let sortedResults = unsortedResults.slice().sort((a, b) => {
        if ("isPage" in a && !("isPage" in b)) {
          return -1;
        }
        if ("isPage" in b && !("isPage" in a)) {
          return 1;
        }

        if (a["blockTime"] < b["blockTime"]) {
          return 1;
        }
        if (a["blockTime"] > b["blockTime"]) {
          return -1;
        }

        return 0;
      });

      return sortedResults;
    },
    getFullString(blockUidStringMap, fullString, level) {
      if (level == 3) {
        return fullString;
      }

      let blockReferences = fullString.match(/\(\(([^)]+)\)\)/g);
      if (!blockReferences || blockReferences.length == 0) {
        return fullString;
      }

      for (let i = 0; i < blockReferences.length; i++) {
        let blockUid = blockReferences[i];
        blockUid = blockUid.replaceAll("(", "").replaceAll(")", "").trim();
        let findEmbedsReg: RegExp;

        try {
          // Replace `{{[[embed]]: (xyz))}}` with `((xyz))`
          findEmbedsReg = new RegExp(
            "{{\\s*(\\[)*\\s*embed\\s*(\\])*\\s*:\\s*\\(\\((" +
              blockUid +
              ")\\)\\)}}",
            "g"
          );
          fullString = fullString.replaceAll(findEmbedsReg, blockReferences[i]);
          let stringToReplace = blockUid;

          if (blockUid in blockUidStringMap) {
            stringToReplace = blockUidStringMap[blockUid];
          }

          fullString = fullString.replaceAll(
            blockReferences[i],
            stringToReplace
          );
        } catch (err) {
          continue;
        }
      }

      level = level + 1;
      return this.getFullString(blockUidStringMap, fullString, level);
    },
  },
};
