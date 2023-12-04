import { Timestamp } from "@google-cloud/firestore";

export interface Comment {
    author: string,
    text: string,
    timestamp: Timestamp
}
