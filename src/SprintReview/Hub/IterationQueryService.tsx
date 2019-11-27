import { getClient, IProjectInfo } from "azure-devops-extension-api";
import { WorkRestClient } from "azure-devops-extension-api/Work";
import { Team } from "./TeamSelector";
import { TeamContext } from "azure-devops-extension-api/Core";
import { WorkItemTrackingRestClient, Wiql, WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { Iteration } from "./IterationSelector";
import { Moment } from "moment";
import moment = require("moment");
import { TaskQueryService } from "./TaskQueryService";
import asyncForEach from "./AsyncForeach";

export class IterationQueryService {
    private getWiqlQuery(project : IProjectInfo, iteration : Iteration, areaPath : string, asOf? : Date) : Wiql {
        let wiqlString = `SELECT [System.Id] FROM workitems 
        WHERE [System.TeamProject] = '${project.name}' 
        AND [System.AreaPath] = '${areaPath}' 
        AND [System.WorkItemType] = 'User Story' 
        AND [System.IterationPath] = '${iteration.path}'`;

        if (asOf) {
            wiqlString += `ASOF '${moment(asOf).format('M/D/Y HH:mm')}'`;
        }
        return { query: wiqlString };
    }

    public async getWorkItemsForIteration(project : IProjectInfo, team : Team, iteration : Iteration, asOf?: Date) : Promise<WorkItem[]> {
        let teamContext : TeamContext = { 
            projectId: project.id,
            project: '',
            teamId: team.id,
            team: ''
        };
        // console.debug(teamContext);

        let workService = getClient(WorkRestClient);
        let teamFieldValues = await workService.getTeamFieldValues(teamContext);
        // console.debug("SprintReviewGridBase: fetched teamFieldValues")
        // console.debug(teamFieldValues);

        const client = getClient(WorkItemTrackingRestClient);
        const idResults = await client.queryByWiql(this.getWiqlQuery(project, iteration, teamFieldValues.defaultValue, asOf), project.name);
        // console.debug("id results: ");
        // console.debug(idResults);

        if (idResults.workItems.length == 0) {
            console.debug("No work items. Setting empty.");
            return [];
        }

        const columns = ['System.Title','System.State','System.CreatedDate'];
        const results = await client.getWorkItems(idResults.workItems.map(x => x.id), project.name, columns);

        return results;
    }
}