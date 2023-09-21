"use client";
import ChatWidgetWrapperSDK from "@/components/ChatWidgetWrapperSDK";

export default function Home() {
  console.log("Page component");
  return (
    <div>
      <h1>Next.js Image Component</h1>
      <ChatWidgetWrapperSDK
        clientId="cb29ee529b302062032f83fa653c33e0"
        licenseId="16142280"
      />
    </div>
  );
}
