import Aboutsec from "./components/Aboutsec";
import HeroSec from "./components/HeroSec";
import Servicesec from "./components/Servicesec";
import Latestcomments from "./Latestcomments/page";
import Latestreciters from "./Latestreciters/page";
import Topreciters from "./Topreciters/page";
import NewComment from "./Newcomment/page";

export default function Home() {
  return (
    <div className="overflow-x-hidden flex flex-col  ">
      <HeroSec />
      <Aboutsec />
      <Servicesec />
      <Topreciters />
      <Latestreciters />
      <Latestcomments />
      <NewComment />
    </div>
  );
}
