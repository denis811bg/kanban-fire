import { Timestamp } from "@google-cloud/firestore";

export interface UserDto {
    displayName: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    providerId: string;
    uid: string;
    createdDate?: Timestamp;
}
