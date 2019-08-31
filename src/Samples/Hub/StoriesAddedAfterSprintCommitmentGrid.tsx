import { IProjectInfo } from "azure-devops-extension-api";
import { Iteration } from "./IterationSelector";
import { Wiql, WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { SprintReviewGridBase, SprintReviewGridBaseProps } from "./SprintReviewGridBase";
import moment = require("moment");
import { Team } from "./TeamSelector";

export class StoriesAddedAfterSprintCommitmentGrid extends SprintReviewGridBase {
    constructor(props: SprintReviewGridBaseProps) {
        super(props);
    }

    protected async getWorkItems(project : IProjectInfo, team : Team, iteration : Iteration) : Promise<WorkItem[]> {
        let workItemsAtCommitment = await this.queryService.getWorkItemsForIteration(project, team, iteration, iteration.startDate.add(moment.duration(1, "day")));
        let workItemsAtSprintEnd = await this.queryService.getWorkItemsForIteration(project, team, iteration, iteration.endDate);
        let workItemsAdded = workItemsAtSprintEnd.filter(item => !this.doesWorkItemExistInCollection(item, workItemsAtCommitment));
        return workItemsAdded;
    }

    private doesWorkItemExistInCollection(workItem : WorkItem, collection : WorkItem[]) {
        return collection.findIndex(x => x.id == workItem.id) != -1;
    }
}