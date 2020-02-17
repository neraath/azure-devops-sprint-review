import * as React from "react";

import { TaskQueryService } from "./TaskQueryService";

export interface ICompletedWorkState {
    CompletedWork?: number;
}

export class CompletedWorkField extends React.Component<{ workItemId: number }, ICompletedWorkState> {
    private taskService : TaskQueryService;
    private workItemId : number;

    constructor(props : { workItemId: number }) {
        super(props);
        this.taskService = new TaskQueryService();
        this.workItemId = props.workItemId;
        this.state = {};
    }

    public componentDidMount() {
        this.initializeState();
    }

    private async initializeState() : Promise<void> {
        let times = await this.taskService.getOriginalAndCompletedTime(this.workItemId);
        this.setState({
            CompletedWork: times.CompletedWork
        });
    }

    public render() : JSX.Element {
        return (
            <div>{isNaN(this.state.CompletedWork) ? 0 : this.state.CompletedWork}</div>
        );
    }
}