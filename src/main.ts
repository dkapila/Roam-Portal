import "vue-select/dist/vue-select.css";

import * as Three from "three";

import App from "./App.vue";
import ForceGraph from "force-graph";
import ForceGraph3D from "3d-force-graph";
import MarkdownIt from "markdown-it";
import SpriteText from "three-spritetext";
import TextHighlight from "vue-text-highlight";
import Vue from "vue";
import VueFuse from "vue-fuse";
import VueWordCloud from 'vuewordcloud';
import infiniteScroll from "vue-infinite-scroll";
import store from "./store/index";
import vSelect from "vue-select";

Vue.component("v-select", vSelect);

Object.defineProperty(Vue.prototype, "$forceGraph3D", { value: ForceGraph3D });
Object.defineProperty(Vue.prototype, "$forceGraph", { value: ForceGraph });
Object.defineProperty(Vue.prototype, "$three", { value: Three });
Object.defineProperty(Vue.prototype, "$spriteText", { value: SpriteText });
Object.defineProperty(Vue.prototype, "$markdownIt", { value: MarkdownIt });

Vue.use(VueFuse);
Vue.use(infiniteScroll);
Vue.component("text-highlight", TextHighlight);
Vue.component(VueWordCloud.name, VueWordCloud);

const extensionName = "Roam-Portal";

const onEscapeKeyPress = (event: any) => {
  if (event.key === "Escape") {
    (window as any).roamPortal.hide();
  }
};

const removePortalButtonFromToolbar = () => {
  const flexSpaceDiv = document.getElementById(extensionName + "-flex-space");
  if (flexSpaceDiv) {
    flexSpaceDiv.remove();
  }

  const toolbarButton = document.getElementById(
    extensionName + "-toolbar-button"
  );
  if (toolbarButton) {
    toolbarButton.remove();
  }

  const icon = document.getElementById(extensionName + "-icon");
  if (icon) {
    icon.remove();
  }
};

const addPortalButtonInToolbar = () => {
  const toolbarButton = document.createElement("span");
  toolbarButton.id = extensionName + "-toolbar-button";
  toolbarButton.classList.add("bp3-popover-wrapper");

  const span = document.createElement("span");
  span.classList.add("bp3-popover-target");
  toolbarButton.appendChild(span);

  const icon = document.createElement("span");
  (icon.id = extensionName + "-icon"),
    icon.classList.add(
      "bp3-icon-ring",
      "bp3-button",
      "bp3-minimal",
      "bp3-small"
    ),
    span.appendChild(icon);

  const roamTopbar = document.getElementsByClassName("rm-topbar");
  const nextIconButton = roamTopbar[0].lastElementChild;
  const flexDiv = document.createElement("div");
  flexDiv.id = extensionName + "-flex-space";
  flexDiv.className = "rm-topbarspacer-sm";

  if (nextIconButton) {
    nextIconButton.insertAdjacentElement("beforebegin", toolbarButton);
  }
  toolbarButton.insertAdjacentElement("afterend", flexDiv);
  toolbarButton.addEventListener(
    "click",
    () => (window as any).roamPortal.toggleShow()
  );
};

const initializeApp = ({ extensionAPI }) => {
  if ((window as any).roamPortal) {
    return;
  }

  if (extensionAPI) {
    extensionAPI.ui.commandPalette.addCommand({
      label: "Toggle Roam Portal",
      callback: () => (window as any).roamPortal.toggleShow(),
    });
  }

  let elementExists = document.getElementById("ras-roam-portal");
  if (typeof elementExists != "undefined" && elementExists != null) {
    return;
  }

  let overlayDiv = document.createElement("div");
  overlayDiv.id = "ras-overlay-div";
  overlayDiv.style.display = "none";
  document.getElementsByTagName("body")[0].appendChild(overlayDiv);
  overlayDiv.onclick = () => (window as any).roamPortal.hide();

  document.addEventListener("keydown", onEscapeKeyPress);

  let roamPortalContainer = document.createElement("div");
  roamPortalContainer.id = "roam-portal-mount";
  document.getElementsByTagName("body")[0].appendChild(roamPortalContainer);

  new Vue({
    store,
    el: "#roam-portal-mount",
    render: (h) => h(App),
  });

  let roamPortalDiv = document.getElementById("ras-roam-portal");

  if (roamPortalDiv) {
    roamPortalDiv.style.display = "none";
  }

  addPortalButtonInToolbar();
  console.log("Roam Portal Loaded");
};

const unInitializeApp = () => {
  document.removeEventListener("keydown", onEscapeKeyPress);

  removePortalButtonFromToolbar();

  let roamPortalContainer = document.getElementById("ras-roam-portal");

  if (roamPortalContainer) {
    roamPortalContainer.remove();
  }

  let roamPortalOverlayDiv = document.getElementById("ras-overlay-div");

  if (roamPortalOverlayDiv) {
    roamPortalOverlayDiv.remove();
  }

  delete (window as any).THREE;
  delete (window as any).roamPortal;

  console.log("Roam Portal Unloaded");
};

export default {
  onload: initializeApp,
  onunload: unInitializeApp,
};
