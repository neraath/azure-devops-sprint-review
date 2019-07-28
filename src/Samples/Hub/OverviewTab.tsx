import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import * as moment from "moment";

import { CommonServiceIds, getClient, IProjectPageService } from "azure-devops-extension-api";
import { WorkItemTrackingRestClient, Wiql, WorkItem, WorkItemExpand } from "azure-devops-extension-api/WorkItemTracking";

import { Dropdown } from "azure-devops-ui/Dropdown";
import { ListSelection } from "azure-devops-ui/List";
import { IListBoxItem } from "azure-devops-ui/ListBox";

import { WorkItemGrid } from "./WorkItemGrid";

export interface IOverviewTabState {
    userName?: string;
    projectName?: string;
    iterationPath?: string;
    areaPath?: string;
    iframeUrl?: string;
    extensionData?: string;
    extensionContext?: SDK.IExtensionContext;
    selection: ListSelection;
    workItems: WorkItem[];
}

export class OverviewTab extends React.Component<{}, IOverviewTabState> {

    constructor(props: {}) {
        super(props);

        const selection = new ListSelection();
        selection.select(0, 1);

        this.state = {
            iframeUrl: window.location.href,
            iterationPath: "Azure DevOps Sprint Review\\Iteration 1",
            areaPath: "Azure DevOps Sprint Review\\Core",
            workItems: [],
            selection
        };
    }

    public componentDidMount() {
        this.initializeState();
    }

    private async initializeState(): Promise<void> {
        await SDK.ready();

        const userName = SDK.getUser().displayName;
        this.setState({
            userName,
            extensionContext: SDK.getExtensionContext()
         });

        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();

        if (project) {
            this.setState({ projectName: project.name });

            const client = getClient(WorkItemTrackingRestClient);
            let endOfFirstDateOfSprint = moment('2019-07-17 23:59');
            let wiqlString : Wiql = { query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = '${project.name}' AND [System.AreaPath] = '${this.state.areaPath}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${this.state.iterationPath}' ASOF '${endOfFirstDateOfSprint.format('M/D/Y HH:mm')}'` };
            const idResults = await client.queryByWiql(wiqlString, project.name);
            //console.debug("id results: ");
            //console.debug(idResults);

            if (idResults.workItems.length == 0) return;

            const columns = ['System.Title','System.State','System.CreatedDate'];
            const results = await client.getWorkItems(idResults.workItems.map(x => x.id), project.name, columns);

            this.setState({ workItems: results });

            //console.debug("Results Obtained: ");
            //console.debug(results);
        }
    }

    public render(): JSX.Element {

        const { userName, projectName, iframeUrl, extensionContext } = this.state;

        return (
            <div className="sample-hub-section">
                <Dropdown<string>
                    className="sample-picker"
                    items={[
                        { id: "sapphire", data: "Sapphire", text: "Sapphire"},
                        { id: "emerald", data: "Emerald", text: "Emerald"},
                        { id: "jade", data: "Jade", text: "Jade"},
                        { id: "topaz", data: "Topaz", text: "Topaz"}
                    ]}
                    onSelect={this.onTeamChanged}
                    selection={this.state.selection}
                />
                <div>Hello, {userName}!</div>
                {
                    projectName &&
                    <div>Project: {projectName}</div>
                }
                <div>iframe URL: {iframeUrl}</div>
                {
                    extensionContext &&
                    <>
                        <div>Extension id: {extensionContext.id}</div>
                        <div>Extension version: {extensionContext.version}</div>
                    </>
                }
                <WorkItemGrid items={this.state.workItems} />
            </div>
        );
    }

    private onTeamChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<string>): void => {
        console.log("Team changed to " + item.data);
    }
}