import * as functions from "firebase-functions";
import { dbUsers } from "../db-collections";
import * as cors from "cors";
import { User } from "../model/user";
import { Timestamp } from "@google-cloud/firestore";

const MISSING_TASK_DATA_ERROR = "Missing user data in the request body.";

const corsMiddleware = cors({origin: true});

exports.createUser = functions.https.onRequest((request, response) => {
    corsMiddleware(request, response, async () => {
        try {
            const requestData = request.body.data;
            if (!requestData) {
                functions.logger.error(MISSING_TASK_DATA_ERROR);
                response.status(400).json({error: MISSING_TASK_DATA_ERROR});
                return;
            }

            const newUser: User = {
                displayName: requestData.displayName,
                email: requestData.email,
                phoneNumber: requestData.phoneNumber,
                photoURL: requestData.photoURL,
                providerId: requestData.providerId,
                uid: requestData.uid,
                createdDate: Timestamp.now()
            };

            await dbUsers.add(newUser);

            functions.logger.log("User created successfully.");
            response.status(200).json({data: newUser});
        } catch (error: any) {
            functions.logger.error("Error creating a new user.", error.message);
            response.status(500).json({error: error.message});
        }
    });
});
