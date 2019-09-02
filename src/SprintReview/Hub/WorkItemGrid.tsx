import * as React from "react";
import * as moment from "moment";
import * as SDK from "azure-devops-extension-sdk";

import { WorkItem, WorkItemTrackingServiceIds, IWorkItemFormNavigationService } from "azure-devops-extension-api/WorkItemTracking";
import { Table, ColumnFill, ISimpleTableCell, ITableColumn, TableCell } from "azure-devops-ui/Table";
import { Card } from "azure-devops-ui/Card";
import { TableColumnLayout, renderSimpleCell } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { Link } from "azure-devops-ui/Link";
import { ArrayItemProvider, IItemProvider } from "azure-devops-ui/Utilities/Provider";

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
    const onOpenExistingWorkItemClick = async function(workItemId : number) : Promise<void> {
        const navSvc = await SDK.getService<IWorkItemFormNavigationService>(WorkItemTrackingServiceIds.WorkItemFormNavigationService);
        navSvc.openWorkItem(workItemId);
    }

    const renderTitleAsLink = function(rowIndex: number, columnIndex: number, tableColumn : ITableColumn<IWorkItemTableItem>, tableItem: IWorkItemTableItem) : JSX.Element {
        return (
            <TableCell key={"col-" + columnIndex} columnIndex={columnIndex} tableColumn={tableColumn}>
                <Link href="#" onClick={() => onOpenExistingWorkItemClick(tableItem.id)}>{tableItem.title}</Link>
            </TableCell>
        );
    }

    let asyncColumns = [
        {
            id: "id",
            name: "Work Item ID",
            readonly: true,
            renderCell: renderSimpleCell,
            width: 150
        },
        {
            id: "title",
            name: "Title",
            readonly: true,
            renderCell: renderTitleAsLink,
            width: 400
        },
        {
            id: "state",
            name: "State",
            readonly: true,
            renderCell: renderSimpleCell,
            width: 150
        },
        {
            id: "createdDate",
            name: "Created Date",
            readonly: true,
            renderCell: renderSimpleCell,
            width: 150
        },
        //ColumnFill
    ];
    let itemProvider : IItemProvider<IWorkItemTableItem>;
    let emptyItemProvider = new ObservableArray<ObservableValue<undefined>>(new Array(3).fill(new ObservableValue<undefined>(undefined)));

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
        return (
            <Card className="flex-grow bold-table-card" contentProps={{ contentPadding: false }}>
                <Table
                    columns={asyncColumns}
                    itemProvider={itemProvider}
                    role="table"
                    />
            </Card>
        );
    } else {
        return (
            <Card className="flex-grow bold-table-card" contentProps={{ contentPadding: false }}>
                <Table
                    columns={asyncColumns}
                    itemProvider={emptyItemProvider}
                    role="table"
                    />
            </Card>
        );
    }
}