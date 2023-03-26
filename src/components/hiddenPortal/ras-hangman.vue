<template>
  <div class="ras-hangman-container">
    <div class="ras-game-select">
      <div class="ras-game-attr-selection-container">
        <rasDropdownSelect
          v-if="attributeList && attributeList.length > 0"
          class="ras-select-attribute"
          v-model="attributeSelected"
          :searchTerm="attributeSelected"
          placeholderText="Select Attribute to be quizzed on"
          :listOfOptions="attributeList"
        />
      </div>
      <div class="ras-new-game-button" @click="startNewGame()">New Game</div>
    </div>

    <div class="ras-no-values-found" v-if="noValidValuesFound">
      <div>
        Unable to find a quizzable value for this attribute. Try selecting a
        different attribute.
      </div>
      <div>
        Attribute value must be in the same block as the attribute. For example:
      </div>
      <div><span class="ras-example-attribute-name">Year::</span> 2042</div>
    </div>

    <div
      class="ras-game-area-container"
      v-if="!noValidValuesFound && selectedAttributeBlockForQuiz"
    >
      <div class="ras-page-name-container">
        <div class="ras-page-name-heading">Appears in Page:</div>
        <div class="ras-page-name">
          {{ selectedPageName }}
        </div>
      </div>
      <div class="ras-block-name-container" v-if="selectedBlockName">
        <div class="ras-block-name-heading">Parent Block:</div>
        <div class="ras-block-name">
          {{ selectedBlockName }}
        </div>
      </div>
      <div class="ras-game-content">
        <div class="value-to-guess-container">
          <div
            v-bind:key="idx"
            class="ras-value-to-guess"
            v-bind:class="{ 'ras-game-over-text': numberOfTriesLeft == 0 }"
            v-for="(item, idx) in valueToGuess"
          >
            <div class="ras-value-to-guess-character">{{ item }}</div>
          </div>
        </div>

        <div class="ras-game-play-container">
          <div
            class="ras-new-game-bottom-button"
            @click="startNewGame()"
            v-if="numberOfTriesLeft == -1"
          >
            New Game
          </div>
          <div class="ras-game-canvas-state" v-if="numberOfTriesLeft >= 0">
            <div class="ras-hanging-bar">
              <div class="ras-crossbar"></div>
              <div class="ras-crossbar-figure-body">
                <div class="ras-bar-top"></div>
                <div class="ras-post">
                  <transition name="fade">
                    <div
                      class="ras-figure-head"
                      v-if="numberOfTriesLeft < 6"
                    ></div>
                  </transition>
                  <transition name="fade">
                    <div class="ras-figure-body" v-if="numberOfTriesLeft < 5">
                      <transition name="fade">
                        <div
                          class="ras-figure-right-hand"
                          v-if="numberOfTriesLeft < 4"
                        ></div>
                      </transition>
                      <transition name="fade">
                        <div
                          class="ras-figure-left-hand"
                          v-if="numberOfTriesLeft < 3"
                        ></div>
                      </transition>
                      <transition name="fade">
                        <div
                          class="ras-figure-left-leg"
                          v-if="numberOfTriesLeft < 2"
                        ></div>
                      </transition>
                      <transition name="fade">
                        <div
                          class="ras-figure-right-leg"
                          v-if="numberOfTriesLeft < 1"
                        ></div>
                      </transition>
                    </div>
                  </transition>
                </div>
              </div>
              <div class="ras-floor"></div>
            </div>
            <div
              class="ras-new-game-bottom-button"
              @click="startNewGame()"
              v-if="numberOfTriesLeft == 0"
            >
              New Game
            </div>
          </div>
          <div class="ras-game-controls" v-if="numberOfTriesLeft > 0">
            <input
              type="text"
              spellcheck="false"
              autocomplete="off"
              maxlength="1"
              class="ras-next-character-input"
              v-model="nextCharacter"
              @keyup.enter="onSubmitClicked()"
            />
            <div class="ras-submit-character" @click="onSubmitClicked()">
              Submit Character
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import dataRequestHelper from "../../dataPreparation/dataRequestHelper";
import utils from "../../common/utils";
import rasDropdownSelect from "@/components/shared/ras-dropdown-select.vue";

