import { PortalBlock } from "../types";
import TimeUtils from "./timeUtils";

type  WordFrequency = {
  name: string;
  value: number;
}

export default {
  methods: {
    openPage(pageUid: string) {
      const url = new URL(window.location.href);
      let parts = url.hash.split("/");
      url.hash = parts.slice(0, 3).concat(["page"]).join("/");

      window.location.hash = url.hash + "/" + pageUid;
    },
    getRandomUuid() {
      return (window as any).Nanoid();
    },
    getStringCasePermutations(str: string) {
      let results: string[] = [];
      let arr = str.split("");
      let len = Math.pow(arr.length, 2);

      for (let i = 0; i < len; i++) {
        for (let k = 0, j = i; k < arr.length; k++, j >>= 1) {
          arr[k] = j & 1 ? arr[k].toUpperCase() : arr[k].toLowerCase();
        }
        let combo = arr.join("");
        results.push(combo);
      }
      return results;
    },
    getFrequencyWeek(results: PortalBlock[]) {
      let frequencyMap = {};

      results.forEach((item: PortalBlock) => {
        let timestamp = item.blockTime;

        let weekNumber = TimeUtils.methods.getNumberOfWeek(timestamp);
        let year = new Date(timestamp).getFullYear();

        let dateString = year + ", week: " + weekNumber;

        if (dateString in frequencyMap) {
          frequencyMap[dateString]++;
        } else {
          frequencyMap[dateString] = 1;
        }
      });

      return frequencyMap;
    },
    getFrequencyDay(results) {
      let frequencyMap = {};

      results.forEach((item) => {
        let timestamp = item.blockTime;

        let fullDate = new Date(timestamp)
          .toString()
          .split(" ")
          .slice(0, 4)
          .join(" ");
        if (fullDate in frequencyMap) {
          frequencyMap[fullDate]++;
        } else {
          frequencyMap[fullDate] = 1;
        }
      });

      return frequencyMap;
    },
    getFrequencyMonth(results: PortalBlock []) {
      let frequencyMap = {};

      results.forEach((item) => {
        let timestamp = item.blockTime;

        let month = new Date(timestamp).toLocaleString("default", {
          month: "long",
        });
        let year = new Date(timestamp).getFullYear();

        let dateString = month + ", " + year;
        if (dateString in frequencyMap) {
          frequencyMap[dateString]++;
        } else {
          frequencyMap[dateString] = 1;
        }
      });

      return frequencyMap;
    },
    getFrequenciesOverTimePeriod(results, startTimestamp, endTimestamp) {
      let frequencyMap = {};
      startTimestamp = startTimestamp.toString();
      endTimestamp = endTimestamp.toString();

      if (
        (startTimestamp.length == 0 && endTimestamp.length == 0) ||
        (startTimestamp.length == 0 && endTimestamp.length > 0)
      ) {
        frequencyMap = this.getFrequencyWeek(results);
      }

      let sortingByDay = false;

      if (
        (startTimestamp.length > 0 && endTimestamp.length > 0) ||
        (startTimestamp.length > 0 && endTimestamp.length == 0)
      ) {
        if (endTimestamp.length == 0) {
          endTimestamp = new Date().getTime();
        }

        let differenceInDays =
          (parseInt(endTimestamp) - parseInt(startTimestamp)) /
          (1000 * 3600 * 24);

        if (differenceInDays < 15) {
          frequencyMap = this.getFrequencyDay(results);
          sortingByDay = true;
        } else {
          frequencyMap = this.getFrequencyWeek(results);
        }
      }

      let frequencyArray: { name: string, value: string, timestamp: number } []= [];
      frequencyArray = Object.keys(frequencyMap).map((key) => {
        let timestamp = 0;

        if (sortingByDay) {
          timestamp = Date.parse(key);
        } else {
          let startDate = TimeUtils.methods.getDateRangeFromWeek(key).fromDate;
          timestamp = Date.parse(startDate);
        }

        return {
          name: key,
          value: frequencyMap[key],
          timestamp: timestamp,
        };
      });

      let frequencyType = "";

      if (sortingByDay) {
        frequencyType = "Day";
        frequencyArray.sort((a, b) => {
          if (Date.parse(a["name"]) > Date.parse(b["name"])) {
            return 1;
          }
          if (Date.parse(a["name"]) < Date.parse(b["name"])) {
            return -1;
          } else {
            return 0;
          }
        });
      } else {
        frequencyType = "Week";
        frequencyArray.sort((a, b) => {
          if (a["name"] > b["name"]) {
            return 1;
          }
          if (a["name"] < b["name"]) {
            return -1;
          } else {
            return 0;
          }
        });
      }

      return {
        type: frequencyType,
        frequencies: frequencyArray,
      };
    },
    getFrequency(wordsArray: string[], convertToLowerCase = false) {
      let wordsMap = {};

      wordsArray.forEach((key) => {
        key = convertToLowerCase ? key.toLowerCase() : key;
        if (key in wordsMap) {
          wordsMap[key]++;
        } else {
          wordsMap[key] = 1;
        }
      });

      let finalWordsArray: WordFrequency [] = [];
      finalWordsArray = Object.keys(wordsMap).map((key) => {
        return {
          name: key,
          value: wordsMap[key],
        };
      });

      finalWordsArray.sort((a: WordFrequency, b: WordFrequency) => {
        return b["value"] - a["value"];
      });

      return finalWordsArray;
    },
    getPageFrequency(pagesArray) {
      return this.getFrequency(pagesArray);
    },
    getWordFrequency(text: string) {
      let wordsArray = text.split(" ");

      let letters = /^[0-9a-zA-Z]+$/;
      let stopwords = [
        "DONE",
        "TODO",
        "i",
        "me",
        "my",
        "myself",
        "we",
        "our",
        "ours",
        "ourselves",
        "you",
        "your",
        "yours",
        "yourself",
        "yourselves",
        "he",
        "him",
        "his",
        "himself",
        "she",
        "her",
        "hers",
        "herself",
        "it",
        "its",
        "itself",
        "they",
        "them",
        "their",
        "theirs",
        "themselves",
        "what",
        "which",
        "who",
        "whom",
        "this",
        "that",
        "these",
        "those",
        "am",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "having",
        "do",
        "does",
        "did",
        "doing",
        "a",
        "an",
        "the",
        "and",
        "but",
        "if",
        "or",
        "because",
        "as",
        "until",
        "while",
        "of",
        "at",
        "by",
        "for",
        "with",
        "about",
        "against",
        "between",
        "into",
        "through",
        "during",
        "before",
        "after",
        "above",
        "below",
        "to",
        "from",
        "up",
        "down",
        "in",
        "out",
        "on",
        "off",
        "over",
        "under",
        "again",
        "further",
        "then",
        "once",
        "here",
        "there",
        "when",
        "where",
        "why",
        "how",
        "all",
        "any",
        "both",
        "each",
        "few",
        "more",
        "most",
        "other",
        "some",
        "such",
        "no",
        "nor",
        "not",
        "only",
        "own",
        "same",
        "so",
        "than",
        "too",
        "very",
        "s",
        "t",
        "can",
        "will",
        "just",
        "don",
        "should",
        "now",
      ];
      let longWords: string[] = [];
      wordsArray.forEach((word) => {
        if (
          word.length > 3 &&
          !stopwords.includes(word.toLowerCase()) &&
          word.match(letters)
        ) {
          longWords.push(word);
        }
      });

      let finalWordsArray = this.getFrequency(longWords, true);

      return finalWordsArray;
    },
  },
};
