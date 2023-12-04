import { rtdb } from "../main";
import { Comment } from "../model/comment";
import { CommentDto } from "../dto/comment.dto";
import { Reference, ThenableReference } from "firebase-admin/database";
import { database } from "firebase-admin";
import DataSnapshot = database.DataSnapshot;

export async function addNewComment(commentDto: CommentDto): Promise<Comment> {
    const commentsRef: Reference = rtdb.ref(`taskComments/${commentDto.taskId}/comments`);
    const newCommentRef: ThenableReference = commentsRef.push(commentDto.comment);
    const addedCommentSnapshot: DataSnapshot = await newCommentRef.once('value');

    return addedCommentSnapshot.val() as Comment;
}

export async function getTaskCommentList(taskId: string): Promise<Comment[] | null> {
    const commentsRef: Reference = rtdb.ref(`taskComments/${taskId}/comments`);
    const snapshot: DataSnapshot = await commentsRef.once('value');

    const dataSnapshot: any = snapshot.val();
    if (!dataSnapshot) {
        return null;
    }

    return Object.values(dataSnapshot) as Comment[];
}
