import ChatWidget from "@/components/ChatWidget";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>Next.js Image Component</h1>
      <Image
        src="/images/nextjs.png"
        alt="Next.js Logo"
        width={500}
        height={500}
      />
      <ChatWidget />
    </div>
  );
}
