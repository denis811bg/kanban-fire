import * as functions from "firebase-functions"
import { dbTasks } from "../db-collections";
import * as cors from "cors";
import { Task } from "../model/Task";
import { Status } from "../enum/Status";

const MISSING_TASK_DATA_ERROR = "Missing task data in the request body.";

const corsMiddleware = cors({origin: true});

exports.getTaskList = functions.https.onRequest(async (request, response) => {
    corsMiddleware(request, response, async () => {
        try {
            const querySnapshot = await dbTasks.get();
            const tasks: Task[] = querySnapshot.docs.map((docRef) => {
                const task: Task = docRef.data() as Task;
                task.id = docRef.id;
                return task;
            });

            if (tasks.length === 0) {
                functions.logger.log("Task list is empty.");

                // Note: Status code 204 (No content) doesn't work correctly so status code 200 is used.
                response.status(200).json({data: []});
            } else {
                functions.logger.log("Tasks received successfully.");
                response.status(200).json({data: tasks});
            }

        } catch (error: any) {
            functions.logger.error("Error getting tasks.", error.message);
            response.status(500).json({error: error.message});
        }
    });
});

exports.createTask = functions.https.onRequest((request, response) => {
    corsMiddleware(request, response, async () => {
        try {
            const requestData = request.body.data;
            if (!requestData) {
                functions.logger.error(MISSING_TASK_DATA_ERROR);
                response.status(400).json({error: MISSING_TASK_DATA_ERROR});
                return;
            }

            const newTask: Task = {
                title: requestData.title,
                description: requestData.description,
                status: Status.TODO,
                createdDate: new Date(),
            };

            const docRef = await dbTasks.add(newTask);
            newTask.id = docRef.id;

            functions.logger.log("Task created successfully.");
            response.status(200).json({data: newTask});
        } catch (error: any) {
            functions.logger.error("Error creating a new task.", error.message);
            response.status(500).json({error: error.message});
        }
    });
});

exports.updateTask = functions.https.onRequest((request, response) => {
    corsMiddleware(request, response, async () => {
        try {
            const requestData = request.body.data;
            if (!requestData) {
                functions.logger.error(MISSING_TASK_DATA_ERROR);
                response.status(400).json({error: MISSING_TASK_DATA_ERROR});
                return;
            }

            const updatedTask = {
                id: requestData.id,
                title: requestData.title,
                description: requestData.description,
                status: requestData.status,
                createdDate: new Date(requestData.createdDate),
                updatedDate: new Date()
            };

            await dbTasks.doc(requestData.id).update(updatedTask);

            functions.logger.log("Task updated successfully.");
            response.status(200).json({data: updatedTask});
        } catch (error: any) {
            functions.logger.error("Error updating an existing task.", error.message);
            response.status(500).json({error: error.message});
        }
    });
});

exports.deleteTask = functions.https.onRequest((request, response) => {
    corsMiddleware(request, response, async () => {
        try {
            const requestData = request.body.data;
            if (!requestData) {
                functions.logger.error(MISSING_TASK_DATA_ERROR);
                response.status(400).json({error: MISSING_TASK_DATA_ERROR});
                return;
            }

            await dbTasks.doc(requestData.id).delete();

            functions.logger.log("Task removed successfully.");
            response.status(200).json({data: {}});
        } catch (error: any) {
            functions.logger.error("Error removing an existing task.", error.message);
            response.status(500).json({error: error.message});
        }
    });
});
