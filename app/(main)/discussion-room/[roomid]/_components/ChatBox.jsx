import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { AIModelToGenerateFeedbackAndNotes } from "@/services/GlobalServices";
import { useMutation } from "convex/react";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const ChatBox = ({ conversation, enableFeedbackNotes, coachingOption }) => {
  const [loading, setLoading] = useState(false);
  const updateSummery = useMutation(api.DiscussionRoom.UpdateSummery);
  const { roomid } = useParams();

  const GenerateFeedbackAndNotes = async () => {
    setLoading(true);

    try {
      const result = await AIModelToGenerateFeedbackAndNotes(
        coachingOption,
        conversation
      );

      console.log("result", result);

      await updateSummery({
        id: roomid,
        summery: result?.content,
      });

      toast("Feedback/Notes Saved!.");
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="h-[60vh] bg-secondary border rounded-xl flex flex-col relative p-4 overflow-auto scrollbar-hide">
        {/* <div> */}
        {conversation?.map((item, index) => (
          <div
            className={`flex ${item?.role === "user" && "justify-end"}`}
            key={index}>
            {item?.role === "assistant" ? (
              <h2 className="p-1 px-2 mt-2 bg-primary text-white inline-block rounded-md">
                {item?.content}
              </h2>
            ) : (
              <h2 className="p-1 px-2 mt-2 bg-gray-200 rounded-md">
                {item?.content}
              </h2>
            )}
          </div>
        ))}
        {/* </div> */}
      </div>

      {!enableFeedbackNotes ? (
        <h2 className="mt-5 text-gray-400 text-sm">
          At the end of your conversation we will automatically feedback/notes
          from your conversation
        </h2>
      ) : (
        <Button
          onClick={GenerateFeedbackAndNotes}
          disabled={loading}
          className="mt-5 w-full">
          {loading && <LoaderCircle className="animate-spin" />} Generate
          Feedback/Notes
        </Button>
      )}
    </div>
  );
};

export default ChatBox;
