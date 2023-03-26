<template>
  <div class="ras-time-action-container-block">
    <span
      v-if="!hovered"
      :title="
        'Last edited: ' +
        blockResult.absoluteTime +
        ' (click to show all other blocks edited on this day)'
      "
      class="ras-result-date"
      v-on:click.stop="blockActionClicked($event, blockResult)"
    >
      {{ blockResult.relativeTime }}
    </span>
    <span
      v-if="hovered"
      :title="
        'Last edited: ' +
        blockResult.absoluteTime +
        ' (click to show all other blocks edited on this day)'
      "
      class="ras-result-date"
      v-on:click.stop="blockActionClicked($event, blockResult)"
      >{{ showTime(blockResult) }}
    </span>
  </div>
</template>

<script>
import utils from "../../../common/utils";

export default {
  name: "ras-time-action",
  props: {
    blockResult: Object,
    index: Number,
    hoveredIndex: Number,
  },
  mixins: [utils],
  data() {
    return {
      hovered: false,
    };
  },
  watch: {
    hoveredIndex(value) {
      if (value == this.index) {
        this.hovered = true;
      } else {
        this.hovered = false;
      }
    },
  },
  computed: {
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
  methods: {
    showTime(blockResult) {
      let timestamp = blockResult.blockTime;
      let editedDate = new Date(timestamp);

      let todaysDay = editedDate.getDate().toString();
      todaysDay = this.ordinalSuffixOf(todaysDay);

      let month = new Date(editedDate).toLocaleString("default", {
        month: "short",
      });
      let year = new Date(timestamp).getFullYear().toString();
      let minutes =
        editedDate.getMinutes() < 10
          ? "0" + editedDate.getMinutes().toString()
          : "" + editedDate.getMinutes();
      let hours =
        editedDate.getHours() < 10
          ? "0" + editedDate.getHours().toString()
          : "" + editedDate.getHours();

      return (
        hours.toString() +
        ":" +
        minutes.toString() +
        " " +
        month +
        " " +
        todaysDay +
        ", " +
        year
      );
    },
    blockActionClicked(_, result) {
      let date = new Date(result.blockTime);
      let start = new Date(date).setHours(0, 0, 0);
      let startDate = new Date(start);
      let till = startDate.setDate(new Date(start).getDate() + 1);
      let fromQuery = new Date(start)
        .toDateString()
        .split(" ")
        .slice(1)
        .join(" ");

      fromQuery = fromQuery + " " + "00:00";

      let toQuery = new Date(till).toDateString().split(" ").slice(1).join(" ");
      toQuery = toQuery + " " + "00:00";

      this.searchWithWaitingForUserInput = false;
      this.fromQuery = fromQuery;
      this.toQuery = toQuery;
    },
  },
};
</script>
<style>
.time-action-container-block {
  display: inline-block;
}

.ras-result-date {
  color: #33bdea !important;
}

.ras-result-date:hover {
  color: #ca124c !important;
}
</style>
