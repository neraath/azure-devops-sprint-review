import * as React from "react";

import { ListSelection } from "azure-devops-ui/List";
import { WebApiTeam, CoreRestClient, TeamContext } from "azure-devops-extension-api/Core";
import { getClient, IProjectInfo } from "azure-devops-extension-api";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";

export interface ITeamSelectorState {
    projectInfo?: IProjectInfo;
    selection: ListSelection;
    teams: WebApiTeam[];
};

export interface TeamSelectorProps {
    project: IProjectInfo | undefined;
}

export class TeamSelector extends React.Component<TeamSelectorProps, ITeamSelectorState> {
    constructor(props: { project : IProjectInfo | undefined }) {
        super(props);

        console.debug("CONSTRUCTOR");
        console.debug(props.project);

        this.state = {
            projectInfo: props.project,
            teams: [],
            selection: new ListSelection()
        };
    }

    public componentDidMount() {
        this.initializeState();
    }

    public componentWillReceiveProps(nextProps : TeamSelectorProps) {
        console.debug("TeamSelector: componentWillReceiveProps");
        console.debug(nextProps);
        this.setState({ projectInfo: nextProps.project });
        this.initializeState();
    }

    private async initializeState(): Promise<void> {
        console.debug("TeamSelector: initializeState");
        console.debug(this.state.projectInfo);

        if (this.state.projectInfo)
        {
            console.debug("TeamSelector: initializeState with projectInfo");
            const coreService = getClient(CoreRestClient);
            let teamResults = await coreService.getTeams(this.state.projectInfo.id);
            this.setState({ teams: teamResults });
            this.state.selection.select(0);
            console.debug("team results");
            console.debug(teamResults);

            let teamContext : TeamContext = { 
                projectId: this.state.projectInfo.id,
                project: '',
                teamId: teamResults[0].id,
                team: ''
            };
            console.debug("team context: ");
            console.debug(teamContext);
        }
    }

    public render(): JSX.Element {
        return (
            <Dropdown<string>
                className="sample-picker"
                items={this.state.teams.map((team) => ({
                    id: team.id,
                    data: team.id,
                    text: team.name
                }))}
                onSelect={this.onTeamChanged}
                selection={this.state.selection}
            />
        );
    }

    private onTeamChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<string>): void => {
        console.log("Team changed to " + item.data);
    }
}