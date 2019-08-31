import { IProjectInfo } from "azure-devops-extension-api";
import { Iteration } from "./IterationSelector";
import { Wiql } from "azure-devops-extension-api/WorkItemTracking";
import { SprintReviewGridBase, SprintReviewGridBaseProps } from "./SprintReviewGridBase";

export class SprintEndingGrid extends SprintReviewGridBase {
    constructor(props: SprintReviewGridBaseProps) {
        super(props);
    }

    protected getWiqlQuery(project : IProjectInfo, iteration : Iteration, areaPath : string) : Wiql {
        let wiqlString : Wiql = { query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = '${project.name}' AND [System.AreaPath] = '${areaPath}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${iteration.path}' ASOF '${iteration.endDate.format('M/D/Y HH:mm')}'` };
        return wiqlString;
    }
}