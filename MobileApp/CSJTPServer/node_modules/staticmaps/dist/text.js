"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var Text = function Text() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  (0, _classCallCheck2["default"])(this, Text);
  this.options = options;
  this.coord = this.options.coord;
  this.text = this.options.text;
  this.color = this.options.color || '#000000BB';
  this.width = "".concat(this.options.width, "px") || '1px';
  this.fill = this.options.fill || '#000000';
  this.size = this.options.size || 12;
  this.font = this.options.font || 'Arial';
  this.anchor = this.options.anchor || 'start';
};

exports["default"] = Text;