export default {
  name: "ras-hangman",
  mixins: [dataRequestHelper, utils],
  components: {
    rasDropdownSelect,
  },
  data() {
    return {
      attrNotesDict: {},
      attributeSelected: null,
      attributeList: null,
      selectedAttributeBlockForQuiz: null,
      noValidValuesFound: false,
      valueToGuess: [],
      numberOfTriesLeft: null,
      selectedBlockName: null,
      nextCharacter: null,
      attributeValue: null,
      submittedCharacters: {},
    };
  },
  watch: {
    numberOfTriesLeft(val) {
      switch (val) {
        case 0:
          this.valueToGuess = this.attributeValue.split("");
          break;
      }
    },
    selectedAttributeBlockForQuiz() {
      this.renderGame();
    },
    attributeSelected() {
      this.startNewGame();
    },
  },
  mounted() {
    this.getAttributeList();
  },
  methods: {
    startNewGame() {
      let value = this.attributeSelected;
      if (value && value.label && value.label.length > 0) {
        let blocks = this.fetchBlocksStartingWith(value.label + "::");
        let resultBlock = this.getBlockForQuiz(blocks);

        this.noValidValuesFound = resultBlock ? false : true;
        this.selectedAttributeBlockForQuiz = resultBlock ? resultBlock : null;
      }
    },
    onSubmitClicked() {
      if (this.nextCharacter && this.nextCharacter.length == 1) {
        this.submittedCharacters[this.nextCharacter] = true;
        this.submittedCharacters[this.nextCharacter.toUpperCase()] = true;
        this.submittedCharacters[this.nextCharacter.toLowerCase()] = true;

        let currentWord = this.valueToGuess.join("");
        this.playMove();

        if (this.valueToGuess.join("") == currentWord) {
          this.numberOfTriesLeft = this.numberOfTriesLeft - 1;
        }

        if (this.valueToGuess.join("") == this.attributeValue) {
          this.numberOfTriesLeft = -1;
        }

        this.nextCharacter = "";
      }
    },
    playMove() {
      let attributeValueArr = this.attributeValue.split("");

      let valueToGuess = [];

      attributeValueArr.forEach((valueChar) => {
        if (
          valueChar == "#" ||
          valueChar == "]" ||
          valueChar == "[" ||
          valueChar == " " ||
          this.submittedCharacters[valueChar] == true
        ) {
          valueToGuess = valueToGuess + valueChar;
        } else {
          valueToGuess = valueToGuess + "_";
        }
      });

      this.valueToGuess = valueToGuess.split("");
    },
    renderGame() {
      this.nextCharacter = "";
      this.submittedCharacters = {};

      if (
        !this.selectedAttributeBlockForQuiz ||
        !this.selectedAttributeBlockForQuiz.parents
      ) {
        return;
      }

      this.selectedPageName =
        this.selectedAttributeBlockForQuiz.parents[0].title;
      this.selectedBlockName = null;

      let numParents = this.selectedAttributeBlockForQuiz.parents.length;

      if (numParents > 1) {
        let lastParent =
          this.selectedAttributeBlockForQuiz.parents[numParents - 1];
        this.selectedBlockName = lastParent.string;
      }

      this.attributeValue = this.selectedAttributeBlockForQuiz.attributeValue;

      let attributeValueArr = this.attributeValue.split("");

      let valueToGuess = "";

      attributeValueArr.forEach((valueChar) => {
        if (
          valueChar == "]" ||
          valueChar == "[" ||
          valueChar == "#" ||
          valueChar == " "
        ) {
          valueToGuess = valueToGuess + valueChar;
        } else {
          valueToGuess = valueToGuess + "_";
        }
      });

      this.valueToGuess = valueToGuess.split("");
      this.numberOfTriesLeft = 6;
    },
    getAttributeList() {
      this.attrNotesDict = this.fetchAttributePagesDict();
      let attrList = [];

      Object.keys(this.attrNotesDict).forEach((key) => {
        attrList.push({
          label: key,
          type: "(was used as attribute)",
        });
      });

      this.attributeList = attrList;
    },
    getBlockForQuiz(blocks) {
      let validBlocks = [];

      let blocksWithRefsExpanded = [];

      blocks
        .filter(
          (block) => block && block[0].parents && block[0].parents[0]["title"]
        )
        .forEach((block) => {
          let blockStr = block[0].string;
          let blockRefs = block[0]["refs"];

          if (blockRefs && blockRefs.length > 0) {
            blockRefs.forEach((ref) => {
              blockStr = blockStr.replaceAll(`((${ref.uid}))`, ref.string);
              blockStr = blockStr.replaceAll(`(( ${ref.uid} ))`, ref.string);
              blockStr = blockStr.replaceAll(`((  ${ref.uid}  ))`, ref.string);
              blockStr = blockStr.replaceAll(`(( ${ref.uid}))`, ref.string);
              blockStr = blockStr.replaceAll(`((${ref.uid} ))`, ref.string);
            });
          }

          let obj = { blockFullString: blockStr };

          blocksWithRefsExpanded.push({ ...block[0], ...obj });
        });

      blocksWithRefsExpanded.forEach((block) => {
        let attributeValue = block.blockFullString
          .slice(
            this.attributeSelected.label.length + 2,
            block.blockFullString.length
          )
          .trim();

        if (attributeValue.length > 0 && attributeValue.length < 25) {
          validBlocks.push({
            ...block,
            ...{ attributeValue: attributeValue },
          });
        }
      });

      return validBlocks[Math.floor(Math.random() * validBlocks.length)];
    },
  },
};
</script>

