import express from "express";
import { Request, Response } from "express";
import { registerApiDoc } from "@services/docService";
import {
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
  put_update,
  post_dict,
  patch_partial_update,
  delete_remove,
  head_request,
  options_request,
} from "@controllers/httpController";

import upload from "@middlewares/multer";

const router = express.Router();

// File system management

// Get list of files
router.get("/files", get_files);
registerApiDoc({
  operationId: "getFiles",
  tags: ["File Management"],
  summary: "Get list of files",
  description: "Returns a list of files in the server's file system.",
  method: "GET",
  path: "/api/http/files",
  parameters: [],
  responses: {
    "200": {
      description: "Successful response with file list",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: {
                  type: "string",
                  example: "example.txt",
                },
              },
            },
          },
        },
      },
    },
  },
});

// Delete a file
router.delete("/files/:filename", delete_file);
registerApiDoc({
  operationId: "deleteFile",
  tags: ["File Management"],
  summary: "Delete a file",
  description: "Deletes a specified file from the server's file system.",
  method: "DELETE",
  path: "/api/http/files/:filename",
  parameters: [
    {
      name: "filename",
      in: "path",
      description: "Name of the file to delete",
      required: true,
      schema: {
        type: "string",
      },
    },
  ],
  responses: {
    "200": {
      description: "File deleted successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "File deleted successfully",
              },
            },
          },
        },
      },
    },
    "404": {
      description: "File not found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "File not found",
              },
            },
          },
        },
      },
    },
  },
});

// 上传文件（复用之前的 Multer 配置）
router.post("/files", upload, upload_file);
registerApiDoc({
  operationId: "uploadFile",
  tags: ["File Management"],
  summary: "Upload a file",
  description: "Uploads a file to the server's file system.",
  method: "POST",
  path: "/api/http/files",
  parameters: [],
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "File to upload",
            },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "File uploaded successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "File uploaded successfully",
              },
              filename: {
                type: "string",
                example: "uploaded_file.txt",
              },
            },
          },
        },
      },
    },
    "400": {
      description: "Bad request, file not provided or invalid format",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "No file uploaded or invalid file format",
              },
            },
          },
        },
      },
    },
  },
});

// GET request examples
router.get("/", get_default);
registerApiDoc({
  operationId: "getDefault",
  tags: ["Root"],
  summary: "Get default response",
  description: "Returns the default API response.",
  method: "GET",
  path: "/api/http",
  parameters: [],
  responses: {
    "200": {
      description: "Successful response",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Welcome to the API",
              },
            },
          },
        },
      },
    },
  },
});

// Get query parameters
router.get("/query", get_query);
registerApiDoc({
  operationId: "getQuery",
  tags: ["Query"],
  summary: "Get query parameters",
  description: "Returns the query parameters sent in the request.",
  method: "GET",
  path: "/http/query",
  parameters: [
    {
      name: "name",
      in: "query",
      description: "Name of the user",
      required: true,
      schema: {
        type: "string",
      },
    },
    {
      name: "age",
      in: "query",
      description: "Age of the user",
      required: false,
      schema: {
        type: "integer",
      },
    },
  ],
  responses: {
    "200": {
      description: "Successful response",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "John Doe",
              },
              age: {
                type: "integer",
                example: 30,
              },
            },
          },
        },
      },
    },
  },
});

// Get params by ID
router.get("/params/:id", get_params);
registerApiDoc({
  operationId: "getParams",
  tags: ["Params"],
  summary: "Get params by ID",
  description: "Returns the params sent in the request path.",
  method: "GET",
  path: "/api/http/params/{id}",
  parameters: [
    {
      name: "id",
      in: "path",
      description: "ID parameter",
      required: true,
      schema: {
        type: "string",
      },
    },
  ],
  responses: {
    "200": {
      description: "Successful response",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "123",
              },
            },
          },
        },
      },
    },
  },
});

// Get 1k payload
router.get("/get_1k", get_1k);
registerApiDoc({
  operationId: "get1k",
  tags: ["Payload"],
  summary: "Get 1k payload",
  description: "Returns a 1kB payload.",
  method: "GET",
  path: "/api/http/get_1k",
  parameters: [],
  responses: {
    "200": {
      description: "1kB payload",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "Too many characters to display",
                // This is just an example, actual data will be 4MB of 'a's
              },
            },
          },
        },
      },
    },
  },
});

