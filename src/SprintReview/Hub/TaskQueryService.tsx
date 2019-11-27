import * as React from "react";

import { getClient } from "azure-devops-extension-api";
import { Wiql, WorkItem, WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking";
import WorkItemFieldNames from "./WorkItemFieldNames";

export interface OriginalAndCompletedTime {
    OriginalEstimate: number;
    CompletedWork: number;
}

export interface ITaskQueryState {
    WorkItemId: number;
    OriginalEstimate?: number;
    CompletedWork?: number;
}

export class TaskQueryService extends React.Component<{ workItemId: number }, ITaskQueryState> {

    constructor(props : { workItemId: number }) {
        super(props);

        this.state = {
            WorkItemId: props.workItemId
        };
    }

    private getWiqlQuery(userStoryId : number) : Wiql {
        let wiqlString = `SELECT
            [System.Id]
        FROM workitemLinks
        WHERE
            [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward'
            AND [Source].[System.Id] = ${userStoryId}
            AND [Target].[System.WorkItemType] = 'Task'
        ORDER BY [System.Id]
        MODE (MustContain)`;

        return { query: wiqlString };
    }

    public async getOriginalAndCompletedTime(workItemId : number) : Promise<OriginalAndCompletedTime> {
        console.debug(`querying the following workitem: ${workItemId}`);
        let workItemService = getClient(WorkItemTrackingRestClient);
        const results = await workItemService.queryByWiql(this.getWiqlQuery(workItemId));

        if (!results.workItemRelations) return;
        const columns = [WorkItemFieldNames.OriginalEstimate,WorkItemFieldNames.CompletedWork];
        const workItemDetails = await workItemService.getWorkItems(results.workItemRelations.filter(x => x.rel == 'System.LinkTypes.Hierarchy-Forward').map(x => x.target.id), null, columns);

        let originalEstimate= 0.0;
        let completedWork = 0.0;
        workItemDetails.forEach(x => { 
            originalEstimate += x.fields[WorkItemFieldNames.OriginalEstimate];
            completedWork += x.fields[WorkItemFieldNames.CompletedWork];
        });

        this.setState({
            OriginalEstimate: originalEstimate,
            CompletedWork: completedWork
        })
    }

    public componentDidMount() {
        this.initializeState();
    }

    private async initializeState() : Promise<void> {
        console.debug("GETTING ORIGINAL AND COMPLETED TIME");
        this.getOriginalAndCompletedTime(this.state.WorkItemId);
    }

    public render() : JSX.Element {
        return (
            <div>{this.state.OriginalEstimate}</div>
        );
    }
}