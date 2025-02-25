import { Request, Response } from "express";

const get_default = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Basic GET request successful" });
};

const get_query = async (req: Request, res: Response) => {
  const { name, age } = req.query;
  res.status(200).json({
    message: "GET with query params",
    data: { name, age },
  });
};

const get_params = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(200).json({
    message: "GET with URL params",
    id,
  });
};

const post_create = async (req: Request, res: Response) => {
  const body = req.body;
  res.status(201).json({
    message: "POST request successful",
    data: body,
  });
};

const post_upload = async (req: Request, res: Response) => {
  const files = (req as any).files;
  res.status(201).json({
    message: "File upload successful",
    files: files,
  });
};

const put_update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;
  res.status(200).json({
    message: "PUT request successful",
    id,
    updates: body,
  });
};

const patch_partial_update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;
  res.status(200).json({
    message: "PATCH request successful",
    id,
    updates: body,
  });
};

const delete_remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(200).json({
    message: "DELETE request successful",
    id,
  });
};

const head_request = async (req: Request, res: Response) => {
  res.status(200).json({ message: "HEAD request successful" });
};

const options_request = async (req: Request, res: Response) => {
  res.status(200).json({ message: "OPTIONS request successful" });
};

export {
  get_default,
  get_query,
  get_params,
  post_create,
  post_upload,
  put_update,
  patch_partial_update,
  delete_remove,
  head_request,
  options_request,
};
