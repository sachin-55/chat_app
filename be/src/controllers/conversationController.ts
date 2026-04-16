import { Conversation, Message } from "@/database/models";
import { BadRequestError, catchAsync, NotFoundError } from "@/utils";
import {
  createConversationSchema,
  getConversationsQuerySchema,
  getMessagesSchema,
} from "@/zodValidation/conversationSchema";
import { Request, Response } from "express";
import mongoose, { PipelineStage } from "mongoose";

export const createNewConversation = catchAsync(
  async (req: Request, res: Response) => {
    const { _id: userId } = req.user || {};
    const { recipientId } = createConversationSchema.parse(req.body);

    if (recipientId?.toString() === userId?.toString()) {
      throw new BadRequestError(
        "You cannot create a conversation with yourself",
      );
    }
    let conversation = await Conversation.findOne({
      participantIds: { $all: [userId, recipientId] },
    });

    if (!conversation && userId) {
      conversation = await Conversation.create({
        participantIds: [userId, recipientId],
      });
    }

    res.handleResponse({
      data: conversation,
    });
  },
);

export const getConversations = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const {
      limit = 10,
      page = 1,
      search,
    } = getConversationsQuerySchema.parse(req.query);

    const skip = (Number(page) - 1) * Number(limit);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          participantIds: { $in: [userId] },
        },
      },

      // join users
      {
        $lookup: {
          from: "users",
          localField: "participantIds",
          foreignField: "_id",
          as: "participants",
        },
      },
    ];

    // 🔍 search on participant name (excluding self optional)
    if (search) {
      pipeline.push({
        $match: {
          "participants.name": {
            $regex: search,
            $options: "i",
          },
        },
      });
    }

    pipeline.push(
      {
        $sort: { updatedAt: -1 },
      },

      {
        $facet: {
          data: [
            {
              $lookup: {
                from: "messages",
                localField: "lastMessageId",
                foreignField: "_id",
                as: "lastMessage",
              },
            },
            {
              $unwind: {
                path: "$lastMessage",
                preserveNullAndEmptyArrays: true,
              },
            },
            { $skip: skip },
            { $limit: Number(limit) },
          ],

          metadata: [{ $count: "total" }],
        },
      },
    );

    const result = await Conversation.aggregate(pipeline);

    const conversations = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;

    return res.handleResponse({
      data: conversations,
      pagination: {
        results: conversations.length,
        totalResults: total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  },
);

export const getConversationDetails = catchAsync(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "participantIds",
        select: "name email avatar",
      })
      .lean();

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    return res.handleResponse({
      data: {
        ...conversation,
        participants: conversation.participantIds,
        participantIds: conversation.participantIds.map((p) => p._id),
      },
    });
  },
);

export const getMessages = catchAsync(async (req: Request, res: Response) => {
  const {
    params: { conversationId },
    query: { cursor, limit = 20 },
  } = getMessagesSchema.parse(req);

  const match: any = {
    conversationId: new mongoose.Types.ObjectId(conversationId),
  };

  if (cursor) {
    match._id = {
      $lt: new mongoose.Types.ObjectId(cursor as string),
    };
  }

  const pipeline: PipelineStage[] = [
    {
      $match: match,
    },

    {
      $sort: { _id: -1 },
    },

    {
      $limit: Number(limit) + 1,
    },

    {
      $lookup: {
        from: "users",
        localField: "senderId",
        foreignField: "_id",
        as: "sender",
      },
    },
    {
      $unwind: "$sender",
    },

    {
      $project: {
        text: 1,
        images: 1,
        files: 1,
        status: 1,
        sentAt: 1,
        sender: {
          _id: 1,
          name: 1,
          email: 1,
          avatar: 1,
        },
      },
    },
  ];

  const messages = await Message.aggregate(pipeline);

  const hasMore = messages.length > limit;

  if (hasMore) {
    messages.pop();
  }

  const nextCursor =
    messages.length > 0 ? messages[messages.length - 1]._id : null;

  return res.handleResponse({
    data: messages.reverse(),
    pagination: {
      nextCursor,
      hasMore,
      limit: Number(limit),
    },
  });
});
