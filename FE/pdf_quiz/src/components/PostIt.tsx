import React, { useState } from "react";
import Draggable from "react-draggable";
import closeIcon from "../assets/X.png";

interface PostItProps {
  onClose: () => void;
  style?: React.CSSProperties;
}

function PostIt({ onClose }: PostItProps) {
  const [text, setText] = useState("");

  return (
    <Draggable>
      <div className="w-60 h-60 bg-yellow-100 p-2 rounded-lg shadow-lg absolute">
        <div className="flex justify-end m-2">
          <img
            src={closeIcon}
            alt="Close"
            onClick={onClose}
            className="cursor-pointer"
            style={{ width: "12px", height: "12px" }}
          />
        </div>
        <textarea
          className="w-full h-[calc(100%-24px)] p-2 bg-yellow-100 border-none focus:outline-none resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </Draggable>
  );
}

export default PostIt;
