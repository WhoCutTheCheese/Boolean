import { Document } from "mongoose";
import { WebUser } from "../Schema/WebUsers";

export interface BooleanSession {
	userId?: string,
	passport?: { user: WebUser }
}