import{createRequire}from'module';const require=createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod2) => function __require() {
  try {
    return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
  } catch (e) {
    throw mod2 = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// node_modules/@protobuf-ts/runtime/build/commonjs/json-typings.js
var require_json_typings = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/json-typings.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isJsonObject = exports.typeofJsonValue = void 0;
    function typeofJsonValue6(value) {
      let t = typeof value;
      if (t == "object") {
        if (Array.isArray(value))
          return "array";
        if (value === null)
          return "null";
      }
      return t;
    }
    exports.typeofJsonValue = typeofJsonValue6;
    function isJsonObject3(value) {
      return value !== null && typeof value == "object" && !Array.isArray(value);
    }
    exports.isJsonObject = isJsonObject3;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/base64.js
var require_base64 = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/base64.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.base64encode = exports.base64decode = void 0;
    var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    var decTable = [];
    for (let i = 0; i < encTable.length; i++)
      decTable[encTable[i].charCodeAt(0)] = i;
    decTable["-".charCodeAt(0)] = encTable.indexOf("+");
    decTable["_".charCodeAt(0)] = encTable.indexOf("/");
    function base64decode(base64Str) {
      let es = base64Str.length * 3 / 4;
      if (base64Str[base64Str.length - 2] == "=")
        es -= 2;
      else if (base64Str[base64Str.length - 1] == "=")
        es -= 1;
      let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
      for (let i = 0; i < base64Str.length; i++) {
        b = decTable[base64Str.charCodeAt(i)];
        if (b === void 0) {
          switch (base64Str[i]) {
            case "=":
              groupPos = 0;
            // reset state when padding found
            case "\n":
            case "\r":
            case "	":
            case " ":
              continue;
            // skip white-space, and padding
            default:
              throw Error(`invalid base64 string.`);
          }
        }
        switch (groupPos) {
          case 0:
            p = b;
            groupPos = 1;
            break;
          case 1:
            bytes[bytePos++] = p << 2 | (b & 48) >> 4;
            p = b;
            groupPos = 2;
            break;
          case 2:
            bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
            p = b;
            groupPos = 3;
            break;
          case 3:
            bytes[bytePos++] = (p & 3) << 6 | b;
            groupPos = 0;
            break;
        }
      }
      if (groupPos == 1)
        throw Error(`invalid base64 string.`);
      return bytes.subarray(0, bytePos);
    }
    exports.base64decode = base64decode;
    function base64encode(bytes) {
      let base64 = "", groupPos = 0, b, p = 0;
      for (let i = 0; i < bytes.length; i++) {
        b = bytes[i];
        switch (groupPos) {
          case 0:
            base64 += encTable[b >> 2];
            p = (b & 3) << 4;
            groupPos = 1;
            break;
          case 1:
            base64 += encTable[p | b >> 4];
            p = (b & 15) << 2;
            groupPos = 2;
            break;
          case 2:
            base64 += encTable[p | b >> 6];
            base64 += encTable[b & 63];
            groupPos = 0;
            break;
        }
      }
      if (groupPos) {
        base64 += encTable[p];
        base64 += "=";
        if (groupPos == 1)
          base64 += "=";
      }
      return base64;
    }
    exports.base64encode = base64encode;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/protobufjs-utf8.js
var require_protobufjs_utf8 = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/protobufjs-utf8.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.utf8read = void 0;
    var fromCharCodes = (chunk2) => String.fromCharCode.apply(String, chunk2);
    function utf8read(bytes) {
      if (bytes.length < 1)
        return "";
      let pos = 0, parts = [], chunk2 = [], i = 0, t;
      let len = bytes.length;
      while (pos < len) {
        t = bytes[pos++];
        if (t < 128)
          chunk2[i++] = t;
        else if (t > 191 && t < 224)
          chunk2[i++] = (t & 31) << 6 | bytes[pos++] & 63;
        else if (t > 239 && t < 365) {
          t = ((t & 7) << 18 | (bytes[pos++] & 63) << 12 | (bytes[pos++] & 63) << 6 | bytes[pos++] & 63) - 65536;
          chunk2[i++] = 55296 + (t >> 10);
          chunk2[i++] = 56320 + (t & 1023);
        } else
          chunk2[i++] = (t & 15) << 12 | (bytes[pos++] & 63) << 6 | bytes[pos++] & 63;
        if (i > 8191) {
          parts.push(fromCharCodes(chunk2));
          i = 0;
        }
      }
      if (parts.length) {
        if (i)
          parts.push(fromCharCodes(chunk2.slice(0, i)));
        return parts.join("");
      }
      return fromCharCodes(chunk2.slice(0, i));
    }
    exports.utf8read = utf8read;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/binary-format-contract.js
var require_binary_format_contract = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/binary-format-contract.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WireType = exports.mergeBinaryOptions = exports.UnknownFieldHandler = void 0;
    var UnknownFieldHandler;
    (function(UnknownFieldHandler2) {
      UnknownFieldHandler2.symbol = /* @__PURE__ */ Symbol.for("protobuf-ts/unknown");
      UnknownFieldHandler2.onRead = (typeName, message, fieldNo, wireType, data) => {
        let container = is2(message) ? message[UnknownFieldHandler2.symbol] : message[UnknownFieldHandler2.symbol] = [];
        container.push({ no: fieldNo, wireType, data });
      };
      UnknownFieldHandler2.onWrite = (typeName, message, writer) => {
        for (let { no, wireType, data } of UnknownFieldHandler2.list(message))
          writer.tag(no, wireType).raw(data);
      };
      UnknownFieldHandler2.list = (message, fieldNo) => {
        if (is2(message)) {
          let all = message[UnknownFieldHandler2.symbol];
          return fieldNo ? all.filter((uf) => uf.no == fieldNo) : all;
        }
        return [];
      };
      UnknownFieldHandler2.last = (message, fieldNo) => UnknownFieldHandler2.list(message, fieldNo).slice(-1)[0];
      const is2 = (message) => message && Array.isArray(message[UnknownFieldHandler2.symbol]);
    })(UnknownFieldHandler = exports.UnknownFieldHandler || (exports.UnknownFieldHandler = {}));
    function mergeBinaryOptions(a, b) {
      return Object.assign(Object.assign({}, a), b);
    }
    exports.mergeBinaryOptions = mergeBinaryOptions;
    var WireType;
    (function(WireType2) {
      WireType2[WireType2["Varint"] = 0] = "Varint";
      WireType2[WireType2["Bit64"] = 1] = "Bit64";
      WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
      WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
      WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
      WireType2[WireType2["Bit32"] = 5] = "Bit32";
    })(WireType = exports.WireType || (exports.WireType = {}));
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/goog-varint.js
var require_goog_varint = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/goog-varint.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.varint32read = exports.varint32write = exports.int64toString = exports.int64fromString = exports.varint64write = exports.varint64read = void 0;
    function varint64read() {
      let lowBits = 0;
      let highBits = 0;
      for (let shift = 0; shift < 28; shift += 7) {
        let b = this.buf[this.pos++];
        lowBits |= (b & 127) << shift;
        if ((b & 128) == 0) {
          this.assertBounds();
          return [lowBits, highBits];
        }
      }
      let middleByte = this.buf[this.pos++];
      lowBits |= (middleByte & 15) << 28;
      highBits = (middleByte & 112) >> 4;
      if ((middleByte & 128) == 0) {
        this.assertBounds();
        return [lowBits, highBits];
      }
      for (let shift = 3; shift <= 31; shift += 7) {
        let b = this.buf[this.pos++];
        highBits |= (b & 127) << shift;
        if ((b & 128) == 0) {
          this.assertBounds();
          return [lowBits, highBits];
        }
      }
      throw new Error("invalid varint");
    }
    exports.varint64read = varint64read;
    function varint64write(lo, hi, bytes) {
      for (let i = 0; i < 28; i = i + 7) {
        const shift = lo >>> i;
        const hasNext = !(shift >>> 7 == 0 && hi == 0);
        const byte = (hasNext ? shift | 128 : shift) & 255;
        bytes.push(byte);
        if (!hasNext) {
          return;
        }
      }
      const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
      const hasMoreBits = !(hi >> 3 == 0);
      bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
      if (!hasMoreBits) {
        return;
      }
      for (let i = 3; i < 31; i = i + 7) {
        const shift = hi >>> i;
        const hasNext = !(shift >>> 7 == 0);
        const byte = (hasNext ? shift | 128 : shift) & 255;
        bytes.push(byte);
        if (!hasNext) {
          return;
        }
      }
      bytes.push(hi >>> 31 & 1);
    }
    exports.varint64write = varint64write;
    var TWO_PWR_32_DBL = (1 << 16) * (1 << 16);
    function int64fromString(dec) {
      let minus = dec[0] == "-";
      if (minus)
        dec = dec.slice(1);
      const base = 1e6;
      let lowBits = 0;
      let highBits = 0;
      function add1e6digit(begin, end) {
        const digit1e6 = Number(dec.slice(begin, end));
        highBits *= base;
        lowBits = lowBits * base + digit1e6;
        if (lowBits >= TWO_PWR_32_DBL) {
          highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
          lowBits = lowBits % TWO_PWR_32_DBL;
        }
      }
      add1e6digit(-24, -18);
      add1e6digit(-18, -12);
      add1e6digit(-12, -6);
      add1e6digit(-6);
      return [minus, lowBits, highBits];
    }
    exports.int64fromString = int64fromString;
    function int64toString(bitsLow, bitsHigh) {
      if (bitsHigh >>> 0 <= 2097151) {
        return "" + (TWO_PWR_32_DBL * bitsHigh + (bitsLow >>> 0));
      }
      let low = bitsLow & 16777215;
      let mid = (bitsLow >>> 24 | bitsHigh << 8) >>> 0 & 16777215;
      let high = bitsHigh >> 16 & 65535;
      let digitA = low + mid * 6777216 + high * 6710656;
      let digitB = mid + high * 8147497;
      let digitC = high * 2;
      let base = 1e7;
      if (digitA >= base) {
        digitB += Math.floor(digitA / base);
        digitA %= base;
      }
      if (digitB >= base) {
        digitC += Math.floor(digitB / base);
        digitB %= base;
      }
      function decimalFrom1e7(digit1e7, needLeadingZeros) {
        let partial = digit1e7 ? String(digit1e7) : "";
        if (needLeadingZeros) {
          return "0000000".slice(partial.length) + partial;
        }
        return partial;
      }
      return decimalFrom1e7(
        digitC,
        /*needLeadingZeros=*/
        0
      ) + decimalFrom1e7(
        digitB,
        /*needLeadingZeros=*/
        digitC
      ) + // If the final 1e7 digit didn't need leading zeros, we would have
      // returned via the trivial code path at the top.
      decimalFrom1e7(
        digitA,
        /*needLeadingZeros=*/
        1
      );
    }
    exports.int64toString = int64toString;
    function varint32write(value, bytes) {
      if (value >= 0) {
        while (value > 127) {
          bytes.push(value & 127 | 128);
          value = value >>> 7;
        }
        bytes.push(value);
      } else {
        for (let i = 0; i < 9; i++) {
          bytes.push(value & 127 | 128);
          value = value >> 7;
        }
        bytes.push(1);
      }
    }
    exports.varint32write = varint32write;
    function varint32read() {
      let b = this.buf[this.pos++];
      let result = b & 127;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 7;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 14;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 21;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 15) << 28;
      for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
        b = this.buf[this.pos++];
      if ((b & 128) != 0)
        throw new Error("invalid varint");
      this.assertBounds();
      return result >>> 0;
    }
    exports.varint32read = varint32read;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/pb-long.js
var require_pb_long = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/pb-long.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PbLong = exports.PbULong = exports.detectBi = void 0;
    var goog_varint_1 = require_goog_varint();
    var BI;
    function detectBi() {
      const dv = new DataView(new ArrayBuffer(8));
      const ok = globalThis.BigInt !== void 0 && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function";
      BI = ok ? {
        MIN: BigInt("-9223372036854775808"),
        MAX: BigInt("9223372036854775807"),
        UMIN: BigInt("0"),
        UMAX: BigInt("18446744073709551615"),
        C: BigInt,
        V: dv
      } : void 0;
    }
    exports.detectBi = detectBi;
    detectBi();
    function assertBi(bi) {
      if (!bi)
        throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
    }
    var RE_DECIMAL_STR = /^-?[0-9]+$/;
    var TWO_PWR_32_DBL = 4294967296;
    var HALF_2_PWR_32 = 2147483648;
    var SharedPbLong = class {
      /**
       * Create a new instance with the given bits.
       */
      constructor(lo, hi) {
        this.lo = lo | 0;
        this.hi = hi | 0;
      }
      /**
       * Is this instance equal to 0?
       */
      isZero() {
        return this.lo == 0 && this.hi == 0;
      }
      /**
       * Convert to a native number.
       */
      toNumber() {
        let result = this.hi * TWO_PWR_32_DBL + (this.lo >>> 0);
        if (!Number.isSafeInteger(result))
          throw new Error("cannot convert to safe number");
        return result;
      }
    };
    var PbULong = class _PbULong extends SharedPbLong {
      /**
       * Create instance from a `string`, `number` or `bigint`.
       */
      static from(value) {
        if (BI)
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              if (value == "")
                throw new Error("string is no integer");
              value = BI.C(value);
            case "number":
              if (value === 0)
                return this.ZERO;
              value = BI.C(value);
            case "bigint":
              if (!value)
                return this.ZERO;
              if (value < BI.UMIN)
                throw new Error("signed value for ulong");
              if (value > BI.UMAX)
                throw new Error("ulong too large");
              BI.V.setBigUint64(0, value, true);
              return new _PbULong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
          }
        else
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              value = value.trim();
              if (!RE_DECIMAL_STR.test(value))
                throw new Error("string is no integer");
              let [minus, lo, hi] = goog_varint_1.int64fromString(value);
              if (minus)
                throw new Error("signed value for ulong");
              return new _PbULong(lo, hi);
            case "number":
              if (value == 0)
                return this.ZERO;
              if (!Number.isSafeInteger(value))
                throw new Error("number is no integer");
              if (value < 0)
                throw new Error("signed value for ulong");
              return new _PbULong(value, value / TWO_PWR_32_DBL);
          }
        throw new Error("unknown value " + typeof value);
      }
      /**
       * Convert to decimal string.
       */
      toString() {
        return BI ? this.toBigInt().toString() : goog_varint_1.int64toString(this.lo, this.hi);
      }
      /**
       * Convert to native bigint.
       */
      toBigInt() {
        assertBi(BI);
        BI.V.setInt32(0, this.lo, true);
        BI.V.setInt32(4, this.hi, true);
        return BI.V.getBigUint64(0, true);
      }
    };
    exports.PbULong = PbULong;
    PbULong.ZERO = new PbULong(0, 0);
    var PbLong3 = class _PbLong extends SharedPbLong {
      /**
       * Create instance from a `string`, `number` or `bigint`.
       */
      static from(value) {
        if (BI)
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              if (value == "")
                throw new Error("string is no integer");
              value = BI.C(value);
            case "number":
              if (value === 0)
                return this.ZERO;
              value = BI.C(value);
            case "bigint":
              if (!value)
                return this.ZERO;
              if (value < BI.MIN)
                throw new Error("signed long too small");
              if (value > BI.MAX)
                throw new Error("signed long too large");
              BI.V.setBigInt64(0, value, true);
              return new _PbLong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
          }
        else
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              value = value.trim();
              if (!RE_DECIMAL_STR.test(value))
                throw new Error("string is no integer");
              let [minus, lo, hi] = goog_varint_1.int64fromString(value);
              if (minus) {
                if (hi > HALF_2_PWR_32 || hi == HALF_2_PWR_32 && lo != 0)
                  throw new Error("signed long too small");
              } else if (hi >= HALF_2_PWR_32)
                throw new Error("signed long too large");
              let pbl = new _PbLong(lo, hi);
              return minus ? pbl.negate() : pbl;
            case "number":
              if (value == 0)
                return this.ZERO;
              if (!Number.isSafeInteger(value))
                throw new Error("number is no integer");
              return value > 0 ? new _PbLong(value, value / TWO_PWR_32_DBL) : new _PbLong(-value, -value / TWO_PWR_32_DBL).negate();
          }
        throw new Error("unknown value " + typeof value);
      }
      /**
       * Do we have a minus sign?
       */
      isNegative() {
        return (this.hi & HALF_2_PWR_32) !== 0;
      }
      /**
       * Negate two's complement.
       * Invert all the bits and add one to the result.
       */
      negate() {
        let hi = ~this.hi, lo = this.lo;
        if (lo)
          lo = ~lo + 1;
        else
          hi += 1;
        return new _PbLong(lo, hi);
      }
      /**
       * Convert to decimal string.
       */
      toString() {
        if (BI)
          return this.toBigInt().toString();
        if (this.isNegative()) {
          let n = this.negate();
          return "-" + goog_varint_1.int64toString(n.lo, n.hi);
        }
        return goog_varint_1.int64toString(this.lo, this.hi);
      }
      /**
       * Convert to native bigint.
       */
      toBigInt() {
        assertBi(BI);
        BI.V.setInt32(0, this.lo, true);
        BI.V.setInt32(4, this.hi, true);
        return BI.V.getBigInt64(0, true);
      }
    };
    exports.PbLong = PbLong3;
    PbLong3.ZERO = new PbLong3(0, 0);
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/binary-reader.js
var require_binary_reader = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/binary-reader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BinaryReader = exports.binaryReadOptions = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var pb_long_1 = require_pb_long();
    var goog_varint_1 = require_goog_varint();
    var defaultsRead = {
      readUnknownField: true,
      readerFactory: (bytes) => new BinaryReader(bytes)
    };
    function binaryReadOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
    }
    exports.binaryReadOptions = binaryReadOptions;
    var BinaryReader = class {
      constructor(buf, textDecoder) {
        this.varint64 = goog_varint_1.varint64read;
        this.uint32 = goog_varint_1.varint32read;
        this.buf = buf;
        this.len = buf.length;
        this.pos = 0;
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder("utf-8", {
          fatal: true,
          ignoreBOM: true
        });
      }
      /**
       * Reads a tag - field number and wire type.
       */
      tag() {
        let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
        if (fieldNo <= 0 || wireType < 0 || wireType > 5)
          throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
        return [fieldNo, wireType];
      }
      /**
       * Skip one element on the wire and return the skipped data.
       * Supports WireType.StartGroup since v2.0.0-alpha.23.
       */
      skip(wireType) {
        let start = this.pos;
        switch (wireType) {
          case binary_format_contract_1.WireType.Varint:
            while (this.buf[this.pos++] & 128) {
            }
            break;
          case binary_format_contract_1.WireType.Bit64:
            this.pos += 4;
          case binary_format_contract_1.WireType.Bit32:
            this.pos += 4;
            break;
          case binary_format_contract_1.WireType.LengthDelimited:
            let len = this.uint32();
            this.pos += len;
            break;
          case binary_format_contract_1.WireType.StartGroup:
            let t;
            while ((t = this.tag()[1]) !== binary_format_contract_1.WireType.EndGroup) {
              this.skip(t);
            }
            break;
          default:
            throw new Error("cant skip wire type " + wireType);
        }
        this.assertBounds();
        return this.buf.subarray(start, this.pos);
      }
      /**
       * Throws error if position in byte array is out of range.
       */
      assertBounds() {
        if (this.pos > this.len)
          throw new RangeError("premature EOF");
      }
      /**
       * Read a `int32` field, a signed 32 bit varint.
       */
      int32() {
        return this.uint32() | 0;
      }
      /**
       * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
       */
      sint32() {
        let zze = this.uint32();
        return zze >>> 1 ^ -(zze & 1);
      }
      /**
       * Read a `int64` field, a signed 64-bit varint.
       */
      int64() {
        return new pb_long_1.PbLong(...this.varint64());
      }
      /**
       * Read a `uint64` field, an unsigned 64-bit varint.
       */
      uint64() {
        return new pb_long_1.PbULong(...this.varint64());
      }
      /**
       * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
       */
      sint64() {
        let [lo, hi] = this.varint64();
        let s = -(lo & 1);
        lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
        hi = hi >>> 1 ^ s;
        return new pb_long_1.PbLong(lo, hi);
      }
      /**
       * Read a `bool` field, a variant.
       */
      bool() {
        let [lo, hi] = this.varint64();
        return lo !== 0 || hi !== 0;
      }
      /**
       * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
       */
      fixed32() {
        return this.view.getUint32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
       */
      sfixed32() {
        return this.view.getInt32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
       */
      fixed64() {
        return new pb_long_1.PbULong(this.sfixed32(), this.sfixed32());
      }
      /**
       * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
       */
      sfixed64() {
        return new pb_long_1.PbLong(this.sfixed32(), this.sfixed32());
      }
      /**
       * Read a `float` field, 32-bit floating point number.
       */
      float() {
        return this.view.getFloat32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `double` field, a 64-bit floating point number.
       */
      double() {
        return this.view.getFloat64((this.pos += 8) - 8, true);
      }
      /**
       * Read a `bytes` field, length-delimited arbitrary data.
       */
      bytes() {
        let len = this.uint32();
        let start = this.pos;
        this.pos += len;
        this.assertBounds();
        return this.buf.subarray(start, start + len);
      }
      /**
       * Read a `string` field, length-delimited data converted to UTF-8 text.
       */
      string() {
        return this.textDecoder.decode(this.bytes());
      }
    };
    exports.BinaryReader = BinaryReader;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/assert.js
var require_assert = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/assert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertFloat32 = exports.assertUInt32 = exports.assertInt32 = exports.assertNever = exports.assert = void 0;
    function assert(condition, msg) {
      if (!condition) {
        throw new Error(msg);
      }
    }
    exports.assert = assert;
    function assertNever(value, msg) {
      throw new Error(msg !== null && msg !== void 0 ? msg : "Unexpected object: " + value);
    }
    exports.assertNever = assertNever;
    var FLOAT32_MAX = 34028234663852886e22;
    var FLOAT32_MIN = -34028234663852886e22;
    var UINT32_MAX = 4294967295;
    var INT32_MAX = 2147483647;
    var INT32_MIN = -2147483648;
    function assertInt32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid int 32: " + typeof arg);
      if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
        throw new Error("invalid int 32: " + arg);
    }
    exports.assertInt32 = assertInt32;
    function assertUInt32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid uint 32: " + typeof arg);
      if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
        throw new Error("invalid uint 32: " + arg);
    }
    exports.assertUInt32 = assertUInt32;
    function assertFloat32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid float 32: " + typeof arg);
      if (!Number.isFinite(arg))
        return;
      if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
        throw new Error("invalid float 32: " + arg);
    }
    exports.assertFloat32 = assertFloat32;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/binary-writer.js
var require_binary_writer = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/binary-writer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BinaryWriter = exports.binaryWriteOptions = void 0;
    var pb_long_1 = require_pb_long();
    var goog_varint_1 = require_goog_varint();
    var assert_1 = require_assert();
    var defaultsWrite = {
      writeUnknownFields: true,
      writerFactory: () => new BinaryWriter()
    };
    function binaryWriteOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
    }
    exports.binaryWriteOptions = binaryWriteOptions;
    var BinaryWriter = class {
      constructor(textEncoder) {
        this.stack = [];
        this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
        this.chunks = [];
        this.buf = [];
      }
      /**
       * Return all bytes written and reset this writer.
       */
      finish() {
        this.chunks.push(new Uint8Array(this.buf));
        let len = 0;
        for (let i = 0; i < this.chunks.length; i++)
          len += this.chunks[i].length;
        let bytes = new Uint8Array(len);
        let offset = 0;
        for (let i = 0; i < this.chunks.length; i++) {
          bytes.set(this.chunks[i], offset);
          offset += this.chunks[i].length;
        }
        this.chunks = [];
        return bytes;
      }
      /**
       * Start a new fork for length-delimited data like a message
       * or a packed repeated field.
       *
       * Must be joined later with `join()`.
       */
      fork() {
        this.stack.push({ chunks: this.chunks, buf: this.buf });
        this.chunks = [];
        this.buf = [];
        return this;
      }
      /**
       * Join the last fork. Write its length and bytes, then
       * return to the previous state.
       */
      join() {
        let chunk2 = this.finish();
        let prev = this.stack.pop();
        if (!prev)
          throw new Error("invalid state, fork stack empty");
        this.chunks = prev.chunks;
        this.buf = prev.buf;
        this.uint32(chunk2.byteLength);
        return this.raw(chunk2);
      }
      /**
       * Writes a tag (field number and wire type).
       *
       * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
       *
       * Generated code should compute the tag ahead of time and call `uint32()`.
       */
      tag(fieldNo, type) {
        return this.uint32((fieldNo << 3 | type) >>> 0);
      }
      /**
       * Write a chunk of raw bytes.
       */
      raw(chunk2) {
        if (this.buf.length) {
          this.chunks.push(new Uint8Array(this.buf));
          this.buf = [];
        }
        this.chunks.push(chunk2);
        return this;
      }
      /**
       * Write a `uint32` value, an unsigned 32 bit varint.
       */
      uint32(value) {
        assert_1.assertUInt32(value);
        while (value > 127) {
          this.buf.push(value & 127 | 128);
          value = value >>> 7;
        }
        this.buf.push(value);
        return this;
      }
      /**
       * Write a `int32` value, a signed 32 bit varint.
       */
      int32(value) {
        assert_1.assertInt32(value);
        goog_varint_1.varint32write(value, this.buf);
        return this;
      }
      /**
       * Write a `bool` value, a variant.
       */
      bool(value) {
        this.buf.push(value ? 1 : 0);
        return this;
      }
      /**
       * Write a `bytes` value, length-delimited arbitrary data.
       */
      bytes(value) {
        this.uint32(value.byteLength);
        return this.raw(value);
      }
      /**
       * Write a `string` value, length-delimited data converted to UTF-8 text.
       */
      string(value) {
        let chunk2 = this.textEncoder.encode(value);
        this.uint32(chunk2.byteLength);
        return this.raw(chunk2);
      }
      /**
       * Write a `float` value, 32-bit floating point number.
       */
      float(value) {
        assert_1.assertFloat32(value);
        let chunk2 = new Uint8Array(4);
        new DataView(chunk2.buffer).setFloat32(0, value, true);
        return this.raw(chunk2);
      }
      /**
       * Write a `double` value, a 64-bit floating point number.
       */
      double(value) {
        let chunk2 = new Uint8Array(8);
        new DataView(chunk2.buffer).setFloat64(0, value, true);
        return this.raw(chunk2);
      }
      /**
       * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
       */
      fixed32(value) {
        assert_1.assertUInt32(value);
        let chunk2 = new Uint8Array(4);
        new DataView(chunk2.buffer).setUint32(0, value, true);
        return this.raw(chunk2);
      }
      /**
       * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
       */
      sfixed32(value) {
        assert_1.assertInt32(value);
        let chunk2 = new Uint8Array(4);
        new DataView(chunk2.buffer).setInt32(0, value, true);
        return this.raw(chunk2);
      }
      /**
       * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
       */
      sint32(value) {
        assert_1.assertInt32(value);
        value = (value << 1 ^ value >> 31) >>> 0;
        goog_varint_1.varint32write(value, this.buf);
        return this;
      }
      /**
       * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
       */
      sfixed64(value) {
        let chunk2 = new Uint8Array(8);
        let view = new DataView(chunk2.buffer);
        let long = pb_long_1.PbLong.from(value);
        view.setInt32(0, long.lo, true);
        view.setInt32(4, long.hi, true);
        return this.raw(chunk2);
      }
      /**
       * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
       */
      fixed64(value) {
        let chunk2 = new Uint8Array(8);
        let view = new DataView(chunk2.buffer);
        let long = pb_long_1.PbULong.from(value);
        view.setInt32(0, long.lo, true);
        view.setInt32(4, long.hi, true);
        return this.raw(chunk2);
      }
      /**
       * Write a `int64` value, a signed 64-bit varint.
       */
      int64(value) {
        let long = pb_long_1.PbLong.from(value);
        goog_varint_1.varint64write(long.lo, long.hi, this.buf);
        return this;
      }
      /**
       * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
       */
      sint64(value) {
        let long = pb_long_1.PbLong.from(value), sign = long.hi >> 31, lo = long.lo << 1 ^ sign, hi = (long.hi << 1 | long.lo >>> 31) ^ sign;
        goog_varint_1.varint64write(lo, hi, this.buf);
        return this;
      }
      /**
       * Write a `uint64` value, an unsigned 64-bit varint.
       */
      uint64(value) {
        let long = pb_long_1.PbULong.from(value);
        goog_varint_1.varint64write(long.lo, long.hi, this.buf);
        return this;
      }
    };
    exports.BinaryWriter = BinaryWriter;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/json-format-contract.js
var require_json_format_contract = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/json-format-contract.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeJsonOptions = exports.jsonWriteOptions = exports.jsonReadOptions = void 0;
    var defaultsWrite = {
      emitDefaultValues: false,
      enumAsInteger: false,
      useProtoFieldName: false,
      prettySpaces: 0
    };
    var defaultsRead = {
      ignoreUnknownFields: false
    };
    function jsonReadOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
    }
    exports.jsonReadOptions = jsonReadOptions;
    function jsonWriteOptions2(options) {
      return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
    }
    exports.jsonWriteOptions = jsonWriteOptions2;
    function mergeJsonOptions(a, b) {
      var _a, _b;
      let c = Object.assign(Object.assign({}, a), b);
      c.typeRegistry = [...(_a = a === null || a === void 0 ? void 0 : a.typeRegistry) !== null && _a !== void 0 ? _a : [], ...(_b = b === null || b === void 0 ? void 0 : b.typeRegistry) !== null && _b !== void 0 ? _b : []];
      return c;
    }
    exports.mergeJsonOptions = mergeJsonOptions;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/message-type-contract.js
var require_message_type_contract = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/message-type-contract.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MESSAGE_TYPE = void 0;
    exports.MESSAGE_TYPE = /* @__PURE__ */ Symbol.for("protobuf-ts/message-type");
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/lower-camel-case.js
var require_lower_camel_case = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/lower-camel-case.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lowerCamelCase = void 0;
    function lowerCamelCase2(snakeCase) {
      let capNext = false;
      const sb = [];
      for (let i = 0; i < snakeCase.length; i++) {
        let next = snakeCase.charAt(i);
        if (next == "_") {
          capNext = true;
        } else if (/\d/.test(next)) {
          sb.push(next);
          capNext = true;
        } else if (capNext) {
          sb.push(next.toUpperCase());
          capNext = false;
        } else if (i == 0) {
          sb.push(next.toLowerCase());
        } else {
          sb.push(next);
        }
      }
      return sb.join("");
    }
    exports.lowerCamelCase = lowerCamelCase2;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-info.js
var require_reflection_info = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-info.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readMessageOption = exports.readFieldOption = exports.readFieldOptions = exports.normalizeFieldInfo = exports.RepeatType = exports.LongType = exports.ScalarType = void 0;
    var lower_camel_case_1 = require_lower_camel_case();
    var ScalarType;
    (function(ScalarType2) {
      ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
      ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
      ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
      ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
      ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
      ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
      ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
      ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
      ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
      ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
      ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
      ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
      ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
      ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
      ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
    })(ScalarType = exports.ScalarType || (exports.ScalarType = {}));
    var LongType;
    (function(LongType2) {
      LongType2[LongType2["BIGINT"] = 0] = "BIGINT";
      LongType2[LongType2["STRING"] = 1] = "STRING";
      LongType2[LongType2["NUMBER"] = 2] = "NUMBER";
    })(LongType = exports.LongType || (exports.LongType = {}));
    var RepeatType;
    (function(RepeatType2) {
      RepeatType2[RepeatType2["NO"] = 0] = "NO";
      RepeatType2[RepeatType2["PACKED"] = 1] = "PACKED";
      RepeatType2[RepeatType2["UNPACKED"] = 2] = "UNPACKED";
    })(RepeatType = exports.RepeatType || (exports.RepeatType = {}));
    function normalizeFieldInfo(field) {
      var _a, _b, _c, _d;
      field.localName = (_a = field.localName) !== null && _a !== void 0 ? _a : lower_camel_case_1.lowerCamelCase(field.name);
      field.jsonName = (_b = field.jsonName) !== null && _b !== void 0 ? _b : lower_camel_case_1.lowerCamelCase(field.name);
      field.repeat = (_c = field.repeat) !== null && _c !== void 0 ? _c : RepeatType.NO;
      field.opt = (_d = field.opt) !== null && _d !== void 0 ? _d : field.repeat ? false : field.oneof ? false : field.kind == "message";
      return field;
    }
    exports.normalizeFieldInfo = normalizeFieldInfo;
    function readFieldOptions(messageType, fieldName, extensionName, extensionType) {
      var _a;
      const options = (_a = messageType.fields.find((m, i) => m.localName == fieldName || i == fieldName)) === null || _a === void 0 ? void 0 : _a.options;
      return options && options[extensionName] ? extensionType.fromJson(options[extensionName]) : void 0;
    }
    exports.readFieldOptions = readFieldOptions;
    function readFieldOption(messageType, fieldName, extensionName, extensionType) {
      var _a;
      const options = (_a = messageType.fields.find((m, i) => m.localName == fieldName || i == fieldName)) === null || _a === void 0 ? void 0 : _a.options;
      if (!options) {
        return void 0;
      }
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports.readFieldOption = readFieldOption;
    function readMessageOption(messageType, extensionName, extensionType) {
      const options = messageType.options;
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports.readMessageOption = readMessageOption;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/oneof.js
var require_oneof = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/oneof.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSelectedOneofValue = exports.clearOneofValue = exports.setUnknownOneofValue = exports.setOneofValue = exports.getOneofValue = exports.isOneofGroup = void 0;
    function isOneofGroup(any) {
      if (typeof any != "object" || any === null || !any.hasOwnProperty("oneofKind")) {
        return false;
      }
      switch (typeof any.oneofKind) {
        case "string":
          if (any[any.oneofKind] === void 0)
            return false;
          return Object.keys(any).length == 2;
        case "undefined":
          return Object.keys(any).length == 1;
        default:
          return false;
      }
    }
    exports.isOneofGroup = isOneofGroup;
    function getOneofValue(oneof, kind) {
      return oneof[kind];
    }
    exports.getOneofValue = getOneofValue;
    function setOneofValue(oneof, kind, value) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = kind;
      if (value !== void 0) {
        oneof[kind] = value;
      }
    }
    exports.setOneofValue = setOneofValue;
    function setUnknownOneofValue(oneof, kind, value) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = kind;
      if (value !== void 0 && kind !== void 0) {
        oneof[kind] = value;
      }
    }
    exports.setUnknownOneofValue = setUnknownOneofValue;
    function clearOneofValue(oneof) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = void 0;
    }
    exports.clearOneofValue = clearOneofValue;
    function getSelectedOneofValue(oneof) {
      if (oneof.oneofKind === void 0) {
        return void 0;
      }
      return oneof[oneof.oneofKind];
    }
    exports.getSelectedOneofValue = getSelectedOneofValue;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-type-check.js
var require_reflection_type_check = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-type-check.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionTypeCheck = void 0;
    var reflection_info_1 = require_reflection_info();
    var oneof_1 = require_oneof();
    var ReflectionTypeCheck = class {
      constructor(info) {
        var _a;
        this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
      }
      prepare() {
        if (this.data)
          return;
        const req = [], known = [], oneofs = [];
        for (let field of this.fields) {
          if (field.oneof) {
            if (!oneofs.includes(field.oneof)) {
              oneofs.push(field.oneof);
              req.push(field.oneof);
              known.push(field.oneof);
            }
          } else {
            known.push(field.localName);
            switch (field.kind) {
              case "scalar":
              case "enum":
                if (!field.opt || field.repeat)
                  req.push(field.localName);
                break;
              case "message":
                if (field.repeat)
                  req.push(field.localName);
                break;
              case "map":
                req.push(field.localName);
                break;
            }
          }
        }
        this.data = { req, known, oneofs: Object.values(oneofs) };
      }
      /**
       * Is the argument a valid message as specified by the
       * reflection information?
       *
       * Checks all field types recursively. The `depth`
       * specifies how deep into the structure the check will be.
       *
       * With a depth of 0, only the presence of fields
       * is checked.
       *
       * With a depth of 1 or more, the field types are checked.
       *
       * With a depth of 2 or more, the members of map, repeated
       * and message fields are checked.
       *
       * Message fields will be checked recursively with depth - 1.
       *
       * The number of map entries / repeated values being checked
       * is < depth.
       */
      is(message, depth, allowExcessProperties = false) {
        if (depth < 0)
          return true;
        if (message === null || message === void 0 || typeof message != "object")
          return false;
        this.prepare();
        let keys = Object.keys(message), data = this.data;
        if (keys.length < data.req.length || data.req.some((n) => !keys.includes(n)))
          return false;
        if (!allowExcessProperties) {
          if (keys.some((k) => !data.known.includes(k)))
            return false;
        }
        if (depth < 1) {
          return true;
        }
        for (const name of data.oneofs) {
          const group = message[name];
          if (!oneof_1.isOneofGroup(group))
            return false;
          if (group.oneofKind === void 0)
            continue;
          const field = this.fields.find((f) => f.localName === group.oneofKind);
          if (!field)
            return false;
          if (!this.field(group[group.oneofKind], field, allowExcessProperties, depth))
            return false;
        }
        for (const field of this.fields) {
          if (field.oneof !== void 0)
            continue;
          if (!this.field(message[field.localName], field, allowExcessProperties, depth))
            return false;
        }
        return true;
      }
      field(arg, field, allowExcessProperties, depth) {
        let repeated = field.repeat;
        switch (field.kind) {
          case "scalar":
            if (arg === void 0)
              return field.opt;
            if (repeated)
              return this.scalars(arg, field.T, depth, field.L);
            return this.scalar(arg, field.T, field.L);
          case "enum":
            if (arg === void 0)
              return field.opt;
            if (repeated)
              return this.scalars(arg, reflection_info_1.ScalarType.INT32, depth);
            return this.scalar(arg, reflection_info_1.ScalarType.INT32);
          case "message":
            if (arg === void 0)
              return true;
            if (repeated)
              return this.messages(arg, field.T(), allowExcessProperties, depth);
            return this.message(arg, field.T(), allowExcessProperties, depth);
          case "map":
            if (typeof arg != "object" || arg === null)
              return false;
            if (depth < 2)
              return true;
            if (!this.mapKeys(arg, field.K, depth))
              return false;
            switch (field.V.kind) {
              case "scalar":
                return this.scalars(Object.values(arg), field.V.T, depth, field.V.L);
              case "enum":
                return this.scalars(Object.values(arg), reflection_info_1.ScalarType.INT32, depth);
              case "message":
                return this.messages(Object.values(arg), field.V.T(), allowExcessProperties, depth);
            }
            break;
        }
        return true;
      }
      message(arg, type, allowExcessProperties, depth) {
        if (allowExcessProperties) {
          return type.isAssignable(arg, depth);
        }
        return type.is(arg, depth);
      }
      messages(arg, type, allowExcessProperties, depth) {
        if (!Array.isArray(arg))
          return false;
        if (depth < 2)
          return true;
        if (allowExcessProperties) {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!type.isAssignable(arg[i], depth - 1))
              return false;
        } else {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!type.is(arg[i], depth - 1))
              return false;
        }
        return true;
      }
      scalar(arg, type, longType) {
        let argType = typeof arg;
        switch (type) {
          case reflection_info_1.ScalarType.UINT64:
          case reflection_info_1.ScalarType.FIXED64:
          case reflection_info_1.ScalarType.INT64:
          case reflection_info_1.ScalarType.SFIXED64:
          case reflection_info_1.ScalarType.SINT64:
            switch (longType) {
              case reflection_info_1.LongType.BIGINT:
                return argType == "bigint";
              case reflection_info_1.LongType.NUMBER:
                return argType == "number" && !isNaN(arg);
              default:
                return argType == "string";
            }
          case reflection_info_1.ScalarType.BOOL:
            return argType == "boolean";
          case reflection_info_1.ScalarType.STRING:
            return argType == "string";
          case reflection_info_1.ScalarType.BYTES:
            return arg instanceof Uint8Array;
          case reflection_info_1.ScalarType.DOUBLE:
          case reflection_info_1.ScalarType.FLOAT:
            return argType == "number" && !isNaN(arg);
          default:
            return argType == "number" && Number.isInteger(arg);
        }
      }
      scalars(arg, type, depth, longType) {
        if (!Array.isArray(arg))
          return false;
        if (depth < 2)
          return true;
        if (Array.isArray(arg)) {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!this.scalar(arg[i], type, longType))
              return false;
        }
        return true;
      }
      mapKeys(map2, type, depth) {
        let keys = Object.keys(map2);
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
          case reflection_info_1.ScalarType.UINT32:
            return this.scalars(keys.slice(0, depth).map((k) => parseInt(k)), type, depth);
          case reflection_info_1.ScalarType.BOOL:
            return this.scalars(keys.slice(0, depth).map((k) => k == "true" ? true : k == "false" ? false : k), type, depth);
          default:
            return this.scalars(keys, type, depth, reflection_info_1.LongType.STRING);
        }
      }
    };
    exports.ReflectionTypeCheck = ReflectionTypeCheck;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-long-convert.js
var require_reflection_long_convert = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-long-convert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionLongConvert = void 0;
    var reflection_info_1 = require_reflection_info();
    function reflectionLongConvert(long, type) {
      switch (type) {
        case reflection_info_1.LongType.BIGINT:
          return long.toBigInt();
        case reflection_info_1.LongType.NUMBER:
          return long.toNumber();
        default:
          return long.toString();
      }
    }
    exports.reflectionLongConvert = reflectionLongConvert;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-reader.js
var require_reflection_json_reader = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-reader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionJsonReader = void 0;
    var json_typings_1 = require_json_typings();
    var base64_1 = require_base64();
    var reflection_info_1 = require_reflection_info();
    var pb_long_1 = require_pb_long();
    var assert_1 = require_assert();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var ReflectionJsonReader = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        var _a;
        if (this.fMap === void 0) {
          this.fMap = {};
          const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
          for (const field of fieldsInput) {
            this.fMap[field.name] = field;
            this.fMap[field.jsonName] = field;
            this.fMap[field.localName] = field;
          }
        }
      }
      // Cannot parse JSON <type of jsonValue> for <type name>#<fieldName>.
      assert(condition, fieldName, jsonValue) {
        if (!condition) {
          let what = json_typings_1.typeofJsonValue(jsonValue);
          if (what == "number" || what == "boolean")
            what = jsonValue.toString();
          throw new Error(`Cannot parse JSON ${what} for ${this.info.typeName}#${fieldName}`);
        }
      }
      /**
       * Reads a message from canonical JSON format into the target message.
       *
       * Repeated fields are appended. Map entries are added, overwriting
       * existing keys.
       *
       * If a message field is already present, it will be merged with the
       * new data.
       */
      read(input, message, options) {
        this.prepare();
        const oneofsHandled = [];
        for (const [jsonKey, jsonValue] of Object.entries(input)) {
          const field = this.fMap[jsonKey];
          if (!field) {
            if (!options.ignoreUnknownFields)
              throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${jsonKey}`);
            continue;
          }
          const localName = field.localName;
          let target;
          if (field.oneof) {
            if (jsonValue === null && (field.kind !== "enum" || field.T()[0] !== "google.protobuf.NullValue")) {
              continue;
            }
            if (oneofsHandled.includes(field.oneof))
              throw new Error(`Multiple members of the oneof group "${field.oneof}" of ${this.info.typeName} are present in JSON.`);
            oneofsHandled.push(field.oneof);
            target = message[field.oneof] = {
              oneofKind: localName
            };
          } else {
            target = message;
          }
          if (field.kind == "map") {
            if (jsonValue === null) {
              continue;
            }
            this.assert(json_typings_1.isJsonObject(jsonValue), field.name, jsonValue);
            const fieldObj = target[localName];
            for (const [jsonObjKey, jsonObjValue] of Object.entries(jsonValue)) {
              this.assert(jsonObjValue !== null, field.name + " map value", null);
              let val;
              switch (field.V.kind) {
                case "message":
                  val = field.V.T().internalJsonRead(jsonObjValue, options);
                  break;
                case "enum":
                  val = this.enum(field.V.T(), jsonObjValue, field.name, options.ignoreUnknownFields);
                  if (val === false)
                    continue;
                  break;
                case "scalar":
                  val = this.scalar(jsonObjValue, field.V.T, field.V.L, field.name);
                  break;
              }
              this.assert(val !== void 0, field.name + " map value", jsonObjValue);
              let key = jsonObjKey;
              if (field.K == reflection_info_1.ScalarType.BOOL)
                key = key == "true" ? true : key == "false" ? false : key;
              key = this.scalar(key, field.K, reflection_info_1.LongType.STRING, field.name).toString();
              fieldObj[key] = val;
            }
          } else if (field.repeat) {
            if (jsonValue === null)
              continue;
            this.assert(Array.isArray(jsonValue), field.name, jsonValue);
            const fieldArr = target[localName];
            for (const jsonItem of jsonValue) {
              this.assert(jsonItem !== null, field.name, null);
              let val;
              switch (field.kind) {
                case "message":
                  val = field.T().internalJsonRead(jsonItem, options);
                  break;
                case "enum":
                  val = this.enum(field.T(), jsonItem, field.name, options.ignoreUnknownFields);
                  if (val === false)
                    continue;
                  break;
                case "scalar":
                  val = this.scalar(jsonItem, field.T, field.L, field.name);
                  break;
              }
              this.assert(val !== void 0, field.name, jsonValue);
              fieldArr.push(val);
            }
          } else {
            switch (field.kind) {
              case "message":
                if (jsonValue === null && field.T().typeName != "google.protobuf.Value") {
                  this.assert(field.oneof === void 0, field.name + " (oneof member)", null);
                  continue;
                }
                target[localName] = field.T().internalJsonRead(jsonValue, options, target[localName]);
                break;
              case "enum":
                if (jsonValue === null)
                  continue;
                let val = this.enum(field.T(), jsonValue, field.name, options.ignoreUnknownFields);
                if (val === false)
                  continue;
                target[localName] = val;
                break;
              case "scalar":
                if (jsonValue === null)
                  continue;
                target[localName] = this.scalar(jsonValue, field.T, field.L, field.name);
                break;
            }
          }
        }
      }
      /**
       * Returns `false` for unrecognized string representations.
       *
       * google.protobuf.NullValue accepts only JSON `null` (or the old `"NULL_VALUE"`).
       */
      enum(type, json, fieldName, ignoreUnknownFields) {
        if (type[0] == "google.protobuf.NullValue")
          assert_1.assert(json === null || json === "NULL_VALUE", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} only accepts null.`);
        if (json === null)
          return 0;
        switch (typeof json) {
          case "number":
            assert_1.assert(Number.isInteger(json), `Unable to parse field ${this.info.typeName}#${fieldName}, enum can only be integral number, got ${json}.`);
            return json;
          case "string":
            let localEnumName = json;
            if (type[2] && json.substring(0, type[2].length) === type[2])
              localEnumName = json.substring(type[2].length);
            let enumNumber = type[1][localEnumName];
            if (typeof enumNumber === "undefined" && ignoreUnknownFields) {
              return false;
            }
            assert_1.assert(typeof enumNumber == "number", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} has no value for "${json}".`);
            return enumNumber;
        }
        assert_1.assert(false, `Unable to parse field ${this.info.typeName}#${fieldName}, cannot parse enum value from ${typeof json}".`);
      }
      scalar(json, type, longType, fieldName) {
        let e;
        try {
          switch (type) {
            // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
            // Either numbers or strings are accepted. Exponent notation is also accepted.
            case reflection_info_1.ScalarType.DOUBLE:
            case reflection_info_1.ScalarType.FLOAT:
              if (json === null)
                return 0;
              if (json === "NaN")
                return Number.NaN;
              if (json === "Infinity")
                return Number.POSITIVE_INFINITY;
              if (json === "-Infinity")
                return Number.NEGATIVE_INFINITY;
              if (json === "") {
                e = "empty string";
                break;
              }
              if (typeof json == "string" && json.trim().length !== json.length) {
                e = "extra whitespace";
                break;
              }
              if (typeof json != "string" && typeof json != "number") {
                break;
              }
              let float = Number(json);
              if (Number.isNaN(float)) {
                e = "not a number";
                break;
              }
              if (!Number.isFinite(float)) {
                e = "too large or small";
                break;
              }
              if (type == reflection_info_1.ScalarType.FLOAT)
                assert_1.assertFloat32(float);
              return float;
            // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
            case reflection_info_1.ScalarType.INT32:
            case reflection_info_1.ScalarType.FIXED32:
            case reflection_info_1.ScalarType.SFIXED32:
            case reflection_info_1.ScalarType.SINT32:
            case reflection_info_1.ScalarType.UINT32:
              if (json === null)
                return 0;
              let int32;
              if (typeof json == "number")
                int32 = json;
              else if (json === "")
                e = "empty string";
              else if (typeof json == "string") {
                if (json.trim().length !== json.length)
                  e = "extra whitespace";
                else
                  int32 = Number(json);
              }
              if (int32 === void 0)
                break;
              if (type == reflection_info_1.ScalarType.UINT32)
                assert_1.assertUInt32(int32);
              else
                assert_1.assertInt32(int32);
              return int32;
            // int64, fixed64, uint64: JSON value will be a decimal string. Either numbers or strings are accepted.
            case reflection_info_1.ScalarType.INT64:
            case reflection_info_1.ScalarType.SFIXED64:
            case reflection_info_1.ScalarType.SINT64:
              if (json === null)
                return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.ZERO, longType);
              if (typeof json != "number" && typeof json != "string")
                break;
              return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.from(json), longType);
            case reflection_info_1.ScalarType.FIXED64:
            case reflection_info_1.ScalarType.UINT64:
              if (json === null)
                return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.ZERO, longType);
              if (typeof json != "number" && typeof json != "string")
                break;
              return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.from(json), longType);
            // bool:
            case reflection_info_1.ScalarType.BOOL:
              if (json === null)
                return false;
              if (typeof json !== "boolean")
                break;
              return json;
            // string:
            case reflection_info_1.ScalarType.STRING:
              if (json === null)
                return "";
              if (typeof json !== "string") {
                e = "extra whitespace";
                break;
              }
              try {
                encodeURIComponent(json);
              } catch (e2) {
                e2 = "invalid UTF8";
                break;
              }
              return json;
            // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
            // Either standard or URL-safe base64 encoding with/without paddings are accepted.
            case reflection_info_1.ScalarType.BYTES:
              if (json === null || json === "")
                return new Uint8Array(0);
              if (typeof json !== "string")
                break;
              return base64_1.base64decode(json);
          }
        } catch (error) {
          e = error.message;
        }
        this.assert(false, fieldName + (e ? " - " + e : ""), json);
      }
    };
    exports.ReflectionJsonReader = ReflectionJsonReader;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-writer.js
var require_reflection_json_writer = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-writer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionJsonWriter = void 0;
    var base64_1 = require_base64();
    var pb_long_1 = require_pb_long();
    var reflection_info_1 = require_reflection_info();
    var assert_1 = require_assert();
    var ReflectionJsonWriter = class {
      constructor(info) {
        var _a;
        this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
      }
      /**
       * Converts the message to a JSON object, based on the field descriptors.
       */
      write(message, options) {
        const json = {}, source = message;
        for (const field of this.fields) {
          if (!field.oneof) {
            let jsonValue2 = this.field(field, source[field.localName], options);
            if (jsonValue2 !== void 0)
              json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue2;
            continue;
          }
          const group = source[field.oneof];
          if (group.oneofKind !== field.localName)
            continue;
          const opt = field.kind == "scalar" || field.kind == "enum" ? Object.assign(Object.assign({}, options), { emitDefaultValues: true }) : options;
          let jsonValue = this.field(field, group[field.localName], opt);
          assert_1.assert(jsonValue !== void 0);
          json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
        }
        return json;
      }
      field(field, value, options) {
        let jsonValue = void 0;
        if (field.kind == "map") {
          assert_1.assert(typeof value == "object" && value !== null);
          const jsonObj = {};
          switch (field.V.kind) {
            case "scalar":
              for (const [entryKey, entryValue] of Object.entries(value)) {
                const val = this.scalar(field.V.T, entryValue, field.name, false, true);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
            case "message":
              const messageType = field.V.T();
              for (const [entryKey, entryValue] of Object.entries(value)) {
                const val = this.message(messageType, entryValue, field.name, options);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
            case "enum":
              const enumInfo = field.V.T();
              for (const [entryKey, entryValue] of Object.entries(value)) {
                assert_1.assert(entryValue === void 0 || typeof entryValue == "number");
                const val = this.enum(enumInfo, entryValue, field.name, false, true, options.enumAsInteger);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
          }
          if (options.emitDefaultValues || Object.keys(jsonObj).length > 0)
            jsonValue = jsonObj;
        } else if (field.repeat) {
          assert_1.assert(Array.isArray(value));
          const jsonArr = [];
          switch (field.kind) {
            case "scalar":
              for (let i = 0; i < value.length; i++) {
                const val = this.scalar(field.T, value[i], field.name, field.opt, true);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
            case "enum":
              const enumInfo = field.T();
              for (let i = 0; i < value.length; i++) {
                assert_1.assert(value[i] === void 0 || typeof value[i] == "number");
                const val = this.enum(enumInfo, value[i], field.name, field.opt, true, options.enumAsInteger);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
            case "message":
              const messageType = field.T();
              for (let i = 0; i < value.length; i++) {
                const val = this.message(messageType, value[i], field.name, options);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
          }
          if (options.emitDefaultValues || jsonArr.length > 0 || options.emitDefaultValues)
            jsonValue = jsonArr;
        } else {
          switch (field.kind) {
            case "scalar":
              jsonValue = this.scalar(field.T, value, field.name, field.opt, options.emitDefaultValues);
              break;
            case "enum":
              jsonValue = this.enum(field.T(), value, field.name, field.opt, options.emitDefaultValues, options.enumAsInteger);
              break;
            case "message":
              jsonValue = this.message(field.T(), value, field.name, options);
              break;
          }
        }
        return jsonValue;
      }
      /**
       * Returns `null` as the default for google.protobuf.NullValue.
       */
      enum(type, value, fieldName, optional2, emitDefaultValues, enumAsInteger) {
        if (type[0] == "google.protobuf.NullValue")
          return !emitDefaultValues && !optional2 ? void 0 : null;
        if (value === void 0) {
          assert_1.assert(optional2);
          return void 0;
        }
        if (value === 0 && !emitDefaultValues && !optional2)
          return void 0;
        assert_1.assert(typeof value == "number");
        assert_1.assert(Number.isInteger(value));
        if (enumAsInteger || !type[1].hasOwnProperty(value))
          return value;
        if (type[2])
          return type[2] + type[1][value];
        return type[1][value];
      }
      message(type, value, fieldName, options) {
        if (value === void 0)
          return options.emitDefaultValues ? null : void 0;
        return type.internalJsonWrite(value, options);
      }
      scalar(type, value, fieldName, optional2, emitDefaultValues) {
        if (value === void 0) {
          assert_1.assert(optional2);
          return void 0;
        }
        const ed2 = emitDefaultValues || optional2;
        switch (type) {
          // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
            if (value === 0)
              return ed2 ? 0 : void 0;
            assert_1.assertInt32(value);
            return value;
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.UINT32:
            if (value === 0)
              return ed2 ? 0 : void 0;
            assert_1.assertUInt32(value);
            return value;
          // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
          // Either numbers or strings are accepted. Exponent notation is also accepted.
          case reflection_info_1.ScalarType.FLOAT:
            assert_1.assertFloat32(value);
          case reflection_info_1.ScalarType.DOUBLE:
            if (value === 0)
              return ed2 ? 0 : void 0;
            assert_1.assert(typeof value == "number");
            if (Number.isNaN(value))
              return "NaN";
            if (value === Number.POSITIVE_INFINITY)
              return "Infinity";
            if (value === Number.NEGATIVE_INFINITY)
              return "-Infinity";
            return value;
          // string:
          case reflection_info_1.ScalarType.STRING:
            if (value === "")
              return ed2 ? "" : void 0;
            assert_1.assert(typeof value == "string");
            return value;
          // bool:
          case reflection_info_1.ScalarType.BOOL:
            if (value === false)
              return ed2 ? false : void 0;
            assert_1.assert(typeof value == "boolean");
            return value;
          // JSON value will be a decimal string. Either numbers or strings are accepted.
          case reflection_info_1.ScalarType.UINT64:
          case reflection_info_1.ScalarType.FIXED64:
            assert_1.assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
            let ulong = pb_long_1.PbULong.from(value);
            if (ulong.isZero() && !ed2)
              return void 0;
            return ulong.toString();
          // JSON value will be a decimal string. Either numbers or strings are accepted.
          case reflection_info_1.ScalarType.INT64:
          case reflection_info_1.ScalarType.SFIXED64:
          case reflection_info_1.ScalarType.SINT64:
            assert_1.assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
            let long = pb_long_1.PbLong.from(value);
            if (long.isZero() && !ed2)
              return void 0;
            return long.toString();
          // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
          // Either standard or URL-safe base64 encoding with/without paddings are accepted.
          case reflection_info_1.ScalarType.BYTES:
            assert_1.assert(value instanceof Uint8Array);
            if (!value.byteLength)
              return ed2 ? "" : void 0;
            return base64_1.base64encode(value);
        }
      }
    };
    exports.ReflectionJsonWriter = ReflectionJsonWriter;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-scalar-default.js
var require_reflection_scalar_default = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-scalar-default.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionScalarDefault = void 0;
    var reflection_info_1 = require_reflection_info();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var pb_long_1 = require_pb_long();
    function reflectionScalarDefault(type, longType = reflection_info_1.LongType.STRING) {
      switch (type) {
        case reflection_info_1.ScalarType.BOOL:
          return false;
        case reflection_info_1.ScalarType.UINT64:
        case reflection_info_1.ScalarType.FIXED64:
          return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.ZERO, longType);
        case reflection_info_1.ScalarType.INT64:
        case reflection_info_1.ScalarType.SFIXED64:
        case reflection_info_1.ScalarType.SINT64:
          return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.ZERO, longType);
        case reflection_info_1.ScalarType.DOUBLE:
        case reflection_info_1.ScalarType.FLOAT:
          return 0;
        case reflection_info_1.ScalarType.BYTES:
          return new Uint8Array(0);
        case reflection_info_1.ScalarType.STRING:
          return "";
        default:
          return 0;
      }
    }
    exports.reflectionScalarDefault = reflectionScalarDefault;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-reader.js
var require_reflection_binary_reader = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-reader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionBinaryReader = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var reflection_info_1 = require_reflection_info();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    var ReflectionBinaryReader = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        var _a;
        if (!this.fieldNoToField) {
          const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
          this.fieldNoToField = new Map(fieldsInput.map((field) => [field.no, field]));
        }
      }
      /**
       * Reads a message from binary format into the target message.
       *
       * Repeated fields are appended. Map entries are added, overwriting
       * existing keys.
       *
       * If a message field is already present, it will be merged with the
       * new data.
       */
      read(reader, message, options, length) {
        this.prepare();
        const end = length === void 0 ? reader.len : reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag(), field = this.fieldNoToField.get(fieldNo);
          if (!field) {
            let u = options.readUnknownField;
            if (u == "throw")
              throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.info.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? binary_format_contract_1.UnknownFieldHandler.onRead : u)(this.info.typeName, message, fieldNo, wireType, d);
            continue;
          }
          let target = message, repeated = field.repeat, localName = field.localName;
          if (field.oneof) {
            target = target[field.oneof];
            if (target.oneofKind !== localName)
              target = message[field.oneof] = {
                oneofKind: localName
              };
          }
          switch (field.kind) {
            case "scalar":
            case "enum":
              let T = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
              let L = field.kind == "scalar" ? field.L : void 0;
              if (repeated) {
                let arr = target[localName];
                if (wireType == binary_format_contract_1.WireType.LengthDelimited && T != reflection_info_1.ScalarType.STRING && T != reflection_info_1.ScalarType.BYTES) {
                  let e = reader.uint32() + reader.pos;
                  while (reader.pos < e)
                    arr.push(this.scalar(reader, T, L));
                } else
                  arr.push(this.scalar(reader, T, L));
              } else
                target[localName] = this.scalar(reader, T, L);
              break;
            case "message":
              if (repeated) {
                let arr = target[localName];
                let msg = field.T().internalBinaryRead(reader, reader.uint32(), options);
                arr.push(msg);
              } else
                target[localName] = field.T().internalBinaryRead(reader, reader.uint32(), options, target[localName]);
              break;
            case "map":
              let [mapKey, mapVal] = this.mapEntry(field, reader, options);
              target[localName][mapKey] = mapVal;
              break;
          }
        }
      }
      /**
       * Read a map field, expecting key field = 1, value field = 2
       */
      mapEntry(field, reader, options) {
        let length = reader.uint32();
        let end = reader.pos + length;
        let key = void 0;
        let val = void 0;
        while (reader.pos < end) {
          let [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case 1:
              if (field.K == reflection_info_1.ScalarType.BOOL)
                key = reader.bool().toString();
              else
                key = this.scalar(reader, field.K, reflection_info_1.LongType.STRING);
              break;
            case 2:
              switch (field.V.kind) {
                case "scalar":
                  val = this.scalar(reader, field.V.T, field.V.L);
                  break;
                case "enum":
                  val = reader.int32();
                  break;
                case "message":
                  val = field.V.T().internalBinaryRead(reader, reader.uint32(), options);
                  break;
              }
              break;
            default:
              throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) in map entry for ${this.info.typeName}#${field.name}`);
          }
        }
        if (key === void 0) {
          let keyRaw = reflection_scalar_default_1.reflectionScalarDefault(field.K);
          key = field.K == reflection_info_1.ScalarType.BOOL ? keyRaw.toString() : keyRaw;
        }
        if (val === void 0)
          switch (field.V.kind) {
            case "scalar":
              val = reflection_scalar_default_1.reflectionScalarDefault(field.V.T, field.V.L);
              break;
            case "enum":
              val = 0;
              break;
            case "message":
              val = field.V.T().create();
              break;
          }
        return [key, val];
      }
      scalar(reader, type, longType) {
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
            return reader.int32();
          case reflection_info_1.ScalarType.STRING:
            return reader.string();
          case reflection_info_1.ScalarType.BOOL:
            return reader.bool();
          case reflection_info_1.ScalarType.DOUBLE:
            return reader.double();
          case reflection_info_1.ScalarType.FLOAT:
            return reader.float();
          case reflection_info_1.ScalarType.INT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.int64(), longType);
          case reflection_info_1.ScalarType.UINT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.uint64(), longType);
          case reflection_info_1.ScalarType.FIXED64:
            return reflection_long_convert_1.reflectionLongConvert(reader.fixed64(), longType);
          case reflection_info_1.ScalarType.FIXED32:
            return reader.fixed32();
          case reflection_info_1.ScalarType.BYTES:
            return reader.bytes();
          case reflection_info_1.ScalarType.UINT32:
            return reader.uint32();
          case reflection_info_1.ScalarType.SFIXED32:
            return reader.sfixed32();
          case reflection_info_1.ScalarType.SFIXED64:
            return reflection_long_convert_1.reflectionLongConvert(reader.sfixed64(), longType);
          case reflection_info_1.ScalarType.SINT32:
            return reader.sint32();
          case reflection_info_1.ScalarType.SINT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.sint64(), longType);
        }
      }
    };
    exports.ReflectionBinaryReader = ReflectionBinaryReader;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-writer.js
var require_reflection_binary_writer = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-writer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionBinaryWriter = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var reflection_info_1 = require_reflection_info();
    var assert_1 = require_assert();
    var pb_long_1 = require_pb_long();
    var ReflectionBinaryWriter = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        if (!this.fields) {
          const fieldsInput = this.info.fields ? this.info.fields.concat() : [];
          this.fields = fieldsInput.sort((a, b) => a.no - b.no);
        }
      }
      /**
       * Writes the message to binary format.
       */
      write(message, writer, options) {
        this.prepare();
        for (const field of this.fields) {
          let value, emitDefault, repeated = field.repeat, localName = field.localName;
          if (field.oneof) {
            const group = message[field.oneof];
            if (group.oneofKind !== localName)
              continue;
            value = group[localName];
            emitDefault = true;
          } else {
            value = message[localName];
            emitDefault = false;
          }
          switch (field.kind) {
            case "scalar":
            case "enum":
              let T = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
              if (repeated) {
                assert_1.assert(Array.isArray(value));
                if (repeated == reflection_info_1.RepeatType.PACKED)
                  this.packed(writer, T, field.no, value);
                else
                  for (const item of value)
                    this.scalar(writer, T, field.no, item, true);
              } else if (value === void 0)
                assert_1.assert(field.opt);
              else
                this.scalar(writer, T, field.no, value, emitDefault || field.opt);
              break;
            case "message":
              if (repeated) {
                assert_1.assert(Array.isArray(value));
                for (const item of value)
                  this.message(writer, options, field.T(), field.no, item);
              } else {
                this.message(writer, options, field.T(), field.no, value);
              }
              break;
            case "map":
              assert_1.assert(typeof value == "object" && value !== null);
              for (const [key, val] of Object.entries(value))
                this.mapEntry(writer, options, field, key, val);
              break;
          }
        }
        let u = options.writeUnknownFields;
        if (u !== false)
          (u === true ? binary_format_contract_1.UnknownFieldHandler.onWrite : u)(this.info.typeName, message, writer);
      }
      mapEntry(writer, options, field, key, value) {
        writer.tag(field.no, binary_format_contract_1.WireType.LengthDelimited);
        writer.fork();
        let keyValue = key;
        switch (field.K) {
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.UINT32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
            keyValue = Number.parseInt(key);
            break;
          case reflection_info_1.ScalarType.BOOL:
            assert_1.assert(key == "true" || key == "false");
            keyValue = key == "true";
            break;
        }
        this.scalar(writer, field.K, 1, keyValue, true);
        switch (field.V.kind) {
          case "scalar":
            this.scalar(writer, field.V.T, 2, value, true);
            break;
          case "enum":
            this.scalar(writer, reflection_info_1.ScalarType.INT32, 2, value, true);
            break;
          case "message":
            this.message(writer, options, field.V.T(), 2, value);
            break;
        }
        writer.join();
      }
      message(writer, options, handler, fieldNo, value) {
        if (value === void 0)
          return;
        handler.internalBinaryWrite(value, writer.tag(fieldNo, binary_format_contract_1.WireType.LengthDelimited).fork(), options);
        writer.join();
      }
      /**
       * Write a single scalar value.
       */
      scalar(writer, type, fieldNo, value, emitDefault) {
        let [wireType, method, isDefault] = this.scalarInfo(type, value);
        if (!isDefault || emitDefault) {
          writer.tag(fieldNo, wireType);
          writer[method](value);
        }
      }
      /**
       * Write an array of scalar values in packed format.
       */
      packed(writer, type, fieldNo, value) {
        if (!value.length)
          return;
        assert_1.assert(type !== reflection_info_1.ScalarType.BYTES && type !== reflection_info_1.ScalarType.STRING);
        writer.tag(fieldNo, binary_format_contract_1.WireType.LengthDelimited);
        writer.fork();
        let [, method] = this.scalarInfo(type);
        for (let i = 0; i < value.length; i++)
          writer[method](value[i]);
        writer.join();
      }
      /**
       * Get information for writing a scalar value.
       *
       * Returns tuple:
       * [0]: appropriate WireType
       * [1]: name of the appropriate method of IBinaryWriter
       * [2]: whether the given value is a default value
       *
       * If argument `value` is omitted, [2] is always false.
       */
      scalarInfo(type, value) {
        let t = binary_format_contract_1.WireType.Varint;
        let m;
        let i = value === void 0;
        let d = value === 0;
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
            m = "int32";
            break;
          case reflection_info_1.ScalarType.STRING:
            d = i || !value.length;
            t = binary_format_contract_1.WireType.LengthDelimited;
            m = "string";
            break;
          case reflection_info_1.ScalarType.BOOL:
            d = value === false;
            m = "bool";
            break;
          case reflection_info_1.ScalarType.UINT32:
            m = "uint32";
            break;
          case reflection_info_1.ScalarType.DOUBLE:
            t = binary_format_contract_1.WireType.Bit64;
            m = "double";
            break;
          case reflection_info_1.ScalarType.FLOAT:
            t = binary_format_contract_1.WireType.Bit32;
            m = "float";
            break;
          case reflection_info_1.ScalarType.INT64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            m = "int64";
            break;
          case reflection_info_1.ScalarType.UINT64:
            d = i || pb_long_1.PbULong.from(value).isZero();
            m = "uint64";
            break;
          case reflection_info_1.ScalarType.FIXED64:
            d = i || pb_long_1.PbULong.from(value).isZero();
            t = binary_format_contract_1.WireType.Bit64;
            m = "fixed64";
            break;
          case reflection_info_1.ScalarType.BYTES:
            d = i || !value.byteLength;
            t = binary_format_contract_1.WireType.LengthDelimited;
            m = "bytes";
            break;
          case reflection_info_1.ScalarType.FIXED32:
            t = binary_format_contract_1.WireType.Bit32;
            m = "fixed32";
            break;
          case reflection_info_1.ScalarType.SFIXED32:
            t = binary_format_contract_1.WireType.Bit32;
            m = "sfixed32";
            break;
          case reflection_info_1.ScalarType.SFIXED64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            t = binary_format_contract_1.WireType.Bit64;
            m = "sfixed64";
            break;
          case reflection_info_1.ScalarType.SINT32:
            m = "sint32";
            break;
          case reflection_info_1.ScalarType.SINT64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            m = "sint64";
            break;
        }
        return [t, m, i || d];
      }
    };
    exports.ReflectionBinaryWriter = ReflectionBinaryWriter;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-create.js
var require_reflection_create = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-create.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionCreate = void 0;
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    var message_type_contract_1 = require_message_type_contract();
    function reflectionCreate(type) {
      const msg = type.messagePrototype ? Object.create(type.messagePrototype) : Object.defineProperty({}, message_type_contract_1.MESSAGE_TYPE, { value: type });
      for (let field of type.fields) {
        let name = field.localName;
        if (field.opt)
          continue;
        if (field.oneof)
          msg[field.oneof] = { oneofKind: void 0 };
        else if (field.repeat)
          msg[name] = [];
        else
          switch (field.kind) {
            case "scalar":
              msg[name] = reflection_scalar_default_1.reflectionScalarDefault(field.T, field.L);
              break;
            case "enum":
              msg[name] = 0;
              break;
            case "map":
              msg[name] = {};
              break;
          }
      }
      return msg;
    }
    exports.reflectionCreate = reflectionCreate;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-merge-partial.js
var require_reflection_merge_partial = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-merge-partial.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionMergePartial = void 0;
    function reflectionMergePartial(info, target, source) {
      let fieldValue, input = source, output;
      for (let field of info.fields) {
        let name = field.localName;
        if (field.oneof) {
          const group = input[field.oneof];
          if ((group === null || group === void 0 ? void 0 : group.oneofKind) == void 0) {
            continue;
          }
          fieldValue = group[name];
          output = target[field.oneof];
          output.oneofKind = group.oneofKind;
          if (fieldValue == void 0) {
            delete output[name];
            continue;
          }
        } else {
          fieldValue = input[name];
          output = target;
          if (fieldValue == void 0) {
            continue;
          }
        }
        if (field.repeat)
          output[name].length = fieldValue.length;
        switch (field.kind) {
          case "scalar":
          case "enum":
            if (field.repeat)
              for (let i = 0; i < fieldValue.length; i++)
                output[name][i] = fieldValue[i];
            else
              output[name] = fieldValue;
            break;
          case "message":
            let T = field.T();
            if (field.repeat)
              for (let i = 0; i < fieldValue.length; i++)
                output[name][i] = T.create(fieldValue[i]);
            else if (output[name] === void 0)
              output[name] = T.create(fieldValue);
            else
              T.mergePartial(output[name], fieldValue);
            break;
          case "map":
            switch (field.V.kind) {
              case "scalar":
              case "enum":
                Object.assign(output[name], fieldValue);
                break;
              case "message":
                let T2 = field.V.T();
                for (let k of Object.keys(fieldValue))
                  output[name][k] = T2.create(fieldValue[k]);
                break;
            }
            break;
        }
      }
    }
    exports.reflectionMergePartial = reflectionMergePartial;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-equals.js
var require_reflection_equals = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-equals.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionEquals = void 0;
    var reflection_info_1 = require_reflection_info();
    function reflectionEquals(info, a, b) {
      if (a === b)
        return true;
      if (!a || !b)
        return false;
      for (let field of info.fields) {
        let localName = field.localName;
        let val_a = field.oneof ? a[field.oneof][localName] : a[localName];
        let val_b = field.oneof ? b[field.oneof][localName] : b[localName];
        switch (field.kind) {
          case "enum":
          case "scalar":
            let t = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
            if (!(field.repeat ? repeatedPrimitiveEq(t, val_a, val_b) : primitiveEq(t, val_a, val_b)))
              return false;
            break;
          case "map":
            if (!(field.V.kind == "message" ? repeatedMsgEq(field.V.T(), objectValues(val_a), objectValues(val_b)) : repeatedPrimitiveEq(field.V.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.V.T, objectValues(val_a), objectValues(val_b))))
              return false;
            break;
          case "message":
            let T = field.T();
            if (!(field.repeat ? repeatedMsgEq(T, val_a, val_b) : T.equals(val_a, val_b)))
              return false;
            break;
        }
      }
      return true;
    }
    exports.reflectionEquals = reflectionEquals;
    var objectValues = Object.values;
    function primitiveEq(type, a, b) {
      if (a === b)
        return true;
      if (type !== reflection_info_1.ScalarType.BYTES)
        return false;
      let ba = a;
      let bb = b;
      if (ba.length !== bb.length)
        return false;
      for (let i = 0; i < ba.length; i++)
        if (ba[i] != bb[i])
          return false;
      return true;
    }
    function repeatedPrimitiveEq(type, a, b) {
      if (a.length !== b.length)
        return false;
      for (let i = 0; i < a.length; i++)
        if (!primitiveEq(type, a[i], b[i]))
          return false;
      return true;
    }
    function repeatedMsgEq(type, a, b) {
      if (a.length !== b.length)
        return false;
      for (let i = 0; i < a.length; i++)
        if (!type.equals(a[i], b[i]))
          return false;
      return true;
    }
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/message-type.js
var require_message_type = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/message-type.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageType = void 0;
    var message_type_contract_1 = require_message_type_contract();
    var reflection_info_1 = require_reflection_info();
    var reflection_type_check_1 = require_reflection_type_check();
    var reflection_json_reader_1 = require_reflection_json_reader();
    var reflection_json_writer_1 = require_reflection_json_writer();
    var reflection_binary_reader_1 = require_reflection_binary_reader();
    var reflection_binary_writer_1 = require_reflection_binary_writer();
    var reflection_create_1 = require_reflection_create();
    var reflection_merge_partial_1 = require_reflection_merge_partial();
    var json_typings_1 = require_json_typings();
    var json_format_contract_1 = require_json_format_contract();
    var reflection_equals_1 = require_reflection_equals();
    var binary_writer_1 = require_binary_writer();
    var binary_reader_1 = require_binary_reader();
    var baseDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf({}));
    var messageTypeDescriptor = baseDescriptors[message_type_contract_1.MESSAGE_TYPE] = {};
    var MessageType39 = class {
      constructor(name, fields, options) {
        this.defaultCheckDepth = 16;
        this.typeName = name;
        this.fields = fields.map(reflection_info_1.normalizeFieldInfo);
        this.options = options !== null && options !== void 0 ? options : {};
        messageTypeDescriptor.value = this;
        this.messagePrototype = Object.create(null, baseDescriptors);
        this.refTypeCheck = new reflection_type_check_1.ReflectionTypeCheck(this);
        this.refJsonReader = new reflection_json_reader_1.ReflectionJsonReader(this);
        this.refJsonWriter = new reflection_json_writer_1.ReflectionJsonWriter(this);
        this.refBinReader = new reflection_binary_reader_1.ReflectionBinaryReader(this);
        this.refBinWriter = new reflection_binary_writer_1.ReflectionBinaryWriter(this);
      }
      create(value) {
        let message = reflection_create_1.reflectionCreate(this);
        if (value !== void 0) {
          reflection_merge_partial_1.reflectionMergePartial(this, message, value);
        }
        return message;
      }
      /**
       * Clone the message.
       *
       * Unknown fields are discarded.
       */
      clone(message) {
        let copy = this.create();
        reflection_merge_partial_1.reflectionMergePartial(this, copy, message);
        return copy;
      }
      /**
       * Determines whether two message of the same type have the same field values.
       * Checks for deep equality, traversing repeated fields, oneof groups, maps
       * and messages recursively.
       * Will also return true if both messages are `undefined`.
       */
      equals(a, b) {
        return reflection_equals_1.reflectionEquals(this, a, b);
      }
      /**
       * Is the given value assignable to our message type
       * and contains no [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
       */
      is(arg, depth = this.defaultCheckDepth) {
        return this.refTypeCheck.is(arg, depth, false);
      }
      /**
       * Is the given value assignable to our message type,
       * regardless of [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
       */
      isAssignable(arg, depth = this.defaultCheckDepth) {
        return this.refTypeCheck.is(arg, depth, true);
      }
      /**
       * Copy partial data into the target message.
       */
      mergePartial(target, source) {
        reflection_merge_partial_1.reflectionMergePartial(this, target, source);
      }
      /**
       * Create a new message from binary format.
       */
      fromBinary(data, options) {
        let opt = binary_reader_1.binaryReadOptions(options);
        return this.internalBinaryRead(opt.readerFactory(data), data.byteLength, opt);
      }
      /**
       * Read a new message from a JSON value.
       */
      fromJson(json, options) {
        return this.internalJsonRead(json, json_format_contract_1.jsonReadOptions(options));
      }
      /**
       * Read a new message from a JSON string.
       * This is equivalent to `T.fromJson(JSON.parse(json))`.
       */
      fromJsonString(json, options) {
        let value = JSON.parse(json);
        return this.fromJson(value, options);
      }
      /**
       * Write the message to canonical JSON value.
       */
      toJson(message, options) {
        return this.internalJsonWrite(message, json_format_contract_1.jsonWriteOptions(options));
      }
      /**
       * Convert the message to canonical JSON string.
       * This is equivalent to `JSON.stringify(T.toJson(t))`
       */
      toJsonString(message, options) {
        var _a;
        let value = this.toJson(message, options);
        return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
      }
      /**
       * Write the message to binary format.
       */
      toBinary(message, options) {
        let opt = binary_writer_1.binaryWriteOptions(options);
        return this.internalBinaryWrite(message, opt.writerFactory(), opt).finish();
      }
      /**
       * This is an internal method. If you just want to read a message from
       * JSON, use `fromJson()` or `fromJsonString()`.
       *
       * Reads JSON value and merges the fields into the target
       * according to protobuf rules. If the target is omitted,
       * a new instance is created first.
       */
      internalJsonRead(json, options, target) {
        if (json !== null && typeof json == "object" && !Array.isArray(json)) {
          let message = target !== null && target !== void 0 ? target : this.create();
          this.refJsonReader.read(json, message, options);
          return message;
        }
        throw new Error(`Unable to parse message ${this.typeName} from JSON ${json_typings_1.typeofJsonValue(json)}.`);
      }
      /**
       * This is an internal method. If you just want to write a message
       * to JSON, use `toJson()` or `toJsonString().
       *
       * Writes JSON value and returns it.
       */
      internalJsonWrite(message, options) {
        return this.refJsonWriter.write(message, options);
      }
      /**
       * This is an internal method. If you just want to write a message
       * in binary format, use `toBinary()`.
       *
       * Serializes the message in binary format and appends it to the given
       * writer. Returns passed writer.
       */
      internalBinaryWrite(message, writer, options) {
        this.refBinWriter.write(message, writer, options);
        return writer;
      }
      /**
       * This is an internal method. If you just want to read a message from
       * binary data, use `fromBinary()`.
       *
       * Reads data from binary format and merges the fields into
       * the target according to protobuf rules. If the target is
       * omitted, a new instance is created first.
       */
      internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create();
        this.refBinReader.read(reader, message, options, length);
        return message;
      }
    };
    exports.MessageType = MessageType39;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-contains-message-type.js
var require_reflection_contains_message_type = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-contains-message-type.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.containsMessageType = void 0;
    var message_type_contract_1 = require_message_type_contract();
    function containsMessageType(msg) {
      return msg[message_type_contract_1.MESSAGE_TYPE] != null;
    }
    exports.containsMessageType = containsMessageType;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/enum-object.js
var require_enum_object = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/enum-object.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listEnumNumbers = exports.listEnumNames = exports.listEnumValues = exports.isEnumObject = void 0;
    function isEnumObject(arg) {
      if (typeof arg != "object" || arg === null) {
        return false;
      }
      if (!arg.hasOwnProperty(0)) {
        return false;
      }
      for (let k of Object.keys(arg)) {
        let num = parseInt(k);
        if (!Number.isNaN(num)) {
          let nam = arg[num];
          if (nam === void 0)
            return false;
          if (arg[nam] !== num)
            return false;
        } else {
          let num2 = arg[k];
          if (num2 === void 0)
            return false;
          if (typeof num2 !== "number")
            return false;
          if (arg[num2] === void 0)
            return false;
        }
      }
      return true;
    }
    exports.isEnumObject = isEnumObject;
    function listEnumValues(enumObject) {
      if (!isEnumObject(enumObject))
        throw new Error("not a typescript enum object");
      let values = [];
      for (let [name, number2] of Object.entries(enumObject))
        if (typeof number2 == "number")
          values.push({ name, number: number2 });
      return values;
    }
    exports.listEnumValues = listEnumValues;
    function listEnumNames(enumObject) {
      return listEnumValues(enumObject).map((val) => val.name);
    }
    exports.listEnumNames = listEnumNames;
    function listEnumNumbers(enumObject) {
      return listEnumValues(enumObject).map((val) => val.number).filter((num, index, arr) => arr.indexOf(num) == index);
    }
    exports.listEnumNumbers = listEnumNumbers;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/index.js
var require_commonjs = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var json_typings_1 = require_json_typings();
    Object.defineProperty(exports, "typeofJsonValue", { enumerable: true, get: function() {
      return json_typings_1.typeofJsonValue;
    } });
    Object.defineProperty(exports, "isJsonObject", { enumerable: true, get: function() {
      return json_typings_1.isJsonObject;
    } });
    var base64_1 = require_base64();
    Object.defineProperty(exports, "base64decode", { enumerable: true, get: function() {
      return base64_1.base64decode;
    } });
    Object.defineProperty(exports, "base64encode", { enumerable: true, get: function() {
      return base64_1.base64encode;
    } });
    var protobufjs_utf8_1 = require_protobufjs_utf8();
    Object.defineProperty(exports, "utf8read", { enumerable: true, get: function() {
      return protobufjs_utf8_1.utf8read;
    } });
    var binary_format_contract_1 = require_binary_format_contract();
    Object.defineProperty(exports, "WireType", { enumerable: true, get: function() {
      return binary_format_contract_1.WireType;
    } });
    Object.defineProperty(exports, "mergeBinaryOptions", { enumerable: true, get: function() {
      return binary_format_contract_1.mergeBinaryOptions;
    } });
    Object.defineProperty(exports, "UnknownFieldHandler", { enumerable: true, get: function() {
      return binary_format_contract_1.UnknownFieldHandler;
    } });
    var binary_reader_1 = require_binary_reader();
    Object.defineProperty(exports, "BinaryReader", { enumerable: true, get: function() {
      return binary_reader_1.BinaryReader;
    } });
    Object.defineProperty(exports, "binaryReadOptions", { enumerable: true, get: function() {
      return binary_reader_1.binaryReadOptions;
    } });
    var binary_writer_1 = require_binary_writer();
    Object.defineProperty(exports, "BinaryWriter", { enumerable: true, get: function() {
      return binary_writer_1.BinaryWriter;
    } });
    Object.defineProperty(exports, "binaryWriteOptions", { enumerable: true, get: function() {
      return binary_writer_1.binaryWriteOptions;
    } });
    var pb_long_1 = require_pb_long();
    Object.defineProperty(exports, "PbLong", { enumerable: true, get: function() {
      return pb_long_1.PbLong;
    } });
    Object.defineProperty(exports, "PbULong", { enumerable: true, get: function() {
      return pb_long_1.PbULong;
    } });
    var json_format_contract_1 = require_json_format_contract();
    Object.defineProperty(exports, "jsonReadOptions", { enumerable: true, get: function() {
      return json_format_contract_1.jsonReadOptions;
    } });
    Object.defineProperty(exports, "jsonWriteOptions", { enumerable: true, get: function() {
      return json_format_contract_1.jsonWriteOptions;
    } });
    Object.defineProperty(exports, "mergeJsonOptions", { enumerable: true, get: function() {
      return json_format_contract_1.mergeJsonOptions;
    } });
    var message_type_contract_1 = require_message_type_contract();
    Object.defineProperty(exports, "MESSAGE_TYPE", { enumerable: true, get: function() {
      return message_type_contract_1.MESSAGE_TYPE;
    } });
    var message_type_1 = require_message_type();
    Object.defineProperty(exports, "MessageType", { enumerable: true, get: function() {
      return message_type_1.MessageType;
    } });
    var reflection_info_1 = require_reflection_info();
    Object.defineProperty(exports, "ScalarType", { enumerable: true, get: function() {
      return reflection_info_1.ScalarType;
    } });
    Object.defineProperty(exports, "LongType", { enumerable: true, get: function() {
      return reflection_info_1.LongType;
    } });
    Object.defineProperty(exports, "RepeatType", { enumerable: true, get: function() {
      return reflection_info_1.RepeatType;
    } });
    Object.defineProperty(exports, "normalizeFieldInfo", { enumerable: true, get: function() {
      return reflection_info_1.normalizeFieldInfo;
    } });
    Object.defineProperty(exports, "readFieldOptions", { enumerable: true, get: function() {
      return reflection_info_1.readFieldOptions;
    } });
    Object.defineProperty(exports, "readFieldOption", { enumerable: true, get: function() {
      return reflection_info_1.readFieldOption;
    } });
    Object.defineProperty(exports, "readMessageOption", { enumerable: true, get: function() {
      return reflection_info_1.readMessageOption;
    } });
    var reflection_type_check_1 = require_reflection_type_check();
    Object.defineProperty(exports, "ReflectionTypeCheck", { enumerable: true, get: function() {
      return reflection_type_check_1.ReflectionTypeCheck;
    } });
    var reflection_create_1 = require_reflection_create();
    Object.defineProperty(exports, "reflectionCreate", { enumerable: true, get: function() {
      return reflection_create_1.reflectionCreate;
    } });
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    Object.defineProperty(exports, "reflectionScalarDefault", { enumerable: true, get: function() {
      return reflection_scalar_default_1.reflectionScalarDefault;
    } });
    var reflection_merge_partial_1 = require_reflection_merge_partial();
    Object.defineProperty(exports, "reflectionMergePartial", { enumerable: true, get: function() {
      return reflection_merge_partial_1.reflectionMergePartial;
    } });
    var reflection_equals_1 = require_reflection_equals();
    Object.defineProperty(exports, "reflectionEquals", { enumerable: true, get: function() {
      return reflection_equals_1.reflectionEquals;
    } });
    var reflection_binary_reader_1 = require_reflection_binary_reader();
    Object.defineProperty(exports, "ReflectionBinaryReader", { enumerable: true, get: function() {
      return reflection_binary_reader_1.ReflectionBinaryReader;
    } });
    var reflection_binary_writer_1 = require_reflection_binary_writer();
    Object.defineProperty(exports, "ReflectionBinaryWriter", { enumerable: true, get: function() {
      return reflection_binary_writer_1.ReflectionBinaryWriter;
    } });
    var reflection_json_reader_1 = require_reflection_json_reader();
    Object.defineProperty(exports, "ReflectionJsonReader", { enumerable: true, get: function() {
      return reflection_json_reader_1.ReflectionJsonReader;
    } });
    var reflection_json_writer_1 = require_reflection_json_writer();
    Object.defineProperty(exports, "ReflectionJsonWriter", { enumerable: true, get: function() {
      return reflection_json_writer_1.ReflectionJsonWriter;
    } });
    var reflection_contains_message_type_1 = require_reflection_contains_message_type();
    Object.defineProperty(exports, "containsMessageType", { enumerable: true, get: function() {
      return reflection_contains_message_type_1.containsMessageType;
    } });
    var oneof_1 = require_oneof();
    Object.defineProperty(exports, "isOneofGroup", { enumerable: true, get: function() {
      return oneof_1.isOneofGroup;
    } });
    Object.defineProperty(exports, "setOneofValue", { enumerable: true, get: function() {
      return oneof_1.setOneofValue;
    } });
    Object.defineProperty(exports, "getOneofValue", { enumerable: true, get: function() {
      return oneof_1.getOneofValue;
    } });
    Object.defineProperty(exports, "clearOneofValue", { enumerable: true, get: function() {
      return oneof_1.clearOneofValue;
    } });
    Object.defineProperty(exports, "getSelectedOneofValue", { enumerable: true, get: function() {
      return oneof_1.getSelectedOneofValue;
    } });
    var enum_object_1 = require_enum_object();
    Object.defineProperty(exports, "listEnumValues", { enumerable: true, get: function() {
      return enum_object_1.listEnumValues;
    } });
    Object.defineProperty(exports, "listEnumNames", { enumerable: true, get: function() {
      return enum_object_1.listEnumNames;
    } });
    Object.defineProperty(exports, "listEnumNumbers", { enumerable: true, get: function() {
      return enum_object_1.listEnumNumbers;
    } });
    Object.defineProperty(exports, "isEnumObject", { enumerable: true, get: function() {
      return enum_object_1.isEnumObject;
    } });
    var lower_camel_case_1 = require_lower_camel_case();
    Object.defineProperty(exports, "lowerCamelCase", { enumerable: true, get: function() {
      return lower_camel_case_1.lowerCamelCase;
    } });
    var assert_1 = require_assert();
    Object.defineProperty(exports, "assert", { enumerable: true, get: function() {
      return assert_1.assert;
    } });
    Object.defineProperty(exports, "assertNever", { enumerable: true, get: function() {
      return assert_1.assertNever;
    } });
    Object.defineProperty(exports, "assertInt32", { enumerable: true, get: function() {
      return assert_1.assertInt32;
    } });
    Object.defineProperty(exports, "assertUInt32", { enumerable: true, get: function() {
      return assert_1.assertUInt32;
    } });
    Object.defineProperty(exports, "assertFloat32", { enumerable: true, get: function() {
      return assert_1.assertFloat32;
    } });
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/reflection-info.js
var require_reflection_info2 = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/reflection-info.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readServiceOption = exports.readMethodOption = exports.readMethodOptions = exports.normalizeMethodInfo = void 0;
    var runtime_1 = require_commonjs();
    function normalizeMethodInfo(method, service) {
      var _a, _b, _c;
      let m = method;
      m.service = service;
      m.localName = (_a = m.localName) !== null && _a !== void 0 ? _a : runtime_1.lowerCamelCase(m.name);
      m.serverStreaming = !!m.serverStreaming;
      m.clientStreaming = !!m.clientStreaming;
      m.options = (_b = m.options) !== null && _b !== void 0 ? _b : {};
      m.idempotency = (_c = m.idempotency) !== null && _c !== void 0 ? _c : void 0;
      return m;
    }
    exports.normalizeMethodInfo = normalizeMethodInfo;
    function readMethodOptions(service, methodName, extensionName, extensionType) {
      var _a;
      const options = (_a = service.methods.find((m, i) => m.localName === methodName || i === methodName)) === null || _a === void 0 ? void 0 : _a.options;
      return options && options[extensionName] ? extensionType.fromJson(options[extensionName]) : void 0;
    }
    exports.readMethodOptions = readMethodOptions;
    function readMethodOption(service, methodName, extensionName, extensionType) {
      var _a;
      const options = (_a = service.methods.find((m, i) => m.localName === methodName || i === methodName)) === null || _a === void 0 ? void 0 : _a.options;
      if (!options) {
        return void 0;
      }
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports.readMethodOption = readMethodOption;
    function readServiceOption(service, extensionName, extensionType) {
      const options = service.options;
      if (!options) {
        return void 0;
      }
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports.readServiceOption = readServiceOption;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/service-type.js
var require_service_type = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/service-type.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceType = void 0;
    var reflection_info_1 = require_reflection_info2();
    var ServiceType9 = class {
      constructor(typeName, methods, options) {
        this.typeName = typeName;
        this.methods = methods.map((i) => reflection_info_1.normalizeMethodInfo(i, this));
        this.options = options !== null && options !== void 0 ? options : {};
      }
    };
    exports.ServiceType = ServiceType9;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-error.js
var require_rpc_error = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RpcError = void 0;
    var RpcError3 = class extends Error {
      constructor(message, code = "UNKNOWN", meta) {
        super(message);
        this.name = "RpcError";
        Object.setPrototypeOf(this, new.target.prototype);
        this.code = code;
        this.meta = meta !== null && meta !== void 0 ? meta : {};
      }
      toString() {
        const l = [this.name + ": " + this.message];
        if (this.code) {
          l.push("");
          l.push("Code: " + this.code);
        }
        if (this.serviceName && this.methodName) {
          l.push("Method: " + this.serviceName + "/" + this.methodName);
        }
        let m = Object.entries(this.meta);
        if (m.length) {
          l.push("");
          l.push("Meta:");
          for (let [k, v] of m) {
            l.push(`  ${k}: ${v}`);
          }
        }
        return l.join("\n");
      }
    };
    exports.RpcError = RpcError3;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-options.js
var require_rpc_options = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-options.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeRpcOptions = void 0;
    var runtime_1 = require_commonjs();
    function mergeRpcOptions(defaults, options) {
      if (!options)
        return defaults;
      let o = {};
      copy(defaults, o);
      copy(options, o);
      for (let key of Object.keys(options)) {
        let val = options[key];
        switch (key) {
          case "jsonOptions":
            o.jsonOptions = runtime_1.mergeJsonOptions(defaults.jsonOptions, o.jsonOptions);
            break;
          case "binaryOptions":
            o.binaryOptions = runtime_1.mergeBinaryOptions(defaults.binaryOptions, o.binaryOptions);
            break;
          case "meta":
            o.meta = {};
            copy(defaults.meta, o.meta);
            copy(options.meta, o.meta);
            break;
          case "interceptors":
            o.interceptors = defaults.interceptors ? defaults.interceptors.concat(val) : val.concat();
            break;
        }
      }
      return o;
    }
    exports.mergeRpcOptions = mergeRpcOptions;
    function copy(a, into) {
      if (!a)
        return;
      let c = into;
      for (let [k, v] of Object.entries(a)) {
        if (v instanceof Date)
          c[k] = new Date(v.getTime());
        else if (Array.isArray(v))
          c[k] = v.concat();
        else
          c[k] = v;
      }
    }
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/deferred.js
var require_deferred = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/deferred.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Deferred = exports.DeferredState = void 0;
    var DeferredState;
    (function(DeferredState2) {
      DeferredState2[DeferredState2["PENDING"] = 0] = "PENDING";
      DeferredState2[DeferredState2["REJECTED"] = 1] = "REJECTED";
      DeferredState2[DeferredState2["RESOLVED"] = 2] = "RESOLVED";
    })(DeferredState = exports.DeferredState || (exports.DeferredState = {}));
    var Deferred = class {
      /**
       * @param preventUnhandledRejectionWarning - prevents the warning
       * "Unhandled Promise rejection" by adding a noop rejection handler.
       * Working with calls returned from the runtime-rpc package in an
       * async function usually means awaiting one call property after
       * the other. This means that the "status" is not being awaited when
       * an earlier await for the "headers" is rejected. This causes the
       * "unhandled promise reject" warning. A more correct behaviour for
       * calls might be to become aware whether at least one of the
       * promises is handled and swallow the rejection warning for the
       * others.
       */
      constructor(preventUnhandledRejectionWarning = true) {
        this._state = DeferredState.PENDING;
        this._promise = new Promise((resolve, reject) => {
          this._resolve = resolve;
          this._reject = reject;
        });
        if (preventUnhandledRejectionWarning) {
          this._promise.catch((_) => {
          });
        }
      }
      /**
       * Get the current state of the promise.
       */
      get state() {
        return this._state;
      }
      /**
       * Get the deferred promise.
       */
      get promise() {
        return this._promise;
      }
      /**
       * Resolve the promise. Throws if the promise is already resolved or rejected.
       */
      resolve(value) {
        if (this.state !== DeferredState.PENDING)
          throw new Error(`cannot resolve ${DeferredState[this.state].toLowerCase()}`);
        this._resolve(value);
        this._state = DeferredState.RESOLVED;
      }
      /**
       * Reject the promise. Throws if the promise is already resolved or rejected.
       */
      reject(reason) {
        if (this.state !== DeferredState.PENDING)
          throw new Error(`cannot reject ${DeferredState[this.state].toLowerCase()}`);
        this._reject(reason);
        this._state = DeferredState.REJECTED;
      }
      /**
       * Resolve the promise. Ignore if not pending.
       */
      resolvePending(val) {
        if (this._state === DeferredState.PENDING)
          this.resolve(val);
      }
      /**
       * Reject the promise. Ignore if not pending.
       */
      rejectPending(reason) {
        if (this._state === DeferredState.PENDING)
          this.reject(reason);
      }
    };
    exports.Deferred = Deferred;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-output-stream.js
var require_rpc_output_stream = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-output-stream.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RpcOutputStreamController = void 0;
    var deferred_1 = require_deferred();
    var runtime_1 = require_commonjs();
    var RpcOutputStreamController = class {
      constructor() {
        this._lis = {
          nxt: [],
          msg: [],
          err: [],
          cmp: []
        };
        this._closed = false;
        this._itState = { q: [] };
      }
      // --- RpcOutputStream callback API
      onNext(callback) {
        return this.addLis(callback, this._lis.nxt);
      }
      onMessage(callback) {
        return this.addLis(callback, this._lis.msg);
      }
      onError(callback) {
        return this.addLis(callback, this._lis.err);
      }
      onComplete(callback) {
        return this.addLis(callback, this._lis.cmp);
      }
      addLis(callback, list) {
        list.push(callback);
        return () => {
          let i = list.indexOf(callback);
          if (i >= 0)
            list.splice(i, 1);
        };
      }
      // remove all listeners
      clearLis() {
        for (let l of Object.values(this._lis))
          l.splice(0, l.length);
      }
      // --- Controller API
      /**
       * Is this stream already closed by a completion or error?
       */
      get closed() {
        return this._closed !== false;
      }
      /**
       * Emit message, close with error, or close successfully, but only one
       * at a time.
       * Can be used to wrap a stream by using the other stream's `onNext`.
       */
      notifyNext(message, error, complete) {
        runtime_1.assert((message ? 1 : 0) + (error ? 1 : 0) + (complete ? 1 : 0) <= 1, "only one emission at a time");
        if (message)
          this.notifyMessage(message);
        if (error)
          this.notifyError(error);
        if (complete)
          this.notifyComplete();
      }
      /**
       * Emits a new message. Throws if stream is closed.
       *
       * Triggers onNext and onMessage callbacks.
       */
      notifyMessage(message) {
        runtime_1.assert(!this.closed, "stream is closed");
        this.pushIt({ value: message, done: false });
        this._lis.msg.forEach((l) => l(message));
        this._lis.nxt.forEach((l) => l(message, void 0, false));
      }
      /**
       * Closes the stream with an error. Throws if stream is closed.
       *
       * Triggers onNext and onError callbacks.
       */
      notifyError(error) {
        runtime_1.assert(!this.closed, "stream is closed");
        this._closed = error;
        this.pushIt(error);
        this._lis.err.forEach((l) => l(error));
        this._lis.nxt.forEach((l) => l(void 0, error, false));
        this.clearLis();
      }
      /**
       * Closes the stream successfully. Throws if stream is closed.
       *
       * Triggers onNext and onComplete callbacks.
       */
      notifyComplete() {
        runtime_1.assert(!this.closed, "stream is closed");
        this._closed = true;
        this.pushIt({ value: null, done: true });
        this._lis.cmp.forEach((l) => l());
        this._lis.nxt.forEach((l) => l(void 0, void 0, true));
        this.clearLis();
      }
      /**
       * Creates an async iterator (that can be used with `for await {...}`)
       * to consume the stream.
       *
       * Some things to note:
       * - If an error occurs, the `for await` will throw it.
       * - If an error occurred before the `for await` was started, `for await`
       *   will re-throw it.
       * - If the stream is already complete, the `for await` will be empty.
       * - If your `for await` consumes slower than the stream produces,
       *   for example because you are relaying messages in a slow operation,
       *   messages are queued.
       */
      [Symbol.asyncIterator]() {
        if (this._closed === true)
          this.pushIt({ value: null, done: true });
        else if (this._closed !== false)
          this.pushIt(this._closed);
        return {
          next: () => {
            let state = this._itState;
            runtime_1.assert(state, "bad state");
            runtime_1.assert(!state.p, "iterator contract broken");
            let first = state.q.shift();
            if (first)
              return "value" in first ? Promise.resolve(first) : Promise.reject(first);
            state.p = new deferred_1.Deferred();
            return state.p.promise;
          }
        };
      }
      // "push" a new iterator result.
      // this either resolves a pending promise, or enqueues the result.
      pushIt(result) {
        let state = this._itState;
        if (state.p) {
          const p = state.p;
          runtime_1.assert(p.state == deferred_1.DeferredState.PENDING, "iterator contract broken");
          "value" in result ? p.resolve(result) : p.reject(result);
          delete state.p;
        } else {
          state.q.push(result);
        }
      }
    };
    exports.RpcOutputStreamController = RpcOutputStreamController;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/unary-call.js
var require_unary_call = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/unary-call.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UnaryCall = void 0;
    var UnaryCall = class {
      constructor(method, requestHeaders, request, headers, response, status, trailers) {
        this.method = method;
        this.requestHeaders = requestHeaders;
        this.request = request;
        this.headers = headers;
        this.response = response;
        this.status = status;
        this.trailers = trailers;
      }
      /**
       * If you are only interested in the final outcome of this call,
       * you can await it to receive a `FinishedUnaryCall`.
       */
      then(onfulfilled, onrejected) {
        return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
      }
      promiseFinished() {
        return __awaiter(this, void 0, void 0, function* () {
          let [headers, response, status, trailers] = yield Promise.all([this.headers, this.response, this.status, this.trailers]);
          return {
            method: this.method,
            requestHeaders: this.requestHeaders,
            request: this.request,
            headers,
            response,
            status,
            trailers
          };
        });
      }
    };
    exports.UnaryCall = UnaryCall;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/server-streaming-call.js
var require_server_streaming_call = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/server-streaming-call.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServerStreamingCall = void 0;
    var ServerStreamingCall = class {
      constructor(method, requestHeaders, request, headers, response, status, trailers) {
        this.method = method;
        this.requestHeaders = requestHeaders;
        this.request = request;
        this.headers = headers;
        this.responses = response;
        this.status = status;
        this.trailers = trailers;
      }
      /**
       * Instead of awaiting the response status and trailers, you can
       * just as well await this call itself to receive the server outcome.
       * You should first setup some listeners to the `request` to
       * see the actual messages the server replied with.
       */
      then(onfulfilled, onrejected) {
        return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
      }
      promiseFinished() {
        return __awaiter(this, void 0, void 0, function* () {
          let [headers, status, trailers] = yield Promise.all([this.headers, this.status, this.trailers]);
          return {
            method: this.method,
            requestHeaders: this.requestHeaders,
            request: this.request,
            headers,
            status,
            trailers
          };
        });
      }
    };
    exports.ServerStreamingCall = ServerStreamingCall;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/client-streaming-call.js
var require_client_streaming_call = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/client-streaming-call.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClientStreamingCall = void 0;
    var ClientStreamingCall = class {
      constructor(method, requestHeaders, request, headers, response, status, trailers) {
        this.method = method;
        this.requestHeaders = requestHeaders;
        this.requests = request;
        this.headers = headers;
        this.response = response;
        this.status = status;
        this.trailers = trailers;
      }
      /**
       * Instead of awaiting the response status and trailers, you can
       * just as well await this call itself to receive the server outcome.
       * Note that it may still be valid to send more request messages.
       */
      then(onfulfilled, onrejected) {
        return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
      }
      promiseFinished() {
        return __awaiter(this, void 0, void 0, function* () {
          let [headers, response, status, trailers] = yield Promise.all([this.headers, this.response, this.status, this.trailers]);
          return {
            method: this.method,
            requestHeaders: this.requestHeaders,
            headers,
            response,
            status,
            trailers
          };
        });
      }
    };
    exports.ClientStreamingCall = ClientStreamingCall;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/duplex-streaming-call.js
var require_duplex_streaming_call = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/duplex-streaming-call.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DuplexStreamingCall = void 0;
    var DuplexStreamingCall = class {
      constructor(method, requestHeaders, request, headers, response, status, trailers) {
        this.method = method;
        this.requestHeaders = requestHeaders;
        this.requests = request;
        this.headers = headers;
        this.responses = response;
        this.status = status;
        this.trailers = trailers;
      }
      /**
       * Instead of awaiting the response status and trailers, you can
       * just as well await this call itself to receive the server outcome.
       * Note that it may still be valid to send more request messages.
       */
      then(onfulfilled, onrejected) {
        return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
      }
      promiseFinished() {
        return __awaiter(this, void 0, void 0, function* () {
          let [headers, status, trailers] = yield Promise.all([this.headers, this.status, this.trailers]);
          return {
            method: this.method,
            requestHeaders: this.requestHeaders,
            headers,
            status,
            trailers
          };
        });
      }
    };
    exports.DuplexStreamingCall = DuplexStreamingCall;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/test-transport.js
var require_test_transport = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/test-transport.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestTransport = void 0;
    var rpc_error_1 = require_rpc_error();
    var runtime_1 = require_commonjs();
    var rpc_output_stream_1 = require_rpc_output_stream();
    var rpc_options_1 = require_rpc_options();
    var unary_call_1 = require_unary_call();
    var server_streaming_call_1 = require_server_streaming_call();
    var client_streaming_call_1 = require_client_streaming_call();
    var duplex_streaming_call_1 = require_duplex_streaming_call();
    var TestTransport = class _TestTransport {
      /**
       * Initialize with mock data. Omitted fields have default value.
       */
      constructor(data) {
        this.suppressUncaughtRejections = true;
        this.headerDelay = 10;
        this.responseDelay = 50;
        this.betweenResponseDelay = 10;
        this.afterResponseDelay = 10;
        this.data = data !== null && data !== void 0 ? data : {};
      }
      /**
       * Sent message(s) during the last operation.
       */
      get sentMessages() {
        if (this.lastInput instanceof TestInputStream) {
          return this.lastInput.sent;
        } else if (typeof this.lastInput == "object") {
          return [this.lastInput.single];
        }
        return [];
      }
      /**
       * Sending message(s) completed?
       */
      get sendComplete() {
        if (this.lastInput instanceof TestInputStream) {
          return this.lastInput.completed;
        } else if (typeof this.lastInput == "object") {
          return true;
        }
        return false;
      }
      // Creates a promise for response headers from the mock data.
      promiseHeaders() {
        var _a;
        const headers = (_a = this.data.headers) !== null && _a !== void 0 ? _a : _TestTransport.defaultHeaders;
        return headers instanceof rpc_error_1.RpcError ? Promise.reject(headers) : Promise.resolve(headers);
      }
      // Creates a promise for a single, valid, message from the mock data.
      promiseSingleResponse(method) {
        if (this.data.response instanceof rpc_error_1.RpcError) {
          return Promise.reject(this.data.response);
        }
        let r;
        if (Array.isArray(this.data.response)) {
          runtime_1.assert(this.data.response.length > 0);
          r = this.data.response[0];
        } else if (this.data.response !== void 0) {
          r = this.data.response;
        } else {
          r = method.O.create();
        }
        runtime_1.assert(method.O.is(r));
        return Promise.resolve(r);
      }
      /**
       * Pushes response messages from the mock data to the output stream.
       * If an error response, status or trailers are mocked, the stream is
       * closed with the respective error.
       * Otherwise, stream is completed successfully.
       *
       * The returned promise resolves when the stream is closed. It should
       * not reject. If it does, code is broken.
       */
      streamResponses(method, stream, abort) {
        return __awaiter(this, void 0, void 0, function* () {
          const messages = [];
          if (this.data.response === void 0) {
            messages.push(method.O.create());
          } else if (Array.isArray(this.data.response)) {
            for (let msg of this.data.response) {
              runtime_1.assert(method.O.is(msg));
              messages.push(msg);
            }
          } else if (!(this.data.response instanceof rpc_error_1.RpcError)) {
            runtime_1.assert(method.O.is(this.data.response));
            messages.push(this.data.response);
          }
          try {
            yield delay(this.responseDelay, abort)(void 0);
          } catch (error) {
            stream.notifyError(error);
            return;
          }
          if (this.data.response instanceof rpc_error_1.RpcError) {
            stream.notifyError(this.data.response);
            return;
          }
          for (let msg of messages) {
            stream.notifyMessage(msg);
            try {
              yield delay(this.betweenResponseDelay, abort)(void 0);
            } catch (error) {
              stream.notifyError(error);
              return;
            }
          }
          if (this.data.status instanceof rpc_error_1.RpcError) {
            stream.notifyError(this.data.status);
            return;
          }
          if (this.data.trailers instanceof rpc_error_1.RpcError) {
            stream.notifyError(this.data.trailers);
            return;
          }
          stream.notifyComplete();
        });
      }
      // Creates a promise for response status from the mock data.
      promiseStatus() {
        var _a;
        const status = (_a = this.data.status) !== null && _a !== void 0 ? _a : _TestTransport.defaultStatus;
        return status instanceof rpc_error_1.RpcError ? Promise.reject(status) : Promise.resolve(status);
      }
      // Creates a promise for response trailers from the mock data.
      promiseTrailers() {
        var _a;
        const trailers = (_a = this.data.trailers) !== null && _a !== void 0 ? _a : _TestTransport.defaultTrailers;
        return trailers instanceof rpc_error_1.RpcError ? Promise.reject(trailers) : Promise.resolve(trailers);
      }
      maybeSuppressUncaught(...promise) {
        if (this.suppressUncaughtRejections) {
          for (let p of promise) {
            p.catch(() => {
            });
          }
        }
      }
      mergeOptions(options) {
        return rpc_options_1.mergeRpcOptions({}, options);
      }
      unary(method, input, options) {
        var _a;
        const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), responsePromise = headersPromise.catch((_) => {
        }).then(delay(this.responseDelay, options.abort)).then((_) => this.promiseSingleResponse(method)), statusPromise = responsePromise.catch((_) => {
        }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseStatus()), trailersPromise = responsePromise.catch((_) => {
        }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseTrailers());
        this.maybeSuppressUncaught(statusPromise, trailersPromise);
        this.lastInput = { single: input };
        return new unary_call_1.UnaryCall(method, requestHeaders, input, headersPromise, responsePromise, statusPromise, trailersPromise);
      }
      serverStreaming(method, input, options) {
        var _a;
        const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), outputStream = new rpc_output_stream_1.RpcOutputStreamController(), responseStreamClosedPromise = headersPromise.then(delay(this.responseDelay, options.abort)).catch(() => {
        }).then(() => this.streamResponses(method, outputStream, options.abort)).then(delay(this.afterResponseDelay, options.abort)), statusPromise = responseStreamClosedPromise.then(() => this.promiseStatus()), trailersPromise = responseStreamClosedPromise.then(() => this.promiseTrailers());
        this.maybeSuppressUncaught(statusPromise, trailersPromise);
        this.lastInput = { single: input };
        return new server_streaming_call_1.ServerStreamingCall(method, requestHeaders, input, headersPromise, outputStream, statusPromise, trailersPromise);
      }
      clientStreaming(method, options) {
        var _a;
        const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), responsePromise = headersPromise.catch((_) => {
        }).then(delay(this.responseDelay, options.abort)).then((_) => this.promiseSingleResponse(method)), statusPromise = responsePromise.catch((_) => {
        }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseStatus()), trailersPromise = responsePromise.catch((_) => {
        }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseTrailers());
        this.maybeSuppressUncaught(statusPromise, trailersPromise);
        this.lastInput = new TestInputStream(this.data, options.abort);
        return new client_streaming_call_1.ClientStreamingCall(method, requestHeaders, this.lastInput, headersPromise, responsePromise, statusPromise, trailersPromise);
      }
      duplex(method, options) {
        var _a;
        const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), outputStream = new rpc_output_stream_1.RpcOutputStreamController(), responseStreamClosedPromise = headersPromise.then(delay(this.responseDelay, options.abort)).catch(() => {
        }).then(() => this.streamResponses(method, outputStream, options.abort)).then(delay(this.afterResponseDelay, options.abort)), statusPromise = responseStreamClosedPromise.then(() => this.promiseStatus()), trailersPromise = responseStreamClosedPromise.then(() => this.promiseTrailers());
        this.maybeSuppressUncaught(statusPromise, trailersPromise);
        this.lastInput = new TestInputStream(this.data, options.abort);
        return new duplex_streaming_call_1.DuplexStreamingCall(method, requestHeaders, this.lastInput, headersPromise, outputStream, statusPromise, trailersPromise);
      }
    };
    exports.TestTransport = TestTransport;
    TestTransport.defaultHeaders = {
      responseHeader: "test"
    };
    TestTransport.defaultStatus = {
      code: "OK",
      detail: "all good"
    };
    TestTransport.defaultTrailers = {
      responseTrailer: "test"
    };
    function delay(ms, abort) {
      return (v) => new Promise((resolve, reject) => {
        if (abort === null || abort === void 0 ? void 0 : abort.aborted) {
          reject(new rpc_error_1.RpcError("user cancel", "CANCELLED"));
        } else {
          const id = setTimeout(() => resolve(v), ms);
          if (abort) {
            abort.addEventListener("abort", (ev) => {
              clearTimeout(id);
              reject(new rpc_error_1.RpcError("user cancel", "CANCELLED"));
            });
          }
        }
      });
    }
    var TestInputStream = class {
      constructor(data, abort) {
        this._completed = false;
        this._sent = [];
        this.data = data;
        this.abort = abort;
      }
      get sent() {
        return this._sent;
      }
      get completed() {
        return this._completed;
      }
      send(message) {
        if (this.data.inputMessage instanceof rpc_error_1.RpcError) {
          return Promise.reject(this.data.inputMessage);
        }
        const delayMs = this.data.inputMessage === void 0 ? 10 : this.data.inputMessage;
        return Promise.resolve(void 0).then(() => {
          this._sent.push(message);
        }).then(delay(delayMs, this.abort));
      }
      complete() {
        if (this.data.inputComplete instanceof rpc_error_1.RpcError) {
          return Promise.reject(this.data.inputComplete);
        }
        const delayMs = this.data.inputComplete === void 0 ? 10 : this.data.inputComplete;
        return Promise.resolve(void 0).then(() => {
          this._completed = true;
        }).then(delay(delayMs, this.abort));
      }
    };
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-interceptor.js
var require_rpc_interceptor = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-interceptor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stackDuplexStreamingInterceptors = exports.stackClientStreamingInterceptors = exports.stackServerStreamingInterceptors = exports.stackUnaryInterceptors = exports.stackIntercept = void 0;
    var runtime_1 = require_commonjs();
    function stackIntercept9(kind, transport, method, options, input) {
      var _a, _b, _c, _d;
      if (kind == "unary") {
        let tail = (mtd, inp, opt) => transport.unary(mtd, inp, opt);
        for (const curr of ((_a = options.interceptors) !== null && _a !== void 0 ? _a : []).filter((i) => i.interceptUnary).reverse()) {
          const next = tail;
          tail = (mtd, inp, opt) => curr.interceptUnary(next, mtd, inp, opt);
        }
        return tail(method, input, options);
      }
      if (kind == "serverStreaming") {
        let tail = (mtd, inp, opt) => transport.serverStreaming(mtd, inp, opt);
        for (const curr of ((_b = options.interceptors) !== null && _b !== void 0 ? _b : []).filter((i) => i.interceptServerStreaming).reverse()) {
          const next = tail;
          tail = (mtd, inp, opt) => curr.interceptServerStreaming(next, mtd, inp, opt);
        }
        return tail(method, input, options);
      }
      if (kind == "clientStreaming") {
        let tail = (mtd, opt) => transport.clientStreaming(mtd, opt);
        for (const curr of ((_c = options.interceptors) !== null && _c !== void 0 ? _c : []).filter((i) => i.interceptClientStreaming).reverse()) {
          const next = tail;
          tail = (mtd, opt) => curr.interceptClientStreaming(next, mtd, opt);
        }
        return tail(method, options);
      }
      if (kind == "duplex") {
        let tail = (mtd, opt) => transport.duplex(mtd, opt);
        for (const curr of ((_d = options.interceptors) !== null && _d !== void 0 ? _d : []).filter((i) => i.interceptDuplex).reverse()) {
          const next = tail;
          tail = (mtd, opt) => curr.interceptDuplex(next, mtd, opt);
        }
        return tail(method, options);
      }
      runtime_1.assertNever(kind);
    }
    exports.stackIntercept = stackIntercept9;
    function stackUnaryInterceptors(transport, method, input, options) {
      return stackIntercept9("unary", transport, method, options, input);
    }
    exports.stackUnaryInterceptors = stackUnaryInterceptors;
    function stackServerStreamingInterceptors(transport, method, input, options) {
      return stackIntercept9("serverStreaming", transport, method, options, input);
    }
    exports.stackServerStreamingInterceptors = stackServerStreamingInterceptors;
    function stackClientStreamingInterceptors(transport, method, options) {
      return stackIntercept9("clientStreaming", transport, method, options);
    }
    exports.stackClientStreamingInterceptors = stackClientStreamingInterceptors;
    function stackDuplexStreamingInterceptors(transport, method, options) {
      return stackIntercept9("duplex", transport, method, options);
    }
    exports.stackDuplexStreamingInterceptors = stackDuplexStreamingInterceptors;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/server-call-context.js
var require_server_call_context = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/server-call-context.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServerCallContextController = void 0;
    var ServerCallContextController = class {
      constructor(method, headers, deadline, sendResponseHeadersFn, defaultStatus = { code: "OK", detail: "" }) {
        this._cancelled = false;
        this._listeners = [];
        this.method = method;
        this.headers = headers;
        this.deadline = deadline;
        this.trailers = {};
        this._sendRH = sendResponseHeadersFn;
        this.status = defaultStatus;
      }
      /**
       * Set the call cancelled.
       *
       * Invokes all callbacks registered with onCancel() and
       * sets `cancelled = true`.
       */
      notifyCancelled() {
        if (!this._cancelled) {
          this._cancelled = true;
          for (let l of this._listeners) {
            l();
          }
        }
      }
      /**
       * Send response headers.
       */
      sendResponseHeaders(data) {
        this._sendRH(data);
      }
      /**
       * Is the call cancelled?
       *
       * When the client closes the connection before the server
       * is done, the call is cancelled.
       *
       * If you want to cancel a request on the server, throw a
       * RpcError with the CANCELLED status code.
       */
      get cancelled() {
        return this._cancelled;
      }
      /**
       * Add a callback for cancellation.
       */
      onCancel(callback) {
        const l = this._listeners;
        l.push(callback);
        return () => {
          let i = l.indexOf(callback);
          if (i >= 0)
            l.splice(i, 1);
        };
      }
    };
    exports.ServerCallContextController = ServerCallContextController;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/index.js
var require_commonjs2 = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var service_type_1 = require_service_type();
    Object.defineProperty(exports, "ServiceType", { enumerable: true, get: function() {
      return service_type_1.ServiceType;
    } });
    var reflection_info_1 = require_reflection_info2();
    Object.defineProperty(exports, "readMethodOptions", { enumerable: true, get: function() {
      return reflection_info_1.readMethodOptions;
    } });
    Object.defineProperty(exports, "readMethodOption", { enumerable: true, get: function() {
      return reflection_info_1.readMethodOption;
    } });
    Object.defineProperty(exports, "readServiceOption", { enumerable: true, get: function() {
      return reflection_info_1.readServiceOption;
    } });
    var rpc_error_1 = require_rpc_error();
    Object.defineProperty(exports, "RpcError", { enumerable: true, get: function() {
      return rpc_error_1.RpcError;
    } });
    var rpc_options_1 = require_rpc_options();
    Object.defineProperty(exports, "mergeRpcOptions", { enumerable: true, get: function() {
      return rpc_options_1.mergeRpcOptions;
    } });
    var rpc_output_stream_1 = require_rpc_output_stream();
    Object.defineProperty(exports, "RpcOutputStreamController", { enumerable: true, get: function() {
      return rpc_output_stream_1.RpcOutputStreamController;
    } });
    var test_transport_1 = require_test_transport();
    Object.defineProperty(exports, "TestTransport", { enumerable: true, get: function() {
      return test_transport_1.TestTransport;
    } });
    var deferred_1 = require_deferred();
    Object.defineProperty(exports, "Deferred", { enumerable: true, get: function() {
      return deferred_1.Deferred;
    } });
    Object.defineProperty(exports, "DeferredState", { enumerable: true, get: function() {
      return deferred_1.DeferredState;
    } });
    var duplex_streaming_call_1 = require_duplex_streaming_call();
    Object.defineProperty(exports, "DuplexStreamingCall", { enumerable: true, get: function() {
      return duplex_streaming_call_1.DuplexStreamingCall;
    } });
    var client_streaming_call_1 = require_client_streaming_call();
    Object.defineProperty(exports, "ClientStreamingCall", { enumerable: true, get: function() {
      return client_streaming_call_1.ClientStreamingCall;
    } });
    var server_streaming_call_1 = require_server_streaming_call();
    Object.defineProperty(exports, "ServerStreamingCall", { enumerable: true, get: function() {
      return server_streaming_call_1.ServerStreamingCall;
    } });
    var unary_call_1 = require_unary_call();
    Object.defineProperty(exports, "UnaryCall", { enumerable: true, get: function() {
      return unary_call_1.UnaryCall;
    } });
    var rpc_interceptor_1 = require_rpc_interceptor();
    Object.defineProperty(exports, "stackIntercept", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackIntercept;
    } });
    Object.defineProperty(exports, "stackDuplexStreamingInterceptors", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackDuplexStreamingInterceptors;
    } });
    Object.defineProperty(exports, "stackClientStreamingInterceptors", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackClientStreamingInterceptors;
    } });
    Object.defineProperty(exports, "stackServerStreamingInterceptors", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackServerStreamingInterceptors;
    } });
    Object.defineProperty(exports, "stackUnaryInterceptors", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackUnaryInterceptors;
    } });
    var server_call_context_1 = require_server_call_context();
    Object.defineProperty(exports, "ServerCallContextController", { enumerable: true, get: function() {
      return server_call_context_1.ServerCallContextController;
    } });
  }
});

// node_modules/@protobuf-ts/grpcweb-transport/build/commonjs/goog-grpc-status-code.js
var require_goog_grpc_status_code = __commonJS({
  "node_modules/@protobuf-ts/grpcweb-transport/build/commonjs/goog-grpc-status-code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GrpcStatusCode = void 0;
    var GrpcStatusCode3;
    (function(GrpcStatusCode4) {
      GrpcStatusCode4[GrpcStatusCode4["OK"] = 0] = "OK";
      GrpcStatusCode4[GrpcStatusCode4["CANCELLED"] = 1] = "CANCELLED";
      GrpcStatusCode4[GrpcStatusCode4["UNKNOWN"] = 2] = "UNKNOWN";
      GrpcStatusCode4[GrpcStatusCode4["INVALID_ARGUMENT"] = 3] = "INVALID_ARGUMENT";
      GrpcStatusCode4[GrpcStatusCode4["DEADLINE_EXCEEDED"] = 4] = "DEADLINE_EXCEEDED";
      GrpcStatusCode4[GrpcStatusCode4["NOT_FOUND"] = 5] = "NOT_FOUND";
      GrpcStatusCode4[GrpcStatusCode4["ALREADY_EXISTS"] = 6] = "ALREADY_EXISTS";
      GrpcStatusCode4[GrpcStatusCode4["PERMISSION_DENIED"] = 7] = "PERMISSION_DENIED";
      GrpcStatusCode4[GrpcStatusCode4["UNAUTHENTICATED"] = 16] = "UNAUTHENTICATED";
      GrpcStatusCode4[GrpcStatusCode4["RESOURCE_EXHAUSTED"] = 8] = "RESOURCE_EXHAUSTED";
      GrpcStatusCode4[GrpcStatusCode4["FAILED_PRECONDITION"] = 9] = "FAILED_PRECONDITION";
      GrpcStatusCode4[GrpcStatusCode4["ABORTED"] = 10] = "ABORTED";
      GrpcStatusCode4[GrpcStatusCode4["OUT_OF_RANGE"] = 11] = "OUT_OF_RANGE";
      GrpcStatusCode4[GrpcStatusCode4["UNIMPLEMENTED"] = 12] = "UNIMPLEMENTED";
      GrpcStatusCode4[GrpcStatusCode4["INTERNAL"] = 13] = "INTERNAL";
      GrpcStatusCode4[GrpcStatusCode4["UNAVAILABLE"] = 14] = "UNAVAILABLE";
      GrpcStatusCode4[GrpcStatusCode4["DATA_LOSS"] = 15] = "DATA_LOSS";
    })(GrpcStatusCode3 = exports.GrpcStatusCode || (exports.GrpcStatusCode = {}));
  }
});

// node_modules/@protobuf-ts/grpcweb-transport/build/commonjs/grpc-web-format.js
var require_grpc_web_format = __commonJS({
  "node_modules/@protobuf-ts/grpcweb-transport/build/commonjs/grpc-web-format.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readGrpcWebResponseBody = exports.GrpcWebFrame = exports.readGrpcWebResponseTrailer = exports.readGrpcWebResponseHeader = exports.createGrpcWebRequestBody = exports.createGrpcWebRequestHeader = void 0;
    var runtime_1 = require_commonjs();
    var runtime_rpc_1 = require_commonjs2();
    var goog_grpc_status_code_1 = require_goog_grpc_status_code();
    function createGrpcWebRequestHeader(headers, format, timeout, meta, userAgent) {
      if (meta) {
        for (let [k, v] of Object.entries(meta)) {
          if (typeof v == "string")
            headers.append(k, v);
          else
            for (let i of v)
              headers.append(k, i);
        }
      }
      headers.set("Content-Type", format === "text" ? "application/grpc-web-text" : "application/grpc-web+proto");
      if (format == "text") {
        headers.set("Accept", "application/grpc-web-text");
      }
      headers.set("X-Grpc-Web", "1");
      if (userAgent)
        headers.set("X-User-Agent", userAgent);
      if (typeof timeout === "number") {
        if (timeout <= 0) {
          throw new runtime_rpc_1.RpcError(`timeout ${timeout} ms exceeded`, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.DEADLINE_EXCEEDED]);
        }
        headers.set("grpc-timeout", `${timeout}m`);
      } else if (timeout) {
        const deadline = timeout.getTime();
        const now = Date.now();
        if (deadline <= now) {
          throw new runtime_rpc_1.RpcError(`deadline ${timeout} exceeded`, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.DEADLINE_EXCEEDED]);
        }
        headers.set("grpc-timeout", `${deadline - now}m`);
      }
      return headers;
    }
    exports.createGrpcWebRequestHeader = createGrpcWebRequestHeader;
    function createGrpcWebRequestBody(message, format) {
      let body = new Uint8Array(5 + message.length);
      body[0] = GrpcWebFrame.DATA;
      for (let msgLen = message.length, i = 4; i > 0; i--) {
        body[i] = msgLen % 256;
        msgLen >>>= 8;
      }
      body.set(message, 5);
      return format === "binary" ? body : runtime_1.base64encode(body);
    }
    exports.createGrpcWebRequestBody = createGrpcWebRequestBody;
    function readGrpcWebResponseHeader(headersOrFetchResponse, httpStatus, httpStatusText) {
      if (arguments.length === 1) {
        let fetchResponse = headersOrFetchResponse;
        let responseType;
        try {
          responseType = fetchResponse.type;
        } catch (_a) {
        }
        switch (responseType) {
          case "error":
          case "opaque":
          case "opaqueredirect":
            throw new runtime_rpc_1.RpcError(`fetch response type ${fetchResponse.type}`, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.UNKNOWN]);
        }
        return readGrpcWebResponseHeader(fetchHeadersToHttp(fetchResponse.headers), fetchResponse.status, fetchResponse.statusText);
      }
      let headers = headersOrFetchResponse, httpOk = httpStatus >= 200 && httpStatus < 300, responseMeta = parseMetadata(headers), [statusCode, statusDetail] = parseStatus(headers);
      if ((statusCode === void 0 || statusCode === goog_grpc_status_code_1.GrpcStatusCode.OK) && !httpOk) {
        statusCode = httpStatusToGrpc(httpStatus);
        statusDetail = httpStatusText;
      }
      return [statusCode, statusDetail, responseMeta];
    }
    exports.readGrpcWebResponseHeader = readGrpcWebResponseHeader;
    function readGrpcWebResponseTrailer(data) {
      let headers = parseTrailer(data), [code, detail] = parseStatus(headers), meta = parseMetadata(headers);
      return [code !== null && code !== void 0 ? code : goog_grpc_status_code_1.GrpcStatusCode.OK, detail, meta];
    }
    exports.readGrpcWebResponseTrailer = readGrpcWebResponseTrailer;
    var GrpcWebFrame;
    (function(GrpcWebFrame2) {
      GrpcWebFrame2[GrpcWebFrame2["DATA"] = 0] = "DATA";
      GrpcWebFrame2[GrpcWebFrame2["TRAILER"] = 128] = "TRAILER";
    })(GrpcWebFrame = exports.GrpcWebFrame || (exports.GrpcWebFrame = {}));
    function readGrpcWebResponseBody(stream, contentType, onFrame) {
      return __awaiter(this, void 0, void 0, function* () {
        let streamReader, base64queue = "", byteQueue = new Uint8Array(0), format = parseFormat(contentType);
        if (isReadableStream(stream)) {
          let whatWgReadableStream = stream.getReader();
          streamReader = {
            next: () => whatWgReadableStream.read()
          };
        } else {
          streamReader = stream[Symbol.asyncIterator]();
        }
        while (true) {
          let result = yield streamReader.next();
          if (result.value !== void 0) {
            if (format === "text") {
              for (let i = 0; i < result.value.length; i++)
                base64queue += String.fromCharCode(result.value[i]);
              let safeLen = base64queue.length - base64queue.length % 4;
              if (safeLen === 0)
                continue;
              byteQueue = concatBytes3(byteQueue, runtime_1.base64decode(base64queue.substring(0, safeLen)));
              base64queue = base64queue.substring(safeLen);
            } else {
              byteQueue = concatBytes3(byteQueue, result.value);
            }
            while (byteQueue.length >= 5 && byteQueue[0] === GrpcWebFrame.DATA) {
              let msgLen = 0;
              for (let i = 1; i < 5; i++)
                msgLen = (msgLen << 8) + byteQueue[i];
              if (byteQueue.length - 5 >= msgLen) {
                onFrame(GrpcWebFrame.DATA, byteQueue.subarray(5, 5 + msgLen));
                byteQueue = byteQueue.subarray(5 + msgLen);
              } else
                break;
            }
          }
          if (result.done) {
            if (byteQueue.length === 0)
              break;
            if (byteQueue[0] !== GrpcWebFrame.TRAILER || byteQueue.length < 5)
              throw new runtime_rpc_1.RpcError("premature EOF", goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.DATA_LOSS]);
            onFrame(GrpcWebFrame.TRAILER, byteQueue.subarray(5));
            break;
          }
        }
      });
    }
    exports.readGrpcWebResponseBody = readGrpcWebResponseBody;
    var isReadableStream = (s) => {
      return typeof s.getReader == "function";
    };
    function concatBytes3(a, b) {
      let n = new Uint8Array(a.length + b.length);
      n.set(a);
      n.set(b, a.length);
      return n;
    }
    function parseFormat(contentType) {
      switch (contentType) {
        case "application/grpc-web-text":
        case "application/grpc-web-text+proto":
          return "text";
        case "application/grpc-web":
        case "application/grpc-web+proto":
          return "binary";
        case void 0:
        case null:
          throw new runtime_rpc_1.RpcError("missing response content type", goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.INTERNAL]);
        default:
          throw new runtime_rpc_1.RpcError("unexpected response content type: " + contentType, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.INTERNAL]);
      }
    }
    function parseStatus(headers) {
      let code, message;
      let m = headers["grpc-message"];
      if (m !== void 0) {
        if (Array.isArray(m))
          return [goog_grpc_status_code_1.GrpcStatusCode.INTERNAL, "invalid grpc-web message"];
        message = m;
      }
      let s = headers["grpc-status"];
      if (s !== void 0) {
        if (Array.isArray(s))
          return [goog_grpc_status_code_1.GrpcStatusCode.INTERNAL, "invalid grpc-web status"];
        code = parseInt(s, 10);
        if (goog_grpc_status_code_1.GrpcStatusCode[code] === void 0)
          return [goog_grpc_status_code_1.GrpcStatusCode.INTERNAL, "invalid grpc-web status"];
      }
      return [code, message];
    }
    function parseMetadata(headers) {
      let meta = {};
      for (let [k, v] of Object.entries(headers))
        switch (k) {
          case "grpc-message":
          case "grpc-status":
          case "content-type":
            break;
          default:
            meta[k] = v;
        }
      return meta;
    }
    function parseTrailer(trailerData) {
      let headers = {};
      for (let chunk2 of String.fromCharCode.apply(String, trailerData).trim().split("\r\n")) {
        if (chunk2 == "")
          continue;
        let [key, ...val] = chunk2.split(":");
        const value = val.join(":").trim();
        key = key.trim();
        let e = headers[key];
        if (typeof e == "string")
          headers[key] = [e, value];
        else if (Array.isArray(e))
          e.push(value);
        else
          headers[key] = value;
      }
      return headers;
    }
    function fetchHeadersToHttp(fetchHeaders) {
      let headers = {};
      fetchHeaders.forEach((value, key) => {
        let e = headers[key];
        if (typeof e == "string")
          headers[key] = [e, value];
        else if (Array.isArray(e))
          e.push(value);
        else
          headers[key] = value;
      });
      return headers;
    }
    function httpStatusToGrpc(httpStatus) {
      switch (httpStatus) {
        case 200:
          return goog_grpc_status_code_1.GrpcStatusCode.OK;
        case 400:
          return goog_grpc_status_code_1.GrpcStatusCode.INVALID_ARGUMENT;
        case 401:
          return goog_grpc_status_code_1.GrpcStatusCode.UNAUTHENTICATED;
        case 403:
          return goog_grpc_status_code_1.GrpcStatusCode.PERMISSION_DENIED;
        case 404:
          return goog_grpc_status_code_1.GrpcStatusCode.NOT_FOUND;
        case 409:
          return goog_grpc_status_code_1.GrpcStatusCode.ABORTED;
        case 412:
          return goog_grpc_status_code_1.GrpcStatusCode.FAILED_PRECONDITION;
        case 429:
          return goog_grpc_status_code_1.GrpcStatusCode.RESOURCE_EXHAUSTED;
        case 499:
          return goog_grpc_status_code_1.GrpcStatusCode.CANCELLED;
        case 500:
          return goog_grpc_status_code_1.GrpcStatusCode.UNKNOWN;
        case 501:
          return goog_grpc_status_code_1.GrpcStatusCode.UNIMPLEMENTED;
        case 503:
          return goog_grpc_status_code_1.GrpcStatusCode.UNAVAILABLE;
        case 504:
          return goog_grpc_status_code_1.GrpcStatusCode.DEADLINE_EXCEEDED;
        default:
          return goog_grpc_status_code_1.GrpcStatusCode.UNKNOWN;
      }
    }
  }
});

// node_modules/@protobuf-ts/grpcweb-transport/build/commonjs/grpc-web-transport.js
var require_grpc_web_transport = __commonJS({
  "node_modules/@protobuf-ts/grpcweb-transport/build/commonjs/grpc-web-transport.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GrpcWebFetchTransport = void 0;
    var runtime_rpc_1 = require_commonjs2();
    var grpc_web_format_1 = require_grpc_web_format();
    var goog_grpc_status_code_1 = require_goog_grpc_status_code();
    var GrpcWebFetchTransport2 = class {
      constructor(defaultOptions) {
        this.defaultOptions = defaultOptions;
      }
      mergeOptions(options) {
        return runtime_rpc_1.mergeRpcOptions(this.defaultOptions, options);
      }
      /**
       * Create an URI for a gRPC web call.
       *
       * Takes the `baseUrl` option and appends:
       * - slash "/"
       * - package name
       * - dot "."
       * - service name
       * - slash "/"
       * - method name
       *
       * If the service was declared without a package, the package name and dot
       * are omitted.
       *
       * All names are used exactly like declared in .proto.
       */
      makeUrl(method, options) {
        let base = options.baseUrl;
        if (base.endsWith("/"))
          base = base.substring(0, base.length - 1);
        return `${base}/${method.service.typeName}/${method.name}`;
      }
      clientStreaming(method) {
        const e = new runtime_rpc_1.RpcError("Client streaming is not supported by grpc-web", goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.UNIMPLEMENTED]);
        e.methodName = method.name;
        e.serviceName = method.service.typeName;
        throw e;
      }
      duplex(method) {
        const e = new runtime_rpc_1.RpcError("Duplex streaming is not supported by grpc-web", goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.UNIMPLEMENTED]);
        e.methodName = method.name;
        e.serviceName = method.service.typeName;
        throw e;
      }
      serverStreaming(method, input, options) {
        var _a, _b, _c, _d, _e;
        let opt = options, format = (_a = opt.format) !== null && _a !== void 0 ? _a : "text", fetch2 = (_b = opt.fetch) !== null && _b !== void 0 ? _b : globalThis.fetch, fetchInit = (_c = opt.fetchInit) !== null && _c !== void 0 ? _c : {}, url = this.makeUrl(method, opt), inputBytes = method.I.toBinary(input, opt.binaryOptions), defHeader = new runtime_rpc_1.Deferred(), responseStream = new runtime_rpc_1.RpcOutputStreamController(), responseEmptyBody = true, maybeStatus, defStatus = new runtime_rpc_1.Deferred(), maybeTrailer, defTrailer = new runtime_rpc_1.Deferred();
        fetch2(url, Object.assign(Object.assign({}, fetchInit), {
          method: "POST",
          headers: grpc_web_format_1.createGrpcWebRequestHeader(new globalThis.Headers(), format, opt.timeout, opt.meta),
          body: grpc_web_format_1.createGrpcWebRequestBody(inputBytes, format),
          signal: (_d = options.abort) !== null && _d !== void 0 ? _d : null
          // node-fetch@3.0.0-beta.9 rejects `undefined`
        })).then((fetchResponse) => {
          let [code, detail, meta] = grpc_web_format_1.readGrpcWebResponseHeader(fetchResponse);
          defHeader.resolve(meta);
          if (code != null && code !== goog_grpc_status_code_1.GrpcStatusCode.OK)
            throw new runtime_rpc_1.RpcError(detail !== null && detail !== void 0 ? detail : goog_grpc_status_code_1.GrpcStatusCode[code], goog_grpc_status_code_1.GrpcStatusCode[code], meta);
          if (code != null)
            maybeStatus = {
              code: goog_grpc_status_code_1.GrpcStatusCode[code],
              detail: detail !== null && detail !== void 0 ? detail : goog_grpc_status_code_1.GrpcStatusCode[code]
            };
          return fetchResponse;
        }).then((fetchResponse) => {
          if (!fetchResponse.body)
            throw new runtime_rpc_1.RpcError("missing response body", goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.INTERNAL]);
          return grpc_web_format_1.readGrpcWebResponseBody(fetchResponse.body, fetchResponse.headers.get("content-type"), (type, data) => {
            switch (type) {
              case grpc_web_format_1.GrpcWebFrame.DATA:
                responseStream.notifyMessage(method.O.fromBinary(data, opt.binaryOptions));
                responseEmptyBody = false;
                break;
              case grpc_web_format_1.GrpcWebFrame.TRAILER:
                let code, detail;
                [code, detail, maybeTrailer] = grpc_web_format_1.readGrpcWebResponseTrailer(data);
                maybeStatus = {
                  code: goog_grpc_status_code_1.GrpcStatusCode[code],
                  detail: detail !== null && detail !== void 0 ? detail : goog_grpc_status_code_1.GrpcStatusCode[code]
                };
                break;
            }
          });
        }).then(() => {
          if (!maybeTrailer && !responseEmptyBody)
            throw new runtime_rpc_1.RpcError(`missing trailers`, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.DATA_LOSS]);
          if (!maybeStatus)
            throw new runtime_rpc_1.RpcError(`missing status`, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.INTERNAL]);
          if (maybeStatus.code !== "OK")
            throw new runtime_rpc_1.RpcError(maybeStatus.detail, maybeStatus.code, maybeTrailer);
          responseStream.notifyComplete();
          defStatus.resolve(maybeStatus);
          defTrailer.resolve(maybeTrailer || {});
        }).catch((reason) => {
          let error;
          if (reason instanceof runtime_rpc_1.RpcError)
            error = reason;
          else if (reason instanceof Error && reason.name === "AbortError")
            error = new runtime_rpc_1.RpcError(reason.message, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.CANCELLED]);
          else
            error = new runtime_rpc_1.RpcError(reason instanceof Error ? reason.message : "" + reason, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.INTERNAL]);
          error.methodName = method.name;
          error.serviceName = method.service.typeName;
          defHeader.rejectPending(error);
          responseStream.notifyError(error);
          defStatus.rejectPending(error);
          defTrailer.rejectPending(error);
        });
        return new runtime_rpc_1.ServerStreamingCall(method, (_e = opt.meta) !== null && _e !== void 0 ? _e : {}, input, defHeader.promise, responseStream, defStatus.promise, defTrailer.promise);
      }
      unary(method, input, options) {
        var _a, _b, _c, _d, _e;
        let opt = options, format = (_a = opt.format) !== null && _a !== void 0 ? _a : "text", fetch2 = (_b = opt.fetch) !== null && _b !== void 0 ? _b : globalThis.fetch, fetchInit = (_c = opt.fetchInit) !== null && _c !== void 0 ? _c : {}, url = this.makeUrl(method, opt), inputBytes = method.I.toBinary(input, opt.binaryOptions), defHeader = new runtime_rpc_1.Deferred(), maybeMessage, defMessage = new runtime_rpc_1.Deferred(), maybeStatus, defStatus = new runtime_rpc_1.Deferred(), maybeTrailer, defTrailer = new runtime_rpc_1.Deferred();
        fetch2(url, Object.assign(Object.assign({}, fetchInit), {
          method: "POST",
          headers: grpc_web_format_1.createGrpcWebRequestHeader(new globalThis.Headers(), format, opt.timeout, opt.meta),
          body: grpc_web_format_1.createGrpcWebRequestBody(inputBytes, format),
          signal: (_d = options.abort) !== null && _d !== void 0 ? _d : null
          // node-fetch@3.0.0-beta.9 rejects `undefined`
        })).then((fetchResponse) => {
          let [code, detail, meta] = grpc_web_format_1.readGrpcWebResponseHeader(fetchResponse);
          defHeader.resolve(meta);
          if (code != null && code !== goog_grpc_status_code_1.GrpcStatusCode.OK)
            throw new runtime_rpc_1.RpcError(detail !== null && detail !== void 0 ? detail : goog_grpc_status_code_1.GrpcStatusCode[code], goog_grpc_status_code_1.GrpcStatusCode[code], meta);
          if (code != null)
            maybeStatus = {
              code: goog_grpc_status_code_1.GrpcStatusCode[code],
              detail: detail !== null && detail !== void 0 ? detail : goog_grpc_status_code_1.GrpcStatusCode[code]
            };
          return fetchResponse;
        }).then((fetchResponse) => {
          if (!fetchResponse.body)
            throw new runtime_rpc_1.RpcError("missing response body", goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.INTERNAL]);
          return grpc_web_format_1.readGrpcWebResponseBody(fetchResponse.body, fetchResponse.headers.get("content-type"), (type, data) => {
            switch (type) {
              case grpc_web_format_1.GrpcWebFrame.DATA:
                if (maybeMessage)
                  throw new runtime_rpc_1.RpcError(`unary call received 2nd message`, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.DATA_LOSS]);
                maybeMessage = method.O.fromBinary(data, opt.binaryOptions);
                break;
              case grpc_web_format_1.GrpcWebFrame.TRAILER:
                let code, detail;
                [code, detail, maybeTrailer] = grpc_web_format_1.readGrpcWebResponseTrailer(data);
                maybeStatus = {
                  code: goog_grpc_status_code_1.GrpcStatusCode[code],
                  detail: detail !== null && detail !== void 0 ? detail : goog_grpc_status_code_1.GrpcStatusCode[code]
                };
                break;
            }
          });
        }).then(() => {
          if (!maybeTrailer && maybeMessage)
            throw new runtime_rpc_1.RpcError(`missing trailers`, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.DATA_LOSS]);
          if (!maybeStatus)
            throw new runtime_rpc_1.RpcError(`missing status`, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.INTERNAL]);
          if (!maybeMessage && maybeStatus.code === "OK")
            throw new runtime_rpc_1.RpcError("expected error status", goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.DATA_LOSS]);
          if (!maybeMessage)
            throw new runtime_rpc_1.RpcError(maybeStatus.detail, maybeStatus.code, maybeTrailer);
          defMessage.resolve(maybeMessage);
          if (maybeStatus.code !== "OK")
            throw new runtime_rpc_1.RpcError(maybeStatus.detail, maybeStatus.code, maybeTrailer);
          defStatus.resolve(maybeStatus);
          defTrailer.resolve(maybeTrailer || {});
        }).catch((reason) => {
          let error;
          if (reason instanceof runtime_rpc_1.RpcError)
            error = reason;
          else if (reason instanceof Error && reason.name === "AbortError")
            error = new runtime_rpc_1.RpcError(reason.message, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.CANCELLED]);
          else
            error = new runtime_rpc_1.RpcError(reason instanceof Error ? reason.message : "" + reason, goog_grpc_status_code_1.GrpcStatusCode[goog_grpc_status_code_1.GrpcStatusCode.INTERNAL]);
          error.methodName = method.name;
          error.serviceName = method.service.typeName;
          defHeader.rejectPending(error);
          defMessage.rejectPending(error);
          defStatus.rejectPending(error);
          defTrailer.rejectPending(error);
        });
        return new runtime_rpc_1.UnaryCall(method, (_e = opt.meta) !== null && _e !== void 0 ? _e : {}, input, defHeader.promise, defMessage.promise, defStatus.promise, defTrailer.promise);
      }
    };
    exports.GrpcWebFetchTransport = GrpcWebFetchTransport2;
  }
});

// node_modules/@protobuf-ts/grpcweb-transport/build/commonjs/index.js
var require_commonjs3 = __commonJS({
  "node_modules/@protobuf-ts/grpcweb-transport/build/commonjs/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var grpc_web_transport_1 = require_grpc_web_transport();
    Object.defineProperty(exports, "GrpcWebFetchTransport", { enumerable: true, get: function() {
      return grpc_web_transport_1.GrpcWebFetchTransport;
    } });
    var grpc_web_format_1 = require_grpc_web_format();
    Object.defineProperty(exports, "readGrpcWebResponseTrailer", { enumerable: true, get: function() {
      return grpc_web_format_1.readGrpcWebResponseTrailer;
    } });
    Object.defineProperty(exports, "createGrpcWebRequestHeader", { enumerable: true, get: function() {
      return grpc_web_format_1.createGrpcWebRequestHeader;
    } });
    Object.defineProperty(exports, "GrpcWebFrame", { enumerable: true, get: function() {
      return grpc_web_format_1.GrpcWebFrame;
    } });
    Object.defineProperty(exports, "createGrpcWebRequestBody", { enumerable: true, get: function() {
      return grpc_web_format_1.createGrpcWebRequestBody;
    } });
    Object.defineProperty(exports, "readGrpcWebResponseBody", { enumerable: true, get: function() {
      return grpc_web_format_1.readGrpcWebResponseBody;
    } });
    Object.defineProperty(exports, "readGrpcWebResponseHeader", { enumerable: true, get: function() {
      return grpc_web_format_1.readGrpcWebResponseHeader;
    } });
    var goog_grpc_status_code_1 = require_goog_grpc_status_code();
    Object.defineProperty(exports, "GrpcStatusCode", { enumerable: true, get: function() {
      return goog_grpc_status_code_1.GrpcStatusCode;
    } });
  }
});

// keeper.mjs
import { existsSync, readFileSync } from "node:fs";

// node_modules/@mysten/sui/dist/client/protocol-version.mjs
var CLIENT_PROTOCOL_VERSION_HEADER = "x-sui-client-protocol-version";
var MAX_PROTOCOL_VERSION = 141;

// node_modules/@mysten/sui/dist/grpc/transport.mjs
var import_runtime_rpc = __toESM(require_commonjs2(), 1);
var import_grpcweb_transport = __toESM(require_commonjs3(), 1);
var MESSAGE_DECODED = /* @__PURE__ */ Symbol.for("@mysten/sui/grpc/decoded-status-message");
function decodeGrpcStatusMessage(message) {
  if (!message.includes("%")) return message;
  try {
    return decodeURIComponent(message);
  } catch {
    return message;
  }
}
function markStatusMessageRead(error) {
  if (MESSAGE_DECODED in error) return false;
  Object.defineProperty(error, MESSAGE_DECODED, {
    value: true,
    configurable: true
  });
  return true;
}
function decodeStatusMessageOnce(error) {
  if (markStatusMessageRead(error)) error.message = decodeGrpcStatusMessage(error.message);
}
function hasDecodedStatusMessage(error) {
  return MESSAGE_DECODED in error;
}
function readProperty(value, key) {
  if (typeof value !== "object" || value === null) return void 0;
  try {
    return value[key];
  } catch {
    return;
  }
}
function abortStatus(reason) {
  const code = readProperty(reason, "code");
  if (typeof code === "string" && typeof import_grpcweb_transport.GrpcStatusCode[code] === "number") return code;
  return readProperty(reason, "name") === "TimeoutError" ? import_grpcweb_transport.GrpcStatusCode[import_grpcweb_transport.GrpcStatusCode.DEADLINE_EXCEEDED] : import_grpcweb_transport.GrpcStatusCode[import_grpcweb_transport.GrpcStatusCode.CANCELLED];
}
function isAbortReasonText(message, reason) {
  if (typeof reason === "string") return message === reason;
  const reasonMessage = readProperty(reason, "message");
  return typeof reasonMessage === "string" && message === reasonMessage;
}
function normalizeGrpcError(error, signal) {
  try {
    normalize(error, signal);
  } catch {
  }
}
function normalize(error, signal) {
  if (!(error instanceof import_runtime_rpc.RpcError)) return;
  if (signal?.aborted && (error.code === import_grpcweb_transport.GrpcStatusCode[import_grpcweb_transport.GrpcStatusCode.INTERNAL] || error.code === import_grpcweb_transport.GrpcStatusCode[import_grpcweb_transport.GrpcStatusCode.CANCELLED])) {
    error.code = abortStatus(signal.reason);
    if (isAbortReasonText(error.message, signal.reason)) markStatusMessageRead(error);
    else decodeStatusMessageOnce(error);
    return;
  }
  decodeStatusMessageOnce(error);
}
function normalizeRejections(promises, signal) {
  for (const promise of promises) promise.then(void 0, (error) => normalizeGrpcError(error, signal));
}
var GrpcWebFetchTransport$1 = class extends import_grpcweb_transport.GrpcWebFetchTransport {
  constructor(options) {
    super({
      ...options,
      meta: {
        [CLIENT_PROTOCOL_VERSION_HEADER]: String(MAX_PROTOCOL_VERSION),
        ...options.meta
      }
    });
  }
  unary(method, input, options) {
    const call = super.unary(method, input, options);
    normalizeRejections([
      call.headers,
      call.response,
      call.status,
      call.trailers
    ], options.abort);
    return call;
  }
  serverStreaming(method, input, options) {
    const call = super.serverStreaming(method, input, options);
    call.responses.onError((error) => normalizeGrpcError(error, options.abort));
    normalizeRejections([
      call.headers,
      call.status,
      call.trailers
    ], options.abort);
    return call;
  }
};
function withClientProtocolVersion(transport) {
  return {
    mergeOptions(options) {
      const merged = transport.mergeOptions(options);
      return {
        ...merged,
        meta: {
          [CLIENT_PROTOCOL_VERSION_HEADER]: String(MAX_PROTOCOL_VERSION),
          ...merged.meta
        }
      };
    },
    unary: transport.unary.bind(transport),
    serverStreaming: transport.serverStreaming.bind(transport),
    clientStreaming: transport.clientStreaming.bind(transport),
    duplex: transport.duplex.bind(transport)
  };
}

// node_modules/@mysten/sui/dist/utils/suins.mjs
var SUI_NS_NAME_REGEX = /^(?!.*(^(?!@)|[-.@])($|[-.@]))(?:[a-z0-9-]{0,63}(?:\.[a-z0-9-]{0,63})*)?@[a-z0-9-]{0,63}$/i;
var SUI_NS_DOMAIN_REGEX = /^(?!.*(^|[-.])($|[-.]))(?:[a-z0-9-]{0,63}\.)+sui$/i;
var MAX_SUI_NS_NAME_LENGTH = 235;
function isValidSuiNSName(name) {
  if (name.length > MAX_SUI_NS_NAME_LENGTH) return false;
  if (name.includes("@")) return SUI_NS_NAME_REGEX.test(name);
  return SUI_NS_DOMAIN_REGEX.test(name);
}

// node_modules/@mysten/sui/dist/utils/named-packages.mjs
var NAME_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*)$/;
var VERSION_REGEX = /^\d+$/;
var MAX_APP_SIZE = 64;
var NAME_SEPARATOR = "/";
var isValidNamedPackage = (name) => {
  const parts = name.split(NAME_SEPARATOR);
  if (parts.length < 2 || parts.length > 3) return false;
  const [org, app, version] = parts;
  if (version !== void 0 && !VERSION_REGEX.test(version)) return false;
  if (!isValidSuiNSName(org)) return false;
  return NAME_PATTERN.test(app) && app.length < MAX_APP_SIZE;
};

// node_modules/@mysten/bcs/dist/reader.mjs
var BcsReader = class {
  /**
  * @param {Uint8Array} data Data to use as a buffer.
  */
  constructor(data) {
    this.bytePosition = 0;
    this.dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
    this.bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  /**
  * Shift current cursor position by `bytes`.
  *
  * @param {Number} bytes Number of bytes to
  * @returns {this} Self for possible chaining.
  */
  shift(bytes) {
    this.bytePosition += bytes;
    return this;
  }
  /**
  * Read U8 value from the buffer and shift cursor by 1.
  * @returns
  */
  read8() {
    const position = this.bytePosition;
    if (position >= this.bytes.length) throw new RangeError("Offset is outside the bounds of the DataView");
    this.bytePosition = position + 1;
    return this.bytes[position];
  }
  /**
  * Read U16 value from the buffer and shift cursor by 2.
  * @returns
  */
  read16() {
    const value = this.dataView.getUint16(this.bytePosition, true);
    this.shift(2);
    return value;
  }
  /**
  * Read U32 value from the buffer and shift cursor by 4.
  * @returns
  */
  read32() {
    const value = this.dataView.getUint32(this.bytePosition, true);
    this.shift(4);
    return value;
  }
  /**
  * Read U64 value from the buffer and shift cursor by 8.
  * @returns
  */
  read64() {
    const value = this.dataView.getBigUint64(this.bytePosition, true);
    this.shift(8);
    return value.toString(10);
  }
  /**
  * Read U128 value from the buffer and shift cursor by 16.
  */
  read128() {
    const value1 = BigInt(this.read64());
    const result = BigInt(this.read64()).toString(16) + value1.toString(16).padStart(16, "0");
    return BigInt("0x" + result).toString(10);
  }
  /**
  * Read U128 value from the buffer and shift cursor by 32.
  * @returns
  */
  read256() {
    const value1 = BigInt(this.read128());
    const result = BigInt(this.read128()).toString(16) + value1.toString(16).padStart(32, "0");
    return BigInt("0x" + result).toString(10);
  }
  /**
  * Read `num` number of bytes from the buffer and shift cursor by `num`.
  * @param num Number of bytes to read.
  */
  readBytes(num) {
    if (this.bytePosition + num > this.bytes.length) throw new RangeError("Offset is outside the bounds of the DataView");
    const start = this.bytePosition + this.dataView.byteOffset;
    const value = new Uint8Array(this.dataView.buffer, start, num);
    this.shift(num);
    return value;
  }
  /**
  * Read ULEB value - an integer of varying size. Used for enum indexes and
  * vector lengths.
  * @returns {Number} The ULEB value.
  */
  readULEB() {
    const bytes = this.bytes;
    let position = this.bytePosition;
    let value = 0;
    let multiplier = 1;
    while (true) {
      if (position >= bytes.length) throw new Error("ULEB decode error: buffer overflow");
      const byte = bytes[position++];
      value += (byte & 127) * multiplier;
      if ((byte & 128) === 0) {
        if (byte === 0 && position - this.bytePosition > 1) throw new Error("ULEB decode error: non-canonical encoding");
        break;
      }
      multiplier *= 128;
    }
    if (!(value <= Number.MAX_SAFE_INTEGER)) throw new Error("ULEB decode error: value exceeds MAX_SAFE_INTEGER");
    this.bytePosition = position;
    return value;
  }
  /**
  * Read a BCS vector: read a length and then apply function `cb` X times
  * where X is the length of the vector, defined as ULEB in BCS bytes.
  * @param cb Callback to process elements of vector.
  * @returns {Array<Any>} Array of the resulting values, returned by callback.
  */
  readVec(cb) {
    const length = this.readULEB();
    const result = [];
    for (let i = 0; i < length; i++) result.push(cb(this, i, length));
    return result;
  }
};

// node_modules/@mysten/utils/dist/b58.mjs
var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var ALPHABET_CODES = Array.from(ALPHABET, (char) => char.charCodeAt(0));
var DIGIT_VALUES = new Int8Array(128).fill(-1);
for (let i = 0; i < 58; i++) DIGIT_VALUES[ALPHABET.charCodeAt(i)] = i;
var B58_5 = 58 ** 5;
function isBytes(value) {
  return value instanceof Uint8Array || ArrayBuffer.isView(value) && value.constructor.name === "Uint8Array" && value.BYTES_PER_ELEMENT === 1;
}
function toBase58(buffer) {
  if (!isBytes(buffer)) throw new TypeError("toBase58 expects a Uint8Array");
  const length = buffer.length;
  let zeros = 0;
  while (zeros < length && buffer[zeros] === 0) zeros++;
  const limbs = [];
  let i = zeros;
  if ((length - zeros) % 2 === 1) limbs.push(buffer[i++]);
  for (; i < length; i += 2) {
    let carry = buffer[i] * 256 + buffer[i + 1];
    for (let j = 0; j < limbs.length; j++) {
      const x = limbs[j] * 65536 + carry;
      carry = Math.floor(x / B58_5);
      limbs[j] = x - carry * B58_5;
    }
    while (carry > 0) {
      const next = Math.floor(carry / B58_5);
      limbs.push(carry - next * B58_5);
      carry = next;
    }
  }
  const digits = [];
  for (let k = 0; k < zeros; k++) digits.push(ALPHABET_CODES[0]);
  for (let j = limbs.length - 1; j >= 0; j--) {
    let limb = limbs[j];
    const start = digits.length;
    const width = j === limbs.length - 1 ? 0 : 5;
    for (let k = 0; k < 5 && (limb > 0 || k < width); k++) {
      const next = Math.floor(limb / 58);
      digits.push(ALPHABET_CODES[limb - next * 58]);
      limb = next;
    }
    for (let a = start, b = digits.length - 1; a < b; a++, b--) {
      const tmp = digits[a];
      digits[a] = digits[b];
      digits[b] = tmp;
    }
  }
  let result = "";
  for (let start = 0; start < digits.length; start += 8192) result += String.fromCharCode.apply(null, digits.slice(start, start + 8192));
  return result;
}
function fromBase58(str) {
  if (typeof str !== "string") throw new TypeError("fromBase58 expects a string");
  const length = str.length;
  let zeros = 0;
  while (zeros < length && str.charCodeAt(zeros) === 49) zeros++;
  const limbs = [];
  let i = zeros;
  const head = (length - zeros) % 5;
  while (i < length) {
    const chunkLength = i === zeros && head !== 0 ? head : 5;
    let carry = 0;
    let multiplier = 1;
    for (let k = 0; k < chunkLength; k++) {
      const code = str.charCodeAt(i + k);
      const digit = code < 128 ? DIGIT_VALUES[code] : -1;
      if (digit < 0) throw new Error(`Invalid base58 character "${str[i + k]}"`);
      carry = carry * 58 + digit;
      multiplier *= 58;
    }
    i += chunkLength;
    for (let j = 0; j < limbs.length; j++) {
      const x = limbs[j] * multiplier + carry;
      carry = Math.floor(x / 65536);
      limbs[j] = x - carry * 65536;
    }
    while (carry > 0) {
      limbs.push(carry % 65536);
      carry = Math.floor(carry / 65536);
    }
  }
  let byteLength = limbs.length * 2;
  if (byteLength > 0 && limbs[limbs.length - 1] < 256) byteLength--;
  const out = new Uint8Array(zeros + byteLength);
  let pos = out.length - 1;
  for (let j = 0; j < limbs.length; j++) {
    out[pos--] = limbs[j] & 255;
    if (pos >= zeros) out[pos--] = limbs[j] >> 8;
  }
  return out;
}

// node_modules/@mysten/utils/dist/b64.mjs
function fromBase64(base64String2) {
  const binary = atob(base64String2);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
var CHUNK_SIZE = 8192;
function toBase64(bytes) {
  if (bytes.length <= CHUNK_SIZE) return btoa(String.fromCharCode.apply(null, bytes));
  let output = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk2 = bytes.slice(i, i + CHUNK_SIZE);
    output += String.fromCharCode.apply(null, chunk2);
  }
  return btoa(output);
}

// node_modules/@mysten/utils/dist/hex.mjs
function fromHex(hexStr) {
  const normalized = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
  const padded = normalized.length % 2 === 0 ? normalized : `0${normalized}`;
  const bytes = new Uint8Array(padded.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const high = hexDigit(padded.charCodeAt(i * 2));
    const low = hexDigit(padded.charCodeAt(i * 2 + 1));
    if (high < 0 || low < 0) throw new Error(`Invalid hex string ${hexStr}`);
    bytes[i] = high * 16 + low;
  }
  return bytes;
}
function hexDigit(code) {
  if (code >= 48 && code <= 57) return code - 48;
  if (code >= 97 && code <= 102) return code - 87;
  if (code >= 65 && code <= 70) return code - 55;
  return -1;
}
var HEX_BYTES = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function toHex(bytes) {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += HEX_BYTES[bytes[i]];
  return hex;
}

// node_modules/@mysten/utils/dist/chunk.mjs
function chunk(array2, size) {
  return Array.from({ length: Math.ceil(array2.length / size) }, (_, i) => {
    return array2.slice(i * size, (i + 1) * size);
  });
}

// node_modules/@mysten/utils/dist/dataloader.mjs
var DataLoader = class {
  constructor(batchLoadFn, options) {
    if (typeof batchLoadFn !== "function") throw new TypeError(`DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but got: ${batchLoadFn}.`);
    this._batchLoadFn = batchLoadFn;
    this._maxBatchSize = getValidMaxBatchSize(options);
    this._batchScheduleFn = getValidBatchScheduleFn(options);
    this._cacheKeyFn = getValidCacheKeyFn(options);
    this._cacheMap = getValidCacheMap(options);
    this._batch = null;
    this.name = getValidName(options);
  }
  /**
  * Loads a key, returning a `Promise` for the value represented by that key.
  */
  load(key) {
    if (key === null || key === void 0) throw new TypeError(`The loader.load() function must be called with a value, but got: ${String(key)}.`);
    const batch = getCurrentBatch(this);
    const cacheMap = this._cacheMap;
    let cacheKey;
    if (cacheMap) {
      cacheKey = this._cacheKeyFn(key);
      const cachedPromise = cacheMap.get(cacheKey);
      if (cachedPromise) {
        const cacheHits = batch.cacheHits || (batch.cacheHits = []);
        return new Promise((resolve) => {
          cacheHits.push(() => {
            resolve(cachedPromise);
          });
        });
      }
    }
    batch.keys.push(key);
    const promise = new Promise((resolve, reject) => {
      batch.callbacks.push({
        resolve,
        reject
      });
    });
    if (cacheMap) cacheMap.set(cacheKey, promise);
    return promise;
  }
  /**
  * Loads multiple keys, promising an array of values:
  *
  *     var [ a, b ] = await myLoader.loadMany([ 'a', 'b' ]);
  *
  * This is similar to the more verbose:
  *
  *     var [ a, b ] = await Promise.all([
  *       myLoader.load('a'),
  *       myLoader.load('b')
  *     ]);
  *
  * However it is different in the case where any load fails. Where
  * Promise.all() would reject, loadMany() always resolves, however each result
  * is either a value or an Error instance.
  *
  *     var [ a, b, c ] = await myLoader.loadMany([ 'a', 'b', 'badkey' ]);
  *     // c instanceof Error
  *
  */
  loadMany(keys) {
    if (!isArrayLike(keys)) throw new TypeError(`The loader.loadMany() function must be called with Array<key>, but got: ${keys}.`);
    const loadPromises = [];
    for (let i = 0; i < keys.length; i++) loadPromises.push(this.load(keys[i]).catch((error) => error));
    return Promise.all(loadPromises);
  }
  /**
  * Clears the value at `key` from the cache, if it exists. Returns itself for
  * method chaining.
  */
  clear(key) {
    const cacheMap = this._cacheMap;
    if (cacheMap) {
      const cacheKey = this._cacheKeyFn(key);
      cacheMap.delete(cacheKey);
    }
    return this;
  }
  /**
  * Clears the entire cache. To be used when some event results in unknown
  * invalidations across this particular `DataLoader`. Returns itself for
  * method chaining.
  */
  clearAll() {
    const cacheMap = this._cacheMap;
    if (cacheMap) cacheMap.clear();
    return this;
  }
  /**
  * Adds the provided key and value to the cache. If the key already
  * exists, no change is made. Returns itself for method chaining.
  *
  * To prime the cache with an error at a key, provide an Error instance.
  */
  prime(key, value) {
    const cacheMap = this._cacheMap;
    if (cacheMap) {
      const cacheKey = this._cacheKeyFn(key);
      if (cacheMap.get(cacheKey) === void 0) {
        let promise;
        if (value instanceof Error) {
          promise = Promise.reject(value);
          promise.catch(() => {
          });
        } else promise = Promise.resolve(value);
        cacheMap.set(cacheKey, promise);
      }
    }
    return this;
  }
};
var enqueuePostPromiseJob = typeof process === "object" && typeof process.nextTick === "function" ? function(fn) {
  if (!resolvedPromise) resolvedPromise = Promise.resolve();
  resolvedPromise.then(() => {
    process.nextTick(fn);
  });
} : typeof setImmediate === "function" ? function(fn) {
  setImmediate(fn);
} : function(fn) {
  setTimeout(fn);
};
var resolvedPromise;
function getCurrentBatch(loader) {
  const existingBatch = loader._batch;
  if (existingBatch !== null && !existingBatch.hasDispatched && existingBatch.keys.length < loader._maxBatchSize) return existingBatch;
  const newBatch = {
    hasDispatched: false,
    keys: [],
    callbacks: []
  };
  loader._batch = newBatch;
  loader._batchScheduleFn(() => {
    dispatchBatch(loader, newBatch);
  });
  return newBatch;
}
function dispatchBatch(loader, batch) {
  batch.hasDispatched = true;
  if (batch.keys.length === 0) {
    resolveCacheHits(batch);
    return;
  }
  let batchPromise;
  try {
    batchPromise = loader._batchLoadFn(batch.keys);
  } catch (e) {
    return failedDispatch(loader, batch, /* @__PURE__ */ new TypeError(`DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function errored synchronously: ${String(e)}.`));
  }
  if (!batchPromise || typeof batchPromise.then !== "function") return failedDispatch(loader, batch, /* @__PURE__ */ new TypeError(`DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did not return a Promise: ${String(batchPromise)}.`));
  Promise.resolve(batchPromise).then((values) => {
    if (!isArrayLike(values)) throw new TypeError(`DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did not return a Promise of an Array: ${String(values)}.`);
    if (values.length !== batch.keys.length) throw new TypeError(`DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did not return a Promise of an Array of the same length as the Array of keys.

Keys:
${String(batch.keys)}

Values:
${String(values)}`);
    resolveCacheHits(batch);
    for (let i = 0; i < batch.callbacks.length; i++) {
      const value = values[i];
      if (value instanceof Error) batch.callbacks[i].reject(value);
      else batch.callbacks[i].resolve(value);
    }
  }).catch((error) => {
    failedDispatch(loader, batch, error);
  });
}
function failedDispatch(loader, batch, error) {
  resolveCacheHits(batch);
  for (let i = 0; i < batch.keys.length; i++) {
    loader.clear(batch.keys[i]);
    batch.callbacks[i].reject(error);
  }
}
function resolveCacheHits(batch) {
  if (batch.cacheHits) for (let i = 0; i < batch.cacheHits.length; i++) batch.cacheHits[i]();
}
function getValidMaxBatchSize(options) {
  if (!(!options || options.batch !== false)) return 1;
  const maxBatchSize = options && options.maxBatchSize;
  if (maxBatchSize === void 0) return Infinity;
  if (typeof maxBatchSize !== "number" || maxBatchSize < 1) throw new TypeError(`maxBatchSize must be a positive number: ${maxBatchSize}`);
  return maxBatchSize;
}
function getValidBatchScheduleFn(options) {
  const batchScheduleFn = options && options.batchScheduleFn;
  if (batchScheduleFn === void 0) return enqueuePostPromiseJob;
  if (typeof batchScheduleFn !== "function") throw new TypeError(`batchScheduleFn must be a function: ${batchScheduleFn}`);
  return batchScheduleFn;
}
function getValidCacheKeyFn(options) {
  const cacheKeyFn = options && options.cacheKeyFn;
  if (cacheKeyFn === void 0) return (key) => key;
  if (typeof cacheKeyFn !== "function") throw new TypeError(`cacheKeyFn must be a function: ${cacheKeyFn}`);
  return cacheKeyFn;
}
function getValidCacheMap(options) {
  if (!(!options || options.cache !== false)) return null;
  const cacheMap = options && options.cacheMap;
  if (cacheMap === void 0) return /* @__PURE__ */ new Map();
  if (cacheMap !== null) {
    const missingFunctions = [
      "get",
      "set",
      "delete",
      "clear"
    ].filter((fnName) => cacheMap && typeof cacheMap[fnName] !== "function");
    if (missingFunctions.length !== 0) throw new TypeError("Custom cacheMap missing methods: " + missingFunctions.join(", "));
  }
  return cacheMap;
}
function getValidName(options) {
  if (options && options.name) return options.name;
  return null;
}
function isArrayLike(x) {
  return typeof x === "object" && x !== null && "length" in x && typeof x.length === "number" && (x.length === 0 || x.length > 0 && Object.prototype.hasOwnProperty.call(x, x.length - 1));
}

// node_modules/@mysten/bcs/dist/utils.mjs
function encodeStr(data, encoding) {
  switch (encoding) {
    case "base58":
      return toBase58(data);
    case "base64":
      return toBase64(data);
    case "hex":
      return toHex(data);
    default:
      throw new Error("Unsupported encoding, supported values are: base64, hex");
  }
}
function splitGenericParameters(str, genericSeparators = ["<", ">"]) {
  const [left, right] = genericSeparators;
  const tok = [];
  let word = "";
  let nestedAngleBrackets = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === left) nestedAngleBrackets++;
    if (char === right) nestedAngleBrackets--;
    if (nestedAngleBrackets === 0 && char === ",") {
      tok.push(word.trim());
      word = "";
      continue;
    }
    word += char;
  }
  tok.push(word.trim());
  return tok;
}

// node_modules/@mysten/bcs/dist/uleb.mjs
function ulebEncode(num) {
  let bigNum = BigInt(num);
  const arr = [];
  let len = 0;
  if (bigNum === 0n) return [0];
  while (bigNum > 0) {
    arr[len] = Number(bigNum & 127n);
    bigNum >>= 7n;
    if (bigNum > 0n) arr[len] |= 128;
    len += 1;
  }
  return arr;
}

// node_modules/@mysten/bcs/dist/writer.mjs
var BcsWriter = class {
  constructor({ initialSize = 1024, maxSize = Infinity, allocateSize = 1024 } = {}) {
    this.bytePosition = 0;
    this.size = initialSize;
    this.maxSize = maxSize;
    this.allocateSize = allocateSize;
    this.dataView = new DataView(new ArrayBuffer(initialSize));
    this.bytes = new Uint8Array(this.dataView.buffer);
  }
  ensureSizeOrGrow(bytes) {
    const requiredSize = this.bytePosition + bytes;
    if (requiredSize > this.size) {
      const nextSize = Math.min(this.maxSize, Math.max(this.size + requiredSize, this.size + this.allocateSize));
      if (requiredSize > nextSize) throw new Error(`Attempting to serialize to BCS, but buffer does not have enough size. Allocated size: ${this.size}, Max size: ${this.maxSize}, Required size: ${requiredSize}`);
      this.size = nextSize;
      const nextBuffer = new ArrayBuffer(this.size);
      const nextBytes = new Uint8Array(nextBuffer);
      nextBytes.set(this.bytes);
      this.dataView = new DataView(nextBuffer);
      this.bytes = nextBytes;
    }
  }
  /**
  * Shift current cursor position by `bytes`.
  *
  * @param {Number} bytes Number of bytes to
  * @returns {this} Self for possible chaining.
  */
  shift(bytes) {
    this.bytePosition += bytes;
    return this;
  }
  /**
  * Write a U8 value into a buffer and shift cursor position by 1.
  * @param {Number} value Value to write.
  * @returns {this}
  */
  write8(value) {
    this.ensureSizeOrGrow(1);
    this.bytes[this.bytePosition] = Number(value);
    return this.shift(1);
  }
  /**
  * Write a U8 value into a buffer and shift cursor position by 1.
  * @param {Number} value Value to write.
  * @returns {this}
  */
  writeBytes(bytes) {
    this.ensureSizeOrGrow(bytes.length);
    this.bytes.set(bytes, this.bytePosition);
    return this.shift(bytes.length);
  }
  /**
  * Write a U16 value into a buffer and shift cursor position by 2.
  * @param {Number} value Value to write.
  * @returns {this}
  */
  write16(value) {
    this.ensureSizeOrGrow(2);
    this.dataView.setUint16(this.bytePosition, Number(value), true);
    return this.shift(2);
  }
  /**
  * Write a U32 value into a buffer and shift cursor position by 4.
  * @param {Number} value Value to write.
  * @returns {this}
  */
  write32(value) {
    this.ensureSizeOrGrow(4);
    this.dataView.setUint32(this.bytePosition, Number(value), true);
    return this.shift(4);
  }
  /**
  * Write a U64 value into a buffer and shift cursor position by 8.
  * @param {bigint} value Value to write.
  * @returns {this}
  */
  write64(value) {
    return this.writeBigLittleEndian(BigInt(value), 8);
  }
  /**
  * Write a U128 value into a buffer and shift cursor position by 16.
  *
  * @param {bigint} value Value to write.
  * @returns {this}
  */
  write128(value) {
    return this.writeBigLittleEndian(BigInt(value), 16);
  }
  /**
  * Write a U256 value into a buffer and shift cursor position by 16.
  *
  * @param {bigint} value Value to write.
  * @returns {this}
  */
  write256(value) {
    return this.writeBigLittleEndian(BigInt(value), 32);
  }
  writeBigLittleEndian(value, size) {
    this.ensureSizeOrGrow(size);
    let remaining = value > 0n ? value : 0n;
    for (let offset = 0; offset < size; offset += 8) {
      this.dataView.setBigUint64(this.bytePosition + offset, BigInt.asUintN(64, remaining), true);
      remaining >>= 64n;
    }
    return this.shift(size);
  }
  /**
  * Write a ULEB value into a buffer and shift cursor position by number of bytes
  * written.
  * @param {Number} value Value to write.
  * @returns {this}
  */
  writeULEB(value) {
    if (value >= 0 && Number.isSafeInteger(value)) {
      let remaining = value;
      while (remaining >= 128) {
        this.write8(remaining % 128 | 128);
        remaining = Math.floor(remaining / 128);
      }
      return this.write8(remaining);
    }
    ulebEncode(value).forEach((el) => this.write8(el));
    return this;
  }
  /**
  * Write a vector into a buffer by first writing the vector length and then calling
  * a callback on each passed value.
  *
  * @param {Array<Any>} vector Array of elements to write.
  * @param {WriteVecCb} cb Callback to call on each element of the vector.
  * @returns {this}
  */
  writeVec(vector2, cb) {
    this.writeULEB(vector2.length);
    Array.from(vector2).forEach((el, i) => cb(this, el, i, vector2.length));
    return this;
  }
  /**
  * Adds support for iterations over the object.
  * @returns {Uint8Array}
  */
  *[Symbol.iterator]() {
    for (let i = 0; i < this.bytePosition; i++) yield this.dataView.getUint8(i);
    return this.toBytes();
  }
  /**
  * Get underlying buffer taking only value bytes (in case initial buffer size was bigger).
  * @returns {Uint8Array} Resulting bcs.
  */
  toBytes() {
    return new Uint8Array(this.dataView.buffer.slice(0, this.bytePosition));
  }
  /**
  * Represent data as 'hex' or 'base64'
  * @param encoding Encoding to use: 'base64' or 'hex'
  */
  toString(encoding) {
    return encodeStr(this.toBytes(), encoding);
  }
};

// node_modules/@mysten/bcs/dist/bcs-type.mjs
var BcsType = class BcsType2 {
  #write;
  #serialize;
  #validatedWrite = null;
  #validatedSerialize = null;
  #transformValidate = null;
  constructor(options) {
    this.name = options.name;
    this.read = options.read;
    this.serializedSize = options.serializedSize ?? (() => null);
    this.#write = options.write;
    this.#serialize = options.serialize ?? ((value, options$1) => {
      const writer = new BcsWriter({
        initialSize: this.serializedSize(value) ?? void 0,
        ...options$1
      });
      this.#write(value, writer);
      return writer.toBytes();
    });
    this.validate = options.validate ?? (() => {
    });
  }
  write(value, writer) {
    if (this.#validatedWrite && this.validate === this.#transformValidate) {
      this.#validatedWrite(value, writer);
      return;
    }
    this.validate(value);
    this.#write(value, writer);
  }
  serialize(value, options) {
    if (this.#validatedSerialize && this.validate === this.#transformValidate) return new SerializedBcs(this, this.#validatedSerialize(value, options));
    this.validate(value);
    return new SerializedBcs(this, this.#serialize(value, options));
  }
  parse(bytes) {
    const reader = new BcsReader(bytes);
    return this.read(reader);
  }
  fromHex(hex) {
    return this.parse(fromHex(hex));
  }
  fromBase58(b64) {
    return this.parse(fromBase58(b64));
  }
  fromBase64(b64) {
    return this.parse(fromBase64(b64));
  }
  transform({ name, input, output, validate: validate2 }) {
    const type = new BcsType2({
      name: name ?? this.name,
      read: (reader) => output ? output(this.read(reader)) : this.read(reader),
      write: (value, writer) => this.#write(input ? input(value) : value, writer),
      serializedSize: (value) => this.serializedSize(input ? input(value) : value),
      serialize: (value, options) => this.#serialize(input ? input(value) : value, options),
      validate: (value) => {
        validate2?.(value);
        this.validate(input ? input(value) : value);
      }
    });
    type.#transformValidate = type.validate;
    type.#validatedWrite = (value, writer) => {
      validate2?.(value);
      const converted = input ? input(value) : value;
      this.validate(converted);
      this.#write(converted, writer);
    };
    type.#validatedSerialize = (value, options) => {
      validate2?.(value);
      const converted = input ? input(value) : value;
      this.validate(converted);
      return this.#serialize(converted, options);
    };
    return type;
  }
};
var SERIALIZED_BCS_BRAND = /* @__PURE__ */ Symbol.for("@mysten/serialized-bcs");
function isSerializedBcs(obj) {
  return !!obj && typeof obj === "object" && obj[SERIALIZED_BCS_BRAND] === true;
}
var SerializedBcs = class {
  #schema;
  #bytes;
  get [SERIALIZED_BCS_BRAND]() {
    return true;
  }
  constructor(schema, bytes) {
    this.#schema = schema;
    this.#bytes = bytes;
  }
  toBytes() {
    return this.#bytes;
  }
  toHex() {
    return toHex(this.#bytes);
  }
  toBase64() {
    return toBase64(this.#bytes);
  }
  toBase58() {
    return toBase58(this.#bytes);
  }
  parse() {
    return this.#schema.parse(this.#bytes);
  }
};
function fixedSizeBcsType({ size, ...options }) {
  return new BcsType({
    ...options,
    serializedSize: () => size
  });
}
function uIntBcsType({ readMethod, writeMethod, ...options }) {
  return fixedSizeBcsType({
    ...options,
    read: (reader) => reader[readMethod](),
    write: (value, writer) => writer[writeMethod](value),
    validate: (value) => {
      if (value < 0 || value > options.maxValue) throw new TypeError(`Invalid ${options.name} value: ${value}. Expected value in range 0-${options.maxValue}`);
      options.validate?.(value);
    }
  });
}
function bigUIntBcsType({ readMethod, writeMethod, ...options }) {
  return fixedSizeBcsType({
    ...options,
    read: (reader) => reader[readMethod](),
    write: (value, writer) => writer[writeMethod](BigInt(value)),
    validate: (val) => {
      const value = BigInt(val);
      if (value < 0 || value > options.maxValue) throw new TypeError(`Invalid ${options.name} value: ${value}. Expected value in range 0-${options.maxValue}`);
      options.validate?.(value);
    }
  });
}
function dynamicSizeBcsType({ serialize, ...options }) {
  const type = new BcsType({
    ...options,
    serialize,
    write: (value, writer) => {
      for (const byte of type.serialize(value).toBytes()) writer.write8(byte);
    }
  });
  return type;
}
function stringLikeBcsType({ toBytes, fromBytes, ...options }) {
  return new BcsType({
    ...options,
    read: (reader) => {
      const length = reader.readULEB();
      return fromBytes(reader.readBytes(length));
    },
    write: (hex, writer) => {
      const bytes = toBytes(hex);
      writer.writeULEB(bytes.length);
      writer.writeBytes(bytes);
    },
    serialize: (value) => {
      const bytes = toBytes(value);
      const size = ulebEncode(bytes.length);
      const result = new Uint8Array(size.length + bytes.length);
      result.set(size, 0);
      result.set(bytes, size.length);
      return result;
    },
    validate: (value) => {
      if (typeof value !== "string") throw new TypeError(`Invalid ${options.name} value: ${value}. Expected string`);
      options.validate?.(value);
    }
  });
}
function lazyBcsType(cb) {
  let lazyType = null;
  function getType() {
    if (!lazyType) lazyType = cb();
    return lazyType;
  }
  return new BcsType({
    name: "lazy",
    read: (data) => getType().read(data),
    serializedSize: (value) => getType().serializedSize(value),
    write: (value, writer) => getType().write(value, writer),
    serialize: (value, options) => getType().serialize(value, options).toBytes()
  });
}
var BcsStruct = class extends BcsType {
  constructor({ name, fields, ...options }) {
    const fieldNames = Object.keys(fields);
    const fieldTypes = fieldNames.map((field) => fields[field]);
    const fieldCount = fieldNames.length;
    super({
      name,
      serializedSize: (values) => {
        let total = 0;
        for (let i = 0; i < fieldCount; i++) {
          const size = fieldTypes[i].serializedSize(values[fieldNames[i]]);
          if (size == null) return null;
          total += size;
        }
        return total;
      },
      read: (reader) => {
        const result = {};
        for (let i = 0; i < fieldCount; i++) result[fieldNames[i]] = fieldTypes[i].read(reader);
        return result;
      },
      write: (value, writer) => {
        for (let i = 0; i < fieldCount; i++) fieldTypes[i].write(value[fieldNames[i]], writer);
      },
      ...options,
      validate: (value) => {
        options?.validate?.(value);
        if (typeof value !== "object" || value == null) throw new TypeError(`Expected object, found ${typeof value}`);
      }
    });
  }
};
var BcsEnum = class extends BcsType {
  constructor({ fields, ...options }) {
    const canonicalOrder = Object.entries(fields);
    const variantIndex = new Map(canonicalOrder.map(([name], i) => [name, i]));
    super({
      read: (reader) => {
        const index = reader.readULEB();
        const enumEntry = canonicalOrder[index];
        if (!enumEntry) throw new TypeError(`Unknown value ${index} for enum ${options.name}`);
        const [kind, type] = enumEntry;
        const value = type?.read(reader) ?? true;
        if (kind === "__proto__") return {
          [kind]: value,
          $kind: kind
        };
        const result = {};
        result[kind] = value;
        result.$kind = kind;
        return result;
      },
      write: (value, writer) => {
        for (const name of Object.keys(value)) {
          const index = variantIndex.get(name);
          if (index !== void 0) {
            writer.writeULEB(index);
            canonicalOrder[index][1]?.write(value[name], writer);
            return;
          }
        }
      },
      ...options,
      validate: (value) => {
        options?.validate?.(value);
        if (typeof value !== "object" || value == null) throw new TypeError(`Expected object, found ${typeof value}`);
        let variantCount = 0;
        for (const key of Object.keys(value)) if (value[key] !== void 0 && variantIndex.has(key)) variantCount++;
        if (variantCount !== 1) throw new TypeError(`Expected object with one key, but found ${variantCount} for type ${options.name}}`);
      }
    });
  }
};
var BcsTuple = class extends BcsType {
  constructor({ fields, name, ...options }) {
    super({
      name: name ?? `(${fields.map((t) => t.name).join(", ")})`,
      serializedSize: (values) => {
        let total = 0;
        for (let i = 0; i < fields.length; i++) {
          const size = fields[i].serializedSize(values[i]);
          if (size == null) return null;
          total += size;
        }
        return total;
      },
      read: (reader) => {
        const result = [];
        for (const field of fields) result.push(field.read(reader));
        return result;
      },
      write: (value, writer) => {
        for (let i = 0; i < fields.length; i++) fields[i].write(value[i], writer);
      },
      ...options,
      validate: (value) => {
        options?.validate?.(value);
        if (!Array.isArray(value)) throw new TypeError(`Expected array, found ${typeof value}`);
        if (value.length !== fields.length) throw new TypeError(`Expected array of length ${fields.length}, found ${value.length}`);
      }
    });
  }
};

// node_modules/@mysten/bcs/dist/bcs.mjs
function fixedArray(size, type, options) {
  return new BcsType({
    read: (reader) => {
      const result = new Array(size);
      for (let i = 0; i < size; i++) result[i] = type.read(reader);
      return result;
    },
    write: (value, writer) => {
      for (const item of value) type.write(item, writer);
    },
    ...options,
    name: options?.name ?? `${type.name}[${size}]`,
    validate: (value) => {
      options?.validate?.(value);
      if (!value || typeof value !== "object" || !("length" in value)) throw new TypeError(`Expected array, found ${typeof value}`);
      if (value.length !== size) throw new TypeError(`Expected array of length ${size}, found ${value.length}`);
    }
  });
}
function option(type) {
  const name = `Option<${type.name}>`;
  return new BcsType({
    name,
    read: (reader) => {
      const index = reader.readULEB();
      if (index === 0) return null;
      if (index === 1) return type.read(reader);
      throw new TypeError(`Unknown value ${index} for enum ${name}`);
    },
    write: (value, writer) => {
      if (value == null) {
        writer.write8(0);
        return;
      }
      writer.write8(1);
      type.write(value, writer);
    }
  });
}
function vector(type, options) {
  return new BcsType({
    read: (reader) => {
      const length = reader.readULEB();
      const result = new Array(length);
      for (let i = 0; i < length; i++) result[i] = type.read(reader);
      return result;
    },
    write: (value, writer) => {
      writer.writeULEB(value.length);
      for (const item of value) type.write(item, writer);
    },
    ...options,
    name: options?.name ?? `vector<${type.name}>`,
    validate: (value) => {
      options?.validate?.(value);
      if (!value || typeof value !== "object" || !("length" in value)) throw new TypeError(`Expected array, found ${typeof value}`);
    }
  });
}
function compareBcsBytes(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
}
function map(keyType, valueType) {
  return new BcsType({
    name: `Map<${keyType.name}, ${valueType.name}>`,
    read: (reader) => {
      const length = reader.readULEB();
      const result = /* @__PURE__ */ new Map();
      for (let i = 0; i < length; i++) result.set(keyType.read(reader), valueType.read(reader));
      return result;
    },
    write: (value, writer) => {
      const entries = [...value.entries()].map(([key, val]) => [keyType.serialize(key).toBytes(), val]);
      entries.sort(([a], [b]) => compareBcsBytes(a, b));
      writer.writeULEB(entries.length);
      for (const [keyBytes, val] of entries) {
        writer.writeBytes(keyBytes);
        valueType.write(val, writer);
      }
    }
  });
}
var utf8Encoder;
var utf8Decoder;
function decoder() {
  return utf8Decoder ??= new TextDecoder("utf-8", {
    fatal: true,
    ignoreBOM: true
  });
}
var ASCII_FAST_PATH_MAX_LENGTH = 64;
function decodeUtf8(bytes) {
  if (bytes.length <= ASCII_FAST_PATH_MAX_LENGTH) {
    let result = "";
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if (byte >= 128) return decoder().decode(bytes);
      result += String.fromCharCode(byte);
    }
    return result;
  }
  return decoder().decode(bytes);
}
var bcs = {
  u8(options) {
    return uIntBcsType({
      readMethod: "read8",
      writeMethod: "write8",
      size: 1,
      maxValue: 2 ** 8 - 1,
      ...options,
      name: options?.name ?? "u8"
    });
  },
  u16(options) {
    return uIntBcsType({
      readMethod: "read16",
      writeMethod: "write16",
      size: 2,
      maxValue: 2 ** 16 - 1,
      ...options,
      name: options?.name ?? "u16"
    });
  },
  u32(options) {
    return uIntBcsType({
      readMethod: "read32",
      writeMethod: "write32",
      size: 4,
      maxValue: 2 ** 32 - 1,
      ...options,
      name: options?.name ?? "u32"
    });
  },
  u64(options) {
    return bigUIntBcsType({
      readMethod: "read64",
      writeMethod: "write64",
      size: 8,
      maxValue: 2n ** 64n - 1n,
      ...options,
      name: options?.name ?? "u64"
    });
  },
  u128(options) {
    return bigUIntBcsType({
      readMethod: "read128",
      writeMethod: "write128",
      size: 16,
      maxValue: 2n ** 128n - 1n,
      ...options,
      name: options?.name ?? "u128"
    });
  },
  u256(options) {
    return bigUIntBcsType({
      readMethod: "read256",
      writeMethod: "write256",
      size: 32,
      maxValue: 2n ** 256n - 1n,
      ...options,
      name: options?.name ?? "u256"
    });
  },
  bool(options) {
    return fixedSizeBcsType({
      size: 1,
      read: (reader) => {
        const value = reader.read8();
        if (value > 1) throw new TypeError(`Invalid bool value: expected 0 or 1, found ${value}`);
        return value === 1;
      },
      write: (value, writer) => writer.write8(value ? 1 : 0),
      ...options,
      name: options?.name ?? "bool",
      validate: (value) => {
        options?.validate?.(value);
        if (typeof value !== "boolean") throw new TypeError(`Expected boolean, found ${typeof value}`);
      }
    });
  },
  uleb128(options) {
    return dynamicSizeBcsType({
      read: (reader) => reader.readULEB(),
      serialize: (value) => {
        return Uint8Array.from(ulebEncode(value));
      },
      ...options,
      name: options?.name ?? "uleb128"
    });
  },
  bytes(size, options) {
    return fixedSizeBcsType({
      size,
      read: (reader) => reader.readBytes(size),
      write: (value, writer) => {
        writer.writeBytes(value instanceof Uint8Array ? value : new Uint8Array(value));
      },
      ...options,
      name: options?.name ?? `bytes[${size}]`,
      validate: (value) => {
        options?.validate?.(value);
        if (!value || typeof value !== "object" || !("length" in value)) throw new TypeError(`Expected array, found ${typeof value}`);
        if (value.length !== size) throw new TypeError(`Expected array of length ${size}, found ${value.length}`);
      }
    });
  },
  byteVector(options) {
    return new BcsType({
      read: (reader) => {
        const length = reader.readULEB();
        return reader.readBytes(length);
      },
      write: (value, writer) => {
        const array2 = value instanceof Uint8Array ? value : new Uint8Array(value);
        writer.writeULEB(array2.length);
        writer.writeBytes(array2);
      },
      ...options,
      name: options?.name ?? "vector<u8>",
      serializedSize: (value) => {
        const length = "length" in value ? value.length : null;
        return length == null ? null : ulebEncode(length).length + length;
      },
      validate: (value) => {
        options?.validate?.(value);
        if (!value || typeof value !== "object" || !("length" in value)) throw new TypeError(`Expected array, found ${typeof value}`);
      }
    });
  },
  string(options) {
    return stringLikeBcsType({
      toBytes: (value) => (utf8Encoder ??= new TextEncoder()).encode(value),
      fromBytes: decodeUtf8,
      ...options,
      name: options?.name ?? "string"
    });
  },
  fixedArray,
  option,
  vector,
  tuple(fields, options) {
    return new BcsTuple({
      fields,
      ...options
    });
  },
  struct(name, fields, options) {
    return new BcsStruct({
      name,
      fields,
      ...options
    });
  },
  enum(name, fields, options) {
    return new BcsEnum({
      name,
      fields,
      ...options
    });
  },
  map,
  lazy(cb) {
    return lazyBcsType(cb);
  }
};

// node_modules/@mysten/sui/dist/utils/sui-types.mjs
var SUI_ADDRESS_LENGTH = 32;
function isValidSuiAddress(value) {
  return isHex(value) && getHexByteLength(value) === SUI_ADDRESS_LENGTH;
}
var MOVE_IDENTIFIER_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;
function isValidMoveIdentifier(name) {
  return MOVE_IDENTIFIER_REGEX.test(name);
}
var PRIMITIVE_TYPE_TAGS = [
  "bool",
  "u8",
  "u16",
  "u32",
  "u64",
  "u128",
  "u256",
  "address",
  "signer"
];
var VECTOR_TYPE_REGEX = /^vector<(.+)>$/;
function isValidTypeTag(type) {
  if (PRIMITIVE_TYPE_TAGS.includes(type)) return true;
  const vectorMatch = type.match(VECTOR_TYPE_REGEX);
  if (vectorMatch) return isValidTypeTag(vectorMatch[1]);
  if (type.includes("::")) return isValidStructTag(type);
  return false;
}
function isValidParsedStructTag(tag) {
  if (!isValidSuiAddress(tag.address) && !isValidNamedPackage(tag.address)) return false;
  if (!isValidMoveIdentifier(tag.module) || !isValidMoveIdentifier(tag.name)) return false;
  return tag.typeParams.every((param) => {
    if (typeof param === "string") return isValidTypeTag(param);
    return isValidParsedStructTag(param);
  });
}
function isValidStructTag(type) {
  try {
    return isValidParsedStructTag(parseStructTag(type));
  } catch {
    return false;
  }
}
function parseTypeTag(type) {
  if (type.startsWith("vector<")) {
    if (!type.endsWith(">")) throw new Error(`Invalid type tag: ${type}`);
    const inner = type.slice(7, -1);
    if (!inner) throw new Error(`Invalid type tag: ${type}`);
    const parsed = parseTypeTag(inner);
    if (typeof parsed === "string") return `vector<${parsed}>`;
    return `vector<${normalizeStructTag(parsed)}>`;
  }
  if (!type.includes("::")) return type;
  return parseStructTag(type);
}
function parseStructTag(type) {
  const parts = type.split("::");
  if (parts.length < 3) throw new Error(`Invalid struct tag: ${type}`);
  const [address, module] = parts;
  if (!address || !module) throw new Error(`Invalid struct tag: ${type}`);
  const isMvrPackage = isValidNamedPackage(address);
  const rest = type.slice(address.length + module.length + 4);
  const name = rest.includes("<") ? rest.slice(0, rest.indexOf("<")) : rest;
  if (!name || rest.includes("<") && !rest.endsWith(">")) throw new Error(`Invalid struct tag: ${type}`);
  const typeParams = rest.includes("<") ? splitGenericParameters(rest.slice(rest.indexOf("<") + 1, rest.lastIndexOf(">"))).map((typeParam) => parseTypeTag(typeParam.trim())) : [];
  return {
    address: isMvrPackage ? address : normalizeSuiAddress(address),
    module,
    name,
    typeParams
  };
}
function normalizeStructTag(type) {
  if (typeof type === "string" && type.startsWith("vector<")) throw new Error("normalizeStructTag does not support vector types. Use normalizeTypeTag instead.");
  const { address, module, name, typeParams } = typeof type === "string" ? parseStructTag(type) : type;
  return `${address}::${module}::${name}${typeParams?.length > 0 ? `<${typeParams.map((typeParam) => typeof typeParam === "string" ? typeParam : normalizeStructTag(typeParam)).join(",")}>` : ""}`;
}
function normalizeSuiAddress(value, forceAdd0x = false) {
  let address = value.toLowerCase();
  if (!forceAdd0x && address.startsWith("0x")) address = address.slice(2);
  return `0x${address.padStart(SUI_ADDRESS_LENGTH * 2, "0")}`;
}
function normalizeSuiObjectId(value, forceAdd0x = false) {
  return normalizeSuiAddress(value, forceAdd0x);
}
function isHex(value) {
  return /^(0x|0X)?[a-fA-F0-9]+$/.test(value) && value.length % 2 === 0;
}
function getHexByteLength(value) {
  return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2;
}

// node_modules/@mysten/sui/dist/bcs/type-tag-serializer.mjs
var VECTOR_REGEX = /^vector<(.+)>$/;
var STRUCT_REGEX = /^([^:]+)::([^:]+)::([^<]+)(<(.+)>)?/;
var TypeTagSerializer = class TypeTagSerializer2 {
  static parseFromStr(str, normalizeAddress = false) {
    if (str === "address") return { address: null };
    else if (str === "bool") return { bool: null };
    else if (str === "u8") return { u8: null };
    else if (str === "u16") return { u16: null };
    else if (str === "u32") return { u32: null };
    else if (str === "u64") return { u64: null };
    else if (str === "u128") return { u128: null };
    else if (str === "u256") return { u256: null };
    else if (str === "signer") return { signer: null };
    const vectorMatch = str.match(VECTOR_REGEX);
    if (vectorMatch) return { vector: TypeTagSerializer2.parseFromStr(vectorMatch[1], normalizeAddress) };
    const structMatch = str.match(STRUCT_REGEX);
    if (structMatch) return { struct: {
      address: normalizeAddress ? normalizeSuiAddress(structMatch[1]) : structMatch[1],
      module: structMatch[2],
      name: structMatch[3],
      typeParams: structMatch[5] === void 0 ? [] : TypeTagSerializer2.parseStructTypeArgs(structMatch[5], normalizeAddress)
    } };
    throw new Error(`Encountered unexpected token when parsing type args for ${str}`);
  }
  static parseStructTypeArgs(str, normalizeAddress = false) {
    return splitGenericParameters(str).map((tok) => TypeTagSerializer2.parseFromStr(tok, normalizeAddress));
  }
  static tagToString(tag) {
    if ("bool" in tag) return "bool";
    if ("u8" in tag) return "u8";
    if ("u16" in tag) return "u16";
    if ("u32" in tag) return "u32";
    if ("u64" in tag) return "u64";
    if ("u128" in tag) return "u128";
    if ("u256" in tag) return "u256";
    if ("address" in tag) return "address";
    if ("signer" in tag) return "signer";
    if ("vector" in tag) return `vector<${TypeTagSerializer2.tagToString(tag.vector)}>`;
    if ("struct" in tag) {
      const struct = tag.struct;
      const typeParams = struct.typeParams.map(TypeTagSerializer2.tagToString).join(", ");
      return `${struct.address}::${struct.module}::${struct.name}${typeParams ? `<${typeParams}>` : ""}`;
    }
    throw new Error("Invalid TypeTag");
  }
};

// node_modules/@mysten/sui/dist/bcs/bcs.mjs
function unsafe_u64(options) {
  return bcs.u64({
    name: "unsafe_u64",
    ...options
  }).transform({
    input: (val) => val,
    output: (val) => Number(val)
  });
}
function optionEnum(type) {
  return bcs.enum("Option", {
    None: null,
    Some: type
  });
}
var HEX_NIBBLES = new Int8Array(128).fill(-1);
for (let i = 0; i < 16; i++) {
  HEX_NIBBLES["0123456789abcdef".charCodeAt(i)] = i;
  HEX_NIBBLES["0123456789ABCDEF".charCodeAt(i)] = i;
}
function hexNibble(code) {
  return code < 128 ? HEX_NIBBLES[code] : -1;
}
function decodeAddress(value) {
  if (!value) return null;
  const start = value.length >= 2 && value[0] === "0" && (value[1] === "x" || value[1] === "X") ? 2 : 0;
  if (value.length - start > SUI_ADDRESS_LENGTH * 2) return null;
  const bytes = new Uint8Array(SUI_ADDRESS_LENGTH);
  let byteIndex = SUI_ADDRESS_LENGTH - 1;
  let i = value.length - 1;
  for (; i >= start + 1; i -= 2) {
    const low = hexNibble(value.charCodeAt(i));
    const high = hexNibble(value.charCodeAt(i - 1));
    if (low < 0 || high < 0) return null;
    bytes[byteIndex--] = high << 4 | low;
  }
  if (i === start) {
    const low = hexNibble(value.charCodeAt(i));
    if (low < 0) return null;
    bytes[byteIndex] = low;
  }
  return bytes;
}
var Address = bcs.bytes(SUI_ADDRESS_LENGTH).transform({
  input: (val) => {
    if (typeof val === "string") {
      const bytes = decodeAddress(val);
      if (!bytes) throw new Error(`Invalid Sui address ${val}`);
      return bytes;
    }
    const address = toHex(val);
    if (!address || !isValidSuiAddress(normalizeSuiAddress(address))) throw new Error(`Invalid Sui address ${address}`);
    return val;
  },
  output: (val) => `0x${toHex(val)}`
});
var ObjectDigest = bcs.byteVector().transform({
  name: "ObjectDigest",
  input: (value) => {
    const bytes = fromBase58(value);
    if (bytes.length !== 32) throw new Error("ObjectDigest must be 32 bytes");
    return bytes;
  },
  output: (value) => toBase58(value)
});
var SuiObjectRef = bcs.struct("SuiObjectRef", {
  objectId: Address,
  version: bcs.u64(),
  digest: ObjectDigest
});
var SharedObjectRef = bcs.struct("SharedObjectRef", {
  objectId: Address,
  initialSharedVersion: bcs.u64(),
  mutable: bcs.bool()
});
var ObjectArg = bcs.enum("ObjectArg", {
  ImmOrOwnedObject: SuiObjectRef,
  SharedObject: SharedObjectRef,
  Receiving: SuiObjectRef
});
var Owner = bcs.enum("Owner", {
  AddressOwner: Address,
  ObjectOwner: Address,
  Shared: bcs.struct("Shared", { initialSharedVersion: bcs.u64() }),
  Immutable: null,
  ConsensusAddressOwner: bcs.struct("ConsensusAddressOwner", {
    startVersion: bcs.u64(),
    owner: Address
  })
});
var Reservation = bcs.enum("Reservation", { MaxAmountU64: bcs.u64() });
var WithdrawalType = bcs.enum("WithdrawalType", { Balance: bcs.lazy(() => TypeTag) });
var WithdrawFrom = bcs.enum("WithdrawFrom", {
  Sender: null,
  Sponsor: null,
  SenderAllowance: bcs.struct("SenderAllowance", {
    funder: Address,
    allowance: Address
  })
});
var FundsWithdrawal = bcs.struct("FundsWithdrawal", {
  reservation: Reservation,
  typeArg: WithdrawalType,
  withdrawFrom: WithdrawFrom
});
var CallArg = bcs.enum("CallArg", {
  Pure: bcs.struct("Pure", { bytes: bcs.byteVector().transform({
    input: (val) => typeof val === "string" ? fromBase64(val) : val,
    output: (val) => toBase64(val)
  }) }),
  Object: ObjectArg,
  FundsWithdrawal
});
var InnerTypeTag = bcs.enum("TypeTag", {
  bool: null,
  u8: null,
  u64: null,
  u128: null,
  address: null,
  signer: null,
  vector: bcs.lazy(() => InnerTypeTag),
  struct: bcs.lazy(() => StructTag),
  u16: null,
  u32: null,
  u256: null
});
var TypeTag = InnerTypeTag.transform({
  input: (typeTag) => typeof typeTag === "string" ? TypeTagSerializer.parseFromStr(typeTag, true) : typeTag,
  output: (typeTag) => TypeTagSerializer.tagToString(typeTag)
});
var Argument = bcs.enum("Argument", {
  GasCoin: null,
  Input: bcs.u16(),
  Result: bcs.u16(),
  NestedResult: bcs.tuple([bcs.u16(), bcs.u16()])
});
var ProgrammableMoveCall = bcs.struct("ProgrammableMoveCall", {
  package: Address,
  module: bcs.string(),
  function: bcs.string(),
  typeArguments: bcs.vector(TypeTag),
  arguments: bcs.vector(Argument)
});
var Command = bcs.enum("Command", {
  MoveCall: ProgrammableMoveCall,
  TransferObjects: bcs.struct("TransferObjects", {
    objects: bcs.vector(Argument),
    address: Argument
  }),
  SplitCoins: bcs.struct("SplitCoins", {
    coin: Argument,
    amounts: bcs.vector(Argument)
  }),
  MergeCoins: bcs.struct("MergeCoins", {
    destination: Argument,
    sources: bcs.vector(Argument)
  }),
  Publish: bcs.struct("Publish", {
    modules: bcs.vector(bcs.byteVector().transform({
      input: (val) => typeof val === "string" ? fromBase64(val) : val,
      output: (val) => toBase64(val)
    })),
    dependencies: bcs.vector(Address)
  }),
  MakeMoveVec: bcs.struct("MakeMoveVec", {
    type: optionEnum(TypeTag).transform({
      input: (val) => val === null ? { None: true } : { Some: val },
      output: (val) => val.Some ?? null
    }),
    elements: bcs.vector(Argument)
  }),
  Upgrade: bcs.struct("Upgrade", {
    modules: bcs.vector(bcs.byteVector().transform({
      input: (val) => typeof val === "string" ? fromBase64(val) : val,
      output: (val) => toBase64(val)
    })),
    dependencies: bcs.vector(Address),
    package: Address,
    ticket: Argument
  })
});
var ProgrammableTransaction = bcs.struct("ProgrammableTransaction", {
  inputs: bcs.vector(CallArg),
  commands: bcs.vector(Command)
});
var ValidDuring = bcs.struct("ValidDuring", {
  minEpoch: bcs.option(bcs.u64()),
  maxEpoch: bcs.option(bcs.u64()),
  minTimestamp: bcs.option(bcs.u64()),
  maxTimestamp: bcs.option(bcs.u64()),
  chain: ObjectDigest,
  nonce: bcs.u32()
});
function assertAllowedProposersNotEmpty(proposers) {
  if (proposers.length === 0) throw new Error("Allowed proposers must not be empty");
  return proposers;
}
function assertAllowedProposersStrictlyIncreasing(proposers) {
  assertAllowedProposersNotEmpty(proposers);
  for (let i = 1; i < proposers.length; i++) if (proposers[i] <= proposers[i - 1]) throw new Error("Allowed proposers must be strictly increasing");
  return proposers;
}
var AllowedProposerIndices = bcs.vector(bcs.u32()).transform({
  input: assertAllowedProposersStrictlyIncreasing,
  output: assertAllowedProposersNotEmpty
});
var AllowedProposers = bcs.struct("AllowedProposers", {
  epoch: bcs.u64(),
  proposers: AllowedProposerIndices
});
var Validity = bcs.struct("Validity", {
  minEpoch: bcs.option(bcs.u64()),
  maxEpoch: bcs.option(bcs.u64()),
  minTimestamp: bcs.option(bcs.u64()),
  maxTimestamp: bcs.option(bcs.u64()),
  chain: ObjectDigest,
  nonce: bcs.u32(),
  allowedProposers: bcs.option(AllowedProposers)
});
var TransactionExpiration = bcs.enum("TransactionExpiration", {
  None: null,
  Epoch: unsafe_u64(),
  ValidDuring,
  Validity
});
var StructTag = bcs.struct("StructTag", {
  address: Address,
  module: bcs.string(),
  name: bcs.string(),
  typeParams: bcs.vector(InnerTypeTag)
});
var GasData = bcs.struct("GasData", {
  payment: bcs.vector(SuiObjectRef),
  owner: Address,
  price: bcs.u64(),
  budget: bcs.u64()
});
var IntentScope = bcs.enum("IntentScope", {
  TransactionData: null,
  TransactionEffects: null,
  CheckpointSummary: null,
  PersonalMessage: null
});
var IntentVersion = bcs.enum("IntentVersion", { V0: null });
var AppId = bcs.enum("AppId", { Sui: null });
var Intent = bcs.struct("Intent", {
  scope: IntentScope,
  version: IntentVersion,
  appId: AppId
});
function IntentMessage(T) {
  return bcs.struct(`IntentMessage<${T.name}>`, {
    intent: Intent,
    value: T
  });
}
var CompressedSignature = bcs.enum("CompressedSignature", {
  ED25519: bcs.bytes(64),
  Secp256k1: bcs.bytes(64),
  Secp256r1: bcs.bytes(64),
  ZkLogin: bcs.byteVector(),
  Passkey: bcs.byteVector(),
  MLDSA65: bcs.bytes(3309)
});
var PublicKey = bcs.enum("PublicKey", {
  ED25519: bcs.bytes(32),
  Secp256k1: bcs.bytes(33),
  Secp256r1: bcs.bytes(33),
  ZkLogin: bcs.byteVector(),
  Passkey: bcs.bytes(33),
  MLDSA65: bcs.bytes(1952)
});
var MultiSigPkMap = bcs.struct("MultiSigPkMap", {
  pubKey: PublicKey,
  weight: bcs.u8()
});
var MultiSigPublicKey = bcs.struct("MultiSigPublicKey", {
  pk_map: bcs.vector(MultiSigPkMap),
  threshold: bcs.u16()
});
var MultiSig = bcs.struct("MultiSig", {
  sigs: bcs.vector(CompressedSignature),
  bitmap: bcs.u16(),
  multisig_pk: MultiSigPublicKey
});
var base64String = bcs.byteVector().transform({
  input: (val) => typeof val === "string" ? fromBase64(val) : val,
  output: (val) => toBase64(val)
});
var PasskeyAuthenticator = bcs.struct("PasskeyAuthenticator", {
  authenticatorData: bcs.byteVector(),
  clientDataJson: bcs.string(),
  userSignature: bcs.byteVector()
});
var MoveObjectType = bcs.enum("MoveObjectType", {
  Other: StructTag,
  GasCoin: null,
  StakedSui: null,
  Coin: TypeTag,
  AccumulatorBalanceWrapper: null
});
var TypeOrigin = bcs.struct("TypeOrigin", {
  moduleName: bcs.string(),
  datatypeName: bcs.string(),
  package: Address
});
var UpgradeInfo = bcs.struct("UpgradeInfo", {
  upgradedId: Address,
  upgradedVersion: bcs.u64()
});
var MovePackage = bcs.struct("MovePackage", {
  id: Address,
  version: bcs.u64(),
  moduleMap: bcs.map(bcs.string(), bcs.byteVector()),
  typeOriginTable: bcs.vector(TypeOrigin),
  linkageTable: bcs.map(Address, UpgradeInfo)
});
var MoveObject = bcs.struct("MoveObject", {
  type: MoveObjectType,
  hasPublicTransfer: bcs.bool(),
  version: bcs.u64(),
  contents: bcs.byteVector()
});
var Data = bcs.enum("Data", {
  Move: MoveObject,
  Package: MovePackage
});
var ObjectInner = bcs.struct("ObjectInner", {
  data: Data,
  owner: Owner,
  previousTransaction: ObjectDigest,
  storageRebate: bcs.u64()
});

// node_modules/@mysten/sui/dist/bcs/transactions.mjs
var ChangeEpoch = bcs.struct("ChangeEpoch", {
  epoch: bcs.u64(),
  protocolVersion: bcs.u64(),
  storageCharge: bcs.u64(),
  computationCharge: bcs.u64(),
  storageRebate: bcs.u64(),
  nonRefundableStorageFee: bcs.u64(),
  epochStartTimestampMs: bcs.u64(),
  systemPackages: bcs.vector(bcs.tuple([
    bcs.u64(),
    bcs.vector(bcs.byteVector()),
    bcs.vector(Address)
  ]))
});
var GenesisObject = bcs.enum("GenesisObject", { RawObject: bcs.struct("RawObject", {
  data: Data,
  owner: Owner
}) });
var GenesisTransaction = bcs.struct("GenesisTransaction", { objects: bcs.vector(GenesisObject) });
var ConsensusCommitPrologue = bcs.struct("ConsensusCommitPrologue", {
  epoch: bcs.u64(),
  round: bcs.u64(),
  commitTimestampMs: bcs.u64()
});
var ConsensusCommitPrologueV2 = bcs.struct("ConsensusCommitPrologueV2", {
  epoch: bcs.u64(),
  round: bcs.u64(),
  commitTimestampMs: bcs.u64(),
  consensusCommitDigest: ObjectDigest
});
var ConsensusDeterminedVersionAssignments = bcs.enum("ConsensusDeterminedVersionAssignments", {
  CancelledTransactions: bcs.vector(bcs.tuple([ObjectDigest, bcs.vector(bcs.tuple([Address, bcs.u64()]))])),
  CancelledTransactionsV2: bcs.vector(bcs.tuple([ObjectDigest, bcs.vector(bcs.tuple([bcs.tuple([Address, bcs.u64()]), bcs.u64()]))]))
});
var ConsensusCommitPrologueV3 = bcs.struct("ConsensusCommitPrologueV3", {
  epoch: bcs.u64(),
  round: bcs.u64(),
  subDagIndex: bcs.option(bcs.u64()),
  commitTimestampMs: bcs.u64(),
  consensusCommitDigest: ObjectDigest,
  consensusDeterminedVersionAssignments: ConsensusDeterminedVersionAssignments
});
var ConsensusCommitPrologueV4 = bcs.struct("ConsensusCommitPrologueV4", {
  epoch: bcs.u64(),
  round: bcs.u64(),
  subDagIndex: bcs.option(bcs.u64()),
  commitTimestampMs: bcs.u64(),
  consensusCommitDigest: ObjectDigest,
  consensusDeterminedVersionAssignments: ConsensusDeterminedVersionAssignments,
  additionalStateDigest: ObjectDigest
});
var ActiveJwk = bcs.struct("ActiveJwk", {
  jwkId: bcs.struct("JwkId", {
    iss: bcs.string(),
    kid: bcs.string()
  }),
  jwk: bcs.struct("JWK", {
    kty: bcs.string(),
    e: bcs.string(),
    n: bcs.string(),
    alg: bcs.string()
  }),
  epoch: bcs.u64()
});
var AuthenticatorStateUpdate = bcs.struct("AuthenticatorStateUpdate", {
  epoch: bcs.u64(),
  round: bcs.u64(),
  newActiveJwks: bcs.vector(ActiveJwk),
  authenticatorObjInitialSharedVersion: bcs.u64()
});
var RandomnessStateUpdate = bcs.struct("RandomnessStateUpdate", {
  epoch: bcs.u64(),
  randomnessRound: bcs.u64(),
  randomBytes: bcs.byteVector(),
  randomnessObjInitialSharedVersion: bcs.u64()
});
var AuthenticatorStateExpire = bcs.struct("AuthenticatorStateExpire", {
  minEpoch: bcs.u64(),
  authenticatorObjInitialSharedVersion: bcs.u64()
});
var ExecutionTimeObservationKey = bcs.enum("ExecutionTimeObservationKey", {
  MoveEntryPoint: bcs.struct("MoveEntryPoint", {
    package: Address,
    module: bcs.string(),
    function: bcs.string(),
    typeArguments: bcs.vector(TypeTag)
  }),
  TransferObjects: null,
  SplitCoins: null,
  MergeCoins: null,
  Publish: null,
  MakeMoveVec: null,
  Upgrade: null
});
var StoredExecutionTimeObservations = bcs.enum("StoredExecutionTimeObservations", { V1: bcs.vector(bcs.tuple([ExecutionTimeObservationKey, bcs.vector(bcs.tuple([bcs.byteVector(), bcs.struct("Duration", {
  secs: bcs.u64(),
  nanos: bcs.u32()
})]))])) });
var WriteAccumulatorStorageCost = bcs.struct("WriteAccumulatorStorageCost", { storageCost: bcs.u64() });
var EndOfEpochTransactionKind = bcs.enum("EndOfEpochTransactionKind", {
  ChangeEpoch,
  AuthenticatorStateCreate: null,
  AuthenticatorStateExpire,
  RandomnessStateCreate: null,
  DenyListStateCreate: null,
  BridgeStateCreate: ObjectDigest,
  BridgeCommitteeInit: bcs.u64(),
  StoreExecutionTimeObservations: StoredExecutionTimeObservations,
  AccumulatorRootCreate: null,
  CoinRegistryCreate: null,
  DisplayRegistryCreate: null,
  AddressAliasStateCreate: null,
  WriteAccumulatorStorageCost,
  ForwardingAddressRegistryCreate: null
});
var TransactionKind = bcs.enum("TransactionKind", {
  ProgrammableTransaction,
  ChangeEpoch,
  Genesis: GenesisTransaction,
  ConsensusCommitPrologue,
  AuthenticatorStateUpdate,
  EndOfEpochTransaction: bcs.vector(EndOfEpochTransactionKind),
  RandomnessStateUpdate,
  ConsensusCommitPrologueV2,
  ConsensusCommitPrologueV3,
  ConsensusCommitPrologueV4,
  ProgrammableSystemTransaction: ProgrammableTransaction
});
var TransactionDataV1 = bcs.struct("TransactionDataV1", {
  kind: TransactionKind,
  sender: Address,
  gasData: GasData,
  expiration: TransactionExpiration
});
var TransactionData = bcs.enum("TransactionData", { V1: TransactionDataV1 });
var SenderSignedTransaction = bcs.struct("SenderSignedTransaction", {
  intentMessage: IntentMessage(TransactionData),
  txSignatures: bcs.vector(base64String)
});
var SenderSignedData = bcs.vector(SenderSignedTransaction, { name: "SenderSignedData" });

// node_modules/@mysten/sui/dist/bcs/effects.mjs
var PackageUpgradeError = bcs.enum("PackageUpgradeError", {
  UnableToFetchPackage: bcs.struct("UnableToFetchPackage", { packageId: Address }),
  NotAPackage: bcs.struct("NotAPackage", { objectId: Address }),
  IncompatibleUpgrade: null,
  DigestDoesNotMatch: bcs.struct("DigestDoesNotMatch", { digest: bcs.byteVector() }),
  UnknownUpgradePolicy: bcs.struct("UnknownUpgradePolicy", { policy: bcs.u8() }),
  PackageIDDoesNotMatch: bcs.struct("PackageIDDoesNotMatch", {
    packageId: Address,
    ticketId: Address
  })
});
var ModuleId = bcs.struct("ModuleId", {
  address: Address,
  name: bcs.string()
});
var MoveLocation = bcs.struct("MoveLocation", {
  module: ModuleId,
  function: bcs.u16(),
  instruction: bcs.u16(),
  functionName: bcs.option(bcs.string())
});
var CommandArgumentError = bcs.enum("CommandArgumentError", {
  TypeMismatch: null,
  InvalidBCSBytes: null,
  InvalidUsageOfPureArg: null,
  InvalidArgumentToPrivateEntryFunction: null,
  IndexOutOfBounds: bcs.struct("IndexOutOfBounds", { idx: bcs.u16() }),
  SecondaryIndexOutOfBounds: bcs.struct("SecondaryIndexOutOfBounds", {
    resultIdx: bcs.u16(),
    secondaryIdx: bcs.u16()
  }),
  InvalidResultArity: bcs.struct("InvalidResultArity", { resultIdx: bcs.u16() }),
  InvalidGasCoinUsage: null,
  InvalidValueUsage: null,
  InvalidObjectByValue: null,
  InvalidObjectByMutRef: null,
  SharedObjectOperationNotAllowed: null,
  InvalidArgumentArity: null,
  InvalidTransferObject: null,
  InvalidMakeMoveVecNonObjectArgument: null,
  ArgumentWithoutValue: null,
  CannotMoveBorrowedValue: null,
  CannotWriteToExtendedReference: null,
  InvalidReferenceArgument: null,
  InvalidTxContext: null
});
var TypeArgumentError = bcs.enum("TypeArgumentError", {
  TypeNotFound: null,
  ConstraintNotSatisfied: null
});
var ExecutionFailureStatus = bcs.enum("ExecutionFailureStatus", {
  InsufficientGas: null,
  InvalidGasObject: null,
  InvariantViolation: null,
  FeatureNotYetSupported: null,
  MoveObjectTooBig: bcs.struct("MoveObjectTooBig", {
    objectSize: bcs.u64(),
    maxObjectSize: bcs.u64()
  }),
  MovePackageTooBig: bcs.struct("MovePackageTooBig", {
    objectSize: bcs.u64(),
    maxObjectSize: bcs.u64()
  }),
  CircularObjectOwnership: bcs.struct("CircularObjectOwnership", { object: Address }),
  InsufficientCoinBalance: null,
  CoinBalanceOverflow: null,
  PublishErrorNonZeroAddress: null,
  SuiMoveVerificationError: null,
  MovePrimitiveRuntimeError: bcs.option(MoveLocation),
  MoveAbort: bcs.tuple([MoveLocation, bcs.u64()]),
  VMVerificationOrDeserializationError: null,
  VMInvariantViolation: null,
  FunctionNotFound: null,
  ArityMismatch: null,
  TypeArityMismatch: null,
  NonEntryFunctionInvoked: null,
  CommandArgumentError: bcs.struct("CommandArgumentError", {
    argIdx: bcs.u16(),
    kind: CommandArgumentError
  }),
  TypeArgumentError: bcs.struct("TypeArgumentError", {
    argumentIdx: bcs.u16(),
    kind: TypeArgumentError
  }),
  UnusedValueWithoutDrop: bcs.struct("UnusedValueWithoutDrop", {
    resultIdx: bcs.u16(),
    secondaryIdx: bcs.u16()
  }),
  InvalidPublicFunctionReturnType: bcs.struct("InvalidPublicFunctionReturnType", { idx: bcs.u16() }),
  InvalidTransferObject: null,
  EffectsTooLarge: bcs.struct("EffectsTooLarge", {
    currentSize: bcs.u64(),
    maxSize: bcs.u64()
  }),
  PublishUpgradeMissingDependency: null,
  PublishUpgradeDependencyDowngrade: null,
  PackageUpgradeError: bcs.struct("PackageUpgradeError", { upgradeError: PackageUpgradeError }),
  WrittenObjectsTooLarge: bcs.struct("WrittenObjectsTooLarge", {
    currentSize: bcs.u64(),
    maxSize: bcs.u64()
  }),
  CertificateDenied: null,
  SuiMoveVerificationTimedout: null,
  SharedObjectOperationNotAllowed: null,
  InputObjectDeleted: null,
  ExecutionCancelledDueToSharedObjectCongestion: bcs.struct("ExecutionCancelledDueToSharedObjectCongestion", { congested_objects: bcs.vector(Address) }),
  AddressDeniedForCoin: bcs.struct("AddressDeniedForCoin", {
    address: Address,
    coinType: bcs.string()
  }),
  CoinTypeGlobalPause: bcs.struct("CoinTypeGlobalPause", { coinType: bcs.string() }),
  ExecutionCancelledDueToRandomnessUnavailable: null,
  MoveVectorElemTooBig: bcs.struct("MoveVectorElemTooBig", {
    valueSize: bcs.u64(),
    maxScaledSize: bcs.u64()
  }),
  MoveRawValueTooBig: bcs.struct("MoveRawValueTooBig", {
    valueSize: bcs.u64(),
    maxScaledSize: bcs.u64()
  }),
  InvalidLinkage: null,
  InsufficientBalanceForWithdraw: null,
  NonExclusiveWriteInputObjectModified: bcs.struct("NonExclusiveWriteInputObjectModified", { id: Address }),
  TransactionExpired: null
});
var ExecutionStatus = bcs.enum("ExecutionStatus", {
  Success: null,
  Failure: bcs.struct("Failure", {
    error: ExecutionFailureStatus,
    command: bcs.option(bcs.u64())
  })
});
var GasCostSummary = bcs.struct("GasCostSummary", {
  computationCost: bcs.u64(),
  storageCost: bcs.u64(),
  storageRebate: bcs.u64(),
  nonRefundableStorageFee: bcs.u64()
});
var TransactionEffectsV1 = bcs.struct("TransactionEffectsV1", {
  status: ExecutionStatus,
  executedEpoch: bcs.u64(),
  gasUsed: GasCostSummary,
  modifiedAtVersions: bcs.vector(bcs.tuple([Address, bcs.u64()])),
  sharedObjects: bcs.vector(SuiObjectRef),
  transactionDigest: ObjectDigest,
  created: bcs.vector(bcs.tuple([SuiObjectRef, Owner])),
  mutated: bcs.vector(bcs.tuple([SuiObjectRef, Owner])),
  unwrapped: bcs.vector(bcs.tuple([SuiObjectRef, Owner])),
  deleted: bcs.vector(SuiObjectRef),
  unwrappedThenDeleted: bcs.vector(SuiObjectRef),
  wrapped: bcs.vector(SuiObjectRef),
  gasObject: bcs.tuple([SuiObjectRef, Owner]),
  eventsDigest: bcs.option(ObjectDigest),
  dependencies: bcs.vector(ObjectDigest)
});
var VersionDigest = bcs.tuple([bcs.u64(), ObjectDigest]);
var ObjectIn = bcs.enum("ObjectIn", {
  NotExist: null,
  Exist: bcs.tuple([VersionDigest, Owner])
});
var AccumulatorAddress = bcs.struct("AccumulatorAddress", {
  address: Address,
  ty: TypeTag
});
var AccumulatorOperation = bcs.enum("AccumulatorOperation", {
  Merge: null,
  Split: null
});
var AccumulatorValue = bcs.enum("AccumulatorValue", {
  Integer: bcs.u64(),
  IntegerTuple: bcs.tuple([bcs.u64(), bcs.u64()]),
  EventDigest: bcs.vector(bcs.tuple([bcs.u64(), ObjectDigest]))
});
var AccumulatorWriteV1 = bcs.struct("AccumulatorWriteV1", {
  address: AccumulatorAddress,
  operation: AccumulatorOperation,
  value: AccumulatorValue
});
var ObjectOut = bcs.enum("ObjectOut", {
  NotExist: null,
  ObjectWrite: bcs.tuple([ObjectDigest, Owner]),
  PackageWrite: VersionDigest,
  AccumulatorWriteV1
});
var IDOperation = bcs.enum("IDOperation", {
  None: null,
  Created: null,
  Deleted: null
});
var EffectsObjectChange = bcs.struct("EffectsObjectChange", {
  inputState: ObjectIn,
  outputState: ObjectOut,
  idOperation: IDOperation
});
var UnchangedConsensusKind = bcs.enum("UnchangedConsensusKind", {
  ReadOnlyRoot: VersionDigest,
  MutateConsensusStreamEnded: bcs.u64(),
  ReadConsensusStreamEnded: bcs.u64(),
  Cancelled: bcs.u64(),
  PerEpochConfig: null
});
var TransactionEffectsV2 = bcs.struct("TransactionEffectsV2", {
  status: ExecutionStatus,
  executedEpoch: bcs.u64(),
  gasUsed: GasCostSummary,
  transactionDigest: ObjectDigest,
  gasObjectIndex: bcs.option(bcs.u32()),
  eventsDigest: bcs.option(ObjectDigest),
  dependencies: bcs.vector(ObjectDigest),
  lamportVersion: bcs.u64(),
  changedObjects: bcs.vector(bcs.tuple([Address, EffectsObjectChange])),
  unchangedConsensusObjects: bcs.vector(bcs.tuple([Address, UnchangedConsensusKind])),
  auxDataDigest: bcs.option(ObjectDigest)
});
var TransactionEffects = bcs.enum("TransactionEffects", {
  V1: TransactionEffectsV1,
  V2: TransactionEffectsV2
});

// node_modules/@mysten/sui/dist/bcs/pure.mjs
function pureBcsSchemaFromTypeName(name) {
  switch (name) {
    case "u8":
      return bcs.u8();
    case "u16":
      return bcs.u16();
    case "u32":
      return bcs.u32();
    case "u64":
      return bcs.u64();
    case "u128":
      return bcs.u128();
    case "u256":
      return bcs.u256();
    case "bool":
      return bcs.bool();
    case "string":
      return bcs.string();
    case "id":
    case "address":
      return Address;
  }
  const generic = name.match(/^(vector|option)<(.+)>$/);
  if (generic) {
    const [kind, inner] = generic.slice(1);
    if (kind === "vector") return bcs.vector(pureBcsSchemaFromTypeName(inner));
    else return bcs.option(pureBcsSchemaFromTypeName(inner));
  }
  throw new Error(`Invalid Pure type name: ${name}`);
}

// node_modules/@mysten/sui/dist/bcs/index.mjs
var suiBcs = {
  ...bcs,
  U8: bcs.u8(),
  U16: bcs.u16(),
  U32: bcs.u32(),
  U64: bcs.u64(),
  U128: bcs.u128(),
  U256: bcs.u256(),
  ULEB128: bcs.uleb128(),
  Bool: bcs.bool(),
  String: bcs.string(),
  Address,
  AppId,
  Argument,
  CallArg,
  Command,
  CompressedSignature,
  Data,
  GasData,
  Intent,
  IntentMessage,
  IntentScope,
  IntentVersion,
  MoveObject,
  MoveObjectType,
  MovePackage,
  MultiSig,
  MultiSigPkMap,
  MultiSigPublicKey,
  Object: ObjectInner,
  ObjectArg,
  ObjectDigest,
  Owner,
  PasskeyAuthenticator,
  ProgrammableMoveCall,
  ProgrammableTransaction,
  PublicKey,
  SenderSignedData,
  SenderSignedTransaction,
  SharedObjectRef,
  StructTag,
  SuiObjectRef,
  TransactionData,
  TransactionDataV1,
  TransactionEffects,
  TransactionExpiration,
  TransactionKind,
  TypeOrigin,
  TypeTag,
  UpgradeInfo
};

// node_modules/@mysten/sui/dist/utils/move-registry.mjs
var isValidNamedType = (type) => {
  const splitType = type.split(/::|<|>|,/);
  for (const t of splitType) if (t.includes(NAME_SEPARATOR) && !isValidNamedPackage(t)) return false;
  return isValidStructTag(type);
};

// node_modules/@mysten/sui/dist/version.mjs
var PACKAGE_VERSION = "2.39.0";

// node_modules/@mysten/sui/dist/client/mvr.mjs
var NAME_SEPARATOR2 = "/";
var MVR_API_HEADER = { "Mvr-Source": `@mysten/sui@${PACKAGE_VERSION}` };
var MvrClient = class {
  #cache;
  #url;
  #pageSize;
  #overrides;
  constructor({ cache, url, pageSize = 50, overrides }) {
    this.#cache = cache;
    this.#url = url;
    this.#pageSize = pageSize;
    this.#overrides = {
      packages: overrides?.packages,
      types: overrides?.types
    };
    validateOverrides(this.#overrides);
  }
  get #mvrPackageDataLoader() {
    return this.#cache.readSync(["#mvrPackageDataLoader", this.#url ?? ""], () => {
      const loader = new DataLoader(async (packages) => {
        if (!this.#url) throw new Error(`MVR Api URL is not set for the current client (resolving ${packages.join(", ")})`);
        const resolved = await this.#resolvePackages(packages);
        return packages.map((pkg) => resolved[pkg] ?? /* @__PURE__ */ new Error(`Failed to resolve package: ${pkg}`));
      });
      const overrides = this.#overrides?.packages;
      if (overrides) for (const [pkg, id] of Object.entries(overrides)) loader.prime(pkg, id);
      return loader;
    });
  }
  get #mvrTypeDataLoader() {
    return this.#cache.readSync(["#mvrTypeDataLoader", this.#url ?? ""], () => {
      const loader = new DataLoader(async (types) => {
        if (!this.#url) throw new Error(`MVR Api URL is not set for the current client (resolving ${types.join(", ")})`);
        const resolved = await this.#resolveTypes(types);
        return types.map((type) => resolved[type] ?? /* @__PURE__ */ new Error(`Failed to resolve type: ${type}`));
      });
      const overrides = this.#overrides?.types;
      if (overrides) for (const [type, id] of Object.entries(overrides)) loader.prime(type, id);
      return loader;
    });
  }
  async #resolvePackages(packages) {
    if (packages.length === 0) return {};
    const batches = chunk(packages, this.#pageSize);
    const results = {};
    await Promise.all(batches.map(async (batch) => {
      const data = await this.#fetch("/v1/resolution/bulk", { names: batch });
      if (!data?.resolution) return;
      for (const pkg of Object.keys(data?.resolution)) {
        const pkgData = data.resolution[pkg]?.package_id;
        if (!pkgData) continue;
        results[pkg] = pkgData;
      }
    }));
    return results;
  }
  async #resolveTypes(types) {
    if (types.length === 0) return {};
    const batches = chunk(types, this.#pageSize);
    const results = {};
    await Promise.all(batches.map(async (batch) => {
      const data = await this.#fetch("/v1/struct-definition/bulk", { types: batch });
      if (!data?.resolution) return;
      for (const type of Object.keys(data?.resolution)) {
        const typeData = data.resolution[type]?.type_tag;
        if (!typeData) continue;
        results[type] = typeData;
      }
    }));
    return results;
  }
  async #fetch(url, body) {
    if (!this.#url) throw new Error("MVR Api URL is not set for the current client");
    const response = await fetch(`${this.#url}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...MVR_API_HEADER
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to resolve types: ${errorBody?.message}`);
    }
    return response.json();
  }
  async resolvePackage({ package: name, signal }) {
    signal?.throwIfAborted();
    if (!hasMvrName(name)) return { package: name };
    return { package: await raceSignal(this.#mvrPackageDataLoader.load(name), signal) };
  }
  async resolveType({ type, signal }) {
    signal?.throwIfAborted();
    if (!hasMvrName(type)) return { type };
    const mvrTypes = [...extractMvrTypes(type)];
    const resolvedTypes = await raceSignal(this.#mvrTypeDataLoader.loadMany(mvrTypes), signal);
    const typeMap = {};
    for (let i = 0; i < mvrTypes.length; i++) {
      const resolvedType = resolvedTypes[i];
      if (resolvedType instanceof Error) throw resolvedType;
      typeMap[mvrTypes[i]] = resolvedType;
    }
    return { type: replaceMvrNames(type, typeMap) };
  }
  async resolve({ types = [], packages = [], signal }) {
    signal?.throwIfAborted();
    const mvrTypes = /* @__PURE__ */ new Set();
    for (const type of types ?? []) extractMvrTypes(type, mvrTypes);
    const typesArray = [...mvrTypes];
    const [resolvedTypes, resolvedPackages] = await raceSignal(Promise.all([typesArray.length > 0 ? this.#mvrTypeDataLoader.loadMany(typesArray) : [], packages.length > 0 ? this.#mvrPackageDataLoader.loadMany(packages) : []]), signal);
    const typeMap = { ...this.#overrides?.types };
    for (const [i, type] of typesArray.entries()) {
      const resolvedType = resolvedTypes[i];
      if (resolvedType instanceof Error) throw resolvedType;
      typeMap[type] = resolvedType;
    }
    const replacedTypes = {};
    for (const type of types ?? []) replacedTypes[type] = { type: replaceMvrNames(type, typeMap) };
    const replacedPackages = {};
    for (const [i, pkg] of (packages ?? []).entries()) {
      const resolvedPkg = this.#overrides?.packages?.[pkg] ?? resolvedPackages[i];
      if (resolvedPkg instanceof Error) throw resolvedPkg;
      replacedPackages[pkg] = { package: resolvedPkg };
    }
    return {
      types: replacedTypes,
      packages: replacedPackages
    };
  }
};
function validateOverrides(overrides) {
  if (overrides?.packages) for (const [pkg, id] of Object.entries(overrides.packages)) {
    if (!isValidNamedPackage(pkg)) throw new Error(`Invalid package name: ${pkg}`);
    if (!isValidSuiAddress(normalizeSuiAddress(id))) throw new Error(`Invalid package ID: ${id}`);
  }
  if (overrides?.types) for (const [type, val] of Object.entries(overrides.types)) {
    if (parseStructTag(type).typeParams.length > 0) throw new Error("Type overrides must be first-level only. If you want to supply generic types, just pass each type individually.");
    if (!isValidSuiAddress(parseStructTag(val).address)) throw new Error(`Invalid type: ${val}`);
  }
}
function extractMvrTypes(type, types = /* @__PURE__ */ new Set()) {
  if (typeof type === "string" && !hasMvrName(type)) return types;
  if (typeof type === "string" && type.startsWith("vector<") && type.endsWith(">")) return extractMvrTypes(type.slice(7, -1), types);
  const tag = isStructTag(type) ? type : parseStructTag(type);
  if (hasMvrName(tag.address)) types.add(`${tag.address}::${tag.module}::${tag.name}`);
  for (const param of tag.typeParams) extractMvrTypes(param, types);
  return types;
}
function replaceMvrNames(tag, typeCache) {
  if (typeof tag === "string" && !tag.includes("::")) return tag;
  if (typeof tag === "string" && tag.startsWith("vector<") && tag.endsWith(">")) return `vector<${replaceMvrNames(tag.slice(7, -1), typeCache)}>`;
  const type = isStructTag(tag) ? tag : parseStructTag(tag);
  const cacheHit = typeCache[`${type.address}::${type.module}::${type.name}`];
  return normalizeStructTag({
    ...type,
    address: cacheHit ? cacheHit.split("::")[0] : type.address,
    typeParams: type.typeParams.map((param) => replaceMvrNames(param, typeCache))
  });
}
function hasMvrName(nameOrType) {
  return nameOrType.includes(NAME_SEPARATOR2) || nameOrType.includes("@") || nameOrType.includes(".sui");
}
function raceSignal(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() => {
      signal.removeEventListener("abort", onAbort);
    });
  });
}
function isStructTag(type) {
  return typeof type === "object" && "address" in type && "module" in type && "name" in type && "typeParams" in type;
}
function findNamesInTransaction(builder) {
  const packages = /* @__PURE__ */ new Set();
  const types = /* @__PURE__ */ new Set();
  for (const command of builder.commands) switch (command.$kind) {
    case "MakeMoveVec":
      if (command.MakeMoveVec.type) getNamesFromTypeList([command.MakeMoveVec.type]).forEach((type) => {
        types.add(type);
      });
      break;
    case "MoveCall":
      const moveCall = command.MoveCall;
      const pkg = moveCall.package.split("::")[0];
      if (hasMvrName(pkg)) {
        if (!isValidNamedPackage(pkg)) throw new Error(`Invalid package name: ${pkg}`);
        packages.add(pkg);
      }
      getNamesFromTypeList(moveCall.typeArguments ?? []).forEach((type) => {
        types.add(type);
      });
      break;
    default:
      break;
  }
  return {
    packages: [...packages],
    types: [...types]
  };
}
function replaceNames(builder, resolved) {
  for (const command of builder.commands) {
    if (command.MakeMoveVec?.type) {
      if (!hasMvrName(command.MakeMoveVec.type)) continue;
      if (!resolved.types[command.MakeMoveVec.type]) throw new Error(`No resolution found for type: ${command.MakeMoveVec.type}`);
      command.MakeMoveVec.type = resolved.types[command.MakeMoveVec.type].type;
    }
    const tx = command.MoveCall;
    if (!tx) continue;
    const nameParts = tx.package.split("::");
    const name = nameParts[0];
    if (hasMvrName(name) && !resolved.packages[name]) throw new Error(`No address found for package: ${name}`);
    if (hasMvrName(name)) {
      nameParts[0] = resolved.packages[name].package;
      tx.package = nameParts.join("::");
    }
    const types = tx.typeArguments;
    if (!types) continue;
    for (let i = 0; i < types.length; i++) {
      if (!hasMvrName(types[i])) continue;
      if (!resolved.types[types[i]]) throw new Error(`No resolution found for type: ${types[i]}`);
      types[i] = resolved.types[types[i]].type;
    }
    tx.typeArguments = types;
  }
}
function getNamesFromTypeList(types) {
  const names = /* @__PURE__ */ new Set();
  for (const type of types) if (hasMvrName(type)) {
    if (!isValidNamedType(type)) throw new Error(`Invalid type with names: ${type}`);
    names.add(type);
  }
  return names;
}

// node_modules/@mysten/sui/dist/client/cache.mjs
var ClientCache = class ClientCache2 {
  #prefix;
  #cache;
  constructor({ prefix, cache } = {}) {
    this.#prefix = prefix ?? [];
    this.#cache = cache ?? /* @__PURE__ */ new Map();
  }
  read(key, load) {
    const cacheKey = [this.#prefix, ...key].join(":");
    if (this.#cache.has(cacheKey)) return this.#cache.get(cacheKey);
    const result = load();
    this.#cache.set(cacheKey, result);
    if (typeof result === "object" && result !== null && "then" in result) return Promise.resolve(result).then((v) => {
      this.#cache.set(cacheKey, v);
      return v;
    }).catch((err) => {
      this.#cache.delete(cacheKey);
      throw err;
    });
    return result;
  }
  readSync(key, load) {
    const cacheKey = [this.#prefix, ...key].join(":");
    if (this.#cache.has(cacheKey)) return this.#cache.get(cacheKey);
    const result = load();
    this.#cache.set(cacheKey, result);
    return result;
  }
  clear(prefix) {
    const prefixKey = [...this.#prefix, ...prefix ?? []].join(":");
    if (!prefixKey) {
      this.#cache.clear();
      return;
    }
    for (const key of this.#cache.keys()) if (key.startsWith(prefixKey)) this.#cache.delete(key);
  }
  scope(prefix) {
    return new ClientCache2({
      prefix: [...this.#prefix, ...Array.isArray(prefix) ? prefix : [prefix]],
      cache: this.#cache
    });
  }
};

// node_modules/@mysten/sui/dist/client/client.mjs
var BaseClient = class {
  constructor({ network, base, cache = base?.cache ?? new ClientCache() }) {
    this.network = network;
    this.base = base ?? this;
    this.cache = cache;
  }
  $extend(...registrations) {
    const extensions = Object.fromEntries(registrations.map((registration) => {
      return [registration.name, registration.register(this)];
    }));
    const methodCache = /* @__PURE__ */ new Map();
    return new Proxy(this, { get(target, prop, receiver) {
      if (typeof prop === "string" && prop in extensions) return extensions[prop];
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        if (prop === "$extend") return value.bind(receiver);
        if (!methodCache.has(prop)) methodCache.set(prop, value.bind(target));
        return methodCache.get(prop);
      }
      return value;
    } });
  }
};

// node_modules/@noble/hashes/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
var atitle = (title) => title ? `"${title}" ` : "";
function anumber(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title = "") {
  if (isBytes2(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes = isBytes2(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message);
  throw new RangeError(message);
}
function copyBytes(bytes) {
  return Uint8Array.from(abytes(bytes));
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new TypeError("expected hash wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
  if (h.outputLen < 1 || h.blockLen < 1)
    throw new Error("hash blockLen / outputLen must be >= 1");
}
var aobject = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
};
var aopts = (value, label) => {
  aobject(value, label);
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    throw new TypeError(`"${label}" expected plain object`);
  if (Object.hasOwn(value, "__proto__"))
    throw new TypeError(`"${label}.__proto__" is not allowed`);
};
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
var swap8IfBE = isLE ? (n) => n : (n) => byteSwap(n) >>> 0;
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
var swap32IfBE = isLE ? (u) => u : byteSwap32;
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  return ch >= 48 && ch <= 57 ? ch - 48 : ch >= 65 && ch <= 70 ? ch - (65 - 10) : ch >= 97 && ch <= 102 ? ch - (97 - 10) : void 0;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  if (hasHexBuiltin) {
    try {
      return Uint8Array.fromHex(hex);
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new RangeError(error.message);
      throw error;
    }
  }
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + hl);
  const array2 = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array2[ai] = n1 * 16 + n2;
  }
  return array2;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new TypeError("string expected");
  const encoded = new TextEncoder().encode(str);
  try {
    return new Uint8Array(encoded);
  } finally {
    clean(encoded);
  }
}
function kdfInputToBytes(data, errorTitle = "") {
  if (typeof data === "string")
    return utf8ToBytes(data);
  return abytes(data, void 0, errorTitle);
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function checkOpts(defaults, opts, title = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher(hashCons, info = {}) {
  if (typeof hashCons !== "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info = checkOpts({}, info, "info");
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  anumber(bytesLength, "bytesLength");
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (bytesLength > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/hashes/_blake.js
var BSIGMA = /* @__PURE__ */ Uint8Array.from([
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  14,
  10,
  4,
  8,
  9,
  15,
  13,
  6,
  1,
  12,
  0,
  2,
  11,
  7,
  5,
  3,
  11,
  8,
  12,
  0,
  5,
  2,
  15,
  13,
  10,
  14,
  3,
  6,
  7,
  1,
  9,
  4,
  7,
  9,
  3,
  1,
  13,
  12,
  11,
  14,
  2,
  6,
  5,
  10,
  4,
  0,
  15,
  8,
  9,
  0,
  5,
  7,
  2,
  4,
  10,
  15,
  14,
  1,
  11,
  12,
  6,
  8,
  3,
  13,
  2,
  12,
  6,
  10,
  0,
  11,
  8,
  3,
  4,
  13,
  7,
  5,
  15,
  14,
  1,
  9,
  12,
  5,
  1,
  15,
  14,
  13,
  4,
  10,
  0,
  7,
  6,
  3,
  9,
  2,
  8,
  11,
  13,
  11,
  7,
  14,
  12,
  1,
  3,
  9,
  5,
  0,
  15,
  4,
  8,
  6,
  2,
  10,
  6,
  15,
  14,
  9,
  11,
  3,
  0,
  8,
  12,
  2,
  13,
  7,
  1,
  4,
  10,
  5,
  10,
  2,
  8,
  4,
  7,
  6,
  1,
  5,
  15,
  11,
  9,
  14,
  3,
  12,
  13,
  0,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  14,
  10,
  4,
  8,
  9,
  15,
  13,
  6,
  1,
  12,
  0,
  2,
  11,
  7,
  5,
  3,
  // Blake1, unused in others
  11,
  8,
  12,
  0,
  5,
  2,
  15,
  13,
  10,
  14,
  3,
  6,
  7,
  1,
  9,
  4,
  7,
  9,
  3,
  1,
  13,
  12,
  11,
  14,
  2,
  6,
  5,
  10,
  4,
  0,
  15,
  8,
  9,
  0,
  5,
  7,
  2,
  4,
  10,
  15,
  14,
  1,
  11,
  12,
  6,
  8,
  3,
  13,
  2,
  12,
  6,
  10,
  0,
  11,
  8,
  3,
  4,
  13,
  7,
  5,
  15,
  14,
  1,
  9
]);

// node_modules/@noble/hashes/_u64.js
var U32_MASK64 = /* @__PURE__ */ (() => BigInt(2 ** 32 - 1))();
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var fromNumH = (n) => n / 2 ** 32 | 0;
var fromNumL = (n) => n >>> 0;
function setU64FromNum(view, byteOffset, n, isLE2) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view.setUint32(byteOffset, isLE2 ? l : h, isLE2);
  view.setUint32(byteOffset + 4, isLE2 ? h : l, isLE2);
}
var shrSH = (h, _l, s) => h >>> s;
var shrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
var rotr32H = (_h, l) => l;
var rotr32L = (h, _l) => h;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// node_modules/@noble/hashes/_md.js
var HashMD = class {
  blockLen;
  outputLen;
  canXOF = false;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE2) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE2;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    let processed = false;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        processed = true;
        continue;
      }
      buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
        processed = true;
      }
    }
    this.length += data.length;
    if (processed)
      this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    buffer.fill(0, pos);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      buffer.fill(0);
    }
    setU64FromNum(view, blockLen - 8, this.length * 8, isLE2);
    this.process(view, 0);
    this.roundClean();
    const oview = out === buffer ? view : createView(out);
    const len = this.outputLen;
    const outLen = len / 4;
    const state = this.get();
    if (len % 4 || outLen > state.length)
      throw new Error("invalid outputLen");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE2);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneIntoMeta(to) {
    const { buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (pos)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// node_modules/@noble/hashes/blake2.js
var B2B_IV = /* @__PURE__ */ Uint32Array.from([
  4089235720,
  1779033703,
  2227873595,
  3144134277,
  4271175723,
  1013904242,
  1595750129,
  2773480762,
  2917565137,
  1359893119,
  725511199,
  2600822924,
  4215389547,
  528734635,
  327033209,
  1541459225
]);
var BBUF = /* @__PURE__ */ new Uint32Array(32);
function G1b(a, b, c, d, msg, x) {
  const Xl = msg[x], Xh = msg[x + 1];
  let Al = BBUF[2 * a], Ah = BBUF[2 * a + 1];
  let Bl = BBUF[2 * b], Bh = BBUF[2 * b + 1];
  let Cl = BBUF[2 * c], Ch = BBUF[2 * c + 1];
  let Dl = BBUF[2 * d], Dh = BBUF[2 * d + 1];
  const ll = add3L(Al, Bl, Xl);
  Ah = add3H(ll, Ah, Bh, Xh);
  Al = ll | 0;
  let xh = Dh ^ Ah, xl = Dl ^ Al;
  Dh = rotr32H(xh, xl);
  Dl = rotr32L(xh, xl);
  ({ h: Ch, l: Cl } = add(Ch, Cl, Dh, Dl));
  xh = Bh ^ Ch;
  xl = Bl ^ Cl;
  Bh = rotrSH(xh, xl, 24);
  Bl = rotrSL(xh, xl, 24);
  BBUF[2 * a] = Al;
  BBUF[2 * a + 1] = Ah;
  BBUF[2 * b] = Bl;
  BBUF[2 * b + 1] = Bh;
  BBUF[2 * c] = Cl;
  BBUF[2 * c + 1] = Ch;
  BBUF[2 * d] = Dl;
  BBUF[2 * d + 1] = Dh;
}
function G2b(a, b, c, d, msg, x) {
  const Xl = msg[x], Xh = msg[x + 1];
  let Al = BBUF[2 * a], Ah = BBUF[2 * a + 1];
  let Bl = BBUF[2 * b], Bh = BBUF[2 * b + 1];
  let Cl = BBUF[2 * c], Ch = BBUF[2 * c + 1];
  let Dl = BBUF[2 * d], Dh = BBUF[2 * d + 1];
  const ll = add3L(Al, Bl, Xl);
  Ah = add3H(ll, Ah, Bh, Xh);
  Al = ll | 0;
  let xh = Dh ^ Ah, xl = Dl ^ Al;
  Dh = rotrSH(xh, xl, 16);
  Dl = rotrSL(xh, xl, 16);
  ({ h: Ch, l: Cl } = add(Ch, Cl, Dh, Dl));
  xh = Bh ^ Ch;
  xl = Bl ^ Cl;
  Bh = rotrBH(xh, xl, 63);
  Bl = rotrBL(xh, xl, 63);
  BBUF[2 * a] = Al;
  BBUF[2 * a + 1] = Ah;
  BBUF[2 * b] = Bl;
  BBUF[2 * b + 1] = Bh;
  BBUF[2 * c] = Cl;
  BBUF[2 * c + 1] = Ch;
  BBUF[2 * d] = Dl;
  BBUF[2 * d + 1] = Dh;
}
function checkBlake2Opts(outputLen, opts = {}, keyLen, saltLen, persLen) {
  anumber(keyLen);
  if (outputLen <= 0 || outputLen > keyLen)
    throw new Error('"dkLen" must be 1..' + keyLen + ", got " + outputLen);
  const { key, salt, personalization } = opts;
  if (key !== void 0 && (key.length < 1 || key.length > keyLen))
    throw new Error('"key" expected to be undefined or of length=1..' + keyLen);
  if (salt !== void 0)
    abytes(salt, saltLen, "salt");
  if (personalization !== void 0)
    abytes(personalization, persLen, "personalization");
}
var _BLAKE2 = class {
  buffer;
  buffer32;
  finished = false;
  destroyed = false;
  length = 0;
  pos = 0;
  blockLen;
  outputLen;
  canXOF = false;
  constructor(blockLen, outputLen) {
    anumber(blockLen);
    anumber(outputLen);
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.buffer = new Uint8Array(blockLen);
    this.buffer32 = u32(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { blockLen, buffer, buffer32 } = this;
    const len = data.length;
    const offset = data.byteOffset;
    const buf = data.buffer;
    for (let pos = 0; pos < len; ) {
      if (this.pos === blockLen) {
        swap32IfBE(buffer32);
        this.compress(buffer32, 0, false);
        swap32IfBE(buffer32);
        this.pos = 0;
      }
      const take = Math.min(blockLen - this.pos, len - pos);
      const dataOffset = offset + pos;
      if (take === blockLen && !(dataOffset % 4) && pos + take < len) {
        const data32 = new Uint32Array(buf, dataOffset, Math.floor((len - pos) / 4));
        swap32IfBE(data32);
        for (let pos32 = 0; pos + blockLen < len; pos32 += buffer32.length, pos += blockLen) {
          this.length += blockLen;
          this.compress(data32, pos32, false);
        }
        swap32IfBE(data32);
        continue;
      }
      buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      this.length += take;
      pos += take;
    }
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    if (out.byteOffset & 3)
      throw new RangeError('"output" expected 4-byte aligned byteOffset, got ' + out.byteOffset);
    const { pos, buffer32 } = this;
    this.finished = true;
    this.buffer.fill(0, pos);
    swap32IfBE(buffer32);
    this.compress(buffer32, 0, true);
    swap32IfBE(buffer32);
    const state = this.get();
    const out32 = out === this.buffer ? buffer32 : u32(out);
    const full = Math.floor(this.outputLen / 4);
    for (let i = 0; i < full; i++)
      out32[i] = swap8IfBE(state[i]);
    const tail = this.outputLen % 4;
    if (!tail)
      return;
    const off = full * 4;
    const word = state[full];
    for (let i = 0; i < tail; i++)
      out[off + i] = word >>> 8 * i;
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    const { buffer, length, finished, destroyed, outputLen, pos } = this;
    to ||= new this.constructor({ dkLen: outputLen });
    to.set(...this.get());
    to.buffer.set(buffer);
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    to.outputLen = outputLen;
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var _BLAKE2b = class extends _BLAKE2 {
  // Same IV words as SHA-512 / BLAKE2b, encoded as LE u32 low/high halves.
  v0l = B2B_IV[0] | 0;
  v0h = B2B_IV[1] | 0;
  v1l = B2B_IV[2] | 0;
  v1h = B2B_IV[3] | 0;
  v2l = B2B_IV[4] | 0;
  v2h = B2B_IV[5] | 0;
  v3l = B2B_IV[6] | 0;
  v3h = B2B_IV[7] | 0;
  v4l = B2B_IV[8] | 0;
  v4h = B2B_IV[9] | 0;
  v5l = B2B_IV[10] | 0;
  v5h = B2B_IV[11] | 0;
  v6l = B2B_IV[12] | 0;
  v6h = B2B_IV[13] | 0;
  v7l = B2B_IV[14] | 0;
  v7h = B2B_IV[15] | 0;
  constructor(opts = {}) {
    opts = checkOpts({}, opts);
    const olen = opts.dkLen === void 0 ? 64 : opts.dkLen;
    super(128, olen);
    checkBlake2Opts(olen, opts, 64, 16, 16);
    let { key, personalization, salt } = opts;
    let keyLength = 0;
    if (key !== void 0) {
      abytes(key, void 0, "key");
      keyLength = key.length;
    }
    this.v0l ^= this.outputLen | keyLength << 8 | 1 << 16 | 1 << 24;
    if (salt !== void 0) {
      abytes(salt, void 0, "salt");
      const slt = u32(copyBytes(salt));
      this.v4l ^= swap8IfBE(slt[0]);
      this.v4h ^= swap8IfBE(slt[1]);
      this.v5l ^= swap8IfBE(slt[2]);
      this.v5h ^= swap8IfBE(slt[3]);
    }
    if (personalization !== void 0) {
      abytes(personalization, void 0, "personalization");
      const pers = u32(copyBytes(personalization));
      this.v6l ^= swap8IfBE(pers[0]);
      this.v6h ^= swap8IfBE(pers[1]);
      this.v7l ^= swap8IfBE(pers[2]);
      this.v7h ^= swap8IfBE(pers[3]);
    }
    if (key !== void 0) {
      const tmp = new Uint8Array(this.blockLen);
      tmp.set(key);
      this.update(tmp);
      clean(tmp);
    }
  }
  // prettier-ignore
  get() {
    let { v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h } = this;
    return [v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h];
  }
  // prettier-ignore
  set(v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h) {
    this.v0l = v0l | 0;
    this.v0h = v0h | 0;
    this.v1l = v1l | 0;
    this.v1h = v1h | 0;
    this.v2l = v2l | 0;
    this.v2h = v2h | 0;
    this.v3l = v3l | 0;
    this.v3h = v3h | 0;
    this.v4l = v4l | 0;
    this.v4h = v4h | 0;
    this.v5l = v5l | 0;
    this.v5h = v5h | 0;
    this.v6l = v6l | 0;
    this.v6h = v6h | 0;
    this.v7l = v7l | 0;
    this.v7h = v7h | 0;
  }
  compress(msg, offset, isLast) {
    const { v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h } = this;
    {
      BBUF[0] = v0l;
      BBUF[1] = v0h;
      BBUF[2] = v1l;
      BBUF[3] = v1h;
      BBUF[4] = v2l;
      BBUF[5] = v2h;
      BBUF[6] = v3l;
      BBUF[7] = v3h;
      BBUF[8] = v4l;
      BBUF[9] = v4h;
      BBUF[10] = v5l;
      BBUF[11] = v5h;
      BBUF[12] = v6l;
      BBUF[13] = v6h;
      BBUF[14] = v7l;
      BBUF[15] = v7h;
    }
    BBUF.set(B2B_IV, 16);
    const l = fromNumL(this.length);
    const h = fromNumH(this.length);
    BBUF[24] = B2B_IV[8] ^ l;
    BBUF[25] = B2B_IV[9] ^ h;
    if (isLast) {
      BBUF[28] = ~BBUF[28];
      BBUF[29] = ~BBUF[29];
    }
    let j = 0;
    const s = BSIGMA;
    for (let i = 0; i < 12; i++) {
      G1b(0, 4, 8, 12, msg, offset + 2 * s[j++]);
      G2b(0, 4, 8, 12, msg, offset + 2 * s[j++]);
      G1b(1, 5, 9, 13, msg, offset + 2 * s[j++]);
      G2b(1, 5, 9, 13, msg, offset + 2 * s[j++]);
      G1b(2, 6, 10, 14, msg, offset + 2 * s[j++]);
      G2b(2, 6, 10, 14, msg, offset + 2 * s[j++]);
      G1b(3, 7, 11, 15, msg, offset + 2 * s[j++]);
      G2b(3, 7, 11, 15, msg, offset + 2 * s[j++]);
      G1b(0, 5, 10, 15, msg, offset + 2 * s[j++]);
      G2b(0, 5, 10, 15, msg, offset + 2 * s[j++]);
      G1b(1, 6, 11, 12, msg, offset + 2 * s[j++]);
      G2b(1, 6, 11, 12, msg, offset + 2 * s[j++]);
      G1b(2, 7, 8, 13, msg, offset + 2 * s[j++]);
      G2b(2, 7, 8, 13, msg, offset + 2 * s[j++]);
      G1b(3, 4, 9, 14, msg, offset + 2 * s[j++]);
      G2b(3, 4, 9, 14, msg, offset + 2 * s[j++]);
    }
    this.v0l ^= BBUF[0] ^ BBUF[16];
    this.v0h ^= BBUF[1] ^ BBUF[17];
    this.v1l ^= BBUF[2] ^ BBUF[18];
    this.v1h ^= BBUF[3] ^ BBUF[19];
    this.v2l ^= BBUF[4] ^ BBUF[20];
    this.v2h ^= BBUF[5] ^ BBUF[21];
    this.v3l ^= BBUF[6] ^ BBUF[22];
    this.v3h ^= BBUF[7] ^ BBUF[23];
    this.v4l ^= BBUF[8] ^ BBUF[24];
    this.v4h ^= BBUF[9] ^ BBUF[25];
    this.v5l ^= BBUF[10] ^ BBUF[26];
    this.v5h ^= BBUF[11] ^ BBUF[27];
    this.v6l ^= BBUF[12] ^ BBUF[28];
    this.v6h ^= BBUF[13] ^ BBUF[29];
    this.v7l ^= BBUF[14] ^ BBUF[30];
    this.v7h ^= BBUF[15] ^ BBUF[31];
    clean(BBUF);
  }
  destroy() {
    this.destroyed = true;
    clean(this.buffer32);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var blake2b = /* @__PURE__ */ createHasher((opts) => new _BLAKE2b(opts));

// node_modules/@mysten/sui/dist/utils/dynamic-fields.mjs
function deriveDynamicFieldID(parentId, typeTag, key) {
  const address = suiBcs.Address.serialize(parentId).toBytes();
  const tag = suiBcs.TypeTag.serialize(typeTag).toBytes();
  const keyLength = suiBcs.u64().serialize(key.length).toBytes();
  const hash = blake2b.create({ dkLen: 32 });
  hash.update(new Uint8Array([240]));
  hash.update(address);
  hash.update(keyLength);
  hash.update(key);
  hash.update(tag);
  return `0x${toHex(hash.digest().slice(0, 32))}`;
}

// node_modules/@mysten/sui/dist/client/core.mjs
var DEFAULT_MVR_URLS = {
  mainnet: "https://mainnet.mvr.mystenlabs.com",
  testnet: "https://testnet.mvr.mystenlabs.com"
};
var CoreClient = class extends BaseClient {
  constructor(options) {
    super(options);
    this.core = this;
    this.mvr = new MvrClient({
      cache: this.cache.scope("core.mvr"),
      url: options.mvr?.url ?? DEFAULT_MVR_URLS[this.network],
      pageSize: options.mvr?.pageSize,
      overrides: options.mvr?.overrides
    });
  }
  async getObject(options) {
    const { objectId } = options;
    const { objects: [result] } = await this.getObjects({
      objectIds: [objectId],
      signal: options.signal,
      include: options.include
    });
    if (result instanceof Error) throw result;
    return { object: result };
  }
  async getDynamicField(options) {
    const normalizedNameType = TypeTagSerializer.parseFromStr((await this.core.mvr.resolveType({
      type: options.name.type,
      signal: options.signal
    })).type);
    const fieldId = deriveDynamicFieldID(options.parentId, normalizedNameType, options.name.bcs);
    const { objects: [fieldObject] } = await this.getObjects({
      objectIds: [fieldId],
      signal: options.signal,
      include: {
        previousTransaction: true,
        content: true
      }
    });
    if (fieldObject instanceof Error) throw fieldObject;
    const fieldType = parseStructTag(fieldObject.type);
    const content = await fieldObject.content;
    const nameTypeParam = fieldType.typeParams[0];
    const isDynamicObject = typeof nameTypeParam !== "string" && nameTypeParam.module === "dynamic_object_field" && nameTypeParam.name === "Wrapper";
    const valueBcs = content.slice(SUI_ADDRESS_LENGTH + options.name.bcs.length);
    const valueType = typeof fieldType.typeParams[1] === "string" ? fieldType.typeParams[1] : normalizeStructTag(fieldType.typeParams[1]);
    return { dynamicField: {
      $kind: isDynamicObject ? "DynamicObject" : "DynamicField",
      fieldId: fieldObject.objectId,
      digest: fieldObject.digest,
      version: fieldObject.version,
      type: fieldObject.type,
      previousTransaction: fieldObject.previousTransaction,
      name: {
        type: typeof nameTypeParam === "string" ? nameTypeParam : normalizeStructTag(nameTypeParam),
        bcs: options.name.bcs
      },
      value: {
        type: valueType,
        bcs: valueBcs
      },
      childId: isDynamicObject ? suiBcs.Address.parse(valueBcs) : void 0
    } };
  }
  async getDynamicObjectField(options) {
    const wrappedType = `0x2::dynamic_object_field::Wrapper<${(await this.core.mvr.resolveType({
      type: options.name.type,
      signal: options.signal
    })).type}>`;
    const { dynamicField } = await this.getDynamicField({
      parentId: options.parentId,
      name: {
        type: wrappedType,
        bcs: options.name.bcs
      },
      signal: options.signal
    });
    const { object: object2 } = await this.getObject({
      objectId: dynamicField.childId,
      signal: options.signal,
      include: options.include
    });
    return { object: object2 };
  }
  async waitForTransaction(options) {
    const { signal, timeout = 60 * 1e3, pollSchedule, include } = options;
    const digest = "result" in options && options.result ? (options.result.Transaction ?? options.result.FailedTransaction).digest : options.digest;
    const abortSignal = signal ? AbortSignal.any([AbortSignal.timeout(timeout), signal]) : AbortSignal.timeout(timeout);
    const abortPromise = new Promise((_, reject) => {
      abortSignal.addEventListener("abort", () => reject(abortSignal.reason));
    });
    abortPromise.catch(() => {
    });
    const schedule = pollSchedule ?? [
      0,
      300,
      600,
      1500,
      3500
    ];
    const t0 = Date.now();
    let scheduleIndex = 0;
    const lastInterval = schedule.length > 0 ? schedule[schedule.length - 1] - (schedule[schedule.length - 2] ?? 0) : 2e3;
    while (true) {
      if (scheduleIndex < schedule.length) {
        const remaining = t0 + schedule[scheduleIndex] - Date.now();
        scheduleIndex++;
        if (remaining > 0) await Promise.race([new Promise((resolve) => setTimeout(resolve, remaining)), abortPromise]);
      } else await Promise.race([new Promise((resolve) => setTimeout(resolve, lastInterval)), abortPromise]);
      abortSignal.throwIfAborted();
      try {
        return await this.getTransaction({
          digest,
          include,
          signal: abortSignal
        });
      } catch {
      }
    }
  }
  async signAndExecuteTransaction({ transaction, signer, additionalSignatures = [], ...input }) {
    let transactionBytes;
    if (transaction instanceof Uint8Array) transactionBytes = transaction;
    else {
      transaction.setSenderIfNotSet(signer.toSuiAddress());
      transactionBytes = await transaction.build({ client: this });
    }
    const { signature } = await signer.signTransaction(transactionBytes);
    return this.executeTransaction({
      transaction: transactionBytes,
      signatures: [signature, ...additionalSignatures],
      ...input
    });
  }
};

// node_modules/@mysten/sui/dist/utils/constants.mjs
var MIST_PER_SUI = BigInt(1e9);
var MOVE_STDLIB_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000001";
var SUI_FRAMEWORK_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000002";
var SUI_CLOCK_OBJECT_ID = "0x0000000000000000000000000000000000000000000000000000000000000006";
var SUI_TYPE_ARG = `${SUI_FRAMEWORK_ADDRESS}::sui::SUI`;
var SUI_SYSTEM_STATE_OBJECT_ID = "0x0000000000000000000000000000000000000000000000000000000000000005";
var SUI_RANDOM_OBJECT_ID = "0x0000000000000000000000000000000000000000000000000000000000000008";
var SUI_DENY_LIST_OBJECT_ID = "0x0000000000000000000000000000000000000000000000000000000000000403";
var MOCKED_GAS_OBJECT_ID = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

// node_modules/valibot/dist/index.mjs
var store$4;
var DEFAULT_CONFIG = {
  lang: void 0,
  message: void 0,
  abortEarly: void 0,
  abortPipeEarly: void 0
};
// @__NO_SIDE_EFFECTS__
function getGlobalConfig(config$1) {
  if (!config$1 && !store$4) return DEFAULT_CONFIG;
  return {
    lang: config$1?.lang ?? store$4?.lang,
    message: config$1?.message,
    abortEarly: config$1?.abortEarly ?? store$4?.abortEarly,
    abortPipeEarly: config$1?.abortPipeEarly ?? store$4?.abortPipeEarly
  };
}
var store$3;
// @__NO_SIDE_EFFECTS__
function getGlobalMessage(lang) {
  return store$3?.get(lang);
}
var store$2;
// @__NO_SIDE_EFFECTS__
function getSchemaMessage(lang) {
  return store$2?.get(lang);
}
var store$1;
// @__NO_SIDE_EFFECTS__
function getSpecificMessage(reference, lang) {
  return store$1?.get(reference)?.get(lang);
}
// @__NO_SIDE_EFFECTS__
function _stringify(input) {
  const type = typeof input;
  if (type === "string") return `"${input}"`;
  if (type === "number" || type === "bigint" || type === "boolean") return `${input}`;
  if (type === "object" || type === "function") return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
  return type;
}
function _addIssue(context, label, dataset, config$1, other) {
  const input = other && "input" in other ? other.input : dataset.value;
  const expected = other?.expected ?? context.expects ?? null;
  const received = other?.received ?? /* @__PURE__ */ _stringify(input);
  const issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config$1.lang,
    abortEarly: config$1.abortEarly,
    abortPipeEarly: config$1.abortPipeEarly
  };
  const isSchema = context.kind === "schema";
  const message$1 = other?.message ?? context.message ?? /* @__PURE__ */ getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? /* @__PURE__ */ getSchemaMessage(issue.lang) : null) ?? config$1.message ?? /* @__PURE__ */ getGlobalMessage(issue.lang);
  if (message$1 !== void 0) issue.message = typeof message$1 === "function" ? message$1(issue) : message$1;
  if (isSchema) dataset.typed = false;
  if (dataset.issues) dataset.issues.push(issue);
  else dataset.issues = [issue];
}
// @__NO_SIDE_EFFECTS__
function _isSameValueZero(value1, value2) {
  return value1 === value2 || Number.isNaN(value1) && Number.isNaN(value2);
}
// @__NO_SIDE_EFFECTS__
function _isValidObjectKey(object$1, key) {
  return Object.prototype.hasOwnProperty.call(object$1, key) && key !== "__proto__" && key !== "prototype" && key !== "constructor";
}
// @__NO_SIDE_EFFECTS__
function _joinExpects(values$1, separator) {
  const list = [...new Set(values$1)];
  if (list.length > 1) return `(${list.join(` ${separator} `)})`;
  return list[0] ?? "never";
}
function _standardSchema(schema) {
  schema["~standard"] = {
    version: 1,
    vendor: "valibot",
    validate: (value$1) => schema["~run"]({ value: value$1 }, /* @__PURE__ */ getGlobalConfig())
  };
  return schema;
}
var ValiError = class extends Error {
  /**
  * Creates a Valibot error with useful information.
  *
  * @param issues The error issues.
  */
  constructor(issues) {
    super(issues[0].message);
    this.name = "ValiError";
    this.issues = issues;
  }
};
var EMOJI_REGEX = new RegExp("^(?:[\\u{1F1E6}-\\u{1F1FF}]{2}|\\u{1F3F4}[\\u{E0061}-\\u{E007A}]{2}[\\u{E0030}-\\u{E0039}\\u{E0061}-\\u{E007A}]{1,3}\\u{E007F}|(?:\\p{Emoji}\\uFE0F\\u20E3?|\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|(?![\\p{Emoji_Modifier_Base}\\u{1F1E6}-\\u{1F1FF}])\\p{Emoji_Presentation})(?:\\u200D(?:\\p{Emoji}\\uFE0F\\u20E3?|\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|(?![\\p{Emoji_Modifier_Base}\\u{1F1E6}-\\u{1F1FF}])\\p{Emoji_Presentation}))*)+$", "u");
// @__NO_SIDE_EFFECTS__
function check(requirement, message$1) {
  return {
    kind: "validation",
    type: "check",
    reference: check,
    async: false,
    expects: null,
    requirement,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement(dataset.value)) _addIssue(this, "input", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function integer(message$1) {
  return {
    kind: "validation",
    type: "integer",
    reference: integer,
    async: false,
    expects: null,
    requirement: Number.isInteger,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement(dataset.value)) _addIssue(this, "integer", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function transform(operation) {
  return {
    kind: "transformation",
    type: "transform",
    reference: transform,
    async: false,
    operation,
    "~run"(dataset) {
      dataset.value = this.operation(dataset.value);
      return dataset;
    }
  };
}
var ABORT_EARLY_CONFIG = { abortEarly: true };
// @__NO_SIDE_EFFECTS__
function getFallback(schema, dataset, config$1) {
  return typeof schema.fallback === "function" ? schema.fallback(dataset, config$1) : schema.fallback;
}
// @__NO_SIDE_EFFECTS__
function getDefault(schema, dataset, config$1) {
  return typeof schema.default === "function" ? schema.default(dataset, config$1) : schema.default;
}
// @__NO_SIDE_EFFECTS__
function is(schema, input) {
  return !schema["~run"]({ value: input }, ABORT_EARLY_CONFIG).issues;
}
// @__NO_SIDE_EFFECTS__
function array(item, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "array",
    reference: array,
    expects: "Array",
    async: false,
    item,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < input.length; key++) {
          const value$1 = input[key];
          const itemDataset = this.item["~run"]({ value: value$1 }, config$1);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value$1
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) issue.path.unshift(pathItem);
              else issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = itemDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) dataset.typed = false;
          dataset.value.push(itemDataset.value);
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function bigint(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "bigint",
    reference: bigint,
    expects: "bigint",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "bigint") dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function boolean(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "boolean",
    reference: boolean,
    expects: "boolean",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "boolean") dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function lazy(getter) {
  return _standardSchema({
    kind: "schema",
    type: "lazy",
    reference: lazy,
    expects: "unknown",
    async: false,
    getter,
    "~run"(dataset, config$1) {
      return this.getter(dataset.value)["~run"](dataset, config$1);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function literal(literal_, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "literal",
    reference: literal,
    expects: /* @__PURE__ */ _stringify(literal_),
    async: false,
    literal: literal_,
    message: message$1,
    "~run"(dataset, config$1) {
      if (/* @__PURE__ */ _isSameValueZero(dataset.value, this.literal)) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function nullable(wrapped, default_) {
  return _standardSchema({
    kind: "schema",
    type: "nullable",
    reference: nullable,
    expects: `(${wrapped.expects} | null)`,
    async: false,
    wrapped,
    default: default_,
    "~run"(dataset, config$1) {
      if (dataset.value === null) {
        if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === null) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function nullish(wrapped, default_) {
  return _standardSchema({
    kind: "schema",
    type: "nullish",
    reference: nullish,
    expects: `(${wrapped.expects} | null | undefined)`,
    async: false,
    wrapped,
    default: default_,
    "~run"(dataset, config$1) {
      if (dataset.value === null || dataset.value === void 0) {
        if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === null || dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function number(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "number",
    reference: number,
    expects: "number",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "number" && !isNaN(dataset.value)) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function object(entries$1, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "object",
    reference: object,
    expects: "Object",
    async: false,
    entries: entries$1,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const valueSchema = this.entries[key];
          if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && valueSchema.default !== void 0) {
            const value$1 = key in input ? input[key] : /* @__PURE__ */ getDefault(valueSchema);
            const valueDataset = valueSchema["~run"]({ value: value$1 }, config$1);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value$1
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) issue.path.unshift(pathItem);
                else issue.path = [pathItem];
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) dataset.issues = valueDataset.issues;
              if (config$1.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) dataset.typed = false;
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
          else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config$1, {
              input: void 0,
              expected: `"${key}"`,
              path: [{
                type: "object",
                origin: "key",
                input,
                key,
                value: input[key]
              }]
            });
            if (config$1.abortEarly) break;
          }
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function optional(wrapped, default_) {
  return _standardSchema({
    kind: "schema",
    type: "optional",
    reference: optional,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    "~run"(dataset, config$1) {
      if (dataset.value === void 0) {
        if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function picklist(options, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "picklist",
    reference: picklist,
    expects: /* @__PURE__ */ _joinExpects(options.map(_stringify), "|"),
    async: false,
    options,
    message: message$1,
    "~run"(dataset, config$1) {
      if (this.options.includes(dataset.value)) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function record(key, value$1, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "record",
    reference: record,
    expects: "Object",
    async: false,
    key,
    value: value$1,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const entryKey in input) if (/* @__PURE__ */ _isValidObjectKey(input, entryKey)) {
          const entryValue = input[entryKey];
          const keyDataset = this.key["~run"]({ value: entryKey }, config$1);
          if (keyDataset.issues) {
            const pathItem = {
              type: "object",
              origin: "key",
              input,
              key: entryKey,
              value: entryValue
            };
            for (const issue of keyDataset.issues) {
              issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = keyDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          const valueDataset = this.value["~run"]({ value: entryValue }, config$1);
          if (valueDataset.issues) {
            const pathItem = {
              type: "object",
              origin: "value",
              input,
              key: entryKey,
              value: entryValue
            };
            for (const issue of valueDataset.issues) {
              if (issue.path) issue.path.unshift(pathItem);
              else issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = valueDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!keyDataset.typed || !valueDataset.typed) dataset.typed = false;
          if (keyDataset.typed) dataset.value[keyDataset.value] = valueDataset.value;
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function string(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "string") dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function tuple(items, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "tuple",
    reference: tuple,
    expects: "Array",
    async: false,
    items,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < this.items.length; key++) {
          const value$1 = input[key];
          const itemDataset = this.items[key]["~run"]({ value: value$1 }, config$1);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value$1
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) issue.path.unshift(pathItem);
              else issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = itemDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) dataset.typed = false;
          dataset.value.push(itemDataset.value);
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function _subIssues(datasets) {
  let issues;
  if (datasets) for (const dataset of datasets) if (issues) for (const issue of dataset.issues) issues.push(issue);
  else issues = dataset.issues;
  return issues;
}
// @__NO_SIDE_EFFECTS__
function union(options, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "union",
    reference: union,
    expects: /* @__PURE__ */ _joinExpects(options.map((option2) => option2.expects), "|"),
    async: false,
    options,
    message: message$1,
    "~run"(dataset, config$1) {
      let validDataset;
      let typedDatasets;
      let untypedDatasets;
      for (const schema of this.options) {
        const optionDataset = schema["~run"]({ value: dataset.value }, config$1);
        if (optionDataset.typed) if (optionDataset.issues) if (typedDatasets) typedDatasets.push(optionDataset);
        else typedDatasets = [optionDataset];
        else {
          validDataset = optionDataset;
          break;
        }
        else if (untypedDatasets) untypedDatasets.push(optionDataset);
        else untypedDatasets = [optionDataset];
      }
      if (validDataset) return validDataset;
      if (typedDatasets) {
        if (typedDatasets.length === 1) return typedDatasets[0];
        _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(typedDatasets) });
        dataset.typed = true;
      } else if (untypedDatasets?.length === 1) return untypedDatasets[0];
      else _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(untypedDatasets) });
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function unknown() {
  return _standardSchema({
    kind: "schema",
    type: "unknown",
    reference: unknown,
    expects: "unknown",
    async: false,
    "~run"(dataset) {
      dataset.typed = true;
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function variant(key, options, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "variant",
    reference: variant,
    expects: "Object",
    async: false,
    key,
    options,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        let outputDataset;
        let maxDiscriminatorPriority = 0;
        let invalidDiscriminatorKey = this.key;
        let expectedDiscriminators = [];
        const parseOptions = (variant$1, allKeys) => {
          for (const schema of variant$1.options) {
            if (schema.type === "variant") parseOptions(schema, new Set(allKeys).add(schema.key));
            else {
              let keysAreValid = true;
              let currentPriority = 0;
              for (const currentKey of allKeys) {
                const discriminatorSchema = schema.entries[currentKey];
                if (currentKey in input ? discriminatorSchema["~run"]({
                  typed: false,
                  value: input[currentKey]
                }, ABORT_EARLY_CONFIG).issues : discriminatorSchema.type !== "exact_optional" && discriminatorSchema.type !== "optional" && discriminatorSchema.type !== "nullish") {
                  keysAreValid = false;
                  if (invalidDiscriminatorKey !== currentKey && (maxDiscriminatorPriority < currentPriority || maxDiscriminatorPriority === currentPriority && currentKey in input && !(invalidDiscriminatorKey in input))) {
                    maxDiscriminatorPriority = currentPriority;
                    invalidDiscriminatorKey = currentKey;
                    expectedDiscriminators = [];
                  }
                  if (invalidDiscriminatorKey === currentKey) expectedDiscriminators.push(schema.entries[currentKey].expects);
                  break;
                }
                currentPriority++;
              }
              if (keysAreValid) {
                const optionDataset = schema["~run"]({ value: input }, config$1);
                if (!outputDataset || !outputDataset.typed && optionDataset.typed) outputDataset = optionDataset;
              }
            }
            if (outputDataset && !outputDataset.issues) break;
          }
        };
        parseOptions(this, /* @__PURE__ */ new Set([this.key]));
        if (outputDataset) return outputDataset;
        _addIssue(this, "type", dataset, config$1, {
          input: input[invalidDiscriminatorKey],
          expected: /* @__PURE__ */ _joinExpects(expectedDiscriminators, "|"),
          path: [{
            type: "object",
            origin: "value",
            input,
            key: invalidDiscriminatorKey,
            value: input[invalidDiscriminatorKey]
          }]
        });
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function parse(schema, input, config$1) {
  const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config$1));
  if (dataset.issues) throw new ValiError(dataset.issues);
  return dataset.value;
}
// @__NO_SIDE_EFFECTS__
function pipe(...pipe$1) {
  return _standardSchema({
    ...pipe$1[0],
    pipe: pipe$1,
    "~run"(dataset, config$1) {
      for (const item of pipe$1) if (item.kind !== "metadata") {
        if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
          dataset.typed = false;
          break;
        }
        if (!dataset.issues || !config$1.abortEarly && !config$1.abortPipeEarly) dataset = item["~run"](dataset, config$1);
      }
      return dataset;
    }
  });
}

// node_modules/@mysten/sui/dist/transactions/data/internal.mjs
function safeEnum(options) {
  const schemas = Object.keys(options).map((key) => object({
    [key]: options[key],
    $kind: literal(key)
  }));
  return pipe(unknown(), check((input) => unsupportedEnumVariantMessage(input, options) === void 0, ({ input, message }) => unsupportedEnumVariantMessage(input, options) ?? message), transform(addMissingEnumKind), variant("$kind", schemas));
}
function getEnumKind(input) {
  if (typeof input !== "object" || input === null) return null;
  if ("$kind" in input && typeof input.$kind === "string") return input.$kind;
  return Object.keys(input).find((key) => key !== "$kind") ?? null;
}
function addMissingEnumKind(input) {
  if (typeof input !== "object" || input === null || "$kind" in input) return input;
  const kind = getEnumKind(input);
  return kind === null ? input : {
    ...input,
    $kind: kind
  };
}
function unsupportedEnumVariantMessage(input, options) {
  const kind = getEnumKind(input);
  if (kind === null || Object.hasOwn(options, kind)) return void 0;
  return `Unsupported enum variant "${kind}". Expected one of: ${Object.keys(options).map((key) => `"${key}"`).join(", ")}.`;
}
function withKind(key, schema) {
  return pipe(object({
    ...schema.entries,
    $kind: optional(literal(key))
  }), transform((value) => ({
    ...value,
    $kind: key
  })));
}
var SuiAddress = pipe(string(), transform((value) => normalizeSuiAddress(value)), check(isValidSuiAddress));
var ObjectID = SuiAddress;
var BCSBytes = string();
var JsonU64 = pipe(union([string(), pipe(number(), integer())]), check((val) => {
  try {
    BigInt(val);
    return BigInt(val) >= 0 && BigInt(val) <= 18446744073709551615n;
  } catch {
    return false;
  }
}, "Invalid u64"));
var U32 = pipe(number(), integer(), check((val) => val >= 0 && val < 2 ** 32, "Invalid u32"));
var ObjectRefSchema = object({
  objectId: SuiAddress,
  version: JsonU64,
  digest: string()
});
var ArgumentSchema = union([
  withKind("GasCoin", object({ GasCoin: literal(true) })),
  withKind("Input", object({
    Input: pipe(number(), integer()),
    type: optional(union([
      literal("pure"),
      literal("object"),
      literal("withdrawal")
    ]))
  })),
  withKind("Result", object({ Result: pipe(number(), integer()) })),
  withKind("NestedResult", object({ NestedResult: tuple([pipe(number(), integer()), pipe(number(), integer())]) }))
]);
var GasDataSchema = object({
  budget: nullable(JsonU64),
  price: nullable(JsonU64),
  owner: nullable(SuiAddress),
  payment: nullable(array(ObjectRefSchema))
});
var StructTagSchema = object({
  address: string(),
  module: string(),
  name: string(),
  typeParams: array(string())
});
var OpenSignatureBodySchema = union([
  object({ $kind: literal("address") }),
  object({ $kind: literal("bool") }),
  object({ $kind: literal("u8") }),
  object({ $kind: literal("u16") }),
  object({ $kind: literal("u32") }),
  object({ $kind: literal("u64") }),
  object({ $kind: literal("u128") }),
  object({ $kind: literal("u256") }),
  object({ $kind: literal("unknown") }),
  object({
    $kind: literal("vector"),
    vector: lazy(() => OpenSignatureBodySchema)
  }),
  object({
    $kind: literal("datatype"),
    datatype: object({
      typeName: string(),
      typeParameters: array(lazy(() => OpenSignatureBodySchema))
    })
  }),
  object({
    $kind: literal("typeParameter"),
    index: pipe(number(), integer())
  })
]);
var OpenSignatureSchema = object({
  reference: nullable(union([
    literal("mutable"),
    literal("immutable"),
    literal("unknown")
  ])),
  body: OpenSignatureBodySchema
});
var ProgrammableMoveCallSchema = object({
  package: ObjectID,
  module: string(),
  function: string(),
  typeArguments: array(string()),
  arguments: array(ArgumentSchema),
  _argumentTypes: optional(nullable(array(OpenSignatureSchema)))
});
var $Intent = object({
  name: string(),
  inputs: record(string(), union([ArgumentSchema, array(ArgumentSchema)])),
  data: record(string(), unknown())
});
var CommandSchema = safeEnum({
  MoveCall: ProgrammableMoveCallSchema,
  TransferObjects: object({
    objects: array(ArgumentSchema),
    address: ArgumentSchema
  }),
  SplitCoins: object({
    coin: ArgumentSchema,
    amounts: array(ArgumentSchema)
  }),
  MergeCoins: object({
    destination: ArgumentSchema,
    sources: array(ArgumentSchema)
  }),
  Publish: object({
    modules: array(BCSBytes),
    dependencies: array(ObjectID)
  }),
  MakeMoveVec: object({
    type: nullable(string()),
    elements: array(ArgumentSchema)
  }),
  Upgrade: object({
    modules: array(BCSBytes),
    dependencies: array(ObjectID),
    package: ObjectID,
    ticket: ArgumentSchema
  }),
  $Intent
});
var ObjectArgSchema = safeEnum({
  ImmOrOwnedObject: ObjectRefSchema,
  SharedObject: object({
    objectId: ObjectID,
    initialSharedVersion: JsonU64,
    mutable: boolean()
  }),
  Receiving: ObjectRefSchema
});
var ReservationSchema = safeEnum({ MaxAmountU64: JsonU64 });
var WithdrawalTypeArgSchema = safeEnum({ Balance: string() });
var WithdrawFromSchema = safeEnum({
  Sender: literal(true),
  Sponsor: literal(true),
  SenderAllowance: object({
    funder: SuiAddress,
    allowance: ObjectID
  })
});
var FundsWithdrawalArgSchema = object({
  reservation: ReservationSchema,
  typeArg: WithdrawalTypeArgSchema,
  withdrawFrom: WithdrawFromSchema
});
var CallArgSchema = safeEnum({
  Object: ObjectArgSchema,
  Pure: object({ bytes: BCSBytes }),
  UnresolvedPure: object({ value: unknown() }),
  UnresolvedObject: object({
    objectId: ObjectID,
    version: optional(nullable(JsonU64)),
    digest: optional(nullable(string())),
    initialSharedVersion: optional(nullable(JsonU64)),
    mutable: optional(nullable(boolean()))
  }),
  FundsWithdrawal: FundsWithdrawalArgSchema
});
var NormalizedCallArg = safeEnum({
  Object: ObjectArgSchema,
  Pure: object({ bytes: BCSBytes })
});
var ValidDuringSchema = object({
  minEpoch: nullable(JsonU64),
  maxEpoch: nullable(JsonU64),
  minTimestamp: nullable(JsonU64),
  maxTimestamp: nullable(JsonU64),
  chain: string(),
  nonce: U32
});
var AllowedProposersSchema = object({
  epoch: JsonU64,
  proposers: pipe(array(U32), check((proposers) => proposers.length > 0, "Allowed proposers must not be empty"))
});
var ValiditySchema = object({
  ...ValidDuringSchema.entries,
  allowedProposers: nullable(AllowedProposersSchema)
});
var TransactionExpiration2 = safeEnum({
  None: literal(true),
  Epoch: JsonU64,
  ValidDuring: ValidDuringSchema,
  Validity: ValiditySchema
});
var TransactionDataSchema = object({
  version: literal(2),
  sender: nullish(SuiAddress),
  expiration: nullish(TransactionExpiration2),
  gasData: GasDataSchema,
  inputs: array(CallArgSchema),
  commands: array(CommandSchema)
});

// node_modules/@mysten/sui/dist/transactions/data/v1.mjs
var ObjectRef = object({
  digest: string(),
  objectId: string(),
  version: union([
    pipe(number(), integer()),
    string(),
    bigint()
  ])
});
var ObjectArg2 = safeEnum({
  ImmOrOwned: ObjectRef,
  Shared: object({
    objectId: ObjectID,
    initialSharedVersion: JsonU64,
    mutable: boolean()
  }),
  Receiving: ObjectRef
});
var NormalizedCallArg2 = safeEnum({
  Object: ObjectArg2,
  Pure: array(pipe(number(), integer()))
});
var TransactionInput = union([object({
  kind: literal("Input"),
  index: pipe(number(), integer()),
  value: unknown(),
  type: optional(literal("object"))
}), object({
  kind: literal("Input"),
  index: pipe(number(), integer()),
  value: unknown(),
  type: literal("pure")
})]);
var TransactionExpiration3 = union([
  object({ Epoch: pipe(number(), integer()) }),
  object({ None: nullable(literal(true)) }),
  object({ ValidDuring: ValidDuringSchema }),
  object({ Validity: ValiditySchema })
]);
function expirationToV1(expiration) {
  if (!expiration) return null;
  switch (expiration.$kind) {
    case "Epoch":
      return { Epoch: Number(expiration.Epoch) };
    case "ValidDuring":
      return { ValidDuring: expiration.ValidDuring };
    case "Validity":
      return { Validity: expiration.Validity };
    case "None":
      return { None: true };
    default:
      throw new Error(`Unknown transaction expiration: ${JSON.stringify(expiration)}`);
  }
}
function expirationFromV1(expiration) {
  if (!expiration) return null;
  if ("Epoch" in expiration) return { Epoch: expiration.Epoch };
  if ("ValidDuring" in expiration) return { ValidDuring: expiration.ValidDuring };
  if ("Validity" in expiration) return { Validity: expiration.Validity };
  if ("None" in expiration) return { None: true };
  throw new Error(`Unknown transaction expiration in v1 transaction data: ${Object.keys(expiration).join(", ")}`);
}
var StringEncodedBigint = pipe(union([
  number(),
  string(),
  bigint()
]), check((val) => {
  if (![
    "string",
    "number",
    "bigint"
  ].includes(typeof val)) return false;
  try {
    BigInt(val);
    return true;
  } catch {
    return false;
  }
}));
var TypeTag2 = union([
  object({ bool: nullable(literal(true)) }),
  object({ u8: nullable(literal(true)) }),
  object({ u64: nullable(literal(true)) }),
  object({ u128: nullable(literal(true)) }),
  object({ address: nullable(literal(true)) }),
  object({ signer: nullable(literal(true)) }),
  object({ vector: lazy(() => TypeTag2) }),
  object({ struct: lazy(() => StructTag2) }),
  object({ u16: nullable(literal(true)) }),
  object({ u32: nullable(literal(true)) }),
  object({ u256: nullable(literal(true)) })
]);
var StructTag2 = object({
  address: string(),
  module: string(),
  name: string(),
  typeParams: array(TypeTag2)
});
var GasConfig = object({
  budget: optional(StringEncodedBigint),
  price: optional(StringEncodedBigint),
  payment: optional(array(ObjectRef)),
  owner: optional(string())
});
var TransactionArgumentTypes = [
  TransactionInput,
  object({ kind: literal("GasCoin") }),
  object({
    kind: literal("Result"),
    index: pipe(number(), integer())
  }),
  object({
    kind: literal("NestedResult"),
    index: pipe(number(), integer()),
    resultIndex: pipe(number(), integer())
  })
];
var TransactionArgument = union([...TransactionArgumentTypes]);
var MoveCallTransaction = object({
  kind: literal("MoveCall"),
  target: pipe(string(), check((target) => target.split("::").length === 3)),
  typeArguments: array(string()),
  arguments: array(TransactionArgument)
});
var TransferObjectsTransaction = object({
  kind: literal("TransferObjects"),
  objects: array(TransactionArgument),
  address: TransactionArgument
});
var SplitCoinsTransaction = object({
  kind: literal("SplitCoins"),
  coin: TransactionArgument,
  amounts: array(TransactionArgument)
});
var MergeCoinsTransaction = object({
  kind: literal("MergeCoins"),
  destination: TransactionArgument,
  sources: array(TransactionArgument)
});
var MakeMoveVecTransaction = object({
  kind: literal("MakeMoveVec"),
  type: union([object({ Some: TypeTag2 }), object({ None: nullable(literal(true)) })]),
  objects: array(TransactionArgument)
});
var TransactionType = union([...[
  MoveCallTransaction,
  TransferObjectsTransaction,
  SplitCoinsTransaction,
  MergeCoinsTransaction,
  object({
    kind: literal("Publish"),
    modules: array(array(pipe(number(), integer()))),
    dependencies: array(string())
  }),
  object({
    kind: literal("Upgrade"),
    modules: array(array(pipe(number(), integer()))),
    dependencies: array(string()),
    packageId: string(),
    ticket: TransactionArgument
  }),
  MakeMoveVecTransaction
]]);
var SerializedTransactionDataV1 = object({
  version: literal(1),
  sender: optional(string()),
  expiration: nullish(TransactionExpiration3),
  gasConfig: GasConfig,
  inputs: array(TransactionInput),
  transactions: array(TransactionType)
});
function serializeV1TransactionData(transactionData) {
  const inputs = transactionData.inputs.map((input, index) => {
    if (input.Object) return {
      kind: "Input",
      index,
      value: { Object: input.Object.ImmOrOwnedObject ? { ImmOrOwned: input.Object.ImmOrOwnedObject } : input.Object.Receiving ? { Receiving: {
        digest: input.Object.Receiving.digest,
        version: input.Object.Receiving.version,
        objectId: input.Object.Receiving.objectId
      } } : { Shared: {
        mutable: input.Object.SharedObject.mutable,
        initialSharedVersion: input.Object.SharedObject.initialSharedVersion,
        objectId: input.Object.SharedObject.objectId
      } } },
      type: "object"
    };
    if (input.Pure) return {
      kind: "Input",
      index,
      value: { Pure: Array.from(fromBase64(input.Pure.bytes)) },
      type: "pure"
    };
    if (input.UnresolvedPure) return {
      kind: "Input",
      type: "pure",
      index,
      value: input.UnresolvedPure.value
    };
    if (input.UnresolvedObject) return {
      kind: "Input",
      type: "object",
      index,
      value: input.UnresolvedObject.objectId
    };
    throw new Error("Invalid input");
  });
  return {
    version: 1,
    sender: transactionData.sender ?? void 0,
    expiration: expirationToV1(transactionData.expiration),
    gasConfig: {
      owner: transactionData.gasData.owner ?? void 0,
      budget: transactionData.gasData.budget ?? void 0,
      price: transactionData.gasData.price ?? void 0,
      payment: transactionData.gasData.payment ?? void 0
    },
    inputs,
    transactions: transactionData.commands.map((command) => {
      if (command.MakeMoveVec) return {
        kind: "MakeMoveVec",
        type: command.MakeMoveVec.type === null ? { None: true } : { Some: TypeTagSerializer.parseFromStr(command.MakeMoveVec.type) },
        objects: command.MakeMoveVec.elements.map((arg) => convertTransactionArgument(arg, inputs))
      };
      if (command.MergeCoins) return {
        kind: "MergeCoins",
        destination: convertTransactionArgument(command.MergeCoins.destination, inputs),
        sources: command.MergeCoins.sources.map((arg) => convertTransactionArgument(arg, inputs))
      };
      if (command.MoveCall) return {
        kind: "MoveCall",
        target: `${command.MoveCall.package}::${command.MoveCall.module}::${command.MoveCall.function}`,
        typeArguments: command.MoveCall.typeArguments,
        arguments: command.MoveCall.arguments.map((arg) => convertTransactionArgument(arg, inputs))
      };
      if (command.Publish) return {
        kind: "Publish",
        modules: command.Publish.modules.map((mod2) => Array.from(fromBase64(mod2))),
        dependencies: command.Publish.dependencies
      };
      if (command.SplitCoins) return {
        kind: "SplitCoins",
        coin: convertTransactionArgument(command.SplitCoins.coin, inputs),
        amounts: command.SplitCoins.amounts.map((arg) => convertTransactionArgument(arg, inputs))
      };
      if (command.TransferObjects) return {
        kind: "TransferObjects",
        objects: command.TransferObjects.objects.map((arg) => convertTransactionArgument(arg, inputs)),
        address: convertTransactionArgument(command.TransferObjects.address, inputs)
      };
      if (command.Upgrade) return {
        kind: "Upgrade",
        modules: command.Upgrade.modules.map((mod2) => Array.from(fromBase64(mod2))),
        dependencies: command.Upgrade.dependencies,
        packageId: command.Upgrade.package,
        ticket: convertTransactionArgument(command.Upgrade.ticket, inputs)
      };
      throw new Error(`Unknown transaction ${Object.keys(command)}`);
    })
  };
}
function convertTransactionArgument(arg, inputs) {
  if (arg.$kind === "GasCoin") return { kind: "GasCoin" };
  if (arg.$kind === "Result") return {
    kind: "Result",
    index: arg.Result
  };
  if (arg.$kind === "NestedResult") return {
    kind: "NestedResult",
    index: arg.NestedResult[0],
    resultIndex: arg.NestedResult[1]
  };
  if (arg.$kind === "Input") return inputs[arg.Input];
  throw new Error(`Invalid argument ${Object.keys(arg)}`);
}
function transactionDataFromV1(data) {
  return parse(TransactionDataSchema, {
    version: 2,
    sender: data.sender ?? null,
    expiration: expirationFromV1(data.expiration),
    gasData: {
      owner: data.gasConfig.owner ?? null,
      budget: data.gasConfig.budget?.toString() ?? null,
      price: data.gasConfig.price?.toString() ?? null,
      payment: data.gasConfig.payment?.map((ref) => ({
        digest: ref.digest,
        objectId: ref.objectId,
        version: ref.version.toString()
      })) ?? null
    },
    inputs: data.inputs.map((input) => {
      if (input.kind === "Input") {
        if (is(NormalizedCallArg2, input.value)) {
          const value = parse(NormalizedCallArg2, input.value);
          if (value.Object) {
            if (value.Object.ImmOrOwned) return { Object: { ImmOrOwnedObject: {
              objectId: value.Object.ImmOrOwned.objectId,
              version: String(value.Object.ImmOrOwned.version),
              digest: value.Object.ImmOrOwned.digest
            } } };
            if (value.Object.Shared) return { Object: { SharedObject: {
              mutable: value.Object.Shared.mutable ?? null,
              initialSharedVersion: value.Object.Shared.initialSharedVersion,
              objectId: value.Object.Shared.objectId
            } } };
            if (value.Object.Receiving) return { Object: { Receiving: {
              digest: value.Object.Receiving.digest,
              version: String(value.Object.Receiving.version),
              objectId: value.Object.Receiving.objectId
            } } };
            throw new Error("Invalid object input");
          }
          return { Pure: { bytes: toBase64(new Uint8Array(value.Pure)) } };
        }
        if (input.type === "object") return { UnresolvedObject: { objectId: input.value } };
        return { UnresolvedPure: { value: input.value } };
      }
      throw new Error("Invalid input");
    }),
    commands: data.transactions.map((transaction) => {
      switch (transaction.kind) {
        case "MakeMoveVec":
          return { MakeMoveVec: {
            type: "Some" in transaction.type ? TypeTagSerializer.tagToString(transaction.type.Some) : null,
            elements: transaction.objects.map((arg) => parseV1TransactionArgument(arg))
          } };
        case "MergeCoins":
          return { MergeCoins: {
            destination: parseV1TransactionArgument(transaction.destination),
            sources: transaction.sources.map((arg) => parseV1TransactionArgument(arg))
          } };
        case "MoveCall": {
          const [pkg, mod2, fn] = transaction.target.split("::");
          return { MoveCall: {
            package: pkg,
            module: mod2,
            function: fn,
            typeArguments: transaction.typeArguments,
            arguments: transaction.arguments.map((arg) => parseV1TransactionArgument(arg))
          } };
        }
        case "Publish":
          return { Publish: {
            modules: transaction.modules.map((mod2) => toBase64(Uint8Array.from(mod2))),
            dependencies: transaction.dependencies
          } };
        case "SplitCoins":
          return { SplitCoins: {
            coin: parseV1TransactionArgument(transaction.coin),
            amounts: transaction.amounts.map((arg) => parseV1TransactionArgument(arg))
          } };
        case "TransferObjects":
          return { TransferObjects: {
            objects: transaction.objects.map((arg) => parseV1TransactionArgument(arg)),
            address: parseV1TransactionArgument(transaction.address)
          } };
        case "Upgrade":
          return { Upgrade: {
            modules: transaction.modules.map((mod2) => toBase64(Uint8Array.from(mod2))),
            dependencies: transaction.dependencies,
            package: transaction.packageId,
            ticket: parseV1TransactionArgument(transaction.ticket)
          } };
      }
      throw new Error(`Unknown transaction ${Object.keys(transaction)}`);
    })
  });
}
function parseV1TransactionArgument(arg) {
  switch (arg.kind) {
    case "GasCoin":
      return { GasCoin: true };
    case "Result":
      return { Result: arg.index };
    case "NestedResult":
      return { NestedResult: [arg.index, arg.resultIndex] };
    case "Input":
      return { Input: arg.index };
  }
}

// node_modules/@mysten/sui/dist/transactions/hash.mjs
function hashTypedData(typeTag, data) {
  const typeTagBytes = Array.from(`${typeTag}::`).map((e) => e.charCodeAt(0));
  const dataWithTag = new Uint8Array(typeTagBytes.length + data.length);
  dataWithTag.set(typeTagBytes);
  dataWithTag.set(data, typeTagBytes.length);
  return blake2b(dataWithTag, { dkLen: 32 });
}

// node_modules/@mysten/sui/dist/transactions/utils.mjs
function getIdFromCallArg(arg) {
  if (typeof arg === "string") return normalizeSuiAddress(arg);
  if (arg.Object) {
    if (arg.Object.ImmOrOwnedObject) return normalizeSuiAddress(arg.Object.ImmOrOwnedObject.objectId);
    if (arg.Object.Receiving) return normalizeSuiAddress(arg.Object.Receiving.objectId);
    return normalizeSuiAddress(arg.Object.SharedObject.objectId);
  }
  if (arg.UnresolvedObject) return normalizeSuiAddress(arg.UnresolvedObject.objectId);
}
function remapCommandArguments(command, inputMapping, commandMapping) {
  const remapArg = (arg) => {
    switch (arg.$kind) {
      case "Input": {
        const newInputIndex = inputMapping.get(arg.Input);
        if (newInputIndex === void 0) throw new Error(`Input ${arg.Input} not found in input mapping`);
        return {
          ...arg,
          Input: newInputIndex
        };
      }
      case "Result": {
        const newCommandIndex = commandMapping.get(arg.Result);
        if (newCommandIndex !== void 0) return {
          ...arg,
          Result: newCommandIndex
        };
        return arg;
      }
      case "NestedResult": {
        const newCommandIndex = commandMapping.get(arg.NestedResult[0]);
        if (newCommandIndex !== void 0) return {
          ...arg,
          NestedResult: [newCommandIndex, arg.NestedResult[1]]
        };
        return arg;
      }
      default:
        return arg;
    }
  };
  switch (command.$kind) {
    case "MoveCall":
      command.MoveCall.arguments = command.MoveCall.arguments.map(remapArg);
      break;
    case "TransferObjects":
      command.TransferObjects.objects = command.TransferObjects.objects.map(remapArg);
      command.TransferObjects.address = remapArg(command.TransferObjects.address);
      break;
    case "SplitCoins":
      command.SplitCoins.coin = remapArg(command.SplitCoins.coin);
      command.SplitCoins.amounts = command.SplitCoins.amounts.map(remapArg);
      break;
    case "MergeCoins":
      command.MergeCoins.destination = remapArg(command.MergeCoins.destination);
      command.MergeCoins.sources = command.MergeCoins.sources.map(remapArg);
      break;
    case "MakeMoveVec":
      command.MakeMoveVec.elements = command.MakeMoveVec.elements.map(remapArg);
      break;
    case "Upgrade":
      command.Upgrade.ticket = remapArg(command.Upgrade.ticket);
      break;
    case "$Intent": {
      const inputs = command.$Intent.inputs;
      command.$Intent.inputs = {};
      for (const [key, value] of Object.entries(inputs)) command.$Intent.inputs[key] = Array.isArray(value) ? value.map(remapArg) : remapArg(value);
      break;
    }
    case "Publish":
      break;
  }
}

// node_modules/@mysten/sui/dist/transactions/TransactionData.mjs
function prepareSuiAddress(address) {
  return normalizeSuiAddress(address).replace("0x", "");
}
var TransactionDataBuilder = class TransactionDataBuilder2 {
  static fromKindBytes(bytes) {
    const programmableTx = suiBcs.TransactionKind.parse(bytes).ProgrammableTransaction;
    if (!programmableTx) throw new Error("Unable to deserialize from bytes.");
    return TransactionDataBuilder2.restore({
      version: 2,
      sender: null,
      expiration: null,
      gasData: {
        budget: null,
        owner: null,
        payment: null,
        price: null
      },
      inputs: programmableTx.inputs,
      commands: programmableTx.commands
    });
  }
  static fromBytes(bytes) {
    const data = suiBcs.TransactionData.parse(bytes)?.V1;
    const programmableTx = data.kind.ProgrammableTransaction;
    if (!data || !programmableTx) throw new Error("Unable to deserialize from bytes.");
    return TransactionDataBuilder2.restore({
      version: 2,
      sender: data.sender,
      expiration: data.expiration,
      gasData: data.gasData,
      inputs: programmableTx.inputs,
      commands: programmableTx.commands
    });
  }
  static restore(data) {
    if (data.version === 2) return new TransactionDataBuilder2(parse(TransactionDataSchema, data));
    else return new TransactionDataBuilder2(parse(TransactionDataSchema, transactionDataFromV1(data)));
  }
  /**
  * Generate transaction digest.
  *
  * @param bytes BCS serialized transaction data
  * @returns transaction digest.
  */
  static getDigestFromBytes(bytes) {
    return toBase58(hashTypedData("TransactionData", bytes));
  }
  constructor(clone) {
    this.version = 2;
    this.sender = clone?.sender ?? null;
    this.expiration = clone?.expiration ?? null;
    this.inputs = clone?.inputs ?? [];
    this.commands = clone?.commands ?? [];
    this.gasData = clone?.gasData ?? {
      budget: null,
      price: null,
      owner: null,
      payment: null
    };
  }
  build({ maxSizeBytes = Infinity, overrides, onlyTransactionKind } = {}) {
    const inputs = this.inputs;
    const commands = this.commands;
    const kind = { ProgrammableTransaction: {
      inputs,
      commands
    } };
    if (onlyTransactionKind) return suiBcs.TransactionKind.serialize(kind, { maxSize: maxSizeBytes }).toBytes();
    const expiration = overrides?.expiration ?? this.expiration;
    const sender = overrides?.sender ?? this.sender;
    const gasData = {
      ...this.gasData,
      ...overrides?.gasData
    };
    if (!sender) throw new Error("Missing transaction sender");
    if (!gasData.budget) throw new Error("Missing gas budget");
    if (!gasData.payment) throw new Error("Missing gas payment");
    if (!gasData.price) throw new Error("Missing gas price");
    const transactionData = {
      sender: prepareSuiAddress(sender),
      expiration: expiration ? expiration : { None: true },
      gasData: {
        payment: gasData.payment,
        owner: prepareSuiAddress(this.gasData.owner ?? sender),
        price: BigInt(gasData.price),
        budget: BigInt(gasData.budget)
      },
      kind: { ProgrammableTransaction: {
        inputs,
        commands
      } }
    };
    return suiBcs.TransactionData.serialize({ V1: transactionData }, { maxSize: maxSizeBytes }).toBytes();
  }
  addInput(type, arg) {
    const index = this.inputs.length;
    this.inputs.push(arg);
    return {
      Input: index,
      type,
      $kind: "Input"
    };
  }
  getInputUses(index, fn) {
    this.mapArguments((arg, command) => {
      if (arg.$kind === "Input" && arg.Input === index) fn(arg, command);
      return arg;
    });
  }
  mapCommandArguments(index, fn) {
    const command = this.commands[index];
    switch (command.$kind) {
      case "MoveCall":
        command.MoveCall.arguments = command.MoveCall.arguments.map((arg) => fn(arg, command, index));
        break;
      case "TransferObjects":
        command.TransferObjects.objects = command.TransferObjects.objects.map((arg) => fn(arg, command, index));
        command.TransferObjects.address = fn(command.TransferObjects.address, command, index);
        break;
      case "SplitCoins":
        command.SplitCoins.coin = fn(command.SplitCoins.coin, command, index);
        command.SplitCoins.amounts = command.SplitCoins.amounts.map((arg) => fn(arg, command, index));
        break;
      case "MergeCoins":
        command.MergeCoins.destination = fn(command.MergeCoins.destination, command, index);
        command.MergeCoins.sources = command.MergeCoins.sources.map((arg) => fn(arg, command, index));
        break;
      case "MakeMoveVec":
        command.MakeMoveVec.elements = command.MakeMoveVec.elements.map((arg) => fn(arg, command, index));
        break;
      case "Upgrade":
        command.Upgrade.ticket = fn(command.Upgrade.ticket, command, index);
        break;
      case "$Intent":
        const inputs = command.$Intent.inputs;
        command.$Intent.inputs = {};
        for (const [key, value] of Object.entries(inputs)) command.$Intent.inputs[key] = Array.isArray(value) ? value.map((arg) => fn(arg, command, index)) : fn(value, command, index);
        break;
      case "Publish":
        break;
      default:
        throw new Error(`Unexpected transaction kind: ${command.$kind}`);
    }
  }
  mapArguments(fn) {
    for (const commandIndex of this.commands.keys()) this.mapCommandArguments(commandIndex, fn);
  }
  replaceCommand(index, replacement, resultIndex = index) {
    if (!Array.isArray(replacement)) {
      this.commands[index] = replacement;
      return;
    }
    const sizeDiff = replacement.length - 1;
    this.commands.splice(index, 1, ...structuredClone(replacement));
    this.mapArguments((arg, _command, commandIndex) => {
      if (commandIndex < index + replacement.length) return arg;
      if (typeof resultIndex !== "number") {
        if (arg.$kind === "Result" && arg.Result === index || arg.$kind === "NestedResult" && arg.NestedResult[0] === index) if (!("NestedResult" in arg) || arg.NestedResult[1] === 0) return parse(ArgumentSchema, structuredClone(resultIndex));
        else throw new Error(`Cannot replace command ${index} with a specific result type: NestedResult[${index}, ${arg.NestedResult[1]}] references a nested element that cannot be mapped to the replacement result`);
      }
      switch (arg.$kind) {
        case "Result":
          if (arg.Result === index && typeof resultIndex === "number") arg.Result = resultIndex;
          if (arg.Result > index) arg.Result += sizeDiff;
          break;
        case "NestedResult":
          if (arg.NestedResult[0] === index && typeof resultIndex === "number") return {
            $kind: "NestedResult",
            NestedResult: [resultIndex, arg.NestedResult[1]]
          };
          if (arg.NestedResult[0] > index) arg.NestedResult[0] += sizeDiff;
          break;
      }
      return arg;
    });
  }
  replaceCommandWithTransaction(index, otherTransaction, result) {
    if (result.$kind !== "Result" && result.$kind !== "NestedResult") throw new Error("Result must be of kind Result or NestedResult");
    this.insertTransaction(index, otherTransaction);
    this.replaceCommand(index + otherTransaction.commands.length, [], "Result" in result ? { NestedResult: [result.Result + index, 0] } : { NestedResult: [result.NestedResult[0] + index, result.NestedResult[1]] });
  }
  insertTransaction(atCommandIndex, otherTransaction) {
    const inputMapping = /* @__PURE__ */ new Map();
    const commandMapping = /* @__PURE__ */ new Map();
    for (let i = 0; i < otherTransaction.inputs.length; i++) {
      const otherInput = otherTransaction.inputs[i];
      const id = getIdFromCallArg(otherInput);
      let existingIndex = -1;
      if (id !== void 0) {
        existingIndex = this.inputs.findIndex((input) => getIdFromCallArg(input) === id);
        if (existingIndex !== -1 && this.inputs[existingIndex].Object?.SharedObject && otherInput.Object?.SharedObject) this.inputs[existingIndex].Object.SharedObject.mutable = this.inputs[existingIndex].Object.SharedObject.mutable || otherInput.Object.SharedObject.mutable;
      }
      if (existingIndex !== -1) inputMapping.set(i, existingIndex);
      else {
        const newIndex = this.inputs.length;
        this.inputs.push(otherInput);
        inputMapping.set(i, newIndex);
      }
    }
    for (let i = 0; i < otherTransaction.commands.length; i++) commandMapping.set(i, atCommandIndex + i);
    const remappedCommands = [];
    for (let i = 0; i < otherTransaction.commands.length; i++) {
      const command = structuredClone(otherTransaction.commands[i]);
      remapCommandArguments(command, inputMapping, commandMapping);
      remappedCommands.push(command);
    }
    this.commands.splice(atCommandIndex, 0, ...remappedCommands);
    const sizeDiff = remappedCommands.length;
    if (sizeDiff > 0) this.mapArguments((arg, _command, commandIndex) => {
      if (commandIndex >= atCommandIndex && commandIndex < atCommandIndex + remappedCommands.length) return arg;
      switch (arg.$kind) {
        case "Result":
          if (arg.Result >= atCommandIndex) arg.Result += sizeDiff;
          break;
        case "NestedResult":
          if (arg.NestedResult[0] >= atCommandIndex) arg.NestedResult[0] += sizeDiff;
          break;
      }
      return arg;
    });
  }
  getDigest() {
    const bytes = this.build({ onlyTransactionKind: false });
    return TransactionDataBuilder2.getDigestFromBytes(bytes);
  }
  snapshot() {
    return parse(TransactionDataSchema, this);
  }
  getData() {
    return this.snapshot();
  }
  shallowClone() {
    return new TransactionDataBuilder2({
      version: this.version,
      sender: this.sender,
      expiration: this.expiration,
      gasData: { ...this.gasData },
      inputs: [...this.inputs],
      commands: [...this.commands]
    });
  }
  applyResolvedData(resolved) {
    if (!this.sender) this.sender = resolved.sender ?? null;
    if (!this.expiration) this.expiration = resolved.expiration ?? null;
    if (!this.gasData.budget) this.gasData.budget = resolved.gasData.budget;
    if (!this.gasData.owner) this.gasData.owner = resolved.gasData.owner ?? null;
    if (!this.gasData.payment) this.gasData.payment = resolved.gasData.payment;
    if (!this.gasData.price) this.gasData.price = resolved.gasData.price;
    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i];
      const resolvedInput = resolved.inputs[i];
      switch (input.$kind) {
        case "UnresolvedPure":
          if (resolvedInput.$kind !== "Pure") throw new Error(`Expected input at index ${i} to resolve to a Pure argument, but got ${JSON.stringify(resolvedInput)}`);
          this.inputs[i] = resolvedInput;
          break;
        case "UnresolvedObject":
          if (resolvedInput.$kind !== "Object") throw new Error(`Expected input at index ${i} to resolve to an Object argument, but got ${JSON.stringify(resolvedInput)}`);
          if (resolvedInput.Object.$kind === "ImmOrOwnedObject" || resolvedInput.Object.$kind === "Receiving") {
            const original = input.UnresolvedObject;
            const resolved$1 = resolvedInput.Object.ImmOrOwnedObject ?? resolvedInput.Object.Receiving;
            if (normalizeSuiAddress(original.objectId) !== normalizeSuiAddress(resolved$1.objectId) || original.version != null && original.version !== resolved$1.version || original.digest != null && original.digest !== resolved$1.digest || original.mutable != null || original.initialSharedVersion != null) throw new Error(`Input at index ${i} did not match unresolved object. ${JSON.stringify(original)} is not compatible with ${JSON.stringify(resolved$1)}`);
          } else if (resolvedInput.Object.$kind === "SharedObject") {
            const original = input.UnresolvedObject;
            const resolved$1 = resolvedInput.Object.SharedObject;
            if (normalizeSuiAddress(original.objectId) !== normalizeSuiAddress(resolved$1.objectId) || original.initialSharedVersion != null && original.initialSharedVersion !== resolved$1.initialSharedVersion || original.mutable != null && original.mutable !== resolved$1.mutable || original.version != null || original.digest != null) throw new Error(`Input at index ${i} did not match unresolved object. ${JSON.stringify(original)} is not compatible with ${JSON.stringify(resolved$1)}`);
          } else throw new Error(`Input at index ${i} resolved to an unexpected Object kind: ${JSON.stringify(resolvedInput.Object)}`);
          this.inputs[i] = resolvedInput;
          break;
      }
    }
  }
};

// node_modules/@mysten/sui/dist/client/utils.mjs
var ordinalRules = new Intl.PluralRules("en-US", { type: "ordinal" });
var ordinalSuffixes = /* @__PURE__ */ new Map([
  ["one", "st"],
  ["two", "nd"],
  ["few", "rd"],
  ["other", "th"]
]);
function formatOrdinal(n) {
  return `${n}${ordinalSuffixes.get(ordinalRules.select(n))}`;
}
function formatMoveAbortMessage(options) {
  const { command, location, abortCode, cleverError } = options;
  const parts = [];
  if (command != null) parts.push(`MoveAbort in ${formatOrdinal(command + 1)} command`);
  else parts.push("MoveAbort");
  if (cleverError?.constantName) {
    const errorStr = cleverError.value ? `'${cleverError.constantName}': ${cleverError.value}` : `'${cleverError.constantName}'`;
    parts.push(errorStr);
  } else parts.push(`abort code: ${abortCode}`);
  if (location?.package && location?.module) {
    const locationStr = [`in '${[
      location.package.startsWith("0x") ? location.package : `0x${location.package}`,
      location.module,
      location.functionName
    ].filter(Boolean).join("::")}'`];
    if (cleverError?.lineNumber != null) locationStr.push(`(line ${cleverError.lineNumber})`);
    else if (location.instruction != null) locationStr.push(`(instruction ${location.instruction})`);
    parts.push(locationStr.join(" "));
  }
  return parts.join(", ");
}
var MinimalEffectsWithError = suiBcs.struct("MinimalEffectsWithError", { status: ExecutionStatus });
var MinimalTransactionEffectsWithError = suiBcs.enum("MinimalTransactionEffectsWithError", {
  V1: MinimalEffectsWithError,
  V2: MinimalEffectsWithError
});
var MinimalExecutionStatusNoError = suiBcs.enum("MinimalExecutionStatusNoError", {
  Success: null,
  Failed: null
});
var MinimalEffectsNoError = suiBcs.struct("MinimalEffectsNoError", { status: MinimalExecutionStatusNoError });
var MinimalTransactionEffectsNoError = suiBcs.enum("MinimalTransactionEffectsNoError", {
  V1: MinimalEffectsNoError,
  V2: MinimalEffectsNoError
});
function transactionBytesHaveEmptyGasPayment(bytes) {
  try {
    return suiBcs.TransactionData.parse(bytes).V1?.gasData.payment?.length === 0;
  } catch {
    return false;
  }
}
function isMockedGasObjectId(objectId) {
  return objectId != null && normalizeSuiAddress(objectId) === MOCKED_GAS_OBJECT_ID;
}

// node_modules/@mysten/sui/dist/client/errors.mjs
var SuiClientError = class extends Error {
};
var SimulationError = class extends SuiClientError {
  constructor(message, options) {
    super(message, { cause: options?.cause });
    this.executionError = options?.executionError;
  }
};
var ObjectError = class extends SuiClientError {
  constructor(code, message, options) {
    super(message, { cause: options?.cause });
    this.code = code;
    this.reason = options?.reason ?? "unknown";
    this.objectId = options?.objectId;
  }
};
var TRANSACTION_ERROR_MESSAGES = { notFound: (digest) => `Transaction ${digest} not found` };
var TransactionError = class extends SuiClientError {
  constructor(reason, digest, options) {
    super(TRANSACTION_ERROR_MESSAGES[reason](digest), options);
    this.reason = reason;
    this.digest = digest;
  }
};

// node_modules/@mysten/sui/dist/grpc/proto/google/protobuf/struct.mjs
var import_runtime = __toESM(require_commonjs(), 1);
var NullValue = /* @__PURE__ */ (function(NullValue$1) {
  NullValue$1[NullValue$1["NULL_VALUE"] = 0] = "NULL_VALUE";
  return NullValue$1;
})({});
var Struct$Type = class extends import_runtime.MessageType {
  constructor() {
    super("google.protobuf.Struct", [{
      no: 1,
      name: "fields",
      kind: "map",
      K: 9,
      V: {
        kind: "message",
        T: () => Value
      }
    }]);
  }
  /**
  * Encode `Struct` to JSON object.
  */
  internalJsonWrite(message, options) {
    let json = {};
    for (let [k, v] of Object.entries(message.fields)) json[k] = Value.toJson(v);
    return json;
  }
  /**
  * Decode `Struct` from JSON object.
  */
  internalJsonRead(json, options, target) {
    if (!(0, import_runtime.isJsonObject)(json)) throw new globalThis.Error("Unable to parse message " + this.typeName + " from JSON " + (0, import_runtime.typeofJsonValue)(json) + ".");
    if (!target) target = this.create();
    for (let [k, v] of globalThis.Object.entries(json)) target.fields[k] = Value.fromJson(v);
    return target;
  }
};
var Struct = new Struct$Type();
var Value$Type = class extends import_runtime.MessageType {
  constructor() {
    super("google.protobuf.Value", [
      {
        no: 1,
        name: "null_value",
        kind: "enum",
        oneof: "kind",
        T: () => ["google.protobuf.NullValue", NullValue]
      },
      {
        no: 2,
        name: "number_value",
        kind: "scalar",
        oneof: "kind",
        T: 1
      },
      {
        no: 3,
        name: "string_value",
        kind: "scalar",
        oneof: "kind",
        T: 9
      },
      {
        no: 4,
        name: "bool_value",
        kind: "scalar",
        oneof: "kind",
        T: 8
      },
      {
        no: 5,
        name: "struct_value",
        kind: "message",
        oneof: "kind",
        T: () => Struct
      },
      {
        no: 6,
        name: "list_value",
        kind: "message",
        oneof: "kind",
        T: () => ListValue
      }
    ]);
  }
  /**
  * Encode `Value` to JSON value.
  */
  internalJsonWrite(message, options) {
    if (message.kind.oneofKind === void 0) throw new globalThis.Error();
    switch (message.kind.oneofKind) {
      case void 0:
        throw new globalThis.Error();
      case "boolValue":
        return message.kind.boolValue;
      case "nullValue":
        return null;
      case "numberValue":
        let numberValue = message.kind.numberValue;
        if (typeof numberValue == "number" && !Number.isFinite(numberValue)) throw new globalThis.Error();
        return numberValue;
      case "stringValue":
        return message.kind.stringValue;
      case "listValue":
        let listValueField = this.fields.find((f) => f.no === 6);
        if (listValueField?.kind !== "message") throw new globalThis.Error();
        return listValueField.T().toJson(message.kind.listValue);
      case "structValue":
        let structValueField = this.fields.find((f) => f.no === 5);
        if (structValueField?.kind !== "message") throw new globalThis.Error();
        return structValueField.T().toJson(message.kind.structValue);
    }
  }
  /**
  * Decode `Value` from JSON value.
  */
  internalJsonRead(json, options, target) {
    if (!target) target = this.create();
    switch (typeof json) {
      case "number":
        target.kind = {
          oneofKind: "numberValue",
          numberValue: json
        };
        break;
      case "string":
        target.kind = {
          oneofKind: "stringValue",
          stringValue: json
        };
        break;
      case "boolean":
        target.kind = {
          oneofKind: "boolValue",
          boolValue: json
        };
        break;
      case "object":
        if (json === null) target.kind = {
          oneofKind: "nullValue",
          nullValue: NullValue.NULL_VALUE
        };
        else if (globalThis.Array.isArray(json)) target.kind = {
          oneofKind: "listValue",
          listValue: ListValue.fromJson(json)
        };
        else target.kind = {
          oneofKind: "structValue",
          structValue: Struct.fromJson(json)
        };
        break;
      default:
        throw new globalThis.Error("Unable to parse " + this.typeName + " from JSON " + (0, import_runtime.typeofJsonValue)(json));
    }
    return target;
  }
};
var Value = new Value$Type();
var ListValue$Type = class extends import_runtime.MessageType {
  constructor() {
    super("google.protobuf.ListValue", [{
      no: 1,
      name: "values",
      kind: "message",
      repeat: 2,
      T: () => Value
    }]);
  }
  /**
  * Encode `ListValue` to JSON array.
  */
  internalJsonWrite(message, options) {
    return message.values.map((v) => Value.toJson(v));
  }
  /**
  * Decode `ListValue` from JSON array.
  */
  internalJsonRead(json, options, target) {
    if (!globalThis.Array.isArray(json)) throw new globalThis.Error("Unable to parse " + this.typeName + " from JSON " + (0, import_runtime.typeofJsonValue)(json));
    if (!target) target = this.create();
    let values = json.map((v) => Value.fromJson(v));
    target.values.push(...values);
    return target;
  }
};
var ListValue = new ListValue$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/move_package.mjs
var import_runtime2 = __toESM(require_commonjs(), 1);
var DatatypeDescriptor_DatatypeKind = /* @__PURE__ */ (function(DatatypeDescriptor_DatatypeKind$1) {
  DatatypeDescriptor_DatatypeKind$1[DatatypeDescriptor_DatatypeKind$1["DATATYPE_KIND_UNKNOWN"] = 0] = "DATATYPE_KIND_UNKNOWN";
  DatatypeDescriptor_DatatypeKind$1[DatatypeDescriptor_DatatypeKind$1["STRUCT"] = 1] = "STRUCT";
  DatatypeDescriptor_DatatypeKind$1[DatatypeDescriptor_DatatypeKind$1["ENUM"] = 2] = "ENUM";
  return DatatypeDescriptor_DatatypeKind$1;
})({});
var OpenSignatureBody_Type = /* @__PURE__ */ (function(OpenSignatureBody_Type$1) {
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["TYPE_UNKNOWN"] = 0] = "TYPE_UNKNOWN";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["ADDRESS"] = 1] = "ADDRESS";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["BOOL"] = 2] = "BOOL";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["U8"] = 3] = "U8";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["U16"] = 4] = "U16";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["U32"] = 5] = "U32";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["U64"] = 6] = "U64";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["U128"] = 7] = "U128";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["U256"] = 8] = "U256";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["VECTOR"] = 9] = "VECTOR";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["DATATYPE"] = 10] = "DATATYPE";
  OpenSignatureBody_Type$1[OpenSignatureBody_Type$1["TYPE_PARAMETER"] = 11] = "TYPE_PARAMETER";
  return OpenSignatureBody_Type$1;
})({});
var FunctionDescriptor_Visibility = /* @__PURE__ */ (function(FunctionDescriptor_Visibility$1) {
  FunctionDescriptor_Visibility$1[FunctionDescriptor_Visibility$1["VISIBILITY_UNKNOWN"] = 0] = "VISIBILITY_UNKNOWN";
  FunctionDescriptor_Visibility$1[FunctionDescriptor_Visibility$1["PRIVATE"] = 1] = "PRIVATE";
  FunctionDescriptor_Visibility$1[FunctionDescriptor_Visibility$1["PUBLIC"] = 2] = "PUBLIC";
  FunctionDescriptor_Visibility$1[FunctionDescriptor_Visibility$1["FRIEND"] = 3] = "FRIEND";
  return FunctionDescriptor_Visibility$1;
})({});
var OpenSignature_Reference = /* @__PURE__ */ (function(OpenSignature_Reference$1) {
  OpenSignature_Reference$1[OpenSignature_Reference$1["REFERENCE_UNKNOWN"] = 0] = "REFERENCE_UNKNOWN";
  OpenSignature_Reference$1[OpenSignature_Reference$1["IMMUTABLE"] = 1] = "IMMUTABLE";
  OpenSignature_Reference$1[OpenSignature_Reference$1["MUTABLE"] = 2] = "MUTABLE";
  return OpenSignature_Reference$1;
})({});
var Ability = /* @__PURE__ */ (function(Ability$1) {
  Ability$1[Ability$1["ABILITY_UNKNOWN"] = 0] = "ABILITY_UNKNOWN";
  Ability$1[Ability$1["COPY"] = 1] = "COPY";
  Ability$1[Ability$1["DROP"] = 2] = "DROP";
  Ability$1[Ability$1["STORE"] = 3] = "STORE";
  Ability$1[Ability$1["KEY"] = 4] = "KEY";
  return Ability$1;
})({});
var Package$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.Package", [
      {
        no: 1,
        name: "storage_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "original_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "modules",
        kind: "message",
        repeat: 2,
        T: () => Module
      },
      {
        no: 5,
        name: "type_origins",
        kind: "message",
        repeat: 2,
        T: () => TypeOrigin2
      },
      {
        no: 6,
        name: "linkage",
        kind: "message",
        repeat: 2,
        T: () => Linkage
      }
    ]);
  }
};
var Package = new Package$Type();
var Module$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.Module", [
      {
        no: 1,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "contents",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 3,
        name: "datatypes",
        kind: "message",
        repeat: 2,
        T: () => DatatypeDescriptor
      },
      {
        no: 4,
        name: "functions",
        kind: "message",
        repeat: 2,
        T: () => FunctionDescriptor
      }
    ]);
  }
};
var Module = new Module$Type();
var DatatypeDescriptor$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.DatatypeDescriptor", [
      {
        no: 1,
        name: "type_name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "defining_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "module",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "abilities",
        kind: "enum",
        repeat: 1,
        T: () => ["sui.rpc.v2.Ability", Ability]
      },
      {
        no: 6,
        name: "type_parameters",
        kind: "message",
        repeat: 2,
        T: () => TypeParameter
      },
      {
        no: 7,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.DatatypeDescriptor.DatatypeKind", DatatypeDescriptor_DatatypeKind]
      },
      {
        no: 8,
        name: "fields",
        kind: "message",
        repeat: 2,
        T: () => FieldDescriptor
      },
      {
        no: 9,
        name: "variants",
        kind: "message",
        repeat: 2,
        T: () => VariantDescriptor
      }
    ]);
  }
};
var DatatypeDescriptor = new DatatypeDescriptor$Type();
var TypeParameter$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.TypeParameter", [{
      no: 1,
      name: "constraints",
      kind: "enum",
      repeat: 1,
      T: () => ["sui.rpc.v2.Ability", Ability]
    }, {
      no: 2,
      name: "is_phantom",
      kind: "scalar",
      opt: true,
      T: 8
    }]);
  }
};
var TypeParameter = new TypeParameter$Type();
var FieldDescriptor$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.FieldDescriptor", [
      {
        no: 1,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "position",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "type",
        kind: "message",
        T: () => OpenSignatureBody
      }
    ]);
  }
};
var FieldDescriptor = new FieldDescriptor$Type();
var VariantDescriptor$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.VariantDescriptor", [
      {
        no: 1,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "position",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "fields",
        kind: "message",
        repeat: 2,
        T: () => FieldDescriptor
      }
    ]);
  }
};
var VariantDescriptor = new VariantDescriptor$Type();
var OpenSignatureBody$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.OpenSignatureBody", [
      {
        no: 1,
        name: "type",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.OpenSignatureBody.Type", OpenSignatureBody_Type]
      },
      {
        no: 2,
        name: "type_name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "type_parameter_instantiation",
        kind: "message",
        repeat: 2,
        T: () => OpenSignatureBody
      },
      {
        no: 4,
        name: "type_parameter",
        kind: "scalar",
        opt: true,
        T: 13
      }
    ]);
  }
};
var OpenSignatureBody = new OpenSignatureBody$Type();
var FunctionDescriptor$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.FunctionDescriptor", [
      {
        no: 1,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "visibility",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.FunctionDescriptor.Visibility", FunctionDescriptor_Visibility]
      },
      {
        no: 6,
        name: "is_entry",
        kind: "scalar",
        opt: true,
        T: 8
      },
      {
        no: 7,
        name: "type_parameters",
        kind: "message",
        repeat: 2,
        T: () => TypeParameter
      },
      {
        no: 8,
        name: "parameters",
        kind: "message",
        repeat: 2,
        T: () => OpenSignature
      },
      {
        no: 9,
        name: "returns",
        kind: "message",
        repeat: 2,
        T: () => OpenSignature
      }
    ]);
  }
};
var FunctionDescriptor = new FunctionDescriptor$Type();
var OpenSignature$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.OpenSignature", [{
      no: 1,
      name: "reference",
      kind: "enum",
      opt: true,
      T: () => ["sui.rpc.v2.OpenSignature.Reference", OpenSignature_Reference]
    }, {
      no: 2,
      name: "body",
      kind: "message",
      T: () => OpenSignatureBody
    }]);
  }
};
var OpenSignature = new OpenSignature$Type();
var TypeOrigin$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.TypeOrigin", [
      {
        no: 1,
        name: "module_name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "datatype_name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "package_id",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var TypeOrigin2 = new TypeOrigin$Type();
var Linkage$Type = class extends import_runtime2.MessageType {
  constructor() {
    super("sui.rpc.v2.Linkage", [
      {
        no: 1,
        name: "original_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "upgraded_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "upgraded_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var Linkage = new Linkage$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/owner.mjs
var import_runtime3 = __toESM(require_commonjs(), 1);
var Owner_OwnerKind = /* @__PURE__ */ (function(Owner_OwnerKind$1) {
  Owner_OwnerKind$1[Owner_OwnerKind$1["OWNER_KIND_UNKNOWN"] = 0] = "OWNER_KIND_UNKNOWN";
  Owner_OwnerKind$1[Owner_OwnerKind$1["ADDRESS"] = 1] = "ADDRESS";
  Owner_OwnerKind$1[Owner_OwnerKind$1["OBJECT"] = 2] = "OBJECT";
  Owner_OwnerKind$1[Owner_OwnerKind$1["SHARED"] = 3] = "SHARED";
  Owner_OwnerKind$1[Owner_OwnerKind$1["IMMUTABLE"] = 4] = "IMMUTABLE";
  Owner_OwnerKind$1[Owner_OwnerKind$1["CONSENSUS_ADDRESS"] = 5] = "CONSENSUS_ADDRESS";
  return Owner_OwnerKind$1;
})({});
var Owner$Type = class extends import_runtime3.MessageType {
  constructor() {
    super("sui.rpc.v2.Owner", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.Owner.OwnerKind", Owner_OwnerKind]
      },
      {
        no: 2,
        name: "address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var Owner2 = new Owner$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/argument.mjs
var import_runtime4 = __toESM(require_commonjs(), 1);
var Argument_ArgumentKind = /* @__PURE__ */ (function(Argument_ArgumentKind$1) {
  Argument_ArgumentKind$1[Argument_ArgumentKind$1["ARGUMENT_KIND_UNKNOWN"] = 0] = "ARGUMENT_KIND_UNKNOWN";
  Argument_ArgumentKind$1[Argument_ArgumentKind$1["GAS"] = 1] = "GAS";
  Argument_ArgumentKind$1[Argument_ArgumentKind$1["INPUT"] = 2] = "INPUT";
  Argument_ArgumentKind$1[Argument_ArgumentKind$1["RESULT"] = 3] = "RESULT";
  return Argument_ArgumentKind$1;
})({});
var Argument$Type = class extends import_runtime4.MessageType {
  constructor() {
    super("sui.rpc.v2.Argument", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.Argument.ArgumentKind", Argument_ArgumentKind]
      },
      {
        no: 2,
        name: "input",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "result",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 4,
        name: "subresult",
        kind: "scalar",
        opt: true,
        T: 13
      }
    ]);
  }
};
var Argument2 = new Argument$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/input.mjs
var import_runtime5 = __toESM(require_commonjs(), 1);
var Input_InputKind = /* @__PURE__ */ (function(Input_InputKind$1) {
  Input_InputKind$1[Input_InputKind$1["INPUT_KIND_UNKNOWN"] = 0] = "INPUT_KIND_UNKNOWN";
  Input_InputKind$1[Input_InputKind$1["PURE"] = 1] = "PURE";
  Input_InputKind$1[Input_InputKind$1["IMMUTABLE_OR_OWNED"] = 2] = "IMMUTABLE_OR_OWNED";
  Input_InputKind$1[Input_InputKind$1["SHARED"] = 3] = "SHARED";
  Input_InputKind$1[Input_InputKind$1["RECEIVING"] = 4] = "RECEIVING";
  Input_InputKind$1[Input_InputKind$1["FUNDS_WITHDRAWAL"] = 5] = "FUNDS_WITHDRAWAL";
  return Input_InputKind$1;
})({});
var Input_Mutability = /* @__PURE__ */ (function(Input_Mutability$1) {
  Input_Mutability$1[Input_Mutability$1["MUTABILITY_UNKNOWN"] = 0] = "MUTABILITY_UNKNOWN";
  Input_Mutability$1[Input_Mutability$1["IMMUTABLE"] = 1] = "IMMUTABLE";
  Input_Mutability$1[Input_Mutability$1["MUTABLE"] = 2] = "MUTABLE";
  Input_Mutability$1[Input_Mutability$1["NON_EXCLUSIVE_WRITE"] = 3] = "NON_EXCLUSIVE_WRITE";
  return Input_Mutability$1;
})({});
var FundsWithdrawal_Source = /* @__PURE__ */ (function(FundsWithdrawal_Source$1) {
  FundsWithdrawal_Source$1[FundsWithdrawal_Source$1["SOURCE_UNKNOWN"] = 0] = "SOURCE_UNKNOWN";
  FundsWithdrawal_Source$1[FundsWithdrawal_Source$1["SENDER"] = 1] = "SENDER";
  FundsWithdrawal_Source$1[FundsWithdrawal_Source$1["SPONSOR"] = 2] = "SPONSOR";
  FundsWithdrawal_Source$1[FundsWithdrawal_Source$1["SENDER_ALLOWANCE"] = 3] = "SENDER_ALLOWANCE";
  return FundsWithdrawal_Source$1;
})({});
var Input$Type = class extends import_runtime5.MessageType {
  constructor() {
    super("sui.rpc.v2.Input", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.Input.InputKind", Input_InputKind]
      },
      {
        no: 2,
        name: "pure",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 3,
        name: "object_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 6,
        name: "mutable",
        kind: "scalar",
        opt: true,
        T: 8
      },
      {
        no: 7,
        name: "mutability",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.Input.Mutability", Input_Mutability]
      },
      {
        no: 8,
        name: "funds_withdrawal",
        kind: "message",
        T: () => FundsWithdrawal2
      },
      {
        no: 1e3,
        name: "literal",
        kind: "message",
        T: () => Value
      }
    ]);
  }
};
var Input = new Input$Type();
var FundsWithdrawal$Type = class extends import_runtime5.MessageType {
  constructor() {
    super("sui.rpc.v2.FundsWithdrawal", [
      {
        no: 1,
        name: "amount",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "coin_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "source",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.FundsWithdrawal.Source", FundsWithdrawal_Source]
      },
      {
        no: 4,
        name: "funder",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "allowance",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var FundsWithdrawal2 = new FundsWithdrawal$Type();

// node_modules/@mysten/sui/dist/grpc/proto/google/protobuf/duration.mjs
var import_runtime6 = __toESM(require_commonjs(), 1);
var Duration$Type = class extends import_runtime6.MessageType {
  constructor() {
    super("google.protobuf.Duration", [{
      no: 1,
      name: "seconds",
      kind: "scalar",
      T: 3,
      L: 0
    }, {
      no: 2,
      name: "nanos",
      kind: "scalar",
      T: 5
    }]);
  }
  /**
  * Encode `Duration` to JSON string like "3.000001s".
  */
  internalJsonWrite(message, options) {
    let s = import_runtime6.PbLong.from(message.seconds).toNumber();
    if (s > 315576e6 || s < -315576e6) throw new Error("Duration value out of range.");
    let text = message.seconds.toString();
    if (s === 0 && message.nanos < 0) text = "-" + text;
    if (message.nanos !== 0) {
      let nanosStr = Math.abs(message.nanos).toString();
      nanosStr = "0".repeat(9 - nanosStr.length) + nanosStr;
      if (nanosStr.substring(3) === "000000") nanosStr = nanosStr.substring(0, 3);
      else if (nanosStr.substring(6) === "000") nanosStr = nanosStr.substring(0, 6);
      text += "." + nanosStr;
    }
    return text + "s";
  }
  /**
  * Decode `Duration` from JSON string like "3.000001s"
  */
  internalJsonRead(json, options, target) {
    if (typeof json !== "string") throw new Error("Unable to parse Duration from JSON " + (0, import_runtime6.typeofJsonValue)(json) + ". Expected string.");
    let match = json.match(/^(-?)([0-9]+)(?:\.([0-9]+))?s/);
    if (match === null) throw new Error("Unable to parse Duration from JSON string. Invalid format.");
    if (!target) target = this.create();
    let [, sign, secs, nanos] = match;
    let longSeconds = import_runtime6.PbLong.from(sign + secs);
    if (longSeconds.toNumber() > 315576e6 || longSeconds.toNumber() < -315576e6) throw new Error("Unable to parse Duration from JSON string. Value out of range.");
    target.seconds = longSeconds.toBigInt();
    if (typeof nanos == "string") {
      let nanosStr = sign + nanos + "0".repeat(9 - nanos.length);
      target.nanos = parseInt(nanosStr);
    }
    return target;
  }
};
var Duration = new Duration$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/jwk.mjs
var import_runtime7 = __toESM(require_commonjs(), 1);
var JwkId$Type = class extends import_runtime7.MessageType {
  constructor() {
    super("sui.rpc.v2.JwkId", [{
      no: 1,
      name: "iss",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "kid",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var JwkId = new JwkId$Type();
var Jwk$Type = class extends import_runtime7.MessageType {
  constructor() {
    super("sui.rpc.v2.Jwk", [
      {
        no: 1,
        name: "kty",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "e",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "n",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "alg",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var Jwk = new Jwk$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/bcs.mjs
var import_runtime8 = __toESM(require_commonjs(), 1);
var Bcs$Type = class extends import_runtime8.MessageType {
  constructor() {
    super("sui.rpc.v2.Bcs", [{
      no: 1,
      name: "name",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "value",
      kind: "scalar",
      opt: true,
      T: 12
    }]);
  }
};
var Bcs = new Bcs$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/object.mjs
var import_runtime9 = __toESM(require_commonjs(), 1);
var Object$Type = class extends import_runtime9.MessageType {
  constructor() {
    super("sui.rpc.v2.Object", [
      {
        no: 1,
        name: "bcs",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 2,
        name: "object_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "owner",
        kind: "message",
        T: () => Owner2
      },
      {
        no: 6,
        name: "object_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 7,
        name: "has_public_transfer",
        kind: "scalar",
        opt: true,
        T: 8
      },
      {
        no: 8,
        name: "contents",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 9,
        name: "package",
        kind: "message",
        T: () => Package
      },
      {
        no: 10,
        name: "previous_transaction",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 11,
        name: "storage_rebate",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 100,
        name: "json",
        kind: "message",
        T: () => Value
      },
      {
        no: 101,
        name: "balance",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 102,
        name: "display",
        kind: "message",
        T: () => Display
      }
    ]);
  }
};
var Object$1 = new Object$Type();
var ObjectSet$Type = class extends import_runtime9.MessageType {
  constructor() {
    super("sui.rpc.v2.ObjectSet", [{
      no: 1,
      name: "objects",
      kind: "message",
      repeat: 2,
      T: () => Object$1
    }]);
  }
};
var ObjectSet = new ObjectSet$Type();
var Display$Type = class extends import_runtime9.MessageType {
  constructor() {
    super("sui.rpc.v2.Display", [{
      no: 1,
      name: "output",
      kind: "message",
      T: () => Value
    }, {
      no: 2,
      name: "errors",
      kind: "message",
      T: () => Value
    }]);
  }
};
var Display = new Display$Type();

// node_modules/@mysten/sui/dist/grpc/proto/google/protobuf/timestamp.mjs
var import_runtime10 = __toESM(require_commonjs(), 1);
var Timestamp$Type = class extends import_runtime10.MessageType {
  constructor() {
    super("google.protobuf.Timestamp", [{
      no: 1,
      name: "seconds",
      kind: "scalar",
      T: 3,
      L: 0
    }, {
      no: 2,
      name: "nanos",
      kind: "scalar",
      T: 5
    }]);
  }
  /**
  * Creates a new `Timestamp` for the current time.
  */
  now() {
    const msg = this.create();
    const ms = Date.now();
    msg.seconds = import_runtime10.PbLong.from(Math.floor(ms / 1e3)).toBigInt();
    msg.nanos = ms % 1e3 * 1e6;
    return msg;
  }
  /**
  * Converts a `Timestamp` to a JavaScript Date.
  */
  toDate(message) {
    return new Date(import_runtime10.PbLong.from(message.seconds).toNumber() * 1e3 + Math.ceil(message.nanos / 1e6));
  }
  /**
  * Converts a JavaScript Date to a `Timestamp`.
  */
  fromDate(date) {
    const msg = this.create();
    const ms = date.getTime();
    msg.seconds = import_runtime10.PbLong.from(Math.floor(ms / 1e3)).toBigInt();
    msg.nanos = (ms % 1e3 + (ms < 0 && ms % 1e3 !== 0 ? 1e3 : 0)) * 1e6;
    return msg;
  }
  /**
  * In JSON format, the `Timestamp` type is encoded as a string
  * in the RFC 3339 format.
  */
  internalJsonWrite(message, options) {
    let ms = import_runtime10.PbLong.from(message.seconds).toNumber() * 1e3;
    if (ms < Date.parse("0001-01-01T00:00:00Z") || ms > Date.parse("9999-12-31T23:59:59Z")) throw new Error("Unable to encode Timestamp to JSON. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.");
    if (message.nanos < 0) throw new Error("Unable to encode invalid Timestamp to JSON. Nanos must not be negative.");
    let z = "Z";
    if (message.nanos > 0) {
      let nanosStr = (message.nanos + 1e9).toString().substring(1);
      if (nanosStr.substring(3) === "000000") z = "." + nanosStr.substring(0, 3) + "Z";
      else if (nanosStr.substring(6) === "000") z = "." + nanosStr.substring(0, 6) + "Z";
      else z = "." + nanosStr + "Z";
    }
    return new Date(ms).toISOString().replace(".000Z", z);
  }
  /**
  * In JSON format, the `Timestamp` type is encoded as a string
  * in the RFC 3339 format.
  */
  internalJsonRead(json, options, target) {
    if (typeof json !== "string") throw new Error("Unable to parse Timestamp from JSON " + (0, import_runtime10.typeofJsonValue)(json) + ".");
    let matches = json.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:Z|\.([0-9]{3,9})Z|([+-][0-9][0-9]:[0-9][0-9]))$/);
    if (!matches) throw new Error("Unable to parse Timestamp from JSON. Invalid format.");
    let ms = Date.parse(matches[1] + "-" + matches[2] + "-" + matches[3] + "T" + matches[4] + ":" + matches[5] + ":" + matches[6] + (matches[8] ? matches[8] : "Z"));
    if (Number.isNaN(ms)) throw new Error("Unable to parse Timestamp from JSON. Invalid value.");
    if (ms < Date.parse("0001-01-01T00:00:00Z") || ms > Date.parse("9999-12-31T23:59:59Z")) throw new globalThis.Error("Unable to parse Timestamp from JSON. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.");
    if (!target) target = this.create();
    target.seconds = import_runtime10.PbLong.from(ms / 1e3).toBigInt();
    target.nanos = 0;
    if (matches[7]) target.nanos = parseInt("1" + matches[7] + "0".repeat(9 - matches[7].length)) - 1e9;
    return target;
  }
};
var Timestamp = new Timestamp$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/object_reference.mjs
var import_runtime11 = __toESM(require_commonjs(), 1);
var ObjectReference$Type = class extends import_runtime11.MessageType {
  constructor() {
    super("sui.rpc.v2.ObjectReference", [
      {
        no: 1,
        name: "object_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var ObjectReference = new ObjectReference$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/transaction.mjs
var import_runtime12 = __toESM(require_commonjs(), 1);
var TransactionExpiration_TransactionExpirationKind = /* @__PURE__ */ (function(TransactionExpiration_TransactionExpirationKind$1) {
  TransactionExpiration_TransactionExpirationKind$1[TransactionExpiration_TransactionExpirationKind$1["TRANSACTION_EXPIRATION_KIND_UNKNOWN"] = 0] = "TRANSACTION_EXPIRATION_KIND_UNKNOWN";
  TransactionExpiration_TransactionExpirationKind$1[TransactionExpiration_TransactionExpirationKind$1["NONE"] = 1] = "NONE";
  TransactionExpiration_TransactionExpirationKind$1[TransactionExpiration_TransactionExpirationKind$1["EPOCH"] = 2] = "EPOCH";
  TransactionExpiration_TransactionExpirationKind$1[TransactionExpiration_TransactionExpirationKind$1["VALID_DURING"] = 3] = "VALID_DURING";
  TransactionExpiration_TransactionExpirationKind$1[TransactionExpiration_TransactionExpirationKind$1["VALIDITY"] = 4] = "VALIDITY";
  return TransactionExpiration_TransactionExpirationKind$1;
})({});
var TransactionKind_Kind = /* @__PURE__ */ (function(TransactionKind_Kind$1) {
  TransactionKind_Kind$1[TransactionKind_Kind$1["KIND_UNKNOWN"] = 0] = "KIND_UNKNOWN";
  TransactionKind_Kind$1[TransactionKind_Kind$1["PROGRAMMABLE_TRANSACTION"] = 1] = "PROGRAMMABLE_TRANSACTION";
  TransactionKind_Kind$1[TransactionKind_Kind$1["CHANGE_EPOCH"] = 2] = "CHANGE_EPOCH";
  TransactionKind_Kind$1[TransactionKind_Kind$1["GENESIS"] = 3] = "GENESIS";
  TransactionKind_Kind$1[TransactionKind_Kind$1["CONSENSUS_COMMIT_PROLOGUE_V1"] = 4] = "CONSENSUS_COMMIT_PROLOGUE_V1";
  TransactionKind_Kind$1[TransactionKind_Kind$1["AUTHENTICATOR_STATE_UPDATE"] = 5] = "AUTHENTICATOR_STATE_UPDATE";
  TransactionKind_Kind$1[TransactionKind_Kind$1["END_OF_EPOCH"] = 6] = "END_OF_EPOCH";
  TransactionKind_Kind$1[TransactionKind_Kind$1["RANDOMNESS_STATE_UPDATE"] = 7] = "RANDOMNESS_STATE_UPDATE";
  TransactionKind_Kind$1[TransactionKind_Kind$1["CONSENSUS_COMMIT_PROLOGUE_V2"] = 8] = "CONSENSUS_COMMIT_PROLOGUE_V2";
  TransactionKind_Kind$1[TransactionKind_Kind$1["CONSENSUS_COMMIT_PROLOGUE_V3"] = 9] = "CONSENSUS_COMMIT_PROLOGUE_V3";
  TransactionKind_Kind$1[TransactionKind_Kind$1["CONSENSUS_COMMIT_PROLOGUE_V4"] = 10] = "CONSENSUS_COMMIT_PROLOGUE_V4";
  TransactionKind_Kind$1[TransactionKind_Kind$1["PROGRAMMABLE_SYSTEM_TRANSACTION"] = 11] = "PROGRAMMABLE_SYSTEM_TRANSACTION";
  return TransactionKind_Kind$1;
})({});
var EndOfEpochTransactionKind_Kind = /* @__PURE__ */ (function(EndOfEpochTransactionKind_Kind$1) {
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["KIND_UNKNOWN"] = 0] = "KIND_UNKNOWN";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["CHANGE_EPOCH"] = 1] = "CHANGE_EPOCH";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["AUTHENTICATOR_STATE_CREATE"] = 2] = "AUTHENTICATOR_STATE_CREATE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["AUTHENTICATOR_STATE_EXPIRE"] = 3] = "AUTHENTICATOR_STATE_EXPIRE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["RANDOMNESS_STATE_CREATE"] = 4] = "RANDOMNESS_STATE_CREATE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["DENY_LIST_STATE_CREATE"] = 5] = "DENY_LIST_STATE_CREATE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["BRIDGE_STATE_CREATE"] = 6] = "BRIDGE_STATE_CREATE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["BRIDGE_COMMITTEE_INIT"] = 7] = "BRIDGE_COMMITTEE_INIT";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["STORE_EXECUTION_TIME_OBSERVATIONS"] = 8] = "STORE_EXECUTION_TIME_OBSERVATIONS";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["ACCUMULATOR_ROOT_CREATE"] = 9] = "ACCUMULATOR_ROOT_CREATE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["COIN_REGISTRY_CREATE"] = 10] = "COIN_REGISTRY_CREATE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["DISPLAY_REGISTRY_CREATE"] = 11] = "DISPLAY_REGISTRY_CREATE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["ADDRESS_ALIAS_STATE_CREATE"] = 12] = "ADDRESS_ALIAS_STATE_CREATE";
  EndOfEpochTransactionKind_Kind$1[EndOfEpochTransactionKind_Kind$1["WRITE_ACCUMULATOR_STORAGE_COST"] = 13] = "WRITE_ACCUMULATOR_STORAGE_COST";
  return EndOfEpochTransactionKind_Kind$1;
})({});
var ExecutionTimeObservation_ExecutionTimeObservationKind = /* @__PURE__ */ (function(ExecutionTimeObservation_ExecutionTimeObservationKind$1) {
  ExecutionTimeObservation_ExecutionTimeObservationKind$1[ExecutionTimeObservation_ExecutionTimeObservationKind$1["EXECUTION_TIME_OBSERVATION_KIND_UNKNOWN"] = 0] = "EXECUTION_TIME_OBSERVATION_KIND_UNKNOWN";
  ExecutionTimeObservation_ExecutionTimeObservationKind$1[ExecutionTimeObservation_ExecutionTimeObservationKind$1["MOVE_ENTRY_POINT"] = 1] = "MOVE_ENTRY_POINT";
  ExecutionTimeObservation_ExecutionTimeObservationKind$1[ExecutionTimeObservation_ExecutionTimeObservationKind$1["TRANSFER_OBJECTS"] = 2] = "TRANSFER_OBJECTS";
  ExecutionTimeObservation_ExecutionTimeObservationKind$1[ExecutionTimeObservation_ExecutionTimeObservationKind$1["SPLIT_COINS"] = 3] = "SPLIT_COINS";
  ExecutionTimeObservation_ExecutionTimeObservationKind$1[ExecutionTimeObservation_ExecutionTimeObservationKind$1["MERGE_COINS"] = 4] = "MERGE_COINS";
  ExecutionTimeObservation_ExecutionTimeObservationKind$1[ExecutionTimeObservation_ExecutionTimeObservationKind$1["PUBLISH"] = 5] = "PUBLISH";
  ExecutionTimeObservation_ExecutionTimeObservationKind$1[ExecutionTimeObservation_ExecutionTimeObservationKind$1["MAKE_MOVE_VECTOR"] = 6] = "MAKE_MOVE_VECTOR";
  ExecutionTimeObservation_ExecutionTimeObservationKind$1[ExecutionTimeObservation_ExecutionTimeObservationKind$1["UPGRADE"] = 7] = "UPGRADE";
  return ExecutionTimeObservation_ExecutionTimeObservationKind$1;
})({});
var Transaction$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.Transaction", [
      {
        no: 1,
        name: "bcs",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 2,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 5
      },
      {
        no: 4,
        name: "kind",
        kind: "message",
        T: () => TransactionKind2
      },
      {
        no: 5,
        name: "sender",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 6,
        name: "gas_payment",
        kind: "message",
        T: () => GasPayment
      },
      {
        no: 7,
        name: "expiration",
        kind: "message",
        T: () => TransactionExpiration4
      }
    ]);
  }
};
var Transaction = new Transaction$Type();
var GasPayment$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.GasPayment", [
      {
        no: 1,
        name: "objects",
        kind: "message",
        repeat: 2,
        T: () => ObjectReference
      },
      {
        no: 2,
        name: "owner",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "price",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "budget",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var GasPayment = new GasPayment$Type();
var TransactionExpiration$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.TransactionExpiration", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.TransactionExpiration.TransactionExpirationKind", TransactionExpiration_TransactionExpirationKind]
      },
      {
        no: 2,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "min_epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "min_timestamp",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 5,
        name: "max_timestamp",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 6,
        name: "chain",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 7,
        name: "nonce",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 8,
        name: "allowed_proposers",
        kind: "message",
        T: () => AllowedProposers2
      }
    ]);
  }
};
var TransactionExpiration4 = new TransactionExpiration$Type();
var AllowedProposers$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.AllowedProposers", [{
      no: 1,
      name: "epoch",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "proposers",
      kind: "scalar",
      repeat: 1,
      T: 13
    }]);
  }
};
var AllowedProposers2 = new AllowedProposers$Type();
var TransactionKind$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.TransactionKind", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.TransactionKind.Kind", TransactionKind_Kind]
      },
      {
        no: 2,
        name: "programmable_transaction",
        kind: "message",
        oneof: "data",
        T: () => ProgrammableTransaction2
      },
      {
        no: 3,
        name: "change_epoch",
        kind: "message",
        oneof: "data",
        T: () => ChangeEpoch2
      },
      {
        no: 4,
        name: "genesis",
        kind: "message",
        oneof: "data",
        T: () => GenesisTransaction2
      },
      {
        no: 5,
        name: "consensus_commit_prologue",
        kind: "message",
        oneof: "data",
        T: () => ConsensusCommitPrologue2
      },
      {
        no: 6,
        name: "authenticator_state_update",
        kind: "message",
        oneof: "data",
        T: () => AuthenticatorStateUpdate2
      },
      {
        no: 7,
        name: "end_of_epoch",
        kind: "message",
        oneof: "data",
        T: () => EndOfEpochTransaction
      },
      {
        no: 8,
        name: "randomness_state_update",
        kind: "message",
        oneof: "data",
        T: () => RandomnessStateUpdate2
      }
    ]);
  }
};
var TransactionKind2 = new TransactionKind$Type();
var ProgrammableTransaction$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.ProgrammableTransaction", [{
      no: 1,
      name: "inputs",
      kind: "message",
      repeat: 2,
      T: () => Input
    }, {
      no: 2,
      name: "commands",
      kind: "message",
      repeat: 2,
      T: () => Command2
    }]);
  }
};
var ProgrammableTransaction2 = new ProgrammableTransaction$Type();
var Command$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.Command", [
      {
        no: 1,
        name: "move_call",
        kind: "message",
        oneof: "command",
        T: () => MoveCall
      },
      {
        no: 2,
        name: "transfer_objects",
        kind: "message",
        oneof: "command",
        T: () => TransferObjects
      },
      {
        no: 3,
        name: "split_coins",
        kind: "message",
        oneof: "command",
        T: () => SplitCoins
      },
      {
        no: 4,
        name: "merge_coins",
        kind: "message",
        oneof: "command",
        T: () => MergeCoins
      },
      {
        no: 5,
        name: "publish",
        kind: "message",
        oneof: "command",
        T: () => Publish
      },
      {
        no: 6,
        name: "make_move_vector",
        kind: "message",
        oneof: "command",
        T: () => MakeMoveVector
      },
      {
        no: 7,
        name: "upgrade",
        kind: "message",
        oneof: "command",
        T: () => Upgrade
      }
    ]);
  }
};
var Command2 = new Command$Type();
var MoveCall$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.MoveCall", [
      {
        no: 1,
        name: "package",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "module",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "function",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "type_arguments",
        kind: "scalar",
        repeat: 2,
        T: 9
      },
      {
        no: 5,
        name: "arguments",
        kind: "message",
        repeat: 2,
        T: () => Argument2
      }
    ]);
  }
};
var MoveCall = new MoveCall$Type();
var TransferObjects$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.TransferObjects", [{
      no: 1,
      name: "objects",
      kind: "message",
      repeat: 2,
      T: () => Argument2
    }, {
      no: 2,
      name: "address",
      kind: "message",
      T: () => Argument2
    }]);
  }
};
var TransferObjects = new TransferObjects$Type();
var SplitCoins$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.SplitCoins", [{
      no: 1,
      name: "coin",
      kind: "message",
      T: () => Argument2
    }, {
      no: 2,
      name: "amounts",
      kind: "message",
      repeat: 2,
      T: () => Argument2
    }]);
  }
};
var SplitCoins = new SplitCoins$Type();
var MergeCoins$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.MergeCoins", [{
      no: 1,
      name: "coin",
      kind: "message",
      T: () => Argument2
    }, {
      no: 2,
      name: "coins_to_merge",
      kind: "message",
      repeat: 2,
      T: () => Argument2
    }]);
  }
};
var MergeCoins = new MergeCoins$Type();
var Publish$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.Publish", [{
      no: 1,
      name: "modules",
      kind: "scalar",
      repeat: 2,
      T: 12
    }, {
      no: 2,
      name: "dependencies",
      kind: "scalar",
      repeat: 2,
      T: 9
    }]);
  }
};
var Publish = new Publish$Type();
var MakeMoveVector$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.MakeMoveVector", [{
      no: 1,
      name: "element_type",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "elements",
      kind: "message",
      repeat: 2,
      T: () => Argument2
    }]);
  }
};
var MakeMoveVector = new MakeMoveVector$Type();
var Upgrade$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.Upgrade", [
      {
        no: 1,
        name: "modules",
        kind: "scalar",
        repeat: 2,
        T: 12
      },
      {
        no: 2,
        name: "dependencies",
        kind: "scalar",
        repeat: 2,
        T: 9
      },
      {
        no: 3,
        name: "package",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "ticket",
        kind: "message",
        T: () => Argument2
      }
    ]);
  }
};
var Upgrade = new Upgrade$Type();
var RandomnessStateUpdate$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.RandomnessStateUpdate", [
      {
        no: 1,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "randomness_round",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "random_bytes",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 4,
        name: "randomness_object_initial_shared_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var RandomnessStateUpdate2 = new RandomnessStateUpdate$Type();
var ChangeEpoch$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.ChangeEpoch", [
      {
        no: 1,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "protocol_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "storage_charge",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "computation_charge",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "storage_rebate",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 6,
        name: "non_refundable_storage_fee",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 7,
        name: "epoch_start_timestamp",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 8,
        name: "system_packages",
        kind: "message",
        repeat: 2,
        T: () => SystemPackage
      }
    ]);
  }
};
var ChangeEpoch2 = new ChangeEpoch$Type();
var SystemPackage$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.SystemPackage", [
      {
        no: 1,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "modules",
        kind: "scalar",
        repeat: 2,
        T: 12
      },
      {
        no: 3,
        name: "dependencies",
        kind: "scalar",
        repeat: 2,
        T: 9
      }
    ]);
  }
};
var SystemPackage = new SystemPackage$Type();
var GenesisTransaction$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.GenesisTransaction", [{
      no: 1,
      name: "objects",
      kind: "message",
      repeat: 2,
      T: () => Object$1
    }]);
  }
};
var GenesisTransaction2 = new GenesisTransaction$Type();
var ConsensusCommitPrologue$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.ConsensusCommitPrologue", [
      {
        no: 1,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "round",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "commit_timestamp",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 4,
        name: "consensus_commit_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "sub_dag_index",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 6,
        name: "consensus_determined_version_assignments",
        kind: "message",
        T: () => ConsensusDeterminedVersionAssignments2
      },
      {
        no: 7,
        name: "additional_state_digest",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var ConsensusCommitPrologue2 = new ConsensusCommitPrologue$Type();
var VersionAssignment$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.VersionAssignment", [
      {
        no: 1,
        name: "object_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "start_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var VersionAssignment = new VersionAssignment$Type();
var CanceledTransaction$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.CanceledTransaction", [{
      no: 1,
      name: "digest",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "version_assignments",
      kind: "message",
      repeat: 2,
      T: () => VersionAssignment
    }]);
  }
};
var CanceledTransaction = new CanceledTransaction$Type();
var ConsensusDeterminedVersionAssignments$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.ConsensusDeterminedVersionAssignments", [{
      no: 1,
      name: "version",
      kind: "scalar",
      opt: true,
      T: 5
    }, {
      no: 3,
      name: "canceled_transactions",
      kind: "message",
      repeat: 2,
      T: () => CanceledTransaction
    }]);
  }
};
var ConsensusDeterminedVersionAssignments2 = new ConsensusDeterminedVersionAssignments$Type();
var AuthenticatorStateUpdate$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.AuthenticatorStateUpdate", [
      {
        no: 1,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "round",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "new_active_jwks",
        kind: "message",
        repeat: 2,
        T: () => ActiveJwk2
      },
      {
        no: 4,
        name: "authenticator_object_initial_shared_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var AuthenticatorStateUpdate2 = new AuthenticatorStateUpdate$Type();
var ActiveJwk$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.ActiveJwk", [
      {
        no: 1,
        name: "id",
        kind: "message",
        T: () => JwkId
      },
      {
        no: 2,
        name: "jwk",
        kind: "message",
        T: () => Jwk
      },
      {
        no: 3,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var ActiveJwk2 = new ActiveJwk$Type();
var EndOfEpochTransaction$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.EndOfEpochTransaction", [{
      no: 1,
      name: "transactions",
      kind: "message",
      repeat: 2,
      T: () => EndOfEpochTransactionKind2
    }]);
  }
};
var EndOfEpochTransaction = new EndOfEpochTransaction$Type();
var EndOfEpochTransactionKind$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.EndOfEpochTransactionKind", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.EndOfEpochTransactionKind.Kind", EndOfEpochTransactionKind_Kind]
      },
      {
        no: 2,
        name: "change_epoch",
        kind: "message",
        oneof: "data",
        T: () => ChangeEpoch2
      },
      {
        no: 3,
        name: "authenticator_state_expire",
        kind: "message",
        oneof: "data",
        T: () => AuthenticatorStateExpire2
      },
      {
        no: 4,
        name: "execution_time_observations",
        kind: "message",
        oneof: "data",
        T: () => ExecutionTimeObservations
      },
      {
        no: 5,
        name: "bridge_chain_id",
        kind: "scalar",
        oneof: "data",
        T: 9
      },
      {
        no: 6,
        name: "bridge_object_version",
        kind: "scalar",
        oneof: "data",
        T: 4,
        L: 0
      },
      {
        no: 7,
        name: "storage_cost",
        kind: "scalar",
        oneof: "data",
        T: 4,
        L: 0
      }
    ]);
  }
};
var EndOfEpochTransactionKind2 = new EndOfEpochTransactionKind$Type();
var AuthenticatorStateExpire$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.AuthenticatorStateExpire", [{
      no: 1,
      name: "min_epoch",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "authenticator_object_initial_shared_version",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var AuthenticatorStateExpire2 = new AuthenticatorStateExpire$Type();
var ExecutionTimeObservations$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.ExecutionTimeObservations", [{
      no: 1,
      name: "version",
      kind: "scalar",
      opt: true,
      T: 5
    }, {
      no: 2,
      name: "observations",
      kind: "message",
      repeat: 2,
      T: () => ExecutionTimeObservation
    }]);
  }
};
var ExecutionTimeObservations = new ExecutionTimeObservations$Type();
var ExecutionTimeObservation$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.ExecutionTimeObservation", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.ExecutionTimeObservation.ExecutionTimeObservationKind", ExecutionTimeObservation_ExecutionTimeObservationKind]
      },
      {
        no: 2,
        name: "move_entry_point",
        kind: "message",
        T: () => MoveCall
      },
      {
        no: 3,
        name: "validator_observations",
        kind: "message",
        repeat: 2,
        T: () => ValidatorExecutionTimeObservation
      }
    ]);
  }
};
var ExecutionTimeObservation = new ExecutionTimeObservation$Type();
var ValidatorExecutionTimeObservation$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("sui.rpc.v2.ValidatorExecutionTimeObservation", [{
      no: 1,
      name: "validator",
      kind: "scalar",
      opt: true,
      T: 12
    }, {
      no: 2,
      name: "duration",
      kind: "message",
      T: () => Duration
    }]);
  }
};
var ValidatorExecutionTimeObservation = new ValidatorExecutionTimeObservation$Type();

// node_modules/@mysten/sui/dist/client/transaction-resolver.mjs
function millisecondsToGrpcTimestamp(value) {
  const milliseconds = BigInt(value);
  return {
    seconds: milliseconds / 1000n,
    nanos: Number(milliseconds % 1000n) * 1e6
  };
}
function grpcTimestampToMilliseconds(timestamp) {
  return (timestamp.seconds * 1000n + BigInt(Math.floor(timestamp.nanos / 1e6))).toString();
}
function callArgToGrpcInput(arg) {
  switch (arg.$kind) {
    case "Pure":
      return {
        kind: Input_InputKind.PURE,
        pure: fromBase64(arg.Pure.bytes)
      };
    case "Object":
      if (arg.Object.$kind === "ImmOrOwnedObject") return {
        kind: Input_InputKind.IMMUTABLE_OR_OWNED,
        objectId: arg.Object.ImmOrOwnedObject.objectId,
        version: BigInt(arg.Object.ImmOrOwnedObject.version),
        digest: arg.Object.ImmOrOwnedObject.digest
      };
      else if (arg.Object.$kind === "SharedObject") return {
        kind: Input_InputKind.SHARED,
        objectId: arg.Object.SharedObject.objectId,
        version: BigInt(arg.Object.SharedObject.initialSharedVersion),
        mutable: arg.Object.SharedObject.mutable
      };
      else if (arg.Object.$kind === "Receiving") return {
        kind: Input_InputKind.RECEIVING,
        objectId: arg.Object.Receiving.objectId,
        version: BigInt(arg.Object.Receiving.version),
        digest: arg.Object.Receiving.digest
      };
      throw new Error(`Unknown Object kind: ${JSON.stringify(arg.Object)}`);
    case "UnresolvedObject":
      const unresolved = arg.UnresolvedObject;
      return {
        objectId: unresolved.objectId,
        version: unresolved.version ? BigInt(unresolved.version) : unresolved.initialSharedVersion ? BigInt(unresolved.initialSharedVersion) : void 0,
        digest: unresolved.digest ?? void 0,
        mutable: unresolved.mutable ?? void 0
      };
    case "UnresolvedPure":
      throw new Error("UnresolvedPure arguments must be resolved before converting to gRPC format");
    case "FundsWithdrawal": {
      const withdrawal = arg.FundsWithdrawal;
      return {
        kind: Input_InputKind.FUNDS_WITHDRAWAL,
        fundsWithdrawal: {
          amount: withdrawal.reservation.$kind === "MaxAmountU64" ? BigInt(withdrawal.reservation.MaxAmountU64) : void 0,
          coinType: withdrawal.typeArg.$kind === "Balance" ? withdrawal.typeArg.Balance : void 0,
          ...tsWithdrawFromToGrpc(withdrawal.withdrawFrom)
        }
      };
    }
    default:
      throw new Error(`Unknown CallArg kind: ${JSON.stringify(arg)}`);
  }
}
function tsWithdrawFromToGrpc(withdrawFrom) {
  switch (withdrawFrom.$kind) {
    case "Sender":
      return { source: FundsWithdrawal_Source.SENDER };
    case "Sponsor":
      return { source: FundsWithdrawal_Source.SPONSOR };
    case "SenderAllowance":
      return {
        source: FundsWithdrawal_Source.SENDER_ALLOWANCE,
        funder: withdrawFrom.SenderAllowance.funder,
        allowance: withdrawFrom.SenderAllowance.allowance
      };
    default:
      throw new Error(`Unknown WithdrawFrom kind: ${JSON.stringify(withdrawFrom)}`);
  }
}
function grpcWithdrawFromToTs(withdrawal) {
  switch (withdrawal?.source) {
    case FundsWithdrawal_Source.SPONSOR:
      return {
        $kind: "Sponsor",
        Sponsor: true
      };
    case FundsWithdrawal_Source.SENDER_ALLOWANCE:
      if (!withdrawal.funder || !withdrawal.allowance) throw new Error(`SENDER_ALLOWANCE withdrawal is missing funder or allowance: ${JSON.stringify(withdrawal)}`);
      return {
        $kind: "SenderAllowance",
        SenderAllowance: {
          funder: withdrawal.funder,
          allowance: withdrawal.allowance
        }
      };
    default:
      return {
        $kind: "Sender",
        Sender: true
      };
  }
}
function tsArgumentToGrpcArgument(arg) {
  if ("GasCoin" in arg) return { kind: Argument_ArgumentKind.GAS };
  else if ("Input" in arg) return {
    kind: Argument_ArgumentKind.INPUT,
    input: arg.Input
  };
  else if ("Result" in arg) return {
    kind: Argument_ArgumentKind.RESULT,
    result: arg.Result
  };
  else if ("NestedResult" in arg) return {
    kind: Argument_ArgumentKind.RESULT,
    result: arg.NestedResult[0],
    subresult: arg.NestedResult[1]
  };
  throw new Error(`Unknown Argument: ${JSON.stringify(arg)}`);
}
function tsCommandToGrpcCommand(cmd) {
  switch (cmd.$kind) {
    case "MoveCall":
      return { command: {
        oneofKind: "moveCall",
        moveCall: {
          package: cmd.MoveCall.package,
          module: cmd.MoveCall.module,
          function: cmd.MoveCall.function,
          typeArguments: cmd.MoveCall.typeArguments,
          arguments: cmd.MoveCall.arguments.map(tsArgumentToGrpcArgument)
        }
      } };
    case "TransferObjects":
      return { command: {
        oneofKind: "transferObjects",
        transferObjects: {
          objects: cmd.TransferObjects.objects.map(tsArgumentToGrpcArgument),
          address: tsArgumentToGrpcArgument(cmd.TransferObjects.address)
        }
      } };
    case "SplitCoins":
      return { command: {
        oneofKind: "splitCoins",
        splitCoins: {
          coin: tsArgumentToGrpcArgument(cmd.SplitCoins.coin),
          amounts: cmd.SplitCoins.amounts.map(tsArgumentToGrpcArgument)
        }
      } };
    case "MergeCoins":
      return { command: {
        oneofKind: "mergeCoins",
        mergeCoins: {
          coin: tsArgumentToGrpcArgument(cmd.MergeCoins.destination),
          coinsToMerge: cmd.MergeCoins.sources.map(tsArgumentToGrpcArgument)
        }
      } };
    case "Publish":
      return { command: {
        oneofKind: "publish",
        publish: {
          modules: cmd.Publish.modules.map((m) => fromBase64(m)),
          dependencies: cmd.Publish.dependencies
        }
      } };
    case "MakeMoveVec":
      return { command: {
        oneofKind: "makeMoveVector",
        makeMoveVector: {
          elementType: cmd.MakeMoveVec.type ?? void 0,
          elements: cmd.MakeMoveVec.elements.map(tsArgumentToGrpcArgument)
        }
      } };
    case "Upgrade":
      return { command: {
        oneofKind: "upgrade",
        upgrade: {
          modules: cmd.Upgrade.modules.map((m) => fromBase64(m)),
          dependencies: cmd.Upgrade.dependencies,
          package: cmd.Upgrade.package,
          ticket: tsArgumentToGrpcArgument(cmd.Upgrade.ticket)
        }
      } };
    default:
      throw new Error(`Unknown Command kind: ${JSON.stringify(cmd)}`);
  }
}
function transactionDataToGrpcTransaction(data) {
  const transaction = {
    version: 1,
    kind: { data: {
      oneofKind: "programmableTransaction",
      programmableTransaction: {
        inputs: data.inputs.map(callArgToGrpcInput),
        commands: data.commands.map(tsCommandToGrpcCommand)
      }
    } }
  };
  if (data.sender) transaction.sender = data.sender;
  const gasOwner = data.gasData.owner ?? data.sender;
  transaction.gasPayment = {
    objects: data.gasData.payment ? data.gasData.payment.map((ref) => ({
      objectId: ref.objectId,
      version: BigInt(ref.version),
      digest: ref.digest
    })) : [],
    price: data.gasData.price ? BigInt(data.gasData.price) : void 0,
    budget: data.gasData.budget ? BigInt(data.gasData.budget) : void 0
  };
  if (gasOwner) transaction.gasPayment.owner = gasOwner;
  if (data.expiration) {
    if ("None" in data.expiration) transaction.expiration = { kind: TransactionExpiration_TransactionExpirationKind.NONE };
    else if (data.expiration.$kind === "Epoch") transaction.expiration = {
      kind: TransactionExpiration_TransactionExpirationKind.EPOCH,
      epoch: BigInt(data.expiration.Epoch)
    };
    else if (data.expiration.$kind === "ValidDuring" || data.expiration.$kind === "Validity") {
      const validity = data.expiration.$kind === "ValidDuring" ? data.expiration.ValidDuring : data.expiration.Validity;
      const allowedProposers = data.expiration.$kind === "Validity" ? data.expiration.Validity.allowedProposers : null;
      transaction.expiration = {
        kind: data.expiration.$kind === "ValidDuring" ? TransactionExpiration_TransactionExpirationKind.VALID_DURING : TransactionExpiration_TransactionExpirationKind.VALIDITY,
        minEpoch: validity.minEpoch != null ? BigInt(validity.minEpoch) : void 0,
        epoch: validity.maxEpoch != null ? BigInt(validity.maxEpoch) : void 0,
        minTimestamp: validity.minTimestamp != null ? millisecondsToGrpcTimestamp(validity.minTimestamp) : void 0,
        maxTimestamp: validity.maxTimestamp != null ? millisecondsToGrpcTimestamp(validity.maxTimestamp) : void 0,
        chain: validity.chain,
        nonce: validity.nonce,
        allowedProposers: allowedProposers ? {
          epoch: BigInt(allowedProposers.epoch),
          proposers: assertAllowedProposersStrictlyIncreasing(allowedProposers.proposers)
        } : void 0
      };
    }
  }
  return transaction;
}
function applyGrpcResolvedTransaction(transactionData, resolvedTransaction, options) {
  const resolved = grpcTransactionToTransactionData(resolvedTransaction);
  if (options?.onlyTransactionKind) transactionData.applyResolvedData({
    ...resolved,
    sender: null,
    gasData: {
      budget: null,
      owner: null,
      payment: null,
      price: null
    },
    expiration: null
  });
  else transactionData.applyResolvedData(resolved);
}
function transactionToGrpcTransaction(transaction) {
  const snapshot = transaction.getData();
  if (!snapshot.sender) snapshot.sender = "0x0000000000000000000000000000000000000000000000000000000000000000";
  return transactionDataToGrpcTransaction(snapshot);
}
function grpcInputToCallArg(input) {
  switch (input.kind) {
    case Input_InputKind.PURE:
      return {
        $kind: "Pure",
        Pure: { bytes: toBase64(input.pure) }
      };
    case Input_InputKind.IMMUTABLE_OR_OWNED:
      return {
        $kind: "Object",
        Object: {
          $kind: "ImmOrOwnedObject",
          ImmOrOwnedObject: {
            objectId: input.objectId,
            version: input.version.toString(),
            digest: input.digest
          }
        }
      };
    case Input_InputKind.SHARED:
      return {
        $kind: "Object",
        Object: {
          $kind: "SharedObject",
          SharedObject: {
            objectId: input.objectId,
            initialSharedVersion: input.version.toString(),
            mutable: input.mutable ?? false
          }
        }
      };
    case Input_InputKind.RECEIVING:
      return {
        $kind: "Object",
        Object: {
          $kind: "Receiving",
          Receiving: {
            objectId: input.objectId,
            version: input.version.toString(),
            digest: input.digest
          }
        }
      };
    case Input_InputKind.FUNDS_WITHDRAWAL:
      return {
        $kind: "FundsWithdrawal",
        FundsWithdrawal: {
          reservation: {
            $kind: "MaxAmountU64",
            MaxAmountU64: input.fundsWithdrawal?.amount?.toString() ?? "0"
          },
          typeArg: {
            $kind: "Balance",
            Balance: input.fundsWithdrawal?.coinType ?? "0x2::sui::SUI"
          },
          withdrawFrom: grpcWithdrawFromToTs(input.fundsWithdrawal)
        }
      };
    default:
      throw new Error(`Unknown Input kind: ${JSON.stringify(input)}`);
  }
}
function grpcArgumentToTsArgument(arg) {
  switch (arg.kind) {
    case Argument_ArgumentKind.GAS:
      return {
        $kind: "GasCoin",
        GasCoin: true
      };
    case Argument_ArgumentKind.INPUT:
      return {
        $kind: "Input",
        Input: arg.input
      };
    case Argument_ArgumentKind.RESULT:
      if (arg.subresult != null) return {
        $kind: "NestedResult",
        NestedResult: [arg.result, arg.subresult]
      };
      return {
        $kind: "Result",
        Result: arg.result
      };
    default:
      throw new Error(`Unknown Argument kind: ${JSON.stringify(arg)}`);
  }
}
function grpcCommandToTsCommand(cmd) {
  const command = cmd.command;
  if (!command) throw new Error("Command is missing");
  switch (command.oneofKind) {
    case "moveCall":
      return {
        $kind: "MoveCall",
        MoveCall: {
          package: command.moveCall.package,
          module: command.moveCall.module,
          function: command.moveCall.function,
          typeArguments: command.moveCall.typeArguments ?? [],
          arguments: command.moveCall.arguments.map(grpcArgumentToTsArgument)
        }
      };
    case "transferObjects":
      return {
        $kind: "TransferObjects",
        TransferObjects: {
          objects: command.transferObjects.objects.map(grpcArgumentToTsArgument),
          address: grpcArgumentToTsArgument(command.transferObjects.address)
        }
      };
    case "splitCoins":
      return {
        $kind: "SplitCoins",
        SplitCoins: {
          coin: grpcArgumentToTsArgument(command.splitCoins.coin),
          amounts: command.splitCoins.amounts.map(grpcArgumentToTsArgument)
        }
      };
    case "mergeCoins":
      return {
        $kind: "MergeCoins",
        MergeCoins: {
          destination: grpcArgumentToTsArgument(command.mergeCoins.coin),
          sources: command.mergeCoins.coinsToMerge.map(grpcArgumentToTsArgument)
        }
      };
    case "publish":
      return {
        $kind: "Publish",
        Publish: {
          modules: command.publish.modules.map((m) => toBase64(m)),
          dependencies: command.publish.dependencies ?? []
        }
      };
    case "makeMoveVector":
      return {
        $kind: "MakeMoveVec",
        MakeMoveVec: {
          type: command.makeMoveVector.elementType ?? null,
          elements: command.makeMoveVector.elements.map(grpcArgumentToTsArgument)
        }
      };
    case "upgrade":
      return {
        $kind: "Upgrade",
        Upgrade: {
          modules: command.upgrade.modules.map((m) => toBase64(m)),
          dependencies: command.upgrade.dependencies ?? [],
          package: command.upgrade.package,
          ticket: grpcArgumentToTsArgument(command.upgrade.ticket)
        }
      };
    default:
      throw new Error(`Unknown Command kind: ${JSON.stringify(command)}`);
  }
}
function grpcTransactionToTransactionData(grpcTx) {
  const programmableTx = grpcTx.kind?.data;
  if (programmableTx?.oneofKind !== "programmableTransaction") throw new Error("Only programmable transactions are supported");
  const inputs = programmableTx.programmableTransaction.inputs.map(grpcInputToCallArg);
  const commands = programmableTx.programmableTransaction.commands.map(grpcCommandToTsCommand);
  let expiration = null;
  if (grpcTx.expiration) switch (grpcTx.expiration.kind) {
    case TransactionExpiration_TransactionExpirationKind.NONE:
      expiration = {
        $kind: "None",
        None: true
      };
      break;
    case TransactionExpiration_TransactionExpirationKind.EPOCH:
      expiration = {
        $kind: "Epoch",
        Epoch: grpcTx.expiration.epoch.toString()
      };
      break;
    case TransactionExpiration_TransactionExpirationKind.VALID_DURING:
      expiration = {
        $kind: "ValidDuring",
        ValidDuring: {
          minEpoch: grpcTx.expiration.minEpoch?.toString() ?? null,
          maxEpoch: grpcTx.expiration.epoch?.toString() ?? null,
          minTimestamp: grpcTx.expiration.minTimestamp ? grpcTimestampToMilliseconds(grpcTx.expiration.minTimestamp) : null,
          maxTimestamp: grpcTx.expiration.maxTimestamp ? grpcTimestampToMilliseconds(grpcTx.expiration.maxTimestamp) : null,
          chain: grpcTx.expiration.chain ?? "",
          nonce: grpcTx.expiration.nonce ?? 0
        }
      };
      break;
    case TransactionExpiration_TransactionExpirationKind.VALIDITY:
      expiration = {
        $kind: "Validity",
        Validity: {
          minEpoch: grpcTx.expiration.minEpoch?.toString() ?? null,
          maxEpoch: grpcTx.expiration.epoch?.toString() ?? null,
          minTimestamp: grpcTx.expiration.minTimestamp ? grpcTimestampToMilliseconds(grpcTx.expiration.minTimestamp) : null,
          maxTimestamp: grpcTx.expiration.maxTimestamp ? grpcTimestampToMilliseconds(grpcTx.expiration.maxTimestamp) : null,
          chain: grpcTx.expiration.chain ?? "",
          nonce: grpcTx.expiration.nonce ?? 0,
          allowedProposers: grpcTx.expiration.allowedProposers ? {
            epoch: grpcTx.expiration.allowedProposers.epoch?.toString() ?? "0",
            proposers: assertAllowedProposersNotEmpty(grpcTx.expiration.allowedProposers.proposers)
          } : null
        }
      };
      break;
    default:
      throw new Error(`Unknown transaction expiration kind: ${grpcTx.expiration.kind}`);
  }
  return {
    version: 2,
    sender: grpcTx.sender ?? null,
    expiration,
    gasData: {
      budget: grpcTx.gasPayment?.budget?.toString() ?? null,
      owner: grpcTx.gasPayment?.owner ?? null,
      payment: grpcTx.gasPayment?.objects?.map((obj) => ({
        objectId: obj.objectId,
        version: obj.version.toString(),
        digest: obj.digest
      })) ?? null,
      price: grpcTx.gasPayment?.price?.toString() ?? null
    },
    inputs,
    commands
  };
}

// node_modules/@mysten/sui/dist/client/address-balance-transaction-expiration.mjs
async function setAddressBalanceTransactionExpirationFromSimulatedEpoch({ transactionData, client: client2, epoch, originalTransactionData, isTransactionKindOnly, doGasSelection }) {
  if (isTransactionKindOnly || doGasSelection || originalTransactionData.expiration || originalTransactionData.gasData.payment?.length !== 0) return;
  if (transactionData.expiration && transactionData.expiration.$kind !== "None") return;
  const [{ chainIdentifier }, systemStateResult] = await Promise.all([client2.core.getChainIdentifier(), epoch == null ? client2.core.getCurrentSystemState() : null]);
  const currentEpoch = BigInt(epoch ?? systemStateResult.systemState.epoch);
  transactionData.expiration = {
    $kind: "ValidDuring",
    ValidDuring: {
      minEpoch: String(currentEpoch),
      maxEpoch: String(currentEpoch + 1n),
      minTimestamp: null,
      maxTimestamp: null,
      chain: chainIdentifier,
      nonce: Math.random() * 4294967296 >>> 0
    }
  };
}

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/execution_status.mjs
var import_runtime13 = __toESM(require_commonjs(), 1);
var ExecutionError_ExecutionErrorKind = /* @__PURE__ */ (function(ExecutionError_ExecutionErrorKind$1) {
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["EXECUTION_ERROR_KIND_UNKNOWN"] = 0] = "EXECUTION_ERROR_KIND_UNKNOWN";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INSUFFICIENT_GAS"] = 1] = "INSUFFICIENT_GAS";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INVALID_GAS_OBJECT"] = 2] = "INVALID_GAS_OBJECT";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INVARIANT_VIOLATION"] = 3] = "INVARIANT_VIOLATION";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["FEATURE_NOT_YET_SUPPORTED"] = 4] = "FEATURE_NOT_YET_SUPPORTED";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["OBJECT_TOO_BIG"] = 5] = "OBJECT_TOO_BIG";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["PACKAGE_TOO_BIG"] = 6] = "PACKAGE_TOO_BIG";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["CIRCULAR_OBJECT_OWNERSHIP"] = 7] = "CIRCULAR_OBJECT_OWNERSHIP";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INSUFFICIENT_COIN_BALANCE"] = 8] = "INSUFFICIENT_COIN_BALANCE";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["COIN_BALANCE_OVERFLOW"] = 9] = "COIN_BALANCE_OVERFLOW";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["PUBLISH_ERROR_NON_ZERO_ADDRESS"] = 10] = "PUBLISH_ERROR_NON_ZERO_ADDRESS";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["SUI_MOVE_VERIFICATION_ERROR"] = 11] = "SUI_MOVE_VERIFICATION_ERROR";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["MOVE_PRIMITIVE_RUNTIME_ERROR"] = 12] = "MOVE_PRIMITIVE_RUNTIME_ERROR";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["MOVE_ABORT"] = 13] = "MOVE_ABORT";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["VM_VERIFICATION_OR_DESERIALIZATION_ERROR"] = 14] = "VM_VERIFICATION_OR_DESERIALIZATION_ERROR";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["VM_INVARIANT_VIOLATION"] = 15] = "VM_INVARIANT_VIOLATION";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["FUNCTION_NOT_FOUND"] = 16] = "FUNCTION_NOT_FOUND";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["ARITY_MISMATCH"] = 17] = "ARITY_MISMATCH";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["TYPE_ARITY_MISMATCH"] = 18] = "TYPE_ARITY_MISMATCH";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["NON_ENTRY_FUNCTION_INVOKED"] = 19] = "NON_ENTRY_FUNCTION_INVOKED";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["COMMAND_ARGUMENT_ERROR"] = 20] = "COMMAND_ARGUMENT_ERROR";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["TYPE_ARGUMENT_ERROR"] = 21] = "TYPE_ARGUMENT_ERROR";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["UNUSED_VALUE_WITHOUT_DROP"] = 22] = "UNUSED_VALUE_WITHOUT_DROP";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INVALID_PUBLIC_FUNCTION_RETURN_TYPE"] = 23] = "INVALID_PUBLIC_FUNCTION_RETURN_TYPE";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INVALID_TRANSFER_OBJECT"] = 24] = "INVALID_TRANSFER_OBJECT";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["EFFECTS_TOO_LARGE"] = 25] = "EFFECTS_TOO_LARGE";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["PUBLISH_UPGRADE_MISSING_DEPENDENCY"] = 26] = "PUBLISH_UPGRADE_MISSING_DEPENDENCY";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["PUBLISH_UPGRADE_DEPENDENCY_DOWNGRADE"] = 27] = "PUBLISH_UPGRADE_DEPENDENCY_DOWNGRADE";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["PACKAGE_UPGRADE_ERROR"] = 28] = "PACKAGE_UPGRADE_ERROR";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["WRITTEN_OBJECTS_TOO_LARGE"] = 29] = "WRITTEN_OBJECTS_TOO_LARGE";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["CERTIFICATE_DENIED"] = 30] = "CERTIFICATE_DENIED";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["SUI_MOVE_VERIFICATION_TIMEDOUT"] = 31] = "SUI_MOVE_VERIFICATION_TIMEDOUT";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["CONSENSUS_OBJECT_OPERATION_NOT_ALLOWED"] = 32] = "CONSENSUS_OBJECT_OPERATION_NOT_ALLOWED";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INPUT_OBJECT_DELETED"] = 33] = "INPUT_OBJECT_DELETED";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["EXECUTION_CANCELED_DUE_TO_CONSENSUS_OBJECT_CONGESTION"] = 34] = "EXECUTION_CANCELED_DUE_TO_CONSENSUS_OBJECT_CONGESTION";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["ADDRESS_DENIED_FOR_COIN"] = 35] = "ADDRESS_DENIED_FOR_COIN";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["COIN_TYPE_GLOBAL_PAUSE"] = 36] = "COIN_TYPE_GLOBAL_PAUSE";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["EXECUTION_CANCELED_DUE_TO_RANDOMNESS_UNAVAILABLE"] = 37] = "EXECUTION_CANCELED_DUE_TO_RANDOMNESS_UNAVAILABLE";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["MOVE_VECTOR_ELEM_TOO_BIG"] = 38] = "MOVE_VECTOR_ELEM_TOO_BIG";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["MOVE_RAW_VALUE_TOO_BIG"] = 39] = "MOVE_RAW_VALUE_TOO_BIG";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INVALID_LINKAGE"] = 40] = "INVALID_LINKAGE";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["INSUFFICIENT_FUNDS_FOR_WITHDRAW"] = 41] = "INSUFFICIENT_FUNDS_FOR_WITHDRAW";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["NON_EXCLUSIVE_WRITE_INPUT_OBJECT_MODIFIED"] = 42] = "NON_EXCLUSIVE_WRITE_INPUT_OBJECT_MODIFIED";
  ExecutionError_ExecutionErrorKind$1[ExecutionError_ExecutionErrorKind$1["TRANSACTION_EXPIRED"] = 43] = "TRANSACTION_EXPIRED";
  return ExecutionError_ExecutionErrorKind$1;
})({});
var CommandArgumentError_CommandArgumentErrorKind = /* @__PURE__ */ (function(CommandArgumentError_CommandArgumentErrorKind$1) {
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["COMMAND_ARGUMENT_ERROR_KIND_UNKNOWN"] = 0] = "COMMAND_ARGUMENT_ERROR_KIND_UNKNOWN";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["TYPE_MISMATCH"] = 1] = "TYPE_MISMATCH";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_BCS_BYTES"] = 2] = "INVALID_BCS_BYTES";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_USAGE_OF_PURE_ARGUMENT"] = 3] = "INVALID_USAGE_OF_PURE_ARGUMENT";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_ARGUMENT_TO_PRIVATE_ENTRY_FUNCTION"] = 4] = "INVALID_ARGUMENT_TO_PRIVATE_ENTRY_FUNCTION";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INDEX_OUT_OF_BOUNDS"] = 5] = "INDEX_OUT_OF_BOUNDS";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["SECONDARY_INDEX_OUT_OF_BOUNDS"] = 6] = "SECONDARY_INDEX_OUT_OF_BOUNDS";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_RESULT_ARITY"] = 7] = "INVALID_RESULT_ARITY";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_GAS_COIN_USAGE"] = 8] = "INVALID_GAS_COIN_USAGE";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_VALUE_USAGE"] = 9] = "INVALID_VALUE_USAGE";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_OBJECT_BY_VALUE"] = 10] = "INVALID_OBJECT_BY_VALUE";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_OBJECT_BY_MUT_REF"] = 11] = "INVALID_OBJECT_BY_MUT_REF";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["CONSENSUS_OBJECT_OPERATION_NOT_ALLOWED"] = 12] = "CONSENSUS_OBJECT_OPERATION_NOT_ALLOWED";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_ARGUMENT_ARITY"] = 13] = "INVALID_ARGUMENT_ARITY";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_TRANSFER_OBJECT"] = 14] = "INVALID_TRANSFER_OBJECT";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_MAKE_MOVE_VEC_NON_OBJECT_ARGUMENT"] = 15] = "INVALID_MAKE_MOVE_VEC_NON_OBJECT_ARGUMENT";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["ARGUMENT_WITHOUT_VALUE"] = 16] = "ARGUMENT_WITHOUT_VALUE";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["CANNOT_MOVE_BORROWED_VALUE"] = 17] = "CANNOT_MOVE_BORROWED_VALUE";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["CANNOT_WRITE_TO_EXTENDED_REFERENCE"] = 18] = "CANNOT_WRITE_TO_EXTENDED_REFERENCE";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_REFERENCE_ARGUMENT"] = 19] = "INVALID_REFERENCE_ARGUMENT";
  CommandArgumentError_CommandArgumentErrorKind$1[CommandArgumentError_CommandArgumentErrorKind$1["INVALID_TX_CONTEXT"] = 20] = "INVALID_TX_CONTEXT";
  return CommandArgumentError_CommandArgumentErrorKind$1;
})({});
var PackageUpgradeError_PackageUpgradeErrorKind = /* @__PURE__ */ (function(PackageUpgradeError_PackageUpgradeErrorKind$1) {
  PackageUpgradeError_PackageUpgradeErrorKind$1[PackageUpgradeError_PackageUpgradeErrorKind$1["PACKAGE_UPGRADE_ERROR_KIND_UNKNOWN"] = 0] = "PACKAGE_UPGRADE_ERROR_KIND_UNKNOWN";
  PackageUpgradeError_PackageUpgradeErrorKind$1[PackageUpgradeError_PackageUpgradeErrorKind$1["UNABLE_TO_FETCH_PACKAGE"] = 1] = "UNABLE_TO_FETCH_PACKAGE";
  PackageUpgradeError_PackageUpgradeErrorKind$1[PackageUpgradeError_PackageUpgradeErrorKind$1["NOT_A_PACKAGE"] = 2] = "NOT_A_PACKAGE";
  PackageUpgradeError_PackageUpgradeErrorKind$1[PackageUpgradeError_PackageUpgradeErrorKind$1["INCOMPATIBLE_UPGRADE"] = 3] = "INCOMPATIBLE_UPGRADE";
  PackageUpgradeError_PackageUpgradeErrorKind$1[PackageUpgradeError_PackageUpgradeErrorKind$1["DIGEST_DOES_NOT_MATCH"] = 4] = "DIGEST_DOES_NOT_MATCH";
  PackageUpgradeError_PackageUpgradeErrorKind$1[PackageUpgradeError_PackageUpgradeErrorKind$1["UNKNOWN_UPGRADE_POLICY"] = 5] = "UNKNOWN_UPGRADE_POLICY";
  PackageUpgradeError_PackageUpgradeErrorKind$1[PackageUpgradeError_PackageUpgradeErrorKind$1["PACKAGE_ID_DOES_NOT_MATCH"] = 6] = "PACKAGE_ID_DOES_NOT_MATCH";
  return PackageUpgradeError_PackageUpgradeErrorKind$1;
})({});
var TypeArgumentError_TypeArgumentErrorKind = /* @__PURE__ */ (function(TypeArgumentError_TypeArgumentErrorKind$1) {
  TypeArgumentError_TypeArgumentErrorKind$1[TypeArgumentError_TypeArgumentErrorKind$1["TYPE_ARGUMENT_ERROR_KIND_UNKNOWN"] = 0] = "TYPE_ARGUMENT_ERROR_KIND_UNKNOWN";
  TypeArgumentError_TypeArgumentErrorKind$1[TypeArgumentError_TypeArgumentErrorKind$1["TYPE_NOT_FOUND"] = 1] = "TYPE_NOT_FOUND";
  TypeArgumentError_TypeArgumentErrorKind$1[TypeArgumentError_TypeArgumentErrorKind$1["CONSTRAINT_NOT_SATISFIED"] = 2] = "CONSTRAINT_NOT_SATISFIED";
  return TypeArgumentError_TypeArgumentErrorKind$1;
})({});
var ExecutionStatus$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.ExecutionStatus", [{
      no: 1,
      name: "success",
      kind: "scalar",
      opt: true,
      T: 8
    }, {
      no: 2,
      name: "error",
      kind: "message",
      T: () => ExecutionError
    }]);
  }
};
var ExecutionStatus2 = new ExecutionStatus$Type();
var ExecutionError$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.ExecutionError", [
      {
        no: 1,
        name: "description",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "command",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.ExecutionError.ExecutionErrorKind", ExecutionError_ExecutionErrorKind]
      },
      {
        no: 4,
        name: "abort",
        kind: "message",
        oneof: "errorDetails",
        T: () => MoveAbort
      },
      {
        no: 5,
        name: "size_error",
        kind: "message",
        oneof: "errorDetails",
        T: () => SizeError
      },
      {
        no: 6,
        name: "command_argument_error",
        kind: "message",
        oneof: "errorDetails",
        T: () => CommandArgumentError2
      },
      {
        no: 7,
        name: "type_argument_error",
        kind: "message",
        oneof: "errorDetails",
        T: () => TypeArgumentError2
      },
      {
        no: 8,
        name: "package_upgrade_error",
        kind: "message",
        oneof: "errorDetails",
        T: () => PackageUpgradeError2
      },
      {
        no: 9,
        name: "index_error",
        kind: "message",
        oneof: "errorDetails",
        T: () => IndexError
      },
      {
        no: 10,
        name: "object_id",
        kind: "scalar",
        oneof: "errorDetails",
        T: 9
      },
      {
        no: 11,
        name: "coin_deny_list_error",
        kind: "message",
        oneof: "errorDetails",
        T: () => CoinDenyListError
      },
      {
        no: 12,
        name: "congested_objects",
        kind: "message",
        oneof: "errorDetails",
        T: () => CongestedObjects
      }
    ]);
  }
};
var ExecutionError = new ExecutionError$Type();
var MoveAbort$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.MoveAbort", [
      {
        no: 1,
        name: "abort_code",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "location",
        kind: "message",
        T: () => MoveLocation2
      },
      {
        no: 3,
        name: "clever_error",
        kind: "message",
        T: () => CleverError
      }
    ]);
  }
};
var MoveAbort = new MoveAbort$Type();
var MoveLocation$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.MoveLocation", [
      {
        no: 1,
        name: "package",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "module",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "function",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 4,
        name: "instruction",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 5,
        name: "function_name",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var MoveLocation2 = new MoveLocation$Type();
var CleverError$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.CleverError", [
      {
        no: 1,
        name: "error_code",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "line_number",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "constant_name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "constant_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "rendered",
        kind: "scalar",
        oneof: "value",
        T: 9
      },
      {
        no: 6,
        name: "raw",
        kind: "scalar",
        oneof: "value",
        T: 12
      }
    ]);
  }
};
var CleverError = new CleverError$Type();
var SizeError$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.SizeError", [{
      no: 1,
      name: "size",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "max_size",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var SizeError = new SizeError$Type();
var IndexError$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.IndexError", [{
      no: 1,
      name: "index",
      kind: "scalar",
      opt: true,
      T: 13
    }, {
      no: 2,
      name: "subresult",
      kind: "scalar",
      opt: true,
      T: 13
    }]);
  }
};
var IndexError = new IndexError$Type();
var CoinDenyListError$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.CoinDenyListError", [{
      no: 1,
      name: "address",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "coin_type",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var CoinDenyListError = new CoinDenyListError$Type();
var CongestedObjects$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.CongestedObjects", [{
      no: 1,
      name: "objects",
      kind: "scalar",
      repeat: 2,
      T: 9
    }]);
  }
};
var CongestedObjects = new CongestedObjects$Type();
var CommandArgumentError$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.CommandArgumentError", [
      {
        no: 1,
        name: "argument",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 2,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.CommandArgumentError.CommandArgumentErrorKind", CommandArgumentError_CommandArgumentErrorKind]
      },
      {
        no: 3,
        name: "index_error",
        kind: "message",
        T: () => IndexError
      }
    ]);
  }
};
var CommandArgumentError2 = new CommandArgumentError$Type();
var PackageUpgradeError$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.PackageUpgradeError", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.PackageUpgradeError.PackageUpgradeErrorKind", PackageUpgradeError_PackageUpgradeErrorKind]
      },
      {
        no: 2,
        name: "package_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "policy",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 5,
        name: "ticket_id",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var PackageUpgradeError2 = new PackageUpgradeError$Type();
var TypeArgumentError$Type = class extends import_runtime13.MessageType {
  constructor() {
    super("sui.rpc.v2.TypeArgumentError", [{
      no: 1,
      name: "type_argument",
      kind: "scalar",
      opt: true,
      T: 13
    }, {
      no: 2,
      name: "kind",
      kind: "enum",
      opt: true,
      T: () => ["sui.rpc.v2.TypeArgumentError.TypeArgumentErrorKind", TypeArgumentError_TypeArgumentErrorKind]
    }]);
  }
};
var TypeArgumentError2 = new TypeArgumentError$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/gas_cost_summary.mjs
var import_runtime14 = __toESM(require_commonjs(), 1);
var GasCostSummary$Type = class extends import_runtime14.MessageType {
  constructor() {
    super("sui.rpc.v2.GasCostSummary", [
      {
        no: 1,
        name: "computation_cost",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "storage_cost",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "storage_rebate",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "non_refundable_storage_fee",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var GasCostSummary2 = new GasCostSummary$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/effects.mjs
var import_runtime15 = __toESM(require_commonjs(), 1);
var ChangedObject_InputObjectState = /* @__PURE__ */ (function(ChangedObject_InputObjectState$1) {
  ChangedObject_InputObjectState$1[ChangedObject_InputObjectState$1["UNKNOWN"] = 0] = "UNKNOWN";
  ChangedObject_InputObjectState$1[ChangedObject_InputObjectState$1["DOES_NOT_EXIST"] = 1] = "DOES_NOT_EXIST";
  ChangedObject_InputObjectState$1[ChangedObject_InputObjectState$1["EXISTS"] = 2] = "EXISTS";
  return ChangedObject_InputObjectState$1;
})({});
var ChangedObject_OutputObjectState = /* @__PURE__ */ (function(ChangedObject_OutputObjectState$1) {
  ChangedObject_OutputObjectState$1[ChangedObject_OutputObjectState$1["UNKNOWN"] = 0] = "UNKNOWN";
  ChangedObject_OutputObjectState$1[ChangedObject_OutputObjectState$1["DOES_NOT_EXIST"] = 1] = "DOES_NOT_EXIST";
  ChangedObject_OutputObjectState$1[ChangedObject_OutputObjectState$1["OBJECT_WRITE"] = 2] = "OBJECT_WRITE";
  ChangedObject_OutputObjectState$1[ChangedObject_OutputObjectState$1["PACKAGE_WRITE"] = 3] = "PACKAGE_WRITE";
  ChangedObject_OutputObjectState$1[ChangedObject_OutputObjectState$1["ACCUMULATOR_WRITE"] = 4] = "ACCUMULATOR_WRITE";
  return ChangedObject_OutputObjectState$1;
})({});
var ChangedObject_IdOperation = /* @__PURE__ */ (function(ChangedObject_IdOperation$1) {
  ChangedObject_IdOperation$1[ChangedObject_IdOperation$1["ID_OPERATION_UNKNOWN"] = 0] = "ID_OPERATION_UNKNOWN";
  ChangedObject_IdOperation$1[ChangedObject_IdOperation$1["NONE"] = 1] = "NONE";
  ChangedObject_IdOperation$1[ChangedObject_IdOperation$1["CREATED"] = 2] = "CREATED";
  ChangedObject_IdOperation$1[ChangedObject_IdOperation$1["DELETED"] = 3] = "DELETED";
  return ChangedObject_IdOperation$1;
})({});
var AccumulatorWrite_AccumulatorOperation = /* @__PURE__ */ (function(AccumulatorWrite_AccumulatorOperation$1) {
  AccumulatorWrite_AccumulatorOperation$1[AccumulatorWrite_AccumulatorOperation$1["ACCUMULATOR_OPERATION_UNKNOWN"] = 0] = "ACCUMULATOR_OPERATION_UNKNOWN";
  AccumulatorWrite_AccumulatorOperation$1[AccumulatorWrite_AccumulatorOperation$1["MERGE"] = 1] = "MERGE";
  AccumulatorWrite_AccumulatorOperation$1[AccumulatorWrite_AccumulatorOperation$1["SPLIT"] = 2] = "SPLIT";
  return AccumulatorWrite_AccumulatorOperation$1;
})({});
var AccumulatorWrite_AccumulatorValue = /* @__PURE__ */ (function(AccumulatorWrite_AccumulatorValue$1) {
  AccumulatorWrite_AccumulatorValue$1[AccumulatorWrite_AccumulatorValue$1["ACCUMULATOR_VALUE_UNKNOWN"] = 0] = "ACCUMULATOR_VALUE_UNKNOWN";
  AccumulatorWrite_AccumulatorValue$1[AccumulatorWrite_AccumulatorValue$1["INTEGER"] = 1] = "INTEGER";
  AccumulatorWrite_AccumulatorValue$1[AccumulatorWrite_AccumulatorValue$1["INTEGER_TUPLE"] = 2] = "INTEGER_TUPLE";
  AccumulatorWrite_AccumulatorValue$1[AccumulatorWrite_AccumulatorValue$1["EVENT_DIGEST"] = 3] = "EVENT_DIGEST";
  return AccumulatorWrite_AccumulatorValue$1;
})({});
var UnchangedConsensusObject_UnchangedConsensusObjectKind = /* @__PURE__ */ (function(UnchangedConsensusObject_UnchangedConsensusObjectKind$1) {
  UnchangedConsensusObject_UnchangedConsensusObjectKind$1[UnchangedConsensusObject_UnchangedConsensusObjectKind$1["UNCHANGED_CONSENSUS_OBJECT_KIND_UNKNOWN"] = 0] = "UNCHANGED_CONSENSUS_OBJECT_KIND_UNKNOWN";
  UnchangedConsensusObject_UnchangedConsensusObjectKind$1[UnchangedConsensusObject_UnchangedConsensusObjectKind$1["READ_ONLY_ROOT"] = 1] = "READ_ONLY_ROOT";
  UnchangedConsensusObject_UnchangedConsensusObjectKind$1[UnchangedConsensusObject_UnchangedConsensusObjectKind$1["MUTATE_CONSENSUS_STREAM_ENDED"] = 2] = "MUTATE_CONSENSUS_STREAM_ENDED";
  UnchangedConsensusObject_UnchangedConsensusObjectKind$1[UnchangedConsensusObject_UnchangedConsensusObjectKind$1["READ_CONSENSUS_STREAM_ENDED"] = 3] = "READ_CONSENSUS_STREAM_ENDED";
  UnchangedConsensusObject_UnchangedConsensusObjectKind$1[UnchangedConsensusObject_UnchangedConsensusObjectKind$1["CANCELED"] = 4] = "CANCELED";
  UnchangedConsensusObject_UnchangedConsensusObjectKind$1[UnchangedConsensusObject_UnchangedConsensusObjectKind$1["PER_EPOCH_CONFIG"] = 5] = "PER_EPOCH_CONFIG";
  return UnchangedConsensusObject_UnchangedConsensusObjectKind$1;
})({});
var TransactionEffects$Type = class extends import_runtime15.MessageType {
  constructor() {
    super("sui.rpc.v2.TransactionEffects", [
      {
        no: 1,
        name: "bcs",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 2,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 5
      },
      {
        no: 4,
        name: "status",
        kind: "message",
        T: () => ExecutionStatus2
      },
      {
        no: 5,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 6,
        name: "gas_used",
        kind: "message",
        T: () => GasCostSummary2
      },
      {
        no: 7,
        name: "transaction_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 8,
        name: "gas_object",
        kind: "message",
        T: () => ChangedObject
      },
      {
        no: 9,
        name: "events_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 10,
        name: "dependencies",
        kind: "scalar",
        repeat: 2,
        T: 9
      },
      {
        no: 11,
        name: "lamport_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 12,
        name: "changed_objects",
        kind: "message",
        repeat: 2,
        T: () => ChangedObject
      },
      {
        no: 13,
        name: "unchanged_consensus_objects",
        kind: "message",
        repeat: 2,
        T: () => UnchangedConsensusObject
      },
      {
        no: 14,
        name: "auxiliary_data_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 15,
        name: "unchanged_loaded_runtime_objects",
        kind: "message",
        repeat: 2,
        T: () => ObjectReference
      }
    ]);
  }
};
var TransactionEffects2 = new TransactionEffects$Type();
var ChangedObject$Type = class extends import_runtime15.MessageType {
  constructor() {
    super("sui.rpc.v2.ChangedObject", [
      {
        no: 1,
        name: "object_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "input_state",
        kind: "enum",
        opt: true,
        T: () => [
          "sui.rpc.v2.ChangedObject.InputObjectState",
          ChangedObject_InputObjectState,
          "INPUT_OBJECT_STATE_"
        ]
      },
      {
        no: 3,
        name: "input_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "input_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "input_owner",
        kind: "message",
        T: () => Owner2
      },
      {
        no: 6,
        name: "output_state",
        kind: "enum",
        opt: true,
        T: () => [
          "sui.rpc.v2.ChangedObject.OutputObjectState",
          ChangedObject_OutputObjectState,
          "OUTPUT_OBJECT_STATE_"
        ]
      },
      {
        no: 7,
        name: "output_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 8,
        name: "output_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 9,
        name: "output_owner",
        kind: "message",
        T: () => Owner2
      },
      {
        no: 12,
        name: "accumulator_write",
        kind: "message",
        T: () => AccumulatorWrite
      },
      {
        no: 10,
        name: "id_operation",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.ChangedObject.IdOperation", ChangedObject_IdOperation]
      },
      {
        no: 11,
        name: "object_type",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var ChangedObject = new ChangedObject$Type();
var EventDigestEntry$Type = class extends import_runtime15.MessageType {
  constructor() {
    super("sui.rpc.v2.EventDigestEntry", [{
      no: 1,
      name: "event_index",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "digest",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var EventDigestEntry = new EventDigestEntry$Type();
var AccumulatorWrite$Type = class extends import_runtime15.MessageType {
  constructor() {
    super("sui.rpc.v2.AccumulatorWrite", [
      {
        no: 1,
        name: "address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "accumulator_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "operation",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.AccumulatorWrite.AccumulatorOperation", AccumulatorWrite_AccumulatorOperation]
      },
      {
        no: 4,
        name: "value_kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.AccumulatorWrite.AccumulatorValue", AccumulatorWrite_AccumulatorValue]
      },
      {
        no: 5,
        name: "integer_value",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 6,
        name: "integer_tuple",
        kind: "scalar",
        repeat: 1,
        T: 4,
        L: 0
      },
      {
        no: 7,
        name: "event_digest_value",
        kind: "message",
        repeat: 2,
        T: () => EventDigestEntry
      }
    ]);
  }
};
var AccumulatorWrite = new AccumulatorWrite$Type();
var UnchangedConsensusObject$Type = class extends import_runtime15.MessageType {
  constructor() {
    super("sui.rpc.v2.UnchangedConsensusObject", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.UnchangedConsensusObject.UnchangedConsensusObjectKind", UnchangedConsensusObject_UnchangedConsensusObjectKind]
      },
      {
        no: 2,
        name: "object_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "object_type",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var UnchangedConsensusObject = new UnchangedConsensusObject$Type();

// node_modules/@mysten/sui/dist/client/query-filters.mjs
var DEFAULT_PAGE_SIZE = 50;
function resolvePagination(options) {
  if (options.after != null && options.before != null) throw new Error("Only one of `after` or `before` may be provided");
  const descending = options.order ? options.order === "descending" : options.before != null;
  if (options.after != null && descending) throw new Error("`after` can not be combined with descending queries");
  if (options.before != null && !descending) throw new Error("`before` can not be combined with ascending queries");
  return {
    descending,
    after: options.after ?? void 0,
    before: options.before ?? void 0,
    limit: options.limit ?? DEFAULT_PAGE_SIZE
  };
}
function validateTransactionQuery(filter, pagination) {
  if (filter?.$kind === "function" && (pagination.after != null || pagination.before != null) && (!filter.module || !filter.function)) throw new Error("Paginating transactions filtered by function requires a fully qualified `package::module::function`");
}
async function resolveTransactionFilter(mvr, filter, signal) {
  assertSinglePredicate(filter, ["sender", "function"], "transaction");
  if (filter.sender != null) return {
    $kind: "sender",
    sender: normalizeSuiAddress(filter.sender)
  };
  const [pkg, module, fn, ...rest] = filter.function.split("::");
  if (!pkg || rest.length > 0 || module === "" || fn === "") throw new Error(`Invalid function filter "${filter.function}": expected "package", "package::module", or "package::module::function"`);
  return {
    $kind: "function",
    package: normalizeSuiAddress((await mvr.resolvePackage({
      package: pkg,
      signal
    })).package),
    module,
    function: fn
  };
}
async function resolveEventFilter(mvr, filter, signal) {
  assertSinglePredicate(filter, [
    "sender",
    "emitModule",
    "eventType"
  ], "event");
  if (filter.sender != null) return {
    $kind: "sender",
    sender: normalizeSuiAddress(filter.sender)
  };
  if (filter.emitModule != null) {
    const [pkg, module, ...rest] = filter.emitModule.split("::");
    if (!pkg || !module || rest.length > 0) throw new Error(`Invalid emitModule filter "${filter.emitModule}": expected "package::module"`);
    return {
      $kind: "emitModule",
      package: normalizeSuiAddress((await mvr.resolvePackage({
        package: pkg,
        signal
      })).package),
      module
    };
  }
  const eventType = filter.eventType;
  const segments = eventType.split("::");
  if (segments.length === 2 && segments.every((segment) => segment !== "")) return {
    $kind: "eventTypeModule",
    package: normalizeSuiAddress((await mvr.resolvePackage({
      package: segments[0],
      signal
    })).package),
    module: segments[1]
  };
  if (segments.length < 3 || segments.some((segment) => segment === "")) throw new Error(`Invalid eventType filter "${eventType}": expected "package::module" or a fully qualified type name`);
  return {
    $kind: "eventType",
    eventType: (await mvr.resolveType({
      type: eventType,
      signal
    })).type
  };
}
function assertSinglePredicate(filter, predicates, kind) {
  const present = predicates.filter((predicate) => filter[predicate] != null);
  if (present.length !== 1) throw new Error(`A ${kind} filter must specify exactly one of ${predicates.join(", ")}${present.length ? ` (got ${present.join(", ")})` : ""}`);
}

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/balance_change.mjs
var import_runtime16 = __toESM(require_commonjs(), 1);
var BalanceChange$Type = class extends import_runtime16.MessageType {
  constructor() {
    super("sui.rpc.v2.BalanceChange", [
      {
        no: 1,
        name: "address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "coin_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "amount",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var BalanceChange = new BalanceChange$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/event.mjs
var import_runtime17 = __toESM(require_commonjs(), 1);
var TransactionEvents$Type = class extends import_runtime17.MessageType {
  constructor() {
    super("sui.rpc.v2.TransactionEvents", [
      {
        no: 1,
        name: "bcs",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 2,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "events",
        kind: "message",
        repeat: 2,
        T: () => Event
      }
    ]);
  }
};
var TransactionEvents = new TransactionEvents$Type();
var Event$Type = class extends import_runtime17.MessageType {
  constructor() {
    super("sui.rpc.v2.Event", [
      {
        no: 1,
        name: "package_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "module",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "sender",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "event_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "contents",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 6,
        name: "json",
        kind: "message",
        T: () => Value
      },
      {
        no: 7,
        name: "checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 8,
        name: "transaction_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 9,
        name: "transaction_index",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 10,
        name: "event_index",
        kind: "scalar",
        opt: true,
        T: 13
      }
    ]);
  }
};
var Event = new Event$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/signature_scheme.mjs
var SignatureScheme = /* @__PURE__ */ (function(SignatureScheme$1) {
  SignatureScheme$1[SignatureScheme$1["ED25519"] = 0] = "ED25519";
  SignatureScheme$1[SignatureScheme$1["SECP256K1"] = 1] = "SECP256K1";
  SignatureScheme$1[SignatureScheme$1["SECP256R1"] = 2] = "SECP256R1";
  SignatureScheme$1[SignatureScheme$1["MULTISIG"] = 3] = "MULTISIG";
  SignatureScheme$1[SignatureScheme$1["BLS12381"] = 4] = "BLS12381";
  SignatureScheme$1[SignatureScheme$1["ZKLOGIN"] = 5] = "ZKLOGIN";
  SignatureScheme$1[SignatureScheme$1["PASSKEY"] = 6] = "PASSKEY";
  return SignatureScheme$1;
})({});

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/signature.mjs
var import_runtime18 = __toESM(require_commonjs(), 1);
var UserSignature$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.UserSignature", [
      {
        no: 1,
        name: "bcs",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 2,
        name: "scheme",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.SignatureScheme", SignatureScheme]
      },
      {
        no: 3,
        name: "simple",
        kind: "message",
        oneof: "signature",
        T: () => SimpleSignature
      },
      {
        no: 4,
        name: "multisig",
        kind: "message",
        oneof: "signature",
        T: () => MultisigAggregatedSignature
      },
      {
        no: 5,
        name: "zklogin",
        kind: "message",
        oneof: "signature",
        T: () => ZkLoginAuthenticator
      },
      {
        no: 6,
        name: "passkey",
        kind: "message",
        oneof: "signature",
        T: () => PasskeyAuthenticator2
      }
    ]);
  }
};
var UserSignature = new UserSignature$Type();
var SimpleSignature$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.SimpleSignature", [
      {
        no: 1,
        name: "scheme",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.SignatureScheme", SignatureScheme]
      },
      {
        no: 2,
        name: "signature",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 3,
        name: "public_key",
        kind: "scalar",
        opt: true,
        T: 12
      }
    ]);
  }
};
var SimpleSignature = new SimpleSignature$Type();
var ZkLoginPublicIdentifier$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.ZkLoginPublicIdentifier", [{
      no: 1,
      name: "iss",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "address_seed",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var ZkLoginPublicIdentifier = new ZkLoginPublicIdentifier$Type();
var MultisigMemberPublicKey$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.MultisigMemberPublicKey", [
      {
        no: 1,
        name: "scheme",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.SignatureScheme", SignatureScheme]
      },
      {
        no: 2,
        name: "public_key",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 3,
        name: "zklogin",
        kind: "message",
        T: () => ZkLoginPublicIdentifier
      }
    ]);
  }
};
var MultisigMemberPublicKey = new MultisigMemberPublicKey$Type();
var MultisigMember$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.MultisigMember", [{
      no: 1,
      name: "public_key",
      kind: "message",
      T: () => MultisigMemberPublicKey
    }, {
      no: 2,
      name: "weight",
      kind: "scalar",
      opt: true,
      T: 13
    }]);
  }
};
var MultisigMember = new MultisigMember$Type();
var MultisigCommittee$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.MultisigCommittee", [{
      no: 1,
      name: "members",
      kind: "message",
      repeat: 2,
      T: () => MultisigMember
    }, {
      no: 2,
      name: "threshold",
      kind: "scalar",
      opt: true,
      T: 13
    }]);
  }
};
var MultisigCommittee = new MultisigCommittee$Type();
var MultisigAggregatedSignature$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.MultisigAggregatedSignature", [
      {
        no: 1,
        name: "signatures",
        kind: "message",
        repeat: 2,
        T: () => MultisigMemberSignature
      },
      {
        no: 2,
        name: "bitmap",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "legacy_bitmap",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 4,
        name: "committee",
        kind: "message",
        T: () => MultisigCommittee
      }
    ]);
  }
};
var MultisigAggregatedSignature = new MultisigAggregatedSignature$Type();
var MultisigMemberSignature$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.MultisigMemberSignature", [
      {
        no: 1,
        name: "scheme",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.SignatureScheme", SignatureScheme]
      },
      {
        no: 2,
        name: "signature",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 3,
        name: "zklogin",
        kind: "message",
        T: () => ZkLoginAuthenticator
      },
      {
        no: 4,
        name: "passkey",
        kind: "message",
        T: () => PasskeyAuthenticator2
      }
    ]);
  }
};
var MultisigMemberSignature = new MultisigMemberSignature$Type();
var ZkLoginAuthenticator$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.ZkLoginAuthenticator", [
      {
        no: 1,
        name: "inputs",
        kind: "message",
        T: () => ZkLoginInputs
      },
      {
        no: 2,
        name: "max_epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "signature",
        kind: "message",
        T: () => SimpleSignature
      },
      {
        no: 4,
        name: "public_identifier",
        kind: "message",
        T: () => ZkLoginPublicIdentifier
      },
      {
        no: 5,
        name: "jwk_id",
        kind: "message",
        T: () => JwkId
      }
    ]);
  }
};
var ZkLoginAuthenticator = new ZkLoginAuthenticator$Type();
var ZkLoginInputs$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.ZkLoginInputs", [
      {
        no: 1,
        name: "proof_points",
        kind: "message",
        T: () => ZkLoginProof
      },
      {
        no: 2,
        name: "iss_base64_details",
        kind: "message",
        T: () => ZkLoginClaim
      },
      {
        no: 3,
        name: "header_base64",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "address_seed",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var ZkLoginInputs = new ZkLoginInputs$Type();
var ZkLoginProof$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.ZkLoginProof", [
      {
        no: 1,
        name: "a",
        kind: "message",
        T: () => CircomG1
      },
      {
        no: 2,
        name: "b",
        kind: "message",
        T: () => CircomG2
      },
      {
        no: 3,
        name: "c",
        kind: "message",
        T: () => CircomG1
      }
    ]);
  }
};
var ZkLoginProof = new ZkLoginProof$Type();
var ZkLoginClaim$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.ZkLoginClaim", [{
      no: 1,
      name: "value",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "index_mod_4",
      kind: "scalar",
      opt: true,
      T: 13
    }]);
  }
};
var ZkLoginClaim = new ZkLoginClaim$Type();
var CircomG1$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.CircomG1", [
      {
        no: 1,
        name: "e0",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "e1",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "e2",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var CircomG1 = new CircomG1$Type();
var CircomG2$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.CircomG2", [
      {
        no: 1,
        name: "e00",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "e01",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "e10",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "e11",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "e20",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 6,
        name: "e21",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var CircomG2 = new CircomG2$Type();
var PasskeyAuthenticator$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.PasskeyAuthenticator", [
      {
        no: 1,
        name: "authenticator_data",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 2,
        name: "client_data_json",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "signature",
        kind: "message",
        T: () => SimpleSignature
      }
    ]);
  }
};
var PasskeyAuthenticator2 = new PasskeyAuthenticator$Type();
var ValidatorCommittee$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.ValidatorCommittee", [{
      no: 1,
      name: "epoch",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "members",
      kind: "message",
      repeat: 2,
      T: () => ValidatorCommitteeMember
    }]);
  }
};
var ValidatorCommittee = new ValidatorCommittee$Type();
var ValidatorCommitteeMember$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.ValidatorCommitteeMember", [{
      no: 1,
      name: "public_key",
      kind: "scalar",
      opt: true,
      T: 12
    }, {
      no: 2,
      name: "weight",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var ValidatorCommitteeMember = new ValidatorCommitteeMember$Type();
var ValidatorAggregatedSignature$Type = class extends import_runtime18.MessageType {
  constructor() {
    super("sui.rpc.v2.ValidatorAggregatedSignature", [
      {
        no: 1,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "signature",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 3,
        name: "bitmap",
        kind: "scalar",
        opt: true,
        T: 12
      }
    ]);
  }
};
var ValidatorAggregatedSignature = new ValidatorAggregatedSignature$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/executed_transaction.mjs
var import_runtime19 = __toESM(require_commonjs(), 1);
var ExecutedTransaction$Type = class extends import_runtime19.MessageType {
  constructor() {
    super("sui.rpc.v2.ExecutedTransaction", [
      {
        no: 1,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "transaction",
        kind: "message",
        T: () => Transaction
      },
      {
        no: 3,
        name: "signatures",
        kind: "message",
        repeat: 2,
        T: () => UserSignature
      },
      {
        no: 4,
        name: "effects",
        kind: "message",
        T: () => TransactionEffects2
      },
      {
        no: 5,
        name: "events",
        kind: "message",
        T: () => TransactionEvents
      },
      {
        no: 6,
        name: "checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 7,
        name: "timestamp",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 8,
        name: "balance_changes",
        kind: "message",
        repeat: 2,
        T: () => BalanceChange
      },
      {
        no: 9,
        name: "objects",
        kind: "message",
        T: () => ObjectSet
      },
      {
        no: 10,
        name: "transaction_index",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var ExecutedTransaction = new ExecutedTransaction$Type();

// node_modules/@mysten/sui/dist/grpc/proto/google/protobuf/field_mask.mjs
var import_runtime20 = __toESM(require_commonjs(), 1);
var FieldMask$Type = class extends import_runtime20.MessageType {
  constructor() {
    super("google.protobuf.FieldMask", [{
      no: 1,
      name: "paths",
      kind: "scalar",
      repeat: 2,
      T: 9
    }]);
  }
  /**
  * Encode `FieldMask` to JSON object.
  */
  internalJsonWrite(message, options) {
    const invalidFieldMaskJsonRegex = /[A-Z]|(_([.0-9_]|$))/g;
    return message.paths.map((p) => {
      if (invalidFieldMaskJsonRegex.test(p)) throw new Error('Unable to encode FieldMask to JSON. lowerCamelCase of path name "' + p + '" is irreversible.');
      return (0, import_runtime20.lowerCamelCase)(p);
    }).join(",");
  }
  /**
  * Decode `FieldMask` from JSON object.
  */
  internalJsonRead(json, options, target) {
    if (typeof json !== "string") throw new Error("Unable to parse FieldMask from JSON " + (0, import_runtime20.typeofJsonValue)(json) + ". Expected string.");
    if (!target) target = this.create();
    if (json === "") return target;
    let camelToSnake = (str) => {
      if (str.includes("_")) throw new Error("Unable to parse FieldMask from JSON. Path names must be lowerCamelCase.");
      return str.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase());
    };
    target.paths = json.split(",").map(camelToSnake);
    return target;
  }
};
var FieldMask = new FieldMask$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/transaction_execution_service.mjs
var import_runtime21 = __toESM(require_commonjs(), 1);
var import_runtime_rpc2 = __toESM(require_commonjs2(), 1);
var SimulateTransactionRequest_TransactionChecks = /* @__PURE__ */ (function(SimulateTransactionRequest_TransactionChecks$1) {
  SimulateTransactionRequest_TransactionChecks$1[SimulateTransactionRequest_TransactionChecks$1["ENABLED"] = 0] = "ENABLED";
  SimulateTransactionRequest_TransactionChecks$1[SimulateTransactionRequest_TransactionChecks$1["DISABLED"] = 1] = "DISABLED";
  return SimulateTransactionRequest_TransactionChecks$1;
})({});
var ExecuteTransactionRequest$Type = class extends import_runtime21.MessageType {
  constructor() {
    super("sui.rpc.v2.ExecuteTransactionRequest", [
      {
        no: 1,
        name: "transaction",
        kind: "message",
        T: () => Transaction
      },
      {
        no: 2,
        name: "signatures",
        kind: "message",
        repeat: 2,
        T: () => UserSignature
      },
      {
        no: 3,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      }
    ]);
  }
};
var ExecuteTransactionRequest = new ExecuteTransactionRequest$Type();
var ExecuteTransactionResponse$Type = class extends import_runtime21.MessageType {
  constructor() {
    super("sui.rpc.v2.ExecuteTransactionResponse", [{
      no: 1,
      name: "transaction",
      kind: "message",
      T: () => ExecutedTransaction
    }]);
  }
};
var ExecuteTransactionResponse = new ExecuteTransactionResponse$Type();
var SimulateTransactionRequest$Type = class extends import_runtime21.MessageType {
  constructor() {
    super("sui.rpc.v2.SimulateTransactionRequest", [
      {
        no: 1,
        name: "transaction",
        kind: "message",
        T: () => Transaction
      },
      {
        no: 2,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      },
      {
        no: 3,
        name: "checks",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.SimulateTransactionRequest.TransactionChecks", SimulateTransactionRequest_TransactionChecks]
      },
      {
        no: 4,
        name: "do_gas_selection",
        kind: "scalar",
        opt: true,
        T: 8
      }
    ]);
  }
};
var SimulateTransactionRequest = new SimulateTransactionRequest$Type();
var SimulateTransactionResponse$Type = class extends import_runtime21.MessageType {
  constructor() {
    super("sui.rpc.v2.SimulateTransactionResponse", [
      {
        no: 1,
        name: "transaction",
        kind: "message",
        T: () => ExecutedTransaction
      },
      {
        no: 2,
        name: "command_outputs",
        kind: "message",
        repeat: 2,
        T: () => CommandResult
      },
      {
        no: 3,
        name: "suggested_gas_price",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var SimulateTransactionResponse = new SimulateTransactionResponse$Type();
var CommandResult$Type = class extends import_runtime21.MessageType {
  constructor() {
    super("sui.rpc.v2.CommandResult", [{
      no: 1,
      name: "return_values",
      kind: "message",
      repeat: 2,
      T: () => CommandOutput
    }, {
      no: 2,
      name: "mutated_by_ref",
      kind: "message",
      repeat: 2,
      T: () => CommandOutput
    }]);
  }
};
var CommandResult = new CommandResult$Type();
var CommandOutput$Type = class extends import_runtime21.MessageType {
  constructor() {
    super("sui.rpc.v2.CommandOutput", [
      {
        no: 1,
        name: "argument",
        kind: "message",
        T: () => Argument2
      },
      {
        no: 2,
        name: "value",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 3,
        name: "json",
        kind: "message",
        T: () => Value
      }
    ]);
  }
};
var CommandOutput = new CommandOutput$Type();
var TransactionExecutionService = new import_runtime_rpc2.ServiceType("sui.rpc.v2.TransactionExecutionService", [{
  name: "ExecuteTransaction",
  options: {},
  I: ExecuteTransactionRequest,
  O: ExecuteTransactionResponse
}, {
  name: "SimulateTransaction",
  options: {},
  I: SimulateTransactionRequest,
  O: SimulateTransactionResponse
}]);

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/query_options.mjs
var import_runtime22 = __toESM(require_commonjs(), 1);
var Ordering = /* @__PURE__ */ (function(Ordering$1) {
  Ordering$1[Ordering$1["ASCENDING"] = 0] = "ASCENDING";
  Ordering$1[Ordering$1["DESCENDING"] = 1] = "DESCENDING";
  return Ordering$1;
})({});
var QueryEndReason = /* @__PURE__ */ (function(QueryEndReason$1) {
  QueryEndReason$1[QueryEndReason$1["UNKNOWN"] = 0] = "UNKNOWN";
  QueryEndReason$1[QueryEndReason$1["ITEM_LIMIT"] = 1] = "ITEM_LIMIT";
  QueryEndReason$1[QueryEndReason$1["SCAN_LIMIT"] = 2] = "SCAN_LIMIT";
  QueryEndReason$1[QueryEndReason$1["CHECKPOINT_BOUND"] = 3] = "CHECKPOINT_BOUND";
  QueryEndReason$1[QueryEndReason$1["CURSOR_BOUND"] = 4] = "CURSOR_BOUND";
  QueryEndReason$1[QueryEndReason$1["LEDGER_TIP"] = 5] = "LEDGER_TIP";
  return QueryEndReason$1;
})({});
var QueryOptions$Type = class extends import_runtime22.MessageType {
  constructor() {
    super("sui.rpc.v2.QueryOptions", [
      {
        no: 1,
        name: "limit",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 2,
        name: "after",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 3,
        name: "before",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 4,
        name: "ordering",
        kind: "enum",
        opt: true,
        T: () => [
          "sui.rpc.v2.Ordering",
          Ordering,
          "ORDERING_"
        ]
      }
    ]);
  }
};
var QueryOptions = new QueryOptions$Type();
var Watermark$Type = class extends import_runtime22.MessageType {
  constructor() {
    super("sui.rpc.v2.Watermark", [{
      no: 1,
      name: "cursor",
      kind: "scalar",
      opt: true,
      T: 12
    }, {
      no: 2,
      name: "checkpoint",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var Watermark = new Watermark$Type();
var QueryEnd$Type = class extends import_runtime22.MessageType {
  constructor() {
    super("sui.rpc.v2.QueryEnd", [{
      no: 1,
      name: "reason",
      kind: "enum",
      opt: true,
      T: () => [
        "sui.rpc.v2.QueryEndReason",
        QueryEndReason,
        "QUERY_END_REASON_"
      ]
    }]);
  }
};
var QueryEnd = new QueryEnd$Type();

// node_modules/@mysten/sui/dist/grpc/filters.mjs
function toGrpcTransactionFilter(filter) {
  return { terms: [{ literals: [filter.$kind === "sender" ? {
    negated: false,
    predicate: {
      oneofKind: "sender",
      sender: { address: filter.sender }
    }
  } : {
    negated: false,
    predicate: {
      oneofKind: "moveCall",
      moveCall: { function: [
        filter.package,
        filter.module,
        filter.function
      ].filter(Boolean).join("::") }
    }
  }] }] };
}
function toGrpcEventFilter(filter) {
  return { terms: [{ literals: [filter.$kind === "sender" ? {
    negated: false,
    predicate: {
      oneofKind: "sender",
      sender: { address: filter.sender }
    }
  } : filter.$kind === "emitModule" ? {
    negated: false,
    predicate: {
      oneofKind: "emitModule",
      emitModule: { module: `${filter.package}::${filter.module}` }
    }
  } : {
    negated: false,
    predicate: {
      oneofKind: "eventType",
      eventType: { eventType: filter.$kind === "eventTypeModule" ? `${filter.package}::${filter.module}` : filter.eventType }
    }
  }] }] };
}

// node_modules/@mysten/sui/dist/grpc/core.mjs
var import_runtime_rpc3 = __toESM(require_commonjs2(), 1);
var import_grpcweb_transport2 = __toESM(require_commonjs3(), 1);
function isNameServiceResolutionMiss(error) {
  if (typeof error !== "object" || error === null) return false;
  const { code, message } = error;
  if (typeof code !== "string" || typeof message !== "string") return false;
  if (code === import_grpcweb_transport2.GrpcStatusCode[import_grpcweb_transport2.GrpcStatusCode.NOT_FOUND]) return true;
  if (code !== import_grpcweb_transport2.GrpcStatusCode[import_grpcweb_transport2.GrpcStatusCode.RESOURCE_EXHAUSTED]) return false;
  if (message === "name has expired") return true;
  return !hasDecodedStatusMessage(error) && message === "name%20has%20expired";
}
var GrpcCoreClient = class extends CoreClient {
  #client;
  constructor({ client: client2, ...options }) {
    super(options);
    this.#client = client2;
  }
  async getObjects(options) {
    const batches = chunk(options.objectIds, 50);
    const results = [];
    const paths = [
      "owner",
      "object_type",
      "digest",
      "version",
      "object_id"
    ];
    if (options.include?.content) paths.push("contents");
    if (options.include?.previousTransaction) paths.push("previous_transaction");
    if (options.include?.objectBcs) paths.push("bcs");
    if (options.include?.json) paths.push("json");
    if (options.include?.display) paths.push("display");
    for (const batch of batches) {
      const response = await this.#client.ledgerService.batchGetObjects({
        requests: batch.map((id) => ({ objectId: id })),
        readMask: { paths }
      }, { abort: options.signal });
      results.push(...response.response.objects.map((object2, index) => {
        if (object2.result.oneofKind === "error") {
          const error = object2.result.error;
          if (error.code === import_grpcweb_transport2.GrpcStatusCode.NOT_FOUND) return new ObjectError("notExists", error.message, {
            cause: error,
            reason: "notFound",
            objectId: batch[index]
          });
          return new ObjectError(import_grpcweb_transport2.GrpcStatusCode[error.code] ?? "unknown", error.message, {
            cause: error,
            reason: "unknown",
            objectId: batch[index]
          });
        }
        if (object2.result.oneofKind !== "object") return new ObjectError("unknown", "Unexpected result type", {
          reason: "unknown",
          objectId: batch[index]
        });
        const bcsContent = object2.result.object.contents?.value ?? void 0;
        const objectBcs = object2.result.object.bcs?.value ?? void 0;
        const objectType = object2.result.object.objectType;
        const type = objectType && objectType.includes("::") ? normalizeStructTag(objectType) : objectType ?? "";
        const jsonContent = options.include?.json ? object2.result.object.json ? Value.toJson(object2.result.object.json) : null : void 0;
        const displayData = mapDisplayProto(options.include?.display, object2.result.object.display);
        return {
          objectId: object2.result.object.objectId,
          version: object2.result.object.version?.toString(),
          digest: object2.result.object.digest,
          content: bcsContent,
          owner: mapOwner(object2.result.object.owner),
          type,
          previousTransaction: object2.result.object.previousTransaction ?? void 0,
          objectBcs,
          json: jsonContent,
          display: displayData
        };
      }));
    }
    return { objects: results };
  }
  async listOwnedObjects(options) {
    const paths = [
      "owner",
      "object_type",
      "digest",
      "version",
      "object_id"
    ];
    if (options.include?.content) paths.push("contents");
    if (options.include?.previousTransaction) paths.push("previous_transaction");
    if (options.include?.objectBcs) paths.push("bcs");
    if (options.include?.json) paths.push("json");
    if (options.include?.display) paths.push("display");
    const response = await this.#client.stateService.listOwnedObjects({
      owner: options.owner,
      objectType: options.type ? (await this.mvr.resolveType({
        type: options.type,
        signal: options.signal
      })).type : void 0,
      pageToken: options.cursor ? fromBase64(options.cursor) : void 0,
      pageSize: options.limit,
      readMask: { paths }
    }, { abort: options.signal });
    return {
      objects: response.response.objects.map((object2) => ({
        objectId: object2.objectId,
        version: object2.version?.toString(),
        digest: object2.digest,
        content: object2.contents?.value,
        owner: mapOwner(object2.owner),
        type: object2.objectType,
        previousTransaction: object2.previousTransaction ?? void 0,
        objectBcs: object2.bcs?.value,
        json: options.include?.json ? object2.json ? Value.toJson(object2.json) : null : void 0,
        display: mapDisplayProto(options.include?.display, object2.display)
      })),
      cursor: response.response.nextPageToken ? toBase64(response.response.nextPageToken) : null,
      hasNextPage: response.response.nextPageToken !== void 0
    };
  }
  async listCoins(options) {
    const paths = [
      "owner",
      "object_type",
      "digest",
      "version",
      "object_id",
      "balance"
    ];
    const coinType = options.coinType ?? SUI_TYPE_ARG;
    const response = await this.#client.stateService.listOwnedObjects({
      owner: options.owner,
      objectType: `0x2::coin::Coin<${(await this.mvr.resolveType({
        type: coinType,
        signal: options.signal
      })).type}>`,
      pageToken: options.cursor ? fromBase64(options.cursor) : void 0,
      pageSize: options.limit,
      readMask: { paths }
    }, { abort: options.signal });
    return {
      objects: response.response.objects.map((object2) => ({
        objectId: object2.objectId,
        version: object2.version?.toString(),
        digest: object2.digest,
        owner: mapOwner(object2.owner),
        type: object2.objectType,
        balance: object2.balance?.toString()
      })),
      cursor: response.response.nextPageToken ? toBase64(response.response.nextPageToken) : null,
      hasNextPage: response.response.nextPageToken !== void 0
    };
  }
  async getBalance(options) {
    const coinType = options.coinType ?? SUI_TYPE_ARG;
    const result = await this.#client.stateService.getBalance({
      owner: options.owner,
      coinType: (await this.mvr.resolveType({
        type: coinType,
        signal: options.signal
      })).type
    }, { abort: options.signal });
    return { balance: {
      balance: result.response.balance?.balance?.toString() ?? "0",
      coinType: result.response.balance?.coinType ?? coinType,
      coinBalance: result.response.balance?.coinBalance?.toString() ?? "0",
      addressBalance: result.response.balance?.addressBalance?.toString() ?? "0"
    } };
  }
  async getCoinMetadata(options) {
    const coinType = (await this.mvr.resolveType({
      type: options.coinType,
      signal: options.signal
    })).type;
    let response;
    try {
      ({ response } = await this.#client.stateService.getCoinInfo({ coinType }, { abort: options.signal }));
    } catch (error) {
      if (options.signal?.aborted) throw error;
      return { coinMetadata: null };
    }
    if (!response.metadata) return { coinMetadata: null };
    return { coinMetadata: {
      id: response.metadata.id ?? null,
      decimals: response.metadata.decimals ?? 0,
      name: response.metadata.name ?? "",
      symbol: response.metadata.symbol ?? "",
      description: response.metadata.description ?? "",
      iconUrl: response.metadata.iconUrl ?? null
    } };
  }
  async listBalances(options) {
    const result = await this.#client.stateService.listBalances({
      owner: options.owner,
      pageToken: options.cursor ? fromBase64(options.cursor) : void 0,
      pageSize: options.limit
    }, { abort: options.signal });
    return {
      hasNextPage: !!result.response.nextPageToken,
      cursor: result.response.nextPageToken ? toBase64(result.response.nextPageToken) : null,
      balances: result.response.balances.map((balance) => ({
        balance: balance.balance?.toString() ?? "0",
        coinType: balance.coinType,
        coinBalance: balance.coinBalance?.toString() ?? "0",
        addressBalance: balance.addressBalance?.toString() ?? "0"
      }))
    };
  }
  async getTransaction(options) {
    try {
      const { response } = await this.#client.ledgerService.getTransaction({
        digest: options.digest,
        readMask: { paths: transactionReadMaskPaths(options.include) }
      }, { abort: options.signal });
      if (!response.transaction) throw new TransactionError("notFound", options.digest);
      return withProtoJson(parseGrpcTransactionResponse(response.transaction, { include: options.include }), options.include, () => ExecutedTransaction.toJson(response.transaction));
    } catch (error) {
      if (error instanceof import_runtime_rpc3.RpcError && error.code === import_grpcweb_transport2.GrpcStatusCode[import_grpcweb_transport2.GrpcStatusCode.NOT_FOUND]) throw new TransactionError("notFound", options.digest, { cause: error });
      throw error;
    }
  }
  async executeTransaction(options) {
    const { response } = await this.#client.transactionExecutionService.executeTransaction({
      transaction: { bcs: { value: options.transaction } },
      signatures: options.signatures.map((signature) => ({
        bcs: { value: fromBase64(signature) },
        signature: { oneofKind: void 0 }
      })),
      readMask: { paths: transactionReadMaskPaths(options.include) }
    }, { abort: options.signal });
    return withProtoJson(parseGrpcTransactionResponse(response.transaction, { include: options.include }), options.include, () => ExecutedTransaction.toJson(response.transaction));
  }
  async simulateTransaction(options) {
    const paths = transactionReadMaskPaths(options.include, "transaction.");
    if (options.include?.commandResults) paths.push("command_outputs");
    if (!options.include?.effects) paths.push("transaction.effects.gas_object.object_id");
    if (!(options.transaction instanceof Uint8Array)) await options.transaction.prepareForSerialization({ client: this });
    const doGasSelection = options.doGasSelection ?? (options.transaction instanceof Uint8Array ? transactionBytesHaveEmptyGasPayment(options.transaction) : options.transaction.getData().gasData.payment?.length === 0);
    const { response } = await this.#client.transactionExecutionService.simulateTransaction({
      transaction: options.transaction instanceof Uint8Array ? { bcs: { value: options.transaction } } : transactionToGrpcTransaction(options.transaction),
      readMask: { paths },
      doGasSelection,
      checks: options.checksEnabled === false ? SimulateTransactionRequest_TransactionChecks.DISABLED : SimulateTransactionRequest_TransactionChecks.ENABLED
    }, { abort: options.signal });
    return withProtoJson(parseGrpcSimulateTransactionResponse(response, { include: options.include }), options.include, () => SimulateTransactionResponse.toJson(response));
  }
  async getReferenceGasPrice(options) {
    return { referenceGasPrice: (await this.#client.ledgerService.getEpoch({ readMask: { paths: ["reference_gas_price"] } }, { abort: options?.signal })).response.epoch?.referenceGasPrice?.toString() ?? "" };
  }
  async getProtocolConfig(options) {
    const protocolConfig = (await this.#client.ledgerService.getEpoch({ readMask: { paths: ["protocol_config"] } }, { abort: options?.signal })).response.epoch?.protocolConfig;
    if (!protocolConfig) throw new Error("Protocol config not found in response");
    const featureFlags = { ...protocolConfig.featureFlags };
    const attributes = {};
    if (protocolConfig.attributes) for (const [key, value] of Object.entries(protocolConfig.attributes)) attributes[key] = value ?? null;
    return { protocolConfig: {
      protocolVersion: protocolConfig.protocolVersion?.toString() ?? null,
      featureFlags,
      attributes
    } };
  }
  async getCurrentSystemState(options) {
    const epoch = (await this.#client.ledgerService.getEpoch({ readMask: { paths: [
      "system_state.version",
      "system_state.epoch",
      "system_state.protocol_version",
      "system_state.reference_gas_price",
      "system_state.epoch_start_timestamp_ms",
      "system_state.safe_mode",
      "system_state.safe_mode_storage_rewards",
      "system_state.safe_mode_computation_rewards",
      "system_state.safe_mode_storage_rebates",
      "system_state.safe_mode_non_refundable_storage_fee",
      "system_state.parameters",
      "system_state.storage_fund",
      "system_state.stake_subsidy"
    ] } }, { abort: options?.signal })).response.epoch;
    const systemState = epoch?.systemState;
    if (!systemState) throw new Error("System state not found in response");
    const startMs = epoch?.start?.seconds ? Number(epoch.start.seconds) * 1e3 + Math.floor((epoch.start.nanos || 0) / 1e6) : systemState.epochStartTimestampMs ? Number(systemState.epochStartTimestampMs) : null;
    return { systemState: {
      systemStateVersion: systemState.version?.toString() ?? null,
      epoch: systemState.epoch?.toString() ?? null,
      protocolVersion: systemState.protocolVersion?.toString() ?? null,
      referenceGasPrice: systemState.referenceGasPrice?.toString() ?? null,
      epochStartTimestampMs: startMs.toString(),
      safeMode: systemState.safeMode ?? false,
      safeModeStorageRewards: systemState.safeModeStorageRewards?.toString() ?? null,
      safeModeComputationRewards: systemState.safeModeComputationRewards?.toString() ?? null,
      safeModeStorageRebates: systemState.safeModeStorageRebates?.toString() ?? null,
      safeModeNonRefundableStorageFee: systemState.safeModeNonRefundableStorageFee?.toString() ?? null,
      parameters: {
        epochDurationMs: systemState.parameters?.epochDurationMs?.toString() ?? null,
        stakeSubsidyStartEpoch: systemState.parameters?.stakeSubsidyStartEpoch?.toString() ?? null,
        maxValidatorCount: systemState.parameters?.maxValidatorCount?.toString() ?? null,
        minValidatorJoiningStake: systemState.parameters?.minValidatorJoiningStake?.toString() ?? null,
        validatorLowStakeThreshold: systemState.parameters?.validatorLowStakeThreshold?.toString() ?? null,
        validatorLowStakeGracePeriod: systemState.parameters?.validatorLowStakeGracePeriod?.toString() ?? null
      },
      storageFund: {
        totalObjectStorageRebates: systemState.storageFund?.totalObjectStorageRebates?.toString() ?? null,
        nonRefundableBalance: systemState.storageFund?.nonRefundableBalance?.toString() ?? null
      },
      stakeSubsidy: {
        balance: systemState.stakeSubsidy?.balance?.toString() ?? null,
        distributionCounter: systemState.stakeSubsidy?.distributionCounter?.toString() ?? null,
        currentDistributionAmount: systemState.stakeSubsidy?.currentDistributionAmount?.toString() ?? null,
        stakeSubsidyPeriodLength: systemState.stakeSubsidy?.stakeSubsidyPeriodLength?.toString() ?? null,
        stakeSubsidyDecreaseRate: systemState.stakeSubsidy?.stakeSubsidyDecreaseRate ?? null
      }
    } };
  }
  async listDynamicFields(options) {
    return this.#client.listDynamicFields(options);
  }
  async listTransactions(options) {
    const paths = transactionReadMaskPaths(options.include);
    const filter = options.filter ? await resolveTransactionFilter(this.mvr, options.filter, options.signal) : void 0;
    const pagination = resolvePagination(options);
    validateTransactionQuery(filter, pagination);
    const call = this.#client.ledgerService.listTransactions({
      readMask: { paths },
      filter: filter && toGrpcTransactionFilter(filter),
      options: toGrpcQueryOptions(pagination, pagination.limit + 1)
    }, { abort: options.signal });
    const transactions = [];
    let startCursor = null;
    let endCursor = null;
    let frontier = null;
    let end;
    let sawLookaheadItem = false;
    for await (const frame of call.responses) {
      if (frame.watermark?.cursor) frontier = toBase64(frame.watermark.cursor);
      if (frame.transaction) if (transactions.length >= pagination.limit) sawLookaheadItem = true;
      else {
        startCursor ??= frontier;
        endCursor = frontier;
        transactions.push(parseGrpcTransactionResponse(frame.transaction, { include: options.include }));
      }
      if (frame.end) end = frame.end;
    }
    const hasNextPage = sawLookaheadItem || end?.reason === QueryEndReason.SCAN_LIMIT || end?.reason === QueryEndReason.ITEM_LIMIT;
    return {
      transactions,
      hasNextPage,
      startCursor,
      endCursor: sawLookaheadItem ? endCursor : hasNextPage ? frontier ?? endCursor : endCursor
    };
  }
  async listEvents(options) {
    const pagination = resolvePagination(options);
    const call = this.#client.ledgerService.listEvents({
      readMask: { paths: [
        "package_id",
        "module",
        "sender",
        "event_type",
        "contents",
        "json",
        "checkpoint",
        "transaction_digest",
        "event_index"
      ] },
      filter: options.filter ? toGrpcEventFilter(await resolveEventFilter(this.mvr, options.filter, options.signal)) : void 0,
      options: toGrpcQueryOptions(pagination, pagination.limit + 1)
    }, { abort: options.signal });
    const events = [];
    let startCursor = null;
    let endCursor = null;
    let frontier = null;
    let end;
    let sawLookaheadItem = false;
    for await (const frame of call.responses) {
      if (frame.watermark?.cursor) frontier = toBase64(frame.watermark.cursor);
      if (frame.event) if (events.length >= pagination.limit) sawLookaheadItem = true;
      else {
        startCursor ??= frontier;
        endCursor = frontier;
        const event = frame.event;
        events.push({
          packageId: normalizeSuiAddress(event.packageId),
          module: event.module,
          sender: normalizeSuiAddress(event.sender),
          eventType: normalizeStructTag(event.eventType),
          bcs: event.contents?.value ?? new Uint8Array(),
          json: event.json ? Value.toJson(event.json) : null,
          checkpoint: event.checkpoint?.toString() ?? null,
          transactionDigest: event.transactionDigest,
          eventIndex: event.eventIndex
        });
      }
      if (frame.end) end = frame.end;
    }
    const hasNextPage = sawLookaheadItem || end?.reason === QueryEndReason.SCAN_LIMIT || end?.reason === QueryEndReason.ITEM_LIMIT;
    return {
      events,
      hasNextPage,
      startCursor,
      endCursor: sawLookaheadItem ? endCursor : hasNextPage ? frontier ?? endCursor : endCursor
    };
  }
  async verifyZkLoginSignature(options) {
    const messageBytes = fromBase64(options.bytes);
    const messageValue = options.intentScope === "PersonalMessage" ? suiBcs.byteVector().serialize(messageBytes).toBytes() : messageBytes;
    const { response } = await this.#client.signatureVerificationService.verifySignature({
      message: {
        name: options.intentScope,
        value: messageValue
      },
      signature: {
        bcs: { value: fromBase64(options.signature) },
        signature: { oneofKind: void 0 }
      },
      address: options.address,
      jwks: []
    }, { abort: options.signal });
    return {
      success: response.isValid ?? false,
      errors: response.reason ? [response.reason] : []
    };
  }
  async defaultNameServiceName(options) {
    try {
      const { response } = await this.#client.nameService.reverseLookupName({ address: options.address }, { abort: options.signal });
      return { data: { name: response.record?.name ?? null } };
    } catch (error) {
      if (isNameServiceResolutionMiss(error)) return { data: { name: null } };
      throw error;
    }
  }
  async resolveNameServiceAddress(options) {
    try {
      const { response } = await this.#client.nameService.lookupName({ name: options.name }, { abort: options.signal });
      return { address: response.record?.targetAddress ?? null };
    } catch (error) {
      if (isNameServiceResolutionMiss(error)) return { address: null };
      throw error;
    }
  }
  async getMoveFunction(options) {
    const resolvedPackageId = (await this.mvr.resolvePackage({
      package: options.packageId,
      signal: options.signal
    })).package;
    const { response } = await this.#client.movePackageService.getFunction({
      packageId: resolvedPackageId,
      moduleName: options.moduleName,
      name: options.name
    }, { abort: options.signal });
    let visibility = "unknown";
    switch (response.function?.visibility) {
      case FunctionDescriptor_Visibility.PUBLIC:
        visibility = "public";
        break;
      case FunctionDescriptor_Visibility.PRIVATE:
        visibility = "private";
        break;
      case FunctionDescriptor_Visibility.FRIEND:
        visibility = "friend";
        break;
    }
    return { function: {
      packageId: normalizeSuiAddress(resolvedPackageId),
      moduleName: options.moduleName,
      name: response.function?.name,
      visibility,
      isEntry: response.function?.isEntry ?? false,
      typeParameters: response.function?.typeParameters?.map(({ constraints }) => ({
        isPhantom: false,
        constraints: constraints.map((constraint) => {
          switch (constraint) {
            case Ability.COPY:
              return "copy";
            case Ability.DROP:
              return "drop";
            case Ability.STORE:
              return "store";
            case Ability.KEY:
              return "key";
            default:
              return "unknown";
          }
        }) ?? []
      })) ?? [],
      parameters: response.function?.parameters?.map((param) => parseNormalizedSuiMoveType(param)) ?? [],
      returns: response.function?.returns?.map((ret) => parseNormalizedSuiMoveType(ret)) ?? []
    } };
  }
  async getChainIdentifier(options) {
    return raceSignal(Promise.resolve(this.cache.read(["chainIdentifier"], async () => {
      const { response } = await this.#client.ledgerService.getServiceInfo({});
      if (!response.chainId) throw new Error("Chain identifier not found in service info");
      return { chainIdentifier: response.chainId };
    })), options?.signal);
  }
  resolveTransactionPlugin() {
    const client2 = this.#client;
    return async function resolveTransactionData(transactionData, options, next) {
      const snapshot = transactionData.snapshot();
      if (!snapshot.sender) snapshot.sender = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const grpcTransaction = transactionDataToGrpcTransaction(snapshot);
      const doGasSelection = !options.onlyTransactionKind && (snapshot.gasData.budget == null || snapshot.gasData.payment == null);
      let response;
      try {
        response = (await client2.transactionExecutionService.simulateTransaction({
          transaction: grpcTransaction,
          doGasSelection,
          checks: options.onlyTransactionKind ? SimulateTransactionRequest_TransactionChecks.DISABLED : SimulateTransactionRequest_TransactionChecks.ENABLED,
          readMask: { paths: [
            "transaction.transaction.sender",
            "transaction.transaction.gas_payment",
            "transaction.transaction.expiration",
            "transaction.transaction.kind",
            "transaction.effects.status",
            "transaction.effects.epoch"
          ] }
        })).response;
      } catch (error) {
        if (error instanceof Error && error.message) throw new SimulationError(error.message, { cause: error });
        throw error;
      }
      if (!options.onlyTransactionKind && response.transaction?.effects?.status && !response.transaction.effects.status.success) {
        const executionError = response.transaction.effects.status.error ? parseGrpcExecutionError(response.transaction.effects.status.error) : void 0;
        throw new SimulationError(`Transaction resolution failed: ${executionError?.message ?? "Transaction failed"}`, { executionError });
      }
      if (!response.transaction?.transaction) throw new Error("simulateTransaction did not return resolved transaction data");
      applyGrpcResolvedTransaction(transactionData, response.transaction.transaction, options);
      await setAddressBalanceTransactionExpirationFromSimulatedEpoch({
        transactionData,
        client: client2,
        epoch: response.transaction.effects?.epoch,
        originalTransactionData: snapshot,
        isTransactionKindOnly: !!options.onlyTransactionKind,
        doGasSelection
      });
      return await next();
    };
  }
};
function toGrpcQueryOptions(pagination, limit) {
  return {
    limit,
    ordering: pagination.descending ? Ordering.DESCENDING : Ordering.ASCENDING,
    after: pagination.after ? fromBase64(pagination.after) : void 0,
    before: pagination.before ? fromBase64(pagination.before) : void 0
  };
}
function transactionReadMaskPaths(include, prefix = "") {
  const paths = [
    "digest",
    "transaction.digest",
    "signatures",
    "effects.status",
    "timestamp",
    "checkpoint"
  ];
  if (include?.transaction) paths.push("transaction.sender", "transaction.gas_payment", "transaction.expiration", "transaction.kind");
  if (include?.bcs) paths.push("transaction.bcs");
  if (include?.balanceChanges) paths.push("balance_changes");
  if (include?.effects) paths.push("effects");
  if (include?.events) paths.push("events");
  if (include?.objectTypes) {
    paths.push("effects.changed_objects.object_type");
    paths.push("effects.changed_objects.object_id");
  }
  return prefix ? paths.map((path) => prefix + path) : paths;
}
function withProtoJson(result, include, getProtoJson) {
  if (!include?.protoJson) return result;
  return {
    ...result,
    protoJson: getProtoJson()
  };
}
function mapDisplayProto(include, display) {
  if (!include) return void 0;
  if (display === void 0) return null;
  return {
    output: display.output !== void 0 ? Value.toJson(display.output) : null,
    errors: display.errors !== void 0 ? Value.toJson(display.errors) : null
  };
}
function mapOwner(owner) {
  if (!owner) return null;
  if (owner.kind === Owner_OwnerKind.IMMUTABLE) return {
    $kind: "Immutable",
    Immutable: true
  };
  if (owner.kind === Owner_OwnerKind.ADDRESS) return {
    AddressOwner: owner.address,
    $kind: "AddressOwner"
  };
  if (owner.kind === Owner_OwnerKind.OBJECT) return {
    $kind: "ObjectOwner",
    ObjectOwner: owner.address
  };
  if (owner.kind === Owner_OwnerKind.SHARED) return {
    $kind: "Shared",
    Shared: { initialSharedVersion: owner.version?.toString() }
  };
  if (owner.kind === Owner_OwnerKind.CONSENSUS_ADDRESS) return {
    $kind: "ConsensusAddressOwner",
    ConsensusAddressOwner: {
      startVersion: owner.version?.toString(),
      owner: owner.address
    }
  };
  throw new Error(`Unknown owner kind ${JSON.stringify(owner, (_k, v) => typeof v === "bigint" ? v.toString() : v)}`);
}
function parseGrpcExecutionError(error) {
  const message = error.description ?? "Unknown error";
  const command = error.command != null ? Number(error.command) : void 0;
  const details = error.errorDetails;
  switch (details?.oneofKind) {
    case "abort": {
      const abort = details.abort;
      const cleverError = abort.cleverError;
      return {
        $kind: "MoveAbort",
        message: formatMoveAbortMessage({
          command,
          location: abort.location,
          abortCode: String(abort.abortCode ?? 0n),
          cleverError: cleverError ? {
            lineNumber: cleverError.lineNumber != null ? Number(cleverError.lineNumber) : void 0,
            constantName: cleverError.constantName,
            value: cleverError.value?.oneofKind === "rendered" ? cleverError.value.rendered : void 0
          } : void 0
        }),
        command,
        MoveAbort: parseMoveAbort(abort)
      };
    }
    case "sizeError":
      return {
        $kind: "SizeError",
        message,
        command,
        SizeError: {
          name: mapErrorName(error.kind),
          size: Number(details.sizeError.size ?? 0n),
          maxSize: Number(details.sizeError.maxSize ?? 0n)
        }
      };
    case "commandArgumentError":
      return {
        $kind: "CommandArgumentError",
        message,
        command,
        CommandArgumentError: {
          argument: details.commandArgumentError.argument ?? 0,
          name: mapErrorName(details.commandArgumentError.kind)
        }
      };
    case "typeArgumentError":
      return {
        $kind: "TypeArgumentError",
        message,
        command,
        TypeArgumentError: {
          typeArgument: details.typeArgumentError.typeArgument ?? 0,
          name: mapErrorName(details.typeArgumentError.kind)
        }
      };
    case "packageUpgradeError":
      return {
        $kind: "PackageUpgradeError",
        message,
        command,
        PackageUpgradeError: {
          name: mapErrorName(details.packageUpgradeError.kind),
          packageId: details.packageUpgradeError.packageId,
          digest: details.packageUpgradeError.digest
        }
      };
    case "indexError":
      return {
        $kind: "IndexError",
        message,
        command,
        IndexError: {
          index: details.indexError.index,
          subresult: details.indexError.subresult
        }
      };
    case "coinDenyListError":
      return {
        $kind: "CoinDenyListError",
        message,
        command,
        CoinDenyListError: {
          name: mapErrorName(error.kind),
          coinType: details.coinDenyListError.coinType,
          address: details.coinDenyListError.address
        }
      };
    case "congestedObjects":
      return {
        $kind: "CongestedObjects",
        message,
        command,
        CongestedObjects: {
          name: mapErrorName(error.kind),
          objects: details.congestedObjects.objects
        }
      };
    case "objectId":
      return {
        $kind: "ObjectIdError",
        message,
        command,
        ObjectIdError: {
          name: mapErrorName(error.kind),
          objectId: details.objectId
        }
      };
    default:
      return {
        $kind: "Unknown",
        message,
        command,
        Unknown: null
      };
  }
}
function parseMoveAbort(abort) {
  return {
    abortCode: String(abort.abortCode ?? 0n),
    location: { ...abort.location },
    cleverError: abort.cleverError ? {
      errorCode: abort.cleverError.errorCode != null ? Number(abort.cleverError.errorCode) : void 0,
      lineNumber: abort.cleverError.lineNumber != null ? Number(abort.cleverError.lineNumber) : void 0,
      constantName: abort.cleverError.constantName,
      constantType: abort.cleverError.constantType,
      value: abort.cleverError.value?.oneofKind === "rendered" ? abort.cleverError.value.rendered : abort.cleverError.value?.oneofKind === "raw" ? toBase64(abort.cleverError.value.raw) : void 0
    } : void 0
  };
}
function mapErrorName(kind) {
  if (kind == null) return "Unknown";
  const name = CommandArgumentError_CommandArgumentErrorKind[kind];
  if (!name || name.endsWith("_UNKNOWN")) return "Unknown";
  return name.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join("");
}
function mapIdOperation(operation) {
  if (operation == null) return null;
  switch (operation) {
    case ChangedObject_IdOperation.CREATED:
      return "Created";
    case ChangedObject_IdOperation.DELETED:
      return "Deleted";
    case ChangedObject_IdOperation.NONE:
    case ChangedObject_IdOperation.ID_OPERATION_UNKNOWN:
      return "None";
    default:
      return "Unknown";
  }
}
function mapInputObjectState(state) {
  if (state == null) return null;
  switch (state) {
    case ChangedObject_InputObjectState.EXISTS:
      return "Exists";
    case ChangedObject_InputObjectState.DOES_NOT_EXIST:
      return "DoesNotExist";
    case ChangedObject_InputObjectState.UNKNOWN:
      return "Unknown";
    default:
      return "Unknown";
  }
}
function mapOutputObjectState(state) {
  if (state == null) return null;
  switch (state) {
    case ChangedObject_OutputObjectState.OBJECT_WRITE:
      return "ObjectWrite";
    case ChangedObject_OutputObjectState.PACKAGE_WRITE:
      return "PackageWrite";
    case ChangedObject_OutputObjectState.DOES_NOT_EXIST:
      return "DoesNotExist";
    case ChangedObject_OutputObjectState.ACCUMULATOR_WRITE:
      return "AccumulatorWriteV1";
    case ChangedObject_OutputObjectState.UNKNOWN:
      return "Unknown";
    default:
      return "Unknown";
  }
}
function mapUnchangedConsensusObjectKind(kind) {
  if (kind == null) return null;
  switch (kind) {
    case UnchangedConsensusObject_UnchangedConsensusObjectKind.UNCHANGED_CONSENSUS_OBJECT_KIND_UNKNOWN:
      return "Unknown";
    case UnchangedConsensusObject_UnchangedConsensusObjectKind.READ_ONLY_ROOT:
      return "ReadOnlyRoot";
    case UnchangedConsensusObject_UnchangedConsensusObjectKind.MUTATE_CONSENSUS_STREAM_ENDED:
      return "MutateConsensusStreamEnded";
    case UnchangedConsensusObject_UnchangedConsensusObjectKind.READ_CONSENSUS_STREAM_ENDED:
      return "ReadConsensusStreamEnded";
    case UnchangedConsensusObject_UnchangedConsensusObjectKind.CANCELED:
      return "Cancelled";
    case UnchangedConsensusObject_UnchangedConsensusObjectKind.PER_EPOCH_CONFIG:
      return "PerEpochConfig";
    default:
      return "Unknown";
  }
}
function parseTransactionEffects({ effects }) {
  if (!effects) return null;
  const changedObjects = effects.changedObjects.map((change) => {
    return {
      objectId: change.objectId,
      inputState: mapInputObjectState(change.inputState),
      inputVersion: change.inputVersion?.toString() ?? null,
      inputDigest: change.inputDigest ?? null,
      inputOwner: mapOwner(change.inputOwner),
      outputState: mapOutputObjectState(change.outputState),
      outputVersion: change.outputVersion?.toString() ?? null,
      outputDigest: change.outputDigest ?? null,
      outputOwner: mapOwner(change.outputOwner),
      idOperation: mapIdOperation(change.idOperation)
    };
  });
  return {
    bcs: effects.bcs?.value,
    version: effects.version ?? 2,
    status: effects.status?.success ? {
      success: true,
      error: null
    } : {
      success: false,
      error: parseGrpcExecutionError(effects.status.error)
    },
    gasUsed: {
      computationCost: effects.gasUsed?.computationCost?.toString(),
      storageCost: effects.gasUsed?.storageCost?.toString(),
      storageRebate: effects.gasUsed?.storageRebate?.toString(),
      nonRefundableStorageFee: effects.gasUsed?.nonRefundableStorageFee?.toString()
    },
    transactionDigest: effects.transactionDigest,
    gasObject: effects.gasObject ? {
      objectId: effects.gasObject.objectId,
      inputState: mapInputObjectState(effects.gasObject.inputState),
      inputVersion: effects.gasObject.inputVersion?.toString() ?? null,
      inputDigest: effects.gasObject.inputDigest ?? null,
      inputOwner: mapOwner(effects.gasObject.inputOwner),
      outputState: mapOutputObjectState(effects.gasObject.outputState),
      outputVersion: effects.gasObject.outputVersion?.toString() ?? null,
      outputDigest: effects.gasObject.outputDigest ?? null,
      outputOwner: mapOwner(effects.gasObject.outputOwner),
      idOperation: mapIdOperation(effects.gasObject.idOperation)
    } : null,
    eventsDigest: effects.eventsDigest ?? null,
    dependencies: effects.dependencies,
    lamportVersion: effects.lamportVersion?.toString() ?? null,
    changedObjects,
    unchangedConsensusObjects: effects.unchangedConsensusObjects.map((object2) => {
      return {
        kind: mapUnchangedConsensusObjectKind(object2.kind),
        objectId: object2.objectId,
        version: object2.version?.toString() ?? null,
        digest: object2.digest ?? null
      };
    }),
    auxiliaryDataDigest: effects.auxiliaryDataDigest ?? null
  };
}
function parseGrpcTransactionResponse(transaction, options) {
  const include = options?.include;
  const objectTypes = {};
  if (include?.objectTypes) transaction.effects?.changedObjects?.forEach((change) => {
    if (change.objectId && change.objectType) objectTypes[change.objectId] = change.objectType;
  });
  let transactionData;
  if (include?.transaction) {
    const tx = transaction.transaction;
    if (!tx) throw new Error("Transaction data is required but missing from gRPC response");
    const resolved = grpcTransactionToTransactionData(tx);
    transactionData = {
      gasData: resolved.gasData,
      sender: resolved.sender,
      expiration: resolved.expiration,
      commands: resolved.commands,
      inputs: resolved.inputs,
      version: resolved.version
    };
  }
  const bcsBytes = include?.bcs ? transaction.transaction?.bcs?.value : void 0;
  const effects = include?.effects ? parseTransactionEffects({ effects: transaction.effects }) : void 0;
  const status = transaction.effects?.status?.success ? {
    success: true,
    error: null
  } : {
    success: false,
    error: transaction.effects?.status?.error ? parseGrpcExecutionError(transaction.effects.status.error) : {
      $kind: "Unknown",
      message: "Transaction failed",
      Unknown: null
    }
  };
  const result = {
    digest: transaction.digest,
    epoch: transaction.effects?.epoch?.toString() ?? null,
    timestampMs: transaction.timestamp ? Number(transaction.timestamp.seconds) * 1e3 + Math.floor(transaction.timestamp.nanos / 1e6) : null,
    checkpoint: transaction.checkpoint?.toString() ?? null,
    status,
    effects,
    objectTypes: include?.objectTypes ? objectTypes : void 0,
    transaction: transactionData,
    bcs: bcsBytes,
    signatures: transaction.signatures?.map((sig) => toBase64(sig.bcs?.value)) ?? [],
    balanceChanges: include?.balanceChanges ? transaction.balanceChanges?.map((change) => ({
      coinType: change.coinType,
      address: change.address,
      amount: change.amount
    })) ?? [] : void 0,
    events: include?.events ? transaction.events?.events.map((event) => ({
      packageId: normalizeSuiAddress(event.packageId),
      module: event.module,
      sender: normalizeSuiAddress(event.sender),
      eventType: event.eventType,
      bcs: event.contents?.value ?? new Uint8Array(),
      json: event.json ? Value.toJson(event.json) : null
    })) ?? [] : void 0
  };
  return status.success ? {
    $kind: "Transaction",
    Transaction: result
  } : {
    $kind: "FailedTransaction",
    FailedTransaction: result
  };
}
function parseGrpcSimulateTransactionResponse(response, options) {
  const include = options?.include;
  const transactionResult = parseGrpcTransactionResponse(response.transaction, { include });
  const gasPaymentMocked = isMockedGasObjectId(response.transaction?.effects?.gasObject?.objectId);
  const commandResults = include?.commandResults && response.commandOutputs ? response.commandOutputs.map((output) => ({
    returnValues: (output.returnValues ?? []).map((rv) => ({ bcs: rv.value?.value ?? null })),
    mutatedReferences: (output.mutatedByRef ?? []).map((mr) => ({ bcs: mr.value?.value ?? null }))
  })) : void 0;
  if (transactionResult.$kind === "Transaction") return {
    $kind: "Transaction",
    Transaction: transactionResult.Transaction,
    commandResults,
    gasPaymentMocked
  };
  return {
    $kind: "FailedTransaction",
    FailedTransaction: transactionResult.FailedTransaction,
    commandResults,
    gasPaymentMocked
  };
}
function parseNormalizedSuiMoveType(type) {
  let reference = null;
  if (type.reference === OpenSignature_Reference.IMMUTABLE) reference = "immutable";
  else if (type.reference === OpenSignature_Reference.MUTABLE) reference = "mutable";
  return {
    reference,
    body: parseNormalizedSuiMoveTypeBody(type.body)
  };
}
function parseNormalizedSuiMoveTypeBody(type) {
  switch (type.type) {
    case OpenSignatureBody_Type.TYPE_UNKNOWN:
      return { $kind: "unknown" };
    case OpenSignatureBody_Type.ADDRESS:
      return { $kind: "address" };
    case OpenSignatureBody_Type.BOOL:
      return { $kind: "bool" };
    case OpenSignatureBody_Type.U8:
      return { $kind: "u8" };
    case OpenSignatureBody_Type.U16:
      return { $kind: "u16" };
    case OpenSignatureBody_Type.U32:
      return { $kind: "u32" };
    case OpenSignatureBody_Type.U64:
      return { $kind: "u64" };
    case OpenSignatureBody_Type.U128:
      return { $kind: "u128" };
    case OpenSignatureBody_Type.U256:
      return { $kind: "u256" };
    case OpenSignatureBody_Type.VECTOR:
      return {
        $kind: "vector",
        vector: parseNormalizedSuiMoveTypeBody(type.typeParameterInstantiation[0])
      };
    case OpenSignatureBody_Type.DATATYPE:
      return {
        $kind: "datatype",
        datatype: {
          typeName: type.typeName,
          typeParameters: type.typeParameterInstantiation.map((t) => parseNormalizedSuiMoveTypeBody(t))
        }
      };
    case OpenSignatureBody_Type.TYPE_PARAMETER:
      return {
        $kind: "typeParameter",
        index: type.typeParameter
      };
    default:
      return { $kind: "unknown" };
  }
}

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/transaction_execution_service.client.mjs
var import_runtime_rpc4 = __toESM(require_commonjs2(), 1);
var TransactionExecutionServiceClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = TransactionExecutionService.typeName;
    this.methods = TransactionExecutionService.methods;
    this.options = TransactionExecutionService.options;
  }
  /**
  * @generated from protobuf rpc: ExecuteTransaction(sui.rpc.v2.ExecuteTransactionRequest) returns (sui.rpc.v2.ExecuteTransactionResponse);
  */
  executeTransaction(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc4.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: SimulateTransaction(sui.rpc.v2.SimulateTransactionRequest) returns (sui.rpc.v2.SimulateTransactionResponse);
  */
  simulateTransaction(input, options) {
    const method = this.methods[1], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc4.stackIntercept)("unary", this._transport, method, opt, input);
  }
};

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/filter.mjs
var import_runtime23 = __toESM(require_commonjs(), 1);
var TransactionFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.TransactionFilter", [{
      no: 1,
      name: "terms",
      kind: "message",
      repeat: 2,
      T: () => TransactionTerm
    }]);
  }
};
var TransactionFilter = new TransactionFilter$Type();
var TransactionTerm$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.TransactionTerm", [{
      no: 1,
      name: "literals",
      kind: "message",
      repeat: 2,
      T: () => TransactionLiteral
    }]);
  }
};
var TransactionTerm = new TransactionTerm$Type();
var TransactionLiteral$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.TransactionLiteral", [
      {
        no: 1,
        name: "negated",
        kind: "scalar",
        T: 8
      },
      {
        no: 2,
        name: "sender",
        kind: "message",
        oneof: "predicate",
        T: () => SenderFilter
      },
      {
        no: 3,
        name: "affected_address",
        kind: "message",
        oneof: "predicate",
        T: () => AffectedAddressFilter
      },
      {
        no: 4,
        name: "affected_object",
        kind: "message",
        oneof: "predicate",
        T: () => AffectedObjectFilter
      },
      {
        no: 5,
        name: "move_call",
        kind: "message",
        oneof: "predicate",
        T: () => MoveCallFilter
      },
      {
        no: 6,
        name: "emit_module",
        kind: "message",
        oneof: "predicate",
        T: () => EmitModuleFilter
      },
      {
        no: 7,
        name: "event_type",
        kind: "message",
        oneof: "predicate",
        T: () => EventTypeFilter
      },
      {
        no: 8,
        name: "event_stream_head",
        kind: "message",
        oneof: "predicate",
        T: () => EventStreamHeadFilter
      },
      {
        no: 9,
        name: "package_write",
        kind: "message",
        oneof: "predicate",
        T: () => PackageWriteFilter
      }
    ]);
  }
};
var TransactionLiteral = new TransactionLiteral$Type();
var EventFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.EventFilter", [{
      no: 1,
      name: "terms",
      kind: "message",
      repeat: 2,
      T: () => EventTerm
    }]);
  }
};
var EventFilter = new EventFilter$Type();
var EventTerm$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.EventTerm", [{
      no: 1,
      name: "literals",
      kind: "message",
      repeat: 2,
      T: () => EventLiteral
    }]);
  }
};
var EventTerm = new EventTerm$Type();
var EventLiteral$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.EventLiteral", [
      {
        no: 1,
        name: "negated",
        kind: "scalar",
        T: 8
      },
      {
        no: 2,
        name: "sender",
        kind: "message",
        oneof: "predicate",
        T: () => SenderFilter
      },
      {
        no: 3,
        name: "emit_module",
        kind: "message",
        oneof: "predicate",
        T: () => EmitModuleFilter
      },
      {
        no: 4,
        name: "event_type",
        kind: "message",
        oneof: "predicate",
        T: () => EventTypeFilter
      },
      {
        no: 5,
        name: "event_stream_head",
        kind: "message",
        oneof: "predicate",
        T: () => EventStreamHeadFilter
      }
    ]);
  }
};
var EventLiteral = new EventLiteral$Type();
var SenderFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.SenderFilter", [{
      no: 1,
      name: "address",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var SenderFilter = new SenderFilter$Type();
var AffectedAddressFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.AffectedAddressFilter", [{
      no: 1,
      name: "address",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var AffectedAddressFilter = new AffectedAddressFilter$Type();
var AffectedObjectFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.AffectedObjectFilter", [{
      no: 1,
      name: "object_id",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var AffectedObjectFilter = new AffectedObjectFilter$Type();
var MoveCallFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.MoveCallFilter", [{
      no: 1,
      name: "function",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var MoveCallFilter = new MoveCallFilter$Type();
var EmitModuleFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.EmitModuleFilter", [{
      no: 1,
      name: "module",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var EmitModuleFilter = new EmitModuleFilter$Type();
var EventTypeFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.EventTypeFilter", [{
      no: 1,
      name: "event_type",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var EventTypeFilter = new EventTypeFilter$Type();
var EventStreamHeadFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.EventStreamHeadFilter", [{
      no: 1,
      name: "stream_id",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var EventStreamHeadFilter = new EventStreamHeadFilter$Type();
var PackageWriteFilter$Type = class extends import_runtime23.MessageType {
  constructor() {
    super("sui.rpc.v2.PackageWriteFilter", []);
  }
};
var PackageWriteFilter = new PackageWriteFilter$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/protocol_config.mjs
var import_runtime24 = __toESM(require_commonjs(), 1);
var ProtocolConfig$Type = class extends import_runtime24.MessageType {
  constructor() {
    super("sui.rpc.v2.ProtocolConfig", [
      {
        no: 1,
        name: "protocol_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "feature_flags",
        kind: "map",
        K: 9,
        V: {
          kind: "scalar",
          T: 8
        }
      },
      {
        no: 3,
        name: "attributes",
        kind: "map",
        K: 9,
        V: {
          kind: "scalar",
          T: 9
        }
      },
      {
        no: 4,
        name: "configs",
        kind: "map",
        K: 9,
        V: {
          kind: "message",
          T: () => Value
        }
      }
    ]);
  }
};
var ProtocolConfig = new ProtocolConfig$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/system_state.mjs
var import_runtime25 = __toESM(require_commonjs(), 1);
var SystemState$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.SystemState", [
      {
        no: 1,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "protocol_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "validators",
        kind: "message",
        T: () => ValidatorSet
      },
      {
        no: 5,
        name: "storage_fund",
        kind: "message",
        T: () => StorageFund
      },
      {
        no: 6,
        name: "parameters",
        kind: "message",
        T: () => SystemParameters
      },
      {
        no: 7,
        name: "reference_gas_price",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 8,
        name: "validator_report_records",
        kind: "message",
        repeat: 2,
        T: () => ValidatorReportRecord
      },
      {
        no: 9,
        name: "stake_subsidy",
        kind: "message",
        T: () => StakeSubsidy
      },
      {
        no: 10,
        name: "safe_mode",
        kind: "scalar",
        opt: true,
        T: 8
      },
      {
        no: 11,
        name: "safe_mode_storage_rewards",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 12,
        name: "safe_mode_computation_rewards",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 13,
        name: "safe_mode_storage_rebates",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 14,
        name: "safe_mode_non_refundable_storage_fee",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 15,
        name: "epoch_start_timestamp_ms",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 16,
        name: "extra_fields",
        kind: "message",
        T: () => MoveTable
      }
    ]);
  }
};
var SystemState = new SystemState$Type();
var ValidatorReportRecord$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.ValidatorReportRecord", [{
      no: 1,
      name: "reported",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "reporters",
      kind: "scalar",
      repeat: 2,
      T: 9
    }]);
  }
};
var ValidatorReportRecord = new ValidatorReportRecord$Type();
var SystemParameters$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.SystemParameters", [
      {
        no: 1,
        name: "epoch_duration_ms",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "stake_subsidy_start_epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "min_validator_count",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "max_validator_count",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "min_validator_joining_stake",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 6,
        name: "validator_low_stake_threshold",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 7,
        name: "validator_very_low_stake_threshold",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 8,
        name: "validator_low_stake_grace_period",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 9,
        name: "extra_fields",
        kind: "message",
        T: () => MoveTable
      }
    ]);
  }
};
var SystemParameters = new SystemParameters$Type();
var MoveTable$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.MoveTable", [{
      no: 1,
      name: "id",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "size",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var MoveTable = new MoveTable$Type();
var StakeSubsidy$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.StakeSubsidy", [
      {
        no: 1,
        name: "balance",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "distribution_counter",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "current_distribution_amount",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "stake_subsidy_period_length",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "stake_subsidy_decrease_rate",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 6,
        name: "extra_fields",
        kind: "message",
        T: () => MoveTable
      }
    ]);
  }
};
var StakeSubsidy = new StakeSubsidy$Type();
var StorageFund$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.StorageFund", [{
      no: 1,
      name: "total_object_storage_rebates",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "non_refundable_balance",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var StorageFund = new StorageFund$Type();
var ValidatorSet$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.ValidatorSet", [
      {
        no: 1,
        name: "total_stake",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "active_validators",
        kind: "message",
        repeat: 2,
        T: () => Validator
      },
      {
        no: 3,
        name: "pending_active_validators",
        kind: "message",
        T: () => MoveTable
      },
      {
        no: 4,
        name: "pending_removals",
        kind: "scalar",
        repeat: 1,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "staking_pool_mappings",
        kind: "message",
        T: () => MoveTable
      },
      {
        no: 6,
        name: "inactive_validators",
        kind: "message",
        T: () => MoveTable
      },
      {
        no: 7,
        name: "validator_candidates",
        kind: "message",
        T: () => MoveTable
      },
      {
        no: 8,
        name: "at_risk_validators",
        kind: "map",
        K: 9,
        V: {
          kind: "scalar",
          T: 4,
          L: 0
        }
      },
      {
        no: 9,
        name: "extra_fields",
        kind: "message",
        T: () => MoveTable
      }
    ]);
  }
};
var ValidatorSet = new ValidatorSet$Type();
var Validator$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.Validator", [
      {
        no: 1,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "description",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "image_url",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "project_url",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 7,
        name: "protocol_public_key",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 8,
        name: "proof_of_possession",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 10,
        name: "network_public_key",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 12,
        name: "worker_public_key",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 13,
        name: "network_address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 14,
        name: "p2p_address",
        kind: "scalar",
        jsonName: "p2pAddress",
        opt: true,
        T: 9
      },
      {
        no: 15,
        name: "primary_address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 16,
        name: "worker_address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 18,
        name: "next_epoch_protocol_public_key",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 19,
        name: "next_epoch_proof_of_possession",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 21,
        name: "next_epoch_network_public_key",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 23,
        name: "next_epoch_worker_public_key",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 24,
        name: "next_epoch_network_address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 25,
        name: "next_epoch_p2p_address",
        kind: "scalar",
        jsonName: "nextEpochP2pAddress",
        opt: true,
        T: 9
      },
      {
        no: 26,
        name: "next_epoch_primary_address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 27,
        name: "next_epoch_worker_address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 28,
        name: "metadata_extra_fields",
        kind: "message",
        T: () => MoveTable
      },
      {
        no: 29,
        name: "voting_power",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 30,
        name: "operation_cap_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 31,
        name: "gas_price",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 32,
        name: "staking_pool",
        kind: "message",
        T: () => StakingPool
      },
      {
        no: 33,
        name: "commission_rate",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 34,
        name: "next_epoch_stake",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 35,
        name: "next_epoch_gas_price",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 36,
        name: "next_epoch_commission_rate",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 37,
        name: "extra_fields",
        kind: "message",
        T: () => MoveTable
      }
    ]);
  }
};
var Validator = new Validator$Type();
var StakingPool$Type = class extends import_runtime25.MessageType {
  constructor() {
    super("sui.rpc.v2.StakingPool", [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "activation_epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "deactivation_epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "sui_balance",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "rewards_pool",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 6,
        name: "pool_token_balance",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 7,
        name: "exchange_rates",
        kind: "message",
        T: () => MoveTable
      },
      {
        no: 8,
        name: "pending_stake",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 9,
        name: "pending_total_sui_withdraw",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 10,
        name: "pending_pool_token_withdraw",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 11,
        name: "extra_fields",
        kind: "message",
        T: () => MoveTable
      }
    ]);
  }
};
var StakingPool = new StakingPool$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/epoch.mjs
var import_runtime26 = __toESM(require_commonjs(), 1);
var Epoch$Type = class extends import_runtime26.MessageType {
  constructor() {
    super("sui.rpc.v2.Epoch", [
      {
        no: 1,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "committee",
        kind: "message",
        T: () => ValidatorCommittee
      },
      {
        no: 3,
        name: "system_state",
        kind: "message",
        T: () => SystemState
      },
      {
        no: 4,
        name: "first_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "last_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 6,
        name: "start",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 7,
        name: "end",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 8,
        name: "reference_gas_price",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 9,
        name: "protocol_config",
        kind: "message",
        T: () => ProtocolConfig
      }
    ]);
  }
};
var Epoch = new Epoch$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/checkpoint_contents.mjs
var import_runtime27 = __toESM(require_commonjs(), 1);
var CheckpointContents$Type = class extends import_runtime27.MessageType {
  constructor() {
    super("sui.rpc.v2.CheckpointContents", [
      {
        no: 1,
        name: "bcs",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 2,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 5
      },
      {
        no: 4,
        name: "transactions",
        kind: "message",
        repeat: 2,
        T: () => CheckpointedTransactionInfo
      }
    ]);
  }
};
var CheckpointContents = new CheckpointContents$Type();
var CheckpointedTransactionInfo$Type = class extends import_runtime27.MessageType {
  constructor() {
    super("sui.rpc.v2.CheckpointedTransactionInfo", [
      {
        no: 1,
        name: "transaction",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "effects",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "signatures",
        kind: "message",
        repeat: 2,
        T: () => UserSignature
      },
      {
        no: 4,
        name: "address_aliases_versions",
        kind: "message",
        repeat: 2,
        T: () => AddressAliasesVersion
      }
    ]);
  }
};
var CheckpointedTransactionInfo = new CheckpointedTransactionInfo$Type();
var AddressAliasesVersion$Type = class extends import_runtime27.MessageType {
  constructor() {
    super("sui.rpc.v2.AddressAliasesVersion", [{
      no: 1,
      name: "version",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var AddressAliasesVersion = new AddressAliasesVersion$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/checkpoint_summary.mjs
var import_runtime28 = __toESM(require_commonjs(), 1);
var CheckpointCommitment_CheckpointCommitmentKind = /* @__PURE__ */ (function(CheckpointCommitment_CheckpointCommitmentKind$1) {
  CheckpointCommitment_CheckpointCommitmentKind$1[CheckpointCommitment_CheckpointCommitmentKind$1["CHECKPOINT_COMMITMENT_KIND_UNKNOWN"] = 0] = "CHECKPOINT_COMMITMENT_KIND_UNKNOWN";
  CheckpointCommitment_CheckpointCommitmentKind$1[CheckpointCommitment_CheckpointCommitmentKind$1["ECMH_LIVE_OBJECT_SET"] = 1] = "ECMH_LIVE_OBJECT_SET";
  CheckpointCommitment_CheckpointCommitmentKind$1[CheckpointCommitment_CheckpointCommitmentKind$1["CHECKPOINT_ARTIFACTS"] = 2] = "CHECKPOINT_ARTIFACTS";
  return CheckpointCommitment_CheckpointCommitmentKind$1;
})({});
var CheckpointSummary$Type = class extends import_runtime28.MessageType {
  constructor() {
    super("sui.rpc.v2.CheckpointSummary", [
      {
        no: 1,
        name: "bcs",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 2,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "sequence_number",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "total_network_transactions",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 6,
        name: "content_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 7,
        name: "previous_digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 8,
        name: "epoch_rolling_gas_cost_summary",
        kind: "message",
        T: () => GasCostSummary2
      },
      {
        no: 9,
        name: "timestamp",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 10,
        name: "commitments",
        kind: "message",
        repeat: 2,
        T: () => CheckpointCommitment
      },
      {
        no: 11,
        name: "end_of_epoch_data",
        kind: "message",
        T: () => EndOfEpochData
      },
      {
        no: 12,
        name: "version_specific_data",
        kind: "scalar",
        opt: true,
        T: 12
      }
    ]);
  }
};
var CheckpointSummary = new CheckpointSummary$Type();
var EndOfEpochData$Type = class extends import_runtime28.MessageType {
  constructor() {
    super("sui.rpc.v2.EndOfEpochData", [
      {
        no: 1,
        name: "next_epoch_committee",
        kind: "message",
        repeat: 2,
        T: () => ValidatorCommitteeMember
      },
      {
        no: 2,
        name: "next_epoch_protocol_version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "epoch_commitments",
        kind: "message",
        repeat: 2,
        T: () => CheckpointCommitment
      }
    ]);
  }
};
var EndOfEpochData = new EndOfEpochData$Type();
var CheckpointCommitment$Type = class extends import_runtime28.MessageType {
  constructor() {
    super("sui.rpc.v2.CheckpointCommitment", [{
      no: 1,
      name: "kind",
      kind: "enum",
      opt: true,
      T: () => ["sui.rpc.v2.CheckpointCommitment.CheckpointCommitmentKind", CheckpointCommitment_CheckpointCommitmentKind]
    }, {
      no: 2,
      name: "digest",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var CheckpointCommitment = new CheckpointCommitment$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/checkpoint.mjs
var import_runtime29 = __toESM(require_commonjs(), 1);
var Checkpoint$Type = class extends import_runtime29.MessageType {
  constructor() {
    super("sui.rpc.v2.Checkpoint", [
      {
        no: 1,
        name: "sequence_number",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "digest",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "summary",
        kind: "message",
        T: () => CheckpointSummary
      },
      {
        no: 4,
        name: "signature",
        kind: "message",
        T: () => ValidatorAggregatedSignature
      },
      {
        no: 5,
        name: "contents",
        kind: "message",
        T: () => CheckpointContents
      },
      {
        no: 6,
        name: "transactions",
        kind: "message",
        repeat: 2,
        T: () => ExecutedTransaction
      },
      {
        no: 7,
        name: "objects",
        kind: "message",
        T: () => ObjectSet
      }
    ]);
  }
};
var Checkpoint = new Checkpoint$Type();

// node_modules/@mysten/sui/dist/grpc/proto/google/protobuf/any.mjs
var import_runtime30 = __toESM(require_commonjs(), 1);
var Any$Type = class extends import_runtime30.MessageType {
  constructor() {
    super("google.protobuf.Any", [{
      no: 1,
      name: "type_url",
      kind: "scalar",
      T: 9
    }, {
      no: 2,
      name: "value",
      kind: "scalar",
      T: 12
    }]);
  }
  /**
  * Pack the message into a new `Any`.
  *
  * Uses 'type.googleapis.com/full.type.name' as the type URL.
  */
  pack(message, type) {
    return {
      typeUrl: this.typeNameToUrl(type.typeName),
      value: type.toBinary(message)
    };
  }
  /**
  * Unpack the message from the `Any`.
  */
  unpack(any, type, options) {
    if (!this.contains(any, type)) throw new Error("Cannot unpack google.protobuf.Any with typeUrl '" + any.typeUrl + "' as " + type.typeName + ".");
    return type.fromBinary(any.value, options);
  }
  /**
  * Does the given `Any` contain a packed message of the given type?
  */
  contains(any, type) {
    if (!any.typeUrl.length) return false;
    return (typeof type == "string" ? type : type.typeName) === this.typeUrlToName(any.typeUrl);
  }
  /**
  * Convert the message to canonical JSON value.
  *
  * You have to provide the `typeRegistry` option so that the
  * packed message can be converted to JSON.
  *
  * The `typeRegistry` option is also required to read
  * `google.protobuf.Any` from JSON format.
  */
  internalJsonWrite(any, options) {
    if (any.typeUrl === "") return {};
    let typeName = this.typeUrlToName(any.typeUrl);
    let opt = (0, import_runtime30.jsonWriteOptions)(options);
    let type = opt.typeRegistry?.find((t) => t.typeName === typeName);
    if (!type) throw new globalThis.Error("Unable to convert google.protobuf.Any with typeUrl '" + any.typeUrl + "' to JSON. The specified type " + typeName + " is not available in the type registry.");
    let value = type.fromBinary(any.value, { readUnknownField: false });
    let json = type.internalJsonWrite(value, opt);
    if (typeName.startsWith("google.protobuf.") || !(0, import_runtime30.isJsonObject)(json)) json = { value: json };
    json["@type"] = any.typeUrl;
    return json;
  }
  internalJsonRead(json, options, target) {
    if (!(0, import_runtime30.isJsonObject)(json)) throw new globalThis.Error("Unable to parse google.protobuf.Any from JSON " + (0, import_runtime30.typeofJsonValue)(json) + ".");
    if (typeof json["@type"] != "string" || json["@type"] == "") return this.create();
    let typeName = this.typeUrlToName(json["@type"]);
    let type = options?.typeRegistry?.find((t) => t.typeName == typeName);
    if (!type) throw new globalThis.Error("Unable to parse google.protobuf.Any from JSON. The specified type " + typeName + " is not available in the type registry.");
    let value;
    if (typeName.startsWith("google.protobuf.") && json.hasOwnProperty("value")) value = type.fromJson(json["value"], options);
    else {
      let copy = Object.assign({}, json);
      delete copy["@type"];
      value = type.fromJson(copy, options);
    }
    if (target === void 0) target = this.create();
    target.typeUrl = json["@type"];
    target.value = type.toBinary(value);
    return target;
  }
  typeNameToUrl(name) {
    if (!name.length) throw new Error("invalid type name: " + name);
    return "type.googleapis.com/" + name;
  }
  typeUrlToName(url) {
    if (!url.length) throw new Error("invalid type url: " + url);
    let slash = url.lastIndexOf("/");
    let name = slash > 0 ? url.substring(slash + 1) : url;
    if (!name.length) throw new Error("invalid type url: " + url);
    return name;
  }
};
var Any = new Any$Type();

// node_modules/@mysten/sui/dist/grpc/proto/google/rpc/status.mjs
var import_runtime31 = __toESM(require_commonjs(), 1);
var Status$Type = class extends import_runtime31.MessageType {
  constructor() {
    super("google.rpc.Status", [
      {
        no: 1,
        name: "code",
        kind: "scalar",
        T: 5
      },
      {
        no: 2,
        name: "message",
        kind: "scalar",
        T: 9
      },
      {
        no: 3,
        name: "details",
        kind: "message",
        repeat: 2,
        T: () => Any
      }
    ]);
  }
};
var Status = new Status$Type();

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/ledger_service.mjs
var import_runtime32 = __toESM(require_commonjs(), 1);
var import_runtime_rpc5 = __toESM(require_commonjs2(), 1);
var GetServiceInfoRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetServiceInfoRequest", []);
  }
};
var GetServiceInfoRequest = new GetServiceInfoRequest$Type();
var GetServiceInfoResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetServiceInfoResponse", [
      {
        no: 1,
        name: "chain_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "chain",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "epoch",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "checkpoint_height",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "timestamp",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 6,
        name: "lowest_available_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 7,
        name: "lowest_available_checkpoint_objects",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 8,
        name: "server",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var GetServiceInfoResponse = new GetServiceInfoResponse$Type();
var GetObjectRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetObjectRequest", [
      {
        no: 1,
        name: "object_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "version",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      }
    ]);
  }
};
var GetObjectRequest = new GetObjectRequest$Type();
var GetObjectResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetObjectResponse", [{
      no: 1,
      name: "object",
      kind: "message",
      T: () => Object$1
    }]);
  }
};
var GetObjectResponse = new GetObjectResponse$Type();
var BatchGetObjectsRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.BatchGetObjectsRequest", [{
      no: 1,
      name: "requests",
      kind: "message",
      repeat: 2,
      T: () => GetObjectRequest
    }, {
      no: 2,
      name: "read_mask",
      kind: "message",
      T: () => FieldMask
    }]);
  }
};
var BatchGetObjectsRequest = new BatchGetObjectsRequest$Type();
var BatchGetObjectsResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.BatchGetObjectsResponse", [{
      no: 1,
      name: "objects",
      kind: "message",
      repeat: 2,
      T: () => GetObjectResult
    }]);
  }
};
var BatchGetObjectsResponse = new BatchGetObjectsResponse$Type();
var GetObjectResult$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetObjectResult", [{
      no: 1,
      name: "object",
      kind: "message",
      oneof: "result",
      T: () => Object$1
    }, {
      no: 2,
      name: "error",
      kind: "message",
      oneof: "result",
      T: () => Status
    }]);
  }
};
var GetObjectResult = new GetObjectResult$Type();
var GetTransactionRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetTransactionRequest", [{
      no: 1,
      name: "digest",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "read_mask",
      kind: "message",
      T: () => FieldMask
    }]);
  }
};
var GetTransactionRequest = new GetTransactionRequest$Type();
var GetTransactionResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetTransactionResponse", [{
      no: 1,
      name: "transaction",
      kind: "message",
      T: () => ExecutedTransaction
    }]);
  }
};
var GetTransactionResponse = new GetTransactionResponse$Type();
var BatchGetTransactionsRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.BatchGetTransactionsRequest", [{
      no: 1,
      name: "digests",
      kind: "scalar",
      repeat: 2,
      T: 9
    }, {
      no: 2,
      name: "read_mask",
      kind: "message",
      T: () => FieldMask
    }]);
  }
};
var BatchGetTransactionsRequest = new BatchGetTransactionsRequest$Type();
var BatchGetTransactionsResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.BatchGetTransactionsResponse", [{
      no: 1,
      name: "transactions",
      kind: "message",
      repeat: 2,
      T: () => GetTransactionResult
    }]);
  }
};
var BatchGetTransactionsResponse = new BatchGetTransactionsResponse$Type();
var GetTransactionResult$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetTransactionResult", [{
      no: 1,
      name: "transaction",
      kind: "message",
      oneof: "result",
      T: () => ExecutedTransaction
    }, {
      no: 2,
      name: "error",
      kind: "message",
      oneof: "result",
      T: () => Status
    }]);
  }
};
var GetTransactionResult = new GetTransactionResult$Type();
var GetCheckpointRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetCheckpointRequest", [
      {
        no: 1,
        name: "sequence_number",
        kind: "scalar",
        oneof: "checkpointId",
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "digest",
        kind: "scalar",
        oneof: "checkpointId",
        T: 9
      },
      {
        no: 3,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      }
    ]);
  }
};
var GetCheckpointRequest = new GetCheckpointRequest$Type();
var GetCheckpointResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetCheckpointResponse", [{
      no: 1,
      name: "checkpoint",
      kind: "message",
      T: () => Checkpoint
    }]);
  }
};
var GetCheckpointResponse = new GetCheckpointResponse$Type();
var GetEpochRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetEpochRequest", [{
      no: 1,
      name: "epoch",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "read_mask",
      kind: "message",
      T: () => FieldMask
    }]);
  }
};
var GetEpochRequest = new GetEpochRequest$Type();
var GetEpochResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.GetEpochResponse", [{
      no: 1,
      name: "epoch",
      kind: "message",
      T: () => Epoch
    }]);
  }
};
var GetEpochResponse = new GetEpochResponse$Type();
var ListCheckpointsRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.ListCheckpointsRequest", [
      {
        no: 1,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      },
      {
        no: 2,
        name: "start_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "end_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "filter",
        kind: "message",
        T: () => TransactionFilter
      },
      {
        no: 5,
        name: "options",
        kind: "message",
        T: () => QueryOptions
      }
    ]);
  }
};
var ListCheckpointsRequest = new ListCheckpointsRequest$Type();
var ListCheckpointsResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.ListCheckpointsResponse", [
      {
        no: 1,
        name: "checkpoint",
        kind: "message",
        T: () => Checkpoint
      },
      {
        no: 2,
        name: "watermark",
        kind: "message",
        T: () => Watermark
      },
      {
        no: 3,
        name: "end",
        kind: "message",
        T: () => QueryEnd
      }
    ]);
  }
};
var ListCheckpointsResponse = new ListCheckpointsResponse$Type();
var ListTransactionsRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.ListTransactionsRequest", [
      {
        no: 1,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      },
      {
        no: 2,
        name: "start_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "end_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "filter",
        kind: "message",
        T: () => TransactionFilter
      },
      {
        no: 5,
        name: "options",
        kind: "message",
        T: () => QueryOptions
      }
    ]);
  }
};
var ListTransactionsRequest = new ListTransactionsRequest$Type();
var ListTransactionsResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.ListTransactionsResponse", [
      {
        no: 1,
        name: "transaction",
        kind: "message",
        T: () => ExecutedTransaction
      },
      {
        no: 2,
        name: "watermark",
        kind: "message",
        T: () => Watermark
      },
      {
        no: 3,
        name: "end",
        kind: "message",
        T: () => QueryEnd
      }
    ]);
  }
};
var ListTransactionsResponse = new ListTransactionsResponse$Type();
var ListEventsRequest$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.ListEventsRequest", [
      {
        no: 1,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      },
      {
        no: 2,
        name: "start_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "end_checkpoint",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "filter",
        kind: "message",
        T: () => EventFilter
      },
      {
        no: 5,
        name: "options",
        kind: "message",
        T: () => QueryOptions
      }
    ]);
  }
};
var ListEventsRequest = new ListEventsRequest$Type();
var ListEventsResponse$Type = class extends import_runtime32.MessageType {
  constructor() {
    super("sui.rpc.v2.ListEventsResponse", [
      {
        no: 1,
        name: "event",
        kind: "message",
        T: () => Event
      },
      {
        no: 2,
        name: "watermark",
        kind: "message",
        T: () => Watermark
      },
      {
        no: 3,
        name: "end",
        kind: "message",
        T: () => QueryEnd
      }
    ]);
  }
};
var ListEventsResponse = new ListEventsResponse$Type();
var LedgerService = new import_runtime_rpc5.ServiceType("sui.rpc.v2.LedgerService", [
  {
    name: "GetServiceInfo",
    options: {},
    I: GetServiceInfoRequest,
    O: GetServiceInfoResponse
  },
  {
    name: "GetObject",
    options: {},
    I: GetObjectRequest,
    O: GetObjectResponse
  },
  {
    name: "BatchGetObjects",
    options: {},
    I: BatchGetObjectsRequest,
    O: BatchGetObjectsResponse
  },
  {
    name: "GetTransaction",
    options: {},
    I: GetTransactionRequest,
    O: GetTransactionResponse
  },
  {
    name: "BatchGetTransactions",
    options: {},
    I: BatchGetTransactionsRequest,
    O: BatchGetTransactionsResponse
  },
  {
    name: "GetCheckpoint",
    options: {},
    I: GetCheckpointRequest,
    O: GetCheckpointResponse
  },
  {
    name: "GetEpoch",
    options: {},
    I: GetEpochRequest,
    O: GetEpochResponse
  },
  {
    name: "ListCheckpoints",
    serverStreaming: true,
    options: {},
    I: ListCheckpointsRequest,
    O: ListCheckpointsResponse
  },
  {
    name: "ListTransactions",
    serverStreaming: true,
    options: {},
    I: ListTransactionsRequest,
    O: ListTransactionsResponse
  },
  {
    name: "ListEvents",
    serverStreaming: true,
    options: {},
    I: ListEventsRequest,
    O: ListEventsResponse
  }
]);

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/ledger_service.client.mjs
var import_runtime_rpc6 = __toESM(require_commonjs2(), 1);
var LedgerServiceClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = LedgerService.typeName;
    this.methods = LedgerService.methods;
    this.options = LedgerService.options;
  }
  /**
  * Query the service for general information about its current state.
  *
  * @generated from protobuf rpc: GetServiceInfo(sui.rpc.v2.GetServiceInfoRequest) returns (sui.rpc.v2.GetServiceInfoResponse);
  */
  getServiceInfo(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: GetObject(sui.rpc.v2.GetObjectRequest) returns (sui.rpc.v2.GetObjectResponse);
  */
  getObject(input, options) {
    const method = this.methods[1], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: BatchGetObjects(sui.rpc.v2.BatchGetObjectsRequest) returns (sui.rpc.v2.BatchGetObjectsResponse);
  */
  batchGetObjects(input, options) {
    const method = this.methods[2], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: GetTransaction(sui.rpc.v2.GetTransactionRequest) returns (sui.rpc.v2.GetTransactionResponse);
  */
  getTransaction(input, options) {
    const method = this.methods[3], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: BatchGetTransactions(sui.rpc.v2.BatchGetTransactionsRequest) returns (sui.rpc.v2.BatchGetTransactionsResponse);
  */
  batchGetTransactions(input, options) {
    const method = this.methods[4], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: GetCheckpoint(sui.rpc.v2.GetCheckpointRequest) returns (sui.rpc.v2.GetCheckpointResponse);
  */
  getCheckpoint(input, options) {
    const method = this.methods[5], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: GetEpoch(sui.rpc.v2.GetEpochRequest) returns (sui.rpc.v2.GetEpochResponse);
  */
  getEpoch(input, options) {
    const method = this.methods[6], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * List checkpoints matching the provided filters.
  *
  * Checkpoints are returned in ascending or descending checkpoint sequence
  * number order according to the query options ordering.
  * A checkpoint matches if any transaction it contains satisfies the filter.
  *
  * @generated from protobuf rpc: ListCheckpoints(sui.rpc.v2.ListCheckpointsRequest) returns (stream sui.rpc.v2.ListCheckpointsResponse);
  */
  listCheckpoints(input, options) {
    const method = this.methods[7], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("serverStreaming", this._transport, method, opt, input);
  }
  /**
  * List transactions matching the provided filters.
  *
  * Transactions are returned in ascending or descending transaction sequence
  * order according to the query options ordering.
  *
  * @generated from protobuf rpc: ListTransactions(sui.rpc.v2.ListTransactionsRequest) returns (stream sui.rpc.v2.ListTransactionsResponse);
  */
  listTransactions(input, options) {
    const method = this.methods[8], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("serverStreaming", this._transport, method, opt, input);
  }
  /**
  * List events matching the provided filters.
  *
  * Events are returned in ascending or descending packed event sequence order
  * according to the query options ordering.
  *
  * @generated from protobuf rpc: ListEvents(sui.rpc.v2.ListEventsRequest) returns (stream sui.rpc.v2.ListEventsResponse);
  */
  listEvents(input, options) {
    const method = this.methods[9], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc6.stackIntercept)("serverStreaming", this._transport, method, opt, input);
  }
};

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/move_package_service.mjs
var import_runtime33 = __toESM(require_commonjs(), 1);
var import_runtime_rpc7 = __toESM(require_commonjs2(), 1);
var GetPackageRequest$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.GetPackageRequest", [{
      no: 1,
      name: "package_id",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var GetPackageRequest = new GetPackageRequest$Type();
var GetPackageResponse$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.GetPackageResponse", [{
      no: 1,
      name: "package",
      kind: "message",
      T: () => Package
    }]);
  }
};
var GetPackageResponse = new GetPackageResponse$Type();
var GetDatatypeRequest$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.GetDatatypeRequest", [
      {
        no: 1,
        name: "package_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "module_name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var GetDatatypeRequest = new GetDatatypeRequest$Type();
var GetDatatypeResponse$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.GetDatatypeResponse", [{
      no: 1,
      name: "datatype",
      kind: "message",
      T: () => DatatypeDescriptor
    }]);
  }
};
var GetDatatypeResponse = new GetDatatypeResponse$Type();
var GetFunctionRequest$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.GetFunctionRequest", [
      {
        no: 1,
        name: "package_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "module_name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var GetFunctionRequest = new GetFunctionRequest$Type();
var GetFunctionResponse$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.GetFunctionResponse", [{
      no: 1,
      name: "function",
      kind: "message",
      T: () => FunctionDescriptor
    }]);
  }
};
var GetFunctionResponse = new GetFunctionResponse$Type();
var ListPackageVersionsRequest$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.ListPackageVersionsRequest", [
      {
        no: 1,
        name: "package_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "page_size",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "page_token",
        kind: "scalar",
        opt: true,
        T: 12
      }
    ]);
  }
};
var ListPackageVersionsRequest = new ListPackageVersionsRequest$Type();
var ListPackageVersionsResponse$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.ListPackageVersionsResponse", [{
      no: 1,
      name: "versions",
      kind: "message",
      repeat: 2,
      T: () => PackageVersion
    }, {
      no: 2,
      name: "next_page_token",
      kind: "scalar",
      opt: true,
      T: 12
    }]);
  }
};
var ListPackageVersionsResponse = new ListPackageVersionsResponse$Type();
var PackageVersion$Type = class extends import_runtime33.MessageType {
  constructor() {
    super("sui.rpc.v2.PackageVersion", [{
      no: 1,
      name: "package_id",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "version",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var PackageVersion = new PackageVersion$Type();
var MovePackageService = new import_runtime_rpc7.ServiceType("sui.rpc.v2.MovePackageService", [
  {
    name: "GetPackage",
    options: {},
    I: GetPackageRequest,
    O: GetPackageResponse
  },
  {
    name: "GetDatatype",
    options: {},
    I: GetDatatypeRequest,
    O: GetDatatypeResponse
  },
  {
    name: "GetFunction",
    options: {},
    I: GetFunctionRequest,
    O: GetFunctionResponse
  },
  {
    name: "ListPackageVersions",
    options: {},
    I: ListPackageVersionsRequest,
    O: ListPackageVersionsResponse
  }
]);

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/move_package_service.client.mjs
var import_runtime_rpc8 = __toESM(require_commonjs2(), 1);
var MovePackageServiceClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = MovePackageService.typeName;
    this.methods = MovePackageService.methods;
    this.options = MovePackageService.options;
  }
  /**
  * @generated from protobuf rpc: GetPackage(sui.rpc.v2.GetPackageRequest) returns (sui.rpc.v2.GetPackageResponse);
  */
  getPackage(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc8.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: GetDatatype(sui.rpc.v2.GetDatatypeRequest) returns (sui.rpc.v2.GetDatatypeResponse);
  */
  getDatatype(input, options) {
    const method = this.methods[1], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc8.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: GetFunction(sui.rpc.v2.GetFunctionRequest) returns (sui.rpc.v2.GetFunctionResponse);
  */
  getFunction(input, options) {
    const method = this.methods[2], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc8.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: ListPackageVersions(sui.rpc.v2.ListPackageVersionsRequest) returns (sui.rpc.v2.ListPackageVersionsResponse);
  */
  listPackageVersions(input, options) {
    const method = this.methods[3], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc8.stackIntercept)("unary", this._transport, method, opt, input);
  }
};

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/signature_verification_service.mjs
var import_runtime34 = __toESM(require_commonjs(), 1);
var import_runtime_rpc9 = __toESM(require_commonjs2(), 1);
var VerifySignatureRequest$Type = class extends import_runtime34.MessageType {
  constructor() {
    super("sui.rpc.v2.VerifySignatureRequest", [
      {
        no: 1,
        name: "message",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 2,
        name: "signature",
        kind: "message",
        T: () => UserSignature
      },
      {
        no: 3,
        name: "address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "jwks",
        kind: "message",
        repeat: 2,
        T: () => ActiveJwk2
      }
    ]);
  }
};
var VerifySignatureRequest = new VerifySignatureRequest$Type();
var VerifySignatureResponse$Type = class extends import_runtime34.MessageType {
  constructor() {
    super("sui.rpc.v2.VerifySignatureResponse", [{
      no: 1,
      name: "is_valid",
      kind: "scalar",
      opt: true,
      T: 8
    }, {
      no: 2,
      name: "reason",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var VerifySignatureResponse = new VerifySignatureResponse$Type();
var SignatureVerificationService = new import_runtime_rpc9.ServiceType("sui.rpc.v2.SignatureVerificationService", [{
  name: "VerifySignature",
  options: {},
  I: VerifySignatureRequest,
  O: VerifySignatureResponse
}]);

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/signature_verification_service.client.mjs
var import_runtime_rpc10 = __toESM(require_commonjs2(), 1);
var SignatureVerificationServiceClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = SignatureVerificationService.typeName;
    this.methods = SignatureVerificationService.methods;
    this.options = SignatureVerificationService.options;
  }
  /**
  * Perform signature verification of a UserSignature against the provided message.
  *
  * @generated from protobuf rpc: VerifySignature(sui.rpc.v2.VerifySignatureRequest) returns (sui.rpc.v2.VerifySignatureResponse);
  */
  verifySignature(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc10.stackIntercept)("unary", this._transport, method, opt, input);
  }
};

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/state_service.mjs
var import_runtime35 = __toESM(require_commonjs(), 1);
var import_runtime_rpc11 = __toESM(require_commonjs2(), 1);
var CoinMetadata_MetadataCapState = /* @__PURE__ */ (function(CoinMetadata_MetadataCapState$1) {
  CoinMetadata_MetadataCapState$1[CoinMetadata_MetadataCapState$1["METADATA_CAP_STATE_UNKNOWN"] = 0] = "METADATA_CAP_STATE_UNKNOWN";
  CoinMetadata_MetadataCapState$1[CoinMetadata_MetadataCapState$1["CLAIMED"] = 1] = "CLAIMED";
  CoinMetadata_MetadataCapState$1[CoinMetadata_MetadataCapState$1["UNCLAIMED"] = 2] = "UNCLAIMED";
  CoinMetadata_MetadataCapState$1[CoinMetadata_MetadataCapState$1["DELETED"] = 3] = "DELETED";
  return CoinMetadata_MetadataCapState$1;
})({});
var CoinTreasury_SupplyState = /* @__PURE__ */ (function(CoinTreasury_SupplyState$1) {
  CoinTreasury_SupplyState$1[CoinTreasury_SupplyState$1["SUPPLY_STATE_UNKNOWN"] = 0] = "SUPPLY_STATE_UNKNOWN";
  CoinTreasury_SupplyState$1[CoinTreasury_SupplyState$1["FIXED"] = 1] = "FIXED";
  CoinTreasury_SupplyState$1[CoinTreasury_SupplyState$1["BURN_ONLY"] = 2] = "BURN_ONLY";
  return CoinTreasury_SupplyState$1;
})({});
var RegulatedCoinMetadata_CoinRegulatedState = /* @__PURE__ */ (function(RegulatedCoinMetadata_CoinRegulatedState$1) {
  RegulatedCoinMetadata_CoinRegulatedState$1[RegulatedCoinMetadata_CoinRegulatedState$1["COIN_REGULATED_STATE_UNKNOWN"] = 0] = "COIN_REGULATED_STATE_UNKNOWN";
  RegulatedCoinMetadata_CoinRegulatedState$1[RegulatedCoinMetadata_CoinRegulatedState$1["REGULATED"] = 1] = "REGULATED";
  RegulatedCoinMetadata_CoinRegulatedState$1[RegulatedCoinMetadata_CoinRegulatedState$1["UNREGULATED"] = 2] = "UNREGULATED";
  return RegulatedCoinMetadata_CoinRegulatedState$1;
})({});
var DynamicField_DynamicFieldKind = /* @__PURE__ */ (function(DynamicField_DynamicFieldKind$1) {
  DynamicField_DynamicFieldKind$1[DynamicField_DynamicFieldKind$1["DYNAMIC_FIELD_KIND_UNKNOWN"] = 0] = "DYNAMIC_FIELD_KIND_UNKNOWN";
  DynamicField_DynamicFieldKind$1[DynamicField_DynamicFieldKind$1["FIELD"] = 1] = "FIELD";
  DynamicField_DynamicFieldKind$1[DynamicField_DynamicFieldKind$1["OBJECT"] = 2] = "OBJECT";
  return DynamicField_DynamicFieldKind$1;
})({});
var GetCoinInfoRequest$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.GetCoinInfoRequest", [{
      no: 1,
      name: "coin_type",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var GetCoinInfoRequest = new GetCoinInfoRequest$Type();
var GetCoinInfoResponse$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.GetCoinInfoResponse", [
      {
        no: 1,
        name: "coin_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "metadata",
        kind: "message",
        T: () => CoinMetadata
      },
      {
        no: 3,
        name: "treasury",
        kind: "message",
        T: () => CoinTreasury
      },
      {
        no: 4,
        name: "regulated_metadata",
        kind: "message",
        T: () => RegulatedCoinMetadata
      }
    ]);
  }
};
var GetCoinInfoResponse = new GetCoinInfoResponse$Type();
var CoinMetadata$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.CoinMetadata", [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "decimals",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "symbol",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 5,
        name: "description",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 6,
        name: "icon_url",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 7,
        name: "metadata_cap_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 8,
        name: "metadata_cap_state",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.CoinMetadata.MetadataCapState", CoinMetadata_MetadataCapState]
      }
    ]);
  }
};
var CoinMetadata = new CoinMetadata$Type();
var CoinTreasury$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.CoinTreasury", [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "total_supply",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "supply_state",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.CoinTreasury.SupplyState", CoinTreasury_SupplyState]
      }
    ]);
  }
};
var CoinTreasury = new CoinTreasury$Type();
var RegulatedCoinMetadata$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.RegulatedCoinMetadata", [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "coin_metadata_object",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "deny_cap_object",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "allow_global_pause",
        kind: "scalar",
        opt: true,
        T: 8
      },
      {
        no: 5,
        name: "variant",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 6,
        name: "coin_regulated_state",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.RegulatedCoinMetadata.CoinRegulatedState", RegulatedCoinMetadata_CoinRegulatedState]
      }
    ]);
  }
};
var RegulatedCoinMetadata = new RegulatedCoinMetadata$Type();
var GetBalanceRequest$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.GetBalanceRequest", [{
      no: 1,
      name: "owner",
      kind: "scalar",
      opt: true,
      T: 9
    }, {
      no: 2,
      name: "coin_type",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var GetBalanceRequest = new GetBalanceRequest$Type();
var GetBalanceResponse$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.GetBalanceResponse", [{
      no: 1,
      name: "balance",
      kind: "message",
      T: () => Balance
    }]);
  }
};
var GetBalanceResponse = new GetBalanceResponse$Type();
var ListBalancesRequest$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.ListBalancesRequest", [
      {
        no: 1,
        name: "owner",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "page_size",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "page_token",
        kind: "scalar",
        opt: true,
        T: 12
      }
    ]);
  }
};
var ListBalancesRequest = new ListBalancesRequest$Type();
var ListBalancesResponse$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.ListBalancesResponse", [{
      no: 1,
      name: "balances",
      kind: "message",
      repeat: 2,
      T: () => Balance
    }, {
      no: 2,
      name: "next_page_token",
      kind: "scalar",
      opt: true,
      T: 12
    }]);
  }
};
var ListBalancesResponse = new ListBalancesResponse$Type();
var Balance$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.Balance", [
      {
        no: 1,
        name: "coin_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "balance",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "address_balance",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      },
      {
        no: 5,
        name: "coin_balance",
        kind: "scalar",
        opt: true,
        T: 4,
        L: 0
      }
    ]);
  }
};
var Balance = new Balance$Type();
var ListDynamicFieldsRequest$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.ListDynamicFieldsRequest", [
      {
        no: 1,
        name: "parent",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "page_size",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "page_token",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 4,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      }
    ]);
  }
};
var ListDynamicFieldsRequest = new ListDynamicFieldsRequest$Type();
var ListDynamicFieldsResponse$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.ListDynamicFieldsResponse", [{
      no: 1,
      name: "dynamic_fields",
      kind: "message",
      repeat: 2,
      T: () => DynamicField
    }, {
      no: 2,
      name: "next_page_token",
      kind: "scalar",
      opt: true,
      T: 12
    }]);
  }
};
var ListDynamicFieldsResponse = new ListDynamicFieldsResponse$Type();
var DynamicField$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.DynamicField", [
      {
        no: 1,
        name: "kind",
        kind: "enum",
        opt: true,
        T: () => ["sui.rpc.v2.DynamicField.DynamicFieldKind", DynamicField_DynamicFieldKind]
      },
      {
        no: 2,
        name: "parent",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "field_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "field_object",
        kind: "message",
        T: () => Object$1
      },
      {
        no: 5,
        name: "name",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 6,
        name: "value",
        kind: "message",
        T: () => Bcs
      },
      {
        no: 7,
        name: "value_type",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 8,
        name: "child_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 9,
        name: "child_object",
        kind: "message",
        T: () => Object$1
      }
    ]);
  }
};
var DynamicField = new DynamicField$Type();
var ListOwnedObjectsRequest$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.ListOwnedObjectsRequest", [
      {
        no: 1,
        name: "owner",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "page_size",
        kind: "scalar",
        opt: true,
        T: 13
      },
      {
        no: 3,
        name: "page_token",
        kind: "scalar",
        opt: true,
        T: 12
      },
      {
        no: 4,
        name: "read_mask",
        kind: "message",
        T: () => FieldMask
      },
      {
        no: 5,
        name: "object_type",
        kind: "scalar",
        opt: true,
        T: 9
      }
    ]);
  }
};
var ListOwnedObjectsRequest = new ListOwnedObjectsRequest$Type();
var ListOwnedObjectsResponse$Type = class extends import_runtime35.MessageType {
  constructor() {
    super("sui.rpc.v2.ListOwnedObjectsResponse", [{
      no: 1,
      name: "objects",
      kind: "message",
      repeat: 2,
      T: () => Object$1
    }, {
      no: 2,
      name: "next_page_token",
      kind: "scalar",
      opt: true,
      T: 12
    }]);
  }
};
var ListOwnedObjectsResponse = new ListOwnedObjectsResponse$Type();
var StateService = new import_runtime_rpc11.ServiceType("sui.rpc.v2.StateService", [
  {
    name: "ListDynamicFields",
    options: {},
    I: ListDynamicFieldsRequest,
    O: ListDynamicFieldsResponse
  },
  {
    name: "ListOwnedObjects",
    options: {},
    I: ListOwnedObjectsRequest,
    O: ListOwnedObjectsResponse
  },
  {
    name: "GetCoinInfo",
    options: {},
    I: GetCoinInfoRequest,
    O: GetCoinInfoResponse
  },
  {
    name: "GetBalance",
    options: {},
    I: GetBalanceRequest,
    O: GetBalanceResponse
  },
  {
    name: "ListBalances",
    options: {},
    I: ListBalancesRequest,
    O: ListBalancesResponse
  }
]);

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/state_service.client.mjs
var import_runtime_rpc12 = __toESM(require_commonjs2(), 1);
var StateServiceClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = StateService.typeName;
    this.methods = StateService.methods;
    this.options = StateService.options;
  }
  /**
  * @generated from protobuf rpc: ListDynamicFields(sui.rpc.v2.ListDynamicFieldsRequest) returns (sui.rpc.v2.ListDynamicFieldsResponse);
  */
  listDynamicFields(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc12.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: ListOwnedObjects(sui.rpc.v2.ListOwnedObjectsRequest) returns (sui.rpc.v2.ListOwnedObjectsResponse);
  */
  listOwnedObjects(input, options) {
    const method = this.methods[1], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc12.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: GetCoinInfo(sui.rpc.v2.GetCoinInfoRequest) returns (sui.rpc.v2.GetCoinInfoResponse);
  */
  getCoinInfo(input, options) {
    const method = this.methods[2], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc12.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: GetBalance(sui.rpc.v2.GetBalanceRequest) returns (sui.rpc.v2.GetBalanceResponse);
  */
  getBalance(input, options) {
    const method = this.methods[3], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc12.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: ListBalances(sui.rpc.v2.ListBalancesRequest) returns (sui.rpc.v2.ListBalancesResponse);
  */
  listBalances(input, options) {
    const method = this.methods[4], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc12.stackIntercept)("unary", this._transport, method, opt, input);
  }
};

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/subscription_service.mjs
var import_runtime36 = __toESM(require_commonjs(), 1);
var import_runtime_rpc13 = __toESM(require_commonjs2(), 1);
var SubscribeCheckpointsRequest$Type = class extends import_runtime36.MessageType {
  constructor() {
    super("sui.rpc.v2.SubscribeCheckpointsRequest", [{
      no: 1,
      name: "read_mask",
      kind: "message",
      T: () => FieldMask
    }, {
      no: 2,
      name: "filter",
      kind: "message",
      T: () => TransactionFilter
    }]);
  }
};
var SubscribeCheckpointsRequest = new SubscribeCheckpointsRequest$Type();
var SubscribeCheckpointsResponse$Type = class extends import_runtime36.MessageType {
  constructor() {
    super("sui.rpc.v2.SubscribeCheckpointsResponse", [{
      no: 1,
      name: "cursor",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "checkpoint",
      kind: "message",
      T: () => Checkpoint
    }]);
  }
};
var SubscribeCheckpointsResponse = new SubscribeCheckpointsResponse$Type();
var SubscribeTransactionsRequest$Type = class extends import_runtime36.MessageType {
  constructor() {
    super("sui.rpc.v2.SubscribeTransactionsRequest", [{
      no: 1,
      name: "read_mask",
      kind: "message",
      T: () => FieldMask
    }, {
      no: 2,
      name: "filter",
      kind: "message",
      T: () => TransactionFilter
    }]);
  }
};
var SubscribeTransactionsRequest = new SubscribeTransactionsRequest$Type();
var SubscribeTransactionsResponse$Type = class extends import_runtime36.MessageType {
  constructor() {
    super("sui.rpc.v2.SubscribeTransactionsResponse", [{
      no: 1,
      name: "transaction",
      kind: "message",
      T: () => ExecutedTransaction
    }, {
      no: 2,
      name: "watermark",
      kind: "message",
      T: () => Watermark
    }]);
  }
};
var SubscribeTransactionsResponse = new SubscribeTransactionsResponse$Type();
var SubscribeEventsRequest$Type = class extends import_runtime36.MessageType {
  constructor() {
    super("sui.rpc.v2.SubscribeEventsRequest", [{
      no: 1,
      name: "read_mask",
      kind: "message",
      T: () => FieldMask
    }, {
      no: 2,
      name: "filter",
      kind: "message",
      T: () => EventFilter
    }]);
  }
};
var SubscribeEventsRequest = new SubscribeEventsRequest$Type();
var SubscribeEventsResponse$Type = class extends import_runtime36.MessageType {
  constructor() {
    super("sui.rpc.v2.SubscribeEventsResponse", [{
      no: 1,
      name: "event",
      kind: "message",
      T: () => Event
    }, {
      no: 2,
      name: "watermark",
      kind: "message",
      T: () => Watermark
    }]);
  }
};
var SubscribeEventsResponse = new SubscribeEventsResponse$Type();
var SubscriptionService = new import_runtime_rpc13.ServiceType("sui.rpc.v2.SubscriptionService", [
  {
    name: "SubscribeCheckpoints",
    serverStreaming: true,
    options: {},
    I: SubscribeCheckpointsRequest,
    O: SubscribeCheckpointsResponse
  },
  {
    name: "SubscribeTransactions",
    serverStreaming: true,
    options: {},
    I: SubscribeTransactionsRequest,
    O: SubscribeTransactionsResponse
  },
  {
    name: "SubscribeEvents",
    serverStreaming: true,
    options: {},
    I: SubscribeEventsRequest,
    O: SubscribeEventsResponse
  }
]);

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/subscription_service.client.mjs
var import_runtime_rpc14 = __toESM(require_commonjs2(), 1);
var SubscriptionServiceClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = SubscriptionService.typeName;
    this.methods = SubscriptionService.methods;
    this.options = SubscriptionService.options;
  }
  /**
  * Subscribe to the stream of checkpoints.
  *
  * The stream begins at the latest executed checkpoint as seen by the
  * server and yields checkpoints matching the filter as they are executed.
  * A checkpoint matches if any transaction it contains satisfies the
  * filter.
  *
  * @generated from protobuf rpc: SubscribeCheckpoints(sui.rpc.v2.SubscribeCheckpointsRequest) returns (stream sui.rpc.v2.SubscribeCheckpointsResponse);
  */
  subscribeCheckpoints(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc14.stackIntercept)("serverStreaming", this._transport, method, opt, input);
  }
  /**
  * Subscribe to the stream of transactions.
  *
  * The stream begins at the latest executed checkpoint as seen by the
  * server and yields transactions matching the filter as they are executed.
  *
  * @generated from protobuf rpc: SubscribeTransactions(sui.rpc.v2.SubscribeTransactionsRequest) returns (stream sui.rpc.v2.SubscribeTransactionsResponse);
  */
  subscribeTransactions(input, options) {
    const method = this.methods[1], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc14.stackIntercept)("serverStreaming", this._transport, method, opt, input);
  }
  /**
  * Subscribe to the stream of events.
  *
  * The stream begins at the latest executed checkpoint as seen by the
  * server and yields events matching the filter as they are emitted.
  *
  * @generated from protobuf rpc: SubscribeEvents(sui.rpc.v2.SubscribeEventsRequest) returns (stream sui.rpc.v2.SubscribeEventsResponse);
  */
  subscribeEvents(input, options) {
    const method = this.methods[2], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc14.stackIntercept)("serverStreaming", this._transport, method, opt, input);
  }
};

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/name_service.mjs
var import_runtime37 = __toESM(require_commonjs(), 1);
var import_runtime_rpc15 = __toESM(require_commonjs2(), 1);
var LookupNameRequest$Type = class extends import_runtime37.MessageType {
  constructor() {
    super("sui.rpc.v2.LookupNameRequest", [{
      no: 1,
      name: "name",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var LookupNameRequest = new LookupNameRequest$Type();
var LookupNameResponse$Type = class extends import_runtime37.MessageType {
  constructor() {
    super("sui.rpc.v2.LookupNameResponse", [{
      no: 1,
      name: "record",
      kind: "message",
      T: () => NameRecord
    }]);
  }
};
var LookupNameResponse = new LookupNameResponse$Type();
var ReverseLookupNameRequest$Type = class extends import_runtime37.MessageType {
  constructor() {
    super("sui.rpc.v2.ReverseLookupNameRequest", [{
      no: 1,
      name: "address",
      kind: "scalar",
      opt: true,
      T: 9
    }]);
  }
};
var ReverseLookupNameRequest = new ReverseLookupNameRequest$Type();
var ReverseLookupNameResponse$Type = class extends import_runtime37.MessageType {
  constructor() {
    super("sui.rpc.v2.ReverseLookupNameResponse", [{
      no: 1,
      name: "record",
      kind: "message",
      T: () => NameRecord
    }]);
  }
};
var ReverseLookupNameResponse = new ReverseLookupNameResponse$Type();
var NameRecord$Type = class extends import_runtime37.MessageType {
  constructor() {
    super("sui.rpc.v2.NameRecord", [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 2,
        name: "name",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 3,
        name: "registration_nft_id",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 4,
        name: "expiration_timestamp",
        kind: "message",
        T: () => Timestamp
      },
      {
        no: 5,
        name: "target_address",
        kind: "scalar",
        opt: true,
        T: 9
      },
      {
        no: 6,
        name: "data",
        kind: "map",
        K: 9,
        V: {
          kind: "scalar",
          T: 9
        }
      }
    ]);
  }
};
var NameRecord = new NameRecord$Type();
var NameService = new import_runtime_rpc15.ServiceType("sui.rpc.v2.NameService", [{
  name: "LookupName",
  options: {},
  I: LookupNameRequest,
  O: LookupNameResponse
}, {
  name: "ReverseLookupName",
  options: {},
  I: ReverseLookupNameRequest,
  O: ReverseLookupNameResponse
}]);

// node_modules/@mysten/sui/dist/grpc/proto/sui/rpc/v2/name_service.client.mjs
var import_runtime_rpc16 = __toESM(require_commonjs2(), 1);
var NameServiceClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = NameService.typeName;
    this.methods = NameService.methods;
    this.options = NameService.options;
  }
  /**
  * @generated from protobuf rpc: LookupName(sui.rpc.v2.LookupNameRequest) returns (sui.rpc.v2.LookupNameResponse);
  */
  lookupName(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc16.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * @generated from protobuf rpc: ReverseLookupName(sui.rpc.v2.ReverseLookupNameRequest) returns (sui.rpc.v2.ReverseLookupNameResponse);
  */
  reverseLookupName(input, options) {
    const method = this.methods[1], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc16.stackIntercept)("unary", this._transport, method, opt, input);
  }
};

// node_modules/@mysten/sui/dist/grpc/proto/sui/forking/v1alpha/forking_service.mjs
var import_runtime38 = __toESM(require_commonjs(), 1);
var import_runtime_rpc17 = __toESM(require_commonjs2(), 1);
var AdvanceClockRequest$Type = class extends import_runtime38.MessageType {
  constructor() {
    super("sui.forking.v1alpha.AdvanceClockRequest", [{
      no: 1,
      name: "duration_ms",
      kind: "scalar",
      opt: true,
      T: 4,
      L: 0
    }]);
  }
};
var AdvanceClockRequest = new AdvanceClockRequest$Type();
var AdvanceClockResponse$Type = class extends import_runtime38.MessageType {
  constructor() {
    super("sui.forking.v1alpha.AdvanceClockResponse", [{
      no: 1,
      name: "timestamp_ms",
      kind: "scalar",
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "tx_digest",
      kind: "scalar",
      T: 9
    }]);
  }
};
var AdvanceClockResponse = new AdvanceClockResponse$Type();
var AdvanceCheckpointRequest$Type = class extends import_runtime38.MessageType {
  constructor() {
    super("sui.forking.v1alpha.AdvanceCheckpointRequest", []);
  }
};
var AdvanceCheckpointRequest = new AdvanceCheckpointRequest$Type();
var AdvanceCheckpointResponse$Type = class extends import_runtime38.MessageType {
  constructor() {
    super("sui.forking.v1alpha.AdvanceCheckpointResponse", [{
      no: 1,
      name: "checkpoint_sequence_number",
      kind: "scalar",
      T: 4,
      L: 0
    }, {
      no: 2,
      name: "timestamp_ms",
      kind: "scalar",
      T: 4,
      L: 0
    }]);
  }
};
var AdvanceCheckpointResponse = new AdvanceCheckpointResponse$Type();
var GetStatusRequest$Type = class extends import_runtime38.MessageType {
  constructor() {
    super("sui.forking.v1alpha.GetStatusRequest", []);
  }
};
var GetStatusRequest = new GetStatusRequest$Type();
var GetStatusResponse$Type = class extends import_runtime38.MessageType {
  constructor() {
    super("sui.forking.v1alpha.GetStatusResponse", [
      {
        no: 1,
        name: "epoch",
        kind: "scalar",
        T: 4,
        L: 0
      },
      {
        no: 2,
        name: "checkpoint_sequence_number",
        kind: "scalar",
        T: 4,
        L: 0
      },
      {
        no: 3,
        name: "timestamp_ms",
        kind: "scalar",
        T: 4,
        L: 0
      },
      {
        no: 4,
        name: "forked_at_checkpoint",
        kind: "scalar",
        T: 4,
        L: 0
      }
    ]);
  }
};
var GetStatusResponse = new GetStatusResponse$Type();
var ForkingService = new import_runtime_rpc17.ServiceType("sui.forking.v1alpha.ForkingService", [
  {
    name: "AdvanceClock",
    options: {},
    I: AdvanceClockRequest,
    O: AdvanceClockResponse
  },
  {
    name: "AdvanceCheckpoint",
    options: {},
    I: AdvanceCheckpointRequest,
    O: AdvanceCheckpointResponse
  },
  {
    name: "GetStatus",
    options: {},
    I: GetStatusRequest,
    O: GetStatusResponse
  }
]);

// node_modules/@mysten/sui/dist/grpc/proto/sui/forking/v1alpha/forking_service.client.mjs
var import_runtime_rpc18 = __toESM(require_commonjs2(), 1);
var ForkingServiceClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = ForkingService.typeName;
    this.methods = ForkingService.methods;
    this.options = ForkingService.options;
  }
  /**
  * Advance the forked network's clock by a given duration.
  *
  * @generated from protobuf rpc: AdvanceClock(sui.forking.v1alpha.AdvanceClockRequest) returns (sui.forking.v1alpha.AdvanceClockResponse);
  */
  advanceClock(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc18.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * Seal pending transactions into a new checkpoint.
  *
  * @generated from protobuf rpc: AdvanceCheckpoint(sui.forking.v1alpha.AdvanceCheckpointRequest) returns (sui.forking.v1alpha.AdvanceCheckpointResponse);
  */
  advanceCheckpoint(input, options) {
    const method = this.methods[1], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc18.stackIntercept)("unary", this._transport, method, opt, input);
  }
  /**
  * Return the current state of the forked network.
  *
  * @generated from protobuf rpc: GetStatus(sui.forking.v1alpha.GetStatusRequest) returns (sui.forking.v1alpha.GetStatusResponse);
  */
  getStatus(input, options) {
    const method = this.methods[2], opt = this._transport.mergeOptions(options);
    return (0, import_runtime_rpc18.stackIntercept)("unary", this._transport, method, opt, input);
  }
};

// node_modules/@mysten/sui/dist/grpc/client.mjs
var SUI_CLIENT_BRAND = /* @__PURE__ */ Symbol.for("@mysten/SuiGrpcClient");
var SuiGrpcClient = class extends BaseClient {
  get mvr() {
    return this.core.mvr;
  }
  get [SUI_CLIENT_BRAND]() {
    return true;
  }
  constructor(options) {
    super({ network: options.network });
    const { network: _network, mvr: _mvr, abort: _abort, transport: providedTransport, ...transportOptions } = options;
    const transport = withClientProtocolVersion(providedTransport ?? new GrpcWebFetchTransport$1(transportOptions));
    this.transactionExecutionService = new TransactionExecutionServiceClient(transport);
    this.ledgerService = new LedgerServiceClient(transport);
    this.stateService = new StateServiceClient(transport);
    this.subscriptionService = new SubscriptionServiceClient(transport);
    this.movePackageService = new MovePackageServiceClient(transport);
    this.signatureVerificationService = new SignatureVerificationServiceClient(transport);
    this.nameService = new NameServiceClient(transport);
    this.forkingService = new ForkingServiceClient(transport);
    this.core = new GrpcCoreClient({
      client: this,
      base: this,
      network: options.network,
      mvr: options.mvr
    });
  }
  getObjects(input) {
    return this.core.getObjects(input);
  }
  getObject(input) {
    return this.core.getObject(input);
  }
  listCoins(input) {
    return this.core.listCoins(input);
  }
  listOwnedObjects(input) {
    return this.core.listOwnedObjects(input);
  }
  getBalance(input) {
    return this.core.getBalance(input);
  }
  listBalances(input) {
    return this.core.listBalances(input);
  }
  getCoinMetadata(input) {
    return this.core.getCoinMetadata(input);
  }
  getTransaction(input) {
    return this.core.getTransaction(input);
  }
  executeTransaction(input) {
    return this.core.executeTransaction(input);
  }
  signAndExecuteTransaction(input) {
    return this.core.signAndExecuteTransaction(input);
  }
  waitForTransaction(input) {
    return this.core.waitForTransaction(input);
  }
  simulateTransaction(input) {
    return this.core.simulateTransaction(input);
  }
  getReferenceGasPrice(input) {
    return this.core.getReferenceGasPrice(input);
  }
  getCurrentSystemState(input) {
    return this.core.getCurrentSystemState(input);
  }
  getProtocolConfig(input) {
    return this.core.getProtocolConfig(input);
  }
  getChainIdentifier(input) {
    return this.core.getChainIdentifier(input);
  }
  async listDynamicFields(input) {
    const includeValue = input.include?.value ?? false;
    const paths = [
      "field_id",
      "name",
      "value_type",
      "kind",
      "child_id"
    ];
    if (includeValue) paths.push("value");
    const response = await this.stateService.listDynamicFields({
      parent: input.parentId,
      pageToken: input.cursor ? fromBase64(input.cursor) : void 0,
      pageSize: input.limit,
      readMask: { paths }
    }, { abort: input.signal });
    return {
      dynamicFields: response.response.dynamicFields.map((field) => {
        const isDynamicObject = field.kind === DynamicField_DynamicFieldKind.OBJECT;
        const fieldType = isDynamicObject ? `0x2::dynamic_field::Field<0x2::dynamic_object_field::Wrapper<${field.name?.name}>,0x2::object::ID>` : `0x2::dynamic_field::Field<${field.name?.name},${field.valueType}>`;
        return {
          $kind: isDynamicObject ? "DynamicObject" : "DynamicField",
          fieldId: field.fieldId,
          name: {
            type: field.name?.name,
            bcs: field.name?.value
          },
          valueType: field.valueType,
          type: normalizeStructTag(fieldType),
          childId: field.childId,
          value: includeValue ? {
            type: field.valueType,
            bcs: field.value?.value ?? new Uint8Array()
          } : void 0
        };
      }),
      cursor: response.response.nextPageToken ? toBase64(response.response.nextPageToken) : null,
      hasNextPage: response.response.nextPageToken !== void 0
    };
  }
  getDynamicField(input) {
    return this.core.getDynamicField(input);
  }
  getDynamicObjectField(input) {
    return this.core.getDynamicObjectField(input);
  }
  listTransactions(input) {
    return this.core.listTransactions(input);
  }
  listEvents(input) {
    return this.core.listEvents(input);
  }
  getMoveFunction(input) {
    return this.core.getMoveFunction(input);
  }
  resolveTransactionPlugin() {
    return this.core.resolveTransactionPlugin();
  }
  verifyZkLoginSignature(input) {
    return this.core.verifyZkLoginSignature(input);
  }
  defaultNameServiceName(input) {
    return this.core.defaultNameServiceName(input);
  }
  resolveNameServiceAddress(input) {
    return this.core.resolveNameServiceAddress(input);
  }
};

// node_modules/@mysten/sui/dist/cryptography/signature-scheme.mjs
var SIGNATURE_SCHEME_TO_FLAG = {
  ED25519: 0,
  Secp256k1: 1,
  Secp256r1: 2,
  MultiSig: 3,
  ZkLogin: 5,
  Passkey: 6,
  MLDSA65: 7
};
var SIGNATURE_SCHEME_TO_SIZE = {
  ED25519: 32,
  Secp256k1: 33,
  Secp256r1: 33,
  Passkey: 33,
  MLDSA65: 1952
};
var SIGNATURE_FLAG_TO_SCHEME = {
  0: "ED25519",
  1: "Secp256k1",
  2: "Secp256r1",
  3: "MultiSig",
  5: "ZkLogin",
  6: "Passkey",
  7: "MLDSA65"
};

// node_modules/@mysten/sui/dist/cryptography/intent.mjs
function messageWithIntent(scope, message) {
  return suiBcs.IntentMessage(suiBcs.bytes(message.length)).serialize({
    intent: {
      scope: { [scope]: true },
      version: { V0: true },
      appId: { Sui: true }
    },
    value: message
  }).toBytes();
}

// node_modules/@mysten/sui/dist/cryptography/publickey.mjs
function bytesEqual(a, b) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
var PublicKey2 = class {
  /**
  * Checks if two public keys are equal
  */
  equals(publicKey) {
    return bytesEqual(this.toRawBytes(), publicKey.toRawBytes());
  }
  /**
  * Return the base-64 representation of the public key
  */
  toBase64() {
    return toBase64(this.toRawBytes());
  }
  toString() {
    throw new Error("`toString` is not implemented on public keys. Use `toBase64()` or `toRawBytes()` instead.");
  }
  /**
  * Return the Sui representation of the public key encoded in
  * base-64. A Sui public key is formed by the concatenation
  * of the scheme flag with the raw bytes of the public key
  */
  toSuiPublicKey() {
    return toBase64(this.toSuiBytes());
  }
  verifyWithIntent(bytes, signature, intent) {
    const digest = blake2b(messageWithIntent(intent, bytes), { dkLen: 32 });
    return this.verify(digest, signature);
  }
  /**
  * Verifies that the signature is valid for for the provided PersonalMessage
  */
  verifyPersonalMessage(message, signature) {
    return this.verifyWithIntent(suiBcs.byteVector().serialize(message).toBytes(), signature, "PersonalMessage");
  }
  /**
  * Verifies that the signature is valid for for the provided Transaction
  */
  verifyTransaction(transaction, signature) {
    return this.verifyWithIntent(transaction, signature, "TransactionData");
  }
  /**
  * Verifies that the public key is associated with the provided address
  */
  verifyAddress(address) {
    return this.toSuiAddress() === address;
  }
  /**
  * Returns the bytes representation of the public key
  * prefixed with the signature scheme flag
  */
  toSuiBytes() {
    const rawBytes = this.toRawBytes();
    const suiBytes = new Uint8Array(rawBytes.length + 1);
    suiBytes.set([this.flag()]);
    suiBytes.set(rawBytes, 1);
    return suiBytes;
  }
  /**
  * Return the Sui address associated with this Ed25519 public key
  */
  toSuiAddress() {
    return normalizeSuiAddress(bytesToHex(blake2b(this.toSuiBytes(), { dkLen: 32 })).slice(0, SUI_ADDRESS_LENGTH * 2));
  }
};
function parseSerializedKeypairSignature(serializedSignature) {
  const bytes = fromBase64(serializedSignature);
  const signatureScheme = SIGNATURE_FLAG_TO_SCHEME[bytes[0]];
  switch (signatureScheme) {
    case "ED25519":
    case "Secp256k1":
    case "Secp256r1":
    case "MLDSA65":
      const size = SIGNATURE_SCHEME_TO_SIZE[signatureScheme];
      const signature = bytes.slice(1, bytes.length - size);
      return {
        serializedSignature,
        signatureScheme,
        signature,
        publicKey: bytes.slice(1 + signature.length),
        bytes
      };
    default:
      throw new Error("Unsupported signature scheme");
  }
}

// node_modules/@noble/hashes/sha2.js
var K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
var SHA2_64B = class extends HashMD {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  // h -- high 32 bits, l -- low 32 bits
  // Numeric initializers matter: starting the fields as `undefined` changes
  // V8's field representation and slows hashing down (measured on sha256).
  Ah = 0;
  Al = 0;
  Bh = 0;
  Bl = 0;
  Ch = 0;
  Cl = 0;
  Dh = 0;
  Dl = 0;
  Eh = 0;
  El = 0;
  Fh = 0;
  Fl = 0;
  Gh = 0;
  Gl = 0;
  Hh = 0;
  Hl = 0;
  constructor(outputLen, IV) {
    super(128, outputLen, 16, false);
    this.Ah = IV[0] | 0;
    this.Al = IV[1] | 0;
    this.Bh = IV[2] | 0;
    this.Bl = IV[3] | 0;
    this.Ch = IV[4] | 0;
    this.Cl = IV[5] | 0;
    this.Dh = IV[6] | 0;
    this.Dl = IV[7] | 0;
    this.Eh = IV[8] | 0;
    this.El = IV[9] | 0;
    this.Fh = IV[10] | 0;
    this.Fl = IV[11] | 0;
    this.Gh = IV[12] | 0;
    this.Gl = IV[13] | 0;
    this.Hh = IV[14] | 0;
    this.Hl = IV[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  _cloneInto(to) {
    (to ||= new this.constructor()).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view.getUint32(offset);
      SHA512_W_L[i] = view.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    this.destroyed = true;
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var _SHA512 = class extends SHA2_64B {
  constructor() {
    super(64, SHA512_IV);
  }
};
var sha512 = /* @__PURE__ */ createHasher(
  () => new _SHA512(),
  /* @__PURE__ */ oidNist(3)
);

// node_modules/@noble/curves/utils.js
function aarray(item, title, inner = () => {
}) {
  if (!Array.isArray(item))
    throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
  for (let i = 0; i < item.length; i++)
    inner(item[i], `${title}[${i}]`);
  return item;
}
var abytes2 = (value, length, title) => abytes(value, length, title);
var anumber2 = anumber;
function aobject2(value, title = "object") {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(title === "object" ? "expected valid options object" : `"${title}" expected object, got type=${typeof value}`);
  return value;
}
function afunction(value, title) {
  if (typeof value !== "function")
    throw new TypeError(`"${title}" is invalid: expected function, got ${typeof value}`);
  return value;
}
var bytesToHex2 = bytesToHex;
var concatBytes2 = (...arrays) => concatBytes(...arrays);
var hexToBytes2 = (hex) => hexToBytes(hex);
var isBytes3 = isBytes2;
var randomBytes2 = (bytesLength) => randomBytes(bytesLength);
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
var atitle2 = (title) => title ? `"${title}" ` : "";
function abool(value, title = "") {
  if (typeof value !== "boolean")
    throw new TypeError(atitle2(title) + "expected boolean, got type=" + typeof value);
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new RangeError("positive bigint expected, got " + n);
  } else
    anumber2(n);
  return n;
}
function asafenumber(value, title = "") {
  if (typeof value !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected number, got type=" + typeof value);
  }
  if (!Number.isSafeInteger(value)) {
    const prefix = title && `"${title}" `;
    throw new RangeError(prefix + "expected safe integer, got " + value);
  }
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes2(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber(len);
  if (len === 0)
    throw new Error("zero output length is invalid");
  n = abignumber(n);
  const expectedLen = len * 2;
  const hex = n.toString(16);
  if (hex.length > expectedLen)
    throw new RangeError("number is too large");
  return hexToBytes(hex.padStart(expectedLen, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes2(bytes) {
  return Uint8Array.from(abytes2(bytes));
}
function isPosBig(n) {
  return typeof n === "bigint" && _0n <= n;
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  if (n < _0n)
    throw new Error("expected non-negative bigint, got " + n);
  return n === _0n ? 0 : n.toString(2).length;
}
var bitMask = (n) => {
  asafenumber(n, "n");
  return (_1n << BigInt(n)) - _1n;
};
function validateObject(object2, fields = {}, optFields = {}, title = "object") {
  aobject2(object2, title);
  aobject2(fields, "fields");
  aobject2(optFields, "optFields");
  function checkField(fieldName, expectedType, isOpt) {
    const label = title === "object" ? `param "${String(fieldName)}"` : `"${title}.${String(fieldName)}"`;
    const val = object2[fieldName];
    if (!Object.hasOwn(object2, fieldName) && (isOpt ? val !== void 0 : expectedType !== "function")) {
      throw new TypeError(`${label} is invalid: expected own property`);
    }
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new TypeError(`${label} is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}

// node_modules/@noble/curves/abstract/modular.js
var _0n2 = /* @__PURE__ */ BigInt(0);
var _1n2 = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _4n = /* @__PURE__ */ BigInt(4);
var _5n = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n = /* @__PURE__ */ BigInt(8);
var _9n = /* @__PURE__ */ BigInt(9);
var _15n = /* @__PURE__ */ BigInt(15);
var _16n = /* @__PURE__ */ BigInt(16);
var POW_WINDOWED_MIN = /* @__PURE__ */ BigInt("0x10000000000000000");
function mod(a, b) {
  if (b <= _0n2)
    throw new Error("mod: expected positive modulus, got " + b);
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow(num, power, modulo) {
  if (modulo <= _1n2)
    throw new Error("pow: expected modulus > 1, got " + modulo);
  if (typeof power !== "bigint")
    throw new TypeError("invalid exponent: expected bigint, got " + typeof power);
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return _1n2;
  if (power === _1n2)
    return num;
  let d = num % modulo;
  if (d < _0n2)
    d += modulo;
  if (power < POW_WINDOWED_MIN) {
    let p2 = _1n2;
    while (power > _0n2) {
      if (power & _1n2)
        p2 = p2 * d % modulo;
      d = d * d % modulo;
      power >>= _1n2;
    }
    return p2;
  }
  const digits = [];
  while (power > _0n2) {
    digits.push(Number(power & _15n));
    power >>= _4n;
  }
  const table = new Array(16);
  table[0] = _1n2;
  table[1] = d;
  for (let i = 2; i < 16; i++)
    table[i] = table[i - 1] * d % modulo;
  let p = table[digits[digits.length - 1]];
  for (let w = digits.length - 2; w >= 0; w--) {
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    const digit = digits[w];
    if (digit !== 0)
      p = p * table[digit] % modulo;
  }
  return p;
}
function pow2(x, power, modulo) {
  if (modulo <= _1n2)
    throw new Error("pow2: expected modulus > 1, got " + modulo);
  if (power < _0n2)
    throw new Error("pow2: expected non-negative exponent, got " + power);
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number2, modulo) {
  if (number2 === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _1n2)
    throw new Error("invert: expected modulus > 1, got " + modulo);
  let a = mod(number2, modulo);
  let b = modulo;
  let x = _0n2, u = _1n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b - a * q;
    const m = x - u * q;
    b = a, a = r, x = u, u = m;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp2, root, n) {
  const F = Fp2;
  if (!F.eql(F.sqr(root), n))
    throw new Error("Cannot find square root");
}
function aoddModulus(order, fnName) {
  if ((order & _1n2) === _0n2)
    throw new Error(fnName + ": expected odd modulus, got " + order);
}
function sqrt3mod4(Fp2, n) {
  const F = Fp2;
  const p1div4 = (F.ORDER + _1n2) / _4n;
  const root = F.pow(n, p1div4);
  assertIsSquare(F, root, n);
  return root;
}
function sqrt5mod8(Fp2, n) {
  const F = Fp2;
  const p5div8 = (F.ORDER - _5n) / _8n;
  const n2 = F.mul(n, _2n);
  const v = F.pow(n2, p5div8);
  const nv = F.mul(n, v);
  const i = F.mul(F.mul(nv, _2n), v);
  const root = F.mul(nv, F.sub(i, F.ONE));
  assertIsSquare(F, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return ((Fp2, n) => {
    const F = Fp2;
    let tv1 = F.pow(n, c4);
    let tv2 = F.mul(tv1, c1);
    const tv3 = F.mul(tv1, c2);
    const tv4 = F.mul(tv1, c3);
    const e1 = F.eql(F.sqr(tv2), n);
    const e2 = F.eql(F.sqr(tv3), n);
    tv1 = F.cmov(tv1, tv2, e1);
    tv2 = F.cmov(tv4, tv3, e2);
    const e3 = F.eql(F.sqr(tv2), n);
    const root = F.cmov(tv1, tv2, e3);
    assertIsSquare(F, root, n);
    return root;
  });
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  aoddModulus(P, "tonelliShanks");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp2, n) {
    const F = Fp2;
    if (F.is0(n))
      return n;
    if (FpLegendre(F, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = F.mul(F.ONE, cc);
    let t = F.pow(n, Q);
    let R = F.pow(n, Q1div2);
    while (!F.eql(t, F.ONE)) {
      if (F.is0(t))
        throw new Error("Cannot find square root: probably non-prime P");
      let i = 1;
      let t_tmp = F.sqr(t);
      while (!F.eql(t_tmp, F.ONE)) {
        i++;
        t_tmp = F.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i - 1);
      const b = F.pow(c, exponent);
      M = i;
      c = F.sqr(b);
      t = F.mul(t, c);
      R = F.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  aoddModulus(P, "Fp.sqrt");
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n2) === _1n2;
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  aobject2(field, "field");
  if (typeof field.ORDER !== "bigint")
    throw new TypeError('param "ORDER" is invalid: expected bigint, got ' + typeof field.ORDER);
  asafenumber(field.BYTES, "BYTES");
  asafenumber(field.BITS, "BITS");
  for (const name of FIELD_FIELDS)
    afunction(field[name], "field." + name);
  if (field.BYTES < 1 || field.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (field.ORDER <= _1n2)
    throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
  return field;
}
function FpInvertBatch(Fp2, nums, passZero = false) {
  validateField(Fp2);
  aarray(nums, "nums");
  abool(passZero, "passZero");
  const F = Fp2;
  const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = acc;
    return F.mul(acc, num);
  }, F.ONE);
  const invertedAcc = F.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = F.mul(acc, inverted[i]);
    return F.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp2, n) {
  validateField(Fp2);
  const F = Fp2;
  aoddModulus(F.ORDER, "FpLegendre");
  const p1mod2 = (F.ORDER - _1n2) / _2n;
  const powered = F.pow(n, p1mod2);
  const yes = F.eql(powered, F.ONE);
  const zero = F.eql(powered, F.ZERO);
  const no = F.eql(powered, F.neg(F.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber2(nBitLength);
  if (n <= _0n2)
    throw new Error("invalid n length: expected positive n, got " + n);
  if (nBitLength !== void 0 && nBitLength < 1)
    throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
  const bits = bitLen(n);
  if (nBitLength !== void 0 && nBitLength < bits)
    throw new Error(`invalid n length: expected nBitLength (${nBitLength}) >= bitLen(n) (${bits})`);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
var FIELD_SQRT = /* @__PURE__ */ new WeakMap();
var _Field = class {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = _0n2;
  ONE = _1n2;
  _lengths;
  _mod;
  constructor(ORDER, opts = {}) {
    if (ORDER <= _1n2)
      throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = Object.freeze(opts.allowedLengths.slice());
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    Object.freeze(this);
  }
  create(num) {
    return mod(num, this.ORDER);
  }
  isValid(num) {
    if (typeof num !== "bigint")
      throw new TypeError("invalid field element: expected bigint, got " + typeof num);
    return _0n2 <= num && num < this.ORDER;
  }
  is0(num) {
    return num === _0n2;
  }
  // is valid and invertible
  isValidNot0(num) {
    return !this.is0(num) && this.isValid(num);
  }
  isOdd(num) {
    return (num & _1n2) === _1n2;
  }
  neg(num) {
    return mod(-num, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num) {
    return mod(num * num, this.ORDER);
  }
  add(lhs, rhs) {
    return mod(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod(lhs * rhs, this.ORDER);
  }
  pow(num, power) {
    return pow(num, power, this.ORDER);
  }
  div(lhs, rhs) {
    return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num) {
    return num * num;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num) {
    return invert(num, this.ORDER);
  }
  sqrt(num) {
    let sqrt = FIELD_SQRT.get(this);
    if (!sqrt)
      FIELD_SQRT.set(this, sqrt = FpSqrt(this.ORDER));
    return sqrt(this, num);
  }
  toBytes(num) {
    return this.isLE ? numberToBytesLE(num, this.BYTES) : numberToBytesBE(num, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes2(bytes);
    const { _lengths: allowedLengths, BYTES, isLE: isLE2, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (bytes.length < 1 || !allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE2 ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    if (modFromBytes)
      scalar = mod(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch(this, lst, true);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    abool(condition, "condition");
    return condition ? b : a;
  }
};
function Field(ORDER, opts = {}) {
  Object.freeze(_Field.prototype);
  return new _Field(ORDER, opts);
}

// node_modules/@noble/curves/abstract/curve.js
var _0n3 = /* @__PURE__ */ BigInt(0);
var _1n3 = /* @__PURE__ */ BigInt(1);
var _4n2 = /* @__PURE__ */ BigInt(4);
var BLIND_BYTES = 16;
var BLIND_BITS = 128;
var FW_WINDOW = 5;
var TABLE_BYTES_MAX = /* @__PURE__ */ (() => 2 ** 31)();
function validatePointCons(Point) {
  const pc = Point;
  if (typeof pc !== "function")
    throw new TypeError('"Point" expected constructor, got type=' + typeof Point);
  afunction(pc.fromAffine, "Point.fromAffine");
  afunction(pc.fromBytes, "Point.fromBytes");
  afunction(pc.fromHex, "Point.fromHex");
  aobject2(pc.BASE, "Point.BASE");
  aobject2(pc.ZERO, "Point.ZERO");
  validateField(pc.Fp);
  validateField(pc.Fn);
}
function normalizeZ(c, points) {
  validatePointCons(c);
  validateMSMPoints(points, c);
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits, min = 1) {
  if (!Number.isSafeInteger(W) || W < min || W > bits)
    throw new Error("invalid window size, expected [" + min + ".." + bits + "], got W=" + W);
}
function validateTableBytes(numPoints, fpBytes) {
  const bytes = numPoints * (4 * fpBytes + 128);
  if (bytes > TABLE_BYTES_MAX)
    throw new Error("invalid window size: table would need ~" + Math.ceil(bytes / 2 ** 20) + " MiB, max " + TABLE_BYTES_MAX / 2 ** 20 + " MiB");
}
function probeRandomBytes(randomBytes3, length) {
  if (randomBytes3 === void 0)
    return void 0;
  afunction(randomBytes3, "randomBytes");
  try {
    const probe = randomBytes3(length);
    if (!isBytes3(probe) || probe.length !== length)
      return void 0;
  } catch {
    return void 0;
  }
  return randomBytes3;
}
function validateMSMPoints(points, c) {
  aarray(points, "points");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field, maxScalar) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    const ok = maxScalar === void 0 ? field.isValid(s) : isPosBig(s) && s < maxScalar;
    if (!ok)
      throw new Error("invalid scalar at index " + i);
  });
}
var pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getWindowSize(P) {
  return pointWindowSizes.get(P) || 1;
}
function oddMultiples(p, size) {
  const dbl = p.double();
  const t = [p];
  for (let j = 1; j < size; j++)
    t.push(t[j - 1].add(dbl));
  return t;
}
function wnafDigits(n, W) {
  const size = 2 ** W;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const d = [];
  while (n > _0n3) {
    let w = 0;
    if (n & _1n3) {
      w = Number(n & mask);
      if (w >= half)
        w -= size;
      n -= BigInt(w);
    }
    d.push(w);
    n >>= _1n3;
  }
  return d;
}
function signedWindowDigits(n, W, windows) {
  const size = 2 ** W;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const shiftBy = BigInt(W);
  const d = [];
  for (let w = 0; w < windows; w++) {
    let v = Number(n & mask);
    n >>= shiftBy;
    if (v > half) {
      v -= size;
      n += _1n3;
    }
    d.push(v);
  }
  if (n !== _0n3)
    throw new Error("invalid wnaf");
  return d;
}
function wnafWalk(zero, tables, digits) {
  let max = 0;
  for (const d of digits)
    max = Math.max(max, d.length);
  let acc = zero;
  for (let bit = max - 1; bit >= 0; bit--) {
    if (bit !== max - 1)
      acc = acc.double();
    for (let i = 0; i < digits.length; i++) {
      const w = digits[i][bit];
      if (w) {
        const item = tables[i][Math.abs(w) - 1 >> 1];
        acc = acc.add(w < 0 ? item.negate() : item);
      }
    }
  }
  return acc;
}
var ScalarMultiplier = class {
  Point;
  BASE;
  ZERO;
  randomBytes;
  wnafPrecomputes = /* @__PURE__ */ new WeakMap();
  baseCanBeBlinded;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(Point, randomBytes3) {
    validatePointCons(Point);
    this.randomBytes = probeRandomBytes(randomBytes3, BLIND_BYTES);
    this.Point = Point;
    this.BASE = Point.BASE;
    this.ZERO = Point.ZERO;
    this.bits = Point.Fn.BITS;
  }
  /**
   * Creates a signed fixed-window wNAF precomputation table: for every window w, the
   * multiples `[1..2^(W−1)]⋅2^(w⋅W)⋅P`, flattened. All doublings are baked into the table,
   * so cached multiplication is additions-only. `windows = ceil(bits/W) + 1`: the extra
   * window absorbs the final carry of signed-digit recoding.
   * For a 256-bit curve and W=6, the table is 44⋅32 = 1408 points.
   * @param point - Point instance
   * @param W - window size
   * @param bits - scalar bitlength the table must cover
   */
  buildWnafTable(point, W, bits) {
    const windows = Math.ceil(bits / W) + 1;
    const half = 2 ** (W - 1);
    const comp = [];
    let base = point;
    for (let w = 0; w < windows; w++) {
      let acc = base;
      for (let i = 0; i < half; i++) {
        comp.push(acc);
        acc = acc.add(base);
      }
      base = comp[comp.length - 1].double();
    }
    return { W, bits, windows, comp };
  }
  /**
   * Implements ec multiplication using precomputed signed fixed-window wNAF tables.
   * Constant-time: fixed window count with one table addition per window — zero digits feed
   * the fake accumulator — and no doublings; the lookup scans the whole window slice.
   * Scalar bounds are validated by the public entry points ({@link ScalarMultiplier.mulCT},
   * {@link ScalarMultiplier.mulCTBlinded}, {@link ScalarMultiplier.mulUnsafe});
   * signedWindowDigits throws if `n` exceeds the table.
   * @returns real and fake (for const-time) points
   */
  wnafCachedCT(precomputes, n) {
    const { W, windows, comp } = precomputes;
    const half = 2 ** (W - 1);
    const digits = signedWindowDigits(n, W, windows);
    let p = this.ZERO;
    let f = this.BASE;
    for (let w = 0; w < windows; w++) {
      const digit = digits[w];
      const start = w * half;
      const idx = Math.abs(digit) - 1;
      let sel = comp[start];
      for (let i = 1; i < half; i++)
        sel = i === idx ? comp[start + i] : sel;
      const neg = sel.negate();
      if (digit === 0)
        f = f.add(comp[start]);
      else
        p = p.add(digit < 0 ? neg : sel);
    }
    return { p, f };
  }
  // Cache key is point identity plus (W, bits); at most two entries exist per point (public-width
  // `Fn.BITS` and blinded `Fn.BITS + BLIND_BITS`). Callers must not reuse the same point with
  // incompatible `transform(...)` layouts and expect a separate cache entry.
  getWnafPrecomputes(W, point, bits, transform2) {
    let entries = this.wnafPrecomputes.get(point);
    let comp = entries?.find((entry) => entry.W === W && entry.bits === bits);
    if (!comp) {
      comp = this.buildWnafTable(point, W, bits);
      if (typeof transform2 === "function")
        comp = { ...comp, comp: transform2(comp.comp) };
      if (!entries) {
        entries = [];
        this.wnafPrecomputes.set(point, entries);
      }
      entries.push(comp);
    }
    return comp;
  }
  assertPoint(point) {
    if (!(point instanceof this.Point))
      throw new TypeError('"point" expected Point instance, got type=' + typeof point);
  }
  // Shared prologue of the constant-time entry points. Rejects scalar 0: in key/signature-style
  // callers a zero scalar means broken upstream plumbing, and concrete Points already reject it.
  // Uses inRange instead of Fn.isValidNot0: validateField() only certifies the arithmetic subset.
  validateMulInput(point, scalar) {
    this.assertPoint(point);
    if (!inRange(scalar, _1n3, this.Point.Fn.ORDER))
      throw new Error("invalid scalar");
  }
  // Constant-time dispatch shared by mulCT / mulCTBlinded. Un-precomputed points (W===1, e.g.
  // ECDH peer keys) skip building a throwaway cached table in favor of a small fixed-window
  // multiply. `n` must be < 2^bits.
  runCT(point, n, bits, transform2) {
    const W = getWindowSize(point);
    if (W === 1)
      return this.fixedWindowCT(point, n, bits);
    return this.wnafCachedCT(this.getWnafPrecomputes(W, point, bits, transform2), n);
  }
  mulCT(point, scalar, transform2) {
    this.validateMulInput(point, scalar);
    return this.runCT(point, scalar, this.bits, transform2);
  }
  mulCTBlinded(point, scalar, transform2) {
    this.validateMulInput(point, scalar);
    if (this.randomBytes === void 0)
      throw new Error("randomBytes is required for scalar blinding");
    const bits = this.Point.Fn.BITS + BLIND_BITS;
    const blind = this.randomBytes(BLIND_BYTES);
    if (!isBytes3(blind) || blind.length !== BLIND_BYTES)
      throw new Error("randomBytes returned invalid byte array");
    blind[0] = blind[0] & 63 | 128;
    const n = scalar + bytesToNumberBE(blind) * this.Point.Fn.ORDER;
    return this.runCT(point, n, bits, transform2);
  }
  /**
   * Constant-time multiplication `n*point` for an un-precomputed point, via a small fixed window.
   * A cached wNAF table only pays off when reused; a flat 2^FW_WINDOW table (`size-1` adds) is
   * far cheaper to build for a single use. The point-operation sequence is independent of `n`:
   * build the table, then per window exactly FW_WINDOW doublings, a data-oblivious scan over
   * every table entry, and one addition (adds the identity when the window digit is 0 — never
   * skipped).
   *
   * `n` must be `< 2^bits`. Assumes complete addition (adding the identity costs the same as any
   * add), which holds for the Weierstrass/Edwards point types used here. The table is left in
   * projective form (no normalizeZ): normalizing this small a table costs more than the
   * mixed-add savings it would buy for a single multiply.
   * @returns real point `p`; `f` duplicates it only to match {@link wnafCachedCT}'s return shape
   * (this path needs no fake accumulator — its op-count is already scalar-independent).
   */
  fixedWindowCT(point, n, bits) {
    const W = FW_WINDOW;
    const size = 1 << W;
    const mask = bitMask(W);
    const table = new Array(size);
    table[0] = this.ZERO;
    for (let i = 1; i < size; i++)
      table[i] = table[i - 1].add(point);
    const windows = Math.ceil(bits / W);
    let acc = this.ZERO;
    for (let window = windows - 1; window >= 0; window--) {
      if (window !== windows - 1)
        for (let d = 0; d < W; d++)
          acc = acc.double();
      const digit = Number(n >> BigInt(window * W) & mask);
      let sel = table[0];
      for (let i = 1; i < size; i++)
        sel = i === digit ? table[i] : sel;
      acc = acc.add(sel);
    }
    return { p: acc, f: acc };
  }
  shouldBlind(point, cofactor) {
    if (this.randomBytes === void 0)
      return false;
    if (cofactor === _1n3)
      return true;
    if (point !== this.BASE)
      return false;
    if (this.baseCanBeBlinded === void 0)
      this.baseCanBeBlinded = this.mulUnsafe(this.BASE, this.Point.Fn.ORDER).is0();
    return this.baseCanBeBlinded;
  }
  mulSecret(point, scalar, cofactor, transform2) {
    return this.shouldBlind(point, cofactor) ? this.mulCTBlinded(point, scalar, transform2) : this.mulCT(point, scalar, transform2);
  }
  mulUnsafe(point, scalar, transform2) {
    this.assertPoint(point);
    if (!isPosBig(scalar))
      throw new Error("invalid scalar");
    const W = getWindowSize(point);
    if (W === 1 || scalar >= this.Point.Fn.ORDER)
      return mulAddUnsafe(this.Point, [point], [scalar], true);
    const precomputes = this.getWnafPrecomputes(W, point, this.bits, transform2);
    return this.wnafCachedCT(precomputes, scalar).p;
  }
  // Remembers the window size used for precomputed wNAF multiplication of the given point
  // and drops any previously built tables. Usually only the base point is precomputed.
  // W=1 resets the point to the un-precomputed (table-less) paths.
  // W is additionally capped so tables stay under ~2 GiB ({@link TABLE_BYTES_MAX}).
  setWindowSize(point, W) {
    this.assertPoint(point);
    validateW(W, this.bits);
    const windows = Math.ceil((this.bits + BLIND_BITS) / W) + 1;
    validateTableBytes(windows * 2 ** (W - 1), this.Point.Fp.BYTES);
    pointWindowSizes.set(point, W);
    this.wnafPrecomputes.delete(point);
  }
  // True when a window size is set: tables themselves are built lazily on first multiply.
  hasWindowSize(point) {
    return getWindowSize(point) !== 1;
  }
};
function mulAddUnsafe(c, points, scalars, allowOversized = false) {
  validatePointCons(c);
  validateMSMPoints(points, c);
  abool(allowOversized, "allowOversized");
  validateMSMScalars(scalars, c.Fn, allowOversized ? c.Fn.ORDER ** _4n2 : void 0);
  if (points.length !== scalars.length)
    throw new Error("arrays of points and scalars must have equal length");
  const tables = points.map((p) => oddMultiples(p, 4));
  const digits = scalars.map((n) => wnafDigits(n, 4));
  return wnafWalk(c.ZERO, tables, digits);
}
function createField(order, field, isLE2) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE: isLE2 });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (type !== "weierstrass" && type !== "edwards")
    throw new Error('expected curve type "weierstrass" or "edwards"');
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  validateObject(curveOpts);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(isPosBig(val) && val !== _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp2 = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp2.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp: Fp2, Fn };
}
function createKeygen(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}

// node_modules/@noble/curves/abstract/edwards.js
var _0n4 = /* @__PURE__ */ BigInt(0);
var _1n4 = /* @__PURE__ */ BigInt(1);
var _2n2 = /* @__PURE__ */ BigInt(2);
var _4n3 = /* @__PURE__ */ BigInt(4);
var _8n2 = /* @__PURE__ */ BigInt(8);
function isEdValidXY(Fp2, CURVE, x, y) {
  const x2 = Fp2.sqr(x);
  const y2 = Fp2.sqr(y);
  const left = Fp2.add(Fp2.mul(CURVE.a, x2), y2);
  const right = Fp2.add(Fp2.ONE, Fp2.mul(CURVE.d, Fp2.mul(x2, y2)));
  return Fp2.eql(left, right);
}
function edwards(params, extraOpts = {}) {
  validateObject(extraOpts, {}, {}, "extraOpts");
  const opts = extraOpts;
  const validated = createCurveFields("edwards", params, opts, opts.FpFnLE);
  const { Fp: Fp2, Fn } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor } = CURVE;
  if (FpLegendre(Fp2, CURVE.a) !== 1)
    throw new Error("edwards: CURVE.a must be a square in Fp for complete addition formulas");
  if (FpLegendre(Fp2, CURVE.d) !== -1)
    throw new Error("edwards: CURVE.d must be a non-square in Fp for complete addition formulas");
  validateObject(opts, {}, { uvRatio: "function", randomBytes: "function" });
  const randomBytes3 = opts.randomBytes === void 0 ? randomBytes2 : opts.randomBytes;
  const MASK = _2n2 << BigInt(Fp2.BYTES * 8) - _1n4;
  function isOdd(n) {
    if (!Fp2.isOdd)
      throw new Error("Field does not have .isOdd()");
    return Fp2.isOdd(n);
  }
  const uvRatio2 = opts.uvRatio === void 0 ? (u, v) => {
    try {
      return { isValid: true, value: Fp2.sqrt(Fp2.div(u, v)) };
    } catch (e) {
      return { isValid: false, value: _0n4 };
    }
  } : opts.uvRatio;
  if (!isEdValidXY(Fp2, CURVE, CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const mulA = Fp2.eql(CURVE.a, Fp2.neg(Fp2.ONE)) ? (x) => Fp2.neg(x) : Fp2.eql(CURVE.a, Fp2.ONE) ? (x) => x : (x) => Fp2.mul(CURVE.a, x);
  function acoord(title, n, banZero = false) {
    const min = banZero ? _1n4 : _0n4;
    aInRange("coordinate " + title, n, min, MASK);
    return n;
  }
  function aedpoint(other) {
    if (!(other instanceof Point))
      throw new Error("EdwardsPoint expected");
  }
  class Point {
    static BASE = new Point(CURVE.Gx, CURVE.Gy, Fp2.ONE, Fp2.mul(CURVE.Gx, CURVE.Gy));
    static ZERO = new Point(Fp2.ZERO, Fp2.ONE, Fp2.ONE, Fp2.ZERO);
    static Fp = Fp2;
    static Fn = Fn;
    X;
    Y;
    Z;
    T;
    constructor(X, Y, Z, T) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y);
      this.Z = acoord("z", Z, true);
      this.T = acoord("t", T);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /**
     * Create one extended Edwards point from affine coordinates.
     * Does NOT validate that the point is on-curve or torsion-free.
     * Use `.assertValidity()` on adversarial inputs.
     */
    static fromAffine(p) {
      if (p instanceof Point)
        throw new Error("extended point not allowed");
      const { x, y } = p || {};
      acoord("x", x);
      acoord("y", y);
      return new Point(x, y, Fp2.ONE, Fp2.mul(x, y));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(bytes, zip215 = false) {
      const len = Fp2.BYTES;
      const { a, d } = CURVE;
      bytes = copyBytes2(abytes2(bytes, len, "point"));
      abool(zip215, "zip215");
      const normed = copyBytes2(bytes);
      const lastByte = bytes[len - 1];
      normed[len - 1] = lastByte & ~128;
      const y = bytesToNumberLE(normed);
      const max = zip215 ? MASK : Fp2.ORDER;
      aInRange("point.y", y, _0n4, max);
      const y2 = Fp2.sqr(y);
      const u = Fp2.sub(y2, Fp2.ONE);
      const v = Fp2.sub(Fp2.mulN(d, y2), a);
      let { isValid, value: x } = uvRatio2(u, v);
      if (!isValid)
        throw new Error("bad point: invalid y coordinate");
      const isXOdd = isOdd(x);
      const isLastByteOdd = (lastByte & 128) !== 0;
      if (!zip215 && Fp2.is0(x) && isLastByteOdd)
        throw new Error("bad point: x=0 and x_0=1");
      if (isLastByteOdd !== isXOdd)
        x = Fp2.neg(x);
      return Point.fromAffine({ x, y });
    }
    static fromHex(hex, zip215 = false) {
      return Point.fromBytes(hexToBytes2(hex), zip215);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(windowSize = 6, isLazy = true) {
      wnaf.setWindowSize(this, windowSize);
      if (!isLazy)
        this.multiply(_2n2);
      return this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      const p = this;
      const { a, d } = CURVE;
      if (p.is0())
        throw new Error("bad point: ZERO");
      const { X, Y, Z, T } = p;
      const X2 = Fp2.sqr(X);
      const Y2 = Fp2.sqr(Y);
      const Z2 = Fp2.sqr(Z);
      const Z4 = Fp2.sqr(Z2);
      const aX2 = Fp2.mul(X2, a);
      const left = Fp2.mul(Fp2.add(aX2, Y2), Z2);
      const right = Fp2.add(Z4, Fp2.mul(d, Fp2.mul(X2, Y2)));
      if (!Fp2.eql(left, right))
        throw new Error("bad point: equation left != right (1)");
      const XY = Fp2.mul(X, Y);
      const ZT = Fp2.mul(Z, T);
      if (!Fp2.eql(XY, ZT))
        throw new Error("bad point: equation left != right (2)");
    }
    // Compare one point to another.
    equals(other) {
      aedpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const X1Z2 = Fp2.mul(X1, Z2);
      const X2Z1 = Fp2.mul(X2, Z1);
      const Y1Z2 = Fp2.mul(Y1, Z2);
      const Y2Z1 = Fp2.mul(Y2, Z1);
      return Fp2.eql(X1Z2, X2Z1) && Fp2.eql(Y1Z2, Y2Z1);
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    negate() {
      return new Point(Fp2.neg(this.X), this.Y, this.Z, Fp2.neg(this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const A = Fp2.sqr(X1);
      const B = Fp2.sqr(Y1);
      const C = Fp2.mul(Fp2.sqr(Z1), _2n2);
      const D = mulA(A);
      const x1y1 = Fp2.addN(X1, Y1);
      const E = Fp2.sub(Fp2.subN(Fp2.sqr(x1y1), A), B);
      const G = Fp2.addN(D, B);
      const F = Fp2.subN(G, C);
      const H = Fp2.subN(D, B);
      const X3 = Fp2.mul(E, F);
      const Y3 = Fp2.mul(G, H);
      const T3 = Fp2.mul(E, H);
      const Z3 = Fp2.mul(F, G);
      return new Point(X3, Y3, Z3, T3);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(other) {
      aedpoint(other);
      const { d } = CURVE;
      const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
      const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
      const A = Fp2.mul(X1, X2);
      const B = Fp2.mul(Y1, Y2);
      const C = Fp2.mul(Fp2.mulN(T1, d), T2);
      const D = Fp2.mul(Z1, Z2);
      const E = Fp2.sub(Fp2.subN(Fp2.mulN(Fp2.addN(X1, Y1), Fp2.addN(X2, Y2)), A), B);
      const F = Fp2.subN(D, C);
      const G = Fp2.addN(D, C);
      const H = Fp2.sub(B, mulA(A));
      const X3 = Fp2.mul(E, F);
      const Y3 = Fp2.mul(G, H);
      const T3 = Fp2.mul(E, H);
      const Z3 = Fp2.mul(F, G);
      return new Point(X3, Y3, Z3, T3);
    }
    subtract(other) {
      aedpoint(other);
      return this.add(other.negate());
    }
    // Constant-time multiplication.
    multiply(scalar) {
      if (!Fn.isValidNot0(scalar))
        throw new RangeError("invalid scalar: expected 1 <= sc < curve.n");
      const { p, f } = wnaf.mulSecret(this, scalar, cofactor, normalize3);
      return normalize3([p, f])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Keeps the same subgroup-scalar contract: 0 is allowed for public-scalar callers, but
    // n and larger values are rejected instead of being reduced mod n to the identity point.
    multiplyUnsafe(scalar) {
      if (!Fn.isValid(scalar))
        throw new RangeError("invalid scalar: expected 0 <= sc < curve.n");
      if (scalar === _0n4)
        return Point.ZERO;
      if (this.is0() || scalar === _1n4)
        return this;
      return wnaf.mulUnsafe(this, scalar, normalize3);
    }
    // Checks if point is of small order.
    // If you add something to small order point, you will have "dirty"
    // point with torsion component.
    // Clears cofactor and checks if the result is 0.
    isSmallOrder() {
      return this.clearCofactor().is0();
    }
    // Multiplies point by curve order and checks if the result is 0.
    // Returns `false` is the point is dirty.
    isTorsionFree() {
      return wnaf.mulUnsafe(this, CURVE.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(invertedZ) {
      const p = this;
      let iz = invertedZ;
      if (iz != null && typeof iz !== "bigint")
        throw new TypeError('"invertedZ" expected bigint, got type=' + typeof iz);
      const { X, Y, Z } = p;
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp2.create(_8n2) : Fp2.inv(Z);
      const x = Fp2.mul(X, iz);
      const y = Fp2.mul(Y, iz);
      const zz = Fp2.mul(Z, iz);
      if (is0)
        return { x: Fp2.ZERO, y: Fp2.ONE };
      if (!Fp2.eql(zz, Fp2.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    }
    clearCofactor() {
      if (cofactor === _1n4)
        return this;
      if (cofactor === _2n2)
        return this.double();
      if (cofactor === _4n3)
        return this.double().double();
      if (cofactor === _8n2)
        return this.double().double().double();
      return this.multiplyUnsafe(cofactor);
    }
    toBytes() {
      const { x, y } = this.toAffine();
      const bytes = Fp2.toBytes(y);
      bytes[bytes.length - 1] |= isOdd(x) ? 128 : 0;
      return bytes;
    }
    toHex() {
      return bytesToHex2(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const normalize3 = (points) => normalizeZ(Point, points);
  const wnaf = new ScalarMultiplier(Point, randomBytes3);
  if (wnaf.bits >= 6)
    Point.BASE.precompute(6);
  Object.freeze(Point.prototype);
  Object.freeze(Point);
  return Point;
}
function eddsa(Point, cHash, eddsaOpts = {}) {
  validatePointCons(Point);
  if (typeof cHash !== "function")
    throw new Error('"hash" function param is required');
  const hash = cHash;
  const opts = eddsaOpts;
  validateObject(opts, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    zip215: "boolean",
    mapToCurve: "function",
    toMontgomery: "function",
    toMontgomerySecret: "function"
  });
  const { prehash } = opts;
  const { BASE, Fp: Fp2, Fn } = Point;
  const outputLen = hash.outputLen;
  const expectedLen = 2 * Fp2.BYTES;
  if (outputLen !== void 0) {
    asafenumber(outputLen, "hash.outputLen");
    if (outputLen !== expectedLen)
      throw new Error(`hash.outputLen must be ${expectedLen}, got ${outputLen}`);
  }
  const randomBytes3 = opts.randomBytes === void 0 ? randomBytes2 : opts.randomBytes;
  const toMontgomery2 = opts.toMontgomery;
  const toMontgomerySecret2 = opts.toMontgomerySecret;
  const adjustScalarBytes2 = opts.adjustScalarBytes === void 0 ? (bytes) => bytes : opts.adjustScalarBytes;
  const domain = opts.domain === void 0 ? (data, ctx, phflag) => {
    abool(phflag, "phflag");
    if (ctx.length || phflag)
      throw new Error("Contexts/pre-hash are not supported");
    return data;
  } : opts.domain;
  function modN_LE(hash2) {
    return Fn.create(bytesToNumberLE(hash2));
  }
  function getPrivateScalar(key) {
    const len = lengths.secretKey;
    abytes2(key, lengths.secretKey, "secretKey");
    const hashed = abytes2(hash(key), 2 * len, "hashedSecretKey");
    const head = adjustScalarBytes2(hashed.slice(0, len));
    const prefix = hashed.slice(len, 2 * len);
    const scalar = modN_LE(head);
    return { head, prefix, scalar };
  }
  function getExtendedPublicKey(secretKey) {
    const { head, prefix, scalar } = getPrivateScalar(secretKey);
    const point = BASE.multiply(scalar);
    const pointBytes = point.toBytes();
    return { head, prefix, scalar, point, pointBytes };
  }
  function getPublicKey(secretKey) {
    return getExtendedPublicKey(secretKey).pointBytes;
  }
  function hashDomainToScalar(context = Uint8Array.of(), ...msgs) {
    const msg = concatBytes2(...msgs);
    return modN_LE(hash(domain(msg, abytes2(context, void 0, "context"), !!prehash)));
  }
  function sign(msg, secretKey, options = {}) {
    validateObject(options, {}, {}, "options");
    msg = copyBytes2(abytes2(msg, void 0, "message"));
    if (prehash)
      msg = prehash(msg);
    const { prefix, scalar, pointBytes } = getExtendedPublicKey(secretKey);
    const r = hashDomainToScalar(options.context, prefix, msg);
    const R = BASE.multiply(r).toBytes();
    const k = hashDomainToScalar(options.context, R, pointBytes, msg);
    const s = Fn.create(r + k * scalar);
    if (!Fn.isValid(s))
      throw new Error("sign failed: invalid s");
    const rs = concatBytes2(R, Fn.toBytes(s));
    return abytes2(rs, lengths.signature, "result");
  }
  const verifyOpts = {
    zip215: opts.zip215
  };
  function verify(sig, msg, publicKey, options = verifyOpts) {
    validateObject(options);
    const { context } = options;
    const zip215 = options.zip215 === void 0 ? !!verifyOpts.zip215 : options.zip215;
    const len = lengths.signature;
    sig = abytes2(sig, len, "signature");
    msg = abytes2(msg, void 0, "message");
    publicKey = abytes2(publicKey, lengths.publicKey, "publicKey");
    if (zip215 !== void 0)
      abool(zip215, "zip215");
    if (prehash)
      msg = prehash(msg);
    const mid = len / 2;
    const r = sig.subarray(0, mid);
    const s = bytesToNumberLE(sig.subarray(mid, len));
    let A, R, SB;
    try {
      A = Point.fromBytes(publicKey, zip215);
      R = Point.fromBytes(r, zip215);
      SB = BASE.multiplyUnsafe(s);
    } catch (error) {
      return false;
    }
    if (!zip215 && A.isSmallOrder())
      return false;
    const k = hashDomainToScalar(context, r, publicKey, msg);
    const RkA = R.add(A.multiplyUnsafe(k));
    return RkA.subtract(SB).clearCofactor().is0();
  }
  const _size = Fp2.BYTES;
  const lengths = {
    secretKey: _size,
    publicKey: _size,
    signature: 2 * _size,
    seed: _size
  };
  function randomSecretKey(seed) {
    seed = seed === void 0 ? randomBytes3(lengths.seed) : seed;
    return abytes2(seed, lengths.seed, "seed");
  }
  function isValidSecretKey(key) {
    return isBytes3(key) && key.length === lengths.secretKey;
  }
  function isValidPublicKey(key, zip215) {
    try {
      return !!Point.fromBytes(key, zip215 === void 0 ? verifyOpts.zip215 : zip215);
    } catch (error) {
      return false;
    }
  }
  const utils = {
    getExtendedPublicKey,
    randomSecretKey,
    isValidSecretKey,
    isValidPublicKey,
    /** Converts an Edwards public key to a companion Montgomery public key. */
    toMontgomery(publicKey) {
      if (toMontgomery2 === void 0)
        throw new Error("Montgomery conversion is not supported for this curve");
      return toMontgomery2(Point.fromBytes(publicKey));
    },
    toMontgomerySecret(secretKey) {
      if (toMontgomerySecret2 === void 0)
        throw new Error("Montgomery conversion is not supported for this curve");
      return toMontgomerySecret2(secretKey);
    }
  };
  Object.freeze(lengths);
  Object.freeze(utils);
  return Object.freeze({
    keygen: createKeygen(randomSecretKey, getPublicKey),
    getPublicKey,
    sign,
    verify,
    utils,
    Point,
    lengths
  });
}

// node_modules/@noble/curves/ed25519.js
var _1n5 = /* @__PURE__ */ BigInt(1);
var _2n3 = /* @__PURE__ */ BigInt(2);
var _5n2 = /* @__PURE__ */ BigInt(5);
var _8n3 = /* @__PURE__ */ BigInt(8);
var ed25519_CURVE_p = /* @__PURE__ */ BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
var ed25519_CURVE = /* @__PURE__ */ (() => ({
  p: ed25519_CURVE_p,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: _8n3,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
}))();
function ed25519_pow_2_252_3(x) {
  const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
  const P = ed25519_CURVE_p;
  const x2 = x * x % P;
  const b2 = x2 * x % P;
  const b4 = pow2(b2, _2n3, P) * b2 % P;
  const b5 = pow2(b4, _1n5, P) * x % P;
  const b10 = pow2(b5, _5n2, P) * b5 % P;
  const b20 = pow2(b10, _10n, P) * b10 % P;
  const b40 = pow2(b20, _20n, P) * b20 % P;
  const b80 = pow2(b40, _40n, P) * b40 % P;
  const b160 = pow2(b80, _80n, P) * b80 % P;
  const b240 = pow2(b160, _80n, P) * b80 % P;
  const b250 = pow2(b240, _10n, P) * b10 % P;
  const pow_p_5_8 = pow2(b250, _2n3, P) * x % P;
  return { pow_p_5_8, b2 };
}
function adjustScalarBytes(bytes) {
  bytes[0] &= 248;
  bytes[31] &= 127;
  bytes[31] |= 64;
  return bytes;
}
var ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function uvRatio(u, v) {
  const P = ed25519_CURVE_p;
  const v3 = mod(v * v * v, P);
  const v7 = mod(v3 * v3 * v, P);
  const pow3 = ed25519_pow_2_252_3(u * v7).pow_p_5_8;
  let x = mod(u * v3 * pow3, P);
  const vx2 = mod(v * x * x, P);
  const root1 = x;
  const root2 = mod(x * ED25519_SQRT_M1, P);
  const useRoot1 = vx2 === u;
  const useRoot2 = vx2 === mod(-u, P);
  const noRoot = vx2 === mod(-u * ED25519_SQRT_M1, P);
  if (useRoot1)
    x = root1;
  if (useRoot2 || noRoot)
    x = root2;
  if (isNegativeLE(x, P))
    x = mod(-x, P);
  return { isValid: useRoot1 || useRoot2, value: x };
}
var ed25519_Point = /* @__PURE__ */ edwards(ed25519_CURVE, { uvRatio });
var Fp = /* @__PURE__ */ (() => ed25519_Point.Fp)();
function toMontgomery(point) {
  const { y } = point;
  return Fp.toBytes(Fp.div(_1n5 + y, _1n5 - y));
}
function toMontgomerySecret(secretKey) {
  const size = ed25519_Point.Fp.BYTES;
  abytes(secretKey, size);
  return adjustScalarBytes(sha512(secretKey.subarray(0, size))).subarray(0, size);
}
function ed(opts) {
  return eddsa(ed25519_Point, sha512, Object.assign({ adjustScalarBytes, toMontgomery, toMontgomerySecret, zip215: true }, opts));
}
var ed25519 = /* @__PURE__ */ ed({});

// node_modules/@mysten/sui/dist/keypairs/ed25519/publickey.mjs
var PUBLIC_KEY_SIZE = 32;
var Ed25519PublicKey = class extends PublicKey2 {
  static {
    this.SIZE = PUBLIC_KEY_SIZE;
  }
  /**
  * Create a new Ed25519PublicKey object
  * @param value ed25519 public key as buffer or base-64 encoded string
  */
  constructor(value) {
    super();
    if (typeof value === "string") this.data = fromBase64(value);
    else if (value instanceof Uint8Array) this.data = value;
    else this.data = Uint8Array.from(value);
    if (this.data.length !== PUBLIC_KEY_SIZE) throw new Error(`Invalid public key input. Expected ${PUBLIC_KEY_SIZE} bytes, got ${this.data.length}`);
  }
  /**
  * Checks if two Ed25519 public keys are equal
  */
  equals(publicKey) {
    return super.equals(publicKey);
  }
  /**
  * Return the byte array representation of the Ed25519 public key
  */
  toRawBytes() {
    return this.data;
  }
  /**
  * Return the Sui address associated with this Ed25519 public key
  */
  flag() {
    return SIGNATURE_SCHEME_TO_FLAG["ED25519"];
  }
  /**
  * Verifies that the signature is valid for for the provided message
  */
  async verify(message, signature) {
    let bytes;
    if (typeof signature === "string") {
      const parsed = parseSerializedKeypairSignature(signature);
      if (parsed.signatureScheme !== "ED25519") throw new Error("Invalid signature scheme");
      if (!bytesEqual(this.toRawBytes(), parsed.publicKey)) throw new Error("Signature does not match public key");
      bytes = parsed.signature;
    } else bytes = signature;
    return ed25519.verify(bytes, message, this.toRawBytes());
  }
};

// node_modules/@noble/hashes/hmac.js
var _HMAC = class {
  oHash;
  iHash;
  blockLen;
  outputLen;
  canXOF = false;
  finished = false;
  destroyed = false;
  constructor(hash, key) {
    ahash(hash);
    abytes(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("expected Hash instance");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean(pad);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const buf = out.subarray(0, this.outputLen);
    this.iHash.digestInto(buf);
    this.oHash.update(buf);
    this.oHash.digestInto(buf);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.canXOF = canXOF;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac = /* @__PURE__ */ (() => {
  const hmac_ = ((hash, key, message) => new _HMAC(hash, key).update(message).digest());
  hmac_.create = (hash, key) => new _HMAC(hash, key);
  return hmac_;
})();

// node_modules/@noble/hashes/pbkdf2.js
function pbkdf2Init(hash, _password, _salt, _opts) {
  ahash(hash);
  const opts = checkOpts({ dkLen: 32, asyncTick: 10 }, _opts);
  const { c, dkLen, asyncTick } = opts;
  anumber(c, "c");
  anumber(dkLen, "dkLen");
  anumber(asyncTick, "asyncTick");
  if (c < 1)
    throw new Error('"c" (iterations) must be >= 1');
  if (dkLen < 1)
    throw new Error('"dkLen" must be >= 1');
  if (dkLen > (2 ** 32 - 1) * hash.outputLen)
    throw new Error("derived key too long");
  const p = kdfInputToBytes(_password, "password");
  try {
    const s = kdfInputToBytes(_salt, "salt");
    try {
      const DK = new Uint8Array(dkLen);
      const { iHash, oHash, outputLen } = hmac.create(hash, p);
      const u = new Uint8Array(outputLen);
      const eng = pbkdf2Engine(iHash, oHash, s, u);
      return { c, dkLen, asyncTick, DK, outputLen, eng };
    } finally {
      if (typeof _salt === "string")
        clean(s);
    }
  } finally {
    if (typeof _password === "string")
      clean(p);
  }
}
function pbkdf2Engine(iHash, oHash, salt, u) {
  const counter = new Uint8Array(4);
  const view = createView(counter);
  const salted = iHash._cloneInto().update(salt);
  const work = oHash._cloneInto();
  const iClone = iHash._cloneInto;
  const oClone = oHash._cloneInto;
  return {
    u1: (ti, Ti) => {
      view.setInt32(0, ti, false);
      salted._cloneInto(work).update(counter).digestInto(u);
      oHash._cloneInto(work).update(u).digestInto(u);
      Ti.set(u.subarray(0, Ti.length));
    },
    // Whole `F` inner loop for the sync variant: one optimized function owns the hot loop.
    rounds: (c, Ti) => {
      for (let ui = 1; ui < c; ui++) {
        iClone.call(iHash, work).update(u).digestInto(u);
        oClone.call(oHash, work).update(u).digestInto(u);
        for (let i = 0; i < Ti.length; i++)
          Ti[i] ^= u[i];
      }
    },
    output: (DK) => {
      iHash.destroy();
      oHash.destroy();
      salted.destroy();
      work.destroy();
      clean(u);
      return DK;
    }
  };
}
function pbkdf2(hash, password, salt, opts) {
  const { c, dkLen, DK, outputLen, eng } = pbkdf2Init(hash, password, salt, opts);
  for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += outputLen) {
    const Ti = DK.subarray(pos, pos + outputLen);
    eng.u1(ti, Ti);
    eng.rounds(c, Ti);
  }
  return eng.output(DK);
}

// node_modules/@scure/bip39/index.js
function isWellFormedUnicode(value) {
  for (let i = 0; i < value.length; i++) {
    const current = value.charCodeAt(i);
    if (current >= 55296 && current <= 56319) {
      if (i + 1 >= value.length)
        return false;
      const next = value.charCodeAt(++i);
      if (next < 56320 || next > 57343)
        return false;
    } else if (current >= 56320 && current <= 57343) {
      return false;
    }
  }
  return true;
}
function nfkd(str) {
  if (typeof str !== "string")
    throw new TypeError("invalid mnemonic type: " + typeof str);
  if (!isWellFormedUnicode(str))
    throw new TypeError("expected well-formed Unicode string");
  return str.normalize("NFKD");
}
function normalize2(str) {
  const norm = nfkd(str);
  const words = norm.split(" ");
  if (![12, 15, 18, 21, 24].includes(words.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: norm, words };
}
var psalt = (passphrase) => {
  if (typeof passphrase !== "string")
    throw new TypeError("invalid passphrase type: " + typeof passphrase);
  return nfkd("mnemonic" + passphrase);
};
function mnemonicToSeedSync(mnemonic, passphrase = "") {
  return pbkdf2(sha512, normalize2(mnemonic).nfkd, psalt(passphrase), {
    c: 2048,
    dkLen: 64
  });
}

// node_modules/@mysten/sui/dist/cryptography/mnemonics.mjs
function isValidHardenedPath(path, purpose = 44) {
  if (!(/* @__PURE__ */ new RegExp(`^m\\/${purpose}'\\/784'\\/[0-9]+'\\/[0-9]+'\\/[0-9]+'+$`)).test(path)) return false;
  return true;
}
function mnemonicToSeed(mnemonics) {
  return mnemonicToSeedSync(mnemonics, "");
}

// node_modules/@mysten/sui/dist/cryptography/signature.mjs
function toSerializedSignature({ signature, signatureScheme, publicKey }) {
  if (!publicKey) throw new Error("`publicKey` is required");
  const pubKeyBytes = publicKey.toRawBytes();
  const serializedSignature = new Uint8Array(1 + signature.length + pubKeyBytes.length);
  serializedSignature.set([SIGNATURE_SCHEME_TO_FLAG[signatureScheme]]);
  serializedSignature.set(signature, 1);
  serializedSignature.set(pubKeyBytes, 1 + signature.length);
  return toBase64(serializedSignature);
}

// node_modules/@scure/base/index.js
var freeze = (fn) => Object.freeze(fn());
function isBytes4(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function abytes3(b) {
  if (!isBytes4(b))
    throw new TypeError("Uint8Array expected");
}
function isArrayOf(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  if (isString) {
    return arr.every((item) => typeof item === "string");
  } else {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn(input) {
  if (typeof input !== "function")
    throw new TypeError("function expected");
  return true;
}
function astr(label, input) {
  if (typeof input !== "string")
    throw new TypeError(`${label}: string expected`);
  return true;
}
function anumber3(n, title = "number") {
  if (typeof n !== "number")
    throw new TypeError(`${title}: expected number, got ${typeof n}`);
  if (!Number.isSafeInteger(n))
    throw new RangeError(`${title}: expected safe integer, got ${n}`);
}
function anumArr(label, input) {
  if (!isArrayOf(false, input))
    throw new TypeError(`${label}: array of numbers expected`);
}
var powers = /* @__PURE__ */ (() => {
  let res = [];
  for (let i = 0; i < 40; i++)
    res.push(2 ** i);
  return res;
})();
function u8ToNumArr(u8, len = u8.length) {
  const res = new Array(len);
  for (let i = 0; i < len; i++)
    res[i] = u8[i];
  return res;
}
var asciiDecoder = /* @__PURE__ */ (() => {
  try {
    const decoder2 = new TextDecoder();
    return decoder2.decode(Uint8Array.of(65, 48, 43, 127)) === "A0+\x7F" ? decoder2 : void 0;
  } catch (e) {
    return void 0;
  }
})();
var B2S_CHUNK = 8192;
function charcodesToString(codes) {
  const len = codes.length;
  if (asciiDecoder !== void 0 && len >= 12)
    return asciiDecoder.decode(codes);
  if (len <= B2S_CHUNK)
    return String.fromCharCode.apply(null, codes);
  let res = "";
  for (let i = 0; i < len; i += B2S_CHUNK)
    res += String.fromCharCode.apply(null, codes.subarray(i, i + B2S_CHUNK));
  return res;
}
function radix2(bits) {
  anumber3(bits);
  if (bits <= 0 || bits > 8)
    throw new RangeError("radix2: bits should be in (0..8]");
  const mask = powers[bits] - 1;
  return {
    encode: (bytes) => {
      abytes3(bytes);
      const len = bytes.length;
      const res = new Uint8Array(Math.ceil(len * 8 / bits));
      let carry = 0;
      let pos = 0;
      let j = 0;
      for (let i = 0; i < len; ) {
        if (i + 2 < len) {
          carry = carry << 24 | bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
          pos += 24;
          i += 3;
        } else {
          carry = (carry << 8 | bytes[i]) & 65535;
          pos += 8;
          i++;
        }
        for (; ; ) {
          pos -= bits;
          res[j++] = carry >> pos & mask;
          if (pos < bits)
            break;
        }
      }
      if (pos > 0)
        res[j] = carry << bits - pos & mask;
      return res;
    },
    decode: (digits) => {
      const len = digits.length;
      const res = new Uint8Array(Math.floor(len * bits / 8));
      let carry = 0;
      let pos = 0;
      let j = 0;
      for (let i = 0; i < len; i++) {
        carry = (carry << bits | digits[i]) & 65535;
        pos += bits;
        for (; pos >= 8; pos -= 8)
          res[j++] = carry >> pos - 8 & 255;
      }
      carry = carry << 8 - pos & 255;
      if (pos >= bits)
        throw new Error("Excess padding");
      if (carry > 0)
        throw new Error(`Non-zero padding: ${carry}`);
      return res;
    }
  };
}
function alphabet(letters, aliases) {
  const len = letters.length;
  if (len > 128)
    throw new Error("alphabet: max 128 letters");
  const encTable = new Uint8Array(len);
  const decTable = new Int8Array(128).fill(-1);
  for (let i = 0; i < len; i++) {
    const code = letters.charCodeAt(i);
    if (letters.codePointAt(i) !== code || code > 127)
      throw new Error("alphabet: single-char ASCII letters only");
    encTable[i] = code;
    decTable[code] = i;
  }
  if (aliases !== void 0) {
    for (const alias of Object.keys(aliases)) {
      const code = alias.charCodeAt(0);
      const target = decTable[aliases[alias].charCodeAt(0)];
      if (alias.length !== 1 || code > 127 || target === void 0 || target === -1)
        throw new Error(`alphabet: invalid alias ${alias}`);
      decTable[code] = target;
    }
  }
  return {
    encode: (digits) => {
      const codes = new Uint8Array(digits.length);
      for (let i = 0; i < digits.length; i++) {
        const d = digits[i];
        const code = encTable[d];
        if (code === void 0)
          throw new Error(`alphabet.encode: invalid digit ${d}`);
        codes[i] = code;
      }
      return charcodesToString(codes);
    },
    decode: (input) => {
      astr("decode", input);
      const slen = input.length;
      const digits = new Uint8Array(slen);
      for (let i = 0; i < slen; i++) {
        const code = input.charCodeAt(i);
        const digit = code < 128 ? decTable[code] : -1;
        if (digit === -1)
          throw new Error(`Unknown letter "${input[i]}". Allowed: ${letters}`);
        digits[i] = digit;
      }
      return digits;
    }
  };
}
function unsafeWrapper(fn) {
  afn(fn);
  return function(...args) {
    try {
      return fn.apply(null, args);
    } catch (e) {
    }
  };
}
var BECH_ALPHABET = /* @__PURE__ */ alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l");
var BECH_UPPERCASE_PRINTABLE = /^[\x21-\x60\x7b-\x7e]+$/;
function assertBech32Printable(label, value) {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c < 33 || c > 126)
      throw new Error(`${label}: printable ASCII expected`);
  }
}
function wordsToU8(words) {
  const len = words.length;
  const res = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const w = words[i];
    if (w < 0 || w >= 32)
      throw new Error(`alphabet.encode: invalid digit ${w}`);
    res[i] = w;
  }
  return res;
}
var POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
function bech32Polymod(pre) {
  const b = pre >> 25;
  let chk = (pre & 33554431) << 5;
  for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
    if ((b >> i & 1) === 1)
      chk ^= POLYMOD_GENERATORS[i];
  }
  return chk;
}
function bechChecksum(prefix, words, encodingConst = 1) {
  const len = prefix.length;
  let chk = 1;
  for (let i = 0; i < len; i++) {
    const c = prefix.charCodeAt(i);
    if (c < 33 || c > 126)
      throw new Error(`Invalid prefix (${prefix})`);
    chk = bech32Polymod(chk) ^ c >> 5;
  }
  chk = bech32Polymod(chk);
  for (let i = 0; i < len; i++)
    chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 31;
  for (let v of words)
    chk = bech32Polymod(chk) ^ v;
  for (let i = 0; i < 6; i++)
    chk = bech32Polymod(chk);
  chk ^= encodingConst;
  const sum = new Uint8Array(6);
  for (let i = 0; i < 6; i++)
    sum[i] = chk >>> 5 * (5 - i) & 31;
  return BECH_ALPHABET.encode(sum);
}
function genBech32(encoding) {
  const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
  const _words = radix2(5);
  const toWords = (from) => {
    abytes3(from);
    const len = from.length;
    const res = new Array(Math.ceil(len * 8 / 5));
    let carry = 0;
    let pos = 0;
    let j = 0;
    for (let i = 0; i < len; i++) {
      carry = carry << 8 | from[i];
      pos += 8;
      for (; pos >= 5; pos -= 5)
        res[j++] = carry >> pos - 5 & 31;
    }
    if (pos > 0)
      res[j] = carry << 5 - pos & 31;
    return res;
  };
  const fromWords = (to) => {
    anumArr("radix2.decode", to);
    const len = to.length;
    const digits = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const w = to[i];
      if (w < 0 || w >= 32)
        throw new Error(`convertRadix2: invalid word=${w}`);
      digits[i] = w;
    }
    return _words.decode(digits);
  };
  const fromWordsUnsafe = unsafeWrapper(fromWords);
  function encode(prefix, words, limit = 90) {
    astr("bech32.encode prefix", prefix);
    if (limit !== false)
      anumber3(limit, "limit");
    if (isBytes4(words))
      words = u8ToNumArr(words);
    anumArr("bech32.encode", words);
    const plen = prefix.length;
    if (plen === 0)
      throw new TypeError(`Invalid prefix length ${plen}`);
    const actualLength = plen + 7 + words.length;
    if (limit !== false && actualLength > limit)
      throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
    assertBech32Printable("bech32.encode prefix", prefix);
    const lowered = prefix.toLowerCase();
    const sum = bechChecksum(lowered, words, ENCODING_CONST);
    return `${lowered}1${BECH_ALPHABET.encode(wordsToU8(words))}${sum}`;
  }
  function decode(str, limit = 90) {
    astr("bech32.decode input", str);
    if (limit !== false)
      anumber3(limit, "limit");
    const slen = str.length;
    if (slen < 8 || limit !== false && slen > limit)
      throw new TypeError(`invalid string length ${slen}, expected (8..${limit})`);
    const lowered = str.toLowerCase();
    if (str !== lowered) {
      if (!BECH_UPPERCASE_PRINTABLE.test(str)) {
        assertBech32Printable("bech32.decode input", str);
        throw new Error(`mixed-case string not allowed`);
      }
    }
    const sepIndex = lowered.lastIndexOf("1");
    if (sepIndex === 0 || sepIndex === -1)
      throw new Error(`invalid separator "1"`);
    const prefix = lowered.slice(0, sepIndex);
    const data = lowered.slice(sepIndex + 1);
    if (data.length < 6)
      throw new Error("invalid data length");
    const digits = BECH_ALPHABET.decode(data);
    const words = u8ToNumArr(digits, digits.length - 6);
    const sum = bechChecksum(prefix, words, ENCODING_CONST);
    if (!data.endsWith(sum))
      throw new Error(`Invalid checksum in ${str}`);
    return { prefix, words };
  }
  const decodeUnsafe = unsafeWrapper(decode);
  function decodeToBytes(str, limit = 90) {
    const { prefix, words } = decode(str, limit);
    return {
      prefix,
      words,
      bytes: fromWords(words)
    };
  }
  function encodeFromBytes(prefix, bytes) {
    return encode(prefix, toWords(bytes));
  }
  return {
    encode,
    decode,
    encodeFromBytes,
    decodeToBytes,
    decodeUnsafe,
    fromWords,
    fromWordsUnsafe,
    toWords
  };
}
var bech32 = /* @__PURE__ */ freeze(() => genBech32("bech32"));

// node_modules/@mysten/sui/dist/cryptography/keypair.mjs
var PRIVATE_KEY_SIZE = 32;
var SUI_PRIVATE_KEY_PREFIX = "suiprivkey";
var Signer = class {
  /**
  * Sign messages with a specific intent. By combining the message bytes with the intent before hashing and signing,
  * it ensures that a signed message is tied to a specific purpose and domain separator is provided
  */
  async signWithIntent(bytes, intent) {
    const digest = blake2b(messageWithIntent(intent, bytes), { dkLen: 32 });
    return {
      signature: toSerializedSignature({
        signature: await this.sign(digest),
        signatureScheme: this.getKeyScheme(),
        publicKey: this.getPublicKey()
      }),
      bytes: toBase64(bytes)
    };
  }
  /**
  * Signs provided transaction by calling `signWithIntent()` with a `TransactionData` provided as intent scope
  */
  async signTransaction(bytes) {
    return this.signWithIntent(bytes, "TransactionData");
  }
  /**
  * Signs provided personal message by calling `signWithIntent()` with a `PersonalMessage` provided as intent scope
  */
  async signPersonalMessage(bytes) {
    const { signature } = await this.signWithIntent(bcs.byteVector().serialize(bytes).toBytes(), "PersonalMessage");
    return {
      bytes: toBase64(bytes),
      signature
    };
  }
  async signAndExecuteTransaction({ transaction, client: client2 }) {
    transaction.setSenderIfNotSet(this.toSuiAddress());
    const bytes = await transaction.build({ client: client2 });
    const { signature } = await this.signTransaction(bytes);
    return client2.core.executeTransaction({
      transaction: bytes,
      signatures: [signature],
      include: {
        transaction: true,
        effects: true
      }
    });
  }
  toSuiAddress() {
    return this.getPublicKey().toSuiAddress();
  }
};
var Keypair = class extends Signer {
};
function decodeSuiPrivateKey(value) {
  const { prefix, words } = bech32.decode(value);
  if (prefix !== SUI_PRIVATE_KEY_PREFIX) throw new Error("invalid private key prefix");
  const extendedSecretKey = new Uint8Array(bech32.fromWords(words));
  const secretKey = extendedSecretKey.slice(1);
  return {
    scheme: SIGNATURE_FLAG_TO_SCHEME[extendedSecretKey[0]],
    secretKey
  };
}
function encodeSuiPrivateKey(bytes, scheme) {
  if (bytes.length !== PRIVATE_KEY_SIZE) throw new Error("Invalid bytes length");
  const flag = SIGNATURE_SCHEME_TO_FLAG[scheme];
  const privKeyBytes = new Uint8Array(bytes.length + 1);
  privKeyBytes.set([flag]);
  privKeyBytes.set(bytes, 1);
  return bech32.encode(SUI_PRIVATE_KEY_PREFIX, bech32.toWords(privKeyBytes));
}

// node_modules/@mysten/sui/dist/cryptography/slip10.mjs
var ED25519_SLIP10_MASTER_KEY = "ed25519 seed";
var HARDENED_OFFSET = 2147483648;
var MIN_SEED_LENGTH = 16;
var MAX_SEED_LENGTH = 64;
var pathRegex = /^m(\/(0|[1-9][0-9]*)')+$/;
var getMasterKeyFromSeed = (masterKey, seed) => {
  return split2(hmac(sha512, new TextEncoder().encode(masterKey), seed));
};
var CKDPriv = ({ key, chainCode }, index) => {
  const data = new Uint8Array(1 + key.length + 4);
  data.set(key, 1);
  new DataView(data.buffer).setUint32(1 + key.length, index);
  const I = hmac(sha512, chainCode, data);
  data.fill(0);
  return split2(I);
};
var split2 = (I) => {
  const node = {
    key: I.slice(0, 32),
    chainCode: I.slice(32)
  };
  I.fill(0);
  return node;
};
var wipe = ({ key, chainCode }) => {
  key.fill(0);
  chainCode.fill(0);
};
var derivePath = (masterKey, path, seed) => {
  if (!pathRegex.test(path)) throw new Error("Invalid derivation path");
  if (seed.length < MIN_SEED_LENGTH || seed.length > MAX_SEED_LENGTH) throw new Error(`Invalid seed length: expected ${MIN_SEED_LENGTH} to ${MAX_SEED_LENGTH} bytes`);
  const segments = path.split("/").slice(1).map((el) => parseInt(el.slice(0, -1), 10));
  if (segments.some((segment) => segment >= HARDENED_OFFSET)) throw new Error("Invalid derivation path");
  let node = getMasterKeyFromSeed(masterKey, seed);
  for (const segment of segments) {
    const child = CKDPriv(node, (segment | HARDENED_OFFSET) >>> 0);
    wipe(node);
    node = child;
  }
  return node;
};

// node_modules/@mysten/sui/dist/keypairs/ed25519/keypair.mjs
var DEFAULT_ED25519_DERIVATION_PATH = "m/44'/784'/0'/0'/0'";
var Ed25519Keypair = class Ed25519Keypair2 extends Keypair {
  /**
  * Create a new Ed25519 keypair instance.
  * Generate random keypair if no {@link Ed25519Keypair} is provided.
  *
  * @param keypair Ed25519 keypair
  */
  constructor(keypair) {
    super();
    if (keypair) this.keypair = {
      publicKey: keypair.publicKey,
      secretKey: keypair.secretKey.slice(0, 32)
    };
    else {
      const privateKey = ed25519.utils.randomSecretKey();
      this.keypair = {
        publicKey: ed25519.getPublicKey(privateKey),
        secretKey: privateKey
      };
    }
  }
  /**
  * Get the key scheme of the keypair ED25519
  */
  getKeyScheme() {
    return "ED25519";
  }
  /**
  * Generate a new random Ed25519 keypair
  */
  static generate() {
    const secretKey = ed25519.utils.randomSecretKey();
    return new Ed25519Keypair2({
      publicKey: ed25519.getPublicKey(secretKey),
      secretKey
    });
  }
  /**
  * Create a Ed25519 keypair from a raw secret key byte array, also known as seed.
  * This is NOT the private scalar which is result of hashing and bit clamping of
  * the raw secret key.
  *
  * @throws error if the provided secret key is invalid and validation is not skipped.
  *
  * @param secretKey secret key as a byte array or Bech32 secret key string
  * @param options: skip secret key validation
  */
  static fromSecretKey(secretKey, options) {
    if (typeof secretKey === "string") {
      const decoded = decodeSuiPrivateKey(secretKey);
      if (decoded.scheme !== "ED25519") throw new Error(`Expected a ED25519 keypair, got ${decoded.scheme}`);
      return this.fromSecretKey(decoded.secretKey, options);
    }
    const secretKeyLength = secretKey.length;
    if (secretKeyLength !== PRIVATE_KEY_SIZE) throw new Error(`Wrong secretKey size. Expected ${PRIVATE_KEY_SIZE} bytes, got ${secretKeyLength}.`);
    const keypair = {
      publicKey: ed25519.getPublicKey(secretKey),
      secretKey
    };
    if (!options || !options.skipValidation) {
      const signData = new TextEncoder().encode("sui validation");
      const signature = ed25519.sign(signData, secretKey);
      if (!ed25519.verify(signature, signData, keypair.publicKey)) throw new Error("provided secretKey is invalid");
    }
    return new Ed25519Keypair2(keypair);
  }
  /**
  * The public key for this Ed25519 keypair
  */
  getPublicKey() {
    return new Ed25519PublicKey(this.keypair.publicKey);
  }
  /**
  * The Bech32 secret key string for this Ed25519 keypair
  */
  getSecretKey() {
    return encodeSuiPrivateKey(this.keypair.secretKey.slice(0, PRIVATE_KEY_SIZE), this.getKeyScheme());
  }
  /**
  * Return the signature for the provided data using Ed25519.
  */
  async sign(data) {
    return ed25519.sign(data, this.keypair.secretKey);
  }
  /**
  * Derive Ed25519 keypair from mnemonics and path. The mnemonics must be normalized
  * and validated against the english wordlist.
  *
  * If path is none, it will default to m/44'/784'/0'/0'/0', otherwise the path must
  * be compliant to SLIP-0010 in form m/44'/784'/{account_index}'/{change_index}'/{address_index}'.
  */
  static deriveKeypair(mnemonics, path) {
    return Ed25519Keypair2.deriveKeypairFromSeed(mnemonicToSeed(mnemonics), path);
  }
  /**
  * Derive Ed25519 keypair from mnemonicSeed and path.
  *
  * If path is none, it will default to m/44'/784'/0'/0'/0', otherwise the path must
  * be compliant to SLIP-0010 in form m/44'/784'/{account_index}'/{change_index}'/{address_index}'.
  *
  * @param seed - The seed as a hex string or Uint8Array.
  */
  static deriveKeypairFromSeed(seed, path) {
    if (path == null) path = DEFAULT_ED25519_DERIVATION_PATH;
    if (!isValidHardenedPath(path)) throw new Error("Invalid derivation path");
    const { key, chainCode } = derivePath(ED25519_SLIP10_MASTER_KEY, path, typeof seed === "string" ? fromHex(seed) : seed);
    chainCode.fill(0);
    return Ed25519Keypair2.fromSecretKey(key);
  }
};

// node_modules/@mysten/sui/dist/transactions/Commands.mjs
var TransactionCommands = {
  MoveCall(input) {
    const [pkg, mod2 = "", fn = ""] = "target" in input ? input.target.split("::") : [
      input.package,
      input.module,
      input.function
    ];
    return {
      $kind: "MoveCall",
      MoveCall: {
        package: pkg,
        module: mod2,
        function: fn,
        typeArguments: input.typeArguments ?? [],
        arguments: input.arguments ?? []
      }
    };
  },
  TransferObjects(objects, address) {
    return {
      $kind: "TransferObjects",
      TransferObjects: {
        objects: objects.map((o) => parse(ArgumentSchema, o)),
        address: parse(ArgumentSchema, address)
      }
    };
  },
  SplitCoins(coin, amounts) {
    return {
      $kind: "SplitCoins",
      SplitCoins: {
        coin: parse(ArgumentSchema, coin),
        amounts: amounts.map((o) => parse(ArgumentSchema, o))
      }
    };
  },
  MergeCoins(destination, sources) {
    return {
      $kind: "MergeCoins",
      MergeCoins: {
        destination: parse(ArgumentSchema, destination),
        sources: sources.map((o) => parse(ArgumentSchema, o))
      }
    };
  },
  Publish({ modules, dependencies }) {
    return {
      $kind: "Publish",
      Publish: {
        modules: modules.map((module) => typeof module === "string" ? module : toBase64(new Uint8Array(module))),
        dependencies: dependencies.map((dep) => normalizeSuiObjectId(dep))
      }
    };
  },
  Upgrade({ modules, dependencies, package: packageId, ticket }) {
    return {
      $kind: "Upgrade",
      Upgrade: {
        modules: modules.map((module) => typeof module === "string" ? module : toBase64(new Uint8Array(module))),
        dependencies: dependencies.map((dep) => normalizeSuiObjectId(dep)),
        package: packageId,
        ticket: parse(ArgumentSchema, ticket)
      }
    };
  },
  MakeMoveVec({ type, elements }) {
    return {
      $kind: "MakeMoveVec",
      MakeMoveVec: {
        type: type ?? null,
        elements: elements.map((o) => parse(ArgumentSchema, o))
      }
    };
  },
  Intent({ name, inputs = {}, data = {} }) {
    return {
      $kind: "$Intent",
      $Intent: {
        name,
        inputs: Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, Array.isArray(value) ? value.map((o) => parse(ArgumentSchema, o)) : parse(ArgumentSchema, value)])),
        data
      }
    };
  }
};

// node_modules/@mysten/sui/dist/transactions/Inputs.mjs
function Pure(data) {
  return {
    $kind: "Pure",
    Pure: { bytes: data instanceof Uint8Array ? toBase64(data) : data.toBase64() }
  };
}
var Inputs = {
  Pure,
  ObjectRef({ objectId, digest, version }) {
    return {
      $kind: "Object",
      Object: {
        $kind: "ImmOrOwnedObject",
        ImmOrOwnedObject: {
          digest,
          version,
          objectId: normalizeSuiAddress(objectId)
        }
      }
    };
  },
  SharedObjectRef({ objectId, mutable, initialSharedVersion }) {
    return {
      $kind: "Object",
      Object: {
        $kind: "SharedObject",
        SharedObject: {
          mutable,
          initialSharedVersion,
          objectId: normalizeSuiAddress(objectId)
        }
      }
    };
  },
  ReceivingRef({ objectId, digest, version }) {
    return {
      $kind: "Object",
      Object: {
        $kind: "Receiving",
        Receiving: {
          digest,
          version,
          objectId: normalizeSuiAddress(objectId)
        }
      }
    };
  },
  FundsWithdrawal({ reservation, typeArg, withdrawFrom }) {
    return {
      $kind: "FundsWithdrawal",
      FundsWithdrawal: {
        reservation,
        typeArg,
        withdrawFrom
      }
    };
  }
};

// node_modules/@mysten/sui/dist/transactions/serializer.mjs
function parseTypeName(typeName) {
  const parts = typeName.split("::");
  if (parts.length !== 3) throw new Error(`Invalid type name format: ${typeName}`);
  return {
    package: parts[0],
    module: parts[1],
    name: parts[2]
  };
}
function isTxContext(param) {
  if (param.body.$kind !== "datatype") return false;
  const { package: pkg, module, name } = parseTypeName(param.body.datatype.typeName);
  return normalizeSuiAddress(pkg) === SUI_FRAMEWORK_ADDRESS && module === "tx_context" && name === "TxContext";
}
function getPureBcsSchema(typeSignature) {
  switch (typeSignature.$kind) {
    case "address":
      return suiBcs.Address;
    case "bool":
      return suiBcs.Bool;
    case "u8":
      return suiBcs.U8;
    case "u16":
      return suiBcs.U16;
    case "u32":
      return suiBcs.U32;
    case "u64":
      return suiBcs.U64;
    case "u128":
      return suiBcs.U128;
    case "u256":
      return suiBcs.U256;
    case "vector": {
      if (typeSignature.vector.$kind === "u8") return suiBcs.byteVector().transform({
        input: (val) => typeof val === "string" ? new TextEncoder().encode(val) : val,
        output: (val) => val
      });
      const type = getPureBcsSchema(typeSignature.vector);
      return type ? suiBcs.vector(type) : null;
    }
    case "datatype": {
      const { package: pkg, module, name } = parseTypeName(typeSignature.datatype.typeName);
      const normalizedPkg = normalizeSuiAddress(pkg);
      if (normalizedPkg === MOVE_STDLIB_ADDRESS) {
        if (module === "ascii" && name === "String") return suiBcs.String;
        if (module === "string" && name === "String") return suiBcs.String;
        if (module === "option" && name === "Option") {
          const type = getPureBcsSchema(typeSignature.datatype.typeParameters[0]);
          return type ? suiBcs.vector(type) : null;
        }
      }
      if (normalizedPkg === SUI_FRAMEWORK_ADDRESS) {
        if (module === "object" && name === "ID") return suiBcs.Address;
      }
      return null;
    }
    case "typeParameter":
    case "unknown":
      return null;
  }
}

// node_modules/@mysten/sui/dist/transactions/intents/BalanceIntentNames.mjs
var ALLOWANCE_BALANCE = "AllowanceBalance";
var COIN_WITH_BALANCE = "CoinWithBalance";

// node_modules/@mysten/sui/dist/transactions/resolution-utils.mjs
function transactionUsesGasCoin(transactionData) {
  let usesGasCoin = false;
  transactionData.mapArguments((arg) => {
    if (arg.$kind === "GasCoin") usesGasCoin = true;
    return arg;
  });
  return usesGasCoin;
}

// node_modules/@mysten/sui/dist/utils/coin-reservation.mjs
var SUI_ACCUMULATOR_ROOT_OBJECT_ID = normalizeSuiAddress("0xacc");
var ACCUMULATOR_KEY_TYPE_TAG = TypeTagSerializer.parseFromStr("0x2::accumulator::Key<0x2::balance::Balance<0x2::sui::SUI>>");
var COIN_RESERVATION_MAGIC = new Uint8Array([
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172,
  172
]);
function deriveReservationObjectId(owner, chainIdentifier) {
  const accBytes = fromHex(deriveDynamicFieldID(SUI_ACCUMULATOR_ROOT_OBJECT_ID, ACCUMULATOR_KEY_TYPE_TAG, suiBcs.Address.serialize(owner).toBytes()).slice(2));
  const chainBytes = fromBase58(chainIdentifier);
  if (chainBytes.length !== 32) throw new Error(`Invalid chain identifier length: expected 32 bytes, got ${chainBytes.length}`);
  const xored = new Uint8Array(32);
  for (let i = 0; i < 32; i++) xored[i] = accBytes[i] ^ chainBytes[i];
  return `0x${toHex(xored)}`;
}
function createCoinReservationRef(reservedBalance, owner, chainIdentifier, epoch) {
  const digestBytes = new Uint8Array(32);
  const view = new DataView(digestBytes.buffer);
  view.setBigUint64(0, reservedBalance, true);
  const epochNum = Number(epoch);
  if (!Number.isSafeInteger(epochNum) || epochNum < 0 || epochNum > 4294967295) throw new Error(`Epoch ${epoch} out of u32 range for coin reservation digest`);
  view.setUint32(8, epochNum, true);
  digestBytes.set(COIN_RESERVATION_MAGIC, 12);
  return parse(ObjectRefSchema, {
    objectId: deriveReservationObjectId(owner, chainIdentifier),
    version: "0",
    digest: toBase58(digestBytes)
  });
}

// node_modules/@mysten/sui/dist/client/core-resolver.mjs
var MAX_OBJECTS_PER_FETCH = 50;
var MAX_GAS_PAYMENT_OBJECTS = 256;
var GAS_SAFE_OVERHEAD = 1000n;
var MAX_GAS = 5e10;
function computeGasBudget(gasUsed, gasPrice = 1n) {
  const safeOverhead = GAS_SAFE_OVERHEAD * BigInt(gasPrice);
  const baseComputationCostWithOverhead = BigInt(gasUsed.computationCost) + safeOverhead;
  const gasBudget = baseComputationCostWithOverhead + BigInt(gasUsed.storageCost) - BigInt(gasUsed.storageRebate);
  return String(gasBudget > baseComputationCostWithOverhead ? gasBudget : baseComputationCostWithOverhead);
}
function getClient(options) {
  if (!options.client) throw new Error(`No sui client passed to Transaction#build, but transaction data was not sufficient to build offline.`);
  return options.client;
}
async function coreClientResolveTransactionPlugin(transactionData, options, next) {
  const client2 = getClient(options);
  const needsGasPrice = !options.onlyTransactionKind && !transactionData.gasData.price;
  const needsPayment = !options.onlyTransactionKind && !transactionData.gasData.payment;
  const gasPayer = transactionData.gasData.owner ?? transactionData.sender;
  const usesGasCoin = transactionUsesGasCoin(transactionData);
  let withdrawals = 0n;
  const normalizedGasPayer = gasPayer ? normalizeSuiAddress(gasPayer) : null;
  for (const input of transactionData.inputs) {
    if (input.$kind !== "FundsWithdrawal" || !normalizedGasPayer) continue;
    if (normalizeStructTag(input.FundsWithdrawal.typeArg.Balance) !== SUI_TYPE_ARG) continue;
    const source = input.FundsWithdrawal.withdrawFrom;
    const withdrawalOwner = source.SenderAllowance ? source.SenderAllowance.funder : source.Sender ? transactionData.sender : gasPayer;
    if (withdrawalOwner && normalizeSuiAddress(withdrawalOwner) === normalizedGasPayer && input.FundsWithdrawal.reservation.$kind === "MaxAmountU64") withdrawals += BigInt(input.FundsWithdrawal.reservation.MaxAmountU64);
  }
  const needsSimulateExpiration = !options.onlyTransactionKind && !transactionData.expiration && !transactionData.gasData.budget;
  const needsSystemState = needsGasPrice || needsPayment && usesGasCoin || needsSimulateExpiration;
  const needsChainId = needsPayment && usesGasCoin || needsSimulateExpiration;
  const [, systemStateResult, balanceResult, coinsResult, chainIdResult] = await Promise.all([
    normalizeInputs(transactionData, client2),
    needsSystemState ? client2.core.getCurrentSystemState() : null,
    needsPayment && gasPayer ? client2.core.getBalance({ owner: gasPayer }) : null,
    needsPayment && gasPayer ? client2.core.listCoins({
      owner: gasPayer,
      coinType: SUI_TYPE_ARG
    }) : null,
    needsChainId ? client2.core.getChainIdentifier() : null
  ]);
  await resolveObjectReferences(transactionData, client2);
  if (!options.onlyTransactionKind) {
    const systemState = systemStateResult?.systemState ?? null;
    const chainIdentifier = chainIdResult?.chainIdentifier ?? null;
    if (systemState && !transactionData.gasData.price) transactionData.gasData.price = systemState.referenceGasPrice;
    await setGasBudget(transactionData, client2, needsSimulateExpiration && systemState && chainIdentifier ? buildValidDuringExpiration(systemState, chainIdentifier) : void 0);
    if (needsPayment) {
      if (!balanceResult || !coinsResult) throw new Error("Could not resolve gas payment: a gas owner or sender must be set to fetch balance and coins.");
      setGasPayment({
        transactionData,
        balance: balanceResult,
        coins: coinsResult,
        usesGasCoin,
        withdrawals,
        gasPayer,
        chainIdentifier,
        epoch: systemState?.epoch ?? null
      });
    }
    if (!transactionData.expiration && transactionData.gasData.payment?.length === 0) await setExpiration(transactionData, client2, systemState, chainIdentifier);
  }
  return await next();
}
async function setGasBudget(transactionData, client2, simulateExpiration) {
  if (transactionData.gasData.budget) return;
  const simulateResult = await client2.core.simulateTransaction({
    transaction: transactionData.build({ overrides: {
      gasData: {
        budget: String(MAX_GAS),
        payment: []
      },
      ...simulateExpiration && { expiration: simulateExpiration }
    } }),
    include: { effects: true },
    doGasSelection: false
  });
  if (simulateResult.$kind === "FailedTransaction") {
    const executionError = simulateResult.FailedTransaction.status.error ?? void 0;
    throw new SimulationError(`Transaction resolution failed: ${executionError?.message ?? "Unknown error"}`, {
      cause: simulateResult,
      executionError
    });
  }
  transactionData.gasData.budget = computeGasBudget(simulateResult.Transaction.effects.gasUsed, transactionData.gasData.price ? String(transactionData.gasData.price) : void 0);
}
function setGasPayment({ transactionData, balance, coins, usesGasCoin, withdrawals, gasPayer, chainIdentifier, epoch }) {
  const budget = BigInt(transactionData.gasData.budget);
  const addressBalance = BigInt(balance.balance.addressBalance);
  if (budget === 0n || !usesGasCoin && addressBalance >= budget + withdrawals) {
    transactionData.gasData.payment = [];
    return;
  }
  const filteredCoins = coins.objects.filter((coin) => {
    return !transactionData.inputs.find((input) => {
      if (input.Object?.ImmOrOwnedObject) return coin.objectId === input.Object.ImmOrOwnedObject.objectId;
      return false;
    });
  });
  const paymentCoins = filteredCoins.map((coin) => ({
    objectId: coin.objectId,
    digest: coin.digest,
    version: coin.version
  }));
  const reservationAmount = addressBalance - withdrawals;
  if (usesGasCoin && reservationAmount > 0n && chainIdentifier && epoch) transactionData.gasData.payment = [createCoinReservationRef(reservationAmount, gasPayer, chainIdentifier, epoch), ...paymentCoins.slice(0, MAX_GAS_PAYMENT_OBJECTS - 1)];
  else if (!filteredCoins.length) throw new Error("No valid gas coins found for the transaction.");
  else transactionData.gasData.payment = paymentCoins.slice(0, MAX_GAS_PAYMENT_OBJECTS);
}
async function setExpiration(transactionData, client2, systemState, existingChainIdentifier = null) {
  const [chainIdentifier, resolvedSystemState] = await Promise.all([existingChainIdentifier ?? client2.core.getChainIdentifier().then((r) => r.chainIdentifier), systemState ?? client2.core.getCurrentSystemState().then((r) => r.systemState)]);
  transactionData.expiration = buildValidDuringExpiration(resolvedSystemState, chainIdentifier);
}
function buildValidDuringExpiration(systemState, chainIdentifier) {
  const currentEpoch = BigInt(systemState.epoch);
  return {
    $kind: "ValidDuring",
    ValidDuring: {
      minEpoch: String(currentEpoch),
      maxEpoch: String(currentEpoch + 1n),
      minTimestamp: null,
      maxTimestamp: null,
      chain: chainIdentifier,
      nonce: Math.random() * 4294967296 >>> 0
    }
  };
}
async function resolveObjectReferences(transactionData, client2) {
  const objectsToResolve = transactionData.inputs.filter((input) => {
    return input.UnresolvedObject && !(input.UnresolvedObject.version || input.UnresolvedObject?.initialSharedVersion);
  });
  const dedupedIds = [...new Set(objectsToResolve.map((input) => normalizeSuiObjectId(input.UnresolvedObject.objectId)))];
  const objectChunks = dedupedIds.length ? chunk(dedupedIds, MAX_OBJECTS_PER_FETCH) : [];
  const resolved = (await Promise.all(objectChunks.map((chunkIds) => client2.core.getObjects({ objectIds: chunkIds })))).flatMap((result) => result.objects);
  const responsesById = new Map(dedupedIds.map((id, index) => {
    return [id, resolved[index]];
  }));
  const invalidObjects = Array.from(responsesById).filter(([_, obj]) => obj instanceof Error).map(([_, obj]) => obj.message);
  if (invalidObjects.length) throw new Error(`The following input objects are invalid: ${invalidObjects.join(", ")}`);
  const objects = resolved.map((object2) => {
    if (object2 instanceof Error) throw new Error(`Failed to fetch object: ${object2.message}`);
    const owner = object2.owner;
    const initialSharedVersion = owner && typeof owner === "object" ? owner.$kind === "Shared" ? owner.Shared.initialSharedVersion : owner.$kind === "ConsensusAddressOwner" ? owner.ConsensusAddressOwner.startVersion : null : null;
    return {
      objectId: object2.objectId,
      digest: object2.digest,
      version: object2.version,
      initialSharedVersion
    };
  });
  const objectsById = new Map(dedupedIds.map((id, index) => {
    return [id, objects[index]];
  }));
  for (const [index, input] of transactionData.inputs.entries()) {
    if (!input.UnresolvedObject) continue;
    let updated;
    const id = normalizeSuiAddress(input.UnresolvedObject.objectId);
    const object2 = objectsById.get(id);
    if (input.UnresolvedObject.initialSharedVersion ?? object2?.initialSharedVersion) updated = Inputs.SharedObjectRef({
      objectId: id,
      initialSharedVersion: input.UnresolvedObject.initialSharedVersion || object2?.initialSharedVersion,
      mutable: input.UnresolvedObject.mutable || isUsedAsMutable(transactionData, index)
    });
    else if (isUsedAsReceiving(transactionData, index)) updated = Inputs.ReceivingRef({
      objectId: id,
      digest: input.UnresolvedObject.digest ?? object2?.digest,
      version: input.UnresolvedObject.version ?? object2?.version
    });
    transactionData.inputs[transactionData.inputs.indexOf(input)] = updated ?? Inputs.ObjectRef({
      objectId: id,
      digest: input.UnresolvedObject.digest ?? object2?.digest,
      version: input.UnresolvedObject.version ?? object2?.version
    });
  }
}
async function normalizeInputs(transactionData, client2) {
  const { inputs, commands } = transactionData;
  const moveCallsToResolve = [];
  const moveFunctionsToResolve = /* @__PURE__ */ new Set();
  commands.forEach((command) => {
    if (command.MoveCall) {
      if (command.MoveCall._argumentTypes) return;
      if (command.MoveCall.arguments.map((arg) => {
        if (arg.$kind === "Input") return transactionData.inputs[arg.Input];
        return null;
      }).some((input) => input?.UnresolvedPure || input?.UnresolvedObject && typeof input?.UnresolvedObject.mutable !== "boolean")) {
        const functionName = `${command.MoveCall.package}::${command.MoveCall.module}::${command.MoveCall.function}`;
        moveFunctionsToResolve.add(functionName);
        moveCallsToResolve.push(command.MoveCall);
      }
    }
  });
  const moveFunctionParameters = /* @__PURE__ */ new Map();
  if (moveFunctionsToResolve.size > 0) await Promise.all([...moveFunctionsToResolve].map(async (functionName) => {
    const [packageId, moduleName, name] = functionName.split("::");
    const { function: def } = await client2.core.getMoveFunction({
      packageId,
      moduleName,
      name
    });
    moveFunctionParameters.set(functionName, def.parameters);
  }));
  if (moveCallsToResolve.length) await Promise.all(moveCallsToResolve.map(async (moveCall) => {
    const parameters = moveFunctionParameters.get(`${moveCall.package}::${moveCall.module}::${moveCall.function}`);
    if (!parameters) return;
    moveCall._argumentTypes = parameters.length > 0 && isTxContext(parameters.at(-1)) ? parameters.slice(0, parameters.length - 1) : parameters;
  }));
  commands.forEach((command) => {
    if (!command.MoveCall) return;
    const moveCall = command.MoveCall;
    const fnName = `${moveCall.package}::${moveCall.module}::${moveCall.function}`;
    const params = moveCall._argumentTypes;
    if (!params) return;
    if (params.length !== command.MoveCall.arguments.length) throw new Error(`Incorrect number of arguments for ${fnName}`);
    params.forEach((param, i) => {
      const arg = moveCall.arguments[i];
      if (arg.$kind !== "Input") return;
      const input = inputs[arg.Input];
      if (!input.UnresolvedPure && !input.UnresolvedObject) return;
      const inputValue = input.UnresolvedPure?.value ?? input.UnresolvedObject?.objectId;
      const schema = getPureBcsSchema(param.body);
      if (schema) {
        arg.type = "pure";
        inputs[inputs.indexOf(input)] = Inputs.Pure(schema.serialize(inputValue));
        return;
      }
      if (typeof inputValue !== "string") throw new Error(`Expect the argument to be an object id string, got ${JSON.stringify(inputValue, null, 2)}`);
      arg.type = "object";
      const unresolvedObject = input.UnresolvedPure ? {
        $kind: "UnresolvedObject",
        UnresolvedObject: { objectId: inputValue }
      } : input;
      inputs[arg.Input] = unresolvedObject;
    });
  });
}
function isUsedAsMutable(transactionData, index) {
  let usedAsMutable = false;
  transactionData.getInputUses(index, (arg, tx) => {
    if (tx.MoveCall && tx.MoveCall._argumentTypes) {
      const argIndex = tx.MoveCall.arguments.indexOf(arg);
      usedAsMutable = tx.MoveCall._argumentTypes[argIndex].reference !== "immutable" || usedAsMutable;
    }
    if (tx.$kind === "MakeMoveVec" || tx.$kind === "MergeCoins" || tx.$kind === "SplitCoins" || tx.$kind === "TransferObjects") usedAsMutable = true;
  });
  return usedAsMutable;
}
function isUsedAsReceiving(transactionData, index) {
  let usedAsReceiving = false;
  transactionData.getInputUses(index, (arg, tx) => {
    if (tx.MoveCall && tx.MoveCall._argumentTypes) {
      const argIndex = tx.MoveCall.arguments.indexOf(arg);
      usedAsReceiving = isReceivingType(tx.MoveCall._argumentTypes[argIndex]) || usedAsReceiving;
    }
  });
  return usedAsReceiving;
}
var RECEIVING_TYPE = "0x0000000000000000000000000000000000000000000000000000000000000002::transfer::Receiving";
function isReceivingType(type) {
  if (type.body.$kind !== "datatype") return false;
  return type.body.datatype.typeName === RECEIVING_TYPE;
}

// node_modules/@mysten/sui/dist/transactions/resolve.mjs
function needsTransactionResolution(data, options) {
  if (data.inputs.some((input) => {
    return input.UnresolvedObject || input.UnresolvedPure;
  })) return true;
  if (!options.onlyTransactionKind) {
    if (!data.gasData.price || !data.gasData.budget) return true;
    if (!data.gasData.payment) {
      if (!(options.assumeSufficientAddressBalances && !transactionUsesGasCoin(data)) || data.expiration?.$kind !== "ValidDuring" && data.expiration?.$kind !== "Validity") return true;
    } else if (data.gasData.payment.length === 0 && !data.expiration) return true;
  }
  return false;
}
async function resolveTransactionPlugin(transactionData, options, next) {
  normalizeRawArguments(transactionData);
  if (!needsTransactionResolution(transactionData, options)) {
    if (!options.onlyTransactionKind && !transactionData.gasData.payment) transactionData.gasData.payment = [];
    await validate(transactionData);
    return next();
  }
  return (getClient2(options).core?.resolveTransactionPlugin() ?? coreClientResolveTransactionPlugin)(transactionData, options, async () => {
    await validate(transactionData);
    await next();
  });
}
function validate(transactionData) {
  transactionData.inputs.forEach((input, index) => {
    if (input.$kind !== "Object" && input.$kind !== "Pure" && input.$kind !== "FundsWithdrawal") throw new Error(`Input at index ${index} has not been resolved.  Expected a Pure, Object, or FundsWithdrawal input, but found ${JSON.stringify(input)}`);
  });
}
function getClient2(options) {
  if (!options.client) throw new Error(`No sui client passed to Transaction#build, but transaction data was not sufficient to build offline.`);
  return options.client;
}
function normalizeRawArguments(transactionData) {
  for (const command of transactionData.commands) switch (command.$kind) {
    case "SplitCoins":
      command.SplitCoins.amounts.forEach((amount) => {
        normalizeRawArgument(amount, suiBcs.U64, transactionData);
      });
      break;
    case "TransferObjects":
      normalizeRawArgument(command.TransferObjects.address, suiBcs.Address, transactionData);
      break;
  }
}
function normalizeRawArgument(arg, schema, transactionData) {
  if (arg.$kind !== "Input") return;
  const input = transactionData.inputs[arg.Input];
  if (input.$kind !== "UnresolvedPure") return;
  transactionData.inputs[arg.Input] = Inputs.Pure(schema.serialize(input.UnresolvedPure.value));
}

// node_modules/@mysten/sui/dist/transactions/intents/AllowanceBalance.mjs
var AllowanceBalanceData = object({
  objectId: string(),
  funder: optional(string()),
  appType: optional(string()),
  type: string(),
  amount: string(),
  outputKind: picklist(["coin", "balance"])
});
var AllowanceMetadata = suiBcs.struct("AllowanceMetadata", {
  id: suiBcs.Address,
  funder: suiBcs.Address,
  spender: suiBcs.option(suiBcs.Address),
  app: suiBcs.option(suiBcs.string())
});
function allowanceBalance({ allowance, amount, type = "0x2::sui::SUI", outputKind }) {
  suiBcs.U64.validate(amount);
  const objectId = normalizeSuiAddress(typeof allowance === "string" ? allowance : allowance.objectId);
  const reference = typeof allowance === "string" ? { objectId } : allowance;
  return (tx) => {
    tx.addIntentResolver(ALLOWANCE_BALANCE, resolveBalances);
    return tx.add(TransactionCommands.Intent({
      name: ALLOWANCE_BALANCE,
      inputs: {
        allowance: tx.object(objectId),
        clock: tx.object.clock(),
        ...reference.app ? { permit: tx.object(reference.app.permit) } : {}
      },
      data: {
        objectId,
        funder: reference.funder ? normalizeSuiAddress(reference.funder) : void 0,
        appType: reference.app ? normalizeStructTag(reference.app.type) : void 0,
        type: normalizeStructTag(type),
        amount: String(amount),
        outputKind
      }
    }));
  };
}
var resolveAllowanceBalance = async (transactionData, options, next) => {
  const ids = /* @__PURE__ */ new Set();
  const namedTypes = /* @__PURE__ */ new Set();
  for (const command of transactionData.commands) {
    if (command.$kind !== "$Intent" || command.$Intent.name !== ALLOWANCE_BALANCE) continue;
    const data = parse(AllowanceBalanceData, command.$Intent.data);
    if (!data.funder) ids.add(data.objectId);
    for (const type of [data.type, data.appType]) if (type && hasMvrName(type)) namedTypes.add(type);
  }
  const [resolvedTypes, objects] = await Promise.all([namedTypes.size ? getClient2(options).core.mvr.resolve({ types: [...namedTypes] }) : void 0, ids.size ? getClient2(options).core.getObjects({
    objectIds: [...ids],
    include: { content: true }
  }).then((result) => result.objects) : []]);
  const allowances = /* @__PURE__ */ new Map();
  for (const object$1 of objects) {
    if (object$1 instanceof Error) throw object$1;
    allowances.set(object$1.objectId, object$1);
  }
  for (let index = 0; index < transactionData.commands.length; index++) {
    const command = transactionData.commands[index];
    if (command.$kind !== "$Intent" || command.$Intent.name !== ALLOWANCE_BALANCE) continue;
    const data = parse(AllowanceBalanceData, command.$Intent.data);
    if (hasMvrName(data.type)) {
      const resolved = resolvedTypes?.types[data.type];
      if (!resolved) throw new Error(`No resolution found for type: ${data.type}`);
      data.type = normalizeStructTag(resolved.type);
    }
    if (data.appType && hasMvrName(data.appType)) {
      const resolved = resolvedTypes?.types[data.appType];
      if (!resolved) throw new Error(`No resolution found for type: ${data.appType}`);
      data.appType = normalizeStructTag(resolved.type);
    }
    let funder = data.funder;
    if (!funder) {
      const allowance = allowances.get(data.objectId);
      const expectedType = normalizeStructTag(`0x2::allowance::Allowance<0x2::balance::Balance<${data.type}>>`);
      if (!allowance || allowance.type !== expectedType || allowance.owner.$kind !== "Shared") throw new Error(`Expected a shared ${expectedType} allowance at ${data.objectId}`);
      const metadata = AllowanceMetadata.parse(allowance.content);
      if (metadata.app !== null && !data.appType) throw new Error(`Allowance ${data.objectId} is app-bound; pass allowance.app with the app type and SpendPermit`);
      if (data.appType && (metadata.app === null || normalizeStructTag(metadata.app) !== data.appType)) throw new Error(`Allowance ${data.objectId} is not bound to app ${data.appType}`);
      funder = metadata.funder;
      const input = command.$Intent.inputs.allowance;
      if (input.$kind === "Input") transactionData.inputs[input.Input] = Inputs.SharedObjectRef({
        objectId: data.objectId,
        initialSharedVersion: allowance.owner.Shared.initialSharedVersion,
        mutable: true
      });
    }
    const allowanceArgument = command.$Intent.inputs.allowance;
    if (allowanceArgument.$kind === "Input") {
      const input = transactionData.inputs[allowanceArgument.Input];
      if (input.Object?.SharedObject) input.Object.SharedObject.mutable = true;
      if (input.UnresolvedObject) input.UnresolvedObject.mutable = true;
    }
    const withdrawal = transactionData.addInput("withdrawal", Inputs.FundsWithdrawal({
      reservation: {
        $kind: "MaxAmountU64",
        MaxAmountU64: data.amount
      },
      typeArg: {
        $kind: "Balance",
        Balance: data.type
      },
      withdrawFrom: {
        $kind: "SenderAllowance",
        SenderAllowance: {
          funder,
          allowance: data.objectId
        }
      }
    }));
    const commands = [TransactionCommands.MoveCall({
      target: data.appType ? "0x2::allowance::app_balance_spend" : "0x2::allowance::balance_spend",
      typeArguments: data.appType ? [data.type, data.appType] : [data.type],
      arguments: [
        command.$Intent.inputs.allowance,
        ...data.appType ? [command.$Intent.inputs.permit] : [],
        withdrawal,
        command.$Intent.inputs.clock
      ]
    })];
    if (data.outputKind === "coin") commands.push(TransactionCommands.MoveCall({
      target: "0x2::coin::from_balance",
      typeArguments: [data.type],
      arguments: [{
        $kind: "Result",
        Result: index
      }]
    }));
    transactionData.replaceCommand(index, commands, { NestedResult: [index + commands.length - 1, 0] });
    index += commands.length - 1;
  }
  return next();
};

// node_modules/@mysten/sui/dist/transactions/intents/ResolveBalances.mjs
async function resolveBalances(transactionData, options, next) {
  const intents = new Set(options.intentNames ?? [ALLOWANCE_BALANCE, COIN_WITH_BALANCE]);
  const shouldResolve = (name) => intents.has(name) && !options.supportedIntents?.includes(name) && transactionData.commands.some((command) => command.$Intent?.name === name);
  if (shouldResolve(ALLOWANCE_BALANCE)) await resolveAllowanceBalance(transactionData, options, async () => {
  });
  if (shouldResolve(COIN_WITH_BALANCE)) await resolveCoinBalance(transactionData, options, async () => {
  });
  await next();
}

// node_modules/@mysten/sui/dist/transactions/intents/CoinWithBalance.mjs
var SUI_TYPE = normalizeStructTag("0x2::sui::SUI");
function coinWithBalance({ type = SUI_TYPE, balance, useGasCoin = true }) {
  let coinResult = null;
  return (tx) => {
    if (coinResult) return coinResult;
    tx.addIntentResolver(COIN_WITH_BALANCE, resolveBalances);
    const coinType = type === "gas" ? type : normalizeStructTag(type);
    coinResult = tx.add(TransactionCommands.Intent({
      name: COIN_WITH_BALANCE,
      inputs: {},
      data: {
        type: coinType === SUI_TYPE && useGasCoin ? "gas" : coinType,
        balance: BigInt(balance),
        outputKind: "coin"
      }
    }));
    return coinResult;
  };
}
function createBalance({ type = SUI_TYPE, balance, useGasCoin = true }) {
  let balanceResult = null;
  return (tx) => {
    if (balanceResult) return balanceResult;
    tx.addIntentResolver(COIN_WITH_BALANCE, resolveBalances);
    const coinType = type === "gas" ? type : normalizeStructTag(type);
    balanceResult = tx.add(TransactionCommands.Intent({
      name: COIN_WITH_BALANCE,
      inputs: {},
      data: {
        type: coinType === SUI_TYPE && useGasCoin ? "gas" : coinType,
        balance: BigInt(balance),
        outputKind: "balance"
      }
    }));
    return balanceResult;
  };
}
var CoinWithBalanceData = object({
  type: string(),
  balance: pipe(union([
    bigint(),
    string(),
    pipe(number(), integer())
  ]), transform((value) => BigInt(value))),
  outputKind: optional(picklist(["coin", "balance"]))
});
async function resolveCoinBalance(transactionData, buildOptions, next) {
  const coinTypes = /* @__PURE__ */ new Set();
  const totalByType = /* @__PURE__ */ new Map();
  const intentsByType = /* @__PURE__ */ new Map();
  if (!transactionData.sender) throw new Error("Sender must be set to resolve CoinWithBalance");
  if (transactionData.commands.some((command) => command.$Intent?.name === ALLOWANCE_BALANCE)) throw new Error("Resolve AllowanceBalance together with CoinWithBalance, or preserve both intents");
  const reservedByType = /* @__PURE__ */ new Map();
  for (const input of transactionData.inputs) {
    if (!input.FundsWithdrawal) continue;
    const { withdrawFrom, typeArg, reservation } = input.FundsWithdrawal;
    if (normalizeSuiAddress(withdrawFrom.SenderAllowance?.funder ?? (withdrawFrom.Sender ? transactionData.sender : transactionData.gasData.owner ?? transactionData.sender)) !== normalizeSuiAddress(transactionData.sender)) continue;
    const type = normalizeStructTag(typeArg.Balance);
    reservedByType.set(type, (reservedByType.get(type) ?? 0n) + BigInt(reservation.MaxAmountU64));
  }
  for (const [i, command] of transactionData.commands.entries()) {
    if (command.$kind !== "$Intent" || command.$Intent.name !== COIN_WITH_BALANCE) continue;
    const { type, balance, outputKind } = parse(CoinWithBalanceData, command.$Intent.data);
    if (balance === 0n) {
      const coinType = type === "gas" ? SUI_TYPE : type;
      transactionData.replaceCommand(i, TransactionCommands.MoveCall({
        target: (outputKind ?? "coin") === "balance" ? "0x2::balance::zero" : "0x2::coin::zero",
        typeArguments: [coinType]
      }));
      continue;
    }
    if (type !== "gas") coinTypes.add(type);
    totalByType.set(type, (totalByType.get(type) ?? 0n) + balance);
    if (!intentsByType.has(type)) intentsByType.set(type, []);
    intentsByType.get(type).push({
      balance,
      outputKind: outputKind ?? "coin"
    });
  }
  if (totalByType.has("gas") && totalByType.has(SUI_TYPE)) throw new Error("Cannot mix SUI CoinWithBalance intents that use the gas coin with ones that do not (useGasCoin: false). Use one or the other.");
  const usedIds = /* @__PURE__ */ new Set();
  for (const input of transactionData.inputs) {
    if (input.Object?.ImmOrOwnedObject) usedIds.add(input.Object.ImmOrOwnedObject.objectId);
    if (input.UnresolvedObject?.objectId) usedIds.add(input.UnresolvedObject.objectId);
  }
  const coinsByType = /* @__PURE__ */ new Map();
  const addressBalanceByType = /* @__PURE__ */ new Map();
  const client2 = buildOptions.client;
  const assumeSufficientAddressBalances = buildOptions.assumeSufficientAddressBalances;
  if (!client2 && !assumeSufficientAddressBalances) throw new Error("Client must be provided to build or serialize transactions with CoinWithBalance intents");
  if (assumeSufficientAddressBalances) for (const [coinType, balance] of totalByType) addressBalanceByType.set(coinType, balance);
  else await Promise.all([...[...coinTypes].map(async (coinType) => {
    const { coins, addressBalance } = await getCoinsAndBalanceOfType({
      coinType,
      balance: totalByType.get(coinType),
      client: client2,
      owner: transactionData.sender,
      usedIds,
      reserved: reservedByType.get(coinType) ?? 0n
    });
    coinsByType.set(coinType, coins);
    addressBalanceByType.set(coinType, addressBalance);
  }), totalByType.has("gas") ? await client2.core.getBalance({
    owner: transactionData.sender,
    coinType: SUI_TYPE
  }).then(({ balance }) => {
    addressBalanceByType.set("gas", availableAddressBalance(balance.addressBalance, reservedByType.get(SUI_TYPE) ?? 0n));
  }) : null]);
  const exactBalanceByType = /* @__PURE__ */ new Map();
  const usedAddressBalance = /* @__PURE__ */ new Set();
  const typeState = /* @__PURE__ */ new Map();
  let index = 0;
  while (index < transactionData.commands.length) {
    const transaction = transactionData.commands[index];
    if (transaction.$kind !== "$Intent" || transaction.$Intent.name !== COIN_WITH_BALANCE) {
      index++;
      continue;
    }
    const { type, balance } = parse(CoinWithBalanceData, transaction.$Intent.data);
    const coinType = type === "gas" ? SUI_TYPE : type;
    const totalRequired = totalByType.get(type);
    const addressBalance = addressBalanceByType.get(type) ?? 0n;
    const commands = [];
    let intentResult;
    const intentsForType = intentsByType.get(type) ?? [];
    if (intentsForType.every((i) => i.outputKind === "balance") && addressBalance >= totalRequired) {
      commands.push(TransactionCommands.MoveCall({
        target: "0x2::balance::redeem_funds",
        typeArguments: [coinType],
        arguments: [transactionData.addInput("withdrawal", Inputs.FundsWithdrawal({
          reservation: {
            $kind: "MaxAmountU64",
            MaxAmountU64: String(balance)
          },
          typeArg: {
            $kind: "Balance",
            Balance: coinType
          },
          withdrawFrom: {
            $kind: "Sender",
            Sender: true
          }
        }))]
      }));
      intentResult = {
        $kind: "NestedResult",
        NestedResult: [index + commands.length - 1, 0]
      };
    } else {
      if (!typeState.has(type)) {
        const intents = intentsForType;
        const sources = [];
        if (addressBalance >= totalRequired) {
          usedAddressBalance.add(type);
          commands.push(TransactionCommands.MoveCall({
            target: "0x2::coin::redeem_funds",
            typeArguments: [coinType],
            arguments: [transactionData.addInput("withdrawal", Inputs.FundsWithdrawal({
              reservation: {
                $kind: "MaxAmountU64",
                MaxAmountU64: String(totalRequired)
              },
              typeArg: {
                $kind: "Balance",
                Balance: coinType
              },
              withdrawFrom: {
                $kind: "Sender",
                Sender: true
              }
            }))]
          }));
          sources.push({
            $kind: "Result",
            Result: index + commands.length - 1
          });
        } else if (type === "gas") sources.push({
          $kind: "GasCoin",
          GasCoin: true
        });
        else {
          const coins = coinsByType.get(type);
          const loadedCoinBalance = coins.reduce((sum, c) => sum + BigInt(c.balance), 0n);
          const abNeeded = totalRequired > loadedCoinBalance ? totalRequired - loadedCoinBalance : 0n;
          exactBalanceByType.set(type, loadedCoinBalance + abNeeded === totalRequired);
          for (const coin of coins) sources.push(transactionData.addInput("object", Inputs.ObjectRef({
            objectId: coin.objectId,
            digest: coin.digest,
            version: coin.version
          })));
          if (abNeeded > 0n) {
            usedAddressBalance.add(type);
            commands.push(TransactionCommands.MoveCall({
              target: "0x2::coin::redeem_funds",
              typeArguments: [coinType],
              arguments: [transactionData.addInput("withdrawal", Inputs.FundsWithdrawal({
                reservation: {
                  $kind: "MaxAmountU64",
                  MaxAmountU64: String(abNeeded)
                },
                typeArg: {
                  $kind: "Balance",
                  Balance: coinType
                },
                withdrawFrom: {
                  $kind: "Sender",
                  Sender: true
                }
              }))]
            }));
            sources.push({
              $kind: "Result",
              Result: index + commands.length - 1
            });
          }
        }
        const baseCoin = sources[0];
        const rest = sources.slice(1);
        for (let i = 0; i < rest.length; i += 500) commands.push(TransactionCommands.MergeCoins(baseCoin, rest.slice(i, i + 500)));
        const splitCmdIndex = index + commands.length;
        commands.push(TransactionCommands.SplitCoins(baseCoin, intents.map((i) => transactionData.addInput("pure", Inputs.Pure(suiBcs.u64().serialize(i.balance))))));
        const results = [];
        for (let i = 0; i < intents.length; i++) {
          const splitResult = {
            $kind: "NestedResult",
            NestedResult: [splitCmdIndex, i]
          };
          if (intents[i].outputKind === "balance") {
            commands.push(TransactionCommands.MoveCall({
              target: "0x2::coin::into_balance",
              typeArguments: [coinType],
              arguments: [splitResult]
            }));
            results.push({
              $kind: "NestedResult",
              NestedResult: [index + commands.length - 1, 0]
            });
          } else results.push(splitResult);
        }
        if (type !== "gas" || usedAddressBalance.has(type)) {
          const hasBalanceIntent = intents.some((intent) => intent.outputKind === "balance");
          const sourcedFromAB = usedAddressBalance.has(type);
          if (hasBalanceIntent || sourcedFromAB) commands.push(TransactionCommands.MoveCall({
            target: "0x2::coin::send_funds",
            typeArguments: [coinType],
            arguments: [baseCoin, transactionData.addInput("pure", Inputs.Pure(suiBcs.Address.serialize(transactionData.sender)))]
          }));
          else if (exactBalanceByType.get(type)) commands.push(TransactionCommands.MoveCall({
            target: "0x2::coin::destroy_zero",
            typeArguments: [coinType],
            arguments: [baseCoin]
          }));
        }
        typeState.set(type, {
          results,
          nextIntent: 0
        });
      }
      const state = typeState.get(type);
      intentResult = state.results[state.nextIntent++];
    }
    transactionData.replaceCommand(index, commands, intentResult);
    index += commands.length;
  }
  return next();
}
async function getCoinsAndBalanceOfType({ coinType, balance, client: client2, owner, usedIds, reserved }) {
  let remainingBalance = balance;
  const coins = [];
  const balanceRequest = client2.core.getBalance({
    owner,
    coinType
  }).then(({ balance: balance$1 }) => {
    const addressBalance = availableAddressBalance(balance$1.addressBalance, reserved);
    remainingBalance -= addressBalance;
    return {
      ...balance$1,
      addressBalance: String(addressBalance),
      balance: String(BigInt(balance$1.balance) - reserved)
    };
  });
  const [allCoins, balanceResponse] = await Promise.all([loadMoreCoins(), balanceRequest]);
  if (BigInt(balanceResponse.balance) < balance) throw new Error(`Insufficient balance of ${coinType} for owner ${owner}. Required: ${balance}, Available: ${balance - remainingBalance}`);
  return {
    coins: allCoins,
    balance: BigInt(balanceResponse.coinBalance),
    addressBalance: BigInt(balanceResponse.addressBalance),
    coinBalance: BigInt(balanceResponse.coinBalance)
  };
  async function loadMoreCoins(cursor = null) {
    const { objects, hasNextPage, cursor: nextCursor } = await client2.core.listCoins({
      owner,
      coinType,
      cursor
    });
    await balanceRequest;
    for (const coin of objects) {
      if (usedIds.has(coin.objectId)) continue;
      coins.push(coin);
      remainingBalance -= BigInt(coin.balance);
    }
    if (remainingBalance > 0n && hasNextPage) return loadMoreCoins(nextCursor);
    return coins;
  }
}
function availableAddressBalance(balance, reserved) {
  const available = BigInt(balance) - reserved;
  if (available < 0n) throw new Error(`Insufficient address balance for existing withdrawals. Required: ${reserved}, Available: ${balance}`);
  return available;
}

// node_modules/@mysten/sui/dist/transactions/data/v2.mjs
function enumUnion(options) {
  return union(Object.entries(options).map(([key, value]) => object({ [key]: value })));
}
var Argument3 = enumUnion({
  GasCoin: literal(true),
  Input: pipe(number(), integer()),
  Result: pipe(number(), integer()),
  NestedResult: tuple([pipe(number(), integer()), pipe(number(), integer())])
});
var GasData2 = object({
  budget: nullable(JsonU64),
  price: nullable(JsonU64),
  owner: nullable(SuiAddress),
  payment: nullable(array(ObjectRefSchema))
});
var ProgrammableMoveCall2 = object({
  package: ObjectID,
  module: string(),
  function: string(),
  typeArguments: array(string()),
  arguments: array(Argument3)
});
var $Intent2 = object({
  name: string(),
  inputs: record(string(), union([Argument3, array(Argument3)])),
  data: record(string(), unknown())
});
var Command3 = enumUnion({
  MoveCall: ProgrammableMoveCall2,
  TransferObjects: object({
    objects: array(Argument3),
    address: Argument3
  }),
  SplitCoins: object({
    coin: Argument3,
    amounts: array(Argument3)
  }),
  MergeCoins: object({
    destination: Argument3,
    sources: array(Argument3)
  }),
  Publish: object({
    modules: array(BCSBytes),
    dependencies: array(ObjectID)
  }),
  MakeMoveVec: object({
    type: nullable(string()),
    elements: array(Argument3)
  }),
  Upgrade: object({
    modules: array(BCSBytes),
    dependencies: array(ObjectID),
    package: ObjectID,
    ticket: Argument3
  }),
  $Intent: $Intent2
});
var CallArg2 = enumUnion({
  Object: enumUnion({
    ImmOrOwnedObject: ObjectRefSchema,
    SharedObject: object({
      objectId: ObjectID,
      initialSharedVersion: JsonU64,
      mutable: boolean()
    }),
    Receiving: ObjectRefSchema
  }),
  Pure: object({ bytes: BCSBytes }),
  UnresolvedPure: object({ value: unknown() }),
  UnresolvedObject: object({
    objectId: ObjectID,
    version: optional(nullable(JsonU64)),
    digest: optional(nullable(string())),
    initialSharedVersion: optional(nullable(JsonU64)),
    mutable: optional(nullable(boolean()))
  }),
  FundsWithdrawal: FundsWithdrawalArgSchema
});
var TransactionExpiration5 = enumUnion({
  None: literal(true),
  Epoch: JsonU64,
  ValidDuring: ValidDuringSchema,
  Validity: ValiditySchema
});
var SerializedTransactionDataV2Schema = object({
  version: literal(2),
  sender: nullish(SuiAddress),
  expiration: nullish(TransactionExpiration5),
  gasData: GasData2,
  inputs: array(CallArg2),
  commands: array(Command3),
  digest: optional(nullable(string()))
});

// node_modules/@mysten/sui/dist/transactions/object.mjs
function createObjectMethods(makeObject) {
  function object2(value) {
    return makeObject(value);
  }
  object2.system = (options) => {
    const mutable = options?.mutable;
    if (mutable !== void 0) return object2(Inputs.SharedObjectRef({
      objectId: SUI_SYSTEM_STATE_OBJECT_ID,
      initialSharedVersion: 1,
      mutable
    }));
    return object2({
      $kind: "UnresolvedObject",
      UnresolvedObject: {
        objectId: SUI_SYSTEM_STATE_OBJECT_ID,
        initialSharedVersion: 1
      }
    });
  };
  object2.clock = () => object2(Inputs.SharedObjectRef({
    objectId: SUI_CLOCK_OBJECT_ID,
    initialSharedVersion: 1,
    mutable: false
  }));
  object2.random = () => object2({
    $kind: "UnresolvedObject",
    UnresolvedObject: {
      objectId: SUI_RANDOM_OBJECT_ID,
      mutable: false
    }
  });
  object2.denyList = (options) => {
    return object2({
      $kind: "UnresolvedObject",
      UnresolvedObject: {
        objectId: SUI_DENY_LIST_OBJECT_ID,
        mutable: options?.mutable
      }
    });
  };
  object2.option = ({ type, value }) => (tx) => tx.moveCall({
    typeArguments: [type],
    target: `${MOVE_STDLIB_ADDRESS}::option::${value === null ? "none" : "some"}`,
    arguments: value === null ? [] : [tx.object(value)]
  });
  return object2;
}

// node_modules/@mysten/sui/dist/transactions/pure.mjs
function createPure(makePure) {
  function pure(typeOrSerializedValue, value) {
    if (typeof typeOrSerializedValue === "string") return makePure(pureBcsSchemaFromTypeName(typeOrSerializedValue).serialize(value));
    if (typeOrSerializedValue instanceof Uint8Array || isSerializedBcs(typeOrSerializedValue)) return makePure(typeOrSerializedValue);
    throw new Error("tx.pure must be called either a bcs type name, or a serialized bcs value");
  }
  pure.u8 = (value) => makePure(suiBcs.U8.serialize(value));
  pure.u16 = (value) => makePure(suiBcs.U16.serialize(value));
  pure.u32 = (value) => makePure(suiBcs.U32.serialize(value));
  pure.u64 = (value) => makePure(suiBcs.U64.serialize(value));
  pure.u128 = (value) => makePure(suiBcs.U128.serialize(value));
  pure.u256 = (value) => makePure(suiBcs.U256.serialize(value));
  pure.bool = (value) => makePure(suiBcs.Bool.serialize(value));
  pure.string = (value) => makePure(suiBcs.String.serialize(value));
  pure.address = (value) => makePure(suiBcs.Address.serialize(value));
  pure.id = pure.address;
  pure.vector = (type, value) => {
    return makePure(suiBcs.vector(pureBcsSchemaFromTypeName(type)).serialize(value));
  };
  pure.option = (type, value) => {
    return makePure(suiBcs.option(pureBcsSchemaFromTypeName(type)).serialize(value));
  };
  return pure;
}

// node_modules/@mysten/sui/dist/transactions/plugins/NamedPackagesPlugin.mjs
function namedPackagesPlugin() {
  return async (transactionData, buildOptions, next) => {
    const names = findNamesInTransaction(transactionData);
    if (names.types.length === 0 && names.packages.length === 0) return next();
    if (!buildOptions.client) throw new Error(`Transaction contains MVR names but no client was provided to resolve them. Please pass a client to Transaction#build()`);
    replaceNames(transactionData, await buildOptions.client.core.mvr.resolve({
      types: names.types,
      packages: names.packages
    }));
    await next();
  };
}

// node_modules/@mysten/sui/dist/transactions/intents/BalanceOptions.mjs
function normalizeBalance(options) {
  if (options.allowance !== void 0 && options.useGasCoin !== void 0) throw new Error("useGasCoin cannot be combined with allowance");
  const amount = options.balance;
  if (typeof amount === "string" && !/^[0-9]+$/.test(amount)) throw new Error("Amount must be a non-empty string of decimal digits");
  if (typeof amount === "number" && !Number.isSafeInteger(amount)) throw new Error("Amount must be a safe integer; use bigint or a string for larger amounts");
  return BigInt(amount);
}

// node_modules/@mysten/sui/dist/transactions/Transaction.mjs
function createTransactionResult(index, length = Infinity) {
  const baseResult = {
    $kind: "Result",
    get Result() {
      return typeof index === "function" ? index() : index;
    }
  };
  const nestedResults = [];
  const nestedResultFor = (resultIndex) => nestedResults[resultIndex] ??= {
    $kind: "NestedResult",
    get NestedResult() {
      return [typeof index === "function" ? index() : index, resultIndex];
    }
  };
  return new Proxy(baseResult, {
    set() {
      throw new Error("The transaction result is a proxy, and does not support setting properties directly");
    },
    get(target, property) {
      if (property in target) return Reflect.get(target, property);
      if (property === Symbol.iterator) return function* () {
        let i = 0;
        while (i < length) {
          yield nestedResultFor(i);
          i++;
        }
      };
      if (typeof property === "symbol") return;
      const resultIndex = parseInt(property, 10);
      if (Number.isNaN(resultIndex) || resultIndex < 0) return;
      return nestedResultFor(resultIndex);
    }
  });
}
var TRANSACTION_BRAND = /* @__PURE__ */ Symbol.for("@mysten/transaction");
var Transaction2 = class Transaction3 {
  #serializationPlugins;
  #buildPlugins;
  #intentResolvers = /* @__PURE__ */ new Map();
  #inputSection = [];
  #commandSection = [];
  #availableResults = /* @__PURE__ */ new Set();
  #pendingPromises = /* @__PURE__ */ new Set();
  #added = /* @__PURE__ */ new Map();
  /**
  * Converts from a serialize transaction kind (built with `build({ onlyTransactionKind: true })`) to a `Transaction` class.
  * Supports either a byte array, or base64-encoded bytes.
  */
  static fromKind(serialized) {
    const tx = new Transaction3();
    tx.#data = TransactionDataBuilder.fromKindBytes(typeof serialized === "string" ? fromBase64(serialized) : serialized);
    tx.#inputSection = tx.#data.inputs.slice();
    tx.#commandSection = tx.#data.commands.slice();
    tx.#availableResults = new Set(tx.#commandSection.map((_, i) => i));
    return tx;
  }
  /**
  * Converts from a serialized transaction format to a `Transaction` class.
  * There are two supported serialized formats:
  * - A string returned from `Transaction#serialize`. The serialized format must be compatible, or it will throw an error.
  * - A byte array (or base64-encoded bytes) containing BCS transaction data.
  *
  * It can also copy an existing `Transaction` or `TransactionDataBuilder` instance. The data is
  * copied, so changes to the new transaction do not affect the original.
  *
  * When copying an in-memory transaction that uses custom intents, pass resolvers for those intents
  * via `options.intentResolvers` so the copy can be created synchronously without first awaiting
  * `prepareForSerialization`. Built-in intents (such as `CoinWithBalance`) are handled automatically.
  */
  static from(transaction, options = {}) {
    const newTransaction = new Transaction3();
    if (typeof transaction === "object" && "getData" in transaction) newTransaction.#data = TransactionDataBuilder.restore(transaction.getData());
    else if (typeof transaction !== "string" || !transaction.startsWith("{")) newTransaction.#data = TransactionDataBuilder.fromBytes(typeof transaction === "string" ? fromBase64(transaction) : transaction);
    else newTransaction.#data = TransactionDataBuilder.restore(JSON.parse(transaction));
    newTransaction.#inputSection = newTransaction.#data.inputs.slice();
    newTransaction.#commandSection = newTransaction.#data.commands.slice();
    newTransaction.#availableResults = new Set(newTransaction.#commandSection.map((_, i) => i));
    const intentResolvers = new Map([
      [COIN_WITH_BALANCE, resolveBalances],
      [ALLOWANCE_BALANCE, resolveBalances],
      ...Object.entries(options.intentResolvers ?? {})
    ]);
    if (!newTransaction.isPreparedForSerialization({ supportedIntents: [...intentResolvers.keys()] })) throw new Error("Transaction has unresolved intents or async thunks. Provide resolvers for any custom intents via the `intentResolvers` option, or call `prepareForSerialization` before copying.");
    for (const [intent, resolver] of intentResolvers) newTransaction.addIntentResolver(intent, resolver);
    return newTransaction;
  }
  addSerializationPlugin(step) {
    this.#serializationPlugins.push(step);
  }
  addBuildPlugin(step) {
    this.#buildPlugins.push(step);
  }
  addIntentResolver(intent, resolver) {
    if (this.#intentResolvers.has(intent) && this.#intentResolvers.get(intent) !== resolver) throw new Error(`Intent resolver for ${intent} already exists`);
    this.#intentResolvers.set(intent, resolver);
  }
  setSender(sender) {
    this.#data.sender = sender;
  }
  /**
  * Sets the sender only if it has not already been set.
  * This is useful for sponsored transaction flows where the sender may not be the same as the signer address.
  */
  setSenderIfNotSet(sender) {
    if (!this.#data.sender) this.#data.sender = sender;
  }
  setExpiration(expiration) {
    this.#data.expiration = expiration ? parse(TransactionExpiration2, expiration) : null;
  }
  setGasPrice(price) {
    this.#data.gasData.price = String(price);
  }
  setGasBudget(budget) {
    this.#data.gasData.budget = String(budget);
  }
  setGasBudgetIfNotSet(budget) {
    if (this.#data.gasData.budget == null) this.#data.gasData.budget = String(budget);
  }
  setGasOwner(owner) {
    this.#data.gasData.owner = owner;
  }
  setGasPayment(payments) {
    this.#data.gasData.payment = payments.map((payment) => parse(ObjectRefSchema, payment));
  }
  #data;
  /** Get a snapshot of the transaction data, in JSON form: */
  getData() {
    return this.#data.snapshot();
  }
  get [TRANSACTION_BRAND]() {
    return true;
  }
  get pure() {
    Object.defineProperty(this, "pure", {
      enumerable: false,
      value: createPure((value) => {
        if (isSerializedBcs(value)) return this.#addInput("pure", {
          $kind: "Pure",
          Pure: { bytes: value.toBase64() }
        });
        return this.#addInput("pure", is(NormalizedCallArg, value) ? parse(NormalizedCallArg, value) : value instanceof Uint8Array ? Inputs.Pure(value) : {
          $kind: "UnresolvedPure",
          UnresolvedPure: { value }
        });
      })
    });
    return this.pure;
  }
  constructor() {
    this.object = createObjectMethods((value) => {
      if (typeof value === "function") return this.object(this.add(value));
      if (typeof value === "object" && is(ArgumentSchema, value)) return value;
      const id = getIdFromCallArg(value);
      const inserted = this.#data.inputs.find((i) => id === getIdFromCallArg(i));
      if (inserted?.Object?.SharedObject && typeof value === "object" && value.Object?.SharedObject) inserted.Object.SharedObject.mutable = inserted.Object.SharedObject.mutable || value.Object.SharedObject.mutable;
      return inserted ? {
        $kind: "Input",
        Input: this.#data.inputs.indexOf(inserted),
        type: "object"
      } : this.#addInput("object", typeof value === "string" ? {
        $kind: "UnresolvedObject",
        UnresolvedObject: { objectId: normalizeSuiAddress(value) }
      } : value);
    });
    this.#data = new TransactionDataBuilder();
    this.#buildPlugins = [];
    this.#serializationPlugins = [];
  }
  /** Returns an argument for the gas coin, to be used in a transaction. */
  get gas() {
    return {
      $kind: "GasCoin",
      GasCoin: true
    };
  }
  /**
  * Creates a Coin<T> of the specified type and amount (defaults to SUI).
  * Sourced from address balance when available, falling back to owned coins. For SUI, falls back
  * to the gas coin instead unless `useGasCoin` is `false`.
  * With `allowance`, spends only from the funder's address balance under that allowance.
  * Allowance IDs are resolved using the build client; app-bound allowances also require an app type and SpendPermit.
  */
  coin(options) {
    const amount = normalizeBalance(options);
    return this.add(options.allowance !== void 0 ? allowanceBalance({
      ...options,
      amount,
      outputKind: "coin"
    }) : coinWithBalance({
      ...options,
      balance: amount
    }));
  }
  /**
  * Creates a Balance<T> of the specified type and amount (defaults to SUI).
  * Sourced from address balance when available, falling back to owned coins. For SUI, falls back
  * to the gas coin instead unless `useGasCoin` is `false`.
  * With `allowance`, spends only from the funder's address balance under that allowance.
  * Allowance IDs are resolved using the build client; app-bound allowances also require an app type and SpendPermit.
  */
  balance(options) {
    const amount = normalizeBalance(options);
    return this.add(options.allowance !== void 0 ? allowanceBalance({
      ...options,
      amount,
      outputKind: "balance"
    }) : createBalance({
      ...options,
      balance: amount
    }));
  }
  /**
  * Add a new object input to the transaction using the fully-resolved object reference.
  * If you only have an object ID, use `builder.object(id)` instead.
  */
  objectRef(...args) {
    return this.object(Inputs.ObjectRef(...args));
  }
  /**
  * Add a new receiving input to the transaction using the fully-resolved object reference.
  * If you only have an object ID, use `builder.object(id)` instead.
  */
  receivingRef(...args) {
    return this.object(Inputs.ReceivingRef(...args));
  }
  /**
  * Add a new shared object input to the transaction using the fully-resolved shared object reference.
  * If you only have an object ID, use `builder.object(id)` instead.
  */
  sharedObjectRef(...args) {
    return this.object(Inputs.SharedObjectRef(...args));
  }
  #fork() {
    const fork = new Transaction3();
    fork.#data = this.#data;
    fork.#serializationPlugins = this.#serializationPlugins;
    fork.#buildPlugins = this.#buildPlugins;
    fork.#intentResolvers = this.#intentResolvers;
    fork.#pendingPromises = this.#pendingPromises;
    fork.#availableResults = new Set(this.#availableResults);
    fork.#added = this.#added;
    this.#inputSection.push(fork.#inputSection);
    this.#commandSection.push(fork.#commandSection);
    return fork;
  }
  add(command) {
    if (typeof command === "function") {
      if (this.#added.has(command)) return this.#added.get(command);
      const fork = this.#fork();
      const result = command(fork);
      if (!(result && typeof result === "object" && "then" in result)) {
        this.#availableResults = fork.#availableResults;
        this.#added.set(command, result);
        return result;
      }
      const placeholder = this.#addCommand({
        $kind: "$Intent",
        $Intent: {
          name: "AsyncTransactionThunk",
          inputs: {},
          data: {
            resultIndex: this.#data.commands.length,
            result: null
          }
        }
      });
      this.#pendingPromises.add(Promise.resolve(result).then((result$1) => {
        placeholder.$Intent.data.result = result$1;
      }));
      const txResult = createTransactionResult(() => placeholder.$Intent.data.resultIndex);
      this.#added.set(command, txResult);
      return txResult;
    } else this.#addCommand(command);
    return createTransactionResult(this.#data.commands.length - 1);
  }
  #addCommand(command) {
    const resultIndex = this.#data.commands.length;
    this.#commandSection.push(command);
    this.#availableResults.add(resultIndex);
    this.#data.commands.push(command);
    this.#data.mapCommandArguments(resultIndex, (arg) => {
      if (arg.$kind === "Result" && !this.#availableResults.has(arg.Result)) throw new Error(`Result { Result: ${arg.Result} } is not available to use in the current transaction`);
      if (arg.$kind === "NestedResult" && !this.#availableResults.has(arg.NestedResult[0])) throw new Error(`Result { NestedResult: [${arg.NestedResult[0]}, ${arg.NestedResult[1]}] } is not available to use in the current transaction`);
      if (arg.$kind === "Input" && arg.Input >= this.#data.inputs.length) throw new Error(`Input { Input: ${arg.Input} } references an input that does not exist in the current transaction`);
      return arg;
    });
    return command;
  }
  #addInput(type, input) {
    this.#inputSection.push(input);
    return this.#data.addInput(type, input);
  }
  #normalizeTransactionArgument(arg) {
    if (isSerializedBcs(arg)) return this.pure(arg);
    return this.#resolveArgument(arg);
  }
  #resolveArgument(arg) {
    if (typeof arg === "function") {
      const resolved = this.add(arg);
      if (typeof resolved === "function") return this.#resolveArgument(resolved);
      return parse(ArgumentSchema, resolved);
    }
    return parse(ArgumentSchema, arg);
  }
  splitCoins(coin, amounts) {
    const command = TransactionCommands.SplitCoins(typeof coin === "string" ? this.object(coin) : this.#resolveArgument(coin), amounts.map((amount) => typeof amount === "number" || typeof amount === "bigint" || typeof amount === "string" ? this.pure.u64(amount) : this.#normalizeTransactionArgument(amount)));
    this.#addCommand(command);
    return createTransactionResult(this.#data.commands.length - 1, amounts.length);
  }
  mergeCoins(destination, sources) {
    return this.add(TransactionCommands.MergeCoins(this.object(destination), sources.map((src) => this.object(src))));
  }
  publish({ modules, dependencies }) {
    return this.add(TransactionCommands.Publish({
      modules,
      dependencies
    }));
  }
  upgrade({ modules, dependencies, package: packageId, ticket }) {
    return this.add(TransactionCommands.Upgrade({
      modules,
      dependencies,
      package: packageId,
      ticket: this.object(ticket)
    }));
  }
  moveCall({ arguments: args, ...input }) {
    return this.add(TransactionCommands.MoveCall({
      ...input,
      arguments: args?.map((arg) => this.#normalizeTransactionArgument(arg))
    }));
  }
  transferObjects(objects, address) {
    return this.add(TransactionCommands.TransferObjects(objects.map((obj) => this.object(obj)), typeof address === "string" ? this.pure.address(address) : this.#normalizeTransactionArgument(address)));
  }
  makeMoveVec({ type, elements }) {
    return this.add(TransactionCommands.MakeMoveVec({
      type,
      elements: elements.map((obj) => this.object(obj))
    }));
  }
  /**
  * Creates a FundsWithdrawal input for withdrawing Balance<T> from an address balance.
  *
  * @param options.amount - The amount to withdraw (u64).
  * @param options.type - The coin type T (e.g., "0x2::sui::SUI"), not Balance<T>. Defaults to SUI.
  * @param options.from - The withdrawal source. Defaults to the transaction sender.
  * @param options.allowance - The allowance ID, required when from is 'allowance'.
  * @param options.funder - The funder's address, required when from is 'allowance'.
  */
  withdrawal(options) {
    const input = {
      $kind: "FundsWithdrawal",
      FundsWithdrawal: {
        reservation: {
          $kind: "MaxAmountU64",
          MaxAmountU64: String(options.amount)
        },
        typeArg: {
          $kind: "Balance",
          Balance: options.type ?? "0x2::sui::SUI"
        },
        withdrawFrom: options.from === "allowance" ? {
          $kind: "SenderAllowance",
          SenderAllowance: {
            funder: normalizeSuiAddress(options.funder),
            allowance: normalizeSuiAddress(options.allowance)
          }
        } : options.from === "sponsor" ? {
          $kind: "Sponsor",
          Sponsor: true
        } : {
          $kind: "Sender",
          Sender: true
        }
      }
    };
    return this.#addInput("object", input);
  }
  /**
  * @deprecated Use toJSON instead.
  * For synchronous serialization, you can use `getData()`
  * */
  serialize() {
    return JSON.stringify(serializeV1TransactionData(this.#data.snapshot()));
  }
  async toJSON(options = {}) {
    await this.prepareForSerialization(options);
    const fullyResolved = this.isFullyResolved();
    return JSON.stringify(parse(SerializedTransactionDataV2Schema, fullyResolved ? {
      ...this.#data.snapshot(),
      digest: this.#data.getDigest()
    } : this.#data.snapshot()), (_key, value) => typeof value === "bigint" ? value.toString() : value, 2);
  }
  /** Build the transaction to BCS bytes, and sign it with the provided keypair. */
  async sign(options) {
    const { signer, ...buildOptions } = options;
    const bytes = await this.build(buildOptions);
    return signer.signTransaction(bytes);
  }
  /**
  * Checks if the transaction is prepared for serialization to JSON.
  * This means:
  *  - All async thunks have been fully resolved
  *  - All transaction intents have been resolved (unless in supportedIntents)
  *
  * Unlike `isFullyResolved()`, this does not require the sender, gas payment,
  * budget, or object versions to be set.
  */
  isPreparedForSerialization(options = {}) {
    if (this.#pendingPromises.size > 0) return false;
    if (this.#data.commands.some((cmd) => cmd.$Intent && !options.supportedIntents?.includes(cmd.$Intent.name))) return false;
    return true;
  }
  /**
  *  Ensures that:
  *  - All objects have been fully resolved to a specific version
  *  - All pure inputs have been serialized to bytes
  *  - All async thunks have been fully resolved
  *  - All transaction intents have been resolved
  * 	- The gas payment, budget, and price have been set
  *  - The transaction sender has been set
  *
  *  When true, the transaction will always be built to the same bytes and digest (unless the transaction is mutated)
  */
  isFullyResolved() {
    if (!this.isPreparedForSerialization()) return false;
    if (!this.#data.sender) return false;
    if (needsTransactionResolution(this.#data, {})) return false;
    return true;
  }
  /** Build the transaction to BCS bytes. */
  async build(options = {}) {
    await this.prepareForSerialization(options);
    await this.#prepareBuild(options);
    return this.#data.build({ onlyTransactionKind: options.onlyTransactionKind });
  }
  /** Derive transaction digest */
  async getDigest(options = {}) {
    await this.prepareForSerialization(options);
    await this.#prepareBuild(options);
    return this.#data.getDigest();
  }
  /**
  * Prepare the transaction by validating the transaction data and resolving all inputs
  * so that it can be built into bytes.
  */
  async #prepareBuild(options) {
    if (!options.onlyTransactionKind && !this.#data.sender) throw new Error("Missing transaction sender");
    await this.#runPlugins([...this.#buildPlugins, resolveTransactionPlugin], options);
  }
  async #runPlugins(plugins, options) {
    try {
      const createNext = (i) => {
        if (i >= plugins.length) return () => {
        };
        const plugin = plugins[i];
        return async () => {
          const next = createNext(i + 1);
          let calledNext = false;
          let nextResolved = false;
          await plugin(this.#data, options, async () => {
            if (calledNext) throw new Error(`next() was call multiple times in TransactionPlugin ${i}`);
            calledNext = true;
            await next();
            nextResolved = true;
          });
          if (!calledNext) throw new Error(`next() was not called in TransactionPlugin ${i}`);
          if (!nextResolved) throw new Error(`next() was not awaited in TransactionPlugin ${i}`);
        };
      };
      await createNext(0)();
    } finally {
      this.#inputSection = this.#data.inputs.slice();
      this.#commandSection = this.#data.commands.slice();
      this.#availableResults = new Set(this.#commandSection.map((_, i) => i));
    }
  }
  async #waitForPendingTasks() {
    while (this.#pendingPromises.size > 0) {
      const newPromise = Promise.all(this.#pendingPromises);
      this.#pendingPromises.clear();
      this.#pendingPromises.add(newPromise);
      await newPromise;
      this.#pendingPromises.delete(newPromise);
    }
  }
  #sortCommandsAndInputs() {
    const unorderedCommands = this.#data.commands;
    const unorderedInputs = this.#data.inputs;
    const orderedCommands = this.#commandSection.flat(Infinity);
    const orderedInputs = this.#inputSection.flat(Infinity);
    if (orderedCommands.length !== unorderedCommands.length) throw new Error("Unexpected number of commands found in transaction data");
    if (orderedInputs.length !== unorderedInputs.length) throw new Error("Unexpected number of inputs found in transaction data");
    const filteredCommands = orderedCommands.filter((cmd) => cmd.$Intent?.name !== "AsyncTransactionThunk");
    this.#data.commands = filteredCommands;
    this.#data.inputs = orderedInputs;
    this.#commandSection = filteredCommands;
    this.#inputSection = orderedInputs;
    this.#availableResults = new Set(filteredCommands.map((_, i) => i));
    function getOriginalIndex(index) {
      const command = unorderedCommands[index];
      if (command.$Intent?.name === "AsyncTransactionThunk") {
        const result = command.$Intent.data.result;
        if (result == null) throw new Error("AsyncTransactionThunk has not been resolved");
        return getOriginalIndex(result.Result);
      }
      const updated = filteredCommands.indexOf(command);
      if (updated === -1) throw new Error("Unable to find original index for command");
      return updated;
    }
    this.#data.mapArguments((arg) => {
      if (arg.$kind === "Input") {
        const updated = orderedInputs.indexOf(unorderedInputs[arg.Input]);
        if (updated === -1) throw new Error("Input has not been resolved");
        return {
          ...arg,
          Input: updated
        };
      } else if (arg.$kind === "Result") {
        const updated = getOriginalIndex(arg.Result);
        return {
          ...arg,
          Result: updated
        };
      } else if (arg.$kind === "NestedResult") {
        const updated = getOriginalIndex(arg.NestedResult[0]);
        return {
          ...arg,
          NestedResult: [updated, arg.NestedResult[1]]
        };
      }
      return arg;
    });
    for (const [i, cmd] of unorderedCommands.entries()) if (cmd.$Intent?.name === "AsyncTransactionThunk") try {
      cmd.$Intent.data.resultIndex = getOriginalIndex(i);
    } catch {
    }
  }
  async prepareForSerialization(options) {
    await this.#waitForPendingTasks();
    this.#sortCommandsAndInputs();
    const intents = /* @__PURE__ */ new Set();
    for (const command of this.#data.commands) if (command.$Intent) intents.add(command.$Intent.name);
    const steps = [...this.#serializationPlugins];
    const resolverIntents = /* @__PURE__ */ new Map();
    for (const intent of intents) {
      if (options.supportedIntents?.includes(intent)) continue;
      const resolver = this.#intentResolvers.get(intent);
      if (!resolver) throw new Error(`Missing intent resolver for ${intent}`);
      const names = resolverIntents.get(resolver) ?? [];
      names.push(intent);
      resolverIntents.set(resolver, names);
    }
    for (const [resolver, intentNames] of resolverIntents) steps.push((data, buildOptions, next) => {
      return resolver(data, {
        ...buildOptions,
        intentNames
      }, next);
    });
    steps.push(namedPackagesPlugin());
    await this.#runPlugins(steps, options);
  }
};

// keeper.mjs
var RPC = process.env.RIVERS_RPC || "http://127.0.0.1:9000";
var CONFIG = process.env.RIVERS_DEX_CONFIG || "./dex.json";
var KEY = process.env.RIVERS_DEX_KEY || "./dex-key.txt";
var client = new SuiGrpcClient({ network: "testnet", baseUrl: RPC });
var log = (...a) => console.log((/* @__PURE__ */ new Date()).toISOString(), ...a);
async function round() {
  if (!existsSync(CONFIG) || !existsSync(KEY)) return;
  const cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
  if (!cfg.lend || !cfg.package) return;
  const kp = Ed25519Keypair.fromSecretKey(readFileSync(KEY, "utf8").trim());
  const tx = new Transaction2();
  tx.setSender(kp.toSuiAddress());
  const pools = Object.values(cfg.pools || {});
  for (const m of Object.values(cfg.lend)) {
    const p = pools.find((x) => x.id === m.pool);
    if (!p) continue;
    tx.moveCall({ target: cfg.package + "::lend::observe", typeArguments: [m.collateral, m.debt, p.a, p.b], arguments: [tx.object(m.id), tx.object(m.pool), tx.object("0x6")] });
  }
  if (!tx.getData().commands.length) return;
  try {
    const r = await client.signAndExecuteTransaction({ transaction: tx, signer: kp });
    const t = r.Transaction || r.FailedTransaction;
    if (!t.status?.success) log("observe failed", JSON.stringify(t.status?.error));
  } catch (e) {
    log("observe", e.message);
  }
}
log("Rivers keeper started");
round();
setInterval(round, 12e4);
/*! Bundled license information:

@noble/curves/utils.js:
@noble/curves/abstract/modular.js:
@noble/curves/abstract/curve.js:
@noble/curves/abstract/edwards.js:
@noble/curves/ed25519.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/bip39/index.js:
  (*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)

@scure/base/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
