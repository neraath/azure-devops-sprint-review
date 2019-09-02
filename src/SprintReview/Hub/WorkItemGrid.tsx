import * as React from "react";
import * as moment from "moment";

import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { Table, ColumnFill, ISimpleTableCell, ITableColumn } from "azure-devops-ui/Table";
import { Card } from "azure-devops-ui/Card";
import { TableColumnLayout, renderSimpleCell } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";

export interface WorkItemGridState {
    items: WorkItem[],
};

export interface IWorkItemTableItem extends ISimpleTableCell {
    id: number;
    title: string;
    state: string;
    createdDate: string;
}

export function WorkItemGrid(props : { items: WorkItem[] }) : JSX.Element {
    let asyncColumns = [
        {
            columnLayout: TableColumnLayout.singleLinePrefix,
            id: "id",
            name: "Work Item ID",
            readonly: true,
            renderCell: renderSimpleCell,
            width: 150
        },
        {
            columnLayout: TableColumnLayout.singleLinePrefix,
            id: "title",
            name: "Title",
            readonly: true,
            renderCell: renderSimpleCell,
            width: 400
        },
        {
            columnLayout: TableColumnLayout.singleLinePrefix,
            id: "state",
            name: "State",
            readonly: true,
            renderCell: renderSimpleCell,
            width: 150
        },
        
        {
            columnLayout: TableColumnLayout.singleLinePrefix,
            id: "createdDate",
            name: "Created Date",
            readonly: true,
            renderCell: renderSimpleCell,
            width: 150
        },
        ColumnFill
    ];
    let itemProvider : ObservableArray<
        IWorkItemTableItem | ObservableValue<IWorkItemTableItem | undefined>
    >;

    function convertWorkItemToCellItem(workItem : WorkItem) : IWorkItemTableItem {
        let createdDate = moment(workItem.fields['System.CreatedDate']);
        return {
            id: workItem.id,
            title: workItem.fields['System.Title'],
            state: workItem.fields['System.State'],
            createdDate: createdDate.format('MMMM D, Y')
        };
    }

    if (props.items.length > 0) {
        itemProvider = new ObservableArray<IWorkItemTableItem>(props.items.map(convertWorkItemToCellItem));
    } else {
        itemProvider = new ObservableArray<ObservableValue<undefined>>(new Array(3).fill(new ObservableValue<IWorkItemTableItem | undefined>(undefined)));
    }

    return (
        <Card className="flex-grow bold-table-card" contentProps={{ contentPadding: false }}>
            <Table
                columns={asyncColumns}
                itemProvider={itemProvider}
                role="table"
                />
        </Card>
    );
}