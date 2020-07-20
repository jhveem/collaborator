//Some way of getting the whole element for those elements where the whole thing is highlighted.
//fix the xpath to jump straight to the #wiki_page_show element and only tracking stuff from there.
const ANNOTATOR = {
  genId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  getPathTo(node) {
    var comp, comps = [];
    var parent = null;
    var xpath = '';
    var getPos = function(node) {
        var position = 1, curNode;
        if (node.nodeType == Node.ATTRIBUTE_NODE) {
            return null;
        }
        for (curNode = node.previousSibling; curNode; curNode = curNode.previousSibling) {
            if (curNode.nodeName == node.nodeName) {
                ++position;
            }
        }
        return position;
     }

    if (node instanceof Document) {
        return '/';
    }

    for (; node && !(node instanceof Document); node = node.nodeType == Node.ATTRIBUTE_NODE ? node.ownerElement : node.parentNode) {
        comp = comps[comps.length] = {};
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                comp.name = 'text()';
                break;
            case Node.ATTRIBUTE_NODE:
                comp.name = '@' + node.nodeName;
                break;
            case Node.PROCESSING_INSTRUCTION_NODE:
                comp.name = 'processing-instruction()';
                break;
            case Node.COMMENT_NODE:
                comp.name = 'comment()';
                break;
            case Node.ELEMENT_NODE:
                comp.name = node.nodeName;
                break;
        }
        comp.position = getPos(node);
    }

    for (var i = comps.length - 1; i >= 0; i--) {
        comp = comps[i];
        xpath += '/' + comp.name;
        if (comp.position != null) {
            xpath += '[' + comp.position + ']';
        }
    }

    return xpath;
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
    data.startOffset = range.startOffset;
    data.endOffset = range.endOffset;
    data.startContainer = ANNOTATOR.getPathTo(range.startContainer);
    data.endContainer = ANNOTATOR.getPathTo(range.endContainer);
    return data;
  },

  rangeFromRangeData(rangeData) {
    let range = document.createRange();
    let startNode = ANNOTATOR.getElementByXpath(rangeData.startContainer);
    console.log("START");
    console.log(rangeData.startContainer);
    console.log(startNode);
    console.log(rangeData.startOffset);
    let endNode = ANNOTATOR.getElementByXpath(rangeData.endContainer);
    console.log(rangeData.endContainer);
    console.log(endNode);
    range.setStart(startNode, rangeData.startOffset);
    range.setEnd(endNode, rangeData.endOffset);
    console.log(range);
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