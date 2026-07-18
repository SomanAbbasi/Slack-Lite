import { format } from "@/components/date-utils";

interface ChannelHeroProps {
  name: string;
  creationTime: number;
  topic?: string;
}

export const ChannelHero = ({ name, creationTime, topic }: ChannelHeroProps) => {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="text-2xl font-bold flex items-center mb-2"># {name}</p>
      {topic ? (
        <p className="text-sm text-slate-600 mb-2">{topic}</p>
      ) : null}
      <p className="font-normal text-slate-800 mb-4">
        This channel was created on{" "}
        {format(new Date(creationTime), "EEEE, MMMM d")}. This is the very
        beginning of the <strong>#{name}</strong> channel.
      </p>
    </div>
  );
};
