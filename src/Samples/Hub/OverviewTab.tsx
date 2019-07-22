import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, getClient, IProjectPageService } from "azure-devops-extension-api";
import { WorkItemTrackingRestClient, Wiql, WorkItemReference } from "azure-devops-extension-api/WorkItemTracking";

import { Dropdown } from "azure-devops-ui/Dropdown";
import { ListSelection } from "azure-devops-ui/List";
import { IListBoxItem } from "azure-devops-ui/ListBox";

export interface IOverviewTabState {
    userName?: string;
    projectName?: string;
    iterationPath?: string;
    areaPath?: string;
    iframeUrl?: string;
    extensionData?: string;
    extensionContext?: SDK.IExtensionContext;
    selection: ListSelection;
    workItems: WorkItemReference[];
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
            console.debug(`project name set to: ${project.name}`);

            const client = getClient(WorkItemTrackingRestClient);
            let wiqlString : Wiql = { query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = '${project.name}' AND [System.AreaPath] = '${this.state.areaPath}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${this.state.iterationPath}'` };
            console.debug(`WIQL Query: ${wiqlString.query}`);
            const results = await client.queryByWiql(wiqlString, project.name);
            this.setState({ workItems: results.workItems });
            console.debug(results);
            results.workItems.forEach(element => {
                console.log("Work Item " + element.id + " in iteration " + this.state.iterationPath);
            });
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
                <div className="work-item-table">
                    <table>
                        <tbody>
                        {this.state.workItems.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
        );
    }

    private onTeamChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<string>): void => {
        console.log("Team changed to " + item.data);
    }
}