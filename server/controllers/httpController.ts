import { Request, Response } from "express";
const fs = require("fs");
const path = require("path");
import { generateRepeatedString } from "@utils/stringUtils";
import upload from "@middlewares/multer";

const get_files = async (req: Request, res: Response) => {
  const dirPath = path.join(__dirname, "../temps");
  fs.readdir(dirPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read directory" });
    }
    res.json({ files });
  });
};

const delete_file = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = `./temps/${filename}`;
  fs.unlink(filePath, (err: Error) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete file" });
    }
    res.json({ message: "File deleted successfully" });
  });
};

const upload_file = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const filePath = `./temps/${req.file.filename}`;

  fs.writeFile(filePath, req.file.buffer, (err: Error) => {
    if (err) {
      res.status(500).json({ error: "Failed to save file" });
      return;
    }
    res.json({ message: "File uploaded successfully", filePath });
  });
}

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
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  res.json({
    success: true,
    file: {
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
    },
  });
};

const post_dict = async (req: Request, res: Response) => {
  const body = req.body;

  // Define the directory and ensure it exists
  const dirPath = "./server/temps";
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
  get_files,
  delete_file,
  upload_file,
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