// Get 2k payload
router.get("/get_2k", get_2k);
registerApiDoc({
  operationId: "get2k",
  tags: ["Payload"],
  summary: "Get 2k payload",
  description: "Returns a 2kB payload.",
  method: "GET",
  path: "/api/http/get_2k",
  parameters: [],
  responses: {
    "200": {
      description: "2kB payload",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "Too many characters to display",
                // This is just an example, actual data will be 4MB of 'a's
              },
            },
          },
        },
      },
    },
  },
});

// Get 4k payload
router.get("/get_4k", get_4k);
registerApiDoc({
  operationId: "get4k",
  tags: ["Payload"],
  summary: "Get 4k payload",
  description: "Returns a 4kB payload.",
  method: "GET",
  path: "/api/http/get_4k",
  parameters: [],
  responses: {
    "200": {
      description: "4kB payload",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "Too many characters to display",
                // This is just an example, actual data will be 4MB of 'a's
              },
            },
          },
        },
      },
    },
  },
});

// Get 8k payload
router.get("/get_8k", get_8k);
registerApiDoc({
  operationId: "get8k",
  tags: ["Payload"],
  summary: "Get 8k payload",
  description: "Returns a 8kB payload.",
  method: "GET",
  path: "/api/http/get_8k",
  parameters: [],
  responses: {
    "200": {
      description: "8kB payload",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "Too many characters to display",
                // This is just an example, actual data will be 4MB of 'a's
              },
            },
          },
        },
      },
    },
  },
});

// Get 1MB payload
router.get("/get_1m", get_1m);
registerApiDoc({
  operationId: "get1m",
  tags: ["Payload"],
  summary: "Get 1MB payload",
  description: "Returns a 1MB payload.",
  method: "GET",
  path: "/api/http/get_1m",
  parameters: [],
  responses: {
    "200": {
      description: "1MB payload",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "Too many characters to display",
                // This is just an example, actual data will be 4MB of 'a's
              },
            },
          },
        },
      },
    },
  },
});

// Get 2MB payload
router.get("/get_2m", get_2m);
registerApiDoc({
  operationId: "get2m",
  tags: ["Payload"],
  summary: "Get 2MB payload",
  description: "Returns a 2MB payload.",
  method: "GET",
  path: "/api/http/get_2m",
  parameters: [],
  responses: {
    "200": {
      description: "2MB payload",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "Too many characters to display",
                // This is just an example, actual data will be 4MB of 'a's
              },
            },
          },
        },
      },
    },
  },
});

// Get 4MB payload
router.get("/get_4m", get_4m);
registerApiDoc({
  operationId: "get4m",
  tags: ["Payload"],
  summary: "Get 4MB payload",
  description: "Returns a 4MB payload.",
  method: "GET",
  path: "/api/http/get_4m",
  parameters: [],
  responses: {
    "200": {
      description: "4MB payload",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "Too many characters to display",
                // This is just an example, actual data will be 4MB of 'a's
              },
            },
          },
        },
      },
    },
  },
});

// Get 8MB payload
router.get("/get_8m", get_8m);
registerApiDoc({
  operationId: "get8m",
  tags: ["Payload"],
  summary: "Get 8MB payload",
  description: "Returns a 8MB payload.",
  method: "GET",
  path: "/api/http/get_8m",
  parameters: [],
  responses: {
    "200": {
      description: "8MB payload",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "Too many characters to display",
                // This is just an example, actual data will be 4MB of 'a's
              },
            },
          },
        },
      },
    },
  },
});

// POST request examples

// Create a new resource
router.post("/create", post_create);
/**
 * @description Create a new resource.
 */
registerApiDoc({
  operationId: "postCreate",
  tags: ["Resource"],
  summary: "Create a new resource",
  description: "Creates a new resource with the provided data.",
  method: "POST",
  path: "/api/http/create",
  parameters: [],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          description: "Resource data",
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Resource created successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "POST request successful" },
              data: { type: "object" },
            },
          },
        },
      },
    },
  },
});

// Create a dictionary resource
router.post("/dict", post_dict);
/**
 * @description Create a dictionary resource and store it as a JSON file.
 */
