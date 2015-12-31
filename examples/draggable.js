import 'rc-tree/assets/index.less';
import 'rc-tree/assets/demo-draggable.less';
import React from 'react';
import ReactDOM from 'react-dom';
import Tree, {TreeNode} from 'rc-tree';
import { gData } from './util';

class TreeDemo extends React.Component {
  constructor(props) {
    super(props);
    ['handleDragStart', 'handleDragEnter', 'handleDrop', 'handleCheck', 'handleSelect'].forEach((m)=> {
      this[m] = this[m].bind(this);
    });
    this.state = {
      gData: gData,
      expandedKeys: ['0-0', '0-0-0', '0-0-0-0'],
      checkedKeys: [],
      selectedKeys: [],
    };
  }
  handleDragStart() {
  }
  handleDragEnter(info) {
    // console.log(info);
    this.setState({
      expandedKeys: info.expandedKeys,
    });
  }
  handleDrop(info) {
    console.log(info);
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    // const dragNodesKeys = info.dragNodesKeys;
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...this.state.gData];
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    if (info.dropToGap) {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      ar.splice(i, 0, dragObj);
    } else {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj);
      });
    }
    this.setState({
      gData: data,
      expandedKeys: info.originExpandedKeys,
    });
  }
  handleCheck(info) {
    // console.log('check: ', info);
    this.setState({
      checkedKeys: [info.node.props.eventKey],
    });
  }
  handleSelect(info) {
    // console.log('selected: ', info);
    this.setState({
      selectedKeys: [info.node.props.eventKey],
    });
  }
  render() {
    const loop = data => {
      return data.map((item) => {
        if (item.children) {
          return <TreeNode key={item.key} title={item.key}>{loop(item.children)}</TreeNode>;
        }
        return <TreeNode key={item.key} title={item.key} />;
      });
    };
    return (<div className="draggable-demo">
      <h2>draggable </h2>
      <p>drag a node into another node</p>
      <div className="draggable-container">
        <Tree defaultExpandedKeys={this.state.expandedKeys} draggable
              onTreeDragStart={this.handleDragStart} onTreeDragEnter={this.handleDragEnter} onTreeDrop={this.handleDrop}
              checkable={false} onCheck={this.handleCheck} checkedKeys={this.state.checkedKeys}
              onSelect={this.handleSelect} selectedKeys={this.state.selectedKeys}>
          {loop(this.state.gData)}
        </Tree>
      </div>
    </div>);
  }
}

ReactDOM.render(<TreeDemo />, document.getElementById('__react-content'));
