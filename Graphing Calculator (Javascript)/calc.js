var WIDTH = 800;
var HEIGHT = 500;
var LINES = 20; // must be even for proper rendering
var STEP = .01;
var c = document.getElementById("graph");
var ctx = c.getContext("2d");
var colors = ["#00688B", "#660000", "#9900CC", "#E68A2E", "#006600", "#FF33CC"];
var current = 0;
var fxMap;

function init() {
    var AXIS_COLOR = "#707070";
    var LINE_COLOR = "#c0c0c0";
    ctx.fillStyle = LINE_COLOR;
    for (var i = 0; i < LINES; i++) {
        ctx.fillRect(WIDTH / LINES * i, 0, 1, HEIGHT);
        ctx.fillRect(0, HEIGHT / LINES * i, WIDTH, 1);
    }
    ctx.fillStyle = AXIS_COLOR;
    ctx.fillRect(WIDTH / 2 - 2, 0, 4, HEIGHT);
    ctx.fillRect(0, HEIGHT / 2 - 2, WIDTH, 4);
    initFx();
}

function plotPoint(x, y, color, width) {
    if (color === undefined) color = colors[0];
    if (width === undefined) width = 2;
    x = WIDTH * (.5 + x / LINES);
    y = HEIGHT * (.5 - y / LINES);
    ctx.fillStyle = color;
    ctx.fillRect(x - width / 2, y - width / 2, width, width);
} // plotting function

function genGraph(fxString) {
    var lastPoint = NaN;
    var lastSlope = NaN;
    var direction = NaN;
    var acceleration = NaN;
    var noRefPt = 0;
    for (var i = -10 / STEP; i < 10 / STEP; i += 1) {
        var x = i * STEP;
        var y = solveStr(reformat(replaceAll(fxString.toLowerCase(), "x", "(" + x + ")")));
        
        /* derivatives */
        var undefinedVal = false;
        if (!isFinite(y) || isNaN(y)) undefinedVal = true;
        
        if (lastPoint != NaN) {
            var slope = (y - lastPoint) / .01;
            if (document.getElementById("first").checked) plotPoint(x, slope, "#000000");
        }
        
        lastPoint = y;
        
        if (direction != NaN) {
            if (slope != 0 && direction != 0) {
                if (slope / Math.abs(slope) != direction / Math.abs(direction)) {
                    if (document.getElementById("extrema").checked) current = (current + 1) % colors.length;
                }
            }
        }
        
        if (slope != 0) direction = slope / Math.abs(slope);
        
        if (lastSlope != NaN) {
            var slope2 = Math.round(((slope) - (lastSlope)) / .01 * 10000000) / 10000000;
            if (document.getElementById("second").checked) plotPoint(x, slope2, "#ff0000");
        }
        
        lastSlope = slope;
        
        if (!undefinedVal) {
            if (slope2 / Math.abs(slope2) != acceleration && !(slope2 == 0 && isNaN(acceleration))) {
                 if (document.getElementById("poi").checked) {
                     if (noRefPt > 2) plotPoint(x, y, "#000000", 10);
                     else noRefPt++;
                 }
            }
        } else {
            noRefPt = 0;
        }
        
        acceleration = slope2 / Math.abs(slope2);
        
        /* end derivative calc */
        
        plotPoint(x, y, colors[current]);
    }
}

function parseFn() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    init();
    var unparsed = document.getElementById("functionString").value;
    
    genGraph(unparsed);
}

function enterCheck(e) {
    if (e.keyCode == 13) {
        parseFn();
        return false;
    }
}

function initFx() {
    fxMap = [];
    fxMap[0] = [];
    fxMap[0][0] = "ln";
    fxMap[0][1] = function(n) { return Math.log(n); };
    fxMap[1] = [];
    fxMap[1][0] = "sin";
    fxMap[1][1] = function(n) { return Math.sin(n); };
    fxMap[2] = [];
    fxMap[2][0] = "cos";
    fxMap[2][1] = function(n) { return Math.cos(n); };
    fxMap[3] = [];
    fxMap[3][0] = "tan";
    fxMap[3][1] = function(n) { return Math.tan(n); };
    fxMap[4] = [];
    fxMap[4][0] = "csc";
    fxMap[4][1] = function(n) { return 1 / Math.sin(n); };
    fxMap[5] = [];
    fxMap[5][0] = "sec";
    fxMap[5][1] = function(n) { return 1 / Math.cos(n); };
    fxMap[6] = [];
    fxMap[6][0] = "cot";
    fxMap[6][1] = function(n) { return 1 / Math.tan(n); };
    fxMap[7] = [];
    fxMap[7][0] = "log";
    fxMap[7][1] = function(n) { return Math.log(n) / Math.LN10; };
    fxMap[8] = [];
    fxMap[8][0] = "abs";
    fxMap[8][1] = function(n) { return Math.abs(n); };
    fxMap[9] = [];
    fxMap[9][0] = "sqrt";
    fxMap[9][1] = function(n) { return Math.sqrt(n); };
    fxMap[10] = [];
    fxMap[10][0] = "round";
    fxMap[10][1] = function(n) { return Math.round(n); };
}

function replaceAll(haystack, needle, replace) {
    return haystack.split(needle).join(replace);
} // replace all fx