<style>
.ras-game-attr-selection-container
  > .ras-dropdown-input-with-options
  .vs_dropdown-toggle {
  height: 45px;
}

.ras-hangman-container .ras-dropdown-input-with-options {
  padding: 10px;
  background: #e7f5ff;
}

.ras-hangman-container .vs__dropdown-menu {
  width: 100%;
  margin-top: 22px;
  border-right: 10px solid #e7f5ff;
  border-bottom: 10px solid #e7f5ff;
  border-left: 10px solid #e7f5ff;
}

.ras-hangman-container .vs__selected {
  font-weight: 500;
  font-size: 25px !important;
}

.ras-hangman-container .vs__selected:after {
  display: contents;
  content: "::";
}
</style>
<style scoped>
.ras-page-name-container,
.ras-block-name-container {
  display: flex;
  gap: 5px;
  margin-right: 20px;
  margin-left: 20px;
  padding-top: 10px;
  border-bottom: 1px solid #e0d7d7;
}

.ras-no-values-found > div {
  margin-left: 20px;
  font-size: 16px !important;
  color: grey !important;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
}

.value-to-guess-container {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.ras-game-content {
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 10px;
  display: flex;
  flex-flow: column;
  height: 100%;
}

.ras-page-name-heading,
.ras-block-name-heading {
  font-size: 20px !important;
  color: grey !important;
}

.ras-value-to-guess-character {
  font-size: 40px !important;
  color: #322f2f !important;
}

.ras-page-name,
.ras-block-name {
  color: #6495ed !important;
  font-size: 20px !important;
  width: 70%;
  overflow-x: scroll;
  height: 36px;
  overflow-y: scroll;
}

.ras-hangman-container {
  background: #f9f9f9;
  height: 100%;
  display: flex;
  flex-flow: column;
}

.ras-game-area-container {
  height: 100%;
  background: white;
  display: flex;
  flex-flow: column;
}

.ras-game-play-container {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.ras-next-character-input {
  width: 50px;
  font-size: 40px !important;
  text-align: center;
}

.ras-game-controls {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.ras-game-over-text .ras-value-to-guess-character {
  color: #ec2f2f !important;
}

.ras-game-select {
  display: flex;
  height: 80px;
}

.ras-new-game-button {
  text-align: center;
  display: flex;
  align-items: center;
  color: #78c7ff !important;
  cursor: pointer;
  padding-bottom: 20px;
  padding-top: 20px;
}

.ras-new-game-button:hover {
  color: #ef7f4b !important;
}

.ras-game-attr-selection-container {
  width: 100%;
}

.ras-submit-character {
  font-size: 17px !important;
  margin-top: 15px;
  padding: 6px;
  border-radius: 10px;
  background: #d2ffd8;
  cursor: pointer;
}

.ras-submit-character:hover {
  background: #f8e5ce !important;
}

.ras-example-attribute-name {
  margin-right: 5px;
  color: black !important;
  display: contents;
}

.ras-hanging-bar {
  position: relative;
  display: flex;
  flex-flow: column;
  height: 100%;
  justify-content: center;
}

.ras-post {
  width: 5px;
  height: 100%;
  background-color: #b5b1b1;
}

.ras-crossbar {
  width: 80px;
  height: 5px;
  background-color: #b5b1b1;
}

.ras-bar-top {
  width: 5px;
  height: 40px;
  background-color: #b5b1b1;
  position: relative;
  left: 70px;
  top: -5px;
  border-radius: 25px;
}

.ras-floor {
  width: 180px;
  height: 5px;
  background-color: #b5b1b1;
  position: relative;
  left: -30px;
  border-radius: 25px;
}

.ras-figure-head {
  position: relative;
  left: 55px;
  top: 30px;
  width: 25px;
  height: 25px;
  background: #eedd8a;
  border-radius: 30px;
}

.ras-figure-body {
  animation: swing 2s ease-in-out infinite alternate;
  position: relative;
  width: 6px;
  height: 50px;
  left: 65px;
  top: 20px;
  border-radius: 25px;
  background-color: #eedd8a;
}

.ras-figure-right-hand {
  position: relative;
  width: 5px;
  height: 30px;
  left: 10px;
  top: 10px;
  border-radius: 25px;
  background-color: #eedd8a;
  transform: rotate(-45deg);
}

.ras-figure-left-hand {
  position: relative;
  width: 5px;
  height: 30px;
  left: -9px;
  top: -20px;
  border-radius: 25px;
  background-color: #eedd8a;
  transform: rotate(45deg);
}

.ras-figure-right-leg {
  position: relative;
  width: 5px;
  height: 40px;
  left: 12px;
  top: -58px;
  border-radius: 25px;
  background-color: #eedd8a;
  transform: rotate(-35deg);
}

.ras-figure-left-leg {
  position: relative;
  width: 5px;
  height: 40px;
  left: -11px;
  top: -18px;
  border-radius: 25px;
  background-color: #eedd8a;
  transform: rotate(35deg);
}

.ras-game-canvas-state {
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
}

.ras-crossbar-figure-body {
  display: flex;
  height: 75%;
}

.ras-new-game-bottom-button {
  cursor: pointer;
  font-size: 25px !important;
  background: #e7f5ff;
  padding: 10px;
  border-radius: 10px;
  align-items: center;
  color: rebeccapurple !important;
  justify-content: center;
  margin-top: 15px;
  height: 55px;
}

.ras-new-game-bottom-button:hover {
  background: #c4ffc4;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@keyframes swing {
  0% {
  }
  50% {
    transform: translate3d(4px, 0px, 0px) skew(5deg);
  }
  100% {
    transform: translate3d(-4px, 0px, 0px) skew(-5deg);
  }
}
</style>
