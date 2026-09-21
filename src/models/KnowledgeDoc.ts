import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * ============================================================================
 * MONGODB ATLAS VECTOR SEARCH INDEX CONFIGURATION: "vector_index"
 * ============================================================================
 * In the MongoDB Atlas Web Console:
 * 1. Navigate to: Database -> Atlas Search / Vector Search -> "Create Search Index"
 * 2. Select: "JSON Editor" under Atlas Vector Search
 * 3. Choose database: <YOUR_DATABASE_NAME> and collection: "knowledgedocs"
 * 4. Set Index Name to: "vector_index"
 * 5. Paste the following JSON definition and click "Create Search Index":
 *
 * {
 *   "fields": [
 *     {
 *       "type": "vector",
 *       "path": "embedding",
 *       "numDimensions": 1536,
 *       "similarity": "cosine"
 *     },
 *     {
 *       "type": "filter",
 *       "path": "category"
 *     }
 *   ]
 * }
 * ============================================================================
 */

export interface IKnowledgeDoc extends Document {
  title: string;
  content: string;
  category: string;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeDocSchema = new Schema<IKnowledgeDoc>(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Document content is required"],
    },
    category: {
      type: String,
      required: [true, "Document category is required"],
      trim: true,
      index: true,
    },
    embedding: {
      type: [Number],
      required: [true, "Vector embedding is required"],
      validate: {
        validator: function (v: number[]) {
          return Array.isArray(v) && v.length === 1536;
        },
        message: "Vector embedding must contain exactly 1536 dimensions (text-embedding-3-small).",
      },
    },
  },
  {
    timestamps: true,
    collection: "knowledgedocs",
  }
);

// Prevent model recompilation during Next.js Hot Module Replacement (HMR)
const KnowledgeDoc: Model<IKnowledgeDoc> =
  mongoose.models.KnowledgeDoc ||
  mongoose.model<IKnowledgeDoc>("KnowledgeDoc", KnowledgeDocSchema, "knowledgedocs");

export default KnowledgeDoc;
