function init_FastScrollButtons() {
	
	var gap = document.getElementsByClassName("CodeMirror-merge-gap");

	var buttonTop = document.createElement("BUTTON");
		buttonTop.setAttribute("class", "CodeMirror-FastScroll-Button CodeMirror-FastScroll-TopButton");
		buttonTop.setAttribute("id", "buttonPrev");
		buttonTop.setAttribute("title", "Scroll to previous difference");
		buttonTop.setAttribute("onclick", "scrollPrev()");
		buttonTop.style.display = "block";
		buttonTop.innerHTML = "Prev";
		
	var buttonBottom = document.createElement("BUTTON");
		buttonBottom.setAttribute("class", "CodeMirror-FastScroll-Button CodeMirror-FastScroll-BottomButton");
		buttonBottom.setAttribute("id", "buttonNext");
		buttonBottom.setAttribute("title", "Scroll to next difference");
		buttonBottom.setAttribute("onclick", "scrollNext();");
		buttonBottom.innerHTML = "Next";
		buttonBottom.style.display = "block";

		gap[0].appendChild(buttonTop);
		gap[0].appendChild(buttonBottom);
		
	var collapseButton = document.createElement("BUTTON");
		collapseButton.setAttribute("class", "CodeMirror-FastScroll-Button CodeMirror-FastScroll-CollapseButton");
		collapseButton.setAttribute("id", "buttonCollapse");
		collapseButton.setAttribute("onclick", "collapseExpand();");
		if (collapse) {
			collapseButton.setAttribute("title", "Expand identical codelines");
			collapseButton.innerHTML = "Expand";
		} else {
			collapseButton.setAttribute("title", "Collapse identical codelines");
			collapseButton.innerHTML = "Collapse";
		}
		collapseButton.style.display = "block";
		document.getElementById("HActual").appendChild(collapseButton);
	
	matches = [];	
	
	FSB_update();
	init_annotations();

	CodeMirror.on(dv.edit.display.scroller, "scroll", function() {
		FSB_update();
		annotation.update(getMatches());
	});

	CodeMirror.on(dv.edit.doc, "change", function() {
		tryUpdateAnnotations(0);
	});
	
	if (collapse == true) {
		dv.edit.state.diffViews[0].forceUpdate();
	}
	
}

function collapseExpand() {
	document.getElementById('buttonCollapse').remove();
	collapse = !collapse;
	initUI();
	init_FastScrollButtons();
}

function tryUpdateAnnotations(currentTry) {
	var maxtries = 5;
	var timeout = 100; //ms
	var matchesOrig = matches;
	var matchesUpdated = getMatches();
	if (currentTry < maxtries) {
		if (matchesOrig.toJSON() == matchesUpdated.toJSON()) {
			setTimeout(function() {
				tryUpdateAnnotations(currentTry+1);
			}, timeout);
		}
		else {
			annotation.update(matchesUpdated);
			FSB_update();
		}
	}
}


function init_annotations() {
	
	var annotateOptions = {className: "CodeMirror-search-match", listenForChanges: false};
	annotation = dv.edit.annotateScrollbar(annotateOptions);
	
	annotation.update(getMatches());
}
function getMatches() {
	matches = [];
	var chunks = dv.edit.state.diffViews[0].chunks;
	for (var i = 0; i < chunks.length; i++) {
		var posFrom = CodeMirror.Pos(chunks[i].editFrom, 0);
		var posTo   = CodeMirror.Pos(chunks[i].editTo, 0);
		matches[i] = {from: posFrom, to: posTo};
	}
	return  matches;
}

function scrollPrev() {
	var scrol = dv.edit.display.scroller;
	var viewtop = scrol.scrollTop;
	var linetop = dv.edit.lineAtHeight(viewtop, "local") + 1;
	dv.edit.setCursor(linetop, 0);
	
	CodeMirror.commands.goPrevDiff(dv.edit);
}

function scrollNext() {
	var scrol = dv.edit.display.scroller;
	var viewbottom = scrol.scrollTop + scrol.clientHeight;
	var linebottom = dv.edit.lineAtHeight(viewbottom, "local") - 2;
	dv.edit.setCursor(linebottom, 0);
	
	CodeMirror.commands.goNextDiff(dv.edit);
}

function toggleButtonNext(mode) {
	var button = document.getElementById("buttonNext");
	if (mode == "off") {
		button.style.display = "none";
	} else if (mode == "on") {
		button.style.display = "block";
	}
}

function toggleButtonPrev(mode) {
	var button = document.getElementById("buttonPrev");
	if (mode == "off") {
		button.style.display = "none";
	} else if (mode == "on") {
		button.style.display = "block";
	}
}

function FSB_update() {
	var scrol = dv.edit.display.scroller;
	
	if (scrol.scrollTop == 0) {
		toggleButtonPrev("off");
	} else {
		var viewtop = scrol.scrollTop;
		var linetop = dv.edit.lineAtHeight(viewtop, "local") + 1;
		if (CodeMirror.commands.existsPrevDiff(dv.edit, linetop) != null) {
			toggleButtonPrev("on");
		} else {
			toggleButtonPrev("off");
		}
	}
	
	if (scrol.scrollTop == (scrol.scrollHeight - scrol.clientHeight) ) {
		toggleButtonNext("off");
	} else {
		var viewbottom = scrol.scrollTop + scrol.clientHeight;
		var linebottom = dv.edit.lineAtHeight(viewbottom, "local") - 2;
		if (CodeMirror.commands.existsNextDiff(dv.edit, linebottom) != null) {
			toggleButtonNext("on");
		} else {
			toggleButtonNext("off");
		}
	}
}

