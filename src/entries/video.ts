import axios from "axios";
import { createHTMLObserver, getUidsFromId } from "roam-client";
import { render } from "../components/YoutubePlayer";
import { addStyle, runExtension } from "../entry-helpers";

addStyle(`.roam-block-container {
  position: relative
}`);

runExtension("video", () => {
  createHTMLObserver({
    callback: (d: HTMLDivElement) => {
      const img = d.getElementsByTagName("img")[0];
      const src = img.src;
      axios
        .get(src, { responseType: "blob" })
        .then((r) => r.data as Blob)
        .then((b) => {
          if (b.type.startsWith("video")) {
            const video = document.createElement("video");
            video.controls = true;
            video.src = src;
            video.width = 580;
            img.parentElement.insertBefore(video, img);
            img.remove();
          }
        });
    },
    tag: "DIV",
    className: "rm-inline-img__resize",
  });

  createHTMLObserver({
    tag: "IFRAME",
    className: "rm-video-player",
    callback: (iframe: HTMLIFrameElement) => {
      const youtubeId = /youtube\.com\/embed\/(.*?)(\?|$)/.exec(
        iframe.src
      )?.[1];
      if (youtubeId) {
        const blockId = (iframe.closest(".roam-block") as HTMLDivElement)?.id;
        const { blockUid } = getUidsFromId(blockId);
        const p = iframe.closest(
          ".rm-video-player__spacing-wrapper"
        ) as HTMLDivElement;
        p.onmousedown = (e) => e.stopPropagation();
        render({
          p,
          blockId,
          blockUid,
          youtubeId,
        });
      }
    },
  });
});
