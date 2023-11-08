import { Status } from "../enum/Status";

export interface Task {
    id?: string;
    title: string;
    description: string;
    status: Status;
    createdDate: Date;
    updatedDate?: Date;
}
