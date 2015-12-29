import React, {PropTypes} from 'react';
import classNames from 'classnames';
import { getOffset } from './util';

const splitPos = (pos) => {
  return pos.split('-');
};
const filterMin = (arr) => {
  const a = [];
  arr.forEach((item) => {
    const b = a.filter((i) => {
      return item.indexOf(i) === 0 && (item[i.length] === '-' || !item[i.length]);
    });
    if (!b.length) {
      a.push(item);
    }
  });
  return a;
};
// console.log(filterMin(['0-0','0-1', '0-10', '0-0-1', '0-1-1', '0-10-0']));

function noop() {
}

class Tree extends React.Component {
  constructor(props) {
    super(props);
    ['onKeyDown', 'onCheck'].forEach((m)=> {
      this[m] = this[m].bind(this);
    });
    this.defaultExpandAll = props.defaultExpandAll;
    this.contextmenuKeys = [];

    this.state = {
      expandedKeys: props.defaultExpandedKeys,
      checkedKeys: this.getDefaultCheckedKeys(props),
      selectedKeys: this.getDefaultSelectedKeys(props),
      dragNodesKeys: '',
      dragOverNodeKey: '',
      dropNodeKey: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    const checkedKeys = this.getDefaultCheckedKeys(nextProps, true);
    const selectedKeys = this.getDefaultSelectedKeys(nextProps, true);
    this.setState({
      [checkedKeys && 'checkedKeys']: checkedKeys,
      [selectedKeys && 'selectedKeys']: selectedKeys,
    });
  }
  /*
  // ie8
  createDragElement(treeNode) {
    const props = this.props;

    // copy treeNode and it's childNodes, remove data-reactid attribute.
    let tn = treeNode.refs.selectHandle.cloneNode(true);
    [...tn.childNodes].forEach(child => {
      if (child.nodeType !== 1) {
        return;
      }
      child.removeAttribute('data-reactid');
    });
    tn.removeAttribute('data-reactid');

    // make element
    const li = document.createElement("li");
    li.className = treeNode.props.className || '';
    li.appendChild(tn);
    const ul = document.createElement("ul");
    ul.className = `${props.prefixCls}-dragUl ${classNames(props.className, props.prefixCls)}`;
    ul.appendChild(li);

    ul.setAttribute('draggable', 'true');
    this.refs.tree.parentNode.insertBefore(ul, this.refs.tree);
    ul.focus();
  }
  */
  onDragStart(e, treeNode) {
    // console.log(this.refs.tree.parentNode, treeNode.refs.selectHandle);
    // this.createDragElement(treeNode);
    this.dragNode = treeNode;
    this.dragNodesKeys = this.getDragNodes(treeNode);
    const st = {
      dragNodesKeys: this.dragNodesKeys,
    };
    const expandedKeys = this.getExpandedKeys(treeNode, false);
    if (expandedKeys) {
      st.expandedKeys = expandedKeys;
    }
    this.setState(st);
    this.props.onTreeDragStart({
      event: e,
      node: treeNode,
    });
  }
  onDragEnterGap(e, treeNode) {
    // console.log(e.pageY, getOffset(treeNode.refs.selectHandle), treeNode.props.eventKey);
    const offsetTop = getOffset(treeNode.refs.selectHandle).top;
    const offsetHeight = treeNode.refs.selectHandle.offsetHeight;
    const pageY = e.pageY;
    const gapHeight = 2;
    if (pageY > offsetTop + offsetHeight - gapHeight) {
      // console.log('enter gap');
      this.dropPos = 1;
      return 1;
    }
    if (pageY < offsetTop + gapHeight) {
      // console.log('ee');
      this.dropPos = -1;
      return -1;
    }
    // console.log('xx');
    this.dropPos = 0;
    return 0;
  }
  onDragEnter(e, treeNode) {
    const enterGap = this.onDragEnterGap(e, treeNode);
    if (this.dragNode.props.eventKey === treeNode.props.eventKey && enterGap === 0) {
      this.setState({
        dragOverNodeKey: '',
      });
      return;
    }
    // console.log('en...', this.dropPos);
    const st = {
      dragOverNodeKey: treeNode.props.eventKey,
    };
    const expandedKeys = this.getExpandedKeys(treeNode, true);
    if (expandedKeys) {
      st.expandedKeys = expandedKeys;
    }
    this.setState(st);
    this.props.onTreeDragEnter({
      event: e,
      node: treeNode,
      expandedKeys: expandedKeys || this.state.expandedKeys,
    });
  }
  onDragOver(e, treeNode) {
    this.props.onTreeDragOver({event: e, node: treeNode});
  }
  onDragLeave(e, treeNode) {
    this.props.onTreeDragLeave({event: e, node: treeNode});
  }
  onDrop(e, treeNode) {
    const key = treeNode.props.eventKey;
    if (this.dragNode.props.eventKey === key) {
      return;
    }
    this.setState({
      dragOverNodeKey: '',
      dropNodeKey: key,
    });

    const posArr = treeNode.props.pos.split('-');
    const res = {
      event: e,
      node: treeNode,
      dragNode: this.dragNode,
      dragNodesKeys: this.dragNodesKeys,
      dropPos: this.dropPos + Number(posArr[posArr.length - 1]),
    };
    if (this.dropPos !== 0) {
      res.dropToGap = true;
    }
    this.props.onTreeDrop(res);
  }
  onExpand(treeNode) {
    const thisProps = this.props;
    const tnProps = treeNode.props;
    const expandedKeys = this.state.expandedKeys.concat([]);
    const expanded = !tnProps.expanded;
    if (this.defaultExpandAll) {
      this.loopAllChildren(thisProps.children, (item, index, pos) => {
        const key = item.key || pos;
        if (expandedKeys.indexOf(key) === -1) {
          expandedKeys.push(key);
        }
      });
      this.defaultExpandAll = false;
    }
    const index = expandedKeys.indexOf(tnProps.eventKey);
    if (expanded) {
      if (index === -1) {
        expandedKeys.push(tnProps.eventKey);
        if (thisProps.onDataLoaded) {
          return thisProps.onDataLoaded(treeNode).then(() => {
            this.setState({
              expandedKeys: expandedKeys,
            });
          }).catch(() => {
            // console.error('Something went wrong', reason);
          });
        }
      }
    } else {
      expandedKeys.splice(index, 1);
    }
    this.setState({
      expandedKeys: expandedKeys,
    });
  }
  onCheck(treeNode) {
    const tnProps = treeNode.props;
    let checked = !tnProps.checked;
    if (tnProps.checkPart) {
      checked = true;
    }
    let pos;
    Object.keys(this.treeNodesStates).forEach((item) => {
      const itemObj = this.treeNodesStates[item];
      if (itemObj.key === (treeNode.key || tnProps.eventKey)) {
        pos = item;
        itemObj.checked = checked;
        itemObj.checkPart = false;
      }
    });
    this.handleCheckState(this.treeNodesStates, [pos], !checked);
    const checkKeys = this.getCheckKeys();
    this.checkPartKeys = checkKeys.checkPartKeys;
    let checkedKeys = checkKeys.checkedKeys;
    const newSt = {
      event: 'check',
      node: treeNode,
      allCheckedNodes: checkKeys.checkedNodes,
    };
    if (!('checkedKeys' in this.props)) {
      this.setState({
        checkedKeys,
      });
      newSt.checked = checked;
    } else {
      checkedKeys = this.state.checkedKeys;
      newSt.allCheckedNodes = Object.keys(this.treeNodesStates).filter((item) => {
        const itemObj = this.treeNodesStates[item];
        if (this.checkedKeys.indexOf(itemObj.key) !== -1) {
          return itemObj.node;
        }
      });
    }
    newSt.checkedKeys = checkedKeys;
    this.props.onCheck(newSt);
  }
  onSelect(treeNode) {
    const props = this.props;
    let selectedKeys = [...this.state.selectedKeys];
    const eventKey = treeNode.props.eventKey;
    const index = selectedKeys.indexOf(eventKey);
    let selected;
    if (index !== -1) {
      selected = false;
      selectedKeys.splice(index, 1);
    } else {
      selected = true;
      if (!props.multiple) {
        selectedKeys.length = 0;
      }
      selectedKeys.push(eventKey);
    }
    const newSt = {
      event: 'select',
      node: treeNode,
    };
    if (!('selectedKeys' in this.props)) {
      this.setState({
        selectedKeys: selectedKeys,
      });
      newSt.selected = selected;
    } else {
      selectedKeys = this.state.selectedKeys;
    }
    newSt.selectedKeys = selectedKeys;
    props.onSelect(newSt);
  }
  onMouseEnter(e, treeNode) {
    this.props.onMouseEnter({event: e, node: treeNode});
  }
  onMouseLeave(e, treeNode) {
    this.props.onMouseLeave({event: e, node: treeNode});
  }
  onContextMenu(e, treeNode) {
    const selectedKeys = [...this.state.selectedKeys];
    const eventKey = treeNode.props.eventKey;
    if (this.contextmenuKeys.indexOf(eventKey) === -1) {
      this.contextmenuKeys.push(eventKey);
    }
    this.contextmenuKeys.forEach((key) => {
      const index = selectedKeys.indexOf(key);
      if (index !== -1) {
        selectedKeys.splice(index, 1);
      }
    });
    if (selectedKeys.indexOf(eventKey) === -1) {
      selectedKeys.push(eventKey);
    }
    this.setState({
      selectedKeys,
    });
    this.props.onRightClick({event: e, node: treeNode});
  }
  // all keyboard events callbacks run from here at first
  onKeyDown(e) {
    e.preventDefault();
  }
  getDefaultCheckedKeys(props, willReceiveProps) {
    let checkedKeys = willReceiveProps ? undefined : props.defaultCheckedKeys;
    if ('checkedKeys' in props) {
      checkedKeys = props.checkedKeys || [];
    }
    return checkedKeys;
  }
  getDefaultSelectedKeys(props, willReceiveProps) {
    const defaultSelectedKeys = props.multiple ? [...props.defaultSelectedKeys] : [props.defaultSelectedKeys[0]];
    let selectedKeys = willReceiveProps ? undefined : defaultSelectedKeys;
    if ('selectedKeys' in props) {
      selectedKeys = props.multiple ? [...props.selectedKeys] : [props.selectedKeys[0]];
    }
    return selectedKeys;
  }
  getCheckKeys() {
    const checkPartKeys = [];
    const checkedKeys = [];
    const checkedNodes = [];
    Object.keys(this.treeNodesStates).forEach((item) => {
      const itemObj = this.treeNodesStates[item];
      if (itemObj.checked) {
        checkedKeys.push(itemObj.key);
        checkedNodes.push(itemObj.node);
      } else if (itemObj.checkPart) {
        checkPartKeys.push(itemObj.key);
      }
    });
    return {
      checkPartKeys, checkedKeys, checkedNodes,
    };
  }
  getOpenTransitionName() {
    const props = this.props;
    let transitionName = props.openTransitionName;
    const animationName = props.openAnimation;
    if (!transitionName && typeof animationName === 'string') {
      transitionName = `${props.prefixCls}-open-${animationName}`;
    }
    return transitionName;
  }
  getDragNodes(treeNode) {
    const dragNodesKeys = [];
    Object.keys(this.treeNodesStates).forEach(item => {
      if (item.indexOf(treeNode.props.pos) === 0) {
        dragNodesKeys.push(this.treeNodesStates[item].key);
      }
    });
    return dragNodesKeys;
  }
  getExpandedKeys(treeNode, expand) {
    const key = treeNode.props.eventKey;
    const expandedKeys = this.state.expandedKeys;
    const expandedIndex = expandedKeys.indexOf(key);
    let exKeys;
    if (expandedIndex > -1 && !expand) {
      exKeys = [...expandedKeys];
      exKeys.splice(expandedIndex, 1);
      return exKeys;
    }
    if (expand && expandedKeys.indexOf(key) === -1) {
      return expandedKeys.concat([key]);
    }
  }
  handleCheckState(obj, checkedArr, unCheckEvent) {
    let evt = false;
    if (typeof unCheckEvent === 'boolean') {
      evt = true;
    }
    // stripTail('x-xx-sss-xx')
    const stripTail = (str) => {
      const arr = str.match(/(.+)(-[^-]+)$/);
      let st = '';
      if (arr && arr.length === 3) {
        st = arr[1];
      }
      return st;
    };
    checkedArr.forEach((_pos) => {
      Object.keys(obj).forEach((i) => {
        if (splitPos(i).length > splitPos(_pos).length && i.indexOf(_pos) === 0) {
          obj[i].checkPart = false;
          if (evt) {
            if (unCheckEvent) {
              obj[i].checked = false;
            } else {
              obj[i].checked = true;
            }
          } else {
            obj[i].checked = true;
          }
        }
      });
      const loop = (__pos) => {
        const _posLen = splitPos(__pos).length;
        if (_posLen <= 2) {
          return;
        }
        let sibling = 0;
        let siblingChecked = 0;
        const parentPos = stripTail(__pos);
        Object.keys(obj).forEach((i) => {
          if (splitPos(i).length === _posLen && i.indexOf(parentPos) === 0) {
            sibling++;
            if (obj[i].checked) {
              siblingChecked++;
            } else if (obj[i].checkPart) {
              siblingChecked += 0.5;
            }
          }
        });
        const parent = obj[parentPos];
        // sibling 不会等于0
        // 全不选 - 全选 - 半选
        if (siblingChecked === 0) {
          parent.checked = false;
          parent.checkPart = false;
        } else if (siblingChecked === sibling) {
          parent.checked = true;
          parent.checkPart = false;
        } else {
          parent.checkPart = true;
          parent.checked = false;
        }
        loop(parentPos);
      };
      loop(_pos);
    });
  }
  loopAllChildren(childs, callback) {
    const loop = (children, level) => {
      React.Children.forEach(children, (item, index) => {
        const pos = `${level}-${index}`;
        let newChildren = item.props.children;
        if (newChildren) {
          if (!Array.isArray(newChildren)) {
            newChildren = [newChildren];
          }
          loop(newChildren, pos);
        }
        callback(item, index, pos);
      });
    };
    loop(childs, 0);
  }
  renderTreeNode(child, index, level = 0) {
    const key = child.key || `${level}-${index}`;
    const state = this.state;
    const props = this.props;
    const cloneProps = {
      ref: 'treeNode-' + key,
      root: this,
      eventKey: key,
      pos: `${level}-${index}`,
      onDataLoaded: props.onDataLoaded,
      onMouseEnter: props.onMouseEnter,
      onMouseLeave: props.onMouseLeave,
      onRightClick: props.onRightClick,
      prefixCls: props.prefixCls,
      showLine: props.showLine,
      showIcon: props.showIcon,
      checkable: props.checkable,
      draggable: props.draggable,
      dragOver: state.dragOverNodeKey === key && this.dropPos === 0,
      dragOverGapTop: state.dragOverNodeKey === key && this.dropPos === -1,
      dragOverGapBottom: state.dragOverNodeKey === key && this.dropPos === 1,
      expanded: this.defaultExpandAll || state.expandedKeys.indexOf(key) !== -1,
      selected: state.selectedKeys.indexOf(key) !== -1,
      checked: this.checkedKeys.indexOf(key) !== -1,
      checkPart: this.checkPartKeys.indexOf(key) !== -1,
      openTransitionName: this.getOpenTransitionName(),
      openAnimation: props.openAnimation,
    };
    return React.cloneElement(child, cloneProps);
  }
  render() {
    const props = this.props;
    const domProps = {
      className: classNames(props.className, props.prefixCls),
      role: 'tree-node',
    };
    if (props.focusable) {
      domProps.tabIndex = '0';
      domProps.onKeyDown = this.onKeyDown;
    }
    const checkedKeys = this.state.checkedKeys;
    const checkedPos = [];
    this.treeNodesStates = {};
    this.loopAllChildren(props.children, (item, index, pos) => {
      const key = item.key || pos;
      let checked = false;
      if (checkedKeys.indexOf(key) !== -1) {
        checked = true;
        checkedPos.push(pos);
      }
      this.treeNodesStates[pos] = {
        node: item,
        key: key,
        checked: checked,
        checkPart: false,
      };
    });
    this.handleCheckState(this.treeNodesStates, filterMin(checkedPos.sort()));
    const checkKeys = this.getCheckKeys();
    this.checkPartKeys = checkKeys.checkPartKeys;
    this.checkedKeys = checkKeys.checkedKeys;
    this.newChildren = React.Children.map(props.children, this.renderTreeNode, this);
    return (
      <ul {...domProps} unselectable ref="tree">
        {this.newChildren}
      </ul>
    );
  }
}

Tree.propTypes = {
  prefixCls: PropTypes.string,
  checkable: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.node,
  ]),
  multiple: PropTypes.bool,
  showLine: PropTypes.bool,
  showIcon: PropTypes.bool,
  defaultExpandAll: PropTypes.bool,
  defaultExpandedKeys: PropTypes.arrayOf(PropTypes.string),
  checkedKeys: PropTypes.arrayOf(PropTypes.string),
  defaultCheckedKeys: PropTypes.arrayOf(PropTypes.string),
  selectedKeys: PropTypes.arrayOf(PropTypes.string),
  defaultSelectedKeys: PropTypes.arrayOf(PropTypes.string),
  onCheck: PropTypes.func,
  onSelect: PropTypes.func,
  onDataLoaded: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onRightClick: PropTypes.func,
  onTreeDragStart: PropTypes.func,
  onTreeDragEnter: PropTypes.func,
  onTreeDragOver: PropTypes.func,
  onTreeDragLeave: PropTypes.func,
  onTreeDrop: PropTypes.func,
  openTransitionName: PropTypes.string,
  openAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

Tree.defaultProps = {
  prefixCls: 'rc-tree',
  multiple: false,
  checkable: false,
  draggable: false,
  showLine: false,
  showIcon: true,
  defaultExpandAll: false,
  defaultExpandedKeys: [],
  defaultCheckedKeys: [],
  defaultSelectedKeys: [],
  onCheck: noop,
  onSelect: noop,
  onTreeDragStart: noop,
  onTreeDragEnter: noop,
  onTreeDragOver: noop,
  onTreeDragLeave: noop,
  onTreeDrop: noop,
};

export default Tree;
