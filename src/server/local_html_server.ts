import { Response, Request } from "express";

export const localHtmlPageRenderer = (req: Request, res: Response) => {
  if (req.body && req.body.html) {
    res.send(req.body.html);
  } else {
    res.send("Hello!");
  }
};
