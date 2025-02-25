import express from "express";
import { Request, Response } from "express";
import multer from "multer";
import {
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
} from "../controllers/httpController";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// GET request examples
router.get("/", get_default);
router.get("/query", get_query);
router.get("/params/:id", get_params);

// POST request examples
router.post("/create", post_create);
router.post("/upload", upload.array("files"), post_upload);

// PUT request example
router.put("/update/:id", put_update);

// PATCH request example
router.patch("/partial-update/:id", patch_partial_update);

// DELETE request example
router.delete("/delete/:id", delete_remove);

// HEAD request example
router.head("/head", head_request);

// OPTIONS request example
router.options("/options", options_request);

// Error handling middleware
router.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

export default router;
