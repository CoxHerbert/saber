import G from "dayjs";
import { inject as ue, computed as j, defineComponent as X, openBlock as O, createElementBlock as D, Fragment as Q, renderList as ee, unref as C, normalizeStyle as $, renderSlot as H, createElementVNode as M, toDisplayString as N, createTextVNode as ne, createCommentVNode as V, ref as I, getCurrentScope as Je, onScopeDispose as et, getCurrentInstance as tt, onMounted as $e, nextTick as nt, watch as _e, toRefs as le, useSlots as rt, provide as ie, normalizeClass as re, createBlock as te, withCtx as q, withModifiers as at, mergeProps as ot, createVNode as Ce, TransitionGroup as st } from "vue";
var K = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, it = { exports: {} };
(function(t, u) {
  (function(n, o) {
    t.exports = o(G);
  })(K, function(n) {
    function o(s) {
      return s && typeof s == "object" && "default" in s ? s : { default: s };
    }
    var g = o(n), l = { name: "zh-cn", weekdays: "\u661F\u671F\u65E5_\u661F\u671F\u4E00_\u661F\u671F\u4E8C_\u661F\u671F\u4E09_\u661F\u671F\u56DB_\u661F\u671F\u4E94_\u661F\u671F\u516D".split("_"), weekdaysShort: "\u5468\u65E5_\u5468\u4E00_\u5468\u4E8C_\u5468\u4E09_\u5468\u56DB_\u5468\u4E94_\u5468\u516D".split("_"), weekdaysMin: "\u65E5_\u4E00_\u4E8C_\u4E09_\u56DB_\u4E94_\u516D".split("_"), months: "\u4E00\u6708_\u4E8C\u6708_\u4E09\u6708_\u56DB\u6708_\u4E94\u6708_\u516D\u6708_\u4E03\u6708_\u516B\u6708_\u4E5D\u6708_\u5341\u6708_\u5341\u4E00\u6708_\u5341\u4E8C\u6708".split("_"), monthsShort: "1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708".split("_"), ordinal: function(s, e) {
      return e === "W" ? s + "\u5468" : s + "\u65E5";
    }, weekStart: 1, yearStart: 4, formats: { LT: "HH:mm", LTS: "HH:mm:ss", L: "YYYY/MM/DD", LL: "YYYY\u5E74M\u6708D\u65E5", LLL: "YYYY\u5E74M\u6708D\u65E5Ah\u70B9mm\u5206", LLLL: "YYYY\u5E74M\u6708D\u65E5ddddAh\u70B9mm\u5206", l: "YYYY/M/D", ll: "YYYY\u5E74M\u6708D\u65E5", lll: "YYYY\u5E74M\u6708D\u65E5 HH:mm", llll: "YYYY\u5E74M\u6708D\u65E5dddd HH:mm" }, relativeTime: { future: "%s\u5185", past: "%s\u524D", s: "\u51E0\u79D2", m: "1 \u5206\u949F", mm: "%d \u5206\u949F", h: "1 \u5C0F\u65F6", hh: "%d \u5C0F\u65F6", d: "1 \u5929", dd: "%d \u5929", M: "1 \u4E2A\u6708", MM: "%d \u4E2A\u6708", y: "1 \u5E74", yy: "%d \u5E74" }, meridiem: function(s, e) {
      var a = 100 * s + e;
      return a < 600 ? "\u51CC\u6668" : a < 900 ? "\u65E9\u4E0A" : a < 1100 ? "\u4E0A\u5348" : a < 1300 ? "\u4E2D\u5348" : a < 1800 ? "\u4E0B\u5348" : "\u665A\u4E0A";
    } };
    return g.default.locale(l, null, !0), l;
  });
})(it);
var Se = { exports: {} };
(function(t, u) {
  (function(n, o) {
    t.exports = o();
  })(K, function() {
    var n = "day";
    return function(o, g, l) {
      var s = function(r) {
        return r.add(4 - r.isoWeekday(), n);
      }, e = g.prototype;
      e.isoWeekYear = function() {
        return s(this).year();
      }, e.isoWeek = function(r) {
        if (!this.$utils().u(r))
          return this.add(7 * (r - this.isoWeek()), n);
        var i, f, c, m, _ = s(this), h = (i = this.isoWeekYear(), f = this.$u, c = (f ? l.utc : l)().year(i).startOf("year"), m = 4 - c.isoWeekday(), c.isoWeekday() > 4 && (m += 7), c.add(m, n));
        return _.diff(h, "week") + 1;
      }, e.isoWeekday = function(r) {
        return this.$utils().u(r) ? this.day() || 7 : this.day(this.day() % 7 ? r : r - 7);
      };
      var a = e.startOf;
      e.startOf = function(r, i) {
        var f = this.$utils(), c = !!f.u(i) || i;
        return f.p(r) === "isoweek" ? c ? this.date(this.date() - (this.isoWeekday() - 1)).startOf("day") : this.date(this.date() - 1 - (this.isoWeekday() - 1) + 7).endOf("day") : a.bind(this)(r, i);
      };
    };
  });
})(Se);
const lt = Se.exports;
var Ge = { exports: {} };
(function(t, u) {
  (function(n, o) {
    t.exports = o();
  })(K, function() {
    return function(n, o) {
      o.prototype.isSameOrBefore = function(g, l) {
        return this.isSame(g, l) || this.isBefore(g, l);
      };
    };
  });
})(Ge);
const ut = Ge.exports;
var He = { exports: {} };
(function(t, u) {
  (function(n, o) {
    t.exports = o();
  })(K, function() {
    return function(n, o) {
      o.prototype.isSameOrAfter = function(g, l) {
        return this.isSame(g, l) || this.isAfter(g, l);
      };
    };
  });
})(He);
const ct = He.exports;
var Ie = { exports: {} };
(function(t, u) {
  (function(n, o) {
    t.exports = o();
  })(K, function() {
    return function(n, o, g) {
      o.prototype.isBetween = function(l, s, e, a) {
        var r = g(l), i = g(s), f = (a = a || "()")[0] === "(", c = a[1] === ")";
        return (f ? this.isAfter(r, e) : !this.isBefore(r, e)) && (c ? this.isBefore(i, e) : !this.isAfter(i, e)) || (f ? this.isBefore(r, e) : !this.isAfter(r, e)) && (c ? this.isAfter(i, e) : !this.isBefore(i, e));
      };
    };
  });
})(Ie);
const dt = Ie.exports;
var Re = { exports: {} };
(function(t, u) {
  (function(n, o) {
    t.exports = o();
  })(K, function() {
    var n = "week", o = "year";
    return function(g, l, s) {
      var e = l.prototype;
      e.week = function(a) {
        if (a === void 0 && (a = null), a !== null)
          return this.add(7 * (a - this.week()), "day");
        var r = this.$locale().yearStart || 1;
        if (this.month() === 11 && this.date() > 25) {
          var i = s(this).startOf(o).add(1, o).date(r), f = s(this).endOf(n);
          if (i.isBefore(f))
            return 1;
        }
        var c = s(this).startOf(o).date(r).startOf(n).subtract(1, "millisecond"), m = this.diff(c, n, !0);
        return m < 0 ? s(this).startOf("week").week() : Math.ceil(m);
      }, e.weeks = function(a) {
        return a === void 0 && (a = null), this.week(a);
      };
    };
  });
})(Re);
const ft = Re.exports;
var We = { exports: {} };
(function(t, u) {
  (function(n, o) {
    t.exports = o();
  })(K, function() {
    return function(n, o, g) {
      var l = o.prototype, s = l.format;
      g.en.ordinal = function(e) {
        var a = ["th", "st", "nd", "rd"], r = e % 100;
        return "[" + e + (a[(r - 20) % 10] || a[r] || a[0]) + "]";
      }, l.format = function(e) {
        var a = this, r = this.$locale();
        if (!this.isValid())
          return s.bind(this)(e);
        var i = this.$utils(), f = (e || "YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g, function(c) {
          switch (c) {
            case "Q":
              return Math.ceil((a.$M + 1) / 3);
            case "Do":
              return r.ordinal(a.$D);
            case "gggg":
              return a.weekYear();
            case "GGGG":
              return a.isoWeekYear();
            case "wo":
              return r.ordinal(a.week(), "W");
            case "w":
            case "ww":
              return i.s(a.week(), c === "w" ? 1 : 2, "0");
            case "W":
            case "WW":
              return i.s(a.isoWeek(), c === "W" ? 1 : 2, "0");
            case "k":
            case "kk":
              return i.s(String(a.$H === 0 ? 24 : a.$H), c === "k" ? 1 : 2, "0");
            case "X":
              return Math.floor(a.$d.getTime() / 1e3);
            case "x":
              return a.$d.getTime();
            case "z":
              return "[" + a.offsetName() + "]";
            case "zzz":
              return "[" + a.offsetName("long") + "]";
            default:
              return c;
          }
        });
        return s.bind(this)(f);
      };
    };
  });
})(We);
const gt = We.exports;
var Ae = { exports: {} };
(function(t, u) {
  (function(n, o) {
    t.exports = o();
  })(K, function() {
    var n = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" }, o = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g, g = /\d\d/, l = /\d\d?/, s = /\d*[^-_:/,()\s\d]+/, e = {}, a = function(h) {
      return (h = +h) + (h > 68 ? 1900 : 2e3);
    }, r = function(h) {
      return function(b) {
        this[h] = +b;
      };
    }, i = [/[+-]\d\d:?(\d\d)?|Z/, function(h) {
      (this.zone || (this.zone = {})).offset = function(b) {
        if (!b || b === "Z")
          return 0;
        var E = b.match(/([+-]|\d\d)/g), v = 60 * E[1] + (+E[2] || 0);
        return v === 0 ? 0 : E[0] === "+" ? -v : v;
      }(h);
    }], f = function(h) {
      var b = e[h];
      return b && (b.indexOf ? b : b.s.concat(b.f));
    }, c = function(h, b) {
      var E, v = e.meridiem;
      if (v) {
        for (var y = 1; y <= 24; y += 1)
          if (h.indexOf(v(y, 0, b)) > -1) {
            E = y > 12;
            break;
          }
      } else
        E = h === (b ? "pm" : "PM");
      return E;
    }, m = { A: [s, function(h) {
      this.afternoon = c(h, !1);
    }], a: [s, function(h) {
      this.afternoon = c(h, !0);
    }], S: [/\d/, function(h) {
      this.milliseconds = 100 * +h;
    }], SS: [g, function(h) {
      this.milliseconds = 10 * +h;
    }], SSS: [/\d{3}/, function(h) {
      this.milliseconds = +h;
    }], s: [l, r("seconds")], ss: [l, r("seconds")], m: [l, r("minutes")], mm: [l, r("minutes")], H: [l, r("hours")], h: [l, r("hours")], HH: [l, r("hours")], hh: [l, r("hours")], D: [l, r("day")], DD: [g, r("day")], Do: [s, function(h) {
      var b = e.ordinal, E = h.match(/\d+/);
      if (this.day = E[0], b)
        for (var v = 1; v <= 31; v += 1)
          b(v).replace(/\[|\]/g, "") === h && (this.day = v);
    }], M: [l, r("month")], MM: [g, r("month")], MMM: [s, function(h) {
      var b = f("months"), E = (f("monthsShort") || b.map(function(v) {
        return v.slice(0, 3);
      })).indexOf(h) + 1;
      if (E < 1)
        throw new Error();
      this.month = E % 12 || E;
    }], MMMM: [s, function(h) {
      var b = f("months").indexOf(h) + 1;
      if (b < 1)
        throw new Error();
      this.month = b % 12 || b;
    }], Y: [/[+-]?\d+/, r("year")], YY: [g, function(h) {
      this.year = a(h);
    }], YYYY: [/\d{4}/, r("year")], Z: i, ZZ: i };
    function _(h) {
      var b, E;
      b = h, E = e && e.formats;
      for (var v = (h = b.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, function(B, T, Y) {
        var L = Y && Y.toUpperCase();
        return T || E[Y] || n[Y] || E[L].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, function(S, W, P) {
          return W || P.slice(1);
        });
      })).match(o), y = v.length, x = 0; x < y; x += 1) {
        var d = v[x], w = m[d], p = w && w[0], k = w && w[1];
        v[x] = k ? { regex: p, parser: k } : d.replace(/^\[|\]$/g, "");
      }
      return function(B) {
        for (var T = {}, Y = 0, L = 0; Y < y; Y += 1) {
          var S = v[Y];
          if (typeof S == "string")
            L += S.length;
          else {
            var W = S.regex, P = S.parser, F = B.slice(L), U = W.exec(F)[0];
            P.call(T, U), B = B.replace(U, "");
          }
        }
        return function(A) {
          var z = A.afternoon;
          if (z !== void 0) {
            var J = A.hours;
            z ? J < 12 && (A.hours += 12) : J === 12 && (A.hours = 0), delete A.afternoon;
          }
        }(T), T;
      };
    }
    return function(h, b, E) {
      E.p.customParseFormat = !0, h && h.parseTwoDigitYear && (a = h.parseTwoDigitYear);
      var v = b.prototype, y = v.parse;
      v.parse = function(x) {
        var d = x.date, w = x.utc, p = x.args;
        this.$u = w;
        var k = p[1];
        if (typeof k == "string") {
          var B = p[2] === !0, T = p[3] === !0, Y = B || T, L = p[2];
          T && (L = p[2]), e = this.$locale(), !B && L && (e = E.Ls[L]), this.$d = function(F, U, A) {
            try {
              if (["x", "X"].indexOf(U) > -1)
                return new Date((U === "X" ? 1e3 : 1) * F);
              var z = _(U)(F), J = z.year, oe = z.month, Ve = z.day, Qe = z.hours, Xe = z.minutes, Ke = z.seconds, Ze = z.milliseconds, Be = z.zone, fe = new Date(), ge = Ve || (J || oe ? 1 : fe.getDate()), he = J || fe.getFullYear(), se = 0;
              J && !oe || (se = oe > 0 ? oe - 1 : fe.getMonth());
              var me = Qe || 0, pe = Xe || 0, ve = Ke || 0, ye = Ze || 0;
              return Be ? new Date(Date.UTC(he, se, ge, me, pe, ve, ye + 60 * Be.offset * 1e3)) : A ? new Date(Date.UTC(he, se, ge, me, pe, ve, ye)) : new Date(he, se, ge, me, pe, ve, ye);
            } catch {
              return new Date("");
            }
          }(d, k, w), this.init(), L && L !== !0 && (this.$L = this.locale(L).$L), Y && d != this.format(k) && (this.$d = new Date("")), e = {};
        } else if (k instanceof Array)
          for (var S = k.length, W = 1; W <= S; W += 1) {
            p[1] = k[W - 1];
            var P = E.apply(this, p);
            if (P.isValid()) {
              this.$d = P.$d, this.$L = P.$L, this.init();
              break;
            }
            W === S && (this.$d = new Date(""));
          }
        else
          y.call(this, x);
      };
    };
  });
})(Ae);
const ht = Ae.exports, ze = Symbol("CHART_ROWS_KEY"), je = Symbol("CONFIG_KEY"), Pe = Symbol("EMIT_BAR_EVENT_KEY"), Fe = Symbol("BAR_CONTAINER_KEY");
function R() {
  const t = ue(je);
  if (!t)
    throw Error("Failed to inject config!");
  return t;
}
const Ue = "YYYY-MM-DD HH:mm";
function ce(t = R()) {
  const { chartStart: u, chartEnd: n, barStart: o, barEnd: g, dateFormat: l } = t, s = j(() => a(u.value)), e = j(() => a(n.value)), a = (i, f) => {
    let c;
    if (f !== void 0 && typeof i != "string" && !(i instanceof Date) && (c = f === "start" ? i[o.value] : i[g.value]), typeof i == "string")
      c = i;
    else if (i instanceof Date)
      return G(i);
    const m = l.value || Ue;
    return G(c, m, !0);
  };
  return {
    chartStartDayjs: s,
    chartEndDayjs: e,
    toDayjs: a,
    format: (i, f) => f === !1 ? i instanceof Date ? i : G(i).toDate() : (typeof i == "string" || i instanceof Date ? a(i) : i).format(f)
  };
}
function xe() {
  const { precision: t } = R(), { chartStartDayjs: u, chartEndDayjs: n } = ce(), o = j(() => {
    switch (t == null ? void 0 : t.value) {
      case "hour":
        return "day";
      case "day":
        return "month";
      case "date":
      case "week":
        return "month";
      case "month":
        return "year";
      default:
        throw new Error(
          "Precision prop incorrect. Must be one of the following: 'hour', 'day', 'date', 'week', 'month'"
        );
    }
  }), g = j(() => {
    switch (t.value) {
      case "date":
        return "day";
      case "week":
        return "isoWeek";
      default:
        return t.value;
    }
  }), l = {
    hour: "HH",
    date: "MM\u6708DD\u65E5",
    day: "DD\u65E5",
    week: "WW",
    month: "YYYY\u5E74MM\u6708",
    year: "YYYY\u5E74"
  };
  return {
    timeaxisUnits: j(() => {
      const e = [], a = [], r = n.value.diff(u.value, "minutes", !0), i = o.value, f = g.value;
      let c = u.value, m = u.value;
      for (; m.isSameOrBefore(n.value); ) {
        const _ = m.endOf(f), b = _.isAfter(n.value) ? n.value.diff(m, "minutes", !0) / r * 100 : _.diff(m, "minutes", !0) / r * 100;
        a.push({
          label: m.format(l[t == null ? void 0 : t.value]),
          value: String(m),
          date: m.toDate(),
          width: String(b) + "%"
        }), m = _.add(1, f === "isoWeek" ? "week" : f).startOf(f);
      }
      for (; c.isSameOrBefore(n.value); ) {
        const _ = c.endOf(i), b = _.isAfter(n.value) ? n.value.diff(c, "minutes", !0) / r * 100 : _.diff(c, "minutes", !0) / r * 100;
        e.push({
          label: c.format(l[i]),
          value: String(c),
          date: c.toDate(),
          width: String(b) + "%"
        }), c = _.add(1, i).startOf(i);
      }
      return { upperUnits: e, lowerUnits: a };
    })
  };
}
const mt = { class: "g-grid-container" }, pt = /* @__PURE__ */ X({
  __name: "GGanttGrid",
  props: {
    highlightedUnits: {}
  },
  setup(t) {
    const { colors: u } = R(), { timeaxisUnits: n } = xe();
    return (o, g) => (O(), D("div", mt, [
      (O(!0), D(Q, null, ee(C(n).lowerUnits, ({ label: l, value: s, width: e }) => {
        var a;
        return O(), D("div", {
          key: l,
          class: "g-grid-line",
          style: $({
            width: e,
            background: (a = o.highlightedUnits) != null && a.includes(Number(s)) ? C(u).hoverHighlight : void 0
          })
        }, null, 4);
      }), 128))
    ]));
  }
});
function ke() {
  const t = ue(ze);
  if (!t)
    throw Error("Failed to inject getChartRows!");
  return t;
}
const vt = { class: "g-label-column-rows" }, yt = /* @__PURE__ */ X({
  __name: "GGanttLabelColumn",
  setup(t) {
    const { font: u, colors: n, labelColumnTitle: o, rowHeight: g } = R(), l = ke();
    return (s, e) => (O(), D("div", {
      class: "g-label-column",
      style: $({ fontFamily: C(u), color: C(n).text })
    }, [
      H(s.$slots, "label-column-title", {}, () => [
        M("div", {
          class: "g-label-column-header",
          style: $({ background: C(n).primary })
        }, N(C(o)), 5)
      ]),
      M("div", vt, [
        (O(!0), D(Q, null, ee(C(l)(), ({ label: a }, r) => (O(), D("div", {
          key: `${a}_${r}`,
          class: "g-label-column-row",
          style: $({
            background: r % 2 === 0 ? C(n).ternary : C(n).quartenary,
            height: `${C(g)}px`
          })
        }, [
          H(s.$slots, "label-column-row", { label: a }, () => [
            M("span", null, N(a), 1)
          ])
        ], 4))), 128))
      ])
    ], 4));
  }
});
const wt = { class: "g-timeaxis" }, bt = { class: "g-timeunits-container" }, _t = { class: "g-timeunits-container" }, xt = /* @__PURE__ */ X({
  __name: "GGanttTimeaxis",
  setup(t) {
    const { precision: u, colors: n } = R(), { timeaxisUnits: o } = xe();
    return (g, l) => (O(), D("div", wt, [
      M("div", bt, [
        (O(!0), D(Q, null, ee(C(o).upperUnits, ({ label: s, value: e, date: a, width: r }, i) => (O(), D("div", {
          key: s,
          class: "g-upper-timeunit",
          style: $({
            background: i % 2 === 0 ? C(n).primary : C(n).secondary,
            color: C(n).text,
            width: r
          })
        }, [
          H(g.$slots, "upper-timeunit", {
            label: s,
            value: e,
            date: a
          }, () => [
            ne(N(s), 1)
          ])
        ], 4))), 128))
      ]),
      M("div", _t, [
        (O(!0), D(Q, null, ee(C(o).lowerUnits, ({ label: s, value: e, date: a, width: r }, i) => (O(), D("div", {
          key: s,
          class: "g-timeunit",
          style: $({
            background: i % 2 === 0 ? C(n).ternary : C(n).quartenary,
            color: C(n).text,
            flexDirection: C(u) === "hour" ? "column" : "row",
            alignItems: C(u) === "hour" ? "" : "center",
            width: r
          })
        }, [
          H(g.$slots, "timeunit", {
            label: s,
            value: e,
            date: a
          }, () => [
            ne(N(s), 1)
          ]),
          C(u) === "hour" ? (O(), D("div", {
            key: 0,
            class: "g-timeaxis-hour-pin",
            style: $({ background: C(n).text })
          }, null, 4)) : V("", !0)
        ], 4))), 128))
      ])
    ]));
  }
});
function de(t = R()) {
  const { dateFormat: u, chartSize: n } = t, { chartStartDayjs: o, chartEndDayjs: g, toDayjs: l, format: s } = ce(t), e = j(() => g.value.diff(o.value, "minutes"));
  return {
    mapTimeToPosition: (i) => {
      const f = n.width.value || 0, c = l(i).diff(o.value, "minutes", !0);
      return Math.ceil(c / e.value * f);
    },
    mapPositionToTime: (i) => {
      const f = n.width.value || 0, c = i / f * e.value;
      return s(o.value.add(c, "minutes"), u.value);
    }
  };
}
const kt = /* @__PURE__ */ X({
  __name: "GGanttCurrentTime",
  setup(t) {
    const { mapTimeToPosition: u } = de(), n = I(G()), { colors: o, dateFormat: g, currentTimeLabel: l } = R(), s = j(() => {
      const e = g.value || "YYYY-MM-DD HH:mm";
      return u(G(n.value, e).format(e));
    });
    return (e, a) => (O(), D("div", {
      class: "g-grid-current-time",
      style: $({
        left: `${s.value}px`
      })
    }, [
      M("div", {
        class: "g-grid-current-time-marker",
        style: $({
          border: `1px solid ${C(o).markerCurrentTime}`
        })
      }, null, 4),
      M("span", {
        class: "g-grid-current-time-text",
        style: $({ color: C(o).markerCurrentTime })
      }, [
        H(e.$slots, "current-time-label", {}, () => [
          ne(N(C(l)), 1)
        ])
      ], 4)
    ], 4));
  }
});
var Ee;
const ae = typeof window < "u";
ae && ((Ee = window == null ? void 0 : window.navigator) == null ? void 0 : Ee.userAgent) && /iP(ad|hone|od)/.test(window.navigator.userAgent);
function Bt(t) {
  return typeof t == "function" ? t() : C(t);
}
function Ct(t) {
  return t;
}
function Et(t) {
  return Je() ? (et(t), !0) : !1;
}
function Ot(t, u = !0) {
  tt() ? $e(t) : u ? t() : nt(t);
}
function Ne(t) {
  var u;
  const n = Bt(t);
  return (u = n == null ? void 0 : n.$el) != null ? u : n;
}
const Dt = ae ? window : void 0;
ae && window.document;
ae && window.navigator;
ae && window.location;
function Tt(t, u = !1) {
  const n = I(), o = () => n.value = Boolean(t());
  return o(), Ot(o, u), n;
}
const we = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, be = "__vueuse_ssr_handlers__";
we[be] = we[be] || {};
we[be];
var Oe = Object.getOwnPropertySymbols, Yt = Object.prototype.hasOwnProperty, Mt = Object.prototype.propertyIsEnumerable, Lt = (t, u) => {
  var n = {};
  for (var o in t)
    Yt.call(t, o) && u.indexOf(o) < 0 && (n[o] = t[o]);
  if (t != null && Oe)
    for (var o of Oe(t))
      u.indexOf(o) < 0 && Mt.call(t, o) && (n[o] = t[o]);
  return n;
};
function $t(t, u, n = {}) {
  const o = n, { window: g = Dt } = o, l = Lt(o, ["window"]);
  let s;
  const e = Tt(() => g && "ResizeObserver" in g), a = () => {
    s && (s.disconnect(), s = void 0);
  }, r = _e(() => Ne(t), (f) => {
    a(), e.value && g && f && (s = new ResizeObserver(u), s.observe(f, l));
  }, { immediate: !0, flush: "post" }), i = () => {
    a(), r();
  };
  return Et(i), {
    isSupported: e,
    stop: i
  };
}
function St(t, u = { width: 0, height: 0 }, n = {}) {
  const o = I(u.width), g = I(u.height);
  return $t(t, ([l]) => {
    o.value = l.contentRect.width, g.value = l.contentRect.height;
  }, n), _e(() => Ne(t), (l) => {
    o.value = l ? u.width : 0, g.value = l ? u.height : 0;
  }), {
    width: o,
    height: g
  };
}
var De;
(function(t) {
  t.UP = "UP", t.RIGHT = "RIGHT", t.DOWN = "DOWN", t.LEFT = "LEFT", t.NONE = "NONE";
})(De || (De = {}));
var Gt = Object.defineProperty, Te = Object.getOwnPropertySymbols, Ht = Object.prototype.hasOwnProperty, It = Object.prototype.propertyIsEnumerable, Ye = (t, u, n) => u in t ? Gt(t, u, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[u] = n, Rt = (t, u) => {
  for (var n in u || (u = {}))
    Ht.call(u, n) && Ye(t, n, u[n]);
  if (Te)
    for (var n of Te(u))
      It.call(u, n) && Ye(t, n, u[n]);
  return t;
};
const Wt = {
  easeInSine: [0.12, 0, 0.39, 0],
  easeOutSine: [0.61, 1, 0.88, 1],
  easeInOutSine: [0.37, 0, 0.63, 1],
  easeInQuad: [0.11, 0, 0.5, 0],
  easeOutQuad: [0.5, 1, 0.89, 1],
  easeInOutQuad: [0.45, 0, 0.55, 1],
  easeInCubic: [0.32, 0, 0.67, 0],
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeInQuart: [0.5, 0, 0.75, 0],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeInQuint: [0.64, 0, 0.78, 0],
  easeOutQuint: [0.22, 1, 0.36, 1],
  easeInOutQuint: [0.83, 0, 0.17, 1],
  easeInExpo: [0.7, 0, 0.84, 0],
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
  easeInCirc: [0.55, 0, 1, 0.45],
  easeOutCirc: [0, 0.55, 0.45, 1],
  easeInOutCirc: [0.85, 0, 0.15, 1],
  easeInBack: [0.36, 0, 0.66, -0.56],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeInOutBack: [0.68, -0.6, 0.32, 1.6]
};
Rt({
  linear: Ct
}, Wt);
const Me = {
  default: {
    primary: "#eeeeee",
    secondary: "#E0E0E0",
    ternary: "#F5F5F5",
    quartenary: "#ededed",
    hoverHighlight: "rgba(204, 216, 219, 0.5)",
    markerCurrentTime: "#F78431",
    text: "#333",
    background: "white"
  },
  creamy: {
    primary: "#ffe8d9",
    secondary: "#fcdcc5",
    ternary: "#fff6f0",
    quartenary: "#f7ece6",
    hoverHighlight: "rgba(230, 221, 202, 0.5)",
    markerCurrentTime: "#000",
    text: "#542d05",
    background: "white"
  },
  crimson: {
    primary: "#a82039",
    secondary: "#c41238",
    ternary: "#db4f56",
    quartenary: "#ce5f64",
    hoverHighlight: "rgba(196, 141, 141, 0.5)",
    markerCurrentTime: "#000",
    text: "white",
    background: "white"
  },
  dark: {
    primary: "#404040",
    secondary: "#303030",
    ternary: "#353535",
    quartenary: "#383838",
    hoverHighlight: "rgba(159, 160, 161, 0.5)",
    markerCurrentTime: "#fff",
    text: "white",
    background: "#525252",
    toast: "#1f1f1f"
  },
  flare: {
    primary: "#e08a38",
    secondary: "#e67912",
    ternary: "#5e5145",
    quartenary: "#665648",
    hoverHighlight: "rgba(196, 141, 141, 0.5)",
    markerCurrentTime: "#000",
    text: "white",
    background: "white"
  },
  fuchsia: {
    primary: "#de1d5a",
    secondary: "#b50b41",
    ternary: "#ff7da6",
    quartenary: "#f2799f",
    hoverHighlight: "rgba(196, 141, 141, 0.5)",
    markerCurrentTime: "#000",
    text: "white",
    background: "white"
  },
  grove: {
    primary: "#3d9960",
    secondary: "#288542",
    ternary: "#72b585",
    quartenary: "#65a577",
    hoverHighlight: "rgba(160, 219, 171, 0.5)",
    markerCurrentTime: "#000",
    text: "white",
    background: "white"
  },
  "material-blue": {
    primary: "#0D47A1",
    secondary: "#1565C0",
    ternary: "#42a5f5",
    quartenary: "#409fed",
    hoverHighlight: "rgba(110, 165, 196, 0.5)",
    markerCurrentTime: "#000",
    text: "white",
    background: "white"
  },
  sky: {
    primary: "#b5e3ff",
    secondary: "#a1d6f7",
    ternary: "#d6f7ff",
    quartenary: "#d0edf4",
    hoverHighlight: "rgba(193, 202, 214, 0.5)",
    markerCurrentTime: "#000",
    text: "#022c47",
    background: "white"
  },
  slumber: {
    primary: "#2a2f42",
    secondary: "#2f3447",
    ternary: "#35394d",
    quartenary: "#2c3044",
    hoverHighlight: "rgba(179, 162, 127, 0.5)",
    markerCurrentTime: "#fff",
    text: "#ffe0b3",
    background: "#38383b",
    toast: "#1f1f1f"
  },
  vue: {
    primary: "#258a5d",
    secondary: "#41B883",
    ternary: "#35495E",
    quartenary: "#2a3d51",
    hoverHighlight: "rgba(160, 219, 171, 0.5)",
    markerCurrentTime: "#000",
    text: "white",
    background: "white"
  }
}, At = { class: "g-gantt-rows-container" }, zt = /* @__PURE__ */ X({
  __name: "GGanttChart",
  props: {
    chartStart: {},
    chartEnd: {},
    precision: { default: "day" },
    barStart: {},
    barEnd: {},
    currentTime: { type: Boolean },
    currentTimeLabel: { default: "" },
    dateFormat: { type: [String, Boolean], default: Ue },
    width: { default: "100%" },
    hideTimeaxis: { type: Boolean, default: !1 },
    colorScheme: { default: "default" },
    grid: { type: Boolean, default: !1 },
    pushOnOverlap: { type: Boolean, default: !1 },
    noOverlap: { type: Boolean, default: !1 },
    rowHeight: { default: 40 },
    highlightedUnits: { default: () => [] },
    font: { default: "inherit" },
    labelColumnTitle: { default: "" },
    labelColumnWidth: { default: "150px" }
  },
  emits: ["click-bar", "mousedown-bar", "mouseup-bar", "dblclick-bar", "mouseenter-bar", "mouseleave-bar", "dragstart-bar", "drag-bar", "dragend-bar", "contextmenu-bar"],
  setup(t, { emit: u }) {
    const n = t, { width: o, font: g, colorScheme: l } = le(n), s = rt(), e = j(
      () => typeof l.value != "string" ? l.value : Me[l.value] || Me.default
    ), a = () => {
      var x;
      const v = (x = s.default) == null ? void 0 : x.call(s), y = [];
      return v && v.forEach((d) => {
        var w;
        if ((w = d.props) != null && w.bars) {
          const { label: p, bars: k } = d.props;
          y.push({ label: p, bars: k });
        } else
          Array.isArray(d.children) && d.children.forEach((p) => {
            var B;
            const k = p;
            if ((B = k == null ? void 0 : k.props) != null && B.bars) {
              const { label: T, bars: Y } = k.props;
              y.push({ label: T, bars: Y });
            }
          });
      }), y;
    }, r = I(!1), i = I(!1), f = I(void 0);
    let c;
    const m = (v) => {
      c && clearTimeout(c), c = setTimeout(() => {
        r.value = !0;
      }, 800), f.value = v;
    }, _ = () => {
      clearTimeout(c), r.value = !1;
    }, h = (v, y, x, d) => {
      switch (v.type) {
        case "click":
          u("click-bar", { bar: y, e: v, datetime: x });
          break;
        case "mousedown":
          u("mousedown-bar", { bar: y, e: v, datetime: x });
          break;
        case "mouseup":
          u("mouseup-bar", { bar: y, e: v, datetime: x });
          break;
        case "dblclick":
          u("dblclick-bar", { bar: y, e: v, datetime: x });
          break;
        case "mouseenter":
          m(y), u("mouseenter-bar", { bar: y, e: v });
          break;
        case "mouseleave":
          _(), u("mouseleave-bar", { bar: y, e: v });
          break;
        case "dragstart":
          i.value = !0, u("dragstart-bar", { bar: y, e: v });
          break;
        case "drag":
          u("drag-bar", { bar: y, e: v });
          break;
        case "dragend":
          i.value = !1, u("dragend-bar", { bar: y, e: v, movedBars: d });
          break;
        case "contextmenu":
          u("contextmenu-bar", { bar: y, e: v, datetime: x });
          break;
      }
    }, b = I(null), E = St(b);
    return ie(ze, a), ie(je, {
      ...le(n),
      colors: e,
      chartSize: E
    }), ie(Pe, h), (v, y) => (O(), D("div", null, [
      M("div", {
        class: re([{ "labels-in-column": !!v.labelColumnTitle }])
      }, [
        v.labelColumnTitle ? (O(), te(yt, {
          key: 0,
          style: $({
            width: v.labelColumnWidth
          })
        }, {
          "label-column-title": q(() => [
            H(v.$slots, "label-column-title")
          ]),
          "label-column-row": q(({ label: x }) => [
            H(v.$slots, "label-column-row", { label: x })
          ]),
          _: 3
        }, 8, ["style"])) : V("", !0),
        M("div", {
          ref_key: "ganttChart",
          ref: b,
          class: re(["g-gantt-chart", { "with-column": v.labelColumnTitle }]),
          style: $({ width: C(o), background: e.value.background, fontFamily: C(g) })
        }, [
          v.hideTimeaxis ? V("", !0) : (O(), te(xt, { key: 0 }, {
            "upper-timeunit": q(({ label: x, value: d, date: w }) => [
              H(v.$slots, "upper-timeunit", {
                label: x,
                value: d,
                date: w
              })
            ]),
            timeunit: q(({ label: x, value: d, date: w }) => [
              H(v.$slots, "timeunit", {
                label: x,
                value: d,
                date: w
              })
            ]),
            _: 3
          })),
          v.grid ? (O(), te(pt, {
            key: 1,
            "highlighted-units": v.highlightedUnits
          }, null, 8, ["highlighted-units"])) : V("", !0),
          v.currentTime ? (O(), te(kt, { key: 2 }, {
            "current-time-label": q(() => [
              H(v.$slots, "current-time-label")
            ]),
            _: 3
          })) : V("", !0),
          M("div", At, [
            H(v.$slots, "default")
          ])
        ], 6)
      ], 2)
    ]));
  }
});
const jt = { class: "g-people-work-hour" }, Pt = { class: "g-people-work-hour-container" }, Ft = { class: "g-timeunit_hour" }, Ut = { class: "g-timeunit_count" }, Nt = /* @__PURE__ */ X({
  __name: "GGanttWorkHour",
  props: {
    standardWorkeHours: {},
    workHourList: {}
  },
  setup(t) {
    const u = t, { colors: n } = R(), { timeaxisUnits: o } = xe(), g = j(() => o.value.lowerUnits.map((s) => {
      const e = u.standardWorkeHours[G(s.value).format("YYYY-MM-DD")];
      return {
        ...s,
        ...e
      };
    }));
    return (l, s) => (O(), D("div", jt, [
      M("div", Pt, [
        (O(!0), D(Q, null, ee(g.value, (e, a) => {
          var r, i;
          return O(), D("div", {
            key: e == null ? void 0 : e.label,
            class: "g-timeunit",
            style: $({
              background: a % 2 === 0 ? (r = C(n)) == null ? void 0 : r.ternary : (i = C(n)) == null ? void 0 : i.quartenary,
              width: e == null ? void 0 : e.width
            })
          }, [
            M("div", Ft, [
              ne(N((e == null ? void 0 : e.workHour) || 0) + " ", 1),
              (e == null ? void 0 : e.floatMaterialHour) !== 0 ? (O(), D("div", {
                key: 0,
                class: re(["count", (e == null ? void 0 : e.floatMaterialHour) > 0 ? "count-up" : "count-down"])
              }, N((e == null ? void 0 : e.floatMaterialHour) > 0 ? `+${e == null ? void 0 : e.floatMaterialHour}` : e == null ? void 0 : e.floatMaterialHour), 3)) : V("", !0)
            ]),
            M("div", Ut, [
              ne(N((e == null ? void 0 : e.workCount) || 0) + " ", 1),
              (e == null ? void 0 : e.floatExtraCount) !== 0 ? (O(), D("div", {
                key: 0,
                class: re(["count", (e == null ? void 0 : e.floatExtraCount) > 0 ? "count-up" : "count-down"])
              }, N((e == null ? void 0 : e.floatExtraCount) > 0 ? `+${e == null ? void 0 : e.floatExtraCount}` : e == null ? void 0 : e.floatExtraCount), 3)) : V("", !0)
            ])
          ], 4);
        }), 128))
      ])
    ]));
  }
});
const qt = (t, u) => {
  const n = t.__vccOpts || t;
  for (const [o, g] of u)
    n[o] = g;
  return n;
}, Vt = /* @__PURE__ */ qt(Nt, [["__scopeId", "data-v-c17e3b77"]]);
function Le(t, u = () => null, n = () => null, o = R()) {
  const { barStart: g, barEnd: l, pushOnOverlap: s } = o, e = I(!1);
  let a = 0, r;
  const { mapPositionToTime: i } = de(o), { toDayjs: f } = ce(o), c = (y) => {
    const x = document.getElementById(t.ganttBarConfig.id);
    if (!x)
      return;
    switch (a = y.clientX - (x.getBoundingClientRect().left || 0), y.target.className) {
      case "g-gantt-bar-handle-left":
        document.body.style.cursor = "ew-resize", r = h;
        break;
      case "g-gantt-bar-handle-right":
        document.body.style.cursor = "ew-resize", r = b;
        break;
      default:
        r = _;
    }
    e.value = !0, window.addEventListener("mousemove", r), window.addEventListener("mouseup", v);
  }, m = () => {
    var d;
    const y = document.getElementById(t.ganttBarConfig.id), x = (d = y == null ? void 0 : y.closest(".g-gantt-row-bars-container")) == null ? void 0 : d.getBoundingClientRect();
    return { barElement: y, barContainer: x };
  }, _ = (y) => {
    const { barElement: x, barContainer: d } = m();
    if (!x || !d)
      return;
    const w = x.getBoundingClientRect().width, p = y.clientX - d.left - a, k = p + w;
    E(p, k) || (t[g.value] = i(p), t[l.value] = i(k), u(y, t));
  }, h = (y) => {
    const { barElement: x, barContainer: d } = m();
    if (!x || !d)
      return;
    const w = y.clientX - d.left, p = i(w);
    f(p).isSameOrAfter(f(t, "end")) || (t[g.value] = p, u(y, t));
  }, b = (y) => {
    const { barElement: x, barContainer: d } = m();
    if (!x || !d)
      return;
    const w = y.clientX - d.left, p = i(w);
    f(p).isSameOrBefore(f(t, "start")) || (t[l.value] = p, u(y, t));
  }, E = (y, x) => {
    if (!s.value)
      return !1;
    const d = t.ganttBarConfig.dragLimitLeft, w = t.ganttBarConfig.dragLimitRight;
    return y && d != null && y < d || x && w != null && x > w;
  }, v = (y) => {
    e.value = !1, document.body.style.cursor = "", window.removeEventListener("mousemove", r), window.removeEventListener("mouseup", v), n(y, t);
  };
  return {
    isDragging: e,
    initDrag: c
  };
}
function qe() {
  const t = ue(Pe);
  if (!t)
    throw Error("Failed to inject emitBarEvent!");
  return t;
}
function Qt() {
  const t = R(), u = ke(), n = qe(), { pushOnOverlap: o, barStart: g, barEnd: l, noOverlap: s, dateFormat: e } = t, a = /* @__PURE__ */ new Map(), { toDayjs: r, format: i } = ce(), f = (d, w) => {
    const { initDrag: p } = Le(d, m, v, t);
    n({ ...w, type: "dragstart" }, d), p(w), y(d);
  }, c = (d, w) => {
    const p = d.ganttBarConfig.bundle;
    p != null && (u().forEach((k) => {
      k.bars.forEach((B) => {
        if (B.ganttBarConfig.bundle === p) {
          const T = B === d ? v : () => null, { initDrag: Y } = Le(B, m, T, t);
          Y(w), y(B);
        }
      });
    }), n({ ...w, type: "dragstart" }, d));
  }, m = (d, w) => {
    n({ ...d, type: "drag" }, w), _(w);
  }, _ = (d) => {
    if (!(o != null && o.value))
      return;
    let w = d, { overlapBar: p, overlapType: k } = h(w);
    for (; p; ) {
      y(p);
      const B = r(w[g.value]), T = r(w[l.value]), Y = r(p[g.value]), L = r(p[l.value]);
      let S;
      switch (k) {
        case "left":
          S = L.diff(B, "minutes", !0), p[l.value] = i(w[g.value], e.value), p[g.value] = i(
            Y.subtract(S, "minutes"),
            e.value
          );
          break;
        case "right":
          S = T.diff(Y, "minutes", !0), p[g.value] = i(T, e.value), p[l.value] = i(
            L.add(S, "minutes"),
            e.value
          );
          break;
        default:
          console.warn(
            "Vue-Ganttastic: One bar is inside of the other one! This should never occur while push-on-overlap is active!"
          );
          return;
      }
      p && (k === "left" || k === "right") && b(p, S, k), w = p, { overlapBar: p, overlapType: k } = h(p);
    }
  }, h = (d) => {
    var W, P;
    let w, p, k;
    const B = (P = (W = u().find((F) => F.bars.includes(d))) == null ? void 0 : W.bars) != null ? P : [], T = r(d[g.value]), Y = r(d[l.value]);
    return { overlapBar: B.find((F) => {
      if (F === d)
        return !1;
      const U = r(F[g.value]), A = r(F[l.value]);
      return w = T.isBetween(U, A), p = Y.isBetween(U, A), k = U.isBetween(T, Y) || A.isBetween(T, Y), w || p || k;
    }), overlapType: w ? "left" : p ? "right" : k ? "between" : null };
  }, b = (d, w, p) => {
    y(d), d.ganttBarConfig.bundle && u().forEach((k) => {
      k.bars.forEach((B) => {
        B.ganttBarConfig.bundle === d.ganttBarConfig.bundle && B !== d && (y(B), E(B, w, p));
      });
    });
  }, E = (d, w, p) => {
    switch (p) {
      case "left":
        d[g.value] = i(
          r(d, "start").subtract(w, "minutes"),
          e.value
        ), d[l.value] = i(
          r(d, "end").subtract(w, "minutes"),
          e.value
        );
        break;
      case "right":
        d[g.value] = i(
          r(d, "start").add(w, "minutes"),
          e.value
        ), d[l.value] = i(r(d, "end").add(w, "minutes"), e.value);
    }
    _(d);
  }, v = (d, w) => {
    x();
    const p = {
      ...d,
      type: "dragend"
    };
    n(p, w, void 0, new Map(a)), a.clear();
  }, y = (d) => {
    if (!a.has(d)) {
      const w = d[g.value], p = d[l.value];
      a.set(d, { oldStart: w, oldEnd: p });
    }
  }, x = () => {
    if (o.value || !s.value)
      return;
    let d = !1;
    a.forEach((w, p) => {
      const { overlapBar: k } = h(p);
      k != null && (d = !0);
    }), d && a.forEach(({ oldStart: w, oldEnd: p }, k) => {
      k[g.value] = w, k[l.value] = p;
    });
  };
  return {
    initDragOfBar: f,
    initDragOfBundle: c
  };
}
function Xt() {
  const { pushOnOverlap: t } = R(), u = ke(), n = (s) => {
    const e = [];
    return s != null && u().forEach((a) => {
      a.bars.forEach((r) => {
        r.ganttBarConfig.bundle === s && e.push(r);
      });
    }), e;
  }, o = (s) => {
    if (!t.value || s.ganttBarConfig.pushOnOverlap === !1)
      return;
    for (const a of ["left", "right"]) {
      const r = a, { gapDistanceSoFar: i, bundleBarsAndGapDist: f } = g(
        s,
        0,
        r
      );
      let c = i;
      const m = f;
      if (!m)
        continue;
      for (let h = 0; h < m.length; h++) {
        const b = m[h].bar, E = m[h].gapDistance;
        n(b.ganttBarConfig.bundle).filter(
          (y) => y !== b
        ).forEach((y) => {
          const x = g(y, E, r), d = x.gapDistanceSoFar, w = x.bundleBarsAndGapDist;
          d != null && (!c || d < c) && (c = d), w.forEach((p) => {
            m.find((k) => k.bar === p.bar) || m.push(p);
          });
        });
      }
      const _ = document.getElementById(s.ganttBarConfig.id);
      c != null && r === "left" ? s.ganttBarConfig.dragLimitLeft = _.offsetLeft - c : c != null && r === "right" && (s.ganttBarConfig.dragLimitRight = _.offsetLeft + _.offsetWidth + c);
    }
    n(s.ganttBarConfig.bundle).forEach((a) => {
      a.ganttBarConfig.dragLimitLeft = s.ganttBarConfig.dragLimitLeft, a.ganttBarConfig.dragLimitRight = s.ganttBarConfig.dragLimitRight;
    });
  }, g = (s, e = 0, a) => {
    const r = s.ganttBarConfig.bundle ? [{ bar: s, gapDistance: e }] : [];
    let i = s, f = l(i, a);
    if (a === "left")
      for (; f; ) {
        const c = document.getElementById(i.ganttBarConfig.id), m = document.getElementById(f.ganttBarConfig.id), _ = m.offsetLeft + m.offsetWidth;
        if (e += c.offsetLeft - _, f.ganttBarConfig.immobile)
          return { gapDistanceSoFar: e, bundleBarsAndGapDist: r };
        f.ganttBarConfig.bundle && r.push({
          bar: f,
          gapDistance: e
        }), i = f, f = l(f, "left");
      }
    if (a === "right")
      for (; f; ) {
        const c = document.getElementById(i.ganttBarConfig.id), m = document.getElementById(f.ganttBarConfig.id), _ = c.offsetLeft + c.offsetWidth;
        if (e += m.offsetLeft - _, f.ganttBarConfig.immobile)
          return { gapDistanceSoFar: e, bundleBarsAndGapDist: r };
        f.ganttBarConfig.bundle && r.push({
          bar: f,
          gapDistance: e
        }), i = f, f = l(f, "right");
      }
    return { gapDistanceSoFar: null, bundleBarsAndGapDist: r };
  }, l = (s, e) => {
    var f, c;
    const a = document.getElementById(s.ganttBarConfig.id), r = (c = (f = u().find((m) => m.bars.includes(s))) == null ? void 0 : f.bars) != null ? c : [];
    let i = [];
    return e === "left" ? i = r.filter((m) => {
      const _ = document.getElementById(m.ganttBarConfig.id);
      return _ && _.offsetLeft < a.offsetLeft && m.ganttBarConfig.pushOnOverlap !== !1;
    }) : i = r.filter((m) => {
      const _ = document.getElementById(m.ganttBarConfig.id);
      return _ && _.offsetLeft > a.offsetLeft && m.ganttBarConfig.pushOnOverlap !== !1;
    }), i.length > 0 ? i.reduce((m, _) => {
      const h = document.getElementById(m.ganttBarConfig.id), b = document.getElementById(_.ganttBarConfig.id), E = Math.abs(h.offsetLeft - a.offsetLeft), v = Math.abs(b.offsetLeft - a.offsetLeft);
      return E < v ? m : _;
    }, i[0]) : null;
  };
  return {
    setDragLimitsOfGanttBar: o
  };
}
const Kt = ["id"], Zt = { class: "g-gantt-bar-label" }, Jt = ["innerHTML"], en = /* @__PURE__ */ X({
  __name: "GGanttBar",
  props: {
    bar: {},
    index: {}
  },
  setup(t) {
    const u = t, n = qe(), o = R(), { rowHeight: g } = o, { bar: l } = le(u), { mapTimeToPosition: s, mapPositionToTime: e } = de(), { initDragOfBar: a, initDragOfBundle: r } = Qt(), { setDragLimitsOfGanttBar: i } = Xt(), f = I(!1), c = j(() => l.value.ganttBarConfig);
    function m(B) {
      c.value.bundle != null ? r(l.value, B) : a(l.value, B), f.value = !0;
    }
    const _ = () => {
      var B;
      (B = l.value) != null && B.disabled || (i(l.value), !c.value.immobile && (window.addEventListener("mousemove", m, {
        once: !0
      }), window.addEventListener(
        "mouseup",
        () => {
          window.removeEventListener("mousemove", m), f.value = !1;
        },
        { once: !0 }
      )));
    }, h = ue(Fe), b = (B) => {
      var L;
      B.preventDefault(), B.type === "mousedown" && _();
      const T = (L = h == null ? void 0 : h.value) == null ? void 0 : L.getBoundingClientRect();
      if (!T)
        return;
      const Y = e(B.clientX - T.left);
      n(B, l.value, Y);
    }, { barStart: E, barEnd: v, width: y, chartStart: x, chartEnd: d, chartSize: w } = o, p = I(0), k = I(0);
    return $e(() => {
      _e(
        [l, y, x, d, w.width],
        () => {
          p.value = s(l.value[E.value]), k.value = s(l.value[v.value]);
        },
        { deep: !0, immediate: !0 }
      );
    }), (B, T) => (O(), D("div", {
      id: c.value.id,
      class: re(["g-gantt-bar", c.value.class || ""]),
      style: $({
        ...c.value.style,
        position: "absolute",
        top: `${((C(l).rowIndex || 0) - 1) * C(g) + 8}px`,
        left: `${p.value}px`,
        width: `${k.value - p.value}px`,
        height: "24px",
        zIndex: f.value ? 3 : 2
      }),
      onMousedown: b,
      onClick: b,
      onDblclick: b,
      onMouseenter: b,
      onMouseleave: b,
      onContextmenu: b
    }, [
      M("div", Zt, [
        H(B.$slots, "default", { bar: C(l) }, () => [
          M("div", null, N(c.value.label || ""), 1),
          c.value.html ? (O(), D("div", {
            key: 0,
            innerHTML: c.value.html
          }, null, 8, Jt)) : V("", !0)
        ])
      ]),
      c.value.hasHandles ? (O(), D(Q, { key: 0 }, [
        M("div", {
          class: "g-gantt-bar-handle-left",
          style: $({
            background: C(l).colorCode || "rgba(255, 255, 255, 0.5)"
          })
        }, null, 4),
        M("div", {
          class: "g-gantt-bar-handle-right",
          style: $({
            background: C(l).colorCode || "rgba(255, 255, 255, 0.5)"
          })
        }, null, 4)
      ], 64)) : V("", !0)
    ], 46, Kt));
  }
});
const tn = /* @__PURE__ */ X({
  __name: "GGanttRow",
  props: {
    label: {},
    bars: {},
    highlightOnHover: { type: Boolean },
    standardWorkeHours: {}
  },
  emits: ["drop"],
  setup(t, { emit: u }) {
    const n = t, { rowHeight: o, colors: g, labelColumnTitle: l } = R(), { highlightOnHover: s } = le(n), e = I(!1), a = j(() => ({
      height: `${o.value * Math.max(...n.bars.map((c) => c.rowIndex))}px`,
      background: (s == null ? void 0 : s.value) && e.value ? g.value.hoverHighlight : null
    })), { mapPositionToTime: r } = de(), i = I(null);
    ie(Fe, i);
    const f = (c) => {
      var b;
      const m = (b = i.value) == null ? void 0 : b.getBoundingClientRect();
      if (!m) {
        console.error("Vue-Ganttastic: failed to find bar container element for row.");
        return;
      }
      const _ = c.clientX - m.left, h = r(_);
      u("drop", { e: c, datetime: h });
    };
    return (c, m) => (O(), D(Q, null, [
      M("div", {
        class: "g-gantt-row",
        style: $(a.value),
        onDragover: m[0] || (m[0] = at((_) => e.value = !0, ["prevent"])),
        onDragleave: m[1] || (m[1] = (_) => e.value = !1),
        onDrop: m[2] || (m[2] = (_) => f(_)),
        onMouseover: m[3] || (m[3] = (_) => e.value = !0),
        onMouseleave: m[4] || (m[4] = (_) => e.value = !1)
      }, [
        M("div", ot({
          ref_key: "barContainer",
          ref: i,
          class: "g-gantt-row-bars-container"
        }, c.$attrs), [
          Ce(st, {
            name: "bar-transition",
            tag: "div"
          }, {
            default: q(() => [
              (O(!0), D(Q, null, ee(c.bars, (_, h) => (O(), te(en, {
                key: _.ganttBarConfig.id,
                index: h,
                bar: _
              }, {
                default: q(() => [
                  H(c.$slots, "bar-label", { bar: _ })
                ]),
                _: 2
              }, 1032, ["index", "bar"]))), 128))
            ]),
            _: 3
          })
        ], 16)
      ], 36),
      Ce(Vt, { "standard-worke-hours": c.standardWorkeHours }, {
        "upper-timeunit": q(({ label: _, value: h, date: b }) => [
          H(c.$slots, "upper-timeunit", {
            label: _,
            value: h,
            date: b
          })
        ]),
        timeunit: q(({ label: _, value: h, date: b }) => [
          H(c.$slots, "timeunit", {
            label: _,
            value: h,
            date: b
          })
        ]),
        _: 3
      }, 8, ["standard-worke-hours"])
    ], 64));
  }
});
function nn() {
  G.extend(ut), G.extend(ct), G.extend(dt), G.extend(ht), G.extend(ft), G.extend(lt), G.extend(gt), G.locale("zh-cn");
}
const sn = {
  install(t, u) {
    nn(), t.component("GGanttChart", zt), t.component("GGanttRow", tn);
  }
};
function Z(t, u = "top") {
  if (!t || typeof document > "u")
    return;
  const n = document.head, o = document.createElement("style");
  u === "top" && n.firstChild ? n.insertBefore(o, n.firstChild) : n.appendChild(o), o.appendChild(document.createTextNode(t));
}
Z(`
.g-gantt-chart {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
.with-column {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}
.g-gantt-rows-container {
  position: relative;
}
.labels-in-column {
  display: flex;
  flex-direction: row;
}
/* .g-timeunits-container .g-timeunit:last-child,
.g-people-hour-container .g-timeunit:last-child {
  display: none;
} */
`, "top");
Z(`
.g-gantt-row {
  width: 100%;
  transition: background 0.4s;
  position: relative;
}
.g-gantt-row > .g-gantt-row-bars-container {
  position: relative;
  width: 100%;
}
.g-gantt-row-label {
  position: absolute;
  top: 0;
  left: 0px;
  padding: 0px 8px;
  display: flex;
  align-items: center;
  height: 60%;
  min-height: 20px;
  font-size: 0.8em;
  font-weight: bold;
  border-bottom-right-radius: 6px;
  background: #f2f2f2;
  z-index: 3;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.6);
}
.bar-transition-leave-active,
.bar-transition-enter-active {
  transition: all 0.2s;
}
.bar-transition-enter-from,
.bar-transition-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
`, "top");
Z(`
.g-grid-container {
  position: absolute;
  top: 0;
  left: 0%;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
}
.g-grid-line {
  width: 1px;
  height: 100%;
  border-left: 1px solid #eaeaea;
}
`, "top");
Z(`
.g-grid-current-time {
  position: absolute;
  height: 100%;
  display: flex;
  z-index: 5;
  pointer-events: none;
}
.g-grid-current-time-marker {
  width: 0px;
  height: calc(100% - 2px);
  display: flex;
}
.g-grid-current-time-text {
  font-size: x-small;
  font-size: 10px;
  color: #fff;
}
`, "top");
Z(`
.g-label-column {
  display: flex;
  align-items: center;
  flex-direction: column;
  color: rgb(64, 64, 64);
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-size: 0.9em;
}
.g-label-column-header {
  width: 100%;
  height: 80px;
  min-height: 80px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 5px;
}
.g-label-column-rows {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 5px;
}
.g-label-column-row {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0.1rem 0.3rem;
  overflow: hidden;
  white-space: normal;
  box-sizing: border-box;
  text-align: center;
  align-items: center;
  justify-content: center;
}
.g-label-column-row:last-child {
  border-bottom-left-radius: 5px;
}
`, "top");
Z(`
.g-gantt-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #23c69f;
  border-radius: 16px;
  transition: transform 0.3s;
}
.g-gantt-bar-label {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 14px 0 14px; /* 14px is the width of the handle */
  display: flex;
  justify-content: center;
  align-items: center;
}
.g-gantt-bar-label > * {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.g-gantt-bar-handle-left,
.g-gantt-bar-handle-right {
  position: absolute;
  width: 12px;
  height: 100%;
  opacity: 0.8;
  border-radius: 0px;
  cursor: ew-resize;
  top: 0;
}
.g-gantt-bar-handle-left::before,
.g-gantt-bar-handle-right::before {
  position: absolute;
  top: calc(50% - 5px);
  left: calc(50% - 1px);
  display: block;
  content: "";
  height: 10px;
  width: 2px;
  background: #fff;
  z-index: 0;
}
.g-gantt-bar-handle-left {
  left: 0;
  border-radius: 16px 0 0 16px;
}
.g-gantt-bar-handle-right {
  right: 0;
  border-radius: 0 16px 16px 0;
}
.g-gantt-bar-label img {
  pointer-events: none;
}
`, "top");
Z(`
.g-timeaxis {
  position: sticky;
  top: 0;
  width: 100%;
  height: 72px;
  background: white;
  z-index: 4;
  display: flex;
  flex-direction: column;
}
.g-timeunits-container {
  display: flex;
  width: 100%;
  height: 50%;
}
.g-timeunits-container .g-timeunit:last-child {
  display: none;
}
.g-timeunit {
  height: 100%;
  font-size: 65%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.g-upper-timeunit {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}
.g-timeaxis-hour-pin {
  width: 1px;
  height: 10px;
}
`, "top");
Z(`
.g-people-work-hour[data-v-c17e3b77] {
  position: sticky;
  top: 0;
  width: 100%;
  height: 72px;
  background: white;
  z-index: 4;
  display: flex;
  flex-direction: column;
}
.g-people-work-hour-container[data-v-c17e3b77] {
  display: flex;
  width: 100%;
  height: 100%;
}
.g-people-work-hour-container .g-timeunit[data-v-c17e3b77]:last-child {
  display: none;
}
.g-timeunit[data-v-c17e3b77] {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.g-timeunit_hour[data-v-c17e3b77],
.g-timeunit_count[data-v-c17e3b77] {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50%;
}
.count[data-v-c17e3b77] {
  font-weight: 400;
}
.count-up[data-v-c17e3b77] {
  color: #e12137;
}
.count-down[data-v-c17e3b77] {
  color: green;
}
`, "top");
export {
  zt as GGanttChart,
  tn as GGanttRow,
  sn as default,
  nn as extendDayjs,
  sn as ganttastic
};
