export const rules = {
    htmlFileSize: {
      maxKB: 128,
    },
    heroImages: {
      maxWidth: 600,
      maxHeight: 300,
      allowedExtensions: [".jpg", ".jpeg", ".png", ".gif"],
    },
    inlineStylesForImages: {
      requiredStyles: [
        "display: inline-block",
        "border: none",
        "color: #151515",
        "font-size: 12px",
        "font-style: italic",
        "font-weight: normal",
      ],
    },
    links: {
      target: "_blank",
    },
    wordsToCheckItalicized: [
      "et al",
      "invitro",
      "in vivo",
      "in vitro",
      "envitro",
      "en vivo",
      "en vitro",
      "in utero",
    ],
    heroImageRules: {
      maxWidth: 600,
      maxHeight: 300,
      allowedExtensions: [".jpg", ".jpeg", ".png", ".gif"],
      heroImageConditions: [
        {
          check: (img) => img.width <= 600,
          errorMessage: "Width should be 600 of poster image",
        },
        {
          check: (img) => img.height === 280 || img.height <= 300,
          errorMessage: "Height should be 280 (max 300)",
        },
        {
          check: (img, allowedExtensions) => {
            const src = img.src.toLowerCase();
            return allowedExtensions.some((ext) => src.endsWith(ext));
          },
          errorMessage:
            "Image extension not valid it should be (.jpg / .png / .gif)",
        },
        {
          check: (img) => {
            const altText = img.alt.trim();
            const computedStyle = window.getComputedStyle(img);
            return (
              altText.length <= 125 && computedStyle.fontStyle === "italic"
            );
          },
          errorMessage:
            "Max 125 characters including spaces, it should be italic.",
        },
      ],
    },
  };