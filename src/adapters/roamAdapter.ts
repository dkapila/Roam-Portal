export default {
  methods: {
    roamOpenSidebar(uid: string) {
      if (
        !("roamAlphaAPI" in window) &&
        (window as any).roamAlphaAPI.ui &&
        (window as any).roamAlphaAPI.ui.rightSidebar
      ) {
        return null;
      }

      let type = "block";
      (window as any).roamAlphaAPI.ui.rightSidebar.open();
      (window as any).roamAlphaAPI.ui.rightSidebar.addWindow({
        window: { "block-uid": uid, type: type },
      });
    },
    roamApiQuery(params: any) {
      if (!("roamAlphaAPI" in window)) {
        return [];
      }

      let data = [];

      try {
        data = (window as any).roamAlphaAPI.data.q(...params);
      } catch (err) {
        data = [];
      }

      return data;
    },
    roamFetchPageTitle(uid: string) {
      let data = this.roamApiQuery([
        `[:find (pull ?e [{:block/parents [:node/title]} :node/title]) :where [?e :block/uid "${uid}"]]`,
      ]);

      return data;
    },
    roamFetchImageBlocks() {
      let whereFilter = `[?block :block/string ?contents][(clojure.string/includes? ?contents "![")]`;
      let selectFilter = `pull ?block [:block/string {:block/refs [:block/uid]}  
                          {:block/parents [{:block/refs [:block/uid]}]}  
                          {:block/children [{:block/refs [:block/uid]}]}]`;

      let query = `[:find (${selectFilter}) :where ${whereFilter}]`;
      let data = this.roamApiQuery([query]);

      return data;
    },
    roamFetchBlocksStartingWith(value: string) {
      let data = this.roamApiQuery([
        `[:find (pull ?e [{:block/refs [:block/string :block/uid]} {:block/parents [:node/title :block/string :block/uid]} :block/string])
                                           :where [?e :block/string ?contents]
                                           [(clojure.string/starts-with? ?contents "${value}")]]`,
      ]);

      return data;
    },
    roamFetchAttributePageWithAttributeName(attributeName: string) {
      let data = this.roamApiQuery([
        `[:find (pull ?entities [{:block/_children [:block/uid]} :block/string])
                                           :where [?e :attrs/lookup ?entities][?entities :block/string ?contents]
                                           [(clojure.string/includes? ?contents "${attributeName}::")]]`,
      ]);

      return data;
    },
    roamFetchPageUid(pageTitle: string) {
      let data = this.roamApiQuery([
        `[:find (pull ?e [:block/uid]) :where [?e :node/title "${pageTitle}"]]`,
      ]);

      return data;
    },
    roamFetchDailyNotePages() {
      let data = this.roamApiQuery([
        "[:find (pull ?e [:node/title]) :where [?e :log/id]]",
      ]);

      return data;
    },
    roamFetchAttributePage() {
      let data = this.roamApiQuery([
        `[:find (pull ?entities [{:block/refs [:node/title]}])
                                           :where [?e :attrs/lookup ?entities][?entities :block/string ?contents]
                                           [(clojure.string/includes? ?contents "::")]]`,
      ]);

      return data;
    },
    roamFetchAllNestedParentBlocksOfMentionPage(
      pageTitle: string,
      startDateTimestamp: number,
      endDateTimestamp: number
    ) {
      let blockDatePredicate = `[?block :edit/time ?block_edit][(>= ?block_edit ${startDateTimestamp})][(<= ?block_edit  ${endDateTimestamp})]`;
      let nestedParentsOfBlocksMentioningPageRule = `[
                          [(ancestor ?block ?linkedPage)[?block :block/children ?parent_block][?parent_block :block/refs ?linkedPage]]
                          [(ancestor ?block ?linkedPage)[?block :block/children ?parent_block](ancestor ?parent_block ?linkedPage)]
                        ]`;

      let queryString = `[:find (pull ?block [:block/uid])
                        :in $ [?pagetitle] %
                        :where 
                        [?block :block/string]${blockDatePredicate}
                        [?page :node/title ?pagetitle](ancestor ?block ?page)]`;

      let data = this.roamApiQuery([
        queryString,
        [pageTitle],
        nestedParentsOfBlocksMentioningPageRule,
      ]);

      return data;
    },
    roamFetchAllNestedChildBlocksOfMentionPage(
      pageTitle: string,
      startDateTimestamp: number,
      endDateTimestamp: number
    ) {
      let blockDatePredicate = `[?block :edit/time ?block_edit][(>= ?block_edit ${startDateTimestamp})][(<= ?block_edit  ${endDateTimestamp})]`;
      let nestedChildrenOfBlocksMentioningPageRule = `[
                          [(ancestor ?block ?linkedPage)[?block :block/refs ?linkedPage]]
                          [(ancestor ?block ?linkedPage)[?parent :block/children ?block ](ancestor ?parent ?linkedPage)]
                        ]`;

      let queryString = `[:find (pull ?block [:block/uid])
                        :in $ [?pagetitle] %
                        :where 
                        [?block :block/string]${blockDatePredicate}
                        [?page :node/title ?pagetitle](ancestor ?block ?page)]`;

      let data = this.roamApiQuery([
        queryString,
        [pageTitle],
        nestedChildrenOfBlocksMentioningPageRule,
      ]);

      return data;
    },
    roamFetchAllPages(uidSet) {
      let queryString = `[:find 
                           (pull ?e [:node/title :block/uid]) 
                           :in $ [?uidSet ...]
                           :where [?e :block/uid ?uidSet]]`;

      let data = this.roamApiQuery([queryString, [...uidSet]]);

      return data;
    },
    roamFetchAllPageWithReverseReferences(uidSet) {
      let queryString = `[:find 
                           (pull ?e [:node/title :db/id :block/_refs]) 
                           :in $ [?uidSet ...]
                           :where [?e :block/uid ?uidSet]]`;

      let data = this.roamApiQuery([queryString, [...uidSet]]);

      return data;
    },
    fetchBlockDetails(blockUidList: string[], includeBlockTitleOrString: boolean) {
      let pullQuery = includeBlockTitleOrString
        ? "(pull ?e [:block/uid :block/string :node/title])"
        : "?e";
      let data = this.roamApiQuery([
        `[:find ${pullQuery}
                                      :in $ [?block-uid ...]
                                      :where [?e :block/uid ?block-uid]]`,
        blockUidList,
      ]);

      return data;
    },
    fetchBlocksMentioningPage(pageTitle: string) {
      let pageQuery = `[:find (pull ?e [:block/string :edit/time]) 
                       :in $ [?pagetitle]
                        :where [?e :block/refs ?referencedPage] [?referencedPage :node/title ?pagetitle] ]`;

      let data = this.roamApiQuery([pageQuery, [pageTitle]]);

      return data;
    },
    fetchBlockString(blockUid: string) {
      let blocksQuery = `[:find (pull ?e [:block/string])
                                      :in $ ?block-uid
                                      :where [?e :block/uid ?block-uid]]`;

      let data = this.roamApiQuery([blocksQuery, blockUid]);
      return data;
    },
    fetchBlockUidsInPage(pageTitle: string) {
      let ancestorRule =
        "[[(ancestor ?b ?a)[?a :block/children ?b]][(ancestor ?b ?a)[?parent :block/children ?b ](ancestor ?parent ?a) ]]";
      let query = `[:find  (pull ?block [:block/uid])
                                   :in $ ?pageTitle %
                                   :where
                                   [?page :node/title ?pageTitle]
                                   (ancestor ?block ?page)]`;

      let data = this.roamApiQuery([query, pageTitle, ancestorRule]);

      return data;
    },
    fetchBlocks(
      blockUidList: string[],
      includeReverseReferencesFlag: boolean,
      includeNestedReferencesFlag: boolean,
      includeReactions: boolean
    ) {
      if (blockUidList && blockUidList.length == 0) {
        return [];
      }

      let blockSiblingsRule = `[
        [(block_rule ?block)[?block :block/parents ?parents][?parents :block/refs ?refs][?refs :node/title ]]
        [(block_rule ?block)[?block :block/children ?children][?children :block/refs ?refs][?refs :node/title]]
        ]`;

      let includeNestedReferences = includeNestedReferencesFlag
        ? `{:block/parents [{:block/refs [:block/uid]}]} {:block/children [{:block/refs [:block/uid]}]}`
        : "";

      let includeBlockSiblingsRule = includeNestedReferencesFlag
        ? blockSiblingsRule
        : "";
      let includeReverseReferences = includeReverseReferencesFlag
        ? ` {:block/_refs [:block/uid]} `
        : " ";

      if (blockUidList == null) {
        blockUidList = ["xyz"];
      }

      let reactionsPredicate = includeReactions ? `:ent/emojis` : "";
      let uidListPredicate = blockUidList
        ? `[?block :block/uid ?blockUidList]`
        : "";

      let query = `[:find (pull ?block [${includeNestedReferences} ${includeReverseReferences} ${reactionsPredicate}
                     {:block/refs [:node/title :block/string :block/uid]} 
                     :block/string :db/id :edit/time :block/uid ])
                     :in $ [?blockUidList ...]
                     :where [?block :block/string] ${uidListPredicate} ${includeBlockSiblingsRule}]`;

      let block = this.roamApiQuery([query, blockUidList]);

      return block;
    },
    generateCharCodeArray(searchString: string) {
      let charCodeArray: number[] = [];
      searchString.split("").forEach((c: string) => {
        charCodeArray.push(c.charCodeAt(0));
      });

      return charCodeArray;
    },
    fetchPages(
      pageUidList: string[],
      startDateTimestamp = "",
      endDateTimestamp = "",
      searchString = "",
      regularExpressionsEnabled = false
    ) {
      if (pageUidList && pageUidList.length == 0) {
        return [];
      }

      let pageUidListPredicate = pageUidList
        ? `[?page :block/uid ?pageUidList]`
        : "";
      let pageDatePredicate = `[?page :edit/time ?block_edit][(>= ?block_edit ${startDateTimestamp})][(<= ?block_edit  ${endDateTimestamp})]`;
      let pageTitlePredicate = "[?page :node/title]";

      if (searchString) {
        if (regularExpressionsEnabled) {
          pageTitlePredicate = `[?page :node/title ?contents][(re-pattern "${String.fromCharCode(
            ...this.generateCharCodeArray(searchString)
          )}") ?pattern][(re-seq ?pattern ?contents) ?contents]`;
        } else {
          pageTitlePredicate =
            '[?page :node/title ?contents][(clojure.string/includes? ?contents "' +
            searchString +
            '")]';
        }
      }

      let pageQuery = `[:find (pull ?page [:node/title :db/id :edit/time :block/uid])
                     :in $ [?pageUidList ...]
                     :where ${pageTitlePredicate} ${pageUidListPredicate} ${pageDatePredicate}]`;

      if (pageUidList == null) {
        pageUidList = ["xyz"];
      }

      let data = this.roamApiQuery([pageQuery, pageUidList]);

      return data;
    },
    fetchBlocksWithParents({
      startDateTimestamp = "",
      endDateTimestamp = "",
      pageTitle = "",
      mentionedPageTitle = "",
      searchString = "",
      containsBlockRef = null as string | null,
      blockRefList = null as string[] | null,
      regularExpressionsEnabled = null,
      onlyIncludeBlocksWithReactions = null,
    } = {}) {
      if (blockRefList && blockRefList.length == 0) {
        return [];
      }

      // Using the ancestor child relationship defined here: https://www.putyourleftfoot.in/introduction-txo-the-roam-alpha-api
      let ancestorRule =
        "[[(ancestor ?b ?a)[?a :block/children ?b]][(ancestor ?b ?a)[?parent :block/children ?b ](ancestor ?parent ?a) ]]";

      searchString = searchString.trim().replace(/  +/g, " ");
      containsBlockRef = containsBlockRef
        ? containsBlockRef.replace(/[()']+/g, "").trim()
        : null;

      let blockRefListPredicate =
        blockRefList != null ? "[?block :block/uid ?block-ref-list]" : "";

      let searchStringQuery = "[?block :block/string]";
      if (searchString) {
        if (regularExpressionsEnabled) {
          searchStringQuery = `[?block :block/string ?contents][(re-pattern "${String.fromCharCode(
            ...this.generateCharCodeArray(searchString)
          )}") ?pattern][(re-seq ?pattern ?contents) ?contents]`;
        } else {
          searchStringQuery =
            '[?block :block/string ?contents][(clojure.string/includes? ?contents "' +
            searchString +
            '")]';
        }
      }

      let blockDatePredicate = `[?block :edit/time ?block_edit][(>= ?block_edit ${startDateTimestamp})][(<= ?block_edit  ${endDateTimestamp})]`;
      let mentionedPageTitlePredicate = mentionedPageTitle
        ? '[?block :block/refs ?referencedPage] [?referencedPage :node/title "' +
          mentionedPageTitle +
          '"]'
        : "";
      let pageTitlePredicate = pageTitle
        ? '[?page :node/title  "' + pageTitle + '"]'
        : "[?page :node/title]";
      let containsBlockRefPredicate = containsBlockRef
        ? '[?block :block/refs ?referencedBlock][?referencedBlock :block/uid "' +
          containsBlockRef +
          '"]'
        : "";
      let reactionsPredicate = onlyIncludeBlocksWithReactions
        ? "[?block :ent/emojis]"
        : "";

      let pagePullQuery = `(pull ?page [:node/title :db/id :edit/time :block/uid])`;
      let blockPullQuery = `(pull ?block [:block/uid])`;

      let blocksQuery = `[:find 
                             ${blockPullQuery}
                             ${pagePullQuery}
                           :in $ [?block-ref-list ...] %
                           :where
                             ${pageTitlePredicate}
                             ${blockRefListPredicate}
                             ${reactionsPredicate}
                             ${searchStringQuery} 
                             ${blockDatePredicate}
                             ${mentionedPageTitlePredicate}
                             ${containsBlockRefPredicate}
                             (ancestor ?block ?page)]`;

      if (blockRefList == null) {
        blockRefList = ["xyz"];
      }

      let data = this.roamApiQuery([blocksQuery, blockRefList, ancestorRule]);

      return data;
    },
  },
};
