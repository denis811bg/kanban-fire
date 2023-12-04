import { Timestamp } from "@google-cloud/firestore";

export interface CommentDto {
    taskId: string;
    comment: {
        author: string;
        text: string;
        timestamp: Timestamp
    };
}
