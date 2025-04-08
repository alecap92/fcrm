import React from "react";
import { format } from "date-fns";
import {
  Heart,
  MessageCircle,
  Send,
  User,
  Globe,
  MoreVertical,
  ImageIcon,
  ThumbsUp,
  Share2,
} from "lucide-react";
import { PostFormData } from "../../types/social";

interface PostPreviewProps {
  form: PostFormData;
  mediaPreview: string | null;
  previewPlatform: "instagram" | "facebook";
  setPreviewPlatform: (platform: "instagram" | "facebook") => void;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  form,
  mediaPreview,
  previewPlatform,
  setPreviewPlatform,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Vista previa
        </label>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            className={`px-3 py-1 text-xs rounded-md ${
              previewPlatform === "instagram"
                ? "bg-white shadow-sm"
                : "text-gray-600"
            }`}
            onClick={() => setPreviewPlatform("instagram")}
          >
            Instagram
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${
              previewPlatform === "facebook"
                ? "bg-white shadow-sm"
                : "text-gray-600"
            }`}
            onClick={() => setPreviewPlatform("facebook")}
          >
            Facebook
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {previewPlatform === "instagram" ? (
          <InstagramPreview form={form} mediaPreview={mediaPreview} />
        ) : (
          <FacebookPreview form={form} mediaPreview={mediaPreview} />
        )}
      </div>
    </div>
  );
};

interface PreviewBaseProps {
  form: PostFormData;
  mediaPreview: string | null;
}

const InstagramPreview: React.FC<PreviewBaseProps> = ({
  form,
  mediaPreview,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="p-3 flex items-center border-b">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold">Your Business</p>
          <p className="text-xs text-gray-500">New York, NY</p>
        </div>
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </div>

      {/* Media */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {mediaPreview ? (
          <img
            src={mediaPreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No media selected</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex gap-4">
            <Heart className="w-6 h-6" />
            <MessageCircle className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="w-6 h-6 border-2 border-black"></div>
          </div>
        </div>

        {/* Likes */}
        <p className="text-sm font-semibold mb-1">123 likes</p>

        {/* Caption */}
        <div className="text-sm mb-1">
          <span className="font-semibold mr-1">Your Business</span>
          <span>{form.content || "Your caption will appear here"}</span>
        </div>

        {/* Comments */}
        <p className="text-xs text-gray-500 mb-1">View all 24 comments</p>
        <p className="text-xs text-gray-400">2 HOURS AGO</p>
      </div>
    </div>
  );
};

const FacebookPreview: React.FC<PreviewBaseProps> = ({
  form,
  mediaPreview,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="p-3 flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold">Your Business</p>
          <div className="flex items-center text-xs text-gray-500">
            <span>{format(new Date(), "MMM d 'at' h:mm a")}</span>
            <span className="mx-1">•</span>
            <Globe className="w-3 h-3" />
          </div>
        </div>
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm mb-3">
          {form.content || "Your post content will appear here"}
        </p>
      </div>

      {/* Media */}
      {mediaPreview ? (
        <div className="border-t border-b border-gray-200">
          <img src={mediaPreview} alt="Preview" className="w-full h-auto" />
        </div>
      ) : (
        <div className="border-t border-b border-gray-200 bg-gray-100 p-12 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No media selected</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-3">
        {/* Likes and comments count */}
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mr-1">
              <ThumbsUp className="w-2 h-2 text-white" />
            </div>
            <span>42</span>
          </div>
          <div>
            <span>12 comments • 5 shares</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex border-t border-gray-200 pt-2">
          <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-100 rounded-md">
            <ThumbsUp className="w-5 h-5 mr-2" />
            <span className="text-sm">Like</span>
          </button>
          <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-100 rounded-md">
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">Comment</span>
          </button>
          <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-100 rounded-md">
            <Share2 className="w-5 h-5 mr-2" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
