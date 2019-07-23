import * as React from "react";

import { WorkItemReference } from "azure-devops-extension-api/WorkItemTracking";

export interface WorkItemGridState {
    items: WorkItemReference[],
};

export class WorkItemGrid extends React.Component<{ items: WorkItemReference[] }, WorkItemGridState> {
    constructor(props: { items: WorkItemReference[] }) {
        super(props);

        this.state = {
            items: props.items,
        };
    }

    render() : JSX.Element {
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
                        <tr>
                            <td>123456</td>
                            <td>This is a Sample User Story</td>
                            <td>Closed</td>
                            <td>June 14, 2019</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}