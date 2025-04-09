import React from "react";

const ChatBox = ({ conversation }) => {
  return (
    <div>
      <div className="h-[60vh] bg-secondary border rounded-xl flex flex-col relative p-4 overflow-auto scrollbar-hide">
        {/* <div> */}
          {conversation?.map((item, index) => (
            <div
              className={`flex ${item.role === "user" && "justify-end"}`}
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

      <h2 className="mt-5 text-gray-400 text-sm">
        At the end of your conversation we will automatically feedback/notes
        from your conversation
      </h2>
    </div>
  );
};

export default ChatBox;
