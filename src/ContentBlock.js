import React, { useLayoutEffect, useRef, useContext } from "react";
import { accordionSidebarContext } from "../index";
import { sidebarContext } from "./Sidebar";

const ContentBlock = (props) => {
  const { index, title = "", children } = props;
  const { sliderStyle, titleStyle } = useContext(accordionSidebarContext);
  const bodyRef = useRef(null);
  const { heightArr, setExpand, onMouseDown } = useContext(sidebarContext);

  useLayoutEffect(() => {
    bodyRef.current.style.height = `${heightArr[index]}px`;
  }, [heightArr]);

  return (
    <div className="a-s-block-container">
      <div
        className="a-s-block-slider"
        onMouseDown={onMouseDown(index)}
        style={sliderStyle}
      />
      <div
        className="a-s-block-title"
        onClick={setExpand(index)}
        style={titleStyle}
      >
        {title}
      </div>
      <div className="a-s-block-content" ref={bodyRef}>
        {children}
      </div>
    </div>
  );
};

export default ContentBlock;