registerApiDoc({
  operationId: "postDict",
  tags: ["Resource"],
  summary: "Create a dictionary resource",
  description: "Creates a dictionary resource and stores it as a JSON file.",
  method: "POST",
  path: "/api/http/dict",
  parameters: [],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          description: "Dictionary data",
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Dictionary resource created and stored successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "POST request with dictionary - data stored successfully" },
              data: { type: "object" },
            },
          },
        },
      },
    },
  },
});

// Upload a file via POST
router.post("/post_file", upload, post_file);
/**
 * @description Upload a file using multipart/form-data.
 */
registerApiDoc({
  operationId: "postFile",
  tags: ["File Management"],
  summary: "Upload a file (POST)",
  description: "Uploads a file using multipart/form-data.",
  method: "POST",
  path: "/api/http/post_file",
  parameters: [],
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "File to upload",
            },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "File uploaded successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              file: {
                type: "object",
                properties: {
                  originalname: { type: "string", example: "example.txt" },
                  path: { type: "string", example: "/temps/example.txt" },
                  size: { type: "number", example: 1234 },
                },
              },
            },
          },
        },
      },
    },
    "400": {
      description: "No file uploaded",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string", example: "No file uploaded" },
            },
          },
        },
      },
    },
  },
});

// Update a resource by ID (PUT)
router.put("/update/:id", put_update);
/**
 * @description Update a resource by ID.
 */
registerApiDoc({
  operationId: "putUpdate",
  tags: ["Resource"],
  summary: "Update a resource",
  description: "Updates a resource by its ID.",
  method: "PUT",
  path: "/api/http/update/{id}",
  parameters: [
    {
      name: "id",
      in: "path",
      description: "Resource ID",
      required: true,
      schema: { type: "string" },
    },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          description: "Update data",
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Resource updated successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "PUT request successful" },
              id: { type: "string", example: "123" },
              updates: { type: "object" },
            },
          },
        },
      },
    },
  },
});

// Partially update a resource by ID (PATCH)
router.patch("/partial-update/:id", patch_partial_update);
/**
 * @description Partially update a resource by ID.
 */
registerApiDoc({
  operationId: "patchPartialUpdate",
  tags: ["Resource"],
  summary: "Partially update a resource",
  description: "Partially updates a resource by its ID.",
  method: "PATCH",
  path: "/api/http/partial-update/{id}",
  parameters: [
    {
      name: "id",
      in: "path",
      description: "Resource ID",
      required: true,
      schema: { type: "string" },
    },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          description: "Partial update data",
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Resource partially updated successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "PATCH request successful" },
              id: { type: "string", example: "123" },
              updates: { type: "object" },
            },
          },
        },
      },
    },
  },
});

// Delete a resource by ID
router.delete("/delete/:id", delete_remove);
/**
 * @description Delete a resource by ID.
 */
registerApiDoc({
  operationId: "deleteRemove",
  tags: ["Resource"],
  summary: "Delete a resource",
  description: "Deletes a resource by its ID.",
  method: "DELETE",
  path: "/api/http/delete/{id}",
  parameters: [
    {
      name: "id",
      in: "path",
      description: "Resource ID",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    "200": {
      description: "Resource deleted successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "DELETE request successful" },
              id: { type: "string", example: "123" },
            },
          },
        },
      },
    },
  },
});

// HEAD request example
router.head("/head", head_request);
/**
 * @description Test HEAD request.
 */
registerApiDoc({
  operationId: "headRequest",
  tags: ["Test"],
  summary: "HEAD request example",
  description: "Returns a response to a HEAD request.",
  method: "HEAD",
  path: "/api/http/head",
  parameters: [],
  responses: {
    "200": {
      description: "HEAD request successful",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "HEAD request successful" },
            },
          },
        },
      },
    },
  },
});

// OPTIONS request example
router.options("/options", options_request);
/**
 * @description Test OPTIONS request.
 */
registerApiDoc({
  operationId: "optionsRequest",
  tags: ["Test"],
  summary: "OPTIONS request example",
  description: "Returns a response to an OPTIONS request.",
  method: "OPTIONS",
  path: "/api/http/options",
  parameters: [],
  responses: {
    "200": {
      description: "OPTIONS request successful",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "OPTIONS request successful" },
            },
          },
        },
      },
    },
  },
});

// Error handling middleware
router.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

export default router;
