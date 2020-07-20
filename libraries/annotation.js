const ANNOTATOR = {
  genId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  nextNode(node) {
    if (node.hasChildNodes()) {
      return node.firstChild;
    } else {
      while (node && !node.nextSibling) {
        node = node.parentNode;
      }
      if (!node) {
        return null;
      }
      return node.nextSibling;
    }
  },

  getRangeSelectedNodes(range) {
    var node = range.startContainer;
    var endNode = range.endContainer;

    // Special case for a range that is contained within a single node
    if (node == endNode) {
      return [node];
    }

    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node && node != endNode) {
      rangeNodes.push(node = ANNOTATOR.nextNode(node));
    }

    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer) {
      rangeNodes.unshift(node);
      node = node.parentNode;
    }

    return rangeNodes;
  },

  getSelectedNodes() {
    if (window.getSelection) {
      var sel = window.getSelection();
      if (!sel.isCollapsed) {
        return ANNOTATOR.getRangeSelectedNodes(sel.getRangeAt(0));
      }
    }
    return [];
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

  highlightSelection() {
    var userSelection = window.getSelection().getRangeAt(0);
    var safeRanges = ANNOTATOR.getSafeRanges(userSelection);
    let classId = ANNOTATOR.genId();
    for (var i = 0; i < safeRanges.length; i++) {
      let range = safeRanges[i];
      if (range.toString() !== "" && range.toString().match(/\w+/g) !== null) {
        ANNOTATOR.highlightRange(safeRanges[i], classId, "#F66");
      }
    }
  }
}