import { BlobServiceClient, BlobSASPermissions } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_CONTAINER_NAME!;

if (!connectionString && !containerName) {
  throw new Error(
    "Azure Storage connection string and container name are required"
  );
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

export const containerClient = blobServiceClient.getContainerClient(containerName);
