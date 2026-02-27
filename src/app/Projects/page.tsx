import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faClapperboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { translations } from "../constants/translations";
import { LanguageContext } from "../store/LanguageContext";

type CardData = {
  title: string;
  img: string;
  des: string;
  skills: string[];
  codeLink: string;
};

const getCardData = (language: "en" | "zh"): CardData[] => {
  const cards = {
    en: [
      {
        title: "Moving-Picture",
        img: "/moving-picture.png",
        des: "A movie review website featuring beautiful page design, comprehensive movie information, my movie ratings, and personal reviews after watching.",
        skills: ["React", "Express"],
        codeLink: "https://github.com/Tokunaga-X/Moving-Picture",
      },
      {
        title: "Just-Luxury",
        img: "/just-luxury.png",
        des: "Luxury house website that showcases amazing real estate properties. Great design and code using the Vue tech stack. Built this to learn the Vue framework and improve my front-end skills.",
        skills: ["Vue", "Sass"],
        codeLink: "https://github.com/Tokunaga-X/Just-Luxury",
      },
      {
        title: "My Blog",
        img: "/blog-site.png",
        des: "My blog website contains learning notes and some random thoughts. In the future, I may add some movie or book reviews since I am a movie lover.",
        skills: ["Github-pages", "Jekyll"],
        codeLink: "",
      },
      {
        title: "SpeedSearch",
        img: "/speed-search.png",
        des: "This is a Chrome extension that has been designed with the aim of providing a fast and efficient way to search for information on a range of different websites.",
        skills: ["ChromeExtension", "TimeSaver"],
        codeLink: "https://github.com/Tokunaga-X/speedSearch",
      },
    ],
    zh: [
      {
        title: "Moving-Picture",
        img: "/moving-picture.png",
        des: "一个影评网站，提供精美的页面设计，全面的电影信息、我看过电影的打分情况以及个人的观后感。",
        skills: ["React", "Express"],
        codeLink: "https://github.com/Tokunaga-X/Moving-Picture",
      },
      {
        title: "Just-Luxury",
        img: "/just-luxury.png",
        des: "展示精美房地产的豪宅网站。使用Vue技术栈进行设计和开发。通过这个项目学习Vue框架并提升前端技能。",
        skills: ["Vue", "Sass"],
        codeLink: "https://github.com/Tokunaga-X/Just-Luxury",
      },
      {
        title: "我的博客",
        img: "/blog-site.png",
        des: "我的博客网站包含学习笔记和一些随想。作为一个电影爱好者，未来可能会添加一些电影或书籍评论。",
        skills: ["Github-pages", "Jekyll"],
        codeLink: "",
      },
      {
        title: "SpeedSearch",
        img: "/speed-search.png",
        des: "这是一个Chrome扩展程序，旨在提供一种快速高效的方式来搜索各种网站上的信息。",
        skills: ["ChromeExtension", "TimeSaver"],
        codeLink: "https://github.com/Tokunaga-X/speedSearch",
      },
    ],
  };
  return cards[language];
};

export default function Projects() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const cardArray = getCardData(language);

  const getCard = (
    title: string,
    coverImg: string,
    description: string,
    skillArray: string[],
    codeLink: string,
    demoLink = "/"
  ) => {
    return (
      <>
        <div className="w-[53rem] rounded-[1.7rem] shadow-[0_0_15px_rgba(0,0,0,.3)] lg:shadow-[0_0_25px_rgba(0,0,0,.6)] overflow-hidden flex items-center justify-center">
          <a
            href={codeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-full w-2/3"
          >
            <img
              src={coverImg}
              alt={title}
              className="lg:w-full translate-y-0 transition-transform duration-[10s] hover:translate-y-[-52%] border-y-4"
            />
          </a>
        </div>
        <div className="w-[30rem] mx-auto flex flex-col justify-center items-center text-center text-[1.7rem] font-medium">
          <h3 className="text-[1.7rem] mb-8 font-bold uppercase">
            {title}
            <FontAwesomeIcon
              icon={faClapperboard}
              className="text-3xl"
              style={{ marginLeft: "5px", color: "green" }}
            />
          </h3>
          <p className="text-center mb-4 text-[#767676] dark:text-white">
            {description}
          </p>
          <div className="flex gap-4 mt-4">
            <p className="text-center shadow-[0_0_10px_rgba(0,0,0,.1)] text-[1.7rem] font-semibold py-4 px-[1.3rem] bg-slate-200 dark:bg-slate-600">
              {skillArray[0]}
            </p>
            <p className="text-center shadow-[0_0_10px_rgba(0,0,0,.1)] text-[1.7rem] font-semibold py-4 px-[1.3rem] bg-slate-200 dark:bg-slate-600">
              {skillArray[1]}
            </p>
          </div>
          <div className="w-full mt-12 flex justify-evenly gap-4">
            <div className="flex items-center hover:text-font-blue transition-all duration-500 hover:cursor-pointer gap-[5px]">
              <p className="text-[1.7rem] font-medium">{t.code}</p>
              <a href={codeLink} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGithub} className="text-5xl" />
              </a>
            </div>
            <div className="flex items-center hover:text-font-blue transition-all duration-500 hover:cursor-not-allowed gap-[5px]">
              <p className="text-[1.7rem] font-medium">{t.liveDemo}</p>
              <a className="hover:cursor-not-allowed" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGithub} className="text-5xl" />
              </a>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <section className="bg-grey-bg" id="projects">
      <div className="max-w-[107rem] mx-auto mb-24">
        <p className="section-title">{t.projectsTitle}</p>
        <h3 className="section-header">{t.projectsSubtitle}</h3>
      </div>
      <ul className="flex flex-col items-center gap-20 max-w-[107rem] mx-auto">
        <li className="project-card-left">
          {getCard(
            cardArray[0].title,
            cardArray[0].img,
            cardArray[0].des,
            cardArray[0].skills,
            cardArray[0].codeLink
          )}
        </li>
        <li className="project-card-right">
          {getCard(
            cardArray[1].title,
            cardArray[1].img,
            cardArray[1].des,
            cardArray[1].skills,
            cardArray[1].codeLink
          )}
        </li>
        <li className="project-card-left">
          {getCard(
            cardArray[2].title,
            cardArray[2].img,
            cardArray[2].des,
            cardArray[2].skills,
            cardArray[2].codeLink
          )}
        </li>
        <li className="project-card-right">
          {getCard(
            cardArray[3].title,
            cardArray[3].img,
            cardArray[3].des,
            cardArray[3].skills,
            cardArray[3].codeLink
          )}
        </li>
      </ul>
    </section>
  );
}
