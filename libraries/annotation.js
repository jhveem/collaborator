const ANNOTATOR = {
  genId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  getPathTo(elm) {
    var allNodes = document.getElementsByTagName('*');
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
      if (elm.hasAttribute('id')) {
        var uniqueIdCount = 0;
        for (var n = 0; n < allNodes.length; n++) {
          if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
          if (uniqueIdCount > 1) break;
        };
        if (uniqueIdCount == 1) {
          segs.unshift('id("' + elm.getAttribute('id') + '")');
          return segs.join('/');
        } else {
          segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
        }
      } else if (elm.hasAttribute('class')) {
        segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
      } else {
        console.log('else');
        for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
          if (sib.localName == elm.localName) i++;
        };
        segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
      };
    };
    return segs.length ? '/' + segs.join('/') : null;
  },

  getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  },

  highlightRange(range, classId, color) {
    let className = 'canvas-collaborator-highlight-id-' + classId;
    var newNode = document.createElement("div");
    newNode.setAttribute(
      "style",
      "background-color: " + color + "; display: inline;"
    );
    newNode.classList.add(className);
    range.surroundContents(newNode);
  },

  getSafeRanges(dangerous) {
    var a = dangerous.commonAncestorContainer;
    // Starts -- Work inward from the start, selecting the largest safe range
    var s = new Array(0),
      rs = new Array(0);
    if (dangerous.startContainer != a)
      for (var i = dangerous.startContainer; i != a; i = i.parentNode)
        s.push(i);
    if (0 < s.length)
      for (var i = 0; i < s.length; i++) {
        var xs = document.createRange();
        if (i) {
          let start = s[i - 1];
          let end = s[i].lastChild;
          xs.setStartAfter(s[i - 1]);
          xs.setEndAfter(s[i].lastChild);
        } else {
          xs.setStart(s[i], dangerous.startOffset);
          xs.setEndAfter(
            (s[i].nodeType == Node.TEXT_NODE) ?
            s[i] : s[i].lastChild
          );
        }
        rs.push(xs);
      }

    // Ends -- basically the same code reversed
    var e = new Array(0),
      re = new Array(0);
    if (dangerous.endContainer != a)
      for (var i = dangerous.endContainer; i != a; i = i.parentNode)
        e.push(i);
    if (0 < e.length)
      for (var i = 0; i < e.length; i++) {
        var xe = document.createRange();
        if (i) {
          xe.setStartBefore(e[i].firstChild);
          xe.setEndBefore(e[i - 1]);
        } else {
          xe.setStartBefore(
            (e[i].nodeType == Node.TEXT_NODE) ?
            e[i] : e[i].firstChild
          );
          xe.setEnd(e[i], dangerous.endOffset);
        }
        re.unshift(xe);
      }

    // Middle -- the uncaptured middle
    if ((0 < s.length) && (0 < e.length)) {
      var xm = document.createRange();
      xm.setStartAfter(s[s.length - 1]);
      xm.setEndBefore(e[e.length - 1]);
    } else {
      return [dangerous];
    }

    // Concat
    rs.push(xm);
    response = rs.concat(re);

    // Send to Console
    return response;
  },

  genSaveableRange(range) {
    let data = {};
    data.start = range.startOffset;
    data.end = range.endOffset;
    console.log(data.startContainer);
    data.startContainer = ANNOTATOR.getPathTo(range.startContainer);
    console.log(data.endContainer);
    data.endContainer = ANNOTATOR.getPathTo(range.endContainer);
    return data;
  },

  rangeFromRangeData(rangeData) {
    let range = document.createRange();
    let startNode = ANNOTATOR.getElementByXpath(rangeData.startContainer);
    console.log(rangeData.startContainer);
    console.log(startNode);
    let endNode = ANNOTATOR.getElementByXpath(rangeData.endContainer);
    console.log(rangeData.endContainer);
    console.log(endNode);
    range.setStart(startNode, rangeData.startOffset);
    range.setEnd(endNode, rangeData.endOffset);
    return range;
  },

  highlightSelection() {
    var userSelection = window.getSelection().getRangeAt(0);
    var safeRanges = ANNOTATOR.getSafeRanges(userSelection);
    let classId = ANNOTATOR.genId();
    for (var i = 0; i < safeRanges.length; i++) {
      let range = safeRanges[i];
      if (range.toString() !== "" && range.toString().match(/\w+/g) !== null) {
        console.log("BEGIN RANGE DATA");
        console.log(range);
        let rangeData = ANNOTATOR.genSaveableRange(range);
        let eRange = ANNOTATOR.rangeFromRangeData(rangeData);
        ANNOTATOR.highlightRange(eRange, classId, "#F66");
      }
    }
  }
}