function replaceAt(haystack, index, character) {
    return haystack.substr(0, index) + character + haystack.substr(index+character.length);
} // replace single character function

function reformat(s) {
    s = s.toLowerCase();
    s = replaceAll(s, " ", "");
    var pDif = replaceAll(s, ")", "").length - replaceAll(s, "(", "").length;
    for (var i = 0; i < pDif; i++) s = s + ")";
    s = replaceAll(s, "pi", "(" + Math.PI + ")");
    s = replaceAll(s, "e", "(" + Math.E + ")");
    for (var j = 0; j < fxMap.length; j++) {
        s = replaceAll(s, "-" + fxMap[j][0].charAt(0), "-1*" + fxMap[j][0].charAt(0));
        s = replaceAll(s, ")" + fxMap[j][0].charAt(0), ")*" + fxMap[j][0].charAt(0));
    }
    s = replaceAll(s, "-(", "-1*(");
    s = replaceAll(s, ")(", ")*(");
    s = replaceAll(s, "-", "+-");
    s = replaceAll(s, "--", "+");
    s = replaceAll(s, "++", "+");
    s = replaceAll(s, "(+", "(");
    for (var i = 0; i < 10; i++) {
        s = replaceAll(s, i + "(", i + "*" + "(");
        for (var j = 0; j < fxMap.length; j++) {
            s = replaceAll(s, i + fxMap[j][0].charAt(0), i + "*" + fxMap[j][0].charAt(0));
        }
    }
    while(s.charAt(0) == "+") s = s.substr(1);
    return s;
} // standardize string format

function strContain(haystack, needle) {
    return haystack.indexOf(needle) > -1;
} // custom true/false contains

function isParseable(n, minus) {
    return (!isNaN(n) || (n == "-" && !minus) || n == ".");
} // determine if char should be added to side

function getSide(haystack, middle, direction, minus) {
    var i = middle + direction;
    var term = "";
    var limit = (direction == -1) ? 0 : haystack.length; // set the stopping point, when you have gone too far
    while (i * direction <= limit) { // while the current position is >= 0, or <= upper limit
        if (isParseable(haystack[i], minus)) {
            if (direction == 1) term = term + haystack[i];
            else term = haystack[i] + term;
            i += direction;
        } else { return term; }
    }
    return term;
} // general fx to get two terms of any fx (multiply, add, etc)

function allocFx(eq, symbol, alloc, minus) {
    minus = (typeof minus !== 'undefined'); // sometimes we want to capture minus signs, sometimes not
    if (strContain(eq, symbol)) {
        var middleIndex = eq.indexOf(symbol);
        var left = getSide(eq, middleIndex, -1, minus);
        var right = getSide(eq, middleIndex, 1, false);
        eq = replaceAll(eq, left+symbol+right, alloc(left, right));
        reformat(eq);
    }
    return eq;
} // fx to generically map a symbol to a function for parsing

function solveStr(eq) {
    firstNest:
    while (strContain(eq, "(")) {
        var first = eq.indexOf("(");
        var last = first + 1;
        var layer = 1;
        while (layer != 0) {
            if (eq[last] == ")") {
                layer--;
                if (layer == 0) break;
            }
            else if (eq[last] == "(") {
                layer++;
            }
            last++;
            if (last > eq.length) break firstNest;
        }
        var nested = eq.substr(first + 1, last - first - 1);
        if (last + 1 <= eq.length) {
            if (eq[last + 1] == "^") {
                eq = replaceAt(eq, last + 1, "&");
            }
        }
        var solvedStr = solveStr(nested);
        var preStr = "(" + nested + ")";
        
        if (first - 2 >= 0) {
            if (eq.charAt(first - 1).toUpperCase() != eq.charAt(first - 1) && eq.charAt(first - 2).toUpperCase() != eq.charAt(first - 2)) { // quick test
                for (var i = 0; i < fxMap.length; i++) {
                    if (first - fxMap[i][0].length >= 0) {
                        if (eq.substr(first - fxMap[i][0].length, fxMap[i][0].length) == fxMap[i][0]) {
                            solvedStr = fxMap[i][1](solvedStr);
                            preStr = fxMap[i][0] + preStr;
                            break;
                        }
                    } else break;
                }
            }
        }
        
        eq = eq.replace(preStr, solvedStr);
    }
    while (strContain(eq, "^")) eq = allocFx(eq, "^", function(l, r) { console.log(r);return Math.pow(parseFloat(l),parseFloat(r)); }, false);
    while (strContain(eq, "&")) eq = allocFx(eq, "&", function(l, r) { return Math.pow(parseFloat(l),parseFloat(r)); });
    while (strContain(eq, "*") || strContain(eq, "/")) {
        var multiply = true;
        if (eq.indexOf("*") < eq.indexOf("/")) {
            multiply = (strContain(eq, "*"));
        } else {
            multiply = !(strContain(eq, "/"));
        }
        eq = (multiply) ? allocFx(eq, "*", function(l, r) { return parseFloat(l)*parseFloat(r); }) : allocFx(eq, "/", function(l, r) { return parseFloat(l)/parseFloat(r); });
    }
    while (strContain(eq, "+")) eq = allocFx(eq, "+", function(l, r) { return parseFloat(l)+parseFloat(r); });
    return eq;
} // main recursive fx + PEMDAS


init();