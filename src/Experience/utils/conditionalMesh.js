import React from "react";

export const ConditionalMesh = ({
  progress,
  showRange,
  showRanges,
  children,
}) => {
  let isVisible = false;

  if (showRanges) {
    isVisible = showRanges.some((range) => {
      const [start, end] = range;
      return progress >= start && progress <= end;
    });
  } else if (showRange) {
    const [start, end] = showRange;
    isVisible = progress >= start && progress <= end;
  }

  return isVisible ? children : null;
};
