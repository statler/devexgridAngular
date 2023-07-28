import { Component, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import 'devextreme/data/odata/store';
import { from } from "linq-to-typescript"
import {_updateColumnsWidthIfNeeded,_moveSeparator} from "./custom";


@Component({
  templateUrl: 'tasks.component.html'
})

export class TasksComponent {
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid!: DxDataGridComponent;
  dataSource: any;
  priority: any[];
  columnResizingMode: string = "widget";

  columnsChanging(e: any) {
    console.log("Colchange");
  }
  selectionChangedHandler(e: any) {
    console.log("Selected");
  }

  ContentReadyHandler(e: any) {
    var a = this.dataGrid.instance;
    var _grid = e.component;
    _grid.getController("columnsResizer")._updateColumnsWidthIfNeeded = _updateColumnsWidthIfNeeded;
    // _grid.getController("columnsResizer")._moveSeparatorHandler = null;
  }

  ColumnChanging(e: any) {
    console.log("Colchange");
  }

  initWidth = false;
  OptionChangedHandler(e: any) {
    var _grid = e.component;
    // if (e.fullName == "columns[1].width" && !e.value.isNaN) {
    //   _grid.getController("columnsResizer")._isresizing = false;
    //   var colIx = 1;
    //   var gridCols = <Array<any>>_grid['getVisibleColumns']();
    //   var opCols = from(gridCols).where(x => !x.type && this.getWidth(x) && !(this.getWidth(x).isNaN)).toArray();
    //   var opColIds = opCols.map(x => x.headerId);
    //   var docColElements = document.querySelectorAll('[role="columnheader"]');
    //   var docCols = from(docColElements).where(x => opColIds.includes(x.id)).toArray();
    //   var totalWidth = from(docCols).select(x => x.clientWidth).sum() as number;

    //   var col0Width = this.getColumnById(opCols[0].headerId, docCols).clientWidth as number;
    //   var oldColWidth = e.previousValue;
    //   var newColWidth = e.value;
    //   var distWidth = totalWidth - col0Width - newColWidth;
    //   var widthChange = newColWidth - oldColWidth;

    //   _grid.getController("columnsResizer").beginUpdate();
    //   var runsum=0;
    //   var runwidths=0;
    //   for (let i = 2; i < opCols.length-1; i++) {
    //     var item = opCols[i];
    //     var thiswidth = this.getColumnById(item.headerId, docCols).clientWidth as number;
    //     var qtyChange = thiswidth / distWidth * widthChange;
    //     runsum += qtyChange;
    //     runwidths += thiswidth - qtyChange;
    //     e.component.columnOption(item.index, 'width', thiswidth - qtyChange);
    //   }
    //   var item = opCols[opCols.length-1];
    //   var qtyAvail = totalWidth - col0Width - newColWidth - runwidths;
    //   e.component.columnOption(item.index, 'width', qtyAvail);
    //   _grid.getController("columnsResizer")._isResizing = true;
    //     _grid.getController("columnsResizer").endUpdate();
    //   opCols.forEach(item => {
    //     console.log(item.name + ": " + this.getWidth(item));
    //   })
    //   console.log("leftWidth: " + col0Width + newColWidth);
    //   console.log("distWidth: " + distWidth);
    // }
    if (e.fullName == "columns[3].width" && !e.value.isNaN) console.log(e.fullName + ": " + e.previousValue + " | " + e.value);
    // 
  }

  getColumnById(id, cols: Element[]) {
    return from(cols).firstOrDefault(x => x.id == id);
  }
  getWidth(x) { return x.visibleWidth ?? x.width ?? x.bestFitWidth }

  constructor() {
    this.dataSource = {
      store: {
        type: 'odata',
        key: 'Task_ID',
        url: 'https://js.devexpress.com/Demos/DevAV/odata/Tasks'
      },
      expand: 'ResponsibleEmployee',
      select: [
        'Task_ID',
        'Task_Subject',
        'Task_Start_Date',
        'Task_Due_Date',
        'Task_Status',
        'Task_Priority',
        'Task_Completion',
        'ResponsibleEmployee/Employee_Full_Name'
      ]
    };
    this.priority = [
      { name: 'High', value: 4 },
      { name: 'Urgent', value: 3 },
      { name: 'Normal', value: 2 },
      { name: 'Low', value: 1 }
    ];
  }
}
