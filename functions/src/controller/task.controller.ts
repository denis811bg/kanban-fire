import * as functions from "firebase-functions"
import { dbTasks } from "../db-collections";
import { Task } from "../model/task";
import { Status } from "../enum/Status";
import { Timestamp } from "@google-cloud/firestore"
import { handleErrors, onRequestWithCorsAsync } from "../utils/http.utils";
import { firestore } from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentData = firestore.DocumentData;
import { MISSING_REQUEST_DATA_ERROR } from "../consts/app.consts";
import { TaskDto } from "../dto/task.dto";
import DocumentReference = firestore.DocumentReference;
import DocumentSnapshot = firestore.DocumentSnapshot;
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;

exports.getTaskList = onRequestWithCorsAsync(async (request, response) => {
    try {
        const querySnapshot: QuerySnapshot<DocumentData> = await dbTasks.get();
        const taskList: Task[] = querySnapshot.docs.map((docRef: QueryDocumentSnapshot<DocumentData>) => {
            return docRef.data() as Task;
        });

        if (taskList && taskList.length !== 0) {
            functions.logger.log(`[task.controller:getTaskList] Task list received successfully. Length of the task list is ${taskList.length} items.`);
            response.status(200).json({data: taskList});
        } else {
            functions.logger.log("[task.controller:getTaskList] Task list is empty.");
            response.status(200).json({data: []});
        }
    } catch (error: any) {
        handleErrors(
            {
                source: '[task.controller:getTaskList]',
                description: 'Error getting task list.',
                errorMessage: error.message
            },
            response,
            500
        );
    }
});

exports.createTask = onRequestWithCorsAsync(async (request, response) => {
    try {
        const taskDto: TaskDto = request.body?.data?.taskDto;
        if (!taskDto) {
            handleErrors(
                {
                    source: '[task.controller:createTask]',
                    description: MISSING_REQUEST_DATA_ERROR
                },
                response,
                400
            );
            return;
        }

        const docRef: DocumentReference<DocumentData> = await dbTasks.add({
            title: taskDto.title,
            description: taskDto.description,
            status: Status.TODO,
            createdDate: Timestamp.now(),
        });
        await docRef.update({id: docRef.id});
        const docSnapshot: DocumentSnapshot<DocumentData> = await docRef.get();
        const task: Task = docSnapshot.data() as Task;

        functions.logger.log(`[task.controller:createTask] Task created successfully. Task: ${task}`);
        response.status(200).json({data: task});
    } catch (error: any) {
        handleErrors(
            {
                source: '[task.controller:createTask]',
                description: 'Error creating a new task.',
                errorMessage: error.message
            },
            response,
            500
        );
    }
});

exports.updateTask = onRequestWithCorsAsync(async (request, response) => {
    try {
        const taskDto: TaskDto = request.body?.data?.taskDto;
        if (!taskDto) {
            handleErrors(
                {
                    source: '[task.controller:updateTask]',
                    description: MISSING_REQUEST_DATA_ERROR
                },
                response,
                400
            );
            return;
        }

        const docRef = dbTasks.doc(taskDto.id!!);
        await docRef.update({
            title: taskDto.title,
            description: taskDto.description,
            status: taskDto.status,
            updatedDate: Timestamp.now()
        });
        const docSnapshot: DocumentSnapshot<DocumentData> = await docRef.get();
        const task: Task = docSnapshot.data() as Task;

        functions.logger.log(`[task.controller:updateTask] Task with taskId ${task.id} updated successfully.`);
        response.status(200).json({data: task});
    } catch (error: any) {
        handleErrors(
            {
                source: '[task.controller:updateTask]',
                description: 'Error updating an existing task.',
                errorMessage: error.message
            },
            response,
            500
        );
    }
});

exports.deleteTask = onRequestWithCorsAsync(async (request, response) => {
    try {
        const taskId: string = request.body?.data?.taskId;
        if (!taskId) {
            handleErrors(
                {
                    source: '[task.controller:deleteTask]',
                    description: MISSING_REQUEST_DATA_ERROR
                },
                response,
                400
            );
            return;
        }

        await dbTasks.doc(taskId).delete();

        functions.logger.log("[task.controller:deleteTask] Task removed successfully.");
        response.status(200).json({data: {}});
    } catch (error: any) {
        handleErrors(
            {
                source: '[task.controller:deleteTask]',
                description: 'Error removing an existing task.',
                errorMessage: error.message
            },
            response,
            500
        );
    }
});
