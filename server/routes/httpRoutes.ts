import express from "express";
import { Request, Response } from "express";
import multer from "multer";
import {
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
  put_update,
  post_dict,
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
router.get("/get_1k", get_1k);
router.get("/get_2k", get_2k);
router.get("/get_4k", get_4k);
router.get("/get_8k", get_8k);
router.get("/get_1m", get_1m);
router.get("/get_2m", get_2m);
router.get("/get_4m", get_4m);
router.get("/get_8m", get_8m);

// POST request examples
router.post("/create", post_create);
router.post("/dict", post_dict);
router.post("/upload", upload.array("files"), post_file);


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
