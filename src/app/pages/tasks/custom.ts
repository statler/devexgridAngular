export { _updateColumnsWidthIfNeeded,_moveSeparator} // this will make it module
// import {  } from '../../../../node_modules/devextreme/utils';
import { from } from "linq-to-typescript"
import { addNamespace, eventData as getEventData, isTouchEvent } from '../../../../node_modules/devextreme/esm/events/utils/index';
import {
    getHeight, getWidth,
    setHeight, setWidth,
  } from '../../../../node_modules/devextreme/esm/core/utils/size';

function   _updateColumnsWidthIfNeeded(posX) {
    let deltaX;
    let needUpdate = false;
    let contentWidth = this._rowsView.contentWidth();
    const resizingInfo = this._resizingInfo;
    const columnsController = this._columnsController;
    const visibleColumns = columnsController.getVisibleColumns();
    const columnsSeparatorWidth = this._columnsSeparatorView.width();
    const isNextColumnMode = false;
    const isScaleMode = true;
    const adaptColumnWidthByRatio = isNextColumnMode && this.option('adaptColumnWidthByRatio') && !this.option('columnAutoWidth');
    const rtlEnabled = this.option('rtlEnabled');
    const isRtlParentStyle = this._isRtlParentStyle();
    const column = visibleColumns[resizingInfo.currentColumnIndex];
    const nextColumn = visibleColumns[resizingInfo.nextColumnIndex];

    function isPercentWidth(width) {
        return false;
    //   return isString(width) && width.endsWith('%');
    }

    function setColumnWidth(column, columnWidth, contentWidth, adaptColumnWidthByRatio) {
      if (column) {
        const oldColumnWidth = column.width;
        if (oldColumnWidth) {
          adaptColumnWidthByRatio = isPercentWidth(oldColumnWidth);
        }

        if (adaptColumnWidthByRatio) {
          columnsController.columnOption(column.index, 'visibleWidth', columnWidth);
          columnsController.columnOption(column.index, 'width', `${(columnWidth / contentWidth * 100).toFixed(3)}%`);
        } else {
          columnsController.columnOption(column.index, 'visibleWidth', null);
          columnsController.columnOption(column.index, 'width', columnWidth);
        }
      }
    }

    function correctContentWidth(contentWidth, visibleColumns) {
      const allColumnsHaveWidth = visibleColumns.every((column) => column.width);

      if (allColumnsHaveWidth) {
        const totalPercent = visibleColumns.reduce((sum, column) => {
          if (isPercentWidth(column.width)) {
            sum += parseFloat(column.width);
          }
          return sum;
        }, 0);

        if (totalPercent > 100) {
          contentWidth = contentWidth / totalPercent * 100;
        }
      }

      return contentWidth;
    }

    function calculateCellWidths(delta) {
      let nextMinWidth;
      let nextCellWidth;
      let needCorrectionNextCellWidth;
      const cellWidth = resizingInfo.currentColumnWidth + delta;
      const minWidth = column && column.minWidth || columnsSeparatorWidth;
      const result: any = {};

      if (cellWidth >= minWidth) {
        result.cellWidth = cellWidth;
      } else {
        result.cellWidth = minWidth;
        needCorrectionNextCellWidth = true;
      }

      if (isNextColumnMode) {
        nextCellWidth = resizingInfo.nextColumnWidth - delta;
        nextMinWidth = nextColumn && nextColumn.minWidth || columnsSeparatorWidth;

        if (nextCellWidth >= nextMinWidth) {
          if (needCorrectionNextCellWidth) {
            result.nextCellWidth = resizingInfo.nextColumnWidth - (delta + minWidth - cellWidth);
          } else {
            result.nextCellWidth = nextCellWidth;
          }
        } else {
          result.nextCellWidth = nextMinWidth;
          result.cellWidth = resizingInfo.currentColumnWidth + (delta - nextMinWidth + nextCellWidth);
        }
      }

      return result;
    }

    deltaX = posX - resizingInfo.startPosX;

    if ((isNextColumnMode || isRtlParentStyle) && rtlEnabled) {
      deltaX = -deltaX;
    }

    let { cellWidth, nextCellWidth } = calculateCellWidths(deltaX);

    needUpdate = column.width !== cellWidth;

    if (needUpdate) {
      columnsController.beginUpdate();

      cellWidth = Math.floor(cellWidth);

      contentWidth = correctContentWidth(contentWidth, visibleColumns);

      const columnWidths = this._columnHeadersView.getColumnWidths();
      var totalWidth = columnWidths.reduce((totalWidth, width) => totalWidth + width, 0);
      setColumnWidth(column, cellWidth, contentWidth, adaptColumnWidthByRatio);

      if (isNextColumnMode) {
        nextCellWidth = Math.floor(nextCellWidth);
        setColumnWidth(nextColumn, nextCellWidth, contentWidth, adaptColumnWidthByRatio);
      } 
      else if (isScaleMode)
      {
        const columnWidths : [] = this._columnHeadersView.getColumnWidths();
        var leftColSum = columnWidths.slice(0,resizingInfo.currentColumnIndex).reduce((totalWidth, width) => totalWidth + width, 0);
        var rightCols = columnWidths.slice(resizingInfo.currentColumnIndex+1);
        var rightColSum = rightCols.reduce((totalWidth, width) => totalWidth + width, 0);
        // var totalWidth = leftColSum + rightColSum + columnWidths[resizingInfo.currentColumnIndex];
        var b = [];
        for (let i = 0 ; i< columnWidths.length;i++)
        {
            if (i>resizingInfo.currentColumnIndex)
            {
                var currWidth = columnWidths[i];
                var newwidth = currWidth - (deltaX * currWidth/rightColSum);
                var col = visibleColumns[i];
                // cellWidth = Math.floor(newwidth);  
                let cellCw = this._rowsView.contentWidth();        
                cellCw = correctContentWidth(cellCw, visibleColumns);
                // setColumnWidth(col, newwidth, cellCw, adaptColumnWidthByRatio);

                columnsController.columnOption(i, 'visibleWidth', null);
                columnsController.columnOption(i, 'width',  newwidth);
                b.push(newwidth);
            }
        }
        console.log(rightCols);
        console.log(b);


    //           var gridCols = <Array<any>>_grid['getVisibleColumns']();
    //         var opCols = from(visibleColumns).where(x =>  this.getWidth(x) && !(this.getWidth(x).isNaN)).toArray();
    //         var opColIds = opCols.map(x => x.headerId);
    //   var docColElements = document.querySelectorAll('[role="columnheader"]');
    //   var docCols = from(docColElements).where(x => opColIds.includes(x.id)).toArray();
    //   var totalWidth = from(docCols).select(x => x.clientWidth).sum() as number;
      }
      else {
        const columnWidths = this._columnHeadersView.getColumnWidths();
        columnWidths[resizingInfo.currentColumnIndex] = cellWidth;
        const hasScroll = columnWidths.reduce((totalWidth, width) => totalWidth + width, 0) > this._rowsView.contentWidth();
        if (!hasScroll) {
          const lastColumnIndex = getLastResizableColumnIndex(visibleColumns);
          if (lastColumnIndex >= 0) {
            columnsController.columnOption(visibleColumns[lastColumnIndex].index, 'visibleWidth', 'auto');
          }
        }
        for (let i = 0; i < columnWidths.length; i++) {
          if (visibleColumns[i] && visibleColumns[i] !== column && visibleColumns[i].width === undefined) {
            columnsController.columnOption(visibleColumns[i].index, 'width', columnWidths[i]);
          }
        }
      }

      columnsController.endUpdate();
      if (!isNextColumnMode) {
        this.component.updateDimensions();

        const scrollable = this.component.getScrollable();
        if (scrollable && isRtlParentStyle) {
          const left = getWidth(scrollable.$content()) - getWidth(scrollable.container()) - this._scrollRight;
          scrollable.scrollTo({ left });
        }
      }
    }

    return needUpdate;
  }

  function getLastResizableColumnIndex(columns, resultWidths?) {
    const hasResizableColumns = columns.some((column) => column && !column.command && !column.fixed && column.allowResizing !== false);
    let lastColumnIndex;

    for (lastColumnIndex = columns.length - 1; columns[lastColumnIndex]; lastColumnIndex--) {
      const column = columns[lastColumnIndex];
      const width = resultWidths && resultWidths[lastColumnIndex];
      const allowResizing = !hasResizableColumns || column.allowResizing !== false;

      if (!column.command && !column.fixed && width !== 'adaptiveHidden' && allowResizing) {
        break;
      }
    }

    return lastColumnIndex;
  }
  
  function _moveSeparator(args) {
    const e = args.event;
    const that = e.data;
    const columnsSeparatorWidth = that._columnsSeparatorView.width();
    const isNextColumnMode = false;
    const deltaX = columnsSeparatorWidth / 2;
    const parentOffset = that._$parentContainer.offset();
    const parentOffsetLeft = parentOffset.left;
    const eventData = getEventData(e);
    const rtlEnabled = that.option('rtlEnabled');
    const isRtlParentStyle = this._isRtlParentStyle();
    const isDragging = that._draggingHeaderView?.isDragging();

    if (that._isResizing && that._resizingInfo) {
      if ((parentOffsetLeft <= eventData.x || !isNextColumnMode && isRtlParentStyle) && (!isNextColumnMode || eventData.x <= parentOffsetLeft + getWidth(that._$parentContainer))) {
        if (that._updateColumnsWidthIfNeeded(eventData.x)) {
          const $cell = that._columnHeadersView.getColumnElements().eq(that._resizingInfo.currentColumnIndex);
          const cell = $cell[0];
          if (cell) {
            const outerWidth = cell.getBoundingClientRect().width;
            that._columnsSeparatorView.moveByX($cell.offset().left + ((isNextColumnMode || isRtlParentStyle) && rtlEnabled ? 0 : outerWidth));
            that._tablePositionController.update(that._targetPoint.y);
            e.preventDefault();
          }
        }
      }
    } else if (!isDragging) {
      if (that._isHeadersRowArea(eventData.y)) {
        if (that._previousParentOffset) {
          if (that._previousParentOffset.left !== parentOffset.left || that._previousParentOffset.top !== parentOffset.top) {
            that.pointsByColumns(null);
          }
        }

        that._targetPoint = that._getTargetPoint(that.pointsByColumns(), eventData.x, columnsSeparatorWidth);
        that._previousParentOffset = parentOffset;
        that._isReadyResizing = false;

        if (that._targetPoint) {
          that._columnsSeparatorView.changeCursor('col-resize');
          that._columnsSeparatorView.moveByX(that._targetPoint.x - deltaX);
          that._tablePositionController.update(that._targetPoint.y);
          that._isReadyResizing = true;
          e.preventDefault();
        } else {
          that._columnsSeparatorView.changeCursor();
          that._columnsSeparatorView.moveByX(null);
        }
      } else {
        that.pointsByColumns(null);
        that._isReadyResizing = false;
        that._columnsSeparatorView.changeCursor();
        that._columnsSeparatorView.moveByX(null);
      }
    }
  }

