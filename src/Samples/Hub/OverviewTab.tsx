import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";

import { Dropdown } from "azure-devops-ui/Dropdown";
import { ListSelection } from "azure-devops-ui/List";
import { IListBoxItem } from "azure-devops-ui/ListBox";

export interface IOverviewTabState {
    userName?: string;
    projectName?: string;
    iframeUrl?: string;
    extensionData?: string;
    extensionContext?: SDK.IExtensionContext;
    selection: ListSelection;
}

export class OverviewTab extends React.Component<{}, IOverviewTabState> {

    constructor(props: {}) {
        super(props);

        const selection = new ListSelection();
        selection.select(0, 1);

        this.state = {
            iframeUrl: window.location.href,
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
            </div>
        );
    }

    private onTeamChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<string>): void => {
        console.log("Team changed to " + item.data);
    }
}