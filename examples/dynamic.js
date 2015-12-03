webpackJsonp([2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(198);


/***/ },

/***/ 198:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }
	
	__webpack_require__(2);
	
	var _react = __webpack_require__(3);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(160);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _rcTree = __webpack_require__(161);
	
	var _rcTree2 = _interopRequireDefault(_rcTree);
	
	var asyncTree = [{ name: 'pNode 01', key: '0-0' }, { name: 'pNode 02', key: '0-1' }, { name: 'pNode 03', key: '0-2' }];
	
	var generateTreeNodes = function generateTreeNodes(treeNode) {
	  var arr = [];
	  var key = treeNode.props.eventKey;
	  for (var i = 0; i < 3; i++) {
	    arr.push({ name: 'leaf ' + key + '-' + i, key: key + '-' + i });
	  }
	  return arr;
	};
	
	var TreeDemo = _react2['default'].createClass({
	  displayName: 'TreeDemo',
	
	  propTypes: {},
	  getInitialState: function getInitialState() {
	    return {
	      treeData: []
	    };
	  },
	  componentDidMount: function componentDidMount() {
	    var _this = this;
	
	    this.timeout(1000).then(function () {
	      _this.setState({
	        treeData: asyncTree
	      });
	      return asyncTree;
	    });
	  },
	  timeout: function timeout() {
	    var _this2 = this;
	
	    var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	    return new Promise(function (resolve) {
	      setTimeout(resolve.bind(_this2), duration);
	    });
	  },
	  handleSelect: function handleSelect(info) {
	    console.log('selected', info);
	  },
	  handleDataLoaded: function handleDataLoaded(treeNode) {
	    var _this3 = this;
	
	    return this.timeout(1000).then(function () {
	      var treeData = [].concat(_toConsumableArray(_this3.state.treeData));
	      var child = generateTreeNodes(treeNode);
	      var curKey = treeNode.props.eventKey;
	      var loop = function loop(data) {
	        if (curKey.length >= 9) return;
	        data.forEach(function (item) {
	          if (curKey.indexOf(item.key) === 0) {
	            if (item.children) {
	              loop(item.children);
	            } else {
	              item.children = child;
	            }
	          }
	        });
	      };
	      loop(treeData);
	      _this3.setState({ treeData: treeData });
	      return child;
	    });
	  },
	  render: function render() {
	    var loop = function loop(data) {
	      return data.map(function (item) {
	        if (item.children) {
	          return _react2['default'].createElement(
	            _rcTree.TreeNode,
	            { title: item.name, key: item.key },
	            loop(item.children)
	          );
	        }
	        return _react2['default'].createElement(_rcTree.TreeNode, { title: item.name, key: item.key });
	      });
	    };
	    var parseTreeNode = function parseTreeNode(data) {
	      return loop(data);
	    };
	    var treeNodes = parseTreeNode(this.state.treeData);
	    return _react2['default'].createElement(
	      'div',
	      null,
	      _react2['default'].createElement(
	        'h2',
	        null,
	        'dynamic render'
	      ),
	      _react2['default'].createElement(
	        _rcTree2['default'],
	        { onSelect: this.handleSelect, onDataLoaded: this.handleDataLoaded, showIcon: false, showLine: false },
	        treeNodes
	      )
	    );
	  }
	});
	
	_reactDom2['default'].render(_react2['default'].createElement(TreeDemo, null), document.getElementById('__react-content'));

/***/ }

});
//# sourceMappingURL=dynamic.js.map