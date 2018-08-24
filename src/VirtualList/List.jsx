import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { CSSMotion } from 'rc-animate';
import { polyfill } from 'react-lifecycles-compat';
import raf from 'raf'; // TODO: Remove this when we use rc-virtual-list later

import Item from './Item';
import {
  TYPE_KEEP, TYPE_ADD, TYPE_REMOVE,
  diffList, getBoxHeight, getContentHeight,
  getTargetItemByScroll, getScrollByTargetItem,
} from './util';

// TODO: Move this code to rc-virtual-list
/**
 * The mock container of item list's height is count * itemMinHeight * SCALE.
 * The SCALE value is to make the scrollHeight much bigger than origin
 * since we can get more accurate scrollTop percentage value.
 */
const ITEM_HEIGHT_SCALE = 1.5;

function heightProp(...args) {
  const [props, propName, Component] = args;
  const prop = props[propName];

  if (prop === false || typeof prop === 'number') {
    return null;
  }

  return new Error(
    `Invalid prop \`${propName}\` supplied to \`${Component}\`. ` +
    `Only accept boolean false or number value but get ${prop}`
  );
}


/**
 * Virtual List provide the container to hold list item.
 * The scroll bar pin element's height of scroll bar is always fixed.
 * We will dynamic calculate the list item position with the percentage position of pin bar.
 */
