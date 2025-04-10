import React from "react";
import Markdown from "react-markdown";

const SummeryBox = ({ summery }) => {
  return (
    <div className="h-[60vh] overflow-auto">
      <Markdown>{summery}</Markdown>
    </div>
  );
};

export default SummeryBox;
