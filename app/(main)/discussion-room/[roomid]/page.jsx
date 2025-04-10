"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  AIModel,
  ConvertTextToSpeech,
  getToken,
} from "@/services/GlobalServices";
import { CoachingExpert } from "@/services/Options";
import { UserButton, useUser } from "@stackframe/stack";
import { RealtimeTranscriber } from "assemblyai";
import { useMutation, useQuery } from "convex/react";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import RecordRTC from "recordrtc";
import ChatBox from "./_components/ChatBox";
import { toast } from "sonner";
import { UserContext } from "@/app/_context/UserContext";
// import dynamic from "next/dynamic";
// const RecordRTC = dynamic(() => import("recordrtc"), { ssr: false });

const DiscussionRoom = () => {
  const user = useUser();
  const { roomid } = useParams();
  const { userData, setUserData } = useContext(UserContext);
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });
  const [expert, setExpert] = useState();
  const [enableMic, setEnableMic] = useState(false);
  const recorder = useRef(null);
  const realtimeTranscriber = useRef(null);
  const [transcribe, setTranscribe] = useState();
  const [conversation, setConversation] = useState([]);
  const [audioUrl, setAudioUrl] = useState();
  const [loading, setLoading] = useState(false);
  const [enableFeedbackNotes, setEnableFeedbackNotes] = useState(false);
  const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const UpdateUserToken = useMutation(api.users.UpdateUserToken);

  let silenceTimeout;
  let texts = {};

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(
        (item) => item.name === DiscussionRoomData?.expertName
      );
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const connectToServer = async () => {
    setLoading(true);

    // Init Assembly AI
    realtimeTranscriber.current = new RealtimeTranscriber({
      token: await getToken(),
      sampleRate: 16_000,
    });

    realtimeTranscriber.current.on("transcript", async (transcript) => {
      // console.log("transcript", transcript);
      let msg = "";

      if (transcript.message_type === "FinalTranscript") {
        setConversation((prev) => [
          ...prev,
          {
            role: "user",
            content: transcript?.text,
          },
        ]);

        // Update User Generate Token
        await updateUserTokenMethod(transcript?.text);
      }

      texts[transcript.audio_start] = transcript?.text;
      const keys = Object.keys(texts);
      keys.sort((a, b) => a - b);

      for (const key of keys) {
        if (texts[key]) {
          msg += `${texts[key]} `;
        }

        setTranscribe(msg);
      }
    });

    await realtimeTranscriber.current.connect();
    setLoading(false);
    setEnableMic(true);
    toast("Connected...");

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          recorder.current = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm",
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 250,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: async (blob) => {
              if (!realtimeTranscriber.current) return;
              // Reset the silence detection timer on audio input
              clearTimeout(silenceTimeout);

              const buffer = await blob.arrayBuffer();
              // console.log("buffer", buffer);
              realtimeTranscriber.current.sendAudio(buffer);

              //console.log(buffer)

              // Restart the silence detection timer
              silenceTimeout = setTimeout(() => {
                console.log("User stopped talking");
                // Handle user stopped talking (e.g., send final transcript, stop recording, etc.)
              }, 2000);
            },
          });
          recorder.current.startRecording();
        })
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (conversation[conversation.length - 1]?.role === "user") {
        // Calling AI text Model to Get Response
        const lastTwoMsg = conversation.slice(-2);

        const aiRes = await AIModel(
          DiscussionRoomData?.topic,
          DiscussionRoomData?.coachingOption,
          lastTwoMsg
        );

        const url = await ConvertTextToSpeech(
          aiRes?.content,
          DiscussionRoomData?.expertName
        );
        console.log("url", url);
        setAudioUrl(url);

        // console.log("aiRes", aiRes);
        setConversation((prev) => [...prev, aiRes]);
        // Update AI Generate Token
        await updateUserTokenMethod(aiRes?.content);
      }
    }

    fetchData();
  }, [conversation]);

  const disconnect = async (e) => {
    e.preventDefault();
    setLoading(true);

    await realtimeTranscriber.current.close();
    recorder.current.pauseRecording();
    recorder.current = null;
    setEnableMic(false);
    toast("Disconnected...");

    await UpdateConversation({
      id: DiscussionRoomData?._id,
      conversation: conversation,
    });

    setLoading(false);
    setEnableFeedbackNotes(true);
  };

  const updateUserTokenMethod = async (text) => {
    const tokenCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const result = await UpdateUserToken({
      id: userData?._id,
      credits: Number(userData?.credits) - Number(tokenCount),
    });

    setUserData((prev) => ({
      ...prev,
      credits: Number(userData?.credits) - Number(tokenCount),
    }));
  };

  return (
    <div className="-mt-12">
      <h2 className="text-lg font-bold">
        {DiscussionRoomData?.coachingOption}
      </h2>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            {expert && expert.avatar && (
              <Image
                src={expert.avatar}
                alt={expert.name}
                width={200}
                height={200}
                className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
              />
            )}
            <h2 className="text-gray-500">{expert?.name}</h2>

            <audio src={audioUrl} type="audio/mp3" autoPlay />

            <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <Image
                src={user?.profileImageUrl}
                alt="Profile Picture"
                width={60}
                height={60}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center">
            {!enableMic ? (
              <Button onClick={connectToServer} disabled={loading}>
                {loading && <LoaderCircle className="animate-spin" />} Connect
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={disconnect}
                disabled={loading}>
                {loading && <LoaderCircle className="animate-spin" />}{" "}
                Disconnect
              </Button>
            )}
          </div>
        </div>

        <div>
          <ChatBox
            conversation={conversation}
            enableFeedbackNotes={enableFeedbackNotes}
            coachingOption={DiscussionRoomData?.coachingOption}
          />
        </div>
      </div>

      <div>
        <h2>{transcribe}</h2>
      </div>
    </div>
  );
};

export default DiscussionRoom;
