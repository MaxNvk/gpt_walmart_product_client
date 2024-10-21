import DefaultLayout from "@/layouts/Default";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/router";

export default function Home() {
  const router = useRouter()

  const onGoToTheChatClick = () => {
    router.push("/chat")
  }

  return (
    <DefaultLayout>
      <div className="flex gap-4 justify-center">
        <Button onClick={onGoToTheChatClick}>Go to the chat</Button>
      </div>
    </DefaultLayout>
  );
}
