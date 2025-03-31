import { Request, Response } from "express";
const fs = require("fs");
import { generateRepeatedString } from "../utils/stringUtils";

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

const get_1k = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024);
  res.status(200).send(data);
};

const get_2k = async (req: Request, res: Response) => {
  const data = generateRepeatedString(2048);
  res.status(200).send(data);
};

const get_4k = async (req: Request, res: Response) => {
  const data = generateRepeatedString(4096);
  res.status(200).send(data);
};

const get_8k = async (req: Request, res: Response) => {
  const data = generateRepeatedString(8192);
  res.status(200).send(data);
};

const get_1m = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1048576);
  res.status(200).send(data);
};

const get_2m = async (req: Request, res: Response) => {
  const data = generateRepeatedString(2097152);
  res.status(200).send(data);
};

const get_4m = async (req: Request, res: Response) => {
  const data = generateRepeatedString(4194304);
  res.status(200).send(data);
};

const get_8m = async (req: Request, res: Response) => {
  const data = generateRepeatedString(8388608);
  res.status(200).send(data);
};

const post_create = async (req: Request, res: Response) => {
  const body = req.body;
  res.status(201).json({
    message: "POST request successful",
    data: body,
  });
};

const post_file = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = (req as any).files || [];
    if (!Array.isArray(files)) {
      res.status(400).json({ message: "No files uploaded or invalid format" });
    }

    // Define the directory and ensure it exists
    const dirPath = "../temps";
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Save each file to the directory and calculate total size
    const savedFiles: { filename: string; path: string; size: number }[] = [];
    let totalSize = 0;

    for (const file of files) {
      const filePath = `${dirPath}/${file.originalname}`;
      fs.writeFileSync(filePath, file.buffer);
      const fileSize = file.buffer.length;
      totalSize += fileSize;
      savedFiles.push({ filename: file.originalname, path: filePath, size: fileSize });
    }

    res.status(201).json({
      message: "File upload successful",
      totalSize,
      files: savedFiles,
    });
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error: (error as Error).message });
  }
};

const post_dict = async (req: Request, res: Response) => {
  const body = req.body;

  // Define the directory and ensure it exists
  const dirPath = "./dicts";
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  // Generate a unique ID for the file
  const id = Date.now();
  const filePath = `${dirPath}/${id}.json`;

  // Write the data to a new file named with the ID
  fs.writeFileSync(filePath, JSON.stringify(body, null, 2));

  // Respond with the stored data
  res.status(200).json({
    message: "POST request with dictionary - data stored successfully",
    data: { ...body, id },
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
  get_1k,
  get_2k,
  get_4k,
  get_8k,
  get_1m,
  get_2m,
  get_4m,
  get_8m,
  post_create,
  post_file,
  post_dict,
  put_update,
  patch_partial_update,
  delete_remove,
  head_request,
  options_request,
};
