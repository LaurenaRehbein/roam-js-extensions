import { render } from "../components/Timeline";
import { addStyle, runExtension } from "../entry-helpers";
import { createButtonObserver } from "roam-client";
import { createConfigObserver } from "roamjs-components/components/ConfigPage";

addStyle(`.roamjs-timeline-date > a, 
.roamjs-timeline-date > a:hover,
.roamjs-timeline-date > a:focus,
.vertical-timeline-element-subtitle > a,
.vertical-timeline-element-subtitle > a:hover,
.vertical-timeline-element-subtitle > a:focus {
  color: #ffffff;
}
.vertical-timeline--two-columns .vertical-timeline-element-content .vertical-timeline-element-date{
  left: 130%;
}
.vertical-timeline--two-columns .vertical-timeline-element:nth-child(even):not(.vertical-timeline-element--left) .vertical-timeline-element-content .vertical-timeline-element-date {
  right: 130%;
}`);

runExtension("timeline", () => {
  createConfigObserver({
    title: "roam/js/timeline",
    config: {
      tabs: [
        {
          id: "home",
          fields: [
            {
              title: "depth",
              description:
                "The number of child levels included with each timeline element.",
              type: "number",
              defaultValue: -1,
            },
          ],
        },
      ],
    },
  });
  createButtonObserver({
    attribute: "vertical-timeline",
    shortcut: "timeline",
    render: (b: HTMLButtonElement) => {
      const blockId = b.closest(".roam-block")?.id;
      b.parentElement.onmousedown = (e: MouseEvent) => e.stopPropagation();
      render({ p: b.parentElement, blockId });
    },
  });
});
