import React from "react";
import Sidebar from "./src/Sidebar";
import ContentBlock from "./src/ContentBlock";
import "./src/styles.css";

export const accordionSidebarContext = React.createContext();

const defaultSliderStyle = {
  height: "5px",
  backgroundColor: "#222"
};

const defaultTitleStyle = {
  height: "20px",
  backgroundColor: "#333",
  color: "#eee"
};

const AccordionSidebar = (props) => {
  const {
    children,
    contentHeight = 100,
    sidebarWidth = 300,
    sliderStyle = {},
    titleStyle = {}
  } = props;

  const value = {
    contentHeight,
    sidebarWidth,
    sliderStyle: Object.assign({}, sliderStyle, defaultSliderStyle),
    titleStyle: Object.assign({}, titleStyle, defaultTitleStyle)
  };

  return (
    <accordionSidebarContext.Provider value={value}>
      <Sidebar>{children}</Sidebar>
    </accordionSidebarContext.Provider>
  );
};

export { AccordionSidebar, ContentBlock };
