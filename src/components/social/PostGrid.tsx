import React from "react";
import { Instagram, Facebook, MoreVertical, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { Post } from "../../types/social";

interface PostGridProps {
  posts: Post[];
}

export const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="aspect-square relative">
            {post.mediaUrls[0] && (
              <img
                src={post.mediaUrls[0]}
                alt=""
                className="w-full h-full object-cover rounded-t-lg"
              />
            )}

            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 hover:bg-white"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute bottom-2 left-2 flex gap-1">
              {post.platforms.includes("instagram") && (
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
              )}
              {post.platforms.includes("facebook") && (
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <Facebook className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-900 mb-2">{post.content}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                #1
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(post.scheduledFor), "MMM d, h:mm a")}
              </div>
              <span
                className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${
                  post.status === "published"
                    ? "bg-green-100 text-green-800"
                    : post.status === "scheduled"
                    ? "bg-blue-100 text-blue-800"
                    : post.status === "draft"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }
              `}
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
