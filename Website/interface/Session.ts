import { Document } from "mongoose";
import { WebUser } from "../schema/WebUsers";

export interface BooleanSession {
	passport?: { user: WebUser }
}