import { UserContext } from "@/app/_context/UserContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@stackframe/stack";
import { Wallet2, Crown, Zap } from "lucide-react";
import Image from "next/image";
import React, { useContext } from "react";

const Credits = () => {
  const { userData } = useContext(UserContext);
  const user = useUser();
  const isProUser = !!userData?.subscriptionId;
  const creditLimit = isProUser ? 100000 : 50000;
  const creditUsagePercentage = Math.min(100, Math.round((userData?.credits || 0) / creditLimit * 100));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5">
        <Image
          src={user?.profileImageUrl}
          alt="Profile Picture"
          width={60}
          height={60}
          className="rounded-full"
        />

        <div>
          <h2 className="text-lg font-bold">{user?.displayName}</h2>
          <h2 className="text-gray-500">{user?.primaryEmail}</h2>
        </div>
      </div>

      <hr className="my-3" />

      <div className="space-y-4">
        <h2 className="font-bold text-lg">Token Usage</h2>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {userData?.credits?.toLocaleString() || 0} / {creditLimit.toLocaleString()} tokens
          </span>
          <span className="text-sm font-medium">
            {creditUsagePercentage}%
          </span>
        </div>
        <Progress value={creditUsagePercentage} className="h-2" />

        <div className="flex justify-between items-center py-2">
          <h2 className="font-bold">Current Plan</h2>
          <div className="flex items-center gap-2">
            {isProUser ? (
              <span className="flex items-center gap-1 p-1 bg-primary/10 text-primary rounded-lg px-2 text-sm">
                <Crown className="w-4 h-4" /> Pro Plan
              </span>
            ) : (
              <span className="p-1 bg-secondary rounded-lg px-2 text-sm">
                Free Plan
              </span>
            )}
          </div>
        </div>

        {!isProUser && (
          <div className="mt-5 p-5 border rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" /> Pro Plan
                </h2>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-primary" /> 100,000 Tokens per month
                  </li>
                  <li className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-primary" /> Priority support
                  </li>
                  <li className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-primary" /> Advanced features
                  </li>
                </ul>
              </div>
              <h2 className="font-bold text-xl">$10<span className="text-sm font-normal">/month</span></h2>
            </div>

            <hr className="my-3" />

            <Button className="w-full gap-2" variant="default">
              <Wallet2 className="w-4 h-4" /> Upgrade to Pro
            </Button>
            
            <p className="text-xs text-center mt-2 text-gray-500">
              Cancel anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Credits;