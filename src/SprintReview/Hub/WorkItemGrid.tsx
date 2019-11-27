import * as React from "react";
import * as moment from "moment";
import * as SDK from "azure-devops-extension-sdk";

import { WorkItem, WorkItemTrackingServiceIds, IWorkItemFormNavigationService } from "azure-devops-extension-api/WorkItemTracking";
import { Table, ColumnFill, ISimpleTableCell, ITableColumn, TableCell } from "azure-devops-ui/Table";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import { Card } from "azure-devops-ui/Card";
import { TableColumnLayout, renderSimpleCell } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { Link } from "azure-devops-ui/Link";
import WorkItemFieldNames from "./WorkItemFieldNames";
import { TaskQueryService } from "./TaskQueryService";

export interface IWorkItemTableItem extends ISimpleTableCell {
    id: number;
    title: string;
    state: string;
    createdDate: string;
    originalEstimate: number;
}

export function WorkItemGrid(props : { items: WorkItem[], pendingResults: boolean }) : JSX.Element {
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

    const renderOriginalEstimate = function(rowIndex: number, columnIndex: number, tableColumn : ITableColumn<IWorkItemTableItem>, tableItem: IWorkItemTableItem) : JSX.Element {
        return (
            <TableCell key={"col-" + columnIndex} columnIndex={columnIndex} tableColumn={tableColumn}>
                <TaskQueryService workItemId={tableItem.id} />
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
        {
            id: "originalEstimate",
            name: "Original Estimate",
            readonly: true,
            renderCell: renderOriginalEstimate,
            width: 150
        },
        ColumnFill
    ];

    function printField(field : {}) {
        console.debug(field);
    }
    
    function convertWorkItemToCellItem(workItem : WorkItem) : IWorkItemTableItem {
        let createdDate = moment(workItem.fields[WorkItemFieldNames.CreatedDate]);
        return {
            id: workItem.id,
            title: workItem.fields[WorkItemFieldNames.Title],
            state: workItem.fields[WorkItemFieldNames.State],
            createdDate: createdDate.format('MMMM D, Y'),
            originalEstimate: workItem.fields[WorkItemFieldNames.OriginalEstimate]
        };
    }

    if (props.items.length > 0) {
        let itemProvider = new ObservableArray<IWorkItemTableItem>(props.items.map(convertWorkItemToCellItem));
        return (
            <Card className="flex-grow bold-table-card" contentProps={{ contentPadding: false }}>
                <Table
                    columns={asyncColumns}
                    itemProvider={itemProvider}
                    role="table"
                    />
            </Card>
        );
    } else if (props.pendingResults) {
        let emptyItemProvider = new ObservableArray<ObservableValue<undefined>>(new Array(3).fill(new ObservableValue<undefined>(undefined)));
        return (
            <Card className="flex-grow bold-table-card" contentProps={{ contentPadding: false }}>
                <Table
                    columns={asyncColumns}
                    itemProvider={emptyItemProvider}
                    role="table"
                    />
            </Card>
        );
    } else {
        let itemProvider = new ObservableArray<IWorkItemTableItem>(props.items.map(convertWorkItemToCellItem));
        return (
            <ZeroData primaryText="No results found"
                secondaryText="There were no user stories found for this query."
                imageAltText="Bars"
                imagePath="/src/SprintReview/Hub/bars.png"
                />
        );
    }
}