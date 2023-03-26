<template>
  <div class="ras-copy-reference-action-container">
    <transition name="fade" v-on:after-leave="onCopyButtonHidden">
      <span
        class="ras-copy-button-container"
        title="Copy reference of this block"
        v-on:click.stop="blockActionClicked()"
        v-if="showReferenceCopiedButton"
      >
        📋
      </span>
    </transition>
    <transition
      name="fade"
      v-on:after-enter="onCopyTextShown"
      v-on:after-leave="onCopyTextShown"
    >
      <span class="ras-copied-string" v-if="showReferenceCopiedText">
        Reference Copied
      </span>
    </transition>
  </div>
</template>

<script>
export default {
  name: "ras-copy-reference",
  props: {
    blockUid: String,
  },
  data() {
    return {
      showReferenceCopiedButton: true,
      showReferenceCopiedText: false,
    };
  },
  methods: {
    onCopyTextShown() {
      this.showReferenceCopiedButton = true;

      window.setTimeout(() => {
        this.showReferenceCopiedText = false;
      }, 2000);
    },
    onCopyButtonHidden() {
      this.showReferenceCopiedText = true;
    },
    blockActionClicked() {
      navigator.clipboard
        .writeText("((" + this.blockUid + "))")
        .then(() => (this.showReferenceCopiedButton = false))
        .catch((error) => {
          alert(`Copy failed! ${error}`);
        });
    },
  },
};
</script>
<style>
.ras-copy-reference-action-container {
  display: flex;
}

.ras-copied-string {
  color: #ababab !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.ras-copy-button-container {
  opacity: 0.5;
}

.ras-copy-button-container:hover {
  opacity: 1;
  cursor: pointer;
}
</style>
