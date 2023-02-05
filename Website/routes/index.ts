import express, { Router, Request, Response, NextFunction } from "express";

const router = express.Router();

// --> Main <-- \

router.get("/", function (req: Request, res: Response, next: NextFunction) {
    console.log("????")
    res.render("index")
});

export default router;