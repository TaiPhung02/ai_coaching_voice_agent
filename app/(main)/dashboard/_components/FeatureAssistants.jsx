"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import { CoachingOptions } from "@/services/Options";
import { useUser } from "@stackframe/stack";
import Image from "next/image";
import React from "react";
import UserInputDialog from "./UserInputDialog";

const FeatureAssistants = () => {
  const user = useUser();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium text-gray-500">My Workspace</h2>
          <h2 className="text-3xl font-bold">
            Welcome back, {user?.displayName}
          </h2>
        </div>

        <Button>Profile</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-10 mt-10">
        {CoachingOptions.map((option, index) => (
          <BlurFade key={option.icon} delay={0.25 + index * 0.05} inView>
            <div
              key={index}
              className="p-3 bg-secondary rounded-3xl flex flex-col justify-center items-center">
              <UserInputDialog coachingOption={option}>
                <div
                  key={index}
                  className="flex flex-col items-center justify-center">
                  <Image
                    src={option?.icon}
                    alt={option?.name}
                    width={150}
                    height={150}
                    className="h-[70px] w-[70px] hover:rotate-12 cursor-pointer transition-all duration-300"
                  />
                  <h2 className="mt-2">{option?.name}</h2>
                </div>
              </UserInputDialog>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  );
};

export default FeatureAssistants;
