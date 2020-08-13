import React, { useState, useEffect, useRef, useContext } from "react";
import { accordionSidebarContext } from "../index";
import useResizeObserver from "./useResizeObserver";

export const sidebarContext = React.createContext();

const Sidebar = ({ children }) => {
  const { contentHeight, sidebarWidth, sliderStyle, titleStyle } = useContext(
    accordionSidebarContext
  );
  const [heightArr, setHeightArr] = useState([]);
  const [ulIndex, setUlIndex] = useState([[], []]);
  const [separatorYRange, setSeparatorYRange] = useState([0, 0]);
  const [initialized, setInitialized] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const separatorY = useRef(null);
  const ref = useRef(null);
  const [width, height] = useResizeObserver(ref);

  const count = React.Children.count(children);
  const sliderHeight = Number.parseInt(sliderStyle.height.slice(0, -2), 10);
  const titleHeight = Number.parseInt(titleStyle.height.slice(0, -2), 10);
  const headerHeight = sliderHeight + titleHeight;

  const getPrevIndex = (arr, index) => {
    const retArr = [];
    for (let i = index - 1; i >= 0; i--) {
      if (arr[i] > 0) retArr.push(i);
    }
    return retArr;
  };

  const getNextIndex = (arr, index) => {
    const retArr = [];
    for (let i = index; i < count; i++) {
      if (arr[i] > 0) retArr.push(i);
    }
    return retArr;
  };

  const getFirstIndex = (arr) => {
    for (let i = 0; i < count; i++) {
      if (arr[i] > 0) return i;
    }
    return -1;
  };

  const getLastIndex = (arr) => {
    for (let i = count - 1; i >= 0; i--) {
      if (arr[i] > 0) return i;
    }
    return -1;
  };

  useEffect(() => {
    if (height > 0) {
      const minimumHeight = (headerHeight + contentHeight) * count;
      const _height = height < minimumHeight ? minimumHeight : height;
      if (!initialized) {
        const hArr = Array(count).fill(0);
        hArr[0] = _height - headerHeight * count;
        setHeightArr(hArr);
        setInitialized(true);
      } else {
        if (_height !== containerHeight && containerHeight > 0) {
          const lastIndex = getLastIndex(heightArr);
          if (lastIndex >= 0) {
            const hArr = [...heightArr];
            const prev = containerHeight - headerHeight * count;
            const next = _height - headerHeight * count;
            const rate = next / prev;
            if (_height > containerHeight) {
              let tmp = 0;
              heightArr.forEach((e, i) => {
                if (i === lastIndex) {
                  hArr[i] = next - tmp;
                } else if (e > 0) {
                  hArr[i] = Math.max(contentHeight, Math.round(rate * e));
                  tmp += hArr[i];
                }
              });
            } else {
              heightArr.forEach((e, i) => {
                if (e > 0) {
                  hArr[i] = Math.max(contentHeight, Math.round(rate * e));
                }
              });
              let over = hArr.reduce((a, h) => a + h) - next;
              if (over > 0) {
                for (let i = count - 1; i >= 0; i--) {
                  if (heightArr[i] > 0 && hArr[i] > contentHeight) {
                    const tmp = hArr[i] - contentHeight;
                    if (over > tmp) {
                      hArr[i] = contentHeight;
                      over -= tmp;
                    } else {
                      hArr[i] -= over;
                      break;
                    }
                  }
                }
              } else if (over < 0) {
                const firstIndex = getFirstIndex(hArr);
                hArr[firstIndex] += over;
              }
            }
            setHeightArr(hArr);
          }
        }
      }
      setContainerHeight(_height);
    }
  }, [height]);

  useEffect(() => {
    if (ulIndex[0].length + ulIndex[1].length === 0) {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    } else {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  }, [ulIndex]);

  const setExpand = (index) => () => {
    const hArr = [...heightArr];
    const opened = heightArr[index] === 0;
    hArr[index] = opened ? contentHeight : 0;
    if (hArr.filter((e) => e > 0).length === 1) {
      const firstIndex = getFirstIndex(hArr);
      hArr[firstIndex] = containerHeight - headerHeight * count;
    } else if (!hArr.every((e) => e === 0)) {
      const nextIndex = getNextIndex(hArr, index + 1);
      const prevIndex = getPrevIndex(hArr, index);
      if (opened) {
        let currentHeight = contentHeight;
        if (nextIndex.length === 0) {
          let currentIndex = index - 1;
          while (currentIndex > -1) {
            if (heightArr[currentIndex] === 0) {
              currentIndex--;
              continue;
            }
            const tmpHeight = heightArr[currentIndex] - contentHeight;
            if (tmpHeight >= currentHeight) {
              hArr[currentIndex] -= currentHeight;
              break;
            } else {
              hArr[currentIndex] = contentHeight;
              currentHeight -= tmpHeight;
            }
            currentIndex--;
          }
        } else {
          let currentIndex = index + 1;
          while (currentIndex <= count - 1) {
            if (heightArr[currentIndex] === 0) {
              currentIndex++;
              continue;
            }
            const tmpHeight = heightArr[currentIndex] - contentHeight;
            if (tmpHeight >= currentHeight) {
              hArr[currentIndex] -= currentHeight;
              currentHeight = 0;
              break;
            } else {
              hArr[currentIndex] = contentHeight;
              currentHeight -= tmpHeight;
            }
            currentIndex++;
          }
          if (currentHeight > 0) {
            currentIndex = index - 1;
            while (currentIndex > -1) {
              if (heightArr[currentIndex] === 0) {
                currentIndex--;
                continue;
              }
              const tmpHeight = heightArr[currentIndex] - contentHeight;
              if (tmpHeight >= currentHeight) {
                hArr[currentIndex] -= currentHeight;
                break;
              } else {
                hArr[currentIndex] = contentHeight;
                currentHeight -= tmpHeight;
              }
              currentIndex--;
            }
          }
        }
      } else {
        if (nextIndex.length === 0) {
          hArr[prevIndex[0]] += heightArr[index];
        } else {
          hArr[nextIndex[0]] += heightArr[index];
        }
      }
    }
    setHeightArr(hArr);
  };

  const onMouseDown = (index) => (e) => {
    e.preventDefault();
    if (index === 0) {
      return;
    }
    const prevIndex = getPrevIndex(heightArr, index);
    const nextIndex = getNextIndex(heightArr, index);
    if (prevIndex.length > 0 && nextIndex.length > 0) {
      separatorY.current = e.clientY;
      const minus = heightArr.reduce(
        (a, c, i) => (i < index && c > 0 ? a + c - contentHeight : a),
        0
      );
      const plus = heightArr.reduce(
        (a, c, i) => (i >= index && c > 0 ? a + c - contentHeight : a),
        0
      );
      setSeparatorYRange([-minus, plus]);
      setUlIndex([prevIndex, nextIndex]);
    }
  };

  const onMouseMove = (e) => {
    if (
      ulIndex[0].length === 0 ||
      ulIndex[1].length === 0 ||
      separatorY.current === null
    ) {
      return;
    }
    let yPos = e.clientY - separatorY.current;
    if (separatorYRange[0] > yPos) {
      yPos = separatorYRange[0];
    }
    if (separatorYRange[1] < yPos) {
      yPos = separatorYRange[1];
    }
    const hArr = [...heightArr];
    if (yPos > 0) {
      hArr[ulIndex[0][0]] = heightArr[ulIndex[0][0]] + yPos;
      ulIndex[1].reduce((a, c) => {
        const tmp = heightArr[c] - contentHeight;
        if (a === 0) {
          return 0;
        } else if (tmp < a) {
          hArr[c] = heightArr[c] - tmp;
          return a - tmp;
        } else {
          hArr[c] = heightArr[c] - a;
          return 0;
        }
      }, yPos);
    } else if (yPos < 0) {
      hArr[ulIndex[1][0]] = heightArr[ulIndex[1][0]] - yPos;
      ulIndex[0].reduce((a, c) => {
        const tmp = heightArr[c] - contentHeight;
        if (a === 0) {
          return 0;
        } else if (tmp < a) {
          hArr[c] = heightArr[c] - tmp;
          return a - tmp;
        } else {
          hArr[c] = heightArr[c] - a;
          return 0;
        }
      }, -yPos);
    }
    setHeightArr(hArr);
  };

  const onMouseUp = (e) => {
    setUlIndex([[], []]);
    separatorY.current = null;
  };

  return (
    <sidebarContext.Provider value={{ heightArr, setExpand, onMouseDown }}>
      <div className="a-s-sidebar" ref={ref} style={{ width: sidebarWidth }}>
        {React.Children.map(children, (child, index) =>
          React.cloneElement(child, { index })
        )}
        <div className="a-s-blank" />
      </div>
    </sidebarContext.Provider>
  );
};

export default Sidebar;
