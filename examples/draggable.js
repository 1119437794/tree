webpackJsonp([4],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(222);


/***/ },

/***/ 179:
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
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
	exports.getFilterExpandedKeys = getFilterExpandedKeys;

/***/ },

/***/ 222:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }
	
	__webpack_require__(2);
	
	__webpack_require__(223);
	
	var _react = __webpack_require__(3);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(160);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _rcTree = __webpack_require__(161);
	
	var _rcTree2 = _interopRequireDefault(_rcTree);
	
	var _util = __webpack_require__(179);
	
	var Demo = _react2['default'].createClass({
	  displayName: 'Demo',
	
	  getInitialState: function getInitialState() {
	    return {
	      gData: _util.gData,
	      expandedKeys: ['0-0', '0-0-0', '0-0-0-0']
	    };
	  },
	  onDragStart: function onDragStart() {},
	  onDragEnter: function onDragEnter(info) {
	    // console.log(info);
	    this.setState({
	      expandedKeys: info.expandedKeys
	    });
	  },
	  onDrop: function onDrop(info) {
	    var dropKey = info.node.props.eventKey;
	    var dragKey = info.dragNode.props.eventKey;
	    // const dragNodesKeys = info.dragNodesKeys;
	    var loop = function loop(data, key, callback) {
	      data.forEach(function (item, index, arr) {
	        if (item.key === key) {
	          return callback(item, index, arr);
	        }
	        if (item.children) {
	          return loop(item.children, key, callback);
	        }
	      });
	    };
	    var data = [].concat(_toConsumableArray(this.state.gData));
	    var dragObj = undefined;
	    loop(data, dragKey, function (item, index, arr) {
	      arr.splice(index, 1);
	      dragObj = item;
	    });
	    if (info.dropToGap) {
	      var ar = undefined;
	      var i = undefined;
	      loop(data, dropKey, function (item, index, arr) {
	        ar = arr;
	        i = index;
	      });
	      ar.splice(i, 0, dragObj);
	    } else {
	      loop(data, dropKey, function (item) {
	        item.children = item.children || [];
	        // where to insert 示例添加到尾部，可以是随意位置
	        item.children.push(dragObj);
	      });
	    }
	    this.setState({
	      gData: data,
	      expandedKeys: info.originExpandedKeys
	    });
	  },
	  render: function render() {
	    var loop = function loop(data) {
	      return data.map(function (item) {
	        if (item.children) {
	          return _react2['default'].createElement(
	            _rcTree.TreeNode,
	            { key: item.key, title: item.key },
	            loop(item.children)
	          );
	        }
	        return _react2['default'].createElement(_rcTree.TreeNode, { key: item.key, title: item.key });
	      });
	    };
	    return _react2['default'].createElement(
	      'div',
	      { className: 'draggable-demo' },
	      _react2['default'].createElement(
	        'h2',
	        null,
	        'draggable '
	      ),
	      _react2['default'].createElement(
	        'p',
	        null,
	        'drag a node into another node'
	      ),
	      _react2['default'].createElement(
	        'div',
	        { className: 'draggable-container' },
	        _react2['default'].createElement(
	          _rcTree2['default'],
	          { defaultExpandedKeys: this.state.expandedKeys,
	            draggable: true,
	            onDragStart: this.onDragStart,
	            onDragEnter: this.onDragEnter,
	            onDrop: this.onDrop
	          },
	          loop(this.state.gData)
	        )
	      )
	    );
	  }
	});
	
	_reactDom2['default'].render(_react2['default'].createElement(Demo, null), document.getElementById('__react-content'));

/***/ },

/***/ 223:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }

});
//# sourceMappingURL=draggable.js.map