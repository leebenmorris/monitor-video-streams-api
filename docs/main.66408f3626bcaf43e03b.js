(window.webpackJsonp = window.webpackJsonp || []).push([
    [0],
    {
        0: function(e, t) {},
        '6vWD': function(e, t, n) {
            var r = n('Xnvd');
            'string' == typeof r && (r = [[e.i, r, '']]);
            var o = { insert: 'head', singleton: !1 };
            n('LboF')(r, o);
            r.locals && (e.exports = r.locals);
        },
        'Xnvd': function(e, t, n) {
            (e.exports = n('JPst')(!1)).push([
                e.i,
                "div[id='player'] {\n    display: inline-block;\n}\n\np[id$='info'] {\n    font-family: Tahoma, Geneva, sans-serif;\n    text-align: center;\n}\n\nspan[id$='messages'] {\n    padding: 0px 20px 0px 20px;\n    font-family: Tahoma, Geneva, sans-serif;\n    text-align: center;\n}\n",
                '',
            ]);
        },
        'uFrU': function(e, t, n) {
            function r(e, t) {
                var n = Object.keys(e);
                if (Object.getOwnPropertySymbols) {
                    var r = Object.getOwnPropertySymbols(e);
                    t &&
                        (r = r.filter(function(t) {
                            return Object.getOwnPropertyDescriptor(e, t).enumerable;
                        })),
                        n.push.apply(n, r);
                }
                return n;
            }
            function o(e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = null != arguments[t] ? arguments[t] : {};
                    t % 2
                        ? r(n, !0).forEach(function(t) {
                              a(e, t, n[t]);
                          })
                        : Object.getOwnPropertyDescriptors
                        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                        : r(n).forEach(function(t) {
                              Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                          });
                }
                return e;
            }
            function a(e, t, n) {
                return (
                    t in e
                        ? Object.defineProperty(e, t, {
                              value: n,
                              enumerable: !0,
                              configurable: !0,
                              writable: !0,
                          })
                        : (e[t] = n),
                    e
                );
            }
            function c(e, t) {
                return (
                    (function(e) {
                        if (Array.isArray(e)) return e;
                    })(e) ||
                    (function(e, t) {
                        if (
                            !(
                                Symbol.iterator in Object(e) ||
                                '[object Arguments]' === Object.prototype.toString.call(e)
                            )
                        )
                            return;
                        var n = [],
                            r = !0,
                            o = !1,
                            a = void 0;
                        try {
                            for (
                                var c, i = e[Symbol.iterator]();
                                !(r = (c = i.next()).done) &&
                                (n.push(c.value), !t || n.length !== t);
                                r = !0
                            );
                        } catch (e) {
                            (o = !0), (a = e);
                        } finally {
                            try {
                                r || null == i.return || i.return();
                            } finally {
                                if (o) throw a;
                            }
                        }
                        return n;
                    })(e, t) ||
                    (function() {
                        throw new TypeError('Invalid attempt to destructure non-iterable instance');
                    })()
                );
            }
            var i = n('gFX4');
            n('6vWD');
            var s = {},
                u = {},
                d = {},
                l = {
                    '-1': 'notStarted',
                    0: 'ended',
                    1: 'playing',
                    2: 'paused',
                    3: 'buffering',
                    5: 'cued',
                },
                p = function(e) {
                    return 'player_'.concat(e + 1);
                },
                f = function(e) {
                    return ''.concat(e, '_info');
                },
                y = function() {
                    return document.getElementsByTagName('script')[0];
                },
                m = function(e, t) {
                    return (document.getElementById(e).textContent = t);
                },
                g = function(e, t) {
                    return t.parentNode.insertBefore(e, t);
                };
            function v(e, t) {
                var n = t.target.a.id;
                m(f(n), ''.concat(n, ': ready')), e.emit('playerStatus', [n, 'ready']);
            }
            function b(e, t) {
                var n = t.target.a.id,
                    r = l[t.data];
                m(f(n), ''.concat(n, ': ').concat('paused' === r ? 'PAUSED' : r)),
                    e.disconnected && t.target.pauseVideo(),
                    e.emit('playerStatus', [n, r]);
            }
            s = i('https://monitor-video-streams-api.herokuapp.com')
                .on('error', function(e) {
                    m('socket-messages', 'socket.io Error: '.concat(JSON.stringify(e, null, 4)));
                })
                .on('connect_error', function(e) {
                    m('socket-messages', 'socket.io Error: '.concat(JSON.stringify(e, null, 4)));
                })
                .on('connect', function() {
                    Object.entries(d).forEach(function(e) {
                        var t = c(e, 2),
                            n = t[0];
                        'playing' === t[1] && u[n].playVideo();
                    }),
                        m('socket-messages', 'Connected to: '.concat(s.id));
                })
                .on('playerControl', function(e) {
                    var t = c(e, 2),
                        n = t[0],
                        r = t[1];
                    u[n][r](),
                        m('socket-messages', 'playerControl received: '.concat(n, ' ').concat(r));
                })
                .on('disconnect', function() {
                    Object.entries(u).forEach(function(e) {
                        var t = c(e, 2),
                            n = t[0],
                            r = t[1],
                            o = l[r.getPlayerState()];
                        (d[n] = o), r.pauseVideo();
                    }),
                        m(
                            'socket-messages',
                            'Disconnected from socket.io server, so all videos paused',
                        );
                });
            var h = document.createElement('script');
            h.src = 'https://www.youtube.com/iframe_api';
            var w = y();
            g(h, w),
                (window.onYouTubeIframeAPIReady = function() {
                    m('player-messages', 'YouTube iFrame API Ready');
                    var e = y();
                    !(function t() {
                        var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;
                        s.connected
                            ? (m('socket-messages', 'Connected to: '.concat(s.id)),
                              (n = 1),
                              s.emit('getVideoList', function(t) {
                                  t.forEach(function(t, n) {
                                      var r = p(n),
                                          a = f(r),
                                          c = document.createElement('div');
                                      c.setAttribute('id', 'player');
                                      var i = document.createElement('p');
                                      i.setAttribute('id', a), c.appendChild(i);
                                      var d = document.createElement('div');
                                      d.setAttribute('id', r),
                                          c.appendChild(d),
                                          g(c, e),
                                          (u[r] = new YT.Player(
                                              r,
                                              o(
                                                  {
                                                      events: {
                                                          onReady: v.bind(null, s),
                                                          onStateChange: b.bind(null, s),
                                                      },
                                                  },
                                                  t,
                                              ),
                                          ));
                                  });
                              }))
                            : setTimeout(function() {
                                  m(
                                      'socket-messages',
                                      'Socket disconnected: retry attempt '.concat(n),
                                  ),
                                      t(n + 1);
                              }, 200);
                    })();
                });
        },
    },
    [
        [
            'uFrU',
            27,
            22,
            12,
            13,
            7,
            1,
            2,
            3,
            4,
            5,
            6,
            8,
            9,
            10,
            11,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            24,
            25,
            26,
            23,
        ],
    ],
]);
