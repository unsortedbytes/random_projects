import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    extractedText: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("History", historySchema);