class VirtualList extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    dataSource: PropTypes.array,
    height: heightProp,
    innerComponent: PropTypes.any,
    itemMinHeight: PropTypes.number,
    rowKey: PropTypes.string,
    style: PropTypes.object,

    motion: PropTypes.shape({
      ...CSSMotion.propTypes,
    }),

    // Animation
    transitionName: PropTypes.string,

    // Event
    onScroll: PropTypes.func,
  };

  static defaultProps = {
    dataSource: [],
    innerComponent: 'div',
    itemMinHeight: 10,
  };

  constructor() {
    super();

    this.state = {
      scrollPtg: 0,
      targetItemIndex: 0,
      targetItemOffsetPtg: -1,
      useVirtualList: true,
      needSyncScroll: true,

      // item with animation
      itemList: [],
      animations: {},

      prevProps: {},
    };

    this.nodes = {};
    this.animationRaf = null;
  }

  componentDidMount() {
    const { height } = this.props;

    // No height no calculate
    if (height) {
      this.calculatePosition();
      this.syncPosition();
    }

    this.processAnimation();
  }

  static getDerivedStateFromProps(props, prevState) {
    const { prevProps } = prevState;
    const { dataSource, rowKey, motion } = props;
    const newState = {
      prevProps: props,
    };

    if (prevProps.dataSource !== dataSource) {
      if (!rowKey || !prevProps.dataSource || !motion) {
        newState.itemList = [{ type: TYPE_KEEP, list: dataSource }];
      } else {
        // Only has `rowKey` & animation props can do the animation
        newState.itemList = diffList(prevProps.dataSource, dataSource, rowKey);
      }
    }

    return newState;
  }

  // getSnapshotBeforeUpdate(prevProps, prevState) {
  //   // TODO: Not the best place
  //   const { animations } = prevState;
  //   console.log('=>', animations);
  //   // if (lockScroll) {
  //   const { targetItemIndex, targetItemOffsetPtg } = this.state;
  //   const totalCount = this.getItemCount(true);
  //   const scrollPtg = getScrollByTargetItem(targetItemIndex, targetItemOffsetPtg, totalCount);
  //   console.log('==>', scrollPtg);
  //   // }
  //   return null;
  // }

  componentDidUpdate() {
    const { height } = this.props;

    // No height no calculate
    if (height) {
      this.calculatePosition();
      this.syncPosition();
    }

    this.processAnimation();
  }

  componentWillUnmount() {
    this.cancelProcessAnimation();
  }

  onScroll = (...args) => {
    const { onScroll, height } = this.props;

    if (onScroll) {
      onScroll(...args);
    }

    // When `height` set to 0 will also trigger `onScroll` event. We needn't that.
    if (height) {
      this.calculatePosition();
    }
  };

  // TODO: support multi animation
  onMotionEnd = () => {
    const { dataSource } = this.props;
    this.setState({
      itemList: [{ type: TYPE_KEEP, list: dataSource }],
      animations: {},
    });
  };

  setContainerRef = (ele) => {
    this.$container = ele;
  };

  getTopCount = (state) => {
    const { scrollPtg } = state || this.state;
    const { itemMinHeight, height } = this.props;
    return Math.max(
      Math.ceil(scrollPtg * height / itemMinHeight),
      0,
    );
  };

  getBottomCount = (state) => {
    const { scrollPtg } = state || this.state;
    const { itemMinHeight, height } = this.props;
    return Math.max(
      Math.ceil((1 - scrollPtg) * height / itemMinHeight),
      0,
    );
  };

  // Get real dom height
  getItemHeight = (index) => {
    const targetNode = this.nodes[index];
    const targetDom = ReactDOM.findDOMNode(targetNode);
    return getBoxHeight(targetDom) || 0;
  };

  getItemCount = (includeAnimatingItems) => {
    const { itemList } = this.state;


    if (includeAnimatingItems) {
      return itemList.reduce((count, { list }) => count + list.length, 0);
    }

    let total = 0;
    itemList.forEach(({ type, list }) => {
      total += type === TYPE_KEEP ? list.length : 1;
    });

    return total;
  };

  getItem = (index) => {
    const { itemList } = this.state;
    let current = index;
    const listCount = itemList.length;

    for (let i = 0; i < listCount; i += 1) {
      const { type, list } = itemList[i];
      const isKeep = type === TYPE_KEEP;
      const len = isKeep ? list.length : 1;
      if (current < len) {
        return {
          type,
          item: isKeep ? list[current] : list,
        };
      }
      current -= len;
    }

    return null;
  };

  calculatePosition = () => {
    const { targetItemIndex, targetItemOffsetPtg, useVirtualList } = this.state;
    const { itemMinHeight, height } = this.props;

    const total = this.getItemCount(true);
    if (total === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = this.$container;
    const scrollRange = scrollHeight - clientHeight;

    // Skip if needn't scroll
    if (total * itemMinHeight <= height) {
      if (useVirtualList !== false) {
        this.setState({
          useVirtualList: false,
        });
      }
      return;
    }

    // Get current scroll position (percentage)
    let scrollPtg = scrollTop / scrollRange;

    // Mark as 0 if scrollRange is 0
    if (isNaN(scrollPtg)) {
      scrollPtg = 0;
    }

    console.log('Total:', total);
    console.log('Scroll:', scrollPtg.toFixed(3), scrollTop, scrollRange);

    // Safari has the bump effect which will make scroll out of range. Need check this.
    scrollPtg = Math.max(0, scrollPtg);
    scrollPtg = Math.min(1, scrollPtg);

    const { itemIndex, itemOffsetPtg } = getTargetItemByScroll(scrollPtg, total);

    if (targetItemIndex !== itemIndex || targetItemOffsetPtg !== itemOffsetPtg) {
      this.setState({
        scrollPtg,
        targetItemIndex: itemIndex,
        targetItemOffsetPtg: itemOffsetPtg,
        needSyncScroll: true,
        useVirtualList: true,
      });
    }
  };

  syncPosition = () => {
    const { needSyncScroll, targetItemIndex, targetItemOffsetPtg, scrollPtg } = this.state;

    // `targetItemOffsetPtg = -1` is only when the dom init
    if (!needSyncScroll || targetItemOffsetPtg === -1) return;

    const { scrollTop } = this.$container;

    // Calculate target item
    const targetItemHeight = this.getItemHeight(targetItemIndex);
    const targetItemTop = scrollPtg * getContentHeight(this.$container);
    const targetItemOffset = targetItemOffsetPtg * targetItemHeight;
    const targetItemMergedTop = scrollTop + targetItemTop - targetItemOffset;

    // Calculate top items
    let topItemsTop = targetItemMergedTop;
    const topCount = this.getTopCount();
    [...new Array(topCount)].forEach((_, i) => {
      const index = targetItemIndex - i - 1;
      topItemsTop -= this.getItemHeight(index);
    });

    this.setState({
      needSyncScroll: false,
      topItemTop: topItemsTop,
    });
  };

  /**
   * This is only used for the List which need animation process.
   * We will diff the `dataSource` to find the add or remove items and wrapped under a div.
   * It's OK for add animation.
   * But if is remove animation, we need to add list and then remove it to trigger rc-animate remove.
   */
  processAnimation = () => {
    this.cancelProcessAnimation();

    this.animationRaf = raf(() => {
      this.animationRaf = null;

      const { animations, targetItemIndex, useVirtualList } = this.state;
      const { motion, height } = this.props;
      if (!motion) return;

      let startIndex;
      let endIndex;

      // Calculate the check range
      if (useVirtualList && height) {
        startIndex = targetItemIndex - this.getTopCount();
        endIndex = targetItemIndex + this.getBottomCount();
      } else {
        startIndex = 0;
        endIndex = this.getItemCount();
      }

      const newAnimations = {};
      let changed = false;

      for (let i = startIndex; i < endIndex; i += 1) {
        const { type } = this.getItem(i) || {};
        if (type !== TYPE_KEEP && !animations[i]) {
          newAnimations[i] = true;
          changed = true;
        }
      }

      if (changed) {
        newAnimations.changed = true;
        this.setState({ animations: newAnimations });
      }
    });
  };

  cancelProcessAnimation = () => {
    if (this.animationRaf) {
      raf.cancel(this.animationRaf);
      this.animationRaf = null;
    }
  };

  renderSingleNode = (item, index) => {
    const { children, rowKey } = this.props;

    if (typeof children !== 'function') {
      return children;
    }

    const nodeRef = node => {
      this.nodes[index] = node;
    };

    return (
      <Item key={rowKey ? item[rowKey] : index} ref={nodeRef}>
        {children({
          index,
          style: {}, // TODO: Maybe we can remove this
          props: item,
        })}
      </Item>
    );
  };

  renderNode = (index) => {
    const { animations } = this.state;
    const { height, itemMinHeight, motion } = this.props;
    const { type, item: itemList } = this.getItem(index) || {};

    if (!itemList) {
      return null;
    }

    if (type === TYPE_KEEP) {
      return this.renderSingleNode(itemList, index); // It's a item, not list actually
    }

    // Animate
    let visible;
    if (type === TYPE_REMOVE) {
      visible = !animations[index];
    } else {
      visible = true;
    }

    const nodeRef = node => {
      this.nodes[index] = node;
    };

    let filteredList = itemList;
    if (height) {
      const maxCount = Math.ceil(height / itemMinHeight);
      filteredList = itemList.slice(0, maxCount);
    }

    return (
      <CSSMotion
        key={`RC_VIRTUAL_${index}`}
        motionAppear={type === TYPE_ADD}
        motionEnter={type === TYPE_ADD}
        motionLeave={type === TYPE_REMOVE}
        {...motion}
        onAppearEnd={this.onMotionEnd}
        onEnterEnd={this.onMotionEnd}
        onLeaveEnd={this.onMotionEnd}
        visible={visible}
      >
        {({ className, style }) => (
          <div className={className} style={style} ref={nodeRef}>
            {filteredList.map((item, j) => (
              this.renderSingleNode(item, `${index}_${j}`)
            ))}
          </div>
        )}
      </CSSMotion>
    );
  };

  render() {
    const { targetItemIndex, useVirtualList, topItemTop } = this.state;
    const {
      innerComponent: InnerComponent,
      height = 0, itemMinHeight,
      style,
      ...restProps
    } = this.props;

    delete restProps.dataSource;
    delete restProps.onVisibleChange;
    delete restProps.rowKey;
    delete restProps.transitionName;
    delete restProps.animation;

    // Calculate the list before target item
    const topCount = this.getTopCount();
    const bottomCount = this.getBottomCount();
    const totalCount = this.getItemCount(); // Count without animating items
    const totalItemCount = this.getItemCount(true); // Count includes animating items

    const mergedStyle = {
      ...style,
      overflowY: 'auto',
      height,
    };

    let innerStyle = {
      padding: 0,
      margin: 0,
    };

    // Virtual list render
    if (useVirtualList && height) {
      innerStyle = {
        ...innerStyle,
        height: Math.max(itemMinHeight * totalItemCount * ITEM_HEIGHT_SCALE, height),
        position: 'relative',
        overflowY: 'hidden',
      };

      const $children = [
        // Top items
        ...new Array(topCount),
        // Target item
        1,
        // Bottom items
        ...new Array(bottomCount),
      ].map((_, index) => (
        this.renderNode(targetItemIndex - (topCount - index))
      ));

      const ulStyle = {
        padding: 0,
        margin: 0,
        position: 'absolute',
        top: topItemTop,
        left: 0,
        right: 0,
        overflowAnchor: 'none',
      };

      return (
        <div
          style={mergedStyle}
          {...restProps}
          ref={this.setContainerRef}
          onScroll={this.onScroll}
        >
          <div style={innerStyle}>
            <InnerComponent style={ulStyle}>
              {$children}
            </InnerComponent>
          </div>
        </div>
      );
    }

    // Normal list
    return (
      <div
        style={mergedStyle}
        {...restProps}
        ref={this.setContainerRef}
        onScroll={this.onScroll}
      >
        <InnerComponent style={innerStyle}>
          {[...new Array(totalCount)].map((_, index) => (
            this.renderNode(index)
          ))}
        </InnerComponent>
      </div>
    );
  }
}

polyfill(VirtualList);

export default VirtualList;
