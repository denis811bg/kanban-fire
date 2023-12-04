import { Status } from "../enum/Status";
import { Timestamp } from "@google-cloud/firestore"

export interface Task {
    id: string;
    title: string;
    description: string;
    status: Status;
    createdDate: Timestamp;
    updatedDate?: Timestamp;
}
