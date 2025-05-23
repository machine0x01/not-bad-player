import NotBadVideoPlayer from "./component/player/not-bad-video-player";

export default function Home() {
  const subtitle = {
    "eng": "/assets/eng-sub.vtt"
  }
  return (
    <div className="bg-white  h-[2000px] flex items-center justify-center">
     <div className="w-1/2 ">
     <NotBadVideoPlayer playOnlyInView source="/assets/video.mp4" subtitleFiles={subtitle} />
     </div>
    </div>
  );
}
