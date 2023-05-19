import { useEffect } from "react";

export function Nav2() {
  useEffect(() => {
    const $container = document.querySelector<HTMLDivElement>(".mm-items");
    if (!$container) throw new Error("Container required");
    $container.style.position = "relative";

    const $hover = document.querySelector<HTMLDivElement>(".mm-hover");
    if (!$hover) throw new Error("Hover item required");
    $hover.style.position = "absolute";

    const onEnterContainer: EventListener = () => {
      $hover.style.opacity = "";
      setTimeout(() => {
        $hover.style.transitionProperty = "all";
      }, 0);
    };
    const onLeaveContainer: EventListener = () => {
      $hover.style.opacity = "0";
      $hover.style.transitionProperty = "";
    };
    $container.addEventListener("mouseenter", onEnterContainer);
    $container.addEventListener("mouseleave", onLeaveContainer);

    const $items = document.querySelectorAll<HTMLAnchorElement>(".mm-item");
    if (!$items) return;
    const onEnterItem: EventListener = (e) => {
      console.log(e.target);
      const $item = e.target as HTMLAnchorElement;
      const px = 0;
      const py = 0;
      $hover.style.transform = `translate(${$item.offsetLeft - px}px, ${
        $item.offsetTop - py
      }px)`;
      $hover.style.width = `${$item.offsetWidth + px * 2}px`;
      $hover.style.height = `${$item.offsetHeight + py * 2}px`;
    };
    $items.forEach(($item) =>
      $item.addEventListener("mouseenter", onEnterItem)
    );
    return () => {
      console.log("remove listeners");

      $container.removeEventListener("mouseenter", onEnterContainer);
      $container.removeEventListener("mouseleave", onLeaveContainer);
      $items.forEach(($item) =>
        $item.removeEventListener("mouseenter", onEnterItem)
      );
    };
  }, []);

  return (
    <div className="mm-items flex items-start flex-col sm:flex-row">
      <a href="" className="mm-item px-3 py-1">
        Mark Miro
      </a>
      <a href="" className="mm-item px-3 py-1">
        Projects
      </a>
      <a href="" className="mm-item px-3 py-1">
        CodeSandbox
      </a>
      <a href="" className="mm-item px-3 py-1">
        Contact
      </a>
      <div
        className="mm-hover bg-black opacity-5 transition-opacity rounded-full pointer-events-none"
        style={{
          transitionDuration: "150ms",
          transitionTimingFunction: "ease-in-out",
        }}
      />
    </div>
  );
}
