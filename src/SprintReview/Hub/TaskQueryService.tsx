import * as React from "react";

import { getClient } from "azure-devops-extension-api";
import { Wiql, WorkItem, WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking";
import WorkItemFieldNames from "./WorkItemFieldNames";

export interface OriginalAndCompletedTime {
    OriginalEstimate: number;
    CompletedWork: number;
}

export class TaskQueryService {
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

        return {
            OriginalEstimate: originalEstimate,
            CompletedWork: completedWork
        };
    }
}