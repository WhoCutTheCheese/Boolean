import { Document } from "mongoose";
import { WebUser } from "../Schema/WebUsers";

export interface BooleanSession {
	passport?: { user: WebUser }
}