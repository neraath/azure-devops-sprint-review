import * as React from "react";
import * as moment from "moment";

import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";

export interface WorkItemGridState {
    items: WorkItem[],
};

export function WorkItemRow(props : { value: WorkItem }) : JSX.Element {
    console.debug(props.value);
    let createdDate = moment(props.value.fields['System.CreatedDate']);
    return (
        <tr>
            <td>{props.value.id}</td>
            <td>{props.value.fields['System.Title']}</td>
            <td>{props.value.fields['System.State']}</td>
            <td>{createdDate.format('MMMM D, Y')}</td>
        </tr>
    );
}

export function WorkItemGrid(props : { items: WorkItem[] }) : JSX.Element {
    return (
        <div className="work-item-grid">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>State</th>
                        <th>Date Added</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.items.map((item) => (
                            <WorkItemRow key={item.id} value={item} />
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}