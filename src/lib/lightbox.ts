/*
  The lightbox shows images in their original colors: recolorImages.ts skips
  everything inside it. PhotoSwipe opens from the thumbnail's current image,
  though, which is the themed copy, so point it at the original instead.
*/
export function openFromOriginals(lightbox: {
  addFilter(
    name: "domItemData",
    filter: (itemData: { msrc?: string }, element: HTMLElement) => object,
  ): void;
}) {
  lightbox.addFilter("domItemData", (itemData, element) => {
    const original = element.querySelector("img")?.dataset.originalSrc;
    if (original) itemData.msrc = original;
    return itemData;
  });
}
