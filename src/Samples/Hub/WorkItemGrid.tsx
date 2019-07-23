import * as React from "react";

import { WorkItemReference } from "azure-devops-extension-api/WorkItemTracking";

export interface WorkItemGridState {
    items: WorkItemReference[],
};

export function WorkItemRow(props : { value: WorkItemReference }) : JSX.Element {
    return (
        <tr>
            <td>{props.value.id}</td>
            <td>This is a Sample User Story</td>
            <td>Closed</td>
            <td>June 14, 2019</td>
        </tr>
    );
}

export function WorkItemGrid(props : { items: WorkItemReference[] }) : JSX.Element {
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