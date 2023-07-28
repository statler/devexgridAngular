_updateColumnsWidthIfNeeded(posX) 
{
    let deltaX;
    let needUpdate = false;
    let contentWidth = this._rowsView.contentWidth();
    const resizingInfo = this._resizingInfo;
    const columnsController = this._columnsController;
    const visibleColumns = columnsController.getVisibleColumns();
    const columnsSeparatorWidth = this._columnsSeparatorView.width();
    const isNextColumnMode = isNextColumnResizingMode(this);
    const adaptColumnWidthByRatio = isNextColumnMode && this.option('adaptColumnWidthByRatio') && !this.option('columnAutoWidth');
    const rtlEnabled = this.option('rtlEnabled');
    const isRtlParentStyle = this._isRtlParentStyle();
    const column = visibleColumns[resizingInfo.currentColumnIndex];
    const nextColumn = visibleColumns[resizingInfo.nextColumnIndex];

    function isPercentWidth(width) {
      return isString(width) && width.endsWith('%');
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
      const result = {};

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

      setColumnWidth(column, cellWidth, contentWidth, adaptColumnWidthByRatio);

      if (isNextColumnMode) {
        nextCellWidth = Math.floor(nextCellWidth);
        setColumnWidth(nextColumn, nextCellWidth, contentWidth, adaptColumnWidthByRatio);
      } else {
        const columnWidths = this._columnHeadersView.getColumnWidths();
        columnWidths[resizingInfo.currentColumnIndex] = cellWidth;
        const hasScroll = columnWidths.reduce((totalWidth, width) => totalWidth + width, 0) > this._rowsView.contentWidth();
        if (!hasScroll) {
          const lastColumnIndex = gridCoreUtils.getLastResizableColumnIndex(visibleColumns);
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