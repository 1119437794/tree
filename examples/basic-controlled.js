webpackJsonp([2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(178);


/***/ },

/***/ 178:
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
	
	var _util = __webpack_require__(179);
	
	var Demo = _react2['default'].createClass({
	  displayName: 'Demo',
	
	  propTypes: {
	    multiple: _react.PropTypes.bool
	  },
	  getDefaultProps: function getDefaultProps() {
	    return {
	      multiple: false
	    };
	  },
	  getInitialState: function getInitialState() {
	    return {
	      expandedKeys: (0, _util.getFilterExpandedKeys)(_util.gData, ['0-0-0', '0-0-1']),
	      checkedKeys: ['0-0-0'],
	      selectedKeys: []
	    };
	  },
	  onExpand: function onExpand(treeNode, expand, expandedKeys) {
	    console.log('onExpand', expand, expandedKeys);
	    var index = expandedKeys.indexOf(treeNode.props.eventKey);
	    if (expand) {
	      if (index > -1) {
	        expandedKeys.splice(index, 1);
	      }
	    } else {
	      if (index === -1) {
	        expandedKeys.push(treeNode.props.eventKey);
	      }
	    }
	    this.setState({
	      expandedKeys: expandedKeys
	    });
	  },
	  onCheck: function onCheck(info) {
	    console.log('check: ', info);
	    this.setState({
	      checkedKeys: (0, _util.getCheckedKeys)(info.node, info.checkedKeys, info.allCheckedNodesKeys),
	      selectedKeys: ['0-3', '0-4']
	    });
	  },
	  onSelect: function onSelect(info) {
	    console.log('selected: ', info);
	    var selectedKeys = [].concat(_toConsumableArray(this.state.selectedKeys));
	    var index = selectedKeys.indexOf(info.node.props.eventKey);
	    if (index > -1) {
	      selectedKeys.splice(index, 1);
	    } else if (this.props.multiple) {
	      selectedKeys.push(info.node.props.eventKey);
	    } else {
	      selectedKeys = [info.node.props.eventKey];
	    }
	    this.setState({
	      selectedKeys: selectedKeys
	    });
	  },
	  render: function render() {
	    var loop = function loop(data) {
	      return data.map(function (item) {
	        if (item.children) {
	          return _react2['default'].createElement(
	            _rcTree.TreeNode,
	            { key: item.key, title: item.key, disableCheckbox: item.key === '0-0-0' ? true : false },
	            loop(item.children)
	          );
	        }
	        return _react2['default'].createElement(_rcTree.TreeNode, { key: item.key, title: item.key });
	      });
	    };
	    return _react2['default'].createElement(
	      'div',
	      null,
	      _react2['default'].createElement(
	        'h2',
	        null,
	        'controlled'
	      ),
	      _react2['default'].createElement(
	        _rcTree2['default'],
	        { checkable: true, multiple: this.props.multiple, defaultExpandAll: true,
	          onExpand: this.onExpand, expandedKeys: this.state.expandedKeys,
	          onCheck: this.onCheck, checkedKeys: this.state.checkedKeys,
	          onSelect: this.onSelect, selectedKeys: this.state.selectedKeys },
	        loop(_util.gData)
	      )
	    );
	  }
	});
	
	_reactDom2['default'].render(_react2['default'].createElement(Demo, null), document.getElementById('__react-content'));

/***/ },

/***/ 179:
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }
	
	var x = 3;
	var y = 2;
	var z = 1;
	var gData = [];
	
	var generateData = function generateData(_level, _preKey, _tns) {
	  var preKey = _preKey || '0';
	  var tns = _tns || gData;
	
	  var children = [];
	  for (var i = 0; i < x; i++) {
	    var key = preKey + '-' + i;
	    tns.push({ title: key, key: key });
	    if (i < y) {
	      children.push(key);
	    }
	  }
	  if (_level < 0) {
	    return tns;
	  }
	  var __level = _level - 1;
	  children.forEach(function (key, index) {
	    tns[index].children = [];
	    return generateData(__level, key, tns[index].children);
	  });
	};
	generateData(z);
	
	function isInclude(smallArray, bigArray) {
	  return smallArray.every(function (ii, i) {
	    return ii === bigArray[i];
	  });
	}
	// console.log(isInclude(['0', '1'], ['0', '10', '1']));
	
	function getCheckedKeys(node, checkedKeys, allCheckedNodesKeys) {
	  var nodeKey = node.props.eventKey;
	  var newCks = [].concat(_toConsumableArray(checkedKeys));
	  var nodePos = undefined;
	  var unCheck = allCheckedNodesKeys.some(function (item) {
	    if (item.key === nodeKey) {
	      nodePos = item.pos;
	      return true;
	    }
	  });
	  if (unCheck) {
	    (function () {
	      var nArr = nodePos.split('-');
	      newCks = [];
	      allCheckedNodesKeys.forEach(function (item) {
	        var iArr = item.pos.split('-');
	        if (item.pos === nodePos || nArr.length > iArr.length && isInclude(iArr, nArr) || nArr.length < iArr.length && isInclude(nArr, iArr)) {
	          // 过滤掉 非父级节点 和 所有子节点。
	          // 因为 node节点 不选时，其 非父级节点 和 所有子节点 都不选。
	          return;
	        }
	        newCks.push(item.key);
	      });
	    })();
	  } else {
	    newCks.push(nodeKey);
	  }
	  return newCks;
	}
	
	function loopData(data, callback) {
	  var loop = function loop(d) {
	    var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	    d.forEach(function (item, index) {
	      var pos = level + '-' + index;
	      if (item.children) {
	        loop(item.children, pos);
	      }
	      callback(item, index, pos);
	    });
	  };
	  loop(data);
	}
	
	function getFilterExpandedKeys(data, expandedKeys) {
	  var expandedPosArr = [];
	  loopData(data, function (item, index, pos) {
	    if (expandedKeys.indexOf(item.key) > -1) {
	      expandedPosArr.push(pos);
	    }
	  });
	  var filterExpandedKeys = [];
	  loopData(data, function (item, index, pos) {
	    expandedPosArr.forEach(function (p) {
	      if ((pos.split('-').length < p.split('-').length && p.indexOf(pos) === 0 || pos === p) && filterExpandedKeys.indexOf(item.key) === -1) {
	        filterExpandedKeys.push(item.key);
	      }
	    });
	  });
	  return filterExpandedKeys;
	}
	
	exports.gData = gData;
	exports.getCheckedKeys = getCheckedKeys;
	exports.getFilterExpandedKeys = getFilterExpandedKeys;

/***/ }

});
//# sourceMappingURL=basic-controlled.js.map