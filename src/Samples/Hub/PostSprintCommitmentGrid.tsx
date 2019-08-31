import * as React from "react";

import { IProjectInfo, getClient } from "azure-devops-extension-api";
import { Iteration } from "./IterationSelector";
import { Team } from "./TeamSelector";
import { TeamContext } from "azure-devops-extension-api/Core";
import { WorkRestClient } from "azure-devops-extension-api/Work";
import { WorkItemTrackingRestClient, Wiql, WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { WorkItemGrid } from "./WorkItemGrid";
import { SprintReviewGridBase, SprintReviewGridBaseProps } from "./SprintReviewGridBase";

export class PostSprintCommitmentGrid extends SprintReviewGridBase {
    constructor(props: SprintReviewGridBaseProps) {
        super(props);
    }

    protected getWiqlQuery(project : IProjectInfo, iteration : Iteration, areaPath : string) : Wiql {
        let wiqlString : Wiql = { query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = '${project.name}' AND [System.AreaPath] = '${areaPath}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${iteration.path}' ASOF '${iteration.endDate.format('M/D/Y HH:mm')}'` };
        return wiqlString;
    }
}