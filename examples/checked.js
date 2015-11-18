webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	__webpack_require__(2);
	
	var _react = __webpack_require__(3);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(160);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _rcTree = __webpack_require__(161);
	
	var _rcTree2 = _interopRequireDefault(_rcTree);
	
	var x = 12;
	var y = 3;
	var z = 2;
	var data = [];
	
	var generateData = function generateData(_level, _preKey, _tns) {
	  var preKey = _preKey || '0';
	  var tns = _tns || data;
	
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
	  children.forEach(function (key, index) {
	    tns[index].children = [];
	    return generateData(--_level, key, tns[index].children);
	  });
	};
	generateData(z);
	
	var TreeDemo = (function (_React$Component) {
	  _inherits(TreeDemo, _React$Component);
	
	  function TreeDemo(props) {
	    var _this = this;
	
	    _classCallCheck(this, TreeDemo);
	
	    _get(Object.getPrototypeOf(TreeDemo.prototype), 'constructor', this).call(this, props);
	    ['handleClick', 'handleCheck', 'handleSelect'].forEach(function (m) {
	      _this[m] = _this[m].bind(_this);
	    });
	    this.state = {
	      checkedKeys: [],
	      selectedKeys: []
	    };
	  }
	
	  _createClass(TreeDemo, [{
	    key: 'handleClick',
	    value: function handleClick() {
	      this.setState({
	        checkedKeys: ['0-0'],
	        selectedKeys: ['p21', 'p11']
	      });
	    }
	  }, {
	    key: 'handleCheck',
	    value: function handleCheck(info) {
	      console.log('check: ', info);
	      this.setState({
	        checkedKeys: ['0-1'],
	        selectedKeys: ['0-3', '0-4']
	      });
	    }
	  }, {
	    key: 'handleSelect',
	    value: function handleSelect(info) {
	      console.log('selected: ', info);
	      this.setState({
	        checkedKeys: ['0-2'],
	        selectedKeys: ['0-2']
	      });
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var loop = function loop(data) {
	        return data.map(function (item) {
	          if (item.children) {
	            return _react2['default'].createElement(
	              _rcTree.TreeNode,
	              { key: item.key, title: item.key },
	              loop(item.children)
	            );
	          } else {
	            return _react2['default'].createElement(_rcTree.TreeNode, { key: item.key, title: item.key });
	          }
	        });
	      };
	      return _react2['default'].createElement(
	        'div',
	        null,
	        _react2['default'].createElement(
	          'div',
	          null,
	          _react2['default'].createElement(
	            'h2',
	            null,
	            'checked'
	          ),
	          _react2['default'].createElement(
	            _rcTree2['default'],
	            { defaultExpandAll: false, checkable: true,
	              onCheck: this.handleCheck, checkedKeys: this.state.checkedKeys,
	              onSelect: this.handleSelect, selectedKeys: this.state.selectedKeys, multiple: true },
	            loop(data)
	          )
	        ),
	        _react2['default'].createElement(
	          'button',
	          { onClick: this.handleClick },
	          'check again'
	        )
	      );
	    }
	  }]);
	
	  return TreeDemo;
	})(_react2['default'].Component);
	
	_reactDom2['default'].render(_react2['default'].createElement(TreeDemo, null), document.getElementById('__react-content'));

/***/ }
]);
//# sourceMappingURL=checked.js.map