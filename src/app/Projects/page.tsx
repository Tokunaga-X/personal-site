import { useContext } from "react";
import { LanguageContext } from "../store/LanguageContext";

type Project = {
  title: string;
  titleZh: string;
  img: string;
  des: string;
  desZh: string;
  skills: [string, string];
  codeLink: string;
};

const PROJECTS: Project[] = [
  {
    title: "Moving-Picture",
    titleZh: "Moving-Picture",
    img: "/moving-picture.png",
    des: "A movie review website featuring beautiful page design, comprehensive movie information, my movie ratings, and personal reviews after watching.",
    desZh: "一个影评网站，提供精美的页面设计，全面的电影信息、我看过电影的打分情况以及个人的观后感。",
    skills: ["React", "Express"],
    codeLink: "https://github.com/Tokunaga-X/Moving-Picture",
  },
  {
    title: "Just-Luxury",
    titleZh: "Just-Luxury",
    img: "/just-luxury.png",
    des: "Luxury house website that showcases amazing real estate properties. Great design and code using the Vue tech stack. Built this to learn the Vue framework and improve my front-end skills.",
    desZh: "展示精美房地产的豪宅网站。使用 Vue 技术栈进行设计和开发。通过这个项目学习 Vue 框架并提升前端技能。",
    skills: ["Vue", "Sass"],
    codeLink: "https://github.com/Tokunaga-X/Just-Luxury",
  },
  {
    title: "My Blog",
    titleZh: "我的博客",
    img: "/blog-site.png",
    des: "My blog website contains learning notes and some random thoughts. In the future, I may add some movie or book reviews since I am a movie lover.",
    desZh: "我的博客网站包含学习笔记和一些随想。作为一个电影爱好者，未来可能会添加一些电影或书籍评论。",
    skills: ["Github-pages", "Jekyll"],
    codeLink: "",
  },
  {
    title: "SpeedSearch",
    titleZh: "SpeedSearch",
    img: "/speed-search.png",
    des: "This is a Chrome extension that has been designed with the aim of providing a fast and efficient way to search for information on a range of different websites.",
    desZh: "这是一个 Chrome 扩展程序，旨在提供一种快速高效的方式来搜索各种网站上的信息。",
    skills: ["ChromeExtension", "TimeSaver"],
    codeLink: "https://github.com/Tokunaga-X/speedSearch",
  },
];

export default function Projects() {
  const { language, t } = useContext(LanguageContext);

  return (
    <section className="flow" id="projects" aria-labelledby="projects-title">
      <div className="split section-head" data-reveal>
        <p className="kicker">{t("projectsKicker")}</p>
        <div>
          <h2 className="section-title" id="projects-title">
            {t("projectsTitle")}
          </h2>
          <p className="section-lead">{t("projectsLead")}</p>
        </div>
      </div>
      <div className="split">
        <div aria-hidden="true" />
        <ol className="ledger">
          {PROJECTS.map((project, index) => {
            const title = language === "zh" ? project.titleZh : project.title;
            const description = language === "zh" ? project.desZh : project.des;
            const label = `${title} ${t("shotLabel")}`;
            return (
              <li key={project.title}>
                <div className="ledger-title">
                  <span className="num">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{title}</h3>
                    <p className="ledger-copy">{description}</p>
                    <p className="skill-line">
                      {project.skills[0]} · {project.skills[1]}
                    </p>
                    {project.codeLink ? (
                      <a
                        className="text-link"
                        href={project.codeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("viewRepo")}
                      </a>
                    ) : null}
                    {project.codeLink ? (
                      <a
                        className="shot"
                        href={project.codeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                      >
                        <img src={project.img} alt="" />
                      </a>
                    ) : (
                      <div className="shot">
                        <img src={project.img} alt={label} />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
