import * as functions from "firebase-functions";
import { dbUsers } from "../db-collections";
import { User } from "../model/user";
import { handleErrors, onRequestWithCorsAsync } from "../utils/http.utils";
import { UserDto } from "../dto/user.dto";
import { MISSING_REQUEST_DATA_ERROR } from "../consts/app.consts";

exports.getUser = onRequestWithCorsAsync(async (request, response) => {
    try {
        const userUid = request.body?.data?.userUid;
        if (!userUid) {
            handleErrors(
                {
                    source: '[user.controller:getUser]',
                    description: MISSING_REQUEST_DATA_ERROR
                },
                response,
                400
            );
            return;
        }

        const querySnapshot = await dbUsers.get();
        const user: User | undefined = querySnapshot.docs
            .map((docRef) => docRef.data() as User)
            .find((user) => user.uid === userUid);

        if (user) {
            functions.logger.log(`[user.controller:getUser] User with uid ${userUid} found successfully.`);
            response.status(200).json({data: user});
        } else {
            functions.logger.log(`[user.controller:getUser] User with uid ${userUid} doesn't exist.`);
            response.status(200).json({data: {}});
        }
    } catch (error: any) {
        functions.logger.error("Error finding user.", error.message);
        response.status(500).json({error: error.message});
    }
});

exports.createUser = onRequestWithCorsAsync(async (request, response) => {
    try {
        const userDto: UserDto = request.body?.data?.userDto;
        if (!userDto) {
            handleErrors(
                {
                    source: '[user.controller:createUser]',
                    description: MISSING_REQUEST_DATA_ERROR
                },
                response,
                400
            );
            return;
        }

        const docRef = await dbUsers.add(userDto);
        const docSnapshot = await docRef.get();
        const user: User = docSnapshot.data() as User;

        functions.logger.log(`[user.controller:createUser] User created successfully. User: ${user}`);
        response.status(200).json({data: user});
    } catch (error: any) {
        handleErrors(
            {
                source: '[user.controller:createUser]',
                description: 'Error creating a new user.',
                errorMessage: error.message
            },
            response,
            500
        );
    }
});
