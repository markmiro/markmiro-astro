import React, { useEffect } from "react";
// @ts-ignore-next-line
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

export type Img = {
  smallURL: string;
  largeURL: string;
  width: number;
  height: number;
};

export default function Gallery(props: { images: Img[]; galleryID: string }) {
  useEffect(() => {
    let lightbox = new PhotoSwipeLightbox({
      gallery: "#" + props.galleryID,
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();

    return () => {
      lightbox.destroy();
      lightbox = null;
    };
  }, []);

  return (
    <div
      className="pswp-gallery not-prose grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      id={props.galleryID}
    >
      {props.images.map((image, index) => (
        <a
          className="grid place-items-center w-full mb-2"
          href={image.largeURL}
          data-pswp-width={image.width}
          data-pswp-height={image.height}
          key={props.galleryID + "-" + index}
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="border border-gray-400 rounded-lg shadow-md"
            src={image.smallURL}
            width={image.width}
            height={image.height}
            alt=""
          />
        </a>
      ))}
    </div>
  );
}
