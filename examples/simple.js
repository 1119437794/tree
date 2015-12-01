import 'rc-tree/assets/index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import Tree, {TreeNode} from 'rc-tree';

function handleSelect(info) {
  console.log('selected', info);
}

const demo = (
  <div>
    <h2>simple</h2>
    <Tree className="myCls" checkable onSelect={handleSelect} defaultSelectedKeys={['0-1', 'random']} multiple
      defaultExpandAll showIcon={false} showLine>
      <TreeNode title="parent 1" key="0-1">
        <TreeNode title="parent 1-0" key="0-1-1">
          <TreeNode title="leaf" key="random" />
          <TreeNode title="leaf" />
        </TreeNode>
        <TreeNode title="parent 1-1">
          <TreeNode title={<span style={{color: 'red'}}>sss</span>} />
        </TreeNode>
      </TreeNode>
    </Tree>
  </div>
);

ReactDOM.render(demo, document.getElementById('__react-content'));
