import * as functions from "firebase-functions"
import { addNewComment, getTaskCommentList } from "../service/comment.service";
import { CommentDto } from "../dto/comment.dto";
import { handleErrors, onRequestWithCorsAsync } from "../utils/http.utils";
import { MISSING_REQUEST_DATA_ERROR } from "../consts/app.consts";
import { Comment } from "../model/comment";

exports.addNewComment = onRequestWithCorsAsync(async (request, response) => {
    try {
        const commentDto: CommentDto = request.body?.data;

        if (!commentDto) {
            handleErrors(
                {
                    source: '[comment.controller:addNewComment]',
                    description: MISSING_REQUEST_DATA_ERROR
                },
                response,
                400
            );
            return;
        }

        const comment: Comment = await addNewComment(commentDto);

        functions.logger.log(`[comment.controller:addNewComment] New comment for taskId = ${commentDto.taskId} added successfully. Comment: ${comment}.`);
        response.status(200).json({data: comment});
    } catch (error: any) {
        handleErrors(
            {
                source: '[comment.controller:addNewComment]',
                description: 'Error adding new comment.',
                errorMessage: error.message
            },
            response,
            500
        );
    }
});

exports.getTaskCommentList = onRequestWithCorsAsync(async (request, response) => {
    try {
        const taskId: string = request.body?.data?.taskId;

        if (!taskId) {
            handleErrors(
                {
                    source: '[comment.controller:getTaskCommentList]',
                    description: MISSING_REQUEST_DATA_ERROR
                },
                response,
                400
            );
            return;
        }

        const commentList: Comment[] | null = await getTaskCommentList(taskId);

        if (commentList && commentList.length !== 0) {
            functions.logger.log(`[comment.controller:getTaskCommentList] Comment list received successfully. Length of the comment list is ${commentList.length} items.`);
            response.status(200).json({data: commentList});
        } else {
            functions.logger.log(`[comment.controller:getTaskCommentList] Comment list for taskId = ${taskId} is empty.`);
            response.status(200).json({data: []});
        }
    } catch (error: any) {
        handleErrors(
            {
                source: '[comment.controller:getTaskCommentList]',
                description: 'Error getting task comment list.',
                errorMessage: error.message
            },
            response,
            500
        );
    }
});
