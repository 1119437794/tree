const expect = require('expect.js');
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const Tree = require('../');
const TreeNode = Tree.TreeNode;
const $ = require('jquery');

describe('simple tree', function des() {
  let instance;
  let div;
  beforeEach(function() {
    div = document.createElement('div');
    document.body.appendChild(div);
  });
  afterEach(function() {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  });

  it('should add css class of root dom node', function() {
    instance = ReactDOM.render(
      <Tree className="forTest">
        <TreeNode title="1" />
      </Tree>, div
    );
    expect(ReactDOM.findDOMNode(instance).className.indexOf('forTest') !== -1).to.be(true);
  });

  it('should select one item or more', function(done) {
    function handleSelect(arg) {
      if (arg) {
        setTimeout(function() {
          expect(arg.node.props.selected).to.be(true);
          setTimeout(function() {
            done();
          }, 1000);
        }, 100);
      }
    }
    instance = ReactDOM.render(
      <Tree multiple onSelect={handleSelect}>
        <TreeNode title="parent 1" key="0-0">
          <TreeNode title="leaf 1" key="0-0-0" />
          <TreeNode title="leaf 2" key="0-0-1" />
        </TreeNode>
      </Tree>, div);
    Simulate.click(instance.refs['treeNode-0-0'].refs['treeNode-0-0-0'].refs.selectHandle);
    Simulate.click(instance.refs['treeNode-0-0'].refs['treeNode-0-0-1'].refs.selectHandle);
  });

  it('should have checkbox, default expand all treeNode, not show icon, show line', function(done) {
    instance = ReactDOM.render(
      <Tree checkable defaultExpandAll showIcon={false} showLine>
        <TreeNode title="parent 1" key="0-0">
          <TreeNode title="leaf 1" key="0-0-0">
            <TreeNode title="leaf" key="random" />
            <TreeNode title="leaf" />
          </TreeNode>
          <TreeNode title="leaf 2" key="0-0-1" />
        </TreeNode>
      </Tree>, div);
    setTimeout(() => {
      const dom = $(ReactDOM.findDOMNode(instance));
      // have checkbox
      expect(dom.find('.rc-tree-checkbox').length).to.be(5);
      // expand all treeNode
      dom.find('.rc-tree-switcher').each((index, item) => {
        // console.log(item);
        expect(item.className.indexOf('_open') !== -1).to.be(true);
      });
      // not show icon
      expect(dom.find('.rc-tree-iconEle').length).to.be(0);
      // show line
      expect(dom.find('.rc-tree-line').length).to.be(1);
      done();
    }, 300);
  });
});
