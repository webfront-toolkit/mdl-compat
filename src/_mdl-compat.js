/*
   Copyright 2015 Maciej Chałapuk

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// requires Function.prototype.bind
// requires Window.prototype.getComputedStyle

module.exports = function(window) {
  'use strict';

  if (!isFlexWrapSupported()) {
    window.addEventListener('load', function init() {
      arrayify(document.querySelectorAll('.mdl-grid')).forEach(upgradeGrid);
      window.removeEventListener('load', init);
    });
  }

  return; //

  function isFlexWrapSupported() {
    var style = document.body.style;
    return ('flexWrap' in style || 'webkitFlexWrap' in style || 'msFlexWrap' in style);
  }

  function upgradeGrid(grid) {
    grid.classList.add('mdl-compat');
    var cells = arrayify(grid.querySelectorAll('.mdl-cell'));
    grid.updateMdlGrid = updateGrid.bind(null, grid, cells);
    window.addEventListener('resize', grid.updateMdlGrid.bind(grid));
    grid.updateMdlGrid();
  }

  function updateGrid(grid, cells) {
    cells.forEach(resetStyles);
    var rows = groupByRow(cells);
    var heights = rows.map(getHeightFromRow);

    // if grid has fixed height, we want to fill it whole
    if (hasFixedHeight(grid)) {
      var allRowsHeight = heights.reduce(add, 0);
      heights = heights.map(function(h) {return h/allRowsHeight * grid.offsetHeight; });
    }

    rows.forEach(function(row, i) {
      setCellsHeightAndPosition(row, heights[i]);
    });
  }

  function resetStyles(cell) {
    cell.style.height = null;
    cell.style.top = null;
  }

  function groupByRow(cells) {
    var cellsByRow = [];
    var row;
    var offsetTop = 0;

    cellsByRow.push(row = []);

    cells.forEach(function(cell) {
      if (cell.offsetTop > offsetTop) {
        cellsByRow.push(row = []);
        offsetTop = cell.offsetTop;
      }
      row.push(cell);
    });
    return cellsByRow;
  }

  function getHeightFromRow(row) {
    var height = 0;
    row.forEach(function(cell) {
      cell.style.height = null;
      if (cell.offsetHeight > height) {
        height = cell.offsetHeight;
      }
    });
    return height;
  }

  function setCellsHeightAndPosition(row, height) {
    row.forEach(function(cell) {
      var cl = cell.classList;
      if (cl.contains('mdl-cell--top')) {
        cell.style.top = '0px';
      } else if (cl.contains('mdl-cell--middle')) {
        cell.style.top = ((height - cell.offsetHeight) / 2) +'px';
      } else if (cl.contains('mdl-cell--bottom')) {
        cell.style.top = (height - cell.offsetHeight) +'px';
      } else {
        // if not top/middle/bottom, cell should fill whole height of the row
        cell.style.height = (height +'px');
      }
    });
  }

  function hasFixedHeight(elem) {
    return window.getComputedStyle(elem, null).getPropertyValue('height');
  }

  // helper functions

  function arrayify(nl) {
    var arr = new Array(nl.length);
    for (var i = -1, l = nl.length; i !== l; ++i) {
      arr[i] = nl[i];
    }
    return arr;
  }

  function add(a, b) {
    return a + b;
  }
};

